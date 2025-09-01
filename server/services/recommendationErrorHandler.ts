/**
 * 🛡️ BingeBoard Recommendation Engine - Advanced Error Handling & Fallbacks
 * 
 * Comprehensive error handling, circuit breakers, and graceful degradation
 */

export class RecommendationErrorHandler {
  private static circuitBreakers = new Map<string, {
    failures: number;
    lastFailure: number;
    state: 'closed' | 'open' | 'half-open';
  }>();

  private static readonly CIRCUIT_BREAKER_THRESHOLD = 5;
  private static readonly CIRCUIT_BREAKER_TIMEOUT = 60000; // 1 minute

  // === Algorithm Fallback Chain ===

  static async executeWithFallback<T>(
    primary: () => Promise<T>,
    fallbacks: Array<() => Promise<T>>,
    operationName: string
  ): Promise<T> {
    // Check circuit breaker
    if (this.isCircuitOpen(operationName)) {
      console.warn(`🔴 Circuit breaker OPEN for ${operationName}, using fallback`);
      return this.executeFallbackChain(fallbacks, operationName);
    }

    try {
      const result = await primary();
      this.recordSuccess(operationName);
      return result;
    } catch (error) {
      console.error(`❌ Primary algorithm failed: ${operationName}`, error);
      this.recordFailure(operationName);
      
      return this.executeFallbackChain(fallbacks, operationName);
    }
  }

  private static async executeFallbackChain<T>(
    fallbacks: Array<() => Promise<T>>,
    operationName: string
  ): Promise<T> {
    for (let i = 0; i < fallbacks.length; i++) {
      try {
        console.log(`🔄 Trying fallback ${i + 1} for ${operationName}`);
        const result = await fallbacks[i]();
        console.log(`✅ Fallback ${i + 1} succeeded for ${operationName}`);
        return result;
      } catch (error) {
        console.warn(`⚠️ Fallback ${i + 1} failed for ${operationName}:`, error);
      }
    }

    throw new Error(`All fallbacks exhausted for ${operationName}`);
  }

  // === Algorithm-Specific Fallbacks ===

  static async getContentBasedRecommendationsWithFallback(userProfile: any, limit: number): Promise<any[]> {
    return this.executeWithFallback(
      // Primary: Full content-based algorithm
      () => this.getAdvancedContentBasedRecommendations(userProfile, limit),
      [
        // Fallback 1: Genre-based recommendations
        () => this.getGenreBasedRecommendations(userProfile, limit),
        // Fallback 2: Popular content in user's preferred genres
        () => this.getPopularByGenre(userProfile.explicitPreferences.likedGenres, limit),
        // Fallback 3: Global trending with genre filter
        () => this.getTrendingWithGenreFilter(userProfile.explicitPreferences.likedGenres, limit)
      ],
      'content_based_recommendations'
    );
  }

  static async getCollaborativeRecommendationsWithFallback(userProfile: any, limit: number): Promise<any[]> {
    return this.executeWithFallback(
      // Primary: Full collaborative filtering
      () => this.getAdvancedCollaborativeRecommendations(userProfile, limit),
      [
        // Fallback 1: User cluster recommendations
        () => this.getClusterBasedRecommendations(userProfile, limit),
        // Fallback 2: Popular among similar age/demo
        () => this.getDemographicRecommendations(userProfile, limit),
        // Fallback 3: Content-based fallback
        () => this.getContentBasedRecommendationsWithFallback(userProfile, limit)
      ],
      'collaborative_recommendations'
    );
  }

  static async getSocialRecommendationsWithFallback(userProfile: any, limit: number): Promise<any[]> {
    return this.executeWithFallback(
      // Primary: Friend network recommendations
      () => this.getAdvancedSocialRecommendations(userProfile, limit),
      [
        // Fallback 1: Popular among user's network
        () => this.getNetworkPopularContent(userProfile, limit),
        // Fallback 2: Social platform trending
        () => this.getSocialTrendingContent(limit),
        // Fallback 3: Community recommendations
        () => this.getCommunityRecommendations(userProfile, limit)
      ],
      'social_recommendations'
    );
  }

  // === Data Availability Fallbacks ===

