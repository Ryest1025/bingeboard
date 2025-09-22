import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FilterValues } from '@/components/common/FilterBadges';
import { fetchFilteredContent, hasActiveFilters } from '@/utils/filterUtils';
import { fetchTMDBPlatformLogo, preloadPlatformLogos } from '@/lib/tmdb';
import { useWatchlist, WatchlistItem } from '@/hooks/useWatchlist';

export interface ContentItem {
  id: string;
  title: string;
  platform: string;
  genres: string[];
  releaseYear: number;
  rating: number;
  type: 'movie' | 'tv' | 'documentary' | 'anime';
  overview?: string;
  runtime?: number;
  isAwardWinning?: boolean;
  isUpcoming?: boolean;
  releaseDate?: string;
  posterUrl?: string;
  backdropUrl?: string;
  tmdbId?: number;
  voteCount?: number;
  popularity?: number;
  originalLanguage?: string;
  adult?: boolean;
  awards?: Array<{
    name: string;
    category: string;
    year: number;
    won: boolean;
    nominated: boolean;
  }>;
}

export interface FilterOptions {
  platform?: string[];
  genres?: string[];
  releaseYear?: number[];
  rating?: [number, number]; // Range filter
  type?: ('movie' | 'tv' | 'documentary' | 'anime')[];
  awardWinning?: boolean;
  upcoming?: boolean;
  language?: string[];
  minVoteCount?: number;
  sortBy?: 'title' | 'rating' | 'releaseYear' | 'popularity' | 'dateAdded';
  sortOrder?: 'asc' | 'desc';
  searchQuery?: string;
  inWatchlist?: boolean;
  adult?: boolean;
}

interface UseFilteredContentOptions {
  endpoint: string;
  queryKey: string;
  additionalParams?: Record<string, string>;
  enabled?: boolean;
  staleTime?: number;
  refetchOnWindowFocus?: boolean;
}

const FALLBACK_LOGO = '/logos/default.png';

/**
 * Universal hook for filtered content with TMDB integration, dynamic logos, awards, and watchlist support
 */
