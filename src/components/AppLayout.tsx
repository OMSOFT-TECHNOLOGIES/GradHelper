import { useState } from 'react';
import { 
  Menu, 
  X,
  BarChart3,
  Users,
  FileText,
  MessageCircle,
  CreditCard,
  Settings,
  HelpCircle,
  LogOut,
  Plus,
  CheckSquare,
  Star,
  BookOpen,
  Send,
  User,
  Calendar,
  UserPlus,
  ChevronDown
} from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import { RefundRequestModal } from './RefundRequestModal';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import logoImage from '../assets/71eefff8a544630cca22726eead746724ce853a1.png';
import dropdownImage from '../assets/af259eb6acf8efd20829570c4c334971fdbcab54.png';

// Utility function to generate initials from user name
const getUserInitials = (name: string | undefined): string => {
  if (!name) return 'U';
  
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
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

interface AppLayoutProps {
  children: React.ReactNode;
  userRole: 'student' | 'admin';
  currentView: string;
  onViewChange: (view: string) => void;
  user: any;
  onSignOut: () => void;
}

export function AppLayout({ children, userRole, currentView, onViewChange, user, onSignOut }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refundModalOpen, setRefundModalOpen] = useState(false);

  const handleUserMenuAction = (action: string) => {
    switch (action) {
      case 'profile':
        onViewChange('profile');
        break;
      case 'settings':
        onViewChange('settings');
        break;
      case 'help':
        onViewChange('help-support');
        break;
      case 'signout':
        onSignOut();
        break;
    }
  };

  const studentMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'post-task', label: 'Post Task', icon: Plus },
    { id: 'my-tasks', label: 'My Tasks', icon: FileText },
    { id: 'deliverables', label: 'Deliverables', icon: CheckSquare },
    { id: 'meetings', label: 'Meetings', icon: Calendar },
    { id: 'partnerships', label: 'Partnerships', icon: UserPlus },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    //{ id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'chat', label: 'Chat with Admin', icon: Send },
  ];

  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'all-tasks', label: 'All Tasks', icon: FileText },
    { id: 'deliverables', label: 'Deliverables', icon: CheckSquare },
    { id: 'meetings', label: 'Meetings', icon: Calendar },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'students', label: 'Students', icon: Users },
    //{ id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'chat', label: 'Chat with Students', icon: Send },
    { id: 'testimonies', label: 'Testimonies', icon: Star },
    { id: 'help', label: 'Help Requests', icon: HelpCircle },
  ];

  const menuItems = userRole === 'student' ? studentMenuItems : adminMenuItems;

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Professional Sticky Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        bg-white shadow-xl border-r border-gray-200
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <img src={logoImage} alt="TheGradHelper" className="w-6 h-6" />
            </div>
            <div className="text-white">
              <h2 className="font-bold text-lg">GradHelper</h2>
              <p className="text-xs text-blue-100">Academic Excellence</p>
            </div>
          </div>
          <button 
            className="lg:hidden text-white hover:bg-white/20 p-1 rounded-md transition-colors"
            onClick={closeSidebar}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info Section */}
        <div className="p-6 bg-gradient-to-b from-blue-50 to-white border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className={`w-12 h-12 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-lg ${getInitialsColor(user?.name)}`}>
                {getUserInitials(user?.name)}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{user?.name || 'User'}</p>
              <p className="text-sm text-gray-500 capitalize">{userRole}</p>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span className="text-xs text-green-600 font-medium">Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">
              Navigation
            </p>
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`
                  w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200
                  ${currentView === item.id 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-[1.02]' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm'
                  }
                  group
                `}
                onClick={() => {
                  onViewChange(item.id);
                  closeSidebar();
                }}
              >
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-lg mr-3 transition-colors
                  ${currentView === item.id 
                    ? 'bg-white/20' 
                    : 'bg-gray-200 group-hover:bg-blue-100'
                  }
                `}>
                  <item.icon className={`
                    w-4 h-4 transition-colors
                    ${currentView === item.id 
                      ? 'text-white' 
                      : 'text-gray-600 group-hover:text-blue-600'
                    }
                  `} />
                </div>
                <span className="flex-1 text-left">{item.label}</span>
                {currentView === item.id && (
                  <div className="w-2 h-2 bg-white rounded-full opacity-80"></div>
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          {/* Help & Support Section */}
          <div className="space-y-2 mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Support
            </p>
            
            {/* Help & Support */}
            <button
              onClick={() => {
                onViewChange('help-support');
                closeSidebar();
              }}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors group"
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-md mr-3 bg-blue-100 group-hover:bg-blue-200 transition-colors">
                <HelpCircle className="w-3 h-3 text-blue-600" />
              </div>
              <span className="flex-1 text-left">Help & Support</span>
            </button>

            {/* Request Refund */}
            <button
              onClick={() => {
                setRefundModalOpen(true);
                closeSidebar();
              }}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors group"
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-md mr-3 bg-yellow-100 group-hover:bg-yellow-200 transition-colors">
                <CreditCard className="w-3 h-3 text-yellow-600" />
              </div>
              <span className="flex-1 text-left">Request Refund</span>
            </button>

            {/* Mail Us Directly */}
            <button
              onClick={() => {
                const subject = encodeURIComponent('GradHelper Support Request');
                const body = encodeURIComponent(`Hello GradHelper Team,\n\nUser: ${user?.name}\nEmail: ${user?.email || 'Not provided'}\n\nMessage:\n\n\nBest regards,\n${user?.name || 'User'}`);
                window.open(`mailto:support@gradhelper.com?subject=${subject}&body=${body}`, '_blank');
              }}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors group"
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-md mr-3 bg-green-100 group-hover:bg-green-200 transition-colors">
                <Send className="w-3 h-3 text-green-600" />
              </div>
              <span className="flex-1 text-left">Email Support</span>
            </button>
          </div>

          {/* Settings & Sign Out */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-300">
            <button
              onClick={() => {
                onViewChange('settings');
                closeSidebar();
              }}
              className="flex items-center space-x-3 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-7 h-7 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                <Settings className="w-3 h-3 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Settings</p>
                <p className="text-xs text-gray-500">Preferences</p>
              </div>
            </button>
            <button 
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              onClick={onSignOut}
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-0 overflow-hidden">
        {/* Professional Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <button
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>
              
              {/* Page Title with Breadcrumb */}
              <div className="flex items-center space-x-2">
                <div className="hidden lg:flex items-center space-x-2 text-sm text-gray-500">
                  <span>Dashboard</span>
                  <span>/</span>
                </div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {menuItems.find(item => item.id === currentView)?.label || 'Dashboard'}
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Quick Actions */}
              <div className="hidden md:flex items-center space-x-2">
                {userRole === 'student' && (
                  <button
                    onClick={() => onViewChange('post-task')}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Task
                  </button>
                )}
              </div>

              {/* Notification Bell */}
              <NotificationBell 
                userId={user?.id || 'demo-user'} 
                userRole={userRole} 
              />
              
              {/* Professional User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-3 px-3 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md group">
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-xl border-2 border-white shadow-sm flex items-center justify-center text-white font-semibold text-sm ${getInitialsColor(user?.name)} group-hover:shadow-md transition-shadow`}>
                        {getUserInitials(user?.name)}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full shadow-sm"></div>
                    </div>
                    <div className="hidden md:block text-left min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate max-w-32">{user?.name || 'User'}</p>
                      <p className="text-xs text-gray-500 capitalize font-medium">{userRole} Account</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 shadow-xl border border-gray-200 bg-white rounded-2xl p-2">
                  {/* User Info Header */}
                  <div className="px-4 py-4 mb-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-xl border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-lg ${getInitialsColor(user?.name)}`}>
                          {getUserInitials(user?.name)}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-bold text-gray-900 truncate">{user?.name || 'User'}</p>
                        <p className="text-sm text-gray-600 capitalize font-medium">{userRole} Account</p>
                        <div className="flex items-center mt-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                          <span className="text-xs text-green-600 font-semibold">Active Session</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="space-y-1">
                    <DropdownMenuItem 
                      onClick={() => handleUserMenuAction('profile')}
                      className="flex items-center px-4 py-3 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 cursor-pointer group"
                    >
                      <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-xl flex items-center justify-center mr-3 transition-colors">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">My Profile</p>
                        <p className="text-xs text-gray-500">Manage account details</p>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                      onClick={() => handleUserMenuAction('settings')}
                      className="flex items-center px-4 py-3 rounded-xl hover:bg-green-50 hover:text-green-700 transition-all duration-200 cursor-pointer group"
                    >
                      <div className="w-10 h-10 bg-green-100 group-hover:bg-green-200 rounded-xl flex items-center justify-center mr-3 transition-colors">
                        <Settings className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">Settings</p>
                        <p className="text-xs text-gray-500">Preferences & privacy</p>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                      onClick={() => handleUserMenuAction('help')}
                      className="flex items-center px-4 py-3 rounded-xl hover:bg-purple-50 hover:text-purple-700 transition-all duration-200 cursor-pointer group"
                    >
                      <div className="w-10 h-10 bg-purple-100 group-hover:bg-purple-200 rounded-xl flex items-center justify-center mr-3 transition-colors">
                        <HelpCircle className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">Help & Support</p>
                        <p className="text-xs text-gray-500">Get assistance & guides</p>
                      </div>
                    </DropdownMenuItem>
                  </div>

                  {/* Separator */}
                  <div className="my-2 border-t border-gray-200"></div>

                  {/* Sign Out */}
                  <DropdownMenuItem 
                    onClick={() => handleUserMenuAction('signout')}
                    className="flex items-center px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 cursor-pointer group"
                  >
                    <div className="w-10 h-10 bg-red-100 group-hover:bg-red-200 rounded-xl flex items-center justify-center mr-3 transition-colors">
                      <LogOut className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">Sign Out</p>
                      <p className="text-xs text-red-500">End current session</p>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Refund Request Modal */}
      <RefundRequestModal 
        isOpen={refundModalOpen}
        onClose={() => setRefundModalOpen(false)}
        user={user}
      />
    </div>
  );
}