import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { 
  Settings, 
  Shield, 
  Bell, 
  Palette, 
  Download,
  Trash2,
  AlertTriangle,
  Eye,
  EyeOff,
  Globe,
  Moon,
  Sun,
  Monitor,
  Key,
  Lock,
  Mail,
  Database,
  UserX,
  Check,
  Sparkles,
  RefreshCcw,
  DollarSign
} from 'lucide-react';
import { toast } from "sonner";

interface SettingsViewProps {
  user: any;
  onSettingsUpdate?: (updatedSettings: any) => void;
}

export function SettingsView({ user, onSettingsUpdate }: SettingsViewProps) {
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isCompactView, setIsCompactView] = useState(false);
  const [notifications, setNotifications] = useState({
    taskUpdates: true,
    newMessages: true,
    meetingReminders: true,
    paymentNotifications: true,
    marketingUpdates: false
  });

  const handleExportData = async () => {
    toast.info('Data Export Coming Soon!', {
      description: 'Data export functionality is not available yet. We\'re implementing comprehensive data portability features.'
    });
    // Simulate loading for demo purposes
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleDeleteAccount = () => {
    toast.info('Account Deletion Coming Soon!', {
      description: 'Self-service account deletion is not available yet. Please contact support for account management.'
    });
  };

  const handleToggleTheme = () => {
    toast.info('Theme Feature Coming Soon!', {
      description: 'Theme customization is not available yet. We\'re working on dark mode and theme options.'
    });
    // Keep visual state for demo purposes
    setIsDarkMode(!isDarkMode);
  };

  const handleCompactViewToggle = () => {
    toast.info('Layout Feature Coming Soon!', {
      description: 'Compact view toggle is not available yet. We\'re developing layout customization options.'
    });
    // Keep visual state for demo purposes
    setIsCompactView(!isCompactView);
  };

  const handleNotificationToggle = (key: string) => {
    toast.info('Notification Feature Coming Soon!', {
      description: 'Notification preferences are not available yet. We\'re building a comprehensive notification system.'
    });
    // Keep visual state for demo purposes but don't actually save
    // setNotifications(prev => ({
    //   ...prev,
    //   [key]: !prev[key as keyof typeof prev]
    // }));
  };

  const handlePasswordChange = () => {
    toast.info('Security Feature Coming Soon!', {
      description: 'Password change functionality is not available yet. Please contact support for password updates.'
    });
  };

  const handleTwoFactorToggle = () => {
    toast.info('Security Feature Coming Soon!', {
      description: 'Two-factor authentication setup is not available yet. We\'re working on advanced security features.'
    });
  };

  const handleApiKeyRegenerate = () => {
    toast.info('Developer Feature Coming Soon!', {
      description: 'API key regeneration is not available yet. This Pro feature is under development.'
    });
  };

  const handlePrivacyToggle = () => {
    toast.info('Privacy Feature Coming Soon!', {
      description: 'Privacy controls are not available yet. We\'re implementing advanced privacy features.'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Professional Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                Account Settings
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your account preferences, security settings, and privacy controls
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200 px-3 py-1 font-medium"
              >
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                All Systems Online
              </Badge>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs with Professional Styling */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
          <Tabs defaultValue="general" className="w-full">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
              <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-white/10 backdrop-blur-sm border-white/20">
                <TabsTrigger 
                  value="general" 
                  className="flex items-center gap-2 text-white data-[state=active]:bg-white data-[state=active]:text-blue-700 font-medium transition-all duration-200"
                >
                  <Palette className="w-4 h-4" />
                  <span className="hidden sm:inline">General</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="security" 
                  className="flex items-center gap-2 text-white data-[state=active]:bg-white data-[state=active]:text-blue-700 font-medium transition-all duration-200"
                >
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Security</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications" 
                  className="flex items-center gap-2 text-white data-[state=active]:bg-white data-[state=active]:text-blue-700 font-medium transition-all duration-200"
                >
                  <Bell className="w-4 h-4" />
                  <span className="hidden sm:inline">Notifications</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="data" 
                  className="flex items-center gap-2 text-white data-[state=active]:bg-white data-[state=active]:text-blue-700 font-medium transition-all duration-200"
                >
                  <Database className="w-4 h-4" />
                  <span className="hidden sm:inline">Privacy</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              {/* General Settings */}
              <TabsContent value="general" className="mt-0">
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Palette className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">General Preferences</h3>
                      <p className="text-sm text-gray-600">Customize your interface and regional settings</p>
                    </div>
                  </div>

                  {/* Theme Settings */}
                  <Card className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-200 shadow-md">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-md flex items-center justify-center">
                          {isDarkMode ? <Moon className="w-3 h-3 text-white" /> : <Sun className="w-3 h-3 text-white" />}
                        </div>
                        Appearance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="flex items-start justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                            {isDarkMode ? <Moon className="w-4 h-4 text-white" /> : <Sun className="w-4 h-4 text-white" />}
                          </div>
                          <div className="space-y-1">
                            <Label className="font-semibold text-gray-900">Theme Mode</Label>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              Choose between light and dark theme for better viewing comfort
                            </p>
                          </div>
                        </div>
                        <Switch 
                          checked={isDarkMode}
                          onCheckedChange={handleToggleTheme}
                          className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-indigo-600"
                        />
                      </div>

                      <div className="flex items-start justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-emerald-300 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                            <Monitor className="w-4 h-4 text-white" />
                          </div>
                          <div className="space-y-1">
                            <Label className="font-semibold text-gray-900">Compact Layout</Label>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              Enable compact view for more content on screen
                            </p>
                          </div>
                        </div>
                        <Switch 
                          checked={isCompactView}
                          onCheckedChange={handleCompactViewToggle}
                          className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-500 data-[state=checked]:to-teal-600"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Regional Settings */}
                  <Card className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-200 shadow-md">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-md flex items-center justify-center">
                          <Globe className="w-3 h-3 text-white" />
                        </div>
                        Regional & Language
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2 font-semibold text-gray-900">
                          <Globe className="w-4 h-4" />
                          Time Zone
                        </Label>
                        <Input 
                          defaultValue="UTC+0 (London)" 
                          placeholder="Select your timezone" 
                          className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-600">
                          This affects how dates and times are displayed across the application
                        </p>
                      </div>

                      <div className="space-y-3">
                        <Label className="flex items-center gap-2 font-semibold text-gray-900">
                          <span className="text-lg">🌐</span>
                          Language
                        </Label>
                        <Input 
                          defaultValue="English (UK)" 
                          placeholder="Select your language" 
                          className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-600">
                          Interface language for menus, buttons, and system messages
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Security Settings */}
              <TabsContent value="security" className="mt-0">
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Security & Authentication</h3>
                      <p className="text-sm text-gray-600">Protect your account with advanced security features</p>
                    </div>
                  </div>

                  {/* Authentication Security */}
                  <Card className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-200 shadow-md">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-orange-600 rounded-md flex items-center justify-center">
                          <Lock className="w-3 h-3 text-white" />
                        </div>
                        Account Security
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl border border-amber-200">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                              <Shield className="w-4 h-4 text-white" />
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Label className="font-semibold text-gray-900">Two-Factor Authentication</Label>
                                <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs">
                                  Recommended
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed">
                                Add an extra layer of security with SMS or authenticator app verification
                              </p>
                            </div>
                          </div>
                          <Button 
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white ml-4"
                            size="sm"
                            onClick={handleTwoFactorToggle}
                          >
                            <Lock className="w-4 h-4 mr-2" />
                            Enable 2FA
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label className="flex items-center gap-2 font-semibold text-gray-900">
                          <Key className="w-4 h-4" />
                          Password Management
                        </Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input 
                            type="password" 
                            placeholder="Current password" 
                            className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                          <Input 
                            type="password" 
                            placeholder="New password" 
                            className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <Button 
                          size="sm" 
                          onClick={handlePasswordChange}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        >
                          <RefreshCcw className="w-4 h-4 mr-2" />
                          Update Password
                        </Button>
                        <p className="text-xs text-gray-600">
                          Use a strong password with at least 8 characters, including letters, numbers, and symbols
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* API Access */}
                  <Card className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-200 shadow-md">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-md flex items-center justify-center">
                          <Key className="w-3 h-3 text-white" />
                        </div>
                        Developer Access
                        <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border-purple-200 text-xs">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Pro Feature
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2 font-semibold text-gray-900">
                          <Key className="w-4 h-4" />
                          API Access Key
                        </Label>
                        <div className="flex gap-2">
                          <Input 
                            type={showApiKey ? "text" : "password"}
                            value="sk-1234567890abcdef1234567890abcdef"
                            readOnly
                            className="font-mono text-sm bg-gray-100 border-gray-300"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="border-gray-300 hover:border-gray-400"
                          >
                            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button 
                            size="sm"
                            onClick={handleApiKeyRegenerate}
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                          >
                            <RefreshCcw className="w-4 h-4 mr-2" />
                            Regenerate
                          </Button>
                        </div>
                        <p className="text-xs text-gray-600">
                          Use this key to access TheGradHelper API programmatically. Keep it secure and never share it publicly.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Notifications */}
              <TabsContent value="notifications" className="mt-0">
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                      <Bell className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Notification Preferences</h3>
                      <p className="text-sm text-gray-600">Control how and when you receive notifications</p>
                    </div>
                  </div>

                  <Card className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-200 shadow-md">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-md flex items-center justify-center">
                          <Bell className="w-3 h-3 text-white" />
                        </div>
                        Communication Alerts
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { key: 'taskUpdates', label: 'Task Updates', description: 'Get notified when task status changes', icon: Check },
                        { key: 'newMessages', label: 'New Messages', description: 'Receive notifications for new messages', icon: Mail },
                        { key: 'meetingReminders', label: 'Meeting Reminders', description: 'Get reminded before scheduled meetings', icon: Bell },
                        { key: 'paymentNotifications', label: 'Payment Notifications', description: 'Receive notifications about payments and bills', icon: DollarSign },
                        { key: 'marketingUpdates', label: 'Marketing Updates', description: 'Receive news about features and promotions', icon: Sparkles }
                      ].map((notification, index) => {
                        const IconComponent = notification.icon;
                        return (
                          <div key={notification.key}>
                            <div className="flex items-start justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                                  <IconComponent className="w-4 h-4 text-white" />
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Label className="font-semibold text-gray-900 cursor-pointer">
                                      {notification.label}
                                    </Label>
                                    {notifications[notification.key as keyof typeof notifications] && (
                                      <Badge className="text-xs bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200 font-medium">
                                        <span className="w-1 h-1 bg-emerald-500 rounded-full mr-1 animate-pulse"></span>
                                        Active
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 leading-relaxed">
                                    {notification.description}
                                  </p>
                                </div>
                              </div>
                              <Switch 
                                checked={notifications[notification.key as keyof typeof notifications]}
                                onCheckedChange={() => handleNotificationToggle(notification.key)}
                                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-500 data-[state=checked]:to-emerald-600"
                              />
                            </div>
                            {index < 4 && (
                              <div className="flex justify-center py-2">
                                <div className="w-12 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Data & Privacy */}
              <TabsContent value="data" className="mt-0">
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <Database className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Data & Privacy Controls</h3>
                      <p className="text-sm text-gray-600">Manage your data and privacy preferences</p>
                    </div>
                  </div>

                  {/* Privacy Settings */}
                  <Card className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-200 shadow-md">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-md flex items-center justify-center">
                          <Shield className="w-3 h-3 text-white" />
                        </div>
                        Privacy Preferences
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-green-300 transition-all duration-200">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                            <Database className="w-4 h-4 text-white" />
                          </div>
                          <div className="space-y-1">
                            <Label className="font-semibold text-gray-900">Usage Analytics</Label>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              Help improve TheGradHelper by sharing anonymous usage analytics
                            </p>
                          </div>
                        </div>
                        <Switch 
                          defaultChecked
                          onCheckedChange={handlePrivacyToggle}
                          className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-emerald-600"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Data Management */}
                  <Card className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-200 shadow-md">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-md flex items-center justify-center">
                          <Download className="w-3 h-3 text-white" />
                        </div>
                        Data Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border border-blue-200">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Download className="w-5 h-5 text-blue-600" />
                            <Label className="font-semibold text-gray-900">Export Your Data</Label>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            Download a complete copy of all your data including tasks, messages, documents, and account information
                          </p>
                          <Button 
                            onClick={handleExportData}
                            disabled={isLoading}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            {isLoading ? 'Preparing Export...' : 'Export Data'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Danger Zone */}
                  <Card className="bg-gradient-to-br from-red-50 to-orange-100 border border-red-200 shadow-md">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg text-red-800">
                        <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-red-600 rounded-md flex items-center justify-center">
                          <AlertTriangle className="w-3 h-3 text-white" />
                        </div>
                        Danger Zone
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-red-200">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                            <UserX className="w-4 h-4 text-white" />
                          </div>
                          <div className="space-y-3 flex-1">
                            <Label className="font-semibold text-red-800">Delete Account</Label>
                            <p className="text-sm text-red-700 leading-relaxed">
                              Permanently delete your account and all associated data. This action cannot be undone and will immediately revoke access to all services.
                            </p>
                            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-100 p-2 rounded-lg">
                              <AlertTriangle className="w-3 h-3" />
                              <span className="font-medium">Warning: This action is irreversible</span>
                            </div>
                            <Button 
                              variant="destructive"
                              onClick={handleDeleteAccount}
                              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Account
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

            </div>
          </Tabs>
        </Card>

        {/* Professional Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Your privacy and security are our top priorities. Contact support if you need assistance with any settings.</p>
        </div>
      </div>
    </div>
  );
}