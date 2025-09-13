import { useState, useEffect, useRef } from 'react';
import { AddDeliverable } from './AddDeliverable';
import { TaskDetailModal } from './TaskDetailModal';
import { TaskRejectModal } from './TaskRejectModal';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Calendar, 
  User, 
  Clock, 
  CheckCircle,
  AlertCircle,
  FileText,
  DollarSign,
  Eye,
  MessageSquare,
  Edit,
  Trash2,
  XCircle,
  RefreshCw
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
}

interface TaskManagementProps {
  userRole: 'student' | 'admin';
}

export function TaskManagement({ userRole }: TaskManagementProps) {
  const [showAddDeliverable, setShowAddDeliverable] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }

    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openMenuId]);

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Machine Learning Research Paper',
      description: 'Comprehensive research paper on ML algorithms with practical implementation',
      subject: 'Computer Science',
      status: 'in_progress',
      priority: 'high',
      dueDate: '2025-02-15',
      createdAt: '2025-01-20',
      budget: 500,
      student: 'John Smith',
      deliverables: [
        {
          id: 1,
          title: 'Literature Review',
          status: 'completed',
          dueDate: '2025-01-25'
        },
        {
          id: 2,
          title: 'Methodology Section', 
          status: 'in_progress',
          dueDate: '2025-02-01'
        }
      ]
    },
    {
      id: '2',
      title: 'Database Design Assignment',
      description: 'Design and implement a normalized database system for e-commerce',
      subject: 'Database Systems',
      status: 'completed',
      priority: 'medium',
      dueDate: '2025-01-30',
      createdAt: '2025-01-15',
      budget: 200,
      student: 'Sarah Johnson',
      deliverables: [
        {
          id: 3,
          title: 'ER Diagram',
          status: 'completed',
          dueDate: '2025-01-20'
        },
        {
          id: 4,
          title: 'Database Implementation',
          status: 'completed',
          dueDate: '2025-01-28'
        }
      ]
    },
    {
      id: '3',
      title: 'Web Development Project',
      description: 'Full-stack web application using React and Node.js',
      subject: 'Web Development',
      status: 'pending',
      priority: 'medium',
      dueDate: '2025-02-28',
      createdAt: '2025-01-25',
      budget: 750,
      student: 'Mike Wilson',
      deliverables: []
    }
  ]);

  const handleAddDeliverable = (task: Task) => {
    setSelectedTask(task);
    setShowAddDeliverable(true);
  };

  const handleDeliverableAdded = (newDeliverable: any) => {
    setTasks(prev => prev.map(task => 
      task.id === selectedTask?.id 
        ? { ...task, deliverables: [...task.deliverables, newDeliverable] }
        : task
    ));
  };

  const handleViewDetails = (task: Task) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
    setOpenMenuId(null);
  };

  const handleRejectTask = (task: Task) => {
    setSelectedTask(task);
    setShowRejectModal(true);
    setOpenMenuId(null);
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(prev => prev.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
  };

  const handleTaskRejection = (taskId: string, reason: string, feedback: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: 'rejected' as const, rejectionReason: reason, rejectionFeedback: feedback }
        : task
    ));
    
    // Close modals
    setShowRejectModal(false);
    setSelectedTask(null);
  };

  const handleMenuToggle = (taskId: string) => {
    setOpenMenuId(openMenuId === taskId ? null : taskId);
  };

  const handleContactStudent = (task: Task) => {
    toast.info('Opening messaging system...', {
      description: `Starting conversation with ${task.student}`
    });
    setOpenMenuId(null);
  };

  const handleEditTask = (task: Task) => {
    toast.info('Edit functionality coming soon');
    setOpenMenuId(null);
  };

  const handleDeleteTask = (task: Task) => {
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      setTasks(prev => prev.filter(t => t.id !== task.id));
      toast.success('Task deleted successfully');
    }
    setOpenMenuId(null);
  };

  const handleMarkComplete = (task: Task) => {
    if (task.status === 'completed') {
      toast.info('Task is already marked as completed');
      setOpenMenuId(null);
      return;
    }

    const updatedTask = { ...task, status: 'completed' as const };
    setTasks(prev => prev.map(t => 
      t.id === task.id ? updatedTask : t
    ));
    
    toast.success('Task marked as completed!', {
      description: `"${task.title}" has been marked as completed successfully.`
    });
    
    setOpenMenuId(null);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="card-title">
                {userRole === 'student' ? 'My Tasks' : 'All Tasks'}
              </h2>
              <p className="card-description">
                {userRole === 'student' 
                  ? 'Manage your assignments and track progress'
                  : 'Monitor and manage all student tasks'
                }
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  className="pl-10 pr-4 py-2 border border-border rounded-lg w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="px-3 py-2 border border-border rounded-lg"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="revision_needed">Needs Revision</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card-content">
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div key={task.id} className="task-item">
                <div className="task-header">
                  <div className="task-info">
                    <div className="task-title-row">
                      <h3 className="task-title">{task.title}</h3>
                      <div className="task-badges">
                        <span className={`badge ${getStatusColor(task.status)}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                        <span className={`priority-badge ${getPriorityColor(task.priority)}`}>
                          {task.priority} priority
                        </span>
                      </div>
                    </div>
                    
                    <p className="task-description">{task.description}</p>
                    
                    <div className="task-meta">
                      <div className="meta-item">
                        <Calendar className="w-4 h-4" />
                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div className="meta-item">
                        <FileText className="w-4 h-4" />
                        <span>{task.subject}</span>
                      </div>
                      {userRole === 'admin' && (
                        <div className="meta-item">
                          <User className="w-4 h-4" />
                          <span>{task.student}</span>
                        </div>
                      )}
                      <div className="meta-item">
                        <DollarSign className="w-4 h-4" />
                        <span>${task.budget}</span>
                      </div>
                    </div>

                    {/* Deliverables Section */}
                    <div className="task-deliverables">
                      <div className="deliverables-header">
                        <h4>Deliverables ({task.deliverables.length})</h4>
                        {userRole === 'student' && (
                          <button 
                            className="btn btn-sm btn-outline"
                            onClick={() => handleAddDeliverable(task)}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Deliverable
                          </button>
                        )}
                      </div>
                      
                      {task.deliverables.length > 0 ? (
                        <div className="deliverables-list">
                          {task.deliverables.map((deliverable) => (
                            <div key={deliverable.id} className="deliverable-item-small">
                              <div className="deliverable-info">
                                <span className="deliverable-name">{deliverable.title}</span>
                                <span className={`badge badge-sm ${getStatusColor(deliverable.status)}`}>
                                  {deliverable.status.replace('_', ' ')}
                                </span>
                              </div>
                              <span className="deliverable-due">
                                Due: {new Date(deliverable.dueDate).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="no-deliverables">
                          No deliverables added yet.
                          {userRole === 'student' && " Click 'Add Deliverable' to get started."}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="task-actions">
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => handleViewDetails(task)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </button>
                    <div style={{ position: 'relative' }} ref={openMenuId === task.id ? menuRef : null}>
                      <button 
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleMenuToggle(task.id)}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      
                      {openMenuId === task.id && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          right: 0,
                          marginTop: '0.5rem',
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '0.5rem',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                          zIndex: 10,
                          minWidth: '180px',
                          padding: '0.5rem'
                        }}>
                          <button 
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                            onClick={() => handleViewDetails(task)}
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                          
                          {userRole === 'admin' && (
                            <>
                              <button 
                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                                onClick={() => handleContactStudent(task)}
                              >
                                <MessageSquare className="w-4 h-4" />
                                Contact Student
                              </button>
                              
                              {task.status !== 'completed' && task.status !== 'rejected' && (
                                <button 
                                  className="w-full text-left px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded flex items-center gap-2"
                                  onClick={() => handleMarkComplete(task)}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Mark as Complete
                                </button>
                              )}
                              
                              {task.status !== 'rejected' && task.status !== 'completed' && (
                                <button 
                                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded flex items-center gap-2"
                                  onClick={() => handleRejectTask(task)}
                                >
                                  <XCircle className="w-4 h-4" />
                                  Reject Task
                                </button>
                              )}
                              
                              <div style={{ borderTop: '1px solid #e2e8f0', margin: '0.5rem 0' }} />
                              
                              <button 
                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                                onClick={() => handleEditTask(task)}
                              >
                                <Edit className="w-4 h-4" />
                                Edit Task
                              </button>
                              
                              <button 
                                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded flex items-center gap-2"
                                onClick={() => handleDeleteTask(task)}
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete Task
                              </button>
                            </>
                          )}
                          
                          {userRole === 'student' && (
                            <>
                              <button 
                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                                onClick={() => handleContactStudent(task)}
                              >
                                <MessageSquare className="w-4 h-4" />
                                Contact Admin
                              </button>
                              
                              {task.status !== 'completed' && task.status !== 'rejected' && (
                                <button 
                                  className="w-full text-left px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded flex items-center gap-2"
                                  onClick={() => handleMarkComplete(task)}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Mark as Complete
                                </button>
                              )}
                              
                              <button 
                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                                onClick={() => handleEditTask(task)}
                              >
                                <Edit className="w-4 h-4" />
                                Edit Task
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showAddDeliverable && selectedTask && (
        <AddDeliverable
          taskId={selectedTask.id}
          taskTitle={selectedTask.title}
          onClose={() => {
            setShowAddDeliverable(false);
            setSelectedTask(null);
          }}
          onAdd={handleDeliverableAdded}
        />
      )}

      {showTaskDetail && selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          userRole={userRole}
          isOpen={showTaskDetail}
          onClose={() => {
            setShowTaskDetail(false);
            setSelectedTask(null);
          }}
          onTaskUpdate={handleTaskUpdate}
        />
      )}

      {showRejectModal && selectedTask && (
        <TaskRejectModal
          task={selectedTask}
          isOpen={showRejectModal}
          onClose={() => {
            setShowRejectModal(false);
            setSelectedTask(null);
          }}
          onReject={handleTaskRejection}
        />
      )}
    </div>
  );
}