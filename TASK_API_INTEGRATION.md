# Task API Integration Documentation

This document explains how to use the new task API integration in the TheGradHelper application.

## Overview

The task management system now fetches data from a backend API instead of using mock data. The integration includes:

- Task service for API communication
- Custom React hooks for state management
- Error handling and loading states
- Real-time updates and pagination

## Files Added/Modified

### New Files:
- `src/services/taskService.ts` - API service for task operations
- `src/hooks/useTasks.ts` - Custom React hook for task management
- `.env.example` - Environment configuration template

### Modified Files:
- `src/components/TaskManagement.tsx` - Updated to use API
- `src/components/TaskDetailModal.tsx` - Updated Task interface
- `src/components/TaskRejectModal.tsx` - Updated Task interface
- `.env` - Added API configuration

## API Endpoints Used

The implementation uses the following endpoints from the API specification:

### GET /tasks
**Purpose**: Fetch user's tasks (filtered by role)
**Query Parameters**:
- `page`: int - Page number for pagination
- `limit`: int - Number of tasks per page
- `status`: string - Filter by task status
- `search`: string - Search term for tasks
- `sortBy`: string - Sort field (created_at, due_date, title)
- `sortOrder`: string - Sort order (asc, desc)

### Other Endpoints:
- `POST /tasks` - Create new task
- `PUT /tasks/{taskId}` - Update task
- `DELETE /tasks/{taskId}` - Delete task
- `PUT /tasks/{taskId}/status` - Update task status

## Usage Examples

### Basic Task Fetching

```typescript
import { useTasks } from '../hooks/useTasks';

function TaskComponent() {
  const {
    tasks,
    loading,
    error,
    fetchTasks,
    refreshTasks
  } = useTasks({
    searchTerm: '',
    statusFilter: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {tasks.map(task => (
        <div key={task.id}>{task.title}</div>
      ))}
    </div>
  );
}
```

### Task Operations

```typescript
const { updateTaskStatus, deleteTask, createTask } = useTasks();

// Update task status
await updateTaskStatus('task-id', 'completed', 'Task completed successfully');

// Delete a task
await deleteTask('task-id', 'No longer needed');

// Create new task
await createTask({
  title: 'New Research Paper',
  description: 'Comprehensive research on AI',
  subject: 'Computer Science',
  dueDate: '2025-03-01',
  budget: 500
});
```

### Search and Filtering

```typescript
const [searchTerm, setSearchTerm] = useState('');
const [statusFilter, setStatusFilter] = useState('all');

const { tasks, loading } = useTasks({
  searchTerm,
  statusFilter,
  sortBy: 'due_date',
  sortOrder: 'asc'
});

// Search will automatically trigger when searchTerm changes
```

## Configuration

### Environment Variables

Add the following to your `.env` file:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:3001/api/v1
```

### Authentication

The task service automatically includes JWT tokens from localStorage:

```typescript
// Token is automatically retrieved from localStorage
const token = localStorage.getItem('authToken');
```

## Error Handling

The system includes comprehensive error handling:

### API Errors
- 401 Unauthorized - Redirects to login
- 403 Forbidden - Shows access denied message
- 404 Not Found - Shows resource not found
- 500 Server Error - Shows generic server error

### User Feedback
- Loading states with spinners
- Error messages with retry options
- Success notifications for operations
- Empty states when no data is available

## Data Transformation

The API data is automatically transformed to match the frontend interface:

```typescript
// Backend data structure
{
  id: "123",
  title: "Task Title",
  deadline: "2025-02-15T00:00:00Z",
  student: {
    id: "user_456",
    name: "John Doe",
    email: "john@example.com"
  }
}

// Frontend data structure
{
  id: "123",
  title: "Task Title",
  dueDate: "2025-02-15T00:00:00Z",
  student: {
    id: "user_456",
    name: "John Doe",
    email: "john@example.com"
  }
}
```

## Loading States

The component shows different states based on data availability:

1. **Loading State**: Shows spinner while fetching data
2. **Error State**: Shows error message with retry button
3. **Empty State**: Shows message when no tasks are found
4. **Data State**: Shows tasks with full functionality

## Pagination

When the API returns pagination data, the component shows:
- Current page information
- Total count of tasks
- Previous/Next navigation buttons
- Page numbers

## Real-time Updates

The hook provides methods for real-time updates:

- `refreshTasks()` - Manually refresh task list
- Auto-refresh after create/update/delete operations
- Optimistic updates for better user experience

## Best Practices

1. **Error Handling**: Always handle loading and error states
2. **User Feedback**: Show appropriate messages for all operations
3. **Performance**: Use debouncing for search inputs
4. **Accessibility**: Include proper ARIA labels and keyboard navigation
5. **Security**: Never expose sensitive data in client-side code

## Testing

To test the API integration:

1. Ensure backend server is running on `http://localhost:3001`
2. Verify API endpoints match the specification
3. Test with valid JWT tokens
4. Check error scenarios (network failures, invalid data)
5. Verify pagination and search functionality

## Migration from Mock Data

The migration process involved:

1. Replacing local state with API calls
2. Adding loading and error states
3. Implementing proper type interfaces
4. Adding authentication headers
5. Transforming data between backend and frontend formats

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Ensure backend allows requests from frontend origin
2. **Authentication Failures**: Check JWT token validity and format
3. **Network Errors**: Verify backend server is running and accessible
4. **Type Errors**: Ensure data transformation matches expected interfaces

### Debug Tips:

1. Check browser network tab for API requests
2. Verify environment variables are loaded correctly
3. Test API endpoints with tools like Postman
4. Check console for error messages and stack traces

## Future Enhancements

Potential improvements to consider:

1. **Caching**: Implement client-side caching for better performance
2. **Offline Support**: Add offline functionality with service workers
3. **Real-time Updates**: WebSocket integration for live updates
4. **Advanced Filtering**: More sophisticated search and filter options
5. **Bulk Operations**: Support for batch operations on multiple tasks