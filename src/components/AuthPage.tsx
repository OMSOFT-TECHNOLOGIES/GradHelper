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
  const handleForgotPassword = (e: React.MouseEvent<HTMLButtonElement>) => {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 50%, #f3e8ff 100%)', display: 'flex' }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '1536px', 
        margin: '16px auto', 
        display: 'flex', 
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
        backgroundColor: 'white', 
        borderRadius: '24px', 
        overflow: 'hidden',
        minHeight: 'calc(100vh - 32px)'
      }}>
        {/* Left Side - Benefits & Branding */}
        <div 
          className="hidden lg:flex lg:w-1/2"
          style={{
            background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          
          {/* Back Button */}
          <button 
            style={{
              position: 'absolute',
              top: '24px',
              left: '24px',
              display: 'flex',
              alignItems: 'center',
              padding: '12px 20px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              color: 'white',
              borderRadius: '16px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontSize: '16px',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              zIndex: 20
            }}
            onClick={onBack}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            }}
          >
            <ArrowLeft style={{ width: '20px', height: '20px', marginRight: '8px' }} />
            Back to Home
          </button>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '48px',
            color: 'white',
            position: 'relative',
            zIndex: 10,
            height: '100%'
          }}>
            {/* Brand Section */}
            <div style={{ marginBottom: '48px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '20px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)'
                }}>
                  <img src={logoImage} alt="TheGradHelper" style={{ height: '40px', width: 'auto', filter: 'brightness(0) invert(1)' }} />
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold' }}>TheGradHelper</div>
              </div>
              
              <h1 style={{
                fontSize: '48px',
                fontWeight: 'bold',
                lineHeight: '1.2',
                marginBottom: '24px'
              }}>
                Join thousands of students achieving 
                <span style={{ color: '#fde047' }}> academic success</span>
              </h1>
              
              <p style={{
                fontSize: '20px',
                color: '#bfdbfe',
                lineHeight: '1.6',
                marginBottom: '48px'
              }}>
                Get expert help with your assignments, projects, and research from qualified professionals who care about your success.
              </p>
            </div>

            {/* Benefits Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', marginBottom: '48px' }}>
              {benefits.map((benefit, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(4px)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'background-color 0.2s'
                  }}>
                    <benefit.icon className="w-6 h-6 text-white" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: 'white'
                    }}>{benefit.title}</h4>
                    <p style={{
                      color: '#bfdbfe',
                      lineHeight: '1.6'
                    }}>{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(4px)',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <div style={{ display: 'flex', marginBottom: '16px' }}>
                {[...Array(5)].map((_, i) => (
                  <svg key={i} style={{ width: '20px', height: '20px', color: '#fde047', fill: 'currentColor' }} viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <blockquote style={{
                color: 'white',
                marginBottom: '16px',
                fontStyle: 'italic',
                lineHeight: '1.6',
                fontSize: '16px'
              }}>
                "TheGradHelper transformed my academic journey. The expert guidance and support helped me achieve grades I never thought possible."
              </blockquote>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  marginRight: '16px',
                  border: '2px solid rgba(255, 255, 255, 0.3)'
                }}>
                  <img 
                    src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=48&h=48&fit=crop&crop=face" 
                    alt="Sarah Johnson"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div>
                  <p style={{ fontWeight: '600', color: 'white', marginBottom: '4px' }}>Sarah Johnson</p>
                  <p style={{ color: '#bfdbfe', fontSize: '14px' }}>Computer Science Student, MIT</p>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute top-20 right-20 w-20 h-20 bg-white/5 rounded-2xl blur-sm"></div>
            <div className="absolute bottom-40 right-10 w-16 h-16 bg-purple-300/20 rounded-full blur-sm"></div>
            <div className="absolute top-1/3 right-32 w-12 h-12 bg-yellow-300/20 rounded-xl blur-sm"></div>
          </div>
        </div>

        {/* Right Side - Authentication Form */}
        <div style={{
          flex: 1,
          width: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px'
        }}>
          <div style={{ width: '100%', maxWidth: '400px' }}>
            {/* Mobile Back Button */}
            <button 
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 20px',
                color: '#4b5563',
                marginBottom: '32px',
                marginLeft: '-12px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '16px',
                fontWeight: '500'
              }}
              className="lg:hidden"
              onClick={onBack}
              onMouseOver={(e) => {
                e.currentTarget.style.color = '#111827';
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                e.currentTarget.style.transform = 'translateX(-4px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = '#4b5563';
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <ArrowLeft style={{ width: '20px', height: '20px', marginRight: '8px' }} />
              Back to Home
            </button>

            {/* Form Header */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              {/* Mobile Logo */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }} className="lg:hidden">
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: 'linear-gradient(to right, #2563eb, #4f46e5)',
                  borderRadius: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '16px',
                  boxShadow: '0 8px 24px rgba(37, 99, 235, 0.3)'
                }}>
                  <img src={logoImage} alt="TheGradHelper" style={{ height: '36px', width: 'auto', filter: 'brightness(0) invert(1)' }} />
                </div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>TheGradHelper</div>
              </div>

              <h2 style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: '8px'
              }}>
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </h2>
              <p style={{
                color: '#6b7280',
                fontSize: '16px'
              }}>
                {isSignUp 
                  ? 'Sign up to start your academic journey with expert support'
                  : 'Sign in to continue to your personalized dashboard'
                }
              </p>
            </div>

            {/* Developer Role Selector - Only visible in development */}
            {isDevelopment() && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Settings className="w-4 h-4 text-yellow-600" />
                    <span className="font-semibold text-yellow-800">🚧 Developer Mode</span>
                  </div>
                  <div className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded-md text-xs font-bold">DEV</div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    type="button"
                    className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
                      selectedRole === 'student' 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                    onClick={() => handleRoleChange('student')}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span className="font-medium">Student</span>
                  </button>
                  <button
                    type="button"
                    className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
                      selectedRole === 'admin' 
                        ? 'bg-purple-600 text-white border-purple-600 shadow-md' 
                        : 'bg-white text-gray-700 border-gray-300 hover:border-purple-300 hover:bg-purple-50'
                    }`}
                    onClick={() => handleRoleChange('admin')}
                  >
                    <Settings className="w-4 h-4" />
                    <span className="font-medium">Admin</span>
                  </button>
                </div>
                <p className="text-xs text-yellow-700">
                  🎯 Select role for testing • Current: <span className="font-semibold">{selectedRole}</span>
                </p>
              </div>
            )}

            {/* Error Display */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-red-700 text-sm">{errors.general}</span>
              </div>
            )}

            {/* Google Sign In Button */}
            <div className="mb-6">
              <button 
                className="w-full flex items-center justify-center space-x-3 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => googleLogin()}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">or continue with email</span>
              </div>
            </div>

            {/* Professional Form */}
            <form onSubmit={handleSubmit} className="space-y-6">

              {isSignUp && (
                <>
                  {/* Username Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                          errors.email 
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400'
                        }`}
                        placeholder="Enter your username"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required={isSignUp}
                      />
                    </div>
                    {errors.email && (
                      <div className="flex items-center mt-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        <span>{errors.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                          errors.signupEmail 
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400'
                        }`}
                        placeholder="Enter your email address"
                        value={formData.signupEmail || ''}
                        onChange={(e) => handleInputChange('signupEmail', e.target.value)}
                        required={isSignUp}
                      />
                    </div>
                    {errors.signupEmail && (
                      <div className="flex items-center mt-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        <span>{errors.signupEmail}</span>
                      </div>
                    )}
                  </div>

                  {/* Name Fields Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                            errors.firstName 
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400'
                          }`}
                          placeholder="First name"
                          value={formData.firstName || ''}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          required={isSignUp}
                        />
                      </div>
                      {errors.firstName && (
                        <div className="flex items-center mt-2 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          <span>{errors.firstName}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                            errors.lastName 
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400'
                          }`}
                          placeholder="Last name"
                          value={formData.lastName || ''}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          required={isSignUp}
                        />
                      </div>
                      {errors.lastName && (
                        <div className="flex items-center mt-2 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          <span>{errors.lastName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {!isSignUp && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                        errors.email 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400'
                      }`}
                      placeholder="Enter your username"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                  {errors.email && (
                    <div className="flex items-center mt-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      <span>{errors.email}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`w-full pl-11 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                      errors.password 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400'
                    }`}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <div className="flex items-center mt-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    <span>{errors.password}</span>
                  </div>
                )}
              </div>

              {isSignUp && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className={`w-full pl-11 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                        errors.confirmPassword 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400'
                      }`}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      required={isSignUp}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <div className="flex items-center mt-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      <span>{errors.confirmPassword}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Form Extras */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    checked={formData.rememberMe}
                    onChange={(e) => setFormData({...formData, rememberMe: e.target.checked})}
                  />
                  <span className="text-sm text-gray-600 font-medium">Remember me</span>
                </label>
                {!isSignUp && (
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                    onClick={handleForgotPassword}
                  >
                    Forgot password?
                  </button>
                )}
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
                  </>
                ) : (
                  <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                )}
              </button>
            </form>
            {/* Professional Password Reset Modal */}
            {showResetModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                  {/* Modal Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                    <h3 className="text-xl font-bold text-white text-center">Reset Password</h3>
                    <p className="text-blue-100 text-sm text-center mt-1">
                      Enter your email to receive a password reset link
                    </p>
                  </div>
                  
                  {/* Modal Body */}
                  <div className="p-6">
                    <form onSubmit={handleResetSubmit} className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-all duration-200"
                            placeholder="Enter your email address"
                            value={resetEmail}
                            onChange={e => setResetEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      {/* Modal Actions */}
                      <div className="flex space-x-3">
                        <button 
                          type="submit" 
                          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Sending...</span>
                            </>
                          ) : (
                            <span>Send Reset Link</span>
                          )}
                        </button>
                        <button 
                          type="button" 
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold transition-all duration-200"
                          onClick={() => setShowResetModal(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Auth Switch */}
            <div className="text-center mt-8 pt-6 border-t border-gray-200">
              <p className="text-gray-600">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                {' '}
                <button 
                  className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200 ml-1"
                  onClick={() => setIsSignUp(!isSignUp)}
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>

            {/* Footer */}
            <div className="text-center mt-6">
              <p className="text-xs text-gray-500 leading-relaxed">
                By continuing, you agree to our{' '}
                <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors duration-200">Terms of Service</a>{' '}
                and{' '}
                <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors duration-200">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
