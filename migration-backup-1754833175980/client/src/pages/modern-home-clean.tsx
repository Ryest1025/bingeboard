import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Heart,
  Target,
  BarChart3
} from "lucide-react";

interface Show {
  id: number;
  name?: string;
  title?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  first_air_date?: string;
  release_date?: string;
}

export default function ModernHomeClean() {
  const { user, isAuthenticated } = useAuth();
  const [trendingData, setTrendingData] = useState<{ results: Show[] } | null>(null);
  
  // Safe fetch function
  const safeFetch = async (url: string) => {
    try {
      const response = await fetch(url, { credentials: 'include' });
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.debug('Safe fetch handled error:', error);
      return null;
    }
  };
  
  // Fetch trending shows
  useEffect(() => {
    safeFetch('/api/tmdb/trending').then(data => {
      if (data) setTrendingData(data);
    });
  }, []);

  if (!isAuthenticated) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <p>Please log in to access BingeBoard</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-8 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg shadow-xl border-2 border-slate-600 relative">
              <div className="absolute inset-1 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-sm flex items-center justify-center">
                <div className="text-sm font-black text-white">B</div>
              </div>
              <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-3 h-1 bg-slate-700 rounded-sm"></div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-5 h-1 bg-slate-600 rounded-sm"></div>
            </div>
            <div className="text-2xl font-bold text-white">
              <span className="font-black">Binge</span>
              <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent font-light">Board</span>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            Welcome back, {user?.name || user?.email}!
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-20">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            What To Binge Next!
          </h1>
          <p className="text-gray-400 text-lg">
            Discover your next favorite show and track your entertainment journey
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="glass-effect border-teal-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Currently Watching</p>
                  <p className="text-2xl font-bold text-teal-400">12</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Play className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-effect border-teal-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-teal-400">47</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Eye className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-effect border-teal-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Watchlist</p>
                  <p className="text-2xl font-bold text-teal-400">23</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Heart className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-effect border-teal-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Hours Watched</p>
                  <p className="text-2xl font-bold text-teal-400">284</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Start Watching Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Play className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Start Watching</h2>
            </div>
            <Button variant="ghost" size="sm" className="text-teal-400 hover:text-teal-300">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          <Card className="glass-effect border-teal-500/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-36 bg-gradient-to-br from-teal-500/20 to-blue-600/20 rounded-lg flex items-center justify-center">
                  <Play className="h-8 w-8 text-teal-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">Featured Show</h3>
                  <p className="text-gray-400 mb-4">
                    Continue your entertainment journey with our top recommendation based on your viewing history.
                  </p>
                  <div className="flex space-x-3">
                    <Button className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700">
                      <Play className="h-4 w-4 mr-2" />
                      Start Watching
                    </Button>
                    <Button variant="outline" className="border-teal-400/30 text-teal-300 hover:bg-teal-500/10">
                      <Plus className="h-4 w-4 mr-2" />
                      Add to List
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trending Shows Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">What's Trending</h2>
            </div>
            <Button variant="ghost" size="sm" className="text-teal-400 hover:text-teal-300">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {trendingData?.results?.slice(0, 6).map((show) => (
              <Card key={show.id} className="glass-effect border-slate-700/50 group hover:border-teal-400/40 transition-all duration-300">
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={show.poster_path ? `https://image.tmdb.org/t/p/w300${show.poster_path}` : "/placeholder-poster.png"}
                      alt={show.name || show.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-black/60 text-yellow-400 border-0">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        {show.vote_average.toFixed(1)}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-bold text-white line-clamp-2 mb-2">
                      {show.name || show.title}
                    </h3>
                    <div className="flex space-x-2">
                      <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-xs px-2 py-1">
                        <Play className="h-3 w-3 mr-1" />
                        Watch
                      </Button>
                      <Button size="sm" variant="outline" className="border-teal-400/30 text-teal-300 hover:bg-teal-500/10 text-xs px-2 py-1">
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recommendations Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Target className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Recommended for You</h2>
            </div>
            <Button variant="ghost" size="sm" className="text-teal-400 hover:text-teal-300">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-effect border-teal-500/20">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-24 bg-gradient-to-br from-teal-500/20 to-blue-600/20 rounded-lg flex items-center justify-center">
                    <Star className="h-6 w-6 text-teal-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">AI-Powered Recommendations</h3>
                    <p className="text-gray-400 text-sm">
                      Based on your viewing history and preferences
                    </p>
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700">
                  <Target className="h-4 w-4 mr-2" />
                  Get Recommendations
                </Button>
              </CardContent>
            </Card>
            
            <Card className="glass-effect border-teal-500/20">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-24 bg-gradient-to-br from-teal-500/20 to-blue-600/20 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-teal-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">Friends' Favorites</h3>
                    <p className="text-gray-400 text-sm">
                      See what your friends are watching
                    </p>
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700">
                  <Users className="h-4 w-4 mr-2" />
                  Explore Social
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}