  static async handleMissingSocialData(userProfile: any, limit: number): Promise<any[]> {
    console.log(`👥 No social data available for user ${userProfile.userId}, using alternatives`);
    
    // Fallback strategies when user has no friends or social activity
    return [
      // Popular content among users with similar preferences
      ...(await this.getPopularAmongSimilarUsers(userProfile, Math.floor(limit * 0.4))),
      // Trending content filtered by user preferences
      ...(await this.getTrendingWithUserFilter(userProfile, Math.floor(limit * 0.3))),
      // Random high-quality content from preferred genres
      ...(await this.getHighQualityContentByGenre(userProfile.explicitPreferences.likedGenres, Math.floor(limit * 0.3)))
    ];
  }

  static async handleColdStartUser(userProfile: any, limit: number): Promise<any[]> {
    console.log(`🆕 Cold start user ${userProfile.userId}, building initial recommendations`);
    
    const recommendations: any[] = [];
    
    // Heavily weight explicit preferences
    if (userProfile.explicitPreferences.likedGenres.length > 0) {
      recommendations.push(
        ...(await this.getPopularByGenre(userProfile.explicitPreferences.likedGenres, Math.floor(limit * 0.6)))
      );
    }
    
    // Add platform-specific popular content
    if (userProfile.explicitPreferences.preferredPlatforms.length > 0) {
      recommendations.push(
        ...(await this.getPopularByPlatform(userProfile.explicitPreferences.preferredPlatforms, Math.floor(limit * 0.3)))
      );
    }
    
    // Fill remaining with general trending
    const remaining = limit - recommendations.length;
    if (remaining > 0) {
      recommendations.push(
        ...(await this.getGeneralTrending(remaining))
      );
    }
    
    return recommendations.slice(0, limit);
  }

  // === Streaming Data Fallbacks ===

  static async handleStreamingDataFailure(contentId: number, title: string, mediaType: 'movie' | 'tv') {
    console.warn(`📺 Streaming data unavailable for ${title} (${contentId}), using fallbacks`);
    
    try {
      // Fallback 1: Use cached streaming data if available
      const cached = await this.getCachedStreamingData(contentId);
      if (cached) {
        console.log(`✅ Using cached streaming data for ${title}`);
        return cached;
      }

      // Fallback 2: Use TMDB watch providers only
      const tmdbProviders = await this.getTMDBWatchProvidersOnly(contentId, mediaType);
      if (tmdbProviders.length > 0) {
        console.log(`✅ Using TMDB-only providers for ${title}`);
        return tmdbProviders;
      }

      // Fallback 3: Return empty array but mark content as "availability unknown"
      console.log(`⚠️ No streaming data available for ${title}, marking as unknown`);
      return [];

    } catch (error) {
      console.error(`❌ All streaming fallbacks failed for ${title}:`, error);
      return [];
    }
  }

  // === Performance Fallbacks ===

