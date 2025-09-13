import { useState, useEffect } from 'react';
import { LandingPage } from './src/components/LandingPage';
import { AuthPage } from './src/components/AuthPage';
import { ProfileCompletion } from './src/components/ProfileCompletion';
import { AppLayout } from './src/components/AppLayout';
import { StudentDashboard } from './src/components/StudentDashboard';
import { AdminDashboard } from './src/components/AdminDashboard';
import { PostTask } from './src/components/PostTask';
import { TaskManagement } from './src/components/TaskManagement';
import { MeetingsView } from './src/components/MeetingsView';
import { PartnershipsView } from './src/components/PartnershipsView';
import { DeliverablesView } from './src/components/DeliverablesView';
import { BillingView } from './src/components/BillingView';
import { MessagesView } from './src/components/MessagesView';
import { ChatView } from './src/components/ChatView';
import { StudentsView } from './src/components/StudentsView';
import { TestimoniesView } from './src/components/TestimoniesView';
import { HelpView } from './src/components/HelpView';
import { ProfileView } from './src/components/ProfileView';
import { SettingsView } from './src/components/SettingsView';
import { HelpSupportView } from './src/components/HelpSupportView';
import { PartnershipRequestsView } from './src/components/PartnershipRequestsView';
import { AccomplishmentsView } from './src/components/AccomplishmentsView';
import { NotificationProvider } from './src/components/NotificationContext';
import { Toaster } from './src/components/ui/sonner';
import { toast } from "sonner";
import './src/styles/app.css';
import './src/styles/auth.css';
import './src/styles/landing.css';
import './src/styles/profile-completion.css';
import './src/styles/task-management.css';
import './src/styles/notifications.css';
import './src/styles/meetings.css';
import './src/styles/partnerships.css';
import './src/styles/partnership-requests.css';
import './src/styles/payment.css';
import './src/styles/dashboard-charts.css';
import './src/styles/accomplishments.css';
import './src/styles/testimonies.css';
import './src/styles/messages.css';

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

// Helper function to check if we're in development mode
const isDevelopment = () => {
  try {
    // More comprehensive development detection
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname === '0.0.0.0';
    
    const isDevDomain = window.location.hostname.includes('dev') ||
                       window.location.hostname.includes('test') ||
                       window.location.hostname.includes('staging');
    
    const hasPort = window.location.port && window.location.port !== '80' && window.location.port !== '443';
    
    const isFileProtocol = window.location.protocol === 'file:';
    
    // Check for common development environments
    const isReactDev = process.env.NODE_ENV === 'development';
    
    return isLocalhost || isDevDomain || hasPort || isFileProtocol || isReactDev;
  } catch (error) {
    console.error('Error detecting development mode:', error);
    return true; // Default to true for safety in case of errors
  }
};

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
      
      // Always go to app for existing users - profile completion only required for task posting
      setAppState('app');
    }
  }, []);

  const handleGetStarted = () => {
    setAppState('auth');
  };

  const handleSignIn = () => {
    setAppState('auth');
    toast.info('Welcome back!', {
      description: 'Please sign in to access your account.'
    });
  };

  const handlePostTask = () => {
    if (user) {
      // Check if profile is complete before allowing task posting
      if (!user.profile?.isComplete) {
        setCurrentView('post-task');
        setAppState('profile');
        toast.info('Complete your profile to post tasks', {
          description: 'Please provide some basic information to help us serve you better.'
        });
      } else {
        setCurrentView('post-task');
        setAppState('app');
      }
    } else {
      setCurrentView('post-task');
      setAppState('auth');
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setUserRole(role);
    if (isDevelopment()) {
      console.log(`🔄 App: Role changed to ${role}`);
    }
  };

  const handleAuth = (userData: User) => {
    const userWithRole = {
      ...userData,
      role: userData.role || userRole,
      profile: { isComplete: false }
    };
    setUser(userWithRole);
    setUserRole(userWithRole.role || 'student');
    localStorage.setItem('gradhelper_user', JSON.stringify(userWithRole));
    
    // Show success toast
    toast.success(`Welcome to TheGradHelper, ${userData.name}!`, {
      description: "You can explore the platform and complete your profile later when posting tasks."
    });
    
    // Go directly to the app - no forced profile completion
    setAppState('app');
    
    // If they came from post task, redirect there (will trigger profile completion)
    if (currentView === 'post-task') {
      // This will be handled by the post-task flow
      setCurrentView('post-task');
    }
  };

  const handleProfileComplete = (completedUser: User) => {
    setUser(completedUser);
    localStorage.setItem('gradhelper_user', JSON.stringify(completedUser));
    setAppState('app');
    
    // Show success toast
    toast.success("Profile completed successfully!", {
      description: "You can now post tasks and access all features of TheGradHelper."
    });
    
    // If they came from post task, redirect there
    if (currentView === 'post-task') {
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
    
    // Show skip confirmation
    toast.success("Profile setup skipped", {
      description: "You can complete your profile later from your account settings."
    });
    
    // If they came from post task, redirect there
    if (currentView === 'post-task') {
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
    
    // Show sign out confirmation
    toast.success("Signed out successfully", {
      description: "Come back soon!"
    });
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

    // Check if user needs to complete profile for task posting
    if (user && view === 'post-task' && !user.profile?.isComplete) {
      setCurrentView(view);
      setAppState('profile');
      toast.info('Complete your profile to post tasks', {
        description: 'Please provide some basic information to help us serve you better.'
      });
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
        return <MessagesView userRole={userRole} user={user} />;
      
      case 'chat':
        return <ChatView userRole={userRole} user={user} />;
      
      case 'students':
        return <StudentsView />;
      
      case 'testimonies':
        return <TestimoniesView userRole={userRole} user={user} />;
      
      case 'help':
        return <HelpView />;
      
      case 'profile':
        return <ProfileView user={user} onProfileUpdate={setUser} />;
      
      case 'settings':
        return <SettingsView user={user} />;
      
      case 'help-support':
        return <HelpSupportView />;
      
      case 'partnership-requests':
        return userRole === 'admin' ? <PartnershipRequestsView /> : null;
      
      case 'accomplishments':
        return userRole === 'admin' ? <AccomplishmentsView /> : null;
        
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
        onSignIn={handleSignIn}
        onPostTask={handlePostTask}
      />
    );
  }

  if (appState === 'auth') {
    return (
      <AuthPage 
        onBack={handleBackToLanding}
        onAuth={handleAuth}
        onRoleChange={handleRoleChange}
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
      <Toaster 
        position="top-right"
        expand={true}
        richColors={true}
        closeButton={true}
      />
    </NotificationProvider>
  );
}