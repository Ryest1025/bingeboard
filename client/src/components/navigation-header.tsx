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

export default function NavigationHeader() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Extract user claims for safe access
  const userClaims = (user as any)?.claims || {};

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
    <nav className="glass-dark sticky top-0 left-0 right-0 z-[60] border-b border-teal-500/20 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-8">
            <div className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent font-black text-xl sm:text-2xl cursor-pointer tracking-tight" onClick={() => setLocation("/")}>
              BingeBoard
            </div>
            <div className="hidden lg:flex items-center space-x-2">
              {navItems.map(item => (
                <button
                  key={item.path}
                  onClick={() => setLocation(item.path)}
                  className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    item.active 
                      ? "text-white bg-gradient-teal shadow-lg shadow-teal-500/25 transform scale-105" 
                      : "text-gray-300 hover:text-white hover:bg-teal-500/10 hover:scale-105"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative hidden md:block">
              <Input
                type="text"
                placeholder="Search shows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-binge-gray rounded-full px-4 py-2 pl-10 text-sm w-64 focus:ring-2 focus:ring-teal-500 border-white/20"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </form>
            
            <Button variant="ghost" size="sm" className="relative p-2 text-gray-400 hover:text-white">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-teal-500 rounded-full w-5 h-5 text-xs flex items-center justify-center">
                3
              </span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/5">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={userClaims?.profile_image_url} />
                    <AvatarFallback className="bg-gradient-teal text-white">
                      {userClaims?.first_name?.[0] || userClaims?.email?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm">
                    {userClaims?.first_name && userClaims?.last_name 
                      ? `${userClaims.first_name} ${userClaims.last_name}`
                      : userClaims?.email || 'User'
                    }
                  </span>
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
                <DropdownMenuItem onClick={() => window.location.href = '/api/logout'}>
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
