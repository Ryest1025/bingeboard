import React, { useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import AppLayout from "@/components/layouts/AppLayout";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import EnhancedFilterSystem from '@/components/common/EnhancedFilterSystem';
import BrandedShowModal from '@/components/search/BrandedShowModal';
import HeroSpot from '@/components/hero/HeroSpot';
import TrendingCarousel from '@/components/TrendingCarousel';
import RecommendationsSection from '@/components/RecommendationsSection';
import HiddenGemsSection from '@/components/HiddenGemsSection';
import FloatingActions from '@/components/FloatingActions';
import { mockTrendingMovies, mockTrendingTV } from '@/mock/shows';
import { Show } from '@/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Play, Plus, ChevronRight } from 'lucide-react';

// ———————————————————————————————————————————————————————————
// Types
// ———————————————————————————————————————————————————————————

type FilterState = {
  mood?: string | null;
  genre?: string;
  sort?: string;
  platforms?: string[];
  rating?: number;
  year?: number;
};

// ———————————————————————————————————————————————————————————
// API utilities (with error handling)
// ———————————————————————————————————————————————————————————

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  try {
    const res = await fetch(url, {
      ...init,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {})
      }
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Request failed (${res.status}) ${res.statusText} ${text ? `- ${text}` : ''}`);
    }
    return (await res.json()) as T;
  } catch (err) {
    throw err instanceof Error ? err : new Error('Unknown network error');
  }
}

// ———————————————————————————————————————————————————————————
// Query helpers — each section gets its own key for caching & prefetch
// ———————————————————————————————————————————————————————————
const qk = {
  hero: (filters: FilterState) => ['discover', 'hero', filters],
  recommendations: (filters: FilterState) => ['discover', 'recs', filters],
  trending: () => ['discover', 'trending'],
  comingSoon: () => ['discover', 'comingSoon'],
  mood: (mood: string | null) => ['discover', 'mood', mood],
};

async function getHero(filters: FilterState): Promise<Show> {
  const params = new URLSearchParams();
  if (filters.mood) params.append('mood', filters.mood);
  if (filters.genre) params.append('genre', filters.genre);

  const response = await fetchJSON<{ hero: Show }>(`/api/discover?${params}`);
  return response.hero;
}

async function getRecommendations(filters: FilterState): Promise<Show[]> {
  const params = new URLSearchParams();
  if (filters.mood) params.append('mood', filters.mood);
  if (filters.genre) params.append('genre', filters.genre);
  if (filters.sort) params.append('sort', filters.sort);

  const response = await fetchJSON<{ forYou: Show[] }>(`/api/discover?${params}`);
  return response.forYou || [];
}

async function getTrending(): Promise<Show[]> {
  const response = await fetchJSON<{ trendingThisWeek: Show[] }>('/api/discover');
  return response.trendingThisWeek || [];
}

async function getComingSoon(): Promise<Show[]> {
  return fetchJSON<Show[]>('/api/discover/upcoming');
}

async function getMoodPicks(mood: string | null): Promise<Show[]> {
  if (!mood) return [];
  const response = await fetchJSON<{ forYou: Show[] }>(`/api/discover?mood=${encodeURIComponent(mood)}`);
  return response.forYou || [];
}

async function addToWatchlist(showId: string | number, mediaType: string = 'movie') {
  return fetchJSON<{ success: true }>('/api/watchlist', {
    method: 'POST',
    body: JSON.stringify({ showId, type: mediaType }),
  });
}

// ———————————————————————————————————————————————————————————
// Animation variants
// ———————————————————————————————————————————————————————————
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
};

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94] // Custom easing for premium feel
    }
  }
};

const heroVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 1.2,
      ease: "easeOut"
    }
  }
};

const filterVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

// ———————————————————————————————————————————————————————————
// Page Component
// ———————————————————————————————————————————————————————————
export default function DiscoverPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  // Filter state controlled by EnhancedFilterSystem
  const [filters, setFilters] = useState<FilterState>({
    mood: null,
    genre: '',
    sort: 'popularity',
  });

  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const onFilterChange = useCallback((next: any) => {
    setFilters(next);
    // Extract all active filter values for component filtering
    const allFilters = [
      ...(next.genres || []),
      ...(next.platforms || []),
      ...(next.countries || []),
      ...(next.sports || [])
    ];
    setActiveFilters(allFilters);

    // Prefetch recommendations for responsiveness
    qc.prefetchQuery({
      queryKey: qk.recommendations(next),
      queryFn: () => getRecommendations(next)
    }).catch(() => { });
  }, [qc]);

  // Create hero shows from mock data
  const heroShows = useMemo(() => [...mockTrendingMovies, ...mockTrendingTV].slice(0, 5), []);

  // Queries with fallback to mock data
  const {
    data: hero,
    isLoading: heroLoading,
    isError: heroError,
  } = useQuery({
    queryKey: qk.hero(filters),
    queryFn: () => getHero(filters),
    staleTime: 60_000,
    // Fallback to first mock movie if API fails
    placeholderData: mockTrendingMovies[0],
  });

  const {
    data: recs,
    isLoading: recsLoading,
  } = useQuery({
    queryKey: qk.recommendations(filters),
    queryFn: () => getRecommendations(filters),
    placeholderData: mockTrendingMovies.slice(0, 4),
  });

  const { data: trending, isLoading: trendingLoading } = useQuery({
    queryKey: qk.trending(),
    queryFn: getTrending,
    staleTime: 60_000,
    placeholderData: mockTrendingMovies,
  });

  const { data: trendingTV, isLoading: trendingTVLoading } = useQuery({
    queryKey: ['trending-tv'],
    queryFn: () => fetchJSON<Show[]>('/api/discover/trending-tv'),
    placeholderData: mockTrendingTV,
  });

  // ———————————————————————————————————————————————————————————
  // Modal state
  // ———————————————————————————————————————————————————————————
  const [activeShow, setActiveShow] = useState<Show | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = useCallback((show: Show) => {
    setActiveShow(show);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setActiveShow(null);
  }, []);

  // ———————————————————————————————————————————————————————————
  // Actions
  // ———————————————————————————————————————————————————————————
  const handleQuickAdd = useCallback(async (show: Show) => {
    try {
      if (!user) {
        toast({
          title: 'Sign in required',
          description: 'Please sign in to add to your list.'
        });
        return;
      }
      await addToWatchlist(show.id, show.mediaType || 'movie');
      toast({
        title: 'Added',
        description: `"${show.title}" was added to your list.`
      });
      await qc.invalidateQueries({ queryKey: ['watchlist'] });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not add to list';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      });
    }
  }, [toast, user, qc]);

  const handleWatchNow = useCallback((show: Show) => {
    console.log('Watch now:', show.title);
    // Implement watch functionality
  }, []);

  const handleMoreInfo = useCallback((show: Show) => {
    openModal(show);
  }, [openModal]);

  return (
    <AppLayout>
      <motion.main
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
        aria-label="Discover page"
      >

        {/* Hero Section */}
        <motion.section
          variants={heroVariants}
          initial="hidden"
          animate="visible"
          aria-label="Hero spotlight"
        >
          <HeroSpot
            shows={heroShows}
            height="h-[600px]"
            onWatchNow={handleWatchNow}
            onMoreInfo={handleMoreInfo}
          />
        </motion.section>

        {/* Sticky Filters */}
        <motion.section
          variants={filterVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          aria-label="Filters"
          className="sticky top-0 z-20 bg-slate-900 bg-opacity-95 backdrop-blur-sm p-4 md:p-6 shadow-md border-b border-slate-700/30"
        >
          <div className="mx-auto max-w-7xl">
            <EnhancedFilterSystem
              persistKey="discover-filters"
              showAdvanced={false}
              defaultExpanded={false}
              compactMode={true}
              onFiltersChange={onFilterChange}
            />
          </div>
        </motion.section>

        {/* Content Sections */}
        <div className="mx-auto max-w-7xl p-4 md:p-8 space-y-16">

          {/* Trending Movies */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <TrendingCarousel
              title="Trending Movies"
              shows={trending || mockTrendingMovies}
              activeFilters={activeFilters}
              viewAllUrl="/movies"
              onShowClick={openModal}
              onAddToList={handleQuickAdd}
            />
          </motion.div>

          {/* Trending TV Shows */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <TrendingCarousel
              title="Trending TV Shows"
              shows={trendingTV || mockTrendingTV}
              activeFilters={activeFilters}
              viewAllUrl="/tv"
              onShowClick={openModal}
              onAddToList={handleQuickAdd}
            />
          </motion.div>

          {/* AI Recommendations */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <RecommendationsSection
              title="AI Recommendations"
              shows={recs || mockTrendingMovies.slice(0, 4)}
              activeFilters={activeFilters}
              onShowClick={openModal}
              onAddToList={handleQuickAdd}
            />
          </motion.div>

          {/* Hidden Gems */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <HiddenGemsSection
              shows={[...mockTrendingMovies, ...mockTrendingTV]}
              activeFilters={activeFilters}
              onShowClick={openModal}
              onAddToList={handleQuickAdd}
            />
          </motion.div>

        </div>

        {/* Enhanced Floating Actions */}
        <FloatingActions
          onAddToWatchlist={() => {
            // Quick add the first trending movie as a demo
            if (mockTrendingMovies[0]) {
              handleQuickAdd(mockTrendingMovies[0]);
            }
          }}
          onToggleFavorites={() => {
            console.log('Toggle favorites view');
            // Implement favorites functionality
          }}
          onQuickSearch={() => {
            console.log('Open quick search');
            // Implement quick search modal
          }}
          onToggleFilters={() => {
            console.log('Toggle filters visibility');
            // Implement filter panel toggle
          }}
        />

        {/* Modal for detailed show actions */}
        {activeShow && (
          <BrandedShowModal
            showId={String(activeShow.id)}
            showType={activeShow.mediaType || 'movie'}
            open={modalOpen}
            onClose={closeModal}
            onAddToWatchlist={async (showId) => {
              try {
                await addToWatchlist(showId, activeShow.mediaType || 'movie');
                toast({
                  title: 'Added',
                  description: `"${activeShow.title}" was added to your list.`
                });
                await qc.invalidateQueries({ queryKey: ['watchlist'] });
              } catch (err) {
                const message = err instanceof Error ? err.message : 'Could not add to list';
                toast({
                  title: 'Error',
                  description: message,
                  variant: 'destructive'
                });
              }
            }}
            onWatchNow={(show) => {
              console.log('Watch now:', show.title);
            }}
          />
        )}
      </motion.main>
    </AppLayout>
  );
}
