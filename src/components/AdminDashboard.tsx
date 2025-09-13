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
  UserCheck,
  X,
  BarChart3,
  PieChart,
  Trophy
} from 'lucide-react';
import { toast } from "sonner";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface AdminDashboardProps {
  onViewChange: (view: string) => void;
}

export function AdminDashboard({ onViewChange }: AdminDashboardProps) {
  const [showBillModal, setShowBillModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  // Mock revenue data for charts
  const monthlyRevenueData = [
    { month: 'Jul', revenue: 8500, expenses: 3200, profit: 5300 },
    { month: 'Aug', revenue: 9200, expenses: 3400, profit: 5800 },
    { month: 'Sep', revenue: 10100, expenses: 3600, profit: 6500 },
    { month: 'Oct', revenue: 11200, expenses: 3800, profit: 7400 },
    { month: 'Nov', revenue: 10800, expenses: 3900, profit: 6900 },
    { month: 'Dec', revenue: 12450, expenses: 4100, profit: 8350 },
    { month: 'Jan', revenue: 13200, expenses: 4200, profit: 9000 }
  ];

  const dailyRevenueData = [
    { day: '1', revenue: 420 },
    { day: '2', revenue: 380 },
    { day: '3', revenue: 450 },
    { day: '4', revenue: 520 },
    { day: '5', revenue: 480 },
    { day: '6', revenue: 390 },
    { day: '7', revenue: 410 },
    { day: '8', revenue: 550 },
    { day: '9', revenue: 480 },
    { day: '10', revenue: 620 },
    { day: '11', revenue: 580 },
    { day: '12', revenue: 640 },
    { day: '13', revenue: 520 },
    { day: '14', revenue: 490 },
    { day: '15', revenue: 680 },
    { day: '16', revenue: 720 },
    { day: '17', revenue: 650 },
    { day: '18', revenue: 580 },
    { day: '19', revenue: 610 },
    { day: '20', revenue: 590 },
    { day: '21', revenue: 540 },
    { day: '22', revenue: 620 },
    { day: '23', revenue: 680 },
    { day: '24', revenue: 750 },
    { day: '25', revenue: 720 },
    { day: '26', revenue: 650 },
    { day: '27', revenue: 580 },
    { day: '28', revenue: 520 },
    { day: '29', revenue: 490 },
    { day: '30', revenue: 530 },
    { day: '31', revenue: 580 }
  ];

  const revenueByServiceData = [
    { name: 'Final Year Projects', value: 5800, color: '#1e40af' },
    { name: 'Assignments', value: 3200, color: '#10b981' },
    { name: 'Research Papers', value: 2150, color: '#f59e0b' },
    { name: 'Consultations', value: 850, color: '#ef4444' },
    { name: 'Partnerships', value: 450, color: '#8b5cf6' }
  ];

  const COLORS = ['#1e40af', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Mock partner payout data
  const monthlyPayoutData = [
    { month: 'Jul', payouts: 850, partners: 12, avgPayout: 71 },
    { month: 'Aug', payouts: 920, partners: 14, avgPayout: 66 },
    { month: 'Sep', payouts: 1150, partners: 16, avgPayout: 72 },
    { month: 'Oct', payouts: 1320, partners: 18, avgPayout: 73 },
    { month: 'Nov', payouts: 1280, partners: 19, avgPayout: 67 },
    { month: 'Dec', payouts: 1445, partners: 21, avgPayout: 69 },
    { month: 'Jan', payouts: 1620, partners: 24, avgPayout: 68 }
  ];

  const topPartnersData = [
    { name: 'Alex Thompson', earnings: 285, referrals: 8, avgOrder: 36 },
    { name: 'Sarah Chen', earnings: 245, referrals: 7, avgOrder: 35 },
    { name: 'Mike Johnson', earnings: 220, referrals: 6, avgOrder: 37 },
    { name: 'Emma Davis', earnings: 180, referrals: 5, avgOrder: 36 },
    { name: 'David Wilson', earnings: 165, referrals: 4, avgOrder: 41 },
    { name: 'Lisa Brown', earnings: 140, referrals: 4, avgOrder: 35 }
  ];

  const revenueVsPayoutData = [
    { month: 'Jul', revenue: 8500, payouts: 850, retained: 7650 },
    { month: 'Aug', revenue: 9200, payouts: 920, retained: 8280 },
    { month: 'Sep', revenue: 10100, payouts: 1150, retained: 8950 },
    { month: 'Oct', revenue: 11200, payouts: 1320, retained: 9880 },
    { month: 'Nov', revenue: 10800, payouts: 1280, retained: 9520 },
    { month: 'Dec', revenue: 12450, payouts: 1445, retained: 11005 },
    { month: 'Jan', revenue: 13200, payouts: 1620, retained: 11580 }
  ];

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
      title: "Accomplishments",
      description: "Manage company achievements",
      icon: Trophy,
      action: () => onViewChange('accomplishments'),
      color: "bg-orange-50 text-orange-600"
    },
    {
      title: "Manage Testimonies",
      description: "Review student testimonials",
      icon: Star,
      action: () => onViewChange('testimonies'),
      color: "bg-yellow-50 text-yellow-600"
    },
    {
      title: "Partnership Requests",
      description: "Review partnership applications",
      icon: UserCheck,
      action: () => onViewChange('partnership-requests'),
      color: "bg-indigo-50 text-indigo-600"
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

  const handleTaskReview = (taskTitle: string) => {
    toast.info(`Reviewing task: ${taskTitle}`, {
      description: "Redirecting to deliverables view..."
    });
    onViewChange('deliverables');
  };

  const handleTaskApproval = (taskTitle: string, studentName: string) => {
    toast.success(`Task approved successfully!`, {
      description: `${taskTitle} by ${studentName} has been approved.`
    });
    // In a real app, this would make an API call to approve the task
  };

  const handlePartnerPayout = () => {
    toast.loading("Processing partner payouts...", {
      id: "payout-process",
      description: "This may take a few moments"
    });
    
    // Simulate API call
    setTimeout(() => {
      toast.success("Partner payouts processed successfully!", {
        id: "payout-process",
        description: "$1,620 distributed to 24 partners"
      });
    }, 2000);
  };

  const handleQuickAction = (actionTitle: string, action: () => void) => {
    toast.info(`${actionTitle}`, {
      description: "Loading..."
    });
    action();
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
                onClick={() => handleQuickAction(action.title, action.action)}
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
                    onClick={() => handleTaskReview(task.title)}
                  >
                    Review
                  </button>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => handleTaskApproval(task.title, task.student)}
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

      {/* Revenue Analytics */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Revenue Analytics</h2>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Financial Performance</span>
          </div>
        </div>

        {/* Revenue Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card">
            <div className="card-content p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-blue-600">$13,200</p>
                  <p className="text-sm text-green-600">+6.1% vs last month</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-full">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Profit Margin</p>
                  <p className="text-2xl font-bold text-green-600">68.2%</p>
                  <p className="text-sm text-green-600">+2.4% vs last month</p>
                </div>
                <div className="p-2 bg-green-50 rounded-full">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Order Value</p>
                  <p className="text-2xl font-bold text-purple-600">$285</p>
                  <p className="text-sm text-green-600">+12.5% vs last month</p>
                </div>
                <div className="p-2 bg-purple-50 rounded-full">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold text-orange-600">46</p>
                  <p className="text-sm text-red-600">-3.2% vs last month</p>
                </div>
                <div className="p-2 bg-orange-50 rounded-full">
                  <FileText className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Revenue Trend */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Monthly Revenue Trend</h3>
            <p className="card-description">Revenue, expenses, and profit over the last 7 months</p>
          </div>
          <div className="card-content">
            <div className="chart-height-lg">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#64748b"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#64748b"
                    fontSize={12}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value, name) => [`${value.toLocaleString()}`, name]}
                    labelStyle={{ color: '#1e293b' }}
                    contentStyle={{ 
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.5rem'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#1e40af" 
                    strokeWidth={3}
                    name="Revenue"
                    dot={{ fill: '#1e40af', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="expenses" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Expenses"
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    name="Profit"
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Revenue Breakdown and Daily Revenue */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue by Service Type */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Revenue by Service Type</h3>
              <p className="card-description">Breakdown of revenue sources this month</p>
            </div>
            <div className="card-content">
              <div className="chart-height-md">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={revenueByServiceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) => `${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {revenueByServiceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value.toLocaleString()}`, 'Revenue']}
                      contentStyle={{ 
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem'
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {revenueByServiceData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index] }}
                      />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-medium">${item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Daily Revenue This Month */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Daily Revenue - January</h3>
              <p className="card-description">Daily revenue breakdown for current month</p>
            </div>
            <div className="card-content">
              <div className="chart-height-md">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="day" 
                      stroke="#64748b"
                      fontSize={12}
                      interval={4}
                    />
                    <YAxis 
                      stroke="#64748b"
                      fontSize={12}
                      tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value}`, 'Revenue']}
                      labelFormatter={(label) => `Day ${label}`}
                      contentStyle={{ 
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue vs Expenses Comparison */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Revenue vs Expenses Comparison</h3>
            <p className="card-description">Monthly comparison of revenue and expenses with profit margins</p>
          </div>
          <div className="card-content">
            <div className="chart-height-md">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#64748b"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#64748b"
                    fontSize={12}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value, name) => [`${value.toLocaleString()}`, name]}
                    contentStyle={{ 
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.5rem'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#1e40af" name="Revenue" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Partner Payout Analytics */}
        <div className="space-y-6 partner-analytics-section">
          <div className="partner-analytics-header">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Partner Payout Analytics</h2>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={handlePartnerPayout}
                  className="btn btn-primary btn-sm flex items-center space-x-2"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Process Payouts</span>
                </button>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-muted-foreground">Partnership Performance</span>
                </div>
              </div>
            </div>
          </div>

          {/* Partner Payout Metrics Cards */}
          <div className="partner-metrics-grid">
            <div className="card">
              <div className="card-content p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Payouts</p>
                    <p className="text-2xl font-bold text-purple-600">$1,620</p>
                    <p className="text-sm text-green-600">+12.1% vs last month</p>
                  </div>
                  <div className="p-2 bg-purple-50 rounded-full">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-content p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Partners</p>
                    <p className="text-2xl font-bold text-blue-600">24</p>
                    <p className="text-sm text-green-600">+3 new this month</p>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-full">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-content p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Payout/Partner</p>
                    <p className="text-2xl font-bold text-green-600">$68</p>
                    <p className="text-sm text-red-600">-1.5% vs last month</p>
                  </div>
                  <div className="p-2 bg-green-50 rounded-full">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-content p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Payout Rate</p>
                    <p className="text-2xl font-bold text-orange-600">12.3%</p>
                    <p className="text-sm text-green-600">of total revenue</p>
                  </div>
                  <div className="p-2 bg-orange-50 rounded-full">
                    <BarChart3 className="w-5 h-5 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Partner Payouts Trend */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Monthly Partner Payouts Trend</h3>
              <p className="card-description">Total payouts and partner count over the last 7 months</p>
            </div>
            <div className="card-content">
              <div className="chart-height-lg">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyPayoutData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#64748b"
                      fontSize={12}
                    />
                    <YAxis 
                      yAxisId="payouts"
                      stroke="#64748b"
                      fontSize={12}
                      tickFormatter={(value) => `${value}`}
                    />
                    <YAxis 
                      yAxisId="partners"
                      orientation="right"
                      stroke="#64748b"
                      fontSize={12}
                    />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'payouts') return [`${value.toLocaleString()}`, 'Total Payouts'];
                        if (name === 'partners') return [value, 'Active Partners'];
                        if (name === 'avgPayout') return [`${value}`, 'Avg Payout'];
                        return [value, name];
                      }}
                      labelStyle={{ color: '#1e293b' }}
                      contentStyle={{ 
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Legend />
                    <Line 
                      yAxisId="payouts"
                      type="monotone" 
                      dataKey="payouts" 
                      stroke="#8b5cf6" 
                      strokeWidth={3}
                      name="Total Payouts"
                      dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      yAxisId="partners"
                      type="monotone" 
                      dataKey="partners" 
                      stroke="#1e40af" 
                      strokeWidth={2}
                      name="Active Partners"
                      dot={{ fill: '#1e40af', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Top Partners and Revenue vs Payouts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Partners by Earnings */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Top Partners This Month</h3>
                <p className="card-description">Highest earning partners by referral commissions</p>
              </div>
              <div className="card-content">
                <div className="chart-height-md">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topPartnersData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis 
                        type="number" 
                        stroke="#64748b"
                        fontSize={12}
                        tickFormatter={(value) => `${value}`}
                      />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        stroke="#64748b"
                        fontSize={10}
                        width={80}
                        tick={{ fontSize: 10 }}
                      />
                      <Tooltip 
                        formatter={(value, name) => {
                          if (name === 'earnings') return [`${value}`, 'Earnings'];
                          return [value, name];
                        }}
                        contentStyle={{ 
                          backgroundColor: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '0.5rem'
                        }}
                      />
                      <Bar 
                        dataKey="earnings" 
                        fill="#8b5cf6" 
                        name="Earnings"
                        radius={[0, 2, 2, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="top-partners-legend">
                  {topPartnersData.slice(0, 3).map((partner, index) => (
                    <div key={partner.name} className="top-partner-item">
                      <div className="flex items-center">
                        <div className={`partner-rank-indicator ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 'bg-orange-600'
                        }`} />
                        <span className="text-sm font-medium">{partner.name}</span>
                      </div>
                      <div className="partner-earnings-info">
                        <div className="font-semibold text-sm">${partner.earnings}</div>
                        <div className="text-xs text-muted-foreground">{partner.referrals} referrals</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Revenue vs Payouts Comparison */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Revenue vs Partner Payouts</h3>
                <p className="card-description">Monthly comparison of total revenue and partner payouts</p>
              </div>
              <div className="card-content">
                <div className="chart-height-md">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueVsPayoutData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="month" 
                        stroke="#64748b"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#64748b"
                        fontSize={12}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip 
                        formatter={(value, name) => {
                          if (name === 'revenue') return [`${value.toLocaleString()}`, 'Total Revenue'];
                          if (name === 'payouts') return [`${value.toLocaleString()}`, 'Partner Payouts'];
                          if (name === 'retained') return [`${value.toLocaleString()}`, 'Revenue Retained'];
                          return [value, name];
                        }}
                        contentStyle={{ 
                          backgroundColor: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '0.5rem'
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="retained"
                        stackId="1"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.4}
                        name="Revenue Retained"
                      />
                      <Area
                        type="monotone"
                        dataKey="payouts"
                        stackId="1"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.7}
                        name="Partner Payouts"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Partnership Insights Summary */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Partnership Program Insights</h3>
              <p className="card-description">Key insights and trends from your partnership program</p>
            </div>
            <div className="card-content">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <div className="partner-insight-item">
                    <TrendingUp className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-sm">Partner growth rate: +25% this quarter</span>
                  </div>
                  <div className="partner-insight-item">
                    <DollarSign className="w-5 h-5 text-blue-500 mr-3" />
                    <span className="text-sm">Average commission per referral: $37</span>
                  </div>
                  <div className="partner-insight-item">
                    <Users className="w-5 h-5 text-purple-500 mr-3" />
                    <span className="text-sm">Top 3 partners generate 45% of referrals</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="partner-insight-item">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-sm">Partner retention rate: 87%</span>
                  </div>
                  <div className="partner-insight-item">
                    <Star className="w-5 h-5 text-yellow-500 mr-3" />
                    <span className="text-sm">Average partner satisfaction: 4.6/5</span>
                  </div>
                  <div className="partner-insight-item">
                    <FileText className="w-5 h-5 text-blue-500 mr-3" />
                    <span className="text-sm">Pending payout requests: 3</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="partner-insight-item">
                    <AlertCircle className="w-5 h-5 text-orange-500 mr-3" />
                    <span className="text-sm">Partners need attention: 2</span>
                  </div>
                  <div className="partner-insight-item">
                    <TrendingUp className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-sm">ROI on partnerships: 320%</span>
                  </div>
                  <div className="partner-insight-item">
                    <Clock className="w-5 h-5 text-gray-500 mr-3" />
                    <span className="text-sm">Next payout date: Feb 15, 2025</span>
                  </div>
                </div>
              </div>
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
    <div className="modal-overlay">
      <div className="modal modal-lg">
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Create Bill for {task.title}</h3>
          </div>
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
            <button type="button" className="btn btn-secondary" onClick={onClose}>
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