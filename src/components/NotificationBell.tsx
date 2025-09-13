import { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCheck, X, MessageCircle, FileCheck, DollarSign, AlertCircle } from 'lucide-react';
import { useNotifications, Notification } from './NotificationContext';

interface NotificationBellProps {
  userId: string;
  userRole: 'student' | 'admin';
}

export function NotificationBell({ userId, userRole }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, markAsRead, markAllAsRead, getNotificationsForUser } = useNotifications();

  const userNotifications = getNotificationsForUser(userId, userRole);
  const unreadCount = userNotifications.filter(n => !n.read).length;

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
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button
        className="notification-bell-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3 className="notification-title">Notifications</h3>
            {unreadCount > 0 && (
              <button
                className="mark-all-read-btn"
                onClick={markAllAsRead}
              >
                <CheckCheck className="w-4 h-4 mr-1" />
                Mark all read
              </button>
            )}
          </div>

          <div className="notification-list">
            {userNotifications.length === 0 ? (
              <div className="notification-empty">
                <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-center">No notifications yet</p>
              </div>
            ) : (
              userNotifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-item-header">
                      <h4 className="notification-item-title">{notification.title}</h4>
                      <span className="notification-time">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                    </div>
                    <p className="notification-message">{notification.message}</p>
                  </div>
                  {!notification.read && (
                    <div className="notification-unread-dot" />
                  )}
                </div>
              ))
            )}
          </div>

          {userNotifications.length > 10 && (
            <div className="notification-footer">
              <button className="view-all-btn">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}