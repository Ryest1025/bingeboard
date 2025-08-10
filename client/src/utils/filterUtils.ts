import { FilterValues } from '@/components/common/FilterBadges';

/**
 * Utility functions for integrating Enhanced Filter System with content fetching
 */

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

/**
 * Get filter summary text
 */
export const getFilterSummary = (filters: FilterValues): string => {
  const parts: string[] = [];

  if (filters.genres.length > 0) {
    parts.push(`${filters.genres.length} genre${filters.genres.length !== 1 ? 's' : ''}`);
  }
  if (filters.platforms.length > 0) {
    parts.push(`${filters.platforms.length} platform${filters.platforms.length !== 1 ? 's' : ''}`);
  }
  if (filters.countries.length > 0) {
    parts.push(`${filters.countries.length} countr${filters.countries.length !== 1 ? 'ies' : 'y'}`);
  }
  if (filters.sports.length > 0) {
    parts.push(`${filters.sports.length} sport${filters.sports.length !== 1 ? 's' : ''}`);
  }

  if (parts.length === 0) return "No filters applied";
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return parts.join(" and ");

  return parts.slice(0, -1).join(", ") + ", and " + parts[parts.length - 1];
};
