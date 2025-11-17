/**
 * Professional Request Detail Modal Component
 * 
 * Comprehensive view of partnership application details with
 * professional styling, accessibility, and admin actions
 */

import React, { useCallback, useEffect } from 'react';
import { 
  X, 
  CheckCircle, 
  XCircle, 
  Mail, 
  Phone, 
  School, 
  User, 
  Calendar, 
  Clock,
  Copy,
  ExternalLink,
  Download,
  AlertCircle
} from 'lucide-react';
import { RequestDetailModalProps } from '../../types/partnership';
import { 
  getStatusColor, 
  getStatusIcon, 
  formatDateTime, 
  getTimeElapsed,
  getInitials,
  isValidEmail
} from './helpers';

export function RequestDetailModal({ 
  request, 
  onClose, 
  onApprove, 
  onReject,
  isLoading = false
}: RequestDetailModalProps) {

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Handle approve action
  const handleApprove = useCallback(async () => {
    if (isLoading) return;
    await onApprove(request);
  }, [onApprove, request, isLoading]);

  // Handle reject action
  const handleReject = useCallback(() => {
    if (isLoading) return;
    onReject(request);
  }, [onReject, request, isLoading]);

  // Copy referral code to clipboard
  const copyReferralCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(request.referralCode);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy referral code:', error);
    }
  }, [request.referralCode]);

  // Generate email to applicant
  const composeEmail = useCallback(() => {
    const subject = `Partnership Application - ${request.school}`;
    const body = `Dear ${request.userName},\n\nThank you for your interest in becoming a TheGradHelper representative at ${request.school}.\n\nBest regards,\nTheGradHelper Partnership Team`;
    const mailtoUrl = `mailto:${request.userEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
  }, [request]);

  const isPending = request.status === 'pending';
  const isApproved = request.status === 'approved';
  const isRejected = request.status === 'rejected';

  return (
    <div 
      className="modal-overlay" 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal modal-xl">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-section">
            <h3 id="modal-title" className="modal-title">
              Partnership Application Review
            </h3>
            <p className="modal-subtitle">
              {request.userName} • {request.school}
            </p>
          </div>
          <button 
            type="button"
            className="modal-close" 
            onClick={onClose}
            aria-label="Close application details"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
        
        <div className="modal-content">
          <div className="space-y-8">
            {/* Applicant Information */}
            <section className="applicant-section">
              <h4 className="section-title">Applicant Information</h4>
              <div className="applicant-card">
                <div className="applicant-avatar">
                  {request.userAvatar ? (
                    <img 
                      src={request.userAvatar} 
                      alt="" 
                      className="w-20 h-20 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`avatar-fallback w-20 h-20 ${request.userAvatar ? 'hidden' : ''}`}>
                    {getInitials(request.userName)}
                  </div>
                </div>

                <div className="applicant-info">
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>
                        <User className="w-4 h-4 inline mr-2" aria-hidden="true" />
                        Full Name
                      </label>
                      <span>{request.userName}</span>
                    </div>
                    
                    <div className="detail-item">
                      <label>
                        <Mail className="w-4 h-4 inline mr-2" aria-hidden="true" />
                        Email Address
                      </label>
                      <div className="email-actions">
                        <span className={`email-address ${!isValidEmail(request.userEmail) ? 'invalid' : ''}`}>
                          {request.userEmail}
                        </span>
                        <button 
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={composeEmail}
                          aria-label="Send email to applicant"
                          title="Compose email"
                        >
                          <ExternalLink className="w-3 h-3" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="detail-item">
                      <label>
                        <School className="w-4 h-4 inline mr-2" aria-hidden="true" />
                        Institution
                      </label>
                      <span>{request.school}</span>
                    </div>
                    
                    <div className="detail-item">
                      <label>Year of Study</label>
                      <span>{request.year}</span>
                    </div>
                    
                    <div className="detail-item">
                      <label>Course/Major</label>
                      <span>{request.course}</span>
                    </div>
                    
                    <div className="detail-item">
                      <label>
                        <Calendar className="w-4 h-4 inline mr-2" aria-hidden="true" />
                        Application Date
                      </label>
                      <span>
                        {formatDateTime(request.submittedDate)}
                        <span className="time-elapsed">({getTimeElapsed(request.submittedDate)})</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Application Responses */}
            <section className="application-section">
              <h4 className="section-title">Application Responses</h4>
              <div className="application-responses">
                <div className="response-block">
                  <label className="response-label">
                    Why do you want to become a representative?
                    <span className="word-count">({request.motivation.split(' ').length} words)</span>
                  </label>
                  <div className="response-text">
                    {request.motivation}
                  </div>
                </div>
                
                {request.experience && (
                  <div className="response-block">
                    <label className="response-label">
                      Relevant Experience
                      <span className="word-count">({request.experience.split(' ').length} words)</span>
                    </label>
                    <div className="response-text">
                      {request.experience}
                    </div>
                  </div>
                )}
                
                {request.socialMedia && (
                  <div className="response-block">
                    <label className="response-label">Social Media Presence</label>
                    <div className="response-text">
                      {request.socialMedia}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Partnership Details */}
            <section className="partnership-section">
              <h4 className="section-title">Partnership Details</h4>
              <div className="partnership-info">
                <div className="referral-code-block">
                  <label className="detail-label">Assigned Referral Code</label>
                  <div className="referral-code-display">
                    <code className="referral-code">{request.referralCode}</code>
                    <button 
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={copyReferralCode}
                      aria-label="Copy referral code"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Status and Review Information */}
            <section className="status-section">
              <h4 className="section-title">Review Status</h4>
              <div className="status-card">
                <div className="status-badge-container">
                  <span 
                    className={`badge ${getStatusColor(request.status)} text-lg px-4 py-2`}
                    aria-label={`Current status: ${request.status}`}
                  >
                    {getStatusIcon(request.status, "w-5 h-5")}
                    <span className="status-text">
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </span>
                </div>
                
                {request.reviewedDate && (
                  <div className="review-details">
                    <div className="review-info-grid">
                      <div className="review-info-item">
                        <Clock className="w-4 h-4 mr-2" aria-hidden="true" />
                        <span>
                          Reviewed {getTimeElapsed(request.reviewedDate)}
                          {request.reviewedBy && (
                            <span className="reviewer-name"> by {request.reviewedBy}</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rejection Reason */}
                {isRejected && request.rejectionReason && (
                  <div className="rejection-reason-card" role="alert">
                    <div className="rejection-header">
                      <AlertCircle className="w-5 h-5 text-red-600" aria-hidden="true" />
                      <h5>Rejection Reason</h5>
                    </div>
                    <p className="rejection-text">{request.rejectionReason}</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="modal-actions">
          <button 
            type="button"
            className="btn btn-outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            Close
          </button>
          
          {/* Email Contact Button */}
          <button 
            type="button"
            className="btn btn-secondary"
            onClick={composeEmail}
            disabled={isLoading}
            aria-label="Send email to applicant"
          >
            <Mail className="w-4 h-4 mr-2" aria-hidden="true" />
            Contact Applicant
          </button>
          
          {/* Action buttons for pending applications */}
          {isPending && (
            <>
              <button 
                type="button"
                className="btn btn-error"
                onClick={handleReject}
                disabled={isLoading}
                aria-label="Reject this application"
              >
                <XCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                {isLoading ? 'Processing...' : 'Reject'}
              </button>
              <button 
                type="button"
                className="btn btn-success"
                onClick={handleApprove}
                disabled={isLoading}
                aria-label="Approve this application"
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner" aria-hidden="true"></div>
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                    Approve Application
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}