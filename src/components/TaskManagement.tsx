import { useState } from 'react';
import { AddDeliverable } from './AddDeliverable';
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
  DollarSign
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  subject: string;
  status: 'pending' | 'in_progress' | 'completed' | 'revision_needed';
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
                    <button className="btn btn-outline btn-sm">
                      View Details
                    </button>
                    <button className="btn btn-ghost btn-sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
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
    </div>
  );
}