import { useQuery } from '@tanstack/react-query';

export interface StreamingProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority?: number;
}

export interface WatchProvidersResponse {
  id: number;
  results: {
    [region: string]: {
      link?: string;
      flatrate?: StreamingProvider[];
      rent?: StreamingProvider[];
      buy?: StreamingProvider[];
    };
  };
}

export function useWatchProviders(mediaType: 'tv' | 'movie', id: number, region = 'US') {
  return useQuery({
    queryKey: ['watch-providers', mediaType, id, region],
    queryFn: async (): Promise<StreamingProvider[]> => {
      if (!id) return [];

      try {
        const response = await fetch(`/api/tmdb/${mediaType}/${id}/watch/providers?region=${region}`);
        if (!response.ok) {
          console.warn(`Failed to fetch watch providers for ${mediaType} ${id}:`, response.statusText);
          return [];
        }

        const data: WatchProvidersResponse = await response.json();
        const regionData = data.results[region];

        if (!regionData) {
          return [];
        }

        // Prioritize flatrate (subscription) providers, then rent/buy
        const providers = [
          ...(regionData.flatrate || []),
          ...(regionData.rent || []),
          ...(regionData.buy || [])
        ];

        // Remove duplicates based on provider_id
        const uniqueProviders = providers.filter(
          (provider, index, self) =>
            self.findIndex(p => p.provider_id === provider.provider_id) === index
        );

        return uniqueProviders;
      } catch (error) {
        console.error(`Error fetching watch providers for ${mediaType} ${id}:`, error);
        return [];
      }
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60 * 24, // 24 hours (renamed from cacheTime)
  });
}
