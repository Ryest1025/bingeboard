import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Search, Bell, LogOut, User, Settings, Calendar, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function NavigationHeader() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Handle logout with proper Firebase and server cleanup
  const handleLogout = async () => {
    try {
      // First, sign out from Firebase
      const { signOut } = await import("firebase/auth");
      const { auth } = await import("../firebase/config");

      await signOut(auth);

      // Clear any stored tokens
      localStorage.removeItem('firebaseToken');
      sessionStorage.removeItem('firebaseToken');

      // Call server logout
      await fetch('/api/logout', {
        method: 'GET',
        credentials: 'include'
      });

      // Clear any other auth-related storage
      localStorage.clear();
      sessionStorage.clear();

      // Force navigation to landing page
      window.location.href = '/';

    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: force navigation to landing page even if logout fails
      window.location.href = '/';
    }
  };

  // Handle notifications click
  const handleNotificationsClick = () => {
    setLocation('/notifications');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/discover?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const navItems = [
    { path: "/", label: "Dashboard", active: location === "/" },
    { path: "/discover", label: "Discover", active: location === "/discover" },
    { path: "/upcoming", label: "Upcoming", active: location === "/upcoming" },
    { path: "/activity", label: "Activity", active: location === "/activity" },
    { path: "/friends", label: "Binge Friends", active: location === "/friends" },
  ];

  return (
    <nav className="bg-black/95 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo/Brand */}
          <div className="flex items-center space-x-8">
            <button
              onClick={() => setLocation('/')}
              className="flex items-center space-x-3 hover:scale-105 transition-transform"
            >
              {/* TV Logo */}
              <div className="relative">
                <div className="w-8 h-6 bg-gradient-to-br from-slate-700 to-slate-900 rounded-md shadow-lg border border-slate-600 relative">
                  <div className="absolute inset-1 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-sm flex items-center justify-center">
                    <div
                      className="text-xs font-bold text-white drop-shadow-lg"
                      style={{ textShadow: '0 0 4px rgba(0,0,0,0.8)' }}
                    >
                      B
                    </div>
                  </div>
                  <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-2 h-0.5 bg-slate-700 rounded-sm"></div>
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-0.5 bg-slate-600 rounded-sm"></div>
                </div>
              </div>

              <span className="text-lg font-bold">
                <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Binge
                </span>
                <span className="text-white ml-1">Board</span>
              </span>
            </button>

            {/* Navigation Items */}
            <div className="hidden md:flex space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => setLocation(item.path)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${item.active
                      ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Center: Search */}
          <div className="hidden sm:block flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search shows, movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border-white/10 text-white placeholder-gray-400 pr-10"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Right: User Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNotificationsClick}
              className="text-gray-300 hover:text-white hover:bg-white/5"
            >
              <Bell className="h-5 w-5" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || 'User'} />
                    <AvatarFallback className="bg-gradient-to-br from-teal-500 to-blue-500 text-white text-sm">
                      {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-effect border-white/20">
                <DropdownMenuItem onClick={() => setLocation('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation('/streaming')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
