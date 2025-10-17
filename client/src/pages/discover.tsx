import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import NavigationHeader from "@/components/navigation-header";
import { SmartCategoriesComponent } from '@/components/discover/SmartCategoriesComponent';
import { InteractiveDiscoveryTools } from '@/components/discover/InteractiveDiscoveryTools';
import { DiscoverSpotlight } from '@/components/discover/DiscoverSpotlight';
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import { apiFetch } from "@/utils/api-config";
import useMediaActions from '@/hooks/useMediaActions';
import { useIntelligentExclusions } from '@/hooks/useIntelligentExclusions';

// Use the same MediaItem interface as UniversalMediaCard
interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  backdrop_path?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  overview?: string;
  genre_ids?: number[];
  streaming_platforms?: Array<{
    provider_id?: number;
    provider_name?: string;
    name?: string;
    logo_path?: string;
  }>;
  streamingPlatforms?: Array<{
    provider_id?: number;
    provider_name?: string;
    name?: string;
    logo_path?: string;
  }>;
  streaming?: Array<{
    provider_id?: number;
    provider_name?: string;
    name?: string;
    logo_path?: string;
  }>;
  media_type?: 'movie' | 'tv';
}

interface APIError {
  message: string;
  status_code?: number;
}

const DiscoverPage: React.FC = () => {
  const [allMedia, setAllMedia] = useState<MediaItem[]>([]);
  const [trendingNow, setTrendingNow] = useState<MediaItem[]>([]);
  const [comingSoon, setComingSoon] = useState<MediaItem[]>([]);
  const [topRated, setTopRated] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentSpotlightIndex, setCurrentSpotlightIndex] = useState(0);
  const [discoveryFilters, setDiscoveryFilters] = useState({
    platforms: [] as string[],
    genres: [] as string[],
    timeFilter: null as string | null
  });

  // Universal intelligent exclusions hook
  const { excludeUserShows } = useIntelligentExclusions();

  // Three distinct spotlights with intelligent exclusions
  const spotlight1 = useMemo(() => {
    // 🔥 Just Released & Trending
    const filtered = excludeUserShows(trendingNow);
    return filtered.find(item => item.streaming?.length) || filtered[0] || null;
  }, [trendingNow, excludeUserShows]);

  const spotlight2 = useMemo(() => {
    // 🌟 Coming Soon / Highly Anticipated
    const filtered = excludeUserShows(comingSoon);
    return filtered.find(item => item.streaming?.length) || filtered[0] || null;
  }, [comingSoon, excludeUserShows]);

  const spotlight3 = useMemo(() => {
    // 🏆 #1 Show You Haven't Added Yet
    const filtered = excludeUserShows(topRated);
    return filtered.find(item => item.streaming?.length) || filtered[0] || null;
  }, [topRated, excludeUserShows]);

  // Apply exclusions to all media for Smart Categories
  const filteredAllMedia = useMemo(() => {
    return excludeUserShows(allMedia);
  }, [allMedia, excludeUserShows]);

  // Combine spotlights into array for rotation
  const spotlights = useMemo(() => [
    { item: spotlight1, title: "Just Released & Trending", badge: "🔥 TRENDING NOW", color: "bg-gradient-to-r from-red-600 to-orange-600", cta: "Watch Now", action: "watch" },
    { item: spotlight2, title: "Coming Soon – Highly Anticipated", badge: "🌟 UPCOMING", color: "bg-gradient-to-r from-purple-600 to-pink-600", cta: "Set Reminder", action: "reminder" },
    { item: spotlight3, title: "#1 Show You Haven't Added Yet", badge: "🏆 EDITOR'S PICK", color: "bg-gradient-to-r from-teal-600 to-cyan-600", cta: "Watch Now", action: "watch" },
  ].filter(s => s.item !== null), [spotlight1, spotlight2, spotlight3]);

  // Auto-rotate spotlight every 8 seconds
  useEffect(() => {
    if (spotlights.length <= 1) {
      console.log('⏸️ Spotlight rotation disabled - only', spotlights.length, 'spotlight(s)');
      return;
    }
    
    console.log('▶️ Starting spotlight auto-rotation with', spotlights.length, 'spotlights');
    const interval = setInterval(() => {
      setCurrentSpotlightIndex(prev => {
        const next = (prev + 1) % spotlights.length;
        console.log('🔄 Spotlight rotating:', prev, '→', next);
        return next;
      });
    }, 8000);

    return () => {
      console.log('⏹️ Clearing spotlight rotation interval');
      clearInterval(interval);
    };
  }, [spotlights.length]);

  // Reset index if out of bounds (when spotlights data loads)
  useEffect(() => {
    if (currentSpotlightIndex >= spotlights.length && spotlights.length > 0) {
      console.log('🔧 Resetting spotlight index to 0');
      setCurrentSpotlightIndex(0);
    }
  }, [spotlights.length, currentSpotlightIndex]);

  const currentSpotlight = spotlights[currentSpotlightIndex] || spotlights[0];

  // Media actions hook for all functionality
  const {
    addToWatchlist,
    watchNow,
    watchTrailer,
    setReminder,
    isLoading: actionsLoading,
    error: actionsError
  } = useMediaActions();

  // Helper function to format API response to MediaItem interface
  const formatApiItem = useCallback((item: any): MediaItem => {
    return {
      id: item.id,
      title: item.title || item.name,
      name: item.name || item.title,
      poster_path: item.poster_url || item.poster_path,
      backdrop_path: item.backdrop_url || item.backdrop_path,
      release_date: item.release_date,
      first_air_date: item.first_air_date,
      vote_average: item.vote_average,
      overview: item.overview,
      genre_ids: item.genre_ids || [],
      media_type: item.media_type as 'movie' | 'tv',
      // Include all streaming data formats for compatibility
      streaming: item.streaming || [],
      streaming_platforms: item.streaming_platforms || item.streaming || [],
      streamingPlatforms: item.streamingPlatforms || item.streaming || []
    };
  }, []);

  // Fetch comprehensive data for intelligent recommendations
  const fetchAllContent = useCallback(async (): Promise<MediaItem[]> => {
    try {
      const promises = [
        // 🔥 Trending Now (released this week)
        apiFetch(`/api/trending/tv/week?includeStreaming=true&limit=20`).then(r => r.json()),
        // 🌟 Coming Soon (upcoming with high popularity)
        apiFetch(`/api/tmdb/discover/tv?sort_by=popularity.desc&includeStreaming=true&first_air_date.gte=2025-10-16&limit=20`).then(r => r.json()),
        // 🏆 Top Rated (high quality shows)
        apiFetch(`/api/tmdb/tv/top_rated?includeStreaming=true&limit=20`).then(r => r.json()),
        // For Smart Categories
        apiFetch(`/api/trending/tv/day?includeStreaming=true&limit=30`).then(r => r.json()),
      ];

      const [trendingRes, upcomingRes, topRatedRes, categoriesRes] = await Promise.all(promises);
      
      // Set separate spotlight datasets
      setTrendingNow(trendingRes?.results?.map(formatApiItem) || []);
      setComingSoon(upcomingRes?.results?.map(formatApiItem) || []);
      setTopRated(topRatedRes?.results?.map(formatApiItem) || []);

      // Combine all for Smart Categories
      const allItems: MediaItem[] = [];
      [trendingRes, upcomingRes, topRatedRes, categoriesRes].forEach((result) => {
        if (result?.results) {
          allItems.push(...result.results.map((item: any) => formatApiItem(item)));
        }
      });

      // Remove duplicates and limit for performance
      const uniqueItems = allItems.filter((item, index, self) => 
        index === self.findIndex(i => i.id === item.id && i.media_type === item.media_type)
      ).slice(0, 100);

      return uniqueItems;
    } catch (err) {
      console.error('Error fetching content:', err);
      throw err;
    }
  }, [formatApiItem]);

  // Load all content on mount
  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const content = await fetchAllContent();
        setAllMedia(content);
      } catch (err) {
        console.error('Error loading discover content:', err);
        setError('Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [fetchAllContent]);

  // Discovery tool handlers
  const handleStreamingFilter = (platforms: string[]) => {
    setDiscoveryFilters(prev => ({ ...prev, platforms }));
    console.log('Streaming platforms selected:', platforms);
  };

  const handleGenreMix = (genres: string[]) => {
    setDiscoveryFilters(prev => ({ ...prev, genres }));
    console.log('Genres selected:', genres);
  };

  const handleRandomDiscover = () => {
    console.log('Random discovery triggered');
    // Implement random content discovery logic
  };

  const handleTimeFilter = (duration: string) => {
    setDiscoveryFilters(prev => ({ ...prev, timeFilter: duration }));
    console.log('Time filter:', duration);
  };

  const handlePersonalityMatch = (type: string) => {
    console.log('Personality match:', type);
    // Implement personality-based recommendations
  };

  // Media action handlers using the hook
  const handleMediaClick = (media: MediaItem) => {
    console.log('Media clicked:', media.title || media.name);
    // Navigate to media detail page
  };

  const handleWatchNow = async (media: MediaItem) => {
    const success = await watchNow({
      id: media.id.toString(),
      title: media.title,
      name: media.name,
      type: media.media_type || 'movie',
      poster_path: media.poster_path,
      backdrop_path: media.backdrop_path,
      release_date: media.release_date,
      first_air_date: media.first_air_date,
      vote_average: media.vote_average,
      overview: media.overview,
      genre_ids: media.genre_ids
    });
    if (!success) {
      console.error('Failed to launch watch for:', media.title || media.name);
    }
  };

  const handleAddToWatchlist = async (media: MediaItem) => {
    const success = await addToWatchlist({
      id: media.id.toString(),
      title: media.title,
      name: media.name,
      type: media.media_type || 'movie',
      poster_path: media.poster_path,
      backdrop_path: media.backdrop_path,
      release_date: media.release_date,
      first_air_date: media.first_air_date,
      vote_average: media.vote_average,
      overview: media.overview,
      genre_ids: media.genre_ids
    });
    if (success) {
      console.log('Added to watchlist:', media.title || media.name);
    } else {
      console.error('Failed to add to watchlist');
    }
  };

  const handleWatchTrailer = async (media: MediaItem) => {
    const success = await watchTrailer({
      id: media.id.toString(),
      title: media.title,
      name: media.name,
      type: media.media_type || 'movie',
      poster_path: media.poster_path,
      backdrop_path: media.backdrop_path,
      release_date: media.release_date,
      first_air_date: media.first_air_date,
      vote_average: media.vote_average,
      overview: media.overview,
      genre_ids: media.genre_ids
    }, true); // Open in modal
    if (!success) {
      console.error('No trailer available for:', media.title || media.name);
    }
  };

  const handleSetReminder = async (media: MediaItem) => {
    const success = await setReminder({
      id: media.id.toString(),
      title: media.title,
      name: media.name,
      type: media.media_type || 'movie',
      poster_path: media.poster_path,
      backdrop_path: media.backdrop_path,
      release_date: media.release_date,
      first_air_date: media.first_air_date,
      vote_average: media.vote_average,
      overview: media.overview,
      genre_ids: media.genre_ids
    });
    if (success) {
      console.log('Reminder set for:', media.title || media.name);
    } else {
      console.error('Failed to set reminder');
    }
  };

  const handleShowInfo = (media: MediaItem) => {
    console.log('Show info:', media.title || media.name);
    // Show media information modal
  };

  // Adapter handlers for IntelligentHero (which uses IntelligentShow interface)
  const handleHeroWatchNow = (show: any) => {
    // Convert IntelligentShow to MediaItem-like object
    const media: MediaItem = {
      id: parseInt(show.id) || 0,
      title: show.title,
      name: show.title,
      ...show
    };
    handleWatchNow(media);
  };

  const handleHeroAddToWatchlist = (show: any) => {
    const media: MediaItem = {
      id: parseInt(show.id) || 0,
      title: show.title,
      name: show.title,
      ...show
    };
    handleAddToWatchlist(media);
  };

  const handleHeroShowInfo = (show: any) => {
    const media: MediaItem = {
      id: parseInt(show.id) || 0,
      title: show.title,
      name: show.title,
      ...show
    };
    handleShowInfo(media);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <NavigationHeader />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
            <p className="text-slate-400">Loading amazing content for you...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950">
        <NavigationHeader />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-900/20 border border-red-500/50 rounded-2xl p-8 text-center max-w-md mx-4"
          >
            <div className="text-red-400 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-red-300 mb-2">Failed to Load Content</h3>
            <p className="text-red-200 mb-6">{error}</p>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <NavigationHeader />

      {/* Single Rotating Spotlight */}
      {!loading && currentSpotlight && currentSpotlight.item && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 mb-8">
          <div className="relative">
            {/* Progress indicators */}
            {spotlights.length > 1 && (
              <div className="absolute -top-2 right-4 flex gap-2 z-10">
                {spotlights.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSpotlightIndex(idx)}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      idx === currentSpotlightIndex 
                        ? 'w-8 bg-white' 
                        : 'w-4 bg-white/30 hover:bg-white/50'
                    }`}
                    aria-label={`Go to spotlight ${idx + 1}`}
                  />
                ))}
              </div>
            )}
            
            <DiscoverSpotlight
              title={currentSpotlight.title}
              badge={currentSpotlight.badge}
              badgeColor={currentSpotlight.color}
              feature={currentSpotlight.item}
              onWatchNow={currentSpotlight.action === "reminder" ? handleSetReminder : handleWatchNow}
              onAddToList={handleAddToWatchlist}
              ctaText={currentSpotlight.cta}
              delay={0}
            />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-16">
        {/* Interactive Discovery Tools */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <InteractiveDiscoveryTools
            onGenreMix={handleGenreMix}
            onRandomDiscover={handleRandomDiscover}
            onTimeFilter={handleTimeFilter}
            onPersonalityMatch={handlePersonalityMatch}
            onStreamingFilter={handleStreamingFilter}
            className="mb-16"
          />
        </motion.div>

        {/* Smart Categories */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <SmartCategoriesComponent
            mediaData={filteredAllMedia}
            onMediaClick={handleMediaClick}
            onWatchNow={handleWatchNow}
            onAddToWatchlist={handleAddToWatchlist}
            onWatchTrailer={handleWatchTrailer}
            onShowInfo={handleShowInfo}
            onSetReminder={handleSetReminder}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default DiscoverPage;
