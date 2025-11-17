/**
 * Professional Partnership Constants
 * 
 * Centralized configuration for the partnership system
 */

import { FilterOption, PartnershipStatus } from '../../types/partnership';

// Partnership Status Constants
export const PARTNERSHIP_STATUS = {
  PENDING: 'pending' as PartnershipStatus,
  APPROVED: 'approved' as PartnershipStatus,
  REJECTED: 'rejected' as PartnershipStatus
} as const;

// Filter Options for Partnership Requests
export const FILTER_OPTIONS: readonly FilterOption[] = [
  { value: 'all', label: 'All Applications' },
  { value: 'pending', label: 'Pending Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' }
] as const;

// Status Color Mappings
export const STATUS_COLORS: Record<PartnershipStatus, string> = {
  approved: 'badge-success',
  pending: 'badge-warning',
  rejected: 'badge-error'
} as const;

// Partnership Configuration
export const PARTNERSHIP_CONFIG = {
  // Commission and earnings
  COMMISSION_RATE: 0.10,
  MIN_PAYOUT_AMOUNT: 10.00,
  
  // Application validation
  MIN_MOTIVATION_LENGTH: 50,
  MAX_MOTIVATION_LENGTH: 1000,
  MAX_EXPERIENCE_LENGTH: 500,
  
  // UI Configuration
  REQUESTS_PER_PAGE: 10,
  SEARCH_DEBOUNCE_MS: 300,
  
  // Referral code settings
  REFERRAL_CODE_PREFIX: 'GRAD',
  REFERRAL_CODE_LENGTH: 20,
  
  // Review settings
  AUTO_REVIEW_DAYS: 7,
  REMINDER_DAYS: 3
} as const;

// Admin Configuration
export const ADMIN_CONFIG = {
  DEFAULT_REVIEWER: 'Dr. Sarah Johnson',
  DEFAULT_ADMIN_NAME: 'Admin',
  DEPARTMENT: 'Academic Partnerships',
  CONTACT_EMAIL: 'partnerships@gradhelper.com',
  REVIEW_GUIDELINES_URL: '/admin/partnership-guidelines',
} as const;

// Status Icons for UI
export const STATUS_ICONS = {
  approved: 'CheckCircle',
  pending: 'Clock',
  rejected: 'XCircle'
} as const;

// Year of Study Options
export const YEAR_OPTIONS = [
  { value: '1st', label: '1st Year' },
  { value: '2nd', label: '2nd Year' },
  { value: '3rd', label: '3rd Year' },
  { value: '4th', label: '4th Year' },
  { value: 'graduate', label: 'Graduate Student' },
  { value: 'postgraduate', label: 'Postgraduate' }
] as const;

// Common rejection reasons for quick selection
export const COMMON_REJECTION_REASONS = [
  'Insufficient academic standing',
  'Limited relevant experience',
  'Unclear motivation or goals',
  'School already has active representatives',
  'Application incomplete or unclear',
  'Does not meet minimum requirements'
] as const;

// Success messages
export const SUCCESS_MESSAGES = {
  APPLICATION_SUBMITTED: 'Partnership application submitted successfully',
  APPLICATION_APPROVED: 'Partnership application approved',
  APPLICATION_REJECTED: 'Partnership application rejected',
  REQUEST_APPROVED: 'Partnership request approved successfully',
  REQUEST_REJECTED: 'Partnership request rejected',
  DATA_SAVED: 'Partnership data saved successfully',
  NOTIFICATION_SENT: 'Notification sent to applicant'
} as const;

// Error messages
export const ERROR_MESSAGES = {
  APPLICATION_FAILED: 'Failed to submit partnership application',
  DATA_LOAD_FAILED: 'Failed to load partnership data',
  LOAD_FAILED: 'Failed to load data',
  ACTION_FAILED: 'Action failed to complete',
  VALIDATION_FAILED: 'Application validation failed',
  DUPLICATE_APPLICATION: 'You already have a pending or approved application',
  NETWORK_ERROR: 'Network error occurred, please try again',
  STORAGE_ERROR: 'Failed to save data, please try again'
} as const;