import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
// Firebase imports disabled temporarily to fix build issues
// import { addPasswordToAccount, hasPasswordProvider, getLinkedProviders } from "@/firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Palette, 
  Shield, 
  Tv, 
  Star, 
  Users, 
  Bell, 
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Key,
  Eye,
  EyeOff,
  Mail,
  Copy,
  Share2,
  Upload,
  Trophy
} from "lucide-react";

interface OnboardingData {
  profile: {
    firstName: string;
    lastName: string;
    username: string;
    bio: string;
  };
  security: {
    password: string;
    confirmPassword: string;
    skipPassword: boolean;
  };
  preferences: {
    theme: "light" | "dark" | "auto";
    privacy: "public" | "friends" | "private";
    streamingPlatforms: string[];
    favoriteGenres: string[];
    favoriteSports: string[];
    favoriteTeams: string[];
  };
  notifications: {
    newReleases: boolean;
    recommendations: boolean;
    friendActivity: boolean;
    episodeReminders: boolean;
    weeklyDigest: boolean;
  };
}

const STREAMING_PLATFORMS = [
  "Netflix", "Disney+", "HBO Max", "Prime Video", "Hulu", 
  "Apple TV+", "Paramount+", "Peacock", "YouTube TV", "Crunchyroll"
];

const GENRES = [
  "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary",
  "Drama", "Family", "Fantasy", "Horror", "Mystery", "Romance",
  "Sci-Fi", "Thriller", "War", "Western"
];

const SPORTS = [
  "NFL", "NBA", "MLB", "NHL", "Tennis", "Soccer", "College Football", "College Basketball"
];

const TEAMS = {
  NFL: ["Dallas Cowboys", "New England Patriots", "Green Bay Packers", "Pittsburgh Steelers", "San Francisco 49ers", "Kansas City Chiefs", "Buffalo Bills", "Tampa Bay Buccaneers"],
  NBA: ["Los Angeles Lakers", "Boston Celtics", "Golden State Warriors", "Chicago Bulls", "Miami Heat", "San Antonio Spurs", "Brooklyn Nets", "Phoenix Suns"],
  MLB: ["New York Yankees", "Los Angeles Dodgers", "Boston Red Sox", "St. Louis Cardinals", "San Francisco Giants", "Chicago Cubs", "Atlanta Braves", "Houston Astros"],
  NHL: ["Montreal Canadiens", "Toronto Maple Leafs", "Boston Bruins", "New York Rangers", "Chicago Blackhawks", "Detroit Red Wings", "Pittsburgh Penguins", "Vegas Golden Knights"],
  Tennis: ["ATP Tour", "WTA Tour", "Grand Slams", "Wimbledon", "US Open", "French Open", "Australian Open"],
  Soccer: ["Premier League", "La Liga", "Serie A", "Bundesliga", "MLS", "Champions League", "World Cup", "UEFA"]
};

