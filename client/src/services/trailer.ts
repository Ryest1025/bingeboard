/**
 * Trailer Service
 * Handles trailer discovery and playback functionality
 */

export interface MediaItem {
  id: string;
  title?: string;
  name?: string;
  type: 'movie' | 'tv';
  imdb_id?: string;
  release_date?: string;
  first_air_date?: string;
}

export interface TrailerResult {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  size: number;
  url: string;
  thumbnail: string;
  duration?: string;
  published_at?: string;
}

export interface TrailerSource {
  name: string;
  priority: number;
  searchFunction: (media: MediaItem) => Promise<TrailerResult[]>;
}

class TrailerService {
  private readonly YOUTUBE_BASE_URL = 'https://www.youtube.com';
  private readonly YOUTUBE_EMBED_URL = 'https://www.youtube.com/embed';
  private readonly YOUTUBE_THUMBNAIL_URL = 'https://img.youtube.com/vi';

  /**
   * Search for trailers using TMDB API
   */
  private async searchTMDBTrailers(media: MediaItem): Promise<TrailerResult[]> {
    try {
      const endpoint = `/api/multi-api/trailer/${media.type}/${media.id}`;
      const params = new URLSearchParams();
      
      if (media.title) params.append('title', media.title);
      if (media.name) params.append('title', media.name);

      const url = params.toString() ? `${endpoint}?${params}` : endpoint;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }

      const data = await response.json();
      return this.formatTMDBResults(data.results || []);
    } catch (error) {
      console.error('Error fetching TMDB trailers:', error);
      return [];
    }
  }

  /**
   * Format TMDB trailer results
   */
  private formatTMDBResults(results: any[]): TrailerResult[] {
    return results
      .filter(video => video.site === 'YouTube' && video.type === 'Trailer')
      .map(video => ({
        id: video.id,
        key: video.key,
        name: video.name,
        site: video.site,
        type: video.type,
        size: video.size || 1080,
        url: `${this.YOUTUBE_BASE_URL}/watch?v=${video.key}`,
        thumbnail: `${this.YOUTUBE_THUMBNAIL_URL}/${video.key}/maxresdefault.jpg`,
        published_at: video.published_at,
      }))
      .sort((a, b) => {
        // Prioritize official trailers
        if (a.name.toLowerCase().includes('official') && !b.name.toLowerCase().includes('official')) {
          return -1;
        }
        if (b.name.toLowerCase().includes('official') && !a.name.toLowerCase().includes('official')) {
          return 1;
        }
        
        // Prioritize by size (quality)
        return b.size - a.size;
      });
  }

  /**
   * Search YouTube directly as fallback
   */
  private async searchYouTubeTrailers(media: MediaItem): Promise<TrailerResult[]> {
    const title = media.title || media.name || '';
    const year = this.extractYear(media.release_date || media.first_air_date);
    const mediaType = media.type === 'tv' ? 'trailer' : 'movie trailer';
    
    const searchQuery = `${title} ${year} ${mediaType} official`;
    
    try {
      // Use YouTube search through our API proxy
      const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(searchQuery)}&type=video&part=snippet&maxResults=5`);
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json();
      return this.formatYouTubeResults(data.items || []);
    } catch (error) {
      console.error('Error fetching YouTube trailers:', error);
      return this.generateFallbackSearch(media);
    }
  }

  /**
   * Format YouTube search results
   */
  private formatYouTubeResults(items: any[]): TrailerResult[] {
    return items.map(item => ({
      id: item.id.videoId,
      key: item.id.videoId,
      name: item.snippet.title,
      site: 'YouTube',
      type: 'Trailer',
      size: 1080,
      url: `${this.YOUTUBE_BASE_URL}/watch?v=${item.id.videoId}`,
      thumbnail: item.snippet.thumbnails?.high?.url || `${this.YOUTUBE_THUMBNAIL_URL}/${item.id.videoId}/maxresdefault.jpg`,
      published_at: item.snippet.publishedAt,
    }));
  }

  /**
   * Generate fallback search URLs when API calls fail
   */
  private generateFallbackSearch(media: MediaItem): TrailerResult[] {
    const title = media.title || media.name || '';
    const year = this.extractYear(media.release_date || media.first_air_date);
    const mediaType = media.type === 'tv' ? 'trailer' : 'movie trailer';
    
    const searchQuery = `${title} ${year} ${mediaType} official`;
    const youtubeSearchUrl = `${this.YOUTUBE_BASE_URL}/results?search_query=${encodeURIComponent(searchQuery)}`;
    
    return [{
      id: 'fallback-search',
      key: 'fallback-search',
      name: `Search for "${title}" trailer`,
      site: 'YouTube',
      type: 'Search',
      size: 1080,
      url: youtubeSearchUrl,
      thumbnail: '/placeholder-trailer.jpg', // We'll need to add this placeholder
    }];
  }

  /**
   * Extract year from date string
   */
  private extractYear(dateString?: string): string {
    if (!dateString) return '';
    return new Date(dateString).getFullYear().toString();
  }

  /**
   * Get trailers for media item
   */
  async getTrailers(media: MediaItem): Promise<TrailerResult[]> {
    try {
      // Try TMDB first (most reliable)
      let trailers = await this.searchTMDBTrailers(media);
      
      // If no TMDB results, try YouTube search
      if (trailers.length === 0) {
        trailers = await this.searchYouTubeTrailers(media);
      }
      
      // Always provide fallback search option
      if (trailers.length === 0) {
        trailers = this.generateFallbackSearch(media);
      }

      return trailers.slice(0, 5); // Limit to 5 trailers
    } catch (error) {
      console.error('Error getting trailers:', error);
      return this.generateFallbackSearch(media);
    }
  }

  /**
   * Get the best trailer (primary recommendation)
   */
  async getBestTrailer(media: MediaItem): Promise<TrailerResult | null> {
    const trailers = await this.getTrailers(media);
    return trailers.length > 0 ? trailers[0] : null;
  }

  /**
   * Launch trailer playback
   */
  async launchTrailer(media: MediaItem, inModal: boolean = false): Promise<boolean> {
    try {
      const bestTrailer = await this.getBestTrailer(media);
      
      if (!bestTrailer) {
        console.warn('No trailer found for media:', media.title || media.name);
        return false;
      }

      if (inModal) {
        // Trigger modal with embed URL
        this.openTrailerModal(bestTrailer);
      } else {
        // Open in new tab
        window.open(bestTrailer.url, '_blank');
      }

      return true;
    } catch (error) {
      console.error('Error launching trailer:', error);
      return false;
    }
  }

  /**
   * Open trailer in modal (requires modal component integration)
   */
  private openTrailerModal(trailer: TrailerResult): void {
    // This would integrate with your modal system
    const event = new CustomEvent('openTrailerModal', {
      detail: {
        title: trailer.name,
        embedUrl: `${this.YOUTUBE_EMBED_URL}/${trailer.key}?autoplay=1&rel=0`,
        thumbnail: trailer.thumbnail,
      }
    });
    window.dispatchEvent(event);
  }

  /**
   * Get embed URL for trailer
   */
  getEmbedUrl(trailerKey: string, autoplay: boolean = false): string {
    const params = new URLSearchParams({
      rel: '0',
      modestbranding: '1',
      ...(autoplay && { autoplay: '1' }),
    });
    
    return `${this.YOUTUBE_EMBED_URL}/${trailerKey}?${params}`;
  }

  /**
   * Get thumbnail URL for trailer
   */
  getThumbnailUrl(trailerKey: string, quality: 'default' | 'medium' | 'high' | 'maxres' = 'maxres'): string {
    const qualityMap = {
      default: 'default',
      medium: 'mqdefault',
      high: 'hqdefault',
      maxres: 'maxresdefault',
    };
    
    return `${this.YOUTUBE_THUMBNAIL_URL}/${trailerKey}/${qualityMap[quality]}.jpg`;
  }

  /**
   * Check if media has trailers available
   */
  async hasTrailers(media: MediaItem): Promise<boolean> {
    try {
      const trailers = await this.getTrailers(media);
      return trailers.length > 0 && trailers[0].key !== 'fallback-search';
    } catch (error) {
      console.error('Error checking for trailers:', error);
      return false;
    }
  }

  /**
   * Search for specific trailer types
   */
  async getTrailersByType(media: MediaItem, type: 'Trailer' | 'Teaser' | 'Clip' | 'Featurette'): Promise<TrailerResult[]> {
    const allTrailers = await this.getTrailers(media);
    return allTrailers.filter(trailer => 
      trailer.type === type || trailer.name.toLowerCase().includes(type.toLowerCase())
    );
  }

  /**
   * Get trailers with specific quality
   */
  async getTrailersByQuality(media: MediaItem, minSize: number = 720): Promise<TrailerResult[]> {
    const allTrailers = await this.getTrailers(media);
    return allTrailers.filter(trailer => trailer.size >= minSize);
  }

  /**
   * Preload trailer data for better performance
   */
  async preloadTrailers(mediaItems: MediaItem[]): Promise<Map<string, TrailerResult[]>> {
    const trailerMap = new Map<string, TrailerResult[]>();
    
    // Process in batches to avoid rate limiting
    const batchSize = 3;
    for (let i = 0; i < mediaItems.length; i += batchSize) {
      const batch = mediaItems.slice(i, i + batchSize);
      
      const promises = batch.map(async media => {
        const key = `${media.type}-${media.id}`;
        const trailers = await this.getTrailers(media);
        trailerMap.set(key, trailers);
        return { key, trailers };
      });
      
      await Promise.allSettled(promises);
      
      // Small delay between batches
      if (i + batchSize < mediaItems.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return trailerMap;
  }

  /**
   * Get cached trailer if available
   */
  getCachedTrailer(media: MediaItem): TrailerResult | null {
    try {
      const cacheKey = `trailer_${media.type}_${media.id}`;
      const cached = sessionStorage.getItem(cacheKey);
      
      if (cached) {
        const data = JSON.parse(cached);
        const cacheTime = data.timestamp;
        const now = Date.now();
        
        // Cache valid for 1 hour
        if (now - cacheTime < 3600000) {
          return data.trailer;
        }
      }
    } catch (error) {
      console.warn('Error reading trailer cache:', error);
    }
    
    return null;
  }

  /**
   * Cache trailer for better performance
   */
  private cacheTrailer(media: MediaItem, trailer: TrailerResult): void {
    try {
      const cacheKey = `trailer_${media.type}_${media.id}`;
      const cacheData = {
        trailer,
        timestamp: Date.now(),
      };
      
      sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Error caching trailer:', error);
    }
  }
}

// Export singleton instance
export const trailerService = new TrailerService();

// Export convenience functions
export const {
  getTrailers,
  getBestTrailer,
  launchTrailer,
  getEmbedUrl,
  getThumbnailUrl,
  hasTrailers,
  getTrailersByType,
  getTrailersByQuality,
  preloadTrailers,
  getCachedTrailer,
} = trailerService;