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
  EyeOff
} from 'lucide-react';
import { toast } from "sonner";

interface SettingsViewProps {
  user: any;
  onSettingsUpdate?: (updatedSettings: any) => void;
}

export function SettingsView({ user, onSettingsUpdate }: SettingsViewProps) {
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleExportData = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Data export initiated!', {
        description: 'You will receive an email with your data export shortly.'
      });
    } catch (error) {
      toast.error('Failed to export data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    toast.error('Account deletion requested', {
      description: 'Please contact support to proceed with account deletion.'
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Account Settings
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="data">Data & Privacy</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Toggle between light and dark theme
                    </p>
                  </div>
                  <Switch />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Compact View</Label>
                    <p className="text-sm text-muted-foreground">
                      Use a more compact layout for better screen utilization
                    </p>
                  </div>
                  <Switch />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Time Zone</Label>
                  <Input defaultValue="UTC+0 (London)" placeholder="Select your timezone" />
                </div>

                <div className="space-y-2">
                  <Label>Language</Label>
                  <Input defaultValue="English (UK)" placeholder="Select your language" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Secure your account with 2FA
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-amber-600">
                      Not Setup
                    </Badge>
                    <Button size="sm">Enable</Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Change Password</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input type="password" placeholder="Current password" />
                    <Input type="password" placeholder="New password" />
                  </div>
                  <Button size="sm">Update Password</Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    API Access Key
                    <Badge variant="secondary" className="text-xs">Pro Feature</Badge>
                  </Label>
                  <div className="flex gap-2">
                    <Input 
                      type={showApiKey ? "text" : "password"}
                      value="sk-1234567890abcdef1234567890abcdef"
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button size="sm">Regenerate</Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use this key to access TheGradHelper API programmatically
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Task Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when task status changes
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>New Messages</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications for new messages
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Meeting Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Get reminded before scheduled meetings
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Payment Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications about payments and bills
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketing Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive news about features and promotions
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data & Privacy */}
        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Data & Privacy Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Data Analytics</Label>
                    <p className="text-sm text-muted-foreground">
                      Help improve TheGradHelper by sharing usage analytics
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>Export Your Data</Label>
                  <p className="text-sm text-muted-foreground">
                    Download a copy of all your data including tasks, messages, and documents
                  </p>
                  <Button 
                    onClick={handleExportData}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    {isLoading ? 'Preparing Export...' : 'Export Data'}
                  </Button>
                </div>

                <Separator />

                <div className="space-y-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                  <Label className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="w-4 h-4" />
                    Danger Zone
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <Button 
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}