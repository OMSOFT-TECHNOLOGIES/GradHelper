import { useState } from 'react';
import { useNotifications } from './NotificationContext';
import { CheckSquare, Edit3, FileText, X } from 'lucide-react';

interface DeliverablesViewProps {
  userRole: 'student' | 'admin';
  user: any;
}

export function DeliverablesView({ userRole, user }: DeliverablesViewProps) {
  const { addNotification } = useNotifications();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState<any>(null);
  const [feedback, setFeedback] = useState('');
  const [newStatus, setNewStatus] = useState('');

  const [mockDeliverables, setMockDeliverables] = useState([
    {
      id: 1,
      taskId: "task-1",
      taskTitle: "Machine Learning Research Paper",
      deliverable: "Literature Review",
      status: "completed",
      submittedAt: "2025-01-25",
      feedback: "Excellent comprehensive review of current ML literature.",
      student: "John Smith",
      studentId: "student-1"
    },
    {
      id: 2,
      taskId: "task-1",
      taskTitle: "Machine Learning Research Paper",
      deliverable: "Methodology Section",
      status: "under_review",
      submittedAt: "2025-01-28",
      feedback: null,
      student: "John Smith",
      studentId: "student-1"
    },
    {
      id: 3,
      taskId: "task-2",
      taskTitle: "Database Design Assignment",
      deliverable: "ER Diagram",
      status: "needs_revision",
      submittedAt: "2025-01-26",
      feedback: "Please include cardinality constraints and refine relationship definitions.",
      student: "Sarah Johnson",
      studentId: "student-2"
    }
  ]);

  const handleStatusUpdate = (deliverable: any, status: string) => {
    if (status === 'needs_revision') {
      setSelectedDeliverable(deliverable);
      setNewStatus(status);
      setShowFeedbackModal(true);
    } else {
      updateDeliverableStatus(deliverable, status, '');
    }
  };

  const handleFeedbackSubmit = () => {
    if (selectedDeliverable) {
      updateDeliverableStatus(selectedDeliverable, newStatus, feedback);
      setShowFeedbackModal(false);
      setFeedback('');
      setSelectedDeliverable(null);
      setNewStatus('');
    }
  };

  const updateDeliverableStatus = (deliverable: any, status: string, feedbackText: string) => {
    setMockDeliverables(prev =>
      prev.map(item =>
        item.id === deliverable.id
          ? { ...item, status, feedback: feedbackText || item.feedback }
          : item
      )
    );

    // Send notification to student
    const notificationTitle = status === 'completed' 
      ? 'Deliverable Approved' 
      : status === 'needs_revision'
      ? 'Deliverable Needs Revision'
      : 'Deliverable Updated';

    const notificationMessage = status === 'completed'
      ? `Your "${deliverable.deliverable}" has been approved!`
      : status === 'needs_revision'
      ? `Your "${deliverable.deliverable}" needs revision. Please check the feedback.`
      : `Your "${deliverable.deliverable}" status has been updated.`;

    addNotification({
      type: status === 'completed' ? 'deliverable_approved' : 
            status === 'needs_revision' ? 'deliverable_rejected' : 'deliverable_feedback',
      title: notificationTitle,
      message: notificationMessage,
      userId: deliverable.studentId,
      userRole: 'student',
      data: { deliverableId: deliverable.id, taskId: deliverable.taskId }
    });

    // Also notify admin if it's a status change
    if (userRole === 'admin') {
      addNotification({
        type: 'system',
        title: 'Deliverable Status Updated',
        message: `You updated "${deliverable.deliverable}" status to ${status.replace('_', ' ')}.`,
        userId: user.id,
        userRole: 'admin',
        data: { deliverableId: deliverable.id, taskId: deliverable.taskId }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Deliverables</h2>
          <p className="card-description">
            {userRole === 'student' 
              ? 'Track your submitted deliverables and feedback'
              : 'Review and approve student deliverables'
            }
          </p>
        </div>
        <div className="card-content">
          <div className="space-y-4">
            {mockDeliverables.map((item) => (
              <div key={item.id} className="deliverable-item">
                <div className="deliverable-header">
                  <div className="deliverable-content">
                    <h4 className="deliverable-title">{item.deliverable}</h4>
                    <p className="deliverable-subtitle">{item.taskTitle}</p>
                    {userRole === 'admin' && (
                      <p className="deliverable-subtitle">Student: {item.student}</p>
                    )}
                    <div className="deliverable-meta">
                      <span className={`badge ${
                        item.status === 'completed' ? 'badge-success' :
                        item.status === 'under_review' ? 'badge-info' :
                        'badge-warning'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Submitted: {new Date(item.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {item.feedback && (
                      <div className="deliverable-feedback">
                        <p className="deliverable-feedback-title">Feedback:</p>
                        <p>{item.feedback}</p>
                      </div>
                    )}
                  </div>
                  <div className="deliverable-actions">
                    {userRole === 'admin' && (
                      <div className="admin-actions">
                        {item.status === 'under_review' && (
                          <>
                            <button 
                              className="btn btn-sm btn-outline"
                              onClick={() => handleStatusUpdate(item, 'needs_revision')}
                            >
                              <X className="w-4 h-4 mr-2" />
                              Reject
                            </button>
                            <button 
                              className="btn btn-sm btn-primary"
                              onClick={() => handleStatusUpdate(item, 'completed')}
                            >
                              <CheckSquare className="w-4 h-4 mr-2" />
                              Approve
                            </button>
                          </>
                        )}
                        {item.status === 'completed' && (
                          <button 
                            className="btn btn-sm btn-outline"
                            onClick={() => handleStatusUpdate(item, 'needs_revision')}
                          >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Request Changes
                          </button>
                        )}
                        {item.status === 'needs_revision' && (
                          <button 
                            className="btn btn-sm btn-primary"
                            onClick={() => handleStatusUpdate(item, 'completed')}
                          >
                            <CheckSquare className="w-4 h-4 mr-2" />
                            Mark Complete
                          </button>
                        )}
                      </div>
                    )}
                    {userRole === 'student' && item.status === 'needs_revision' && (
                      <button className="btn btn-sm btn-primary">
                        <FileText className="w-4 h-4 mr-2" />
                        Resubmit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="feedback-modal-overlay">
          <div className="feedback-modal">
            <div className="modal-header">
              <h3>Provide Feedback</h3>
              <button 
                className="modal-close"
                onClick={() => setShowFeedbackModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="modal-content">
              <p className="modal-description">
                Please provide feedback for "{selectedDeliverable?.deliverable}" to help the student improve.
              </p>
              <textarea
                className="feedback-textarea"
                rows={4}
                placeholder="Enter your feedback here..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-outline"
                onClick={() => setShowFeedbackModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleFeedbackSubmit}
                disabled={!feedback.trim()}
              >
                Send Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}