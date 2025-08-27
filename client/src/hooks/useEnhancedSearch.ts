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

    // Enhanced retry/backoff configuration
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.status >= 400 && error?.status < 500) {
        console.log(`❌ Enhanced search: Not retrying 4xx error (${error.status})`);
        return false;
      }

      // Retry up to 3 times for 5xx errors or network errors
      if (failureCount < 3) {
        console.log(`🔄 Enhanced search: Retry ${failureCount + 1}/3 after error:`, error?.message);
        return true;
      }

      console.log(`❌ Enhanced search: Max retries reached (${failureCount})`);
      return false;
    },

    retryDelay: (attemptIndex) => {
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.min(1000 * Math.pow(2, attemptIndex), 10000);
      console.log(`⏱️ Enhanced search: Retrying in ${delay}ms (attempt ${attemptIndex + 1})`);
      return delay;
    },

    // Network timeout
    meta: {
      timeout: 15000, // 15 second timeout
    },
  });
}

// Hook for batch streaming availability
// Internal helper (not exported) – currently unused externally; export later if adopted.
function useBatchStreamingAvailability(titles: Array<{
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

    // Similar retry configuration for batch API
    retry: (failureCount, error: any) => {
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < 2; // Only retry twice for batch operations
    },

    retryDelay: (attemptIndex) => {
      const delay = Math.min(2000 * Math.pow(2, attemptIndex), 8000);
      console.log(`⏱️ Batch streaming: Retrying in ${delay}ms (attempt ${attemptIndex + 1})`);
      return delay;
    },
  });
}
