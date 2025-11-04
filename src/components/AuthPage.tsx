import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { toast } from 'sonner';
import { API_BASE_URL } from '../utils/api';
import { 
  ArrowLeft, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle,
  Clock,
  MessageCircle,
  Shield,
  CreditCard,
  Users,
  User,
  BookOpen,
  AlertCircle,
  Loader2,
  GraduationCap,
  Settings
} from 'lucide-react';
import logoImage from '../assets/71eefff8a544630cca22726eead746724ce853a1.png';
import { GoogleLogin } from '@react-oauth/google';

interface AuthPageProps {
  onBack: () => void;
  onAuth: (user: any) => void;
  onRoleChange?: (role: 'student' | 'admin') => void;
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
    
    const isDev = isLocalhost || isDevDomain || hasPort || isFileProtocol || isReactDev;
    
    // Debug logging
    console.log('🔍 Development Detection:', {
      hostname: window.location.hostname,
      port: window.location.port,
      protocol: window.location.protocol,
      nodeEnv: process.env.NODE_ENV,
      isLocalhost,
      isDevDomain,
      hasPort,
      isFileProtocol,
      isReactDev,
      finalResult: isDev
    });
    
    return isDev;
  } catch (error) {
    console.error('Error detecting development mode:', error);
    return true; // Default to true for safety in case of errors
  }
};

