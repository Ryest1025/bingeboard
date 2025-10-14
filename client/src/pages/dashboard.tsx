/**
 * Dashboard Page — MERGED PRODUCTION + EXPERIMENTAL
 * @version 1.1.0
 * @lastModified 2025-10-14T20:30:00Z
 * @author BingeBoard Team
 * 
 * Features:
 *  - Animated Spotlight hero with backdrop + poster overlay + gradient
 *  - "For You" recommendations with filters & staggered animation
 *  - Continue Watching section
 *  - Multi-API personalized endpoint (/api/personalized/tv)
 *  - Media actions: Watch Now, Trailer, Add to Watchlist
 *  - Toast notifications for success/error
 *  - Fully mobile & desktop responsive
 *  - Build info badge for QA & staging
 */

import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import NavigationHeader from "@/components/navigation-header";
import ContinueWatching from "@/components/ContinueWatching";
import { MultiSelect } from "@/components/ui/multi-select";
import { Button } from "@/components/ui/button";
import { normalizeMedia } from "@/utils/normalizeMedia";
import { UniversalMediaCard } from "@/components/universal";
import useMediaActions from "@/hooks/useMediaActions";
import type { NormalizedMedia } from "@/types/media";
import type { MediaItem as ActionMediaItem } from "@/services/userActions";
import { apiFetch } from "@/utils/api-config";
import BuildInfoBadge from "@/components/BuildInfoBadge";
import { TrendingUp, Sparkles, Filter } from "lucide-react";

// TMDB base image sizes (choose balanced quality for hero & posters)
const TMDB_BACKDROP_SIZE = 'w1280';
const TMDB_POSTER_SIZE = 'w500';

function buildTmdbUrl(path?: string | null, size: string = 'original') {
  if (!path) return '';
  if (path.startsWith('http')) return path; // already full URL
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

// Inject build info (commit hash can be replaced during CI via env var)
const __BUILD_INFO__ = {
  timestamp: new Date().toISOString(),
  commit: (import.meta as any).env?.VITE_COMMIT_HASH || 'dev-local'
};
if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.log('🎬 Dashboard loaded', __BUILD_INFO__);
}

// --- Section Wrapper ---
const Section: React.FC<{
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}> = ({ title, children, action }) => (
  <section className="w-full space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
        {title}
      </h2>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
    {children}
  </section>
);

// --- Multi-Select Filter ---
const MultiSelectFilter: React.FC<{
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}> = ({ label, options, selected, onChange }) => (
  <div className="flex flex-col">
    <span className="text-white font-semibold mb-2">{label}</span>
    <MultiSelect
      options={options}
      value={selected}
      onValueChange={onChange}
      placeholder={`Select ${label}`}
      label={label}
      showClearAll
      searchable={options.length > 10}
      className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
    />
  </div>
);

// --- Filter Options ---
const FILTERS = {
  genre: [
    "Comedy",
    "Drama",
    "Action",
    "Thriller",
    "Horror",
    "Romance",
    "Sci-Fi",
    "Documentary",
  ],
  network: [
    "Netflix",
    "HBO",
    "Prime Video",
    "Disney+",
    "Hulu",
    "Apple TV+",
    "Paramount+",
  ],
  year: ["2025", "2024", "2023", "2022", "2021", "2020"],
};

