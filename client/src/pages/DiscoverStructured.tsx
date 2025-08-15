// client/src/pages/DiscoverStructured.tsx - New Functional & Intentional Design
import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import AppLayout from "@/components/layouts/AppLayout";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useUserActions } from '@/hooks/useUserActions';
import BrandedShowModal from '@/components/search/BrandedShowModal';
import UniversalShowCard from '@/components/global/UniversalShowCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { motion, useReducedMotion } from 'framer-motion';
import { Play, Plus, ChevronRight, ChevronLeft, Search } from 'lucide-react';

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
  mood: string | null;
  genre?: string;
  sort?: string;
  platforms?: string[];
  rating?: number;
  year?: number;
  country?: string;
};

interface DiscoverData {
  hero: Show | null;
  forYou: Show[];
  moodBuckets: string[];
  dynamicBlocks: { id: string; type: string; title: string }[];
  trendingThisWeek: Show[];
  anniversaries: any[];
  socialBuzz: { id: string; topic: string; mentions: number }[];
  meta: { source: string; fetchedAt: string };
}

// ———————————————————————————————————————————————————————————
// API utilities (with error handling for React Query)
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
  discover: () => ['discover'],
  upcomingReleases: () => ['upcoming-releases'],
  userPreferences: () => ['user-preferences'],
};

// Fetch discover data (existing API endpoint)
async function fetchDiscoverData(): Promise<DiscoverData> {
  return fetchJSON<DiscoverData>('/api/discover');
}

async function getHero(filters: FilterState): Promise<Show> {
  const response = await fetchDiscoverData();
  return response.hero || {
    id: 'fallback',
    title: 'Discover Amazing Content',
    overview: 'Explore our curated collection of shows and movies.',
  };
}

async function getRecommendations(filters: FilterState): Promise<Show[]> {
  const response = await fetchDiscoverData();
  let filtered = response.forYou || [];
  
  // Apply mood filtering
  if (filters.mood) {
    const moodToGenres: Record<string, string[]> = {
      'Cerebral': ['documentary', 'drama', 'thriller', 'mystery', 'biography'],
      'Feel-good': ['comedy', 'romance', 'family', 'musical', 'animation'],
      'Edge-of-seat': ['action', 'thriller', 'horror', 'crime', 'war', 'adventure']
    };
    
    const targetGenres = moodToGenres[filters.mood] || [];
    filtered = filtered.filter(show => 
      show.genres?.some(genre => 
        targetGenres.some(target => 
          genre.toLowerCase().includes(target.toLowerCase())
        )
      )
    );
  }
  
  return filtered;
}

async function getTrending(): Promise<Show[]> {
  const response = await fetchDiscoverData();
  return response.trendingThisWeek || [];
}

async function getComingSoon(): Promise<Show[]> {
  return fetchJSON<Show[]>('/api/discover/upcoming');
}

async function getMoodPicks(mood: string | null): Promise<Show[]> {
  if (!mood) return [];
  const response = await fetchDiscoverData();
  
  // Filter by mood-related genres
  const moodToGenres: Record<string, string[]> = {
    'Cerebral': ['documentary', 'drama', 'thriller', 'mystery', 'biography'],
    'Feel-good': ['comedy', 'romance', 'family', 'musical', 'animation'],
    'Edge-of-seat': ['action', 'thriller', 'horror', 'crime', 'war', 'adventure']
  };
  
  const targetGenres = moodToGenres[mood] || [];
  return (response.forYou || []).filter(show => 
    show.genres?.some(genre => 
      targetGenres.some(target => 
        genre.toLowerCase().includes(target.toLowerCase())
      )
    )
  );
}

// User preferences API
async function getUserPreferences() {
  return fetchJSON<any>('/api/user/preferences');
}

// Watchlist API using existing endpoints
async function addToWatchlist(showId: string | number, mediaType: string = 'movie') {
  return fetchJSON<{ success: true }>('/api/watchlist', {
    method: 'POST',
    body: JSON.stringify({ showId, type: mediaType }),
  });
}

