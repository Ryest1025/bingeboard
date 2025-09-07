import fetch from 'node-fetch';

interface WatchmodeSource {
  source_id: number;
  name: string;
  type: 'sub' | 'buy' | 'rent' | 'free';
  region: string;
  ios_url?: string;
  android_url?: string;
  web_url?: string;
  format: 'SD' | 'HD' | '4K';
  price?: number;
  seasons?: number[];
  episodes?: number[];
}

interface WatchmodeTitle {
  id: number;
  title: string;
  original_title?: string;
  plot_overview?: string;
  type: 'movie' | 'tv_series' | 'tv_miniseries' | 'tv_special';
  runtime_minutes?: number;
  year?: number;
  end_year?: number;
  release_date?: string;
  imdb_id?: string;
  tmdb_id?: number;
  tmdb_type?: 'movie' | 'tv';
  image_url?: string;
  backdrop_url?: string;
  trailer_url?: string;
  trailer_thumbnail?: string;
  critic_score?: number;
  user_rating?: number;
  us_rating?: string;
  genre_names?: string[];
  network_names?: string[];
  sources?: WatchmodeSource[];
}

interface WatchmodeSearchResponse {
  titles: WatchmodeTitle[];
  total_results: number;
  page: number;
  total_pages: number;
}

export class WatchmodeService {
  private static readonly BASE_URL = 'https://api.watchmode.com/v1';
  private static readonly API_KEY = process.env.WATCHMODE_API_KEY;

