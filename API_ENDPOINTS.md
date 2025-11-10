# TheGradHelper - API Endpoints Documentation

## Overview
This document outlines all the backend API endpoints required to make TheGradHelper web application fully functional. The application is currently using mock data for demonstration purposes, but this documentation provides the complete specification for implementing a real backend API.

## Base URL
```
Production: https://api.gradhelper.com/v1
Development: http://localhost:3001/api/v1
```

## Authentication
All endpoints (except public ones) require JWT authentication:
```
Authorization: Bearer <jwt_token>
```

---

## 🔐 Authentication Endpoints

### POST /auth/login
**Purpose**: Authenticate user with email/password
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "student|admin",
      "avatar": "https://...",
      "profile": {
        "isComplete": true,
        "academicLevel": "undergraduate",
        "institution": "University Name",
        "major": "Computer Science"
      }
    },
    "token": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

### POST /auth/register
**Purpose**: Create new user account
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123",
  "role": "student"
}
```

### POST /auth/google
**Purpose**: OAuth authentication with Google
```json
{
  "googleToken": "google_oauth_token",
  "role": "student|admin"
}
```

### POST /auth/logout
**Purpose**: Invalidate user session
```json
{
  "refreshToken": "refresh_token_here"
}
```

### POST /auth/refresh
**Purpose**: Refresh JWT token
```json
{
  "refreshToken": "refresh_token_here"
}
```

### POST /auth/forgot-password
**Purpose**: Send password reset email
```json
{
  "email": "user@example.com"
}
```

### POST /auth/reset-password
**Purpose**: Reset password with token
```json
{
  "token": "reset_token",
  "newPassword": "new_password123"
}
```

---

## 👤 User Management Endpoints

### GET /users/profile
**Purpose**: Get current user's profile
**Response**:
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "student",
    "avatar": "https://...",
    "profile": {
      "isComplete": true,
      "academicLevel": "undergraduate",
      "institution": "University Name",
      "major": "Computer Science",
      "bio": "Student bio...",
      "preferences": {
        "notifications": true,
        "emailUpdates": true,
        "theme": "light"
      }
    },
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-15T00:00:00Z"
  }
}
```

### PUT /users/profile
**Purpose**: Update user profile
```json
{
  "name": "John Doe",
  "bio": "Updated bio",
  "profile": {
    "academicLevel": "graduate",
    "institution": "New University",
    "major": "Data Science",
    "preferences": {
      "notifications": false,
      "emailUpdates": true,
      "theme": "dark"
    }
  }
}
```

### POST /users/avatar
**Purpose**: Upload user avatar
**Content-Type**: multipart/form-data
```
avatar: [file]
```

### GET /users/students (Admin only)
**Purpose**: Get list of all students
**Query Parameters**:
- `page`: int (default: 1)
- `limit`: int (default: 20)
- `search`: string
- `status`: "active|inactive|suspended"

### GET /users/{userId} (Admin only)
**Purpose**: Get specific user details

### PUT /users/{userId}/status (Admin only)
**Purpose**: Update user status
```json
{
  "status": "active|inactive|suspended",
  "reason": "Optional reason"
}
```

---

## 📝 Task Management Endpoints

### POST /tasks
**Purpose**: Create new task (Student only)
```json
{
  "title": "Machine Learning Research Paper",
  "type": "research_paper",
  "description": "Detailed description...",
  "subject": "computer_science",
  "academicLevel": "undergraduate",
  "pages": 10,
  "deadline": "2025-02-15T23:59:59Z",
  "budget": 200,
  "requirements": "Specific requirements...",
  "deliverables": [
    "Draft version",
    "Final document",
    "Presentation slides"
  ],
  "attachments": ["file_id_1", "file_id_2"],
  "citations": "APA format required"
}
```

### GET /tasks
**Purpose**: Get user's tasks (filtered by role)
**Query Parameters**:
- `page`: int
- `limit`: int
- `status`: "pending|in_progress|completed|revision_needed|rejected"
- `search`: string
- `sortBy`: "created_at|due_date|title"
- `sortOrder`: "asc|desc"

### GET /tasks/{taskId}
**Purpose**: Get specific task details
**Response**:
```json
{
  "success": true,
  "data": {
    "id": "task_123",
    "title": "Machine Learning Research Paper",
    "description": "Detailed description...",
    "status": "in_progress",
    "priority": "high",
    "dueDate": "2025-02-15T23:59:59Z",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-10T00:00:00Z",
    "budget": 200,
    "student": {
      "id": "user_123",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "assignedAdmin": {
      "id": "admin_456",
      "name": "Dr. Smith"
    },
    "deliverables": [
      {
        "id": "deliv_1",
        "title": "Draft version",
        "description": "First draft",
        "dueDate": "2025-02-01T23:59:59Z",
        "status": "pending",
        "files": []
      }
    ],
    "attachments": [
      {
        "id": "file_1",
        "name": "requirements.pdf",
        "url": "https://...",
        "size": 1024000,
        "type": "application/pdf"
      }
    ]
  }
}
```

### PUT /tasks/{taskId}
**Purpose**: Update task details
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "deadline": "2025-02-20T23:59:59Z",
  "requirements": "Updated requirements"
}
```

### PUT /tasks/{taskId}/status (Admin only)
**Purpose**: Update task status
```json
{
  "status": "in_progress|completed|revision_needed|rejected",
  "reason": "Optional reason for status change",
  "feedback": "Detailed feedback"
}
```

### DELETE /tasks/{taskId}
**Purpose**: Delete/cancel task
```json
{
  "reason": "Reason for cancellation"
}
```

### POST /tasks/{taskId}/assign (Admin only)
**Purpose**: Assign task to admin
```json
{
  "adminId": "admin_456"
}
```

---

## 📋 Deliverables Endpoints

### POST /tasks/{taskId}/deliverables
**Purpose**: Add deliverable to task
```json
{
  "title": "Research Draft",
  "description": "First draft of research paper",
  "dueDate": "2025-02-01T23:59:59Z",
  "requirements": "Specific requirements"
}
```

### GET /tasks/{taskId}/deliverables
**Purpose**: Get task deliverables

### PUT /deliverables/{deliverableId}
**Purpose**: Update deliverable
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "dueDate": "2025-02-05T23:59:59Z",
  "status": "pending|in_progress|completed|revision_needed"
}
```

### POST /deliverables/{deliverableId}/submit (Admin only)
**Purpose**: Submit deliverable files
**Content-Type**: multipart/form-data
```
files: [file1, file2]
notes: "Submission notes"
```

### POST /deliverables/{deliverableId}/approve (Student only)
**Purpose**: Approve submitted deliverable
```json
{
  "approved": true,
  "feedback": "Optional feedback"
}
```

### DELETE /deliverables/{deliverableId}
**Purpose**: Remove deliverable

---

## 💬 Messaging/Chat Endpoints

### GET /chats
**Purpose**: Get user's chat conversations
**Query Parameters**:
- `page`: int
- `limit`: int
- `type`: "task|general|support"

### GET /chats/{chatId}/messages
**Purpose**: Get messages in chat
**Query Parameters**:
- `page`: int
- `limit`: int
- `before`: timestamp (for pagination)

### POST /chats/{chatId}/messages
**Purpose**: Send message in chat
```json
{
  "content": "Message content",
  "type": "text|image|file",
  "attachments": ["file_id_1"],
  "replyTo": "message_id" // Optional
}
```

### PUT /messages/{messageId}
**Purpose**: Edit message
```json
{
  "content": "Updated content"
}
```

### DELETE /messages/{messageId}
**Purpose**: Delete message

### POST /messages/{messageId}/read
**Purpose**: Mark message as read

### GET /chats/{chatId}/typing
**Purpose**: WebSocket endpoint for typing indicators

---

## 🤝 Partnership/Admin Requests Endpoints

### POST /partnership-requests
**Purpose**: Submit partnership request (Student only)
**Frontend Data Model**:
```json
{
  "requestType": "academic_help|tutoring|consultation",
  "subject": "computer_science",
  "description": "Detailed request description",
  "urgency": "low|medium|high",
  "preferredContactMethod": "email|phone|chat",
  "availabilitySchedule": "Monday-Friday 9AM-5PM",
  "additionalNotes": "Any additional information",
  "userId": "user_123",
  "userName": "John Doe",
  "userEmail": "john@example.com",
  "userAvatar": "https://...",
  "school": "University Name",
  "year": "3",
  "course": "Computer Science",
  "motivation": "Why I want this partnership...",
  "experience": "Relevant experience...",
  "socialMedia": "@john_doe",
  "referralCode": "REF123"
}
```
**Backend Response Example**:
```json
{
  "id": 1,
  "status": "pending",
  "submittedDate": "2025-09-18T10:00:00Z"
}
```

### GET /partnership-requests
**Purpose**: Get partnership requests (filtered by role)
**Query Parameters**:
- `page`: int
- `limit`: int
- `status`: "pending|approved|rejected"
- `search`: string
- `urgency`: "low|medium|high"
**Frontend expects each request object to include:**
- `id`, `userId`, `userName`, `userEmail`, `userAvatar`, `school`, `year`, `course`, `motivation`, `experience`, `socialMedia`, `status`, `submittedDate`, `reviewedDate`, `reviewedBy`, `rejectionReason`, `referralCode`

### GET /partnership-requests/{requestId}
**Purpose**: Get specific partnership request details
**Response includes all fields listed above.**

### PUT /partnership-requests/{requestId}/status (Admin only)
**Purpose**: Update partnership request status
**Frontend Action**: Admin can approve or reject a request via modal dialogs. If rejected, a reason is required.
```json
{
  "status": "approved|rejected",
  "reason": "Reason for decision",
  "assignedAdmin": "admin_id", // If approved
  "estimatedResponse": "24 hours", // If approved
  "reviewedBy": "Dr. John Smith", // Admin name
  "reviewedDate": "2025-09-18T11:00:00Z",
  "rejectionReason": "Insufficient motivation" // If rejected
}
```
**Backend should update and return the full request object with new status and review info.**

### DELETE /partnership-requests/{requestId}
**Purpose**: Cancel partnership request
**Frontend Action**: User can cancel their own request. Backend should remove or mark the request as cancelled.
---
### Frontend & Backend Integration Flow
1. **Submit Request**: Frontend collects user info and sends POST to `/partnership-requests`.
2. **List Requests**: Frontend fetches requests via GET, displays with status badges.
3. **View Details**: Frontend opens modal, fetches details if needed.
4. **Approve/Reject**: Admin uses modal to approve/reject, triggers PUT with status and reason.
5. **Sync**: After status change, frontend refreshes list to show updates.
6. **Cancel**: User can delete their request via DELETE.
7. **Status Values**: Only `pending`, `approved`, `rejected` are valid.

---
### Referral Code & Link Implementation

**Referral Code Generation:**
- Backend generates a unique referral code for each user (e.g., `REF123XYZ`) during registration or partnership request creation.
- Code can be random or based on user ID.
- Store referral code in user profile and/or partnership request.

**Referral Link Creation:**
- Construct referral link using the code:
  `https://gradhelper.com/register?ref=REF123XYZ`
- Frontend displays this link in the user dashboard/profile for sharing.

**Referral Code Usage:**
- When a new user registers via a referral link, frontend extracts the `ref` query parameter and sends it in the registration API call.
- Backend associates the new user with the referring user/code for tracking and rewards.

**Partnership Request:**
- Frontend includes the referral code in the partnership request payload if available.
- Backend stores and validates the referral code in the request.

**Summary:**
- Referral codes are generated and stored per user.
- Referral links are constructed using the code and shared by users.
- New users or partnership requests can include the code for tracking.
- Backend validates and associates referrals for analytics or rewards.

## 💳 Billing & Payment Endpoints

### GET /bills
**Purpose**: Get user's bills (filtered by role)
**Query Parameters**:
- `page`: int
- `limit`: int
- `status`: "pending|paid|overdue|cancelled"
- `studentId`: string (Admin only)

### POST /bills (Admin only)
**Purpose**: Create new bill
```json
{
  "taskId": "task_123",
  "studentId": "user_123",
  "description": "Payment for research paper assistance",
  "items": [
    {
      "description": "Research and writing",
      "amount": 200
    },
    {
      "description": "Formatting and citations",
      "amount": 50
    }
  ],
  "dueDate": "2025-02-01T23:59:59Z",
  "notes": "Payment terms and conditions"
}
```

### GET /bills/{billId}
**Purpose**: Get specific bill details

### PUT /bills/{billId} (Admin only)
**Purpose**: Update bill
```json
{
  "description": "Updated description",
  "items": [...],
  "dueDate": "2025-02-05T23:59:59Z"
}
```

### POST /bills/{billId}/payment-intent
**Purpose**: Create Stripe payment intent
```json
{
  "currency": "usd",
  "customerEmail": "student@example.com"
}
```
**Response**:
```json
{
  "clientSecret": "pi_xxxx_secret_xxxx",
  "amount": 25000, // Amount in cents
  "currency": "usd"
}
```

### POST /webhook/stripe
**Purpose**: Handle Stripe webhook events
**Content-Type**: application/json
**Headers**: stripe-signature

### GET /payments/history
**Purpose**: Get payment history
**Query Parameters**:
- `page`: int
- `limit`: int
- `status`: "succeeded|failed|pending"
- `dateFrom`: date
- `dateTo`: date

---

## 📅 Meeting Management Endpoints

### GET /meetings
**Purpose**: Get user's meetings
**Query Parameters**:
- `page`: int
- `limit`: int
- `status`: "scheduled|completed|cancelled"
- `type`: "virtual|in_person"
- `dateFrom`: date
- `dateTo`: date

### GET /meetings
**Purpose**: Get all meetings
**Query Parameters**:
- `page`: int
- `limit`: int
- `status`: "scheduled|completed|cancelled"
- `type`: "virtual|in_person"
- `dateFrom`: date
- `dateTo`: date

### POST /meetings (Admin/student)
**Purpose**: Schedule new meeting
```json
{
  "studentId": "user_123",
  "title": "Project Discussion",
  "description": "Discuss project requirements and timeline",
  "date": "2025-02-01",
  "time": "14:00",
  "duration": 60, // minutes
  "type": "virtual|in_person",
  "location": "Room 204, CS Building", // for in-person
  "meetingUrl": "https://zoom.us/j/123456789", // for virtual
  "agenda": "1. Review requirements\n2. Discuss timeline"
}
```

### GET /meetings/{meetingId}
**Purpose**: Get specific meeting details

### PUT /meetings/{meetingId}
**Purpose**: Update meeting
```json
{
  "title": "Updated title",
  "date": "2025-02-02",
  "time": "15:00",
  "location": "Updated location"
}
```

### PUT /meetings/{meetingId}/status
**Purpose**: Update meeting status
```json
{
  "status": "scheduled|completed|cancelled|rescheduled",
  "reason": "Reason for status change"
}
```

### DELETE /meetings/{meetingId}
**Purpose**: Cancel meeting
```json
{
  "reason": "Reason for cancellation"
}
```

### POST /meetings/{meetingId}/join
**Purpose**: Join virtual meeting (generates/returns meeting URL)

---

## 📁 File Upload & Management Endpoints

### POST /files/upload
**Purpose**: Upload file(s)
**Content-Type**: multipart/form-data
```
files: [file1, file2, ...]
category: "task_attachment|deliverable|avatar|chat_attachment"
taskId: "task_123" // Optional, for context
```
**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "file_123",
      "name": "document.pdf",
      "originalName": "My Document.pdf",
      "size": 1024000,
      "type": "application/pdf",
      "url": "https://storage.example.com/files/file_123.pdf",
      "thumbnailUrl": "https://storage.example.com/thumbnails/file_123.jpg",
      "uploadedAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

### GET /files/{fileId}
**Purpose**: Get file details

### GET /files/{fileId}/download
**Purpose**: Download file (returns file stream)

### DELETE /files/{fileId}
**Purpose**: Delete file

### GET /files/signed-url/{fileId}
**Purpose**: Get signed URL for private file access
**Response**:
```json
{
  "url": "https://storage.example.com/files/file_123.pdf?signature=...",
  "expiresAt": "2025-01-15T11:00:00Z"
}
```

---

## 🔔 Notification Endpoints

### GET /notifications
**Purpose**: Get user notifications
**Query Parameters**:
- `page`: int
- `limit`: int
- `unreadOnly`: boolean
- `type`: "task_update|payment_received|message|meeting|system"

### PUT /notifications/{notificationId}/read
**Purpose**: Mark notification as read

### PUT /notifications/read-all
**Purpose**: Mark all notifications as read

### DELETE /notifications/{notificationId}
**Purpose**: Delete notification

### POST /notifications/preferences
**Purpose**: Update notification preferences
```json
{
  "email": {
    "taskUpdates": true,
    "paymentReminders": true,
    "messages": false,
    "meetings": true
  },
  "push": {
    "taskUpdates": true,
    "messages": true,
    "meetings": true
  }
}
```

---

## � Live Chatting Feature: Student ↔ Admin

### Overview
Enables real-time messaging between students and admins using REST APIs and WebSocket events.

---

### Backend Implementation

#### REST Endpoints

- **GET /chats**
  - Lists chat conversations for the user.
  - Query: `type=task|general|support` (use `support` for student-admin chats).

- **GET /chats/{chatId}/messages**
  - Fetches messages for a chat (supports pagination).

- **POST /chats/{chatId}/messages**
  - Sends a message in a chat.
  - Payload:
    ```json
    {
      "content": "Message content",
      "type": "text|image|file",
      "attachments": ["file_id_1"],
      "replyTo": "message_id" // Optional
    }
    ```

- **WebSocket Events**
  - `chat.message`: Real-time delivery of new messages.
  - `chat.typing`: Typing indicators.

#### WebSocket Connection

- URL: `wss://api.gradhelper.com/ws?token=jwt_token`
- On connection, subscribe to relevant chat channels.
- Emit events for new messages and typing status.

---

### Frontend Implementation

#### Chat UI

- **Conversation List**: Shows all chats (filter by `type: support` for admin chats).
- **Message Window**: Displays messages, supports text, images, files.
- **Input Box**: For composing messages, with file/image upload.
- **Typing Indicator**: Shows when the other party is typing (via WebSocket).

#### Real-Time Updates

- **Connect to WebSocket** on login.
- **Listen for `chat.message`** to update UI instantly.
- **Send/Receive `chat.typing`** events for typing status.

#### Message Sending

- On send, POST to `/chats/{chatId}/messages`.
- Optimistically update UI, then confirm via WebSocket event.

#### Admin Features

- Admins see all support chats and can reply to students.
- Optionally, admins can initiate new chats with students.

---

### Example Flow

1. **Student starts a support chat** (or uses existing).
2. **Student sends a message** via POST `/chats/{chatId}/messages`.
3. **Backend broadcasts message** via WebSocket `chat.message`.
4. **Admin receives message in real-time**, replies via same endpoint.
5. **Both parties see typing indicators** via `chat.typing` events.

---

### Security & Moderation

- Only authenticated users can access chat.
- Backend should validate chat participants (student/admin).
- Optionally, implement message moderation and logging.

---

### Summary

- REST APIs for chat history and message sending.
- WebSocket for real-time updates and typing indicators.
- Frontend displays conversations, messages, and supports instant communication.

---
## �📊 Analytics & Reports Endpoints (Admin only)

### GET /analytics/dashboard
**Purpose**: Get dashboard analytics
**Response**:
```json
{
  "totalTasks": 156,
  "activeTasks": 42,
  "completedTasks": 98,
  "totalRevenue": 45600,
  "monthlyRevenue": 12400,
  "activeStudents": 89,
  "tasksByStatus": {
    "pending": 15,
    "in_progress": 27,
    "completed": 98,
    "revision_needed": 8,
    "rejected": 8
  },
  "revenueByMonth": [
    {"month": "2025-01", "amount": 12400},
    {"month": "2024-12", "amount": 10800}
  ]
}
```

### GET /analytics/tasks
**Purpose**: Get task analytics
**Query Parameters**:
- `dateFrom`: date
- `dateTo`: date
- `groupBy`: "day|week|month"

### GET /analytics/revenue
**Purpose**: Get revenue analytics
**Query Parameters**:
- `dateFrom`: date
- `dateTo`: date
- `groupBy`: "day|week|month"

### GET /reports/tasks
**Purpose**: Export task report (CSV/PDF)
**Query Parameters**:
- `format`: "csv|pdf"
- `dateFrom`: date
- `dateTo`: date
- `status`: string

---

## 🔧 System/Admin Endpoints

### GET /system/health
**Purpose**: System health check (public endpoint)

### GET /admin/users/statistics
**Purpose**: Get user statistics
**Response**:
```json
{
  "totalUsers": 245,
  "activeUsers": 198,
  "newUsersThisMonth": 23,
  "usersByRole": {
    "student": 220,
    "admin": 25
  },
  "usersByStatus": {
    "active": 198,
    "inactive": 32,
    "suspended": 15
  }
}
```

### GET /admin/tasks/statistics
**Purpose**: Get task statistics

### POST /admin/announcements
**Purpose**: Create system announcement
```json
{
  "title": "System Maintenance",
  "message": "Scheduled maintenance on...",
  "type": "info|warning|error",
  "targetAudience": "all|students|admins",
  "expiresAt": "2025-01-20T00:00:00Z"
}
```

### GET /admin/system-logs
**Purpose**: Get system logs
**Query Parameters**:
- `level`: "error|warn|info|debug"
- `service`: string
- `dateFrom`: date
- `dateTo`: date

---

## WebSocket Events

### Connection
```
wss://api.gradhelper.com/ws?token=jwt_token
```

### Events
- `chat.message` - Real-time chat messages
- `chat.typing` - Typing indicators
- `notification.new` - New notifications
- `task.status_changed` - Task status updates
- `meeting.reminder` - Meeting reminders
- `system.announcement` - System announcements

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  },
  "timestamp": "2025-01-15T10:00:00Z",
  "requestId": "req_123456"
}
```

### Common Error Codes
- `AUTHENTICATION_REQUIRED` (401)
- `UNAUTHORIZED` (403)
- `NOT_FOUND` (404)
- `VALIDATION_ERROR` (400)
- `RATE_LIMIT_EXCEEDED` (429)
- `INTERNAL_SERVER_ERROR` (500)

---

## Rate Limiting

- **General APIs**: 100 requests per minute per user
- **File Upload**: 10 requests per minute per user
- **Chat Messages**: 30 requests per minute per user
- **Authentication**: 5 requests per minute per IP

---

## Implementation Notes

1. **Authentication**: Use JWT tokens with 15-minute expiry and refresh tokens
2. **File Storage**: Use cloud storage (AWS S3, Google Cloud Storage) with CDN
3. **Real-time Features**: Implement WebSocket connections for chat and notifications
4. **Payment Processing**: Integrate with Stripe for secure payment handling
5. **Email Service**: Use service like SendGrid for transactional emails
6. **Database**: Recommended PostgreSQL with proper indexing for performance
7. **Caching**: Implement Redis for session management and caching
8. **Security**: Use HTTPS, validate all inputs, implement proper CORS policies
9. **Monitoring**: Add logging, error tracking (Sentry), and performance monitoring
10. **Documentation**: Use tools like Swagger/OpenAPI for interactive API docs

This API specification provides the complete backend requirements for the TheGradHelper application to function as a production-ready platform.

---

## 💬 Live Chat Feature: Student ↔ Admin

### Overview
This feature enables real-time messaging between students and admins. Admins can view all students, select one, and chat individually. Students can only chat with admin support.

### 1. Backend (Django)

#### Models
- **User**: Represents students and admins (with a `role` field).
- **Chat**: Represents a chat session (fields: `id`, `student`, `admin`, `created_at`).
- **Message**: Represents a message (fields: `id`, `chat`, `sender`, `content`, `timestamp`, `status`)

#### Endpoints
- `GET /api/chats/`  
  List all chats for the current user (admin: all student chats, student: their chat).
- `GET /api/chats/<chat_id>/messages/`  
  Fetch messages for a chat.
- `POST /api/chats/<chat_id>/messages/`  
  Send a message (fields: `content`).
- `POST /api/chats/<chat_id>/typing/`  
  Send typing indicator (optional).
- WebSocket endpoint (e.g. `/ws/chat/<chat_id>/`)  
  For real-time message delivery and typing indicators.

#### Django Implementation Steps
1. **Create Models**:  
   `User`, `Chat`, `Message` (with appropriate relationships).
2. **Serializers**:  
   For `Chat` and `Message` models.
3. **Views**:  
   API views for listing chats, fetching/sending messages.
4. **Routing**:  
   Add URLs for chat endpoints.
5. **WebSocket Setup**:  
   Use Django Channels for real-time updates. Consumers for handling message events and typing indicators.
6. **Permissions**:  
   Ensure only admins can view all students; students only see their own chat.

### 2. Frontend (React)

#### Components
- **ChatView**: Main chat UI, handles sidebar (admin), message list, input, typing indicator.
- **Student Sidebar**: For admin, lists all students with search/filter.
- **Message Bubble**: Shows message content, sender, timestamp, status.
- **Typing Indicator**: Shows when the other party is typing.

#### Data Flow
- On load, fetch student list (admin) and chat history.
- When admin selects a student, fetch that chat’s messages.
- When sending a message, POST to backend and optimistically update UI.
- Listen for WebSocket events for new messages and typing indicators.

#### React Implementation Steps
1. **Sidebar**:  
   Display all students (admin only), allow selection.
2. **Chat Area**:  
   Show messages for selected chat. Show avatars, sender names, timestamps, status.
3. **Message Input**:  
   Send message via API, update local state. Show typing indicator (send/receive via WebSocket).
4. **WebSocket Integration**:  
   Connect to backend for real-time updates. Update UI on new message/typing events.
5. **State Management**:  
   Use React state/hooks for messages, selected student, typing, etc.

### 3. Integration Steps

#### Backend
- Set up Django models, serializers, views, and WebSocket consumers.
- Test endpoints with tools like Postman.
- Ensure authentication and permissions.

#### Frontend
- Implement UI components as described.
- Connect to backend endpoints for chat data.
- Integrate WebSocket for real-time updates.
- Handle error states and loading indicators.

### 4. Example API Usage
- **Fetch students (admin):**  
  `GET /api/users/?role=student`
- **Fetch chats:**  
  `GET /api/chats/`
- **Fetch messages:**  
  `GET /api/chats/<chat_id>/messages/`
- **Send message:**  
  `POST /api/chats/<chat_id>/messages/`
- **WebSocket:**  
  Connect to `/ws/chat/<chat_id>/` for real-time updates.

### 5. Notes
- Ensure CORS is configured for frontend-backend communication.
- Use authentication (JWT/session) for API and WebSocket.
- Optimize UI for responsiveness and accessibility.

---

**This documentation covers all steps needed to implement the chat feature from frontend to backend in Django.**