import { useState } from 'react';
import { useNotifications } from './NotificationContext';
import { 
  UserPlus, 
  DollarSign, 
  Share2, 
  Copy, 
  ExternalLink, 
  TrendingUp,
  Users,
  Award,
  School,
  CheckCircle,
  Clock,
  Link,
  QrCode
} from 'lucide-react';

interface PartnershipsViewProps {
  user: any;
}

interface PartnershipData {
  isPartner: boolean;
  status: 'pending' | 'approved' | 'rejected';
  school: string;
  referralCode: string;
  totalReferrals: number;
  successfulReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
  joinedDate: string;
  applicationData?: any;
  rejectionReason?: string;
}

interface PartnershipRequest {
  id: number;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar: string;
  school: string;
  year: string;
  course: string;
  motivation: string;
  experience: string;
  socialMedia: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
  reviewedDate?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  referralCode: string;
}

interface ReferralRecord {
  id: number;
  referredUser: string;
  referredEmail: string;
  dateReferred: string;
  status: 'pending' | 'active' | 'completed';
  taskValue: number;
  commissionEarned: number;
  taskTitle: string;
}

export function PartnershipsView({ user }: PartnershipsViewProps) {
  const { addNotification } = useNotifications();
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'referrals' | 'earnings'>('overview');

  // Mock partnership data - Initialize based on user state
  const [partnershipData, setPartnershipData] = useState<PartnershipData>(() => {
    // Check if user already has partnership data in localStorage
    const savedPartnership = localStorage.getItem(`partnership_${user.id}`);
    if (savedPartnership) {
      return JSON.parse(savedPartnership);
    }
    
    // Default state - not a partner yet
    return {
      isPartner: false,
      status: 'rejected', // This will trigger the application flow
      school: '',
      referralCode: '',
      totalReferrals: 0,
      successfulReferrals: 0,
      totalEarnings: 0,
      pendingEarnings: 0,
      joinedDate: ''
    };
  });

  const [referralRecords] = useState<ReferralRecord[]>([
    {
      id: 1,
      referredUser: 'Alex Johnson',
      referredEmail: 'alex.j@university.edu',
      dateReferred: '2025-01-20',
      status: 'completed',
      taskValue: 250,
      commissionEarned: 25.00,
      taskTitle: 'Data Analysis Project'
    },
    {
      id: 2,
      referredUser: 'Maria Garcia',
      referredEmail: 'maria.g@university.edu',
      dateReferred: '2025-01-18',
      status: 'active',
      taskValue: 180,
      commissionEarned: 18.00,
      taskTitle: 'Research Paper Writing'
    },
    {
      id: 3,
      referredUser: 'David Chen',
      referredEmail: 'david.c@university.edu',
      dateReferred: '2025-01-15',
      status: 'pending',
      taskValue: 320,
      commissionEarned: 32.00,
      taskTitle: 'Web Development Project'
    }
  ]);

  const handleApplyPartnership = (applicationData: any) => {
    const updatedPartnership = {
      ...partnershipData,
      isPartner: true,
      status: 'pending' as const,
      school: applicationData.school,
      referralCode: `GRAD-${user.name.toUpperCase().replace(/\s+/g, '-')}-2025`,
      joinedDate: new Date().toISOString().split('T')[0],
      applicationData // Store the full application for admin review
    };
    
    setPartnershipData(updatedPartnership);
    
    // Save to localStorage
    localStorage.setItem(`partnership_${user.id}`, JSON.stringify(updatedPartnership));
    
    // Also save to a global partnership requests list for admin
    const existingRequests = JSON.parse(localStorage.getItem('partnership_requests') || '[]');
    const newRequest = {
      id: Date.now(),
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userAvatar: user.avatar,
      ...applicationData,
      status: 'pending',
      submittedDate: new Date().toISOString(),
      referralCode: updatedPartnership.referralCode
    };
    
    existingRequests.push(newRequest);
    localStorage.setItem('partnership_requests', JSON.stringify(existingRequests));

    addNotification({
      type: 'system',
      title: 'Partnership Application Submitted',
      message: 'Your application to become a school representative has been submitted for review. You will be notified once it has been reviewed.',
      userId: user.id,
      userRole: 'student',
      data: { applicationType: 'partnership' }
    });

    setShowApplicationModal(false);
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(partnershipData.referralCode);
    addNotification({
      type: 'system',
      title: 'Referral Code Copied',
      message: 'Your referral code has been copied to clipboard.',
      userId: user.id,
      userRole: 'student',
      data: {}
    });
  };

  const shareReferralLink = () => {
    const referralLink = `https://gradhelper.com/signup?ref=${partnershipData.referralCode}`;
    if (navigator.share) {
      navigator.share({
        title: 'Join TheGradHelper',
        text: 'Get expert help with your academic projects!',
        url: referralLink
      });
    } else {
      navigator.clipboard.writeText(referralLink);
      addNotification({
        type: 'system',
        title: 'Referral Link Copied',
        message: 'Your referral link has been copied to clipboard.',
        userId: user.id,
        userRole: 'student',
        data: {}
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': case 'approved': case 'active': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'rejected': return 'badge-error';
      default: return 'badge-secondary';
    }
  };

  if (!partnershipData.isPartner || partnershipData.status === 'rejected') {
    return (
      <div className="space-y-6">
        {/* Show rejection notice if application was rejected */}
        {partnershipData.status === 'rejected' && partnershipData.rejectionReason && (
          <div className="status-banner rejected">
            <div className="w-5 h-5 text-red-500">✕</div>
            <div>
              <h4>Application Not Approved</h4>
              <p><strong>Reason:</strong> {partnershipData.rejectionReason}</p>
              <p className="text-sm mt-1 opacity-75">You may reapply after addressing the feedback above.</p>
            </div>
          </div>
        )}

        <div className="partnership-hero">
          <div className="partnership-hero-content">
            <div className="hero-text">
              <h1>Become a TheGradHelper Representative</h1>
              <p>
                Join our partnership program and earn 10% commission on every student 
                you refer to TheGradHelper. Help your fellow students while earning money!
              </p>
            </div>
            <div className="hero-image">
              <div className="partnership-illustration">
                <UserPlus className="w-16 h-16 text-primary" />
              </div>
            </div>
          </div>
        </div>

        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">
              <DollarSign className="w-8 h-8" />
            </div>
            <h3>10% Commission</h3>
            <p>Earn 10% on every successful referral when students complete their first project</p>
          </div>
          
          <div className="benefit-card">
            <div className="benefit-icon">
              <Users className="w-8 h-8" />
            </div>
            <h3>Help Students</h3>
            <p>Make a positive impact by connecting students with academic support they need</p>
          </div>
          
          <div className="benefit-card">
            <div className="benefit-icon">
              <Award className="w-8 h-8" />
            </div>
            <h3>Recognition</h3>
            <p>Get recognized as an official TheGradHelper representative at your school</p>
          </div>
        </div>

        <div className="card">
          <div className="card-content text-center">
            <School className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3>Ready to get started?</h3>
            <p className="text-muted-foreground mb-6">
              Apply to become a representative at your school and start earning today.
            </p>
            <button 
              className="btn btn-primary btn-lg"
              onClick={() => setShowApplicationModal(true)}
            >
              Apply Now
            </button>
          </div>
        </div>

        {showApplicationModal && (
          <PartnershipApplicationModal
            onClose={() => setShowApplicationModal(false)}
            onSubmit={handleApplyPartnership}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      {partnershipData.status === 'pending' && (
        <div className="status-banner pending">
          <Clock className="w-5 h-5" />
          <div>
            <h4>Application Under Review</h4>
            <p>Your partnership application for <strong>{partnershipData.school}</strong> is being reviewed. You'll be notified once it has been processed.</p>
            <p className="text-sm mt-1 opacity-75">Application submitted: {new Date(partnershipData.joinedDate).toLocaleDateString()}</p>
          </div>
        </div>
      )}

      {partnershipData.status === 'approved' && (
        <div className="status-banner approved">
          <CheckCircle className="w-5 h-5" />
          <div>
            <h4>Active Representative</h4>
            <p>You're an active TheGradHelper representative at {partnershipData.school}</p>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Users className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <h3>${partnershipData.totalEarnings.toFixed(2)}</h3>
            <p>Total Earnings</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <DollarSign className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <h3>${partnershipData.pendingEarnings.toFixed(2)}</h3>
            <p>Pending Earnings</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <UserPlus className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <h3>{partnershipData.totalReferrals}</h3>
            <p>Total Referrals</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <h3>{partnershipData.successfulReferrals}</h3>
            <p>Successful Referrals</p>
          </div>
        </div>
      </div>

      {/* Referral Tools */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Referral Tools</h2>
          <p className="card-description">Share your unique code and start earning commissions</p>
        </div>
        <div className="card-content">
          <div className="referral-tools-grid">
            <div className="referral-code-section">
              <label className="form-label">Your Referral Code</label>
              <div className="referral-code-input">
                <input 
                  type="text" 
                  value={partnershipData.referralCode} 
                  readOnly 
                  className="form-input"
                />
                <button 
                  className="btn btn-outline"
                  onClick={copyReferralCode}
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="referral-actions">
              <button 
                className="btn btn-primary"
                onClick={shareReferralLink}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Link
              </button>
              <button className="btn btn-outline">
                <QrCode className="w-4 h-4 mr-2" />
                QR Code
              </button>
            </div>
          </div>
          
          <div className="referral-link-section">
            <label className="form-label">Referral Link</label>
            <div className="referral-link-display">
              <span>https://gradhelper.com/signup?ref={partnershipData.referralCode}</span>
              <button className="btn btn-ghost btn-sm">
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="partnership-tabs">
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-button ${activeTab === 'referrals' ? 'active' : ''}`}
            onClick={() => setActiveTab('referrals')}
          >
            Referrals ({partnershipData.totalReferrals})
          </button>
          <button 
            className={`tab-button ${activeTab === 'earnings' ? 'active' : ''}`}
            onClick={() => setActiveTab('earnings')}
          >
            Earnings
          </button>
        </div>

        <div className="card-content">
          {activeTab === 'overview' && (
            <div className="overview-content">
              <div className="overview-grid">
                <div className="overview-section">
                  <h4>Performance This Month</h4>
                  <div className="performance-stats">
                    <div className="performance-item">
                      <span className="performance-label">New Referrals:</span>
                      <span className="performance-value">5</span>
                    </div>
                    <div className="performance-item">
                      <span className="performance-label">Conversion Rate:</span>
                      <span className="performance-value">67%</span>
                    </div>
                    <div className="performance-item">
                      <span className="performance-label">Earnings:</span>
                      <span className="performance-value">$95.00</span>
                    </div>
                  </div>
                </div>
                
                <div className="overview-section">
                  <h4>Quick Actions</h4>
                  <div className="quick-actions">
                    <button className="quick-action-btn">
                      <Share2 className="w-4 h-4" />
                      Share on Social Media
                    </button>
                    <button className="quick-action-btn">
                      <UserPlus className="w-4 h-4" />
                      Invite via Email
                    </button>
                    <button className="quick-action-btn">
                      <Award className="w-4 h-4" />
                      View Achievements
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'referrals' && (
            <div className="referrals-content">
              <div className="space-y-4">
                {referralRecords.map((referral) => (
                  <div key={referral.id} className="referral-item">
                    <div className="referral-info">
                      <div className="referral-user">
                        <h4>{referral.referredUser}</h4>
                        <p className="text-muted-foreground">{referral.referredEmail}</p>
                      </div>
                      <div className="referral-details">
                        <p className="referral-task">{referral.taskTitle}</p>
                        <div className="referral-meta">
                          <span>Referred: {new Date(referral.dateReferred).toLocaleDateString()}</span>
                          <span>Task Value: ${referral.taskValue}</span>
                        </div>
                      </div>
                    </div>
                    <div className="referral-status">
                      <span className={`badge ${getStatusColor(referral.status)}`}>
                        {referral.status}
                      </span>
                      <div className="referral-earnings">
                        <span className="earnings-amount">${referral.commissionEarned.toFixed(2)}</span>
                        <span className="earnings-label">Commission</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'earnings' && (
            <div className="earnings-content">
              <div className="earnings-summary">
                <div className="earnings-card">
                  <h4>Available Balance</h4>
                  <p className="earnings-amount">${partnershipData.totalEarnings.toFixed(2)}</p>
                  <button className="btn btn-primary btn-sm">Request Payout</button>
                </div>
                <div className="earnings-card">
                  <h4>Pending Earnings</h4>
                  <p className="earnings-amount">${partnershipData.pendingEarnings.toFixed(2)}</p>
                  <p className="text-muted-foreground text-sm">From active projects</p>
                </div>
              </div>
              
              <div className="earnings-breakdown">
                <h4>Earnings Breakdown</h4>
                <div className="earnings-chart">
                  <div className="chart-placeholder">
                    <TrendingUp className="w-8 h-8 text-muted-foreground" />
                    <p>Earnings chart will be displayed here</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Partnership Application Modal
function PartnershipApplicationModal({ onClose, onSubmit }: {
  onClose: () => void;
  onSubmit: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    school: '',
    year: '',
    course: '',
    motivation: '',
    experience: '',
    socialMedia: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="feedback-modal-overlay">
      <div className="feedback-modal" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h3>Apply for Partnership Program</h3>
          <button className="modal-close" onClick={onClose}>
            <School className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-content">
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">School/University *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., University of Technology"
                  value={formData.school}
                  onChange={(e) => setFormData({...formData, school: e.target.value})}
                  required
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Year of Study *</label>
                  <select
                    className="form-input"
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    required
                  >
                    <option value="">Select year...</option>
                    <option value="1st">1st Year</option>
                    <option value="2nd">2nd Year</option>
                    <option value="3rd">3rd Year</option>
                    <option value="4th">4th Year</option>
                    <option value="graduate">Graduate</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Course/Major *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Computer Science"
                    value={formData.course}
                    onChange={(e) => setFormData({...formData, course: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Why do you want to become a representative? *</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Tell us about your motivation..."
                  value={formData.motivation}
                  onChange={(e) => setFormData({...formData, motivation: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Relevant Experience</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Any leadership, marketing, or student organization experience..."
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Social Media Presence</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Instagram: @username, Facebook, etc."
                  value={formData.socialMedia}
                  onChange={(e) => setFormData({...formData, socialMedia: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}