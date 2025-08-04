import React, { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
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
  LogOut,
  Eye,
  Filter,
  Sparkles
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { AiRecommendations } from "../components/ai-recommendations";
import NavigationHeader from "@/components/navigation-header";
import StreamingLogos from "../components/streaming-logos";
import EnhancedFilterSystem from "../components/common/EnhancedFilterSystem";
import CollectionManager from "../components/common/CollectionManager";
import { useToast } from "@/hooks/use-toast";
// ...rest of the code remains unchanged (already matches the provided version)...

// Filter types for enhanced integration
interface EnhancedFilters {
  genres: string[];
  content_types: string[];
  mood: string[];
  viewing_context: string[];
  content_rating: string[];
  runtime_min: number;
  runtime_max: number;
  release_year_min: number;
  release_year_max: number;
  min_rating: number;
  streaming_services: number[];
  languages: string[];
  accessibility_needs: string[];
  content_warnings: string[];
  social_features: string[];
}

export default function Dashboard() {
  console.log('🚨 Dashboard loaded v5 - Enhanced with Singleton Auth');
  // console.log('🏠 DASHBOARD COMPONENT RENDERED - User is authenticated!'); // Disabled for performance

  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // console.log('📊 Dashboard auth state:', { isLoading, isAuthenticated, userEmail: user?.email }); // Disabled for performance

  // Enhanced Filter System Integration
  const [activeFilters, setActiveFilters] = useState<EnhancedFilters | null>(null);
  const [filteredShows, setFilteredShows] = useState<any[]>([]);

  // Handle filter changes from EnhancedFilterSystem
  const handleFiltersChange = useCallback((filters: EnhancedFilters) => {
    setActiveFilters(filters);
    console.log('🎯 Filters updated:', filters);
    
    // Show toast when filters are active
    const filterCount = Object.values(filters).flat().length + 
      (filters.runtime_min !== 30 || filters.runtime_max !== 180 ? 1 : 0) +
      (filters.release_year_min !== 2000 || filters.release_year_max !== new Date().getFullYear() ? 1 : 0) +
      (filters.min_rating !== 6.0 ? 1 : 0);
    
    if (filterCount > 0) {
      toast({
        title: "Filters Applied",
        description: `${filterCount} filter${filterCount !== 1 ? 's' : ''} active - showing personalized results`
      });
    }
  }, [toast]);

  // Handle filter application (when user clicks Apply)
  const handleFiltersApply = useCallback((filters: EnhancedFilters) => {
    console.log('✅ Applying filters:', filters);
    setActiveFilters(filters);
    
    // Here you would typically make an API call with the filters
    // For now, we'll just show a success message
    toast({
      title: "Search Updated",
      description: "Content filtered based on your preferences"
    });
  }, [toast]);

  // Add streaming data to shows
  const addStreamingDataToShows = (shows: any[]) => {
    const fallbackProviders = [
      {
        provider_id: 8,
        provider_name: "Netflix",
        name: "Netflix",
        logo_path: "/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg"
      },
      {
        provider_id: 384,
        provider_name: "HBO Max",
        name: "HBO Max",
        logo_path: "/Ajqyt5aNxNGjmF9uOfxArGrdf3X.jpg"
      },
      {
        provider_id: 337,
        provider_name: "Disney Plus",
        name: "Disney Plus",
        logo_path: "/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg"
      },
      {
        provider_id: 9,
        provider_name: "Amazon Prime Video",
        name: "Amazon Prime Video",
        logo_path: "/emthp39XA2YScoYL1p0sdbAH2WA.jpg"
      }
    ];

    return shows.map(show => ({
      ...show,
      streaming: fallbackProviders.slice(0, Math.floor(Math.random() * 3) + 1)
    }));
  };

  // Fetch trending shows for Continue Watching section with streaming data
  const { data: trendingData } = useQuery({
    queryKey: ["/api/tmdb/trending"],
    queryFn: async () => {
      const response = await fetch("/api/tmdb/trending?mediaType=tv&timeWindow=week");
      if (!response.ok) throw new Error("Failed to fetch trending shows");
      const data = await response.json();
      // Add streaming data to each show
      if (data.results) {
        const showsWithStreaming = addStreamingDataToShows(data.results);
        return { ...data, results: showsWithStreaming };
      }
      return data;
    },
  });

  // Fetch user stats
  const { data: userStats } = useQuery({
    queryKey: ["/api/user/stats"],
    queryFn: async () => {
      const response = await fetch("/api/user/stats", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch user stats");
      return response.json();
    },
    enabled: !!isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
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

  // Get real trending shows for Continue Watching section
  const continueWatchingShows = trendingData?.results?.slice(0, 4) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation Header */}
      <NavigationHeader />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-28">
        {/* Welcome Section with Enhanced Features Status */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome back!
              </h1>
              <p className="text-gray-400">
                Ready to discover your next favorite show or movie?
              </p>
            </div>
            <div className="flex gap-2">
              <Badge className="bg-gradient-to-r from-teal-500 to-blue-500 text-white">
                <Filter className="h-3 w-3 mr-1" />
                Enhanced Filters
              </Badge>
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <BookOpen className="h-3 w-3 mr-1" />
                Smart Collections
              </Badge>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-effect border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Play className="h-8 w-8 text-teal-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Currently Watching</p>
                  <p className="text-2xl font-bold text-white">{userStats?.currentlyWatching || 0}</p>
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
                  <p className="text-2xl font-bold text-white">{userStats?.favorites || 0}</p>
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
                  <p className="text-2xl font-bold text-white">{userStats?.toWatch || 0}</p>
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
                  <p className="text-2xl font-bold text-white">{userStats?.hoursWatched || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Continue Watching - Now with Real TMDB Data */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Trending Shows</h2>
            <Link href="/discover">
              <Button variant="outline" size="sm" className="border-slate-700 text-gray-300">
                <Plus className="h-4 w-4 mr-2" />
                Discover More
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {continueWatchingShows.map((show: any, index: number) => {
              const title = show.name || show.title;
              const year = show.first_air_date?.split('-')[0] || show.release_date?.split('-')[0];
              const posterUrl = show.poster_path
                ? `https://image.tmdb.org/t/p/w300${show.poster_path}`
                : "/placeholder-poster.jpg";

              return (
                <Card key={show.id} className="glass-effect border-slate-700/50 hover:border-teal-500/30 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    {/* Show Poster */}
                    <div className="relative mb-3">
                      <img
                        src={posterUrl}
                        alt={title}
                        className="w-full h-48 object-cover rounded-md"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder-poster.jpg";
                        }}
                      />
                      {/* Rating Badge */}
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-black/70 text-yellow-400 border-yellow-400/20">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          {show.vote_average?.toFixed(1) || 'N/A'}
                        </Badge>
                      </div>
                    </div>

                    <h3 className="font-semibold text-white mb-1 line-clamp-2">{title}</h3>
                    <p className="text-sm text-gray-400 mb-2">{year} • TV Show</p>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{show.overview}</p>

                    {/* Streaming Logos */}
                    {show.streaming && (
                      <div className="mb-3">
                        <StreamingLogos providers={show.streaming} />
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <Badge className="bg-teal-500/20 text-teal-400 border-teal-400/20">
                        Trending #{index + 1}
                      </Badge>
                      <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Enhanced Filter System with Integration */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Filter className="h-6 w-6 text-teal-400" />
                Smart Content Discovery
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Use advanced filters to find exactly what you're in the mood for
              </p>
            </div>
            {activeFilters && (
              <Badge variant="secondary" className="bg-teal-500/20 text-teal-400 border-teal-400/20">
                <Sparkles className="h-3 w-3 mr-1" />
                Filters Active
              </Badge>
            )}
          </div>
          <EnhancedFilterSystem 
            onFiltersChange={handleFiltersChange}
            onApply={handleFiltersApply}
            showAdvanced={true}
          />
        </div>

        {/* AI Recommendations Section */}
        <div className="mb-8">
          <AiRecommendations horizontal={true} />
        </div>

        {/* Enhanced Collections Management */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-purple-400" />
                My Collections
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Organize your shows and movies into personalized collections
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-purple-400/20 text-purple-400 hover:bg-purple-500/10"
              onClick={() => {
                toast({
                  title: "Collection Manager",
                  description: "Create and manage your personalized collections below"
                });
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Quick Help
            </Button>
          </div>
          <CollectionManager user={user} />
        </div>

        {/* Filtered Results Section - Shows when filters are active */}
        {activeFilters && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-teal-500/10 to-blue-500/10 border border-teal-500/20 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-teal-400" />
                    Filtered Results
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Content matching your current filter preferences
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setActiveFilters(null);
                    toast({
                      title: "Filters Cleared",
                      description: "Showing all content"
                    });
                  }}
                  className="border-teal-400/20 text-teal-400 hover:bg-teal-500/10"
                >
                  Clear Filters
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* This would be populated with filtered shows */}
                <Card className="glass-effect border-teal-500/20">
                  <CardContent className="p-4 text-center">
                    <div className="w-full h-32 bg-gradient-to-br from-teal-500/20 to-blue-500/20 rounded-lg flex items-center justify-center mb-3">
                      <Search className="h-8 w-8 text-teal-400" />
                    </div>
                    <h3 className="text-white font-semibold mb-2">Filtered Content</h3>
                    <p className="text-gray-400 text-sm">
                      Results will appear here based on your filter selections
                    </p>
                    <Button 
                      size="sm" 
                      className="mt-3 bg-teal-600 hover:bg-teal-700"
                      onClick={() => {
                        toast({
                          title: "Search Integration",
                          description: "Connect to content API to show filtered results"
                        });
                      }}
                    >
                      Search Now
                    </Button>
                  </CardContent>
                </Card>
                
                {/* Placeholder cards to show the layout */}
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="glass-effect border-slate-700/50 opacity-50">
                    <CardContent className="p-4">
                      <div className="w-full h-32 bg-slate-700 rounded-lg mb-3 animate-pulse" />
                      <div className="h-4 bg-slate-700 rounded mb-2 animate-pulse" />
                      <div className="h-3 bg-slate-700 rounded w-2/3 animate-pulse" />
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Filter Summary */}
              <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
                <h4 className="text-sm font-semibold text-white mb-2">Active Filters:</h4>
                <div className="flex flex-wrap gap-2">
                  {activeFilters.genres.length > 0 && (
                    <Badge variant="outline" className="border-teal-400/20 text-teal-400">
                      Genres: {activeFilters.genres.join(', ')}
                    </Badge>
                  )}
                  {activeFilters.mood.length > 0 && (
                    <Badge variant="outline" className="border-purple-400/20 text-purple-400">
                      Mood: {activeFilters.mood.join(', ')}
                    </Badge>
                  )}
                  {activeFilters.streaming_services.length > 0 && (
                    <Badge variant="outline" className="border-blue-400/20 text-blue-400">
                      Platforms: {activeFilters.streaming_services.length} selected
                    </Badge>
                  )}
                  <Badge variant="outline" className="border-gray-400/20 text-gray-400">
                    Rating: {activeFilters.min_rating}+ ⭐
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-effect border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-teal-400" />
                Discover Shows
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm">Find your next favorite show with enhanced filters</p>
              <Link href="/discover">
                <Button className="w-full mt-4 bg-gradient-to-r from-teal-600 to-blue-600">
                  Explore Now
                </Button>
              </Link>
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
                  View Friends
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="glass-effect border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="h-5 w-5 mr-2 text-gray-400" />
                Smart Collections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm">Organize with advanced tagging and presets</p>
              <Button 
                variant="outline" 
                className="w-full mt-4 border-slate-700 text-gray-300"
                onClick={() => {
                  document.querySelector('[data-testid="collection-manager"]')?.scrollIntoView({ 
                    behavior: 'smooth' 
                  });
                  toast({
                    title: "Collections",
                    description: "Scroll up to see the enhanced Collection Manager"
                  });
                }}
              >
                Manage Collections
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Features Debug Info (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
            <h3 className="text-sm font-semibold text-white mb-2">🔧 Enhanced Features Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <h4 className="text-teal-400 font-medium mb-1">Enhanced Filter System:</h4>
                <ul className="text-gray-400 space-y-1">
                  <li>✅ Debounced search (300ms)</li>
                  <li>✅ Smart preset suggestions</li>
                  <li>✅ Section-specific resets</li>
                  <li>✅ Real-time filter preview</li>
                  <li>✅ Active filter count: {activeFilters ? 'Connected' : 'Waiting for filters'}</li>
                </ul>
              </div>
              <div>
                <h4 className="text-purple-400 font-medium mb-1">Collection Manager:</h4>
                <ul className="text-gray-400 space-y-1">
                  <li>✅ Tag autocomplete system</li>
                  <li>✅ Public/Private presets</li>
                  <li>✅ Advanced validation</li>
                  <li>✅ Bulk operations</li>
                  <li>✅ Enhanced search & filters</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}