import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useStreamingEnrichedContent } from "@/hooks/useStreamingEnrichedContent";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TopNav } from "@/components/top-nav";
import MobileNav from "@/components/mobile-nav";
import { StreamingPlatformSelector } from "@/components/streaming-platform-selector";
import { ListSelectorModal } from "@/components/list-selector-modal";
import { AiRecommendations } from "@/components/ai-recommendations";
import { useToast } from "@/hooks/use-toast";
import { HorizontalScrollContainer } from "@/components/ui/HorizontalScrollContainer";
import { ContentCard } from "@/components/ui/ContentCard";
import { StreamingLogos } from "@/components/ui/StreamingLogos";
import { StreamingPlatformSelector as UniversalStreamingPlatformSelector } from "@/components/ui/StreamingPlatformSelector";
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
  Share,
  Bell,
  Settings,
  CheckCircle
} from "lucide-react";

interface ContinueWatchingItem {
  id: number;
  title: string;
  posterPath: string;
  currentSeason: number;
  currentEpisode: number;
  totalSeasons: number;
  progress: number;
  nextEpisodeTitle?: string;
}

interface UpcomingItem {
  id: number;
  title: string;
  posterPath: string;
  airDate: string;
  seasonNumber: number;
  episodeNumber: number;
  description: string;
}

interface FriendActivity {
  id: number;
  friend: {
    name: string;
    avatar: string;
  };
  action: string;
  show: {
    title: string;
    posterPath: string;
  };
  timestamp: string;
}

