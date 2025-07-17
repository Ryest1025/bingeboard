import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Download,
  Trash2,
  Save,
  Crown
} from "lucide-react";

export default function SettingsPage() {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    social: false,
    marketing: false
  });
  
  const [privacy, setPrivacy] = useState({
    publicProfile: true,
    showActivity: true,
    allowMessages: true
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
        <div className="text-center text-white max-w-md">
          <Settings className="w-16 h-16 mx-auto mb-4 text-teal-400" />
          <h1 className="text-2xl font-bold mb-4">Settings</h1>
          <p className="text-gray-400 mb-6">Please sign in to access your settings</p>
          <Button className="bg-teal-600 hover:bg-teal-700">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Settings</h1>
            <p className="text-gray-400 text-sm sm:text-base">Manage your account and preferences</p>
          </div>

          {/* Profile Settings */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <User className="w-5 h-5" />
                Profile Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">First Name</Label>
                  <Input 
                    defaultValue={user?.firstName || ""} 
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Last Name</Label>
                  <Input 
                    defaultValue={user?.lastName || ""} 
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>
              <div>
                <Label className="text-white">Email</Label>
                <Input 
                  defaultValue={user?.email || ""} 
                  disabled 
                  className="bg-slate-700 border-slate-600 text-gray-400"
                />
              </div>
              <Button className="bg-teal-600 hover:bg-teal-700">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Email Notifications</Label>
                  <p className="text-sm text-gray-400">Receive updates via email</p>
                </div>
                <Switch 
                  checked={notifications.email}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Push Notifications</Label>
                  <p className="text-sm text-gray-400">Get notified about new content</p>
                </div>
                <Switch 
                  checked={notifications.push}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, push: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Social Activity</Label>
                  <p className="text-sm text-gray-400">Friend activity and interactions</p>
                </div>
                <Switch 
                  checked={notifications.social}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, social: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Shield className="w-5 h-5" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Public Profile</Label>
                  <p className="text-sm text-gray-400">Allow others to see your profile</p>
                </div>
                <Switch 
                  checked={privacy.publicProfile}
                  onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, publicProfile: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Show Activity</Label>
                  <p className="text-sm text-gray-400">Display your watching activity</p>
                </div>
                <Switch 
                  checked={privacy.showActivity}
                  onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, showActivity: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Premium Section */}
          <Card className="bg-gradient-to-r from-amber-900/20 to-yellow-900/20 border-amber-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-400">
                <Crown className="w-5 h-5" />
                Premium Features
                <Badge className="bg-amber-500 text-black">Upgrade</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">Unlock advanced features and remove ads</p>
              <Button className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:from-amber-600 hover:to-yellow-600">
                Upgrade to Premium
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="bg-red-900/20 border-red-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <Trash2 className="w-5 h-5" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">Permanently delete your account and all data</p>
              <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