// ———————————————————————————————————————————————————————————
// UI helpers
// ———————————————————————————————————————————————————————————
function SectionHeader({ title, subtitle, onSeeAll }: { title: string; subtitle?: string; onSeeAll?: () => void }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        {onSeeAll ? (
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={onSeeAll} 
            aria-label={`See all for ${title}`}
            className="text-gray-400 hover:text-white"
          >
            See all <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
          </Button>
        ) : null}
      </div>
      {subtitle ? (
        <p className="mt-1 text-sm text-gray-300/80 max-w-3xl">{subtitle}</p>
      ) : null}
    </div>
  );
}

function Grid({ children, ariaLabel, compact = false }: React.PropsWithChildren<{ ariaLabel: string; compact?: boolean }>) {
  return (
    <div
      role="grid"
      aria-label={ariaLabel}
  className={compact
    ? "grid grid-cols-4 gap-1.5 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 xl:grid-cols-10"
    : "grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8"}
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
      className="flex gap-4 overflow-x-auto pb-4"
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      {children}
    </div>
  );
}

// Enhanced Loading Skeleton Components
function ContentCardSkeleton() {
  return (
    <div className="group">
      <div className="relative overflow-hidden rounded-xl bg-gray-800/40 aspect-[2/3] mb-3">
        <Skeleton className="w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4 bg-gray-700/50" />
        <div className="flex gap-1">
          <Skeleton className="h-3 w-8 bg-gray-700/30 rounded-full" />
          <Skeleton className="h-3 w-8 bg-gray-700/30 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// Horizontal Carousel Component
function HorizontalCarousel({ 
  items, 
  title, 
  ariaLabel,
  onAddToWatchlist, 
  onWatchNow,
  cardWidth = 180,
}: { 
  items: Show[]; 
  title: string;
  ariaLabel?: string;
  onAddToWatchlist?: (show: Show) => void;
  onWatchNow?: (show: Show) => void;
  cardWidth?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const idRef = useRef<string>(`hc-${Math.random().toString(36).slice(2)}`);

  const scrollLeft = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  }, []);

  const scrollRight = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  }, []);

  const onKey = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        scrollLeft();
        break;
      case 'ArrowRight':
        e.preventDefault();
        scrollRight();
        break;
      case 'Home':
        e.preventDefault();
        containerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        break;
      case 'End':
        e.preventDefault();
        containerRef.current.scrollTo({ left: containerRef.current.scrollWidth, behavior: 'smooth' });
        break;
    }
  }, [scrollLeft, scrollRight]);

  if (!items.length) return null;

  return (
    <section className="group relative" aria-labelledby={title ? `${title.replace(/\s+/g, '-').toLowerCase()}-heading` : undefined} role="region" aria-label={ariaLabel || title || 'Carousel'}>
      {title && (
        <div className="flex justify-between items-center mb-6">
          <h2 
            id={`${title.replace(/\s+/g, '-').toLowerCase()}-heading`}
            className="text-2xl font-bold text-white"
          >
            {title}
          </h2>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={scrollLeft}
              className="bg-gray-800/60 backdrop-blur-sm border-gray-600 text-gray-300 hover:bg-gray-700/80 hover:text-white"
              aria-label={`Scroll ${title} left`}
              aria-controls={idRef.current}
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={scrollRight}
              className="bg-gray-800/60 backdrop-blur-sm border-gray-600 text-gray-300 hover:bg-gray-700/80 hover:text-white"
              aria-label={`Scroll ${title} right`}
              aria-controls={idRef.current}
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Always visible scroll arrows for sections without titles */}
      {!title && (
        <div className="absolute top-1/2 -translate-y-1/2 left-2 right-2 flex justify-between pointer-events-none z-10">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={scrollLeft}
            className="bg-gray-800/80 backdrop-blur-sm border-gray-600 text-gray-300 hover:bg-gray-700/90 hover:text-white shadow-lg pointer-events-auto opacity-80 hover:opacity-100 transition-opacity"
            aria-label="Scroll left"
            aria-controls={idRef.current}
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={scrollRight}
            className="bg-gray-800/80 backdrop-blur-sm border-gray-600 text-gray-300 hover:bg-gray-700/90 hover:text-white shadow-lg pointer-events-auto opacity-80 hover:opacity-100 transition-opacity"
            aria-label="Scroll right"
            aria-controls={idRef.current}
          >
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>
      )}
      
      <div 
        ref={containerRef}
        id={idRef.current}
        className="flex space-x-6 overflow-x-auto pb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
        role="list"
        aria-label={`${ariaLabel || title || 'Carousel'} items`}
        tabIndex={0}
        onKeyDown={onKey}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
    {items.map((item, index) => (
            <motion.div 
            key={item.id} 
      className="group/item"
      style={{ minWidth: cardWidth, maxWidth: cardWidth }}
            role="listitem"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="transform transition-all duration-300 hover:scale-105 hover:z-10 relative">
              <UniversalShowCard 
                show={item}
                className="w-full shadow-xl hover:shadow-2xl"
                onAddToList={onAddToWatchlist}
                showQuickActions={true}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// Full-bleed Featured Hero Carousel with embedded search
function FeaturedCarousel({
  items,
  onWatch,
  onAdd,
  onDetails,
  compact = false,
}: {
  items: Show[];
  onWatch: (show: Show) => void;
  onAdd: (show: Show) => void;
  onDetails?: (show: Show) => void;
  compact?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = items.length;
  const reduceMotion = useReducedMotion();
  const [liveMessage, setLiveMessage] = useState<string>("");

  useEffect(() => {
    if (count <= 1) return;
    if (paused || reduceMotion) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 7000);
    return () => clearInterval(id);
  }, [count, paused, reduceMotion]);

  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // Update live announcement when slide changes
  useEffect(() => {
    if (!count) return;
    const title = items[index]?.title || 'Slide';
    setLiveMessage(`Now showing: ${title}. Slide ${index + 1} of ${count}.`);
  }, [index, count, items]);

  const go = useCallback((dir: -1 | 1) => {
    setIndex((i) => (i + dir + count) % count);
  }, [count]);

  if (!count) return null;

  return (
    <section
      aria-label="Featured carousel"
      aria-roledescription="carousel"
      role="region"
  className="mx-auto max-w-7xl px-4 pt-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      }}
    >
  <div className={`relative w-full rounded-2xl overflow-hidden ${compact ? 'min-h-[150px] sm:min-h-[200px] md:min-h-[240px] lg:min-h-[260px]' : 'min-h-[160px] sm:min-h-[220px] md:min-h-[280px] lg:min-h-[300px]'} shadow-2xl`}>
  {/* Live region for slide changes (screen-reader only) */}
  <div className="sr-only" role="status" aria-live="polite">{liveMessage}</div>
  {/* SR-only hint for keyboard controls */}
  <p className="sr-only">Use the left and right arrow keys to change slides.</p>
        {/* Slides */}
        {items.map((it, i) => {
          const bg = it.backdrop || it.posterUrl || it.poster;
          const active = i === index;
          return (
            <motion.div
              key={it.id}
              className="absolute inset-0 w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: active ? 1 : 0 }}
              transition={{ duration: 0.6 }}
              aria-hidden={!active}
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${i + 1} of ${count}${it.title ? `: ${it.title}` : ''}`}
              style={{ pointerEvents: 'none' }}
            >
              {bg && (
                <img
                  src={bg}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover will-change-transform"
                  style={{ zIndex: 0, objectPosition: '50% 45%' }}
                  draggable={false}
                  onLoad={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    const w = img.naturalWidth;
                    const h = img.naturalHeight;
                    if (!w || !h) return;
                    const ratio = h / w;
                    // Heuristics: bias upwards so faces/titles stay visible; stronger bias for portraits
                    if (ratio > 1.3) {
                      img.style.objectPosition = '50% 18%';
                    } else if (ratio > 1.05) {
                      img.style.objectPosition = '50% 22%';
                    } else {
                      img.style.objectPosition = '50% 42%';
                    }
                  }}
                />
              )}
              {/* Stronger gradients to keep text legible when using cover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
            </motion.div>
          );
        })}

        {/* Overlay content (bottom-left, minimal panel, branded font) */}
        <div className="relative z-10 h-full p-4 sm:p-6 md:p-8 flex flex-col justify-end items-start text-left">
          <div className="max-w-lg w-full bg-transparent p-0 space-y-2">
            {(() => {
              // Prefer API-provided title logo when available (support multiple fields)
              const show = items[index] as any;
              const logoCandidate: string | undefined = show.titleLogo || show.logoUrl || show.logo || show.logo_path;
              if (logoCandidate) {
                const src = logoCandidate.startsWith('http') ? logoCandidate : `https://image.tmdb.org/t/p/w500${logoCandidate}`;
                return (
                  <img
                    src={src}
                    alt={`${show.title} logo`}
                    className="h-8 sm:h-10 md:h-12 w-auto object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
                    draggable={false}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                );
              }
              // Fallback to text title
              return (
                <h1 className="font-display uppercase text-xl sm:text-2xl md:text-3xl tracking-wide text-white drop-shadow-md line-clamp-2">{show.title}</h1>
              );
            })()}
            {items[index].genres?.length ? (
              <p className="text-[10px] sm:text-xs uppercase tracking-wide text-gray-200/80">{items[index].genres.slice(0,3).join(' • ')}</p>
            ) : null}
            {items[index].overview ? (
              <p className="text-xs sm:text-sm text-gray-200/95 line-clamp-2 md:line-clamp-3">{items[index].overview}</p>
            ) : null}
            <div className="flex flex-row flex-wrap items-center gap-2 pt-1">
              <Button
                size="sm"
                aria-label={`More details about ${items[index].title}`}
                onClick={() => onDetails ? onDetails(items[index]) : onWatch(items[index])}
                className="bg-white text-black hover:bg-gray-100 font-semibold px-3 py-1.5 shadow-md hover:shadow-lg transition-all duration-200 rounded-md"
              >
                <Search className="w-4 h-4 mr-1.5" aria-hidden="true" />
                More details
              </Button>
              <Button
                size="sm"
                variant="outline"
                aria-label={`Add ${items[index].title} to watchlist`}
                onClick={() => onAdd(items[index])}
                className="bg-black/30 backdrop-blur-sm border-white/30 text-white hover:bg-black/40 font-semibold px-3 py-1.5 shadow-md hover:shadow-lg transition-all duration-200 rounded-md"
              >
                <Plus className="w-4 h-4 mr-1.5" aria-hidden="true" />
                Add to List
              </Button>
            </div>
          </div>
        </div>

        {/* Arrows */}
        {count > 1 && (
          <>
            <button
              aria-label="Previous featured"
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-gray-900/60 hover:bg-gray-900/80 border border-white/10 text-white p-2 rounded-lg backdrop-blur pointer-events-auto z-20"
              onClick={() => go(-1)}
              type="button"
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </button>
            <button
              aria-label="Next featured"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-900/60 hover:bg-gray-900/80 border border-white/10 text-white p-2 rounded-lg backdrop-blur pointer-events-auto z-20"
              onClick={() => go(1)}
              type="button"
            >
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </>
        )}

        {/* Dots */}
        {count > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2" role="tablist" aria-label="Featured slides">
            {items.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === index}
                aria-label={`Go to slide ${i + 1} of ${count}`}
                onClick={() => setIndex(i)}
                className={`w-2.5 h-2.5 rounded-full ${i === index ? 'bg-white' : 'bg-white/40'} hover:bg-white/80 transition-colors`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ———————————————————————————————————————————————————————————
// Main Page Component
// ———————————————————————————————————————————————————————————
export default function DiscoverStructured() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { addToList } = useUserActions();
  const qc = useQueryClient();

  // Filter state controlled by EnhancedFilterSystem
  const [filters, setFilters] = useState<FilterState>({
    mood: null,
    genre: '',
    sort: 'popularity',
  });

  const [searchQuery, setSearchQuery] = useState('');
  // Simplified: removed hover-based dimming for clarity
  const [visibleCount, setVisibleCount] = useState(12);
  const [compact, setCompact] = useState<boolean>(() => {
    try {
      return localStorage.getItem('bb-compact') === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('bb-compact', compact ? '1' : '0');
    } catch {}
  }, [compact]);

  // Modal state
  const [activeShow, setActiveShow] = useState<Show | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Lab mode: enabled for /discover-lab or ?lab=1 to make differences obvious
  const isLab = useMemo(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return window.location.pathname === '/discover-lab' || params.get('lab') === '1';
    } catch {
      return false;
    }
  }, []);

  // Extract search query from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const search = urlParams.get('search');
    if (search) {
      setSearchQuery(search);
    }
  }, []);

  const onFilterChange = useCallback((next: FilterState) => {
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
  } = useQuery<Show>({
    queryKey: qk.hero(filters),
    queryFn: () => getHero(filters),
    staleTime: 60_000,
  });

  const {
    data: recs,
    isLoading: recsLoading,
  } = useQuery<Show[]>({
    queryKey: qk.recommendations(filters),
    queryFn: () => getRecommendations(filters),
  });

  const { data: trending, isLoading: trendingLoading } = useQuery<Show[]>({
    queryKey: qk.trending(),
    queryFn: getTrending,
    staleTime: 60_000,
  });

  const { data: comingSoon, isLoading: comingSoonLoading } = useQuery<Show[]>({
    queryKey: qk.comingSoon(),
    queryFn: getComingSoon,
  });

  const { data: moodPicks, isLoading: moodLoading } = useQuery<Show[]>({
    queryKey: qk.mood(filters.mood),
    queryFn: () => getMoodPicks(filters.mood),
    enabled: Boolean(filters.mood),
  });

  const { data: userPreferences } = useQuery({
    queryKey: qk.userPreferences(),
    queryFn: getUserPreferences,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Watchlist mutation with optimistic updates
  const addToWatchlistMutation = useMutation({
    mutationFn: ({ showId, mediaType }: { showId: string | number; mediaType: string }) => 
      addToWatchlist(showId, mediaType),
    onMutate: async ({ showId }) => {
      await qc.cancelQueries({ queryKey: ['watchlist'] });
      const previousWatchlist = qc.getQueryData(['watchlist']);
      // Optimistically update watchlist
      qc.setQueryData(['watchlist'], (old: any) => 
        old ? [...old, { id: showId }] : [{ id: showId }]
      );
      return { previousWatchlist };
    },
    onError: (err, variables, context) => {
      qc.setQueryData(['watchlist'], context?.previousWatchlist);
      toast({
        title: "Error",
        description: "Failed to add to watchlist. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Added to Watchlist",
        description: "Successfully added to your watchlist.",
        duration: 3000,
      });
    }
  });

  // Actions (hybrid: quick add on card; full actions live in modal)
  const handleQuickAdd = useCallback(async (show: Show) => {
    try {
      if (!user) {
        toast({ 
          title: 'Sign in required', 
          description: 'Please sign in to add to your list.' 
        });
        return;
      }
      addToWatchlistMutation.mutate({ 
        showId: show.id, 
        mediaType: show.mediaType || 'movie' 
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not add to list';
      toast({ 
        title: 'Error', 
        description: message, 
        variant: 'destructive' 
      });
    }
  }, [toast, user, addToWatchlistMutation]);

  // Filter recommendations
  const filteredForYou = useMemo((): Show[] => {
    if (!recs) return [];
    
    let filtered: Show[] = recs;
    
    // Apply search filtering
    if (searchQuery) {
      filtered = filtered.filter(show =>
        show.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        show.genres?.some(genre => 
          genre.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Apply genre filter (from chip row)
    if (filters.genre) {
      const target = filters.genre.toLowerCase();
      filtered = filtered.filter(show => show.genres?.some(g => g.toLowerCase() === target));
    }

    // Apply platform filter (Netflix chip)
    if (filters.platforms && filters.platforms.length) {
      const wanted = new Set(filters.platforms.map(p => p.toLowerCase()));
      filtered = filtered.filter(show => {
        const cardPlatform = show.platform?.toLowerCase();
        const spMatch = show.streamingPlatforms?.some(sp => sp.provider_name && wanted.has(sp.provider_name.toLowerCase()));
        return (cardPlatform && wanted.has(cardPlatform)) || spMatch || false;
      });
    }
    
    return filtered.slice(0, visibleCount);
  }, [recs, searchQuery, visibleCount, filters]);

  // Derive allowed genres/platforms from current recommendations for adaptive filters
  const allowedGenres = useMemo(() => {
    const set = new Set<string>();
    (recs || []).forEach(r => r.genres?.forEach(g => set.add(g)));
    return Array.from(set).slice(0, 10);
  }, [recs]);

  const allowedPlatforms = useMemo(() => {
    const set = new Set<string>();
    const addFrom = (arr?: Show[]) => arr?.forEach(r => {
      if (r.platform) set.add(r.platform);
      r.streamingPlatforms?.forEach(sp => sp.provider_name && set.add(sp.provider_name));
    });
    addFrom(recs);
    addFrom(trending);
    return Array.from(set).filter(Boolean).slice(0, 10);
  }, [recs, trending]);

  // Hero styles
  const heroStyles = useMemo(() => {
    const url = hero?.backdrop || hero?.posterUrl || hero?.poster;
    return url
      ? {
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,.35), rgba(0,0,0,.75)), url(${url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } as React.CSSProperties
      : {};
  }, [hero]);

  // Scroll to first section handler
  const scrollToContent = useCallback(() => {
    const element = document.getElementById('recommendations-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const openModal = useCallback((show: Show) => {
    setActiveShow(show);
    setModalOpen(true);
  }, []);
  
  const closeModal = useCallback(() => {
    setModalOpen(false);
    setActiveShow(null);
  }, []);

  const loadMore = useCallback(() => {
    setVisibleCount(prev => prev + 20);
  }, []);

  if (heroLoading && recsLoading && trendingLoading) {
    return (
      <AppLayout>
        <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          {/* Hero Skeleton */}
          <div className="relative h-[80vh] min-h-[600px]">
            <Skeleton className="absolute inset-0 w-full h-full" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
            <div className="relative z-10 h-full flex items-center">
              <div className="container mx-auto px-6 lg:px-16">
                <div className="max-w-2xl space-y-6">
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-16 w-full" />
                  <div className="flex gap-3">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                  <div className="flex gap-4">
                    <Skeleton className="h-12 w-32" />
                    <Skeleton className="h-12 w-32" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Content Skeletons */}
          <div className="px-4 md:px-8 lg:px-16 max-w-[1440px] mx-auto pt-8">
            <div className="text-center mb-12 space-y-4">
              <Skeleton className="h-12 w-96 mx-auto" />
              <Skeleton className="h-6 w-64 mx-auto" />
            </div>
            
            <div className="bg-gray-800/40 rounded-2xl p-6 mb-8">
              <Skeleton className="h-16 w-full" />
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {Array.from({ length: 18 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <ContentCardSkeleton />
                </motion.div>
              ))}
            </div>
          </div>
        </main>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
  <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" aria-label="Discover page">
        {/* Featured Carousel with embedded search */}
        <FeaturedCarousel
          items={(trending && trending.length ? trending : (recs || [])).slice(0, 5)}
          onWatch={(show) => openModal(show)}
          onAdd={(show) => handleQuickAdd(show)}
          onDetails={(show) => openModal(show)}
          compact={compact}
        />

  <div className="mx-auto max-w-7xl px-4 py-10 space-y-16">

          {/* Guided Discovery – Mood → Genre → Platform */}
          <section aria-label="Quick filters" className="bg-gray-800/30 border border-white/10 rounded-xl p-3">
            <div className="flex flex-wrap items-center gap-2">
              {["Cerebral","Feel-good","Edge-of-seat"].map(m => {
                const active = filters.mood === m;
                return (
                  <button
                    key={m}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs ${active ? 'bg-teal-500 text-white border-teal-400' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'}`}
                    onClick={() => onFilterChange({ ...filters, mood: active ? null : m })}
                    aria-pressed={active}
                    aria-label={`Mood ${m}${active ? ' selected' : ''}`}
                  >{m}</button>
                );
              })}
              <span className="mx-1 h-4 w-px bg-white/10" aria-hidden="true" />
              {(filters.mood ? (filters.mood === 'Cerebral' ? ['Documentary','Drama','Thriller','Mystery'] : filters.mood === 'Feel-good' ? ['Comedy','Romance','Family','Animation'] : ['Action','Thriller','Horror','Crime','Adventure']) : allowedGenres).slice(0,8).map(g => {
                const pressed = filters.genre?.toLowerCase() === g.toLowerCase();
                return (
                  <button
                    key={g}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs ${pressed ? 'bg-teal-500 text-white border-teal-400' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'}`}
                    onClick={() => onFilterChange({ ...filters, genre: pressed ? '' : g })}
                    aria-pressed={pressed}
                    aria-label={`Genre ${g}${pressed ? ' selected' : ''}`}
                  >{g}</button>
                );
              })}
              <span className="mx-1 h-4 w-px bg-white/10" aria-hidden="true" />
              {allowedPlatforms.slice(0,8).map(p => {
                const pressed = Boolean(filters.platforms?.includes(p));
                return (
                  <button
                    key={p}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs ${pressed ? 'bg-teal-500 text-white border-teal-400' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'}`}
                    onClick={() => {
                      const has = filters.platforms?.includes(p);
                      const next = has ? (filters.platforms || []).filter(x => x !== p) : [ ...(filters.platforms || []), p ];
                      onFilterChange({ ...filters, platforms: next });
                    }}
                    aria-pressed={pressed}
                    aria-label={`Platform ${p}${pressed ? ' selected' : ''}`}
                  >{p}</button>
                );
              })}
              <span className="mx-1 h-4 w-px bg-white/10" aria-hidden="true" />
              <div className="text-xs text-gray-300/90" role="status" aria-live="polite">Showing <span className="text-white font-medium">{filteredForYou.length}</span> picks</div>
              <button
                className={`ml-auto px-2.5 py-1.5 rounded-lg border text-xs ${compact ? 'bg-teal-500 text-white border-teal-400' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'}`}
                onClick={() => setCompact(c => !c)}
                aria-pressed={compact}
                aria-label={`Toggle compact mode ${compact ? 'on' : 'off'}`}
              >
                Compact mode
              </button>
              
            </div>
          </section>
          
          {/* Recommendations */}
          <section id="recommendations-section" aria-label="Recommendations">
            <SectionHeader title="Recommended for you" subtitle={filters.mood || filters.genre || (filters.platforms && filters.platforms.length) ? `Because you chose ${[
              filters.mood ? `“${filters.mood}”` : null,
              filters.genre ? `“${filters.genre}”` : null,
              filters.platforms?.length ? `“${filters.platforms.join(', ')}”` : null,
            ].filter(Boolean).join(' and ')}.` : 'Personalized picks based on your taste.'} />
            {recsLoading ? (
              <Grid ariaLabel="Loading recommendations" compact={compact}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={`rec-skel-${i}`} className="space-y-3">
                    <ContentCardSkeleton />
                  </div>
                ))}
              </Grid>
            ) : (
  <>
  <Grid ariaLabel="Recommendations grid" compact={compact}>
        {(filteredForYou && filteredForYou.length ? filteredForYou : (recs || [])).slice(0, 12).map((show) => (
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
                    {(filters.mood || filters.genre || (filters.platforms && filters.platforms.length)) && (
                      <p className="mt-2 text-xs text-gray-400">Because you chose {[
                        filters.mood ? `“${filters.mood}”` : null,
                        filters.genre ? `“${filters.genre}”` : null,
                        filters.platforms?.length ? `“${filters.platforms.join(', ')}”` : null,
                      ].filter(Boolean).join(' and ')}.</p>
                    )}
                  </motion.div>
                ))}
              </Grid>
        {((filteredForYou && filteredForYou.length) || (recs && recs.length)) && ((filteredForYou || recs || []).length > 12) && (
                <div className="text-center py-6">
                  <Button 
                    variant="ghost"
                    className="text-gray-300 hover:text-white"
                    onClick={() => {
                      const el = document.getElementById('recommendations-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setVisibleCount(v => Math.max(v, 36));
                    }}
                  >
                    View all
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
  </>
            )}
            
            {/* Load More */}
            {filteredForYou.length >= visibleCount && (
              <div className="text-center py-8">
                <Button 
                  onClick={loadMore}
                  variant="outline"
                  className="bg-gray-800/60 backdrop-blur-sm border-gray-600 text-gray-300 hover:bg-gray-700/80 hover:text-white px-8 py-3"
                >
                  Load More Recommendations
                </Button>
              </div>
            )}
          </section>

          <div className="border-t border-white/10" />
          {/* Trending Now (grid) */}
          <section aria-label="Trending">
            <SectionHeader
              title="Trending now"
              subtitle="What everyone’s watching this week."
              onSeeAll={() => {
                console.log('Navigate to trending page');
              }}
            />
            {trendingLoading ? (
              <Grid ariaLabel="Loading trending" compact={compact}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={`trend-skel-${i}`} className="space-y-3">
                    <ContentCardSkeleton />
                  </div>
                ))}
              </Grid>
            ) : (
              <HorizontalCarousel
                items={(trending || []).slice(0, 20)}
                title=""
                ariaLabel="Trending now"
                onAddToWatchlist={handleQuickAdd}
                onWatchNow={(show) => openModal(show)}
                cardWidth={compact ? 160 : 180}
              />
            )}
          </section>

          <div className="border-t border-white/10" />
          {/* Coming Soon */}
          <section aria-label="Coming soon" id="coming-soon-section">
            <SectionHeader title="Just released & coming soon" subtitle="Fresh arrivals and what's about to drop." />
            {comingSoonLoading ? (
              <Grid ariaLabel="Loading coming soon" compact={compact}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={`soon-skel-${i}`} className="space-y-3">
                    <ContentCardSkeleton />
                  </div>
                ))}
              </Grid>
            ) : (
              <HorizontalCarousel
                items={(comingSoon ?? []).slice().sort((a, b) => (a.releaseDate ?? '').localeCompare(b.releaseDate ?? ''))}
                title=""
                ariaLabel="Just released & coming soon"
                onAddToWatchlist={handleQuickAdd}
                onWatchNow={(show) => openModal(show)}
                cardWidth={compact ? 160 : 180}
              />
            )}
          </section>

          {/* Mood Picks */}
          {filters.mood && (
            <section aria-label="Mood picks">
              <SectionHeader title={`Perfect for ${filters.mood} moments`} subtitle={`Unwind with these ${filters.mood?.toLowerCase()} picks handpicked for you.`} />
              {moodLoading ? (
                <Grid ariaLabel="Loading mood picks" compact={compact}>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={`mood-skel-${i}`} className="space-y-3">
                      <ContentCardSkeleton />
                    </div>
                  ))}
                </Grid>
              ) : (
                <Grid ariaLabel="Mood picks grid" compact={compact}>
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

          {/* Curated blocks */}
          <div className="border-t border-white/10" />
          <section aria-label="Staff Picks">
            <SectionHeader title="Staff picks" subtitle="Handpicked by our team — quality over quantity." />
            <HorizontalCarousel
              items={(recs || []).slice(0, 14)}
              title=""
              ariaLabel="Staff picks"
              onAddToWatchlist={handleQuickAdd}
              onWatchNow={openModal}
              cardWidth={compact ? 160 : 180}
            />
          </section>

          <section aria-label="Hidden Gems">
            <SectionHeader title="Hidden gems" subtitle="Critically loved titles you might have missed." />
            <HorizontalCarousel
              items={(recs || []).filter(s => (s.rating ?? 0) >= 7).slice(0, 14)}
              title=""
              ariaLabel="Hidden gems"
              onAddToWatchlist={handleQuickAdd}
              onWatchNow={openModal}
              cardWidth={compact ? 160 : 180}
            />
          </section>

        </div>

  {/* Modal for detailed show actions */}
        {activeShow && (
          <BrandedShowModal
            showId={String(activeShow.id)}
            showType={activeShow.mediaType || 'movie'}
            open={modalOpen}
            onClose={closeModal}
            // Provide a short reason for recommendation based on active filters
            reason={[
              filters.mood ? `You're in a ${filters.mood} mood` : null,
              filters.genre ? `You like ${filters.genre}` : null,
              filters.platforms?.length ? `Available on ${filters.platforms.join(', ')}` : null,
            ].filter(Boolean).join(' • ') || undefined}
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
      </main>
    </AppLayout>
  );
}
