// hooks/useTrailer.ts - fetch aggregated trailer data via multi-api endpoint
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../utils/api-config';

export interface TrailerItem {
  source: string;
  platform: string;
  videoType: string;
  key: string;
  name?: string;
  official?: boolean;
  published_at?: string | null;
  url: string;
  embeddableUrl?: string;
  monetized?: boolean;
}

export interface TrailerResponse {
  id: number;
  type: 'movie' | 'tv';
  title?: string;
  trailers: TrailerItem[];
  primaryTrailer?: TrailerItem | null;
  stats?: { total: number; monetized: number };
  sources?: Record<string, boolean>;
  generatedAt?: string;
}

export function useTrailer(id: string | number | null, type: string, title?: string) {
  return useQuery<TrailerResponse>({
    queryKey: ['trailer', type, id],
    enabled: !!id && (type === 'movie' || type === 'tv'),
    queryFn: async () => {
      const res = await apiFetch(`/api/multi-api/trailer/${type}/${id}?title=${encodeURIComponent(title || '')}`);
      if (!res.ok) throw new Error('Failed to load trailer');
      const data = await res.json();
      
      // Handle old TMDB format (just trailers array) vs new multi-API format
      if (Array.isArray(data.trailers) && !data.primaryTrailer) {
        // Old format - transform it
        const tmdbTrailers = data.trailers;
        const trailers: TrailerItem[] = tmdbTrailers
          .filter((v: any) => (v.type === 'Trailer' || v.type === 'Teaser') && v.site === 'YouTube' && v.key)
          .map((v: any) => ({
            source: 'tmdb',
            platform: 'youtube',
            videoType: v.type.toLowerCase(),
            key: v.key,
            name: v.name,
            official: !!v.official,
            published_at: v.published_at || null,
            url: `https://www.youtube.com/watch?v=${v.key}`,
            embeddableUrl: `https://www.youtube.com/embed/${v.key}`,
            monetized: false,
            monetizationScore: v.official ? 0.6 : 0.2
          }));
        
        // Select primary trailer
        const primaryTrailer = trailers.find(t => t.videoType === 'trailer' && t.official) ||
                              trailers.find(t => t.videoType === 'trailer') ||
                              trailers.find(t => t.videoType === 'teaser') ||
                              trailers[0] || null;
        
        return {
          id: Number(id),
          type: type as 'movie' | 'tv',
          title,
          trailers,
          primaryTrailer,
          stats: { total: trailers.length, monetized: 0 }
        };
      }
      
      // New format - return as is
      return data;
    },
    staleTime: 1000 * 60 * 30,
  });
}

export default useTrailer;
