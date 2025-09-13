import { useState } from 'react';
import { 
  X, 
  Calendar, 
  User, 
  FileText, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Target,
  MessageSquare,
  Download,
  Edit,
  Trash2
} from 'lucide-react';
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  description: string;
  subject: string;
  status: 'pending' | 'in_progress' | 'completed' | 'revision_needed' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  createdAt: string;
  budget: number;
  student: string;
  deliverables: any[];
  requirements?: string;
  attachments?: any[];
  studentInfo?: {
    email: string;
    phone: string;
    university: string;
    course: string;
    year: string;
  };
}

interface TaskDetailModalProps {
  task: Task;
  userRole: 'student' | 'admin';
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdate: (updatedTask: Task) => void;
}

export function TaskDetailModal({ task, userRole, isOpen, onClose, onTaskUpdate }: TaskDetailModalProps) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'badge-success';
      case 'in_progress': return 'badge-info';
      case 'pending': return 'badge-warning';
      case 'revision_needed': return 'badge-error';
      case 'rejected': return 'badge-error';
      default: return 'badge-secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleStatusUpdate = (newStatus: string) => {
    const updatedTask = { ...task, status: newStatus as any };
    onTaskUpdate(updatedTask);
    toast.success(`Task status updated to ${newStatus.replace('_', ' ')}`);
  };

  const handleContactStudent = () => {
    toast.info('Opening messaging system...');
    // This would typically navigate to the messaging system with the student pre-selected
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'deliverables', label: 'Deliverables', icon: CheckCircle },
    { id: 'student', label: 'Student Info', icon: User },
    { id: 'timeline', label: 'Timeline', icon: Clock }
  ];

  const mockStudentInfo = {
    email: 'student@university.edu',
    phone: '+1 (555) 123-4567',
    university: 'University of Technology',
    course: 'Computer Science',
    year: '3rd Year'
  };

  const mockTimeline = [
    { date: '2025-01-20', event: 'Task posted', type: 'created' },
    { date: '2025-01-21', event: 'Admin assigned', type: 'assigned' },
    { date: '2025-01-22', event: 'Work started', type: 'progress' },
    { date: '2025-01-25', event: 'First deliverable submitted', type: 'submission' }
  ];

  return (
    <div className="add-deliverable-overlay">
      <div className="add-deliverable-modal" style={{ maxWidth: '1200px' }}>
        <div className="modal-header">
          <div className="modal-title-section">
            <h2>Task Details</h2>
            <p>Comprehensive view of task information and progress</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Task Header */}
        <div style={{ padding: '0 2rem', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem', paddingBottom: '1.5rem' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1e293b', margin: '0 0 1rem 0' }}>
                {task.title}
              </h3>
              <p style={{ color: '#64748b', marginBottom: '1rem', lineHeight: '1.6' }}>
                {task.description}
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span className={`badge ${getStatusColor(task.status)}`}>
                  {task.status.replace('_', ' ')}
                </span>
                <span className={`priority-badge ${getPriorityColor(task.priority)}`} style={{ padding: '0.25rem 0.75rem', borderRadius: '0.375rem', border: '1px solid', fontSize: '0.75rem', fontWeight: '500' }}>
                  {task.priority} priority
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>
                  <DollarSign className="w-4 h-4" />
                  <span>${task.budget}</span>
                </div>
              </div>
            </div>

            {userRole === 'admin' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 }}>
                <select
                  value={task.status}
                  onChange={(e) => handleStatusUpdate(e.target.value)}
                  style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem', minWidth: '150px' }}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="revision_needed">Needs Revision</option>
                  <option value="rejected">Rejected</option>
                </select>
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={handleContactStudent}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
                >
                  <MessageSquare className="w-4 h-4" />
                  Contact Student
                </button>
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid #e2e8f0' }}>
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    background: 'none',
                    color: activeTab === tab.id ? '#1e40af' : '#64748b',
                    borderBottom: activeTab === tab.id ? '2px solid #1e40af' : '2px solid transparent',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                >
                  <IconComponent className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div style={{ padding: '2rem', maxHeight: '60vh', overflowY: 'auto' }}>
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
              <div>
                <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b', marginBottom: '1rem' }}>
                  Task Information
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1e293b' }}>Subject</div>
                      <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{task.subject}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1e293b' }}>Due Date</div>
                      <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                        {new Date(task.dueDate).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1e293b' }}>Created</div>
                      <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                        {new Date(task.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b', marginBottom: '1rem' }}>
                  Progress Summary
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1e293b' }}>Deliverables</span>
                      <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                        {task.deliverables.filter(d => d.status === 'completed').length} of {task.deliverables.length} completed
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          width: `${task.deliverables.length > 0 ? (task.deliverables.filter(d => d.status === 'completed').length / task.deliverables.length) * 100 : 0}%`, 
                          height: '100%', 
                          backgroundColor: '#22c55e',
                          transition: 'width 0.3s ease'
                        }} 
                      />
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#f0fdf4', borderRadius: '0.5rem', border: '1px solid #bbf7d0' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#166534' }}>Budget</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#166534' }}>${task.budget}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'deliverables' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b', margin: 0 }}>
                  Deliverables ({task.deliverables.length})
                </h4>
              </div>
              
              {task.deliverables.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {task.deliverables.map((deliverable, index) => (
                    <div key={deliverable.id || index} className="deliverable-item">
                      <div className="deliverable-header">
                        <div className="deliverable-content">
                          <h5 className="deliverable-title">{deliverable.title}</h5>
                          <div className="deliverable-meta">
                            <span className={`badge ${getStatusColor(deliverable.status)}`}>
                              {deliverable.status.replace('_', ' ')}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                              <Calendar className="w-4 h-4" />
                              <span>Due: {new Date(deliverable.dueDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                          {deliverable.description && (
                            <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                              {deliverable.description}
                            </p>
                          )}
                        </div>
                        {userRole === 'admin' && (
                          <div className="deliverable-actions">
                            <button className="btn btn-outline btn-sm">
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </button>
                            {deliverable.status === 'submitted' && (
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="btn btn-sm" style={{ backgroundColor: '#22c55e', color: 'white' }}>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Approve
                                </button>
                                <button className="btn btn-sm" style={{ backgroundColor: '#f59e0b', color: 'white' }}>
                                  <AlertCircle className="w-4 h-4 mr-2" />
                                  Request Changes
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p>No deliverables have been added yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'student' && (
            <div>
              <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b', marginBottom: '1.5rem' }}>
                Student Information
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
                <div>
                  <h5 style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b', marginBottom: '1rem' }}>
                    Contact Details
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <User className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1e293b' }}>Name</div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{task.student}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1e293b' }}>Email</div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{mockStudentInfo.email}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Phone className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1e293b' }}>Phone</div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{mockStudentInfo.phone}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b', marginBottom: '1rem' }}>
                    Academic Information
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <GraduationCap className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1e293b' }}>University</div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{mockStudentInfo.university}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1e293b' }}>Course</div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{mockStudentInfo.course}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Target className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1e293b' }}>Year</div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{mockStudentInfo.year}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div>
              <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b', marginBottom: '1.5rem' }}>
                Task Timeline
              </h4>
              <div style={{ position: 'relative' }}>
                {/* Timeline line */}
                <div style={{ 
                  position: 'absolute', 
                  left: '1rem', 
                  top: '2rem', 
                  bottom: '2rem', 
                  width: '2px', 
                  backgroundColor: '#e2e8f0' 
                }} />
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {mockTimeline.map((event, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
                      <div style={{ 
                        width: '2rem', 
                        height: '2rem', 
                        borderRadius: '50%', 
                        backgroundColor: '#1e40af', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexShrink: 0,
                        zIndex: 1
                      }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'white' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1e293b' }}>
                          {event.event}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {new Date(event.date).toLocaleDateString('en-US', { 
                            month: 'long', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="form-actions">
          {userRole === 'admin' && (
            <>
              <button className="btn btn-outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit Task
              </button>
              <button className="btn btn-outline" style={{ color: '#ef4444', borderColor: '#ef4444' }}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Task
              </button>
            </>
          )}
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}