import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface RecommendedShow {
  tmdbId: number;
  title: string;
  overview?: string;
  posterPath?: string;
  rating?: string | number;
  streamingPlatforms?: Array<{ 
    provider_id: number; 
    provider_name: string; 
    logo_path?: string 
  }>;
  hasTrailer?: boolean;
  trailerKey?: string;
  trailerUrl?: string;
}

export function useRecommendedShows(type: 'trending' | 'ai' | 'popular' = 'trending') {
  return useQuery({
    queryKey: [`/api/recommendations/${type}`],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/recommendations/${type}`);
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

export function useAiRecommendations() {
  return useQuery({
    queryKey: ["/api/ai-recommendations"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/ai-recommendations");
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

export function useTrendingShows() {
  return useQuery({
    queryKey: ["/api/trending"],
    queryFn: async () => {
      const response = await fetch('/api/trending');
      if (!response.ok) {
        throw new Error('Failed to fetch trending shows');
      }
      return response.json();
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
  });
}
