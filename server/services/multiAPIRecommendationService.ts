import { TMDBService } from './tmdb.js';
import { WatchmodeService } from './watchmodeService.js';
import { MultiAPIStreamingService } from './multiAPIStreamingService.js';
import {
  searchStreamingAvailability,
  getStreamingByImdbId,
  StreamingLocation,
  UtellyResult
} from '../clients/utellyClient.js';

interface MultiAPIRecommendation {
  tmdbId: number;
  title: string;
  overview: string;
  posterPath: string;
  backdropPath?: string;
  firstAirDate: string;
  genres: string[];
  voteAverage: number;
  popularity: number;
  source: 'tmdb' | 'watchmode' | 'utelly' | 'hybrid';
  confidence: number; // 0-100 confidence score
  reason: string;
  streamingAvailability?: {
    totalPlatforms: number;
    affiliatePlatforms: number;
    topPlatforms: string[];
  };
  personalizedScore: number; // Combined score from all APIs
}

interface UserPreferences {
  favoriteGenres: string[];
  preferredNetworks: string[];
  watchingHabits: string[];
  contentRating: string;
  languagePreferences: string[];
  viewingHistory: Array<{ showId: number; title: string; tmdbId?: number }>;
}

export class MultiAPIRecommendationService {
  private static tmdbService = new TMDBService();

  // Affiliate commission rates for platforms (copied from MultiAPIStreamingService)
  private static affiliateCommissions = {
    'Netflix': 8.5,
    'Amazon Prime Video': 4.5,
    'Hulu': 6.0,
    'Disney Plus': 7.2,
    'Disney+': 7.2,
    'HBO Max': 9.0,
    'Max': 9.0,
    'Apple TV Plus': 5.0,
    'Apple TV+': 5.0,
    'Paramount Plus': 5.5,
    'Paramount+': 5.5,
    'Peacock': 4.8,
    'Crunchyroll': 6.5,
    'YouTube Premium': 3.2,
    'Showtime': 7.0,
    'Starz': 6.8
  };

  // Check if platform supports affiliate links
  private static hasAffiliateSupport(platformName: string): boolean {
    return platformName in this.affiliateCommissions;
  }

  // Enhanced recommendation engine using multiple APIs
  static async generateMultiAPIRecommendations(
    userPreferences: UserPreferences,
    limit: number = 20
  ): Promise<MultiAPIRecommendation[]> {
    const recommendations: MultiAPIRecommendation[] = [];
    const seenTmdbIds = new Set<number>();

    console.log('🚀 Starting multi-API recommendation generation');

    // 1. TMDB-based recommendations (Primary source)
    const tmdbRecommendations = await this.getTMDBRecommendations(userPreferences, Math.floor(limit * 0.6));
    recommendations.push(...tmdbRecommendations);
    tmdbRecommendations.forEach(rec => seenTmdbIds.add(rec.tmdbId));

    // 2. Watchmode-enhanced recommendations (Secondary source)
    const watchmodeRecommendations = await this.getWatchmodeRecommendations(
      userPreferences, 
      Math.floor(limit * 0.3),
      seenTmdbIds
    );
    recommendations.push(...watchmodeRecommendations);
    watchmodeRecommendations.forEach(rec => seenTmdbIds.add(rec.tmdbId));

    // 3. Utelly-based availability recommendations (Tertiary source)
    const utellyRecommendations = await this.getUtellyRecommendations(
      userPreferences,
      Math.floor(limit * 0.1),
      seenTmdbIds
    );
    recommendations.push(...utellyRecommendations);

    // 4. Create hybrid recommendations by combining data from all sources
    const hybridRecommendations = await this.createHybridRecommendations(
      recommendations,
      userPreferences
    );

    // 5. Sort by personalized score and return top results
    return hybridRecommendations
      .sort((a, b) => b.personalizedScore - a.personalizedScore)
      .slice(0, limit);
  }

