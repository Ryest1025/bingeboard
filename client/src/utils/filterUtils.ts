import { useMemo } from 'react';
import { ContentItem, Award, AwardFilter } from '../types/contentTypes';
import { FilterValues } from '@/components/common/FilterBadges';

// Extended filter state to match BingeBoard needs
export type SortOption = 'newest' | 'oldest' | 'rating' | 'popularity' | 'alphabetical' | 'trending' | 'runtime';
export type ContentType = 'all' | 'movie' | 'tv' | 'documentary' | 'anime';
export type ContentStatus = 'all' | 'watching' | 'completed' | 'plan-to-watch' | 'dropped';
export type RuntimeRange = [number, number];
export type RatingRange = [number, number];

export interface FilterState {
  genre: string;
  year: string;
  rating: RatingRange;
  runtime: RuntimeRange;
  platform: string;
  status: ContentStatus;
  sortBy: SortOption;
  hideWatched: boolean;
  onlyWatchlist: boolean;
  includeFriends: boolean;
  searchQuery: string;
  contentType: ContentType;
  onlyUpcoming: boolean;
  language: string;
  minVoteCount: number;
  awardFilter?: AwardFilter;
  releaseYearRange: [number, number];
  popularityRange: [number, number];
  adultContent: boolean;
}

// Default filter state
export const getDefaultFilters = (): FilterState => ({
  genre: 'all',
  year: 'all',
  rating: [0, 10],
  runtime: [0, 300],
  platform: 'all',
  status: 'all',
  sortBy: 'popularity',
  hideWatched: false,
  onlyWatchlist: false,
  includeFriends: false,
  searchQuery: '',
  contentType: 'all',
  onlyUpcoming: false,
  language: 'all',
  minVoteCount: 0,
  awardFilter: undefined,
  releaseYearRange: [1900, new Date().getFullYear() + 2],
  popularityRange: [0, 1000],
  adultContent: false,
});

// Genre ID to name mapping (TMDB standard genres)
export const GENRE_MAP: Record<string, string> = {
  '28': 'Action',
  '12': 'Adventure', 
  '16': 'Animation',
  '35': 'Comedy',
  '80': 'Crime',
  '99': 'Documentary',
  '18': 'Drama',
  '10751': 'Family',
  '14': 'Fantasy',
  '36': 'History',
  '27': 'Horror',
  '10402': 'Music',
  '9648': 'Mystery',
  '10749': 'Romance',
  '878': 'Science Fiction',
  '10770': 'TV Movie',
  '53': 'Thriller',
  '10752': 'War',
  '37': 'Western',
  // TV specific genres
  '10759': 'Action & Adventure',
  '10762': 'Kids',
  '10763': 'News',
  '10764': 'Reality',
  '10765': 'Sci-Fi & Fantasy',
  '10766': 'Soap',
  '10767': 'Talk',
  '10768': 'War & Politics',
};

/**
 * TMDB-aware filtering function that handles all BingeBoard content types
 */
