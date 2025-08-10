// Real streaming provider service using TMDB API
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

// Fetch real streaming providers for a specific show/movie
export async function fetchWatchProviders(
  mediaType: 'tv' | 'movie',
  id: number,
  region = 'US'
): Promise<StreamingProvider[]> {
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
}

// Add real streaming providers to content items
export async function addRealStreamingData(item: any): Promise<any> {
  if (!item.id) {
    return item;
  }

  // Determine media type
  const mediaType = item.title ? 'movie' : 'tv';

  try {
    const providers = await fetchWatchProviders(mediaType, item.id);

    return {
      ...item,
      watchProviders: providers,
      streamingProviders: providers,
      streamingPlatforms: providers
    };
  } catch (error) {
    console.error('Error adding streaming data to item:', error);
    return item;
  }
}

// Batch fetch streaming data for multiple items
export async function addStreamingDataBatch(items: any[]): Promise<any[]> {
  const promises = items.map(item => addRealStreamingData(item));
  return Promise.all(promises);
}
