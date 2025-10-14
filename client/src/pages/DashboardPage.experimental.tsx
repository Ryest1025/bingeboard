import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import {
  useContinueWatching,
  useCurrentProgress,
} from '@/hooks/useViewingHistory';
import NavigationHeader from '@/components/navigation-header';
import { Button } from '@/components/ui/button';
import { normalizeMedia } from '@/utils/normalizeMedia';
import type { NormalizedMedia } from '@/types/media';
import ContinueWatching from '@/components/ContinueWatching';
import { MultiSelect } from '@/components/ui/multi-select';
import { UniversalMediaCard } from '@/components/universal';
import useMediaActions from '@/hooks/useMediaActions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import {
  Play,
  Clock,
  TrendingUp,
  Sparkles,
  Filter,
  Eye,
} from 'lucide-react';
import {
  getShowTitle,
  createPosterUrl,
  createBackdropUrl,
  type Show,
} from '@/lib/utils';
import type { MediaItem } from '@/services/userActions';

// --- Section Wrapper Component ---
const Section: React.FC<{ 
  title: string; 
  children: React.ReactNode; 
  action?: React.ReactNode 
}> = ({ title, children, action }) => (
  <section className="w-full space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
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
    <span className="text-gray-900 font-semibold mb-2">{label}</span>
    <MultiSelect
      options={options}
      value={selected}
      onValueChange={onChange}
      placeholder={`Select ${label}`}
      label={label}
      showClearAll
      searchable={options.length > 10}
      className="bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
    />
  </div>
);

