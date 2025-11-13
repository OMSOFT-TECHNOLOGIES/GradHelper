import { XCircle, CheckCircle } from 'lucide-react';
import { getStatusColor, getStatusIcon } from './helpers';

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

interface RequestDetailModalProps {
  request: PartnershipRequest;
  onClose: () => void;
  onApprove: (request: PartnershipRequest) => void;
  onReject: (request: PartnershipRequest) => void;
}

export function RequestDetailModal({ 
  request, 
  onClose, 
  onApprove, 
  onReject 
}: RequestDetailModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal modal-xl">
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Partnership Application Details</h3>
          </div>
          <button className="modal-close" onClick={onClose}>
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        
        <div className="modal-content">
          <div className="space-y-6">
            {/* Applicant Info */}
            <div className="applicant-section">
              <h4 className="section-title">Applicant Information</h4>
              <div className="applicant-details">
                <div className="avatar w-16 h-16 mb-4">
                  <img src={request.userAvatar} alt={request.userName} />
                </div>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Name:</label>
                    <span>{request.userName}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email:</label>
                    <span>{request.userEmail}</span>
                  </div>
                  <div className="detail-item">
                    <label>School:</label>
                    <span>{request.school}</span>
                  </div>
                  <div className="detail-item">
                    <label>Year of Study:</label>
                    <span>{request.year}</span>
                  </div>
                  <div className="detail-item">
                    <label>Course/Major:</label>
                    <span>{request.course}</span>
                  </div>
                  <div className="detail-item">
                    <label>Submitted:</label>
                    <span>{new Date(request.submittedDate).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Application Details */}
            <div className="application-section">
              <h4 className="section-title">Application Details</h4>
              <div className="space-y-4">
                <div className="detail-block">
                  <label className="detail-label">Why do you want to become a representative?</label>
                  <p className="detail-text">{request.motivation}</p>
                </div>
                
                {request.experience && (
                  <div className="detail-block">
                    <label className="detail-label">Relevant Experience</label>
                    <p className="detail-text">{request.experience}</p>
                  </div>
                )}
                
                {request.socialMedia && (
                  <div className="detail-block">
                    <label className="detail-label">Social Media Presence</label>
                    <p className="detail-text">{request.socialMedia}</p>
                  </div>
                )}

                <div className="detail-block">
                  <label className="detail-label">Assigned Referral Code</label>
                  <p className="detail-text font-mono bg-muted p-2 rounded">{request.referralCode}</p>
                </div>
              </div>
            </div>

            {/* Status Section */}
            <div className="status-section">
              <h4 className="section-title">Application Status</h4>
              <div className="status-details">
                <span className={`badge ${getStatusColor(request.status)} text-lg px-3 py-1`}>
                  {getStatusIcon(request.status)}
                  {request.status}
                </span>
                
                {request.reviewedDate && (
                  <div className="review-details mt-2">
                    <p><strong>Reviewed:</strong> {new Date(request.reviewedDate).toLocaleString()}</p>
                    {request.reviewedBy && (
                      <p><strong>Reviewed by:</strong> {request.reviewedBy}</p>
                    )}
                    {request.rejectionReason && (
                      <div className="rejection-reason mt-2 p-3 bg-red-50 border border-red-200 rounded">
                        <p><strong>Rejection Reason:</strong></p>
                        <p className="mt-1">{request.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
          
          {request.status === 'pending' && (
            <>
              <button 
                className="btn btn-error"
                onClick={() => onReject(request)}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </button>
              <button 
                className="btn btn-success"
                onClick={() => onApprove(request)}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve Application
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}