// Task API Service
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export interface TaskQueryParams {
  status?: 'pending' | 'in_progress' | 'completed' | 'revision_needed' | 'rejected';
  search?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  subject: string;
  status: 'pending' | 'in_progress' | 'completed' | 'revision_needed' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  budget: number;
  student: {
    id: string;
    name: string;
    email: string;
  };
  assignedAdmin?: {
    id: string;
    name: string;
  };
  deliverables: Deliverable[];
  attachments: Attachment[];
  type?: string;
  academicLevel?: string;
  pages?: number;
  requirements?: string;
  citations?: string;
}

export interface DeliverableFile {
  id: string;
  name: string;
  url?: string;
  size: number;
  type: string;
  mimeType?: string;
  uploadedAt?: string;
}

export interface Deliverable {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'revision_needed' | 'under_review' | 'needs_revision';
  files: DeliverableFile[];
  feedback?: string;
  submittedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  taskId?: string;
  taskTitle?: string;
  student?: {
    id: string;
    name: string;
  };
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface TasksResponse {
  success: boolean;
  data: Task[];
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  requestId: string;
}

class TaskService {
  private async getAuthHeaders(): Promise<HeadersInit> {
    // Get JWT token from localStorage or auth context
    const token = localStorage.getItem('gradhelper_token');
    
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      // Handle different error status codes
      if (response.status === 401) {
        // Unauthorized - redirect to login
        localStorage.removeItem('authToken');
        window.location.href = '/auth';
        throw new Error('Authentication required');
      }
      
      if (response.status === 403) {
        throw new Error('Access forbidden');
      }
      
      if (response.status === 404) {
        throw new Error('Resource not found');
      }
      
      if (response.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }
      
      // Try to parse error response
      try {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.error.message || 'API request failed');
      } catch {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    }

    return response.json();
  }

