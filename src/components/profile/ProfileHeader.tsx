import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Camera, Edit3, Save, X } from 'lucide-react';
import { getInitials } from './helpers';

interface ProfileHeaderProps {
  user: any;
  isEditing: boolean;
  isLoading: boolean;
  onEditToggle: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export function ProfileHeader({ 
  user, 
  isEditing, 
  isLoading, 
  onEditToggle, 
  onSave, 
  onCancel 
}: ProfileHeaderProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="relative">
            <Avatar className="w-24 h-24">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback className="text-lg">
                {getInitials(user?.name || 'User')}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <Button 
                size="sm" 
                variant="secondary" 
                className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
              >
                <Camera className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold">{user?.name || 'User'}</h1>
                <p className="text-muted-foreground">{user?.email}</p>
                <Badge variant="secondary" className="mt-2 capitalize">
                  {user?.role || 'student'}
                </Badge>
              </div>
              
              <div className="flex gap-2">
                {!isEditing ? (
                  <Button onClick={onEditToggle} variant="outline">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      onClick={onSave} 
                      disabled={isLoading}
                      className="bg-gradient-to-r from-blue-600 to-green-500"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isLoading ? 'Saving...' : 'Save'}
                    </Button>
                    <Button onClick={onCancel} variant="outline">
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}