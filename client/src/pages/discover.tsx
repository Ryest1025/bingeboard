// src/app/discover/page.tsx (or src/pages/discover.tsx)
// Cleaned, typed, and more robust DiscoverPage component

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NavigationHeader from "@/components/navigation-header";
import { SmartCategoriesComponent } from '@/components/discover/SmartCategoriesComponent';
import { InteractiveDiscoveryTools } from '@/components/discover/InteractiveDiscoveryTools';
import { DiscoverSpotlight } from '@/components/discover/DiscoverSpotlight';
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import { apiFetch } from "@/utils/api-config";
import useMediaActions from '@/hooks/useMediaActions';
import { useIntelligentExclusions } from '@/hooks/useIntelligentExclusions';

type MediaType = 'movie' | 'tv';

interface StreamingProvider {
  provider_id?: number;
  provider_name?: string;
  name?: string;
  logo_path?: string;
}

interface MediaItem {
  id: number;
  title: string;
  name: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string | null;
  first_air_date?: string | null;
  vote_average?: number | null;
  overview?: string | null;
  genre_ids?: number[];
  streaming?: StreamingProvider[];
  streaming_platforms?: StreamingProvider[];
  streamingPlatforms?: StreamingProvider[];
  media_type: MediaType;
  popularity?: number;
  vote_count?: number;
  // allow extra fields
  [k: string]: any;
}

interface TmdbResponse {
  results?: any[];
  page?: number;
  total_results?: number;
  total_pages?: number;
}

const DEV_LOG = true; // set to false in production builds

const log = (...args: any[]) => {
  if (DEV_LOG) console.log('[Discover]', ...args);
};

const dedupeMedia = (items: MediaItem[]) => {
  const map = new Map<string, MediaItem>();
  for (const item of items) {
    const key = `${item.media_type}:${item.id}`;
    if (!map.has(key)) map.set(key, item);
  }
  return Array.from(map.values());
};

const safeParseJSON = async (res: Response) => {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text || null;
  }
};

