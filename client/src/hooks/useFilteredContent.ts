import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FilterValues } from '@/components/common/FilterBadges';
import { fetchFilteredContent, hasActiveFilters } from '@/utils/filterUtils';

interface UseFilteredContentOptions {
  endpoint: string;
  queryKey: string;
  additionalParams?: Record<string, string>;
  enabled?: boolean;
  staleTime?: number;
  refetchOnWindowFocus?: boolean;
}

/**
 * Custom hook for integrating Enhanced Filter System with content fetching
 * Handles filter state, content fetching, and loading states
 */
export function useFilteredContent(options: UseFilteredContentOptions) {
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
  return useFilteredContent({
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
  return useFilteredContent({
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
