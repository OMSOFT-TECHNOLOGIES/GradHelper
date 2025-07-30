import { useState } from 'react';
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
  Loader2
} from 'lucide-react';
import logoImage from './assets/thegradHelper.png';

interface AuthPageProps {
  onBack: () => void;
  onAuth: (user: any) => void;
}

export function AuthPage({ onBack, onAuth }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
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

    if (isSignUp && !formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (isSignUp) {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    // Simulate API call with better error handling
    setTimeout(() => {
      try {
        const userData = {
          id: 'demo-user',
          name: formData.name || 'Sarah Johnson',
          email: formData.email || 'sarah@university.edu',
          avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face"
        };
        
        onAuth(userData);
      } catch (error) {
        setErrors({ general: 'Authentication failed. Please try again.' });
      } finally {
        setIsLoading(false);
      }
    }, 1500);
  };

  const handleGoogleAuth = () => {
    setIsLoading(true);
    setErrors({});
    
    // Simulate Google OAuth
    setTimeout(() => {
      try {
        const userData = {
          id: 'demo-user-google',
          name: 'Sarah Johnson',
          email: 'sarah@university.edu',
          avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face"
        };
        
        onAuth(userData);
      } catch (error) {
        setErrors({ general: 'Google authentication failed. Please try again.' });
      } finally {
        setIsLoading(false);
      }
    }, 1000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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

            {/* Error Display */}
            {errors.general && (
              <div className="error-banner">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.general}</span>
              </div>
            )}

            <div className="auth-form">
              <button 
                className="google-button"
                onClick={handleGoogleAuth}
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

              <div className="divider">
                <span>or continue with email</span>
              </div>

              <form onSubmit={handleSubmit} className="auth-form-fields">
                {isSignUp && (
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <div className={`input-with-icon ${errors.name ? 'input-error' : ''}`}>
                      <User className="input-icon" />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required={isSignUp}
                      />
                    </div>
                    {errors.name && (
                      <div className="field-error">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.name}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className={`input-with-icon ${errors.email ? 'input-error' : ''}`}>
                    <Mail className="input-icon" />
                    <input
                      type="email"
                      className="form-input"
                      placeholder="Enter your email"
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
                    <a href="#" className="forgot-link">Forgot password?</a>
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