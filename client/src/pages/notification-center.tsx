import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Check, X, Settings, Smartphone, Users, Calendar, Star, Play, Share } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface NotificationPreferences {
  episodeReleases: boolean;
  recommendations: boolean;
  friendActivity: boolean;
  watchParties: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
  systemUpdates: boolean;
}

interface Notification {
  id: number;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  data?: any;
  createdAt: string;
}

export default function NotificationCenter() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');
  
  // Get notification permissions and token
  const {
    hasPermission,
    token,
    requestPermission,
    sendTestNotification,
    isSupported
  } = useNotifications();

  // Fetch user's notification preferences
  const { data: preferences } = useQuery({
    queryKey: ['/api/notifications/preferences'],
  });

  // Fetch notification history
  const { data: notifications = [] } = useQuery({
    queryKey: ['/api/notifications/history'],
  });

  // Update notification preferences
  const updatePreferencesMutation = useMutation({
    mutationFn: async (newPreferences: Partial<NotificationPreferences>) => {
      return apiRequest('/api/notifications/preferences', {
        method: 'PUT',
        body: JSON.stringify(newPreferences),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/preferences'] });
      toast({
        title: "Preferences Updated",
        description: "Your notification preferences have been saved.",
      });
    },
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      return apiRequest(`/api/notifications/${notificationId}/read`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/history'] });
    },
  });

  // Delete notification
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      return apiRequest(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/history'] });
      toast({
        title: "Notification Deleted",
        description: "The notification has been removed.",
      });
    },
  });

  // Send test notification
  const testNotificationMutation = useMutation({
    mutationFn: async (type: string) => {
      const testMessages = {
        episode: {
          title: "New Episode Available! 📺",
          body: "Season 2 Episode 8 of The Bear is now streaming on FX/Hulu"
        },
        recommendation: {
          title: "Perfect Match Found! ⭐",
          body: "Based on your love for Succession, we recommend watching House of Cards"
        },
        friend: {
          title: "Friend Activity 👥", 
          body: "Sarah just finished watching Breaking Bad and rated it 5 stars"
        },
        reminder: {
          title: "Don't Miss Out! ⏰",
          body: "The Mandalorian Season 3 premieres tomorrow on Disney+"
        }
      };

      const message = testMessages[type as keyof typeof testMessages];
      return apiRequest('/api/notifications/send', {
        method: 'POST',
        body: JSON.stringify({
          title: message.title,
          body: message.body,
          data: { type, timestamp: new Date().toISOString() }
        }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      toast({
        title: "Test Notification Sent!",
        description: "Check your device for the notification.",
      });
      // Refresh notification history
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/history'] });
    },
  });

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: boolean) => {
    updatePreferencesMutation.mutate({ [key]: value });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'episode': return <Play className="w-4 h-4 text-blue-500" />;
      case 'recommendation': return <Star className="w-4 h-4 text-yellow-500" />;
      case 'friend': return <Users className="w-4 h-4 text-green-500" />;
      case 'reminder': return <Calendar className="w-4 h-4 text-purple-500" />;
      case 'system': return <Settings className="w-4 h-4 text-gray-500" />;
      default: return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter((notification: Notification) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.isRead;
    return notification.type === activeTab;
  });

  const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;

  if (!isSupported) {
    return (
      <div className="min-h-screen bg-black text-white p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Notifications Not Supported</h2>
            <p className="text-gray-400">
              Your browser doesn't support push notifications or you're using HTTP instead of HTTPS.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-teal-400" />
              <h1 className="text-2xl font-bold">Notification Center</h1>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} unread
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!hasPermission ? (
                <Button onClick={requestPermission} className="bg-teal-600 hover:bg-teal-700">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Enable Notifications
                </Button>
              ) : (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Check className="w-4 h-4 text-green-500" />
                  Notifications Enabled
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full bg-gray-900">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="episode">Episodes</TabsTrigger>
            <TabsTrigger value="recommendation">Recommendations</TabsTrigger>
            <TabsTrigger value="friend">Friends</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* All/Unread/Type-specific notifications */}
          <TabsContent value="all" className="space-y-4">
            <NotificationList 
              notifications={filteredNotifications}
              onMarkAsRead={(id) => markAsReadMutation.mutate(id)}
              onDelete={(id) => deleteNotificationMutation.mutate(id)}
              getNotificationIcon={getNotificationIcon}
              formatDate={formatDate}
            />
          </TabsContent>

          <TabsContent value="unread" className="space-y-4">
            <NotificationList 
              notifications={filteredNotifications}
              onMarkAsRead={(id) => markAsReadMutation.mutate(id)}
              onDelete={(id) => deleteNotificationMutation.mutate(id)}
              getNotificationIcon={getNotificationIcon}
              formatDate={formatDate}
            />
          </TabsContent>

          <TabsContent value="episode" className="space-y-4">
            <NotificationList 
              notifications={filteredNotifications}
              onMarkAsRead={(id) => markAsReadMutation.mutate(id)}
              onDelete={(id) => deleteNotificationMutation.mutate(id)}
              getNotificationIcon={getNotificationIcon}
              formatDate={formatDate}
            />
          </TabsContent>

          <TabsContent value="recommendation" className="space-y-4">
            <NotificationList 
              notifications={filteredNotifications}
              onMarkAsRead={(id) => markAsReadMutation.mutate(id)}
              onDelete={(id) => deleteNotificationMutation.mutate(id)}
              getNotificationIcon={getNotificationIcon}
              formatDate={formatDate}
            />
          </TabsContent>

          <TabsContent value="friend" className="space-y-4">
            <NotificationList 
              notifications={filteredNotifications}
              onMarkAsRead={(id) => markAsReadMutation.mutate(id)}
              onDelete={(id) => deleteNotificationMutation.mutate(id)}
              getNotificationIcon={getNotificationIcon}
              formatDate={formatDate}
            />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Customize when and how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Permission Status */}
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-teal-400" />
                    <div>
                      <h3 className="font-medium">Push Notifications</h3>
                      <p className="text-sm text-gray-400">
                        {hasPermission ? 'Enabled and working' : 'Click to enable notifications'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasPermission ? (
                      <Badge variant="default" className="bg-green-600">Enabled</Badge>
                    ) : (
                      <Button onClick={requestPermission} size="sm">
                        Enable
                      </Button>
                    )}
                  </div>
                </div>

                {/* Test Notifications */}
                {hasPermission && (
                  <div className="space-y-4">
                    <h3 className="font-medium">Test Notifications</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        onClick={() => testNotificationMutation.mutate('episode')}
                        disabled={testNotificationMutation.isPending}
                        className="h-auto p-4 flex flex-col items-start gap-1"
                      >
                        <div className="flex items-center gap-2">
                          <Play className="w-4 h-4" />
                          Episode Release
                        </div>
                        <span className="text-xs text-gray-400">New episode available</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => testNotificationMutation.mutate('recommendation')}
                        disabled={testNotificationMutation.isPending}
                        className="h-auto p-4 flex flex-col items-start gap-1"
                      >
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          Recommendation
                        </div>
                        <span className="text-xs text-gray-400">AI-powered suggestion</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => testNotificationMutation.mutate('friend')}
                        disabled={testNotificationMutation.isPending}
                        className="h-auto p-4 flex flex-col items-start gap-1"
                      >
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Friend Activity
                        </div>
                        <span className="text-xs text-gray-400">Social updates</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => testNotificationMutation.mutate('reminder')}
                        disabled={testNotificationMutation.isPending}
                        className="h-auto p-4 flex flex-col items-start gap-1"
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Reminder
                        </div>
                        <span className="text-xs text-gray-400">Upcoming releases</span>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Notification Type Preferences */}
                {preferences && (
                  <div className="space-y-4">
                    <h3 className="font-medium">Notification Types</h3>
                    <div className="space-y-3">
                      {[
                        { key: 'episodeReleases', label: 'Episode Releases', desc: 'New episodes from your watchlist' },
                        { key: 'recommendations', label: 'AI Recommendations', desc: 'Personalized show suggestions' },
                        { key: 'friendActivity', label: 'Friend Activity', desc: 'When friends finish shows or rate content' },
                        { key: 'systemUpdates', label: 'System Updates', desc: 'App updates and maintenance notices' },
                      ].map(({ key, label, desc }) => (
                        <div key={key} className="flex items-center justify-between p-3 bg-gray-800 rounded">
                          <div>
                            <h4 className="font-medium">{label}</h4>
                            <p className="text-sm text-gray-400">{desc}</p>
                          </div>
                          <Button
                            variant={preferences[key as keyof NotificationPreferences] ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePreferenceChange(
                              key as keyof NotificationPreferences, 
                              !preferences[key as keyof NotificationPreferences]
                            )}
                          >
                            {preferences[key as keyof NotificationPreferences] ? "On" : "Off"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Reusable Notification List Component
function NotificationList({ 
  notifications, 
  onMarkAsRead, 
  onDelete, 
  getNotificationIcon, 
  formatDate 
}: {
  notifications: Notification[];
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
  getNotificationIcon: (type: string) => JSX.Element;
  formatDate: (date: string) => string;
}) {
  if (notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-medium mb-2">No Notifications</h3>
        <p className="text-gray-400">
          You're all caught up! New notifications will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification: Notification) => (
        <Card 
          key={notification.id} 
          className={`bg-gray-900 border-gray-700 ${!notification.isRead ? 'ring-1 ring-teal-500/20' : ''}`}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                {getNotificationIcon(notification.type)}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium mb-1">{notification.title}</h4>
                  <p className="text-sm text-gray-400 mb-2">{notification.body}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{formatDate(notification.createdAt)}</span>
                    {!notification.isRead && (
                      <Badge variant="secondary" className="text-xs">New</Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {!notification.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMarkAsRead(notification.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(notification.id)}
                  className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}