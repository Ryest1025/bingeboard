/**
 * Streaming Service
 * Handles "Watch Now" functionality with intelligent platform detection
 */

import { searchStreamingAvailability, getStreamingByImdbId, type StreamingLocation } from './utellyApi';

export interface StreamingPlatform {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  color: string;
  baseUrl: string;
  searchUrl: string;
  isSubscription: boolean;
  isRental: boolean;
  priority: number; // Lower number = higher priority
}

export interface WatchOption {
  platform: StreamingPlatform;
  url: string;
  type: 'subscription' | 'rental' | 'purchase' | 'free';
  price?: string;
  quality?: string;
}

export interface MediaItem {
  id: string;
  title?: string;
  name?: string;
  type: 'movie' | 'tv';
  imdb_id?: string;
  release_date?: string;
  first_air_date?: string;
}

/**
 * Supported streaming platforms with metadata
 */
export const STREAMING_PLATFORMS: Record<string, StreamingPlatform> = {
  netflix: {
    id: 'netflix',
    name: 'netflix',
    displayName: 'Netflix',
    icon: '🔴',
    color: '#E50914',
    baseUrl: 'https://www.netflix.com',
    searchUrl: 'https://www.netflix.com/search?q=',
    isSubscription: true,
    isRental: false,
    priority: 1,
  },
  hulu: {
    id: 'hulu',
    name: 'hulu',
    displayName: 'Hulu',
    icon: '🟢',
    color: '#1CE783',
    baseUrl: 'https://www.hulu.com',
    searchUrl: 'https://www.hulu.com/search?q=',
    isSubscription: true,
    isRental: false,
    priority: 2,
  },
  amazon_prime: {
    id: 'amazon_prime',
    name: 'amazon_prime',
    displayName: 'Prime Video',
    icon: '🔵',
    color: '#00A8E1',
    baseUrl: 'https://www.amazon.com/prime-video',
    searchUrl: 'https://www.amazon.com/s?k=',
    isSubscription: true,
    isRental: true,
    priority: 3,
  },
  disney_plus: {
    id: 'disney_plus',
    name: 'disney_plus',
    displayName: 'Disney+',
    icon: '⭐',
    color: '#113CCF',
    baseUrl: 'https://www.disneyplus.com',
    searchUrl: 'https://www.disneyplus.com/search?q=',
    isSubscription: true,
    isRental: false,
    priority: 4,
  },
  hbo_max: {
    id: 'hbo_max',
    name: 'hbo_max',
    displayName: 'Max',
    icon: '🟣',
    color: '#8C00FF',
    baseUrl: 'https://www.max.com',
    searchUrl: 'https://www.max.com/search?q=',
    isSubscription: true,
    isRental: false,
    priority: 5,
  },
  apple_tv_plus: {
    id: 'apple_tv_plus',
    name: 'apple_tv_plus',
    displayName: 'Apple TV+',
    icon: '🍎',
    color: '#000000',
    baseUrl: 'https://tv.apple.com',
    searchUrl: 'https://tv.apple.com/search?term=',
    isSubscription: true,
    isRental: true,
    priority: 6,
  },
  paramount_plus: {
    id: 'paramount_plus',
    name: 'paramount_plus',
    displayName: 'Paramount+',
    icon: '⛰️',
    color: '#0064FF',
    baseUrl: 'https://www.paramountplus.com',
    searchUrl: 'https://www.paramountplus.com/search/?query=',
    isSubscription: true,
    isRental: false,
    priority: 7,
  },
  peacock: {
    id: 'peacock',
    name: 'peacock',
    displayName: 'Peacock',
    icon: '🦚',
    color: '#7B68EE',
    baseUrl: 'https://www.peacocktv.com',
    searchUrl: 'https://www.peacocktv.com/search?query=',
    isSubscription: true,
    isRental: false,
    priority: 8,
  },
  youtube: {
    id: 'youtube',
    name: 'youtube',
    displayName: 'YouTube',
    icon: '▶️',
    color: '#FF0000',
    baseUrl: 'https://www.youtube.com',
    searchUrl: 'https://www.youtube.com/results?search_query=',
    isSubscription: false,
    isRental: true,
    priority: 9,
  },
  vudu: {
    id: 'vudu',
    name: 'vudu',
    displayName: 'Vudu',
    icon: '🎬',
    color: '#3B82F6',
    baseUrl: 'https://www.vudu.com',
    searchUrl: 'https://www.vudu.com/content/search?query=',
    isSubscription: false,
    isRental: true,
    priority: 10,
  },
  tubi: {
    id: 'tubi',
    name: 'tubi',
    displayName: 'Tubi',
    icon: '📺',
    color: '#FA541C',
    baseUrl: 'https://tubitv.com',
    searchUrl: 'https://tubitv.com/search/',
    isSubscription: false,
    isRental: false,
    priority: 11,
  },
  crackle: {
    id: 'crackle',
    name: 'crackle',
    displayName: 'Crackle',
    icon: '⚡',
    color: '#FFD700',
    baseUrl: 'https://www.crackle.com',
    searchUrl: 'https://www.crackle.com/search?query=',
    isSubscription: false,
    isRental: false,
    priority: 12,
  },
};

