import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { auth } from "../firebase/config";
import { signOut } from "firebase/auth";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { userDataManager, UserData } from "../lib/user-data-manager";
import {
  Bell,
  Settings,
  Home,
  Compass,
  List,
  Users,
  BarChart3,
  Search,
  UserCircle,
  ArrowLeft
} from "lucide-react";
import ABTestingDashboard from "../components/ab-testing/ABTestingDashboard";

export default function ABTestingPage() {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);

      if (user) {
        try {
          await userDataManager.initialize();
          const data = await userDataManager.getCurrentUser();
          setUserData(data);
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
          <div className="text-white text-xl font-medium animate-pulse">Loading A/B Testing Dashboard...</div>
          <div className="text-gray-400 text-sm mt-2">Preparing your experiment analytics</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center text-white">
          <BarChart3 className="h-16 w-16 text-teal-400 mx-auto mb-4" />
          <h1 className="text-2xl mb-4">Please log in to access A/B Testing Dashboard</h1>
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

            {/* Navigation with Back Button */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/dashboard">
                <div className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="font-medium">Back to Dashboard</span>
                </div>
              </Link>
              <Link href="/dashboard">
                <div className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
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
              <Link href="/ab-testing">
                <div className="flex items-center space-x-2 text-teal-400 hover:text-teal-300 transition-colors">
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
        <ABTestingDashboard />
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700/50 z-50">
        <div className="flex items-center justify-around py-3 px-4">
          <Link href="/dashboard">
            <div className="flex flex-col items-center space-y-1 text-gray-400 hover:text-white transition-colors">
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

          <Link href="/ab-testing">
            <div className="flex flex-col items-center space-y-1 text-teal-400">
              <BarChart3 className="h-5 w-5" />
              <span className="text-xs font-medium">A/B Test</span>
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
    </div>
  );
}
