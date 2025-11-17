/**
 * Professional Partnership Module Type Definitions
 * 
 * This file contains all TypeScript interfaces and types for the partnership system.
 * It ensures type safety and consistency across all partnership-related components.
 */

// Base Types
export type PartnershipStatus = 'pending' | 'approved' | 'rejected';
export type FilterType = 'all' | 'pending' | 'approved' | 'rejected';
export type UserRole = 'student' | 'admin';

// User Interface
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: UserRole;
}

// Application Data Interface
export interface ApplicationData {
  school: string;
  year: string;
  course: string;
  motivation: string;
  experience: string;
  socialMedia: string;
}

// Partnership Data Interface
export interface PartnershipData {
  isPartner: boolean;
  status: PartnershipStatus;
  school: string;
  referralCode: string;
  totalReferrals: number;
  successfulReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
  joinedDate: string;
  applicationData?: ApplicationData;
  rejectionReason?: string;
}

// Partnership Request Interface
export interface PartnershipRequest extends ApplicationData {
  id: number;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  status: PartnershipStatus;
  submittedDate: string;
  reviewedDate?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  referralCode: string;
}

// Referral Record Interface
export interface ReferralRecord {
  id: number;
  referredUser: string;
  referredEmail: string;
  dateReferred: string;
  status: 'pending' | 'active' | 'completed';
  taskValue: number;
  commissionEarned: number;
  taskTitle: string;
}

// Notification Interface
export interface NotificationPayload {
  type: 'system';
  title: string;
  message: string;
  userId: string;
  userRole: UserRole;
  data: Record<string, unknown>;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  code?: string;
  errors?: string[];
  error?: string;
}

// Statistics Interface
export interface PartnershipStatistics {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

// Filter Options Interface
export interface FilterOption {
  value: FilterType;
  label: string;
}

// Form Validation Interface
export interface ValidationErrors {
  [key: string]: string | undefined;
}

// Component Props Interfaces
export interface PartnershipViewProps {
  user: User;
}

export interface PartnershipRequestItemProps {
  request: PartnershipRequest;
  onViewDetails: (request: PartnershipRequest) => void;
  onApprove: (request: PartnershipRequest) => Promise<void>;
  onReject: (request: PartnershipRequest) => void;
  isLoading?: boolean;
}

export interface FiltersSectionProps {
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statistics: PartnershipStatistics;
}

export interface RequestDetailModalProps {
  request: PartnershipRequest;
  onClose: () => void;
  onApprove: (request: PartnershipRequest) => Promise<void>;
  onReject: (request: PartnershipRequest) => void;
  isLoading?: boolean;
}

export interface RejectModalProps {
  request: PartnershipRequest;
  rejectionReason: string;
  setRejectionReason: (reason: string) => void;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
  errors?: ValidationErrors;
}

export interface PartnershipApplicationModalProps {
  onClose: () => void;
  onSubmit: (data: ApplicationData) => Promise<void>;
  isLoading?: boolean;
}

// Service Interfaces
export interface PartnershipService {
  getPartnershipData(userId: string): Promise<PartnershipData | null>;
  savePartnershipData(userId: string, data: PartnershipData): Promise<void>;
  getPartnershipRequests(): Promise<PartnershipRequest[]>;
  updatePartnershipRequest(request: PartnershipRequest): Promise<void>;
  createPartnershipRequest(request: Omit<PartnershipRequest, 'id'>): Promise<PartnershipRequest>;
}

// Constants
export const PARTNERSHIP_CONSTANTS = {
  MIN_MOTIVATION_LENGTH: 50,
  MAX_MOTIVATION_LENGTH: 1000,
  MAX_EXPERIENCE_LENGTH: 500,
  MIN_PAYOUT_AMOUNT: 10.00,
  COMMISSION_RATE: 0.10,
  REFERRAL_CODE_PREFIX: 'GRAD',
  STORAGE_KEYS: {
    PARTNERSHIP_DATA: 'partnership_',
    PARTNERSHIP_REQUESTS: 'partnership_requests',
  },
} as const;

// Enums for better type safety
export enum PartnershipStatusEnum {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum NotificationTypeEnum {
  PARTNERSHIP_APPROVED = 'partnership_approved',
  PARTNERSHIP_REJECTED = 'partnership_rejected',
  PARTNERSHIP_APPLICATION = 'partnership_application',
  ADMIN_ACTION = 'admin_action',
}

export interface PaginationParams {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SortParams {
  sortBy: 'date' | 'name' | 'status';
  sortOrder: 'asc' | 'desc';
}

export interface ApiError {
  message: string;
  code: string;
  status?: number;
}