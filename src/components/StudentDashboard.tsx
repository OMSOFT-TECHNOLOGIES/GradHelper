import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  DollarSign, 
  FileText, 
  MessageCircle,
  Plus,
  TrendingUp,
  Calendar,
  Award,
  Target,
  AlertCircle,
  UserPlus,
  Share2,
  Star
} from 'lucide-react';

interface StudentDashboardProps {
  onViewChange: (view: string) => void;
}

export function StudentDashboard({ onViewChange }: StudentDashboardProps) {
  const stats = [
    {
      title: "Active Tasks",
      value: "3",
      icon: FileText,
      trend: "+1 this week",
      color: "text-blue-600"
    },
    {
      title: "Completed",
      value: "12",
      icon: CheckCircle,
      trend: "94% success rate",
      color: "text-green-600"
    },
    {
      title: "Pending Review",
      value: "2",
      icon: Clock,
      trend: "Avg 2 days",
      color: "text-orange-600"
    },
    {
      title: "Total Spent",
      value: "$1,240",
      icon: DollarSign,
      trend: "This semester",
      color: "text-purple-600"
    }
  ];

  const quickActions = [
    {
      title: "Post New Task",
      description: "Get help with assignments",
      icon: Plus,
      action: () => onViewChange('post-task'),
      color: "bg-blue-50 text-blue-600",
      primary: true
    },
    {
      title: "Schedule Meeting",
      description: "Book expert consultation",
      icon: Calendar,
      action: () => onViewChange('meetings'),
      color: "bg-green-50 text-green-600"
    },
    {
      title: "Join Partnership",
      description: "Earn with referrals",
      icon: UserPlus,
      action: () => onViewChange('partnerships'),
      color: "bg-purple-50 text-purple-600"
    },
    {
      title: "Share Experience",
      description: "Write a testimony",
      icon: Star,
      action: () => onViewChange('testimonies'),
      color: "bg-yellow-50 text-yellow-600"
    },
    {
      title: "Chat with Admin",
      description: "Get instant support",
      icon: MessageCircle,
      action: () => onViewChange('chat'),
      color: "bg-orange-50 text-orange-600"
    }
  ];

  const recentTasks = [
    {
      id: 1,
      title: "Machine Learning Research Paper",
      type: "Final Year Project",
      status: "In Progress",
      progress: 75,
      dueDate: "2025-02-15",
      statusColor: "bg-blue-100 text-blue-800",
      priority: "High"
    },
    {
      id: 2,
      title: "Database Design Assignment",
      type: "Assignment",
      status: "Under Review",
      progress: 100,
      dueDate: "2025-01-30",
      statusColor: "bg-orange-100 text-orange-800",
      priority: "Medium"
    },
    {
      id: 3,
      title: "Web Development Project",
      type: "Project",
      status: "Not Started",
      progress: 0,
      dueDate: "2025-02-28",
      statusColor: "bg-gray-100 text-gray-800",
      priority: "Low"
    }
  ];

  const recentActivity = [
    {
      type: "deliverable_approved",
      message: "Literature Review approved",
      time: "2 hours ago",
      icon: CheckCircle,
      color: "text-green-500"
    },
    {
      type: "meeting_scheduled",
      message: "Meeting scheduled for tomorrow",
      time: "4 hours ago",
      icon: Calendar,
      color: "text-blue-500"
    },
    {
      type: "feedback_received",
      message: "New feedback on ER Diagram",
      time: "4 hours ago",
      icon: MessageCircle,
      color: "text-blue-500"
    },
    {
      type: "partnership_earnings",
      message: "Earned $25 from referral",
      time: "1 day ago",
      icon: DollarSign,
      color: "text-green-500"
    }
  ];

  const upcomingDeadlines = [
    {
      task: "ML Research Paper - Final Draft",
      date: "Feb 15, 2025",
      daysLeft: 18,
      urgent: false
    },
    {
      task: "Database Assignment - Presentation",
      date: "Feb 01, 2025",
      daysLeft: 4,
      urgent: true
    },
    {
      task: "Meeting with Dr. Smith",
      date: "Jan 31, 2025",
      daysLeft: 3,
      urgent: false
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="card">
        <div className="card-content p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Welcome back, Sarah! 👋</h1>
              <p className="text-muted-foreground mt-1">
                Here's what's happening with your projects today.
              </p>
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => onViewChange('post-task')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Post New Task
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <div className="card-content p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.trend}</p>
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
          <p className="card-description">Manage your academic work efficiently</p>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`flex flex-col items-center p-6 border rounded-lg transition-all hover:scale-105 ${
                  action.primary 
                    ? 'border-primary bg-primary/5 shadow-lg' 
                    : 'border-border hover:bg-muted/50'
                }`}
              >
                <div className={`p-3 rounded-full ${action.color} mb-3`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <h3 className="font-medium text-center">{action.title}</h3>
                <p className="text-sm text-muted-foreground text-center mt-1">
                  {action.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">My Recent Tasks</h3>
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => onViewChange('my-tasks')}
            >
              View All
            </button>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {recentTasks.map((task) => (
                <div key={task.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{task.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${task.statusColor}`}>
                      {task.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                    <span>{task.type}</span>
                    <span>Due: {task.dueDate}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-muted-foreground">
                      {task.progress}% complete
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      task.priority === 'High' ? 'bg-red-100 text-red-800' :
                      task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Activity</h3>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full bg-opacity-10 ${activity.color}`}>
                    <activity.icon className={`w-4 h-4 ${activity.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Upcoming Deadlines</h3>
          <p className="card-description">Stay on top of your important dates</p>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingDeadlines.map((deadline, index) => (
              <div 
                key={index} 
                className={`p-4 border rounded-lg ${
                  deadline.urgent ? 'border-red-200 bg-red-50' : 'border-border'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm">{deadline.task}</h4>
                  {deadline.urgent && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{deadline.date}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    deadline.urgent 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {deadline.daysLeft} days left
                  </span>
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Academic Performance</h3>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Average Grade</span>
                <span className="font-medium">A-</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Projects Completed</span>
                <span className="font-medium">12/15</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">On-Time Delivery</span>
                <span className="font-medium">94%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Expert Rating</span>
                <div className="flex items-center space-x-1">
                  <span className="font-medium">4.8</span>
                  <div className="flex">
                    {[1,2,3,4,5].map(star => (
                      <Award key={star} className="w-3 h-3 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">This Month's Goals</h3>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Target className="w-5 h-5 text-green-500" />
                <span className="text-sm">Complete ML research paper</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-blue-500" />
                <span className="text-sm">Submit database assignment</span>
              </div>
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                <span className="text-sm">Maintain A- average</span>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-orange-500" />
                <span className="text-sm">Plan next semester courses</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}