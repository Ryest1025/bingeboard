import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { 
  Bell, 
  BellOff, 
  Check, 
  X, 
  Settings, 
  Smartphone, 
  Monitor,
  Send,
  History,
  Shield,
  Zap
} from 'lucide-react';

export default function NotificationsDemo() {
  const { user, isAuthenticated } = useAuth();
  const {
    token,
    notification,
    permission,
    preferences,
    history,
    preferencesLoading,
    updatingPreferences,
    sendingTest,
    clearNotification,
    requestPermission,
    updatePreferences,
    sendTestNotification,
    isEnabled,
    hasToken,
  } = useNotifications();

  const [showHistory, setShowHistory] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Please log in to access notification features.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const getPermissionBadge = () => {
    switch (permission) {
      case 'granted':
        return <Badge className="bg-green-500"><Check className="w-3 h-3 mr-1" /> Granted</Badge>;
      case 'denied':
        return <Badge variant="destructive"><X className="w-3 h-3 mr-1" /> Denied</Badge>;
      default:
        return <Badge variant="secondary">Not Requested</Badge>;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'web':
        return <Monitor className="w-4 h-4" />;
      case 'android':
      case 'ios':
        return <Smartphone className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-cyan-500 to-teal-600 rounded-lg text-white">
            <Bell className="w-6 h-6" />
          </div>
          Firebase Cloud Messaging Demo
        </h1>
        <p className="text-muted-foreground">
          Test and manage push notifications for BingeBoard
        </p>
      </div>

      {/* Current Notification Alert */}
      {notification && (
        <Alert className="border-cyan-200 bg-cyan-50">
          <Bell className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <strong>{notification.notification?.title}</strong>
              <br />
              {notification.notification?.body}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearNotification}
            >
              <X className="w-3 h-3" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Permission & Token Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-500" />
              Permission Status
            </CardTitle>
            <CardDescription>
              Current notification permission and FCM token status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Browser Permission:</span>
              {getPermissionBadge()}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-medium">FCM Token:</span>
              <Badge variant={hasToken ? "default" : "secondary"}>
                {hasToken ? "Active" : "Not Generated"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium">Notifications Enabled:</span>
              <Badge variant={isEnabled ? "default" : "secondary"}>
                {isEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>

            {permission !== 'granted' && (
              <Button 
                onClick={requestPermission} 
                className="w-full"
                variant="outline"
              >
                <Bell className="w-4 h-4 mr-2" />
                Request Permission
              </Button>
            )}

            {token && (
              <div className="text-sm">
                <p className="font-medium mb-1">Token (first 50 chars):</p>
                <code className="text-xs bg-muted p-2 rounded block break-all">
                  {token.substring(0, 50)}...
                </code>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-teal-500" />
              Test Notifications
            </CardTitle>
            <CardDescription>
              Send test notifications to verify functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={sendTestNotification}
              disabled={!isEnabled || sendingTest}
              className="w-full"
            >
              {sendingTest ? (
                <>
                  <div className="animate-spin w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                  Sending...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Send Test Notification
                </>
              )}
            </Button>

            {!isEnabled && (
              <Alert>
                <BellOff className="h-4 w-4" />
                <AlertDescription>
                  Enable notifications in preferences and grant browser permission to send test notifications.
                </AlertDescription>
              </Alert>
            )}

            <div className="text-sm text-muted-foreground">
              <p className="mb-2 font-medium">Test will send to:</p>
              <ul className="space-y-1">
                <li className="flex items-center gap-2">
                  <Monitor className="w-3 h-3" />
                  Web browser notifications
                </li>
                <li className="flex items-center gap-2">
                  <Smartphone className="w-3 h-3" />
                  Mobile app (if installed)
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-500" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Configure which notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent>
          {preferencesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-4 bg-muted rounded w-32 animate-pulse" />
                  <div className="h-6 bg-muted rounded w-12 animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Content Notifications</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Episode Releases</span>
                      <Switch
                        checked={preferences?.episodeReleases ?? true}
                        onCheckedChange={(checked) => 
                          updatePreferences({ episodeReleases: checked })
                        }
                        disabled={updatingPreferences}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Recommendations</span>
                      <Switch
                        checked={preferences?.recommendations ?? true}
                        onCheckedChange={(checked) => 
                          updatePreferences({ recommendations: checked })
                        }
                        disabled={updatingPreferences}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Social Notifications</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Friend Activity</span>
                      <Switch
                        checked={preferences?.friendActivity ?? true}
                        onCheckedChange={(checked) => 
                          updatePreferences({ friendActivity: checked })
                        }
                        disabled={updatingPreferences}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Watch Parties</span>
                      <Switch
                        checked={preferences?.watchParties ?? true}
                        onCheckedChange={(checked) => 
                          updatePreferences({ watchParties: checked })
                        }
                        disabled={updatingPreferences}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium text-sm">Delivery Methods</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Push Notifications</span>
                    <Switch
                      checked={preferences?.pushNotifications ?? true}
                      onCheckedChange={(checked) => 
                        updatePreferences({ pushNotifications: checked })
                      }
                      disabled={updatingPreferences}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email Notifications</span>
                    <Switch
                      checked={preferences?.emailNotifications ?? false}
                      onCheckedChange={(checked) => 
                        updatePreferences({ emailNotifications: checked })
                      }
                      disabled={updatingPreferences}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">System Updates</span>
                    <Switch
                      checked={preferences?.systemUpdates ?? false}
                      onCheckedChange={(checked) => 
                        updatePreferences({ systemUpdates: checked })
                      }
                      disabled={updatingPreferences}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-purple-500" />
              Notification History
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? 'Hide' : 'Show'} History
            </Button>
          </CardTitle>
          <CardDescription>
            Recent notifications sent to your devices
          </CardDescription>
        </CardHeader>
        {showHistory && (
          <CardContent>
            {history && Array.isArray(history) && history.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {history.map((item: any) => (
                  <div 
                    key={item.id} 
                    className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getPlatformIcon(item.platform)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{item.body}</p>
                        </div>
                        <Badge 
                          variant={item.status === 'sent' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {item.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>{item.type}</span>
                        <span>•</span>
                        <span>{new Date(item.sentAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No notifications sent yet</p>
                <p className="text-sm">Send a test notification to see it here</p>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Implementation Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Status</CardTitle>
          <CardDescription>
            FCM integration features and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-green-600">✅ Implemented</h4>
              <ul className="text-sm space-y-1">
                <li>• Firebase Admin SDK setup</li>
                <li>• FCM token registration</li>
                <li>• Browser notification permissions</li>
                <li>• Test notification sending</li>
                <li>• Notification preferences</li>
                <li>• Service worker for background</li>
                <li>• Notification history tracking</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-amber-600">🔄 Ready for Setup</h4>
              <ul className="text-sm space-y-1">
                <li>• Firebase project configuration</li>
                <li>• Production Firebase credentials</li>
                <li>• Episode release notifications</li>
                <li>• Friend activity alerts</li>
                <li>• Custom notification topics</li>
                <li>• Mobile app integration</li>
                <li>• Batch notification sending</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}