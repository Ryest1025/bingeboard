import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Clock, 
  TrendingUp,
  Star,
  Plus,
  Eye
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
  const [trendingShows, setTrendingShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingShows = async () => {
      try {
        const response = await fetch('/api/tmdb/trending');
        const data = await response.json();
        setTrendingShows(data.results?.slice(0, 4) || []);
      } catch (error) {
        console.error('Error fetching trending shows:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingShows();
  }, []);

  const getImageUrl = (path: string | null) => {
    if (!path) return '/placeholder-poster.png';
    return `https://image.tmdb.org/t/p/w500${path}`;
  };

  const getTitle = (show: Show) => {
    return show.name || show.title || 'Unknown Title';
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black z-10" />
        <div className="relative z-20 px-4 py-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
              <div className="text-white font-black text-xl">B</div>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">
                <span className="bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">Binge</span>
                <span className="text-white">Board</span>
              </h1>
              <p className="text-gray-400 text-sm">Entertainment Hub</p>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-4xl font-black text-white mb-4">
              What To Binge Next!
            </h2>
            <p className="text-gray-400 text-lg">
              Welcome back, {user?.name || 'Viewer'}! Here's what's trending.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-20">
        {/* Trending Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">What's Trending</h3>
              <p className="text-gray-400 text-sm">Popular shows right now</p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-800 rounded-lg aspect-[3/4] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {trendingShows.map((show) => (
                <Card key={show.id} className="bg-gray-900 border-gray-700 hover:border-teal-500 transition-all duration-300 group">
                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src={getImageUrl(show.poster_path)}
                        alt={getTitle(show)}
                        className="w-full aspect-[3/4] object-cover rounded-t-lg"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-poster.png';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-lg flex items-center justify-center">
                        <Button size="sm" className="bg-teal-500 hover:bg-teal-600">
                          <Play className="h-4 w-4 mr-2" />
                          Watch Now
                        </Button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-white mb-2 line-clamp-2">
                        {getTitle(show)}
                      </h4>
                      <div className="flex items-center gap-2 mb-3">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-400">
                          {show.vote_average.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 text-xs">
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 text-xs">
                          <Eye className="h-3 w-3 mr-1" />
                          Watch
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-teal-500/20 to-blue-600/20 border-teal-500/30">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-teal-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Add Shows</h3>
              <p className="text-gray-400 text-sm mb-4">Find and track new content</p>
              <Button className="bg-teal-500 hover:bg-teal-600">
                Browse Shows
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 border-purple-500/30">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Continue Watching</h3>
              <p className="text-gray-400 text-sm mb-4">Pick up where you left off</p>
              <Button className="bg-purple-500 hover:bg-purple-600">
                View Watchlist
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/20 to-red-600/20 border-orange-500/30">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Recommendations</h3>
              <p className="text-gray-400 text-sm mb-4">Personalized for you</p>
              <Button className="bg-orange-500 hover:bg-orange-600">
                Get Recommendations
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}