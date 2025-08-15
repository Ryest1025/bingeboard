// client/src/pages/DiscoverPage.tsx
import React, { useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AppLayout from "@/components/layouts/AppLayout";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import EnhancedFilterSystem from '@/components/common/EnhancedFilterSystem';
import BrandedShowModal from '@/components/search/BrandedShowModal';
import UniversalShowCard from '@/components/global/UniversalShowCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Play, Plus, ChevronRight } from 'lucide-react';

// ———————————————————————————————————————————————————————————
// Types
// ———————————————————————————————————————————————————————————

type Show = {
  id: string | number;
  title: string;
  year?: number;
  posterUrl?: string;
  poster?: string;
  backdrop?: string;
  overview?: string;
  genres?: string[];
  releaseDate?: string;
  rating?: number;
  runtime?: number;
  streamingPlatform?: string;
  platform?: string;
  mediaType?: string;
  streamingPlatforms?: Array<{
    provider_id: number;
    provider_name: string;
    logo_path?: string;
    type?: string;
  }>;
};

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
// UI helpers
// ———————————————————————————————————————————————————————————
function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-6" role="heading" aria-level={2}>
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      {onSeeAll ? (
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={onSeeAll} 
          aria-label={`See all for ${title}`}
          className="text-gray-400 hover:text-white"
        >
          See all <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      ) : null}
    </div>
  );
}

function Grid({ children, ariaLabel }: React.PropsWithChildren<{ ariaLabel: string }>) {
  return (
    <div
      role="grid"
      aria-label={ariaLabel}
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
    >
      {children}
    </div>
  );
}

