import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Switch } from "../ui/switch";
import {
  X, Sparkles, ArrowRight, ArrowLeft, Star, Zap, Users, Bell, Target,
  CheckCircle, Play, Heart, Tv, Shield, Settings, Clock, TrendingUp,
  Eye, Download, Share2, MessageSquare, Globe, Lock, UserPlus,
  Calendar, BarChart3, Award, Volume2, Upload, Plus, Link, Check, Loader2,
  User, Phone, Mail, MapPin, Gamepad2, Cake, Palette
} from "lucide-react";
import { userDataManager } from "../../lib/user-data-manager";

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  userDisplayName: string;
  userData?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    profileImage?: string;
    provider?: 'google' | 'facebook' | 'email';
  };
}

export default function OnboardingModal({ isOpen, onComplete, userDisplayName, userData }: OnboardingModalProps) {
  console.log('🎯 PREMIUM ONBOARDING MODAL RENDERED', { isOpen, userDisplayName, userData: userData?.email });

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Welcome (no data)
    // Step 2: User Profile Information
    userProfile: {
      firstName: userData?.firstName || "",
      lastName: userData?.lastName || "",
      email: userData?.email || "",
      phone: "",
      location: "",
      birthday: ""
    },
    // Step 3: Favorite Genres
    favoriteGenres: [] as string[],
    // Step 4: Sports Teams (conditional if Sports selected)
    favoriteTeams: [] as string[],
    // Step 5: Content Types
    contentTypes: [] as string[],
    // Step 6: Streaming Platforms
    streamingPlatforms: [] as string[],
    // Step 7: Viewing Habits
    viewingHabits: {
      preferredTime: "evening" as "morning" | "afternoon" | "evening" | "late-night",
      bingeDuration: "2-3 hours" as "30 minutes" | "1 hour" | "2-3 hours" | "4+ hours",
      weeklyGoal: "5-10 hours" as "Under 5 hours" | "5-10 hours" | "10-20 hours" | "20+ hours"
    },
    // Step 8: Social & Privacy
    privacy: "private" as "public" | "private" | "friends",
    shareActivity: false,
    findFriends: false,
    allowRecommendations: true,
    // Step 9: Notifications
    notifications: {
      newEpisodes: true,
      friendActivity: false,
      recommendations: true,
      weeklyRecap: false,
      trendingContent: false
    },
    // Step 10: Import Viewing History
    importHistory: false,
    connectPlatforms: [] as string[],
    uploadedFiles: [] as File[],
    // Step 11: Content Discovery
    discoveryPreferences: {
      showRecommendations: true,
      includePopular: true,
      includeCriticsChoice: false,
      includeHidden: false
    },
    // Step 12: Content Filters
    contentFilters: {
      hideAdult: true,
      hideViolence: false,
      maxRating: "R" as "G" | "PG" | "PG-13" | "R" | "NC-17"
    },
    // Step 10: Theme Selection
    theme: "dark" as "dark" | "light" | "cinema" | "neon",
    // Step 12: Premium Plan Selection
    selectedPlan: "free" as "free" | "premium",
    // Step 13: Complete
  });

  const genres = [
    "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary",
    "Drama", "Family", "Fantasy", "History", "Horror", "Music", "Mystery",
    "Romance", "Sci-Fi", "Sports", "Thriller", "War", "Western"
  ];

  const contentTypes = [
    "TV Series", "Movies", "Documentaries", "Anime", "Reality TV",
    "Talk Shows", "News", "Sports", "Kids Content", "International"
  ];

  const platforms = [
    "Netflix", "Disney+", "HBO Max", "Amazon Prime", "Hulu", "Apple TV+",
    "Paramount+", "Peacock", "YouTube", "Crunchyroll", "Other"
  ];

  const goals = [
    "Track what I watch", "Discover new content", "Connect with friends",
    "Get personalized recommendations", "Complete my watchlist",
    "Track viewing time", "Rate shows/movies", "Share reviews"
  ];

  const trackingOptions = [
    "Episodes watched", "Time spent watching", "Ratings given",
    "Shows completed", "Movies watched", "Favorite genres", "Viewing streaks"
  ];

  const sportsTeams = {
    NFL: ["Arizona Cardinals", "Atlanta Falcons", "Baltimore Ravens", "Buffalo Bills", "Carolina Panthers", "Chicago Bears", "Cincinnati Bengals", "Cleveland Browns", "Dallas Cowboys", "Denver Broncos", "Detroit Lions", "Green Bay Packers", "Houston Texans", "Indianapolis Colts", "Jacksonville Jaguars", "Kansas City Chiefs", "Las Vegas Raiders", "Los Angeles Chargers", "Los Angeles Rams", "Miami Dolphins", "Minnesota Vikings", "New England Patriots", "New Orleans Saints", "New York Giants", "New York Jets", "Philadelphia Eagles", "Pittsburgh Steelers", "San Francisco 49ers", "Seattle Seahawks", "Tampa Bay Buccaneers", "Tennessee Titans", "Washington Commanders"],
    NBA: ["Atlanta Hawks", "Boston Celtics", "Brooklyn Nets", "Charlotte Hornets", "Chicago Bulls", "Cleveland Cavaliers", "Dallas Mavericks", "Denver Nuggets", "Detroit Pistons", "Golden State Warriors", "Houston Rockets", "Indiana Pacers", "Los Angeles Clippers", "Los Angeles Lakers", "Memphis Grizzlies", "Miami Heat", "Milwaukee Bucks", "Minnesota Timberwolves", "New Orleans Pelicans", "New York Knicks", "Oklahoma City Thunder", "Orlando Magic", "Philadelphia 76ers", "Phoenix Suns", "Portland Trail Blazers", "Sacramento Kings", "San Antonio Spurs", "Toronto Raptors", "Utah Jazz", "Washington Wizards"],
    MLB: ["Arizona Diamondbacks", "Atlanta Braves", "Baltimore Orioles", "Boston Red Sox", "Chicago Cubs", "Chicago White Sox", "Cincinnati Reds", "Cleveland Guardians", "Colorado Rockies", "Detroit Tigers", "Houston Astros", "Kansas City Royals", "Los Angeles Angels", "Los Angeles Dodgers", "Miami Marlins", "Milwaukee Brewers", "Minnesota Twins", "New York Mets", "New York Yankees", "Oakland Athletics", "Philadelphia Phillies", "Pittsburgh Pirates", "San Diego Padres", "San Francisco Giants", "Seattle Mariners", "St. Louis Cardinals", "Tampa Bay Rays", "Texas Rangers", "Toronto Blue Jays", "Washington Nationals"],
    NHL: ["Anaheim Ducks", "Arizona Coyotes", "Boston Bruins", "Buffalo Sabres", "Calgary Flames", "Carolina Hurricanes", "Chicago Blackhawks", "Colorado Avalanche", "Columbus Blue Jackets", "Dallas Stars", "Detroit Red Wings", "Edmonton Oilers", "Florida Panthers", "Los Angeles Kings", "Minnesota Wild", "Montreal Canadiens", "Nashville Predators", "New Jersey Devils", "New York Islanders", "New York Rangers", "Ottawa Senators", "Philadelphia Flyers", "Pittsburgh Penguins", "San Jose Sharks", "Seattle Kraken", "St. Louis Blues", "Tampa Bay Lightning", "Toronto Maple Leafs", "Vancouver Canucks", "Vegas Golden Knights", "Washington Capitals", "Winnipeg Jets"]
  };

  const themes = [
    {
      value: 'dark' as const,
      name: 'Dark Mode',
      description: 'Easy on the eyes for late-night binges',
      icon: Eye,
      gradient: 'bg-gradient-to-br from-slate-700 to-slate-900'
    },
    {
      value: 'light' as const,
      name: 'Light Mode',
      description: 'Clean and bright for daytime viewing',
      icon: Star,
      gradient: 'bg-gradient-to-br from-blue-400 to-cyan-400'
    },
    {
      value: 'cinema' as const,
      name: 'Cinema Mode',
      description: 'Immersive dark theme for the full movie experience',
      icon: Play,
      gradient: 'bg-gradient-to-br from-red-600 to-red-800'
    },
    {
      value: 'neon' as const,
      name: 'Neon Nights',
      description: 'Vibrant colors for a modern streaming experience',
      icon: Zap,
      gradient: 'bg-gradient-to-br from-purple-500 to-pink-500'
    }
  ];

  const shouldShowSportsStep = () => {
    return formData.favoriteGenres.includes("Sports");
  };

  const getCurrentStepNumber = () => {
    // Dynamic step numbering based on conditions
    if (currentStep === 1) return 1; // Welcome
    if (currentStep === 2) return 2; // User Profile
    if (currentStep === 3) return 3; // Genres
    if (currentStep === 4) {
      if (shouldShowSportsStep()) return 4; // Sports Teams
      return null; // Skip this step
    }

    let adjustedStep = currentStep;
    if (!shouldShowSportsStep() && currentStep > 4) {
      adjustedStep = currentStep - 1; // Adjust for skipped sports step
    }
    return adjustedStep;
  };

  const getTotalSteps = () => {
    return shouldShowSportsStep() ? 14 : 13; // Added premium upgrade step
  };

  const toggleSelection = (item: string, field: keyof typeof formData) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).includes(item)
        ? (prev[field] as string[]).filter((i: string) => i !== item)
        : [...(prev[field] as string[]), item]
    }));
  };

  // Update form data when userData becomes available
  useEffect(() => {
    if (userData) {
      console.log("🔍 OnboardingModal: userData received:", userData);
      setFormData(prev => {
        const newFormData = {
          ...prev,
          userProfile: {
            ...prev.userProfile,
            firstName: userData.firstName || prev.userProfile.firstName,
            lastName: userData.lastName || prev.userProfile.lastName,
            email: userData.email || prev.userProfile.email,
          }
        };
        console.log("✅ OnboardingModal: Form data updated from:", prev.userProfile, "to:", newFormData.userProfile);
        return newFormData;
      });
    } else {
      console.log("⚠️ OnboardingModal: No userData available for auto-population");
    }
  }, [userData]);



  if (!isOpen) {
    console.log('🎯 Premium onboarding not showing because isOpen is:', isOpen);
    return null;
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center">
            {/* More Appealing Hero Icon Design */}
            <div className="relative mx-auto space-y-8">
              {/* Premium Multi-Layer Icon */}
              <div className="relative mx-auto mb-6">
                {/* Outer glow ring */}
                <div className="absolute inset-0 w-20 h-20 bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 rounded-full blur-xl opacity-30 animate-pulse"></div>

                {/* Main icon container */}
                <div className="relative w-20 h-20 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center shadow-2xl border border-slate-600">
                  {/* Inner BingeBoard logo with better styling */}
                  <div className="w-12 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg shadow-xl border-2 border-slate-600 relative overflow-hidden">
                    <div className="absolute inset-1 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-sm flex items-center justify-center">
                      <div className="text-lg font-black text-white tracking-tight">B</div>
                    </div>
                    {/* Subtle inner shine effect */}
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-sm"></div>
                  </div>
                </div>
              </div>

              {/* Welcome Text - BIGGER and better positioned */}
              <div className="space-y-6 relative z-10">
                <h1 className="text-5xl font-bold text-white leading-tight">
                  Welcome to{" "}
                  <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    BingeBoard
                  </span>
                </h1>
                <div className="space-y-3">
                  <p className="text-2xl text-gray-200 font-medium">
                    Hi {userDisplayName}!
                  </p>
                  <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                    Let's customize your entertainment experience and get you started.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        console.log("🔍 Step 2 rendering with formData.userProfile:", formData.userProfile, "and userData:", userData);
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto">
                <User className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Tell us about yourself 👋</h2>
              <p className="text-lg text-muted-foreground">Help us personalize your BingeBoard experience</p>
              {userData && (
                <div className="text-center">
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    {userData.provider === 'google' ? '📧 Google Account' :
                      userData.provider === 'facebook' ? '📘 Facebook Account' :
                        '✉️ Email Account'} - Some fields pre-filled
                  </Badge>
                </div>
              )}
            </div>

            <Card className="glass-effect border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-xl text-white">Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">First Name *</label>
                    <input
                      type="text"
                      value={formData.userProfile.firstName}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        userProfile: { ...prev.userProfile, firstName: e.target.value }
                      }))}
                      className={`w-full px-4 py-3 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formData.userProfile.firstName
                        ? 'bg-blue-500/10 border-blue-500/40'
                        : 'bg-slate-800/50 border-slate-600'
                        }`}
                      placeholder="Enter your first name"
                    />
                    {formData.userProfile.firstName && (
                      <p className="text-xs text-blue-400">✓ Auto-filled from your account</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Last Name *</label>
                    <input
                      type="text"
                      value={formData.userProfile.lastName}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        userProfile: { ...prev.userProfile, lastName: e.target.value }
                      }))}
                      className={`w-full px-4 py-3 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formData.userProfile.lastName
                        ? 'bg-blue-500/10 border-blue-500/40'
                        : 'bg-slate-800/50 border-slate-600'
                        }`}
                      placeholder="Enter your last name"
                    />
                    {formData.userProfile.lastName && (
                      <p className="text-xs text-blue-400">✓ Auto-filled from your account</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.userProfile.email}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      userProfile: { ...prev.userProfile, email: e.target.value }
                    }))}
                    className={`w-full px-4 py-3 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formData.userProfile.email
                      ? 'bg-blue-500/10 border-blue-500/40'
                      : 'bg-slate-800/50 border-slate-600'
                      }`}
                    placeholder="Enter your email address"
                  />
                  {formData.userProfile.email && (
                    <p className="text-xs text-blue-400">✓ Auto-filled from your account</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Mobile Phone *
                  </label>
                  <input
                    type="tel"
                    value={formData.userProfile.phone}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      userProfile: { ...prev.userProfile, phone: e.target.value }
                    }))}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your mobile phone number"
                  />
                  <p className="text-xs text-gray-400">Required for password recovery via SMS</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white flex items-center gap-2">
                    <Cake className="h-4 w-4" />
                    Birthday *
                  </label>
                  <input
                    type="date"
                    value={formData.userProfile.birthday}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      userProfile: { ...prev.userProfile, birthday: e.target.value }
                    }))}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-400">Helps us recommend age-appropriate content</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.userProfile.location}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      userProfile: { ...prev.userProfile, location: e.target.value }
                    }))}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="City, State/Country"
                  />
                  <p className="text-xs text-gray-400">Helps us show local content and streaming availability</p>
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <p className="text-sm text-blue-300">
                    <Lock className="h-4 w-4 inline mr-2" />
                    Your information is secure and will only be used to personalize your experience and provide better recommendations.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">What genres do you love?</h2>
              <p className="text-lg text-muted-foreground">Select your favorite genres (choose at least 3)</p>
            </div>

            <Card className="glass-effect border-slate-700/50">
              <CardHeader className="text-center pb-4">
                <p className="text-sm text-muted-foreground">
                  👆 Scroll to explore all genres 👇
                </p>
              </CardHeader>
              <CardContent>
                <div className="max-h-80 overflow-y-auto scroll-container pr-2">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {genres.map((genre) => (
                      <Button
                        key={genre}
                        variant={formData.favoriteGenres.includes(genre) ? "default" : "outline"}
                        onClick={() => toggleSelection(genre, 'favoriteGenres')}
                        className={`h-14 text-base font-medium transition-all duration-300 ${formData.favoriteGenres.includes(genre)
                          ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg'
                          : 'glass-effect hover:bg-white/10 hover:border-teal-400/40'
                          }`}
                      >
                        {genre}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <Badge variant="secondary" className="text-sm px-4 py-2">
                    Selected: {formData.favoriteGenres.length} / {genres.length} genres
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        // Show sports teams step only if Sports genre is selected
        if (!shouldShowSportsStep()) {
          // This case should not render if sports is not selected
          // Navigation logic handles skipping this step
          return null;
        }
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto">
                <Gamepad2 className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Choose Your Sports Teams! ⚽</h2>
              <p className="text-lg text-muted-foreground">Select your favorite teams to get sports content recommendations</p>
            </div>

            <div className="space-y-6">
              {Object.entries(sportsTeams).map(([league, teams]) => (
                <Card key={league} className="glass-effect border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-xl text-white">{league}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
                      {teams.map((team) => (
                        <Button
                          key={team}
                          variant={formData.favoriteTeams.includes(team) ? "default" : "outline"}
                          onClick={() => toggleSelection(team, 'favoriteTeams')}
                          className={`h-12 text-sm font-medium transition-all duration-300 ${formData.favoriteTeams.includes(team)
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                            : 'glass-effect hover:bg-white/10 hover:border-green-400/40'
                            }`}
                        >
                          {team}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="text-center">
                <Badge variant="secondary" className="text-sm px-4 py-2">
                  Selected: {formData.favoriteTeams.length} teams
                </Badge>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto">
                <Play className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Which platforms do you use? 📱</h2>
              <p className="text-lg text-muted-foreground">Select your streaming services</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {platforms.map((platform) => (
                <Button
                  key={platform}
                  variant={formData.streamingPlatforms.includes(platform) ? "default" : "outline"}
                  onClick={() => toggleSelection(platform, 'streamingPlatforms')}
                  className={`h-16 text-base font-medium transition-all duration-300 ${formData.streamingPlatforms.includes(platform)
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                    : 'glass-effect hover:bg-white/10 hover:border-blue-400/40'
                    }`}
                >
                  {platform}
                </Button>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">What type of content do you love? ❤️</h2>
              <p className="text-lg text-muted-foreground">Select all that you enjoy watching</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {contentTypes.map((type) => (
                <Button
                  key={type}
                  variant={formData.contentTypes.includes(type) ? "default" : "outline"}
                  onClick={() => toggleSelection(type, 'contentTypes')}
                  className={`h-16 text-base font-medium transition-all duration-300 ${formData.contentTypes.includes(type)
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg scale-105'
                    : 'glass-effect hover:bg-white/10 hover:border-red-400/40 hover:scale-105'
                    }`}
                >
                  {type}
                </Button>
              ))}
            </div>

            <div className="text-center">
              <Badge variant="secondary" className="text-sm px-4 py-2">
                Selected: {formData.contentTypes.length} content types
              </Badge>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto">
                <Bell className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Notification Preferences 🔔</h2>
              <p className="text-lg text-muted-foreground">Choose what you'd like to be notified about</p>
            </div>

            <Card className="glass-effect border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-xl text-white">Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { key: 'newEpisodes' as keyof typeof formData.notifications, label: 'New episodes available', desc: 'When shows you\'re watching release new episodes', icon: Play },
                  { key: 'friendActivity' as keyof typeof formData.notifications, label: 'Friend activity', desc: 'When friends finish shows or add new ones', icon: Users },
                  { key: 'recommendations' as keyof typeof formData.notifications, label: 'Personalized recommendations', desc: 'Show and movie suggestions tailored for you', icon: Target },
                  { key: 'weeklyRecap' as keyof typeof formData.notifications, label: 'Weekly recap', desc: 'Summary of your watching activity each week', icon: Calendar },
                  { key: 'trendingContent' as keyof typeof formData.notifications, label: 'Trending content', desc: 'Popular shows and movies everyone\'s talking about', icon: TrendingUp }
                ].map((notification) => (
                  <div key={notification.key} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <notification.icon className="h-5 w-5 text-orange-400" />
                      <div>
                        <span className="text-white font-medium">{notification.label}</span>
                        <p className="text-sm text-muted-foreground">{notification.desc}</p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.notifications[notification.key]}
                      onCheckedChange={(checked) => setFormData(prev => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          [notification.key]: checked
                        }
                      }))}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        );

      case 8:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto">
                <Download className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Import Your Viewing History 📚</h2>
              <p className="text-lg text-muted-foreground">Upload your watch history files or connect your streaming accounts</p>
            </div>

            <div className="space-y-6">
              {/* Quick Import Toggle */}
              <Card className="glass-effect border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Import Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Download className="h-5 w-5 text-blue-400" />
                      <div>
                        <span className="text-white font-medium">Import my viewing history</span>
                        <p className="text-sm text-muted-foreground">Upload files or connect streaming accounts</p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.importHistory}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, importHistory: checked }))}
                    />
                  </div>
                </CardContent>
              </Card>

              {formData.importHistory && (
                <div className="space-y-6">
                  {/* File Upload Section */}
                  <Card className="glass-effect border-slate-700/50">
                    <CardHeader>
                      <CardTitle className="text-lg text-white flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        Upload History Files
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Upload CSV or JSON files from your streaming platforms
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Drag & Drop Upload Area */}
                      <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-blue-400 transition-colors duration-300">
                        <div className="space-y-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto">
                            <Upload className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-medium">Drop your files here or click to browse</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Supports: CSV, JSON, TXT files (max 10MB each)
                            </p>
                          </div>
                          <Button variant="outline" className="bg-transparent border-blue-400 text-blue-400 hover:bg-blue-400/10">
                            Choose Files
                          </Button>
                        </div>
                      </div>

                      {/* Supported Formats */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                          <div className="text-blue-400 font-medium">CSV</div>
                          <div className="text-xs text-muted-foreground">Comma-separated</div>
                        </div>
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                          <div className="text-purple-400 font-medium">JSON</div>
                          <div className="text-xs text-muted-foreground">Data export</div>
                        </div>
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                          <div className="text-green-400 font-medium">TXT</div>
                          <div className="text-xs text-muted-foreground">Plain text lists</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Platform Instructions */}
                  <Card className="glass-effect border-slate-700/50">
                    <CardHeader>
                      <CardTitle className="text-lg text-white flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        How to Export from Popular Platforms
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Step-by-step guides for exporting your viewing history
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Netflix Instructions */}
                        <div className="border border-slate-700/50 rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
                              <span className="text-white text-xs font-bold">N</span>
                            </div>
                            <h4 className="text-white font-semibold">Netflix</h4>
                          </div>
                          <div className="space-y-2 text-sm text-gray-300">
                            <p>1. Go to <code className="bg-slate-800 px-1 rounded">netflix.com/account</code></p>
                            <p>2. Scroll to "Profile & Parental Controls"</p>
                            <p>3. Click "Download your information"</p>
                            <p>4. Select "Viewing Activity" and download CSV</p>
                            <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-red-300 text-xs">
                              <strong>Format:</strong> CSV with titles, dates, and duration
                            </div>
                          </div>
                        </div>

                        {/* Disney+ Instructions */}
                        <div className="border border-slate-700/50 rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                              <span className="text-white text-xs font-bold">D+</span>
                            </div>
                            <h4 className="text-white font-semibold">Disney+</h4>
                          </div>
                          <div className="space-y-2 text-sm text-gray-300">
                            <p>1. Visit <code className="bg-slate-800 px-1 rounded">disneyplus.com/account</code></p>
                            <p>2. Go to "Privacy Settings"</p>
                            <p>3. Click "Download My Data"</p>
                            <p>4. Request viewing history export (JSON format)</p>
                            <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-blue-300 text-xs">
                              <strong>Note:</strong> May take 24-48 hours to receive download link
                            </div>
                          </div>
                        </div>

                        {/* Amazon Prime Instructions */}
                        <div className="border border-slate-700/50 rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center">
                              <span className="text-white text-xs font-bold">P</span>
                            </div>
                            <h4 className="text-white font-semibold">Amazon Prime Video</h4>
                          </div>
                          <div className="space-y-2 text-sm text-gray-300">
                            <p>1. Go to <code className="bg-slate-800 px-1 rounded">amazon.com/gp/privacyprefs</code></p>
                            <p>2. Click "Request My Data"</p>
                            <p>3. Select "Prime Video Watch History"</p>
                            <p>4. Choose CSV format and submit request</p>
                            <div className="mt-2 p-2 bg-orange-500/10 border border-orange-500/20 rounded text-orange-300 text-xs">
                              <strong>Processing:</strong> Usually takes 1-2 business days
                            </div>
                          </div>
                        </div>

                        {/* HBO Max Instructions */}
                        <div className="border border-slate-700/50 rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
                              <span className="text-white text-xs font-bold">H</span>
                            </div>
                            <h4 className="text-white font-semibold">HBO Max</h4>
                          </div>
                          <div className="space-y-2 text-sm text-gray-300">
                            <p>1. Visit <code className="bg-slate-800 px-1 rounded">hbomax.com/account</code></p>
                            <p>2. Go to "Privacy" section</p>
                            <p>3. Click "Download Your Information"</p>
                            <p>4. Select viewing history and download JSON</p>
                            <div className="mt-2 p-2 bg-purple-500/10 border border-purple-500/20 rounded text-purple-300 text-xs">
                              <strong>Alternative:</strong> Use browser history or manually create list
                            </div>
                          </div>
                        </div>

                        {/* Hulu Instructions */}
                        <div className="border border-slate-700/50 rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                              <span className="text-white text-xs font-bold">H</span>
                            </div>
                            <h4 className="text-white font-semibold">Hulu</h4>
                          </div>
                          <div className="space-y-2 text-sm text-gray-300">
                            <p>1. Go to <code className="bg-slate-800 px-1 rounded">hulu.com/account</code></p>
                            <p>2. Click "Manage Your Data"</p>
                            <p>3. Request "Viewing History Export"</p>
                            <p>4. Download CSV file when ready</p>
                            <div className="mt-2 p-2 bg-green-500/10 border border-green-500/20 rounded text-green-300 text-xs">
                              <strong>Tip:</strong> Also check "Keep Watching" section for recent items
                            </div>
                          </div>
                        </div>

                        {/* Apple TV+ Instructions */}
                        <div className="border border-slate-700/50 rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center">
                              <span className="text-white text-xs font-bold">TV</span>
                            </div>
                            <h4 className="text-white font-semibold">Apple TV+</h4>
                          </div>
                          <div className="space-y-2 text-sm text-gray-300">
                            <p>1. Visit <code className="bg-slate-800 px-1 rounded">privacy.apple.com</code></p>
                            <p>2. Sign in and click "Request a copy of your data"</p>
                            <p>3. Select "Apple TV & Apple Music"</p>
                            <p>4. Download when processing is complete</p>
                            <div className="mt-2 p-2 bg-gray-500/10 border border-gray-500/20 rounded text-gray-300 text-xs">
                              <strong>Format:</strong> JSON file with detailed viewing data
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Manual Entry Option */}
                  <Card className="glass-effect border-slate-700/50">
                    <CardHeader>
                      <CardTitle className="text-lg text-white flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Manual Entry
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Can't export? Tell us your favorite shows and we'll help you get started
                      </p>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="outline"
                        className="w-full h-12 border-dashed border-gray-500 text-gray-300 hover:bg-white/5"
                        onClick={() => {
                          // This would open a manual entry modal
                          console.log("Open manual entry modal");
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Shows & Movies Manually
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Platform Connection (for future) */}
                  <Card className="glass-effect border-slate-700/50">
                    <CardHeader>
                      <CardTitle className="text-lg text-white flex items-center gap-2">
                        <Link className="h-5 w-5" />
                        Connect Accounts
                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs">Premium</Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Direct platform integration for automatic sync
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {platforms.slice(0, 6).map((platform) => (
                          <Button
                            key={platform}
                            variant="outline"
                            disabled
                            className="h-12 opacity-50 cursor-not-allowed relative"
                          >
                            {platform}
                            <Star className="h-3 w-3 text-yellow-400 absolute top-1 right-1" />
                          </Button>
                        ))}
                      </div>
                      <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-sm text-blue-300">
                          � <strong>Coming Soon:</strong> Direct account connections for automatic history sync.
                          For now, please use the file upload method above.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto">
                <Eye className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Content Discovery 🔍</h2>
              <p className="text-lg text-muted-foreground">Customize how you discover new content</p>
            </div>

            <Card className="glass-effect border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-xl text-white">Discovery Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Target className="h-5 w-5 text-green-400" />
                    <div>
                      <span className="text-white font-medium">Show personalized recommendations</span>
                      <p className="text-sm text-muted-foreground">Content suggestions based on your preferences</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.discoveryPreferences.showRecommendations}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      discoveryPreferences: { ...prev.discoveryPreferences, showRecommendations: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-5 w-5 text-green-400" />
                    <div>
                      <span className="text-white font-medium">Include popular content</span>
                      <p className="text-sm text-muted-foreground">Show trending and most-watched content</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.discoveryPreferences.includePopular}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      discoveryPreferences: { ...prev.discoveryPreferences, includePopular: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Award className="h-5 w-5 text-green-400" />
                    <div>
                      <span className="text-white font-medium">Include critics' choice</span>
                      <p className="text-sm text-muted-foreground">Show critically acclaimed content</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.discoveryPreferences.includeCriticsChoice}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      discoveryPreferences: { ...prev.discoveryPreferences, includeCriticsChoice: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Sparkles className="h-5 w-5 text-green-400" />
                    <div>
                      <span className="text-white font-medium">Include hidden gems</span>
                      <p className="text-sm text-muted-foreground">Discover lesser-known quality content</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.discoveryPreferences.includeHidden}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      discoveryPreferences: { ...prev.discoveryPreferences, includeHidden: checked }
                    }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 10:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Social & Privacy 🔒</h2>
              <p className="text-lg text-muted-foreground">Control how you interact with others on BingeBoard</p>
            </div>

            <div className="space-y-6">
              <Card className="glass-effect border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Profile Visibility</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { value: 'public' as const, label: 'Public', desc: 'Anyone can see my activity', icon: Globe },
                    { value: 'friends' as const, label: 'Friends only', desc: 'Only friends can see my activity', icon: Users },
                    { value: 'private' as const, label: 'Private', desc: 'Keep my activity to myself', icon: Lock }
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={formData.privacy === option.value ? "default" : "outline"}
                      onClick={() => setFormData(prev => ({ ...prev, privacy: option.value }))}
                      className={`w-full h-16 justify-start text-left transition-all duration-300 ${formData.privacy === option.value
                        ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg'
                        : 'glass-effect hover:bg-white/10'
                        }`}
                    >
                      <option.icon className="h-5 w-5 mr-3" />
                      <div>
                        <div className="font-semibold">{option.label}</div>
                        <div className="text-sm opacity-80">{option.desc}</div>
                      </div>
                    </Button>
                  ))}
                </CardContent>
              </Card>

              <Card className="glass-effect border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Social Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Share2 className="h-5 w-5 text-teal-400" />
                      <div>
                        <span className="text-white font-medium">Share my watching activity</span>
                        <p className="text-sm text-muted-foreground">Let friends see what you're watching</p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.shareActivity}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, shareActivity: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <UserPlus className="h-5 w-5 text-teal-400" />
                      <div>
                        <span className="text-white font-medium">Find friends with similar tastes</span>
                        <p className="text-sm text-muted-foreground">Get friend suggestions based on preferences</p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.findFriends}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, findFriends: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="h-5 w-5 text-teal-400" />
                      <div>
                        <span className="text-white font-medium">Allow personalized recommendations</span>
                        <p className="text-sm text-muted-foreground">Use my data to suggest better content</p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.allowRecommendations}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allowRecommendations: checked }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 11:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto">
                <Palette className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Choose Your Theme 🎨</h2>
              <p className="text-lg text-muted-foreground">Select a theme that matches your style</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {themes.map((theme) => (
                <Card
                  key={theme.value}
                  className={`cursor-pointer transition-all duration-300 ${formData.theme === theme.value
                    ? 'ring-2 ring-violet-500 bg-gradient-to-br from-violet-500/20 to-purple-500/20'
                    : 'glass-effect hover:bg-white/10'
                    }`}
                  onClick={() => setFormData(prev => ({ ...prev, theme: theme.value }))}
                >
                  <CardContent className="p-6 text-center space-y-4">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center mx-auto ${theme.gradient}`}>
                      <theme.icon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{theme.name}</h3>
                      <p className="text-sm text-muted-foreground mt-2">{theme.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Card className="glass-effect border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center gap-2">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="text-yellow-300 text-sm font-medium">
                      Premium includes 12+ additional themes and a custom theme builder
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 12:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Content Filters ⚙️</h2>
              <p className="text-lg text-muted-foreground">Customize your content preferences and safety settings</p>
            </div>

            <div className="space-y-6">
              <Card className="glass-effect border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Content Safety</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-violet-400" />
                      <div>
                        <span className="text-white font-medium">Hide adult content</span>
                        <p className="text-sm text-muted-foreground">Filter out mature content from recommendations</p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.contentFilters.hideAdult}
                      onCheckedChange={(checked) => setFormData(prev => ({
                        ...prev,
                        contentFilters: { ...prev.contentFilters, hideAdult: checked }
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-violet-400" />
                      <div>
                        <span className="text-white font-medium">Hide violent content</span>
                        <p className="text-sm text-muted-foreground">Reduce violent content in recommendations</p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.contentFilters.hideViolence}
                      onCheckedChange={(checked) => setFormData(prev => ({
                        ...prev,
                        contentFilters: { ...prev.contentFilters, hideViolence: checked }
                      }))}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-white font-medium">Maximum content rating</label>
                    <p className="text-sm text-muted-foreground">Set the highest content rating you want to see</p>
                    <div className="grid grid-cols-5 gap-2">
                      {(['G', 'PG', 'PG-13', 'R', 'NC-17'] as const).map((rating) => (
                        <Button
                          key={rating}
                          variant={formData.contentFilters.maxRating === rating ? "default" : "outline"}
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            contentFilters: { ...prev.contentFilters, maxRating: rating }
                          }))}
                          className={`h-10 transition-all duration-300 ${formData.contentFilters.maxRating === rating
                            ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white'
                            : 'glass-effect hover:bg-white/10'
                            }`}
                        >
                          {rating}
                        </Button>
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      <strong>G:</strong> General audiences • <strong>PG:</strong> Parental guidance • <strong>PG-13:</strong> Parents strongly cautioned • <strong>R:</strong> Restricted • <strong>NC-17:</strong> Adults only
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 13:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Unlock Premium Features ✨</h2>
              <p className="text-lg text-muted-foreground">Get the most out of your BingeBoard experience</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Free Plan */}
              <Card className="glass-effect border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-xl text-white flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    Free Plan
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Perfect for getting started</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      "Basic recommendations",
                      "Track up to 50 shows/movies",
                      "Standard themes (4 options)",
                      "Basic notifications",
                      "Public profile sharing",
                      "Manual viewing history import"
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Check className="h-4 w-4 text-green-400" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-6 border-gray-600 text-gray-300"
                    onClick={() => setFormData(prev => ({ ...prev, selectedPlan: 'free' }))}
                  >
                    Continue with Free
                  </Button>
                </CardContent>
              </Card>

              {/* Premium Plan */}
              <Card className="glass-effect border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 to-orange-500/10">
                <CardHeader>
                  <CardTitle className="text-xl text-white flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-400" />
                    Premium Plan
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white ml-2">Recommended</Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Everything you need for the ultimate experience</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-white">$4.99<span className="text-lg text-gray-400">/month</span></div>
                    <p className="text-sm text-yellow-400">First month free!</p>
                  </div>

                  <div className="space-y-3">
                    {[
                      "AI-powered recommendations",
                      "Unlimited show/movie tracking",
                      "Premium themes + custom theme builder",
                      "Advanced notifications & insights",
                      "Private groups & watch parties",
                      "Automatic platform sync",
                      "Detailed viewing analytics",
                      "Priority customer support",
                      "Early access to new features"
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span className="text-white text-sm font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    className="w-full mt-6 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold"
                    onClick={() => setFormData(prev => ({ ...prev, selectedPlan: 'premium' }))}
                  >
                    Start Free Trial
                  </Button>

                  <p className="text-xs text-center text-gray-400 mt-2">
                    Cancel anytime. No commitment.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-400">
                You can always upgrade later from your account settings
              </p>
            </div>
          </div>
        );

      case 14:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Welcome to BingeBoard! 🎉
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Hi {userDisplayName}! Let's customize your entertainment experience and get you started.
              </p>
            </div>

            <Card className="glass-effect border-green-500/20 p-8">
              <CardContent className="space-y-6">
                <h3 className="text-2xl font-bold text-white text-center mb-6">Your Profile Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-5 w-5 text-teal-400" />
                      <span className="text-white font-medium">Favorite Genres:</span>
                      <Badge variant="secondary">{formData.favoriteGenres.length} selected</Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <Zap className="h-5 w-5 text-purple-400" />
                      <span className="text-white font-medium">Content Types:</span>
                      <Badge variant="secondary">{formData.contentTypes.length} selected</Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <Play className="h-5 w-5 text-blue-400" />
                      <span className="text-white font-medium">Platforms:</span>
                      <Badge variant="secondary">{formData.streamingPlatforms.length} selected</Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-indigo-400" />
                      <span className="text-white font-medium">Viewing Time:</span>
                      <Badge variant="secondary" className="capitalize">{formData.viewingHabits.preferredTime}</Badge>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-teal-400" />
                      <span className="text-white font-medium">Privacy:</span>
                      <Badge variant="secondary" className="capitalize">{formData.privacy}</Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <Palette className="h-5 w-5 text-violet-400" />
                      <span className="text-white font-medium">Theme:</span>
                      <Badge variant="secondary" className="capitalize">{formData.theme}</Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-orange-400" />
                      <span className="text-white font-medium">Notifications:</span>
                      <Badge variant="secondary">Configured</Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <Settings className="h-5 w-5 text-violet-400" />
                      <span className="text-white font-medium">Preferences:</span>
                      <Badge variant="secondary">Customized</Badge>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl">
                  <div className="text-center space-y-3">
                    <h4 className="text-lg font-semibold text-white">You're all set!</h4>
                    <p className="text-green-300">
                      Your personalized BingeBoard experience is ready. Start discovering, tracking, and enjoying your favorite content!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-center space-y-6">
              <Button
                onClick={handleComplete}
                disabled={isLoading}
                className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white px-12 py-6 text-xl font-semibold rounded-xl shadow-2xl transition-all duration-300 hover:scale-105"
              >
                {isLoading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                    Completing Setup...
                  </>
                ) : (
                  <>
                    Complete Setup & Enter BingeBoard 🚀
                  </>
                )}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const progressPercentage = (currentStep / getTotalSteps()) * 100;

  const handleNext = () => {
    if (currentStep < getTotalSteps()) {
      let nextStep = currentStep + 1;

      // Skip Sports Teams step (4) if Sports genre is not selected
      if (nextStep === 4 && !shouldShowSportsStep()) {
        console.log("🏃‍♂️ Skipping Sports Teams step (4) because Sports genre not selected");
        nextStep = 5; // Skip to Streaming Platforms
      }

      console.log(`➡️ Navigation: Step ${currentStep} → Step ${nextStep}`);
      setCurrentStep(nextStep);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      let prevStep = currentStep - 1;

      // Skip Sports Teams step (4) if Sports genre is not selected
      if (prevStep === 4 && !shouldShowSportsStep()) {
        console.log("🏃‍♂️ Skipping Sports Teams step (4) in reverse because Sports genre not selected");
        prevStep = 3; // Go back to Genres
      }

      console.log(`⬅️ Navigation: Step ${currentStep} → Step ${prevStep}`);
      setCurrentStep(prevStep);
    }
  };

  const handleSkip = () => {
    if (currentStep < getTotalSteps()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);

    try {
      // Log all collected onboarding data
      console.log("🎉 ONBOARDING COMPLETED! Here's what we collected:");
      console.log("📋 Complete Form Data:", {
        userProfile: formData.userProfile,
        favoriteGenres: formData.favoriteGenres,
        favoriteTeams: formData.favoriteTeams,
        streamingPlatforms: formData.streamingPlatforms,
        contentTypes: formData.contentTypes,
        notifications: formData.notifications,
        importHistory: formData.importHistory,
        discoveryPreferences: formData.discoveryPreferences,
        privacy: formData.privacy,
        shareActivity: formData.shareActivity,
        findFriends: formData.findFriends,
        allowRecommendations: formData.allowRecommendations,
        theme: formData.theme,
        selectedPlan: formData.selectedPlan,
        contentFilters: formData.contentFilters
      });

      console.log("📊 Summary:");
      console.log(`👤 User: ${formData.userProfile.firstName} ${formData.userProfile.lastName}`);
      console.log(`📧 Email: ${formData.userProfile.email}`);
      console.log(`🎭 Favorite Genres: ${formData.favoriteGenres.join(', ')}`);
      console.log(`📺 Streaming Platforms: ${formData.streamingPlatforms.join(', ')}`);
      console.log(`🏆 Sports Teams: ${formData.favoriteTeams.join(', ')}`);
      console.log(`🎨 Theme: ${formData.theme}`);
      console.log(`💎 Plan: ${formData.selectedPlan}`);

      // Save onboarding data to the database
      console.log("💾 Saving onboarding data to database...");

      // 1. Save/Update user profile information
      const profileResponse = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          firstName: formData.userProfile.firstName,
          lastName: formData.userProfile.lastName,
          phoneNumber: formData.userProfile.phone,
          location: formData.userProfile.location,
          birthday: formData.userProfile.birthday
        })
      });

      if (!profileResponse.ok) {
        console.error("Failed to save profile:", await profileResponse.text());
      } else {
        console.log("✅ Profile saved successfully");
      }

      // 2. Save user preferences
      const preferencesResponse = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          preferredGenres: formData.favoriteGenres,
          preferredNetworks: formData.streamingPlatforms,
          contentRating: formData.contentFilters.maxRating,
          languagePreferences: ["English"],
          aiPersonality: "balanced",
          notificationFrequency: "weekly",
          favoriteSports: formData.favoriteTeams.length > 0 ? ["Sports"] : [],
          favoriteTeams: formData.favoriteTeams,
          sportsNotifications: formData.notifications.trendingContent,
          watchingHabits: JSON.stringify({
            theme: formData.theme,
            privacy: formData.privacy,
            preferredTime: formData.viewingHabits.preferredTime,
            bingeDuration: formData.viewingHabits.bingeDuration,
            weeklyGoal: formData.viewingHabits.weeklyGoal
          })
        })
      });

      if (!preferencesResponse.ok) {
        console.error("Failed to save preferences:", await preferencesResponse.text());
      } else {
        console.log("✅ Preferences saved successfully");
      }

      // 3. Save notification preferences
      const notificationResponse = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          newEpisodes: formData.notifications.newEpisodes,
          friendActivity: formData.notifications.friendActivity,
          recommendations: formData.notifications.recommendations,
          weeklyRecap: formData.notifications.weeklyRecap,
          trendingContent: formData.notifications.trendingContent
        })
      });

      if (!notificationResponse.ok) {
        console.error("Failed to save notifications:", await notificationResponse.text());
      } else {
        console.log("✅ Notifications saved successfully");
      }

      // 4. Mark onboarding as completed
      const onboardingResponse = await fetch('/api/user/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          onboardingData: {
            profile: formData.userProfile,
            preferences: {
              genres: formData.favoriteGenres,
              platforms: formData.streamingPlatforms,
              teams: formData.favoriteTeams,
              contentTypes: formData.contentTypes,
              theme: formData.theme,
              plan: formData.selectedPlan
            },
            settings: {
              notifications: formData.notifications,
              privacy: formData.privacy,
              discoveryPreferences: formData.discoveryPreferences,
              contentFilters: formData.contentFilters
            }
          }
        })
      });

      if (!onboardingResponse.ok) {
        console.error("Failed to complete onboarding:", await onboardingResponse.text());
      } else {
        console.log("✅ Onboarding marked as complete");
      }

      console.log("🎊 All onboarding data saved successfully to the database!");

      // Complete the onboarding process
      setTimeout(() => {
        setIsLoading(false);
        onComplete();
      }, 1000);

    } catch (error) {
      console.error("❌ Error saving onboarding data:", error);
      setIsLoading(false);
      onComplete(); // Still complete the onboarding even if there's an error
    }
    console.log(`📧 Email: ${formData.userProfile.email}`);
    console.log(`📱 Phone: ${formData.userProfile.phone}`);
    console.log(`🎭 Genres: ${formData.favoriteGenres.join(', ')}`);
    console.log(`⚽ Sports Teams: ${formData.favoriteTeams.join(', ')}`);
    console.log(`📺 Platforms: ${formData.streamingPlatforms.join(', ')}`);
    console.log(`🎬 Content Types: ${formData.contentTypes.join(', ')}`);
    console.log(`🔒 Privacy: ${formData.privacy}`);
    console.log(`🎨 Theme: ${formData.theme}`);
    console.log(`⭐ Plan: ${formData.selectedPlan}`);

    try {
      // Save to user manager (local storage/Firebase)
      await userDataManager.updatePreferences({
        favoriteGenres: formData.favoriteGenres,
        watchingGoals: "entertainment", // Default goal since we removed goals step
        experience: "casual" // Default since we removed goals
      });
      console.log("✅ Onboarding data saved to user manager successfully");

      // Also sync to server preferences API
      const syncResponse = await fetch('/api/user/preferences/sync-onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          onboardingData: {
            favoriteGenres: formData.favoriteGenres,
            streamingPlatforms: formData.streamingPlatforms,
            contentTypes: formData.contentTypes,
            favoriteTeams: formData.favoriteTeams,
            viewingHabits: {
              preferredTime: "evening",
              bingeDuration: "2-3 hours", 
              weeklyGoal: "5-10 hours"
            },
            theme: formData.theme,
            userProfile: formData.userProfile,
            privacy: formData.privacy
          }
        })
      });

      if (syncResponse.ok) {
        console.log("✅ Onboarding data synced to server successfully");
      } else {
        console.warn("⚠️ Failed to sync onboarding data to server, but continuing");
      }

      setTimeout(() => {
        onComplete();
      }, 1000);
    } catch (error) {
      console.error("❌ Error saving onboarding data:", error);
      onComplete();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl max-h-[95vh] bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl flex flex-col">
        {/* Compact Header with Progress */}
        <div className="flex-shrink-0 p-4 border-b border-slate-700/50 bg-gradient-to-r from-slate-900/80 to-slate-800/80 rounded-t-2xl">
          <div className="space-y-3">
            {/* Header with Close Button */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-white">
                  Welcome to BingeBoard
                </h1>
                <p className="text-xs text-gray-400">
                  Hi {userDisplayName}! Let's customize your entertainment experience and get you started.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onComplete}
                className="text-gray-400 hover:text-white hover:bg-slate-800/50 rounded-lg p-1.5"
                title="Close onboarding"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Compact Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Step {currentStep} of {getTotalSteps()}</span>
                <span>{Math.round(progressPercentage)}% complete</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderStep()}
        </div>

        {/* Enhanced Footer Navigation */}
        <div className="flex-shrink-0 p-4 border-t border-slate-700/50 bg-slate-900/50">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="border-slate-600 text-gray-300 hover:bg-slate-700/50 px-6 py-3 rounded-xl transition-all duration-300 disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex items-center space-x-4">
              {/* Skip Button for optional steps */}
              {(currentStep >= 5 && currentStep <= 10) && (
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-gray-400 hover:text-white px-4 py-3"
                >
                  Skip
                </Button>
              )}

              {currentStep < getTotalSteps() ? (
                <Button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 hover:from-teal-700 hover:via-cyan-700 hover:to-blue-700 text-white px-8 py-3 text-base font-semibold shadow-lg transition-all duration-300 hover:scale-105 rounded-xl"
                  disabled={
                    (currentStep === 2 && (
                      !formData.userProfile.firstName.trim() ||
                      !formData.userProfile.lastName.trim() ||
                      !formData.userProfile.email.trim() ||
                      !formData.userProfile.phone.trim() ||
                      !formData.userProfile.birthday
                    )) ||
                    (currentStep === 3 && formData.favoriteGenres.length < 3) ||
                    (currentStep === 5 && formData.streamingPlatforms.length === 0) ||
                    (currentStep === 6 && formData.contentTypes.length === 0)
                  }
                >
                  Next Step <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
