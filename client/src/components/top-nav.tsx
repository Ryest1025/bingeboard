import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAuth, signOut } from "firebase/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Search, User, Settings, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function TopNav() {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  
  if (isLoading) {
    return (
      <header className="fixed top-0 left-0 right-0 z-[9999] w-full border-b border-slate-800/50 bg-black backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="animate-pulse h-8 w-32 bg-slate-700 rounded"></div>
            <div className="animate-pulse h-8 w-24 bg-slate-700 rounded"></div>
          </div>
        </div>
      </header>
    );
  }

  if (!user) {
    return (
      <header className="fixed top-0 left-0 right-0 z-[9999] w-full border-b border-slate-800/50 bg-black backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-8 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg shadow-xl border-2 border-slate-600 relative">
                  <div className="absolute inset-1 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-md flex items-center justify-center">
                    <div className="text-sm font-bold text-white">B</div>
                  </div>
                </div>
              </div>
              <div className="block">
                <span className="text-xl sm:text-2xl">
                  <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent font-black">Binge</span>
                  <span className="font-light text-white ml-1">Board</span>
                </span>
              </div>
            </Link>
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
    <header className="fixed top-0 left-0 right-0 z-[9999] w-full border-b border-slate-800/50 bg-black backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center">
          <Link href="/" className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-8 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg shadow-xl border-2 border-slate-600 relative">
                <div className="absolute inset-1 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-md flex items-center justify-center">
                  <div className="text-sm font-bold text-white">B</div>
                </div>
              </div>
            </div>
            <div>
              <span className="text-xl text-white">
                <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent font-black">Binge</span>
                <span className="font-light text-white ml-1">Board</span>
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8 ml-12">
            <Link href="/" className={`transition-colors hover:text-teal-400 ${
              location === '/' ? 'text-teal-400' : 'text-white'
            }`}>
              Dashboard
            </Link>
            <Link href="/discover" className={`transition-colors hover:text-teal-400 ${
              location === '/discover' ? 'text-teal-400' : 'text-white'
            }`}>
              Discover
            </Link>
            <Link href="/watchlist" className={`transition-colors hover:text-teal-400 ${
              location === '/watchlist' ? 'text-teal-400' : 'text-white'
            }`}>
              Watchlist
            </Link>
            <Link href="/friends" className={`transition-colors hover:text-teal-400 ${
              location === '/friends' ? 'text-teal-400' : 'text-white'
            }`}>
              Binge Friends
            </Link>
          </nav>

          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="search"
                placeholder="Search shows, movies..."
                className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 ml-auto">
            <Button variant="ghost" size="icon" className="text-white hover:text-teal-400">
              <Bell className="w-5 h-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 text-white hover:text-teal-400">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.photoURL || undefined} />
                    <AvatarFallback className="bg-teal-600 text-white">
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block">{user.displayName || 'User'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-700">
                <DropdownMenuLabel className="text-white">
                  <div className="flex flex-col space-y-1">
                    <p className="font-medium">{user.displayName || 'User'}</p>
                    <p className="text-sm text-gray-400">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem className="text-white hover:bg-slate-800 cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-slate-800 cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem 
                  className="text-red-400 hover:bg-slate-800 cursor-pointer"
                  onClick={async () => {
                    const auth = getAuth();
                    await signOut(auth);
                    window.location.reload();
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
