import { useState, useEffect } from 'react';
import { useNotifications } from './NotificationContext';
import { UserCheck } from 'lucide-react';
import { toast } from "sonner";
import { FiltersSection } from './partnership/FiltersSection';
import { PartnershipRequestItem } from './partnership/PartnershipRequestItem';
import { RequestDetailModal } from './partnership/RequestDetailModal';
import { RejectModal } from './partnership/RejectModal';
import { filterRequests, getRequestCounts } from './partnership/helpers';
import { ADMIN_NAME } from './partnership/constants';

interface PartnershipRequest {
  id: number;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar: string;
  school: string;
  year: string;
  course: string;
  motivation: string;
  experience: string;
  socialMedia: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
  reviewedDate?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  referralCode: string;
}

export function PartnershipRequestsView() {
  const { addNotification } = useNotifications();
  const [requests, setRequests] = useState<PartnershipRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<PartnershipRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Load partnership requests from localStorage
  useEffect(() => {
    const savedRequests = localStorage.getItem('partnership_requests');
    if (savedRequests) {
      setRequests(JSON.parse(savedRequests));
    }
  }, []);

  const filteredRequests = filterRequests(requests, filter, searchTerm);
  const { pending: pendingCount, approved: approvedCount, rejected: rejectedCount } = getRequestCounts(requests);

  const updatePartnershipData = (request: PartnershipRequest, status: 'approved' | 'rejected', rejectionReason?: string) => {
    const partnershipData = {
      isPartner: status === 'approved',
      status,
      school: status === 'approved' ? request.school : '',
      referralCode: status === 'approved' ? request.referralCode : '',
      totalReferrals: 0,
      successfulReferrals: 0,
      totalEarnings: 0,
      pendingEarnings: 0,
      joinedDate: status === 'approved' ? request.submittedDate : '',
      ...(rejectionReason && { rejectionReason })
    };

    localStorage.setItem(`partnership_${request.userId}`, JSON.stringify(partnershipData));
  };

  const handleApprove = (request: PartnershipRequest) => {
    const updatedRequests = requests.map(req => 
      req.id === request.id 
        ? { 
            ...req, 
            status: 'approved' as const, 
            reviewedDate: new Date().toISOString(),
            reviewedBy: ADMIN_NAME
          }
        : req
    );

    setRequests(updatedRequests);
    localStorage.setItem('partnership_requests', JSON.stringify(updatedRequests));

    updatePartnershipData(request, 'approved');

    // Send notifications
    addNotification({
      type: 'system',
      title: 'Partnership Application Approved! 🎉',
      message: `Congratulations! You are now an official TheGradHelper representative at ${request.school}. Your referral code is: ${request.referralCode}`,
      userId: request.userId,
      userRole: 'student',
      data: { 
        type: 'partnership_approved',
        school: request.school,
        referralCode: request.referralCode
      }
    });

    addNotification({
      type: 'system',
      title: 'Partnership Request Approved',
      message: `${request.userName}'s partnership application has been approved.`,
      userId: 'admin',
      userRole: 'admin',
      data: { type: 'admin_action' }
    });

    // Show success toast
    toast.success('Partnership approved successfully!', {
      description: `${request.userName} from ${request.school} is now a TheGradHelper partner.`
    });

    setShowDetailModal(false);
    setSelectedRequest(null);
  };

  const handleReject = () => {
    if (!selectedRequest || !rejectionReason.trim()) return;

    const updatedRequests = requests.map(req => 
      req.id === selectedRequest.id 
        ? { 
            ...req, 
            status: 'rejected' as const, 
            reviewedDate: new Date().toISOString(),
            reviewedBy: ADMIN_NAME,
            rejectionReason: rejectionReason.trim()
          }
        : req
    );

    setRequests(updatedRequests);
    localStorage.setItem('partnership_requests', JSON.stringify(updatedRequests));

    updatePartnershipData(selectedRequest, 'rejected', rejectionReason.trim());

    // Send notifications
    addNotification({
      type: 'system',
      title: 'Partnership Application Update',
      message: `Your partnership application for ${selectedRequest.school} has been reviewed. Please check your partnership page for details.`,
      userId: selectedRequest.userId,
      userRole: 'student',
      data: { 
        type: 'partnership_rejected',
        reason: rejectionReason.trim()
      }
    });

    addNotification({
      type: 'system',
      title: 'Partnership Request Rejected',
      message: `${selectedRequest.userName}'s partnership application has been rejected.`,
      userId: 'admin',
      userRole: 'admin',
      data: { type: 'admin_action' }
    });

    // Show rejection toast
    toast.error('Partnership request rejected', {
      description: `${selectedRequest.userName}'s application has been rejected with feedback.`
    });

    setShowRejectModal(false);
    setShowDetailModal(false);
    setSelectedRequest(null);
    setRejectionReason('');
  };

  const handleViewDetails = (request: PartnershipRequest) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const handleRejectClick = (request: PartnershipRequest) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Partnership Requests</h1>
          <p className="text-muted-foreground">Review and manage student partnership applications</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="stats-summary">
            <div className="stat-item">
              <span className="stat-value text-yellow-600">{pendingCount}</span>
              <span className="stat-label">Pending</span>
            </div>
            <div className="stat-item">
              <span className="stat-value text-green-600">{approvedCount}</span>
              <span className="stat-label">Approved</span>
            </div>
            <div className="stat-item">
              <span className="stat-value text-red-600">{rejectedCount}</span>
              <span className="stat-label">Rejected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <FiltersSection 
        filter={filter}
        setFilter={setFilter}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {/* Requests List */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Partnership Applications</h2>
          <p className="card-description">
            {filteredRequests.length} {filteredRequests.length === 1 ? 'application' : 'applications'} found
          </p>
        </div>
        <div className="card-content">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No Applications Found</h3>
              <p className="text-muted-foreground">
                {searchTerm || filter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No partnership applications have been submitted yet.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <PartnershipRequestItem
                  key={request.id}
                  request={request}
                  onViewDetails={handleViewDetails}
                  onApprove={handleApprove}
                  onReject={handleRejectClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showDetailModal && selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          onClose={() => setShowDetailModal(false)}
          onApprove={handleApprove}
          onReject={handleRejectClick}
        />
      )}

      {showRejectModal && selectedRequest && (
        <RejectModal
          request={selectedRequest}
          rejectionReason={rejectionReason}
          setRejectionReason={setRejectionReason}
          onClose={() => setShowRejectModal(false)}
          onConfirm={handleReject}
        />
      )}
    </div>
  );
}