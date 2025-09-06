import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TopNav } from "@/components/top-nav";
import EnhancedFilterSystem from "@/components/common/EnhancedFilterSystem";
import { Button } from "@/components/ui/button";
import BrandedShowModal from "@/components/search/BrandedShowModal";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Play, Plus, ExternalLink, Star, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Types
interface Show {
  id: string | number;
  title: string;
  posterUrl?: string;
  poster?: string;
  streamingPlatform?: string;
  platform?: string;
  releaseDate?: string;
  mediaType?: string;
  backdrop?: string;
  genres?: string[];
  rating?: number;
}

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

// Fetch discover data
async function fetchDiscoverData(): Promise<DiscoverData> {
  const res = await fetch('/api/discover');
  if (!res.ok) throw new Error('Failed to load discover data');
  return res.json();
}

// API Functions
async function addToWatchlist(showId: string | number, mediaType: string = 'movie') {
  const res = await fetch('/api/watchlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ showId, type: mediaType })
  });
  if (!res.ok) throw new Error('Failed to add to watchlist');
  return res.json();
}

async function getWatchLinks(showId: string | number) {
  const res = await fetch(`/api/streaming/watch-links/${showId}`, {
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to get watch links');
  return res.json();
}

async function getUserPreferences() {
  const res = await fetch('/api/user/preferences', {
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to get user preferences');
  return res.json();
}

// Helper to normalize show data
function normalizeShow(show: any): Show {
  return {
    id: show.id,
    title: show.title,
    posterUrl: show.poster || show.posterUrl,
    streamingPlatform: show.platform || show.streamingPlatform || "—",
    releaseDate: show.releaseDate,
    mediaType: show.mediaType,
    backdrop: show.backdrop,
    genres: show.genres || [],
    rating: show.rating
  };
}

// Content Card Component with API integration and accessibility
function ContentCard({ 
  show, 
  onClick, 
  onAddToWatchlist, 
  onWatchNow,
  prefetchOnHover = false 
}: { 
  show: Show; 
  onClick: (show: Show) => void;
  onAddToWatchlist?: (show: Show) => void;
  onWatchNow?: (show: Show) => void;
  prefetchOnHover?: boolean;
}) {
  const normalizedShow = normalizeShow(show);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddingToList, setIsAddingToList] = useState(false);
  const [isGettingWatchLink, setIsGettingWatchLink] = useState(false);

  const prefetchShowDetails = useCallback(() => {
    if (prefetchOnHover) {
      queryClient.prefetchQuery({
        queryKey: ['show-details', normalizedShow.id],
        queryFn: () => fetch(`/api/shows/${normalizedShow.id}`).then(r => r.json()),
        staleTime: 5 * 60 * 1000, // 5 minutes
      });
    }
  }, [normalizedShow.id, prefetchOnHover, queryClient]);

  const handleAddToList = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAddingToList(true);
    
    try {
      await addToWatchlist(normalizedShow.id, normalizedShow.mediaType);
      toast({
        title: "Added to Watchlist",
        description: `${normalizedShow.title} has been added to your watchlist.`,
        duration: 3000,
      });
      onAddToWatchlist?.(normalizedShow);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add to watchlist. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsAddingToList(false);
    }
  };

  const handleWatchNow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsGettingWatchLink(true);
    
    try {
      const links = await getWatchLinks(normalizedShow.id);
      if (links && links.length > 0) {
        window.open(links[0].url, '_blank', 'noopener,noreferrer');
        onWatchNow?.(normalizedShow);
      } else {
        toast({
          title: "Not Available",
          description: "This content is not currently available for streaming.",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get watch links. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsGettingWatchLink(false);
    }
  };

  const handleTrailer = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Open show modal which has trailer functionality
    onClick(normalizedShow);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick(normalizedShow);
    }
  };
  
  return (
    <div
      className="bg-card rounded-md shadow hover:shadow-lg cursor-pointer flex flex-col transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      onClick={() => onClick(normalizedShow)}
      onMouseEnter={prefetchShowDetails}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`View details for ${normalizedShow.title}`}
    >
      <div className="relative overflow-hidden rounded-t-md">
        {normalizedShow.posterUrl ? (
          <img
            src={normalizedShow.posterUrl}
            alt={`${normalizedShow.title} Poster`}
            className="w-full h-64 object-cover aspect-[2/3]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-64 bg-gray-800 flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
        {normalizedShow.rating && (
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            {normalizedShow.rating.toFixed(1)}
          </div>
        )}
      </div>
      
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="font-semibold text-base truncate mb-1">{normalizedShow.title}</h3>
        <p className="text-sm text-muted-foreground truncate mb-1">
          {normalizedShow.streamingPlatform}
        </p>
        {normalizedShow.genres && normalizedShow.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {normalizedShow.genres.slice(0, 2).map((genre) => (
              <Badge key={genre} variant="secondary" className="text-xs">
                {genre}
              </Badge>
            ))}
          </div>
        )}
        {normalizedShow.releaseDate && (
          <p className="text-xs text-accent mb-2">
            Releases: {new Date(normalizedShow.releaseDate).toLocaleDateString()}
          </p>
        )}
        
        <div className="mt-auto flex gap-1 pt-2" role="group" aria-label="Show actions">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={handleWatchNow}
            disabled={isGettingWatchLink}
            aria-label={`Watch ${normalizedShow.title} now`}
          >
            {isGettingWatchLink ? (
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <Play className="w-3 h-3 mr-1" />
            )}
            Watch
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="flex-1"
            onClick={handleAddToList}
            disabled={isAddingToList}
            aria-label={`Add ${normalizedShow.title} to watchlist`}
          >
            {isAddingToList ? (
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <Plus className="w-3 h-3 mr-1" />
            )}
            List
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleTrailer}
            aria-label={`View ${normalizedShow.title} trailer`}
          >
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Loading Skeleton Components
function ContentCardSkeleton() {
  return (
    <div className="bg-card rounded-md shadow">
      <Skeleton className="w-full h-64 rounded-t-md" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-1 pt-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}

function GridSkeleton({ count = 15 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ContentCardSkeleton key={i} />
      ))}
    </div>
  );
}
function HeroSection({ hero, onAddToWatchlist, onWatchNow }: { 
  hero: Show | null;
  onAddToWatchlist?: (show: Show) => void;
  onWatchNow?: (show: Show) => void;
}) {
  const { toast } = useToast();
  const [isAddingToList, setIsAddingToList] = useState(false);
  const [isGettingWatchLink, setIsGettingWatchLink] = useState(false);

  if (!hero) return null;

  const handleAddToList = async () => {
    setIsAddingToList(true);
    try {
      await addToWatchlist(hero.id, hero.mediaType);
      toast({
        title: "Added to Watchlist",
        description: `${hero.title} has been added to your watchlist.`,
        duration: 3000,
      });
      onAddToWatchlist?.(hero);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add to watchlist. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsAddingToList(false);
    }
  };

  const handleWatchNow = async () => {
    setIsGettingWatchLink(true);
    try {
      const links = await getWatchLinks(hero.id);
      if (links && links.length > 0) {
        window.open(links[0].url, '_blank', 'noopener,noreferrer');
        onWatchNow?.(hero);
      } else {
        toast({
          title: "Not Available",
          description: "This content is not currently available for streaming.",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get watch links. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsGettingWatchLink(false);
    }
  };
  
  return (
    <section className="relative h-[60vh] min-h-[400px] overflow-hidden rounded-lg mb-8">
      {hero.backdrop && (
        <img 
          src={hero.backdrop} 
          alt={hero.title}
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/20" />
      <div className="relative z-10 h-full flex items-center px-8">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            {hero.title}
          </h1>
          {hero.genres && hero.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {hero.genres.map((genre) => (
                <Badge key={genre} variant="secondary">
                  {genre}
                </Badge>
              ))}
            </div>
          )}
          <div className="flex gap-4">
            <Button 
              size="lg" 
              className="bg-white text-black hover:bg-gray-200"
              onClick={handleWatchNow}
              disabled={isGettingWatchLink}
            >
              {isGettingWatchLink ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Play className="w-5 h-5 mr-2" />
              )}
              Play Now
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-white border-white hover:bg-white hover:text-black"
              onClick={handleAddToList}
              disabled={isAddingToList}
            >
              {isAddingToList ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Plus className="w-5 h-5 mr-2" />
              )}
              My List
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

// Enhanced Mood Pills Component with better accessibility
function MoodPills({ moods, selectedMood, onMoodSelect }: { 
  moods: string[]; 
  selectedMood: string | null;
  onMoodSelect: (mood: string) => void;
}) {
  
  return (
    <div 
      className="flex flex-wrap gap-2 mb-6" 
      role="group" 
      aria-label="Filter content by mood"
    >
      {moods.map((mood, index) => (
        <Button
          key={mood}
          variant={selectedMood === mood ? "default" : "outline"}
          size="sm"
          onClick={() => {
            const newMood = selectedMood === mood ? null : mood;
            onMoodSelect(newMood || '');
          }}
          className="rounded-full"
          aria-pressed={selectedMood === mood}
          aria-label={`Filter by ${mood} mood${selectedMood === mood ? ', currently selected' : ''}`}
        >
          {mood}
        </Button>
      ))}
    </div>
  );
}

// Enhanced Horizontal Carousel with keyboard navigation and accessibility
function HorizontalCarousel({ 
  items, 
  title, 
  onAddToWatchlist, 
  onWatchNow 
}: { 
  items: Show[]; 
  title: string;
  onAddToWatchlist?: (show: Show) => void;
  onWatchNow?: (show: Show) => void;
}) {
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const openModal = (show: Show) => {
    setSelectedShow(show);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedShow(null);
  };

  const scrollLeft = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  }, []);

  const scrollRight = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollLeft();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollRight();
    }
  }, [scrollLeft, scrollRight]);

  if (!items.length) return null;

  return (
    <section className="mb-8" aria-labelledby={`${title.replace(/\s+/g, '-').toLowerCase()}-heading`}>
      <div className="flex justify-between items-center mb-4">
        <h2 
          id={`${title.replace(/\s+/g, '-').toLowerCase()}-heading`}
          className="text-2xl font-semibold"
        >
          {title}
        </h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={scrollLeft}
            aria-label={`Scroll ${title} left`}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={scrollRight}
            aria-label={`Scroll ${title} right`}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div 
        ref={containerRef}
        className="flex space-x-4 overflow-x-auto pb-4 focus:outline-none focus:ring-2 focus:ring-primary rounded"
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="list"
        aria-label={`${title} carousel`}
      >
        {items.map((item) => (
          <div 
            key={item.id} 
            className="min-w-[200px] max-w-[200px]"
            role="listitem"
          >
            <ContentCard 
              show={item} 
              onClick={openModal}
              onAddToWatchlist={onAddToWatchlist}
              onWatchNow={onWatchNow}
              prefetchOnHover={true}
            />
          </div>
        ))}
      </div>
      
      {selectedShow && (
        <BrandedShowModal
          showId={String(selectedShow.id)}
          showType={selectedShow.mediaType || 'movie'}
          open={modalOpen}
          onClose={closeModal}
        />
      )}
    </section>
  );
}