  /**
   * Fetch tasks from the backend
   * GET /tasks
   */
  async getTasks(params: TaskQueryParams = {}): Promise<TasksResponse> {
    // Build query string
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const endpoint = `/tasks${queryString ? `?${queryString}` : ''}`;

    try {
      const response = await this.makeRequest<TasksResponse>(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  /**
   * Get a specific task by ID
   * GET /tasks/{taskId}
   */
  async getTaskById(taskId: string): Promise<{ success: boolean; data: Task }> {
    try {
      const response = await this.makeRequest<{ success: boolean; data: Task }>(`/tasks/${taskId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching task ${taskId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new task
   * POST /tasks
   */
  async createTask(taskData: Partial<Task>): Promise<{ success: boolean; data: Task }> {
    try {
      const response = await this.makeRequest<{ success: boolean; data: Task }>('/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });
      return response;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  /**
   * Update a task
   * PUT /tasks/{taskId}
   */
  async updateTask(taskId: string, updates: Partial<Task>): Promise<{ success: boolean; data: Task }> {
    console.log('Updating task with data:', updates);
    try {
      const response = await this.makeRequest<{ success: boolean; data: Task }>(`/tasks/${taskId}/`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return response;
    } catch (error) {
      console.error(`Error updating task ${taskId}:`, error);
      throw error;
    }
  }

  /**
   * Update task status (Admin only)
   * PUT /tasks/{taskId}/status
   */
  async updateTaskStatus(
    taskId: string, 
    status: Task['status'], 
    reason?: string, 
    feedback?: string
  ): Promise<{ success: boolean; data: Task }> {
    try {
      const response = await this.makeRequest<{ success: boolean; data: Task }>(`/tasks/${taskId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, reason, feedback }),
      });
      return response;
    } catch (error) {
      console.error(`Error updating task status ${taskId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a task
   * DELETE /tasks/{taskId}
   */
  async deleteTask(taskId: string, reason?: string): Promise<{ success: boolean }> {
    try {
      const response = await this.makeRequest<{ success: boolean }>(`/tasks/${taskId}/`, {
        method: 'DELETE',
        body: JSON.stringify({ reason }),
      });
      return response;
    } catch (error) {
      console.error(`Error deleting task ${taskId}:`, error);
      throw error;
    }
  }

  /**
   * Assign task to admin (Admin only)
   * POST /tasks/{taskId}/assign
   */
  async assignTask(taskId: string, adminId: string): Promise<{ success: boolean; data: Task }> {
    try {
      const response = await this.makeRequest<{ success: boolean; data: Task }>(`/tasks/${taskId}/assign`, {
        method: 'POST',
        body: JSON.stringify({ adminId }),
      });
      return response;
    } catch (error) {
      console.error(`Error assigning task ${taskId}:`, error);
      throw error;
    }
  }

  /**
   * Get deliverables for a task
   * GET /tasks/{taskId}/deliverables
   */
  async getTaskDeliverables(taskId: string): Promise<{ success: boolean; data: Deliverable[] }> {
    try {
      const response = await this.makeRequest<{ success: boolean; data: Deliverable[] }>(`/tasks/${taskId}/deliverables`);
      return response;
    } catch (error) {
      console.error(`Error fetching deliverables for task ${taskId}:`, error);
      throw error;
    }
  }

  /**
   * Get all deliverables for the current user
   * GET /deliverables (or /users/me/deliverables)
   */
  async getUserDeliverables(): Promise<{ success: boolean; data: Deliverable[] }> {
    try {
      // Assuming the backend has an endpoint to get deliverables for the authenticated user
      const response = await this.makeRequest<{ success: boolean; data: Deliverable[] }>(`/deliverables`);
      return response;
    } catch (error) {
      console.error('Error fetching user deliverables:', error);
      throw error;
    }
  }

  /**
   * Add deliverable to a task
   * POST /tasks/{taskId}/deliverables
   */
  async addDeliverable(taskId: string, deliverableData: {
    title: string;
    description: string;
    dueDate: string;
    priority?: string;
    estimatedHours?: string;
    requirements?: string;
    files?: File[];
  }): Promise<{ success: boolean; data: Deliverable }> {
    try {
      // Use FormData if files are present, JSON otherwise
      if (deliverableData.files && deliverableData.files.length > 0) {
        const formData = new FormData();
        
        // Add basic fields
        formData.append('title', deliverableData.title);
        formData.append('description', deliverableData.description);
        formData.append('dueDate', deliverableData.dueDate);
        
        if (deliverableData.priority) formData.append('priority', deliverableData.priority);
        if (deliverableData.estimatedHours) formData.append('estimatedHours', deliverableData.estimatedHours);
        if (deliverableData.requirements) formData.append('requirements', deliverableData.requirements);
        
        // Add files
        deliverableData.files.forEach((file) => {
          formData.append('files', file);
        });

        const headers = await this.getAuthHeaders();
        // Remove Content-Type for FormData - browser sets it with boundary
        const { 'Content-Type': _, ...headersWithoutContentType } = headers as any;

        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/deliverables`, {
          method: 'POST',
          headers: headersWithoutContentType,
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
      } else {
        // No files, use JSON
        const response = await this.makeRequest<{ success: boolean; data: Deliverable }>(`/tasks/${taskId}/deliverables`, {
          method: 'POST',
          body: JSON.stringify({
            title: deliverableData.title,
            description: deliverableData.description,
            dueDate: deliverableData.dueDate,
            priority: deliverableData.priority || 'medium',
            estimatedHours: deliverableData.estimatedHours ? parseInt(deliverableData.estimatedHours) : null,
            requirements: deliverableData.requirements,
          }),
        });
        return response;
      }
    } catch (error) {
      console.error(`Error adding deliverable to task ${taskId}:`, error);
      throw error;
    }
  }
}

// Export a singleton instance
export const taskService = new TaskService();

// Helper function to parse deliverables from JSON string or array
function parseDeliverables(deliverables: any): Deliverable[] {
  if (!deliverables) {
    return [];
  }

  // Helper to convert file URLs to file objects
  const parseFiles = (files: any): DeliverableFile[] => {
    if (!Array.isArray(files)) {
      console.log('parseFiles: files is not an array:', files);
      return [];
    }
    
    console.log('parseFiles: processing files array:', files);
    
    return files.map((file, index) => {
      if (typeof file === 'string') {
        // If file is a URL string, create a file object
        const fileName = file.split('/').pop() || `file_${index}`;
        return {
          id: `file_${index}`,
          name: fileName,
          url: file,
          size: 0, // Size unknown for URL strings
          type: fileName.split('.').pop()?.toLowerCase() || 'unknown',
          mimeType: undefined
        };
      } else if (file && typeof file === 'object') {
        // If file is already an object, ensure it has required properties
        return {
          id: file.id || `file_${index}`,
          name: file.name || file.filename || `file_${index}`,
          url: file.url,
          size: file.size || 0,
          type: file.type || 'unknown',
          mimeType: file.mimeType
        };
      }
      return {
        id: `file_${index}`,
        name: `file_${index}`,
        url: '',
        size: 0,
        type: 'unknown'
      };
    });
  };

  // If it's already an array, return it (direct from API)
  if (Array.isArray(deliverables)) {
    return deliverables.map(deliverable => ({
      ...deliverable,
      files: parseFiles(deliverable.files)
    }));
  }

  // If it's a string, try to parse it as JSON (from database or FormData)
  if (typeof deliverables === 'string') {
    try {
      const parsed = JSON.parse(deliverables);
      if (Array.isArray(parsed)) {
        return parsed.map(deliverable => ({
          ...deliverable,
          files: parseFiles(deliverable.files)
        }));
      }
      return [];
    } catch (error) {
      console.warn('Failed to parse deliverables JSON:', error);
      return [];
    }
  }

  // If it's an object, wrap it in an array
  if (typeof deliverables === 'object') {
    return [{
      ...deliverables,
      files: parseFiles(deliverables.files)
    }];
  }

  return [];
}

// Helper function to transform backend task data to frontend format
export function transformTaskData(backendTask: any): Task {
  const parsedDeliverables = parseDeliverables(backendTask.deliverables);
  
  console.log('Task data transformation:');
  console.log('- Task attachments:', backendTask.attachments);
  console.log('- Raw deliverables:', backendTask.deliverables);
  console.log('- Parsed deliverables:', parsedDeliverables);

  return {
    id: backendTask.id,
    title: backendTask.title,
    description: backendTask.description,
    subject: backendTask.subject || 'General',
    status: backendTask.status,
    priority: backendTask.priority || 'medium',
    dueDate: backendTask.deadline || backendTask.dueDate,
    createdAt: backendTask.createdAt,
    updatedAt: backendTask.updatedAt,
    budget: backendTask.budget || 0,
    student: {
      id: backendTask.student?.id || backendTask.studentId,
      name: backendTask.student?.name || 'Unknown Student',
      email: backendTask.student?.email || '',
    },
    assignedAdmin: backendTask.assignedAdmin ? {
      id: backendTask.assignedAdmin.id,
      name: backendTask.assignedAdmin.name,
    } : undefined,
    deliverables: parsedDeliverables,
    attachments: backendTask.attachments || [],
    type: backendTask.type,
    academicLevel: backendTask.academicLevel,
    pages: backendTask.pages,
    requirements: backendTask.requirements,
    citations: backendTask.citations,
  };
}

// Helper function to build task query parameters
export function buildTaskQuery(
  searchTerm: string = '',
  statusFilter: string = 'all'
): TaskQueryParams {
  const params: TaskQueryParams = {};

  if (searchTerm.trim()) {
    params.search = searchTerm.trim();
  }

  if (statusFilter !== 'all') {
    params.status = statusFilter as TaskQueryParams['status'];
  }

  return params;
}