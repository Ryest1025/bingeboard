import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Search, Bell, LogOut, User, Settings, Menu, X } from "lucide-react";
import BrandedSearchBar from "@/components/search/BrandedSearchBar";

export default function NavigationHeader() {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);



  // Close mobile menu when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Handle logout using the useAuth hook
  const handleLogout = async () => {
    try {
      console.log('🔐 Navigation logout clicked');
      await logout();
      
      // Immediate navigation to landing page after logout
      console.log('🔐 Redirecting to landing page immediately after logout');
      setLocation('/');
      
    } catch (error) {
      console.error('🔐 Navigation logout error:', error);
      // Fallback: force navigation to landing page even if logout fails
      setLocation('/');
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

  // Enhanced search handlers
  const handleAddToWatchlist = async (showId: number) => {
    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          showId,
          status: 'want_to_watch',
          tmdbId: showId
        })
      });

      if (response.ok) {
        // You can add a toast notification here
        console.log('Added to watchlist successfully');
      }
    } catch (error) {
      console.error('Failed to add to watchlist:', error);
    }
  };

  const handleWatchNow = async (show: any) => {
    // Import the utility functions
    const { getShowTitle, getStreamingPlatforms } = await import("@/utils/show-utils");

    const title = getShowTitle(show);
    const streamingPlatforms = getStreamingPlatforms(show);

    // Generate platform-specific URL
    const getPlatformDirectUrl = (platformName: string, title: string): string => {
      const encodedTitle = encodeURIComponent(title);
      const platformUrls: { [key: string]: string } = {
        'Netflix': `https://www.netflix.com/search?q=${encodedTitle}`,
        'Disney+': `https://www.disneyplus.com/search?q=${encodedTitle}`,
        'Hulu': `https://www.hulu.com/search?q=${encodedTitle}`,
        'Amazon Prime Video': `https://www.amazon.com/gp/video/search?phrase=${encodedTitle}`,
        'HBO Max': `https://play.max.com/search?q=${encodedTitle}`,
        'Apple TV+': `https://tv.apple.com/search?term=${encodedTitle}`,
        'Paramount+': `https://www.paramountplus.com/search/?query=${encodedTitle}`,
        'Peacock': `https://www.peacocktv.com/search?q=${encodedTitle}`,
      };
      return platformUrls[platformName] || `https://www.netflix.com/search?q=${encodedTitle}`;
    };

    if (streamingPlatforms && streamingPlatforms.length > 0) {
      const platform = streamingPlatforms[0];
      const platformName = platform.name || platform.provider_name;
      const platformUrl = getPlatformDirectUrl(platformName, title);
      window.open(platformUrl, '_blank');
    } else {
      // Fallback to Netflix search
      const platformUrl = getPlatformDirectUrl('Netflix', title);
      window.open(platformUrl, '_blank');
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
              {/* TV Logo - Matching Landing Page Design */}
              <div className="relative">
                <div className="w-8 h-6 md:w-10 md:h-8 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg shadow-xl border-2 border-slate-600 relative">
                  <div className="absolute inset-1 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-md flex items-center justify-center">
                    <div
                      className="text-xs md:text-sm font-bold text-white drop-shadow-lg"
                      style={{ textShadow: '0 0 6px rgba(0,0,0,0.8), 0 0 2px rgba(255,255,255,0.3)' }}
                    >
                      B
                    </div>
                  </div>
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 md:w-3 h-1 bg-slate-700 rounded-sm"></div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3 md:w-5 h-1 bg-slate-600 rounded-sm"></div>
                </div>
              </div>

              <span className="text-lg md:text-xl font-bold">
                <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent font-black">
                  Binge
                </span>
                <span className="text-white font-light ml-1">Board</span>
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

          {/* Center: Enhanced Search */}
          <div className="hidden sm:block flex-1 max-w-md mx-8">
            <BrandedSearchBar
              placeholder="Search shows, movies..."
              onAddToWatchlist={handleAddToWatchlist}
              onWatchNow={handleWatchNow}
            />
          </div>

          {/* Right: User Actions */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/discover')}
              className="sm:hidden text-gray-300 hover:text-white hover:bg-white/5 p-2"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNotificationsClick}
              className="text-gray-300 hover:text-white hover:bg-white/5 p-2"
            >
              <Bell className="h-5 w-5" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={undefined} alt={user?.displayName || 'User'} />
                    <AvatarFallback className="bg-gradient-to-br from-teal-500 to-blue-500 text-white text-sm">
                      {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-effect border-white/20 bg-slate-900/95 text-white">
                <DropdownMenuItem onClick={() => setLocation('/profile')} className="text-white hover:bg-white/10 focus:bg-white/10">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation('/streaming')} className="text-white hover:bg-white/10 focus:bg-white/10">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-white hover:bg-white/10 focus:bg-white/10">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-gray-300 hover:text-white hover:bg-white/5 p-2"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 py-4">
            {/* Mobile Enhanced Search */}
            <div className="mb-4">
              <BrandedSearchBar
                placeholder="Search shows, movies..."
                onAddToWatchlist={handleAddToWatchlist}
                onWatchNow={handleWatchNow}
              />
            </div>

            {/* Mobile Navigation Items */}
            <div className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    setLocation(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${item.active
                    ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
