import { XCircle } from 'lucide-react';

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

interface RejectModalProps {
  request: PartnershipRequest;
  rejectionReason: string;
  setRejectionReason: (reason: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export function RejectModal({ 
  request, 
  rejectionReason, 
  setRejectionReason, 
  onClose, 
  onConfirm 
}: RejectModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal modal-md">
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Reject Partnership Application</h3>
          </div>
          <button className="modal-close" onClick={onClose}>
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        
        <div className="modal-content">
          <div className="space-y-4">
            <p>
              You are about to reject <strong>{request.userName}</strong>'s partnership 
              application for <strong>{request.school}</strong>.
            </p>
            
            <div className="form-group">
              <label className="form-label">Reason for Rejection *</label>
              <textarea
                className="form-input"
                rows={4}
                placeholder="Please provide a clear reason for rejection that will help the student understand what they can improve..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
              />
            </div>
            
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> The student will be notified of the rejection and can reapply after addressing the feedback.
              </p>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={!rejectionReason.trim()}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Reject Application
          </button>
        </div>
      </div>
    </div>
  );
}