const DiscoverPage: React.FC = () => {
  // Content states
  const [allMedia, setAllMedia] = useState<MediaItem[]>([]);
  const [trendingNow, setTrendingNow] = useState<MediaItem[]>([]);
  const [comingSoon, setComingSoon] = useState<MediaItem[]>([]);
  const [topRated, setTopRated] = useState<MediaItem[]>([]);

  // UI states
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSpotlightIndex, setCurrentSpotlightIndex] = useState<number>(0);
  const [discoveryFilters, setDiscoveryFilters] = useState({
    platforms: [] as string[],
    genres: [] as string[],
    timeFilter: null as string | null,
    quickFilter: null as string | null
  });

  // Hooks
  const { excludeUserShows } = useIntelligentExclusions();
  const {
    addToWatchlist,
    watchNow,
    watchTrailer,
    setReminder,
    isLoading: actionsLoading,
    error: actionsError
  } = useMediaActions();

  // Helper: normalize an API item into MediaItem
  const formatApiItem = useCallback((raw: any): MediaItem => {
    // Ensure id exists and is numeric
    const id = typeof raw.id === 'string' ? parseInt(raw.id) : raw.id;
    const maybeMediaType: MediaType = (raw.media_type || (raw.first_air_date || raw.name ? 'tv' : 'movie')) as MediaType;

    // Normalize streaming fields (prefer arrays)
    const streaming = Array.isArray(raw.streaming) ? raw.streaming : (raw.streaming ? [raw.streaming] : []);
    const streaming_platforms = Array.isArray(raw.streaming_platforms) ? raw.streaming_platforms : (raw.streamingPlatforms ? raw.streamingPlatforms : streaming);

    return {
      id: id || 0,
      title: (raw.title || raw.name || raw.original_title || raw.original_name || '').toString(),
      name: (raw.name || raw.title || raw.original_name || raw.original_title || '').toString(),
      poster_path: raw.poster_url ?? raw.poster_path ?? raw.poster ?? null,
      backdrop_path: raw.backdrop_url ?? raw.backdrop_path ?? raw.backdrop ?? null,
      release_date: raw.release_date ?? null,
      first_air_date: raw.first_air_date ?? raw.first_air_date ?? null,
      vote_average: raw.vote_average ?? null,
      overview: raw.overview ?? null,
      genre_ids: raw.genre_ids ?? raw.genres?.map((g: any) => g.id) ?? [],
      streaming: streaming,
      streaming_platforms: streaming_platforms,
      streamingPlatforms: streaming_platforms,
      media_type: maybeMediaType,
      popularity: raw.popularity ?? null,
      vote_count: raw.vote_count ?? null,
      ...raw
    } as MediaItem;
  }, []);

  // --- Spotlights (with exclusions applied) ---
  const spotlight1 = useMemo(() => {
    const filtered = excludeUserShows(trendingNow);
    return filtered.find(i => (i.streaming && i.streaming.length > 0)) || filtered[0] || null;
  }, [trendingNow, excludeUserShows]);

  const spotlight2 = useMemo(() => {
    const filtered = excludeUserShows(comingSoon);
    return filtered.find(i => (i.streaming && i.streaming.length > 0)) || filtered[0] || null;
  }, [comingSoon, excludeUserShows]);

  const spotlight3 = useMemo(() => {
    const filtered = excludeUserShows(topRated);
    return filtered.find(i => (i.streaming && i.streaming.length > 0)) || filtered[0] || null;
  }, [topRated, excludeUserShows]);

  const spotlights = useMemo(() => {
    const arr = [
      spotlight1 ? { item: spotlight1, title: "Just Released & Trending", badge: "🔥 TRENDING NOW", badgeColor: "bg-gradient-to-r from-red-600 to-orange-600", cta: "Watch Now", action: "watch", isUpcoming: false } : null,
      spotlight2 ? { item: spotlight2, title: "Coming Soon – Highly Anticipated", badge: "🌟 UPCOMING", badgeColor: "bg-gradient-to-r from-purple-600 to-pink-600", cta: "Remind Me", action: "reminder", isUpcoming: true } : null,
      spotlight3 ? { item: spotlight3, title: "#1 Show You Haven't Added Yet", badge: "🏆 EDITOR'S PICK", badgeColor: "bg-gradient-to-r from-teal-600 to-cyan-600", cta: "Watch Now", action: "watch", isUpcoming: false } : null,
    ].filter(Boolean) as Array<any>;
    return arr;
  }, [spotlight1, spotlight2, spotlight3]);

  // Rotate spotlight every 8s, but pause if <=1 spotlight
  useEffect(() => {
    if (spotlights.length <= 1) {
      log('Spotlight rotation disabled (<=1 spotlight).');
      setCurrentSpotlightIndex(0);
      return;
    }
    log('Starting spotlight rotation with', spotlights.length, 'items');
    const id = setInterval(() => {
      setCurrentSpotlightIndex(prev => (prev + 1) % spotlights.length);
    }, 8000);
    return () => {
      clearInterval(id);
      log('Cleared spotlight rotation interval');
    };
  }, [spotlights.length]);

  // Ensure index stays valid
  useEffect(() => {
    if (currentSpotlightIndex >= spotlights.length) {
      setCurrentSpotlightIndex(0);
    }
  }, [spotlights.length, currentSpotlightIndex]);

  const currentSpotlight = spotlights[currentSpotlightIndex] || spotlights[0] || null;

  // --- Fetching: robust, cancellation-aware, tolerant of partial failures ---
  const fetchAllContent = useCallback(async (signal?: AbortSignal): Promise<MediaItem[]> => {
    const today = new Date().toISOString().split('T')[0];
    const future = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Each endpoint fetch wrapped to produce a consistent shape or null on failure
    const endpoints = [
      { url: `/api/trending/tv/week?includeStreaming=true&limit=20`, label: 'trendingWeek' },
      { url: `/api/tmdb/discover/tv?sort_by=popularity.desc&includeStreaming=true&first_air_date.gte=${today}&first_air_date.lte=${future}&limit=20`, label: 'upcoming' },
      { url: `/api/tmdb/tv/top_rated?includeStreaming=true&limit=20`, label: 'topRated' },
      { url: `/api/trending/tv/day?includeStreaming=true&limit=30`, label: 'categories' },
    ];

    const fetchPromises = endpoints.map(ep => (async () => {
      try {
        const res = await apiFetch(ep.url, { signal });
        if (!res.ok) {
          const body = await safeParseJSON(res);
          throw new Error(`${ep.label} -> API ${res.status}: ${JSON.stringify(body)}`);
        }
        const json: TmdbResponse = await res.json();
        return { label: ep.label, ok: true, data: json };
      } catch (err: any) {
        log('Endpoint failed:', ep.label, err.message || err);
        return { label: ep.label, ok: false, error: err };
      }
    })());

    // Run them concurrently and don't fail everything if one fails
    const results = await Promise.all(fetchPromises);

    // Use available results to populate arrays
    const trendingRes = results.find(r => r.label === 'trendingWeek' && r.ok)?.data as TmdbResponse | undefined;
    const upcomingRes = results.find(r => r.label === 'upcoming' && r.ok)?.data as TmdbResponse | undefined;
    const topRatedRes = results.find(r => r.label === 'topRated' && r.ok)?.data as TmdbResponse | undefined;
    const categoriesRes = results.find(r => r.label === 'categories' && r.ok)?.data as TmdbResponse | undefined;

    // Map to normalized MediaItem arrays (empty if missing)
    const trendingArr = (trendingRes?.results ?? []).map(formatApiItem);
    const upcomingArr = (upcomingRes?.results ?? []).map(formatApiItem);
    const topRatedArr = (topRatedRes?.results ?? []).map(formatApiItem);
    const categoriesArr = (categoriesRes?.results ?? []).map(formatApiItem);

    // Update segmented sets (do it here so UI spotlights update independently)
    setTrendingNow(trendingArr);
    setComingSoon(upcomingArr);
    setTopRated(topRatedArr);

    // Combine and dedupe
    const combined = dedupeMedia([...trendingArr, ...upcomingArr, ...topRatedArr, ...categoriesArr]);
    const limited = combined.slice(0, 120);

    return limited;
  }, [formatApiItem]);

  // Load content on mount (with abort controller)
  useEffect(() => {
    const ac = new AbortController();
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const items = await fetchAllContent(ac.signal);
        if (!mounted) return;
        setAllMedia(items);
      } catch (err: any) {
        log('fetchAllContent threw:', err?.message ?? err);
        if (!mounted) return;
        setError('Failed to load content. Some features may be limited.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
      ac.abort();
      log('Aborted fetchAllContent on unmount');
    };
  }, [fetchAllContent]);

  // --- Discovery tool handlers (memoized for child components) ---
  const handleStreamingFilter = useCallback((platforms: string[]) => {
    setDiscoveryFilters(prev => ({ ...prev, platforms }));
    log('Streaming platforms selected:', platforms);
  }, []);

  const handleGenreMix = useCallback((genres: string[]) => {
    setDiscoveryFilters(prev => ({ ...prev, genres }));
    log('Genres selected:', genres);
  }, []);

  const handleRandomDiscover = useCallback(() => {
    log('Random discovery triggered');
    // Simple random sampling UX: shuffle allMedia and show first 20
    const shuffled = [...allMedia].sort(() => Math.random() - 0.5).slice(0, 50);
    setAllMedia(shuffled);
  }, [allMedia]);

  const handleTimeFilter = useCallback((duration: string) => {
    setDiscoveryFilters(prev => ({ ...prev, timeFilter: duration }));
    log('Time filter:', duration);
  }, []);

  const handlePersonalityMatch = useCallback((type: string) => {
    log('Quick filter selected:', type);
    let items = [...allMedia];

    switch (type) {
      case 'trending':
        items = items.sort((a, b) => (b.popularity ?? b.vote_count ?? 0) - (a.popularity ?? a.vote_count ?? 0)).slice(0, 50);
        break;
      case 'highly-rated':
        items = items.filter(m => (m.vote_average ?? 0) >= 8.0).sort((a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0)).slice(0, 50);
        break;
      case 'award-winners':
        items = items.filter(m => (m.vote_average ?? 0) >= 7.5).sort((a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0)).slice(0, 50);
        break;
      case 'new-seasons':
        items = items.filter(m => {
          const mt = m.media_type ?? (m.name ? 'tv' : 'movie');
          if (mt !== 'tv') return false;
          const date = m.first_air_date || m.release_date;
          if (!date) return false;
          const dt = new Date(date);
          const threeMonthsAgo = new Date(); threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          const threeMonthsFromNow = new Date(); threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
          return dt >= threeMonthsAgo && dt <= threeMonthsFromNow;
        }).sort((a, b) => (new Date(b.first_air_date || b.release_date || 0).getTime() - new Date(a.first_air_date || a.release_date || 0).getTime())).slice(0, 50);
        break;
      case 'binge-worthy':
        items = items.filter(m => (m.media_type === 'tv') && (m.vote_average ?? 0) >= 7.0).slice(0, 50);
        break;
      case 'hidden-gems':
        items = items.filter(m => (m.vote_average ?? 0) >= 7.0 && ((m.popularity ?? m.vote_count ?? 0) < 500)).slice(0, 50);
        break;
      default:
        items = items.slice(0, 50);
    }

    setDiscoveryFilters(prev => ({ ...prev, quickFilter: type }));
    setAllMedia(items);
  }, [allMedia]);

  // --- Media action handlers (wrap hook calls safely) ---
  const handleWatchNow = useCallback(async (media: MediaItem) => {
    try {
      const success = await watchNow({
        id: media.id.toString(),
        title: media.title,
        name: media.name,
        type: media.media_type,
        poster_path: media.poster_path,
        backdrop_path: media.backdrop_path,
        release_date: media.release_date,
        first_air_date: media.first_air_date,
        vote_average: media.vote_average,
        overview: media.overview,
        genre_ids: media.genre_ids
      });
      if (!success) log('watchNow returned false for', media.id);
      return success;
    } catch (err) {
      log('watchNow error:', err);
      return false;
    }
  }, [watchNow]);

  const handleAddToWatchlist = useCallback(async (media: MediaItem) => {
    try {
      const success = await addToWatchlist({
        id: media.id.toString(),
        title: media.title,
        name: media.name,
        type: media.media_type,
        poster_path: media.poster_path,
        backdrop_path: media.backdrop_path,
        release_date: media.release_date,
        first_air_date: media.first_air_date,
        vote_average: media.vote_average,
        overview: media.overview,
        genre_ids: media.genre_ids
      });
      if (success) log('Added to watchlist:', media.title);
      else log('Failed to add to watchlist:', media.title);
      return success;
    } catch (err) {
      log('addToWatchlist error:', err);
      return false;
    }
  }, [addToWatchlist]);

  const handleWatchTrailer = useCallback(async (media: MediaItem) => {
    try {
      const success = await watchTrailer({
        id: media.id.toString(),
        title: media.title,
        name: media.name,
        type: media.media_type,
        poster_path: media.poster_path,
        backdrop_path: media.backdrop_path,
        release_date: media.release_date,
        first_air_date: media.first_air_date,
        vote_average: media.vote_average,
        overview: media.overview,
        genre_ids: media.genre_ids
      }, true);
      if (!success) log('No trailer for', media.title);
      return success;
    } catch (err) {
      log('watchTrailer error:', err);
      return false;
    }
  }, [watchTrailer]);

  const handleSetReminder = useCallback(async (media: MediaItem) => {
    try {
      const success = await setReminder({
        id: media.id.toString(),
        title: media.title,
        name: media.name,
        type: media.media_type,
        poster_path: media.poster_path,
        backdrop_path: media.backdrop_path,
        release_date: media.release_date,
        first_air_date: media.first_air_date,
        vote_average: media.vote_average,
        overview: media.overview,
        genre_ids: media.genre_ids
      });
      if (success) log('Reminder set for', media.title);
      else log('Failed to set reminder for', media.title);
      return success;
    } catch (err) {
      log('setReminder error:', err);
      return false;
    }
  }, [setReminder]);

  const handleShowInfo = useCallback((media: MediaItem) => {
    log('Show info clicked for', media.title);
    // TODO: open modal or route to details
  }, []);

  // Quick adapters for IntelligentHero style components (if still used)
  const handleHeroWatchNow = useCallback((show: any) => {
    const media: MediaItem = { id: parseInt(show.id) || 0, title: show.title || show.name, name: show.title || show.name, media_type: (show.media_type || 'tv') as MediaType, ...show };
    handleWatchNow(media);
  }, [handleWatchNow]);

  const handleHeroAddToWatchlist = useCallback((show: any) => {
    const media: MediaItem = { id: parseInt(show.id) || 0, title: show.title || show.name, name: show.title || show.name, media_type: (show.media_type || 'tv') as MediaType, ...show };
    handleAddToWatchlist(media);
  }, [handleAddToWatchlist]);

  const handleHeroShowInfo = useCallback((show: any) => {
    const media: MediaItem = { id: parseInt(show.id) || 0, title: show.title || show.name, name: show.title || show.name, media_type: (show.media_type || 'tv') as MediaType, ...show };
    handleShowInfo(media);
  }, [handleShowInfo]);

  // Loading UI
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <NavigationHeader />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
            <p className="text-slate-400">Loading amazing content for you…</p>
          </div>
        </div>
      </div>
    );
  }

  // Error UI (non-fatal: can still show partial content if desired)
  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <NavigationHeader />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-900/20 border border-red-500/40 rounded-2xl p-8 text-center max-w-lg mx-auto"
          >
            <div className="text-red-400 text-4xl mb-2">⚠️</div>
            <h3 className="text-lg font-semibold text-red-300 mb-2">Failed to load content</h3>
            <p className="text-red-200 mb-6">{error}</p>
            <div className="flex justify-center">
              <Button
                onClick={() => {
                  // quick retry
                  window.location.reload();
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <NavigationHeader />

      {/* Spotlight */}
      {currentSpotlight && currentSpotlight.item && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 mb-8">
          <div className="relative">
            {spotlights.length > 1 && (
              <div className="absolute -top-2 right-4 flex gap-2 z-10">
                {spotlights.map((_, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => setCurrentSpotlightIndex(idx)}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    className={`h-1 rounded-full transition-all duration-200 ${ idx === currentSpotlightIndex ? 'w-8 bg-white shadow-lg' : 'w-4 bg-white/30 hover:bg-white/50' }`}
                    aria-label={`Go to spotlight ${idx + 1}`}
                  />
                ))}
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={currentSpotlightIndex}
                initial={{ opacity: 0, scale: 0.98, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -12 }}
                transition={{ duration: 0.45, ease: [0.2, 0, 0.2, 1] }}
              >
                <DiscoverSpotlight
                  title={currentSpotlight.title}
                  badge={currentSpotlight.badge}
                  badgeColor={currentSpotlight.badgeColor}
                  feature={currentSpotlight.item}
                  onWatchNow={handleWatchNow}
                  onAddToList={handleAddToWatchlist}
                  onSetReminder={handleSetReminder}
                  ctaText={currentSpotlight.cta}
                  delay={0}
                  isUpcoming={currentSpotlight.isUpcoming}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-16">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <InteractiveDiscoveryTools
            onGenreMix={handleGenreMix}
            onRandomDiscover={handleRandomDiscover}
            onTimeFilter={handleTimeFilter}
            onPersonalityMatch={handlePersonalityMatch}
            onStreamingFilter={handleStreamingFilter}
            className="mb-16"
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
          <SmartCategoriesComponent
            mediaData={excludeUserShows(allMedia)}
            onMediaClick={(m: MediaItem) => log('SmartCategories clicked', m.id)}
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
