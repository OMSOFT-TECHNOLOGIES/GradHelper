import { useState, useMemo, useEffect } from 'react';
import { useNotifications } from './NotificationContext';
import { 
  meetingService, 
  Meeting, 
  CreateMeetingData,
  UpdateMeetingData, 
  UpdateMeetingStatusData,
  formatMeetingDateTime,
  isMeetingUpcoming,
  getMeetingStatusColor,
  buildMeetingQuery
} from '../services/meetingService';
import { taskService, Task } from '../services/taskService';
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
  Trash2,
  Search,
  Filter,
  RefreshCw,
  Users,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Calendar as CalendarIcon,
  ExternalLink,
  Eye
} from 'lucide-react';

// Utility function to generate initials from user name
const getUserInitials = (name: string | undefined): string => {
  if (!name) return 'U';
  
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

// Utility function to safely get student name from meeting
const getStudentName = (student: string | { 
  id: string; 
  name?: string; 
  first_name?: string; 
  last_name?: string; 
  username?: string; 
  email?: string 
} | undefined): string => {
  if (!student) return 'Unknown Student';
  if (typeof student === 'string') return student;
  
  // Handle different student data structures from backend
  if (student.first_name && student.last_name) {
    return `${student.first_name} ${student.last_name}`;
  }
  if (student.name) {
    return student.name;
  }
  if (student.username) {
    return student.username;
  }
  
  return 'Unknown Student';
};

// Utility function to generate a consistent color for initials based on name
const getInitialsColor = (name: string | undefined): string => {
  if (!name) return 'bg-gray-500';
  
  const colors = [
    'bg-blue-500',
    'bg-green-500', 
    'bg-purple-500',
    'bg-red-500',
    'bg-yellow-500',
    'bg-indigo-500',
    'bg-pink-500',
    'bg-teal-500'
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

interface MeetingsViewProps {
  userRole: 'student' | 'admin';
  user: any;
}

export function MeetingsView({ userRole, user }: MeetingsViewProps) {
  const { addNotification } = useNotifications();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'pending' | 'past'>('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [meetingStats, setMeetingStats] = useState({
    total: 0,
    upcoming: 0,
    pending: 0,
    completed: 0,
  });
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  
  // Edit meeting state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [editFormData, setEditFormData] = useState<UpdateMeetingData>({});
  const [isUpdating, setIsUpdating] = useState(false);

  // Load meetings on component mount and when activeTab changes
  useEffect(() => {
    loadMeetings();
    loadMeetingStats();
    if (userRole === 'admin') {
      loadAvailableTasks();
    }
  }, [activeTab, userRole]);

  // Reload meetings when search term changes (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      loadMeetings();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      
      // Load all meetings and filter client-side for better flexibility
      const params = buildMeetingQuery(searchTerm);

      const response = userRole === 'admin' 
        ? await meetingService.getAdminMeetings(params)
        : await meetingService.getMeetings(params);

      if (response.success) {
        setMeetings(response.data);
      }
    } catch (error) {
      console.error('Error loading meetings:', error);
      addNotification({
        type: 'error',
        title: 'Error Loading Meetings',
        message: 'Failed to load meetings. Please try again.',
        userId: user.id,
        userRole: userRole
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMeetingStats = async () => {
    try {
      const stats = userRole === 'admin'
        ? await meetingService.getAdminMeetingStats()
        : await meetingService.getMeetingStats();
      
      setMeetingStats(stats);
    } catch (error) {
      console.error('Error loading meeting stats:', error);
    }
  };

  const loadAvailableTasks = async () => {
    if (userRole !== 'admin') return;
    
    try {
      setLoadingTasks(true);
      // Load tasks for admin to schedule meetings on
      const response = await taskService.getAdminTasks({
        status: 'in_progress', // Only tasks that are active
        limit: 100 // Get up to 100 tasks
      });
      
      if (response.success) {
        setAvailableTasks(response.data);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      addNotification({
        type: 'error',
        title: 'Error Loading Tasks',
        message: 'Failed to load tasks. Using cached data.',
        userId: user.id,
        userRole: userRole
      });
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleCreateMeeting = async (meetingData: CreateMeetingData) => {
    try {
      setLoading(true);
      
      // Add both user_id and studentId for backend
      const meetingPayload: CreateMeetingData = {
        ...meetingData,
        user_id: userRole === 'student' ? user.id : meetingData.user_id,
        studentId: userRole === 'student' ? user.id : meetingData.studentId,
      };
      
      const response = userRole === 'admin'
        ? await meetingService.createAdminMeeting(meetingPayload)
        : await meetingService.createMeeting(meetingPayload);

      if (response.success) {
        // Send notification
        const notificationData = {
          type: 'meeting_scheduled' as const,
          title: userRole === 'admin' ? 'Meeting Scheduled' : 'Meeting Request Sent',
          message: userRole === 'admin' 
            ? `A meeting "${response.data.title}" has been scheduled for ${new Date(response.data.date).toLocaleDateString()}`
            : `Your meeting request "${response.data.title}" has been sent for approval`,
          userId: userRole === 'admin' ? response.data.studentId : 'admin-1',
          userRole: userRole === 'admin' ? 'student' as const : 'admin' as const,
          data: { meetingId: response.data.id }
        };

        addNotification(notificationData);
        setShowCreateModal(false);
        
        // Reload meetings to show the new one
        await loadMeetings();
        await loadMeetingStats();
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
      addNotification({
        type: 'error',
        title: 'Error Creating Meeting',
        message: 'Failed to create meeting. Please try again.',
        userId: user.id,
        userRole: userRole
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMeetingAction = async (meetingId: string, action: 'confirm' | 'decline' | 'cancel' | 'complete') => {
    try {
      setLoading(true);
      
      const newStatus = action === 'confirm' ? 'confirmed' : 
                       action === 'decline' ? 'declined' : 
                       action === 'cancel' ? 'cancelled' : 'completed';
      
      const statusData: UpdateMeetingStatusData = {
        status: newStatus,
        reason: action === 'decline' || action === 'cancel' ? 'Updated by admin' : undefined
      };

      const response = userRole === 'admin'
        ? await meetingService.updateAdminMeetingStatus(meetingId, statusData)
        : await meetingService.updateMeetingStatus(meetingId, statusData);

      if (response.success) {
        // Send notification
        const notificationData = {
          type: 'meeting_updated' as const,
          title: `Meeting ${action === 'confirm' ? 'Confirmed' : 
                          action === 'decline' ? 'Declined' : 
                          action === 'cancel' ? 'Cancelled' :
                          'Completed'}`,
          message: `Meeting "${response.data.title}" has been ${newStatus}`,
          userId: response.data.studentId,
          userRole: 'student' as const,
          data: { meetingId: response.data.id }
        };

        addNotification(notificationData);
        
        // Reload meetings to show updated status
        await loadMeetings();
        await loadMeetingStats();
      }
    } catch (error) {
      console.error('Error updating meeting status:', error);
      addNotification({
        type: 'error',
        title: 'Error Updating Meeting',
        message: 'Failed to update meeting status. Please try again.',
        userId: user.id,
        userRole: userRole
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle editing a meeting
  const handleEditMeeting = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setEditFormData({
      title: meeting.title,
      description: meeting.description,
      date: meeting.date,
      time: meeting.time,
      duration: meeting.duration,
      type: meeting.type,
      location: meeting.location || '',
      meetingLink: meeting.meetingLink || ''
    });
    setShowEditModal(true);
  };

  // Handle updating a meeting
  const handleUpdateMeeting = async () => {
    if (!editingMeeting) {
      console.error('No meeting selected for editing');
      return;
    }

    setIsUpdating(true);

    try {
      const result = userRole === 'admin' 
        ? await meetingService.updateAdminMeeting(editingMeeting.id, editFormData)
        : await meetingService.updateMeeting(editingMeeting.id, editFormData);

      if (result.success) {
        addNotification({
          type: 'meeting_updated',
          title: 'Meeting Updated',
          message: `Meeting "${editFormData.title || editingMeeting.title}" has been updated successfully.`,
          userId: user.id,
          userRole: userRole
        });

        // Reload meetings and stats
        await loadMeetings();
        await loadMeetingStats();

        // Close modal and reset state
        setShowEditModal(false);
        setEditingMeeting(null);
        setEditFormData({});
      }
    } catch (error) {
      console.error('Error updating meeting:', error);
      addNotification({
        type: 'error',
        title: 'Error Updating Meeting',
        message: 'Failed to update meeting. Please try again.',
        userId: user.id,
        userRole: userRole
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle canceling edit
  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingMeeting(null);
    setEditFormData({});
  };

  const filteredMeetings = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    let filtered = meetings;

    // Filter by tab
    switch (activeTab) {
      case 'upcoming':
        // Only confirmed meetings for today or future dates
        filtered = meetings.filter(m => 
          m.status === 'confirmed' && 
          m.date >= today
        );
        break;
      case 'pending':
        // Only pending meetings (awaiting approval)
        filtered = meetings.filter(m => m.status === 'pending');
        break;
      case 'past':
        // Completed, declined, cancelled meetings (any date) + past confirmed meetings
        filtered = meetings.filter(m => 
          m.status === 'completed' || 
          m.status === 'declined' || 
          m.status === 'cancelled' || 
          (m.date < today && m.status === 'confirmed')
        );
        break;
      default:
        filtered = meetings;
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(m => 
        m.title.toLowerCase().includes(search) ||
        m.description.toLowerCase().includes(search) ||
        getStudentName(m.student).toLowerCase().includes(search) ||
        (m.location && m.location.toLowerCase().includes(search))
      );
    }

    // Filter by user role
    if (userRole === 'student') {
      filtered = filtered.filter(m => m.studentId === user.id);
    }

    // Sort by date and time
    return filtered.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return activeTab === 'past' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
    });
  }, [meetings, activeTab, searchTerm, userRole, user.id]);

  // Helper function to check if user can edit a meeting
  const canEditMeeting = (meeting: Meeting): boolean => {
    // Admins can edit any meeting
    if (userRole === 'admin') {
      return true;
    }

    // Students can edit meetings they created OR meetings they're involved in that are still pending
    if (userRole === 'student') {
      // Can always edit meetings they requested
      if (meeting.requestedBy === 'student' && meeting.studentId === user.id) {
        return true;
      }
      
      // Can edit pending meetings requested by admin for them
      if (meeting.requestedBy === 'admin' && meeting.studentId === user.id && meeting.status === 'pending') {
        return true;
      }
    }

    return false;
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

  const handleRefresh = async () => {
    await loadMeetings();
    await loadMeetingStats();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Professional Header */}
      <div className="relative bg-white/90 backdrop-blur-lg border-b border-slate-200/50 sticky top-0 z-20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-indigo-600/5 to-purple-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center space-x-5">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl blur-sm opacity-20"></div>
                <div className="relative p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl">
                  <CalendarIcon className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Meeting Management
                </h1>
                <p className="text-slate-600 mt-2 text-lg">
                  {userRole === 'student' 
                    ? 'Schedule and manage your academic consultations with expert guidance'
                    : 'Comprehensive meeting coordination and student consultation management'
                  }
                </p>
              </div>
            </div>
            
            {/* Enhanced Search and Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search meetings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 w-80 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-md"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="flex items-center space-x-2 px-5 py-3 bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-700 rounded-xl hover:bg-white hover:border-blue-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 shadow-sm hover:shadow-md font-medium disabled:opacity-50"
                  title="Refresh meetings"
                >
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>

                <button 
                  className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
                  onClick={() => setShowCreateModal(true)}
                >
                  <Plus className="w-5 h-5" />
                  <span>{userRole === 'student' ? 'Request Meeting' : 'Schedule Meeting'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Total Meetings</p>
                <p className="text-3xl font-bold text-slate-900">{meetingStats.total}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                <CalendarIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Upcoming</p>
                <p className="text-3xl font-bold text-green-600">{meetingStats.upcoming}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-orange-600">{meetingStats.pending}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Past Meetings</p>
                <p className="text-3xl font-bold text-indigo-600">{meetingStats.completed}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs and Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50">
          <div className="flex items-center justify-between p-6 border-b border-slate-200/50">
            <div className="flex space-x-1 bg-slate-100 rounded-xl p-1">
              <button 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'upcoming' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                onClick={() => setActiveTab('upcoming')}
              >
                Upcoming ({meetingStats.upcoming})
              </button>
              <button 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'pending' 
                    ? 'bg-white text-orange-600 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                onClick={() => setActiveTab('pending')}
              >
                Pending ({meetingStats.pending})
              </button>
              <button 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'past' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                onClick={() => setActiveTab('past')}
              >
                Past ({meetingStats.completed})
              </button>
            </div>
            
            {searchTerm && (
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <Search className="w-4 h-4" />
                <span>Found {filteredMeetings.length} results</span>
                <button 
                  onClick={() => setSearchTerm('')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          <div className="p-6">
            {filteredMeetings.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-xl border border-slate-100 max-w-lg">
                  <div className="relative mb-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto">
                      <CalendarIcon className="w-12 h-12 text-slate-400" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">No {activeTab} meetings</h3>
                  <p className="text-slate-600 max-w-md leading-relaxed mb-6">
                    {activeTab === 'upcoming' && 'No confirmed meetings scheduled for the future.'}
                    {activeTab === 'pending' && 'No meetings currently awaiting approval.'}
                    {activeTab === 'past' && 'No past meetings to display at this time.'}
                  </p>
                  {activeTab === 'upcoming' && (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
                    >
                      {userRole === 'student' ? 'Request Meeting' : 'Schedule Meeting'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredMeetings.map((meeting, index) => (
                  <div 
                    key={meeting.id} 
                    className="group bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-blue-200 transition-all duration-300 overflow-hidden"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Card Header */}
                    <div className="p-6 border-b border-slate-100">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 ${getInitialsColor(getStudentName(meeting.student))} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                            {getUserInitials(getStudentName(meeting.student))}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-1 line-clamp-1">
                              {meeting.title}
                            </h3>
                            <p className="text-sm text-slate-600">
                              {userRole === 'admin' ? getStudentName(meeting.student) : 'With Admin'}
                            </p>
                          </div>
                        </div>
                        
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          meeting.status === 'confirmed' 
                            ? 'bg-green-100 text-green-700' 
                            : meeting.status === 'pending'
                            ? 'bg-orange-100 text-orange-700'
                            : meeting.status === 'completed'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {meeting.status === 'confirmed' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {meeting.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                          {meeting.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {meeting.status.toUpperCase()}
                        </span>
                      </div>
                      
                      <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
                        {meeting.description}
                      </p>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(meeting.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <Clock className="w-4 h-4" />
                          <span>{meeting.time} ({meeting.duration}m)</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          {meeting.type === 'virtual' ? (
                            <Video className="w-4 h-4" />
                          ) : (
                            <MapPin className="w-4 h-4" />
                          )}
                          <span className="truncate">
                            {meeting.type === 'virtual' ? 'Virtual Meeting' : meeting.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer - Actions */}
                    <div className="p-6 bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {meeting.notes && (
                            <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs">
                              <MessageCircle className="w-3 h-3 inline mr-1" />
                              Has Notes
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {/* Pending Meeting Actions */}
                          {meeting.status === 'pending' && (
                            <>
                              {/* Admin can approve/decline student requests */}
                              {(userRole === 'admin' && meeting.requestedBy === 'student') && (
                                <>
                                  <button 
                                    className="flex items-center space-x-1 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                                    onClick={() => handleMeetingAction(meeting.id, 'decline')}
                                  >
                                    <X className="w-4 h-4" />
                                    <span>Decline</span>
                                  </button>
                                  <button 
                                    className="flex items-center space-x-1 px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium"
                                    onClick={() => handleMeetingAction(meeting.id, 'confirm')}
                                  >
                                    <Check className="w-4 h-4" />
                                    <span>Approve</span>
                                  </button>
                                </>
                              )}
                              
                              {/* Students can approve/decline admin requests */}
                              {(userRole === 'student' && meeting.requestedBy === 'admin' && meeting.studentId === user.id) && (
                                <>
                                  <button 
                                    className="flex items-center space-x-1 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                                    onClick={() => handleMeetingAction(meeting.id, 'decline')}
                                  >
                                    <X className="w-4 h-4" />
                                    <span>Decline</span>
                                  </button>
                                  <button 
                                    className="flex items-center space-x-1 px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium"
                                    onClick={() => handleMeetingAction(meeting.id, 'confirm')}
                                  >
                                    <Check className="w-4 h-4" />
                                    <span>Accept</span>
                                  </button>
                                </>
                              )}
                            </>
                          )}
                          
                          {/* Meeting Actions */}
                          {meeting.status === 'confirmed' && (
                            <>
                              {meeting.type === 'virtual' && meeting.meetingLink && (
                                <a 
                                  href={meeting.meetingLink}
                                  className="flex items-center space-x-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Video className="w-4 h-4" />
                                  <span>Join</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                              
                              {/* Complete and Cancel buttons - visible to admins and involved students */}
                              {(userRole === 'admin' || (userRole === 'student' && meeting.studentId === user.id)) && (
                                <>
                                  <button 
                                    className="flex items-center space-x-1 px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium"
                                    onClick={() => handleMeetingAction(meeting.id, 'complete')}
                                    title="Mark meeting as completed"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Complete</span>
                                  </button>
                                  <button 
                                    className="flex items-center space-x-1 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                                    onClick={() => handleMeetingAction(meeting.id, 'cancel')}
                                  >
                                    <X className="w-4 h-4" />
                                    <span>Cancel</span>
                                  </button>
                                </>
                              )}
                            </>
                          )}
                          
                          {/* Edit button - only show if user can edit this meeting */}
                          {canEditMeeting(meeting) && (
                            <button 
                              className="flex items-center space-x-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                              onClick={() => handleEditMeeting(meeting)}
                              title="Edit meeting"
                            >
                              <Edit3 className="w-4 h-4" />
                              <span>Edit</span>
                            </button>
                          )}
                          
                          <button 
                            className="flex items-center space-x-1 px-3 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                            onClick={() => {
                              setSelectedMeeting(meeting);
                              setShowDetailsModal(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                            <span>Details</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
          availableTasks={availableTasks}
          loadingTasks={loadingTasks}
        />
      )}

      {/* Meeting Details Modal */}
      {showDetailsModal && selectedMeeting && (
        <MeetingDetailsModal
          meeting={selectedMeeting!}
          userRole={userRole}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedMeeting(null);
          }}
        />
      )}

      {/* Edit Meeting Modal */}
      {showEditModal && editingMeeting && (
        <EditMeetingModal
          meeting={editingMeeting}
          userRole={userRole}
          formData={editFormData}
          isUpdating={isUpdating}
          onFormDataChange={setEditFormData}
          onSave={handleUpdateMeeting}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
}

// Create Meeting Modal Component
function CreateMeetingModal({ userRole, onClose, onCreate, availableTasks = [], loadingTasks = false }: {
  userRole: 'student' | 'admin';
  onClose: () => void;
  onCreate: (data: CreateMeetingData) => void;
  availableTasks?: Task[];
  loadingTasks?: boolean;
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 60,
    type: 'virtual' as 'virtual' | 'in-person',
    location: '',
    taskId: '',
    meetingLink: ''
  });

  const [taskSearch, setTaskSearch] = useState('');

  // Convert backend tasks to format expected by the form
  console.log('Formatting task:', availableTasks);
  const formattedTasks = availableTasks.map((task: any) => ({
    id: task.id,
    title: task.title,
    student: task.student?.username || 'Unknown Student', // Backend uses username, not name
    studentId: task.student?.id || '',
    studentUserId: task.student?.id || '' // This is the actual user_id for the student
  }));

  // Filter tasks based on search
  const filteredTasks = formattedTasks.filter((task: any) => 
    String(task.id).toLowerCase().includes(taskSearch.toLowerCase()) ||
    task.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
    task.student.toLowerCase().includes(taskSearch.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get student details from selected task for admin
    let meetingData: CreateMeetingData = {
      title: formData.title,
      description: formData.description,
      date: formData.date,
      time: formData.time,
      duration: formData.duration,
      type: formData.type,
      ...(formData.type === 'in-person' && formData.location && { location: formData.location }),
      ...(formData.type === 'virtual' && formData.meetingLink && { meetingLink: formData.meetingLink })
    };

    // For admin, get user details from selected task
    if (userRole === 'admin' && formData.taskId) {
      console.log('Admin creating meeting - formData.taskId:', formData.taskId);
      console.log('Available formatted tasks:', formattedTasks);
      
      const selectedTask = formattedTasks.find((task: any) => String(task.id) === String(formData.taskId));
      console.log('Found selected task:', selectedTask);
      
      if (selectedTask) {
        // Get admin's user ID from localStorage or user context
        const adminUser = JSON.parse(localStorage.getItem('gradhelper_user') || '{}');
        const adminUserId = adminUser.id;
        
        console.log('Selected task for meeting:', selectedTask);
        console.log('Admin user from storage:', adminUser);
        console.log('Admin user ID:', adminUserId);
        console.log('Student user ID from task:', selectedTask.studentUserId);
        
        meetingData = {
          ...meetingData,
          taskId: formData.taskId,
          user_id: adminUserId, // Admin's ID as the meeting creator
          studentId: selectedTask.studentUserId // Student's ID from the task
        };
      } else {
        console.error('Selected task not found! TaskId:', formData.taskId, 'Available tasks:', formattedTasks);
      }
    }
    
    onCreate(meetingData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-lg">
        <div className="modal-header">
          <div>
            <h3 className="modal-title">{userRole === 'student' ? 'Request Meeting' : 'Schedule Meeting'}</h3>
            <p className="modal-subtitle">Fill in the details below to {userRole === 'student' ? 'request a meeting' : 'schedule a new meeting'}</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-content">
            <div className="space-y-6">
              {userRole === 'admin' && (
                <div className="form-section">
                  <h4 className="form-section-title">Task Selection</h4>
                  <div className="form-group">
                    <label className="form-label">Select Task *</label>
                    <div className="space-y-3">
                      <div className="relative">
                        {loadingTasks ? (
                          <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 animate-spin" />
                        ) : (
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        )}
                        <input
                          type="text"
                          className="form-input pl-10"
                          placeholder={loadingTasks ? "Loading tasks..." : "Search by Task ID, title, or student name... (e.g., TASK-001)"}
                          value={taskSearch}
                          onChange={(e) => setTaskSearch(e.target.value)}
                          disabled={loadingTasks}
                        />
                      </div>
                    <select
                      className="form-select"
                      value={formData.taskId}
                      onChange={(e) => {
                        setFormData({
                          ...formData, 
                          taskId: e.target.value
                        });
                      }}
                      required
                      disabled={loadingTasks}
                    >
                      <option value="">
                        {loadingTasks 
                          ? 'Loading tasks...' 
                          : filteredTasks.length > 0 
                            ? `Select from ${filteredTasks.length} task${filteredTasks.length !== 1 ? 's' : ''}...` 
                            : availableTasks.length === 0 
                              ? 'No tasks available'
                              : 'No tasks found'
                        }
                      </option>
                      {filteredTasks.map((task: any) => (
                        <option key={task.id} value={String(task.id)}>
                          {task.id} - {task.title} - {task.student}
                        </option>
                      ))}
                    </select>
                    {formData.taskId && (
                      <p className="text-sm text-green-600 mt-1">
                        ✓ Task selected: {formattedTasks.find((t: any) => String(t.id) === String(formData.taskId))?.student}
                      </p>
                    )}
                    </div>
                  </div>
                </div>
              )}

              <div className="form-section">
                <h4 className="form-section-title">Meeting Details</h4>
                <div className="form-group">
                  <label className="form-label">Meeting Title *</label>
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
                  <label className="form-label">Description *</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Describe the purpose and agenda of this meeting..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-section">
                <h4 className="form-section-title">Schedule</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Date *</label>
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
                    <label className="form-label">Time *</label>
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
                  <label className="form-label">Duration</label>
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
              </div>

              <div className="form-section">
                <h4 className="form-section-title">Meeting Format</h4>
                <div className="form-group">
                  <label className="form-label">Meeting Type *</label>
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
                    <label className="form-label">Location *</label>
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

                {formData.type === 'virtual' && (
                  <div className="form-group">
                    <label className="form-label">
                      Meeting Link {userRole === 'student' ? '(Optional)' : ''}
                    </label>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="e.g., https://meet.google.com/abc-defg-hij or https://zoom.us/j/123456789"
                      value={formData.meetingLink}
                      onChange={(e) => setFormData({...formData, meetingLink: e.target.value})}
                    />
                    <p className="text-sm text-slate-600 mt-1">
                      {userRole === 'student' 
                        ? 'Leave empty if you want the admin to provide the meeting link' 
                        : 'Leave empty to auto-generate a meeting link'
                      }
                    </p>
                  </div>
                )}
              </div>
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
                  <div className={`avatar w-6 h-6 ${getInitialsColor(getStudentName(meeting.student))} rounded-full flex items-center justify-center text-white text-xs font-semibold`}>
                    {getUserInitials(getStudentName(meeting.student))}
                  </div>
                  <span>{userRole === 'admin' ? getStudentName(meeting.student) : 'With Admin'}</span>
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

// Edit Meeting Modal Component
function EditMeetingModal({ 
  meeting, 
  userRole, 
  formData, 
  isUpdating, 
  onFormDataChange, 
  onSave, 
  onCancel 
}: {
  meeting: Meeting;
  userRole: 'student' | 'admin';
  formData: UpdateMeetingData;
  isUpdating: boolean;
  onFormDataChange: (data: UpdateMeetingData) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const handleInputChange = (field: keyof UpdateMeetingData, value: any) => {
    onFormDataChange({
      ...formData,
      [field]: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave();
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-lg">
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Edit Meeting</h3>
            <p className="modal-subtitle">Update the meeting details below</p>
          </div>
          <button className="modal-close" onClick={onCancel} disabled={isUpdating}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-content">
            <div className="space-y-6">
              <div className="form-section">
                <h4 className="form-section-title">Meeting Details</h4>
                
                <div className="form-group">
                  <label className="form-label">Meeting Title *</label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="form-input"
                    placeholder="e.g., Project Discussion"
                    required
                    disabled={isUpdating}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="form-input"
                    placeholder="Describe the purpose and agenda of this meeting..."
                    rows={3}
                    disabled={isUpdating}
                  />
                </div>
              </div>

              <div className="form-section">
                <h4 className="form-section-title">Schedule</h4>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Date *</label>
                    <input
                      type="date"
                      value={formData.date || ''}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      className="form-input"
                      required
                      disabled={isUpdating}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Time *</label>
                    <input
                      type="time"
                      value={formData.time || ''}
                      onChange={(e) => handleInputChange('time', e.target.value)}
                      className="form-input"
                      required
                      disabled={isUpdating}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Duration (minutes) *</label>
                    <input
                      type="number"
                      value={formData.duration || ''}
                      onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                      className="form-input"
                      placeholder="60"
                      min="15"
                      max="480"
                      required
                      disabled={isUpdating}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4 className="form-section-title">Meeting Format</h4>
                
                <div className="form-group">
                  <label className="form-label">Meeting Type *</label>
                  <select
                    value={formData.type || 'virtual'}
                    onChange={(e) => handleInputChange('type', e.target.value as 'virtual' | 'in-person')}
                    className="form-select"
                    required
                    disabled={isUpdating}
                  >
                    <option value="virtual">Virtual Meeting</option>
                    <option value="in-person">In-Person Meeting</option>
                  </select>
                </div>

                {formData.type === 'in-person' ? (
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      value={formData.location || ''}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="form-input"
                      placeholder="e.g., Conference Room A, Building 1"
                      disabled={isUpdating}
                    />
                  </div>
                ) : (
                  <div className="form-group">
                    <label className="form-label">Meeting Link</label>
                    <input
                      type="url"
                      value={formData.meetingLink || ''}
                      onChange={(e) => handleInputChange('meetingLink', e.target.value)}
                      className="form-input"
                      placeholder="https://zoom.us/j/..."
                      disabled={isUpdating}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onCancel}
              disabled={isUpdating}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Meeting
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}