export function applyFilters(items: ContentItem[], filters: FilterState): ContentItem[] {
  return items
    .filter(item => {
      // Search Query - Enhanced to search multiple fields
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const searchableText = [
          item.title,
          item.overview,
          item.originalLanguage,
          ...(item.genres?.map(g => GENRE_MAP[g]).filter(Boolean) || []),
          item.platform,
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(query)) return false;
      }

      // Genre Filter - Handle TMDB genre IDs
      if (filters.genre && filters.genre !== 'all') {
        if (!item.genres?.includes(filters.genre)) return false;
      }

      // Platform Filter - Flexible platform matching
      if (filters.platform && filters.platform !== 'all') {
        const platformMatch = item.platform?.toLowerCase() === filters.platform.toLowerCase() ||
          item.streamingPlatforms?.some(p => 
            p.provider_name.toLowerCase().includes(filters.platform.toLowerCase())
          );
        if (!platformMatch) return false;
      }

      // Content Type Filter
      if (filters.contentType && filters.contentType !== 'all') {
        if (item.type !== filters.contentType) return false;
      }

      // Rating Filter - Handle TMDB 0-10 scale
      const [minRating, maxRating] = filters.rating;
      if (item.rating < minRating || item.rating > maxRating) return false;

      // Runtime Filter - Handle both movie runtime and TV episode runtime
      const [minRuntime, maxRuntime] = filters.runtime;
      const itemRuntime = item.runtime || item.episodeRunTime?.[0] || 0;
      if (itemRuntime < minRuntime || itemRuntime > maxRuntime) return false;

      // Release Year Filter
      if (filters.year && filters.year !== 'all') {
        if (item.releaseYear !== parseInt(filters.year, 10)) return false;
      }

      // Release Year Range Filter
      const [minYear, maxYear] = filters.releaseYearRange;
      if (item.releaseYear < minYear || item.releaseYear > maxYear) return false;

      // Watch Status Filters
      if (filters.hideWatched && item.watched) return false;
      if (filters.onlyWatchlist && item.status !== 'plan-to-watch') return false;

      // Friends' Picks
      if (filters.includeFriends && !item.friendsRecommended) return false;

      // Upcoming Releases
      if (filters.onlyUpcoming) {
        if (!item.upcomingRelease) return false;
        const releaseDate = new Date(item.upcomingRelease);
        if (releaseDate <= new Date()) return false;
      }

      // Language Filter
      if (filters.language && filters.language !== 'all') {
        if (item.originalLanguage !== filters.language) return false;
      }

      // Minimum Vote Count Filter
      if (filters.minVoteCount > 0) {
        if ((item.voteCount || 0) < filters.minVoteCount) return false;
      }

      // Popularity Range Filter
      const [minPopularity, maxPopularity] = filters.popularityRange;
      const popularity = item.popularity || 0;
      if (popularity < minPopularity || popularity > maxPopularity) return false;

      // Adult Content Filter
      if (!filters.adultContent && item.adult) return false;

      // Award Filter
      if (filters.awardFilter) {
        const { nominated, won, year, awardName, category } = filters.awardFilter;
        
        if (!item.awards?.some(award => {
          let matches = true;
          
          if (nominated !== undefined && award.nominated !== nominated) matches = false;
          if (won !== undefined && award.won !== won) matches = false;
          if (year !== undefined && award.year !== year) matches = false;
          if (awardName && award.awardName !== awardName) matches = false;
          if (category && award.category !== category) matches = false;
          
          return matches;
        })) return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return b.releaseYear - a.releaseYear;
        case 'oldest':
          return a.releaseYear - b.releaseYear;
        case 'rating':
          return b.rating - a.rating;
        case 'popularity':
          return (b.popularity || 0) - (a.popularity || 0);
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'trending':
          return (b.trendingScore || b.popularity || 0) - (a.trendingScore || a.popularity || 0);
        case 'runtime':
          const aRuntime = a.runtime || a.episodeRunTime?.[0] || 0;
          const bRuntime = b.runtime || b.episodeRunTime?.[0] || 0;
          return bRuntime - aRuntime;
        default:
          return 0;
      }
    });
}

/**
 * Hook for filtered content with memoization
 */
export function useFilteredContent(items: ContentItem[], filters: FilterState) {
  return useMemo(() => {
    if (!items?.length) return [];
    return applyFilters(items, filters);
  }, [items, filters]);
}

/**
 * Get active filter count for UI indicators
 */
export function getActiveFilterCount(filters: FilterState): number {
  const defaultFilters = getDefaultFilters();
  let count = 0;

  // Check each filter against defaults
  if (filters.genre !== defaultFilters.genre) count++;
  if (filters.year !== defaultFilters.year) count++;
  if (filters.platform !== defaultFilters.platform) count++;
  if (filters.status !== defaultFilters.status) count++;
  if (filters.contentType !== defaultFilters.contentType) count++;
  if (filters.language !== defaultFilters.language) count++;
  
  // Range filters
  if (filters.rating[0] !== defaultFilters.rating[0] || filters.rating[1] !== defaultFilters.rating[1]) count++;
  if (filters.runtime[0] !== defaultFilters.runtime[0] || filters.runtime[1] !== defaultFilters.runtime[1]) count++;
  if (filters.releaseYearRange[0] !== defaultFilters.releaseYearRange[0] || 
      filters.releaseYearRange[1] !== defaultFilters.releaseYearRange[1]) count++;
  if (filters.popularityRange[0] !== defaultFilters.popularityRange[0] || 
      filters.popularityRange[1] !== defaultFilters.popularityRange[1]) count++;

  // Boolean filters
  if (filters.hideWatched !== defaultFilters.hideWatched) count++;
  if (filters.onlyWatchlist !== defaultFilters.onlyWatchlist) count++;
  if (filters.includeFriends !== defaultFilters.includeFriends) count++;
  if (filters.onlyUpcoming !== defaultFilters.onlyUpcoming) count++;
  if (filters.adultContent !== defaultFilters.adultContent) count++;

  // Text filters
  if (filters.searchQuery.trim() !== '') count++;
  if (filters.minVoteCount !== defaultFilters.minVoteCount) count++;

  // Award filter
  if (filters.awardFilter) count++;

  return count;
}

/**
 * Validate filter values and return any errors
 */
export function validateFilters(filters: FilterState): string[] {
  const errors: string[] = [];

  // Rating range validation
  if (filters.rating[0] > filters.rating[1]) {
    errors.push('Minimum rating cannot be higher than maximum rating');
  }

  // Runtime range validation
  if (filters.runtime[0] > filters.runtime[1]) {
    errors.push('Minimum runtime cannot be higher than maximum runtime');
  }

  // Year range validation
  if (filters.releaseYearRange[0] > filters.releaseYearRange[1]) {
    errors.push('Start year cannot be later than end year');
  }

  // Popularity range validation
  if (filters.popularityRange[0] > filters.popularityRange[1]) {
    errors.push('Minimum popularity cannot be higher than maximum popularity');
  }

  return errors;
}

