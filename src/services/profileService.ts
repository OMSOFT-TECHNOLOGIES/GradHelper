// Profile service for fetching user profile data
import { toast } from 'sonner';
 const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
// Extended User interface matching the backend response
export interface StudentProfile {
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
    
    // Additional fields from backend
    [key: string]: any;
  };
}

// Actual backend response interface
export interface ActualProfileApiResponse {
  status: 'success' | 'error';
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    date_joined: string;
    last_login: string;
    role: string;
    provider: string;
    avatar?: string;
    profile: {
      user: number;
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
      country: string;
      institution: string;
      major: string;
      academic_level: string;
      graduation_year: number;
      bio: string;
      isComplete: boolean;
      is_online: boolean;
      preferences: {
        timezone: string;
        communication: string;
        notifications: boolean;
      };
      [key: string]: any;
    };
  };
  message?: string;
}

// API response interface matching the backend structure
export interface ProfileApiResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
      role: string;
      createdAt: string;
      updatedAt: string;
    };
    profile: {
      id: string;
      userId: string;
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
      
      createdAt: string;
      updatedAt: string;
      [key: string]: any;
    };
  };
  message: string;
}

class ProfileService {
  private baseUrl = API_BASE_URL;

  /**
   * Parse API response into StudentProfile format
   * Handles different possible response structures
   */
  private parseProfileResponse(response: any): StudentProfile {
    console.log('Parsing profile response:', response);
    
    // Handle different possible response structures
    let userData: any;
    let profileData: any;
    
    if (response.data && response.data.user) {
      // Standard expected structure
      userData = response.data.user;
      profileData = response.data.profile || {};
    } else if (response.user && response.status === 'success') {
      // Backend structure: {status: 'success', user: {...}}
      userData = response.user;
      profileData = response.user.profile || {};
    } else if (response.id && response.email) {
      // Direct user data in response
      userData = response;
      profileData = response.profile || {};
    } else {
      console.error('Cannot parse response structure:', response);
      throw new Error('Unexpected response structure from server');
    }
    
    console.log('Parsed user data:', userData);
    console.log('Parsed profile data:', profileData);
    
    const studentProfile: StudentProfile = {
      id: userData.id?.toString() || '',
      name: userData.username || `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Unknown User',
      email: userData.email,
      avatar: userData.avatar || '',
      role: (userData.role || 'student') as 'student' | 'admin',
      profile: {
        isComplete: profileData.isComplete || false,
        // Personal Information
        firstName: profileData.first_name || userData.first_name,
        lastName: profileData.last_name || userData.last_name,
        dateOfBirth: profileData.date_of_birth || profileData.dateOfBirth,
        phoneNumber: profileData.phone || profileData.phoneNumber,
        address: profileData.address,
        city: profileData.city,
        state: profileData.state,
        zipCode: profileData.zip_code || profileData.zipCode,
        country: profileData.country,
        
        // Academic Information
        university: profileData.institution || profileData.university,
        major: profileData.major,
        yearOfStudy: profileData.academic_level || profileData.yearOfStudy,
        gpa: profileData.gpa,
        expectedGraduation: profileData.graduation_year?.toString() || profileData.expectedGraduation,
        academicGoals: profileData.bio || profileData.academicGoals,
        
        // Preferences
        subjectAreas: profileData.subjectAreas,
        availabilityHours: profileData.availabilityHours,
        communicationPreference: profileData.preferences?.communication || profileData.communicationPreference,
        notificationSettings: {
          taskUpdates: profileData.preferences?.notifications || profileData.notificationSettings?.taskUpdates,
          deadlineReminders: profileData.notificationSettings?.deadlineReminders,
          paymentAlerts: profileData.notificationSettings?.paymentAlerts,
          partnershipRequests: profileData.notificationSettings?.partnershipRequests,
        },
        
        // Include any additional fields
        ...Object.keys(profileData || {})
          .filter(key => ![
            'id', 'userId', 'isComplete', 'createdAt', 'updatedAt',
            'firstName', 'lastName', 'dateOfBirth', 'phoneNumber', 'address',
            'city', 'state', 'zipCode', 'country', 'university', 'major',
            'yearOfStudy', 'gpa', 'expectedGraduation', 'academicGoals',
            'subjectAreas', 'availabilityHours', 'communicationPreference',
            'notificationSettings'
          ].includes(key))
          .reduce((acc, key) => {
            acc[key] = profileData[key];
            return acc;
          }, {} as Record<string, any>)
      }
    };

    return studentProfile;
  }

  /**
   * Make an authenticated API request
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const token = localStorage.getItem('gradhelper_token');
      
      const config: RequestInit = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      };
      console.log(`Making API request to ${this.baseUrl}/${endpoint} with options:`, config);
      const response = await fetch(`${this.baseUrl}/${endpoint}`, config);
      
      console.log(`Response status: ${response.status} ${response.statusText}`);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
        console.error('Error response data:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const jsonData = await response.json();
      console.log(`Raw JSON response from ${endpoint}:`, jsonData);
      return jsonData;
    } catch (error) {
      console.error(`Profile API Error [${endpoint}]:`, error);
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('An unexpected error occurred');
    }
  }

  /**
   * Fetch student profile from auth/profile endpoint
   */
  async getStudentProfile(): Promise<StudentProfile> {
    try {
      console.log('Fetching student profile from auth/profile endpoint...');
      
      const response = await this.makeRequest<ActualProfileApiResponse | ProfileApiResponse>('auth/profile');
      
      // Debug: Log the actual response structure
      console.log('Raw API response:', response);
      console.log('Response type:', typeof response);
      
      // Cast to any for property access that might not exist on both types
      const anyResponse = response as any;
      console.log('Response success field:', anyResponse.success);
      console.log('Response status field:', anyResponse.status);
      console.log('Response keys:', Object.keys(response || {}));
      
      // Check if response has the expected structure
      if (typeof response !== 'object' || response === null) {
        console.error('Invalid response type:', typeof response);
        throw new Error('Invalid response format from server');
      }
      
      // Handle different response structures
      if (anyResponse.success === false || anyResponse.status === 'error') {
        console.error('API response indicates failure:', response);
        throw new Error(anyResponse.message || 'Failed to fetch profile');
      }
      
      // Check for successful response formats
      const isSuccess = anyResponse.success === true || anyResponse.status === 'success';
      const hasUserData = anyResponse.user || anyResponse.data?.user || anyResponse.id;
      
      if (!isSuccess && !hasUserData) {
        console.error('No recognizable success status or user data in response:', response);
        throw new Error('Invalid response from server');
      }
      
      if (!hasUserData) {
        console.error('No user data found in response:', response);
        throw new Error('No user data found in API response');
      }
      
      console.log('Response validation passed, proceeding to parse...');

      // Parse the response using the helper method
      const studentProfile = this.parseProfileResponse(response);

      console.log('Profile fetch successful:', {
        userId: studentProfile.id,
        profileComplete: studentProfile.profile.isComplete,
        university: studentProfile.profile.university,
        major: studentProfile.profile.major
      });

      return studentProfile;
      
    } catch (error) {
      console.error('Error fetching student profile:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch profile';
      
      toast.error('Profile Fetch Failed', {
        description: `Unable to load your profile: ${errorMessage}`
      });
      
      throw error;
    }
  }

  /**
   * Update student profile
   */
  async updateStudentProfile(profileData: Partial<StudentProfile['profile']>): Promise<StudentProfile> {
    try {
      console.log('Updating student profile...', profileData);
      
      const response = await this.makeRequest<ActualProfileApiResponse | ProfileApiResponse>('auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });
      
      const anyResponse = response as any;
      if (anyResponse.success === false || anyResponse.status === 'error') {
        throw new Error(anyResponse.message || 'Failed to update profile');
      }

      // Parse the response using the helper method
      const updatedProfile = this.parseProfileResponse(response);

      toast.success('Profile Updated', {
        description: 'Your profile has been updated successfully'
      });

      return updatedProfile;
      
    } catch (error) {
      console.error('Error updating student profile:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      
      toast.error('Profile Update Failed', {
        description: `Unable to update your profile: ${errorMessage}`
      });
      
      throw error;
    }
  }

  /**
   * Check if user is authenticated (has valid token)
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('gradhelper_token');
    return !!token;
  }

  /**
   * Get cached user profile from localStorage
   */
  getCachedProfile(): StudentProfile | null {
    try {
      const cached = localStorage.getItem('gradhelper_user');
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error reading cached profile:', error);
      return null;
    }
  }

  /**
   * Cache user profile to localStorage
   */
  cacheProfile(profile: StudentProfile): void {
    try {
      localStorage.setItem('gradhelper_user', JSON.stringify(profile));
    } catch (error) {
      console.error('Error caching profile:', error);
    }
  }
}

// Export singleton instance
export const profileService = new ProfileService();
export default profileService;