// --- Filter Options ---
const FILTERS = {
  genre: ['Comedy', 'Drama', 'Action', 'Thriller', 'Horror', 'Romance', 'Sci-Fi', 'Documentary'],
  network: ['Netflix', 'HBO', 'Prime Video', 'Disney+', 'Hulu', 'Apple TV+', 'Paramount+'],
  year: ['2025', '2024', '2023', '2022', '2021', '2020'],
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

// --- Main Dashboard Component ---
const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<{ 
    genre: string[]; 
    network: string[]; 
    year: string[] 
  }>({
    genre: [],
    network: [],
    year: [],
  });
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // --- Safe API Queries with Proper Error Handling ---
  const { 
    data: trendingData, 
    isError: trendingError,
    isLoading: trendingLoading 
  } = useQuery({
    queryKey: ['trending'],
    queryFn: async () => {
      console.log('🔥 Fetching trending data...');
      const res = await fetch('/api/trending/tv/day?includeStreaming=true');
      if (!res.ok) throw new Error('Failed to fetch trending');
      const data = await res.json();
      console.log('✅ Trending data:', data?.results?.length || 0, 'items');
      return data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const { 
    data: personalizedData, 
    isError: personalizedError, 
    isLoading: personalizedLoading 
  } = useQuery({
    queryKey: ['personalized-with-streaming', 'v2'],
    queryFn: async () => {
      console.log('🤖 Fetching personalized recommendations...');
      const res = await fetch('/api/personalized/tv?sort_by=popularity.desc&includeStreaming=true');
      if (!res.ok) throw new Error('Failed to fetch recommendations');
      const data = await res.json();
      console.log('✅ Personalized data:', data?.results?.length || 0, 'items');
      return data;
    },
    staleTime: 10 * 60 * 1000,
    retry: 2,
  });

  // --- Process Data Safely with Proper Fallbacks ---
  const processedTrending: NormalizedMedia[] = useMemo(() => {
    if (trendingError || !trendingData?.results) {
      console.log('⚠️ No trending data available');
      return [];
    }
    
    try {
      const normalized = normalizeMedia(trendingData.results);
      console.log('✅ Processed trending:', normalized.length, 'items');
      return normalized;
    } catch (error) {
      console.error('❌ Error processing trending data:', error);
      return [];
    }
  }, [trendingData, trendingError]);

  const spotlightItem: NormalizedMedia | null = useMemo(() => {
    if (processedTrending.length === 0) {
      console.log('⚠️ No spotlight item available');
      return null;
    }
    
    // Prefer items with streaming availability, fallback to first item
    const withStreaming = processedTrending.find(item => 
      item.streaming && item.streaming.length > 0
    );
    const selected = withStreaming || processedTrending[0];
    
    console.log('🎯 Spotlight item:', selected.displayTitle, 
      `(${selected.streaming?.length || 0} platforms)`);
    return selected;
  }, [processedTrending]);

  const filteredRecommendations: NormalizedMedia[] = useMemo(() => {
    if (personalizedError || !personalizedData?.results) {
      console.log('⚠️ No personalized recommendations available');
      return [];
    }

    try {
      let items = normalizeMedia(personalizedData.results);
      console.log('📋 Initial recommendations:', items.length);
      
      // Apply filters safely
      if (filters.genre.length > 0) {
        items = items.filter(item => 
          item.genre_ids?.some(genreId => 
            filters.genre.includes(genreId.toString())
          )
        );
        console.log('🎭 After genre filter:', items.length);
      }

      if (filters.network.length > 0) {
        items = items.filter(item =>
          item.streaming?.some(platform =>
            filters.network.some(filterNetwork =>
              platform.provider_name?.toLowerCase().includes(filterNetwork.toLowerCase())
            )
          )
        );
        console.log('📺 After network filter:', items.length);
      }

      if (filters.year.length > 0) {
        items = items.filter(item => {
          const releaseDate = item.release_date || item.first_air_date;
          if (!releaseDate) return false;
          const year = new Date(releaseDate).getFullYear().toString();
          return filters.year.includes(year);
        });
        console.log('📅 After year filter:', items.length);
      }

      console.log('✅ Final filtered recommendations:', items.length);
      return items;
    } catch (error) {
      console.error('❌ Error processing personalized data:', error);
      return [];
    }
  }, [personalizedData, personalizedError, filters]);

  // --- Media Actions with Error Handling ---
  const {
    addToWatchlist,
    watchNow,
    watchTrailer,
    setReminder,
    isLoading: actionsLoading,
    error: actionsError,
  } = useMediaActions();

  // Helper: map normalized media -> action media shape
  const toActionMedia = (m: NormalizedMedia): MediaItem => ({
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
    const success = await addToWatchlist(toActionMedia(media));
    if (success) {
      showToast(`Added "${media.displayTitle}" to watchlist!`);
    } else {
      showToast('Failed to add to watchlist', 'error');
    }
  };

  const handleWatchNow = async (media: NormalizedMedia) => {
    const success = await watchNow(toActionMedia(media));
    if (!success) {
      showToast('No streaming option available', 'error');
    }
  };

  const handleWatchTrailer = async (media: NormalizedMedia) => {
    const success = await watchTrailer(toActionMedia(media), true);
    if (!success) {
      showToast('No trailer available', 'error');
    }
  };

  // --- Utility Functions ---
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
  };

  const updateFilter = (type: keyof typeof filters, selectedValues: string[]) => {
    setFilters(prev => ({ ...prev, [type]: selectedValues }));
  };

  const clearAllFilters = () => {
    setFilters({ genre: [], network: [], year: [] });
    showToast('Filters cleared');
  };

  const hasActiveFilters = filters.genre.length > 0 || filters.network.length > 0 || filters.year.length > 0;

  // --- Loading States ---
  const isLoading = trendingLoading || personalizedLoading;

  return (
    <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
      <NavigationHeader />

      <main className="container mx-auto px-4 py-8 space-y-12 max-w-none">
        {/* 🎯 SPOTLIGHT SECTION WITH CINEMATIC ANIMATION */}
        <Section title="Featured Today">
          {spotlightItem ? (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              className="w-full"
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
                onAddToWatchlist={handleAddToWatchlist}
                onWatchTrailer={handleWatchTrailer}
                onCardClick={(media) => console.log('Show details:', media)}
                onWatchNow={handleWatchNow}
                className="w-full"
              />
            </motion.div>
          ) : isLoading ? (
            <div className="w-full h-96 bg-gray-200 rounded-3xl animate-pulse" />
          ) : (
            <div className="text-center py-12 text-gray-400">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No spotlight content available</p>
              <p className="text-sm">Check back later for featured recommendations</p>
            </div>
          )}
        </Section>

        {/* 🎬 FOR YOU RECOMMENDATIONS WITH STAGGERED ANIMATIONS */}
        <Section
          title="For You"
          action={
            <div className="flex items-center gap-2">
              {/* Filter Controls */}
              <div className="flex gap-2">
                <MultiSelectFilter
                  label="Genre"
                  options={FILTERS.genre}
                  selected={filters.genre}
                  onChange={(selected) => updateFilter('genre', selected)}
                />
                <MultiSelectFilter
                  label="Network"
                  options={FILTERS.network}
                  selected={filters.network}
                  onChange={(selected) => updateFilter('network', selected)}
                />
                <MultiSelectFilter
                  label="Year"
                  options={FILTERS.year}
                  selected={filters.year}
                  onChange={(selected) => updateFilter('year', selected)}
                />
              </div>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="gap-2"
                >
                  Clear Filters
                </Button>
              )}

              <Button variant="outline" size="sm" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Get More
              </Button>
            </div>
          }
        >
          {filteredRecommendations.length > 0 ? (
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
            >
              {filteredRecommendations.map((media, index) => (
                <motion.div
                  key={media.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                  <UniversalMediaCard
                    media={media}
                    variant="vertical-polished"
                    size="sm"
                    showRating
                    showGenres={false}
                    showReleaseDate={false}
                    actions={{ watchNow: true, trailer: false, addToList: true }}
                    moveButtonsToBottom
                    showStreamingLogoInButton={false}
                    onAddToWatchlist={(media) => handleAddToWatchlist(media as unknown as NormalizedMedia)}
                    onWatchTrailer={(media) => handleWatchTrailer(media as unknown as NormalizedMedia)}
                    onWatchNow={(media) => handleWatchNow(media as unknown as NormalizedMedia)}
                    className="rounded-lg overflow-hidden"
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {Array.from({ length: 12 }, (_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="aspect-[2/3] bg-gray-200 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : (
            <Card className="text-center py-8">
              <CardContent>
                <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  No recommendations available
                </h3>
                <p className="text-gray-500 mb-4">
                  {trendingError || personalizedError
                    ? 'Unable to load recommendations. Please try again later.'
                    : hasActiveFilters
                    ? 'No content matches your current filters. Try adjusting them.'
                    : 'Check back later for personalized recommendations.'}
                </p>
                {hasActiveFilters && (
                  <Button onClick={clearAllFilters} className="gap-2">
                    <Filter className="h-4 w-4" />
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </Section>
      </main>

      {/* Toast Notifications */}
      <Toast
        isVisible={toastMessage !== ''}
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage('')}
      />
    </div>
  );
};

export default DashboardPage;