  // Get recommendations from TMDB with enhanced scoring
  private static async getTMDBRecommendations(
    userPreferences: UserPreferences,
    limit: number
  ): Promise<MultiAPIRecommendation[]> {
    const recommendations: MultiAPIRecommendation[] = [];
    const { favoriteGenres, viewingHistory } = userPreferences;

    try {
      // Genre-based recommendations
      const genreMapping: Record<string, number> = {
        'Action': 10759, 'Adventure': 10759, 'Comedy': 35, 'Drama': 18, 
        'Crime': 80, 'Documentary': 99, 'Family': 10751, 'Horror': 9648, 
        'Mystery': 9648, 'Romance': 10749, 'Sci-Fi': 10765, 'Thriller': 9648
      };

      for (const genre of favoriteGenres.slice(0, 3)) {
        const genreId = genreMapping[genre];
        if (genreId) {
          const response = await fetch(
            `https://api.themoviedb.org/3/discover/tv?api_key=${process.env.TMDB_API_KEY}&with_genres=${genreId}&sort_by=vote_average.desc&vote_count.gte=100&page=1`
          );
          const data = await response.json();
          
          for (const show of (data.results || []).slice(0, Math.floor(limit / favoriteGenres.length))) {
            const personalizedScore = this.calculateTMDBScore(show, userPreferences);
            
            recommendations.push({
              tmdbId: show.id,
              title: show.name,
              overview: show.overview,
              posterPath: show.poster_path,
              backdropPath: show.backdrop_path,
              firstAirDate: show.first_air_date,
              genres: show.genre_ids?.map(String) || [],
              voteAverage: show.vote_average,
              popularity: show.popularity,
              source: 'tmdb',
              confidence: 85,
              reason: `Because you like ${genre}`,
              personalizedScore
            });
          }
        }
      }

      // Similar shows based on viewing history
      for (const historicalShow of viewingHistory.slice(0, 3)) {
        if (historicalShow.tmdbId) {
          const response = await fetch(
            `https://api.themoviedb.org/3/tv/${historicalShow.tmdbId}/similar?api_key=${process.env.TMDB_API_KEY}&page=1`
          );
          const data = await response.json();

          for (const show of (data.results || []).slice(0, 2)) {
            const personalizedScore = this.calculateTMDBScore(show, userPreferences);
            
            recommendations.push({
              tmdbId: show.id,
              title: show.name,
              overview: show.overview,
              posterPath: show.poster_path,
              backdropPath: show.backdrop_path,
              firstAirDate: show.first_air_date,
              genres: show.genre_ids?.map(String) || [],
              voteAverage: show.vote_average,
              popularity: show.popularity,
              source: 'tmdb',
              confidence: 90,
              reason: `Similar to ${historicalShow.title}`,
              personalizedScore
            });
          }
        }
      }

    } catch (error) {
      console.error('TMDB recommendations failed:', error);
    }

    return recommendations;
  }

