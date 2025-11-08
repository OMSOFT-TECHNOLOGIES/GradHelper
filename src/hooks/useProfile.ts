import { useState, useEffect, useCallback } from 'react';
import { profileService, StudentProfile } from '../services/profileService';
import { toast } from 'sonner';

interface UseProfileReturn {
  profile: StudentProfile | null;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  updateProfile: (profileData: Partial<StudentProfile['profile']>) => Promise<void>;
  isAuthenticated: boolean;
}

/**
 * Custom hook for managing user profile state and operations
 */
export const useProfile = (): UseProfileReturn => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch fresh profile from backend
   */
  const refreshProfile = useCallback(async () => {
    if (!profileService.isAuthenticated()) {
      setError('Not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 useProfile: Refreshing profile from backend...');
      const freshProfile = await profileService.getStudentProfile();
      setProfile(freshProfile);
      console.log('✅ useProfile: Profile refreshed successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
      setError(errorMessage);
      console.error('❌ useProfile: Profile refresh failed:', err);
      
      // Try to use cached profile as fallback
      const cached = profileService.getCachedProfile();
      if (cached) {
        setProfile(cached);
        toast.warning('Using Cached Profile', {
          description: 'Could not sync with server. Using cached profile data.'
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update profile on backend and local state
   */
  const updateProfile = useCallback(async (profileData: Partial<StudentProfile['profile']>) => {
    if (!profileService.isAuthenticated()) {
      throw new Error('Not authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📝 useProfile: Updating profile on backend...', profileData);
      const updatedProfile = await profileService.updateStudentProfile(profileData);
      setProfile(updatedProfile);
      console.log('✅ useProfile: Profile updated successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      console.error('❌ useProfile: Profile update failed:', err);
      throw err; // Re-throw so caller can handle
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Initialize profile on mount
   */
  useEffect(() => {
    const initializeProfile = async () => {
      // Check if authenticated
      if (!profileService.isAuthenticated()) {
        console.log('👤 useProfile: Not authenticated, skipping profile fetch');
        return;
      }

      // Try to use cached profile first
      const cached = profileService.getCachedProfile();
      if (cached) {
        setProfile(cached);
        console.log('📂 useProfile: Using cached profile');
      }

      // Then refresh from backend
      await refreshProfile();
    };

    initializeProfile();
  }, [refreshProfile]);

  return {
    profile,
    loading,
    error,
    refreshProfile,
    updateProfile,
    isAuthenticated: profileService.isAuthenticated()
  };
};

export default useProfile;