class StreamingService {
  private userPlatforms: string[] = [];
  private preferredPlatforms: string[] = ['netflix', 'hulu', 'amazon_prime', 'disney_plus'];

  /**
   * Set user's preferred streaming platforms
   */
  setUserPlatforms(platforms: string[]): void {
    this.userPlatforms = platforms;
    localStorage.setItem('bingeboard_user_platforms', JSON.stringify(platforms));
  }

  /**
   * Get user's preferred streaming platforms
   */
  getUserPlatforms(): string[] {
    if (this.userPlatforms.length === 0) {
      try {
        const stored = localStorage.getItem('bingeboard_user_platforms');
        this.userPlatforms = stored ? JSON.parse(stored) : this.preferredPlatforms;
      } catch (error) {
        console.warn('Error loading user platforms:', error);
        this.userPlatforms = this.preferredPlatforms;
      }
    }
    return this.userPlatforms;
  }

  /**
   * Normalize platform name from Utelly API
   */
  private normalizePlatformName(utellyName: string): string {
    const name = utellyName.toLowerCase();
    
    // Handle common variations
    const platformMap: Record<string, string> = {
      'amazon_prime_video': 'amazon_prime',
      'amazon_video': 'amazon_prime',
      'prime_video': 'amazon_prime',
      'hbo_max': 'hbo_max',
      'hbomax': 'hbo_max',
      'disney_plus': 'disney_plus',
      'disneyplus': 'disney_plus',
      'apple_tv': 'apple_tv_plus',
      'appletv': 'apple_tv_plus',
      'paramount': 'paramount_plus',
      'youtube_movies': 'youtube',
      'google_play': 'youtube',
    };

    return platformMap[name] || name;
  }

  /**
   * Convert Utelly streaming location to watch option
   */
  private convertToWatchOption(location: StreamingLocation): WatchOption | null {
    const normalizedName = this.normalizePlatformName(location.name);
    const platform = STREAMING_PLATFORMS[normalizedName];

    if (!platform) {
      console.warn('Unknown platform:', location.name);
      return null;
    }

    // Determine watch type based on platform and URL patterns
    let type: WatchOption['type'] = 'subscription';
    if (location.url.includes('rent') || location.url.includes('buy')) {
      type = 'rental';
    } else if (platform.isRental && !platform.isSubscription) {
      type = 'rental';
    } else if (!platform.isSubscription && !platform.isRental) {
      type = 'free';
    }

    return {
      platform,
      url: location.url,
      type,
    };
  }

  /**
   * Get streaming options for a media item
   */
  async getStreamingOptions(media: MediaItem): Promise<WatchOption[]> {
    const title = media.title || media.name || '';
    
    try {
      // Try IMDB ID lookup first if available
      let streamingData;
      if (media.imdb_id) {
        streamingData = await getStreamingByImdbId(media.imdb_id);
      }
      
      // Fallback to title search
      if (!streamingData || streamingData.results.length === 0) {
        streamingData = await searchStreamingAvailability(title);
      }

      if (!streamingData || streamingData.results.length === 0) {
        return this.getDefaultSearchOptions(media);
      }

      // Convert to watch options
      const watchOptions: WatchOption[] = [];
      const seenPlatforms = new Set<string>();

      streamingData.results.forEach(result => {
        result.locations.forEach(location => {
          const watchOption = this.convertToWatchOption(location);
          if (watchOption && !seenPlatforms.has(watchOption.platform.id)) {
            watchOptions.push(watchOption);
            seenPlatforms.add(watchOption.platform.id);
          }
        });
      });

      // Sort by user preference and platform priority
      return this.sortWatchOptions(watchOptions);
    } catch (error) {
      console.error('Error getting streaming options:', error);
      return this.getDefaultSearchOptions(media);
    }
  }