export function useFilteredContent(items: ContentItem[], filters: FilterOptions = {}) {
  const [logos, setLogos] = useState<Record<string, string>>({});
  const [logoLoading, setLogoLoading] = useState(false);
  const { watchlist, toggleWatchlist, addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();

  // Apply all filters
  const filtered = useMemo(() => {
    let result = [...items];

    // Search query filter
    if (filters.searchQuery?.trim()) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.overview?.toLowerCase().includes(query) ||
        item.genres.some(genre => genre.toLowerCase().includes(query)) ||
        item.platform.toLowerCase().includes(query)
      );
    }

    // Platform filter
    if (filters.platform?.length) {
      result = result.filter(item =>
        filters.platform!.some(platform =>
          item.platform.toLowerCase().includes(platform.toLowerCase())
        )
      );
    }

    // Genre filter
    if (filters.genres?.length) {
      result = result.filter(item =>
        item.genres.some(genre =>
          filters.genres!.some(filterGenre =>
            genre.toLowerCase().includes(filterGenre.toLowerCase())
          )
        )
      );
    }

    // Release year filter
    if (filters.releaseYear?.length) {
      result = result.filter(item =>
        filters.releaseYear!.includes(item.releaseYear)
      );
    }

    // Rating range filter
    if (filters.rating) {
      const [minRating, maxRating] = filters.rating;
      result = result.filter(item =>
        item.rating >= minRating && item.rating <= maxRating
      );
    }

    // Content type filter
    if (filters.type?.length) {
      result = result.filter(item =>
        filters.type!.includes(item.type)
      );
    }

    // Award winning filter
    if (filters.awardWinning !== undefined) {
      result = result.filter(item =>
        filters.awardWinning ? item.isAwardWinning : !item.isAwardWinning
      );
    }

    // Upcoming filter
    if (filters.upcoming !== undefined) {
      result = result.filter(item => {
        if (filters.upcoming) {
          return item.isUpcoming && item.releaseDate && new Date(item.releaseDate) > new Date();
        }
        return !item.isUpcoming;
      });
    }

    // Language filter
    if (filters.language?.length) {
      result = result.filter(item =>
        filters.language!.includes(item.originalLanguage || 'en')
      );
    }

    // Minimum vote count filter
    if (filters.minVoteCount && filters.minVoteCount > 0) {
      result = result.filter(item =>
        (item.voteCount || 0) >= filters.minVoteCount!
      );
    }

    // Watchlist filter
    if (filters.inWatchlist !== undefined) {
      result = result.filter(item =>
        filters.inWatchlist ? isInWatchlist(item.id) : !isInWatchlist(item.id)
      );
    }

    // Adult content filter
    if (filters.adult !== undefined) {
      result = result.filter(item =>
        filters.adult ? item.adult : !item.adult
      );
    }

    // Apply sorting
    const sortBy = filters.sortBy || 'popularity';
    const sortOrder = filters.sortOrder || 'desc';
    
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'rating':
          comparison = a.rating - b.rating;
          break;
        case 'releaseYear':
          comparison = a.releaseYear - b.releaseYear;
          break;
        case 'popularity':
          comparison = (a.popularity || 0) - (b.popularity || 0);
          break;
        case 'dateAdded':
          const aIndex = watchlist.indexOf(a.id);
          const bIndex = watchlist.indexOf(b.id);
          comparison = aIndex - bIndex;
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [items, filters, watchlist, isInWatchlist]);

  // Preload platform logos
  useEffect(() => {
    const platforms = Array.from(new Set(filtered.map(item => item.platform.toLowerCase())));
    
    if (platforms.length === 0) return;

    setLogoLoading(true);
    
    const loadLogos = async () => {
      try {
        const newLogos = await preloadPlatformLogos(platforms);
        setLogos(prev => ({ ...prev, ...newLogos }));
      } catch (error) {
        console.error('Error loading platform logos:', error);
        // Set fallback logos
        const fallbackLogos: Record<string, string> = {};
        platforms.forEach(platform => {
          fallbackLogos[platform] = FALLBACK_LOGO;
        });
        setLogos(prev => ({ ...prev, ...fallbackLogos }));
      } finally {
        setLogoLoading(false);
      }
    };

    loadLogos();
  }, [filtered]);

  // Enhanced watchlist functions with content item details
  const enhancedToggleWatchlist = (item: ContentItem) => {
    const watchlistItem: Omit<WatchlistItem, 'addedAt'> = {
      id: item.id,
      title: item.title,
      platform: item.platform,
      type: item.type
    };

    if (isInWatchlist(item.id)) {
      removeFromWatchlist(item.id);
    } else {
      addToWatchlist(watchlistItem);
    }
  };

  const enhancedAddToWatchlist = (item: ContentItem) => {
    const watchlistItem: Omit<WatchlistItem, 'addedAt'> = {
      id: item.id,
      title: item.title,
      platform: item.platform,
      type: item.type
    };
    addToWatchlist(watchlistItem);
  };

  // Get filter statistics
  const getFilterStats = () => {
    return {
      total: items.length,
      filtered: filtered.length,
      platforms: Array.from(new Set(filtered.map(item => item.platform))),
      genres: Array.from(new Set(filtered.flatMap(item => item.genres))),
      types: Array.from(new Set(filtered.map(item => item.type))),
      years: Array.from(new Set(filtered.map(item => item.releaseYear))).sort((a, b) => b - a),
      averageRating: filtered.reduce((sum, item) => sum + item.rating, 0) / filtered.length || 0,
      awardWinning: filtered.filter(item => item.isAwardWinning).length,
      upcoming: filtered.filter(item => item.isUpcoming).length,
      inWatchlist: filtered.filter(item => isInWatchlist(item.id)).length,
    };
  };

  // Get platform logo with fallback
  const getPlatformLogo = (platformName: string): string => {
    const normalizedPlatform = platformName.toLowerCase();
    return logos[normalizedPlatform] || FALLBACK_LOGO;
  };

  return {
    // Filtered data
    filtered,
    
    // Logo management
    logos,
    logoLoading,
    getPlatformLogo,
    
    // Watchlist functions
    watchlist,
    isInWatchlist,
    toggleWatchlist: enhancedToggleWatchlist,
    addToWatchlist: enhancedAddToWatchlist,
    removeFromWatchlist,
    
    // Statistics
    getFilterStats,
    
    // Raw watchlist hook for advanced usage
    watchlistHook: {
      watchlist,
      addToWatchlist,
      removeFromWatchlist,
      toggleWatchlist,
      isInWatchlist,
    }
  };
}

