import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Notification {
  id: string;
  type: 'deliverable_approved' | 'deliverable_rejected' | 'deliverable_feedback' | 'task_assigned' | 'payment_received' | 'message' | 'system' | 'info' | 'error' | 'meeting_scheduled' | 'meeting_updated';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  userId: string;
  userRole: 'student' | 'admin';
  data?: any;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  getNotificationsForUser: (userId: string, userRole: 'student' | 'admin') => Notification[];
  initializeSampleNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('gradhelper_notifications');
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    } else {
      // Initialize with sample notifications if none exist
      initializeSampleNotifications();
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('gradhelper_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const initializeSampleNotifications = () => {
    const sampleNotifications: Notification[] = [
      {
        id: 'sample-1',
        type: 'deliverable_approved',
        title: 'Deliverable Approved',
        message: 'Your "Literature Review" for Machine Learning Research Paper has been approved!',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        read: false,
        userId: 'demo-user',
        userRole: 'student',
        data: { deliverableId: 1, taskId: 'task-1' }
      },
      {
        id: 'sample-2',
        type: 'deliverable_feedback',
        title: 'New Feedback Available',
        message: 'You have received feedback on your "ER Diagram" deliverable.',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        read: false,
        userId: 'demo-user',
        userRole: 'student',
        data: { deliverableId: 3, taskId: 'task-2' }
      },
      {
        id: 'sample-3',
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: 'A new Web Development Project has been assigned to you.',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        read: true,
        userId: 'demo-user',
        userRole: 'student',
        data: { taskId: 'task-3' }
      },
      {
        id: 'sample-4',
        type: 'payment_received',
        title: 'Payment Received',
        message: 'Payment of $150 for Database Design Assignment has been received.',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        read: true,
        userId: 'demo-user',
        userRole: 'student',
        data: { amount: 150, taskId: 'task-2' }
      },
      // Admin notifications
      {
        id: 'admin-1',
        type: 'deliverable_feedback',
        title: 'Deliverable Submitted',
        message: 'John Smith has submitted "Methodology Section" for review.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        read: false,
        userId: 'demo-user',
        userRole: 'admin',
        data: { deliverableId: 2, studentId: 'student-1' }
      },
      {
        id: 'admin-2',
        type: 'system',
        title: 'New Student Registration',
        message: 'Sarah Johnson has completed profile setup and is ready for task assignment.',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
        read: false,
        userId: 'demo-user',
        userRole: 'admin',
        data: { studentId: 'student-2' }
      }
    ];

    setNotifications(sampleNotifications);
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const getNotificationsForUser = (userId: string, userRole: 'student' | 'admin') => {
    return notifications.filter(notification => 
      notification.userId === userId && notification.userRole === userRole
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    getNotificationsForUser,
    initializeSampleNotifications,
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