# Student Profile Service Documentation

This documentation explains how to use the profile service to fetch student information from the backend using the `auth/profile` endpoint.

## Overview

The profile service provides a comprehensive solution for managing student profile data from the backend. It includes:

- **ProfileService**: Core service class for API communication
- **useProfile**: React hook for easy profile management in components
- **StudentProfile**: TypeScript interfaces matching backend structure
- **Caching**: Local storage integration with backend sync

## Files Created

1. `src/services/profileService.ts` - Core profile service
2. `src/hooks/useProfile.ts` - React hook for profile management
3. `src/components/ProfileExample.tsx` - Example usage component

## Quick Start

### 1. Using the Profile Hook (Recommended)

```tsx
import { useProfile } from '../hooks/useProfile';

function MyComponent() {
  const { profile, loading, error, refreshProfile, updateProfile } = useProfile();

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!profile) return <div>No profile data</div>;

  return (
    <div>
      <h1>Welcome, {profile.name}!</h1>
      <p>Email: {profile.email}</p>
      <p>University: {profile.profile.university}</p>
      <button onClick={refreshProfile}>Refresh Profile</button>
    </div>
  );
}
```

### 2. Using the Profile Service Directly

```tsx
import { profileService } from '../services/profileService';

// Fetch profile
const profile = await profileService.getStudentProfile();

// Update profile
const updatedProfile = await profileService.updateStudentProfile({
  university: 'New University',
  major: 'Computer Science'
});

// Check authentication
const isAuth = profileService.isAuthenticated();
```

## API Endpoint Structure

The service communicates with the `auth/profile` endpoint expecting this response:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "avatar-url",
      "role": "student",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    },
    "profile": {
      "id": "profile-id",
      "userId": "user-id",
      "isComplete": true,
      "firstName": "John",
      "lastName": "Doe",
      "university": "Example University",
      "major": "Computer Science",
      "yearOfStudy": "Senior",
      "gpa": 3.8,
      // ... other profile fields
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  },
  "message": "Profile retrieved successfully"
}
```

## Profile Data Structure

### StudentProfile Interface

```tsx
interface StudentProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'student' | 'admin';
  profile: {
    isComplete: boolean;
    
    // Personal Information
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    phoneNumber?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    
    // Academic Information
    university?: string;
    major?: string;
    yearOfStudy?: string;
    gpa?: number;
    expectedGraduation?: string;
    academicGoals?: string;
    
    // Preferences
    subjectAreas?: string[];
    availabilityHours?: string;
    communicationPreference?: 'email' | 'sms' | 'both';
    notificationSettings?: {
      taskUpdates?: boolean;
      deadlineReminders?: boolean;
      paymentAlerts?: boolean;
      partnershipRequests?: boolean;
    };
    
    // Additional fields
    [key: string]: any;
  };
}
```

## Features

### 1. Automatic Caching
- Profiles are cached in localStorage
- Automatic sync with backend on app startup
- Fallback to cached data when offline

### 2. Error Handling
- Comprehensive error handling with user-friendly messages
- Toast notifications for success/failure
- Graceful degradation when backend is unavailable

### 3. Loading States
- Loading indicators during API calls
- Optimistic updates for better UX
- Refresh functionality to sync latest data

### 4. Authentication Integration
- Automatic token handling
- Authentication status checking
- Secure API communication

## Integration with App.tsx

The profile service is integrated into the main App component:

1. **App Initialization**: Syncs profile from backend on startup
2. **Authentication Flow**: Fetches fresh profile after login
3. **Profile Completion**: Updates backend when profile is completed
4. **State Management**: Updates React state with fresh profile data

## Example Components

### ProfileExample.tsx
A complete example showing:
- Profile loading states
- Error handling
- Data display
- Refresh functionality
- Development debugging

### Updated ProfileView.tsx
Enhanced with:
- Backend integration via useProfile hook
- Real-time profile sync
- Error states and retry logic
- Loading indicators

## Error Handling Patterns

```tsx
// In components using useProfile
const { profile, loading, error, refreshProfile } = useProfile();

// Loading state
if (loading && !profile) {
  return <LoadingSpinner />;
}

// Error state with retry
if (error && !profile) {
  return (
    <ErrorMessage 
      error={error} 
      onRetry={refreshProfile}
    />
  );
}

// Success state
return <ProfileData profile={profile} />;
```

## Best Practices

1. **Use the Hook**: Prefer `useProfile` hook over direct service calls
2. **Handle Loading**: Always show loading states for better UX
3. **Error Recovery**: Provide retry options for failed requests
4. **Optimistic Updates**: Update UI immediately, sync with backend
5. **Cache Smartly**: Use cached data as fallback, fresh data as primary

## Testing the Implementation

1. Check browser console for profile sync logs
2. Use ProfileExample component to test functionality
3. Test offline/online scenarios
4. Verify localStorage caching
5. Test error handling with network issues

## Dependencies

- `sonner`: Toast notifications
- `lucide-react`: Icons for UI
- React 18: Hooks and components
- TypeScript: Type safety

This profile service provides a robust foundation for managing student profile data with proper error handling, caching, and user experience considerations.