/**
 * Legacy hook for integrating Enhanced Filter System with content fetching
 * Handles filter state, content fetching, and loading states
 */
export function useFilteredContentAPI(options: UseFilteredContentOptions) {
  const {
    endpoint,
    queryKey,
    additionalParams = {},
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus = false
  } = options;

  const [filters, setFilters] = useState<FilterValues>({
    genres: [],
    platforms: [],
    countries: [],
    sports: []
  });

  const [appliedFilters, setAppliedFilters] = useState<FilterValues>(filters);

  // Query for filtered content
  const {
    data: content,
    isLoading,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: [queryKey, appliedFilters],
    queryFn: () => fetchFilteredContent(endpoint, appliedFilters, additionalParams),
    enabled: enabled,
    staleTime,
    refetchOnWindowFocus,
    // Keep previous data while fetching new results
    placeholderData: (previousData) => previousData
  });

  // Handlers for filter system integration
  const handleFiltersChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
    // Real-time updates - you can choose to apply immediately or wait for apply button
  };

  const handleFiltersApply = (newFilters: FilterValues) => {
    setAppliedFilters(newFilters);
    // This triggers the content refetch
  };

  const clearFilters = () => {
    const emptyFilters = { genres: [], platforms: [], countries: [], sports: [] };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
  };

  const hasFilters = hasActiveFilters(appliedFilters);

  return {
    // Content data
    content,
    isLoading,
    error,
    isFetching,
    refetch,

    // Filter state
    filters,
    appliedFilters,
    hasFilters,

    // Handlers for EnhancedFilterSystem
    handleFiltersChange,
    handleFiltersApply,
    clearFilters,

    // Convenience methods
    setFilters,
    setAppliedFilters
  };
}

/**
 * Specialized hook for Dashboard content with AI recommendations
 */
export function useDashboardContent() {
  return useFilteredContentAPI({
    endpoint: '/api/dashboard/content',
    queryKey: 'dashboard-content',
    additionalParams: {
      type: 'recommendations',
      includeAI: 'true',
      limit: '20'
    }
  });
}

/**
 * Specialized hook for Discover content
 */
export function useDiscoverContent() {
  return useFilteredContentAPI({
    endpoint: '/api/discover/content',
    queryKey: 'discover-content',
    additionalParams: {
      type: 'discover',
      sort_by: 'popularity.desc',
      limit: '50'
    }
  });
}

/**
 * Hook for real-time search with filters
 */
export function useSearchWithFilters(searchQuery: string) {
  const [filters, setFilters] = useState<FilterValues>({
    genres: [],
    platforms: [],
    countries: [],
    sports: []
  });

  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['search', searchQuery, filters],
    queryFn: () => fetchFilteredContent(
      '/api/search',
      filters,
      { q: searchQuery, limit: '30' }
    ),
    enabled: searchQuery.trim().length > 2, // Only search if query is meaningful
    staleTime: 30 * 1000, // 30 seconds for search results
  });

  const handleFiltersChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
    // Search updates in real-time
  };

  return {
    searchResults,
    isLoading,
    error,
    filters,
    handleFiltersChange,
    setFilters
  };
}

export default useFilteredContent;
