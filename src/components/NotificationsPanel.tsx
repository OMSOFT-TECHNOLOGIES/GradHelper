import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, X, MessageCircle, FileCheck, DollarSign, AlertCircle, Settings, ExternalLink, Clock, Star, Filter, RefreshCw, Search, Archive, Trash2 } from 'lucide-react';
import { useNotifications, Notification } from './NotificationContextAPI';

interface NotificationsPanelProps {
  onViewChange?: (view: string) => void;
}

export function NotificationsPanel({ onViewChange }: NotificationsPanelProps) {
  const [filters, setFilters] = useState({
    is_read: undefined as boolean | undefined,
    notification_type: '',
    priority: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    error,
    fetchNotifications,
    markAsRead, 
    markAllAsRead,
    checkProfileCompleteness
  } = useNotifications();

  // Load notifications when filters or page change with debouncing
  useEffect(() => {
    let mounted = true;
    
    const loadNotifications = async () => {
      const params = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, { page: currentPage } as any);

      if (mounted) {
        await fetchNotifications(params);
      }
    };

    // Debounce filter changes, but load immediately for page changes
    if (currentPage !== 1) {
      loadNotifications();
    } else {
      const timeoutId = setTimeout(() => {
        loadNotifications();
      }, 150);
      
      return () => {
        mounted = false;
        clearTimeout(timeoutId);
      };
    }
    
    return () => {
      mounted = false;
    };
  }, [filters, currentPage, fetchNotifications]);

  // Check profile completeness on mount
  useEffect(() => {
    checkProfileCompleteness();
  }, [checkProfileCompleteness]);

  const getNotificationIcon = (type: Notification['type'], priority: Notification['priority']) => {
    const iconClass = `w-5 h-5 ${priority === 'urgent' ? 'text-red-600' : priority === 'high' ? 'text-orange-600' : ''}`;
    
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

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${badgeClasses[priorityLevel]}`}>
        {priorityLevel === 'urgent' && <Star className="w-3 h-3 mr-1" />}
        {priorityLevel.toUpperCase()}
      </span>
    );
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
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
        if (onViewChange) {
          onViewChange(notification.actionUrl);
        }
      }
    }
  };

  const handleFilterChange = (filterType: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({
      is_read: undefined,
      notification_type: '',
      priority: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleBulkAction = async (action: 'markRead' | 'delete') => {
    if (action === 'markRead') {
      for (const notificationId of selectedNotifications) {
        await markAsRead(notificationId);
      }
    }
    // Handle delete action if API supports it
    
    setSelectedNotifications([]);
  };

  const toggleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const selectAllNotifications = () => {
    const allIds = notifications.map(n => n.id);
    setSelectedNotifications(allIds);
  };

  const filteredNotifications = notifications.filter(notification => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        notification.title.toLowerCase().includes(searchLower) ||
        notification.message.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const hasActiveFilters = filters.is_read !== undefined || filters.notification_type !== '' || filters.priority !== '' || searchTerm !== '';

  return (
    <div className="notifications-panel max-w-6xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Bell className="w-6 h-6 mr-2" />
              Notifications
            </h1>
            <p className="text-gray-600 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => fetchNotifications()}
              className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                Mark All Read
              </button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filters.is_read === undefined ? '' : filters.is_read.toString()}
              onChange={(e) => handleFilterChange('is_read', e.target.value === '' ? undefined : e.target.value === 'true')}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All Status</option>
              <option value="false">Unread</option>
              <option value="true">Read</option>
            </select>
            
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Any Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedNotifications.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
            <span className="text-sm text-blue-800">
              {selectedNotifications.length} notification{selectedNotifications.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('markRead')}
                className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Check className="w-4 h-4 mr-1" />
                Mark Read
              </button>
              <button
                onClick={() => setSelectedNotifications([])}
                className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
            <p className="text-gray-500">
              {hasActiveFilters ? 'Try adjusting your search or filters.' : 'You\'ll see new notifications here when they arrive.'}
            </p>
          </div>
        ) : (
          <>
            {/* Select All */}
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={selectedNotifications.length === filteredNotifications.length}
                onChange={(e) => e.target.checked ? selectAllNotifications() : setSelectedNotifications([])}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label className="ml-3 text-sm text-gray-700">
                Select all notifications
              </label>
            </div>

            {/* Notification Items */}
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-card border rounded-lg transition-colors ${
                  !notification.read 
                    ? 'bg-blue-50 border-blue-200 shadow-sm' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                } ${selectedNotifications.includes(notification.id) ? 'ring-2 ring-blue-500' : ''}`}
              >
                <div className="p-4">
                  <div className="flex items-start space-x-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={() => toggleSelectNotification(notification.id)}
                      className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type, notification.priority)}
                    </div>
                    
                    {/* Content */}
                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                            {!notification.read && (
                              <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full inline-block"></span>
                            )}
                          </h3>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {getPriorityBadge(notification.priority)}
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">
                        {notification.message}
                      </p>
                      
                      {notification.actionText && notification.actionUrl && (
                        <button className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors">
                          {notification.actionText}
                          <ExternalLink className="w-4 h-4 ml-1" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Pagination could go here if the API supports it */}
    </div>
  );
}

export default NotificationsPanel;