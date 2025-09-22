/**
 * Universal Media Filtering
 * 
 * Provides consistent filtering logic across all components.
 * Works with normalized media data to ensure uniform behavior.
 */

import { 
  NormalizedMedia, 
  MediaFilters, 
  FilteredMediaResult,
  MediaType 
} from '@/types/media';
import { platformsMatch } from '@/utils/platform-normalizer';

/**
 * Filter media by network/streaming platform
 */
export function filterByNetwork(media: NormalizedMedia[], network: string): NormalizedMedia[] {
  if (!network) return media;
  
  return media.filter(item => {
    // Check against normalized provider names first (faster)
    if (item.normalizedProviders.some(provider => platformsMatch(network, provider))) {
      return true;
    }
    
    // Fallback to checking original platform names
    return item.streaming.some(platform => {
      const providerName = platform.provider_name || platform.name || '';
      return platformsMatch(network, providerName);
    });
  });
}

/**
 * Filter media by type (movie, tv, sports)
 */
export function filterByType(media: NormalizedMedia[], type: MediaType): NormalizedMedia[] {
  if (!type) return media;
  return media.filter(item => item.type === type);
}

/**
 * Filter media by genre
 */
export function filterByGenre(media: NormalizedMedia[], genre: string | number): NormalizedMedia[] {
  if (!genre || genre === '0' || genre === 0) return media;
  
  const genreId = typeof genre === 'string' ? parseInt(genre) : genre;
  if (isNaN(genreId)) return media;
  
  return media.filter(item => item.genre_ids?.includes(genreId) || false);
}

/**
 * Filter media by year
 */
export function filterByYear(media: NormalizedMedia[], year: string | number): NormalizedMedia[] {
  if (!year || year === '0' || year === 0) return media;
  
  const yearNum = typeof year === 'string' ? parseInt(year) : year;
  if (isNaN(yearNum)) return media;
  
  return media.filter(item => {
    const releaseDate = item.release_date || item.first_air_date;
    if (!releaseDate) return false;
    
    try {
      const releaseYear = new Date(releaseDate).getFullYear();
      return releaseYear === yearNum;
    } catch {
      return false;
    }
  });
}

/**
 * Filter media by rating range
 */
export function filterByRating(
  media: NormalizedMedia[], 
  minRating?: number, 
  maxRating?: number
): NormalizedMedia[] {
  return media.filter(item => {
    const rating = item.vote_average || 0;
    if (minRating !== undefined && rating < minRating) return false;
    if (maxRating !== undefined && rating > maxRating) return false;
    return true;
  });
}

/**
 * Filter live content only
 */
export function filterLiveContent(media: NormalizedMedia[]): NormalizedMedia[] {
  return media.filter(item => item.isLive);
}

/**
 * Filter upcoming content only
 */
export function filterUpcomingContent(media: NormalizedMedia[]): NormalizedMedia[] {
  return media.filter(item => item.isUpcoming);
}

/**
 * Filter content with streaming availability
 */
export function filterWithStreaming(media: NormalizedMedia[]): NormalizedMedia[] {
  return media.filter(item => item.streaming_count > 0);
}

/**
 * Sort media by various criteria
 */
export function sortMedia(
  media: NormalizedMedia[], 
  sortBy: 'popularity' | 'rating' | 'recent' | 'alphabetical' | 'live' = 'popularity'
): NormalizedMedia[] {
  const sorted = [...media];
  
  switch (sortBy) {
    case 'popularity':
      return sorted.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      
    case 'rating':
      return sorted.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
      
    case 'recent':
      return sorted.sort((a, b) => {
        const aDate = a.release_date || a.first_air_date || '1900-01-01';
        const bDate = b.release_date || b.first_air_date || '1900-01-01';
        return new Date(bDate).getTime() - new Date(aDate).getTime();
      });
      
    case 'alphabetical':
      return sorted.sort((a, b) => 
        a.displayTitle.localeCompare(b.displayTitle, 'en', { numeric: true })
      );
      
    case 'live':
      return sorted.sort((a, b) => {
        // Live content first
        if (a.isLive && !b.isLive) return -1;
        if (!a.isLive && b.isLive) return 1;
        
        // Then by priority
        return (b.priority || 0) - (a.priority || 0);
      });
      
    default:
      return sorted;
  }
}

/**
 * Main filtering function - applies all filters and sorting
 */
