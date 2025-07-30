import { useState } from 'react';
import { 
  Users, 
  FileText, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  Star,
  Plus,
  Eye,
  MoreHorizontal,
  X
} from 'lucide-react';

interface AdminDashboardProps {
  onViewChange: (view: string) => void;
}

export function AdminDashboard({ onViewChange }: AdminDashboardProps) {
  const [showBillModal, setShowBillModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const stats = [
    {
      title: "Total Students",
      value: "156",
      icon: Users,
      trend: "+12%",
      color: "text-blue-600"
    },
    {
      title: "Active Tasks",
      value: "89",
      icon: FileText,
      trend: "+5%",
      color: "text-green-600"
    },
    {
      title: "Pending Reviews",
      value: "23",
      icon: Clock,
      trend: "-2%",
      color: "text-orange-600"
    },
    {
      title: "Revenue",
      value: "$12,450",
      icon: DollarSign,
      trend: "+18%",
      color: "text-emerald-600"
    }
  ];

  const quickActions = [
    {
      title: "Review Tasks",
      description: "Review pending deliverables",
      icon: FileText,
      action: () => onViewChange('deliverables'),
      color: "bg-blue-50 text-blue-600"
    },
    {
      title: "Manage Billing",
      description: "Create and manage student bills",
      icon: DollarSign,
      action: () => onViewChange('billing'),
      color: "bg-green-50 text-green-600"
    },
    {
      title: "View Students",
      description: "Monitor student progress",
      icon: Users,
      action: () => onViewChange('students'),
      color: "bg-purple-50 text-purple-600"
    },
    {
      title: "Add Testimony",
      description: "Feature successful projects",
      icon: Star,
      action: () => onViewChange('testimonies'),
      color: "bg-yellow-50 text-yellow-600"
    }
  ];

  const tasksRequiringAttention = [
    {
      id: 1,
      title: "Machine Learning Research Paper",
      student: "John Smith",
      studentAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
      type: "Final Year Project",
      priority: "High Priority",
      status: "Pending Review",
      submittedAt: "1/27/2025",
      priorityColor: "bg-red-100 text-red-800",
      statusColor: "bg-blue-100 text-blue-800"
    },
    {
      id: 2,
      title: "Database Design Documentation",
      student: "Sarah Johnson",
      studentAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face",
      type: "Assignment",
      priority: "Medium",
      status: "Pending Approval",
      submittedAt: "1/28/2025",
      priorityColor: "bg-yellow-100 text-yellow-800",
      statusColor: "bg-orange-100 text-orange-800"
    },
    {
      id: 3,
      title: "Mobile App Prototype",
      student: "Mike Wilson",
      studentAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face",
      type: "Project",
      priority: "Low",
      status: "Needs Revision",
      submittedAt: "1/26/2025",
      priorityColor: "bg-green-100 text-green-800",
      statusColor: "bg-red-100 text-red-800"
    }
  ];

  const handleAddBill = (task: any) => {
    setSelectedTask(task);
    setShowBillModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <div className="card-content p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className={`text-sm ${stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.trend} from last month
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Quick Actions</h2>
          <p className="card-description">Manage your most common administrative tasks</p>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="flex flex-col items-center p-6 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className={`p-3 rounded-full ${action.color} mb-3`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <h3 className="font-medium text-center">{action.title}</h3>
                <p className="text-sm text-muted-foreground text-center mt-1">{action.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tasks Requiring Attention */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Tasks Requiring Attention</h2>
          <p className="card-description">Recent submissions and deliverables awaiting your review</p>
        </div>
        <div className="card-content">
          <div className="space-y-4">
            {tasksRequiringAttention.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="avatar w-10 h-10">
                    <img src={task.studentAvatar} alt={task.student} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{task.title}</h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <p className="text-sm text-muted-foreground">Student: {task.student}</p>
                      <span className="text-sm text-muted-foreground">{task.type}</span>
                      <span className="text-sm text-muted-foreground">Submitted: {task.submittedAt}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${task.priorityColor}`}>
                        {task.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${task.statusColor}`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    className="btn btn-outline btn-sm"
                    onClick={() => onViewChange('deliverables')}
                  >
                    Review
                  </button>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => onViewChange('deliverables')}
                  >
                    Approve
                  </button>
                  <button 
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleAddBill(task)}
                  >
                    <DollarSign className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Student Performance</h3>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Average Grade</span>
                <span className="font-medium">A-</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Completion Rate</span>
                <span className="font-medium">94%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">On-Time Delivery</span>
                <span className="font-medium">87%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Student Satisfaction</span>
                <span className="font-medium">4.8/5</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Achievements</h3>
          </div>
          <div className="card-content">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm">10 projects completed this week</span>
              </div>
              <div className="flex items-center space-x-3">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-sm">3 new 5-star reviews received</span>
              </div>
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <span className="text-sm">Revenue increased by 18%</span>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-purple-500" />
                <span className="text-sm">12 new students joined</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Bill Modal */}
      {showBillModal && selectedTask && (
        <AddBillModal
          task={selectedTask}
          onClose={() => {
            setShowBillModal(false);
            setSelectedTask(null);
          }}
          onAdd={(billData) => {
            // Handle bill creation
            console.log('Adding bill:', billData);
            setShowBillModal(false);
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
}

// Add Bill Modal Component
function AddBillModal({ task, onClose, onAdd }: { 
  task: any; 
  onClose: () => void; 
  onAdd: (billData: any) => void; 
}) {
  const [billData, setBillData] = useState({
    amount: '',
    description: '',
    dueDate: '',
    items: [{ description: '', amount: '' }]
  });

  const addItem = () => {
    setBillData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', amount: '' }]
    }));
  };

  const removeItem = (index: number) => {
    setBillData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: string, value: string) => {
    setBillData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalAmount = billData.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    
    onAdd({
      ...billData,
      taskId: task.id,
      taskTitle: task.title,
      student: task.student,
      totalAmount,
      createdAt: new Date().toISOString(),
      status: 'pending'
    });
  };

  return (
    <div className="feedback-modal-overlay">
      <div className="feedback-modal" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h3>Create Bill for {task.title}</h3>
          <button className="modal-close" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-content">
            <div className="space-y-4">
              <div>
                <label className="form-label">Student: {task.student}</label>
                <label className="form-label">Project: {task.title}</label>
              </div>

              <div className="form-group">
                <label className="form-label">Bill Description</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Final Year Project - ML Research Paper"
                  value={billData.description}
                  onChange={(e) => setBillData({...billData, description: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={billData.dueDate}
                  onChange={(e) => setBillData({...billData, dueDate: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <div className="flex items-center justify-between mb-2">
                  <label className="form-label">Bill Items</label>
                  <button type="button" className="btn btn-outline btn-sm" onClick={addItem}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </button>
                </div>
                
                <div className="space-y-3">
                  {billData.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="text"
                        className="form-input flex-1"
                        placeholder="Item description"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        required
                      />
                      <input
                        type="number"
                        className="form-input w-24"
                        placeholder="Amount"
                        value={item.amount}
                        onChange={(e) => updateItem(index, 'amount', e.target.value)}
                        required
                      />
                      {billData.items.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => removeItem(index)}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-3 p-3 bg-muted rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Amount:</span>
                    <span className="font-bold text-lg">
                      ${billData.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Bill
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}