/**
 * Helper to get genre name from TMDB genre ID
 */
export function getGenreName(genreId: string | number): string {
  return GENRE_MAP[genreId.toString()] || 'Unknown Genre';
}

/**
 * Helper to get all genres from an array of genre IDs
 */
export function getGenreNames(genreIds: (string | number)[]): string[] {
  return genreIds.map(id => getGenreName(id)).filter(name => name !== 'Unknown Genre');
}

/**
 * Get filter summary for display
 */
export function getFilterSummary(filters: FilterState, itemCount: number): string {
  const activeCount = getActiveFilterCount(filters);
  
  if (activeCount === 0) {
    return `Showing all ${itemCount.toLocaleString()} items`;
  }

  const parts: string[] = [];
  
  if (filters.contentType !== 'all') {
    parts.push(`${filters.contentType}s`);
  }
  
  if (filters.genre !== 'all') {
    parts.push(getGenreName(filters.genre));
  }
  
  if (filters.platform !== 'all') {
    parts.push(`on ${filters.platform}`);
  }

  const summary = parts.length > 0 
    ? `${itemCount.toLocaleString()} ${parts.join(', ')}`
    : `${itemCount.toLocaleString()} filtered items`;
    
  return `${summary} (${activeCount} filter${activeCount === 1 ? '' : 's'} active)`;
}

// Legacy support for existing FilterBadges component
/**
 * Build query string from filters for API calls
 */
export const buildFilterQuery = (filters: FilterValues): URLSearchParams => {
  const query = new URLSearchParams();

  if (filters.genres.length) {
    query.append("genres", filters.genres.join(","));
  }
  if (filters.platforms.length) {
    query.append("platforms", filters.platforms.join(","));
  }
  if (filters.countries.length) {
    query.append("countries", filters.countries.join(","));
  }
  if (filters.sports.length) {
    query.append("sports", filters.sports.join(","));
  }

  return query;
};

/**
 * Fetch filtered content for Dashboard page
 */
export const fetchFilteredDashboardContent = async (filters: FilterValues) => {
  const query = buildFilterQuery(filters);

  // Add dashboard-specific parameters
  query.append("type", "recommendations");
  query.append("limit", "20");

  const res = await fetch(`/api/dashboard/content?${query.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch dashboard content: ${res.statusText}`);
  }
  return res.json();
};

/**
 * Fetch filtered content for Discover page  
 */
export const fetchFilteredDiscoverContent = async (filters: FilterValues) => {
  const query = buildFilterQuery(filters);

  // Add discover-specific parameters
  query.append("type", "discover");
  query.append("limit", "50");
  query.append("sort_by", "popularity.desc");

  const res = await fetch(`/api/discover/content?${query.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch discover content: ${res.statusText}`);
  }
  return res.json();
};

/**
 * Generic content fetcher with custom endpoint
 */
export const fetchFilteredContent = async (
  endpoint: string,
  filters: FilterValues,
  additionalParams: Record<string, string> = {}
) => {
  const query = buildFilterQuery(filters);

  // Add any additional parameters
  Object.entries(additionalParams).forEach(([key, value]) => {
    query.append(key, value);
  });

  const res = await fetch(`${endpoint}?${query.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch content from ${endpoint}: ${res.statusText}`);
  }
  return res.json();
};

/**
 * Convert filters to TMDB API format
 */
export const filtersToTMDBQuery = (filters: FilterValues): URLSearchParams => {
  const query = new URLSearchParams();

  // Map genre names to TMDB genre IDs (you'd want to maintain this mapping)
  if (filters.genres.length) {
    // This would need actual genre ID mapping
    query.append("with_genres", filters.genres.join(","));
  }

  // Map platform names to TMDB provider IDs
  if (filters.platforms.length) {
    // This would need actual provider ID mapping
    query.append("with_watch_providers", filters.platforms.join("|"));
  }

  // Map country codes
  if (filters.countries.length) {
    query.append("region", filters.countries[0]); // TMDB only supports one region
  }

  return query;
};

/**
 * Check if any filters are active
 */
export const hasActiveFilters = (filters: FilterValues): boolean => {
  return (
    filters.genres.length > 0 ||
    filters.platforms.length > 0 ||
    filters.countries.length > 0 ||
    filters.sports.length > 0
  );
};

export default {
  applyFilters,
  useFilteredContent,
  getActiveFilterCount,
  validateFilters,
  getGenreName,
  getGenreNames,
  getFilterSummary,
  getDefaultFilters,
  GENRE_MAP,
};
