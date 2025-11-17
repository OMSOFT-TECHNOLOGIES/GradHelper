import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNotifications } from './NotificationContext';
import { PartnershipApiService } from '../services/partnershipApiService';
import { API_BASE_URL } from '../utils/api';
import QRCode from 'qrcode';
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
  QrCode,
  AlertCircle,
  XCircle
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface PartnershipsViewProps {
  user: User;
}

type PartnershipStatus = 'pending' | 'approved' | 'rejected' | 'no-application';
type ReferralStatus = 'pending' | 'active' | 'completed';
type TabType = 'overview' | 'referrals' | 'earnings';

interface ApplicationData {
  school: string;
  year: string;
  course: string;
  motivation: string;
  experience: string;
  socialMedia: string;
}

interface PartnershipData {
  isPartner: boolean;
  status: PartnershipStatus;
  school: string;
  referralCode: string;
  referralLink?: string; // Add referral link field
  totalReferrals: number;
  successfulReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
  joinedDate: string;
  applicationData?: ApplicationData;
  rejectionReason?: string;
}

interface PartnershipRequest extends ApplicationData {
  id: number;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  status: PartnershipStatus;
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
  status: ReferralStatus;
  taskValue: number;
  commissionEarned: number;
  taskTitle: string;
}

interface NotificationPayload {
  type: 'system';
  title: string;
  message: string;
  userId: string;
  userRole: 'student' | 'admin';
  data: Record<string, unknown>;
}

