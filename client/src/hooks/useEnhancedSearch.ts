// hooks/useEnhancedSearch.ts - Hook for multi-API enhanced search
import { useQuery } from "@tanstack/react-query";
import useDebouncedValue from "./useDebouncedValue";
import { enhancedSearchApi } from "@/lib/search-api";

interface EnhancedSearchFilters {
  query?: string;
  genres?: string[];
  ratingRange?: [number, number];
  releaseYear?: number;
  providers?: string[];
  sortBy?: string;
}

export default function useEnhancedSearch(filters: EnhancedSearchFilters) {
  const debouncedQuery = useDebouncedValue(filters.query || "", 300);

  const debouncedFilters = {
    ...filters,
    query: debouncedQuery,
  };

  return useQuery({
    queryKey: ["enhanced-search", debouncedFilters],
    queryFn: () => enhancedSearchApi(debouncedFilters),
    enabled: !!(debouncedQuery || filters.genres?.length || filters.providers?.length || filters.ratingRange || filters.releaseYear),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Hook for batch streaming availability
export function useBatchStreamingAvailability(titles: Array<{
  tmdbId: number;
  title: string;
  mediaType: 'movie' | 'tv';
  imdbId?: string;
}>) {
  return useQuery({
    queryKey: ["batch-streaming", titles.map(t => t.tmdbId).sort()],
    queryFn: () => import("@/lib/search-api").then(m => m.getBatchStreamingApi(titles)),
    enabled: titles.length > 0,
    staleTime: 1000 * 60 * 30, // 30 minutes - streaming data changes less frequently
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}
