// Meeting API Service
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export interface Meeting {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number; // in minutes
  type: 'virtual' | 'in-person';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'declined';
  student: string | { 
    id: string; 
    name?: string; 
    first_name?: string; 
    last_name?: string; 
    username?: string; 
    email?: string 
  }; // Handle both string and object formats from backend
  studentId: string;
  adminId?: string;
  admin?: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  location?: string;
  meetingLink?: string;
  notes?: string;
  cancelReason?: string;
  requestedBy?: string;
  studentAvatar?: string | null;
  createdAt: string | undefined;
  updatedAt?: string;
  created_at?: string; // Backend uses snake_case
}

export interface MeetingQueryParams {
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'declined';
  type?: 'virtual' | 'in-person';
  search?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

export interface AdminMeetingQueryParams extends MeetingQueryParams {
  user_id?: string; // Backend expects user_id for filtering by student
  admin_id?: string;
  include_cancelled?: boolean;
}

export interface MeetingsResponse {
  success: boolean;
  data: Meeting[];
  pagination?: {
    limit: number;
    offset: number;
    total: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

export interface CreateMeetingData {
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number;
  type: 'virtual' | 'in-person';
  user_id?: string; // Backend expects user_id
  studentId?: string; // Backend also expects studentId
  taskId?: string; // For admin creating meetings related to a task
  location?: string;
  meetingLink?: string;
}

export interface UpdateMeetingData {
  title?: string;
  description?: string;
  date?: string;
  time?: string;
  duration?: number;
  type?: 'virtual' | 'in-person';
  location?: string;
  meetingLink?: string;
  notes?: string;
}

export interface UpdateMeetingStatusData {
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'declined';
  reason?: string;
  notes?: string;
  meetingLink?: string; // For confirming virtual meetings
  location?: string; // For confirming in-person meetings
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

class MeetingService {
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
        localStorage.removeItem('gradhelper_token');
        window.location.href = '/auth';
        throw new Error('Authentication required');
      }
      
      if (response.status === 403) {
        throw new Error('Access forbidden');
      }
      
      if (response.status === 404) {
        throw new Error('Meeting not found');
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

  // Student Endpoints

  /**
   * List user's meetings with full filtering
   * GET /api/meetings/
   */
  async getMeetings(params: MeetingQueryParams = {}): Promise<MeetingsResponse> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const endpoint = `/meetings/${queryString ? `?${queryString}` : ''}`;

    try {
      const response = await this.makeRequest<MeetingsResponse>(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching meetings:', error);
      throw error;
    }
  }

  /**
   * Schedule new meetings
   * POST /api/meetings/
   */
  async createMeeting(meetingData: CreateMeetingData): Promise<{ success: boolean; data: Meeting }> {
    console.log('Creating meeting with data:', meetingData);
    try {
      const response = await this.makeRequest<{ success: boolean; data: Meeting }>('/meetings/', {
        method: 'POST',
        body: JSON.stringify(meetingData),
      });
      return response;
    } catch (error) {
      console.error('Error creating meeting:', error);
      throw error;
    }
  }

  /**
   * Get specific meeting details
   * GET /api/meetings/{meetingId}/
   */
  async getMeetingById(meetingId: string): Promise<{ success: boolean; data: Meeting }> {
    try {
      const response = await this.makeRequest<{ success: boolean; data: Meeting }>(`/meetings/${meetingId}/`);
      return response;
    } catch (error) {
      console.error(`Error fetching meeting ${meetingId}:`, error);
      throw error;
    }
  }

  /**
   * Update meeting details
   * PUT /api/meetings/{meetingId}/
   */
  async updateMeeting(meetingId: string, updates: UpdateMeetingData): Promise<{ success: boolean; data: Meeting }> {
    try {
      const response = await this.makeRequest<{ success: boolean; data: Meeting }>(`/meetings/${meetingId}/`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return response;
    } catch (error) {
      console.error(`Error updating meeting ${meetingId}:`, error);
      throw error;
    }
  }

  /**
   * Update meeting status (limited for students)
   * PUT /api/meetings/{meetingId}/status/
   */
  async updateMeetingStatus(
    meetingId: string, 
    statusData: UpdateMeetingStatusData
  ): Promise<{ success: boolean; data: Meeting }> {
    try {
      const response = await this.makeRequest<{ success: boolean; data: Meeting }>(`/meetings/${meetingId}/status/`, {
        method: 'PUT',
        body: JSON.stringify(statusData),
      });
      return response;
    } catch (error) {
      console.error(`Error updating meeting status ${meetingId}:`, error);
      throw error;
    }
  }

  /**
   * Cancel meetings with reason
   * DELETE /api/meetings/{meetingId}/
   */
  async deleteMeeting(meetingId: string, reason?: string): Promise<{ success: boolean }> {
    try {
      const response = await this.makeRequest<{ success: boolean }>(`/meetings/${meetingId}/`, {
        method: 'DELETE',
        body: JSON.stringify({ reason }),
      });
      return response;
    } catch (error) {
      console.error(`Error deleting meeting ${meetingId}:`, error);
      throw error;
    }
  }

  // Admin Endpoints

  /**
   * List ALL meetings with advanced filtering
   * GET /api/admin/meetings/
   */
  async getAdminMeetings(params: AdminMeetingQueryParams = {}): Promise<MeetingsResponse> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const endpoint = `/admin/meetings/${queryString ? `?${queryString}` : ''}`;

    try {
      const response = await this.makeRequest<MeetingsResponse>(endpoint);
      console.log('Fetched admin meetings:', response);
      return response;
    } catch (error) {
      console.error('Error fetching admin meetings:', error);
      throw error;
    }
  }

  /**
   * Admin: Schedule meetings for any student
   * POST /api/meetings/ (with admin privileges)
   */
  async createAdminMeeting(meetingData: CreateMeetingData): Promise<{ success: boolean; data: Meeting }> {
    // Same endpoint as student but with admin token allowing studentId specification
    return this.createMeeting(meetingData);
  }

  /**
   * Admin: Access ANY meeting
   * GET /api/meetings/{meetingId}/ (with admin privileges)
   */
  async getAdminMeetingById(meetingId: string): Promise<{ success: boolean; data: Meeting }> {
    // Same endpoint as student but with admin token allowing access to any meeting
    return this.getMeetingById(meetingId);
  }

  /**
   * Admin: Update ANY meeting
   * PUT /api/meetings/{meetingId}/ (with admin privileges)
   */
  async updateAdminMeeting(meetingId: string, updates: UpdateMeetingData): Promise<{ success: boolean; data: Meeting }> {
    // Same endpoint as student but with admin token allowing updates to any meeting
    return this.updateMeeting(meetingId, updates);
  }

  /**
   * Admin: Full status control
   * PUT /api/meetings/{meetingId}/status/ (with admin privileges)
   */
  async updateAdminMeetingStatus(
    meetingId: string, 
    statusData: UpdateMeetingStatusData
  ): Promise<{ success: boolean; data: Meeting }> {
    // Same endpoint as student but with admin token allowing full status control
    return this.updateMeetingStatus(meetingId, statusData);
  }

  /**
   * Admin: Cancel ANY meeting
   * DELETE /api/meetings/{meetingId}/ (with admin privileges)
   */
  async deleteAdminMeeting(meetingId: string, reason?: string): Promise<{ success: boolean }> {
    // Same endpoint as student but with admin token allowing deletion of any meeting
    return this.deleteMeeting(meetingId, reason);
  }

  // Utility Methods

  /**
   * Get meeting statistics for dashboard
   */
  async getMeetingStats(): Promise<{
    total: number;
    upcoming: number;
    pending: number;
    completed: number;
  }> {
    try {
      // This might be a separate endpoint or computed from getMeetings without pagination
      const response = await this.getMeetings({ limit: 1000 }); // Get all meetings for stats
      const meetings = response.data;

      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      const stats = {
        total: meetings.length,
        // Upcoming: only confirmed meetings for today and future dates
        upcoming: meetings.filter(m => 
          m.status === 'confirmed' && 
          m.date >= today
        ).length,
        // Pending: all pending meetings regardless of date
        pending: meetings.filter(m => m.status === 'pending').length,
        // Past: completed, declined, cancelled, and past confirmed meetings
        completed: meetings.filter(m => 
          m.status === 'completed' || 
          m.status === 'declined' || 
          m.status === 'cancelled' || 
          (m.date < today && m.status === 'confirmed')
        ).length,
      };

      return stats;
    } catch (error) {
      console.error('Error fetching meeting stats check your connection:', error);
      // Return default stats if API fails
      return { total: 0, upcoming: 0, pending: 0, completed: 0 };
    }
  }

  /**
   * Get admin meeting statistics
   */
  async getAdminMeetingStats(): Promise<{
    total: number;
    upcoming: number;
    pending: number;
    completed: number;
  }> {
    try {
      const response = await this.getAdminMeetings({ limit: 1000 }); // Get all meetings for stats
      const meetings = response.data;

      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      // Debug: Log date calculations
      console.log('Meeting Stats Debug:', {
        today,
        totalMeetings: meetings.length,
        meetingDates: meetings.map(m => ({ id: m.id, date: m.date, status: m.status, title: m.title }))
      });
      
      const upcomingMeetings = meetings.filter(m => 
        m.status === 'confirmed' && 
        m.date >= today
      );
      
      const pastMeetings = meetings.filter(m => 
        m.status === 'completed' || 
        m.status === 'declined' || 
        m.status === 'cancelled' || 
        (m.date < today && m.status === 'confirmed')
      );
      
      console.log('📊 Upcoming meetings:', upcomingMeetings.map(m => ({ id: m.id, date: m.date, status: m.status })));
      console.log('📊 Past meetings:', pastMeetings.map(m => ({ id: m.id, date: m.date, status: m.status })));
      
      const stats = {
        total: meetings.length,
        // Upcoming: only confirmed meetings for today and future dates
        upcoming: upcomingMeetings.length,
        // Pending: all pending meetings regardless of date
        pending: meetings.filter(m => m.status === 'pending').length,
        // Past: completed, declined, cancelled, and past confirmed meetings
        completed: pastMeetings.length,
      };

      return stats;
    } catch (error) {
      console.error('Error fetching admin meeting stats:', error);
      return { total: 0, upcoming: 0, pending: 0, completed: 0 };
    }
  }
}

// Export a singleton instance
export const meetingService = new MeetingService();

// Helper function to format meeting date/time
export function formatMeetingDateTime(date: string, time: string): string {
  try {
    const meetingDate = new Date(`${date} ${time}`);
    return meetingDate.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    return `${date} at ${time}`;
  }
}

// Helper function to check if meeting is upcoming
export function isMeetingUpcoming(date: string, time: string): boolean {
  try {
    const meetingDateTime = new Date(`${date} ${time}`);
    return meetingDateTime > new Date();
  } catch (error) {
    return false;
  }
}

// Helper function to get meeting status color
export function getMeetingStatusColor(status: Meeting['status']): string {
  switch (status) {
    case 'confirmed': return 'text-green-700 bg-green-100';
    case 'pending': return 'text-orange-700 bg-orange-100';
    case 'completed': return 'text-blue-700 bg-blue-100';
    case 'cancelled': return 'text-red-700 bg-red-100';
    case 'declined': return 'text-red-700 bg-red-100';
    default: return 'text-gray-700 bg-gray-100';
  }
}

// Helper function to build meeting query parameters
export function buildMeetingQuery(
  searchTerm: string = '',
  statusFilter: string = 'all',
  typeFilter: string = 'all',
  dateFrom?: string,
  dateTo?: string
): MeetingQueryParams {
  const params: MeetingQueryParams = {};

  if (searchTerm.trim()) {
    params.search = searchTerm.trim();
  }

  if (statusFilter !== 'all') {
    params.status = statusFilter as MeetingQueryParams['status'];
  }

  if (typeFilter !== 'all') {
    params.type = typeFilter as MeetingQueryParams['type'];
  }

  if (dateFrom) {
    params.date_from = dateFrom;
  }

  if (dateTo) {
    params.date_to = dateTo;
  }

  return params;
}