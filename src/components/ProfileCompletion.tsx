import { useState } from 'react';
import { Switch } from './ui/switch';
import { toast } from 'sonner';
import { API_BASE_URL } from '../utils/api';
import '../styles/profile-completion-professional.css';
import { 
  User, 
  GraduationCap, 
  MapPin, 
  Phone, 
  Calendar,
  Shield,
  Lock,
  CheckCircle,
  Eye,
  X,
  ArrowRight,
  ArrowLeft,
  Mail,
  Globe,
  Clock,
  Bell,
  BookOpen,
  Award
} from 'lucide-react';

interface ProfileCompletionProps {
  user: any;
  onComplete: (profileData: any) => void;
  onSkip: () => void;
}

export function ProfileCompletion({ user, onComplete, onSkip }: ProfileCompletionProps) {
  // Get user data from localStorage
  const savedUser = typeof window !== 'undefined' ? localStorage.getItem('gradhelper_user') : null;
  const userData = savedUser ? JSON.parse(savedUser) : {};

  type ProfileFormData = {
    first_name: string;
    last_name: string;
    email: string;
    user: number | string;
    phone: string;
    country: string;
    academic_level: string;
    institution: string;
    major: string;
    graduation_year: string | number;
    bio: string;
    preferences: {
      communication: string;
      notifications: boolean;
      timezone: string;
    };
    isComplete: boolean;
    [key: string]: any;
  };

  const [formData, setFormData] = useState<ProfileFormData>({
    first_name: userData.first_name || userData.name?.split(' ')[0] || '',
    last_name: userData.last_name || userData.name?.split(' ').slice(1).join(' ') || '',
    email: userData.email || '',
    user: userData.id || '',
    phone: '',
    country: '',
    academic_level: '',
    institution: '',
    major: '',
    graduation_year: '',
    bio: '',
    preferences: {
      communication: '',
      notifications: true,
      timezone: '',
    },
    isComplete: false,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const academicLevels = [
    'High School',
    'Undergraduate',
    'Graduate',
    'Masters',
    'PhD',
    'Professional'
  ];

  const subjects = [
    'Computer Science', 'Engineering', 'Business', 'Mathematics',
    'Science', 'Literature', 'History', 'Psychology', 
    'Medicine', 'Law', 'Arts', 'Economics'
  ];

  const interests = [
    'Research Writing', 'Project Development', 'Data Analysis',
    'Creative Writing', 'Programming', 'Design', 'Marketing',
    'Finance', 'Healthcare', 'Education', 'Technology', 'Sports'
  ];

  // Disable automatic form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    return false;
  };

  // Form validation
  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.first_name && formData.last_name && formData.email && formData.phone && formData.bio;
      case 2:
        return formData.institution && formData.major && formData.academic_level && formData.graduation_year;
      case 3:
        return formData.preferences.communication;
      default:
        return true;
    }
  };

  // Explicit submit handler for final step
  const handleCompleteProfile = () => {
    // Validate required fields
    const required = [
      'first_name', 'last_name', 'email', 'user', 'phone', 'country', 'academic_level', 'institution', 'major', 'graduation_year', 'bio'
    ];
    
    const missingFields = required.filter(field => !formData[field]);
    if (missingFields.length > 0) {
      toast.error(`⚠️ Please complete: ${missingFields.map(f => f.replace('_', ' ')).join(', ')}`);
      return;
    }
    const payload = {
      ...formData,
      isComplete: true
    };
    // Get token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('gradhelper_token') : null;
    if (!token) {
      toast.error('Authorization token missing. Please log in again.');
      return;
    }
    console.log('Submitting profile data:', payload);
    fetch(`${API_BASE_URL}/auth/profile/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok) {
          toast.success('🎉 Profile completed successfully! Welcome to GradHelper.');
          onComplete(payload);
        } else {
          toast.error(`❌ ${data.error?.message || data.message || 'Profile completion failed. Please try again.'}`);
        }
      })
      .catch(() => {
        toast.error('❌ Network error. Please check your connection and try again.');
      });
  };

  // Keyboard event protection
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentStep < totalSteps) {
      e.preventDefault();
      nextStep();
    } else if (e.key === 'Enter' && currentStep === totalSteps) {
      e.preventDefault();
      // Only submit if user clicks button
    }
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) {
      toast.error('⚠️ Please fill in all required fields before continuing');
      return;
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleInterest = (interest: string) => {
    // Removed interests logic
  };

  const toggleSubject = (subject: string) => {
    // Removed preferredSubjects logic
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="profile-step">
            <div className="step-header">
              <div className="step-icon">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="step-title">Personal Information</h3>
                <p className="step-description">Help us personalize your experience with basic details</p>
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  First Name <span className="required-asterisk">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your first name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Last Name <span className="required-asterisk">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your last name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Email Address <span className="required-asterisk">*</span>
                </label>
                <div className="input-with-icon">
                  <Mail className="input-icon" />
                  <input
                    type="email"
                    className="form-input"
                    placeholder="your.email@university.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">
                  Phone Number <span className="required-asterisk">*</span>
                </label>
                <div className="input-with-icon">
                  <Phone className="input-icon" />
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Country/Region</label>
                <div className="input-with-icon">
                  <Globe className="input-icon" />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="United States"
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group form-group-full">
                <label className="form-label">
                  Academic Bio <span className="required-asterisk">*</span>
                </label>
                <div className="textarea-wrapper">
                  <textarea
                    className="form-input form-textarea"
                    placeholder="Tell us about your academic interests, research areas, or career goals. This helps us match you with relevant opportunities and academic assistance."
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    rows={3}
                    maxLength={500}
                  />
                  <div className="character-count">
                    {formData.bio.length}/500 characters
                  </div>
                </div>
              </div>
              {/* Avatar field removed, not required by backend */}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="profile-step">
            <div className="step-header">
              <div className="step-icon">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="step-title">Academic Background</h3>
                <p className="step-description">Tell us about your educational journey and academic focus</p>
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group form-group-full">
                <label className="form-label">
                  University/Institution <span className="required-asterisk">*</span>
                </label>
                <div className="input-with-icon">
                  <GraduationCap className="input-icon" />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Harvard University, MIT, Stanford University"
                    value={formData.institution}
                    onChange={(e) => setFormData({...formData, institution: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">
                  Major/Field of Study <span className="required-asterisk">*</span>
                </label>
                <div className="input-with-icon">
                  <Award className="input-icon" />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Computer Science, Business, Psychology"
                    value={formData.major}
                    onChange={(e) => setFormData({...formData, major: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">
                  Academic Level <span className="required-asterisk">*</span>
                </label>
                <select
                  className="form-input"
                  value={formData.academic_level}
                  onChange={(e) => setFormData({...formData, academic_level: e.target.value})}
                >
                  <option value="">Choose your current level</option>
                  {academicLevels.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">
                  Expected Graduation Year <span className="required-asterisk">*</span>
                </label>
                <div className="input-with-icon">
                  <Calendar className="input-icon" />
                  <input
                    type="number"
                    className="form-input"
                    placeholder="2025"
                    min="2024"
                    max="2035"
                    value={formData.graduation_year}
                    onChange={(e) => setFormData({...formData, graduation_year: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="profile-step">
            <div className="step-header">
              <div className="step-icon">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="step-title">Communication Preferences</h3>
                <p className="step-description">Customize how you'd like to receive updates and notifications</p>
              </div>
            </div>
            <div className="preferences-section">
              <div className="preference-group">
                <div className="form-group">
                  <label className="form-label">
                    Preferred Communication Method <span className="required-asterisk">*</span>
                  </label>
                  <select
                    className="form-input"
                    value={formData.preferences.communication}
                    onChange={e => setFormData({
                      ...formData,
                      preferences: {
                        ...formData.preferences,
                        communication: e.target.value
                      }
                    })}
                  >
                    <option value="">How would you like to be contacted?</option>
                    <option value="email">📧 Email (Recommended)</option>
                    <option value="sms">📱 SMS/Text Messages</option>
                    <option value="app">🔔 In-App Notifications</option>
                  </select>
                </div>
                
                <div className="notification-toggle">
                  <div className="toggle-content">
                    <div className="toggle-info">
                      <label className="form-label">Push Notifications</label>
                      <p className="toggle-description">Get instant updates about new tasks, messages, and opportunities</p>
                    </div>
                    <Switch
                      checked={formData.preferences.notifications}
                      onCheckedChange={checked => setFormData({
                        ...formData,
                        preferences: {
                          ...formData.preferences,
                          notifications: checked
                        }
                      })}
                      className="custom-switch"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Timezone (Optional)</label>
                  <div className="input-with-icon">
                    <Clock className="input-icon" />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., GMT+1, EST, PST, UTC-5"
                      value={formData.preferences.timezone}
                      onChange={e => setFormData({
                        ...formData,
                        preferences: {
                          ...formData.preferences,
                          timezone: e.target.value
                        }
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="profile-completion-overlay">
      <div className="profile-completion-modal">
        <div className="modal-header">
          <div className="modal-title-section">
            <div className="title-with-icon">
              <div className="header-icon">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="modal-title">Complete Your Profile</h2>
                <p className="modal-subtitle">
                  Build your academic profile to unlock personalized task assistance and connect with the right helpers
                </p>
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onSkip} aria-label="Close modal">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="progress-section">
          <div className="step-indicators">
            {[1, 2, 3].map((step) => (
              <div key={step} className={`step-indicator ${currentStep >= step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}>
                <div className="step-number">
                  {currentStep > step ? <CheckCircle className="w-4 h-4" /> : step}
                </div>
                <div className="step-label">
                  {step === 1 && 'Personal'}
                  {step === 2 && 'Academic'}
                  {step === 3 && 'Preferences'}
                </div>
              </div>
            ))}
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
          <div className="progress-text">
            Step {currentStep} of {totalSteps} • {Math.round((currentStep / totalSteps) * 100)}% Complete
          </div>
        </div>

        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="profile-form">
          {renderStepContent()}

          <div className="form-actions">
            <div className="action-buttons">
              {currentStep > 1 && (
                <button type="button" className="btn btn-outline" onClick={prevStep}>
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </button>
              )}
              {currentStep < totalSteps ? (
                <button 
                  type="button" 
                  className={`btn btn-primary ${!validateStep(currentStep) ? 'btn-disabled' : ''}`}
                  onClick={nextStep}
                  disabled={!validateStep(currentStep)}
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button 
                  type="button" 
                  className="btn btn-primary btn-complete" 
                  onClick={handleCompleteProfile}
                >
                  <CheckCircle className="w-4 h-4" />
                  Complete Profile
                </button>
              )}
            </div>

            <div className="secondary-actions">
              <button type="button" className="skip-button" onClick={onSkip}>
                I'll complete this later
              </button>
            </div>
          </div>
        </form>

        <div className="security-notice">
          <div className="security-badge">
            <Shield className="security-icon" />
            <Lock className="security-icon lock-icon" />
          </div>
          <div className="security-content">
            <h4 className="security-title">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Your Privacy is Protected
            </h4>
            <p className="security-description">
              Enterprise-grade encryption • GDPR compliant • No data sharing with third parties
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}