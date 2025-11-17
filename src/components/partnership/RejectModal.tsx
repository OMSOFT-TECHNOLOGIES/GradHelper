/**
 * Professional Rejection Modal Component
 * 
 * Provides a comprehensive interface for rejecting partnership applications
 * with validation, pre-defined reasons, and accessibility features
 */

import React, { useState, useCallback, useEffect } from 'react';
import { X, XCircle, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { RejectModalProps } from '../../types/partnership';
import { COMMON_REJECTION_REASONS, PARTNERSHIP_CONFIG } from './constants';
import { getInitials } from './helpers';

export function RejectModal({ 
  request, 
  rejectionReason, 
  setRejectionReason, 
  onClose, 
  onConfirm,
  isLoading = false,
  errors = {}
}: RejectModalProps) {
  const [selectedCommonReason, setSelectedCommonReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [characterCount, setCharacterCount] = useState<number>(0);

  // Update character count when rejection reason changes
  useEffect(() => {
    setCharacterCount(rejectionReason.length);
  }, [rejectionReason]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose, isLoading]);

  // Handle common reason selection
  const handleCommonReasonSelect = useCallback((reason: string) => {
    setSelectedCommonReason(reason);
    setRejectionReason(reason);
    setIsCustom(false);
    setCustomReason('');
  }, [setRejectionReason]);

  // Handle custom reason input
  const handleCustomReasonChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setCustomReason(value);
    setRejectionReason(value);
    setIsCustom(true);
    setSelectedCommonReason('');
  }, [setRejectionReason]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim() || isLoading) return;
    await onConfirm();
  }, [rejectionReason, onConfirm, isLoading]);

  // Validation state
  const isValid = rejectionReason.trim().length >= 10;
  const isTooLong = rejectionReason.length > 500;
  const hasError = errors.rejectionReason || isTooLong;

  return (
    <div 
      className="modal-overlay" 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="reject-modal-title"
      onClick={(e) => e.target === e.currentTarget && !isLoading && onClose()}
    >
      <div className="modal modal-lg">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-section">
            <h3 id="reject-modal-title" className="modal-title">
              Reject Partnership Application
            </h3>
            <p className="modal-subtitle">
              Provide constructive feedback for improvement
            </p>
          </div>
          <button 
            type="button"
            className="modal-close" 
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close rejection form"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-content">
            <div className="space-y-6">
              {/* Applicant Summary */}
              <div className="applicant-summary">
                <div className="summary-header">
                  <div className="applicant-avatar">
                    {request.userAvatar ? (
                      <img 
                        src={request.userAvatar} 
                        alt="" 
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="avatar-fallback w-12 h-12">
                        {getInitials(request.userName)}
                      </div>
                    )}
                  </div>
                  <div className="summary-info">
                    <h4>{request.userName}</h4>
                    <p className="text-muted-foreground">{request.school}</p>
                    <p className="text-sm text-muted-foreground">
                      {request.year} Year • {request.course}
                    </p>
                  </div>
                </div>
                
                <div className="rejection-warning" role="alert">
                  <AlertTriangle className="w-5 h-5 text-amber-600" aria-hidden="true" />
                  <div>
                    <p className="font-medium">Important Considerations</p>
                    <p className="text-sm">
                      The applicant will be notified and can reapply after addressing your feedback. 
                      Please provide constructive, specific feedback to help them improve.
                    </p>
                  </div>
                </div>
              </div>

              {/* Rejection Reason Selection */}
              <div className="rejection-reason-section">
                <h5 className="section-subtitle">Select a Rejection Reason</h5>
                
                {/* Common Reasons */}
                <div className="common-reasons">
                  <p className="form-label">Common rejection reasons:</p>
                  <div className="reason-buttons">
                    {COMMON_REJECTION_REASONS.map((reason) => (
                      <button
                        key={reason}
                        type="button"
                        className={`reason-button ${selectedCommonReason === reason ? 'selected' : ''}`}
                        onClick={() => handleCommonReasonSelect(reason)}
                        disabled={isLoading}
                      >
                        {selectedCommonReason === reason && (
                          <CheckCircle2 className="w-4 h-4 mr-2" aria-hidden="true" />
                        )}
                        {reason}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Reason */}
                <div className="custom-reason">
                  <label htmlFor="custom-reason" className="form-label">
                    Or provide a custom reason:
                  </label>
                  <div className="textarea-container">
                    <textarea
                      id="custom-reason"
                      className={`form-input ${hasError ? 'form-input-error' : ''}`}
                      rows={4}
                      placeholder="Please provide specific, constructive feedback that will help the applicant understand how to improve their application..."
                      value={customReason}
                      onChange={handleCustomReasonChange}
                      disabled={isLoading}
                      aria-describedby="reason-help reason-count"
                      maxLength={500}
                    />
                    
                    {/* Character Counter */}
                    <div 
                      id="reason-count" 
                      className={`character-counter ${isTooLong ? 'over-limit' : ''}`}
                    >
                      {characterCount}/500 characters
                    </div>
                  </div>

                  {/* Error Messages */}
                  {hasError && (
                    <div className="form-error" role="alert">
                      {errors.rejectionReason || (isTooLong && 'Reason cannot exceed 500 characters')}
                    </div>
                  )}

                  {/* Help Text */}
                  <p id="reason-help" className="form-help">
                    Provide specific feedback about what the applicant can improve. 
                    Examples: academic performance, experience, application clarity, etc.
                  </p>
                </div>
              </div>

              {/* Final Reason Display */}
              {rejectionReason.trim() && (
                <div className="final-reason-preview">
                  <h5 className="section-subtitle">Final Rejection Reason</h5>
                  <div className="reason-preview">
                    <div className="preview-header">
                      <XCircle className="w-4 h-4 text-red-600" aria-hidden="true" />
                      <span className="font-medium">This message will be sent to the applicant:</span>
                    </div>
                    <blockquote className="reason-text">
                      "{rejectionReason}"
                    </blockquote>
                  </div>
                </div>
              )}

              {/* Guidelines */}
              <div className="rejection-guidelines">
                <h5 className="section-subtitle">Rejection Guidelines</h5>
                <ul className="guideline-list">
                  <li>
                    <CheckCircle2 className="w-4 h-4 text-green-600" aria-hidden="true" />
                    Be specific about what needs improvement
                  </li>
                  <li>
                    <CheckCircle2 className="w-4 h-4 text-green-600" aria-hidden="true" />
                    Provide actionable feedback when possible
                  </li>
                  <li>
                    <CheckCircle2 className="w-4 h-4 text-green-600" aria-hidden="true" />
                    Maintain a professional and supportive tone
                  </li>
                  <li>
                    <Clock className="w-4 h-4 text-blue-600" aria-hidden="true" />
                    Applicant can reapply after addressing feedback
                  </li>
                </ul>
              </div>
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
              Cancel
            </button>
            
            <button
              type="submit"
              className="btn btn-error"
              disabled={!isValid || isLoading || Boolean(hasError)}
              aria-describedby="submit-help"
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner" aria-hidden="true"></div>
                  Processing...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                  Reject Application
                </>
              )}
            </button>
          </div>
          
          <p id="submit-help" className="text-sm text-muted-foreground text-center mt-2">
            The applicant will receive an email notification with your feedback
          </p>
        </form>
      </div>
    </div>
  );
}