import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { GraduationCap, Building, Calendar } from 'lucide-react';
import { PROFILE_FIELDS, PLACEHOLDERS } from './constants';
import { formatGraduationDate } from './helpers';

interface AcademicInfoTabProps {
  user: any;
  isEditing: boolean;
  onInputChange: (field: string, value: string) => void;
}

export function AcademicInfoTab({ user, isEditing, onInputChange }: AcademicInfoTabProps) {
  const renderField = (field: string, icon?: React.ComponentType<any>, type: string = 'text') => {
    const IconComponent = icon;
    const value = user?.[field] || '';
    const placeholder = PLACEHOLDERS[field as keyof typeof PLACEHOLDERS];

    if (isEditing) {
      if (field === 'specialization') {
        return (
          <Textarea
            id={field}
            value={value}
            onChange={(e) => onInputChange(field, e.target.value)}
            placeholder={placeholder}
            rows={3}
          />
        );
      }
      return (
        <Input
          id={field}
          type={type}
          value={value}
          onChange={(e) => onInputChange(field, e.target.value)}
          placeholder={placeholder}
        />
      );
    }

    let displayValue = value || 'Not provided';
    if (field === 'graduationDate' && value) {
      displayValue = formatGraduationDate(value);
    }

    return (
      <p className={`py-2 px-3 bg-muted rounded-md flex items-center gap-2 ${field === 'specialization' ? 'min-h-[80px]' : ''}`}>
        {IconComponent && <IconComponent className="w-4 h-4" />}
        {displayValue}
      </p>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5" />
          Academic Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="university">University</Label>
            {renderField('university', Building)}
          </div>

          <div className="space-y-2">
            <Label htmlFor="degree">Degree Program</Label>
            {renderField('degree')}
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Year of Study</Label>
            {renderField('year')}
          </div>

          <div className="space-y-2">
            <Label htmlFor="graduationDate">Expected Graduation</Label>
            {renderField('graduationDate', Calendar, 'month')}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="specialization">Area of Specialization</Label>
          {renderField('specialization')}
        </div>
      </CardContent>
    </Card>
  );
}