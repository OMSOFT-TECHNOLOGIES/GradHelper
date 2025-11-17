/**
 * Professional Partnership Request Item Component
 * 
 * Displays partnership request information with professional styling,
 * accessibility features, and intuitive user interactions
 */

import React, { useState, useCallback } from 'react';
import { 
  School, 
  User, 
  Calendar, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Mail,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { PartnershipRequestItemProps } from '../../types/partnership';
import { 
  getStatusColor, 
  getStatusIcon, 
  formatDate, 
  getTimeElapsed, 
  truncateText,
  getInitials
} from './helpers';

export function PartnershipRequestItem({ 
  request, 
  onViewDetails, 
  onApprove, 
  onReject,
  isLoading = false
}: PartnershipRequestItemProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Handle expand/collapse
  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  // Handle approve with loading state
  const handleApprove = useCallback(async () => {
    if (isLoading) return;
    await onApprove(request);
  }, [onApprove, request, isLoading]);

  // Handle view details
  const handleViewDetails = useCallback(() => {
    onViewDetails(request);
  }, [onViewDetails, request]);

  // Handle reject
  const handleReject = useCallback(() => {
    if (isLoading) return;
    onReject(request);
  }, [onReject, request, isLoading]);

  const isPending = request.status === 'pending';
  const isApproved = request.status === 'approved';
  const isRejected = request.status === 'rejected';

  return (
    <article 
      className="partnership-request-item"
      role="article"
      aria-labelledby={`request-title-${request.id}`}
    >
      <div className="request-header">
        <div className="request-user">
          {/* Avatar with fallback */}
          <div className="avatar w-12 h-12" role="img" aria-label={`${request.userName}'s avatar`}>
            {request.userAvatar ? (
              <img 
                src={request.userAvatar} 
                alt="" 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`avatar-fallback ${request.userAvatar ? 'hidden' : ''}`}>
              {getInitials(request.userName)}
            </div>
          </div>

          <div className="user-info">
            <h4 id={`request-title-${request.id}`} className="user-name">
              {request.userName}
            </h4>
            <p className="user-email">
              <Mail className="w-3 h-3 inline mr-1" aria-hidden="true" />
              <a 
                href={`mailto:${request.userEmail}`}
                className="email-link"
                aria-label={`Send email to ${request.userName}`}
              >
                {request.userEmail}
              </a>
            </p>
            
            <div className="user-meta">
              <span className="meta-item">
                <School className="w-3 h-3" aria-hidden="true" />
                <span className="meta-text">{request.school}</span>
              </span>
              <span className="meta-item">
                <User className="w-3 h-3" aria-hidden="true" />
                <span className="meta-text">{request.year} Year • {request.course}</span>
              </span>
              <span className="meta-item">
                <Calendar className="w-3 h-3" aria-hidden="true" />
                <span className="meta-text">
                  {formatDate(request.submittedDate)}
                  <span className="time-elapsed">({getTimeElapsed(request.submittedDate)})</span>
                </span>
              </span>
            </div>
          </div>
        </div>
        
        <div className="request-status">
          <span 
            className={`badge ${getStatusColor(request.status)}`}
            aria-label={`Status: ${request.status}`}
          >
            {getStatusIcon(request.status)}
            <span className="status-text">{request.status.charAt(0).toUpperCase() + request.status.slice(1)}</span>
          </span>

          {/* Review Information */}
          {request.reviewedDate && (
            <div className="review-info">
              <p className="review-text">
                <Clock className="w-3 h-3 inline mr-1" aria-hidden="true" />
                Reviewed {getTimeElapsed(request.reviewedDate)}
                {request.reviewedBy && (
                  <span className="reviewer"> by {request.reviewedBy}</span>
                )}
              </p>
            </div>
          )}

          {/* Urgent indicator for old pending requests */}
          {isPending && (
            (() => {
              const daysSinceSubmission = Math.floor(
                (Date.now() - new Date(request.submittedDate).getTime()) / (1000 * 60 * 60 * 24)
              );
              return daysSinceSubmission > 3 ? (
                <div className="urgent-indicator" role="alert">
                  <AlertTriangle className="w-3 h-3" aria-hidden="true" />
                  <span className="urgent-text">Needs Review</span>
                </div>
              ) : null;
            })()
          )}
        </div>
      </div>

      {/* Request Preview */}
      <div className="request-preview">
        <div className="motivation-preview">
          <strong>Motivation:</strong>{' '}
          <span className="preview-text">
            {isExpanded ? request.motivation : truncateText(request.motivation, 150)}
          </span>
        </div>
        
        {request.experience && (
          <div className="experience-preview">
            <strong>Experience:</strong>{' '}
            <span className="preview-text">
              {isExpanded ? request.experience : truncateText(request.experience, 100)}
            </span>
          </div>
        )}

        {/* Expand/Collapse Button */}
        {(request.motivation.length > 150 || (request.experience && request.experience.length > 100)) && (
          <button 
            type="button"
            className="expand-btn"
            onClick={toggleExpanded}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Show less' : 'Show more'}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" aria-hidden="true" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" aria-hidden="true" />
                Show More
              </>
            )}
          </button>
        )}

        {/* Additional Details when expanded */}
        {isExpanded && (
          <div className="expanded-details">
            {request.socialMedia && (
              <div className="social-media-info">
                <strong>Social Media:</strong>{' '}
                <span className="social-text">{request.socialMedia}</span>
              </div>
            )}
            <div className="referral-code-info">
              <strong>Referral Code:</strong>{' '}
              <code className="referral-code">{request.referralCode}</code>
            </div>
          </div>
        )}

        {/* Rejection Reason */}
        {isRejected && request.rejectionReason && (
          <div className="rejection-reason" role="alert">
            <strong>Rejection Reason:</strong>{' '}
            <span className="reason-text">{request.rejectionReason}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="request-actions">
        <button 
          type="button"
          className="btn btn-outline btn-sm"
          onClick={handleViewDetails}
          disabled={isLoading}
          aria-label={`View detailed information for ${request.userName}'s application`}
        >
          <Eye className="w-4 h-4 mr-2" aria-hidden="true" />
          View Details
        </button>
        
        {isPending && (
          <>
            <button 
              type="button"
              className="btn btn-success btn-sm"
              onClick={handleApprove}
              disabled={isLoading}
              aria-label={`Approve ${request.userName}'s partnership application`}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner" aria-hidden="true"></div>
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                  Approve
                </>
              )}
            </button>
            <button 
              type="button"
              className="btn btn-error btn-sm"
              onClick={handleReject}
              disabled={isLoading}
              aria-label={`Reject ${request.userName}'s partnership application`}
            >
              <XCircle className="w-4 h-4 mr-2" aria-hidden="true" />
              Reject
            </button>
          </>
        )}
      </div>
    </article>
  );
}