export default function DiscoverStructured() {
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(20);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Extract search query from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const search = urlParams.get('search');
    if (search) {
      setSearchQuery(search);
    }
  }, []);

  // Fetch discover data
  const { data: discoverData, isLoading, error } = useQuery({
    queryKey: ['discover'],
    queryFn: fetchDiscoverData,
  });

  // Fetch user preferences for personalization
  const { data: userPreferences } = useQuery({
    queryKey: ['user-preferences'],
    queryFn: getUserPreferences,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Watchlist mutation with optimistic updates
  const addToWatchlistMutation = useMutation({
    mutationFn: ({ showId, mediaType }: { showId: string | number; mediaType: string }) => 
      addToWatchlist(showId, mediaType),
    onMutate: async ({ showId }) => {
      await queryClient.cancelQueries({ queryKey: ['watchlist'] });
      const previousWatchlist = queryClient.getQueryData(['watchlist']);
      // Optimistically update watchlist
      queryClient.setQueryData(['watchlist'], (old: any) => 
        old ? [...old, { id: showId }] : [{ id: showId }]
      );
      return { previousWatchlist };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['watchlist'], context?.previousWatchlist);
      toast({
        title: "Error",
        description: "Failed to add to watchlist. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: (data, { showId }) => {
      toast({
        title: "Added to Watchlist",
        description: "Successfully added to your watchlist.",
        duration: 3000,
      });
    }
  });

  // Enhanced mood filtering with genre mapping
  const filteredForYou = useMemo(() => {
    if (!discoverData?.forYou) return [];
    
    let filtered = discoverData.forYou;
    
    // Apply mood filtering
    if (selectedMood) {
      const moodToGenres: Record<string, string[]> = {
        'Cerebral': ['documentary', 'drama', 'thriller', 'mystery', 'biography'],
        'Feel-good': ['comedy', 'romance', 'family', 'musical', 'animation'],
        'Edge-of-seat': ['action', 'thriller', 'horror', 'crime', 'war', 'adventure']
      };
      
      const targetGenres = moodToGenres[selectedMood] || [];
      filtered = filtered.filter(show => 
        show.genres?.some(genre => 
          targetGenres.some(target => 
            genre.toLowerCase().includes(target.toLowerCase())
          )
        )
      );
    }
    
    // Apply search filtering
    if (searchQuery) {
      filtered = filtered.filter(show =>
        show.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        show.genres?.some(genre => 
          genre.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
    
    // Apply personalization if user preferences available
    if (userPreferences?.favoriteGenres) {
      filtered = filtered.sort((a, b) => {
        const aScore = calculatePersonalizationScore(a, userPreferences);
        const bScore = calculatePersonalizationScore(b, userPreferences);
        return bScore - aScore;
      });
    }
    
    return filtered.slice(0, visibleCount);
  }, [discoverData?.forYou, selectedMood, searchQuery, userPreferences, visibleCount]);

  // Personalization scoring function
  const calculatePersonalizationScore = (show: Show, preferences: any): number => {
    let score = 0;
    
    // Genre preferences (40% weight)
    if (show.genres && preferences.favoriteGenres) {
      const genreMatch = show.genres.filter(g => 
        preferences.favoriteGenres.some((fg: string) => 
          fg.toLowerCase() === g.toLowerCase()
        )
      ).length;
      score += (genreMatch / show.genres.length) * 0.4;
    }
    
    // Platform availability (20% weight)
    if (preferences.streamingServices?.includes(show.streamingPlatform)) {
      score += 0.2;
    }
    
    // Rating factor (20% weight)
    if (show.rating) {
      score += (show.rating / 10) * 0.2;
    }
    
    // Random factor for variety (20% weight)
    score += Math.random() * 0.2;
    
    return score;
  };

  // Infinite scroll handler
  const loadMore = useCallback(() => {
    setVisibleCount(prev => prev + 20);
  }, []);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && filteredForYou.length >= visibleCount) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );
    
    const sentinel = document.getElementById('load-more-sentinel');
    if (sentinel) observer.observe(sentinel);
    
    return () => observer.disconnect();
  }, [loadMore, filteredForYou.length, visibleCount]);

  const openModal = (show: Show) => {
    setSelectedShow(show);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedShow(null);
  };

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
    setVisibleCount(20); // Reset visible count when filtering
  };

  const handleAddToWatchlist = (show: Show) => {
    addToWatchlistMutation.mutate({ 
      showId: show.id, 
      mediaType: show.mediaType || 'movie' 
    });
  };

  const handleWatchNow = (show: Show) => {
    // Track analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'watch_now_click', {
        content_id: show.id,
        content_type: show.mediaType,
        title: show.title
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <main className="px-4 md:px-8 lg:px-16 max-w-[1440px] mx-auto">
          <section className="my-6">
            <Skeleton className="h-16 w-full rounded-lg" />
          </section>
          <section className="mb-8">
            <Skeleton className="h-96 w-full rounded-lg mb-8" />
          </section>
          <section className="mb-8">
            <Skeleton className="h-8 w-48 mb-4" />
            <GridSkeleton count={15} />
          </section>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-red-500 mb-4">Failed to load recommendations</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      <main className="px-4 md:px-8 lg:px-16 max-w-[1440px] mx-auto" style={{ paddingTop: '80px' }}>
        {/* Sticky Filter System */}
        <section className="my-6 sticky top-[80px] z-20 bg-background">
          <EnhancedFilterSystem 
            persistKey="discover-filters"
            showAdvanced={false}
            defaultExpanded={false}
            compactMode={true}
            onFiltersChange={(filters) => {
              // Additional filter handling could go here
              console.log('Filters changed:', filters);
            }}
          />
        </section>

        {/* Hero Section */}
        {discoverData?.hero && (
          <HeroSection 
            hero={discoverData.hero} 
            onAddToWatchlist={handleAddToWatchlist}
            onWatchNow={handleWatchNow}
          />
        )}

        {/* Mood Pills */}
        {discoverData?.moodBuckets && discoverData.moodBuckets.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Choose Your Mood</h2>
            <MoodPills 
              moods={discoverData.moodBuckets} 
              selectedMood={selectedMood}
              onMoodSelect={handleMoodSelect} 
            />
          </section>
        )}

        {/* Search Results Header */}
        {searchQuery && (
          <section className="mb-6">
            <div className="flex items-center gap-2 p-4 bg-secondary/50 rounded-lg">
              <span className="text-sm">
                Showing results for: <strong>"{searchQuery}"</strong>
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setSearchQuery('');
                  const url = new URL(window.location.href);
                  url.searchParams.delete('search');
                  window.history.replaceState({}, '', url.toString());
                }}
              >
                Clear
              </Button>
            </div>
          </section>
        )}

        {/* Recommendations Grid */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            {searchQuery 
              ? `Search Results (${filteredForYou.length})` 
              : selectedMood 
                ? `${selectedMood} Picks for You` 
                : 'Recommended for You'
            }
          </h2>
          
          {filteredForYou.length > 0 ? (
            <>
              <div 
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                role="list"
                aria-label="Recommended shows and movies"
              >
                {filteredForYou.map((show) => (
                  <div key={show.id} role="listitem">
                    <ContentCard
                      show={show}
                      onClick={openModal}
                      onAddToWatchlist={handleAddToWatchlist}
                      onWatchNow={handleWatchNow}
                      prefetchOnHover={true}
                    />
                  </div>
                ))}
              </div>
              
              {/* Infinite scroll sentinel */}
              {filteredForYou.length >= visibleCount && (
                <div 
                  id="load-more-sentinel" 
                  className="h-10 flex items-center justify-center mt-8"
                >
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              )}
            </>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                {searchQuery 
                  ? `No results found for "${searchQuery}". Try a different search term.`
                  : selectedMood 
                    ? `No ${selectedMood.toLowerCase()} content available. Try a different mood.`
                    : 'No recommendations available at the moment.'
                }
              </p>
            </Card>
          )}
        </section>

        {/* Trending This Week Carousel */}
        {discoverData?.trendingThisWeek && !searchQuery && (
          <HorizontalCarousel 
            items={discoverData.trendingThisWeek} 
            title="Trending This Week"
            onAddToWatchlist={handleAddToWatchlist}
            onWatchNow={handleWatchNow}
          />
        )}

        {/* AI Dynamic Blocks - Responsive Grid */}
        {discoverData?.dynamicBlocks && discoverData.dynamicBlocks.length > 0 && !searchQuery && (
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">AI Recommendations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {discoverData.dynamicBlocks.map((block) => (
                <Card key={block.id} className="p-6 hover:shadow-lg transition-shadow">
                  <h4 className="text-lg font-semibold mb-2">{block.title}</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    {block.type === 'quiz' 
                      ? 'Quick interactive quiz to refine your picks.'
                      : 'AI curated content tailored for your tastes.'
                    }
                  </p>
                  <Button className="w-full">
                    {block.type === 'quiz' ? 'Start Quiz' : 'Explore'}
                  </Button>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Responsive layout for remaining sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* New Seasons Spotlight */}
          <section className="lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-4">New Seasons & Releases</h2>
            <Card className="p-8 text-center h-64 flex items-center justify-center">
              <div>
                <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
                <p className="text-muted-foreground">
                  Latest episodes and new season premieres
                </p>
              </div>
            </Card>
          </section>

          {/* Social Buzz - Responsive positioning */}
          {discoverData?.socialBuzz && discoverData.socialBuzz.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">What's Trending</h2>
              <Card className="h-64 overflow-hidden">
                <CardContent className="p-4 h-full overflow-y-auto">
                  <ul className="space-y-3" role="list">
                    {discoverData.socialBuzz.map((buzz) => (
                      <li 
                        key={buzz.id} 
                        className="flex items-center justify-between py-2 border-b border-border last:border-0"
                        role="listitem"
                      >
                        <span className="font-medium">#{buzz.topic}</span>
                        <Badge variant="secondary">
                          {buzz.mentions.toLocaleString()} mentions
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </section>
          )}
        </div>

        {/* Streaming Networks & Countries */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Browse by Streaming Network & Country</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['Netflix', 'Hulu', 'Prime Video', 'Disney+'].map((platform) => (
              <Card key={platform} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="text-center">
                  <h3 className="font-semibold mb-2">{platform}</h3>
                  <p className="text-sm text-muted-foreground">
                    Browse {platform} content
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Onboarding Preferences Reminder */}
        <section className="mb-8 p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Personalize Your Experience</h3>
            <p className="text-muted-foreground mb-4">
              Customize your preferences anytime to get even better recommendations!
            </p>
            <Button variant="outline" className="mr-2">
              Update Preferences
            </Button>
            <Button variant="ghost">
              Learn More
            </Button>
          </div>
        </section>
      </main>

      {/* Show Details Modal */}
      {selectedShow && (
        <BrandedShowModal
          showId={String(selectedShow.id)}
          showType={selectedShow.mediaType || 'movie'}
          open={modalOpen}
          onClose={closeModal}
          onAddToWatchlist={(showId) => {
            const show = discoverData?.forYou.find(s => String(s.id) === String(showId));
            if (show) handleAddToWatchlist(show);
          }}
          onWatchNow={(show) => handleWatchNow(show)}
        />
      )}
    </div>
  );
}
