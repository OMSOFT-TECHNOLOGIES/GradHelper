import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCheck, X, MessageCircle, FileCheck, DollarSign, AlertCircle, Settings, ExternalLink, Clock, Star, Filter } from 'lucide-react';
import { useNotifications, Notification } from './NotificationContextAPI';

interface NotificationBellAPIProps {
  userId?: string;
  userRole?: 'student' | 'admin';
  token?: string;
}

export function NotificationBellAPI({ userId, userRole, token }: NotificationBellAPIProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    is_read: undefined as boolean | undefined,
    notification_type: '',
    priority: ''
  });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    error,
    fetchNotifications,
    markAsRead, 
    markAllAsRead,
    connectWebSocket,
    disconnectWebSocket,
    isWebSocketConnected 
  } = useNotifications();

  // Initialize WebSocket connection
  useEffect(() => {
    // Try to connect with provided token or let the service get it from localStorage
    console.log('NotificationBellAPI: Initializing WebSocket with token:', token ? 'provided' : 'not provided');
    
    // If no token provided, try to get from localStorage for debugging
    const fallbackToken = token || localStorage.getItem('gradhelper_token');
    console.log('NotificationBellAPI: Using token source:', token ? 'prop' : 'localStorage', 'token exists:', !!fallbackToken);
    
    connectWebSocket(token);

    return () => {
      disconnectWebSocket();
    };
  }, [token, connectWebSocket, disconnectWebSocket]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowFilters(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Load notifications when component mounts or filters change with debouncing
  useEffect(() => {
    let mounted = true;
    
    const loadNotifications = async () => {
      const params = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {} as any);

      if (mounted) {
        await fetchNotifications(params);
      }
    };

    // Debounce the filter changes to prevent rapid requests
    const timeoutId = setTimeout(() => {
      loadNotifications();
    }, 150);
    
    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [filters, fetchNotifications]);

  const getNotificationIcon = (type: Notification['type'], priority: Notification['priority']) => {
    const iconClass = `w-4 h-4 ${priority === 'urgent' ? 'text-red-600' : priority === 'high' ? 'text-orange-600' : ''}`;
    
    switch (type) {
      case 'deliverable_approved':
        return <FileCheck className={`${iconClass} text-green-600`} />;
      case 'deliverable_rejected':
        return <X className={`${iconClass} text-red-600`} />;
      case 'deliverable_feedback':
        return <MessageCircle className={`${iconClass} text-blue-600`} />;
      case 'task_assigned':
      case 'task_completed':
        return <FileCheck className={`${iconClass} text-blue-600`} />;
      case 'payment_received':
        return <DollarSign className={`${iconClass} text-green-600`} />;
      case 'payment_pending':
        return <Clock className={`${iconClass} text-yellow-600`} />;
      case 'message':
        return <MessageCircle className={`${iconClass} text-blue-600`} />;
      case 'meeting_scheduled':
      case 'meeting_updated':
        return <Clock className={`${iconClass} text-purple-600`} />;
      case 'system':
      default:
        return <AlertCircle className={`${iconClass} text-gray-600`} />;
    }
  };

  const getPriorityBadge = (priority: Notification['priority']) => {
    const priorityLevel = priority || 'medium';
    const badgeClasses = {
      urgent: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-blue-100 text-blue-800 border-blue-200',
      low: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    if (priorityLevel === 'urgent' || priorityLevel === 'high') {
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${badgeClasses[priorityLevel]}`}>
          {priorityLevel === 'urgent' && <Star className="w-3 h-3 mr-1" />}
          {priorityLevel.toUpperCase()}
        </span>
      );
    }
    return null;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Handle action URL
    if (notification.actionUrl) {
      if (notification.actionUrl.startsWith('http')) {
        window.open(notification.actionUrl, '_blank');
      } else {
        // Handle internal navigation
        window.location.hash = notification.actionUrl;
      }
    }
  };

  const handleFilterChange = (filterType: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      is_read: undefined,
      notification_type: '',
      priority: ''
    });
  };

  const hasActiveFilters = filters.is_read !== undefined || filters.notification_type !== '' || filters.priority !== '';

  return (
    <div className="notification-bell-container relative" ref={dropdownRef}>
      <button
        className="notification-bell-button relative p-3 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell className={`w-6 h-6 transition-all duration-300 ${
          unreadCount > 0 ? 'text-blue-600 animate-pulse' : 'text-gray-600 group-hover:text-gray-800'
        }`} />
        {unreadCount > 0 && (
          <span className="notification-badge absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-md border-2 border-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        {isWebSocketConnected && (
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
        )}
        <div className="absolute inset-0 rounded-xl bg-blue-500 opacity-0 group-hover:opacity-5 transition-opacity duration-200"></div>
      </button>

      {isOpen && (
        <div className="notification-dropdown absolute right-0 mt-3 w-[420px] bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-[36rem] flex flex-col overflow-hidden animate-in slide-in-from-top-2 fade-in-0 duration-200">
          {/* Header */}
          <div className="notification-header bg-white px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="notification-title text-lg font-bold text-gray-900 tracking-tight">Notifications</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span className="font-medium">
                      {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                    </span>
                    {isWebSocketConnected && (
                      <div className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></div>
                        Live
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded-lg hover:bg-white/50 transition-all duration-200 ${
                    hasActiveFilters 
                      ? 'text-blue-600 bg-blue-100/50' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Filter notifications"
                >
                  <Filter className="w-4 h-4" />
                </button>
                {unreadCount > 0 && (
                  <button
                    className="mark-all-read-btn flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                    onClick={markAllAsRead}
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-4 h-4 mr-2" />
                    Mark all read
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 flex items-center">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter Notifications
                </h4>
                <div className="flex items-center space-x-3">
                  <select
                    value={filters.is_read === undefined ? '' : filters.is_read.toString()}
                    onChange={(e) => handleFilterChange('is_read', e.target.value === '' ? undefined : e.target.value === 'true')}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">All Status</option>
                    <option value="false">Unread Only</option>
                    <option value="true">Read Only</option>
                  </select>
                  
                  <select
                    value={filters.priority}
                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Any Priority</option>
                    <option value="urgent">🔴 Urgent</option>
                    <option value="high">🟠 High</option>
                    <option value="medium">🔵 Medium</option>
                    <option value="low">⚪ Low</option>
                  </select>
                  
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="p-3 bg-red-50 border-b border-gray-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Notifications list */}
          <div className="notification-list flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty flex flex-col items-center justify-center p-12 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                  <Bell className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  {hasActiveFilters ? 'No matches found' : 'No notifications yet'}
                </h4>
                <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                  {hasActiveFilters 
                    ? 'Try adjusting your filters to see more notifications.' 
                    : 'We\'ll notify you when there are updates on your tasks and account activity.'}
                </p>
              </div>
            ) : (
              notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="p-4 flex items-start space-x-3">
                    <div className="notification-icon flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type, notification.priority)}
                    </div>
                    
                    <div className="notification-content flex-1 min-w-0">
                      <div className="notification-item-header flex items-start justify-between mb-1">
                        <h4 className="notification-item-title text-sm font-medium text-gray-900 truncate pr-2">
                          {notification.title}
                        </h4>
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          {getPriorityBadge(notification.priority)}
                          <span className="notification-time text-xs text-gray-500">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="notification-message text-sm text-gray-600 line-clamp-2">
                        {notification.message}
                      </p>
                      
                      {notification.actionText && notification.actionUrl && (
                        <div className="mt-2">
                          <span className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800">
                            {notification.actionText}
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {!notification.read && (
                      <div className="notification-unread-dot w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 10 && (
            <div className="notification-footer p-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white text-center">
              <button 
                className="view-all-btn w-full py-2 px-4 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 border border-blue-200 hover:border-blue-300"
                onClick={() => {
                  // Navigate to full notifications page
                  setIsOpen(false);
                }}
              >
                View all {notifications.length} notifications →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBellAPI;