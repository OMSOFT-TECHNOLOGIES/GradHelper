# Partnership Requests API Documentation

This document describes the RESTful API endpoints for managing partnership requests in the GradHelper application.

## Base URL
```
/api/partnership-requests
```

## Authentication & Authorization

All endpoints require user authentication via headers:
- `X-User-Id`: Current user's ID
- `X-User-Role`: User's role (`student` or `admin`)

## Endpoints Overview

| Method | Endpoint | Description | Access Level |
|--------|----------|-------------|--------------|
| POST | `/partnership-requests` | Submit partnership request | Student |
| GET | `/partnership-requests` | Get all partnership requests | Admin |
| GET | `/partnership-requests/{id}` | Get specific request details | Student (own), Admin (all) |
| PUT | `/partnership-requests/{id}/status` | Update request status | Admin |
| DELETE | `/partnership-requests/{id}` | Cancel partnership request | Student (own), Admin (all) |
| GET | `/partnership-requests/user/{userId}` | Get user's requests | Student (own), Admin (all) |

---

## 1. Submit Partnership Request

**Endpoint:** `POST /api/partnership-requests`  
**Access:** Student only  
**Purpose:** Submit a new partnership application

### Request Body
```json
{
  "userName": "John Doe",
  "userEmail": "john.doe@university.edu",
  "userAvatar": "https://example.com/avatar.jpg",
  "school": "University of Example",
  "year": "3rd",
  "course": "Computer Science",
  "motivation": "I am passionate about helping fellow students succeed academically and want to represent TheGradHelper at my university. My experience in student government and academic tutoring has prepared me to effectively promote your services.",
  "experience": "Student government representative, academic tutor for 2 years",
  "socialMedia": "@johndoe_uni"
}
```

### Response (Success - 201)
```json
{
  "success": true,
  "message": "Partnership application submitted successfully",
  "data": {
    "request": {
      "id": 123,
      "userId": "user123",
      "userName": "John Doe",
      "userEmail": "john.doe@university.edu",
      "userAvatar": "https://example.com/avatar.jpg",
      "school": "University of Example",
      "year": "3rd",
      "course": "Computer Science",
      "motivation": "I am passionate about helping fellow students...",
      "experience": "Student government representative...",
      "socialMedia": "@johndoe_uni",
      "status": "pending",
      "submittedDate": "2025-11-14T10:30:00.000Z",
      "referralCode": "GRAD-JOHN-DOE-123456"
    },
    "partnershipData": {
      "isPartner": true,
      "status": "pending",
      "school": "University of Example",
      "referralCode": "GRAD-JOHN-DOE-123456",
      "totalReferrals": 0,
      "successfulReferrals": 0,
      "totalEarnings": 0,
      "pendingEarnings": 0,
      "joinedDate": "2025-11-14",
      "applicationData": { /* request object */ }
    }
  }
}
```

### Error Responses
```json
// Validation Error (400)
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_FAILED",
  "errors": [
    "School name is required",
    "Motivation must be at least 50 characters"
  ]
}

// Duplicate Application (409)
{
  "success": false,
  "message": "You already have a pending or approved partnership application",
  "code": "DUPLICATE_APPLICATION"
}

// Unauthorized (403)
{
  "success": false,
  "message": "Student access required",
  "code": "UNAUTHORIZED"
}
```

---

## 2. Get All Partnership Requests (Admin)

**Endpoint:** `GET /api/partnership-requests`  
**Access:** Admin only  
**Purpose:** Retrieve all partnership requests with filtering, searching, and pagination

### Query Parameters
```
status?: string          # Filter by status: 'all', 'pending', 'approved', 'rejected'
search?: string          # Search in name, school, email, course
sortBy?: string          # Sort field: 'submittedDate', 'name', 'status'
sortOrder?: string       # Sort direction: 'asc', 'desc'
page?: number           # Page number (default: 1)
limit?: number          # Items per page (default: 10)
```

### Example Request
```
GET /api/partnership-requests?status=pending&search=university&sortBy=submittedDate&sortOrder=desc&page=1&limit=5
```

### Response (Success - 200)
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": 123,
        "userId": "user123",
        "userName": "John Doe",
        "userEmail": "john.doe@university.edu",
        "school": "University of Example",
        "status": "pending",
        "submittedDate": "2025-11-14T10:30:00.000Z",
        "referralCode": "GRAD-JOHN-DOE-123456"
        // ... other fields
      }
    ],
    "statistics": {
      "total": 150,
      "pending": 23,
      "approved": 89,
      "rejected": 38,
      "filteredTotal": 23
    },
    "pagination": {
      "page": 1,
      "limit": 5,
      "total": 23,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

## 3. Get Specific Partnership Request

**Endpoint:** `GET /api/partnership-requests/{requestId}`  
**Access:** Student (own requests), Admin (all requests)  
**Purpose:** Get detailed information about a specific partnership request

### Response (Success - 200)
```json
{
  "success": true,
  "data": {
    "request": {
      "id": 123,
      "userId": "user123",
      "userName": "John Doe",
      "userEmail": "john.doe@university.edu",
      "userAvatar": "https://example.com/avatar.jpg",
      "school": "University of Example",
      "year": "3rd",
      "course": "Computer Science",
      "motivation": "I am passionate about helping fellow students...",
      "experience": "Student government representative...",
      "socialMedia": "@johndoe_uni",
      "status": "approved",
      "submittedDate": "2025-11-14T10:30:00.000Z",
      "reviewedDate": "2025-11-15T14:20:00.000Z",
      "reviewedBy": "Dr. Sarah Johnson",
      "referralCode": "GRAD-JOHN-DOE-123456"
    },
    "partnershipData": {
      "isPartner": true,
      "status": "approved",
      "school": "University of Example",
      "referralCode": "GRAD-JOHN-DOE-123456",
      "totalReferrals": 5,
      "successfulReferrals": 3,
      "totalEarnings": 150.00,
      "pendingEarnings": 75.00,
      "joinedDate": "2025-11-15"
    }
  }
}
```

### Error Responses
```json
// Not Found (404)
{
  "success": false,
  "message": "Partnership request not found",
  "code": "REQUEST_NOT_FOUND"
}

// Access Denied (403)
{
  "success": false,
  "message": "Access denied",
  "code": "UNAUTHORIZED"
}
```

---

## 4. Update Partnership Request Status (Admin)

**Endpoint:** `PUT /api/partnership-requests/{requestId}/status`  
**Access:** Admin only  
**Purpose:** Approve or reject a partnership request

### Request Body
```json
// For Approval
{
  "status": "approved",
  "reviewedBy": "Dr. Sarah Johnson"
}

// For Rejection
{
  "status": "rejected",
  "rejectionReason": "Insufficient academic standing for representative role",
  "reviewedBy": "Dr. Sarah Johnson"
}
```

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Partnership request approved successfully",
  "data": {
    "request": {
      "id": 123,
      "status": "approved",
      "reviewedDate": "2025-11-15T14:20:00.000Z",
      "reviewedBy": "Dr. Sarah Johnson"
      // ... other fields
    },
    "partnershipData": {
      "isPartner": true,
      "status": "approved",
      "school": "University of Example",
      "referralCode": "GRAD-JOHN-DOE-123456"
      // ... other fields
    },
    "notifications": [
      {
        "type": "system",
        "title": "Partnership Application Approved! 🎉",
        "message": "Congratulations! You are now an official TheGradHelper representative...",
        "userId": "user123",
        "userRole": "student"
      }
    ]
  }
}
```

### Error Responses
```json
// Invalid Status (400)
{
  "success": false,
  "message": "Invalid status. Must be 'approved' or 'rejected'",
  "code": "INVALID_STATUS"
}

// Missing Rejection Reason (400)
{
  "success": false,
  "message": "Rejection reason is required when rejecting a request",
  "code": "MISSING_REJECTION_REASON"
}
```

---

## 5. Cancel Partnership Request

**Endpoint:** `DELETE /api/partnership-requests/{requestId}`  
**Access:** Student (own requests), Admin (all requests)  
**Purpose:** Cancel a pending partnership request

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Partnership request cancelled successfully",
  "data": {
    "request": {
      "id": 123,
      "status": "cancelled",
      "cancelledDate": "2025-11-15T16:45:00.000Z",
      "cancelledBy": "user123"
      // ... other fields
    }
  }
}
```

### Error Responses
```json
// Invalid Operation (400)
{
  "success": false,
  "message": "Only pending requests can be cancelled",
  "code": "INVALID_OPERATION"
}
```

---

## 6. Get User Partnership Requests

**Endpoint:** `GET /api/partnership-requests/user/{userId}`  
**Access:** Student (own data), Admin (all users)  
**Purpose:** Get all partnership requests for a specific user

### Response (Success - 200)
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": 123,
        "status": "approved",
        "submittedDate": "2025-11-14T10:30:00.000Z",
        "reviewedDate": "2025-11-15T14:20:00.000Z"
        // ... other fields
      }
    ],
    "partnershipData": {
      "isPartner": true,
      "status": "approved",
      "school": "University of Example",
      "totalReferrals": 5,
      "totalEarnings": 150.00
      // ... other fields
    },
    "statistics": {
      "total": 1,
      "pending": 0,
      "approved": 1,
      "rejected": 0,
      "cancelled": 0
    }
  }
}
```

---

## Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `VALIDATION_FAILED` | Request validation failed | 400 |
| `DUPLICATE_APPLICATION` | User already has pending/approved application | 409 |
| `UNAUTHORIZED` | Insufficient permissions | 403 |
| `REQUEST_NOT_FOUND` | Partnership request not found | 404 |
| `INVALID_STATUS` | Invalid status value provided | 400 |
| `MISSING_REJECTION_REASON` | Rejection reason required | 400 |
| `INVALID_OPERATION` | Operation not allowed for current status | 400 |
| `MISSING_USER_ID` | User ID not provided | 400 |
| `SERVER_ERROR` | Internal server error | 500 |

---

## Frontend Integration

### Using the Partnership API Service

```typescript
import { PartnershipApiService, usePartnershipApi } from '../services/partnershipApiService';

// In a React component
const {
  loading,
  error,
  requests,
  statistics,
  submitRequest,
  loadRequests,
  approveRequest,
  rejectRequest
} = usePartnershipApi(userId, userRole);

// Submit application
await submitRequest({
  school: "University of Example",
  year: "3rd",
  course: "Computer Science",
  motivation: "...",
  experience: "..."
});

// Load admin requests
await loadRequests({
  status: 'pending',
  search: 'university',
  page: 1,
  limit: 10
});

// Approve request
await approveRequest(requestId, 'Dr. Sarah Johnson');

// Reject request
await rejectRequest(requestId, 'Insufficient experience', 'Dr. Sarah Johnson');
```

---

## Rate Limiting

- **General endpoints**: 100 requests per minute per user
- **Search endpoints**: 50 requests per minute per user
- **Status update endpoints**: 20 requests per minute per admin

---

## Notes

1. All dates are in ISO 8601 format (UTC)
2. Referral codes are automatically generated with format: `GRAD-{NAME}-{TIMESTAMP}`
3. Pagination starts from page 1
4. Search is case-insensitive and searches across multiple fields
5. Soft deletion is used for cancelled requests (status changed to 'cancelled')
6. Notifications are generated automatically for status changes