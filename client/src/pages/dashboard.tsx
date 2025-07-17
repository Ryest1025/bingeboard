import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  Search,
  Plus,
  Star,
  Clock,
  TrendingUp,
  Users,
  Play,
  Heart,
  BookOpen,
  Settings,
  LogOut
} from "lucide-react";
import { auth } from "../firebase/config";
import { onAuthStateChanged, signOut, User } from "firebase/auth";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <Link href="/login">
            <Button className="bg-gradient-to-r from-teal-600 to-blue-600">
              Go to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const mockContent = [
    { title: "Breaking Bad", type: "TV Show", status: "Watching", episodes: "S3 E12", rating: 5, image: "🎭" },
    { title: "The Dark Knight", type: "Movie", status: "Completed", rating: 5, image: "🦇" },
    { title: "Stranger Things", type: "TV Show", status: "To Watch", episodes: "S4 E1", rating: 4, image: "🔦" },
    { title: "Inception", type: "Movie", status: "To Watch", rating: 5, image: "🌀" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-6 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg shadow-xl border-2 border-slate-600 relative">
                  <div className="absolute inset-1 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-sm flex items-center justify-center">
                    <div className="text-xs font-black text-white">B</div>
                  </div>
                </div>
                <span className="text-lg font-bold text-white">
                  <span className="font-black">Binge</span>
                  <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent font-light">Board</span>
                </span>
              </div>
            </Link>

            {/* Search */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search movies, TV shows..."
                  className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">
                Welcome, {user.displayName || user.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-slate-700 text-gray-300 hover:text-white"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user.displayName?.split(' ')[0] || 'Binger'}! 🎬
          </h1>
          <p className="text-gray-400">
            Ready to discover your next favorite show or movie?
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-effect border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Play className="h-8 w-8 text-teal-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Currently Watching</p>
                  <p className="text-2xl font-bold text-white">12</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Heart className="h-8 w-8 text-red-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Favorites</p>
                  <p className="text-2xl font-bold text-white">47</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">To Watch</p>
                  <p className="text-2xl font-bold text-white">23</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-purple-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Hours Watched</p>
                  <p className="text-2xl font-bold text-white">184</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Continue Watching */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Continue Watching</h2>
            <Button variant="outline" size="sm" className="border-slate-700 text-gray-300">
              <Plus className="h-4 w-4 mr-2" />
              Add Content
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockContent.map((item, index) => (
              <Card key={index} className="glass-effect border-slate-700/50 hover:border-teal-500/30 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="text-4xl mb-3 text-center">{item.image}</div>
                  <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-400 mb-2">{item.type}</p>
                  {item.episodes && (
                    <p className="text-sm text-teal-400 mb-2">{item.episodes}</p>
                  )}
                  <div className="flex justify-between items-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${item.status === 'Watching' ? 'bg-green-500/20 text-green-400' :
                      item.status === 'Completed' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                      {item.status}
                    </span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${i < item.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-effect border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-teal-400" />
                Trending Now
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm">See what's popular this week</p>
              <Button className="w-full mt-4 bg-gradient-to-r from-teal-600 to-blue-600">
                Explore Trending
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-effect border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Users className="h-5 w-5 mr-2 text-purple-400" />
                Social Feed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm">See what your friends are watching</p>
              <Link href="/social">
                <Button className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600">
                  View Social Feed
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="glass-effect border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="h-5 w-5 mr-2 text-gray-400" />
                Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm">Customize your experience</p>
              <Button variant="outline" className="w-full mt-4 border-slate-700 text-gray-300">
                Manage Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}