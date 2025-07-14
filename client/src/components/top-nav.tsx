import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Search, User, Settings, LogOut, Crown } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

export function TopNav() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();

  // Fetch notification history to get unread count
  const { data: notifications = [] } = useQuery({
    queryKey: ['/api/notifications/history'],
    enabled: isAuthenticated,
  });

  const unreadCount = notifications && Array.isArray(notifications) 
    ? notifications.filter((n: any) => !n.isRead).length 
    : 0;

  if (!isAuthenticated) {
    return (
      <header className="nav-opaque border-b border-slate-800 sticky top-0 z-[60]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                  <div className="w-6 h-5 bg-white rounded-sm relative">
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-1 bg-teal-500 rounded-b"></div>
                    <div className="absolute bottom-1 left-0 w-1 h-1 bg-teal-500 rounded"></div>
                    <div className="absolute bottom-1 right-0 w-1 h-1 bg-teal-500 rounded"></div>
                  </div>
                </div>
              </div>
              <div className="block">
                <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent font-black text-xl sm:text-2xl">
                  BingeBoard
                </span>
                <div className="text-xs text-teal-400 font-medium tracking-widest uppercase opacity-75 hidden sm:block">
                  Entertainment Hub
                </div>
              </div>
            </Link>

            {/* Right side - Login Button */}
            <div className="flex items-center space-x-3">
              <Link href="/login">
                <Button className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-semibold px-6 py-2">
                  Log In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-[9999] w-full border-b border-slate-800/50 bg-black backdrop-blur-md" style={{ position: 'fixed' }}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer group">
              <div className="relative">
                {/* TV Frame */}
                <div className="w-10 h-8 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg shadow-xl border-2 border-slate-600 relative group-hover:scale-105 transition-transform duration-300">
                  {/* TV Screen */}
                  <div className="absolute inset-1 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-md flex items-center justify-center">
                    <div className="text-sm font-bold text-white drop-shadow-lg" style={{ textShadow: '0 0 6px rgba(0,0,0,0.8), 0 0 2px rgba(255,255,255,0.3)' }}>B</div>
                  </div>
                  {/* TV Base */}
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-1 bg-slate-700 rounded-sm"></div>
                  {/* TV Legs */}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-5 h-1 bg-slate-600 rounded-sm"></div>
                </div>
              </div>
              <div className="block">
                <span className="text-xl sm:text-2xl">
                  <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent font-black">Binge</span><span className="font-light text-white">Board</span>
                </span>
                <div className="text-xs text-teal-400 font-medium tracking-widest uppercase opacity-75 hidden sm:block">
                  Entertainment Hub
                </div>
              </div>
            </div>
          </Link>



          {/* Right side actions */}
          <div className="flex items-center space-x-3">
            {/* Search Button */}
            <Link href="/discover">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                <Search className="h-5 w-5" />
              </Button>
            </Link>

            {/* Notifications Button */}
            <Link href="/notifications">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs min-w-0"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={user?.profileImageUrl || undefined} 
                      alt={user?.firstName || "User"}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white">
                      {user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-56 bg-slate-800 border-slate-700 mr-4" 
                align="end" 
                alignOffset={-8}
                sideOffset={8}
                forceMount
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-white">
                      {user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user?.email || "User"
                      }
                    </p>
                    {user?.email && (
                      <p className="text-xs leading-none text-gray-400">
                        {user.email}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator className="bg-slate-700" />
                
                <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-slate-700 cursor-pointer">
                  <Link href="/profile" className="flex items-center w-full">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-slate-700 cursor-pointer">
                  <Link href="/pricing" className="flex items-center w-full">
                    <Crown className="mr-2 h-4 w-4" />
                    <span>Upgrade to Premium</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-slate-700 cursor-pointer">
                  <Link href="/settings" className="flex items-center w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-slate-700" />
                
                <DropdownMenuItem 
                  className="text-gray-300 hover:text-white hover:bg-slate-700 cursor-pointer"
                  onClick={async () => {
                    console.log('🔐 MANUAL LOGOUT BUTTON CLICKED - Starting logout process...');
                    console.trace('🔍 Stack trace for logout button click:');
                    
                    try {
                      // Step 1: Sign out from Firebase client
                      const { signOut } = await import('firebase/auth');
                      const { auth } = await import('@/firebase/config');
                      await signOut(auth);
                      console.log('✅ Firebase client signout successful');
                    } catch (error) {
                      console.error('❌ Firebase signout error:', error);
                    }
                    
                    try {
                      // Step 2: Clear backend session
                      const response = await fetch('/api/auth/logout', {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                      });
                      
                      if (response.ok) {
                        console.log('✅ Backend session cleared successfully');
                      } else {
                        console.error('❌ Backend logout failed:', response.status);
                      }
                    } catch (error) {
                      console.error('❌ Backend logout error:', error);
                    }
                    
                    // Step 3: Force page reload to reset authentication state
                    console.log('🔄 Redirecting to home page...');
                    window.location.href = "/";
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}