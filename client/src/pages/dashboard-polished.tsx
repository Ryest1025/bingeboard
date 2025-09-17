import React, { useCallback, useMemo } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedShowCard } from '@/components/enhanced-show-card-clean';
import { GRADIENTS, HOVER_EFFECTS, getRatingColor } from '@/styles/constants';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { Star, TrendingUp, Play, Calendar, Users, Activity } from 'lucide-react';

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

export default function PolishedDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [currentSpotlightIndex, setCurrentSpotlightIndex] = React.useState(0);

  // Fetch spotlight/trending content
  const { data: spotlightData, isLoading: spotlightLoading } = useQuery({
    queryKey: ['spotlight-trending'],
    queryFn: async () => {
      const res = await fetch('/api/content/trending-by-network');
      if (!res.ok) throw new Error('Failed to fetch spotlight');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch unified recommendations with filters
  const { data: recommendationsData, isLoading: recommendationsLoading } = useQuery({
    queryKey: ['unified-recommendations', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/recommendations/unified', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filters: {
            // Add default filters - these will be properly processed by our new backend
            hideWatched: true,
            genre: 'all', // Will be filtered out as invalid
            rating: '7.0' // Minimum rating filter
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
      if (!res.ok) throw new Error('Failed to fetch unified recommendations');
      return res.json();
    },
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000,
  });

  // Fetch continue watching
  const { data: continueWatchingData, isLoading: continueWatchingLoading } = useQuery({
    queryKey: ['continue-watching', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/viewing-history/continue-watching-enhanced');
      if (!res.ok) throw new Error('Failed to fetch continue watching');
      return res.json();
    },
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });

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

  // Auto-cycle spotlight every 8 seconds
  React.useEffect(() => {
    if (spotlightShows.length > 1) {
      const interval = setInterval(() => {
        setCurrentSpotlightIndex((prev) => (prev + 1) % spotlightShows.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [spotlightShows.length]);

  /** Event Handlers */
  const handleAddToWatchlist = useCallback((show: Show) => {
    console.log('Adding to watchlist:', show.title || show.name);
    // TODO: Implement watchlist functionality
  }, []);

  const handleShareContent = useCallback((show: Show) => {
    console.log('Sharing:', show.title || show.name);
    // TODO: Implement share functionality
  }, []);

  const handleShowClick = useCallback((show: Show) => {
    console.log('Show clicked:', show.title || show.name);
    // TODO: Implement show details modal
  }, []);

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

          {/* Spotlight Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-purple-400" />
              <h2 className="text-2xl font-bold">Trending Now</h2>
            </div>
            
            {spotlightLoading ? (
              <Skeleton className="w-full h-96 rounded-xl" />
            ) : currentSpotlightShow ? (
              <Card className="relative overflow-hidden border-0 bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                {currentSpotlightShow.backdrop_path && (
                  <img
                    src={`https://image.tmdb.org/t/p/original${currentSpotlightShow.backdrop_path}`}
                    alt=""
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
                  <div className="absolute bottom-4 right-4 flex gap-2 z-20">
                    {spotlightShows.map((_: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSpotlightIndex(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === currentSpotlightIndex
                            ? 'bg-white'
                            : 'bg-white/40 hover:bg-white/60'
                        }`}
                        aria-label={`Show spotlight ${index + 1}`}
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
              
              {recommendationsLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
                  ))}
                </div>
              ) : recommendations.length > 0 ? (
                <div className="space-y-4">
                  {recommendations.slice(0, 10).map((show: Show) => (
                    <EnhancedShowCard
                      key={show.id}
                      show={show}
                      variant="detailed"
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
                  <p className="text-slate-400">No recommendations available yet</p>
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
                  <EnhancedShowCard
                    key={show.id}
                    show={show}
                    variant="default"
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