import { useState } from 'react';
import { X, AlertTriangle, FileText, Send } from 'lucide-react';
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
}

interface TaskRejectModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onReject: (taskId: string, reason: string, feedback: string) => void;
}

const rejectionReasons = [
  { value: 'insufficient_details', label: 'Insufficient project details' },
  { value: 'unrealistic_timeline', label: 'Unrealistic timeline expectations' },
  { value: 'budget_constraints', label: 'Budget constraints or payment issues' },
  { value: 'outside_expertise', label: 'Outside our area of expertise' },
  { value: 'policy_violation', label: 'Violates platform policies' },
  { value: 'incomplete_requirements', label: 'Incomplete requirements' },
  { value: 'duplicate_request', label: 'Duplicate or similar request exists' },
  { value: 'other', label: 'Other (specify in feedback)' }
];

export function TaskRejectModal({ task, isOpen, onClose, onReject }: TaskRejectModalProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedReason) {
      toast.error('Please select a rejection reason');
      return;
    }

    if (!feedback.trim()) {
      toast.error('Please provide feedback to help the student understand the rejection');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onReject(task.id, selectedReason, feedback.trim());
      
      toast.success('Task rejected successfully', {
        description: 'The student has been notified of the rejection with your feedback.'
      });
      
      // Reset form
      setSelectedReason('');
      setFeedback('');
      onClose();
    } catch (error) {
      toast.error('Failed to reject task', {
        description: 'Please try again or contact support if the issue persists.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getReasonLabel = (value: string) => {
    const reason = rejectionReasons.find(r => r.value === value);
    return reason ? reason.label : value;
  };

  return (
    <div className="add-deliverable-overlay">
      <div className="add-deliverable-modal" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <div className="modal-title-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h2 style={{ color: '#dc2626' }}>Reject Task</h2>
            </div>
            <p>Provide feedback to help the student understand the rejection</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Task Info */}
        <div style={{ padding: '0 2rem', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ padding: '1rem', backgroundColor: '#fef2f2', borderRadius: '0.5rem', border: '1px solid #fecaca', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#dc2626', margin: '0 0 0.5rem 0' }}>
              {task.title}
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#7f1d1d', margin: 0 }}>
              Submitted by: {task.student.name}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="deliverable-form">
          <div className="form-section">
            <h3>Rejection Reason</h3>
            <p className="section-description">
              Select the primary reason for rejecting this task. This will help the student understand what went wrong.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
              {rejectionReasons.map((reason) => (
                <label 
                  key={reason.value}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem',
                    padding: '1rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: selectedReason === reason.value ? '#eff6ff' : 'white',
                    borderColor: selectedReason === reason.value ? '#3b82f6' : '#e2e8f0'
                  }}
                >
                  <input
                    type="radio"
                    name="rejectionReason"
                    value={reason.value}
                    checked={selectedReason === reason.value}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    style={{ margin: 0 }}
                  />
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1e293b' }}>
                      {reason.label}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h3>Detailed Feedback</h3>
            <p className="section-description">
              Provide specific feedback to help the student improve their request. Be constructive and suggest what they can do better.
            </p>
            
            <div className="form-group">
              <label className="form-label">
                <FileText className="w-4 h-4 inline mr-2" />
                Feedback Message *
              </label>
              <textarea
                className="form-textarea"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Explain why this task is being rejected and provide suggestions for improvement..."
                rows={6}
                style={{ minHeight: '120px' }}
                required
              />
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                {feedback.length}/500 characters
              </div>
            </div>
          </div>

          {/* Preview */}
          {selectedReason && feedback && (
            <div className="form-section">
              <h3>Preview</h3>
              <p className="section-description">
                This is how your rejection will appear to the student:
              </p>
              
              <div style={{ 
                padding: '1rem', 
                backgroundColor: '#fef2f2', 
                borderRadius: '0.5rem', 
                border: '1px solid #fecaca',
                marginTop: '0.5rem'
              }}>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#dc2626', marginBottom: '0.5rem' }}>
                  Task Rejected: {getReasonLabel(selectedReason)}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#7f1d1d', lineHeight: '1.5' }}>
                  {feedback}
                </div>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn" 
              style={{ backgroundColor: '#dc2626', color: 'white' }}
              disabled={isSubmitting || !selectedReason || !feedback.trim()}
            >
              {isSubmitting ? (
                <>
                  <div style={{ 
                    width: '16px', 
                    height: '16px', 
                    border: '2px solid #ffffff40', 
                    borderTop: '2px solid #ffffff', 
                    borderRadius: '50%', 
                    animation: 'spin 1s linear infinite',
                    marginRight: '0.5rem'
                  }} />
                  Rejecting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Reject Task
                </>
              )}
            </button>
          </div>
        </form>

        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    </div>
  );
}