  // Get recommendations from Watchmode API
  private static async getWatchmodeRecommendations(
    userPreferences: UserPreferences,
    limit: number,
    seenTmdbIds: Set<number>
  ): Promise<MultiAPIRecommendation[]> {
    const recommendations: MultiAPIRecommendation[] = [];

    try {
      // Use Watchmode to find trending shows and search by genres
      const { favoriteGenres } = userPreferences;
      
      // Get trending shows from Watchmode
      const trendingShows = await WatchmodeService.getTrendingTitles('tv_series', limit);
      
      for (const show of trendingShows.slice(0, Math.floor(limit / 2))) {
        if (show.tmdb_id && seenTmdbIds.has(show.tmdb_id)) continue;
        if (!show.tmdb_id) continue;
        
        const personalizedScore = this.calculateWatchmodeScore(show, userPreferences);
        
        recommendations.push({
          tmdbId: show.tmdb_id,
          title: show.title,
          overview: show.plot_overview || '',
          posterPath: show.image_url || '',
          firstAirDate: show.year?.toString() || '',
          genres: show.genre_names || [],
          voteAverage: show.user_rating || 0,
          popularity: 100 - (recommendations.length * 5), // Trending rank approximation
          source: 'watchmode',
          confidence: 75,
          reason: `Trending on streaming platforms`,
          personalizedScore,
          streamingAvailability: {
            totalPlatforms: show.sources?.length || 0,
            affiliatePlatforms: 0, // Will be calculated later
            topPlatforms: show.network_names?.slice(0, 3) || []
          }
        });
      }

      // Search for shows by favorite genres
      for (const genre of favoriteGenres.slice(0, 2)) {
        const searchResults = await WatchmodeService.searchTitles(`${genre} series`, 'tv_series');
        
        for (const show of searchResults.titles.slice(0, 3)) {
          if (show.tmdb_id && seenTmdbIds.has(show.tmdb_id)) continue;
          if (!show.tmdb_id) continue;
          
          const personalizedScore = this.calculateWatchmodeScore(show, userPreferences);
          
          recommendations.push({
            tmdbId: show.tmdb_id,
            title: show.title,
            overview: show.plot_overview || '',
            posterPath: show.image_url || '',
            firstAirDate: show.year?.toString() || '',
            genres: show.genre_names || [],
            voteAverage: show.user_rating || 0,
            popularity: show.critic_score || 0,
            source: 'watchmode',
            confidence: 70,
            reason: `${genre} shows on streaming`,
            personalizedScore,
            streamingAvailability: {
              totalPlatforms: show.sources?.length || 0,
              affiliatePlatforms: 0,
              topPlatforms: show.network_names?.slice(0, 3) || []
            }
          });
        }
      }

    } catch (error) {
      console.error('Watchmode recommendations failed:', error);
    }

    return recommendations;
  }

  // Get recommendations from Utelly API based on streaming availability
  private static async getUtellyRecommendations(
    userPreferences: UserPreferences,
    limit: number,
    seenTmdbIds: Set<number>
  ): Promise<MultiAPIRecommendation[]> {
    const recommendations: MultiAPIRecommendation[] = [];

    try {
      // Search for shows in user's favorite genres using Utelly
      const { favoriteGenres } = userPreferences;
      
      for (const genre of favoriteGenres.slice(0, 2)) {
        const searchTerms = [
          `${genre} TV series`,
          `best ${genre} shows`,
          `${genre} streaming`
        ];

        for (const term of searchTerms.slice(0, 1)) { // Limit searches
          const utellyResults = await searchStreamingAvailability(term);
          
          if (utellyResults?.results) {
            for (const result of utellyResults.results.slice(0, Math.floor(limit / 2))) {
              // Try to get TMDB ID for this title
              const tmdbId = await this.findTMDBIdByTitle(result.name);
              if (!tmdbId || seenTmdbIds.has(tmdbId)) continue;

              const personalizedScore = this.calculateUtellyScore(result, userPreferences);
              
              recommendations.push({
                tmdbId,
                title: result.name,
                overview: '',
                posterPath: result.picture || '',
                firstAirDate: '',
                genres: [genre], // Inferred from search
                voteAverage: 0,
                popularity: 0,
                source: 'utelly',
                confidence: 60,
                reason: `Streaming availability in ${genre}`,
                personalizedScore,
                streamingAvailability: {
                  totalPlatforms: result.locations?.length || 0,
                  affiliatePlatforms: result.locations?.filter(loc => 
                    this.hasAffiliateSupport(loc.display_name)
                  ).length || 0,
                  topPlatforms: result.locations?.slice(0, 3).map(loc => loc.display_name) || []
                }
              });
            }
          }
        }
      }

    } catch (error) {
      console.error('Utelly recommendations failed:', error);
    }

    return recommendations;
  }