export default function ModernHome() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();

  // Platform selector modal state
  const [platformSelectorOpen, setPlatformSelectorOpen] = useState(false);
  const [selectedShow, setSelectedShow] = useState<any>(null);

  // List selector modal state
  const [listSelectorOpen, setListSelectorOpen] = useState(false);
  const [showToAddToList, setShowToAddToList] = useState<any>(null);

  // Enhanced platform URL generation with better deep linking
  const getEnhancedPlatformUrl = (platformName: string, showTitle: string) => {
    const encodedTitle = encodeURIComponent(showTitle);

    switch (platformName.toLowerCase()) {
      case 'netflix':
        return `https://www.netflix.com/search?q=${encodedTitle}`;
      case 'disney plus':
      case 'disney+':
        return `https://www.disneyplus.com/search?q=${encodedTitle}`;
      case 'hulu':
        return `https://www.hulu.com/search?q=${encodedTitle}`;
      case 'amazon prime video':
      case 'prime video':
        return `https://www.amazon.com/gp/video/search?phrase=${encodedTitle}`;
      case 'hbo max':
      case 'max':
        return `https://play.max.com/search?q=${encodedTitle}`;
      case 'apple tv plus':
      case 'apple tv+':
        return `https://tv.apple.com/search?term=${encodedTitle}`;
      case 'paramount plus':
      case 'paramount+':
        return `https://www.paramountplus.com/search/?query=${encodedTitle}`;
      case 'peacock':
        return `https://www.peacocktv.com/search?q=${encodedTitle}`;
      case 'crunchyroll':
        return `https://www.crunchyroll.com/search?q=${encodedTitle}`;
      default:
        return `https://www.google.com/search?q=${encodedTitle}+${encodeURIComponent(platformName)}+watch+online`;
    }
  };

  // Handler for Watch Now buttons
  const handleWatchNow = (show: any) => {
    if (show.streamingPlatforms && show.streamingPlatforms.length > 1) {
      // Multiple platforms available - show selector
      setSelectedShow(show);
      setPlatformSelectorOpen(true);
    } else if (show.streamingPlatforms && show.streamingPlatforms.length === 1) {
      // Single platform - direct redirect
      const platform = show.streamingPlatforms[0];
      openStreamingPlatform(platform, show.title || show.name);
    } else {
      // No platforms - fallback to search
      const searchQuery = encodeURIComponent(`watch ${show.title || show.name} online`);
      window.open(`https://www.google.com/search?q=${searchQuery}`, '_blank');
    }
  };

  // Handle platform selection from modal
  const handlePlatformSelect = (platform: any) => {
    if (selectedShow) {
      openStreamingPlatform(platform, selectedShow.title || selectedShow.name);
    }
  };

  // Open specific streaming platform
  const openStreamingPlatform = (platform: any, showTitle: string) => {
    console.log("Opening:", platform.provider_name, "for show:", showTitle);

    // Use enhanced platform URLs with proper deep linking
    const platformUrl = getEnhancedPlatformUrl(platform.provider_name, showTitle);
    window.open(platformUrl, '_blank');
  };

  // Handler for Add to List buttons (opens list selector modal)
  const handleAddToWatchlist = (show: any) => {
    setShowToAddToList(show);
    setListSelectorOpen(true);
  };

  // Helper function to get platform URLs
  const getPlatformUrl = (platformName: string, showTitle: string) => {
    const encodedTitle = encodeURIComponent(showTitle);
    const platformMap: { [key: string]: string } = {
      'Netflix': `https://www.netflix.com/search?q=${encodedTitle}`,
      'Disney Plus': `https://www.disneyplus.com/search?q=${encodedTitle}`,
      'Hulu': `https://www.hulu.com/search?q=${encodedTitle}`,
      'HBO Max': `https://www.hbomax.com/search?q=${encodedTitle}`,
      'Amazon Prime Video': `https://www.amazon.com/s?k=${encodedTitle}&i=prime-instant-video`,
      'Apple TV Plus': `https://tv.apple.com/search?term=${encodedTitle}`,
      'Paramount Plus': `https://www.paramountplus.com/search/?query=${encodedTitle}`,
      'Peacock': `https://www.peacocktv.com/search?q=${encodedTitle}`
    };

    return platformMap[platformName] || `https://www.google.com/search?q=watch+${encodedTitle}+online`;
  };

  // Mutation for adding shows to watchlist
  const addToWatchlistMutation = useMutation({
    mutationFn: async (showData: any) => {
      return await apiRequest('/api/watchlist', 'POST', showData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
      toast({
        title: "Added to Watchlist",
        description: "Show has been added to your watchlist.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add show to watchlist.",
        variant: "destructive",
      });
    }
  });

  // Mutation for marking episodes as watched
  const markEpisodeMutation = useMutation({
    mutationFn: async ({ showId, seasonNumber, episodeNumber, rating }: {
      showId: number;
      seasonNumber: number;
      episodeNumber: number;
      rating?: number;
    }) => {
      return await apiRequest('/api/progress/episode', 'POST', {
        showId,
        seasonNumber,
        episodeNumber,
        isCompleted: true,
        rating: rating ? rating.toString() : null
      });
    },
    onSuccess: () => {
      // Invalidate progress data to refresh
      queryClient.invalidateQueries({ queryKey: ["/api/progress/current"] });
      toast({
        title: "Episode marked as watched",
        description: "Your viewing progress has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update episode progress.",
        variant: "destructive"
      });
    }
  });

  // State for trending data
  const [trendingData, setTrendingData] = useState<{ results: any[] } | null>(null);
  const [comingSoonData, setComingSoonData] = useState<{ results: any[] } | null>(null);

  // Safe fetch function that never throws errors
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

  // Fetch trending shows safely
  useEffect(() => {
    safeFetch('/api/tmdb/trending').then(data => {
      if (data) setTrendingData(data);
    });
  }, []);

  // Fetch coming soon shows safely
  useEffect(() => {
    safeFetch('/api/tmdb/discover/tv').then(data => {
      if (data) setComingSoonData(data);
    });
  }, []);

  // State for user data
  const [currentProgress, setCurrentProgress] = useState<{ currentShow: any } | null>(null);
  const [userWatchlist, setUserWatchlist] = useState<any[]>([]);
  const [friendActivities, setFriendActivities] = useState<any[]>([]);

  // Fetch user's current watching progress
  useEffect(() => {
    if (user) {
      safeFetch('/api/progress/current').then(data => {
        if (data) setCurrentProgress(data);
      });
    }
  }, [user]);

  // Fetch user's actual watchlist
  useEffect(() => {
    if (user) {
      safeFetch('/api/watchlist').then(data => {
        if (data) setUserWatchlist(data);
      });
    }
  }, [user]);

  // Fetch friend activities
  useEffect(() => {
    if (user) {
      safeFetch('/api/activities/friends').then(data => {
        if (data) setFriendActivities(data);
      });
    }
  }, [user]);

  // Use real data from API calls - no more mock data
  const continueWatching: ContinueWatchingItem[] = userWatchlist?.filter((item: any) =>
    item && item.status === 'watching'
  ).map((item: any) => ({
    id: item.tmdbId,
    title: item.title || 'Unknown Title',
    posterPath: item?.posterPath ? `https://image.tmdb.org/t/p/w300${item.posterPath}` : '',
    currentSeason: item.currentSeason || 1,
    currentEpisode: item.currentEpisode || 1,
    totalSeasons: item.totalSeasons || 1,
    progress: item.progress || 0,
    nextEpisodeTitle: item.nextEpisodeTitle || "Next Episode",
    streamingPlatforms: item.streamingPlatforms || []
  })) || [];

  const upcomingToday: UpcomingItem[] = comingSoonData?.results?.filter((show: any) => show).slice(0, 3).map((show: any) => ({
    id: show.id,
    title: show.name || show.title || 'Unknown Show',
    posterPath: show?.poster_path ? `https://image.tmdb.org/t/p/w300${show.poster_path}` : '',
    airDate: show.first_air_date || "Coming Soon",
    seasonNumber: 1,
    episodeNumber: 1,
    description: show.overview?.substring(0, 60) + "..." || "New show premiering soon",
    streamingPlatforms: show.streamingPlatforms || []
  })) || [];

  const friendsWatching: FriendActivity[] = friendActivities?.filter((activity: any) => activity && activity.show).slice(0, 5).map((activity: any, index: number) => ({
    id: activity.id,
    friend: {
      name: activity.user?.firstName || `Friend ${index + 1}`,
      avatar: activity.user?.profileImageUrl || `https://ui-avatars.com/api/?name=Friend${index + 1}&background=0ea5e9&color=fff&size=40`
    },
    action: activity.actionType || "watched",
    show: {
      title: activity.show?.title || 'Unknown Show',
      posterPath: activity.show?.posterPath ? `https://image.tmdb.org/t/p/w300${activity.show.posterPath}` : '',
      streamingPlatforms: activity.show?.streamingPlatforms || []
    },
    timestamp: activity.createdAt ? new Date(activity.createdAt).toLocaleDateString() : "Recently"
  })) || [];

  const quickStats = {
    watching: 12,
    completed: 84,
    plannedToWatch: 27,
    totalHours: 342
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[hsl(228,25%,3%)] via-[hsl(226,22%,6%)] to-[hsl(224,20%,8%)] flex items-center justify-center p-4">
        <Card className="glass-effect border-slate-700 max-w-md mx-auto">
          <CardContent className="p-8 text-center space-y-4">
            <Play className="h-16 w-16 text-teal-400 mx-auto" />
            <h2 className="text-2xl font-bold text-white">Welcome to BingeBoard</h2>
            <p className="text-gray-300">
              Your personalized entertainment hub awaits. Track, discover, and share your viewing journey.
            </p>
            <Button asChild className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
              <Link href="/api/login">Get Started</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <TopNav />

      <div className="pt-20 pb-32">
        <div className="container mx-auto px-4 space-y-8">

          {/* Dynamic Header - A/B Test: Sunday Weekly Summary vs Regular Welcome */}
          {(() => {
            const today = new Date();
            const isSunday = today.getDay() === 0;

            if (isSunday) {
              // Your Week in TV Summary (Sunday variant)
              return (
                <div className="text-center space-y-6">
                  <div className="bg-gradient-to-r from-teal-600/20 via-cyan-600/20 to-blue-600/20 rounded-xl p-6 border border-teal-500/20">
                    <h1 className="text-2xl font-bold text-white mb-4">Your Week in TV</h1>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-teal-400">12h 45m</div>
                        <div className="text-gray-400">Watched this week</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-cyan-400">Drama, Sci-Fi</div>
                        <div className="text-gray-400">Top genres</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">3 shows</div>
                        <div className="text-gray-400">Friend recommendations</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            } else {
              // Regular welcome message
              return (
                <div className="text-center space-y-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-bold text-white">What To</h1>
                      <span className="inline-flex items-center gap-1">
                        {/* TV Logo matching header */}
                        <div className="relative inline-block">
                          {/* TV Frame */}
                          <div className="w-7 h-6 bg-gradient-to-br from-slate-700 to-slate-900 rounded-md shadow-xl border border-slate-600 relative">
                            {/* TV Screen */}
                            <div className="absolute inset-0.5 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-sm flex items-center justify-center">
                              <div className="text-xs font-bold text-white drop-shadow-lg" style={{ textShadow: '0 0 6px rgba(0,0,0,0.8), 0 0 2px rgba(255,255,255,0.3)' }}>B</div>
                            </div>
                            {/* TV Base */}
                            <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-2 h-0.5 bg-slate-700 rounded-sm"></div>
                            {/* TV Legs */}
                            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-0.5 bg-slate-600 rounded-sm"></div>
                          </div>
                        </div>
                        <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent font-black text-2xl">
                          inge
                        </span>
                      </span>
                      <span className="text-2xl font-bold text-white">Next!</span>
                    </div>
                  </div>
                </div>
              );
            }
          })()}

          {/* Context-Specific Smart Module 
              CRITICAL: This section determines "Start Watching" content selection
              - Primary source: TMDB trending API (trendingData.results[0])
              - Weekend mode: Shows binge recommendations 
              - Friend activity mode: Shows social recommendations
              - Default: Uses real TMDB trending data
              - Documentation: See WATCHLIST_ARCHITECTURE.md for details
              - DO NOT CHANGE without updating documentation
          */}
          {(() => {
            const now = new Date();
            const isWeekend = now.getDay() === 0 || now.getDay() === 6;
            const lastWatchedDaysAgo = 4; // Mock user data - would come from backend
            const friendRecentActivity = true; // Mock social data

            // Check if user has actual viewing progress
            if (currentProgress?.currentShow) {
              const { currentShow } = currentProgress;
              return (
                <div className="bg-gradient-to-r from-teal-600/20 via-cyan-600/20 to-blue-600/20 rounded-xl p-6 border border-teal-500/20">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-24 rounded-lg overflow-hidden bg-slate-700 flex-shrink-0">
                      {currentShow.show?.posterPath ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w300${currentShow.show.posterPath}`}
                          alt={currentShow.show.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play className="h-6 w-6 text-slate-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">Pick up where you left off in</h3>
                      <h4 className="text-xl font-bold text-teal-400 mb-2">{currentShow.show?.title}?</h4>
                      <p className="text-sm text-gray-300 mb-3">
                        S{currentShow.nextEpisode.season} E{currentShow.nextEpisode.episode} • {currentShow.nextEpisode.timeRemaining}
                      </p>
                      <Button
                        className="bg-teal-600 hover:bg-teal-700 text-white"
                        onClick={() => handleWatchNow(currentShow.show)}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Continue Watching
                      </Button>
                    </div>
                  </div>
                </div>
              );
            }

            // Priority: Inactive user > Weekend > Friend activity
            if (lastWatchedDaysAgo >= 3) {
              // User hasn't watched in a while - show trending content as fallback
              return (
                <div className="bg-gradient-to-r from-teal-600/20 via-cyan-600/20 to-blue-600/20 rounded-xl p-6 border border-teal-500/20">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-24 rounded-lg overflow-hidden bg-slate-700 flex-shrink-0">
                      {trendingData?.results?.[0]?.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w300${trendingData.results[0].poster_path}`}
                          alt={trendingData.results[0].name || trendingData.results[0].title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play className="h-6 w-6 text-slate-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">Start watching</h3>
                      <h4 className="text-xl font-bold text-teal-400 mb-2">{trendingData?.results?.[0]?.name || trendingData?.results?.[0]?.title || 'Popular Shows'}</h4>
                      <p className="text-sm text-gray-300 mb-3">Trending now • Start from S1 E1</p>

                      {/* Streaming Platform Logos with Mock Data */}
                      {trendingData?.results?.[0] && (() => {
                        const heroShowWithStreaming = addMockStreamingData(trendingData.results[0]);
                        return heroShowWithStreaming.streamingPlatforms && heroShowWithStreaming.streamingPlatforms.length > 0 && (
                          <div className="flex items-center gap-1.5 mb-3">
                            {heroShowWithStreaming.streamingPlatforms.slice(0, 3).map((platform: any, index: number) => (
                              <div key={index} className="w-5 h-5 rounded bg-white p-0.5 flex-shrink-0 border border-gray-200">
                                <img
                                  src={platform.logoPath}
                                  alt={platform.name}
                                  className="w-full h-full object-contain rounded"
                                />
                              </div>
                            ))}
                            {heroShowWithStreaming.streamingPlatforms.length > 3 && (
                              <span className="text-[10px] text-gray-400">+{heroShowWithStreaming.streamingPlatforms.length - 3}</span>
                            )}
                          </div>
                        );
                      })()}

                      <Button
                        className="bg-teal-600 hover:bg-teal-700 text-white"
                        onClick={() => handleWatchNow(trendingData?.results?.[0])}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Watching
                      </Button>
                    </div>
                  </div>
                </div>
              );
            } else if (isWeekend) {
              // Weekend binge recommendations
              return (
                <div className="bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-red-600/20 rounded-xl p-6 border border-purple-500/20">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-white mb-2">Weekend Binge Picks Just for You</h3>
                    <p className="text-gray-300">Perfect series to dive into this weekend</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { title: "House of the Dragon", seasons: "2 seasons", poster: "https://image.tmdb.org/t/p/w500/7QMsOTMUswlwxJP0rTTZfmz2tX2.jpg", hours: "20h" },
                      { title: "Wednesday", seasons: "1 season", poster: "https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczOkv.jpg", hours: "8h" },
                      { title: "The Crown", seasons: "6 seasons", poster: "https://image.tmdb.org/t/p/w500/38mxhJ99WM0zYvaXKdqyFTl6LZH.jpg", hours: "60h" }
                    ].map((show, index) => (
                      <div key={index} className="group cursor-pointer">
                        <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-slate-700 mb-2">
                          <img
                            src={show.poster}
                            alt={show.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2IiBmb250LXNpemU9IjE0Ij5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+';
                            }}
                          />
                          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {show.hours}
                          </div>
                        </div>
                        <h4 className="text-sm font-medium text-white text-center">{show.title}</h4>
                        <p className="text-xs text-gray-400 text-center">{show.seasons}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            } else if (friendRecentActivity) {
              // Friend activity-based recommendation
              return (
                <div className="bg-gradient-to-r from-teal-600/20 via-blue-600/20 to-indigo-600/20 rounded-xl p-6 border border-teal-500/20">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-blue-400 flex items-center justify-center text-white font-bold">
                        L
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">
                          <span className="text-teal-400">Liam</span> just finished <span className="text-cyan-400">Severance</span>
                        </h3>
                        <p className="text-gray-300">Want to watch it too?</p>
                      </div>
                    </div>
                    <div className="w-16 h-24 rounded-lg overflow-hidden bg-slate-700 flex-shrink-0">
                      <img
                        src="https://image.tmdb.org/t/p/w500/6YEhNKHuYIGg4vlXJfwt66RmXaI.jpg"
                        alt="Severance"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2IiBmb250LXNpemU9IjE0Ij5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+';
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <Button className="bg-teal-600 hover:bg-teal-700 text-white flex-1">
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Watchlist
                    </Button>
                    <Button variant="outline" className="border-teal-500 text-teal-400 hover:bg-teal-600/20">
                      <Users className="w-4 h-4 mr-2" />
                      Ask Liam
                    </Button>
                  </div>
                </div>
              );
            }

            // Default: My Mood Picks widget
            return (
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-400 fill-pink-400" />
                    My Mood Picks
                  </h3>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { title: "The Crown", mood: "Historical Drama", poster: "https://image.tmdb.org/t/p/w500/38mxhJ99WM0zYvaXKdqyFTl6LZH.jpg" },
                    { title: "Stranger Things", mood: "Nostalgic Sci-Fi", poster: "https://image.tmdb.org/t/p/w500/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg" },
                    { title: "The Office", mood: "Feel-Good Comedy", poster: "https://image.tmdb.org/t/p/w500/qWnJzyZhyy74gjpSjIXWmuk0ifX.jpg" },
                    { title: "Breaking Bad", mood: "Intense Thriller", poster: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg" }
                  ].map((show, index) => (
                    <div key={index} className="group cursor-pointer">
                      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-slate-700">
                        <img
                          src={show.poster}
                          alt={show.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2IiBmb250LXNpemU9IjE0Ij5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <div className="mt-2">
                        <h4 className="text-sm font-medium text-white truncate">{show.title}</h4>
                        <p className="text-xs text-gray-400">{show.mood}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass-effect border-slate-700/50 cursor-pointer hover:border-teal-500/50 transition-colors" onClick={() => setLocation('/watchlist?filter=watching')}>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-teal-400">{userWatchlist?.filter((item: any) => item.status === 'watching').length || 0}</div>
                <div className="text-sm text-gray-400">Watching</div>
              </CardContent>
            </Card>
            <Card className="glass-effect border-slate-700/50 cursor-pointer hover:border-green-500/50 transition-colors" onClick={() => setLocation('/watchlist?filter=finished')}>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{userWatchlist?.filter((item: any) => item.status === 'finished').length || 0}</div>
                <div className="text-sm text-gray-400">Completed</div>
              </CardContent>
            </Card>
            <Card className="glass-effect border-slate-700/50 cursor-pointer hover:border-blue-500/50 transition-colors" onClick={() => setLocation('/watchlist?filter=want_to_watch')}>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{userWatchlist?.filter((item: any) => item.status === 'want_to_watch').length || 0}</div>
                <div className="text-sm text-gray-400">Plan to Watch</div>
              </CardContent>
            </Card>
            <Card className="glass-effect border-slate-700/50 cursor-pointer hover:border-purple-500/50 transition-colors" onClick={() => setLocation('/profile')}>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">{userWatchlist?.reduce((total: number, item: any) => total + (item.totalHoursWatched || 0), 0) || 0}h</div>
                <div className="text-sm text-gray-400">Total Hours</div>
              </CardContent>
            </Card>
          </div>

          {/* Continue Watching - Universal Components */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Play className="h-4 w-4 text-white" />
                </div>
                Continue Watching
              </h2>
              <Link href="/lists">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>

            <HorizontalScrollContainer scrollId="continue-watching">
              <div className="flex space-x-4 pb-4">
                {continueWatching.slice(0, 4).map((item) => (
                  <ContentCard
                    key={item.id}
                    item={addMockStreamingData({
                      id: item.id,
                      title: item.title,
                      poster_path: item.posterPath ? item.posterPath.replace('https://image.tmdb.org/t/p/w300', '') : '',
                      vote_average: 0,
                      overview: `S${item.currentSeason} E${item.currentEpisode} • ${item.progress}% complete`,
                      streamingPlatforms: item.streamingPlatforms || []
                    })}
                    type="compact"
                    showStreamingLogos={true}
                    showTrailerButton={true}
                    showAffiliateLinks={true}
                    showWatchNow={true}
                    onWatchNow={() => handleWatchNow(item)}
                    onAddToWatchlist={() => handleAddToWatchlist(item)}
                  />
                ))}
              </div>
            </HorizontalScrollContainer>
          </div>

          {/* Next Episode Drops - Universal Components */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                Next Episode Drops Tomorrow
              </h2>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <HorizontalScrollContainer scrollId="upcoming-today">
              {upcomingToday.slice(0, 4).map((item) => (
                <ContentCard
                  key={item.id}
                  item={addMockStreamingData({
                    id: item.id,
                    title: item.title,
                    poster_path: item.posterPath ? item.posterPath.replace('https://image.tmdb.org/t/p/w300', '') : '',
                    vote_average: 0,
                    overview: `Season ${item.seasonNumber}, Episode ${item.episodeNumber}`,
                    streamingPlatforms: item.streamingPlatforms || []
                  })}
                  type="compact"
                  showStreamingLogos={true}
                  showTrailerButton={true}
                  showAffiliateLinks={true}
                  isComingSoon={true}
                  releaseDate={item.airDate}
                  showWatchNow={false}
                  onAddToWatchlist={() => handleAddToWatchlist(item)}
                />
              ))}
            </HorizontalScrollContainer>
          </div>

          {/* Your Friends Are Watching - Universal Components */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 text-white" />
                </div>
                Your Friends Are Watching
              </h2>
              <Link href="/friends">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>

            <HorizontalScrollContainer scrollId="friends-watching">
              <div className="flex space-x-4 pb-4">
                {friendsWatching.slice(0, 4).map((activity) => (
                  <ContentCard
                    key={activity.id}
                    item={addMockStreamingData({
                      id: activity.show.id || activity.id,
                      title: activity.show.title,
                      poster_path: activity.show.posterPath?.replace('https://image.tmdb.org/t/p/w300', '') || '',
                      vote_average: 0,
                      overview: `${activity.friend.name} ${activity.action} this show`,
                      streamingPlatforms: activity.show.streamingPlatforms || []
                    })}
                    type="compact"
                    showStreamingLogos={true}
                    showTrailerButton={true}
                    showAffiliateLinks={true}
                    showWatchNow={true}
                    onWatchNow={() => handleWatchNow(activity.show)}
                    onAddToWatchlist={() => handleAddToWatchlist(activity.show)}
                  />
                ))}
              </div>
            </HorizontalScrollContainer>
          </div>

          {/* AI Recommendations Section */}
          <AiRecommendations />

        </div>
      </div>

      {/* Streaming Platform Selector Modal */}
      <StreamingPlatformSelector
        isOpen={platformSelectorOpen}
        onClose={() => setPlatformSelectorOpen(false)}
        platforms={selectedShow?.streamingPlatforms || []}
        showTitle={selectedShow?.title || selectedShow?.name || ''}
        onPlatformSelect={handlePlatformSelect}
      />

      {/* List Selector Modal */}
      <ListSelectorModal
        isOpen={listSelectorOpen}
        onClose={() => setListSelectorOpen(false)}
        show={showToAddToList}
        onSuccess={() => {
          // Refresh watchlist data
          queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
        }}
      />

      <MobileNav />
    </div>
  );
}