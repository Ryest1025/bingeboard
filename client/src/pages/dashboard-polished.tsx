import React, { useCallback, useMemo, useState, useEffect, memo } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EnhancedShowCard } from '@/components/EnhancedShowCard';
import FilterControls from '@/components/FilterControls';
import StreamingLogos from '@/components/StreamingLogos';
import NavigationHeader from '@/components/navigation-header';
import { GRADIENTS, getRatingColor } from '@/styles/constants';

import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Star, TrendingUp, Play, Calendar, Users, Activity, AlertCircle, RefreshCw } from 'lucide-react';

// TMDB Genre Map
const GENRE_MAP: Record<number, string> = {
  10759: 'Action & Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  10762: 'Kids',
  9648: 'Mystery',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
  37: 'Western',
  28: 'Action',
  12: 'Adventure',
  14: 'Fantasy',
  27: 'Horror',
  36: 'History',
  53: 'Thriller',
  10749: 'Romance',
  878: 'Science Fiction',
  10752: 'War',
};

interface Show {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  vote_average?: number;
  first_air_date?: string;
  release_date?: string;
  genre_ids?: number[];
  popularity?: number;
  streaming_platforms?: Array<{
    provider_name: string;
    logo_path?: string;
  }>;
}

interface ActivityItem {
  id: string;
  friendName: string;
  friendAvatar: string;
  showTitle: string;
  showThumbnail: string;
  action: string;
  timeAgo: string;
  rating?: number;
}

// Memoized show card component for performance
const MemoizedShowCard = memo(EnhancedShowCard);