  static async handleSlowResponse(operation: string, timeoutMs: number = 5000) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.warn(`⏱️ Operation ${operation} timed out after ${timeoutMs}ms, using cached result`);
        resolve(this.getCachedResult(operation));
      }, timeoutMs);

      // Clear timeout if operation completes
      return { clearTimeout: () => clearTimeout(timeout) };
    });
  }

  // === Circuit Breaker Implementation ===

  private static isCircuitOpen(operationName: string): boolean {
    const breaker = this.circuitBreakers.get(operationName);
    if (!breaker) return false;

    if (breaker.state === 'open') {
      // Check if timeout has passed
      if (Date.now() - breaker.lastFailure > this.CIRCUIT_BREAKER_TIMEOUT) {
        breaker.state = 'half-open';
        console.log(`🔄 Circuit breaker for ${operationName} moving to HALF-OPEN`);
        return false;
      }
      return true;
    }

    return false;
  }

  private static recordFailure(operationName: string) {
    const breaker = this.circuitBreakers.get(operationName) || {
      failures: 0,
      lastFailure: 0,
      state: 'closed' as const
    };

    breaker.failures++;
    breaker.lastFailure = Date.now();

    if (breaker.failures >= this.CIRCUIT_BREAKER_THRESHOLD) {
      breaker.state = 'open';
      console.error(`🔴 Circuit breaker OPENED for ${operationName} after ${breaker.failures} failures`);
    }

    this.circuitBreakers.set(operationName, breaker);
  }

  private static recordSuccess(operationName: string) {
    const breaker = this.circuitBreakers.get(operationName);
    if (breaker) {
      if (breaker.state === 'half-open') {
        breaker.state = 'closed';
        breaker.failures = 0;
        console.log(`🟢 Circuit breaker for ${operationName} CLOSED after successful request`);
      }
    }
  }

  // === Default Recommendations ===

  static async getEmergencyRecommendations(limit: number = 20) {
    console.log(`🚨 Using emergency recommendations (${limit} items)`);
    
    // Return a curated list of high-quality, popular content
    // This should be a static list that's always available
    return [
      {
        contentId: 1399, // Game of Thrones
        algorithmType: 'emergency',
        finalScore: 0.9,
        explanation: {
          primaryReason: 'Highly rated popular series',
          factors: [{ type: 'emergency_fallback', value: 0.9, description: 'Curated popular content' }]
        }
      },
      {
        contentId: 94605, // Arcane
        algorithmType: 'emergency',
        finalScore: 0.85,
        explanation: {
          primaryReason: 'Critically acclaimed series',
          factors: [{ type: 'emergency_fallback', value: 0.85, description: 'Curated popular content' }]
        }
      }
      // Add more emergency recommendations...
    ].slice(0, limit);
  }

  // === Placeholder implementations for fallback methods ===
  
  private static async getAdvancedContentBasedRecommendations(userProfile: any, limit: number): Promise<any[]> {
    // Implementation would use full content-based algorithm
    throw new Error('Simulated failure for testing');
  }

  private static async getGenreBasedRecommendations(userProfile: any, limit: number): Promise<any[]> {
    // Simple genre-based fallback
    return [];
  }

  private static async getPopularByGenre(genres: string[], limit: number): Promise<any[]> {
    // Return popular content filtered by genres
    return [];
  }

  private static async getTrendingWithGenreFilter(genres: string[], limit: number): Promise<any[]> {
    // Return trending content filtered by user's preferred genres
    return [];
  }

  private static async getAdvancedCollaborativeRecommendations(userProfile: any, limit: number): Promise<any[]> {
    // Full collaborative filtering implementation
    throw new Error('Simulated failure for testing');
  }

  private static async getClusterBasedRecommendations(userProfile: any, limit: number): Promise<any[]> {
    // User cluster-based recommendations
    return [];
  }

  private static async getDemographicRecommendations(userProfile: any, limit: number): Promise<any[]> {
    // Demographic-based recommendations
    return [];
  }

  private static async getAdvancedSocialRecommendations(userProfile: any, limit: number): Promise<any[]> {
    // Full social recommendation algorithm
    throw new Error('Simulated failure for testing');
  }

  private static async getNetworkPopularContent(userProfile: any, limit: number): Promise<any[]> {
    // Popular content among user's extended network
    return [];
  }

  private static async getSocialTrendingContent(limit: number): Promise<any[]> {
    // Trending content on social platforms
    return [];
  }

  private static async getCommunityRecommendations(userProfile: any, limit: number): Promise<any[]> {
    // Community-based recommendations
    return [];
  }

  private static async getPopularAmongSimilarUsers(userProfile: any, limit: number): Promise<any[]> {
    // Popular content among users with similar preferences
    return [];
  }

  private static async getTrendingWithUserFilter(userProfile: any, limit: number): Promise<any[]> {
    // Trending content filtered by user preferences
    return [];
  }

  private static async getHighQualityContentByGenre(genres: string[], limit: number): Promise<any[]> {
    // High-rated content from preferred genres
    return [];
  }

  private static async getPopularByPlatform(platforms: string[], limit: number): Promise<any[]> {
    // Popular content on user's preferred platforms
    return [];
  }

  private static async getGeneralTrending(limit: number): Promise<any[]> {
    // General trending content
    return [];
  }

  private static async getCachedStreamingData(contentId: number) {
    // Check cache for streaming data
    return null;
  }

  private static async getTMDBWatchProvidersOnly(contentId: number, mediaType: 'movie' | 'tv') {
    // Get watch providers from TMDB only
    return [];
  }

  private static async getCachedResult(operation: string) {
    // Return cached result for operation
    return null;
  }
}

export default RecommendationErrorHandler;
