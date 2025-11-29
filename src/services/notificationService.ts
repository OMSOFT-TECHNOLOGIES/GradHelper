import { API_BASE_URL } from '../utils/api';

// Simple API client for notifications
class APIClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get token from localStorage if not set manually
    const authToken = this.token || localStorage.getItem('gradhelper_token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Unauthorized - remove invalid token and redirect to login
        localStorage.removeItem('gradhelper_token');
        window.location.href = '/auth';
        throw new Error('Authentication required');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async get(endpoint: string) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

const apiClient = new APIClient(API_BASE_URL);

export interface NotificationData {
  id: number;
  notification_type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_read: boolean;
  created_at: string;
  action_url?: string;
  action_text?: string;
  metadata?: Record<string, any>;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

export interface NotificationListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: NotificationData[];
}

export interface UnreadCountResponse {
  total_unread: number;
}

export interface ProfileCompletenessResponse {
  profile_complete: boolean;
  missing_fields: string[];
  notification_sent: boolean;
}

export interface CreateNotificationRequest {
  user_id?: number;
  broadcast_to?: string;
  notification_type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  action_url?: string;
  action_text?: string;
  metadata?: Record<string, any>;
}

class NotificationService {
  private baseUrl = '/notifications';
  private wsConnection: WebSocket | null = null;
  private onNotificationCallback?: (notification: NotificationData, unreadCount: number) => void;
  private lastRequestTime = new Map<string, number>();
  private readonly REQUEST_THROTTLE_MS = 200; // Reduced throttle time for better UX
  private requestCache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION_MS = 5000; // Longer cache duration for efficiency
  private pollingInterval: NodeJS.Timeout | null = null;
  private lastUnreadCount = 0;
  private isConnecting = false; // Prevent multiple simultaneous connection attempts

  // Set authentication token
  setAuthToken(token: string) {
    apiClient.setToken(token);
  }

  // Smart throttling with caching to prevent rapid API calls
  private shouldThrottleRequest(endpoint: string): { shouldThrottle: boolean; cachedData?: any } {
    const now = Date.now();
    const lastTime = this.lastRequestTime.get(endpoint) || 0;
    const cached = this.requestCache.get(endpoint);
    
    // If we have fresh cached data, return it instead of making a new request
    if (cached && now - cached.timestamp < this.CACHE_DURATION_MS) {
      console.log(`Using cached data for ${endpoint}`);
      return { shouldThrottle: false, cachedData: cached.data };
    }
    
    // If request is too soon, return cached data if available, otherwise allow the request
    // This prevents throttling legitimate requests during initialization
    if (now - lastTime < this.REQUEST_THROTTLE_MS) {
      if (cached) {
        console.log(`Using stale cached data for recent request to ${endpoint}`);
        return { shouldThrottle: false, cachedData: cached.data };
      } else {
        // Don't throttle if no cached data is available - allow the request
        console.log(`Allowing request to ${endpoint} despite timing (no cached data available)`);
      }
    }
    
    this.lastRequestTime.set(endpoint, now);
    return { shouldThrottle: false };
  }

  // Cache successful responses
  private cacheResponse(endpoint: string, data: any): void {
    this.requestCache.set(endpoint, {
      data: data,
      timestamp: Date.now()
    });
  }

  // Get list of notifications with pagination and filtering
  async getNotifications(params?: {
    page?: number;
    is_read?: boolean;
    notification_type?: string;
    priority?: string;
  }): Promise<NotificationListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const url = searchParams.toString() 
      ? `${this.baseUrl}/?${searchParams.toString()}`
      : `${this.baseUrl}/`;

    // Smart throttling with caching
    const throttleResult = this.shouldThrottleRequest(url);
    if (throttleResult.cachedData) {
      return throttleResult.cachedData;
    }
    if (throttleResult.shouldThrottle) {
      throw new Error('Request throttled - too many requests');
    }

    const response = await apiClient.get(url);
    this.cacheResponse(url, response);
    return response;
  }

  // Get specific notification details
  async getNotificationById(id: number): Promise<NotificationData> {
    return await apiClient.get(`${this.baseUrl}/${id}/`);
  }

  // Get unread notification count
  async getUnreadCount(): Promise<UnreadCountResponse> {
    const endpoint = `${this.baseUrl}/unread-count/`;
    
    // Smart throttling with caching
    const throttleResult = this.shouldThrottleRequest(endpoint);
    if (throttleResult.cachedData) {
      return throttleResult.cachedData;
    }
    if (throttleResult.shouldThrottle) {
      throw new Error('Request throttled - too many requests');
    }
    
    const response = await apiClient.get(endpoint);
    this.cacheResponse(endpoint, response);
    return response;
  }

  // Mark specific notification as read
  async markAsRead(id: number): Promise<void> {
    await apiClient.post(`${this.baseUrl}/${id}/mark-read/`);
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    await apiClient.post(`${this.baseUrl}/mark-all-read/`);
  }

  // Create custom notification (Admin only)
  async createNotification(data: CreateNotificationRequest): Promise<NotificationData> {
    console.log('Creating notification with data:', data);
    
    // Transform data based on notification type
    let requestData: any = { ...data };
    
    // For system announcements, use broadcast_to instead of user_id
    if (data.notification_type === 'system_announcement') {
      if (!data.user_id || data.user_id === undefined) {
        // Remove user_id and add broadcast_to for system announcements
        delete requestData.user_id;
        requestData.broadcast_to = 'all_students';
        console.log('Converted system announcement to broadcast format:', requestData);
      }
    }
    
    return await apiClient.post(`${this.baseUrl}/create/`, requestData);
  }

  // Check profile completeness
  async checkProfileCompleteness(): Promise<ProfileCompletenessResponse> {
    return await apiClient.get(`${this.baseUrl}/check-profile/`);
  }

  // WebSocket connection for real-time notifications
  connectWebSocket(token: string, onNotification?: (notification: NotificationData, unreadCount: number) => void) {
    this.onNotificationCallback = onNotification;

    // Validate token before attempting connection
    if (!token || token.trim() === '') {
      console.error('WebSocket connection failed: No valid token provided');
      console.log('Token value:', token);
      this.startPollingFallback();
      return;
    }

    // Prevent multiple simultaneous connection attempts
    if (this.isConnecting) {
      console.log('WebSocket connection already in progress, skipping duplicate attempt');
      return;
    }

    if (this.wsConnection) {
      this.wsConnection.close(1000, 'Reconnecting');
    }

    this.isConnecting = true;
    
    // Include token in WebSocket URL for Django WebSocket authentication
    const wsUrl = `ws://localhost:8000/ws/notifications/?token=${encodeURIComponent(token)}`;
    console.log('Attempting WebSocket connection to:', wsUrl.replace(token, '***TOKEN***'));

    try {
      this.wsConnection = new WebSocket(wsUrl);

      this.wsConnection.onopen = () => {
        console.log('WebSocket connection established to', wsUrl);
        this.isConnecting = false; // Clear connection flag
        this.stopPollingFallback(); // Stop polling if WebSocket connects successfully
      };

      this.wsConnection.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'notification' && this.onNotificationCallback) {
            console.log('New notification received:', data.notification);
            this.onNotificationCallback(data.notification, data.unread_count);
          }
          
          // Handle authentication confirmation
          if (data.type === 'auth_success') {
            console.log('WebSocket authentication successful');
          }
          
          if (data.type === 'auth_error') {
            console.error('WebSocket authentication failed:', data.message);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.wsConnection.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        
        // Start polling fallback if WebSocket connection is lost
        this.startPollingFallback();
        
        // Don't reconnect on normal closure (1000) or manual disconnect (1000)
        // Also don't reconnect if this was a deliberate close
        if (event.code !== 1000 && event.code !== 1001 && !event.wasClean) {
          console.log('WebSocket closed unexpectedly, attempting to reconnect...');
          setTimeout(() => {
            console.log('Attempting to reconnect WebSocket...');
            this.connectWebSocket(token, onNotification);
          }, 5000); // 5 seconds for localhost reconnection
        } else {
          console.log('WebSocket closed normally, no reconnection needed');
        }
      };

      this.wsConnection.onerror = (error) => {
        console.warn('WebSocket connection failed to localhost:8000 - falling back to polling:', error);
        console.log('This may be due to: missing token, invalid token, or WebSocket endpoint not available');
        this.isConnecting = false; // Clear connection flag on error
        // Start polling fallback on WebSocket error
        this.startPollingFallback();
      };
    } catch (error) {
      console.warn('Failed to create WebSocket connection to localhost:8000:', error);
      this.isConnecting = false; // Clear connection flag on error
      // Start polling fallback if WebSocket creation fails
      this.startPollingFallback();
    }
  }

  // Polling fallback for when WebSocket is not available
  private startPollingFallback() {
    // Don't start polling if WebSocket is connected and working
    if (this.wsConnection?.readyState === WebSocket.OPEN) {
      console.log('WebSocket is connected, skipping polling fallback');
      return;
    }

    if (this.pollingInterval) {
      return; // Already polling
    }

    console.log('Starting notification polling fallback');
    this.pollingInterval = setInterval(async () => {
      // Stop polling if WebSocket becomes available
      if (this.wsConnection?.readyState === WebSocket.OPEN) {
        console.log('WebSocket reconnected, stopping polling fallback');
        this.stopPollingFallback();
        return;
      }

      try {
        const unreadData = await this.getUnreadCount();
        if (unreadData.total_unread !== this.lastUnreadCount) {
          this.lastUnreadCount = unreadData.total_unread;
          // Simulate a notification callback for unread count changes
          if (this.onNotificationCallback && unreadData.total_unread > 0) {
            // We could fetch the latest notification here, but for now just update count
            console.log('Unread count changed:', unreadData.total_unread);
          }
        }
      } catch (error) {
        console.warn('Polling fallback failed:', error);
      }
    }, 30000); // Poll every 30 seconds
  }

  // Stop polling fallback
  private stopPollingFallback() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log('Stopped notification polling fallback');
    }
  }

  // Check if WebSocket endpoint is available (basic check)
  private isWebSocketEndpointAvailable(): boolean {
    // Check if we're connecting to the specific backend endpoint
    return true; // Enable WebSocket for localhost:8000 backend
  }

  // Disconnect WebSocket
  disconnectWebSocket() {
    if (this.wsConnection) {
      this.wsConnection.close(1000, 'Manual disconnect');
      this.wsConnection = null;
    }
    this.stopPollingFallback();
    this.onNotificationCallback = undefined;
  }

  // Get WebSocket connection status
  get isWebSocketConnected(): boolean {
    return this.wsConnection?.readyState === WebSocket.OPEN;
  }

  // Helper method to convert NotificationData to local Notification format
  convertToLocalFormat(apiNotification: NotificationData): any {
    return {
      id: apiNotification.id.toString(),
      type: this.mapNotificationType(apiNotification.notification_type),
      title: apiNotification.title,
      message: apiNotification.message,
      timestamp: apiNotification.created_at,
      read: apiNotification.is_read,
      priority: apiNotification.priority,
      actionUrl: apiNotification.action_url,
      actionText: apiNotification.action_text,
      metadata: apiNotification.metadata,
      user: apiNotification.user
    };
  }

  // Map API notification types to local types
  private mapNotificationType(apiType: string): string {
    const typeMap: Record<string, string> = {
      'task_assigned': 'task_assigned',
      'task_completed': 'task_completed',
      'deliverable_submitted': 'deliverable_feedback',
      'deliverable_approved': 'deliverable_approved',
      'deliverable_rejected': 'deliverable_rejected',
      'payment_received': 'payment_received',
      'payment_pending': 'payment_pending',
      'message_received': 'message',
      'system_announcement': 'system',
      'profile_incomplete': 'system',
      'meeting_scheduled': 'meeting_scheduled',
      'meeting_updated': 'meeting_updated'
    };

    return typeMap[apiType] || 'system';
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;