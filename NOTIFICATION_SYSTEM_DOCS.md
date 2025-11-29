# GradHelper Notification System Documentation

## Overview

The GradHelper notification system provides real-time notifications to users through both REST API endpoints and WebSocket connections. It supports multiple notification types, priorities, and delivery methods.

## Architecture

### Components

1. **NotificationService** (`src/services/notificationService.ts`)
   - Handles all API communication with the backend
   - Manages WebSocket connections for real-time updates
   - Provides type conversions between API and frontend formats

2. **NotificationContextAPI** (`src/components/NotificationContextAPI.tsx`)
   - React Context provider for state management
   - Integrates with the NotificationService
   - Manages local state and WebSocket callbacks

3. **NotificationBellAPI** (`src/components/NotificationBellAPI.tsx`)
   - Enhanced notification bell with API integration
   - Real-time status indicators
   - Advanced filtering and search capabilities

4. **NotificationsPanel** (`src/components/NotificationsPanel.tsx`)
   - Full-page notification management interface
   - Bulk operations and advanced filtering
   - Pagination and search functionality

5. **AdminNotificationManager** (`src/components/AdminNotificationManager.tsx`)
   - Admin-only interface for creating notifications
   - Support for custom notification types and targeting

## API Integration

### Authentication

All API endpoints require JWT token authentication:

```javascript
Authorization: Bearer <jwt-token>
```

### Endpoints

#### 1. List Notifications
```http
GET /api/notifications/
```

**Query Parameters:**
- `page` (number): Page number for pagination
- `is_read` (boolean): Filter by read status
- `notification_type` (string): Filter by notification type
- `priority` (string): Filter by priority level

**Response:**
```json
{
  "count": 25,
  "next": "/api/notifications/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "notification_type": "task_assigned",
      "title": "New Task Assigned",
      "message": "You have been assigned a new task: Web Development Project",
      "priority": "high",
      "is_read": false,
      "created_at": "2025-11-27T10:30:00Z",
      "action_url": "/tasks/123",
      "action_text": "View Task",
      "metadata": {
        "task_id": 123
      },
      "user": {
        "id": 456,
        "username": "student1",
        "email": "student@example.com"
      }
    }
  ]
}
```

#### 2. Get Notification Details
```http
GET /api/notifications/{id}/
```

#### 3. Get Unread Count
```http
GET /api/notifications/unread-count/
```

**Response:**
```json
{
  "total_unread": 5
}
```

#### 4. Mark Notification as Read
```http
POST /api/notifications/{id}/mark-read/
```

#### 5. Mark All Notifications as Read
```http
POST /api/notifications/mark-all-read/
```

#### 6. Create Custom Notification (Admin Only)
```http
POST /api/notifications/create/
```

**Request Body:**
```json
{
  "user_id": 123,
  "notification_type": "system_announcement",
  "title": "System Maintenance Notice",
  "message": "The system will be under maintenance from 2 AM to 4 AM EST.",
  "priority": "high",
  "action_url": "/announcements/456",
  "action_text": "Read More",
  "metadata": {
    "announcement_id": 456,
    "maintenance_window": "2025-11-28T02:00:00Z"
  }
}
```

#### 7. Check Profile Completeness
```http
GET /api/notifications/check-profile/
```

**Response:**
```json
{
  "profile_complete": false,
  "missing_fields": ["phone", "address", "bio"],
  "notification_sent": true
}
```

## WebSocket Integration

### Connection

The notification system uses WebSocket for real-time updates:

```javascript
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const host = window.location.host;
const wsUrl = `${protocol}//${host}/ws/notifications/?token=${token}`;

