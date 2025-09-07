// hooks/useTrailer.ts - fetch aggregated trailer data via multi-api endpoint
import { useQuery } from '@tanstack/react-query';

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
      const res = await fetch(`/api/multi-api/trailer/${type}/${id}?title=${encodeURIComponent(title || '')}`);
      if (!res.ok) throw new Error('Failed to load trailer');
      return res.json();
    },
    staleTime: 1000 * 60 * 30,
  });
}

export default useTrailer;
