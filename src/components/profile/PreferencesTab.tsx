import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Settings, Bell, Mail, Eye, Shield, Smartphone, Globe, Lock, UserCheck, Sparkles } from 'lucide-react';
import { NOTIFICATION_SETTINGS } from './constants';
import { toast } from 'sonner';
interface PreferencesTabProps {
  onViewChange?: (view: string) => void;
}

export function PreferencesTab({ onViewChange }: PreferencesTabProps) {
  const handleContactSupport = () => {
    if (onViewChange) {
      onViewChange('help-support');
    }
  };

  const handleTwoFactorSetup = () => {
    toast.info('Feature Coming Soon!', {
      description: 'Two-factor authentication setup is not available yet. We\'re working on it!'
    });
  };

  const handlePublicProfileManage = () => {
    toast.info('Feature Coming Soon!', {
      description: 'Public profile management is not available yet. Stay tuned for updates!'
    });
  };

  const getSettingIcon = (id: string) => {
    switch (id) {
      case 'emailNotifications':
        return Mail;
      case 'marketingEmails':
        return Bell;
      case 'profileVisibility':
        return Eye;
      default:
        return Settings;
    }
  };

  return (
    <div className="space-y-6">
      {/* Notification Preferences */}
      <Card className="bg-white/50 backdrop-blur-sm border-gray-200 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Bell className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-gray-900 font-semibold">Notification Preferences</span>
              <p className="text-sm text-gray-600 font-normal mt-1">Manage how you receive updates and communications</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {NOTIFICATION_SETTINGS.map((setting, index) => {
            const IconComponent = getSettingIcon(setting.id);
            return (
              <div key={setting.id}>
                <div className="flex items-start justify-between p-5 bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-100/50 transition-all duration-300 group cursor-pointer">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Label className="font-semibold text-gray-900 cursor-pointer hover:text-blue-700 transition-colors duration-200">
                          {setting.label}
                        </Label>
                        {setting.defaultChecked && (
                          <Badge className="text-xs bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200 font-medium">
                            <span className="w-1 h-1 bg-emerald-500 rounded-full mr-1 animate-pulse"></span>
                            Recommended
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {setting.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <span className={`w-2 h-2 rounded-full ${
                          setting.defaultChecked ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'
                        }`}></span>
                        <span className="font-medium">
                          {setting.defaultChecked ? 'Active by default' : 'Inactive by default'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <div className="relative">
                      <Switch 
                        defaultChecked={setting.defaultChecked}
                        className={
                          "h-6 w-11 bg-gray-300 hover:bg-gray-400 transition-all duration-300 shadow-inner " +
                          "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-500 data-[state=checked]:to-emerald-600 " +
                          "data-[state=checked]:shadow-emerald-200 data-[state=checked]:shadow-lg " +
                          "focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 " +
                          "disabled:opacity-50 disabled:cursor-not-allowed"
                        }
                      />
                      {setting.defaultChecked && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full animate-pulse">
                          <div className="w-full h-full bg-white rounded-full opacity-60"></div>
                        </div>
                      )}
                    </div>
                    
                  </div>
                </div>
                {index < NOTIFICATION_SETTINGS.length - 1 && (
                  <div className="flex justify-center py-2">
                    <div className="w-12 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="bg-white/50 backdrop-blur-sm border-gray-200 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-gray-900 font-semibold">Security & Privacy</span>
              <p className="text-sm text-gray-600 font-normal mt-1">Enhance your account security and privacy controls</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Two-Factor Authentication */}
          <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl border border-amber-200">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Lock className="w-4 h-4 text-white" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="font-semibold text-gray-900">Two-Factor Authentication</Label>
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs">
                      Recommended
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Add an extra layer of security to your account with SMS or authenticator app verification
                  </p>
                </div>
              </div>
              <Button 
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white ml-4"
                size="sm"
                onClick={handleTwoFactorSetup}
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Setup
              </Button>
            </div>
          </div>

          {/* Account Visibility */}
          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border border-blue-200">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Globe className="w-4 h-4 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-gray-900">Public Profile</Label>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Control who can view your profile and contact information
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="border-blue-300 hover:border-blue-400 hover:bg-blue-50 ml-4"
                size="sm"
                onClick={handlePublicProfileManage}
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Manage
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white border-0 shadow-2xl">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Need Help with Settings?</h3>
              <p className="text-gray-300 text-sm mt-1">
                Contact our support team for assistance with your account preferences
              </p>
            </div>
            <Button 
              variant="secondary" 
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm"
              onClick={handleContactSupport}
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}