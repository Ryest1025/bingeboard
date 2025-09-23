import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import NavigationHeader from '@/components/navigation-header';
import { EnhancedShowCard } from '@/components/EnhancedShowCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { normalizeMedia } from '@/utils/normalizeMedia';
import { filterMedia } from '@/utils/filterMedia';
import type { NormalizedMedia } from '@/types/media';
import { HeroCarousel } from '@/components/HeroCarousel';
import StreamingLogos from '@/components/streaming-logos';
import TrailerButton from '@/components/trailer-button';
import ContinueWatching from '@/components/ContinueWatching';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// --- Section Wrapper ---
const Section: React.FC<{ title: string; children: React.ReactNode; action?: React.ReactNode }> = ({ title, children, action }) => (
  <section className="w-full space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
    <div className="w-full">
      {children}
    </div>
  </section>
);

// --- Multi-Select Filter Component ---
const MultiSelectFilter: React.FC<{
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}> = ({ label, options, selected, onChange }) => {
  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const displayValue = selected.length > 0 
    ? selected.length === 1 
      ? selected[0] 
      : `${selected.length} selected`
    : `Select ${label}`;

  return (
    <div className="flex flex-col">
      <span className="text-white font-semibold mb-2">{label}</span>
      <Select>
        <SelectTrigger className="bg-slate-800 border border-slate-700 text-white rounded-lg hover:bg-slate-700 transition-colors">
          <SelectValue placeholder={displayValue} />
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border border-slate-700 text-white max-h-60 overflow-y-auto">
          {options.map(option => (
            <div
              key={option}
              onClick={() => toggleOption(option)}
              className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-700 cursor-pointer text-white text-sm transition-colors"
            >
              <input 
                type="checkbox" 
                checked={selected.includes(option)} 
                readOnly 
                className="accent-blue-500 pointer-events-none"
              />
              <span>{option}</span>
            </div>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};





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

  // API Queries with proper error handling
  const { data: trendingData, isError: trendingError, isLoading: trendingLoading } = useQuery({
    queryKey: ['trending'],
    queryFn: async () => {
      const res = await fetch('/api/trending/tv/day?includeStreaming=true');
      if (!res.ok) throw new Error('Failed to fetch trending');
      return res.json();
    },
    retry: 1,
    retryDelay: 1000
  });

  const { data: personalizedData, isError: personalizedError, isLoading: personalizedLoading } = useQuery({
    queryKey: ['personalized-with-streaming', 'v2'],
    queryFn: async () => {
      const res = await fetch('/api/tmdb/discover/tv?sort_by=popularity.desc&includeStreaming=true');
      if (!res.ok) throw new Error('Failed to fetch recommendations');
      return res.json();
    },
    retry: 1,
    retryDelay: 1000
  });



  // Process data with fallbacks
  const processedTrending = useMemo(() => {
    if (trendingError || !trendingData) return [];
    return normalizeMedia((trendingData as any)?.results || []);
  }, [trendingData, trendingError]);

  const filteredRecommendations = useMemo(() => {
    if (personalizedError || !personalizedData) return [];
    
    let items = normalizeMedia((personalizedData as any)?.results || []);
    
    // Apply multi-select filters
    if (filters.genre.length > 0) {
      items = items.filter(item => 
        filters.genre.some(genre => item.genre_ids?.includes(parseInt(genre)) || 
        item.genres?.some(g => g.name === genre))
      );
    }
    
    if (filters.network.length > 0) {
      items = items.filter(item => 
        filters.network.some(network => 
          item.streaming?.some(platform => 
            platform.provider_name?.includes(network) || platform.name?.includes(network)
          )
        )
      );
    }
    
    if (filters.year.length > 0) {
      items = items.filter(item => {
        const releaseYear = new Date(item.release_date || item.first_air_date || '').getFullYear().toString();
        return filters.year.includes(releaseYear);
      });
    }
    
    // Limit to 6 items for "For You" section
    return items.slice(0, 6);
  }, [personalizedData, personalizedError, filters]);

  const handleAddToWatchlist = async (show: any) => {
    try {
      await fetch('/api/watchlist/add', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(show) 
      });
    } catch (err) {
      console.error('Failed to add to watchlist:', err);
    }
  };

  const updateFilter = (type: keyof typeof filters, selectedValues: string[]) => {
    setFilters(prev => ({
      ...prev,
      [type]: selectedValues
    }));
  };

  const clearAllFilters = () => {
    setFilters({ genre: [], network: [], year: [] });
  };

  const hasActiveFilters = filters.genre.length > 0 || filters.network.length > 0 || filters.year.length > 0;

  return (
    <div className="min-h-screen bg-slate-900 w-full overflow-x-hidden">
      <NavigationHeader />
      
      <main className="w-full max-w-none px-4 md:px-8 lg:px-16 py-8 space-y-12">
        {/* Hero Carousel */}
        <HeroCarousel shows={processedTrending.slice(0, 5)} />

        {/* For You Section */}
        <Section title="For You" action={
          hasActiveFilters ? (
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              Clear Filters
            </Button>
          ) : undefined
        }>
          {/* Interactive Multi-Select Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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

          {/* Recommendations Grid */}
          {personalizedLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-slate-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : personalizedError ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg mb-4">Unable to load recommendations</p>
              <p className="text-gray-500 text-sm">Check your connection and try again</p>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredRecommendations.map(show => (
                <div key={show.id} className="relative group">
                  <EnhancedShowCard show={show} onAddToWatchlist={handleAddToWatchlist} />
                  
                  {/* Trailer Button Overlay */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <TrailerButton 
                      show={{
                        id: show.id,
                        tmdbId: show.id,
                        title: show.displayTitle
                      }}
                      variant="destructive"
                      size="sm"
                      className="bg-red-600/90 hover:bg-red-700 text-white border-none shadow-lg"
                      showLabel={false}
                    />
                  </div>
                  
                  {/* Streaming Logos Overlay */}
                  {(() => {
                    const showData = show as any;
                    const streamingPlatforms = showData.streamingPlatforms || showData.streaming_platforms || showData.streamingProviders || showData.watchProviders || [];
                    return streamingPlatforms.length > 0 && (
                      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-black/70 rounded-md p-1">
                          <StreamingLogos 
                            providers={streamingPlatforms.map((platform: any) => ({
                              provider_id: platform.provider_id || 0,
                              provider_name: platform.provider_name || platform.name || '',
                              logo_path: platform.logo_path
                            }))}
                            size="sm"
                            maxDisplayed={2}
                          />
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Enhanced Continue Watching */}
        <ContinueWatching limit={10} />
      </main>
    </div>
  );
};

export default DashboardPage;