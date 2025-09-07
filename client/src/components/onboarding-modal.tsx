import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, SkipForward, CheckCircle, Info, X, Bell, Smartphone, Mail, MessageSquare, User, Phone } from "lucide-react";
import ViewingHistoryUpload from "./viewing-history-upload";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function OnboardingModal() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [notificationPrefs, setNotificationPrefs] = useState({
    episodes: true,
    recommendations: true,
    friends: true,
    system: true,
    pushNotifications: true,
    emailNotifications: false
  });
  const { user } = useAuth();

  // Check if user has any viewing history
  const { data: viewingHistory } = useQuery({
    queryKey: ["/api/viewing-history"],
    enabled: !!user,
  });

  // Mutation to save notification preferences
  const saveNotificationPrefs = useMutation({
    mutationFn: async (preferences: any) => {
      const response = await fetch("/api/notifications/preferences", {
        method: "PUT",
        body: JSON.stringify(preferences),
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error('Failed to save preferences');
      return response.json();
    }
  });

  // Mutation to save phone number
  const savePhoneNumber = useMutation({
    mutationFn: async (phone: string) => {
      const response = await fetch("/api/user/profile", {
        method: "PUT", 
        body: JSON.stringify({ phoneNumber: phone }),
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error('Failed to save phone number');
      return response.json();
    }
  });

  useEffect(() => {
    if (user) {
      const userId = (user as any).id;
      const hasCompletedOnboarding = localStorage.getItem(`onboarding-completed-${userId}`);
      const hasViewingHistory = viewingHistory && Array.isArray(viewingHistory) && viewingHistory.length > 0;
      
      // Show onboarding if:
      // 1. User hasn't completed onboarding AND
      // 2. User has no viewing history (new user or existing user without imports)
      if (!hasCompletedOnboarding && !hasViewingHistory) {
        setShowOnboarding(true);
      }
    }
  }, [user, viewingHistory]);

  const handleComplete = () => {
    if (user) {
      localStorage.setItem(`onboarding-completed-${(user as any).id}`, "true");
    }
    setShowOnboarding(false);
  };

  const handleSkip = () => {
    setCurrentStep(5); // Skip to completion step
  };

  const handleContactNext = async () => {
    try {
      if (phoneNumber.trim()) {
        await savePhoneNumber.mutateAsync(phoneNumber);
      }
      setCurrentStep(4); // Go to notification preferences
    } catch (error) {
      console.error("Failed to save phone number:", error);
      // Continue anyway
      setCurrentStep(4);
    }
  };

  const handleNotificationNext = async () => {
    try {
      await saveNotificationPrefs.mutateAsync(notificationPrefs);
      setCurrentStep(5); // Go to completion step
    } catch (error) {
      console.error("Failed to save notification preferences:", error);
      // Continue anyway
      setCurrentStep(5);
    }
  };

  if (!showOnboarding) return null;

  return (
    <Dialog open={showOnboarding} onOpenChange={(open) => {
      if (!open) {
        handleComplete();
      }
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={handleComplete}
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogTitle className="text-2xl">Welcome to BingeBoard! 🎬</DialogTitle>
          <DialogDescription className="text-lg">
            Let's get you set up with personalized recommendations
          </DialogDescription>
        </DialogHeader>

        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">Import Your Viewing History</h3>
              <p className="text-muted-foreground">
                Get better recommendations by importing your viewing history from streaming platforms.
                This is optional but will make your experience much more personalized.
              </p>
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  💡 Users with imported history get 3x more accurate recommendations!
                </p>
              </div>
            </div>

            {/* Platform Export Instructions - Condensed */}
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <Card className="p-3">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Info className="h-3 w-3" />
                    Netflix
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-1">
                  <p>1. netflix.com/viewingactivity</p>
                  <p>2. Click "Download all"</p>
                  <p>3. Upload the CSV file below</p>
                </CardContent>
              </Card>

              <Card className="p-3">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Info className="h-3 w-3" />
                    Disney+
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-1">
                  <p>1. Account Settings</p>
                  <p>2. Privacy and Data</p>
                  <p>3. Request Data Download</p>
                </CardContent>
              </Card>

              <Card className="p-3">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Info className="h-3 w-3" />
                    Other Platforms
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-1">
                  <p>Hulu, Max, Paramount+, Peacock</p>
                  <p>Find "Privacy Settings" or</p>
                  <p>"Data Export" in account settings</p>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-3 justify-center">
              <Button onClick={() => setCurrentStep(2)} className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Import History
              </Button>
              <Button variant="outline" onClick={handleSkip} className="flex items-center gap-2">
                <SkipForward className="h-4 w-4" />
                Skip for Now
              </Button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Upload Your Files</h3>
              <p className="text-muted-foreground">
                Upload CSV or JSON files from your streaming platforms
              </p>
            </div>

            <ViewingHistoryUpload />

            <div className="flex gap-3 justify-center">
              <Button onClick={() => setCurrentStep(3)} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Continue
              </Button>
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                Back
              </Button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <User className="h-16 w-16 text-blue-500 mx-auto" />
              <h3 className="text-xl font-semibold">Contact Information</h3>
              <p className="text-muted-foreground">
                Add your phone number to enable SMS notifications and password recovery.
              </p>
            </div>

            <Card className="p-4">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Phone className="h-5 w-5 text-blue-500" />
                  Phone Number (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-base font-medium">Mobile Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="text-base"
                  />
                  <p className="text-sm text-muted-foreground">
                    Used for SMS password recovery and optional SMS notifications. 
                    We'll never share your number or send spam.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3 justify-center">
              <Button onClick={handleContactNext} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Continue
              </Button>
              <Button variant="outline" onClick={() => setCurrentStep(4)} className="flex items-center gap-2">
                <SkipForward className="h-4 w-4" />
                Skip
              </Button>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <Bell className="h-16 w-16 text-teal-500 mx-auto" />
              <h3 className="text-xl font-semibold">Notification Preferences</h3>
              <p className="text-muted-foreground">
                Choose how you'd like to be notified about new episodes, recommendations, and friend activity.
              </p>
            </div>

            <div className="space-y-6">
              {/* Content Notifications */}
              <Card className="p-4">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-teal-500" />
                    Content Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="episodes" className="text-base font-medium">Episode Releases</Label>
                      <p className="text-sm text-muted-foreground">Get notified when new episodes are available</p>
                    </div>
                    <Switch
                      id="episodes"
                      checked={notificationPrefs.episodes}
                      onCheckedChange={(checked) => 
                        setNotificationPrefs(prev => ({ ...prev, episodes: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="recommendations" className="text-base font-medium">AI Recommendations</Label>
                      <p className="text-sm text-muted-foreground">Personalized show suggestions based on your taste</p>
                    </div>
                    <Switch
                      id="recommendations"
                      checked={notificationPrefs.recommendations}
                      onCheckedChange={(checked) => 
                        setNotificationPrefs(prev => ({ ...prev, recommendations: checked }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Social Notifications */}
              <Card className="p-4">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-teal-500" />
                    Social & Updates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="friends" className="text-base font-medium">Friend Activity</Label>
                      <p className="text-sm text-muted-foreground">See what your friends are watching and their reviews</p>
                    </div>
                    <Switch
                      id="friends"
                      checked={notificationPrefs.friends}
                      onCheckedChange={(checked) => 
                        setNotificationPrefs(prev => ({ ...prev, friends: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="system" className="text-base font-medium">System Updates</Label>
                      <p className="text-sm text-muted-foreground">New features, app updates, and important announcements</p>
                    </div>
                    <Switch
                      id="system"
                      checked={notificationPrefs.system}
                      onCheckedChange={(checked) => 
                        setNotificationPrefs(prev => ({ ...prev, system: checked }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Methods */}
              <Card className="p-4">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Mail className="h-5 w-5 text-teal-500" />
                    Delivery Methods
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push" className="text-base font-medium">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Real-time notifications on your device</p>
                    </div>
                    <Switch
                      id="push"
                      checked={notificationPrefs.pushNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationPrefs(prev => ({ ...prev, pushNotifications: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email" className="text-base font-medium">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Weekly digest and important updates via email</p>
                    </div>
                    <Switch
                      id="email"
                      checked={notificationPrefs.emailNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationPrefs(prev => ({ ...prev, emailNotifications: checked }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-3 justify-center">
              <Button 
                onClick={handleNotificationNext} 
                className="flex items-center gap-2"
                disabled={saveNotificationPrefs.isPending}
              >
                {saveNotificationPrefs.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Save & Continue
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setCurrentStep(3)}>
                Back
              </Button>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-6 text-center">
            <div className="space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h3 className="text-xl font-semibold">You're All Set!</h3>
              <p className="text-muted-foreground">
                Welcome to BingeBoard! Start discovering your next favorite show.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">What's Next?</h4>
              <div className="grid gap-2 text-sm text-muted-foreground">
                <p>✓ Explore trending shows and get recommendations</p>
                <p>✓ Add shows to your watchlist and track progress</p>
                <p>✓ Connect with friends and see what they're watching</p>
                <p>✓ Get notified about new episodes and updates</p>
                <p>✓ Import more history anytime in Settings</p>
              </div>
            </div>

            <Button onClick={handleComplete} className="w-full">
              Start Exploring
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}