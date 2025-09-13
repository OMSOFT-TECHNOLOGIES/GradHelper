import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from "sonner";
import { ProfileHeader } from './profile/ProfileHeader';
import { PersonalInfoTab } from './profile/PersonalInfoTab';
import { AcademicInfoTab } from './profile/AcademicInfoTab';
import { PreferencesTab } from './profile/PreferencesTab';
import { simulateApiCall, createProfileUpdateHandler } from './profile/helpers';

interface ProfileViewProps {
  user: any;
  onProfileUpdate?: (updatedUser: any) => void;
}

export function ProfileView({ user, onProfileUpdate }: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = createProfileUpdateHandler(setEditedUser);

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      await simulateApiCall();
      
      if (onProfileUpdate) {
        onProfileUpdate(editedUser);
      }
      
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  const handleEditToggle = () => {
    setIsEditing(true);
  };

  return (
    <div className="space-y-6">
      <ProfileHeader 
        user={editedUser}
        isEditing={isEditing}
        isLoading={isLoading}
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
            user={editedUser}
            isEditing={isEditing}
            onInputChange={handleInputChange}
          />
        </TabsContent>

        <TabsContent value="academic">
          <AcademicInfoTab 
            user={editedUser}
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