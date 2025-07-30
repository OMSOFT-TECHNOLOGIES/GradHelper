import { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { ProfileCompletion } from './components/ProfileCompletion';
import { AppLayout } from './components/AppLayout';
import { StudentDashboard } from './components/StudentDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { PostTask } from './components/PostTask';
import { TaskManagement } from './components/TaskManagement';
import { MeetingsView } from './components/MeetingsView';
import { PartnershipsView } from './components/PartnershipsView';
import { DeliverablesView } from './components/DeliverablesView';
import { BillingView } from './components/BillingView';
import { MessagesView } from './components/MessagesView';
import { ChatView } from './components/ChatView';
import { StudentsView } from './components/StudentsView';
import { TestimoniesView } from './components/TestimoniesView';
import { HelpView } from './components/HelpView';
import { NotificationProvider } from './components/NotificationContext';
import './styles/app.css';
import './styles/auth.css';
import './styles/landing.css';
import './styles/profile-completion.css';
import './styles/task-management.css';
import './styles/notifications.css';
import './styles/meetings.css';
import './styles/partnerships.css';

type AppState = 'landing' | 'auth' | 'profile' | 'app';
type UserRole = 'student' | 'admin';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role?: UserRole;
  profile?: {
    isComplete: boolean;
    [key: string]: any;
  };
}

function AppContent() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('student');
  const [currentView, setCurrentView] = useState('dashboard');

  // Check for existing session on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('gradhelper_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setUserRole(userData.role || 'student');
      
      // Check if profile is complete
      if (userData.profile?.isComplete) {
        setAppState('app');
      } else {
        setAppState('profile');
      }
    }
  }, []);

  const handleGetStarted = () => {
    setAppState('auth');
  };

  const handlePostTask = () => {
    if (user) {
      setCurrentView('post-task');
      setAppState('app');
    } else {
      setAppState('auth');
    }
  };

  const handleAuth = (userData: User) => {
    const userWithRole = {
      ...userData,
      role: userRole,
      profile: { isComplete: false }
    };
    setUser(userWithRole);
    localStorage.setItem('gradhelper_user', JSON.stringify(userWithRole));
    
    // Show profile completion for new users
    setAppState('profile');
  };

  const handleProfileComplete = (completedUser: User) => {
    setUser(completedUser);
    localStorage.setItem('gradhelper_user', JSON.stringify(completedUser));
    setAppState('app');
    
    // If they came from post task, redirect there
    if (currentView !== 'dashboard') {
      setCurrentView('post-task');
    }
  };

  const handleProfileSkip = () => {
    if (user) {
      const updatedUser = {
        ...user,
        profile: { isComplete: true, skipped: true }
      };
      setUser(updatedUser);
      localStorage.setItem('gradhelper_user', JSON.stringify(updatedUser));
    }
    setAppState('app');
    
    // If they came from post task, redirect there
    if (currentView !== 'dashboard') {
      setCurrentView('post-task');
    }
  };

  const handleBackToLanding = () => {
    setAppState('landing');
    setCurrentView('dashboard');
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem('gradhelper_user');
    setAppState('landing');
    setCurrentView('dashboard');
  };

  const handleViewChange = (view: string) => {
    // Check if user is authenticated for protected routes
    const protectedRoutes = [
      'post-task', 'my-tasks', 'deliverables', 'billing', 
      'messages', 'chat', 'meetings', 'partnerships'
    ];
    
    if (!user && protectedRoutes.includes(view)) {
      setCurrentView(view);
      setAppState('auth');
      return;
    }
    setCurrentView(view);
  };

  const renderAppContent = () => {
    if (!user) return null;

    switch (currentView) {
      case 'dashboard':
        return userRole === 'student' 
          ? <StudentDashboard onViewChange={handleViewChange} />
          : <AdminDashboard onViewChange={handleViewChange} />;
      
      case 'post-task':
        return <PostTask />;
      
      case 'my-tasks':
      case 'all-tasks':
        return <TaskManagement userRole={userRole} />;
      
      case 'deliverables':
        return <DeliverablesView userRole={userRole} user={user} />;
      
      case 'billing':
        return <BillingView userRole={userRole} user={user} />;
      
      case 'meetings':
        return <MeetingsView userRole={userRole} user={user} />;
      
      case 'partnerships':
        return <PartnershipsView user={user} />;
      
      case 'messages':
        return <MessagesView userRole={userRole} />;
      
      case 'chat':
        return <ChatView />;
      
      case 'students':
        return <StudentsView />;
      
      case 'testimonies':
        return <TestimoniesView />;
      
      case 'help':
        return <HelpView />;
        
      default:
        return userRole === 'student' 
          ? <StudentDashboard onViewChange={handleViewChange} />
          : <AdminDashboard onViewChange={handleViewChange} />;
    }
  };

  if (appState === 'landing') {
    return (
      <LandingPage 
        onGetStarted={handleGetStarted}
        onPostTask={handlePostTask}
      />
    );
  }

  if (appState === 'auth') {
    return (
      <AuthPage 
        onBack={handleBackToLanding}
        onAuth={handleAuth}
      />
    );
  }

  if (appState === 'profile' && user) {
    return (
      <ProfileCompletion
        user={user}
        onComplete={handleProfileComplete}
        onSkip={handleProfileSkip}
      />
    );
  }

  return (
    <div className="app-container">
      {/* Role Switcher & Sign Out (for demo purposes) */}
      <div className="role-switcher">
        <div className="card p-2">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <button
                className={`btn btn-sm ${userRole === 'student' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => {
                  setUserRole('student');
                  if (user) {
                    const updatedUser = { ...user, role: 'student' as UserRole };
                    setUser(updatedUser);
                    localStorage.setItem('gradhelper_user', JSON.stringify(updatedUser));
                  }
                  setCurrentView('dashboard');
                }}
              >
                Student View
              </button>
              <button
                className={`btn btn-sm ${userRole === 'admin' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => {
                  setUserRole('admin');
                  if (user) {
                    const updatedUser = { ...user, role: 'admin' as UserRole };
                    setUser(updatedUser);
                    localStorage.setItem('gradhelper_user', JSON.stringify(updatedUser));
                  }
                  setCurrentView('dashboard');
                }}
              >
                Admin View
              </button>
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <AppLayout 
        userRole={userRole} 
        currentView={currentView} 
        onViewChange={handleViewChange}
        user={user}
        onSignOut={handleSignOut}
      >
        {renderAppContent()}
      </AppLayout>
    </div>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
}