/**
 * Partnership API Integration Service
 * 
 * Follows the same pattern as meetingService.ts for consistency
 * with JWT authentication and proper error handling
 */

import { useState, useCallback } from 'react';
import { 
  PartnershipRequest, 
  PartnershipData, 
  PartnershipStatistics
} from '../types/partnership';

// API Configuration - matches meeting service
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export interface PartnershipQueryParams {
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
  search?: string;
  limit?: number;
  offset?: number;
}

export interface PartnershipResponse {
  success: boolean;
  data: PartnershipRequest[];
  pagination?: {
    limit: number;
    offset: number;
    total: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

export interface CreatePartnershipData {
  userName: string;
  userEmail: string;
  userAvatar?: string;
  school: string;
  year: string;
  course: string;
  motivation: string;
  experience?: string;
  socialMedia?: string;
  userId: string;
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

class PartnershipService {
  private async getAuthHeaders(): Promise<HeadersInit> {
    // Get JWT token from localStorage - same as meeting service
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
      // Handle different error status codes - same pattern as meeting service
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
        throw new Error('Partnership request not found');
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
   * Submit partnership application
   * POST /api/partnership-requests/
   */
  async submitPartnershipRequest(applicationData: CreatePartnershipData): Promise<{ 
    success: boolean; 
    request: PartnershipRequest;
    partnershipData: PartnershipData;
  }> {
    console.log('Creating partnership request with data:', applicationData);
    try {
      const response = await this.makeRequest<{ 
        success: boolean; 
        request: PartnershipRequest;
        partnershipData: PartnershipData;
      }>('/partnership-requests', {
        method: 'POST',
        body: JSON.stringify(applicationData),
      });
      return response;
    } catch (error) {
      console.error('Error creating partnership request:', error);
      throw error;
    }
  }

  /**
   * Get user's partnership requests
   * GET /api/partnership-requests/user/{userId}
   */
  async getUserPartnershipRequests(userId: string): Promise<{
    requests?: PartnershipRequest[];
    data?: any[]; // Backend actually returns 'data' field
    partnershipData?: PartnershipData;
    statistics?: {
      total: number;
      pending: number;
      approved: number;
      rejected: number;
      cancelled: number;
    };
    success?: boolean;
    total?: number;
  }> {
    try {
      const response = await this.makeRequest<any>(`/partnership-requests/user/${userId}`);
      console.log('Fetched partnership requests for user:', userId, response);
      return response;
      
    } catch (error) {
      console.error(`Error fetching partnership requests for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * List all partnership requests with filtering (admin)
   * GET /api/partnership-requests/
   */
  async getPartnershipRequests(params: PartnershipQueryParams = {}): Promise<PartnershipResponse> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const endpoint = `/partnership-requests${queryString ? `?${queryString}` : ''}`;

    try {
      const response = await this.makeRequest<PartnershipResponse>(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching partnership requests:', error);
      throw error;
    }
  }

  /**
   * Get specific partnership request by ID
   * GET /api/partnership-requests/{requestId}/
   */
  async getPartnershipRequestById(requestId: number): Promise<{
    success: boolean;
    data: PartnershipRequest;
  }> {
    try {
      const response = await this.makeRequest<{
        success: boolean;
        data: PartnershipRequest;
      }>(`/partnership-requests/${requestId}/`);
      return response;
    } catch (error) {
      console.error(`Error fetching partnership request ${requestId}:`, error);
      throw error;
    }
  }

  /**
   * Update partnership request status (admin)
   * PUT /api/partnership-requests/{requestId}/status/
   */
  async updatePartnershipRequestStatus(
    requestId: number,
    status: 'approved' | 'rejected' | 'cancelled',
    reviewedBy?: string,
    reason?: string
  ): Promise<{
    success: boolean;
    data: PartnershipRequest;
  }> {
    try {
      const response = await this.makeRequest<{
        success: boolean;
        data: PartnershipRequest;
      }>(`/partnership-requests/${requestId}/status`, {
        method: 'PUT',
        body: JSON.stringify({
          status,
          reviewedBy,
          reason
        }),
      });
      return response;
    } catch (error) {
      console.error(`Error updating partnership request status ${requestId}:`, error);
      throw error;
    }
  }

  /**
   * Cancel partnership request
   * DELETE /api/partnership-requests/{requestId}/
   */
  async cancelPartnershipRequest(requestId: number): Promise<{
    success: boolean;
  }> {
    try {
      const response = await this.makeRequest<{
        success: boolean;
      }>(`/partnership-requests/${requestId}/`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      console.error(`Error canceling partnership request ${requestId}:`, error);
      throw error;
    }
  }

  // Utility Methods

  /**
   * Get partnership statistics for dashboard
   */
  async getPartnershipStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  }> {
    try {
      const response = await this.getPartnershipRequests({ limit: 1000 });
      const requests = response.data;

      const stats = {
        total: requests.length,
        pending: requests.filter(r => r.status === 'pending').length,
        approved: requests.filter(r => r.status === 'approved').length,
        rejected: requests.filter(r => r.status === 'rejected').length,
      };

      return stats;
    } catch (error) {
      console.error('Error fetching partnership stats:', error);
      return { total: 0, pending: 0, approved: 0, rejected: 0 };
    }
  }
}

// Export a singleton instance - same pattern as meeting service
export const partnershipService = new PartnershipService();

/**
 * React Hook for Partnership API Integration
 */
interface UsePartnershipApiReturn {
  // State
  loading: boolean;
  error: string | null;
  requests: PartnershipRequest[];
  statistics: PartnershipStatistics | null;
  
  // Actions
  submitRequest: (data: CreatePartnershipData) => Promise<void>;
  loadRequests: (params?: PartnershipQueryParams) => Promise<void>;
  approveRequest: (id: number, reviewedBy?: string) => Promise<void>;
  rejectRequest: (id: number, reason: string, reviewedBy?: string) => Promise<void>;
  cancelRequest: (id: number) => Promise<void>;
  clearError: () => void;
  refresh: () => Promise<void>;
}

export const usePartnershipApi = (): UsePartnershipApiReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<PartnershipRequest[]>([]);
  const [statistics] = useState<PartnershipStatistics | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const submitRequest = useCallback(async (data: CreatePartnershipData) => {
    setLoading(true);
    setError(null);
    
    try {
      await partnershipService.submitPartnershipRequest(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit partnership request';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRequests = useCallback(async (params?: PartnershipQueryParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await partnershipService.getPartnershipRequests(params);
      setRequests(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load partnership requests';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const approveRequest = useCallback(async (id: number, reviewedBy?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await partnershipService.updatePartnershipRequestStatus(id, 'approved', reviewedBy);
      // Refresh requests after approval
      await loadRequests();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve partnership request';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadRequests]);

  const rejectRequest = useCallback(async (id: number, reason: string, reviewedBy?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await partnershipService.updatePartnershipRequestStatus(id, 'rejected', reviewedBy, reason);
      // Refresh requests after rejection
      await loadRequests();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reject partnership request';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadRequests]);

  const cancelRequest = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      await partnershipService.cancelPartnershipRequest(id);
      // Refresh requests after cancellation
      await loadRequests();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel partnership request';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadRequests]);

  const refresh = useCallback(async () => {
    await loadRequests();
  }, [loadRequests]);

  return {
    loading,
    error,
    requests,
    statistics,
    submitRequest,
    loadRequests,
    approveRequest,
    rejectRequest,
    cancelRequest,
    clearError,
    refresh
  };
};

// Helper function to get partnership status color
export function getPartnershipStatusColor(status: PartnershipRequest['status']): string {
  switch (status) {
    case 'approved': return 'text-green-700 bg-green-100';
    case 'pending': return 'text-orange-700 bg-orange-100';
    case 'rejected': return 'text-red-700 bg-red-100';
    default: return 'text-gray-700 bg-gray-100';
  }
}

// Maintain backward compatibility with the old API
export class PartnershipApiService {
  async submitPartnershipRequest(applicationData: CreatePartnershipData) {
    return partnershipService.submitPartnershipRequest(applicationData);
  }

  async getUserPartnershipRequests(userId: string) {
    return partnershipService.getUserPartnershipRequests(userId);
  }

  async getPartnershipRequests(params?: PartnershipQueryParams) {
    return partnershipService.getPartnershipRequests(params);
  }

  async getPartnershipRequestById(requestId: number) {
    return partnershipService.getPartnershipRequestById(requestId);
  }

  async updatePartnershipRequestStatus(
    requestId: number,
    status: 'approved' | 'rejected' | 'cancelled',
    reviewedBy?: string,
    reason?: string
  ) {
    return partnershipService.updatePartnershipRequestStatus(requestId, status, reviewedBy, reason);
  }

  async cancelPartnershipRequest(requestId: number) {
    return partnershipService.cancelPartnershipRequest(requestId);
  }
}