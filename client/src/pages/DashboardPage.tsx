import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Play, 
  Plus, 
  Star, 
  TrendingUp, 
  Clock, 
  Users,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { EnhancedShowCard } from '@/components/EnhancedShowCard';
import { EnhancedFilterSystem, FilterState } from '@/components/EnhancedFilterSystem';
import { FriendActivityCard } from '@/components/FriendActivityCard';
import { GRADIENTS, TRANSITIONS, getRatingColor } from '@/styles/constants';
import { useAuth } from '@/hooks/useAuth';

interface Show {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  backdrop_path?: string;
  vote_average?: number;
  genre_ids?: number[];
  overview?: string;
  release_date?: string;
  first_air_date?: string;
  media_type?: 'movie' | 'tv';
  streaming_platforms?: Array<{
    provider_name: string;
    logo_path?: string;
  }>;
}

interface ContinueWatchingItem {
  id: string;
  show: Show;
  progress: number;
  lastWatched: string;
  episodeNumber?: number;
  seasonNumber?: number;
}

interface FriendActivity {
  id: string;
  friend: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  type: 'watched' | 'liked' | 'added_to_list' | 'rated' | 'commented';
  show: Show;
  timestamp: string;
  rating?: number;
  comment?: string;
  listName?: string;
}

const GENRE_NAMES: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
  10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western'
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [currentSpotlightIndex, setCurrentSpotlightIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    genre: 'all',
    year: 'all',
    rating: [0, 10],
    runtime: [0, 300],
    platform: 'all',
    status: 'all',
    sortBy: 'popularity.desc',
    hideWatched: false,
    onlyWatchlist: false,
    includeFriends: true,
    searchQuery: '',
    contentType: 'all'
  });

  // Fetch unified recommendations with filters
  const { data: recommendationsData, isLoading: recommendationsLoading, refetch: refetchRecommendations } = useQuery({
    queryKey: ['unified-recommendations', user?.id, filters],
    queryFn: async () => {
      const res = await fetch('/api/recommendations/unified', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filters: {
            ...filters,
            genre: filters.genre === 'all' ? undefined : filters.genre,
            year: filters.year === 'all' ? undefined : filters.year,
            platform: filters.platform === 'all' ? undefined : filters.platform,
            rating_gte: filters.rating[0] > 0 ? filters.rating[0] : undefined,
            rating_lte: filters.rating[1] < 10 ? filters.rating[1] : undefined,
            runtime_gte: filters.runtime[0] > 0 ? filters.runtime[0] : undefined,
            runtime_lte: filters.runtime[1] < 300 ? filters.runtime[1] : undefined,
          },
          userProfile: {
            favoriteGenres: user?.preferences?.favoriteGenres || ['Drama', 'Comedy'],
            preferredNetworks: user?.preferences?.preferredNetworks || ['Netflix', 'HBO'],
            viewingHistory: [],
            watchlist: [],
            currentlyWatching: [],
            recentlyWatched: []
          },
          limit: 20
        })
      });
      if (!res.ok) throw new Error('Failed to fetch unified recommendations');
      return res.json();
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000,
  });

  // Fetch continue watching
  const { data: continueWatchingData } = useQuery({
    queryKey: ['continue-watching', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/watchlist/continue-watching');
      if (!res.ok) throw new Error('Failed to fetch continue watching');
      return res.json();
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch friend activity
  const { data: friendActivityData } = useQuery({
    queryKey: ['friend-activity', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/social/activity');
      if (!res.ok) throw new Error('Failed to fetch friend activity');
      return res.json();
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });

  // Process data
  const spotlightShows = useMemo(() => {
    if (!recommendationsData?.recommendations) return [];
    return recommendationsData.recommendations.slice(0, 5);
  }, [recommendationsData]);

  const trendingShows = useMemo(() => {
    if (!recommendationsData?.recommendations) return [];
    return recommendationsData.recommendations.slice(5, 11);
  }, [recommendationsData]);

  const upcomingShows = useMemo(() => {
    if (!recommendationsData?.recommendations) return [];
    // Filter for upcoming releases
    return recommendationsData.recommendations.filter((show: Show) => {
      const releaseDate = show.release_date || show.first_air_date;
      return releaseDate && new Date(releaseDate) > new Date();
    }).slice(0, 6);
  }, [recommendationsData]);

  const continueWatching = useMemo(() => {
    return continueWatchingData || [];
  }, [continueWatchingData]);

  const friendActivity = useMemo(() => {
    return friendActivityData?.activities || [];
  }, [friendActivityData]);

  const currentSpotlightShow = useMemo(() => {
    return spotlightShows[currentSpotlightIndex] || null;
  }, [spotlightShows, currentSpotlightIndex]);

  // Auto-cycle spotlight every 8 seconds
  useEffect(() => {
    if (spotlightShows.length > 1) {
      const interval = setInterval(() => {
        setCurrentSpotlightIndex((prev) => (prev + 1) % spotlightShows.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [spotlightShows.length]);

  // Handle filter changes
  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    refetchRecommendations();
  };

  const handleResetFilters = () => {
    setFilters({
      genre: 'all',
      year: 'all',
      rating: [0, 10],
      runtime: [0, 300],
      platform: 'all',
      status: 'all',
      sortBy: 'popularity.desc',
      hideWatched: false,
      onlyWatchlist: false,
      includeFriends: true,
      searchQuery: '',
      contentType: 'all'
    });
  };

  // Event handlers
  const handleAddToWatchlist = async (show: Show) => {
    try {
      const res = await fetch('/api/watchlist/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tmdbId: show.id,
          title: show.title || show.name,
          type: show.media_type || 'movie'
        })
      });
      if (!res.ok) throw new Error('Failed to add to watchlist');
      // Could show success toast here
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    }
  };

  const handleShareContent = async (show: Show) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: show.title || show.name,
          text: `Check out ${show.title || show.name} on BingeBoard!`,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  const handleShowClick = (show: Show) => {
    // Navigate to show detail page
    console.log('Show clicked:', show);
  };

  const handleContinueWatching = (item: ContinueWatchingItem) => {
    console.log('Continue watching:', item);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Please log in to view your dashboard</h2>
          <Button>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user.name}!
            </h1>
            <p className="text-slate-400">
              Discover your next favorite show or movie
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search shows and movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-80 bg-slate-800 border-slate-700 text-white"
              />
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Enhanced Filter System */}
        {showFilters && (
          <EnhancedFilterSystem
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onApplyFilters={handleApplyFilters}
            onResetFilters={handleResetFilters}
            isLoading={recommendationsLoading}
            resultCount={recommendationsData?.recommendations?.length || 0}
          />
        )}

        {/* Spotlight Hero Section */}
        {currentSpotlightShow && (
          <Card className="relative overflow-hidden bg-slate-800/50 border-slate-700">
            <div className="relative h-80 md:h-96">
              {/* Background Image */}
              {currentSpotlightShow.backdrop_path && (
                <img
                  src={`https://image.tmdb.org/t/p/original${currentSpotlightShow.backdrop_path}`}
                  alt={currentSpotlightShow.title || currentSpotlightShow.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
              
              {/* Content */}
              <div className="relative h-full flex items-center p-8">
                <div className="max-w-2xl space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                      Featured
                    </Badge>
                  </div>
                  
                  <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                    {currentSpotlightShow.title || currentSpotlightShow.name}
                  </h2>
                  
                  <div className="flex items-center gap-4 text-slate-300">
                    {currentSpotlightShow.vote_average && (
                      <div className={`flex items-center gap-1 ${getRatingColor(currentSpotlightShow.vote_average)}`}>
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-medium">
                          {currentSpotlightShow.vote_average.toFixed(1)}
                        </span>
                      </div>
                    )}
                    
                    {currentSpotlightShow.genre_ids && (
                      <div className="flex gap-2">
                        {currentSpotlightShow.genre_ids.slice(0, 2).map((genreId: number) => (
                          <Badge key={genreId} variant="outline" className="border-slate-600 text-slate-300">
                            {GENRE_NAMES[genreId] || `Genre ${genreId}`}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-slate-300 text-lg leading-relaxed line-clamp-3">
                    {currentSpotlightShow.overview || 'No description available.'}
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <Button 
                      size="lg" 
                      className={`${GRADIENTS.trailer} text-white font-semibold ${TRANSITIONS.button}`}
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Watch Trailer
                    </Button>
                    
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-slate-600 text-white hover:bg-slate-800"
                      onClick={() => handleAddToWatchlist(currentSpotlightShow)}
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add to Watchlist
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Spotlight Indicators */}
              {spotlightShows.length > 1 && (
                <div className="absolute bottom-4 right-4 flex gap-2">
                  {spotlightShows.map((_: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSpotlightIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentSpotlightIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Continue Watching */}
        {continueWatching.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Clock className="w-6 h-6 text-blue-500" />
                Continue Watching
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {continueWatching.map((item: ContinueWatchingItem) => (
                <Card 
                  key={item.id}
                  className="group cursor-pointer bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 transition-colors"
                  onClick={() => handleContinueWatching(item)}
                >
                  <CardContent className="p-0">
                    <div className="relative aspect-video overflow-hidden rounded-t-lg">
                      {item.show.backdrop_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w500${item.show.backdrop_path}`}
                          alt={item.show.title || item.show.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                          <Play className="w-8 h-8 text-slate-500" />
                        </div>
                      )}
                      
                      {/* Progress Bar */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700">
                        <div 
                          className="h-full bg-red-500 transition-all duration-300"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                        <Button size="sm" className="bg-white/90 text-black hover:bg-white">
                          <Play className="w-4 h-4 mr-1" />
                          Continue
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-3">
                      <h3 className="font-semibold text-white line-clamp-1 mb-1">
                        {item.show.title || item.show.name}
                      </h3>
                      {item.episodeNumber && item.seasonNumber && (
                        <p className="text-xs text-slate-400">
                          S{item.seasonNumber} E{item.episodeNumber} • {item.progress}% complete
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          
          {/* Left Column - Recommendations */}
          <div className="xl:col-span-3 space-y-8">
            
            {/* Trending Shows */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-purple-500" />
                  Trending Now
                </h2>
                <Button variant="ghost" className="text-slate-400 hover:text-white">
                  View All
                </Button>
              </div>
              
              {recommendationsLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-[2/3] bg-slate-800 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {trendingShows.map((show: Show) => (
                    <EnhancedShowCard
                      key={show.id}
                      show={show}
                      variant="detailed"
                      onAddToWatchlist={handleAddToWatchlist}
                      onShareContent={handleShareContent}
                      onCardClick={handleShowClick}
                      size="md"
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Upcoming Releases */}
            {upcomingShows.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Star className="w-6 h-6 text-emerald-500" />
                    Coming Soon
                  </h2>
                  <Button variant="ghost" className="text-slate-400 hover:text-white">
                    View All
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {upcomingShows.map((show: Show) => (
                    <EnhancedShowCard
                      key={show.id}
                      show={show}
                      variant="default"
                      onAddToWatchlist={handleAddToWatchlist}
                      onShareContent={handleShareContent}
                      onCardClick={handleShowClick}
                      size="md"
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column - Friend Activity */}
          <div className="xl:col-span-1">
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Friend Activity
                </h2>
              </div>
              
              <div className="space-y-4">
                {friendActivity.length > 0 ? (
                  friendActivity.slice(0, 5).map((activity: FriendActivity) => (
                    <FriendActivityCard
                      key={activity.id}
                      activity={activity}
                      onShowClick={handleShowClick}
                      onAddToWatchlist={handleAddToWatchlist}
                    />
                  ))
                ) : (
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-6 text-center">
                      <Users className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                      <p className="text-slate-400 text-sm">
                        No friend activity yet. Add some friends to see what they're watching!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Debug Info (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="bg-slate-800/30 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Debug Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>Recommendations: {recommendationsData?.recommendations?.length || 0}</div>
                <div>Spotlight Shows: {spotlightShows.length}</div>
                <div>Continue Watching: {continueWatching.length}</div>
                <div>Friend Activity: {friendActivity.length}</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}