// Real streaming provider service using comprehensive APIs (TMDB + Utelly + Watchmode)
export interface StreamingProvider {
  provider_id: number;
  provider_name: string;
  name?: string; // For compatibility
  logo_path?: string;
  logoPath?: string; // For compatibility
  type?: 'sub' | 'buy' | 'rent' | 'free';
  web_url?: string;
  source?: 'tmdb' | 'watchmode' | 'utelly';
  affiliate_supported?: boolean;
}

export interface ComprehensiveStreamingResponse {
  tmdbId: number;
  title: string;
  platforms: StreamingProvider[];
  totalPlatforms: number;
  affiliatePlatforms: number;
  premiumPlatforms: number;
  freePlatforms: number;
  sources: {
    tmdb: boolean;
    watchmode: boolean;
    utelly: boolean;
  };
}

// Fetch real streaming providers using comprehensive API
export async function fetchComprehensiveStreamingData(
  mediaType: 'tv' | 'movie', 
  id: number,
  title: string,
  imdbId?: string
): Promise<StreamingProvider[]> {
  try {
    const params = new URLSearchParams({
      title,
      ...(imdbId && { imdbId })
    });
    
    const response = await fetch(`/api/streaming/comprehensive/${mediaType}/${id}?${params}`);
    if (!response.ok) {
      console.warn(`Failed to fetch comprehensive streaming data for ${mediaType} ${id}:`, response.statusText);
      return [];
    }
    
    const data: ComprehensiveStreamingResponse = await response.json();
    
    // Ensure compatibility with existing components
    return data.platforms.map(provider => ({
      ...provider,
      name: provider.name || provider.provider_name, // For ContentCard compatibility
      logoPath: provider.logo_path ? `https://image.tmdb.org/t/p/w45${provider.logo_path}` : undefined // For discover page compatibility
    }));
  } catch (error) {
    console.error(`Error fetching comprehensive streaming data for ${mediaType} ${id}:`, error);
    return [];
  }
}

// Add real streaming providers to content items
export async function addRealStreamingData(item: any): Promise<any> {
  if (!item.id || (!item.title && !item.name)) {
    return item;
  }
  
  // Determine media type and title
  const mediaType = item.title ? 'movie' : 'tv';
  const title = item.title || item.name;
  
  try {
    const providers = await fetchComprehensiveStreamingData(
      mediaType, 
      item.id, 
      title,
      item.imdb_id || item.external_ids?.imdb_id
    );
    
    return {
      ...item,
      watchProviders: providers,
      streamingProviders: providers,
      streamingPlatforms: providers
    };
  } catch (error) {
    console.error('Error adding real streaming data to item:', error);
    return item;
  }
}

// Batch fetch streaming data for multiple items
export async function addStreamingDataBatch(items: any[]): Promise<any[]> {
  // Process in smaller batches to avoid overwhelming the API
  const batchSize = 5;
  const results: any[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchPromises = batch.map(item => addRealStreamingData(item));
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Small delay to be respectful to APIs
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
}

// Legacy function name for compatibility - now uses real data
export async function addMockStreamingData(item: any) {
  // Return real streaming data instead of mock data
  return await addRealStreamingData(item);
}
