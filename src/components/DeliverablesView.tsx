import { useState, useEffect } from 'react';
import { useNotifications } from './NotificationContext';
import { CheckSquare, Edit3, FileText, X, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { taskService, Deliverable } from '../services/taskService';
import { toast } from "sonner";

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
  
  // API state management
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch user's deliverables from backend
  const fetchDeliverables = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await taskService.getUserDeliverables();
      
      if (response.success) {
        setDeliverables(response.data);
      } else {
        throw new Error('Failed to fetch deliverables');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch deliverables';
      setError(errorMessage);
      
      toast.error('Failed to load deliverables', {
        description: errorMessage,
        action: {
          label: 'Retry',
          onClick: () => fetchDeliverables(),
        },
      });
      
      console.error('Error fetching deliverables:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch deliverables on component mount
  useEffect(() => {
    fetchDeliverables();
  }, []);

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
    // Update local state optimistically
    setDeliverables(prev =>
      prev.map(item =>
        item.id === deliverable.id
          ? { ...item, status: status as any, feedback: feedbackText || item.feedback }
          : item
      )
    );

    // TODO: Add API call to update deliverable status on backend
    // await taskService.updateDeliverableStatus(deliverable.id, status, feedbackText);

    // Send notification to student
    const notificationTitle = status === 'completed' 
      ? 'Deliverable Approved' 
      : status === 'needs_revision'
      ? 'Deliverable Needs Revision'
      : 'Deliverable Updated';

    const notificationMessage = status === 'completed'
      ? `Your "${deliverable.title}" has been approved!`
      : status === 'needs_revision'
      ? `Your "${deliverable.title}" needs revision. Please check the feedback.`
      : `Your "${deliverable.title}" status has been updated.`;

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
        message: `You updated "${deliverable.title}" status to ${status.replace('_', ' ')}.`,
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
          <div className="flex items-center justify-between">
            <div>
              <h2 className="card-title">Deliverables</h2>
              <p className="card-description">
                {userRole === 'student' 
                  ? 'View all your deliverables across all tasks and track their progress'
                  : 'Review and manage all deliverables assigned to you'
                }
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <select
                className="px-3 py-2 border border-border rounded-lg"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="under_review">Under Review</option>
                <option value="completed">Completed</option>
                <option value="needs_revision">Needs Revision</option>
              </select>
              
              <button
                onClick={() => fetchDeliverables()}
                disabled={loading}
                className="btn btn-outline btn-sm"
                title="Refresh deliverables"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
        <div className="card-content">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-muted-foreground">Loading deliverables...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 font-medium mb-2">Failed to load deliverables</p>
                <p className="text-muted-foreground mb-4">{error}</p>
                <button
                  onClick={() => fetchDeliverables()}
                  className="btn btn-outline btn-sm"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && (deliverables.length === 0 || deliverables.filter(item => statusFilter === 'all' || item.status === statusFilter).length === 0) && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium mb-2">No deliverables found</p>
                <p className="text-muted-foreground">
                  {deliverables.length === 0 ? (
                    userRole === 'student' 
                      ? 'You haven\'t created any deliverables yet. Create tasks and add deliverables to get started.'
                      : 'No deliverables have been assigned to you for review yet.'
                  ) : (
                    statusFilter === 'all' 
                      ? 'No deliverables found.'
                      : `No deliverables with status "${statusFilter.replace('_', ' ')}" found.`
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Deliverables List */}
          {!loading && !error && deliverables.length > 0 && (
            <div className="space-y-4">
              {deliverables
                .filter(item => statusFilter === 'all' || item.status === statusFilter)
                .map((item) => (
              <div key={item.id} className="deliverable-item">
                <div className="deliverable-header">
                  <div className="deliverable-content">
                    <h4 className="deliverable-title">{item.title}</h4>
                    <p className="deliverable-subtitle">Task: {item.title || 'Unknown Task'}</p>
                    {userRole === 'admin' && item.student && (
                      <p className="deliverable-subtitle">Student: {item.student.name}</p>
                    )}
                    <div className="deliverable-meta">
                      <span className={`badge ${
                        item.status === 'completed' ? 'badge-success' :
                        item.status === 'under_review' ? 'badge-info' :
                        item.status === 'in_progress' ? 'badge-info' :
                        item.status === 'needs_revision' ? 'badge-warning' :
                        'badge-secondary'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </span>
                      {item.submittedAt && (
                        <span className="text-xs text-muted-foreground">
                          Submitted: {new Date(item.submittedAt).toLocaleDateString()}
                        </span>
                      )}
                      {!item.submittedAt && item.dueDate && (
                        <span className="text-xs text-muted-foreground">
                          Due: {new Date(item.dueDate).toLocaleDateString()}
                        </span>
                      )}
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
          )}
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
                Please provide feedback for "{selectedDeliverable?.title}" to help the student improve.
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