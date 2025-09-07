import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { auth } from "../firebase/config";
import { signOut } from "firebase/auth";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { userDataManager, UserData } from "../lib/user-data-manager";
import OnboardingModal from "../components/onboarding/OnboardingModal-Premium";
import {
  Play,
  Clock,
  Users,
  Star,
  Calendar,
  ChevronRight,
  Plus,
  TrendingUp,
  Eye,
  BookOpen,
  Search,
  Bell,
  Settings,
  Grid3X3,
  List,
  Film,
  Tv,
  Heart,
  BarChart3,
  Home,
  Compass,
  UserCircle,
  Menu,
  Sparkles
} from "lucide-react";
import EnhancedFilterSystem from "../components/common/EnhancedFilterSystem";
import CollectionManager from "../components/common/CollectionManager";
import ABTestingDashboard from "../components/ab-testing/ABTestingDashboard";

export default function WorkingDashboard() {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Helper function to check if user needs onboarding
  const needsOnboarding = (userData: UserData | null): boolean => {
    if (!userData) return true;

    // Check if user has completed basic onboarding
    const hasPreferences = userData.preferences.favoriteGenres.length > 0 ||
      userData.preferences.watchingGoals !== '' ||
      userData.preferences.experience !== '';

    return !hasPreferences;
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);

      if (user) {
        try {
          // Initialize user data manager
          await userDataManager.initialize();

          // Load user data
          const data = await userDataManager.getCurrentUser();
          setUserData(data);

          if (!data) {
            // Create user data if doesn't exist
            console.log("Creating new user profile...");
            const newUserData = await userDataManager.createUserFromFirebase(user);
            setUserData(newUserData);

            // Show onboarding for new users
            setShowOnboarding(true);
          } else if (needsOnboarding(data)) {
            // Show onboarding for existing users who haven't completed it
            console.log("User needs onboarding...");
            setShowOnboarding(true);
          }
        } catch (error) {
          console.error("Error loading user data:", error);
        }
      } else {
        setUserData(null);
        userDataManager.clearCurrentUser();
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);

    // Reload user data after onboarding
    try {
      const updatedData = await userDataManager.getCurrentUser();
      setUserData(updatedData);
      console.log("✅ User data refreshed after onboarding");
    } catch (error) {
      console.error("❌ Error refreshing user data:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-xl font-medium animate-pulse">Loading your dashboard...</div>
          <div className="text-gray-400 text-sm mt-2">Preparing your entertainment hub</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl mb-4">Please log in to access your dashboard</h1>
          <Link href="/login">
            <Button>Go to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pb-16 md:pb-0">
      {/* Top Navigation Banner */}
      <header className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <Link href="/">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-8 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg shadow-xl border-2 border-slate-600 relative">
                  <div className="absolute inset-1 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-sm flex items-center justify-center">
                    <div className="text-sm font-black text-white">B</div>
                  </div>
                </div>
                <span className="text-xl font-bold text-white">
                  <span className="font-black">Binge</span>
                  <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent font-light">Board</span>
                </span>
              </div>
            </Link>

            {/* Main Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/dashboard">
                <div className="flex items-center space-x-2 text-teal-400 hover:text-teal-300 transition-colors">
                  <Home className="h-4 w-4" />
                  <span className="font-medium">Home</span>
                </div>
              </Link>
              <Link href="/discover">
                <div className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                  <Compass className="h-4 w-4" />
                  <span className="font-medium">Discover</span>
                </div>
              </Link>
              <Link href="/watchlist">
                <div className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                  <List className="h-4 w-4" />
                  <span className="font-medium">My Lists</span>
                </div>
              </Link>
              <Link href="/social">
                <div className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">Social</span>
                </div>
              </Link>
              <Link href="/ab-testing">
                <div className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                  <BarChart3 className="h-4 w-4" />
                  <span className="font-medium">A/B Testing</span>
                </div>
              </Link>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                <Search className="h-4 w-4" />
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative text-gray-300 hover:text-white">
                <Bell className="h-4 w-4" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 text-xs bg-red-500 text-white">
                  3
                </Badge>
              </Button>

              {/* User Profile */}
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photoURL || ""} />
                  <AvatarFallback className="bg-teal-600 text-white text-sm">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:block">
                  <div className="text-sm font-medium text-white">
                    {user.displayName || "User"}
                  </div>
                  <div className="text-xs text-gray-400">
                    {user.email}
                  </div>
                </div>
              </div>

              {/* Settings & Sign Out */}
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 animate-fade-in-up">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Welcome Card */}
          <Card className="glass-effect border-slate-700/50 col-span-full hover:border-slate-600/50 transition-all duration-300 hover:shadow-2xl hover:shadow-teal-500/10">
            <CardHeader>
              <CardTitle className="text-white text-2xl flex items-center space-x-2">
                <Sparkles className="h-6 w-6 text-teal-400" />
                <span>Welcome back, {userData?.displayName || user?.displayName || 'Binge Watcher'}!</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-6">
                {userData?.preferences?.favoriteGenres && userData.preferences.favoriteGenres.length > 0
                  ? `Ready for some ${userData.preferences.favoriteGenres.slice(0, 2).join(' and ')}? Your personalized entertainment hub awaits!`
                  : "Your personalized entertainment hub is ready. Start tracking your shows and movies!"
                }
              </p>
              <div className="flex flex-wrap gap-4">
                <Button className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 transition-all duration-200 hover:scale-105 hover:shadow-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Watchlist
                </Button>
                <Button variant="outline" className="border-slate-700 text-gray-300 hover:text-white hover:border-slate-600 transition-all duration-200 hover:scale-105">
                  <Search className="h-4 w-4 mr-2" />
                  Browse Shows
                </Button>
                <Button variant="outline" className="border-slate-700 text-gray-300 hover:text-white hover:border-slate-600 transition-all duration-200 hover:scale-105">
                  <Users className="h-4 w-4 mr-2" />
                  View Friends
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Filter System */}
          {/* <div className="col-span-full mb-6">
            <EnhancedFilterSystem />
          </div> */}

          {/* Collection Manager */}
          {/* <div className="col-span-full mb-6">
            <CollectionManager />
          </div> */}

          {/* Quick Stats */}
          <Card className="glass-effect border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 group">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-blue-400 group-hover:scale-110 transition-transform" />
                <span>Your Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-gray-300">
                <div className="flex justify-between items-center">
                  <span>Shows Watched:</span>
                  <Badge className="bg-teal-600">{userData?.stats.showsWatched || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Movies Watched:</span>
                  <Badge className="bg-blue-600">{userData?.stats.moviesWatched || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Hours Binged:</span>
                  <Badge className="bg-purple-600">{userData?.stats.totalHours || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Watchlist Items:</span>
                  <Badge className="bg-green-600">
                    {userData?.watchlists
                      ? Object.values(userData.watchlists).reduce((acc, list) => acc + list.length, 0)
                      : 0
                    }
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Currently Watching */}
          <Card className="glass-effect border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/5 group">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Play className="h-5 w-5 text-green-400 group-hover:scale-110 transition-transform" />
                <span>Currently Watching</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-4">No shows in progress</p>
              <Button className="w-full bg-green-600 hover:bg-green-700 transition-all duration-200 hover:scale-105">
                <Play className="h-4 w-4 mr-2" />
                Start Watching Something
              </Button>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="glass-effect border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/5 group">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-400 group-hover:scale-110 transition-transform" />
                <span>Recommended for You</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-4">Get personalized recommendations</p>
              <Button variant="outline" className="w-full border-slate-700 text-gray-300 hover:text-white hover:border-slate-600 transition-all duration-200 hover:scale-105">
                <Compass className="h-4 w-4 mr-2" />
                Discover Shows
              </Button>
            </CardContent>
          </Card>

          {/* A/B Testing Dashboard */}
          <Card className="glass-effect border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/5 group">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-teal-400 group-hover:scale-110 transition-transform" />
                <span>A/B Testing</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-gray-300 mb-4">
                <div className="flex justify-between items-center">
                  <span>Active Tests:</span>
                  <Badge className="bg-green-600">2</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>ML Performance:</span>
                  <Badge className="bg-teal-600">+25.7%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Confidence:</span>
                  <Badge className="bg-blue-600">95.7%</Badge>
                </div>
              </div>
              <Link href="/ab-testing">
                <Button className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 transition-all duration-200 hover:scale-105">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="glass-effect border-slate-700/50 col-span-full">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">No recent activity</p>
              <p className="text-sm text-gray-500 mt-2">
                Start watching shows and movies to see your activity here
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700/50 z-50">
        <div className="flex items-center justify-around py-3 px-4">
          <Link href="/dashboard">
            <div className="flex flex-col items-center space-y-1 text-teal-400">
              <Home className="h-5 w-5" />
              <span className="text-xs font-medium">Home</span>
            </div>
          </Link>

          <Link href="/discover">
            <div className="flex flex-col items-center space-y-1 text-gray-400 hover:text-white transition-colors">
              <Compass className="h-5 w-5" />
              <span className="text-xs font-medium">Discover</span>
            </div>
          </Link>

          <Link href="/lists">
            <div className="flex flex-col items-center space-y-1 text-gray-400 hover:text-white transition-colors">
              <List className="h-5 w-5" />
              <span className="text-xs font-medium">Lists</span>
            </div>
          </Link>

          <Link href="/social">
            <div className="flex flex-col items-center space-y-1 text-gray-400 hover:text-white transition-colors">
              <Users className="h-5 w-5" />
              <span className="text-xs font-medium">Social</span>
            </div>
          </Link>

          <Link href="/profile">
            <div className="flex flex-col items-center space-y-1 text-gray-400 hover:text-white transition-colors">
              <UserCircle className="h-5 w-5" />
              <span className="text-xs font-medium">Profile</span>
            </div>
          </Link>
        </div>
      </nav>

      {/* Onboarding Modal */}
      {(() => {
        if (showOnboarding) {
          console.log("🚀 Dashboard: Rendering OnboardingModal with user:", user, "userData object:", user ? {
            firstName: user.displayName?.split(' ')[0] || '',
            lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
            email: user.email || '',
            profileImage: user.photoURL || '',
            provider: user.providerData[0]?.providerId === 'google.com' ? 'google' :
              user.providerData[0]?.providerId === 'facebook.com' ? 'facebook' : 'email'
          } : undefined);
        }
        return null;
      })()}
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
        userDisplayName={user?.displayName || userData?.displayName || 'there'}
        userData={user ? {
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
          email: user.email || '',
          profileImage: user.photoURL || '',
          provider: user.providerData[0]?.providerId === 'google.com' ? 'google' :
            user.providerData[0]?.providerId === 'facebook.com' ? 'facebook' : 'email'
        } : undefined}
      />
    </div>
  );
}
