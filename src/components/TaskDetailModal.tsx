import { useState, useEffect } from 'react';
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
  Trash2,
  Save,
  Loader2,
  Eye,
  Paperclip,
  Star,
  TrendingUp,
  Activity,
  ChevronRight,
  ExternalLink,
  Copy,
  Share2,
  Bookmark,
  Flag,
  Award,
  BookOpen,
  Users,
  BarChart3,
  PieChart,
  Filter,
  Search,
  Maximize2,
  Hash,
  MessageCircle,
  Minimize2
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
  updatedAt: string;
  budget: number;
  student: {
    id: string;
    name: string;
    email: string;
  };
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
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

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

  const handleStatusUpdate = async (newStatus: string) => {
    setLoading(true);
    try {
      const updatedTask = { ...task, status: newStatus as any };
      onTaskUpdate(updatedTask);
      toast.success(`Task status updated to ${newStatus.replace('_', ' ')}`, {
        description: `Task "${task.title}" is now ${newStatus.replace('_', ' ')}.`,
      });
    } catch (error) {
      toast.error('Failed to update task status');
    } finally {
      setLoading(false);
    }
  };

  const handleContactStudent = () => {
    toast.success('Opening communication channel...', {
      description: `Connecting you with ${task.student.name}`,
    });
    // This would typically navigate to the messaging system with the student pre-selected
  };

  const handleCopyTaskId = () => {
    navigator.clipboard.writeText(task.id);
    toast.success('Task ID copied to clipboard');
  };

  const handleShareTask = () => {
    toast.info('Share functionality would open here');
  };

  const handleBookmarkTask = () => {
    toast.success('Task bookmarked successfully');
  };

  // Enhanced functions for better UX
  const handleDownloadAll = () => {
    toast.info('Downloading all attachments...');
  };

  const handleExportTask = () => {
    toast.info('Exporting task details...');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText, badge: null },
    { id: 'deliverables', label: 'Deliverables', icon: CheckCircle, badge: task.deliverables.length },
    { id: 'attachments', label: 'Files', icon: Paperclip, badge: task.attachments?.length || 0 },
    { id: 'student', label: 'Student Info', icon: User, badge: null },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: null },
    { id: 'timeline', label: 'Timeline', icon: Clock, badge: null },
    { id: 'notes', label: 'Notes', icon: BookOpen, badge: null }
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Enhanced Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-6">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-bold mb-1">{task.title}</h2>
                <div className="flex items-center space-x-4 text-sm text-white/80">
                  <span className="flex items-center">
                    <Hash className="w-4 h-4 mr-1" />
                    {task.id}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Due {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority.toUpperCase()} PRIORITY
                  </span>
                </div>
              </div>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBookmarkTask}
                className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg border border-white/30 transition-all duration-200 group"
                title="Bookmark Task"
              >
                <Star className="w-5 h-5 text-white group-hover:text-yellow-300" />
              </button>
              <button
                onClick={handleShareTask}
                className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg border border-white/30 transition-all duration-200"
                title="Share Task"
              >
                <Share2 className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={onClose}
                className="p-2 bg-white/20 hover:bg-red-500/30 backdrop-blur-sm rounded-lg border border-white/30 transition-all duration-200"
                title="Close"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Professional Status Bar */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 px-6 py-4 border-b border-gray-200/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${task.status === 'completed' ? 'bg-green-500' : task.status === 'in_progress' ? 'bg-blue-500' : task.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium text-gray-700">
                  {task.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <DollarSign className="w-4 h-4" />
                <span className="font-semibold">${task.budget}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4" />
                <span>{task.deliverables.length} Deliverables</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Paperclip className="w-4 h-4" />
                <span>{task.attachments?.length || 0} Files</span>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyTaskId}
                className="px-3 py-1.5 text-xs bg-white/80 hover:bg-white border border-gray-200 rounded-lg transition-colors flex items-center space-x-1"
              >
                <Copy className="w-3 h-3" />
                <span>Copy ID</span>
              </button>
              <button
                onClick={handleExportTask}
                className="px-3 py-1.5 text-xs bg-white/80 hover:bg-white border border-gray-200 rounded-lg transition-colors flex items-center space-x-1"
              >
                <Download className="w-3 h-3" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Professional Tab Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className={`w-4 h-4 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span className="font-medium">{tab.label}</span>
                  {tab.badge !== null && tab.badge > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      activeTab === tab.id 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Professional Content Area */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="p-6 space-y-6">
              {/* Overview Content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Task Details Card */}
                <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-xl p-6 border border-gray-200/50 shadow-sm">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Task Details</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Description</label>
                      <p className="mt-1 text-gray-800 leading-relaxed">{task.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Subject</label>
                        <p className="mt-1 text-gray-800 font-medium">{task.subject}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Budget</label>
                        <p className="mt-1 text-gray-800 font-semibold">${task.budget}</p>
                      </div>
                    </div>
                    

                  </div>
                </div>

                {/* Status & Priority Card */}
                <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-xl p-6 border border-gray-200/50 shadow-sm">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Activity className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Status & Progress</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {userRole === 'admin' ? (
                      <div>
                        <label className="text-sm font-medium text-gray-600 mb-2 block">Update Status</label>
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusUpdate(e.target.value)}
                          disabled={loading}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="revision_needed">Needs Revision</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Current Status</label>
                        <div className="mt-1 flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            task.status === 'completed' ? 'bg-green-500' : 
                            task.status === 'in_progress' ? 'bg-blue-500' : 
                            task.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></div>
                          <span className="text-gray-800 font-medium">
                            {task.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Priority Level</label>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          <Flag className="w-3 h-3 mr-1" />
                          {task.priority.toUpperCase()} PRIORITY
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Due Date</label>
                      <div className="mt-1 flex items-center space-x-2 text-gray-800">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {userRole === 'admin' && (
                <div className="flex justify-center space-x-3 pt-4 border-t border-gray-200">
                  <button 
                    onClick={handleContactStudent}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2 shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Contact Student</span>
                  </button>
                  <button 
                    onClick={handleDownloadAll}
                    className="px-6 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center space-x-2 shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download All</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'deliverables' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Task Deliverables</h3>
                </div>
                <span className="text-sm text-gray-600">{task.deliverables.length} items</span>
              </div>

              {task.deliverables.length > 0 ? (
                <div className="space-y-4">
                  {task.deliverables.map((deliverable, index) => (
                    <div key={deliverable.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800 mb-2">{deliverable.title}</h4>
                          <p className="text-sm text-gray-600 mb-3">{deliverable.description}</p>
                          
                          {deliverable.files && deliverable.files.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Attached Files</p>
                              <div className="flex flex-wrap gap-2">
                                {deliverable.files.map((file: any, fileIndex: number) => (
                                  <div key={fileIndex} className="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
                                    <Paperclip className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm text-blue-800 font-medium">{file.name}</span>
                                    <button
                                      onClick={() => window.open(file.url, '_blank')}
                                      className="p-1 hover:bg-blue-200 rounded"
                                    >
                                      <ExternalLink className="w-3 h-3 text-blue-600" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            deliverable.status === 'completed' ? 'bg-green-100 text-green-800' :
                            deliverable.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {deliverable.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No deliverables for this task yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'attachments' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Paperclip className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Task Files</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{task.attachments?.length || 0} files</span>
                  {task.attachments && task.attachments.length > 0 && (
                    <button
                      onClick={handleDownloadAll}
                      className="px-3 py-1.5 text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors flex items-center space-x-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download All</span>
                    </button>
                  )}
                </div>
              </div>

              {task.attachments && task.attachments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {task.attachments.map((file, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                            <FileText className="w-5 h-5 text-gray-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-800 truncate">{file.name}</p>
                            <p className="text-sm text-gray-500">{file.size || 'Unknown size'}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          <button
                            onClick={() => window.open(file.url, '_blank')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => window.open(file.url, '_blank')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Paperclip className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No files attached to this task.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'student' && (
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Student Information</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Student Profile Card */}
                <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-xl p-6 border border-gray-200/50">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{task.student.name}</h4>
                      <p className="text-sm text-gray-600">{task.student.email}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{task.student.email}</span>
                    </div>
                    {mockStudentInfo.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{mockStudentInfo.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Academic Information Card */}
                <div className="bg-gradient-to-br from-white to-green-50/30 rounded-xl p-6 border border-gray-200/50">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <GraduationCap className="w-5 h-5 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-800">Academic Details</h4>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">University</label>
                      <p className="text-sm text-gray-700 mt-1">{mockStudentInfo.university}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Course</label>
                      <p className="text-sm text-gray-700 mt-1">{mockStudentInfo.course}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Year</label>
                      <p className="text-sm text-gray-700 mt-1">{mockStudentInfo.year}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Actions */}
              {userRole === 'admin' && (
                <div className="flex justify-center space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <button 
                    onClick={handleContactStudent}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2 shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Send Message</span>
                  </button>
                  <button className="px-6 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center space-x-2 shadow-sm">
                    <Mail className="w-4 h-4" />
                    <span>Send Email</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Task Analytics</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Progress</p>
                      <p className="text-2xl font-bold text-gray-800">75%</p>
                    </div>
                    <TrendingUp className="w-6 h-6 text-green-500" />
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Time Spent</p>
                      <p className="text-2xl font-bold text-gray-800">12h</p>
                    </div>
                    <Clock className="w-6 h-6 text-blue-500" />
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Messages</p>
                      <p className="text-2xl font-bold text-gray-800">8</p>
                    </div>
                    <MessageCircle className="w-6 h-6 text-purple-500" />
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Files</p>
                      <p className="text-2xl font-bold text-gray-800">{task.attachments?.length || 0}</p>
                    </div>
                    <Paperclip className="w-6 h-6 text-orange-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-800 mb-4">Activity Overview</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Task created</span>
                    <span className="text-sm text-gray-800">{new Date(task.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Last updated</span>
                    <span className="text-sm text-gray-800">{new Date(task.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">Due date</span>
                    <span className="text-sm text-gray-800">{new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Task Timeline</h3>
              </div>

              <div className="space-y-4">
                {mockTimeline.map((event, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                      event.type === 'created' ? 'bg-blue-500' :
                      event.type === 'assigned' ? 'bg-yellow-500' :
                      event.type === 'progress' ? 'bg-orange-500' :
                      event.type === 'submission' ? 'bg-green-500' :
                      'bg-gray-500'
                    }`}></div>
                    <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-800">{event.event}</p>
                        <span className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <BookOpen className="w-5 h-5 text-yellow-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Task Notes</h3>
                </div>
                {userRole === 'admin' && (
                  <button
                    onClick={() => setShowNotes(!showNotes)}
                    className="px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>{showNotes ? 'Cancel' : 'Add Note'}</span>
                  </button>
                )}
              </div>

              {showNotes && userRole === 'admin' && (
                <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add your notes about this task..."
                    className="w-full h-32 px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 resize-none"
                  />
                  <div className="flex justify-end space-x-2 mt-3">
                    <button
                      onClick={() => setShowNotes(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors flex items-center space-x-2">
                      <Save className="w-4 h-4" />
                      <span>Save Note</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Admin Note</p>
                        <p className="text-sm text-gray-500">2 days ago</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700">Student has requested clarification on the requirements. Follow up needed.</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">System Note</p>
                        <p className="text-sm text-gray-500">5 days ago</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700">Task automatically assigned based on subject area and admin availability.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};