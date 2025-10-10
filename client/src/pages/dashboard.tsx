import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import NavigationHeader from '@/components/navigation-header';
import { Button } from '@/components/ui/button';
import { normalizeMedia } from '@/utils/normalizeMedia';
import type { NormalizedMedia } from '@/types/media';
import ContinueWatching from '@/components/ContinueWatching';
import { MultiSelect } from "@/components/ui/multi-select";
import { UniversalMediaCard } from '@/components/universal';
import useMediaActions from '@/hooks/useMediaActions';
import { apiFetch } from '@/utils/api-config';

// --- Section Wrapper ---
const Section: React.FC<{ title: string; children: React.ReactNode; action?: React.ReactNode }> = ({ title, children, action }) => (
  <section className="w-full space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
    <div className="w-full">{children}</div>
  </section>
);

// --- Multi-Select Filter Component ---
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

// --- Filters ---
const FILTERS = {
  genre: ['Comedy', 'Drama', 'Action', 'Thriller', 'Horror', 'Romance', 'Sci-Fi', 'Documentary'],
  network: ['Netflix', 'HBO', 'Prime Video', 'Disney+', 'Hulu', 'Apple TV+', 'Paramount+'],
  year: ['2025', '2024', '2023', '2022', '2021', '2020']
};

// --- Dashboard Page ---
const DashboardPage: React.FC = () => {
  const [filters, setFilters] = useState<{ genre: string[]; network: string[]; year: string[] }>({
    genre: [],
    network: [],
    year: []
  });

  // API Queries
  const { data: trendingData, isError: trendingError } = useQuery({
    queryKey: ['trending'],
    queryFn: async () => {
      const res = await apiFetch('/api/trending/tv/day?includeStreaming=true');
      if (!res.ok) throw new Error('Failed to fetch trending');
      return res.json();
    }
  });

  const { data: personalizedData, isError: personalizedError, isLoading: personalizedLoading } = useQuery({
    queryKey: ['personalized-with-streaming', 'v2'],
    queryFn: async () => {
      const res = await apiFetch('/api/tmdb/discover/tv?sort_by=popularity.desc&includeStreaming=true');
      if (!res.ok) throw new Error('Failed to fetch recommendations');
      return res.json();
    }
  });

  // Process data
  const processedTrending = useMemo(() => {
    if (trendingError || !trendingData) return [];
    return normalizeMedia((trendingData as any)?.results || []);
  }, [trendingData, trendingError]);

  const spotlightItem = useMemo(() => {
    return processedTrending.find(item => item.streaming?.length > 0) || processedTrending[0];
  }, [processedTrending]);

  const filteredRecommendations = useMemo(() => {
    if (personalizedError || !personalizedData) return [];
    let items = normalizeMedia((personalizedData as any)?.results || []);

    // Apply filters
    if (filters.genre.length > 0) {
      items = items.filter(item =>
        filters.genre.some(genre => item.genres?.some(g => g.name === genre))
      );
    }

    if (filters.network.length > 0) {
      items = items.filter(item =>
        filters.network.some(network =>
          item.streaming?.some(platform =>
            platform?.provider_name?.includes(network) || platform?.name?.includes(network)
          )
        )
      );
    }

    if (filters.year.length > 0) {
      items = items.filter(item => {
        const date = item.release_date || item.first_air_date;
        if (!date) return false;
        return filters.year.includes(new Date(date).getFullYear().toString());
      });
    }

    return items.slice(0, 6);
  }, [personalizedData, personalizedError, filters]);

  // Media actions hook for all functionality
  const {
    addToWatchlist,
    watchNow,
    watchTrailer,
    setReminder,
    isLoading: actionsLoading,
    error: actionsError
  } = useMediaActions();

  // Handler functions
  const handleAddToWatchlist = async (media: any) => {
    const success = await addToWatchlist(media);
    if (success) {
      console.log('Added to watchlist:', media.title || media.name);
    } else {
      console.error('Failed to add to watchlist');
    }
  };

  const handleWatchNow = async (media: any) => {
    const success = await watchNow(media);
    if (!success) {
      console.error('Failed to launch watch');
    }
  };

  const handleWatchTrailer = async (media: any) => {
    const success = await watchTrailer(media, true); // Open in modal
    if (!success) {
      console.error('No trailer available');
    }
  };

  const handleSetReminder = async (media: any) => {
    const success = await setReminder(media);
    if (success) {
      console.log('Reminder set for:', media.title || media.name);
    } else {
      console.error('Failed to set reminder');
    }
  };

  const updateFilter = (type: keyof typeof filters, selectedValues: string[]) => {
    setFilters(prev => ({ ...prev, [type]: selectedValues }));
  };

  const clearAllFilters = () => setFilters({ genre: [], network: [], year: [] });

  const hasActiveFilters = filters.genre.length > 0 || filters.network.length > 0 || filters.year.length > 0;

  return (
    <div className="min-h-screen bg-slate-900 w-full overflow-x-hidden">
      <NavigationHeader />

      <main className="w-full max-w-none px-4 md:px-8 lg:px-16 py-8 space-y-12">
        {/* Spotlight Section - New Poster + Backdrop Variant */}
        {spotlightItem ? (
          <UniversalMediaCard
            media={spotlightItem}
            variant="spotlight-poster-backdrop"
            size="xl"
            showRating
            showGenres
            showReleaseDate
            showDescription
            actions={{ watchNow: true, trailer: true, addToList: true }}
            showStreamingLogoInButton={true} // Logo inside Watch Now button
            onAddToWatchlist={handleAddToWatchlist}
            onWatchTrailer={handleWatchTrailer}
            onCardClick={media => console.log('Show details:', media)}
            onWatchNow={handleWatchNow}
            className="w-full"
          />
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">No spotlight content available</p>
          </div>
        )}

        {/* For You Section */}
        <Section title="For You" action={hasActiveFilters ? (
          <Button variant="outline" size="sm" onClick={clearAllFilters}>
            Clear Filters
          </Button>
        ) : undefined}>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <MultiSelectFilter label="Genre" options={FILTERS.genre} selected={filters.genre} onChange={vals => updateFilter("genre", vals)} />
            <MultiSelectFilter label="Network" options={FILTERS.network} selected={filters.network} onChange={vals => updateFilter("network", vals)} />
            <MultiSelectFilter label="Year" options={FILTERS.year} selected={filters.year} onChange={vals => updateFilter("year", vals)} />
          </div>

          {/* Recommendations Grid */}
          {personalizedLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-slate-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredRecommendations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg mb-4">
                {hasActiveFilters ? 'No shows match your selected filters' : 'No recommendations available'}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearAllFilters}>
                  Clear All Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {filteredRecommendations.map(media => (
                <UniversalMediaCard
                  key={media.id}
                  media={media}
                  variant="vertical-polished"
                  size="sm"
                  showRating
                  showGenres={false}
                  showReleaseDate={false}
                  actions={{ watchNow: true, trailer: false, addToList: true }}
                  moveButtonsToBottom={true} // Buttons at bottom
                  showStreamingLogoInButton={false} // Logos in corner, not in button
                  onAddToWatchlist={handleAddToWatchlist}
                  onWatchTrailer={handleWatchTrailer}
                  onCardClick={m => console.log('Show details:', m)}
                  onWatchNow={handleWatchNow}
                  className="rounded-lg overflow-hidden"
                />
              ))}
            </div>
          )}
        </Section>

        {/* Continue Watching */}
        <ContinueWatching limit={10} />
      </main>
    </div>
  );
};

export default DashboardPage;