export function PartnershipsView({ user }: PartnershipsViewProps) {
  const { addNotification } = useNotifications();
  const [showApplicationModal, setShowApplicationModal] = useState<boolean>(false);
  const [showQRModal, setShowQRModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize partnership data with proper error handling
  const [partnershipData, setPartnershipData] = useState<PartnershipData>(() => {
    try {
      const savedPartnership = localStorage.getItem(`partnership_${user.id}`);
      if (savedPartnership) {
        const parsed = JSON.parse(savedPartnership);
        // Validate the parsed data structure
        if (parsed && typeof parsed === 'object' && 'isPartner' in parsed) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Error loading partnership data:', error);
      setError('Failed to load partnership data. Please refresh the page.');
    }
    
    // Default state - no application exists
    return {
      isPartner: false,
      status: 'no-application' as PartnershipStatus, // Special status to indicate no application exists
      school: '',
      referralCode: '',
      referralLink: '',
      totalReferrals: 0,
      successfulReferrals: 0,
      totalEarnings: 0,
      pendingEarnings: 0,
      joinedDate: ''
    };
  });

  // Function to fetch partnership dashboard data including referrals and earnings
  const fetchPartnershipDashboard = useCallback(async () => {
    try {
      const token = localStorage.getItem('gradhelper_token');
      if (!token) {
        console.warn('No authentication token found');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/accounts/partner/dashboard`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Partnership dashboard data:', data);

      // Update referrals data
      if (data.recentReferrals && Array.isArray(data.recentReferrals)) {
        setReferralRecords(data.recentReferrals.map((referral: any) => ({
          id: referral.id,
          referredUser: referral.referredUser,
          referredEmail: referral.referredEmail,
          dateReferred: referral.dateReferred,
          status: referral.status,
          taskValue: referral.taskValue || 0,
          commissionEarned: referral.commissionEarned || 0,
          taskTitle: referral.taskTitle || 'New User Registration'
        })));
      }

      // Update earnings data
      if (data.partnership) {
        setEarningsData({
          availableBalance: data.partnership.availableBalance || 0,
          totalEarnings: data.partnership.totalEarnings || 0,
          pendingEarnings: data.partnership.pendingEarnings || 0
        });

        // Update partnership data with backend values
        setPartnershipData(prev => ({
          ...prev,
          totalReferrals: data.partnership.totalReferrals || 0,
          successfulReferrals: data.partnership.successfulReferrals || 0,
          totalEarnings: data.partnership.totalEarnings || 0,
          pendingEarnings: data.partnership.pendingEarnings || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching partnership dashboard:', error);
      // Don't show error to user as this might be called before partnership is approved
    }
  }, []);

  // Load partnership data from backend after component mounts
  useEffect(() => {
    const loadPartnershipData = async () => {
      try {
        const apiService = new PartnershipApiService();
        const response = await apiService.getUserPartnershipRequests(user.id);
        
        // First check if the response has partnershipData directly
        if (response.partnershipData) {
          setPartnershipData(response.partnershipData);
          localStorage.setItem(`partnership_${user.id}`, JSON.stringify(response.partnershipData));
        } else {
          // Handle both expected format (response.requests) and actual backend format (response.data)
          const requestsArray = response.requests || response.data || [];
          
          if (requestsArray.length > 0) {
            const latestRequest = requestsArray
              .sort((a: any, b: any) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime())[0];
          
            // Convert partnership request to partnership data format
            const partnershipData: PartnershipData = {
              isPartner: latestRequest.status === 'approved',
              status: latestRequest.status as PartnershipStatus, // Ensure proper typing
              school: latestRequest.school,
              referralCode: latestRequest.referralCode || '', // Use backend referralCode
              totalReferrals: 0,
              successfulReferrals: 0,
              totalEarnings: 0,
              pendingEarnings: 0,
              joinedDate: latestRequest.submittedDate ? latestRequest.submittedDate.split('T')[0] : '', // Set for all statuses
              referralLink: latestRequest.referralLink || '', // Add referral link from backend
              applicationData: {
                school: latestRequest.school,
                year: latestRequest.year,
                course: latestRequest.course,
                motivation: latestRequest.motivation,
                experience: latestRequest.experience || '',
                socialMedia: latestRequest.socialMedia || ''
              }
            };
            
            setPartnershipData(partnershipData);
            // Update localStorage with the latest backend data
            localStorage.setItem(`partnership_${user.id}`, JSON.stringify(partnershipData));
          } else {
            // No partnership requests found - user hasn't applied yet
            const noApplicationData: PartnershipData = {
              isPartner: false,
              status: 'no-application' as PartnershipStatus, // Special status for no application
              school: '',
              referralCode: '',
              referralLink: '',
              totalReferrals: 0,
              successfulReferrals: 0,
              totalEarnings: 0,
              pendingEarnings: 0,
              joinedDate: ''
            };
            
            setPartnershipData(noApplicationData);
            // Clear any outdated localStorage data
            localStorage.removeItem(`partnership_${user.id}`);
          }
        }
      } catch (error) {
        console.warn('Could not load partnership data from backend:', error);
        // The localStorage data from useState initializer will remain as fallback
      }
    };
    
    loadPartnershipData();
    
    // Also fetch dashboard data if user might be an approved partner
    fetchPartnershipDashboard();
  }, [user.id, fetchPartnershipDashboard]);

  // Fetch dashboard data when partnership becomes approved
  useEffect(() => {
    if (partnershipData.isPartner && partnershipData.status === 'approved') {
      fetchPartnershipDashboard();
    }
  }, [partnershipData.isPartner, partnershipData.status, fetchPartnershipDashboard]);

  // Reset activeTab to overview if partnership is not approved
  useEffect(() => {
    if (!partnershipData.isPartner || partnershipData.status !== 'approved') {
      if (activeTab === 'referrals' || activeTab === 'earnings') {
        setActiveTab('overview');
      }
    }
  }, [partnershipData.isPartner, partnershipData.status, activeTab]);

  // State for real backend data
  const [referralRecords, setReferralRecords] = useState<ReferralRecord[]>([]);
  const [earningsData, setEarningsData] = useState({
    availableBalance: 0,
    totalEarnings: 0,
    pendingEarnings: 0
  });

  const handleApplyPartnership = useCallback(async (applicationData: ApplicationData) => {
    if (!applicationData.school || !applicationData.year || !applicationData.course || !applicationData.motivation) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Initialize API service with user context
      const apiService = new PartnershipApiService();
      
      // Prepare application data for API submission
      const submissionData = {
        userName: user.name,
        userEmail: user.email,
        userAvatar: user.avatar || '',
        userId: user.id,
        ...applicationData
      };

      // Submit application to backend API
      const result = await apiService.submitPartnershipRequest(submissionData);
      
      // Debug: Log the API response structure
      console.log('API Response:', result);
      
      // Validate API response structure
      if (!result || typeof result !== 'object') {
        throw new Error('Invalid API response format');
      }
      
      // Update local state with response data
      const updatedPartnership: PartnershipData = {
        ...partnershipData,
        ...(result.partnershipData || {}),
        isPartner: result.partnershipData?.isPartner || true,
        status: result.partnershipData?.status || 'pending',
        school: applicationData.school,
        referralCode: result.partnershipData?.referralCode || `GRAD-${user.name.toUpperCase().replace(/[^A-Z0-9]/g, '-')}-${Date.now().toString().slice(-6)}`
      };
      
      setPartnershipData(updatedPartnership);
      
      // Also save to localStorage as backup/cache
      try {
        localStorage.setItem(`partnership_${user.id}`, JSON.stringify(updatedPartnership));
        
        // Save to global partnership requests list for admin compatibility
        const existingRequests = JSON.parse(localStorage.getItem('partnership_requests') || '[]');
        existingRequests.push(result.request);
        localStorage.setItem('partnership_requests', JSON.stringify(existingRequests));
      } catch (storageError) {
        console.warn('Failed to save to localStorage backup:', storageError);
        // Don't throw error as the main API submission was successful
      }

      // Send success notification
      const notification: NotificationPayload = {
        type: 'system',
        title: 'Partnership Application Submitted Successfully! 🎉',
        message: `Your application to become a school representative at ${applicationData.school} has been submitted for review. You will be notified once it has been reviewed.`,
        userId: user.id,
        userRole: 'student',
        data: { 
          applicationType: 'partnership',
          school: applicationData.school,
          referralCode: result.partnershipData?.referralCode || updatedPartnership.referralCode
        }
      };

      addNotification(notification);
      setShowApplicationModal(false);
      
      // Show success toast notification
      console.log('Partnership application submitted successfully:', result);
      
    } catch (err) {
      let errorMessage = 'An unexpected error occurred while submitting your application.';
      
      if (err instanceof Error) {
        // Handle specific API errors
        if (err.message.includes('already have a pending')) {
          errorMessage = 'You already have a pending or approved partnership application.';
        } else if (err.message.includes('Validation failed')) {
          errorMessage = 'Please check your application details and try again.';
        } else if (err.message.includes('Network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      console.error('Partnership application error:', err);
      
      // Send error notification
      const errorNotification: NotificationPayload = {
        type: 'system',
        title: 'Application Submission Failed',
        message: errorMessage,
        userId: user.id,
        userRole: 'student',
        data: { error: true, applicationType: 'partnership' }
      };
      
      addNotification(errorNotification);
    } finally {
      setIsLoading(false);
    }
  }, [user, partnershipData, addNotification]);

  const copyReferralCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(partnershipData.referralCode);
      const notification: NotificationPayload = {
        type: 'system',
        title: 'Referral Code Copied',
        message: 'Your referral code has been copied to clipboard.',
        userId: user.id,
        userRole: 'student',
        data: {}
      };
      addNotification(notification);
    } catch (err) {
      console.error('Failed to copy referral code:', err);
      setError('Failed to copy referral code. Please try again.');
    }
  }, [partnershipData.referralLink, user.id, addNotification]);

  const shareReferralLink = useCallback(async () => {
    const referralLink = `https://gradhelper.com/signup?ref=${encodeURIComponent(partnershipData.referralCode)}`;
    
    try {
      if (navigator.share && navigator.canShare?.({ url: referralLink })) {
        await navigator.share({
          title: 'Join TheGradHelper',
          text: 'Get expert help with your academic projects!',
          url: referralLink
        });
      } else {
        await navigator.clipboard.writeText(referralLink);
        const notification: NotificationPayload = {
          type: 'system',
          title: 'Referral Link Copied',
          message: 'Your referral link has been copied to clipboard.',
          userId: user.id,
          userRole: 'student',
          data: {}
        };
        addNotification(notification);
      }
    } catch (err) {
      console.error('Failed to share referral link:', err);
      setError('Failed to share referral link. Please try again.');
    }
  }, [partnershipData.referralCode, user.id, addNotification]);

  const generateQRCode = useCallback(() => {
    setShowQRModal(true);
  }, []);

  const getStatusColor = useCallback((status: string): string => {
    const statusMap: Record<string, string> = {
      completed: 'badge-success',
      approved: 'badge-success',
      active: 'badge-success',
      pending: 'badge-warning',
      rejected: 'badge-error'
    };
    return statusMap[status] || 'badge-secondary';
  }, []);

  // Memoized calculations for performance
  const conversionRate = useMemo(() => {
    if (partnershipData.totalReferrals === 0) return 0;
    return Math.round((partnershipData.successfulReferrals / partnershipData.totalReferrals) * 100);
  }, [partnershipData.successfulReferrals, partnershipData.totalReferrals]);

  // Show pending status screen for users with pending applications
  if (partnershipData.status === 'pending') {
    return (
      <div className="space-y-8">
        {/* Attractive Animated Header */}
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px',
          padding: '32px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Animated background elements */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            animation: 'partnership-pulse 4s ease-in-out infinite'
          }} />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div style={{
                width: '60px',
                height: '60px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'partnership-spin 3s linear infinite'
              }}>
                <Clock className="w-8 h-8" />
              </div>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>Application Under Review ✨</h1>
                <p style={{ fontSize: '16px', opacity: 0.9, margin: '8px 0 0 0' }}>We're excited to review your partnership application!</p>
              </div>
            </div>
            
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '12px',
              padding: '20px',
              backdropFilter: 'blur(10px)'
            }}>
              <div className="flex items-center gap-3 mb-3">
                <School className="w-6 h-6" />
                <span style={{ fontSize: '18px', fontWeight: '600' }}>{partnershipData.school}</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5" />
                <span style={{ fontSize: '14px', opacity: 0.9 }}>Submitted: {new Date(partnershipData.joinedDate || new Date()).toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Attractive Application Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* Application Summary Card */}
          <div style={{
            background: 'linear-gradient(145deg, #f8fafc, #e2e8f0)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div className="flex items-center gap-3 mb-4">
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#1e293b' }}>Application Summary</h3>
                <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>Your partnership application details</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'white', borderRadius: '8px' }}>
                <span style={{ color: '#64748b', fontSize: '14px' }}>🏫 School</span>
                <span style={{ fontWeight: '600', color: '#1e293b' }}>{partnershipData.school}</span>
              </div>
              {partnershipData.applicationData && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'white', borderRadius: '8px' }}>
                    <span style={{ color: '#64748b', fontSize: '14px' }}>📚 Year</span>
                    <span style={{ fontWeight: '600', color: '#1e293b' }}>{partnershipData.applicationData.year}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'white', borderRadius: '8px' }}>
                    <span style={{ color: '#64748b', fontSize: '14px' }}>🎓 Course</span>
                    <span style={{ fontWeight: '600', color: '#1e293b' }}>{partnershipData.applicationData.course}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Referral Code Card */}
          <div style={{
            background: 'linear-gradient(145deg, #fef3c7, #fbbf24)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 8px 32px rgba(251,191,36,0.3)',
            color: '#92400e'
          }}>
            <div className="flex items-center gap-3 mb-4">
              <div style={{
                width: '48px',
                height: '48px',
                background: 'rgba(146,64,14,0.2)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Share2 className="w-6 h-6" />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Your Referral Code</h3>
                <p style={{ fontSize: '14px', opacity: 0.8, margin: '4px 0 0 0' }}>Ready to use once approved!</p>
              </div>
            </div>
            
            <div style={{
              background: 'rgba(255,255,255,0.9)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              border: '2px dashed rgba(146,64,14,0.3)'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'monospace', color: '#92400e', marginBottom: '8px' }}>
                {partnershipData.referralCode}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>🎉 This will be active once your application is approved</div>
            </div>
          </div>
        </div>

        {/* Attractive Progress Timeline */}
        <div style={{
          background: 'linear-gradient(145deg, #ffffff, #f1f5f9)',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <div className="text-center mb-8">
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>Your Journey to Partnership 🚀</h2>
            <p style={{ color: '#64748b', fontSize: '16px', margin: 0 }}>Track your application progress</p>
          </div>
          
          <div className="relative">
            {/* Progress Line */}
            <div style={{
              position: 'absolute',
              left: '24px',
              top: '60px',
              bottom: '60px',
              width: '4px',
              background: 'linear-gradient(to bottom, #10b981, #3b82f6, #8b5cf6)',
              borderRadius: '2px',
              opacity: 0.3
            }} />
            
            <div className="space-y-6">
              {/* Step 1 - Completed */}
              <div className="flex items-start gap-4">
                <div style={{
                  width: '52px',
                  height: '52px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(16,185,129,0.4)',
                  position: 'relative',
                  zIndex: 1
                }}>
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div style={{ flex: 1, paddingTop: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Application Submitted</h4>
                    <span style={{
                      background: '#dcfce7',
                      color: '#166534',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>✅ COMPLETED</span>
                  </div>
                  <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Your partnership application has been successfully submitted and is in our review queue.</p>
                </div>
              </div>
              
              {/* Step 2 - In Progress */}
              <div className="flex items-start gap-4">
                <div style={{
                  width: '52px',
                  height: '52px',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(59,130,246,0.4)',
                  position: 'relative',
                  zIndex: 1,
                  animation: 'partnership-pulse 2s ease-in-out infinite'
                }}>
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div style={{ flex: 1, paddingTop: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Application Review</h4>
                    <span style={{
                      background: '#dbeafe',
                      color: '#1e40af',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>🔄 IN PROGRESS</span>
                  </div>
                  <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Our partnership team is carefully reviewing your application. This typically takes 2-3 business days.</p>
                </div>
              </div>
              
              {/* Step 3 - Pending */}
              <div className="flex items-start gap-4">
                <div style={{
                  width: '52px',
                  height: '52px',
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(139,92,246,0.4)',
                  position: 'relative',
                  zIndex: 1,
                  opacity: 0.6
                }}>
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div style={{ flex: 1, paddingTop: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#64748b', margin: 0 }}>Start Earning & Sharing</h4>
                    <span style={{
                      background: '#f3f4f6',
                      color: '#6b7280',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>⏳ UPCOMING</span>
                  </div>
                  <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>Once approved, you'll get access to your referral tools and can start earning 10% commission immediately!</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Motivational Footer */}
          <div style={{
            marginTop: '32px',
            padding: '20px',
            background: 'linear-gradient(135deg, #fef3c7, #fed7aa)',
            borderRadius: '12px',
            textAlign: 'center',
            border: '2px solid rgba(251,191,36,0.2)'
          }}>
            <div style={{ fontSize: '20px', marginBottom: '8px' }}>💪</div>
            <p style={{ fontSize: '16px', fontWeight: '600', color: '#92400e', margin: 0 }}>Hang tight! Great things are coming your way!</p>
          </div>
        </div>
        
        {/* Add custom animations via style injection */}
        {(() => {
          // Inject CSS animations if not already present
          const styleId = 'partnership-pending-animations';
          if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
              @keyframes partnership-pulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.05); opacity: 0.8; }
              }
              
              @keyframes partnership-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `;
            document.head.appendChild(style);
          }
          return null;
        })()}
      </div>
    );
  }

  // Show application screen for users without any partnership, with rejected status, or no application
  if (!partnershipData.isPartner || partnershipData.status === 'rejected' || partnershipData.status === 'no-application') {
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

  // Add QR Modal for approved partnerships
  if (showQRModal && partnershipData.isPartner && partnershipData.status === 'approved') {
    return (
      <>
        <div className="space-y-6">
          {/* Main content would be here */}
        </div>
        <QRCodeModal 
          referralLink={`https://gradhelper.com/signup?ref=${encodeURIComponent(partnershipData.referralCode)}`}
          onClose={() => setShowQRModal(false)}
        />
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Banner - Only for approved partnerships */}
      <div className="status-banner approved">
        <CheckCircle className="w-5 h-5" />
        <div>
          <h4>Active Representative</h4>
          <p>You're an active TheGradHelper representative at {partnershipData.school}</p>
        </div>
      </div>



      {/* Referral Tools - Only show for approved partnerships */}
      {partnershipData.isPartner && partnershipData.status === 'approved' && (
        <div className="card">
        <div className="card-header">
          <h2 className="card-title">Referral Tools</h2>
          <p className="card-description">Share your referral link to earn commissions - don't share the code directly</p>
        </div>
        <div className="card-content">
          <div className="referral-tools-grid">
            <div className="referral-code-section">
              <label className="form-label">Your Referral Code (For Reference Only)</label>
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
              <button 
                className="btn btn-outline"
                onClick={generateQRCode}
              >
                <QrCode className="w-4 h-4 mr-2" />
                QR Code
              </button>
            </div>
          </div>
          
          <div className="referral-link-section">
            <label className="form-label">📢 Share This Link (Recommended)</label>
            <div className="referral-link-display">
              <span>https://gradhelper.com/signup?ref={partnershipData.referralCode}</span>
              <button className="btn btn-ghost btn-sm" onClick={shareReferralLink}>
                <ExternalLink className="w-4 h-4" />
              
              </button>
            </div>
          </div>
          
          <div className="referral-notice">
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="w-5 h-5 text-blue-600 mt-0.5">💡</div>
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1">Sharing Best Practice</p>
                <p className="text-blue-700">
                  Always share your <strong>referral link</strong> (not the code) with students. 
                  The link automatically applies your referral code when they sign up.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Tabs */}
      <div className="card">
        <div className="partnership-tabs">
         
          {/* Only show referral and earnings tabs for approved partnerships */}
          {partnershipData.isPartner && partnershipData.status === 'approved' && (
            <>
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
            </>
          )}
        </div>

        <div className="card-content">
       

          {activeTab === 'referrals' && (
            <div className="referrals-content">
              <div className="flex justify-between items-center mb-4">
                <h3>Recent Referrals</h3>
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={fetchPartnershipDashboard}
                >
                  Refresh Data
                </button>
              </div>
              <div className="space-y-4">
                {referralRecords.length > 0 ? (
                  referralRecords.map((referral) => (
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
                            <span>Task Value: ${referral.taskValue.toFixed(2)}</span>
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
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h4 className="text-lg font-semibold mb-2">No referrals yet</h4>
                    <p className="text-muted-foreground mb-4">
                      Start sharing your referral link to see referrals here
                    </p>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={shareReferralLink}
                    >
                      Share Referral Link
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'earnings' && (
            <div className="earnings-content">
              <div className="earnings-summary">
                <div className="earnings-card">
                  <h4>Available Balance</h4>
                  <p className="earnings-amount">${earningsData.availableBalance.toFixed(2)}</p>
                  <button className="btn btn-primary btn-sm">Request Payout</button>
                </div>
                <div className="earnings-card">
                  <h4>Total Earnings</h4>
                  <p className="earnings-amount">${earningsData.totalEarnings.toFixed(2)}</p>
                  <p className="text-muted-foreground text-sm">Lifetime earnings</p>
                </div>
                <div className="earnings-card">
                  <h4>Pending Earnings</h4>
                  <p className="earnings-amount">${earningsData.pendingEarnings.toFixed(2)}</p>
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

// QR Code Modal Component
function QRCodeModal({ referralLink, onClose }: {
  referralLink: string;
  onClose: () => void;
}) {
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(true);

  useEffect(() => {
    // Generate professional QR code using qrcode library
    const generateQRCode = async () => {
      try {
        // Generate QR code with professional settings
        const qrCodeOptions = {
          errorCorrectionLevel: 'M' as const,
          type: 'image/png' as const,
          quality: 0.92,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          width: 256 // Higher resolution for better scanning
        };
        
        const qrCodeDataURL = await QRCode.toDataURL(referralLink, qrCodeOptions);
        setQrCodeDataURL(qrCodeDataURL);
        setIsGenerating(false);
      } catch (error) {
        console.error('Error generating QR code:', error);
        setIsGenerating(false);
        // Fallback: still set a basic message or placeholder
        setQrCodeDataURL('');
      }
    };
    
    generateQRCode();
  }, [referralLink]);

  const downloadQRCode = () => {
    if (qrCodeDataURL) {
      const link = document.createElement('a');
      link.download = 'gradhelper-referral-qr.png';
      link.href = qrCodeDataURL;
      link.click();
    }
  };

  const copyQRLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      // Could add notification here
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <div className="feedback-modal-overlay">
      <div className="feedback-modal" style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h3>Share QR Code</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="modal-content text-center">
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Students can scan this QR code to sign up with your referral link
            </p>
            
            <div className="qr-code-container" style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '12px', display: 'inline-block', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              {isGenerating ? (
                <div style={{ width: '256px', height: '256px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>Generating professional QR code...</span>
                  </div>
                </div>
              ) : qrCodeDataURL ? (
                <img 
                  src={qrCodeDataURL} 
                  alt="Professional Referral QR Code" 
                  style={{ width: '256px', height: '256px', display: 'block' }}
                />
              ) : (
                <div style={{ width: '256px', height: '256px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                  <div style={{ textAlign: 'center', color: '#dc2626' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️</div>
                    <span style={{ fontSize: '14px' }}>Failed to generate QR code</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="qr-link-display" style={{ padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '6px', fontSize: '12px', wordBreak: 'break-all' }}>
              {referralLink}
            </div>
            
            <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px' }}>
              <p className="text-sm" style={{ color: '#1e40af', margin: 0 }}>
                💡 <strong>Professional QR Code:</strong> Download, print and paste it around your campus or share the link on social media.
              </p>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-outline" onClick={copyQRLink}>
            <Copy className="w-4 h-4 mr-2" />
            Copy Link
          </button>
          <button type="button" className="btn btn-primary" onClick={downloadQRCode}>
            Download QR
          </button>
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