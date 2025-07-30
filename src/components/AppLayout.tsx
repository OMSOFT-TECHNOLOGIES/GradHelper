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
  UserPlus
} from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import logoImage from './assets/thegradHelper.png';

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

  const studentMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'post-task', label: 'Post Task', icon: Plus },
    { id: 'my-tasks', label: 'My Tasks', icon: FileText },
    { id: 'deliverables', label: 'Deliverables', icon: CheckSquare },
    { id: 'meetings', label: 'Meetings', icon: Calendar },
    { id: 'partnerships', label: 'Partnerships', icon: UserPlus },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'chat', label: 'Chat with Admin', icon: Send },
  ];

  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'all-tasks', label: 'All Tasks', icon: FileText },
    { id: 'deliverables', label: 'Deliverables', icon: CheckSquare },
    { id: 'meetings', label: 'Meetings', icon: Calendar },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'testimonies', label: 'Testimonies', icon: Star },
    { id: 'help', label: 'Help Requests', icon: HelpCircle },
  ];

  const menuItems = userRole === 'student' ? studentMenuItems : adminMenuItems;

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="app-layout">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <img src={logoImage} alt="TheGradHelper" className="sidebar-logo" />
          </div>
          <button 
            className="sidebar-close"
            onClick={closeSidebar}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <ul className="nav-list">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    className={`nav-item ${currentView === item.id ? 'nav-item-active' : ''}`}
                    onClick={() => {
                      onViewChange(item.id);
                      closeSidebar();
                    }}
                  >
                    <item.icon className="nav-icon" />
                    <span className="nav-label">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-menu">
            <div className="user-info">
              <div className="user-avatar">
                <img src={user?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"} alt="User" />
              </div>
              <div className="user-details">
                <p className="user-name">{user?.name || 'User'}</p>
                <p className="user-role">{userRole}</p>
              </div>
            </div>
            <button className="sign-out-btn" onClick={onSignOut}>
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="app-header">
          <div className="header-left">
            <button
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="page-title">
              {menuItems.find(item => item.id === currentView)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="header-right">
            {/* Notification Bell */}
            <NotificationBell 
              userId={user?.id || 'demo-user'} 
              userRole={userRole} 
            />
            
            {/* User Profile */}
            <div className="header-user">
              <div className="user-avatar">
                <img src={user?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"} alt="User" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          <div className="container">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}