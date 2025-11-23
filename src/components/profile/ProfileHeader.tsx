import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Camera, Edit3, Save, X, User, Mail, Shield, Sparkles } from 'lucide-react';
import { getInitials } from './helpers';

interface ProfileHeaderProps {
  user: any;
  isEditing: boolean;
  isLoading: boolean;
  profileCompletion?: number;
  onEditToggle: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export function ProfileHeader({ 
  user, 
  isEditing, 
  isLoading, 
  profileCompletion = 75,
  onEditToggle, 
  onSave, 
  onCancel 
}: ProfileHeaderProps) {
  
  // Calculate completion indicator dots
  const completionDots = Math.floor((profileCompletion || 0) / 20); // 5 dots total, each represents 20%
  const completionColor = profileCompletion >= 80 ? 'bg-emerald-500' : profileCompletion >= 60 ? 'bg-blue-500' : profileCompletion >= 40 ? 'bg-yellow-500' : 'bg-orange-500';
  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 h-24 relative">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-4 right-4 flex gap-2">
          <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 font-medium">
            <Shield className="w-3 h-3 mr-1" />
            Verified
          </Badge>
          <Badge className="bg-emerald-500/90 text-white border-emerald-400 font-medium">
            <Sparkles className="w-3 h-3 mr-1" />
            Active
          </Badge>
        </div>
      </div>
      
      <CardContent className="pt-0 pb-8">
        <div className="flex flex-col lg:flex-row lg:items-end gap-6 -mt-12 relative z-10">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
            <div className="relative group">
              <Avatar className="w-32 h-32 border-4 border-white shadow-xl bg-gradient-to-br from-blue-100 to-indigo-100">
                <AvatarImage src={user?.avatar} alt={user?.name} className="object-cover" />
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                  {getInitials(user?.name || 'User')}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button 
                  size="sm" 
                  className="absolute -bottom-2 -right-2 rounded-full w-10 h-10 p-0 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg transition-all duration-200 group-hover:scale-110"
                >
                  <Camera className="w-4 h-4 text-white" />
                </Button>
              )}
            </div>
            
            {/* Basic Info */}
            <div className="text-center sm:text-left space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                {user?.name || 'User Name'}
              </h1>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span className="text-sm font-medium">{user?.email || 'user@example.com'}</span>
              </div>
            </div>
          </div>
          
          {/* Role & Actions Section */}
          <div className="flex-1 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div className="flex flex-col items-center lg:items-start gap-3">
              <Badge 
                variant="secondary" 
                className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200 px-4 py-2 text-sm font-semibold capitalize shadow-sm"
              >
                <User className="w-3 h-3 mr-1" />
                {user?.role || 'Student'}
              </Badge>
              
              {/* Dynamic Profile Completion Indicator */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }, (_, index) => (
                    <div 
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index < completionDots ? completionColor : 'bg-gray-300'
                      }`}
                    ></div>
                  ))}
                </div>
                <span className="font-medium">
                  Profile {profileCompletion}% Complete
                </span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {!isEditing ? (
                <Button 
                  onClick={onEditToggle} 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={onSave} 
                    disabled={isLoading}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg transition-all duration-200 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button 
                    onClick={onCancel} 
                    variant="outline"
                    className="border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Stats */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-4 text-center hover:shadow-lg transition-all duration-200">
            <div className="text-2xl font-bold text-blue-700">{profileCompletion}%</div>
            <div className="text-sm text-blue-600 font-medium">Profile Complete</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-teal-100 rounded-xl p-4 text-center hover:shadow-lg transition-all duration-200">
            <div className="text-2xl font-bold text-emerald-700">
              {user?.isOnline ? 'Online' : 'Offline'}
            </div>
            <div className="text-sm text-emerald-600 font-medium">Status</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl p-4 text-center hover:shadow-lg transition-all duration-200">
            <div className="text-2xl font-bold text-purple-700">
              {user?.year || user?.academic_level || 'N/A'}
            </div>
            <div className="text-sm text-purple-600 font-medium">Academic Level</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}