export function filterMedia(
  media: NormalizedMedia[], 
  filters: MediaFilters = {}
): FilteredMediaResult {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔍 Filtering ${media.length} media items with filters:`, filters);
  }
  
  let filtered = [...media];
  
  // Apply individual filters
  if (filters.network) {
    filtered = filterByNetwork(filtered, filters.network);
  }
  
  if (filters.type) {
    filtered = filterByType(filtered, filters.type);
  }
  
  if (filters.genre) {
    filtered = filterByGenre(filtered, filters.genre);
  }
  
  if (filters.year) {
    filtered = filterByYear(filtered, filters.year);
  }
  
  if (filters.minRating !== undefined || filters.maxRating !== undefined) {
    filtered = filterByRating(filtered, filters.minRating, filters.maxRating);
  }
  
  if (filters.includeLive === false) {
    filtered = filtered.filter(item => !item.isLive);
  } else if (filters.includeLive === true) {
    filtered = filterLiveContent(filtered);
  }
  
  if (filters.includeUpcoming === false) {
    filtered = filtered.filter(item => !item.isUpcoming);
  } else if (filters.includeUpcoming === true) {
    filtered = filterUpcomingContent(filtered);
  }
  
  // Apply sorting
  if (filters.sortBy) {
    filtered = sortMedia(filtered, filters.sortBy);
  }
  
  // Calculate statistics
  const stats = {
    movies: filtered.filter(item => item.type === 'movie').length,
    tvShows: filtered.filter(item => item.type === 'tv').length,
    sports: filtered.filter(item => item.type === 'sports').length,
    liveContent: filtered.filter(item => item.isLive).length,
    upcomingContent: filtered.filter(item => item.isUpcoming).length,
    withStreaming: filtered.filter(item => item.streaming_count > 0).length
  };
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`✅ Filtered to ${filtered.length} items:`, stats);
  }
  
  return {
    items: filtered,
    totalCount: filtered.length,
    appliedFilters: filters,
    stats
  };
}

/**
 * Quick filter presets for common use cases
 */
export const filterPresets = {
  // Movies only
  movies: (media: NormalizedMedia[]) => 
    filterMedia(media, { type: 'movie', sortBy: 'popularity' }),
  
  // TV shows only
  tvShows: (media: NormalizedMedia[]) => 
    filterMedia(media, { type: 'tv', sortBy: 'popularity' }),
  
  // Sports content only
  sports: (media: NormalizedMedia[]) => 
    filterMedia(media, { type: 'sports', sortBy: 'live' }),
  
  // Live content across all types
  liveContent: (media: NormalizedMedia[]) => 
    filterMedia(media, { includeLive: true, sortBy: 'live' }),
  
  // Upcoming releases
  upcoming: (media: NormalizedMedia[]) => 
    filterMedia(media, { includeUpcoming: true, sortBy: 'recent' }),
  
  // High-rated content
  highRated: (media: NormalizedMedia[]) => 
    filterMedia(media, { minRating: 7.0, sortBy: 'rating' }),
  
  // Award winners
  awardWinners: (media: NormalizedMedia[]) => 
    filterMedia(media.filter(item => item.isAwardWinner), { sortBy: 'rating' }),
  
  // With streaming availability
  streamingAvailable: (media: NormalizedMedia[]) =>
    filterMedia(media.filter(item => item.streaming_count > 0), { sortBy: 'popularity' })
};

/**
 * Advanced filtering with complex conditions
 */
export function filterMediaAdvanced(
  media: NormalizedMedia[],
  conditions: {
    and?: MediaFilters[];
    or?: MediaFilters[];
    not?: MediaFilters;
  }
): FilteredMediaResult {
  let filtered = [...media];
  
  // AND conditions - all must match
  if (conditions.and) {
    for (const filter of conditions.and) {
      const result = filterMedia(filtered, filter);
      filtered = result.items;
    }
  }
  
  // OR conditions - at least one must match
  if (conditions.or && conditions.or.length > 0) {
    const orResults = conditions.or.map(filter => 
      filterMedia(media, filter).items
    );
    
    // Combine all OR results and remove duplicates
    const combinedIds = new Set<number>();
    const combined: NormalizedMedia[] = [];
    
    orResults.forEach(results => {
      results.forEach(item => {
        if (!combinedIds.has(item.id)) {
          combinedIds.add(item.id);
          combined.push(item);
        }
      });
    });
    
    filtered = combined;
  }
  
  // NOT conditions - exclude items that match
  if (conditions.not) {
    const excludeResult = filterMedia(media, conditions.not);
    const excludeIds = new Set(excludeResult.items.map(item => item.id));
    filtered = filtered.filter(item => !excludeIds.has(item.id));
  }
  
  return filterMedia(filtered);
}

/**
 * Search media by text query
 */
export function searchMedia(
  media: NormalizedMedia[], 
  query: string,
  searchFields: ('title' | 'overview' | 'genres')[] = ['title', 'overview']
): NormalizedMedia[] {
  if (!query.trim()) return media;
  
  const searchTerm = query.toLowerCase().trim();
  
  return media.filter(item => {
    if (searchFields.includes('title')) {
      if (item.displayTitle.toLowerCase().includes(searchTerm)) return true;
    }
    
    if (searchFields.includes('overview')) {
      if (item.overview?.toLowerCase().includes(searchTerm)) return true;
    }
    
    if (searchFields.includes('genres')) {
      if (item.genres?.some(genre => 
        genre.name.toLowerCase().includes(searchTerm)
      )) return true;
    }
    
    return false;
  });
}

/**
 * Debug helper for filtering issues
 */
export function debugFiltering(
  media: NormalizedMedia[], 
  filters: MediaFilters,
  itemTitle?: string
): void {
  if (process.env.NODE_ENV !== 'development') return;
  
  console.group(`🔍 Debug filtering${itemTitle ? ` for: ${itemTitle}` : ''}`);
  console.log('Original count:', media.length);
  console.log('Filters:', filters);
  
  // Test each filter individually
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== 0) {
      const singleFilter = { [key]: value } as MediaFilters;
      const result = filterMedia(media, singleFilter);
      console.log(`After ${key} filter:`, result.totalCount);
    }
  });
  
  const finalResult = filterMedia(media, filters);
  console.log('Final count:', finalResult.totalCount);
  console.log('Stats:', finalResult.stats);
  console.groupEnd();
}