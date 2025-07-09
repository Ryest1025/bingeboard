import { storage } from '../storage';
import type { 
  InsertStreamingIntegration, 
  InsertViewingHistory, 
  StreamingIntegration,
  ViewingHistory 
} from '@shared/schema';
import crypto from 'crypto';

// Encryption for storing sensitive tokens
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'development-key-32-chars-long!!';

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text: string): string {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = textParts.join(':');
  const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export class StreamingService {
  // Platform configurations
  private static platformConfigs = {
    netflix: {
      name: 'Netflix',
      authUrl: 'https://www.netflix.com/oauth/authorize',
      tokenUrl: 'https://api.netflix.com/oauth/token',
      apiUrl: 'https://api.netflix.com/v1',
      scopes: ['viewing_history', 'user_profile']
    },
    hulu: {
      name: 'Hulu',
      authUrl: 'https://auth.hulu.com/oauth/authorize',
      tokenUrl: 'https://auth.hulu.com/oauth/token',
      apiUrl: 'https://api.hulu.com/v1',
      scopes: ['viewing_activity', 'profile']
    },
    disney_plus: {
      name: 'Disney+',
      authUrl: 'https://api.disney.com/oauth/authorize',
      tokenUrl: 'https://api.disney.com/oauth/token',
      apiUrl: 'https://api.disney.com/v1',
      scopes: ['viewing_history']
    },
    amazon_prime: {
      name: 'Amazon Prime Video',
      authUrl: 'https://api.amazon.com/auth/o2/authorize',
      tokenUrl: 'https://api.amazon.com/auth/o2/token',
      apiUrl: 'https://api.amazon.com/v1',
      scopes: ['profile', 'viewing_activity']
    }
  };

  static getSupportedPlatforms() {
    return Object.keys(this.platformConfigs);
  }

  static getPlatformConfig(platform: string) {
    return this.platformConfigs[platform as keyof typeof this.platformConfigs];
  }

  // Generate OAuth URL for platform authentication
  static generateAuthUrl(platform: string, userId: string, redirectUri: string): string {
    const config = this.getPlatformConfig(platform);
    if (!config) throw new Error(`Unsupported platform: ${platform}`);

    const clientId = process.env[`${platform.toUpperCase()}_CLIENT_ID`];
    if (!clientId) throw new Error(`Platform ${platform} requires OAuth credentials. Please configure ${platform.toUpperCase()}_CLIENT_ID and ${platform.toUpperCase()}_CLIENT_SECRET environment variables.`);

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: config.scopes.join(' '),
      state: `${userId}:${platform}` // Include user and platform info
    });

    return `${config.authUrl}?${params.toString()}`;
  }

  // Exchange OAuth code for access token
  static async exchangeCodeForToken(
    platform: string, 
    code: string, 
    redirectUri: string
  ): Promise<{ accessToken: string; refreshToken?: string; expiresIn?: number }> {
    const config = this.getPlatformConfig(platform);
    if (!config) throw new Error(`Unsupported platform: ${platform}`);

    const clientId = process.env[`${platform.toUpperCase()}_CLIENT_ID`];
    const clientSecret = process.env[`${platform.toUpperCase()}_CLIENT_SECRET`];
    
    if (!clientId || !clientSecret) {
      throw new Error(`Missing OAuth credentials for ${platform}`);
    }

    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri
      })
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed for ${platform}: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in
    };
  }

  // Store integration credentials
  static async storeIntegration(
    userId: string, 
    platform: string, 
    accessToken: string, 
    refreshToken?: string, 
    expiresIn?: number
  ): Promise<StreamingIntegration> {
    const encryptedAccessToken = encrypt(accessToken);
    const encryptedRefreshToken = refreshToken ? encrypt(refreshToken) : undefined;
    
    const integration: InsertStreamingIntegration = {
      userId,
      platform,
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
      tokenExpires: expiresIn ? new Date(Date.now() + expiresIn * 1000) : undefined,
      isActive: true,
      lastSync: new Date()
    };

    return await storage.createStreamingIntegration(integration);
  }

  // Fetch viewing history from platform API
  static async fetchViewingHistory(
    userId: string, 
    platform: string, 
    limit: number = 100
  ): Promise<ViewingHistory[]> {
    const integration = await storage.getStreamingIntegration(userId, platform);
    if (!integration || !integration.isActive) {
      throw new Error(`No active integration found for ${platform}`);
    }

    const config = this.getPlatformConfig(platform);
    if (!config) throw new Error(`Unsupported platform: ${platform}`);

    // Decrypt access token
    const accessToken = decrypt(integration.accessToken!);

    // This is a generic implementation - each platform would have specific API calls
    const response = await fetch(`${config.apiUrl}/viewing-history?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, try to refresh
        if (integration.refreshToken) {
          await this.refreshToken(userId, platform);
          return this.fetchViewingHistory(userId, platform, limit); // Retry
        } else {
          throw new Error(`Authentication expired for ${platform}`);
        }
      }
      throw new Error(`Failed to fetch viewing history from ${platform}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Convert platform-specific data to our format
    const viewingHistoryRecords: InsertViewingHistory[] = data.items?.map((item: any) => ({
      userId,
      showId: null, // Will be resolved later by matching with TMDB
      platform,
      watchedAt: new Date(item.watched_at || item.timestamp),
      watchDuration: item.duration_minutes || item.watch_time,
      totalDuration: item.total_duration || item.episode_length,
      completionPercentage: item.completion_percentage || (item.watch_time / item.total_duration),
      episodeNumber: item.episode_number,
      seasonNumber: item.season_number,
      userRating: item.user_rating,
      platformData: item // Store raw platform data
    })) || [];

    // Store in database
    const storedRecords = [];
    for (let i = 0; i < viewingHistoryRecords.length; i++) {
      const record = viewingHistoryRecords[i];
      const originalItem = data.items[i];
      
      try {
        // Try to match show with our database using title
        if (originalItem.title) {
          const matchedShow = await storage.getShowByTitle(originalItem.title);
          if (matchedShow) {
            record.showId = matchedShow.id;
          }
        }
        
        const stored = await storage.createViewingHistory(record);
        storedRecords.push(stored);
      } catch (error) {
        console.error('Error storing viewing history record:', error);
      }
    }

    // Update last sync time
    await storage.updateStreamingIntegration(integration.id, { lastSync: new Date() });

    return storedRecords;
  }

  // Refresh expired tokens
  static async refreshToken(userId: string, platform: string): Promise<void> {
    const integration = await storage.getStreamingIntegration(userId, platform);
    if (!integration?.refreshToken) {
      throw new Error(`No refresh token available for ${platform}`);
    }

    const config = this.getPlatformConfig(platform);
    if (!config) throw new Error(`Unsupported platform: ${platform}`);

    const clientId = process.env[`${platform.toUpperCase()}_CLIENT_ID`];
    const clientSecret = process.env[`${platform.toUpperCase()}_CLIENT_SECRET`];
    
    if (!clientId || !clientSecret) {
      throw new Error(`Missing OAuth credentials for ${platform}`);
    }

    const refreshToken = decrypt(integration.refreshToken);

    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed for ${platform}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Update stored tokens
    await storage.updateStreamingIntegration(integration.id, {
      accessToken: encrypt(data.access_token),
      refreshToken: data.refresh_token ? encrypt(data.refresh_token) : integration.refreshToken,
      tokenExpires: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined,
      lastSync: new Date()
    });
  }

  // Analyze viewing patterns for recommendations
  static async analyzeViewingPatterns(userId: string): Promise<{
    favoriteGenres: string[];
    preferredPlatforms: string[];
    viewingTimes: string[];
    completionRate: number;
    averageRating: number;
  }> {
    const viewingHistory = await storage.getUserViewingHistory(userId);
    
    if (!viewingHistory.length) {
      return {
        favoriteGenres: [],
        preferredPlatforms: [],
        viewingTimes: [],
        completionRate: 0,
        averageRating: 0
      };
    }

    // Analyze genres from watched shows
    const genreCounts: Record<string, number> = {};
    const platformCounts: Record<string, number> = {};
    const hourCounts: Record<number, number> = {};
    let totalCompletionRate = 0;
    let totalRating = 0;
    let ratingCount = 0;

    for (const record of viewingHistory) {
      // Count platforms
      platformCounts[record.platform] = (platformCounts[record.platform] || 0) + 1;
      
      // Count viewing hours
      const hour = new Date(record.watchedAt).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      
      // Track completion rates
      if (record.completionPercentage) {
        totalCompletionRate += record.completionPercentage;
      }
      
      // Track ratings
      if (record.userRating) {
        totalRating += record.userRating;
        ratingCount++;
      }

      // Count genres from associated show
      if (record.showId) {
        const show = await storage.getShow(record.showId);
        if (show?.genres) {
          for (const genre of show.genres) {
            genreCounts[genre] = (genreCounts[genre] || 0) + 1;
          }
        }
      }
    }

    // Sort and get top results
    const favoriteGenres = Object.entries(genreCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([genre]) => genre);

    const preferredPlatforms = Object.entries(platformCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([platform]) => platform);

    const preferredHours = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => {
        const h = parseInt(hour);
        if (h >= 6 && h < 12) return 'morning';
        if (h >= 12 && h < 18) return 'afternoon';
        if (h >= 18 && h < 22) return 'evening';
        return 'night';
      });

    return {
      favoriteGenres,
      preferredPlatforms,
      viewingTimes: Array.from(new Set(preferredHours)), // Remove duplicates
      completionRate: viewingHistory.length > 0 ? totalCompletionRate / viewingHistory.length : 0,
      averageRating: ratingCount > 0 ? totalRating / ratingCount : 0
    };
  }
}