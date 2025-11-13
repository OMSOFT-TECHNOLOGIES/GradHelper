import React from 'react';
import { useProfile } from '../hooks/useProfile';
import { Loader2, RefreshCw, User, Mail, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Example component demonstrating how to use the profile service
 * This shows how to fetch student info from backend using auth/profile endpoint
 */
export function ProfileExample() {
  const { profile, loading, error, refreshProfile, isAuthenticated } = useProfile();

  const handleRefresh = async () => {
    try {
      await refreshProfile();
      toast.success('Profile refreshed successfully!');
    } catch (error) {
      toast.error('Failed to refresh profile');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="text-center space-y-4">
          <User className="h-16 w-16 text-gray-400 mx-auto" />
          <h2 className="text-xl font-semibold text-gray-900">Not Authenticated</h2>
          <p className="text-gray-600">
            Please sign in to view your profile information.
          </p>
        </div>
      </div>
    );
  }

  if (loading && !profile) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <h2 className="text-xl font-semibold text-gray-900">Loading Profile</h2>
          <p className="text-gray-600">
            Fetching your information from the backend...
          </p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="text-center space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-red-900">Profile Load Error</h2>
            <p className="text-red-700 mt-2">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-4 inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">No Profile Data</h2>
          <p className="text-gray-600">
            Unable to load profile information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Profile Information</h1>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Basic Info Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <User className="h-5 w-5 mr-2 text-blue-600" />
          Basic Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <p className="text-gray-900">{profile.name}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="text-gray-900 flex items-center">
              <Mail className="h-4 w-4 mr-2 text-gray-400" />
              {profile.email}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              profile.role === 'admin' 
                ? 'bg-purple-100 text-purple-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {profile.role}
            </span>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Profile Status</label>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              profile.profile.isComplete 
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {profile.profile.isComplete ? 'Complete' : 'Incomplete'}
            </span>
          </div>
        </div>
      </div>

      {/* Academic Info Card */}
      {profile.profile.university && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <GraduationCap className="h-5 w-5 mr-2 text-green-600" />
            Academic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.profile.university && (
              <div>
                <label className="block text-sm font-medium text-gray-700">University</label>
                <p className="text-gray-900">{profile.profile.university}</p>
              </div>
            )}
            
            {profile.profile.major && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Major</label>
                <p className="text-gray-900">{profile.profile.major}</p>
              </div>
            )}
            
            {profile.profile.yearOfStudy && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Year of Study</label>
                <p className="text-gray-900">{profile.profile.yearOfStudy}</p>
              </div>
            )}
            
            {profile.profile.gpa && (
              <div>
                <label className="block text-sm font-medium text-gray-700">GPA</label>
                <p className="text-gray-900">{profile.profile.gpa}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Personal Info Card */}
      {(profile.profile.firstName || profile.profile.phoneNumber || profile.profile.city) && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.profile.firstName && (
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <p className="text-gray-900">{profile.profile.firstName}</p>
              </div>
            )}
            
            {profile.profile.lastName && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <p className="text-gray-900">{profile.profile.lastName}</p>
              </div>
            )}
            
            {profile.profile.phoneNumber && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="text-gray-900">{profile.profile.phoneNumber}</p>
              </div>
            )}
            
            {profile.profile.city && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <p className="text-gray-900">
                  {profile.profile.city}
                  {profile.profile.state && `, ${profile.profile.state}`}
                  {profile.profile.country && ` - ${profile.profile.country}`}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Debug Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Debug Info</h3>
          <pre className="text-xs text-gray-600 overflow-auto">
            {JSON.stringify(profile, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default ProfileExample;