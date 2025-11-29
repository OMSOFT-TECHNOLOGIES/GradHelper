import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { notificationService, NotificationData } from '../services/notificationService';

export interface Notification {
  id: string;
  type: 'deliverable_approved' | 'deliverable_rejected' | 'deliverable_feedback' | 'task_assigned' | 'task_completed' | 'payment_received' | 'payment_pending' | 'message' | 'system' | 'info' | 'error' | 'meeting_scheduled' | 'meeting_updated';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  userId?: string;
  userRole?: 'student' | 'admin';
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  
  // API methods
  fetchNotifications: (params?: { page?: number; is_read?: boolean; notification_type?: string; priority?: string }) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  createNotification: (data: any) => Promise<void>;
  checkProfileCompleteness: () => Promise<void>;
  
  // Local methods (backwards compatibility)
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  clearNotifications: () => void;
  getNotificationsForUser: (userId: string, userRole: 'student' | 'admin') => Notification[];
  
  // WebSocket methods
  connectWebSocket: (token?: string) => void;
  disconnectWebSocket: () => void;
  isWebSocketConnected: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);

  // Memoized functions to prevent infinite loops
  const fetchNotifications = useCallback(async (params?: { page?: number; is_read?: boolean; notification_type?: string; priority?: string }) => {
    // Check if user is authenticated before making API calls
    const token = localStorage.getItem('gradhelper_token');
    if (!token) {
      console.log('No authentication token, skipping fetch notifications');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await notificationService.getNotifications(params);
      const convertedNotifications = response.results.map(notification => 
        notificationService.convertToLocalFormat(notification)
      );
      setNotifications(convertedNotifications);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notifications');
      console.error('Failed to fetch notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    // Check if user is authenticated before making API calls
    const token = localStorage.getItem('gradhelper_token');
    if (!token) {
      console.log('No authentication token, skipping fetch unread count');
      return;
    }

    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response.total_unread);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, []);

  const loadInitialData = useCallback(async () => {
    try {
      await Promise.all([
        fetchNotifications(),
        fetchUnreadCount()
      ]);
    } catch (err) {
      console.error('Failed to load initial notification data:', err);
    }
  }, [fetchNotifications, fetchUnreadCount]);

  // Initialize notifications on mount and set up authentication
  useEffect(() => {
    let mounted = true;
    
    const initializeNotifications = async () => {
      // Set up authentication token from localStorage
      const token = localStorage.getItem('gradhelper_token');
      if (token) {
        notificationService.setAuthToken(token);
        console.log('Authentication token found, initializing notifications');
        
        if (mounted) {
          await loadInitialData();
        }
      } else {
        console.log('No authentication token found, skipping notification initialization');
        setIsLoading(false);
      }
    };
    
    initializeNotifications();
    
    return () => {
      mounted = false;
    };
  }, [loadInitialData]);

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(parseInt(notificationId));
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
      
      // Update unread count
      await fetchUnreadCount();
    } catch (err: any) {
      setError(err.message || 'Failed to mark notification as read');
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      setUnreadCount(0);
    } catch (err: any) {
      setError(err.message || 'Failed to mark all notifications as read');
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const createNotification = async (data: any) => {
    try {
      const newNotification = await notificationService.createNotification(data);
      const convertedNotification = notificationService.convertToLocalFormat(newNotification);
      
      setNotifications(prev => [convertedNotification, ...prev]);
      await fetchUnreadCount();
    } catch (err: any) {
      setError(err.message || 'Failed to create notification');
      console.error('Failed to create notification:', err);
    }
  };

  const checkProfileCompleteness = async (): Promise<void> => {
    try {
      const response = await notificationService.checkProfileCompleteness();
      
      if (!response.profile_complete && response.notification_sent) {
        // Refresh notifications to include the new profile completion notification
        await fetchNotifications();
        await fetchUnreadCount();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to check profile completeness');
      console.error('Failed to check profile completeness:', err);
    }
  };

  // WebSocket methods
  const connectWebSocket = useCallback((token?: string) => {
    // Get token from parameter or localStorage
    const authToken = token || localStorage.getItem('gradhelper_token');
    
    console.log('Token sources - Parameter:', token ? 'provided' : 'not provided', 'localStorage:', localStorage.getItem('gradhelper_token') ? 'exists' : 'missing');
    
    if (!authToken || authToken.trim() === '') {
      console.log('No authentication token available for WebSocket connection - skipping WebSocket initialization');
      return;
    }
    
    console.log('Attempting WebSocket connection with token:', authToken.substring(0, 10) + '... (length:', authToken.length, ')');
    
    // Set the auth token for API calls
    notificationService.setAuthToken(authToken);
    
    try {
      notificationService.connectWebSocket(authToken, (notification: NotificationData, newUnreadCount: number) => {
        // Handle real-time notification
        const convertedNotification = notificationService.convertToLocalFormat(notification);
        
        setNotifications(prev => {
          // Check if notification already exists to avoid duplicates
          const exists = prev.some(n => n.id === convertedNotification.id);
          if (exists) return prev;
          
          return [convertedNotification, ...prev];
        });
        
        setUnreadCount(newUnreadCount);
        
        // Show browser notification if permission is granted
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico',
            tag: notification.id.toString()
          });
        }
      });
      
      // Monitor WebSocket connection status
      const checkConnection = () => {
        setIsWebSocketConnected(notificationService.isWebSocketConnected);
      };
      
      // Check immediately and then periodically
      checkConnection();
      const connectionChecker = setInterval(checkConnection, 2000);
      
      // Cleanup interval after 10 seconds
      setTimeout(() => {
        clearInterval(connectionChecker);
      }, 10000);
    } catch (error) {
      console.warn('Failed to establish WebSocket connection:', error);
      setIsWebSocketConnected(false);
    }
  }, []);

  const disconnectWebSocket = useCallback(() => {
    notificationService.disconnectWebSocket();
    setIsWebSocketConnected(false);
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Local methods for backwards compatibility
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      read: false,
      priority: notification.priority || 'medium'
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const getNotificationsForUser = (userId: string, userRole: 'student' | 'admin') => {
    return notifications.filter(notification => 
      notification.userId === userId && notification.userRole === userRole
    );
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    error,
    
    // API methods
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    createNotification,
    checkProfileCompleteness,
    
    // Local methods
    addNotification,
    clearNotifications,
    getNotificationsForUser,
    
    // WebSocket methods
    connectWebSocket,
    disconnectWebSocket,
    isWebSocketConnected: notificationService.isWebSocketConnected
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}