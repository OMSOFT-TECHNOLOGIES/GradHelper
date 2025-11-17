/**
 * Professional Partnership Service Layer
 * 
 * This service provides a clean abstraction layer for all partnership-related data operations.
 * It handles data persistence, validation, and business logic while maintaining separation of concerns.
 */

import { 
  PartnershipData, 
  PartnershipRequest, 
  ApplicationData,
  User,
  PartnershipStatistics,
  PARTNERSHIP_CONSTANTS,
  PartnershipStatusEnum,
  NotificationPayload,
  NotificationTypeEnum
} from '../types/partnership';

export class PartnershipService {
  private static instance: PartnershipService;

  private constructor() {}

  public static getInstance(): PartnershipService {
    if (!PartnershipService.instance) {
      PartnershipService.instance = new PartnershipService();
    }
    return PartnershipService.instance;
  }

  /**
   * Generates a unique referral code for a user
   */
  private generateReferralCode(userName: string): string {
    const sanitizedName = userName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '-')
      .substring(0, 10);
    
    const timestamp = Date.now().toString().slice(-6);
    return `${PARTNERSHIP_CONSTANTS.REFERRAL_CODE_PREFIX}-${sanitizedName}-${timestamp}`;
  }

  /**
   * Validates application data
   */
  private validateApplicationData(data: ApplicationData): string[] {
    const errors: string[] = [];

    if (!data.school?.trim()) {
      errors.push('School name is required');
    }

    if (!data.year?.trim()) {
      errors.push('Year of study is required');
    }

    if (!data.course?.trim()) {
      errors.push('Course/Major is required');
    }

    if (!data.motivation?.trim()) {
      errors.push('Motivation is required');
    } else if (data.motivation.trim().length < PARTNERSHIP_CONSTANTS.MIN_MOTIVATION_LENGTH) {
      errors.push(`Motivation must be at least ${PARTNERSHIP_CONSTANTS.MIN_MOTIVATION_LENGTH} characters`);
    } else if (data.motivation.trim().length > PARTNERSHIP_CONSTANTS.MAX_MOTIVATION_LENGTH) {
      errors.push(`Motivation cannot exceed ${PARTNERSHIP_CONSTANTS.MAX_MOTIVATION_LENGTH} characters`);
    }

    if (data.experience && data.experience.length > PARTNERSHIP_CONSTANTS.MAX_EXPERIENCE_LENGTH) {
      errors.push(`Experience cannot exceed ${PARTNERSHIP_CONSTANTS.MAX_EXPERIENCE_LENGTH} characters`);
    }

    return errors;
  }

  /**
   * Safe localStorage operations with error handling
   */
  private safeLocalStorageGet<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  }

  private safeLocalStorageSet(key: string, value: unknown): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
      return false;
    }
  }

  /**
   * Retrieves partnership data for a specific user
   */
  public async getPartnershipData(userId: string): Promise<PartnershipData | null> {
    try {
      const key = `${PARTNERSHIP_CONSTANTS.STORAGE_KEYS.PARTNERSHIP_DATA}${userId}`;
      const data = this.safeLocalStorageGet<PartnershipData | null>(key, null);
      
      // Validate data structure
      if (data && typeof data === 'object' && 'isPartner' in data) {
        return data;
      }
      
      return null;
    } catch (error) {
      console.error('Error retrieving partnership data:', error);
      throw new Error('Failed to retrieve partnership data');
    }
  }

  /**
   * Saves partnership data for a specific user
   */
  public async savePartnershipData(userId: string, data: PartnershipData): Promise<void> {
    try {
      const key = `${PARTNERSHIP_CONSTANTS.STORAGE_KEYS.PARTNERSHIP_DATA}${userId}`;
      const success = this.safeLocalStorageSet(key, data);
      
      if (!success) {
        throw new Error('Failed to save partnership data to storage');
      }
    } catch (error) {
      console.error('Error saving partnership data:', error);
      throw error;
    }
  }

  /**
   * Retrieves all partnership requests
   */
  public async getPartnershipRequests(): Promise<PartnershipRequest[]> {
    try {
      return this.safeLocalStorageGet<PartnershipRequest[]>(
        PARTNERSHIP_CONSTANTS.STORAGE_KEYS.PARTNERSHIP_REQUESTS, 
        []
      );
    } catch (error) {
      console.error('Error retrieving partnership requests:', error);
      throw new Error('Failed to retrieve partnership requests');
    }
  }

  /**
   * Saves all partnership requests
   */
  private async savePartnershipRequests(requests: PartnershipRequest[]): Promise<void> {
    try {
      const success = this.safeLocalStorageSet(
        PARTNERSHIP_CONSTANTS.STORAGE_KEYS.PARTNERSHIP_REQUESTS, 
        requests
      );
      
      if (!success) {
        throw new Error('Failed to save partnership requests to storage');
      }
    } catch (error) {
      console.error('Error saving partnership requests:', error);
      throw error;
    }
  }

  /**
   * Creates a new partnership request
   */
  public async createPartnershipRequest(
    user: User, 
    applicationData: ApplicationData
  ): Promise<PartnershipRequest> {
    try {
      // Validate application data
      const validationErrors = this.validateApplicationData(applicationData);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      const existingRequests = await this.getPartnershipRequests();
      
      // Check for existing pending/approved application
      const existingRequest = existingRequests.find(
        req => req.userId === user.id && (req.status === 'pending' || req.status === 'approved')
      );
      
      if (existingRequest) {
        throw new Error('You already have a pending or approved partnership application');
      }

      const newRequest: PartnershipRequest = {
        id: Date.now(),
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userAvatar: user.avatar,
        ...applicationData,
        status: PartnershipStatusEnum.PENDING,
        submittedDate: new Date().toISOString(),
        referralCode: this.generateReferralCode(user.name)
      };

      existingRequests.push(newRequest);
      await this.savePartnershipRequests(existingRequests);

      // Update user's partnership data
      const partnershipData: PartnershipData = {
        isPartner: true,
        status: PartnershipStatusEnum.PENDING,
        school: applicationData.school,
        referralCode: newRequest.referralCode,
        totalReferrals: 0,
        successfulReferrals: 0,
        totalEarnings: 0,
        pendingEarnings: 0,
        joinedDate: newRequest.submittedDate.split('T')[0],
        applicationData
      };

      await this.savePartnershipData(user.id, partnershipData);

      return newRequest;
    } catch (error) {
      console.error('Error creating partnership request:', error);
      throw error;
    }
  }

  /**
   * Updates a partnership request status
   */
  public async updatePartnershipRequest(
    requestId: number, 
    status: PartnershipStatusEnum,
    reviewedBy: string,
    rejectionReason?: string
  ): Promise<PartnershipRequest> {
    try {
      const requests = await this.getPartnershipRequests();
      const requestIndex = requests.findIndex(req => req.id === requestId);
      
      if (requestIndex === -1) {
        throw new Error('Partnership request not found');
      }

      const request = requests[requestIndex];
      
      // Update request
      const updatedRequest: PartnershipRequest = {
        ...request,
        status,
        reviewedDate: new Date().toISOString(),
        reviewedBy,
        ...(rejectionReason && { rejectionReason: rejectionReason.trim() })
      };

      requests[requestIndex] = updatedRequest;
      await this.savePartnershipRequests(requests);

      // Update user's partnership data
      const partnershipData: PartnershipData = {
        isPartner: status === PartnershipStatusEnum.APPROVED,
        status,
        school: status === PartnershipStatusEnum.APPROVED ? request.school : '',
        referralCode: status === PartnershipStatusEnum.APPROVED ? request.referralCode : '',
        totalReferrals: 0,
        successfulReferrals: 0,
        totalEarnings: 0,
        pendingEarnings: 0,
        joinedDate: status === PartnershipStatusEnum.APPROVED ? request.submittedDate.split('T')[0] : '',
        applicationData: request,
        ...(rejectionReason && { rejectionReason: rejectionReason.trim() })
      };

      await this.savePartnershipData(request.userId, partnershipData);

      return updatedRequest;
    } catch (error) {
      console.error('Error updating partnership request:', error);
      throw error;
    }
  }

  /**
   * Calculates partnership statistics
   */
  public async getPartnershipStatistics(): Promise<PartnershipStatistics> {
    try {
      const requests = await this.getPartnershipRequests();
      
      return {
        total: requests.length,
        pending: requests.filter(r => r.status === PartnershipStatusEnum.PENDING).length,
        approved: requests.filter(r => r.status === PartnershipStatusEnum.APPROVED).length,
        rejected: requests.filter(r => r.status === PartnershipStatusEnum.REJECTED).length
      };
    } catch (error) {
      console.error('Error calculating partnership statistics:', error);
      throw new Error('Failed to calculate partnership statistics');
    }
  }

  /**
   * Filters partnership requests based on criteria
   */
  public filterRequests(
    requests: PartnershipRequest[], 
    statusFilter: string, 
    searchTerm: string
  ): PartnershipRequest[] {
    try {
      return requests.filter(request => {
        const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
        
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = !searchTerm || 
          request.userName.toLowerCase().includes(searchLower) ||
          request.school.toLowerCase().includes(searchLower) ||
          request.userEmail.toLowerCase().includes(searchLower) ||
          request.course.toLowerCase().includes(searchLower);
        
        return matchesStatus && matchesSearch;
      });
    } catch (error) {
      console.error('Error filtering requests:', error);
      return requests; // Return unfiltered on error
    }
  }

  /**
   * Creates notification payloads for different partnership events
   */
  public createNotification(
    type: NotificationTypeEnum,
    request: PartnershipRequest,
    additionalData?: Record<string, unknown>
  ): NotificationPayload[] {
    const notifications: NotificationPayload[] = [];

    switch (type) {
      case NotificationTypeEnum.PARTNERSHIP_APPROVED:
        notifications.push({
          type: 'system',
          title: 'Partnership Application Approved! 🎉',
          message: `Congratulations! You are now an official TheGradHelper representative at ${request.school}. Your referral code is: ${request.referralCode}`,
          userId: request.userId,
          userRole: 'student',
          data: { 
            type: NotificationTypeEnum.PARTNERSHIP_APPROVED,
            school: request.school,
            referralCode: request.referralCode,
            ...additionalData
          }
        });

        notifications.push({
          type: 'system',
          title: 'Partnership Request Approved',
          message: `${request.userName}'s partnership application has been approved.`,
          userId: 'admin',
          userRole: 'admin',
          data: { 
            type: NotificationTypeEnum.ADMIN_ACTION,
            action: 'approved',
            requestId: request.id,
            ...additionalData
          }
        });
        break;

      case NotificationTypeEnum.PARTNERSHIP_REJECTED:
        notifications.push({
          type: 'system',
          title: 'Partnership Application Update',
          message: `Your partnership application for ${request.school} has been reviewed. Please check your partnership page for details.`,
          userId: request.userId,
          userRole: 'student',
          data: { 
            type: NotificationTypeEnum.PARTNERSHIP_REJECTED,
            reason: request.rejectionReason,
            ...additionalData
          }
        });

        notifications.push({
          type: 'system',
          title: 'Partnership Request Rejected',
          message: `${request.userName}'s partnership application has been rejected.`,
          userId: 'admin',
          userRole: 'admin',
          data: { 
            type: NotificationTypeEnum.ADMIN_ACTION,
            action: 'rejected',
            requestId: request.id,
            ...additionalData
          }
        });
        break;

      case NotificationTypeEnum.PARTNERSHIP_APPLICATION:
        notifications.push({
          type: 'system',
          title: 'Partnership Application Submitted',
          message: 'Your application to become a school representative has been submitted for review. You will be notified once it has been reviewed.',
          userId: request.userId,
          userRole: 'student',
          data: { 
            type: NotificationTypeEnum.PARTNERSHIP_APPLICATION,
            requestId: request.id,
            ...additionalData
          }
        });
        break;
    }

    return notifications;
  }

  /**
   * Validates referral code format
   */
  public validateReferralCode(code: string): boolean {
    const pattern = new RegExp(`^${PARTNERSHIP_CONSTANTS.REFERRAL_CODE_PREFIX}-[A-Z0-9-]+-\\d{6}$`);
    return pattern.test(code);
  }

  /**
   * Calculates commission earnings
   */
  public calculateCommission(taskValue: number): number {
    return Math.round(taskValue * PARTNERSHIP_CONSTANTS.COMMISSION_RATE * 100) / 100;
  }

  /**
   * Checks if payout amount meets minimum threshold
   */
  public isPayoutEligible(amount: number): boolean {
    return amount >= PARTNERSHIP_CONSTANTS.MIN_PAYOUT_AMOUNT;
  }

  /**
   * Get all partnership requests (alias for getPartnershipRequests)
   */
  public getRequests(): PartnershipRequest[] {
    try {
      const requests = this.safeLocalStorageGet<PartnershipRequest[]>(
        PARTNERSHIP_CONSTANTS.STORAGE_KEYS.PARTNERSHIP_REQUESTS, 
        []
      );
      
      // Filter out any null/undefined entries that might exist due to corrupted data
      return requests.filter(request => request && typeof request === 'object' && request.status);
    } catch (error) {
      console.error('Error retrieving partnership requests:', error);
      return [];
    }
  }

  /**
   * Approve a partnership request
   */
  public async approveRequest(requestId: number, reviewerName: string): Promise<PartnershipRequest> {
    return await this.updatePartnershipRequest(
      requestId, 
      PartnershipStatusEnum.APPROVED, 
      reviewerName
    );
  }

  /**
   * Reject a partnership request
   */
  public async rejectRequest(
    requestId: number, 
    rejectionReason: string, 
    reviewerName: string
  ): Promise<PartnershipRequest> {
    return await this.updatePartnershipRequest(
      requestId, 
      PartnershipStatusEnum.REJECTED, 
      reviewerName,
      rejectionReason
    );
  }

  /**
   * Send notification using the provided notification function
   */
  public sendNotification(
    addNotification: Function,
    type: NotificationTypeEnum,
    request: PartnershipRequest,
    additionalData?: any
  ): void {
    try {
      const notifications = this.createNotification(type, request, additionalData);
      notifications.forEach(notification => {
        addNotification(notification);
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  /**
   * Save partnership data to local storage
   */
  private saveToStorage(key: string, data: any): void {
    const success = this.safeLocalStorageSet(key, data);
    if (!success) {
      throw new Error('Failed to save data to storage');
    }
  }

  /**
   * Load data from local storage
   */
  private loadFromStorage<T>(key: string, defaultValue: T): T {
    return this.safeLocalStorageGet(key, defaultValue);
  }
}

// Export singleton instance
export const partnershipService = PartnershipService.getInstance();