  /**
   * Get default search options when streaming data is not available
   */
  private getDefaultSearchOptions(media: MediaItem): WatchOption[] {
    const title = media.title || media.name || '';
    const userPlatforms = this.getUserPlatforms();
    
    return userPlatforms.slice(0, 3).map(platformId => {
      const platform = STREAMING_PLATFORMS[platformId];
      if (!platform) return null;

      return {
        platform,
        url: platform.searchUrl + encodeURIComponent(title),
        type: platform.isSubscription ? 'subscription' as const : 'rental' as const,
      };
    }).filter(Boolean) as WatchOption[];
  }

  /**
   * Sort watch options by user preference and platform priority
   */
  private sortWatchOptions(options: WatchOption[]): WatchOption[] {
    const userPlatforms = this.getUserPlatforms();
    
    return options.sort((a, b) => {
      // Prioritize user's preferred platforms
      const aUserIndex = userPlatforms.indexOf(a.platform.id);
      const bUserIndex = userPlatforms.indexOf(b.platform.id);
      
      if (aUserIndex !== -1 && bUserIndex !== -1) {
        return aUserIndex - bUserIndex;
      }
      if (aUserIndex !== -1) return -1;
      if (bUserIndex !== -1) return 1;
      
      // Prioritize subscription over rental
      if (a.type === 'subscription' && b.type !== 'subscription') return -1;
      if (b.type === 'subscription' && a.type !== 'subscription') return 1;
      
      // Prioritize free content
      if (a.type === 'free' && b.type !== 'free') return -1;
      if (b.type === 'free' && a.type !== 'free') return 1;
      
      // Use platform priority
      return a.platform.priority - b.platform.priority;
    });
  }

  /**
   * Get the best watch option (primary recommendation)
   */
  async getBestWatchOption(media: MediaItem): Promise<WatchOption | null> {
    const options = await this.getStreamingOptions(media);
    return options.length > 0 ? options[0] : null;
  }

  /**
   * Launch watching experience
   */
  async launchWatch(media: MediaItem): Promise<boolean> {
    try {
      const bestOption = await this.getBestWatchOption(media);
      
      if (!bestOption) {
        // Fallback to generic search
        const title = media.title || media.name || '';
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(title + ' watch online')}`;
        window.open(searchUrl, '_blank');
        return true;
      }

      // Open the streaming platform
      window.open(bestOption.url, '_blank');
      
      // Track usage for better recommendations
      this.trackPlatformUsage(bestOption.platform.id);
      
      return true;
    } catch (error) {
      console.error('Error launching watch:', error);
      return false;
    }
  }

  /**
   * Track platform usage to improve recommendations
   */
  private trackPlatformUsage(platformId: string): void {
    try {
      const usage = this.getPlatformUsage();
      usage[platformId] = (usage[platformId] || 0) + 1;
      localStorage.setItem('bingeboard_platform_usage', JSON.stringify(usage));
    } catch (error) {
      console.warn('Error tracking platform usage:', error);
    }
  }

  /**
   * Get platform usage statistics
   */
  private getPlatformUsage(): Record<string, number> {
    try {
      const stored = localStorage.getItem('bingeboard_platform_usage');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      return {};
    }
  }

  /**
   * Get platform recommendations based on usage
   */
  getRecommendedPlatforms(): StreamingPlatform[] {
    const usage = this.getPlatformUsage();
    const userPlatforms = this.getUserPlatforms();
    
    // Combine user platforms with usage data
    const platformsWithScore = Object.values(STREAMING_PLATFORMS).map(platform => ({
      platform,
      score: (usage[platform.id] || 0) + (userPlatforms.includes(platform.id) ? 100 : 0),
    }));

    return platformsWithScore
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(item => item.platform);
  }

  /**
   * Search for content across multiple platforms
   */
  async searchAcrossPlatforms(query: string): Promise<{ platform: StreamingPlatform; url: string }[]> {
    const platforms = this.getRecommendedPlatforms();
    
    return platforms.map(platform => ({
      platform,
      url: platform.searchUrl + encodeURIComponent(query),
    }));
  }

  /**
   * Check if content is available on user's platforms
   */
  async isAvailableOnUserPlatforms(media: MediaItem): Promise<boolean> {
    const options = await this.getStreamingOptions(media);
    const userPlatforms = this.getUserPlatforms();
    
    return options.some(option => userPlatforms.includes(option.platform.id));
  }
}

// Export singleton instance
export const streamingService = new StreamingService();

// Export convenience functions
export const {
  setUserPlatforms,
  getUserPlatforms,
  getStreamingOptions,
  getBestWatchOption,
  launchWatch,
  getRecommendedPlatforms,
  searchAcrossPlatforms,
  isAvailableOnUserPlatforms,
} = streamingService;