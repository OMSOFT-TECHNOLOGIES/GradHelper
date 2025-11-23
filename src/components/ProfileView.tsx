import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from "sonner";
import { ProfileHeader } from './profile/ProfileHeader';
import { PersonalInfoTab } from './profile/PersonalInfoTab';
import { AcademicInfoTab } from './profile/AcademicInfoTab';
import { PreferencesTab } from './profile/PreferencesTab';
import { createProfileUpdateHandler } from './profile/helpers';
import { useProfile } from '../hooks/useProfile';
import { Loader2, User, GraduationCap, Settings, AlertTriangle, RefreshCcw, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

// Parsed profile data interface (flatter structure)
interface ParsedProfile {
  academic_level: string;
  bio: string;
  country: string;
  email: string;
  first_name: string;
  graduation_year: number;
  institution: string;
  isComplete: boolean;
  is_online: boolean;
  last_name: string;
  major: string;
  phone: string;
  preferences: {
    communication: string;
    notifications: boolean;
    timezone: string;
  };
}

interface ProfileViewProps {
  user: any;
  onProfileUpdate?: (updatedUser: any) => void;
  onViewChange?: (view: string) => void;
}

export function ProfileView({ user, onProfileUpdate, onViewChange }: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<any>(null);
  const [localStorageUser, setLocalStorageUser] = useState<ParsedProfile | null>(null);

  // Function to load parsed profile data from localStorage
  const loadUserFromLocalStorage = () => {
    try {
      const storedUser = localStorage.getItem('gradhelper_user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        
        // Consistent extraction of parsed profile data
        let parsedProfile: ParsedProfile;
        
        // Check if data has nested profile structure
        if (userData.profile && typeof userData.profile === 'object') {
          parsedProfile = userData.profile;
        } else if (userData.academic_level || userData.first_name) {
          // Direct profile structure
          parsedProfile = userData;
        } else {
          console.warn('⚠️ ProfileView: Invalid localStorage structure:', userData);
          return null;
        }
        
        // Validate required fields
        if (!parsedProfile.first_name || !parsedProfile.last_name || !parsedProfile.email) {
          console.warn('⚠️ ProfileView: Missing required profile fields');
          return null;
        }
        
        console.log('📦 ProfileView: Loaded valid parsed profile from localStorage:', parsedProfile);
        return parsedProfile;
      }
    } catch (error) {
      console.error('❌ ProfileView: Failed to load user from localStorage:', error);
      toast.error('Failed to load user data', {
        description: 'Using fallback user information'
      });
    }
    return null;
  };

  // Function to map parsed profile data to component format
  const mapUserData = (profileData: ParsedProfile) => {
    // Ensure we have valid data
    if (!profileData) {
      console.warn('⚠️ ProfileView: mapUserData called with null/undefined data');
      return null;
    }
    
    return {
      id: '1', // Default ID since not in parsed data
      name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim(),
      email: profileData.email || '',
      role: 'student', // Default role since not in parsed data
      avatar: null, // No avatar in current data structure
      
      // Personal information with fallbacks
      firstName: profileData.first_name || '',
      lastName: profileData.last_name || '',
      phone: profileData.phone || '',
      location: profileData.country || '',
      bio: profileData.bio || '',
      
      // Academic information with fallbacks
      university: profileData.institution || '',
      degree: profileData.major || '',
      year: profileData.academic_level || '',
      graduationDate: profileData.graduation_year ? profileData.graduation_year.toString() : '',
      specialization: profileData.bio || '',
      
      // Additional data with safe access
      isComplete: profileData.isComplete ?? false,
      isOnline: profileData.is_online ?? false,
      communicationPreference: profileData.preferences?.communication || 'email',
      notificationSettings: { 
        taskUpdates: profileData.preferences?.notifications ?? true 
      },
      preferences: profileData.preferences || {
        communication: 'email',
        notifications: true,
        timezone: 'GMT'
      }
    };
  };
  
  // Use the profile hook for backend integration
  const { profile, loading, error, refreshProfile, updateProfile } = useProfile();

  const handleInputChange = createProfileUpdateHandler(setEditedUser);

  // Use consistent data priority: localStorage -> editedUser (when editing) -> profile -> user
  // This must be called at the top level, before any conditional returns
  const displayUser = React.useMemo(() => {
    // Priority 1: LocalStorage user data (mapped) - always show localStorage data when available
    if (localStorageUser) {
      const mapped = mapUserData(localStorageUser);
      if (mapped && mapped.name) {
        // If we're editing and have edited data, use that instead
        if (isEditing && editedUser && editedUser.name) {
          return editedUser;
        }
        return mapped;
      }
    }
    
    // Priority 2: Currently edited user data (fallback when no localStorage)
    if (editedUser && editedUser.name) {
      return editedUser;
    }
    
    // Priority 3: Backend profile data
    if (profile && profile.name) {
      return profile;
    }
    
    // Priority 4: Fallback to prop user
    return user || {
      id: '1',
      name: 'Guest User',
      email: 'guest@example.com',
      role: 'student'
    };
  }, [localStorageUser, isEditing, editedUser, profile, user]);

  // Load user data from localStorage on component mount
  useEffect(() => {
    console.log('🔄 ProfileView: Loading user data from localStorage...');
    const storedUser = loadUserFromLocalStorage();
    
    if (storedUser) {
      setLocalStorageUser(storedUser);
      const mappedUser = mapUserData(storedUser);
      
      if (mappedUser) {
        // Set editedUser for editing mode but localStorage will take priority in display
        setEditedUser(mappedUser);
        console.log('✅ ProfileView: User data loaded and mapped successfully:', mappedUser);
        
        toast.success('Profile loaded successfully!', {
          description: `Welcome back, ${mappedUser.firstName}!`
        });
      } else {
        console.error('❌ ProfileView: Failed to map user data');
        // Fall through to create test data
      }
    }
    
    // Create test data only if no valid data was loaded
    if (!storedUser) {
      console.log('ℹ️ ProfileView: No localStorage data found, creating test data');
      const testParsedProfile: ParsedProfile = {
        academic_level: "Graduate",
        bio: "My Bio",
        country: "Ghana",
        email: "iconmaxwellsowusu@outlook.com",
        first_name: "Maxwell",
        graduation_year: 2025,
        institution: "Gimpa",
        isComplete: true,
        is_online: true,
        last_name: "Owusu",
        major: "Cyber security",
        phone: "+233 32 344 2343",
        preferences: {
          communication: "email",
          notifications: true,
          timezone: "GMT"
        }
      };
      
      // Store test parsed profile in localStorage for demonstration
      localStorage.setItem('gradhelper_user', JSON.stringify({ profile: testParsedProfile }));
      const mappedTestUser = mapUserData(testParsedProfile);
      setLocalStorageUser(testParsedProfile);
      setEditedUser(mappedTestUser);
      console.log('🧪 ProfileView: Created test parsed profile data:', mappedTestUser);
      
      toast.success('Profile data loaded!', {
        description: 'Using sample user data from localStorage'
      });
    }
  }, []);

  // Sync with fresh profile data when available from backend
  useEffect(() => {
    if (profile) {
      setEditedUser(profile);
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      console.log('💾 ProfileView: Saving profile changes...', editedUser);
      
      // Update localStorage with new parsed profile data
      const baseProfile = localStorageUser || {
        academic_level: 'Undergraduate',
        bio: '',
        country: '',
        email: '',
        first_name: '',
        graduation_year: new Date().getFullYear() + 1,
        institution: '',
        isComplete: false,
        is_online: true,
        last_name: '',
        major: '',
        phone: '',
        preferences: {
          communication: 'email',
          notifications: true,
          timezone: 'GMT'
        }
      };
      
      const updatedParsedProfile: ParsedProfile = {
        ...baseProfile,
        email: editedUser.email || baseProfile.email,
        first_name: editedUser.firstName || baseProfile.first_name,
        last_name: editedUser.lastName || baseProfile.last_name,
        phone: editedUser.phone || baseProfile.phone,
        country: editedUser.location || baseProfile.country,
        bio: editedUser.bio || baseProfile.bio,
        institution: editedUser.university || baseProfile.institution,
        major: editedUser.degree || baseProfile.major,
        academic_level: editedUser.year || baseProfile.academic_level,
        graduation_year: editedUser.graduationDate ? parseInt(editedUser.graduationDate) || baseProfile.graduation_year : baseProfile.graduation_year,
        isComplete: true, // Mark as complete when user saves
        preferences: {
          ...baseProfile.preferences,
          communication: editedUser.communicationPreference || baseProfile.preferences.communication,
          notifications: editedUser.notificationSettings?.taskUpdates ?? baseProfile.preferences.notifications
        }
      };
        
      localStorage.setItem('gradhelper_user', JSON.stringify({ profile: updatedParsedProfile }));
      setLocalStorageUser(updatedParsedProfile);
      console.log('✅ ProfileView: Updated localStorage parsed profile:', updatedParsedProfile);
      
      // Try to update profile on backend using the profile service
      try {
        await updateProfile(editedUser.profile || editedUser);
        console.log('✅ ProfileView: Backend profile updated successfully');
      } catch (backendError) {
        console.warn('⚠️ ProfileView: Backend update failed, but localStorage updated:', backendError);
      }
      
      // Notify parent component of the update
      if (onProfileUpdate) {
        onProfileUpdate(editedUser);
      }
      
      setIsEditing(false);
      toast.success('Profile updated successfully!', {
        description: 'Your changes have been saved locally and synced when possible.'
      });
      
    } catch (error) {
      console.error('❌ ProfileView: Failed to save profile:', error);
      toast.error('Failed to update profile', {
        description: 'Please check your data and try again.'
      });
    }
  };

  const handleCancel = () => {
    // Reset to current profile data (localStorage -> backend -> prop)
    const currentUser = localStorageUser ? mapUserData(localStorageUser) : (profile || user);
    setEditedUser(currentUser);
    setIsEditing(false);
  };

  const handleEditToggle = () => {
    setIsEditing(true);
  };

  const handleRefresh = async () => {
    try {
      // Refresh from localStorage first
      const storedUser = loadUserFromLocalStorage();
      if (storedUser) {
        const mappedUser = mapUserData(storedUser);
        setEditedUser(mappedUser);
        console.log('🔄 ProfileView: Refreshed from localStorage');
      }
      
      // Then try to refresh from backend
      try {
        await refreshProfile();
        console.log('🔄 ProfileView: Refreshed from backend');
      } catch (backendError) {
        console.warn('⚠️ ProfileView: Backend refresh failed, using localStorage data:', backendError);
      }
      
      toast.success('Profile refreshed!', {
        description: 'Latest profile data has been loaded from all sources.'
      });
    } catch (error) {
      console.error('❌ ProfileView: Failed to refresh profile:', error);
      toast.error('Failed to refresh profile', {
        description: 'Using cached data. Please check your connection.'
      });
    }
  };

  // Show professional loading state
  if (loading && !profile) {
    return (
      <div className="min-h-[600px] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl">
        <Card className="w-full max-w-md mx-auto shadow-lg border-0">
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center animate-pulse">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-gray-800">Loading Your Profile</h3>
                <p className="text-gray-600 text-sm">Please wait while we fetch your latest information</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show professional error state
  if (error && !profile) {
    return (
      <div className="min-h-[600px] flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 rounded-xl">
        <Card className="w-full max-w-md mx-auto shadow-lg border-red-200 bg-white">
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-600 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
              </div>
              <div className="text-center space-y-3">
                <h3 className="text-lg font-semibold text-gray-800">Unable to Load Profile</h3>
                <p className="text-gray-600 text-sm max-w-xs">
                  {error || 'We encountered an issue while loading your profile data.'}
                </p>
                <Badge variant="destructive" className="text-xs">
                  Connection Error
                </Badge>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button
                  onClick={handleRefresh}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="flex-1 border-gray-300 hover:border-gray-400"
                >
                  Refresh Page
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate profile completion percentage
  const calculateProfileCompletion = (userData: any) => {
    const fields = [
      userData?.name,
      userData?.email,
      userData?.phone,
      userData?.location,
      userData?.bio,
      userData?.university,
      userData?.degree,
      userData?.year,
      userData?.graduationDate
    ];
    const filledFields = fields.filter(field => field && field.toString().trim()).length;
    return Math.round((filledFields / fields.length) * 100);
  };
  
  const profileCompletion = calculateProfileCompletion(displayUser);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Professional Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Profile Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your personal and academic information
              </p>
            </div>
            {profile && (
              <Badge 
                variant="secondary" 
                className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200 px-3 py-1 font-medium"
              >
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Profile Synced
              </Badge>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div className="space-y-8">
          <ProfileHeader 
            user={displayUser}
            isEditing={isEditing}
            isLoading={loading}
            profileCompletion={profileCompletion}
            onEditToggle={handleEditToggle}
            onSave={handleSave}
            onCancel={handleCancel}
          />

          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
            <Tabs defaultValue="personal" className="w-full">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
                <TabsList className="grid w-full max-w-md grid-cols-3 bg-white/10 backdrop-blur-sm border-white/20">
                  <TabsTrigger 
                    value="personal" 
                    className="flex items-center gap-2 text-white data-[state=active]:bg-white data-[state=active]:text-blue-700 font-medium transition-all duration-200"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Personal</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="academic" 
                    className="flex items-center gap-2 text-white data-[state=active]:bg-white data-[state=active]:text-blue-700 font-medium transition-all duration-200"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span className="hidden sm:inline">Academic</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="preferences" 
                    className="flex items-center gap-2 text-white data-[state=active]:bg-white data-[state=active]:text-blue-700 font-medium transition-all duration-200"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="hidden sm:inline">Settings</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                <TabsContent value="personal" className="mt-0">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Personal Information</h3>
                        <p className="text-sm text-gray-600">Your basic profile details and contact information</p>
                      </div>
                    </div>
                    <PersonalInfoTab 
                      user={displayUser}
                      isEditing={isEditing}
                      onInputChange={handleInputChange}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="academic" className="mt-0">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <GraduationCap className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Academic Information</h3>
                        <p className="text-sm text-gray-600">Your educational background and academic details</p>
                      </div>
                    </div>
                    <AcademicInfoTab 
                      user={displayUser}
                      isEditing={isEditing}
                      onInputChange={handleInputChange}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="preferences" className="mt-0">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                        <Settings className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Account Preferences</h3>
                        <p className="text-sm text-gray-600">Manage your notifications and privacy settings</p>
                      </div>
                    </div>
                    <PreferencesTab onViewChange={onViewChange} />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </Card>
        </div>

        {/* Professional Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Keep your profile up to date to help others connect with you effectively.</p>
        </div>
      </div>
    </div>
  );
}