export default function EnhancedOnboardingModal() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  console.log('🎯 ENHANCED ONBOARDING MODAL RENDERED', { isAuthenticated, user: user?.email, showOnboarding: undefined });
  
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [friendEmail, setFriendEmail] = useState("");
  const [invitationsSent, setInvitationsSent] = useState<string[]>([]);
  
  // Viewing history import state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPlatform, setImportPlatform] = useState<string>("");
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    profile: {
      firstName: "",
      lastName: "",
      username: "",
      bio: ""
    },
    security: {
      password: "",
      confirmPassword: "",
      skipPassword: false
    },
    preferences: {
      theme: "dark",
      privacy: "public",
      streamingPlatforms: [],
      favoriteGenres: [],
      favoriteSports: [],
      favoriteTeams: []
    },
    notifications: {
      newReleases: true,
      recommendations: true,
      friendActivity: true,
      episodeReminders: true,
      weeklyDigest: false
    }
  });

  // Show onboarding for new users or users without preferences
  useEffect(() => {
    if (isAuthenticated && user) {
      // Check if user needs onboarding based on completion flag
      console.log('🎯 Enhanced onboarding check:', {
        user,
        onboardingCompleted: user?.onboardingCompleted,
        needsOnboarding: !user?.onboardingCompleted
      });
      const needsOnboarding = !user?.onboardingCompleted;
      console.log('🎯 Setting showOnboarding to:', needsOnboarding);
      setShowOnboarding(needsOnboarding);
      
      if (user.firstName && user.lastName) {
        setOnboardingData(prev => ({
          ...prev,
          profile: {
            ...prev.profile,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            username: user.email?.split('@')[0] || ""
          }
        }));
      }
    }
  }, [user, isAuthenticated]);

  // Listen for invite friends trigger from social page
  useEffect(() => {
    const handleInviteModal = () => {
      if (isAuthenticated && user) {
        setShowOnboarding(true);
        setCurrentStep(8); // Jump directly to friend invitation step
      }
    };

    window.addEventListener('show-invite-modal', handleInviteModal);
    return () => window.removeEventListener('show-invite-modal', handleInviteModal);
  }, [isAuthenticated, user]);

  const saveProfile = useMutation({
    mutationFn: async (profile: any) => {
      return await apiRequest("PUT", "/api/user/profile", profile);
    }
  });

  const savePreferences = useMutation({
    mutationFn: async (prefs: any) => {
      return await apiRequest("PUT", "/api/user/preferences", prefs);
    }
  });

  const saveNotifications = useMutation({
    mutationFn: async (notifs: any) => {
      return await apiRequest("PUT", "/api/notifications/preferences", notifs);
    }
  });

  const completeOnboarding = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/user/onboarding/complete", {});
    }
  });

  const sendFriendInvitation = useMutation({
    mutationFn: async (email: string) => {
      return await apiRequest("POST", "/api/friends/invite", { email });
    },
    onSuccess: (data, email) => {
      setInvitationsSent([...invitationsSent, email]);
      setFriendEmail("");
      toast({
        title: "Invitation sent!",
        description: `Your friend at ${email} will receive an email invitation to join BingeBoard.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send invitation",
        description: error.message || "Please check the email address and try again.",
        variant: "destructive",
      });
    }
  });

  const importViewingHistory = useMutation({
    mutationFn: async ({ data, platform, dataType }: { data: any[], platform: string, dataType: string }) => {
      return await apiRequest("POST", "/api/viewing-history/import", { data, platform, dataType });
    },
    onSuccess: (result: any) => {
      setImportResult(result);
      setIsImporting(false);
      queryClient.invalidateQueries({ queryKey: ["/api/viewing-history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations"] });
      toast({
        title: "Import Complete!",
        description: `Successfully imported ${result.imported} shows${result.skipped > 0 ? `, skipped ${result.skipped} entries` : ''}.`,
      });
    },
    onError: (error: any) => {
      setIsImporting(false);
      toast({
        title: "Import Failed",
        description: error.message || "Please check your file format and try again.",
        variant: "destructive",
      });
    }
  });

  const handleNext = () => {
    if (currentStep < 12) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setCurrentStep(10);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
    }
  };

  const handleImportFile = async () => {
    if (!importFile || !importPlatform) {
      toast({
        title: "Missing Information",
        description: "Please select a file and platform before importing.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    
    try {
      const text = await importFile.text();
      let data: any[] = [];
      
      if (importFile.name.endsWith('.csv')) {
        // Simple CSV parsing
        const lines = text.split('\n').slice(1); // Skip header
        data = lines.filter(line => line.trim()).map((line, index) => {
          const columns = line.split(',').map(col => col.replace(/"/g, '').trim());
          return {
            title: columns[0] || `Unknown ${index}`,
            date: columns[1] || new Date().toISOString().split('T')[0],
            platform: importPlatform
          };
        });
      } else if (importFile.name.endsWith('.json')) {
        data = JSON.parse(text);
      }
      
      await importViewingHistory.mutateAsync({ 
        data, 
        platform: importPlatform, 
        dataType: importFile.name.endsWith('.csv') ? 'csv' : 'json' 
      });
    } catch (error) {
      console.error('Import error:', error);
      setIsImporting(false);
      toast({
        title: "Import Failed",
        description: "Please check your file format and try again.",
        variant: "destructive",
      });
    }
  };

  const handleFinish = async () => {
    try {
      console.log("Starting onboarding completion process...");
      console.log("Onboarding data:", onboardingData);
      
      // Handle password creation if provided
      if (!hasPasswordProvider() && !onboardingData.security.skipPassword && onboardingData.security.password) {
        if (onboardingData.security.password !== onboardingData.security.confirmPassword) {
          toast({
            title: "Password Mismatch",
            description: "Passwords do not match. Please check and try again.",
            variant: "destructive",
          });
          return;
        }
        
        if (onboardingData.security.password.length < 6) {
          toast({
            title: "Password Too Short",
            description: "Password must be at least 6 characters long.",
            variant: "destructive",
          });
          return;
        }
        
        try {
          await addPasswordToAccount(onboardingData.security.password);
          console.log("Password added to account successfully");
        } catch (error) {
          console.error("Error adding password to account:", error);
          // Continue with onboarding even if password addition fails
        }
      }
      
      // Save all data with improved error handling
      try {
        console.log("Saving profile data...");
        await saveProfile.mutateAsync(onboardingData.profile);
        console.log("Profile saved successfully");
      } catch (error) {
        console.error("Error saving profile:", error);
        // Continue anyway, profile is optional
      }
      
      try {
        console.log("Saving preferences data...");
        // Ensure we only send valid preference data
        const validPreferences = {
          preferredGenres: onboardingData.preferences.favoriteGenres || [],
          preferredNetworks: onboardingData.preferences.streamingPlatforms || [],
          watchingHabits: [],
          contentRating: "All",
          languagePreferences: ["English"],
          aiPersonality: "balanced",
          notificationFrequency: "weekly",
          favoriteSports: onboardingData.preferences.favoriteSports || [],
          favoriteTeams: onboardingData.preferences.favoriteTeams || [],
          sportsNotifications: true,
        };
        await savePreferences.mutateAsync(validPreferences);
        console.log("Preferences saved successfully");
      } catch (error) {
        console.error("Error saving preferences:", error);
        // Continue anyway, preferences can be set later
      }
      
      try {
        console.log("Saving notification settings...");
        await saveNotifications.mutateAsync(onboardingData.notifications);
        console.log("Notifications saved successfully");
      } catch (error) {
        console.error("Error saving notifications:", error);
        // Continue anyway, notifications can be set later
      }
      
      try {
        console.log("Completing onboarding...");
        await completeOnboarding.mutateAsync();
        console.log("Onboarding completed successfully");
      } catch (error) {
        console.error("Error completing onboarding:", error);
        toast({
          title: "Almost Done!",
          description: "Your settings were saved. Completing setup now...",
        });
        // Force completion by updating user data directly
        await queryClient.refetchQueries({ queryKey: ['/api/auth/user'] });
      }
      
      // Force refresh user data to get the updated onboardingCompleted flag
      await queryClient.refetchQueries({ queryKey: ['/api/auth/user'] });
      
      toast({
        title: "Welcome to BingeBoard!",
        description: "Your account has been set up successfully. Let's start discovering your next binge!",
      });
      
      setShowOnboarding(false);
    } catch (error) {
      console.error("Error saving onboarding data:", error);
      toast({
        title: "Setup Error",
        description: "There was an error setting up your account. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateProfile = (field: string, value: string) => {
    setOnboardingData(prev => ({
      ...prev,
      profile: { ...prev.profile, [field]: value }
    }));
  };

  const updatePreferences = (field: string, value: any) => {
    setOnboardingData(prev => ({
      ...prev,
      preferences: { ...prev.preferences, [field]: value }
    }));
  };

  const updateNotifications = (field: string, value: boolean) => {
    setOnboardingData(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [field]: value }
    }));
  };

  const updateSecurity = (field: string, value: string | boolean) => {
    setOnboardingData(prev => ({
      ...prev,
      security: { ...prev.security, [field]: value }
    }));
  };

  const toggleGenre = (genre: string) => {
    const current = onboardingData.preferences.favoriteGenres;
    const updated = current.includes(genre)
      ? current.filter(g => g !== genre)
      : [...current, genre];
    updatePreferences("favoriteGenres", updated);
  };

  const togglePlatform = (platform: string) => {
    const current = onboardingData.preferences.streamingPlatforms;
    const updated = current.includes(platform)
      ? current.filter(p => p !== platform)
      : [...current, platform];
    updatePreferences("streamingPlatforms", updated);
  };

  if (!showOnboarding) {
    console.log('🎯 Onboarding not showing because showOnboarding is:', showOnboarding);
    console.log('🎯 User onboarding status:', user?.onboardingCompleted);
    console.log('🎯 Full user object:', user);
    return null;
  }

  const progress = (currentStep / 11) * 100;

  return (
    <>
      {/* Custom backdrop to ensure proper layering */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black/80 z-[9998]" />
      )}
      
      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto z-[9999] fixed top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 bg-background border shadow-lg rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Welcome to BingeBoard! 🎬
          </DialogTitle>
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground text-center">
              Step {currentStep} of 12 - Let's personalize your experience
            </p>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step 1: Profile Setup */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-teal-500" />
                  Tell us about yourself
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={onboardingData.profile.firstName}
                      onChange={(e) => updateProfile("firstName", e.target.value)}
                      placeholder="Your first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={onboardingData.profile.lastName}
                      onChange={(e) => updateProfile("lastName", e.target.value)}
                      placeholder="Your last name"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={onboardingData.profile.username}
                    onChange={(e) => updateProfile("username", e.target.value)}
                    placeholder="Choose a unique username"
                  />
                </div>
                <div>
                  <Label htmlFor="bio">Bio (Optional)</Label>
                  <Textarea
                    id="bio"
                    value={onboardingData.profile.bio}
                    onChange={(e) => updateProfile("bio", e.target.value)}
                    placeholder="Tell others about your viewing interests..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Security Setup */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-teal-500" />
                  Secure Your Account
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Add a password to secure your account and enable additional sign-in methods
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {!hasPasswordProvider() ? (
                  <>
                    <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-lg border border-teal-200 dark:border-teal-800">
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-teal-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-teal-900 dark:text-teal-100">Why add a password?</h4>
                          <ul className="text-sm text-teal-700 dark:text-teal-300 mt-1 space-y-1">
                            <li>• Access your account even if social login is unavailable</li>
                            <li>• Enhanced security with multiple login methods</li>
                            <li>• Full control over your account access</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="password">Create Password</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={onboardingData.security.password}
                            onChange={(e) => updateSecurity("password", e.target.value)}
                            placeholder="Enter a secure password"
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={onboardingData.security.confirmPassword}
                            onChange={(e) => updateSecurity("confirmPassword", e.target.value)}
                            placeholder="Confirm your password"
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        {onboardingData.security.password && onboardingData.security.confirmPassword && 
                         onboardingData.security.password !== onboardingData.security.confirmPassword && (
                          <p className="text-sm text-red-500 mt-1">Passwords do not match</p>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="skipPassword"
                          checked={onboardingData.security.skipPassword}
                          onCheckedChange={(checked) => updateSecurity("skipPassword", checked)}
                        />
                        <Label htmlFor="skipPassword" className="text-sm">
                          Skip for now (you can add a password later in settings)
                        </Label>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-green-600" />
                      <div>
                        <h4 className="font-medium text-green-900 dark:text-green-100">Account Already Secured</h4>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Your account already has password protection enabled.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Theme Selection */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-teal-500" />
                  Choose your theme
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs
                  value={onboardingData.preferences.theme}
                  onValueChange={(value: any) => updatePreferences("theme", value)}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="light">Light</TabsTrigger>
                    <TabsTrigger value="dark">Dark</TabsTrigger>
                    <TabsTrigger value="auto">Auto</TabsTrigger>
                  </TabsList>
                  <TabsContent value="light" className="mt-4">
                    <div className="p-4 bg-white border rounded-lg">
                      <p className="text-gray-900">Clean and bright interface perfect for daytime viewing</p>
                    </div>
                  </TabsContent>
                  <TabsContent value="dark" className="mt-4">
                    <div className="p-4 bg-gray-900 border rounded-lg">
                      <p className="text-white">Comfortable dark theme that's easy on the eyes</p>
                    </div>
                  </TabsContent>
                  <TabsContent value="auto" className="mt-4">
                    <div className="p-4 bg-gradient-to-r from-white to-gray-900 border rounded-lg">
                      <p className="text-gray-700">Automatically switches based on your system settings</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Privacy Settings */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-teal-500" />
                  Privacy preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {["public", "friends", "private"].map((privacy) => (
                    <div
                      key={privacy}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        onboardingData.preferences.privacy === privacy
                          ? "border-teal-500 bg-teal-50 dark:bg-teal-950"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                      onClick={() => updatePreferences("privacy", privacy)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium capitalize">{privacy}</h3>
                          <p className="text-sm text-muted-foreground">
                            {privacy === "public" && "Your profile and activity are visible to everyone"}
                            {privacy === "friends" && "Only friends can see your activity"}
                            {privacy === "private" && "Your profile is completely private"}
                          </p>
                        </div>
                        {onboardingData.preferences.privacy === privacy && (
                          <Check className="h-5 w-5 text-teal-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Streaming Platforms */}
          {currentStep === 5 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tv className="h-5 w-5 text-teal-500" />
                  Which streaming services do you use?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {STREAMING_PLATFORMS.map((platform) => (
                    <Button
                      key={platform}
                      variant={onboardingData.preferences.streamingPlatforms.includes(platform) ? "default" : "outline"}
                      onClick={() => togglePlatform(platform)}
                      className="h-auto p-4 flex flex-col items-center gap-2"
                    >
                      <span className="text-sm font-medium">{platform}</span>
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Selected {onboardingData.preferences.streamingPlatforms.length} platforms
                </p>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Favorite Genres */}
          {currentStep === 6 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-teal-500" />
                  What genres do you love?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map((genre) => (
                    <Badge
                      key={genre}
                      variant={onboardingData.preferences.favoriteGenres.includes(genre) ? "default" : "outline"}
                      className="cursor-pointer p-2 text-sm"
                      onClick={() => toggleGenre(genre)}
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Selected {onboardingData.preferences.favoriteGenres.length} genres
                </p>
              </CardContent>
            </Card>
          )}

          {/* Step 6: Sports Preferences */}
          {currentStep === 7 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-teal-500" />
                  Sports preferences (optional)
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Select your favorite sports and teams to see live games and schedules
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Favorite Sports Selection */}
                <div>
                  <Label className="text-base font-medium mb-3 block">What sports do you follow?</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {SPORTS.map((sport) => (
                      <div
                        key={sport}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          onboardingData.preferences.favoriteSports.includes(sport)
                            ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-teal-300"
                        }`}
                        onClick={() => {
                          const current = onboardingData.preferences.favoriteSports;
                          const updated = current.includes(sport)
                            ? current.filter(s => s !== sport)
                            : [...current, sport];
                          updatePreferences("favoriteSports", updated);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full border-2 ${
                            onboardingData.preferences.favoriteSports.includes(sport)
                              ? "bg-teal-500 border-teal-500"
                              : "border-gray-300"
                          }`} />
                          <span className="font-medium">{sport}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Favorite Teams Selection */}
                {onboardingData.preferences.favoriteSports.length > 0 && (
                  <div>
                    <Label className="text-base font-medium mb-3 block">Favorite teams</Label>
                    <div className="space-y-4">
                      {onboardingData.preferences.favoriteSports.map((sport) => (
                        <div key={sport}>
                          <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">{sport}</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {TEAMS[sport as keyof typeof TEAMS]?.slice(0, 8).map((team) => (
                              <Badge
                                key={team}
                                variant={onboardingData.preferences.favoriteTeams.includes(team) ? "default" : "outline"}
                                className={`cursor-pointer transition-all hover:scale-105 p-2 text-xs ${
                                  onboardingData.preferences.favoriteTeams.includes(team)
                                    ? "bg-teal-500 hover:bg-teal-600"
                                    : "hover:border-teal-300"
                                }`}
                                onClick={() => {
                                  const current = onboardingData.preferences.favoriteTeams;
                                  const updated = current.includes(team)
                                    ? current.filter(t => t !== team)
                                    : [...current, team];
                                  updatePreferences("favoriteTeams", updated);
                                }}
                              >
                                {team}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    📺 We'll show you live games, TV schedules, and where to watch your favorite teams alongside your TV shows and movies!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 8: Friend Invitations */}
          {currentStep === 8 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-teal-500" />
                  Invite friends (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  BingeBoard is more fun with friends! Invite them to join and see what they're watching.
                </p>
                
                <div className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Friend's email address"
                      value={friendEmail}
                      onChange={(e) => setFriendEmail(e.target.value)}
                      className="pl-10"
                      type="email"
                    />
                  </div>
                  
                  <Button 
                    onClick={() => {
                      if (friendEmail && friendEmail.includes('@')) {
                        sendFriendInvitation.mutate(friendEmail);
                      } else {
                        toast({
                          title: "Invalid email",
                          description: "Please enter a valid email address.",
                          variant: "destructive",
                        });
                      }
                    }}
                    disabled={sendFriendInvitation.isPending || !friendEmail}
                    className="w-full bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 hover:from-teal-400 hover:via-cyan-400 hover:to-blue-400"
                  >
                    {sendFriendInvitation.isPending ? (
                      "Sending..."
                    ) : (
                      <>
                        <Share2 className="w-4 h-4 mr-2" />
                        Send invitation link
                      </>
                    )}
                  </Button>
                </div>

                {/* Show sent invitations */}
                {invitationsSent.length > 0 && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">
                      Invitations sent to:
                    </p>
                    <ul className="text-sm text-green-600 dark:text-green-300 space-y-1">
                      {invitationsSent.map((email, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check className="w-3 h-3" />
                          {email}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Copy className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-700 dark:text-blue-400">Share your link:</p>
                    <p className="text-blue-600 dark:text-blue-300">joinbingeboard.com</p>
                  </div>
                </div>
                
                <div className="text-center">
                  <Button variant="ghost" onClick={handleNext}>
                    Skip for now
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 9: Viewing History Import */}
          {currentStep === 9 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-teal-500" />
                  Import your viewing history (optional)
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Upload your viewing data from streaming platforms to get 3x more accurate recommendations
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gradient-to-r from-teal-50 via-cyan-50 to-blue-50 dark:from-teal-900/20 dark:via-cyan-900/20 dark:to-blue-900/20 p-4 rounded-lg border border-teal-200 dark:border-teal-800">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-teal-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-teal-900 dark:text-teal-100">Get Better Recommendations</h4>
                      <p className="text-sm text-teal-700 dark:text-teal-300 mt-1">
                        Upload your viewing history from Netflix, Disney+, Hulu, or other platforms to instantly get personalized suggestions based on what you've already watched.
                      </p>
                    </div>
                  </div>
                </div>

                {/* File Upload Interface */}
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="platform-select">Select streaming platform</Label>
                    <Select value={importPlatform} onValueChange={setImportPlatform}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose platform..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="netflix">Netflix</SelectItem>
                        <SelectItem value="disney">Disney+</SelectItem>
                        <SelectItem value="hulu">Hulu</SelectItem>
                        <SelectItem value="prime">Prime Video</SelectItem>
                        <SelectItem value="hbo">HBO Max</SelectItem>
                        <SelectItem value="paramount">Paramount+</SelectItem>
                        <SelectItem value="peacock">Peacock</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="file-upload">Upload CSV or JSON file</Label>
                    <div className="mt-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.json"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {importFile ? importFile.name : "Choose file"}
                      </Button>
                    </div>
                  </div>

                  {importFile && importPlatform && (
                    <Button
                      onClick={handleImportFile}
                      disabled={isImporting}
                      className="w-full bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 hover:from-teal-400 hover:via-cyan-400 hover:to-blue-400"
                    >
                      {isImporting ? (
                        "Importing..."
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Import viewing history
                        </>
                      )}
                    </Button>
                  )}

                  {importResult && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      <p className="text-sm font-medium text-green-700 dark:text-green-400">
                        Import successful! Imported {importResult.imported} shows
                        {importResult.skipped > 0 && `, skipped ${importResult.skipped} entries`}.
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="text-center">
                  <Button variant="ghost" onClick={handleNext}>
                    {importResult ? "Continue" : "Skip for now"}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    You can always import your history later from Settings
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 10: Social Media Friend Connection */}
          {currentStep === 10 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-teal-500" />
                  Connect with friends from social media
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Connect your social media accounts to find friends who are already using BingeBoard
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gradient-to-r from-teal-50 via-cyan-50 to-blue-50 dark:from-teal-900/20 dark:via-cyan-900/20 dark:to-blue-900/20 p-4 rounded-lg border border-teal-200 dark:border-teal-800">
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-teal-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-teal-900 dark:text-teal-100">Find your friends</h4>
                      <p className="text-sm text-teal-700 dark:text-teal-300 mt-1">
                        Connect Facebook, Instagram, Snapchat, or TikTok to discover which of your friends are already using BingeBoard and see what they're watching.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Social Media Platform Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 flex items-center gap-3 border-blue-200 hover:bg-blue-50 hover:border-blue-300 hover:scale-105 transition-all duration-200 dark:border-blue-800 dark:hover:bg-blue-900/20 cursor-pointer active:scale-95"
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log("Facebook button clicked!");
                      
                      try {
                        const { signInWithPopup } = await import('firebase/auth');
                        const { auth, facebookProvider } = await import('@/firebase/config');
                        const result = await signInWithPopup(auth, facebookProvider);
                        
                        if (result.user) {
                          console.log('Facebook authentication successful');
                          window.location.reload(); // Refresh to update auth state
                        } else {
                          console.error('Facebook authentication failed:', result.error);
                        }
                      } catch (err: any) {
                        console.error('Facebook authentication error:', err.message);
                      }
                    }}
                  >
                    <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-sm font-bold shadow-sm">f</div>
                    <span className="font-medium">Connect Facebook</span>
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 flex items-center gap-3 border-pink-200 hover:bg-pink-50 hover:border-pink-300 hover:scale-105 transition-all duration-200 dark:border-pink-800 dark:hover:bg-pink-900/20 cursor-pointer active:scale-95"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log("Instagram button clicked!");
                      
                      const button = e.currentTarget;
                      button.classList.add('animate-pulse');
                      setTimeout(() => button.classList.remove('animate-pulse'), 600);
                      
                      // Redirect to Instagram OAuth
                      window.location.href = '/api/auth/instagram';
                    }}
                  >
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center text-white text-xs font-bold shadow-sm">IG</div>
                    <span className="font-medium">Connect Instagram</span>
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 flex items-center gap-3 border-yellow-200 hover:bg-yellow-50 hover:border-yellow-300 hover:scale-105 transition-all duration-200 dark:border-yellow-800 dark:hover:bg-yellow-900/20 cursor-pointer active:scale-95"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log("Snapchat button clicked!");
                      
                      const button = e.currentTarget;
                      button.classList.add('animate-pulse');
                      setTimeout(() => button.classList.remove('animate-pulse'), 600);
                      
                      // Redirect to Snapchat OAuth
                      window.location.href = '/api/auth/snapchat';
                    }}
                  >
                    <div className="w-6 h-6 bg-yellow-400 rounded flex items-center justify-center text-white text-lg shadow-sm">👻</div>
                    <span className="font-medium">Connect Snapchat</span>
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 flex items-center gap-3 border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:scale-105 transition-all duration-200 dark:border-slate-800 dark:hover:bg-slate-900/20 cursor-pointer active:scale-95"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log("TikTok button clicked!");
                      
                      const button = e.currentTarget;
                      button.classList.add('animate-pulse');
                      setTimeout(() => button.classList.remove('animate-pulse'), 600);
                      
                      // Redirect to TikTok OAuth
                      window.location.href = '/api/auth/tiktok';
                    }}
                  >
                    <div className="w-6 h-6 bg-black rounded flex items-center justify-center text-white text-xs font-bold shadow-sm">TT</div>
                    <span className="font-medium">Connect TikTok</span>
                  </Button>
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    You can also connect social media accounts later from your Friends page
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 11: Notification Preferences */}
          {currentStep === 11 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-teal-500" />
                  Notification preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries({
                  newReleases: "New episodes & seasons",
                  recommendations: "Personalized recommendations",
                  friendActivity: "Friend activity updates",
                  episodeReminders: "Episode reminders",
                  weeklyDigest: "Weekly digest email"
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label htmlFor={key} className="text-sm font-medium">
                      {label}
                    </Label>
                    <Switch
                      id={key}
                      checked={onboardingData.notifications[key as keyof typeof onboardingData.notifications]}
                      onCheckedChange={(checked) => updateNotifications(key, checked)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Step 12: Completion */}
          {currentStep === 12 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-teal-500" />
                  You're all set!
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="text-6xl">🎉</div>
                <h3 className="text-xl font-semibold">Welcome to BingeBoard!</h3>
                <p className="text-muted-foreground">
                  Your personalized dashboard is ready. Start discovering your next binge-worthy series!
                </p>
                <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
                  <div className="p-3 bg-teal-50 dark:bg-teal-950 rounded-lg">
                    <p className="font-medium">Smart Recommendations</p>
                    <p className="text-muted-foreground">AI-powered suggestions just for you</p>
                  </div>
                  <div className="p-3 bg-teal-50 dark:bg-teal-950 rounded-lg">
                    <p className="font-medium">Social Features</p>
                    <p className="text-muted-foreground">See what friends are watching</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6 border-t">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex gap-2">
            {currentStep < 11 && (
              <Button variant="ghost" onClick={handleSkip}>
                Skip
              </Button>
            )}
            
            {currentStep < 11 ? (
              <Button onClick={handleNext} className="flex items-center gap-2">
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleFinish}
                disabled={saveProfile.isPending || savePreferences.isPending || saveNotifications.isPending || completeOnboarding.isPending}
                className="flex items-center gap-2"
              >
                {(saveProfile.isPending || savePreferences.isPending || saveNotifications.isPending || completeOnboarding.isPending) ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Get Started
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}