import { useState } from 'react';
import { useNotifications } from './NotificationContext';
import { 
  Calendar, 
  Clock, 
  User, 
  Check, 
  X, 
  Plus, 
  Video, 
  MessageCircle,
  MapPin,
  Edit3,
  Trash2
} from 'lucide-react';

interface MeetingsViewProps {
  userRole: 'student' | 'admin';
  user: any;
}

interface Meeting {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number;
  type: 'virtual' | 'in-person';
  location?: string;
  status: 'pending' | 'confirmed' | 'declined' | 'completed' | 'cancelled';
  student: string;
  studentId: string;
  studentAvatar: string;
  requestedBy: 'student' | 'admin';
  meetingLink?: string;
  notes?: string;
}

export function MeetingsView({ userRole, user }: MeetingsViewProps) {
  const { addNotification } = useNotifications();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'pending' | 'past'>('upcoming');

  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: 1,
      title: "Project Discussion - ML Research",
      description: "Discuss methodology and data collection approaches for machine learning research paper",
      date: "2025-02-03",
      time: "14:00",
      duration: 60,
      type: "virtual",
      status: "confirmed",
      student: "John Smith",
      studentId: "student-1",
      studentAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      requestedBy: "student",
      meetingLink: "https://meet.gradhelper.com/room/ml-discussion-123"
    },
    {
      id: 2,
      title: "Database Design Review",
      description: "Review ER diagram and discuss database normalization concepts",
      date: "2025-02-05",
      time: "10:30",
      duration: 45,
      type: "in-person",
      location: "Room 204, Computer Science Building",
      status: "pending",
      student: "Sarah Johnson",
      studentId: "student-2",
      studentAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
      requestedBy: "admin"
    },
    {
      id: 3,
      title: "Final Project Presentation",
      description: "Present completed web development project and discuss deployment",
      date: "2025-01-28",
      time: "15:00",
      duration: 30,
      type: "virtual",
      status: "completed",
      student: "Mike Wilson",
      studentId: "student-3",
      studentAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      requestedBy: "student",
      notes: "Great presentation! Project meets all requirements."
    }
  ]);

  const handleCreateMeeting = (meetingData: any) => {
    const newMeeting: Meeting = {
      id: Date.now(),
      ...meetingData,
      status: userRole === 'admin' ? 'confirmed' : 'pending',
      requestedBy: userRole,
      student: userRole === 'student' ? user.name : meetingData.student,
      studentId: userRole === 'student' ? user.id : meetingData.studentId,
      studentAvatar: userRole === 'student' ? user.avatar : meetingData.studentAvatar
    };

    setMeetings(prev => [newMeeting, ...prev]);

    // Send notification
    const notificationData = {
      type: 'meeting_scheduled' as const,
      title: userRole === 'admin' ? 'Meeting Scheduled' : 'Meeting Request Sent',
      message: userRole === 'admin' 
        ? `A meeting "${newMeeting.title}" has been scheduled for ${new Date(newMeeting.date).toLocaleDateString()}`
        : `Your meeting request "${newMeeting.title}" has been sent for approval`,
      userId: userRole === 'admin' ? newMeeting.studentId : 'admin-1',
      userRole: userRole === 'admin' ? 'student' as const : 'admin' as const,
      data: { meetingId: newMeeting.id }
    };

    addNotification(notificationData);
    setShowCreateModal(false);
  };

  const handleMeetingAction = (meetingId: number, action: 'confirm' | 'decline' | 'cancel') => {
    setMeetings(prev => prev.map(meeting => {
      if (meeting.id === meetingId) {
        const newStatus = action === 'confirm' ? 'confirmed' : 
                         action === 'decline' ? 'declined' : 'cancelled';
        
        // Send notification
        const notificationData = {
          type: 'meeting_updated' as const,
          title: `Meeting ${action === 'confirm' ? 'Confirmed' : action === 'decline' ? 'Declined' : 'Cancelled'}`,
          message: `Your meeting "${meeting.title}" has been ${newStatus}`,
          userId: meeting.requestedBy === 'student' ? meeting.studentId : 'admin-1',
          userRole: meeting.requestedBy === 'student' ? 'student' as const : 'admin' as const,
          data: { meetingId: meeting.id }
        };

        addNotification(notificationData);

        return { ...meeting, status: newStatus };
      }
      return meeting;
    }));
  };

  const filterMeetings = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    switch (activeTab) {
      case 'upcoming':
        return meetings.filter(m => 
          (m.status === 'confirmed' || m.status === 'pending') && 
          m.date >= today
        );
      case 'pending':
        return meetings.filter(m => m.status === 'pending');
      case 'past':
        return meetings.filter(m => 
          m.status === 'completed' || 
          m.status === 'declined' || 
          m.status === 'cancelled' || 
          (m.date < today && m.status === 'confirmed')
        );
      default:
        return meetings;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'declined': return 'badge-error';
      case 'cancelled': return 'badge-secondary';
      case 'completed': return 'badge-info';
      default: return 'badge-secondary';
    }
  };

  const filteredMeetings = filterMeetings();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="card-title">Meetings</h2>
              <p className="card-description">
                {userRole === 'student' 
                  ? 'Schedule and manage your meetings with experts'
                  : 'Manage student meetings and availability'
                }
              </p>
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              {userRole === 'student' ? 'Request Meeting' : 'Schedule Meeting'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="meeting-tabs">
          <button 
            className={`tab-button ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming
          </button>
          <button 
            className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending ({meetings.filter(m => m.status === 'pending').length})
          </button>
          <button 
            className={`tab-button ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            Past
          </button>
        </div>

        <div className="card-content">
          <div className="space-y-4">
            {filteredMeetings.length === 0 ? (
              <div className="empty-state">
                <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
                <h3>No {activeTab} meetings</h3>
                <p className="text-muted-foreground">
                  {activeTab === 'upcoming' && 'No confirmed meetings scheduled'}
                  {activeTab === 'pending' && 'No meetings awaiting approval'}
                  {activeTab === 'past' && 'No past meetings to display'}
                </p>
              </div>
            ) : (
              filteredMeetings.map((meeting) => (
                <div key={meeting.id} className="meeting-item">
                  <div className="meeting-header">
                    <div className="meeting-info">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="avatar w-10 h-10">
                          <img src={meeting.studentAvatar} alt={meeting.student} />
                        </div>
                        <div>
                          <h4 className="meeting-title">{meeting.title}</h4>
                          <p className="meeting-student">
                            {userRole === 'admin' ? meeting.student : 'With Admin'}
                          </p>
                        </div>
                      </div>
                      
                      <p className="meeting-description">{meeting.description}</p>
                      
                      <div className="meeting-meta">
                        <div className="meta-item">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(meeting.date).toLocaleDateString()}</span>
                        </div>
                        <div className="meta-item">
                          <Clock className="w-4 h-4" />
                          <span>{meeting.time} ({meeting.duration} min)</span>
                        </div>
                        <div className="meta-item">
                          {meeting.type === 'virtual' ? (
                            <Video className="w-4 h-4" />
                          ) : (
                            <MapPin className="w-4 h-4" />
                          )}
                          <span>
                            {meeting.type === 'virtual' ? 'Virtual Meeting' : meeting.location}
                          </span>
                        </div>
                      </div>
                      
                      {meeting.notes && (
                        <div className="meeting-notes">
                          <p><strong>Notes:</strong> {meeting.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="meeting-actions">
                      <span className={`badge ${getStatusColor(meeting.status)}`}>
                        {meeting.status.replace('_', ' ')}
                      </span>
                      
                      <div className="action-buttons">
                        {/* Admin Actions */}
                        {userRole === 'admin' && meeting.status === 'pending' && (
                          <>
                            <button 
                              className="btn btn-sm btn-outline"
                              onClick={() => handleMeetingAction(meeting.id, 'decline')}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Decline
                            </button>
                            <button 
                              className="btn btn-sm btn-primary"
                              onClick={() => handleMeetingAction(meeting.id, 'confirm')}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Confirm
                            </button>
                          </>
                        )}
                        
                        {/* Common Actions */}
                        {meeting.status === 'confirmed' && (
                          <>
                            {meeting.type === 'virtual' && meeting.meetingLink && (
                              <a 
                                href={meeting.meetingLink}
                                className="btn btn-sm btn-primary"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Video className="w-4 h-4 mr-1" />
                                Join
                              </a>
                            )}
                            <button 
                              className="btn btn-sm btn-outline"
                              onClick={() => handleMeetingAction(meeting.id, 'cancel')}
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        
                        <button 
                          className="btn btn-sm btn-ghost"
                          onClick={() => {
                            setSelectedMeeting(meeting);
                            setShowDetailsModal(true);
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Meeting Modal */}
      {showCreateModal && (
        <CreateMeetingModal
          userRole={userRole}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateMeeting}
        />
      )}

      {/* Meeting Details Modal */}
      {showDetailsModal && selectedMeeting && (
        <MeetingDetailsModal
          meeting={selectedMeeting}
          userRole={userRole}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedMeeting(null);
          }}
        />
      )}
    </div>
  );
}

// Create Meeting Modal Component
function CreateMeetingModal({ userRole, onClose, onCreate }: {
  userRole: 'student' | 'admin';
  onClose: () => void;
  onCreate: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 60,
    type: 'virtual' as 'virtual' | 'in-person',
    location: '',
    student: '',
    studentId: ''
  });

  const mockStudents = [
    { id: 'student-1', name: 'John Smith', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face' },
    { id: 'student-2', name: 'Sarah Johnson', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face' },
    { id: 'student-3', name: 'Mike Wilson', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let meetingData: any = { ...formData };
    
    if (userRole === 'admin' && formData.studentId) {
      const selectedStudent = mockStudents.find(s => s.id === formData.studentId);
      if (selectedStudent) {
        meetingData.student = selectedStudent.name;
        meetingData.studentAvatar = selectedStudent.avatar;
      }
    }
    
    if (formData.type === 'virtual') {
      meetingData.meetingLink = `https://meet.gradhelper.com/room/${Date.now()}`;
    }
    
    onCreate(meetingData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-lg">
        <div className="modal-header">
          <div>
            <h3 className="modal-title">{userRole === 'student' ? 'Request Meeting' : 'Schedule Meeting'}</h3>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-content">
            <div className="space-y-4">
              {userRole === 'admin' && (
                <div className="form-group">
                  <label className="form-label">Student</label>
                  <select
                    className="form-select"
                    value={formData.studentId}
                    onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                    required
                  >
                    <option value="">Select a student...</option>
                    {mockStudents.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Meeting Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Project Discussion"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Describe the purpose and agenda of this meeting..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Duration (minutes)</label>
                <select
                  className="form-select"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                >
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Meeting Type</label>
                <div className="meeting-type-options">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="type"
                      value="virtual"
                      checked={formData.type === 'virtual'}
                      onChange={(e) => setFormData({...formData, type: e.target.value as 'virtual'})}
                    />
                    <Video className="w-4 h-4" />
                    <span>Virtual Meeting</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="type"
                      value="in-person"
                      checked={formData.type === 'in-person'}
                      onChange={(e) => setFormData({...formData, type: e.target.value as 'in-person'})}
                    />
                    <MapPin className="w-4 h-4" />
                    <span>In-Person</span>
                  </label>
                </div>
              </div>

              {formData.type === 'in-person' && (
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Room 204, Computer Science Building"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    required
                  />
                </div>
              )}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {userRole === 'student' ? 'Send Request' : 'Schedule Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Meeting Details Modal Component
function MeetingDetailsModal({ meeting, userRole, onClose }: {
  meeting: Meeting;
  userRole: 'student' | 'admin';
  onClose: () => void;
}) {
  return (
    <div className="modal-overlay">
      <div className="modal modal-md">
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Meeting Details</h3>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="modal-content">
          <div className="meeting-details-content">
            <div className="detail-section">
              <h4>{meeting.title}</h4>
              <p className="text-muted-foreground">{meeting.description}</p>
            </div>

            <div className="detail-section">
              <div className="detail-row">
                <span className="detail-label">Participant:</span>
                <div className="flex items-center gap-2">
                  <div className="avatar w-6 h-6">
                    <img src={meeting.studentAvatar} alt={meeting.student} />
                  </div>
                  <span>{userRole === 'admin' ? meeting.student : 'With Admin'}</span>
                </div>
              </div>

              <div className="detail-row">
                <span className="detail-label">Date & Time:</span>
                <span>{new Date(meeting.date).toLocaleDateString()} at {meeting.time}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Duration:</span>
                <span>{meeting.duration} minutes</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Type:</span>
                <div className="flex items-center gap-2">
                  {meeting.type === 'virtual' ? (
                    <Video className="w-4 h-4" />
                  ) : (
                    <MapPin className="w-4 h-4" />
                  )}
                  <span>
                    {meeting.type === 'virtual' ? 'Virtual Meeting' : meeting.location}
                  </span>
                </div>
              </div>

              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className={`badge ${
                  meeting.status === 'confirmed' ? 'badge-success' :
                  meeting.status === 'pending' ? 'badge-warning' :
                  meeting.status === 'declined' ? 'badge-error' :
                  'badge-secondary'
                }`}>
                  {meeting.status.replace('_', ' ')}
                </span>
              </div>

              {meeting.type === 'virtual' && meeting.meetingLink && meeting.status === 'confirmed' && (
                <div className="detail-row">
                  <span className="detail-label">Meeting Link:</span>
                  <a 
                    href={meeting.meetingLink}
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Join Meeting
                  </a>
                </div>
              )}

              {meeting.notes && (
                <div className="detail-row">
                  <span className="detail-label">Notes:</span>
                  <span>{meeting.notes}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
          {meeting.type === 'virtual' && meeting.meetingLink && meeting.status === 'confirmed' && (
            <a 
              href={meeting.meetingLink}
              className="btn btn-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Video className="w-4 h-4 mr-2" />
              Join Meeting
            </a>
          )}
        </div>
      </div>
    </div>
  );
}