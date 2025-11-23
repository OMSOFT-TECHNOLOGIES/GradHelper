import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { User, Mail, Phone, MapPin, FileText, Sparkles } from 'lucide-react';
import { PROFILE_FIELDS, PLACEHOLDERS } from './constants';

interface PersonalInfoTabProps {
  user: any;
  isEditing: boolean;
  onInputChange: (field: string, value: string) => void;
}

export function PersonalInfoTab({ user, isEditing, onInputChange }: PersonalInfoTabProps) {
  const renderField = (field: string, icon?: React.ComponentType<any>) => {
    const IconComponent = icon;
    const value = user?.[field] || '';
    const placeholder = PLACEHOLDERS[field as keyof typeof PLACEHOLDERS];
    const label = PROFILE_FIELDS.PERSONAL[field as keyof typeof PROFILE_FIELDS.PERSONAL];

    if (isEditing) {
      if (field === 'bio') {
        return (
          <div className="relative">
            <Textarea
              id={field}
              value={value}
              onChange={(e) => onInputChange(field, e.target.value)}
              placeholder={placeholder}
              rows={4}
              className="resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-400 font-medium">
              {value.length}/500
            </div>
          </div>
        );
      }
      return (
        <div className="relative">
          <Input
            id={field}
            type={field === 'email' ? 'email' : 'text'}
            value={value}
            onChange={(e) => onInputChange(field, e.target.value)}
            placeholder={placeholder}
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 pl-10"
          />
          {IconComponent && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <IconComponent className="w-4 h-4 text-gray-400" />
            </div>
          )}
        </div>
      );
    }

    return (
      <div className={`group relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md ${field === 'bio' ? 'min-h-[120px]' : 'min-h-[60px]'}`}>
        <div className="flex items-start gap-3">
          {IconComponent && (
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
              <IconComponent className="w-4 h-4 text-white" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            {value ? (
              <p className={`text-gray-900 font-medium break-words ${field === 'bio' ? 'text-sm leading-relaxed' : ''}`}>
                {value}
              </p>
            ) : (
              <div className="flex items-center gap-2 text-gray-500 italic">
                <span className="text-sm">Not provided</span>
                <div className="w-1 h-1 bg-gray-300 rounded-full opacity-60"></div>
              </div>
            )}
          </div>
        </div>
        {value && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Sparkles className="w-3 h-3 text-blue-500" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Contact Information Section */}
      <Card className="bg-white/50 backdrop-blur-sm border-gray-200 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-gray-900 font-semibold">Contact Information</span>
              <p className="text-sm text-gray-600 font-normal mt-1">Your primary contact details</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                Full Name
                <span className="text-red-500 text-xs">*</span>
              </Label>
              {renderField('name', User)}
            </div>

            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                Email Address
                <span className="text-red-500 text-xs">*</span>
              </Label>
              {renderField('email', Mail)}
            </div>

            <div className="space-y-3">
              <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                Phone Number
              </Label>
              {renderField('phone', Phone)}
            </div>

            <div className="space-y-3">
              <Label htmlFor="location" className="text-sm font-semibold text-gray-700">
                Location
              </Label>
              {renderField('location', MapPin)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bio Section */}
      <Card className="bg-white/50 backdrop-blur-sm border-gray-200 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-gray-900 font-semibold">About You</span>
              <p className="text-sm text-gray-600 font-normal mt-1">Share a bit about yourself and your background</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Label htmlFor="bio" className="text-sm font-semibold text-gray-700">
              Bio
            </Label>
            {renderField('bio', FileText)}
            {!isEditing && (
              <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <span>💡</span>
                <span>A well-written bio helps others understand your background and interests</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}