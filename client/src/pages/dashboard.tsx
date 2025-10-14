/**
 * Dashboard Page — FINAL OCTOBER PRODUCTION BUILD
 * @version 1.0.0
 * @lastModified 2025-10-14T18:35:00Z
 * @author BingeBoard Team
 * 
 * Features:
 *  - Animated Spotlight hero with backdrop + poster overlay + gradient
 *  - Responsive layout (poster left / text right on desktop, stacked on mobile)
 *  - "For You" section with filters + working recommendations
 *  - Continue Watching section
 *  - Unified media actions (watch, trailer, add to list)
 *  - Mobile & app optimized
 *  - No Friend Activity
 */

import React, { useState, useMemo } from "react";
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
import { apiFetch } from "@/utils/api-config";

console.log('🎬 Dashboard loaded at:', new Date().toISOString());

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

// --- Dashboard ---
const DashboardPage: React.FC = () => {
  const [filters, setFilters] = useState({
    genre: [] as string[],
    network: [] as string[],
    year: [] as string[],
  });

  // --- API Queries ---
  const { data: trendingData } = useQuery({
    queryKey: ["trending"],
    queryFn: async () => {
      const res = await apiFetch("/api/trending/tv/day?includeStreaming=true");
      if (!res.ok) throw new Error("Failed to fetch trending");
      return res.json();
    },
  });

  const { data: personalizedData, isLoading: personalizedLoading } = useQuery({
    queryKey: ["personalized-with-streaming", "v2"],
    queryFn: async () => {
      const res = await apiFetch(
        "/api/tmdb/discover/tv?sort_by=popularity.desc&includeStreaming=true"
      );
      if (!res.ok) throw new Error("Failed to fetch recommendations");
      return res.json();
    },
  });

  // --- Data Normalization ---
  const processedTrending = useMemo(() => {
    if (!trendingData) return [];
    return normalizeMedia((trendingData as any)?.results || []);
  }, [trendingData]);

  const spotlightItem = useMemo(() => {
    return (
      processedTrending.find((item) => item.streaming?.length > 0) ||
      processedTrending[0]
    );
  }, [processedTrending]);

  const filteredRecommendations = useMemo(() => {
    if (!personalizedData) return [];
    let items = normalizeMedia((personalizedData as any)?.results || []);

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

  // Debug logging
  console.log('📊 Dashboard Data:', {
    trendingCount: processedTrending.length,
    recommendationsCount: filteredRecommendations.length,
    hasSpotlight: !!spotlightItem,
    spotlightTitle: spotlightItem?.title || spotlightItem?.name,
    isLoading: personalizedLoading
  });
  return (
    <div className="min-h-screen bg-slate-950 w-full overflow-x-hidden">
      <NavigationHeader />

      <main className="w-full max-w-none px-3 sm:px-6 md:px-10 lg:px-20 py-6 sm:py-10 space-y-12">
        {/* --- Spotlight Section --- */}
        {spotlightItem && (
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            className="relative w-full overflow-hidden rounded-xl shadow-xl min-h-[400px] md:min-h-[500px]"
          >
            {/* Backdrop Background */}
            <div
              className="absolute inset-0 bg-cover bg-center filter brightness-75"
              style={{
                backgroundImage: `url(${spotlightItem.backdrop_path || spotlightItem.poster_path})`,
              }}
            />

            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

            {/* Content */}
            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 px-4 sm:px-8 py-6 md:py-12">
              {/* Poster */}
              <div className="flex-shrink-0 w-32 sm:w-44 md:w-56 rounded-lg overflow-hidden shadow-lg">
                <img
                  src={spotlightItem.poster_path || spotlightItem.backdrop_path}
                  alt={spotlightItem.title || spotlightItem.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Text & Actions */}
              <div className="flex-1 text-white space-y-3">
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

                {/* Overview */}
                {spotlightItem.overview && (
                  <p className="text-gray-200 text-sm sm:text-base md:text-lg line-clamp-3 md:line-clamp-4 max-w-3xl">
                    {spotlightItem.overview}
                  </p>
                )}

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

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button
                    onClick={() => watchNow(spotlightItem as any)}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 text-base"
                    size="lg"
                  >
                    ▶ Watch Now
                  </Button>
                  <Button
                    onClick={() => watchTrailer(spotlightItem as any)}
                    variant="outline"
                    className="text-white border-white hover:bg-white/10 px-6 py-2 text-base"
                    size="lg"
                  >
                    🎬 Trailer
                  </Button>
                  <Button
                    onClick={() => addToWatchlist(spotlightItem as any)}
                    variant="ghost"
                    className="text-white border border-white hover:bg-white/10 px-6 py-2 text-base"
                    size="lg"
                  >
                    + My List
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {filteredRecommendations.map((media) => (
                <UniversalMediaCard
                  key={media.id}
                  media={media}
                  variant="vertical-polished"
                  size="sm"
                  showRating
                  actions={{ watchNow: true, trailer: false, addToList: true }}
                  moveButtonsToBottom
                  onAddToWatchlist={addToWatchlist}
                  onWatchNow={watchNow}
                  className="rounded-lg overflow-hidden hover:scale-[1.02] transition-transform"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400">
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
    </div>
  );
};

export default DashboardPage;