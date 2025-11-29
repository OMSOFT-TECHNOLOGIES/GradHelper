import { useState, useRef, useEffect, useMemo } from 'react';
import { Bell, Check, CheckCheck, X, MessageCircle, FileCheck, DollarSign, AlertCircle } from 'lucide-react';
import { useNotifications, Notification } from './NotificationContextAPI';

interface NotificationBellProps {
  userId: string;
  userRole: 'student' | 'admin';
}

export function NotificationBell({ userId, userRole }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState<'unread' | 'all'>('unread');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, markAsRead, markAllAsRead, getNotificationsForUser } = useNotifications();

  // Track notifications array changes from context
  useEffect(() => {
    console.log('🔄 NotificationBell - Notifications from context changed:', {
      timestamp: new Date().toISOString(),
      count: notifications.length,
      latest: notifications[0] ? {
        id: notifications[0].id,
        title: notifications[0].title,
        read: notifications[0].read,
        userId: notifications[0].userId,
        userRole: notifications[0].userRole,
        timestamp: notifications[0].timestamp
      } : null,
      currentUserId: userId,
      currentUserRole: userRole
    });
  }, [notifications, userId, userRole]);

  // Memoize notification calculations for performance while ensuring real-time updates
  const allUserNotifications = useMemo(() => {
    const filtered = getNotificationsForUser(userId, userRole);
    console.log('🔔 NotificationBell - allUserNotifications calculated:', {
      userId,
      userRole,
      totalNotifications: notifications.length,
      filteredForUser: filtered.length,
      latestNotification: filtered[0] ? {
        id: filtered[0].id,
        title: filtered[0].title,
        timestamp: filtered[0].timestamp,
        read: filtered[0].read
      } : null
    });
    return filtered;
  }, [notifications, userId, userRole, getNotificationsForUser]);
  
  const userNotifications = useMemo(() => {
    const result = notificationFilter === 'unread' 
      ? allUserNotifications.filter(n => !n.read)
      : allUserNotifications;
    console.log('🔔 NotificationBell - userNotifications filtered:', {
      filter: notificationFilter,
      total: allUserNotifications.length,
      filtered: result.length,
      unreadIds: result.filter(n => !n.read).map(n => n.id)
    });
    return result;
  }, [allUserNotifications, notificationFilter]);
  
  const unreadCount = useMemo(() => {
    const count = allUserNotifications.filter(n => !n.read).length;
    console.log('🔔 NotificationBell - unreadCount calculated:', count);
    return count;
  }, [allUserNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle real-time notification updates
  useEffect(() => {
    // Force re-render when notifications change to ensure dropdown updates immediately
    console.log('🚀 NotificationBell - Real-time update triggered:', {
      timestamp: new Date().toISOString(),
      totalNotifications: notifications.length,
      userNotifications: allUserNotifications.length,
      unreadCount: unreadCount,
      isDropdownOpen: isOpen,
      currentFilter: notificationFilter,
      latestNotifications: notifications.slice(0, 3).map(n => ({
        id: n.id,
        title: n.title,
        read: n.read,
        timestamp: n.timestamp
      }))
    });
  }, [notifications, allUserNotifications.length, unreadCount, isOpen, notificationFilter]);

  // Auto-highlight bell when new unread notifications arrive
  useEffect(() => {
    const previousUnreadCount = useRef(unreadCount);
    
    // If unread count increased and dropdown is closed, briefly highlight the bell
    if (unreadCount > previousUnreadCount.current && !isOpen) {
      const bellElement = document.querySelector('.notification-bell-button');
      if (bellElement) {
        bellElement.classList.add('animate-bounce');
        setTimeout(() => {
          bellElement.classList.remove('animate-bounce');
        }, 1000);
      }
    }
    
    previousUnreadCount.current = unreadCount;
  }, [unreadCount, isOpen]);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'deliverable_approved':
      case 'deliverable_feedback':
        return <FileCheck className="w-4 h-4 text-green-600" />;
      case 'deliverable_rejected':
        return <X className="w-4 h-4 text-red-600" />;
      case 'payment_received':
        return <DollarSign className="w-4 h-4 text-green-600" />;
      case 'message':
        return <MessageCircle className="w-4 h-4 text-blue-600" />;
      case 'task_assigned':
        return <FileCheck className="w-4 h-4 text-blue-600" />;
      case 'system':
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
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

  const handleNotificationClick = (notification: Notification) => {
    console.log('🖱️ NotificationBell - Notification clicked:', {
      id: notification.id,
      title: notification.title,
      read: notification.read,
      timestamp: new Date().toISOString()
    });
    
    // Mark as read if it's unread
    if (!notification.read) {
      console.log('📖 NotificationBell - Marking notification as read:', notification.id);
      markAsRead(notification.id);
    }
  };

  return (
    <div className="notification-bell-container relative" ref={dropdownRef}>
      <button
        className="notification-bell-button relative p-3 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 group"
        onClick={() => {
          const newState = !isOpen;
          console.log('🔔 NotificationBell - Dropdown toggled:', {
            wasOpen: isOpen,
            nowOpen: newState,
            unreadCount,
            totalNotifications: notifications.length,
            userNotifications: allUserNotifications.length,
            timestamp: new Date().toISOString()
          });
          setIsOpen(newState);
        }}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell className={`w-6 h-6 transition-all duration-300 ${unreadCount > 0 ? 'text-blue-600 animate-pulse' : 'text-gray-600 group-hover:text-gray-800'}`} />
        {unreadCount > 0 && (
          <span className="notification-badge absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-md border-2 border-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        <div className="absolute inset-0 rounded-lg bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
      </button>

      {isOpen && (
        <div className="notification-dropdown absolute right-0 mt-3 w-[420px] bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden animate-in slide-in-from-top-2 fade-in-0 duration-200">
          <div className="notification-header bg-white px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="notification-title text-lg font-bold text-gray-900 tracking-tight">Notifications</h3>
                  <p className="text-sm text-gray-600 font-medium">
                    {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                  </p>
                </div>
              </div>
              {unreadCount > 0 && (
                <button
                  className="mark-all-read-btn flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                  onClick={markAllAsRead}
                >
                  <CheckCheck className="w-4 h-4 mr-2" />
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Filter Controls */}
          <div className="notification-filter bg-gray-50/70 px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Filter:</span>
                <div className="flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
                  <button
                    onClick={() => setNotificationFilter('unread')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                      notificationFilter === 'unread'
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    Unread ({allUserNotifications.filter(n => !n.read).length})
                  </button>
                  <button
                    onClick={() => setNotificationFilter('all')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                      notificationFilter === 'all'
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    All ({allUserNotifications.length})
                  </button>
                </div>
              </div>
              <div className="text-xs text-gray-500 font-medium">
                Showing {userNotifications.length} of {allUserNotifications.length}
              </div>
            </div>
          </div>

          <div className="notification-list max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
            {userNotifications.length === 0 ? (
              <div className="notification-empty flex flex-col items-center justify-center py-16 px-8">
                <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center mb-6">
                  <Bell className="w-10 h-10 text-gray-400" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">No unread notifications</h4>
                <p className="text-sm text-gray-600 text-center max-w-xs leading-relaxed font-medium">
                  All caught up! You'll see new notifications here when they arrive.
                </p>
              </div>
            ) : (
              userNotifications.slice(0, 10).map((notification, index) => {
                // Add animation for new notifications (first few items)
                const isRecentNotification = index < 3 && !notification.read;
                
                // Log each notification being rendered
                if (index === 0) {
                  console.log('🎨 NotificationBell - Rendering notifications:', {
                    count: userNotifications.length,
                    showing: Math.min(10, userNotifications.length),
                    firstNotification: {
                      id: notification.id,
                      title: notification.title,
                      read: notification.read,
                      timestamp: notification.timestamp
                    }
                  });
                }
                
                return (
                <div
                  key={notification.id}
                  className={`notification-item group cursor-pointer px-6 py-5 hover:bg-gray-50 transition-all duration-300 border-b border-gray-100 last:border-b-0 relative ${
                    !notification.read 
                      ? 'bg-blue-50/50 border-l-4 border-l-blue-500' 
                      : 'border-l-4 border-l-transparent'
                  } ${
                    isRecentNotification ? 'animate-pulse' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`notification-icon flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-200 ${
                      !notification.read 
                        ? 'bg-blue-100' 
                        : 'bg-gray-100 group-hover:bg-gray-150'
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-content flex-1 min-w-0">
                      <div className="notification-item-header flex items-start justify-between mb-2">
                        <h4 className={`notification-item-title font-bold text-sm leading-5 tracking-tight ${
                          !notification.read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h4>
                        <span className="notification-time text-xs text-gray-500 ml-3 flex-shrink-0 font-medium">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                      </div>
                      <p className="notification-message text-sm text-gray-700 leading-relaxed line-clamp-2 font-medium">
                        {notification.message}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="notification-unread-dot absolute top-5 right-5 w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </div>
                </div>
                );
              })
            )}
          </div>

          {userNotifications.length > 10 && (
            <div className="notification-footer bg-gray-50 px-6 py-4 border-t border-gray-100">
              <button className="view-all-btn w-full text-center py-2 px-4 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                View all {userNotifications.length} notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}