const socket = new WebSocket(wsUrl);
```

### Message Format

```javascript
socket.onmessage = function(event) {
    const data = JSON.parse(event.data);
    if (data.type === 'notification') {
        console.log('New notification:', data.notification);
        console.log('Updated unread count:', data.unread_count);
    }
};
```

### Auto-Reconnection

The service automatically attempts to reconnect on connection loss with exponential backoff.

## Notification Types

### System Types

- `system_announcement` - System-wide announcements
- `maintenance_notice` - Scheduled maintenance notifications
- `security_alert` - Security-related notifications
- `profile_incomplete` - Profile completion reminders

### Task-Related Types

- `task_assigned` - New task assignments
- `task_completed` - Task completion notifications
- `deliverable_submitted` - Deliverable submissions
- `deliverable_approved` - Deliverable approvals
- `deliverable_rejected` - Deliverable rejections

### Payment Types

- `payment_received` - Payment confirmations
- `payment_pending` - Payment reminders
- `payment_failed` - Payment failure notifications

### Communication Types

- `message_received` - New message notifications
- `meeting_scheduled` - Meeting invitations
- `meeting_updated` - Meeting changes

## Priority Levels

1. **Urgent** (`urgent`)
   - Critical issues requiring immediate attention
   - Red color coding with animation
   - Browser notifications (if permission granted)

2. **High** (`high`)
   - Important updates that should be seen soon
   - Orange color coding

3. **Medium** (`medium`)
   - Regular notifications and updates
   - Blue color coding (default)

4. **Low** (`low`)
   - Informational messages
   - Gray color coding

## Frontend Integration

### Basic Setup

```typescript
import { NotificationProvider } from './components/NotificationContextAPI';
import { NotificationBellAPI } from './components/NotificationBellAPI';

function App() {
  return (
    <NotificationProvider>
      <YourAppContent />
      <NotificationBellAPI 
        userId="user123"
        userRole="student"
        token="jwt-token"
      />
    </NotificationProvider>
  );
}
```

### Using the Notification Context

```typescript
import { useNotifications } from './components/NotificationContextAPI';

function MyComponent() {
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    connectWebSocket,
    disconnectWebSocket
  } = useNotifications();

  // Connect WebSocket on component mount
  useEffect(() => {
    if (token) {
      connectWebSocket(token);
    }
    return () => {
      disconnectWebSocket();
    };
  }, [token]);

  // Fetch notifications with filters
  const loadNotifications = async () => {
    await fetchNotifications({
      is_read: false,
      priority: 'high'
    });
  };

  return (
    <div>
      <p>Unread notifications: {unreadCount}</p>
      {/* Render notifications */}
    </div>
  );
}
```

### Creating Notifications (Admin)

```typescript
const { createNotification } = useNotifications();

const sendAnnouncement = async () => {
  await createNotification({
    notification_type: 'system_announcement',
    title: 'Important Update',
    message: 'Please review the new platform features.',
    priority: 'high',
    action_url: '/features',
    action_text: 'View Features'
  });
};
```

## Browser Notifications

The system supports native browser notifications when permission is granted:

```javascript
// Request permission
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}

