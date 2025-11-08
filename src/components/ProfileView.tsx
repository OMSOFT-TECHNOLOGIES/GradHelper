import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from "sonner";
import { ProfileHeader } from './profile/ProfileHeader';
import { PersonalInfoTab } from './profile/PersonalInfoTab';
import { AcademicInfoTab } from './profile/AcademicInfoTab';
import { PreferencesTab } from './profile/PreferencesTab';
import { createProfileUpdateHandler } from './profile/helpers';
import { useProfile } from '../hooks/useProfile';
import { Loader2 } from 'lucide-react';

interface ProfileViewProps {
  user: any;
  onProfileUpdate?: (updatedUser: any) => void;
}

export function ProfileView({ user, onProfileUpdate }: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  
  // Use the profile hook for backend integration
  const { profile, loading, error, refreshProfile, updateProfile } = useProfile();

  const handleInputChange = createProfileUpdateHandler(setEditedUser);

  // Sync with fresh profile data when available
  useEffect(() => {
    if (profile) {
      setEditedUser(profile);
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      console.log('💾 ProfileView: Saving profile changes...', editedUser.profile);
      
      // Update profile on backend using the profile service
      await updateProfile(editedUser.profile);
      
      // Notify parent component of the update
      if (onProfileUpdate) {
        onProfileUpdate(editedUser);
      }
      
      setIsEditing(false);
      toast.success('Profile updated successfully!', {
        description: 'Your changes have been saved to your account.'
      });
      
    } catch (error) {
      console.error('❌ ProfileView: Failed to save profile:', error);
      toast.error('Failed to update profile', {
        description: 'Please check your connection and try again.'
      });
    }
  };

  const handleCancel = () => {
    // Reset to current profile data (either from hook or prop)
    setEditedUser(profile || user);
    setIsEditing(false);
  };

  const handleEditToggle = () => {
    setIsEditing(true);
  };

  const handleRefresh = async () => {
    try {
      await refreshProfile();
      toast.success('Profile refreshed!', {
        description: 'Latest profile data has been loaded.'
      });
    } catch (error) {
      console.error('❌ ProfileView: Failed to refresh profile:', error);
      toast.error('Failed to refresh profile', {
        description: 'Please check your connection and try again.'
      });
    }
  };

  // Show loading state
  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !profile) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center space-y-4">
          <p className="text-red-600">Failed to load profile: {error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Use profile from hook if available, otherwise fallback to prop
  const displayUser = profile || editedUser;

  return (
    <div className="space-y-6">
      <ProfileHeader 
        user={displayUser}
        isEditing={isEditing}
        isLoading={loading}
        onEditToggle={handleEditToggle}
        onSave={handleSave}
        onCancel={handleCancel}
      />

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <PersonalInfoTab 
            user={displayUser}
            isEditing={isEditing}
            onInputChange={handleInputChange}
          />
        </TabsContent>

        <TabsContent value="academic">
          <AcademicInfoTab 
            user={displayUser}
            isEditing={isEditing}
            onInputChange={handleInputChange}
          />
        </TabsContent>

        <TabsContent value="preferences">
          <PreferencesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}