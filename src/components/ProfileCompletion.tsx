import { useState } from 'react';
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
  const [formData, setFormData] = useState({
    dateOfBirth: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    university: '',
    major: '',
    academicLevel: '',
    graduationYear: '',
    interests: [] as string[],
    preferredSubjects: [] as string[],
    timezone: '',
    emergencyContact: '',
    emergencyPhone: ''
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({
      ...user,
      profile: {
        ...formData,
        completedAt: new Date().toISOString(),
        isComplete: true
      }
    });
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
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const toggleSubject = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      preferredSubjects: prev.preferredSubjects.includes(subject)
        ? prev.preferredSubjects.filter(s => s !== subject)
        : [...prev.preferredSubjects, subject]
    }));
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
                <label className="form-label">Date of Birth</label>
                <div className="input-with-icon">
                  <Calendar className="input-icon" />
                  <input
                    type="date"
                    className="form-input"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                  />
                </div>
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
                  />
                </div>
              </div>

              <div className="form-group form-group-full">
                <label className="form-label">Address</label>
                <div className="input-with-icon">
                  <MapPin className="input-icon" />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="123 Main Street"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="New York"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Country</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="United States"
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                />
              </div>
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
                    value={formData.university}
                    onChange={(e) => setFormData({...formData, university: e.target.value})}
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
                  value={formData.academicLevel}
                  onChange={(e) => setFormData({...formData, academicLevel: e.target.value})}
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
                  value={formData.graduationYear}
                  onChange={(e) => setFormData({...formData, graduationYear: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Emergency Contact Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Parent/Guardian"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Emergency Contact Phone</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+1 (555) 987-6543"
                  value={formData.emergencyPhone}
                  onChange={(e) => setFormData({...formData, emergencyPhone: e.target.value})}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="profile-step">
            <div className="step-header">
              <h3>Preferences & Interests</h3>
              <p>Help us match you with the right experts</p>
            </div>
            
            <div className="preferences-section">
              <div className="preference-group">
                <h4>Preferred Subjects</h4>
                <p className="preference-desc">Select subjects you need help with most</p>
                <div className="preference-grid">
                  {subjects.map((subject) => (
                    <button
                      key={subject}
                      type="button"
                      className={`preference-tag ${formData.preferredSubjects.includes(subject) ? 'selected' : ''}`}
                      onClick={() => toggleSubject(subject)}
                    >
                      {subject}
                      {formData.preferredSubjects.includes(subject) && (
                        <CheckCircle className="tag-check" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="preference-group">
                <h4>Areas of Interest</h4>
                <p className="preference-desc">What type of academic help interests you?</p>
                <div className="preference-grid">
                  {interests.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      className={`preference-tag ${formData.interests.includes(interest) ? 'selected' : ''}`}
                      onClick={() => toggleInterest(interest)}
                    >
                      {interest}
                      {formData.interests.includes(interest) && (
                        <CheckCircle className="tag-check" />
                      )}
                    </button>
                  ))}
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

        <form onSubmit={handleSubmit} className="profile-form">
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
                <button type="submit" className="btn btn-primary">
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