  // Create hybrid recommendations by merging data from multiple sources
  private static async createHybridRecommendations(
    allRecommendations: MultiAPIRecommendation[],
    userPreferences: UserPreferences
  ): Promise<MultiAPIRecommendation[]> {
    // Group recommendations by TMDB ID to merge data
    const hybridMap = new Map<number, MultiAPIRecommendation>();

    for (const rec of allRecommendations) {
      const existing = hybridMap.get(rec.tmdbId);
      
      if (!existing) {
        // Add streaming availability for all recommendations
        try {
          const streamingData = await MultiAPIStreamingService.getComprehensiveAvailability(
            rec.tmdbId,
            rec.title,
            'tv'
          );
          
          rec.streamingAvailability = {
            totalPlatforms: streamingData.totalPlatforms,
            affiliatePlatforms: streamingData.affiliatePlatforms,
            topPlatforms: streamingData.platforms.slice(0, 3).map(p => p.provider_name)
          };
          
          // Boost score for better streaming availability
          rec.personalizedScore += (streamingData.affiliatePlatforms * 5);
          
        } catch (error) {
          console.warn(`Failed to get streaming data for ${rec.title}:`, error);
        }
        
        hybridMap.set(rec.tmdbId, rec);
      } else {
        // Merge data from multiple sources
        existing.confidence = Math.max(existing.confidence, rec.confidence);
        existing.personalizedScore = Math.max(existing.personalizedScore, rec.personalizedScore);
        
        // Combine reasons
        if (existing.reason !== rec.reason) {
          existing.reason = `${existing.reason} • ${rec.reason}`;
        }
        
        // Upgrade to hybrid source
        existing.source = 'hybrid';
        existing.confidence += 10; // Bonus for multiple source validation
      }
    }

    return Array.from(hybridMap.values());
  }

  // Calculate personalized score for TMDB shows
  private static calculateTMDBScore(show: any, userPreferences: UserPreferences): number {
    let score = 0;
    
    // Base score from TMDB metrics
    score += show.vote_average * 10; // 0-100 from rating
    score += Math.min(show.popularity / 10, 20); // Up to 20 from popularity
    
    // Genre matching bonus
    if (show.genre_ids) {
      const genreMapping: Record<number, string> = {
        10759: 'Action', 35: 'Comedy', 18: 'Drama', 80: 'Crime',
        99: 'Documentary', 10751: 'Family', 9648: 'Horror',
        10749: 'Romance', 10765: 'Sci-Fi'
      };
      
      const showGenres = show.genre_ids.map((id: number) => genreMapping[id]).filter(Boolean);
      const matches = showGenres.filter((genre: string) => userPreferences.favoriteGenres.includes(genre));
      score += matches.length * 15; // 15 points per genre match
    }
    
    // Recency bonus
    if (show.first_air_date) {
      const year = new Date(show.first_air_date).getFullYear();
      const currentYear = new Date().getFullYear();
      if (currentYear - year <= 2) score += 10; // Recent shows bonus
    }
    
    return Math.min(score, 100); // Cap at 100
  }

  // Calculate personalized score for Watchmode shows
  private static calculateWatchmodeScore(show: any, userPreferences: UserPreferences): number {
    let score = 0;
    
    // Base score from Watchmode metrics
    score += (show.user_rating || 0) * 10;
    score += Math.min((show.critic_score || 0), 20);
    
    // Network preference bonus
    if (show.network_names) {
      const networkMatches = show.network_names.filter((network: string) => 
        userPreferences.preferredNetworks.some(prefNetwork => 
          network.toLowerCase().includes(prefNetwork.toLowerCase())
        )
      );
      score += networkMatches.length * 10;
    }
    
    // Streaming availability bonus
    score += Math.min((show.sources?.length || 0) * 3, 15);
    
    return Math.min(score, 100);
  }

  // Calculate personalized score for Utelly shows
  private static calculateUtellyScore(show: any, userPreferences: UserPreferences): number {
    let score = 40; // Base score for streaming availability
    
    // Streaming platform bonus
    if (show.locations) {
      score += Math.min(show.locations.length * 5, 25);
      
      // Preferred network bonus
      const platformMatches = show.locations.filter((loc: any) => 
        userPreferences.preferredNetworks.some(network => 
          loc.display_name.toLowerCase().includes(network.toLowerCase())
        )
      );
      score += platformMatches.length * 10;
    }
    
    return Math.min(score, 100);
  }

  // Helper function to find TMDB ID by title
  private static async findTMDBIdByTitle(title: string): Promise<number | null> {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/tv?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(title)}`
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        return data.results[0].id;
      }
      
      return null;
    } catch (error) {
      console.warn(`Failed to find TMDB ID for "${title}":`, error);
      return null;
    }
  }
}
