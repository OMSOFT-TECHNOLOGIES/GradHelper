import { School, User, Calendar, Eye, CheckCircle, XCircle } from 'lucide-react';
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

interface PartnershipRequestItemProps {
  request: PartnershipRequest;
  onViewDetails: (request: PartnershipRequest) => void;
  onApprove: (request: PartnershipRequest) => void;
  onReject: (request: PartnershipRequest) => void;
}

export function PartnershipRequestItem({ 
  request, 
  onViewDetails, 
  onApprove, 
  onReject 
}: PartnershipRequestItemProps) {
  return (
    <div className="partnership-request-item">
      <div className="request-header">
        <div className="request-user">
          <div className="avatar w-12 h-12">
            <img src={request.userAvatar} alt={request.userName} />
          </div>
          <div className="user-info">
            <h4 className="user-name">{request.userName}</h4>
            <p className="user-email">{request.userEmail}</p>
            <div className="user-meta">
              <span className="meta-item">
                <School className="w-3 h-3" />
                {request.school}
              </span>
              <span className="meta-item">
                <User className="w-3 h-3" />
                {request.year} Year • {request.course}
              </span>
              <span className="meta-item">
                <Calendar className="w-3 h-3" />
                {new Date(request.submittedDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        
        <div className="request-status">
          <span className={`badge ${getStatusColor(request.status)}`}>
            {getStatusIcon(request.status)}
            {request.status}
          </span>
          {request.reviewedDate && (
            <p className="review-info">
              Reviewed on {new Date(request.reviewedDate).toLocaleDateString()}
              {request.reviewedBy && ` by ${request.reviewedBy}`}
            </p>
          )}
        </div>
      </div>

      <div className="request-preview">
        <div className="motivation-preview">
          <strong>Motivation:</strong> {request.motivation.slice(0, 150)}
          {request.motivation.length > 150 && '...'}
        </div>
        {request.experience && (
          <div className="experience-preview">
            <strong>Experience:</strong> {request.experience.slice(0, 100)}
            {request.experience.length > 100 && '...'}
          </div>
        )}
      </div>

      <div className="request-actions">
        <button 
          className="btn btn-outline btn-sm"
          onClick={() => onViewDetails(request)}
        >
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </button>
        
        {request.status === 'pending' && (
          <>
            <button 
              className="btn btn-success btn-sm"
              onClick={() => onApprove(request)}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </button>
            <button 
              className="btn btn-error btn-sm"
              onClick={() => onReject(request)}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </button>
          </>
        )}
      </div>
    </div>
  );
}