export function AuthPage({ onBack, onAuth, onRoleChange }: AuthPageProps) {
  // Google OAuth handler using useGoogleLogin to get access_token
  const googleLogin = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (tokenResponse: { access_token: string }) => {
      setIsLoading(true);
      setErrors({});
      const access_token = tokenResponse.access_token;
      console.log('Google OAuth Debug:', { access_token, role: selectedRole });
      try {
        const res = await fetch(`${API_BASE_URL}/auth/google/login/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token, role: selectedRole })
        });
        const data = await res.json();
        console.log('Google login backend response:', data);
        // Accept multiple backend response formats for Google login
        if (
          (data.status === 'success' && data.user && data.tokens) ||
          (data.success && data.data && data.data.user)
        ) {
          // New backend format
          if (data.user) {
            onAuth(data.user);
            localStorage.setItem('gradhelper_user', JSON.stringify(data.user));
          }
          if (data.tokens && data.tokens.access) {
            localStorage.setItem('gradhelper_token', data.tokens.access);
          }
          if (data.tokens && data.tokens.refresh) {
            localStorage.setItem('gradhelper_refresh', data.tokens.refresh);
          }
          // Old format fallback
          if (data.data && data.data.user) {
            onAuth(data.data.user);
            localStorage.setItem('gradhelper_user', JSON.stringify(data.data.user));
          }
          if (data.data && data.data.token) {
            localStorage.setItem('gradhelper_token', data.data.token);
          }
          window.location.replace('/dashboard');
        } else {
          setErrors({ general: data.error?.message || data.message || 'Google authentication failed. Please try again.' });
        }
      } catch (error) {
        setErrors({ general: 'Google authentication failed. Please try again.' });
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      setErrors({ general: 'Google authentication failed. Please try again.' });
    },
    scope: 'openid email profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
  });
  // Modal state for password reset
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  // Forgot password handler
  const handleForgotPassword = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setShowResetModal(true);
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      toast.error('Please enter your email address.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/password-reset/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Password reset email sent! Please check your inbox.');
        setShowResetModal(false);
        setResetEmail('');
      } else {
        toast.error(data.error?.message || data.message || 'Failed to send password reset email.');
      }
    } catch (error) {
      toast.error('Failed to send password reset email.');
    } finally {
      setIsLoading(false);
    }
  };
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [selectedRole, setSelectedRole] = useState<'student' | 'admin'>('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    signupEmail: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    rememberMe: false
  });

  const benefits = [
    {
      icon: BookOpen,
      title: "Expert academic assistance",
      description: "Get help from qualified professionals with your assignments and research"
    },
    {
      icon: CheckCircle,
      title: "Project tracking",
      description: "Monitor progress and deliverables in real-time"
    },
    {
      icon: MessageCircle,
      title: "Direct communication",
      description: "Chat directly with experts and admins"
    },
    {
      icon: Clock,
      title: "Timely delivery",
      description: "Meet your deadlines with our efficient workflow"
    },
    {
      icon: Shield,
      title: "Secure & confidential",
      description: "Your data and academic integrity are protected"
    },
    {
      icon: Users,
      title: "24/7 support",
      description: "Round-the-clock assistance when you need it"
    }
  ];

  // Form validation
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};



    if (isSignUp) {
      if (!formData.email.trim()) {
        newErrors.email = 'Username is required';
      }
      if (!formData.signupEmail.trim()) {
        newErrors.signupEmail = 'Email address is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.signupEmail)) {
        newErrors.signupEmail = 'Please enter a valid email address';
      }
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required';
      }
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
      }
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else {
      if (!formData.email.trim()) {
        newErrors.email = 'Username is required';
      }
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('Form submitted with data:', formData);
    e.preventDefault();
    if (!validateForm()) {
      console.log('Form validation failed with errors:', errors);
      return;
    }
    setIsLoading(true);
    setErrors({});
    if (onRoleChange && isDevelopment()) {
      onRoleChange(selectedRole);
    }
    try {
      const endpoint = isSignUp ? '/auth/register/' : '/auth/login/';
      const payload = isSignUp
        ? {
            username: formData.email,
            email: formData.signupEmail,
            password: formData.password,
            password2: formData.confirmPassword,
            first_name: formData.firstName,
            last_name: formData.lastName,
          }
        : {
            username: formData.email,
            password: formData.password
          };
          console.log('Submitting to endpoint:', endpoint, 'with payload:', payload);
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (isSignUp) {
        if (res.ok) {
      // Registration success: show toast, switch to login
      toast.success('Registration successful! Please check your email to verify your account, then login.');
      setIsSignUp(false);
        } else {
      toast.error(data.error?.message || data.message || 'Registration failed. Please try again.');
        }
      } else {
        
        // Accept multiple backend response formats for login
        if (data.user) {
          onAuth(data.user);
          if (data.tokens.access) {
            localStorage.setItem('gradhelper_token', data.tokens.access);
          }
        } else if (data.data && data.data.user) {
          onAuth(data.data.user);
          if (data.data.token) {
            localStorage.setItem('gradhelper_token', data.data.token);
          }
        } else if (data.token && data.username) {
          onAuth({ username: data.username, token: data.token });
          localStorage.setItem('gradhelper_token', data.token);
        } else {
      toast.error(data.error?.message || data.message || 'Authentication failed. Please try again.');
      setErrors({ general: data.error?.message || data.message || 'Authentication failed. Please try again.' });
        }
      }
    } catch (error) {
      setErrors({ general: 'Authentication failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // ...existing code...

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleRoleChange = (role: 'student' | 'admin') => {
    setSelectedRole(role);
    if (isDevelopment()) {
      console.log(`🔄 Developer: Selected ${role} role for sign in`);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side - Benefits & Branding */}
        <div className="auth-left">
          <button className="back-button" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </button>

          <div className="auth-brand">
            <img src={logoImage} alt="TheGradHelper" className="auth-logo" />
          </div>

          <div className="auth-content">
            <h1 className="auth-left-title">
              Join thousands of students achieving academic success
            </h1>
            <p className="auth-left-description">
              Get expert help with your assignments, projects, and research from qualified professionals.
            </p>

            <div className="benefits-list">
              {benefits.map((benefit, index) => (
                <div key={index} className="benefit-item">
                  <div className="benefit-icon">
                    <benefit.icon className="w-5 h-5" />
                  </div>
                  <div className="benefit-content">
                    <h4 className="benefit-title">{benefit.title}</h4>
                    <p className="benefit-description">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="auth-testimonial">
              <p className="testimonial-text">
                "TheGradHelper transformed my academic journey. The expert guidance and support helped me achieve grades I never thought possible."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">
                  <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face" alt="Sarah Johnson" />
                </div>
                <div className="author-details">
                  <p className="author-name">Sarah Johnson</p>
                  <p className="author-role">Computer Science Student</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Authentication Form */}
        <div className="auth-right">
          <div className="auth-form-container">
            <div className="auth-header">
              <h2 className="auth-title">
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </h2>
              <p className="auth-subtitle">
                {isSignUp 
                  ? 'Sign up to continue to your dashboard'
                  : 'Sign in to continue to your dashboard'
                }
              </p>
            </div>

            {/* Developer Role Selector - Only visible in development */}
            {isDevelopment() && (
              <div className="dev-role-selector">
                <div className="dev-role-header">
                  <Settings className="w-4 h-4" />
                  <span className="dev-role-title">🚧 Developer Mode</span>
                  <div className="dev-indicator">DEV</div>
                </div>
                <div className="dev-role-options">
                  <button
                    type="button"
                    className={`dev-role-option ${selectedRole === 'student' ? 'active' : ''}`}
                    onClick={() => handleRoleChange('student')}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Student</span>
                  </button>
                  <button
                    type="button"
                    className={`dev-role-option ${selectedRole === 'admin' ? 'active' : ''}`}
                    onClick={() => handleRoleChange('admin')}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Admin</span>
                  </button>
                </div>
                <p className="dev-role-note">
                  🎯 Select role for testing • Current: <strong>{selectedRole}</strong>
                </p>
              </div>
            )}

            {/* Fallback debug info - Remove this after testing */}
            {!isDevelopment() && (
              <div style={{
                background: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '0.5rem',
                padding: '0.75rem',
                marginBottom: '1rem',
                fontSize: '0.75rem',
                color: '#856404'
              }}>
                ⚠️ Role switcher hidden - Not in development mode
                <br />
                Location: {window.location.hostname}:{window.location.port}
              </div>
            )}

            {/* Error Display */}
            {errors.general && (
              <div className="error-banner">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.general}</span>
              </div>
            )}

            <div className="auth-form">
              <div style={{ marginBottom: '1rem' }}>
                <button 
                  className="google-button"
                  onClick={() => googleLogin()}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  Continue with Google
                </button>
              </div>

              <div className="divider">
                <span>or continue with email</span>
              </div>

              <form onSubmit={handleSubmit} className="auth-form-fields">

                {isSignUp && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Username</label>
                      <div className={`input-with-icon ${errors.email ? 'input-error' : ''}`}>
                        <User className="input-icon" />
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Enter your username"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          required={isSignUp}
                        />
                      </div>
                      {errors.email && (
                        <div className="field-error">
                          <AlertCircle className="w-4 h-4" />
                          <span>{errors.email}</span>
                        </div>
                      )}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <div className={`input-with-icon ${errors.email ? 'input-error' : ''}`}>
                        <Mail className="input-icon" />
                        <input
                          type="email"
                          className="form-input"
                          placeholder="Enter your email address"
                          value={formData.signupEmail || ''}
                          onChange={(e) => handleInputChange('signupEmail', e.target.value)}
                          required={isSignUp}
                        />
                      </div>
                      {errors.signupEmail && (
                        <div className="field-error">
                          <AlertCircle className="w-4 h-4" />
                          <span>{errors.signupEmail}</span>
                        </div>
                      )}
                    </div>
                    <div className="form-group">
                      <label className="form-label">First Name</label>
                      <div className={`input-with-icon ${errors.firstName ? 'input-error' : ''}`}>
                        <User className="input-icon" />
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Enter your first name"
                          value={formData.firstName || ''}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          required={isSignUp}
                        />
                      </div>
                      {errors.firstName && (
                        <div className="field-error">
                          <AlertCircle className="w-4 h-4" />
                          <span>{errors.firstName}</span>
                        </div>
                      )}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Last Name</label>
                      <div className={`input-with-icon ${errors.lastName ? 'input-error' : ''}`}>
                        <User className="input-icon" />
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Enter your last name"
                          value={formData.lastName || ''}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          required={isSignUp}
                        />
                      </div>
                      {errors.lastName && (
                        <div className="field-error">
                          <AlertCircle className="w-4 h-4" />
                          <span>{errors.lastName}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {!isSignUp && (
                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <div className={`input-with-icon ${errors.email ? 'input-error' : ''}`}>
                      <User className="input-icon" />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Enter your username"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </div>
                    {errors.email && (
                      <div className="field-error">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.email}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className={`input-with-icon ${errors.password ? 'input-error' : ''}`}>
                    <Lock className="input-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-input"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <div className="field-error">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.password}</span>
                    </div>
                  )}
                </div>

                {isSignUp && (
                  <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <div className={`input-with-icon ${errors.confirmPassword ? 'input-error' : ''}`}>
                      <Lock className="input-icon" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className="form-input"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        required={isSignUp}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <div className="field-error">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.confirmPassword}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="form-extras">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={formData.rememberMe}
                      onChange={(e) => setFormData({...formData, rememberMe: e.target.checked})}
                    />
                    <span className="checkbox-text">Remember me</span>
                  </label>
                  {!isSignUp && (
                    <a href="#" className="forgot-link" onClick={handleForgotPassword}>
                      Forgot password?
                    </a>
                  )}
                </div>

                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
                    </>
                  ) : (
                    isSignUp ? 'Create Account' : 'Sign In'
                  )}
                </button>
              </form>
            </div>
            {/* Password Reset Modal */}
            {showResetModal && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0,0,0,0.4)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <div style={{
                  background: '#fff',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                  padding: '1.5rem 1.75rem',
                  minWidth: '320px',
                  maxWidth: '400px',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  alignItems: 'center',
                }}>
                  <h3 style={{margin: 0, fontSize: '1.15rem', fontWeight: 600, textAlign: 'center'}}>Reset Password</h3>
                  <form onSubmit={handleResetSubmit} style={{display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', alignItems: 'center'}}>
                    <label htmlFor="resetEmail" style={{fontWeight: 500, marginBottom: '0.25rem', alignSelf: 'flex-start'}}>Email Address</label>
                    <input
                      id="resetEmail"
                      type="email"
                      style={{
                        padding: '0.65rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '1rem',
                        marginBottom: '0.5rem',
                        width: '100%',
                      }}
                      placeholder="Enter your email address"
                      value={resetEmail}
                      onChange={e => setResetEmail(e.target.value)}
                      required
                    />
                    <div style={{display: 'flex', gap: '0.75rem', width: '100%'}}>
                      <button type="submit" style={{
                        flex: 1,
                        background: 'linear-gradient(90deg, #1e3a8a 0%, #22d3ee 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.65rem 0',
                        fontWeight: 600,
                        fontSize: '1rem',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        opacity: isLoading ? 0.7 : 1,
                        transition: 'opacity 0.2s',
                      }} disabled={isLoading}>
                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                      </button>
                      <button type="button" style={{
                        flex: 1,
                        background: '#f3f4f6',
                        color: '#111827',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.65rem 0',
                        fontWeight: 500,
                        fontSize: '1rem',
                        cursor: 'pointer',
                      }} onClick={() => setShowResetModal(false)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="auth-switch">
              <span>
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </span>
              <button 
                className="switch-button"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </div>

            <div className="auth-footer">
              <p className="text-xs text-muted-foreground">
                By continuing, you agree to our{' '}
                <a href="#" className="footer-link">Terms of Service</a>{' '}
                and{' '}
                <a href="#" className="footer-link">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
