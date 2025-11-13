import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { NOTIFICATION_SETTINGS } from './constants';

export function PreferencesTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {NOTIFICATION_SETTINGS.map((setting, index) => (
            <div key={setting.id}>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{setting.label}</Label>
                  <p className="text-sm text-muted-foreground">
                    {setting.description}
                  </p>
                </div>
                <Switch defaultChecked={setting.defaultChecked} />
              </div>
              {index < NOTIFICATION_SETTINGS.length - 1 && <Separator />}
            </div>
          ))}

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Button variant="outline" size="sm">
              Setup
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}