// --- Toast Component ---
const Toast: React.FC<{
  isVisible: boolean;
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}> = ({ isVisible, message, type, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`}>
      {message}
    </div>
  );
};

// --- Dashboard ---
const DashboardPage: React.FC = () => {
  const [filters, setFilters] = useState({
    genre: [] as string[],
    network: [] as string[],
    year: [] as string[],
  });
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // --- API Queries ---
  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ["trending"],
    queryFn: async () => {
      const res = await apiFetch("/api/trending/tv/day?includeStreaming=true");
      if (!res.ok) throw new Error("Failed to fetch trending");
      return res.json();
    },
  });

  const { data: personalizedData, isLoading: personalizedLoading } = useQuery({
    queryKey: ["personalized-multiapi", "v1"],
    queryFn: async () => {
      const res = await apiFetch(
        "/api/personalized/tv?sort_by=popularity.desc&includeStreaming=true"
      );
      if (!res.ok) throw new Error("Failed to fetch recommendations");
      return res.json();
    },
  });

  // --- Data Normalization ---
  const processedTrending = useMemo(() => {
    if (!trendingData) return [];
    const raw = (trendingData as any)?.results || [];
    if (raw.length === 0) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('⚠️ Trending dataset empty - using fallback sample');
      }
      return normalizeMedia([
        {
          id: 999001,
          name: 'Sample Spotlight Show',
          overview: 'Fallback sample because trending data returned empty. This will disappear when the API returns data.',
          poster_path: '/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
          vote_average: 8.2,
          first_air_date: '2024-09-18',
          genres: [{ id: 18, name: 'Drama' }]
        }
      ] as any);
    }
    return normalizeMedia(raw);
  }, [trendingData]);

  const spotlightItem = useMemo(() => {
    return (
      processedTrending.find((item) => item.streaming?.length > 0) ||
      processedTrending[0]
    );
  }, [processedTrending]);

  const filteredRecommendations = useMemo(() => {
    if (!personalizedData) return [];
    const raw = (personalizedData as any)?.results || [];
    if (raw.length === 0) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('⚠️ Personalized recommendations empty.');
      }
      return [];
    }
    let items = normalizeMedia(raw || []);

    if (filters.genre.length > 0) {
      items = items.filter((item) =>
        filters.genre.some((genre) =>
          item.genres?.some((g) => g.name === genre)
        )
      );
    }

    if (filters.network.length > 0) {
      items = items.filter((item) =>
        filters.network.some((network) =>
          item.streaming?.some(
            (platform) =>
              platform?.provider_name?.includes(network) ||
              platform?.name?.includes(network)
          )
        )
      );
    }

    if (filters.year.length > 0) {
      items = items.filter((item) => {
        const date = item.release_date || item.first_air_date;
        if (!date) return false;
        return filters.year.includes(new Date(date).getFullYear().toString());
      });
    }

    return items.slice(0, 12);
  }, [personalizedData, filters]);

  // --- Media Actions ---
  const { addToWatchlist, watchNow, watchTrailer } = useMediaActions();

  const updateFilter = (type: keyof typeof filters, selectedValues: string[]) =>
    setFilters((prev) => ({ ...prev, [type]: selectedValues }));

  const clearAllFilters = () =>
    setFilters({ genre: [], network: [], year: [] });

  const hasActiveFilters =
    filters.genre.length > 0 ||
    filters.network.length > 0 ||
    filters.year.length > 0;

  // Helper: map normalized media -> action media shape
  const toActionMedia = (m: NormalizedMedia): ActionMediaItem => ({
    id: m.id.toString(),
    title: m.title,
    name: m.name,
    type: (m as any).type === 'movie' ? 'movie' : 'tv',
    poster_path: m.poster_path,
    backdrop_path: m.backdrop_path,
    release_date: m.release_date,
    first_air_date: m.first_air_date,
    vote_average: m.vote_average,
    overview: m.overview,
    genre_ids: m.genre_ids
  });

  const handleAddToWatchlist = async (media: NormalizedMedia) => {
    try {
      const success = await addToWatchlist(toActionMedia(media));
      if (success) {
        setToastMessage(`Added "${media.title || media.name}" to watchlist!`);
        setToastType('success');
      } else {
        setToastMessage('Failed to add to watchlist');
        setToastType('error');
      }
    } catch (error) {
      console.error('❌ Watchlist error:', error);
      setToastMessage('Failed to add to watchlist');
      setToastType('error');
    }
  };

  const handleWatchNow = async (media: NormalizedMedia) => {
    try {
      const success = await watchNow(toActionMedia(media));
      if (!success) {
        setToastMessage('No streaming option available');
        setToastType('error');
      }
    } catch (error) {
      console.error('❌ Watch now error:', error);
      setToastMessage('Failed to launch watch');
      setToastType('error');
    }
  };

  const handleWatchTrailer = async (media: NormalizedMedia) => {
    try {
      const success = await watchTrailer(toActionMedia(media), true);
      if (!success) {
        setToastMessage('No trailer available');
        setToastType('error');
      }
    } catch (error) {
      console.error('❌ Trailer error:', error);
      setToastMessage('Failed to load trailer');
      setToastType('error');
    }
  };

  if (import.meta.env.DEV) {
    // Debug logging (dev only)
    // eslint-disable-next-line no-console
    console.log('📊 Dashboard Data:', {
      trendingCount: processedTrending.length,
      recommendationsCount: filteredRecommendations.length,
      hasSpotlight: !!spotlightItem,
      spotlightTitle: spotlightItem?.title || spotlightItem?.name,
      trendingLoading,
      recommendationsLoading: personalizedLoading
    });
  }
  return (
    <div className="min-h-screen bg-slate-950 w-full overflow-x-hidden" role="main" aria-label="Dashboard">
      <NavigationHeader />

      <main className="w-full max-w-none px-3 sm:px-6 md:px-10 lg:px-20 py-6 sm:py-10 space-y-12" aria-live="polite">
        {/* --- Spotlight Section --- */}
        {trendingLoading && (
          <div className="relative w-full overflow-hidden rounded-xl shadow-xl min-h-[400px] md:min-h-[500px] bg-slate-800 animate-pulse flex items-end p-6 md:p-10">
            <div className="flex gap-6 items-end w-full">
              <div className="w-32 sm:w-44 md:w-56 aspect-[2/3] bg-slate-700 rounded-lg" />
              <div className="flex-1 space-y-4">
                <div className="h-10 bg-slate-700/70 rounded w-3/4" />
                <div className="h-4 bg-slate-700/60 rounded w-full" />
                <div className="h-4 bg-slate-700/60 rounded w-5/6" />
                <div className="flex gap-3 pt-2">
                  <div className="h-10 w-32 bg-slate-700 rounded" />
                  <div className="h-10 w-32 bg-slate-700/70 rounded" />
                  <div className="h-10 w-28 bg-slate-700/50 rounded" />
                </div>
              </div>
            </div>
          </div>
        )}
        {!trendingLoading && spotlightItem ? (
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            className="relative w-full overflow-hidden rounded-xl shadow-xl min-h-[400px] md:min-h-[500px]"
            aria-label="Spotlight show"
          >
            {/* Backdrop Background */}
            <div
              className="absolute inset-0 bg-cover bg-center filter brightness-75"
              style={{
                backgroundImage: `url(${buildTmdbUrl(spotlightItem.backdrop_path, TMDB_BACKDROP_SIZE) || buildTmdbUrl(spotlightItem.poster_path, TMDB_BACKDROP_SIZE)})`,
              }}
            />

            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/50 to-slate-900/10" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

            {/* Content */}
            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 px-4 sm:px-8 py-6 md:py-12">
              {/* Poster */}
              <div className="flex-shrink-0 w-32 sm:w-44 md:w-56 rounded-lg overflow-hidden shadow-2xl ring-1 ring-slate-900/60">
                <img
                  src={buildTmdbUrl(spotlightItem.poster_path, TMDB_POSTER_SIZE) || buildTmdbUrl(spotlightItem.backdrop_path, TMDB_POSTER_SIZE)}
                  alt={spotlightItem.title || spotlightItem.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Text & Actions */}
              <div className="flex-1 min-w-0 text-white space-y-3">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                  {spotlightItem.title || spotlightItem.name}
                </h2>
                
                {/* Genres & Year */}
                <div className="flex flex-wrap gap-2 text-sm sm:text-base text-gray-300">
                  {spotlightItem.vote_average && (
                    <span className="px-3 py-1 bg-yellow-600 text-white rounded-full font-semibold">
                      ⭐ {spotlightItem.vote_average.toFixed(1)}
                    </span>
                  )}
                  {spotlightItem.genres?.slice(0, 3).map((g) => (
                    <span key={g.id} className="px-3 py-1 bg-slate-800/80 rounded-full">
                      {g.name}
                    </span>
                  ))}
                  {(spotlightItem.release_date || spotlightItem.first_air_date) && (
                    <span className="px-3 py-1 bg-slate-800/80 rounded-full">
                      {new Date(spotlightItem.release_date || spotlightItem.first_air_date || '').getFullYear()}
                    </span>
                  )}
                </div>

                {/* Streaming Platforms */}
                {spotlightItem.streaming && spotlightItem.streaming.length > 0 && (
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm text-gray-400">Available on:</span>
                    {spotlightItem.streaming.slice(0, 4).map((platform, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-600/80 text-white rounded-full text-xs sm:text-sm"
                      >
                        {platform.provider_name || platform.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Overview */}
                {spotlightItem.overview && (
                  <p className="text-gray-200 text-sm sm:text-base md:text-lg line-clamp-3 md:line-clamp-4 max-w-3xl">
                    {spotlightItem.overview}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button
                    onClick={() => handleWatchNow(spotlightItem as NormalizedMedia)}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 text-base"
                    size="lg"
                    aria-label="Watch now"
                  >
                    ▶ Watch Now
                  </Button>
                  <Button
                    onClick={() => handleWatchTrailer(spotlightItem as NormalizedMedia)}
                    variant="outline"
                    className="text-white border-white hover:bg-white/10 px-6 py-2 text-base"
                    size="lg"
                    aria-label="Watch trailer"
                  >
                    🎬 Trailer
                  </Button>
                  <Button
                    onClick={() => handleAddToWatchlist(spotlightItem as NormalizedMedia)}
                    variant="ghost"
                    className="text-white border border-white hover:bg-white/10 px-6 py-2 text-base"
                    size="lg"
                    aria-label="Add to watchlist"
                  >
                    + My List
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="w-full min-h-[300px] rounded-xl flex items-center justify-center bg-slate-800/40 border border-slate-700 text-slate-300" aria-live="polite">
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold">No spotlight available</p>
              <p className="text-sm opacity-80">Waiting for trending data...</p>
            </div>
          </div>
        )}

        {/* --- For You Section --- */}
        <Section
          title="For You"
          action={
            hasActiveFilters ? (
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                Clear Filters
              </Button>
            ) : undefined
          }
        >
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6 overflow-x-auto pb-1 -mx-1 px-1" role="group" aria-label="Recommendation filters">
            <MultiSelectFilter
              label="Genre"
              options={FILTERS.genre}
              selected={filters.genre}
              onChange={(vals) => updateFilter("genre", vals)}
            />
            <MultiSelectFilter
              label="Network"
              options={FILTERS.network}
              selected={filters.network}
              onChange={(vals) => updateFilter("network", vals)}
            />
            <MultiSelectFilter
              label="Year"
              options={FILTERS.year}
              selected={filters.year}
              onChange={(vals) => updateFilter("year", vals)}
            />
          </div>

          {/* Recommendations */}
          {personalizedLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[2/3] bg-slate-800 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : filteredRecommendations.length > 0 ? (
            <motion.div 
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 auto-rows-fr"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.05,
                  },
                },
              }}
            >
              {filteredRecommendations.map((media) => (
                <motion.div
                  key={media.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  <UniversalMediaCard
                    media={media}
                    variant="vertical-polished"
                    size="sm"
                    showRating
                    actions={{ watchNow: true, trailer: false, addToList: true }}
                    moveButtonsToBottom
                    onAddToWatchlist={(m) => { void handleAddToWatchlist(m as unknown as NormalizedMedia); }}
                    onWatchNow={(m) => { void handleWatchNow(m as unknown as NormalizedMedia); }}
                    className="rounded-lg overflow-hidden hover:scale-[1.02] transition-transform"
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-10 text-gray-400" role="status" aria-live="polite">
              <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-base sm:text-lg mb-4">
                {hasActiveFilters
                  ? "No shows match your selected filters"
                  : "No recommendations available right now"}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearAllFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </Section>

        {/* --- Continue Watching --- */}
        <Section title="Continue Watching">
          <ContinueWatching limit={10} />
        </Section>
      </main>
      
      {/* Toast Notifications */}
      <Toast
        isVisible={toastMessage !== ''}
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage('')}
      />
      
      <BuildInfoBadge className="fixed bottom-3 right-3 opacity-80 hover:opacity-100 transition-opacity" />
    </div>
  );
};

export default DashboardPage;

// Mount build info badge (non-invasive)
if (typeof window !== 'undefined') {
  (window as any).__BUILD_INFO__ = (window as any).__BUILD_INFO__ || { ...__BUILD_INFO__ };
}