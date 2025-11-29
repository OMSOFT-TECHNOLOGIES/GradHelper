import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  DollarSign, 
  FileText, 
  MessageCircle,
  Plus,
  Calendar,
  AlertCircle,
  UserPlus,
  Share2,
  Star
} from 'lucide-react';
import { API_BASE_URL } from '../utils/api';

interface StudentDashboardProps {
  onViewChange: (view: string) => void;
}

interface TaskSummary {
  total_active_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  total_tasks: number;
}

interface RecentTask {
  id: number;
  title: string;
  type: string;
  status: string;
  priority: string;
  deadline: string;
  created_at: string;
  updated_at: string;
}

interface UpcomingDeadline {
  id: number;
  title: string;
  type: string;
  deadline: string;
  status: string;
  priority: string;
  days_remaining: number;
}

interface DashboardStats {
  tasks_this_month: number;
  overdue_tasks: number;
}

interface DashboardData {
  task_summary: TaskSummary;
  recent_tasks: RecentTask[];
  upcoming_deadlines: UpcomingDeadline[];
  dashboard_stats: DashboardStats;
}

export function StudentDashboard({ onViewChange }: StudentDashboardProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('Student');

  // Get username from localStorage
  useEffect(() => {
    const getUserName = () => {
      try {
        const savedUser = localStorage.getItem('gradhelper_user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          // Try different possible username fields
          const name = userData.first_name || userData.name || userData.username || 'Student';
          setUserName(name);
        }
      } catch (error) {
        console.error('Error getting username:', error);
        setUserName('Student'); // Fallback
      }
    };

    getUserName();
  }, []);

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('gradhelper_token');
        if (!token) {
          setError('No authentication token found');
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/accounts/student/dashboard/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Dashboard data:', data);
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Helper function to get task status color
  const getTaskStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to calculate progress based on status
  const getTaskProgress = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 100;
      case 'in_progress':
        return 60;
      case 'pending':
        return 30;
      case 'cancelled':
        return 0;
      default:
        return 0;
    }
  };

  // Generate stats from API data
  const stats = dashboardData ? [
    {
      title: "Active Tasks",
      value: dashboardData.task_summary.total_active_tasks.toString(),
      icon: FileText,
      trend: `${dashboardData.dashboard_stats.tasks_this_month} this month`,
      color: "text-blue-600"
    },
    {
      title: "Completed",
      value: dashboardData.task_summary.completed_tasks.toString(),
      icon: CheckCircle,
      trend: `${dashboardData.task_summary.total_tasks} total tasks`,
      color: "text-green-600"
    },
    {
      title: "Pending Tasks",
      value: dashboardData.task_summary.pending_tasks.toString(),
      icon: Clock,
      trend: `${dashboardData.dashboard_stats.overdue_tasks} overdue`,
      color: "text-orange-600"
    },
    {
      title: "Upcoming Deadlines",
      value: dashboardData.upcoming_deadlines.length.toString(),
      icon: Calendar,
      trend: "Next 7 days",
      color: "text-purple-600"
    }
  ] : [];

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

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="card">
          <div className="card-content p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading dashboard...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="card">
          <div className="card-content p-6">
            <div className="flex items-center justify-center text-red-600">
              <AlertCircle className="w-6 h-6 mr-2" />
              <span>{error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!dashboardData) {
    return (
      <div className="space-y-6">
        <div className="card">
          <div className="card-content p-6">
            <div className="text-center">
              <span>No dashboard data available</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="card">
        <div className="card-content p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {userName}! 👋</h1>
              <p className="text-muted-foreground mt-1">
                Here's what's happening with your projects today.
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => window.location.reload()}
              >
                Refresh
              </button>
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
            {dashboardData.recent_tasks.length > 0 ? (
              dashboardData.recent_tasks.map((task) => (
                <div key={task.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{task.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTaskStatusColor(task.status)}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                    <span>{task.type}</span>
                    <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${getTaskProgress(task.status)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-muted-foreground">
                      {getTaskProgress(task.status)}% complete
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">No recent tasks</h4>
                <p className="text-muted-foreground mb-4">
                  Start by posting your first task to get expert help
                </p>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => onViewChange('post-task')}
                >
                  Post New Task
                </button>
              </div>
            )}
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
            {dashboardData.upcoming_deadlines.length > 0 ? (
              dashboardData.upcoming_deadlines.map((deadline) => (
                <div 
                  key={deadline.id} 
                  className={`p-4 border rounded-lg ${
                    deadline.days_remaining <= 3 ? 'border-red-200 bg-red-50' : 'border-border'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{deadline.title}</h4>
                    {deadline.days_remaining <= 3 && (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {new Date(deadline.deadline).toLocaleDateString()}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      deadline.days_remaining <= 3
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {deadline.days_remaining} days left
                    </span>
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">No upcoming deadlines</h4>
                <p className="text-muted-foreground">
                  All your tasks are up to date!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>


    </div>
  );
}