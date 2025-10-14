/**
 * Dashboard Page — FINAL OCTOBER PRODUCTION BUILD
 * Version: October 14, 2025
 * Includes:
 *  - Animated Spotlight hero (fade-up / cinematic motion)
 *  - Refined "For You" section with filters + recommendations
 *  - Continue Watching section
 *  - Unified media actions (watch, trailer, add to list)
 *  - No Friend Activity (moved to Friends page)
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
            className="relative w-full"
          >
            <UniversalMediaCard
              media={spotlightItem}
              variant="spotlight-poster-backdrop"
              size="xl"
              showRating
              showGenres
              showReleaseDate
              showDescription
              actions={{ watchNow: true, trailer: true, addToList: true }}
              showStreamingLogoInButton
              onAddToWatchlist={addToWatchlist}
              onWatchTrailer={watchTrailer}
              onWatchNow={watchNow}
              className="w-full rounded-xl overflow-hidden shadow-xl"
            />
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