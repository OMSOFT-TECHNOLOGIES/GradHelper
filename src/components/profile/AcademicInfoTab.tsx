import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { GraduationCap, Building, Calendar, BookOpen, Award, Target, Sparkles } from 'lucide-react';
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
              {value.length}/300
            </div>
          </div>
        );
      }
      return (
        <div className="relative">
          <Input
            id={field}
            type={type}
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

    let displayValue = value || 'Not provided';
    if (field === 'graduationDate' && value) {
      displayValue = formatGraduationDate(value);
    }

    return (
      <div className={`group relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md ${field === 'specialization' ? 'min-h-[120px]' : 'min-h-[60px]'}`}>
        <div className="flex items-start gap-3">
          {IconComponent && (
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
              <IconComponent className="w-4 h-4 text-white" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            {value ? (
              <p className={`text-gray-900 font-medium break-words ${field === 'specialization' ? 'text-sm leading-relaxed' : ''}`}>
                {displayValue}
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
            <Sparkles className="w-3 h-3 text-indigo-500" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Educational Background Section */}
      <Card className="bg-white/50 backdrop-blur-sm border-gray-200 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-gray-900 font-semibold">Educational Background</span>
              <p className="text-sm text-gray-600 font-normal mt-1">Your current academic information</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="university" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                University/Institution
                <span className="text-red-500 text-xs">*</span>
              </Label>
              {renderField('university', Building)}
            </div>

            <div className="space-y-3">
              <Label htmlFor="degree" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                Degree Program
                <span className="text-red-500 text-xs">*</span>
              </Label>
              {renderField('degree', BookOpen)}
            </div>

            <div className="space-y-3">
              <Label htmlFor="year" className="text-sm font-semibold text-gray-700">
                Year of Study
              </Label>
              {renderField('year', Award)}
            </div>

            <div className="space-y-3">
              <Label htmlFor="graduationDate" className="text-sm font-semibold text-gray-700">
                Expected Graduation
              </Label>
              {renderField('graduationDate', Calendar, 'month')}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Specialization Section */}
      <Card className="bg-white/50 backdrop-blur-sm border-gray-200 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-gray-900 font-semibold">Area of Specialization</span>
              <p className="text-sm text-gray-600 font-normal mt-1">Your focus areas and academic interests</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Label htmlFor="specialization" className="text-sm font-semibold text-gray-700">
              Specialization & Focus Areas
            </Label>
            {renderField('specialization', Target)}
            {!isEditing && (
              <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <span>📚</span>
                <span>Describe your main areas of study, research interests, or career focus</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Academic Progress */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Academic Journey</h4>
                <p className="text-sm text-gray-600">Track your educational progress</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-700">75%</div>
              <div className="text-xs text-blue-600 font-medium">Complete</div>
            </div>
          </div>
          <div className="mt-4 w-full bg-white/50 rounded-full h-3 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500" style={{ width: '75%' }}></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}