function HorizontalScroll({ children, ariaLabel }: React.PropsWithChildren<{ ariaLabel: string }>) {
  return (
    <div
      role="list"
      aria-label={ariaLabel}
      className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      {children}
    </div>
  );
}

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

  const onFilterChange = useCallback((next: any) => {
    setFilters(next);
    // Prefetch recommendations for responsiveness
    qc.prefetchQuery({ 
      queryKey: qk.recommendations(next), 
      queryFn: () => getRecommendations(next) 
    }).catch(() => {});
  }, [qc]);

  // Queries with error handling
  const {
    data: hero,
    isLoading: heroLoading,
    isError: heroError,
    error: heroErrObj,
  } = useQuery({
    queryKey: qk.hero(filters),
    queryFn: () => getHero(filters),
  staleTime: 60_000,
  });

  const {
    data: recs,
    isLoading: recsLoading,
  } = useQuery({
    queryKey: qk.recommendations(filters),
    queryFn: () => getRecommendations(filters),
  placeholderData: (prev) => prev ?? [],
  });

  const { data: trending, isLoading: trendingLoading } = useQuery({
    queryKey: qk.trending(),
    queryFn: getTrending,
  staleTime: 60_000,
  });

  const { data: comingSoon, isLoading: comingSoonLoading } = useQuery({
    queryKey: qk.comingSoon(),
    queryFn: getComingSoon,
  });

  const { data: moodPicks, isLoading: moodLoading } = useQuery({
    queryKey: qk.mood(filters.mood ?? null),
    queryFn: () => getMoodPicks(filters.mood ?? null),
    enabled: Boolean(filters.mood),
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
  // Actions (hybrid: quick add on card; full actions live in modal)
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
      // Invalidate watchlist queries
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

  // ———————————————————————————————————————————————————————————
  // Hero styles
  // ———————————————————————————————————————————————————————————
  const heroStyles = useMemo(() => {
    const url = hero?.backdrop || hero?.posterUrl || hero?.poster;
    return url
      ? {
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,.4), rgba(0,0,0,.8)), url(${url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } as React.CSSProperties
      : {};
  }, [hero]);

  // ———————————————————————————————————————————————————————————
  // Scroll to first section handler
  // ———————————————————————————————————————————————————————————
  const scrollToContent = useCallback(() => {
    const element = document.getElementById('recommendations-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // ———————————————————————————————————————————————————————————
  // Render
  // ———————————————————————————————————————————————————————————
  return (
    <AppLayout>
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" aria-label="Discover page">
        
        {/* Sticky Filters */}
        <section
          aria-label="Filters"
          className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60 bg-gray-900/90 border-b border-gray-700/50"
        >
          <div className="mx-auto max-w-7xl px-4 py-3">
            <EnhancedFilterSystem 
              persistKey="discover-filters"
              showAdvanced={false}
              defaultExpanded={false}
              compactMode={true}
              onFiltersChange={onFilterChange}
            />
          </div>
        </section>

        {/* Hero Spotlight */}
        <section aria-label="Hero spotlight" className="mx-auto max-w-7xl px-4 pt-8">
          <div
            className="relative w-full rounded-2xl overflow-hidden min-h-[300px] sm:min-h-[400px] md:min-h-[500px]"
            style={heroStyles}
            role="img"
            aria-label={hero?.title ? `Featured: ${hero.title}` : 'Featured show'}
          >
            <div className="absolute inset-0 p-6 sm:p-8 md:p-12 flex flex-col justify-end">
              {heroLoading ? (
                <div className="space-y-4 w-full sm:w-2/3 md:w-1/2">
                  <Skeleton className="h-10 w-2/3 bg-gray-700/50" />
                  <Skeleton className="h-6 w-3/4 bg-gray-700/50" />
                  <Skeleton className="h-12 w-40 bg-gray-700/50" />
                </div>
              ) : heroError ? (
                <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6">
                  <p className="text-gray-300">
                    {(heroErrObj as Error | undefined)?.message ?? 'Unable to load featured content.'}
                  </p>
                </div>
              ) : hero ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-black/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 max-w-2xl"
                >
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-white">
                    {hero.title}
                  </h1>
                  {hero.overview ? (
                    <p className="text-base sm:text-lg text-gray-200 line-clamp-3 mb-6">
                      {hero.overview}
                    </p>
                  ) : null}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <Button
                      size="lg"
                      aria-label="Discover now - scroll to recommendations"
                      onClick={scrollToContent}
                      className="bg-white text-black hover:bg-gray-100 font-semibold px-8 py-3"
                    >
                      <Play className="w-5 h-5 mr-2 fill-current" />
                      Discover Now
                    </Button>
                    {hero.genres?.length ? (
                      <div className="flex gap-2 flex-wrap">
                        {hero.genres.slice(0, 3).map((genre) => (
                          <Badge 
                            key={genre}
                            variant="secondary"
                            className="bg-white/10 backdrop-blur-sm text-white border border-white/20"
                          >
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </motion.div>
              ) : null}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-8 space-y-12">
          
          {/* Recommendations */}
          <section id="recommendations-section" aria-label="Recommendations">
            <SectionHeader title="Recommended for you" />
            {recsLoading ? (
              <Grid ariaLabel="Loading recommendations">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={`rec-skel-${i}`} className="space-y-3">
                    <Skeleton className="aspect-[2/3] w-full rounded-xl bg-gray-700/50" />
                    <Skeleton className="h-4 w-3/4 bg-gray-700/30" />
                  </div>
                ))}
              </Grid>
            ) : (
              <Grid ariaLabel="Recommendations grid">
                {(recs ?? []).map((show) => (
                  <motion.div
                    key={show.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group"
                  >
                    <UniversalShowCard
                      show={show}
                      className="w-full transition-transform hover:scale-105"
                      onClick={() => openModal(show)}
                      onAddToList={() => handleQuickAdd(show)}
                      showQuickActions={true}
                    />
                  </motion.div>
                ))}
              </Grid>
            )}
          </section>

          {/* Trending Now */}
          <section aria-label="Trending">
            <SectionHeader
              title="Trending now"
              onSeeAll={() => {
                // Could navigate to full trending page
                console.log('Navigate to trending page');
              }}
            />
            {trendingLoading ? (
              <HorizontalScroll ariaLabel="Loading trending">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={`trend-skel-${i}`} className="min-w-[200px] space-y-3">
                    <Skeleton className="h-72 w-48 rounded-xl bg-gray-700/50" />
                    <Skeleton className="h-4 w-3/4 bg-gray-700/30" />
                  </div>
                ))}
              </HorizontalScroll>
            ) : (
              <HorizontalScroll ariaLabel="Trending carousel">
                {(trending ?? []).map((show) => (
                  <div key={show.id} role="listitem" className="min-w-[200px]">
                    <UniversalShowCard
                      show={show}
                      className="w-48 transition-transform hover:scale-105"
                      onClick={() => openModal(show)}
                      onAddToList={() => handleQuickAdd(show)}
                      showQuickActions={true}
                    />
                  </div>
                ))}
              </HorizontalScroll>
            )}
          </section>

          {/* Coming Soon */}
          <section aria-label="Coming soon">
            <SectionHeader title="Coming soon" />
            {comingSoonLoading ? (
              <Grid ariaLabel="Loading coming soon">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={`soon-skel-${i}`} className="space-y-3">
                    <Skeleton className="aspect-[2/3] w-full rounded-xl bg-gray-700/50" />
                    <Skeleton className="h-4 w-3/4 bg-gray-700/30" />
                  </div>
                ))}
              </Grid>
            ) : (
              <Grid ariaLabel="Coming soon grid">
                {(comingSoon ?? [])
                  .slice()
                  .sort((a, b) => (a.releaseDate ?? '').localeCompare(b.releaseDate ?? ''))
                  .map((show) => (
                    <motion.div
                      key={show.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group relative"
                    >
                      <UniversalShowCard
                        show={show}
                        className="w-full transition-transform hover:scale-105"
                        onClick={() => openModal(show)}
                        onAddToList={() => handleQuickAdd(show)}
                        showQuickActions={true}
                      />
                      {show.releaseDate && (
                        <Badge className="absolute top-2 right-2 bg-green-600 hover:bg-green-700 text-white text-xs">
                          {new Date(show.releaseDate).toLocaleDateString()}
                        </Badge>
                      )}
                    </motion.div>
                  ))}
              </Grid>
            )}
          </section>

          {/* Mood Picks */}
          {filters.mood && (
            <section aria-label="Mood picks">
              <SectionHeader title={`Perfect for ${filters.mood} moments`} />
              {moodLoading ? (
                <Grid ariaLabel="Loading mood picks">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={`mood-skel-${i}`} className="space-y-3">
                      <Skeleton className="aspect-[2/3] w-full rounded-xl bg-gray-700/50" />
                      <Skeleton className="h-4 w-3/4 bg-gray-700/30" />
                    </div>
                  ))}
                </Grid>
              ) : (
                <Grid ariaLabel="Mood picks grid">
                  {(moodPicks ?? []).map((show) => (
                    <motion.div
                      key={show.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group"
                    >
                      <UniversalShowCard
                        show={show}
                        className="w-full transition-transform hover:scale-105"
                        onClick={() => openModal(show)}
                        onAddToList={() => handleQuickAdd(show)}
                        showQuickActions={true}
                      />
                    </motion.div>
                  ))}
                </Grid>
              )}
            </section>
          )}

        </div>

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
              // Handle watch now action
              console.log('Watch now:', show.title);
            }}
          />
        )}
      </main>
    </AppLayout>
  );
}