// Notifications are automatically shown for new real-time notifications
```

## Error Handling

### API Errors

All API calls include proper error handling with user-friendly messages:

```typescript
try {
  await fetchNotifications();
} catch (error) {
  console.error('Failed to fetch notifications:', error);
  setError('Unable to load notifications. Please try again.');
}
```

### WebSocket Errors

WebSocket connection issues are handled automatically:

- Connection failures trigger reconnection attempts
- Network issues show appropriate status indicators
- Graceful degradation to polling if WebSocket unavailable

## Performance Considerations

### Pagination

- API returns paginated results (default: 20 per page)
- Frontend loads additional pages on demand
- Infinite scroll supported in notification panel

### Caching

- Notifications cached in React state
- Optimistic updates for read status changes
- Background refresh without UI blocking

### WebSocket Optimization

- Single WebSocket connection per user session
- Automatic cleanup on component unmount
- Connection pooling for multiple tabs

## Security

### Authentication

- All API calls require valid JWT tokens
- WebSocket connections authenticated via query parameter
- Token refresh handled automatically

### Data Validation

- Input sanitization on all user-generated content
- XSS protection through React's built-in escaping
- CSRF protection on state-changing operations

### Privacy

- Users only receive their own notifications
- Admin notifications properly filtered by permissions
- Sensitive data not exposed in WebSocket messages

## Styling and Theming

### CSS Classes

The notification system uses these main CSS classes:

- `.notification-bell-container` - Notification bell wrapper
- `.notification-dropdown` - Dropdown menu styles
- `.notification-item` - Individual notification styling
- `.notification-card` - Full notification card (panel view)
- `.ws-status-indicator` - WebSocket connection status

### Customization

```css
/* Custom notification styles */
.notification-item.custom {
  background: linear-gradient(135deg, #your-color 0%, #your-other-color 100%);
  border-left: 3px solid #accent-color;
}

/* Priority-based styling */
.notification-type-urgent {
  border-left: 4px solid #ef4444;
  animation: pulse-urgent 1s infinite;
}
```

## Testing

### Unit Tests

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { NotificationBellAPI } from './NotificationBellAPI';

test('displays unread count', async () => {
  render(<NotificationBellAPI unreadCount={5} />);
  
  await waitFor(() => {
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});
```

### Integration Tests

```typescript
import { mockWebSocket } from './test-utils';

test('receives real-time notifications', async () => {
  const { result } = renderHook(() => useNotifications());
  
  // Mock WebSocket message
  mockWebSocket.send({
    type: 'notification',
    notification: mockNotification,
    unread_count: 3
  });
  
  await waitFor(() => {
    expect(result.current.unreadCount).toBe(3);
  });
});
```

## Deployment Considerations

### Environment Configuration

```javascript
// Production WebSocket URL
const wsUrl = process.env.REACT_APP_WS_URL || 
             `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//localhost:8000/ws/notifications/`;

// API Base URL
const apiUrl = process.env.REACT_APP_API_URL || '/api';
```

### Performance Monitoring

- Monitor WebSocket connection success rates
- Track notification delivery latency
- Log API error rates and response times

### Scaling Considerations

- WebSocket connections scale with user concurrent sessions
- Database queries optimized with proper indexing
- Consider Redis for real-time message brokering at scale

## Future Enhancements

### Planned Features

1. **Notification Templates**
   - Pre-defined notification templates
   - Dynamic content insertion
   - Multilingual support

2. **Advanced Filtering**
   - Tag-based organization
   - Custom filter rules
   - Smart notification grouping

3. **Analytics**
   - Notification engagement metrics
   - Delivery success tracking
   - User preference analytics

4. **Mobile Push**
   - Push notification support
   - Mobile app integration
   - Cross-platform synchronization

### Migration Path

When upgrading from the old notification system:

1. Update imports from `NotificationContext` to `NotificationContextAPI`
2. Replace `NotificationBell` with `NotificationBellAPI`
3. Add token prop to notification components
4. Test WebSocket connectivity in your environment
5. Update any custom notification handling logic

## Troubleshooting

### Common Issues

1. **WebSocket Connection Fails**
   - Check CORS settings on backend
   - Verify WebSocket endpoint URL
   - Ensure proper token format

2. **Notifications Not Updating**
   - Check network connectivity
   - Verify token validity
   - Look for JavaScript console errors

3. **Performance Issues**
   - Reduce notification polling frequency
   - Implement proper pagination
   - Check for memory leaks in WebSocket handlers

### Debug Mode

Enable debug logging:

```javascript
localStorage.setItem('debug_notifications', 'true');
```

This will log all notification operations to the browser console.

## Support

For technical support or questions about the notification system:

- Check the browser console for error messages
- Verify API connectivity using browser dev tools
- Test WebSocket connection independently
- Review notification permissions in browser settings

---

*Last updated: November 27, 2025*