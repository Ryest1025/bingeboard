import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { TopNav } from "@/components/top-nav";
import MobileNav from "@/components/mobile-nav";
import { Settings, Bell, Shield, Smartphone, Monitor, Users, Star, CreditCard, Link, Trash2, Download, Info, FileText, Lock, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function SettingsPage() {
  const { toast } = useToast();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [friendRequests, setFriendRequests] = useState(true);
  const [releaseReminders, setReleaseReminders] = useState(true);

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
    staleTime: 5 * 60 * 1000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });

  const { data: preferences } = useQuery({
    queryKey: ["/api/user/preferences"],
    staleTime: 5 * 60 * 1000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });

  const { data: integrations = [] } = useQuery({
    queryKey: ["/api/streaming/integrations"],
    staleTime: 5 * 60 * 1000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });

  const updatePreferences = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/user/preferences', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/preferences'] });
      toast({
        title: "Settings Updated",
        description: "Your preferences have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteAccount = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/user/delete', { method: 'DELETE' });
    },
    onSuccess: () => {
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      });
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete account. Please contact support.",
        variant: "destructive",
      });
    },
  });

  const handleNotificationChange = (type: string, value: boolean) => {
    const updates = { [type]: value };
    updatePreferences.mutate(updates);
    
    switch(type) {
      case 'emailNotifications':
        setEmailNotifications(value);
        break;
      case 'pushNotifications':
        setPushNotifications(value);
        break;
      case 'friendRequests':
        setFriendRequests(value);
        break;
      case 'releaseReminders':
        setReleaseReminders(value);
        break;
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to permanently delete your account? This action cannot be undone.')) {
      deleteAccount.mutate();
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <TopNav />
      
      <div className="pt-20 p-4 pb-24">
        <div className="container mx-auto max-w-4xl space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-4 mb-8">
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-2xl font-bold text-white">
                Settings for
              </h1>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1">
                  <img src="/bingeboard-logo.png" alt="BingeBoard Logo" className="w-7 h-7 rounded shadow-md" />
                  <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent font-black text-2xl">
                    BingeBoard
                  </span>
                </span>
              </div>
            </div>
            <p className="text-gray-400 text-sm">Manage your account preferences and privacy settings</p>
          </div>

          {/* Account Information */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="w-5 h-5 mr-2 text-teal-400" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-400">Email</Label>
                  <p className="text-white">{user?.email || 'Not available'}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-400">Member Since</Label>
                  <p className="text-white">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Bell className="w-5 h-5 mr-2 text-teal-400" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-white">Email Notifications</Label>
                    <p className="text-sm text-gray-400">Receive email updates about new episodes and friend activity</p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-white">Push Notifications</Label>
                    <p className="text-sm text-gray-400">Get real-time notifications on your device</p>
                  </div>
                  <Switch
                    checked={pushNotifications}
                    onCheckedChange={(checked) => handleNotificationChange('pushNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-white">Friend Requests</Label>
                    <p className="text-sm text-gray-400">Get notified when someone sends you a friend request</p>
                  </div>
                  <Switch
                    checked={friendRequests}
                    onCheckedChange={(checked) => handleNotificationChange('friendRequests', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-white">Release Reminders</Label>
                    <p className="text-sm text-gray-400">Get reminded about upcoming episodes and seasons</p>
                  </div>
                  <Switch
                    checked={releaseReminders}
                    onCheckedChange={(checked) => handleNotificationChange('releaseReminders', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Connected Services */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Link className="w-5 h-5 mr-2 text-teal-400" />
                Connected Services
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {integrations.length > 0 ? (
                  integrations.map((integration: any) => (
                    <div key={integration.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                          <Monitor className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{integration.platform}</p>
                          <p className="text-sm text-gray-400">Connected</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-teal-400 border-teal-400">
                        Active
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 space-y-2">
                    <Monitor className="w-12 h-12 text-gray-600 mx-auto" />
                    <p className="text-gray-400">No connected services</p>
                    <Button 
                      variant="outline" 
                      className="border-teal-500 text-teal-400 hover:bg-teal-500 hover:text-white"
                      onClick={() => window.location.href = '/streaming'}
                    >
                      Connect Services
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Smartphone className="w-5 h-5 mr-2 text-teal-400" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start border-gray-700 text-white hover:bg-gray-800"
                onClick={() => window.location.href = '/streaming'}
              >
                <Link className="w-4 h-4 mr-2" />
                Manage Streaming Integrations
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start border-gray-700 text-white hover:bg-gray-800"
                onClick={() => window.location.href = '/subscription'}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Subscription & Billing
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start border-gray-700 text-white hover:bg-gray-800"
                onClick={() => window.location.href = '/friends'}
              >
                <Users className="w-4 h-4 mr-2" />
                Manage Friends
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start border-gray-700 text-white hover:bg-gray-800"
                onClick={() => window.location.href = '/import-history'}
              >
                <Upload className="w-4 h-4 mr-2" />
                Import Viewing History
              </Button>
            </CardContent>
          </Card>

          {/* Privacy & Data Rights (CCPA/GDPR Compliant) */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Shield className="w-5 h-5 mr-2 text-teal-400" />
                Privacy & Data Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Data Rights Section */}
              <div className="p-4 bg-gray-800 rounded-lg">
                <h3 className="text-white font-medium mb-2">Your Data Rights (CCPA/GDPR)</h3>
                <p className="text-sm text-gray-400 mb-3">
                  You have full control over your personal data. Exercise your rights below.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-teal-500 text-teal-400 hover:bg-teal-500 hover:text-white w-full"
                    onClick={() => {
                      // Export user data
                      fetch('/api/data/export', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ requestType: 'full_export', format: 'json' })
                      }).then(response => {
                        if (response.ok) {
                          return response.blob();
                        }
                        throw new Error('Export failed');
                      }).then(blob => {
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `bingeboard-data-${Date.now()}.json`;
                        a.click();
                        window.URL.revokeObjectURL(url);
                      }).catch(error => {
                        console.error('Export error:', error);
                        alert('Export failed. Please try again.');
                      });
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export My Data
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white w-full"
                    onClick={() => {
                      fetch('/api/data/rights')
                        .then(response => response.json())
                        .then(data => {
                          alert(`Your Data Rights:\n\n${Object.values(data.userRights).join('\n\n')}\n\nFor questions, contact: ${data.contactInfo.privacy}`);
                        })
                        .catch(error => {
                          console.error('Rights info error:', error);
                          alert('Unable to fetch rights information.');
                        });
                    }}
                  >
                    <Info className="w-4 h-4 mr-2" />
                    View My Rights
                  </Button>
                </div>
              </div>

              {/* Legal Documents */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-gray-700 text-white hover:bg-gray-800"
                  onClick={() => window.location.href = '/privacy-policy'}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Privacy Policy
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-gray-700 text-white hover:bg-gray-800"
                  onClick={() => window.location.href = '/terms-of-service'}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Terms of Service
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-gray-700 text-white hover:bg-gray-800"
                  onClick={() => window.location.href = '/eula'}
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  EULA
                </Button>
              </div>
              
              <Separator className="bg-gray-700" />
              
              {/* Privacy Controls */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-3">
                    <p className="text-white font-medium">Profile Visibility</p>
                    <p className="text-sm text-gray-400">Control who can see your profile and activity</p>
                  </div>
                  <Switch defaultChecked className="flex-shrink-0" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-3">
                    <p className="text-white font-medium">Activity Sharing</p>
                    <p className="text-sm text-gray-400">Share your watching activity with friends</p>
                  </div>
                  <Switch defaultChecked className="flex-shrink-0" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-3">
                    <p className="text-white font-medium">Analytics Consent</p>
                    <p className="text-sm text-gray-400">Allow anonymous usage analytics to improve the service</p>
                  </div>
                  <Switch defaultChecked className="flex-shrink-0" />
                </div>
              </div>

              {/* Security Info */}
              <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Lock className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-300 font-medium">Data Security</p>
                    <p className="text-xs text-blue-200 mt-1">
                      Your data is encrypted in transit and at rest. We comply with CCPA, GDPR, and industry best practices.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="bg-red-900/20 border-red-800">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center">
                <Trash2 className="w-5 h-5 mr-2" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-white font-medium">Delete Account</p>
                <p className="text-sm text-gray-400">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleDeleteAccount}
                disabled={deleteAccount.isPending}
              >
                {deleteAccount.isPending ? 'Deleting...' : 'Delete Account Permanently'}
              </Button>
            </CardContent>
          </Card>

          {/* Logout */}
          <div className="text-center pt-6">
            <Button
              variant="outline"
              className="border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white"
              onClick={() => window.location.href = '/api/logout'}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
      
      <MobileNav />
    </div>
  );
}