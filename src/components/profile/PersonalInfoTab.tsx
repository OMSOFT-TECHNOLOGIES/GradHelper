import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { User, Mail, Phone, MapPin } from 'lucide-react';
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
          <Textarea
            id={field}
            value={value}
            onChange={(e) => onInputChange(field, e.target.value)}
            placeholder={placeholder}
            rows={4}
          />
        );
      }
      return (
        <Input
          id={field}
          type={field === 'email' ? 'email' : 'text'}
          value={value}
          onChange={(e) => onInputChange(field, e.target.value)}
          placeholder={placeholder}
        />
      );
    }

    return (
      <p className={`py-2 px-3 bg-muted rounded-md flex items-center gap-2 ${field === 'bio' ? 'min-h-[100px]' : ''}`}>
        {IconComponent && <IconComponent className="w-4 h-4" />}
        {value || 'Not provided'}
      </p>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            {renderField('name')}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            {renderField('email', Mail)}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            {renderField('phone', Phone)}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            {renderField('location', MapPin)}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          {renderField('bio')}
        </div>
      </CardContent>
    </Card>
  );
}