export default function PolishedDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [currentSpotlightIndex, setCurrentSpotlightIndex] = React.useState(0);
  const [isSpotlightPaused, setIsSpotlightPaused] = React.useState(false);
  
  // Persistent filter state with localStorage - matching FilterControls interface
  const [selectedGenre, setSelectedGenre] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dashboard-filters');
      return saved ? JSON.parse(saved).genre || '' : '';
    }
    return '';
  });
  
  const [selectedNetwork, setSelectedNetwork] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dashboard-filters');
      return saved ? JSON.parse(saved).network || '' : '';
    }
    return '';
  });
  
  const [selectedYear, setSelectedYear] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dashboard-filters');
      return saved ? JSON.parse(saved).year || '' : '';
    }
    return '';
  });
  
  const [sortBy, setSortBy] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dashboard-filters');
      return saved ? JSON.parse(saved).sortBy || 'popularity' : 'popularity';
    }
    return 'popularity';
  });

  // Persist filters to localStorage
  useEffect(() => {
    const filterState = {
      genre: selectedGenre,
      network: selectedNetwork,
      year: selectedYear,
      sortBy: sortBy
    };
    localStorage.setItem('dashboard-filters', JSON.stringify(filterState));
  }, [selectedGenre, selectedNetwork, selectedYear, sortBy]);

  // Fetch spotlight/trending content
  const { 
    data: spotlightData, 
    isLoading: spotlightLoading, 
    error: spotlightError,
    refetch: refetchSpotlight 
  } = useQuery({
    queryKey: ['spotlight-trending'],
    queryFn: async () => {
      const res = await fetch('/api/content/trending-enhanced?includeStreaming=true');
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch trending content`);
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    retry: 2
  });

  // Fetch genres for filter dropdown
  const { 
    data: genresData, 
    error: genresError 
  } = useQuery({
    queryKey: ['genres-list'],
    queryFn: async () => {
      const res = await fetch('/api/content/genres-combined/list');
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch genres`);
      return res.json();
    },
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes
    retry: 2
  });

  // Handle errors with toasts
  useEffect(() => {
    if (spotlightError) {
      console.error('Spotlight fetch error:', spotlightError);
      toast({
        title: "Failed to load trending content",
        description: "Please try refreshing the page",
        variant: "destructive",
      });
    }
  }, [spotlightError, toast]);

  useEffect(() => {
    if (genresError) {
      console.error('Genres fetch error:', genresError);
      // Silent error for genres since it's not critical
    }
  }, [genresError]);

  // Fetch unified recommendations with filters
  const { 
    data: recommendationsData, 
    isLoading: recommendationsLoading,
    error: recommendationsError,
    refetch: refetchRecommendations 
  } = useQuery({
    queryKey: ['unified-recommendations', user?.id, selectedGenre, selectedNetwork, selectedYear, sortBy],
    queryFn: async () => {
      const res = await fetch('/api/recommendations/unified', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filters: {
            hideWatched: true,
            genre: selectedGenre !== '' ? selectedGenre : undefined,
            network: selectedNetwork !== '' ? selectedNetwork : undefined,
            year: selectedYear !== '' ? selectedYear : undefined,
            sortBy: sortBy,
            rating: '7.0' // Default minimum rating
          },
          userProfile: {
            favoriteGenres: user?.preferences?.favoriteGenres || ['Drama', 'Comedy'],
            preferredNetworks: user?.preferences?.preferredNetworks || ['Netflix', 'HBO'],
            viewingHistory: [],
            watchlist: [],
            currentlyWatching: [],
            recentlyWatched: []
          },
          limit: 12
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch recommendations`);
      return res.json();
    },
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000,
    retry: 2
  });

  // Fetch continue watching
  const { 
    data: continueWatchingData, 
    isLoading: continueWatchingLoading,
    error: continueWatchingError 
  } = useQuery({
    queryKey: ['continue-watching', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/viewing-history/continue-watching-enhanced');
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch continue watching`);
      return res.json();
    },
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
    retry: 2
  });

  // Handle API errors with toasts
  useEffect(() => {
    if (recommendationsError) {
      console.error('Recommendations fetch error:', recommendationsError);
      toast({
        title: "Failed to load recommendations",
        description: "We couldn't load your personalized recommendations",
        variant: "destructive",
      });
    }
  }, [recommendationsError, toast]);

  useEffect(() => {
    if (continueWatchingError) {
      console.error('Continue watching fetch error:', continueWatchingError);
      // Silent error since continue watching is not critical
    }
  }, [continueWatchingError]);

  /** Derived Data */
  const spotlightShows = useMemo(() => {
    // Use first 5 recommendations for spotlight
    if (!recommendationsData?.recommendations) return [];
    return recommendationsData.recommendations.slice(0, 5);
  }, [recommendationsData]);

  const recommendations = useMemo(() => {
    // Skip first 5 (used for spotlight) for main recommendations
    if (!recommendationsData?.recommendations) return [];
    return recommendationsData.recommendations.slice(5);
  }, [recommendationsData]);

  const continueWatching = useMemo(() => {
    return continueWatchingData || [];
  }, [continueWatchingData]);

  const currentSpotlightShow = useMemo(() => {
    return spotlightShows[currentSpotlightIndex] || null;
  }, [spotlightShows, currentSpotlightIndex]);

  // Auto-cycle spotlight every 8 seconds (with pause on hover)
  React.useEffect(() => {
    if (spotlightShows.length > 1 && !isSpotlightPaused) {
      const interval = setInterval(() => {
        setCurrentSpotlightIndex((prev) => (prev + 1) % spotlightShows.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [spotlightShows.length, isSpotlightPaused]);

  /** Event Handlers */
  const handleAddToWatchlist = useCallback(async (show: Show) => {
    if (!isAuthenticated || !user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to add shows to your watchlist",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/watchlist/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          showId: show.id,
          showTitle: show.title || show.name,
          showType: show.title ? 'movie' : 'tv',
          posterPath: show.poster_path,
          overview: show.overview,
          voteAverage: show.vote_average,
          releaseDate: show.release_date || show.first_air_date
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add to watchlist');
      }

      toast({
        title: "Added to watchlist",
        description: `${show.title || show.name} has been added to your watchlist`,
      });
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      toast({
        title: "Failed to add to watchlist",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, user?.id, toast]);

  const handleShareContent = useCallback(async (show: Show) => {
    const shareTitle = show.title || show.name;
    const shareText = `Check out "${shareTitle}" - ${show.overview || 'A great show to watch!'}`;
    const shareUrl = `${window.location.origin}/show/${show.id}`;

    // Try native sharing first
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        toast({
          title: "Shared successfully",
          description: `${shareTitle} has been shared`,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        toast({
          title: "Copied to clipboard",
          description: `Link for "${shareTitle}" copied to clipboard`,
        });
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        toast({
          title: "Sharing failed",
          description: "Unable to share or copy link",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const handleShowClick = useCallback((show: Show) => {
    // For now, we'll show a toast with show details
    // In the future, this would open a modal or navigate to a detail page
    toast({
      title: show.title || show.name || 'Show Details',
      description: show.overview || 'No description available',
    });
  }, [toast]);

  // Mock friend activity data
  const friendActivities: ActivityItem[] = [
    {
      id: '1',
      friendName: 'Alice Johnson',
      friendAvatar: '/placeholder-avatar.png',
      showTitle: 'The Bear',
      showThumbnail: 'https://image.tmdb.org/t/p/w300/ryu4KGKgNzd1w8SwKHzG3Vq8VLi.jpg',
      action: 'rated',
      timeAgo: '2 hours ago',
      rating: 9.5,
    },
    {
      id: '2',
      friendName: 'Bob Smith',
      friendAvatar: '/placeholder-avatar.png',
      showTitle: 'House of the Dragon',
      showThumbnail: 'https://image.tmdb.org/t/p/w300/7QMsOTMUswlwxJP0rTTZfmz2tX2.jpg',
      action: 'watched',
      timeAgo: '5 hours ago',
    },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Skeleton className="w-16 h-16 rounded-full mx-auto" />
          <Skeleton className="w-32 h-4" />
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
        <main className="container mx-auto px-4 py-8 space-y-8">
          {/* Welcome Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Welcome back{user?.displayName ? `, ${user.displayName}` : ''}!
            </h1>
            <p className="text-slate-400">Discover your next favorite show</p>
          </div>

          {/* TEMPORARY: Streaming Debug Test */}


          {/* Spotlight Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-purple-400" />
              <h2 className="text-2xl font-bold">Trending Now</h2>
            </div>
            
            {spotlightLoading ? (
              <Skeleton className="w-full h-96 rounded-xl" />
            ) : spotlightError ? (
              <Alert className="border-red-500/50 bg-red-900/20">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>Failed to load trending content</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => refetchSpotlight()}
                    className="ml-4"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            ) : currentSpotlightShow ? (
              <Card 
                className="relative overflow-hidden border-0 bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm"
                onMouseEnter={() => setIsSpotlightPaused(true)}
                onMouseLeave={() => setIsSpotlightPaused(false)}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                {currentSpotlightShow.backdrop_path && (
                  <img
                    src={`https://image.tmdb.org/t/p/original${currentSpotlightShow.backdrop_path}`}
                    alt={`${currentSpotlightShow.title || currentSpotlightShow.name} backdrop`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                <CardContent className="relative z-20 p-8 min-h-[400px] flex items-end">
                  <div className="space-y-4 max-w-2xl">
                    <h3 className="text-4xl font-bold text-white">
                      {currentSpotlightShow.title || currentSpotlightShow.name}
                    </h3>
                    <div className="flex items-center gap-4">
                      {currentSpotlightShow.vote_average && (
                        <div className={`flex items-center gap-1 ${getRatingColor(currentSpotlightShow.vote_average)}`}>
                          <Star className="h-5 w-5 fill-current" />
                          <span className="font-medium">
                            {currentSpotlightShow.vote_average.toFixed(1)}
                          </span>
                        </div>
                      )}
                      {currentSpotlightShow.genre_ids && (
                        <div className="flex gap-2">
                          {currentSpotlightShow.genre_ids.slice(0, 2).map((genreId: number) => (
                            <Badge key={genreId} className="bg-slate-700/50 text-slate-300">
                              {GENRE_MAP[genreId] || 'Unknown'}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-slate-300 text-lg line-clamp-3 leading-relaxed">
                      {currentSpotlightShow.overview || 'No description available.'}
                    </p>
                    <div className="flex gap-3">
                      <Button className={`${GRADIENTS.trailer} text-white font-medium`}>
                        <Play className="h-4 w-4 mr-2" />
                        Watch Trailer
                      </Button>
                      <Button 
                        variant="outline" 
                        className="border-white/20 text-white hover:bg-white/10"
                        onClick={() => handleAddToWatchlist(currentSpotlightShow)}
                      >
                        Add to Watchlist
                      </Button>
                    </div>
                  </div>
                </CardContent>
                {spotlightShows.length > 1 && (
                  <div className="absolute bottom-4 right-4 flex gap-2 z-20" role="tablist" aria-label="Spotlight navigation">
                    {spotlightShows.map((show: Show, index: number) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSpotlightIndex(index)}
                        className={`w-3 h-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 ${
                          index === currentSpotlightIndex
                            ? 'bg-white'
                            : 'bg-white/40 hover:bg-white/60'
                        }`}
                        role="tab"
                        aria-selected={index === currentSpotlightIndex}
                        aria-label={`View ${show.title || show.name} spotlight`}
                        tabIndex={0}
                      />
                    ))}
                  </div>
                )}
              </Card>
            ) : (
              <div className="h-96 flex items-center justify-center bg-slate-800/20 rounded-xl">
                <p className="text-slate-400">No trending content available</p>
              </div>
            )}
          </section>

          {/* AI Recommendations */}
          {isAuthenticated && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Star className="h-6 w-6 text-yellow-400" />
                <h2 className="text-2xl font-bold">Recommended for You</h2>
              </div>
              
              {/* Filter Controls */}
              <FilterControls
                selectedGenre={selectedGenre}
                selectedNetwork={selectedNetwork}
                selectedYear={selectedYear}
                sortBy={sortBy}
                onGenreChange={setSelectedGenre}
                onNetworkChange={setSelectedNetwork}
                onYearChange={setSelectedYear}
                onSortChange={setSortBy}
                genres={genresData || []}
                compact={true}
              />
              
              {recommendationsLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
                  ))}
                </div>
              ) : recommendationsError ? (
                <Alert className="border-red-500/50 bg-red-900/20">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>Failed to load recommendations</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => refetchRecommendations()}
                      className="ml-4"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Retry
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : recommendations.length > 0 ? (
                <div className="space-y-4">
                  {recommendations.slice(0, 10).map((show: Show) => (
                    <MemoizedShowCard
                      key={show.id}
                      show={show}
                      variant="trending"
                      onAddToWatchlist={handleAddToWatchlist}
                      onShareContent={handleShareContent}
                      onCardClick={handleShowClick}
                      genreMap={GENRE_MAP}
                      size="md"
                    />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-800/20 rounded-xl">
                  <p className="text-slate-400" role="status">No recommendations available yet</p>
                  <p className="text-sm text-slate-500 mt-2">
                    Start watching shows to get personalized recommendations!
                  </p>
                </div>
              )}
            </section>
          )}

          {/* Continue Watching */}
          {isAuthenticated && continueWatching.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Play className="h-6 w-6 text-green-400" />
                <h2 className="text-2xl font-bold">Continue Watching</h2>
              </div>
              
              <div className="space-y-4">
                {continueWatching.slice(0, 5).map((show: Show) => (
                  <MemoizedShowCard
                    key={show.id}
                    show={show}
                    variant="search"
                    onAddToWatchlist={handleAddToWatchlist}
                    onShareContent={handleShareContent}
                    onCardClick={handleShowClick}
                    genreMap={GENRE_MAP}
                    size="md"
                  />
                ))}
              </div>
            </section>
          )}

          {/* Friend Activity */}
          {isAuthenticated && friendActivities.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-6 w-6 text-blue-400" />
                <h2 className="text-2xl font-bold">Friend Activity</h2>
              </div>
              
              <div className="grid gap-4">
                {friendActivities.map((activity) => (
                  <Card key={activity.id} className="bg-slate-800/50 border-slate-700/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={activity.friendAvatar}
                          alt={activity.friendName}
                          className="w-10 h-10 rounded-full bg-slate-700"
                        />
                        <div className="flex-1">
                          <p className="text-white">
                            <span className="font-medium">{activity.friendName}</span>
                            {' '}
                            <span className="text-slate-400">{activity.action}</span>
                            {' '}
                            <span className="font-medium">{activity.showTitle}</span>
                            {activity.rating && (
                              <>
                                {' '}
                                <span className="text-slate-400">and rated it</span>
                                {' '}
                                <span className={getRatingColor(activity.rating)}>
                                  {activity.rating}/10
                                </span>
                              </>
                            )}
                          </p>
                          <p className="text-sm text-slate-500">{activity.timeAgo}</p>
                        </div>
                        {activity.showThumbnail && (
                          <img
                            src={activity.showThumbnail}
                            alt={activity.showTitle}
                            className="w-16 h-24 object-cover rounded bg-slate-700"
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Development Debug */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-8 p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
              <summary className="cursor-pointer text-gray-300 font-medium">
                🔧 Development Debug Info
              </summary>
              <div className="mt-4 space-y-2 text-sm text-gray-400">
                <div>Spotlight Shows: {spotlightShows.length}</div>
                <div>Recommendations: {recommendations.length}</div>
                <div>Continue Watching: {continueWatching.length}</div>
                <div>Friend Activities: {friendActivities.length}</div>
                <div>User: {user?.displayName || 'Not authenticated'}</div>
              </div>
            </details>
          )}
        </main>
      </div>
    </TooltipProvider>
  );
}