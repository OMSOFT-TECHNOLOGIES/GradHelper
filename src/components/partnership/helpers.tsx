/**
 * Professional Partnership Helper Functions
 * 
 * Utility functions for partnership-related operations with full TypeScript support
 */

import React from 'react';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { 
  PartnershipRequest, 
  PartnershipStatus, 
  PartnershipStatistics,
  FilterType 
} from '../../types/partnership';
import { STATUS_COLORS, PARTNERSHIP_CONFIG } from './constants';

/**
 * Gets the appropriate CSS class for a partnership status
 */
export const getStatusColor = (status: PartnershipStatus): string => {
  return STATUS_COLORS[status] || 'badge-secondary';
};

/**
 * Returns the appropriate icon component for a partnership status
 */
export const getStatusIcon = (status: PartnershipStatus, className: string = "w-4 h-4"): React.ReactElement => {
  const iconProps = { className, 'aria-hidden': true };
  
  switch (status) {
    case 'approved': 
      return <CheckCircle {...iconProps} />;
    case 'pending': 
      return <Clock {...iconProps} />;
    case 'rejected': 
      return <XCircle {...iconProps} />;
    default: 
      return <AlertCircle {...iconProps} />;
  }
};

/**
 * Filters partnership requests based on status and search criteria
 */
export const filterRequests = (
  requests: PartnershipRequest[], 
  filter: FilterType, 
  searchTerm: string
): PartnershipRequest[] => {
  if (!Array.isArray(requests)) {
    console.warn('Invalid requests array provided to filterRequests');
    return [];
  }

  const normalizedSearchTerm = searchTerm.toLowerCase().trim();
  
  // Filter out null/undefined requests and apply filters
  return requests.filter(request => {
    // Check if request is valid
    if (!request || typeof request !== 'object') {
      return false;
    }
    
    // Status filter
    const matchesFilter = filter === 'all' || request.status === filter;
    
    // Search filter
    const matchesSearch = !normalizedSearchTerm || [
      request.userName,
      request.school,
      request.userEmail,
      request.course,
      request.year
    ].some(field => 
      field?.toLowerCase().includes(normalizedSearchTerm)
    );

    return matchesFilter && matchesSearch;
  });
};

/**
 * Calculates comprehensive statistics for partnership requests
 */
export const getRequestCounts = (requests: PartnershipRequest[]): PartnershipStatistics => {
  if (!Array.isArray(requests)) {
    console.warn('Invalid requests array provided to getRequestCounts');
    return { pending: 0, approved: 0, rejected: 0, total: 0 };
  }

  const stats = requests.reduce(
    (acc, request) => {
      // Check if request is valid and has status property
      if (request && typeof request === 'object' && request.status) {
        acc.total++;
        if (request.status === 'pending') acc.pending++;
        else if (request.status === 'approved') acc.approved++;
        else if (request.status === 'rejected') acc.rejected++;
      }
      return acc;
    },
    { pending: 0, approved: 0, rejected: 0, total: 0 }
  );

  return stats;
};

/**
 * Formats a date string for display
 */
export const formatDate = (dateString: string, options?: Intl.DateTimeFormatOptions): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    };

    return date.toLocaleDateString('en-US', defaultOptions);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Formats a date string with time for display
 */
export const formatDateTime = (dateString: string): string => {
  return formatDate(dateString, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Truncates text to a specified length with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Calculates time elapsed since a date
 */
export const getTimeElapsed = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 7) {
      return formatDate(dateString);
    } else if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Less than an hour ago';
    }
  } catch (error) {
    console.error('Error calculating time elapsed:', error);
    return formatDate(dateString);
  }
};

/**
 * Generates initials from a full name
 */
export const getInitials = (name: string): string => {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

/**
 * Calculates commission amount
 */
export const calculateCommission = (taskValue: number): number => {
  if (!taskValue || taskValue < 0) return 0;
  return Math.round(taskValue * PARTNERSHIP_CONFIG.COMMISSION_RATE * 100) / 100;
};

/**
 * Formats currency for display
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `$${amount.toFixed(2)}`;
  }
};

/**
 * Checks if a payout amount is eligible
 */
export const isPayoutEligible = (amount: number): boolean => {
  return amount >= PARTNERSHIP_CONFIG.MIN_PAYOUT_AMOUNT;
};

/**
 * Generates a slug from text
 */
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

/**
 * Debounce function for search inputs
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Creates a search debounced function with default delay
 */
export const createSearchDebouncer = <T extends (...args: any[]) => any>(func: T) => {
  return debounce(func, PARTNERSHIP_CONFIG.SEARCH_DEBOUNCE_MS);
};

/**
 * Sorts requests by a given field
 */
export const sortRequests = (
  requests: PartnershipRequest[],
  sortBy: 'date' | 'name' | 'status',
  sortOrder: 'asc' | 'desc' = 'desc'
): PartnershipRequest[] => {
  // Filter out null/undefined requests before sorting
  const validRequests = requests.filter(request => request && typeof request === 'object');
  
  return validRequests.sort((a, b) => {
    // Handle null/undefined requests
    if (!a && !b) return 0;
    if (!a) return 1; // Put null/undefined at the end
    if (!b) return -1;
    
    let aValue: string | Date;
    let bValue: string | Date;
    
    // Map sort keys to actual properties
    switch (sortBy) {
      case 'date':
        aValue = a.submittedDate;
        bValue = b.submittedDate;
        break;
      case 'name':
        aValue = a.userName;
        bValue = b.userName;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      default:
        return 0;
    }

    // Handle null/undefined values
    if (!aValue && !bValue) return 0;
    if (!aValue) return sortOrder === 'asc' ? -1 : 1;
    if (!bValue) return sortOrder === 'asc' ? 1 : -1;

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
};