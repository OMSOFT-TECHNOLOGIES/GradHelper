export const PARTNERSHIP_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const;

export const FILTER_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' }
] as const;

export const STATUS_COLORS = {
  approved: 'badge-success',
  pending: 'badge-warning',
  rejected: 'badge-error'
} as const;

export const ADMIN_NAME = 'Dr. John Smith';