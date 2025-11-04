import { useState } from 'react';
import { Switch } from './ui/switch';
import { toast } from 'sonner';
import { API_BASE_URL } from '../utils/api';
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
  X
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

  // Explicit submit handler for final step
  const handleCompleteProfile = () => {
    // Validate required fields
    const required = [
      'first_name', 'last_name', 'email', 'user', 'phone', 'country', 'academic_level', 'institution', 'major', 'graduation_year', 'bio'
    ];
    for (const field of required) {
      if (!formData[field]) {
        toast.error(`Please fill in ${field.replace('_', ' ')}.`);
        return;
      }
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
          toast.success('Profile completed successfully!');
          onComplete(payload);
        } else {
          toast.error(data.error?.message || data.message || 'Profile completion failed.');
        }
      })
      .catch(() => {
        toast.error('Profile completion failed.');
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
              <h3>Personal Information</h3>
              <p>Help us personalize your experience with basic details</p>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="First Name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Last Name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
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
                <label className="form-label">Country</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Country"
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                />
              </div>
              <div className="form-group form-group-full">
                <label className="form-label">Short Bio</label>
                <textarea
                  className="form-input"
                  placeholder="Tell us about your academic interests"
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  rows={2}
                />
              </div>
              {/* Avatar field removed, not required by backend */}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="profile-step">
            <div className="step-header">
              <h3>Academic Background</h3>
              <p>Tell us about your educational journey</p>
            </div>
            <div className="form-grid">
              <div className="form-group form-group-full">
                <label className="form-label">University/Institution</label>
                <div className="input-with-icon">
                  <GraduationCap className="input-icon" />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Harvard University"
                    value={formData.institution}
                    onChange={(e) => setFormData({...formData, institution: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Major/Field of Study</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Computer Science"
                  value={formData.major}
                  onChange={(e) => setFormData({...formData, major: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Academic Level</label>
                <select
                  className="form-input"
                  value={formData.academic_level}
                  onChange={(e) => setFormData({...formData, academic_level: e.target.value})}
                >
                  <option value="">Select level</option>
                  {academicLevels.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Expected Graduation Year</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="2025"
                  min="2024"
                  max="2030"
                  value={formData.graduation_year}
                  onChange={(e) => setFormData({...formData, graduation_year: e.target.value})}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="profile-step">
            <div className="step-header">
              <h3>Preferences</h3>
              <p>Set your communication and notification preferences</p>
            </div>
            <div className="preferences-section">
              <div className="preference-group">
                <div className="form-group">
                  <label className="form-label">Preferred Communication</label>
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
                    <option value="">Select</option>
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="app">App Notification</option>
                  </select>
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Enable Notifications</label>
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
                <div className="form-group">
                  <label className="form-label">Timezone</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. GMT+1"
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
            <h2>Complete Your Profile</h2>
            <p>To post tasks and get personalized assistance, please share a bit more about yourself</p>
          </div>
          <button className="modal-close" onClick={onSkip}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="progress-section">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
          <div className="progress-text">
            Step {currentStep} of {totalSteps}
          </div>
        </div>

        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="profile-form">
          {renderStepContent()}

          <div className="form-actions">
            <div className="action-buttons">
              {currentStep > 1 && (
                <button type="button" className="btn btn-outline" onClick={prevStep}>
                  Previous
                </button>
              )}
              {currentStep < totalSteps ? (
                <button type="button" className="btn btn-primary" onClick={nextStep}>
                  Next Step
                </button>
              ) : (
                <button type="button" className="btn btn-primary" onClick={handleCompleteProfile}>
                  Complete Profile
                </button>
              )}
            </div>

            <button type="button" className="skip-button" onClick={onSkip}>
              Skip for now
            </button>
          </div>
        </form>

        <div className="security-notice">
          <div className="security-icons">
            <Shield className="security-icon" />
            <Lock className="security-icon" />
          </div>
          <div className="security-text">
            <h4>Your Data is Safe & Confidential</h4>
            <p>
              We use enterprise-grade encryption to protect your information. 
              Your data is never shared with third parties and is only used to 
              provide you with better academic assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}