  private static async makeRequest(endpoint: string, params: Record<string, string> = {}): Promise<any> {
    if (!this.API_KEY) {
      throw new Error('WATCHMODE_API_KEY is not configured');
    }

    const url = new URL(`${this.BASE_URL}${endpoint}`);
    url.searchParams.append('apiKey', this.API_KEY);
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Watchmode API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  static async searchTitles(query: string, type?: 'movie' | 'tv_series'): Promise<WatchmodeSearchResponse> {
    const params: Record<string, string> = {
      search_field: 'name',
      search_value: query,
    };

    if (type) {
      params.types = type;
    }

    return this.makeRequest('/search/', params);
  }

  static async getTitleDetails(watchmodeId: number): Promise<WatchmodeTitle> {
    return this.makeRequest(`/title/${watchmodeId}/details/`);
  }

  static async getTitleSources(watchmodeId: number, region: string = 'US'): Promise<WatchmodeSource[]> {
    const response = await this.makeRequest(`/title/${watchmodeId}/sources/`, { region });
    return response.sources || [];
  }

  static async findByTmdbId(tmdbId: number, type: 'movie' | 'tv'): Promise<WatchmodeTitle | null> {
    try {
      const searchType = type === 'tv' ? 'tv_series' : 'movie';
      const response = await this.makeRequest('/search/', {
        search_field: 'tmdb_id',
        search_value: tmdbId.toString(),
        types: searchType
      });

      return response.titles?.[0] || null;
    } catch (error) {
      // Silent fallback - return null without logging
      return null;
    }
  }

  static async getStreamingAvailability(tmdbId: number, type: 'movie' | 'tv'): Promise<{
    streamingPlatforms: Array<{
      provider_id: number;
      provider_name: string;
      logo_path?: string;
      type: 'sub' | 'buy' | 'rent' | 'free';
      web_url?: string;
      ios_url?: string;
      android_url?: string;
      price?: number;
      format: string;
    }>;
    watchmodeId?: number;
  }> {
    try {
      // First, find the Watchmode title
      const watchmodeTitle = await this.findByTmdbId(tmdbId, type);
      if (!watchmodeTitle) {
        return { streamingPlatforms: [] };
      }

      // Get detailed sources with error handling
      let sources: WatchmodeSource[] = [];
      try {
        sources = await this.getTitleSources(watchmodeTitle.id);
      } catch (sourcesError) {
        // Silent fallback if sources fail
        return { streamingPlatforms: [] };
      }
      
      // Transform Watchmode sources to our format
      const streamingPlatforms = sources
        .filter(source => source.region === 'US') // Focus on US availability
        .map(source => ({
          provider_id: source.source_id,
          provider_name: source.name,
          type: source.type,
          web_url: source.web_url,
          ios_url: source.ios_url,
          android_url: source.android_url,
          price: source.price,
          format: source.format,
          // We'll need to map these to TMDB logo paths for consistency
          logo_path: this.getProviderLogo(source.name)
        }));

      return {
        streamingPlatforms,
        watchmodeId: watchmodeTitle.id
      };
    } catch (error) {
      // Silent fallback - no logging to prevent spam
      return { streamingPlatforms: [] };
    }
  }

  // Map Watchmode provider names to TMDB logo paths for consistency
  private static getProviderLogo(providerName: string): string | undefined {
    const logoMap: Record<string, string> = {
      'Netflix': '/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg',
      'Amazon Prime Video': '/emthp39XA2YScoYL1p0sdbAH2WA.jpg',
      'Disney Plus': '/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg',
      'Hulu': '/giwM8XX4CTGNcfbhcQRKqZbzkZK.jpg',
      'HBO Max': '/nmU4theeWOGDkkDrqPnZwdGZqsU.jpg',
      'Apple TV Plus': '/peURlLlr8jggOwK53fJ5wdQl05y.jpg',
      'Paramount Plus': '/fi83B1oztoS47xxcemFdPMhIzK8.jpg',
      'Peacock': '/xbhHHa1YgtpwhC8lb1NQ3ACVcLd.jpg',
      'YouTube': '/oIkQkEkwfmcG7IGpRR1NB8frZ2z.jpg',
      'Crunchyroll': '/8VCV78prwd9QzZnEn4ReKE5hbk5.jpg'
    };

    return logoMap[providerName];
  }

  static async getTrendingTitles(type?: 'movie' | 'tv_series', limit: number = 20): Promise<WatchmodeTitle[]> {
    try {
      const params: Record<string, string> = {
        sort_by: 'popularity_desc',
        limit: limit.toString()
      };

      if (type) {
        params.types = type;
      }

      const response = await this.makeRequest('/list-titles/', params);
      return response.titles || [];
    } catch (error) {
      console.error('Error getting trending titles from Watchmode:', error);
      return [];
    }
  }

  static async getNewReleasesOnPlatform(sourceId: number, limit: number = 20): Promise<WatchmodeTitle[]> {
    try {
      const response = await this.makeRequest('/releases/', {
        source_ids: sourceId.toString(),
        limit: limit.toString()
      });
      return response.releases || [];
    } catch (error) {
      console.error(`Error getting new releases for source ${sourceId}:`, error);
      return [];
    }
  }

  // Popular streaming service IDs on Watchmode
  static getPopularSourceIds(): Record<string, number> {
    return {
      'Netflix': 203,
      'Amazon Prime Video': 26,
      'Disney Plus': 372,
      'Hulu': 157,
      'HBO Max': 384,
      'Apple TV Plus': 371,
      'Paramount Plus': 387,
      'Peacock': 386,
      'YouTube Premium': 188,
      'Crunchyroll': 23
    };
  }

  static async getAvailabilityForMultipleTitles(tmdbIds: Array<{ id: number; type: 'movie' | 'tv' }>): Promise<Map<number, any>> {
    const results = new Map();
    
    // Process in batches to avoid rate limiting
    const batchSize = 5;
    for (let i = 0; i < tmdbIds.length; i += batchSize) {
      const batch = tmdbIds.slice(i, i + batchSize);
      const promises = batch.map(async ({ id, type }) => {
        const availability = await this.getStreamingAvailability(id, type);
        return { tmdbId: id, availability };
      });

      const batchResults = await Promise.allSettled(promises);
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.set(batch[index].id, result.value.availability);
        }
      });

      // Add small delay between batches
      if (i + batchSize < tmdbIds.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return results;
  }
}