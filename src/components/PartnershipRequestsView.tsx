/**
 * Professional Partnership Requests Management View
 * 
 * Administrative interface for reviewing and managing partnership applications
 * with comprehensive features, error handling, and accessibility
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNotifications } from './NotificationContextAPI';
import { UserCheck, AlertCircle, RefreshCw, Users, TrendingUp } from 'lucide-react';
import { toast } from "sonner";
import { FiltersSection } from './partnership/FiltersSection';
import { PartnershipRequestItem } from './partnership/PartnershipRequestItem';
import { RequestDetailModal } from './partnership/RequestDetailModal';
import { RejectModal } from './partnership/RejectModal';
import { filterRequests, getRequestCounts, sortRequests, createSearchDebouncer } from './partnership/helpers';
import { ADMIN_CONFIG, SUCCESS_MESSAGES, ERROR_MESSAGES } from './partnership/constants';
import { partnershipService } from '../services/partnershipApiService';
import { 
  PartnershipRequest, 
  FilterType, 
  PartnershipStatistics,
  NotificationTypeEnum,
  PartnershipStatusEnum
} from '../types/partnership';

export function PartnershipRequestsView(): React.JSX.Element {
  const { addNotification } = useNotifications();
  
  // State Management
  const [requests, setRequests] = useState<PartnershipRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<PartnershipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PartnershipRequest | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [requestToReject, setRequestToReject] = useState<PartnershipRequest | null>(null);
  
  // Filter and Search State
  const [statusFilter, setStatusFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'status'>('date');
  
  // Statistics
  const statistics = useMemo<PartnershipStatistics>(() => 
    getRequestCounts(requests), [requests]);

  // Debounced search
  const debouncedSearch = useMemo(() => 
    createSearchDebouncer((term: string) => setSearchTerm(term)), []);

  // Memoized filtered and sorted requests
  useMemo(() => {
    let filtered = filterRequests(requests, statusFilter, searchTerm);
    filtered = sortRequests(filtered, sortBy);
    setFilteredRequests(filtered);
  }, [requests, statusFilter, searchTerm, sortBy]);



  // Data Loading and Error Handling
  const loadRequests = useCallback(async (): Promise<void> => {
    try {
      setError('');
      const response = await partnershipService.getPartnershipRequests();
      const requestsArray = response.data || [];
      setRequests(requestsArray);
      
      if (requestsArray.length === 0) {
        console.info('No partnership requests found');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : ERROR_MESSAGES.LOAD_FAILED;
      setError(errorMessage);
      console.error('Failed to load partnership requests:', err);
      
      toast.error('Failed to Load Data', {
        description: errorMessage,
        action: {
          label: 'Retry',
          onClick: () => loadRequests()
        }
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
    toast.success('Data refreshed successfully');
  }, [loadRequests]);

  // Initial data load
  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // Action Handlers with Professional Error Handling
  const handleApprove = useCallback(async (request: PartnershipRequest): Promise<void> => {
    try {
      const response = await partnershipService.updatePartnershipRequestStatus(
        request.id, 
        'approved',
        ADMIN_CONFIG.DEFAULT_ADMIN_NAME
      );
      const updatedRequest = response.data;
      
      // Update local state
      setRequests(prevRequests => 
        prevRequests.map(req => req.id === request.id ? updatedRequest : req)
      );

      // Send success notification
      addNotification({
        type: 'system',
        title: 'Partnership Approved',
        message: `${request.userName}'s partnership application has been approved. They can now access referral tools.`,
        userId: request.userId,
        userRole: 'admin',
        metadata: {
          school: request.school,
          referralCode: request.referralCode
        }
      });

      toast.success(SUCCESS_MESSAGES.REQUEST_APPROVED, {
        description: `${request.userName} from ${request.school} is now a TheGradHelper partner.`,
        duration: 5000
      });

      // Close modals and reset selection
      setIsDetailModalOpen(false);
      setSelectedRequest(null);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : ERROR_MESSAGES.ACTION_FAILED;
      console.error('Failed to approve partnership request:', err);
      
      toast.error('Approval Failed', {
        description: errorMessage,
        action: {
          label: 'Retry',
          onClick: () => handleApprove(request)
        }
      });
    }
  }, [addNotification]);

  const handleReject = useCallback(async (
    request: PartnershipRequest, 
    rejectionReason: string
  ): Promise<void> => {
    if (!request || !rejectionReason?.trim()) {
      toast.error('Invalid Input', {
        description: 'Please provide a rejection reason.'
      });
      return;
    }

    try {
      const response = await partnershipService.updatePartnershipRequestStatus(
        request.id,
        'rejected',
        ADMIN_CONFIG.DEFAULT_ADMIN_NAME,
        rejectionReason.trim()
      );
      const updatedRequest = response.data;

      // Update local state
      setRequests(prevRequests => 
        prevRequests.map(req => req.id === request.id ? updatedRequest : req)
      );

      // Send rejection notification
      addNotification({
        type: 'info',
        title: 'Partnership Rejected',
        message: `${request.userName}'s partnership application has been rejected.`,
        userId: request.userId,
        userRole: 'admin',
        metadata: {
          reason: rejectionReason.trim()
        }
      });

      toast.success(SUCCESS_MESSAGES.REQUEST_REJECTED, {
        description: `${request.userName}'s application has been rejected with feedback.`,
        duration: 4000
      });

      // Close modals and reset selection
      setIsRejectModalOpen(false);
      setIsDetailModalOpen(false);
      setSelectedRequest(null);
      setRequestToReject(null);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : ERROR_MESSAGES.ACTION_FAILED;
      console.error('Failed to reject partnership request:', err);
      
      toast.error('Rejection Failed', {
        description: errorMessage,
        action: {
          label: 'Retry',
          onClick: () => handleReject(request, rejectionReason)
        }
      });
    }
  }, [addNotification]);

  // Modal and UI Event Handlers
  const handleViewDetails = useCallback((request: PartnershipRequest): void => {
    setSelectedRequest(request);
    setIsDetailModalOpen(true);
  }, []);

  const handleRejectClick = useCallback((request: PartnershipRequest): void => {
    setRequestToReject(request);
    setSelectedRequest(request);
    setIsRejectModalOpen(true);
  }, []);

  const handleCloseDetailModal = useCallback((): void => {
    setIsDetailModalOpen(false);
    setSelectedRequest(null);
  }, []);

  const handleCloseRejectModal = useCallback((): void => {
    setIsRejectModalOpen(false);
    setRequestToReject(null);
    setSelectedRequest(null);
  }, []);

  // Filter handlers
  const handleFilterChange = useCallback((newFilter: FilterType): void => {
    setStatusFilter(newFilter);
  }, []);

  const handleSearchChange = useCallback((searchValue: string): void => {
    debouncedSearch(searchValue);
  }, [debouncedSearch]);

  const handleSortChange = useCallback((newSort: 'date' | 'name' | 'status'): void => {
    setSortBy(newSort);
  }, []);

  // Accessibility helpers
  const handleKeyboardNavigation = useCallback((
    event: React.KeyboardEvent,
    action: () => void
  ): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-gray-200 h-20 rounded"></div>
          ))}
        </div>
        <div className="animate-pulse bg-gray-200 h-64 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" role="main" aria-label="Partnership Requests Management">
      {/* Header with Statistics */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Partnership Requests</h1>
          <p className="text-gray-600 mt-1">
            Review and manage student partnership applications
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Refresh partnership requests"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>

          {/* Statistics Summary */}
          <div className="stats-summary bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex gap-6">
              <div className="stat-item text-center">
                <div className="flex items-center gap-1 text-yellow-600 font-semibold">
                  <Users className="w-4 h-4" />
                  <span className="text-xl">{statistics.pending}</span>
                </div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Pending</span>
              </div>
              <div className="stat-item text-center">
                <div className="flex items-center gap-1 text-green-600 font-semibold">
                  <UserCheck className="w-4 h-4" />
                  <span className="text-xl">{statistics.approved}</span>
                </div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Approved</span>
              </div>
              <div className="stat-item text-center">
                <div className="flex items-center gap-1 text-red-600 font-semibold">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-xl">{statistics.rejected}</span>
                </div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Rejected</span>
              </div>
              <div className="stat-item text-center">
                <div className="flex items-center gap-1 text-blue-600 font-semibold">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xl">{statistics.total}</span>
                </div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Total</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Error Loading Data</span>
          </div>
          <p className="text-red-600 mt-1 text-sm">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-3 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Filters and Search */}
      <FiltersSection 
        filter={statusFilter}
        setFilter={setStatusFilter}
        searchTerm={searchTerm}
        setSearchTerm={(term) => debouncedSearch(term)}
        statistics={statistics}
      />

      {/* Requests List */}
      <div className="bg-white border rounded-lg shadow-sm">
        <div className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Partnership Applications</h2>
            <p className="text-sm text-gray-600">
              {filteredRequests.length} {filteredRequests.length === 1 ? 'application' : 'applications'} found
              {statusFilter !== 'all' && ` (${statusFilter})`}
            </p>
          </div>
        </div>
        
        <div className="p-6">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12" role="status" aria-live="polite">
              <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || statusFilter !== 'all' ? 'No Matching Applications' : 'No Applications Yet'}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search terms or filter criteria to find applications.'
                  : 'No partnership applications have been submitted yet. Students can apply through their partnership page.'
                }
              </p>
              {(searchTerm || statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setSearchTerm('');
                    debouncedSearch('');
                  }}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4" role="list" aria-label="Partnership applications">
              {filteredRequests.map((request, index) => (
                <div
                  key={request.id}
                  role="listitem"
                  aria-posinset={index + 1}
                  aria-setsize={filteredRequests.length}
                >
                  <PartnershipRequestItem
                    request={request}
                    onViewDetails={handleViewDetails}
                    onApprove={handleApprove}
                    onReject={handleRejectClick}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Professional Modal Components */}
      {isDetailModalOpen && selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedRequest(null);
          }}
          onApprove={handleApprove}
          onReject={(request) => {
            setRequestToReject(request);
            setIsRejectModalOpen(true);
          }}
        />
      )}

      {isRejectModalOpen && requestToReject && (
        <RejectModal
          request={requestToReject}
          rejectionReason=""
          setRejectionReason={() => {}}
          onClose={() => {
            setIsRejectModalOpen(false);
            setRequestToReject(null);
          }}
          onConfirm={() => handleReject(requestToReject, 'Rejected by admin')}
        />
      )}
    </div>
  );
}