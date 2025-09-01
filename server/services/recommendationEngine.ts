/**
 * 🎯 BingeBoard Recommendation Engine - Core Service
 * 
 * Production-ready, multi-algorithm recommendation system that integrates
 * with your existing multi-API streaming service for comprehensive,
 * personalized, and explainable recommendations.
 */

import { db } from '../db.js';
import { MultiAPIStreamingService } from './multiAPIStreamingService.js';
import type { EnhancedStreamingPlatform } from './multiAPIStreamingService.js';

// === Core Types ===

export interface UserProfile {
  userId: string;
  explicitPreferences: {
    likedGenres: string[];
    dislikedGenres: string[];
    preferredPlatforms: string[];
    contentRating: string;
    languages: string[];
  };
  implicitProfile: {
    genreAffinities: Record<string, number>; // -1 to 1
    castAffinities: Record<string, number>;
    platformUsage: Record<string, number>;
    viewingPatterns: {
      preferredTimeSlots: string[];
      averageSessionMinutes: number;
      bingeBehavior: number; // 0-1
      completionRate: number; // 0-1
    };
  };
  socialProfile: {
    friendInfluence: number; // 0-1
    trendingWeight: number; // 0-1
    networkSize: number;
  };
}

export interface ContentItem {
  id: number;
  tmdbId: number;
  title: string;
  type: 'movie' | 'tv';
  genres: string[];
  cast: string[];
  director?: string;
  year?: number;
  rating?: number;
  popularity: number;
  keywords: string[];
  streamingPlatforms: EnhancedStreamingPlatform[];
  features: Record<string, number>; // extracted features for ML
}

export interface RecommendationCandidate {
  contentId: number;
  userId: string;
  algorithmType: 'collaborative' | 'content_based' | 'hybrid' | 'trending' | 'social';
  baseScore: number;
  boosts: {
    popularity: number;
    recency: number;
    availability: number;
    social: number;
    trending: number;
  };
  penalties: {
    diversity: number;
    fatigue: number;
  };
  finalScore: number;
  explanation: RecommendationExplanation;
  confidence: number;
}

export interface RecommendationExplanation {
  primaryReason: string;
  factors: Array<{
    type: string;
    value: number;
    description: string;
  }>;
  similarContent: string[];
  socialSignals: string[];
  availabilityInfo: {
    platforms: string[];
    hasUserPlatforms: boolean;
  };
}

export interface RecommendationSection {
  key: string;
  title: string;
  description: string;
  items: RecommendationCandidate[];
  algorithm: string;
  refreshable: boolean;
}

// === Core Recommendation Engine ===

export class BingeBoardRecommendationEngine {
  private static cache = new Map<string, any>();
  private static cacheExpiry = new Map<string, number>();

  // === User Profile Building ===

  static async buildUserProfile(userId: string): Promise<UserProfile> {
    const cacheKey = `profile:${userId}`;
    if (this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Get explicit preferences from database
    const preferences = await db.query.userPreferences.findFirst({
      where: (prefs, { eq }) => eq(prefs.userId, userId)
    });

    // Get viewing history and behavior
    const recentBehavior = await db.query.userBehavior.findMany({
      where: (behavior, { eq, and, gte }) => and(
        eq(behavior.userId, userId),
        gte(behavior.timestamp, new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)) // Last 90 days
      ),
      limit: 1000,
      orderBy: (behavior, { desc }) => desc(behavior.timestamp)
    });

    // Calculate implicit preferences from behavior
    const implicitProfile = await this.calculateImplicitPreferences(userId, recentBehavior);
    
    // Get social graph info
    const socialProfile = await this.calculateSocialProfile(userId);

    const profile: UserProfile = {
      userId,
      explicitPreferences: {
        likedGenres: this.parseJsonArray(preferences?.preferredGenres) || [],
        dislikedGenres: this.parseJsonArray(preferences?.excludedGenres) || [],
        preferredPlatforms: this.parseJsonArray(preferences?.preferredNetworks) || [],
        contentRating: preferences?.contentRating || 'All',
        languages: this.parseJsonArray(preferences?.languagePreferences) || ['English']
      },
      implicitProfile,
      socialProfile
    };

    this.setCache(cacheKey, profile, 30 * 60 * 1000); // 30 minute cache
    return profile;
  }

  private static async calculateImplicitPreferences(userId: string, behavior: any[]): Promise<UserProfile['implicitProfile']> {
    // Analyze genre affinities from watch history
    const genreAffinities: Record<string, number> = {};
    const castAffinities: Record<string, number> = {};
    const platformUsage: Record<string, number> = {};

    let totalWatched = 0;
    let totalCompleted = 0;
    let totalSessionTime = 0;
    let bingeSessionCount = 0;

    for (const event of behavior) {
      if (event.actionType === 'watch_complete' || event.actionType === 'watch_progress') {
        totalWatched++;
        
        if (event.actionType === 'watch_complete') {
          totalCompleted++;
        }

        // Extract session info from metadata
        const metadata = this.parseJson(event.metadata);
        if (metadata?.sessionMinutes) {
          totalSessionTime += metadata.sessionMinutes;
          if (metadata.sessionMinutes > 180) { // 3+ hours = binge
            bingeSessionCount++;
          }
        }

        // Get content info for genre/cast analysis
        if (event.contentId) {
          const content = await this.getContentDetails(event.contentId);
          if (content) {
            // Update genre affinities based on completion/rating
            const weight = event.actionType === 'watch_complete' ? 1.0 : 0.5;
            for (const genre of content.genres) {
              genreAffinities[genre] = (genreAffinities[genre] || 0) + weight;
            }

            // Update cast affinities
            for (const actor of content.cast.slice(0, 5)) { // Top 5 cast
              castAffinities[actor] = (castAffinities[actor] || 0) + weight * 0.3;
            }
          }
        }

        // Platform usage
        if (metadata?.platform) {
          platformUsage[metadata.platform] = (platformUsage[metadata.platform] || 0) + 1;
        }
      }
    }

    // Normalize scores
    const maxGenreScore = Math.max(...Object.values(genreAffinities));
    if (maxGenreScore > 0) {
      for (const genre in genreAffinities) {
        genreAffinities[genre] = genreAffinities[genre] / maxGenreScore;
      }
    }

    return {
      genreAffinities,
      castAffinities,
      platformUsage,
      viewingPatterns: {
        preferredTimeSlots: await this.extractTimePreferences(behavior),
        averageSessionMinutes: totalSessionTime / Math.max(totalWatched, 1),
        bingeBehavior: bingeSessionCount / Math.max(totalWatched, 1),
        completionRate: totalCompleted / Math.max(totalWatched, 1)
      }
    };
  }

  private static async calculateSocialProfile(userId: string): Promise<UserProfile['socialProfile']> {
    // Get friend count and activity level
    const friends = await db.query.friendships.findMany({
      where: (friendship, { eq, or, and }) => and(
        or(
          eq(friendship.userId, userId),
          eq(friendship.friendId, userId)
        ),
        eq(friendship.status, 'accepted')
      )
    });

    // Calculate friend influence based on recent shared activity
    const friendActivity = await db.query.activities.findMany({
      where: (activity, { inArray, gte }) => and(
        inArray(activity.userId, friends.map(f => f.userId === userId ? f.friendId : f.userId)),
        gte(activity.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // Last week
      ),
      limit: 100
    });

    return {
      friendInfluence: Math.min(friendActivity.length / 10, 1.0), // Normalize to 0-1
      trendingWeight: 0.3, // Default trending weight
      networkSize: friends.length
    };
  }

  // === Content-Based Filtering ===

  static async getContentBasedRecommendations(
    userProfile: UserProfile, 
    limit: number = 50
  ): Promise<RecommendationCandidate[]> {
    // Get user's recent watch history
    const recentWatched = await db.query.watchHistory.findMany({
      where: (history, { eq }) => eq(history.userId, userProfile.userId),
      limit: 20,
      orderBy: (history, { desc }) => desc(history.watchedAt)
    });

    const candidates: RecommendationCandidate[] = [];

    // Find similar content based on genres, cast, keywords
    for (const watched of recentWatched) {
      const similarContent = await this.findSimilarContent(watched.showId, limit / recentWatched.length);
      
      for (const content of similarContent) {
        // Skip if already watched
        if (recentWatched.some(w => w.showId === content.id)) continue;

        // Calculate content-based score
        const baseScore = this.calculateContentSimilarityScore(userProfile, content);
        
        const candidate: RecommendationCandidate = {
          contentId: content.id,
          userId: userProfile.userId,
          algorithmType: 'content_based',
          baseScore,
          boosts: {
            popularity: content.popularity * 0.1,
            recency: this.calculateRecencyBoost(content.year),
            availability: await this.calculateAvailabilityBoost(userProfile, content),
            social: 0,
            trending: 0
          },
          penalties: {
            diversity: 0,
            fatigue: 0
          },
          finalScore: 0,
          explanation: {
            primaryReason: `Similar to "${watched.show?.title}" which you watched recently`,
            factors: [
              { type: 'genre_match', value: baseScore, description: 'Matches your preferred genres' },
              { type: 'cast_overlap', value: 0.3, description: 'Features actors you like' }
            ],
            similarContent: [watched.show?.title || ''],
            socialSignals: [],
            availabilityInfo: {
              platforms: content.streamingPlatforms.map(p => p.provider_name),
              hasUserPlatforms: content.streamingPlatforms.some(p => 
                userProfile.explicitPreferences.preferredPlatforms.includes(p.provider_name)
              )
            }
          },
          confidence: 0.8
        };

        candidate.finalScore = this.calculateFinalScore(candidate);
        candidates.push(candidate);
      }
    }

    return candidates.sort((a, b) => b.finalScore - a.finalScore).slice(0, limit);
  }

  // === Collaborative Filtering ===

  static async getCollaborativeRecommendations(
    userProfile: UserProfile,
    limit: number = 50
  ): Promise<RecommendationCandidate[]> {
    // Find users with similar taste
    const similarUsers = await this.findSimilarUsers(userProfile.userId, 100);
    
    const candidates: RecommendationCandidate[] = [];
    const userWatchedIds = new Set(
      (await db.query.watchHistory.findMany({
        where: (history, { eq }) => eq(history.userId, userProfile.userId)
      })).map(w => w.showId)
    );

    // Get recommendations from similar users
    for (const similarUser of similarUsers) {
      const theirWatched = await db.query.watchHistory.findMany({
        where: (history, { eq }) => eq(history.userId, similarUser.userId),
        limit: 50,
        orderBy: (history, { desc }) => desc(history.watchedAt)
      });

      for (const item of theirWatched) {
        // Skip if user already watched this
        if (userWatchedIds.has(item.showId)) continue;

        const content = await this.getContentDetails(item.showId);
        if (!content) continue;

        const baseScore = similarUser.similarity * 0.8; // Weight by user similarity

        const candidate: RecommendationCandidate = {
          contentId: content.id,
          userId: userProfile.userId,
          algorithmType: 'collaborative',
          baseScore,
          boosts: {
            popularity: content.popularity * 0.05,
            recency: this.calculateRecencyBoost(content.year),
            availability: await this.calculateAvailabilityBoost(userProfile, content),
            social: similarUser.isFriend ? 0.2 : 0,
            trending: 0
          },
          penalties: {
            diversity: 0,
            fatigue: 0
          },
          finalScore: 0,
          explanation: {
            primaryReason: `Users with similar taste enjoyed this`,
            factors: [
              { type: 'user_similarity', value: similarUser.similarity, description: 'Based on users like you' },
              { type: 'watch_frequency', value: 0.6, description: 'Popular among similar users' }
            ],
            similarContent: [],
            socialSignals: similarUser.isFriend ? [`Your friend ${similarUser.username} watched this`] : [],
            availabilityInfo: {
              platforms: content.streamingPlatforms.map(p => p.provider_name),
              hasUserPlatforms: content.streamingPlatforms.some(p => 
                userProfile.explicitPreferences.preferredPlatforms.includes(p.provider_name)
              )
            }
          },
          confidence: 0.7
        };

        candidate.finalScore = this.calculateFinalScore(candidate);
        candidates.push(candidate);
      }
    }

    return candidates.sort((a, b) => b.finalScore - a.finalScore).slice(0, limit);
  }

  // === Social Recommendations ===

  static async getSocialRecommendations(
    userProfile: UserProfile,
    limit: number = 20
  ): Promise<RecommendationCandidate[]> {
    // Get friend activity from last 2 weeks
    const friends = await db.query.friendships.findMany({
      where: (friendship, { eq, and, or }) => and(
        or(
          eq(friendship.userId, userProfile.userId),
          eq(friendship.friendId, userProfile.userId)
        ),
        eq(friendship.status, 'accepted')
      )
    });

    const friendIds = friends.map(f => f.userId === userProfile.userId ? f.friendId : f.userId);
    
    const friendActivity = await db.query.activities.findMany({
      where: (activity, { inArray, gte, inArray: inArrayFunc }) => and(
        inArrayFunc(activity.userId, friendIds),
        gte(activity.createdAt, new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)),
        inArrayFunc(activity.activityType, ['added_to_watchlist', 'finished_show', 'rated_show'])
      ),
      with: {
        user: true,
        show: true
      },
      limit: 100,
      orderBy: (activity, { desc }) => desc(activity.createdAt)
    });

    const candidates: RecommendationCandidate[] = [];

    for (const activity of friendActivity) {
      if (!activity.show) continue;

      const content = await this.getContentDetails(activity.show.id);
      if (!content) continue;

      // Calculate social score based on activity type and recency
      let baseScore = 0.6;
      if (activity.activityType === 'rated_show') baseScore = 0.8;
      if (activity.activityType === 'finished_show') baseScore = 0.9;

      // Boost for recency
      const daysSinceActivity = (Date.now() - activity.createdAt.getTime()) / (24 * 60 * 60 * 1000);
      const recencyBoost = Math.max(0, 1 - daysSinceActivity / 14);

      const candidate: RecommendationCandidate = {
        contentId: content.id,
        userId: userProfile.userId,
        algorithmType: 'social',
        baseScore: baseScore * recencyBoost,
        boosts: {
          popularity: 0,
          recency: recencyBoost,
          availability: await this.calculateAvailabilityBoost(userProfile, content),
          social: 0.3,
          trending: 0
        },
        penalties: {
          diversity: 0,
          fatigue: 0
        },
        finalScore: 0,
        explanation: {
          primaryReason: `${activity.user.username} ${activity.activityType.replace('_', ' ')}`,
          factors: [
            { type: 'friend_activity', value: baseScore, description: `Friend's ${activity.activityType}` },
            { type: 'social_recency', value: recencyBoost, description: 'Recent friend activity' }
          ],
          similarContent: [],
          socialSignals: [`${activity.user.username} ${activity.activityType.replace('_', ' ')}`],
          availabilityInfo: {
            platforms: content.streamingPlatforms.map(p => p.provider_name),
            hasUserPlatforms: content.streamingPlatforms.some(p => 
              userProfile.explicitPreferences.preferredPlatforms.includes(p.provider_name)
            )
          }
        },
        confidence: 0.75
      };

      candidate.finalScore = this.calculateFinalScore(candidate);
      candidates.push(candidate);
    }

    return candidates.sort((a, b) => b.finalScore - a.finalScore).slice(0, limit);
  }

  // === Trending Recommendations ===

  static async getTrendingRecommendations(
    userProfile: UserProfile,
    limit: number = 30
  ): Promise<RecommendationCandidate[]> {
    // Get trending content from your multi-API system
    try {
      const trendingData = await fetch('/api/content/trending-enhanced?includeStreaming=true');
      const trending = await trendingData.json();
      
      const candidates: RecommendationCandidate[] = [];

      for (const item of trending.results.slice(0, limit * 2)) {
        // Filter by user preferences
        const genreMatch = item.genres?.some((g: string) => 
          userProfile.explicitPreferences.likedGenres.includes(g)
        ) || false;

        if (!genreMatch && userProfile.explicitPreferences.likedGenres.length > 0) {
          continue; // Skip if no genre match and user has preferences
        }

        const baseScore = (item.popularity || 0) / 100;
        
        const candidate: RecommendationCandidate = {
          contentId: item.id,
          userId: userProfile.userId,
          algorithmType: 'trending',
          baseScore,
          boosts: {
            popularity: 0.3,
            recency: this.calculateRecencyBoost(item.year),
            availability: item.streamingPlatforms?.length > 0 ? 0.2 : 0,
            social: 0,
            trending: 0.4
          },
          penalties: {
            diversity: 0,
            fatigue: 0
          },
          finalScore: 0,
          explanation: {
            primaryReason: 'Trending now across all platforms',
            factors: [
              { type: 'trending_score', value: baseScore, description: 'Popular right now' },
              { type: 'genre_match', value: genreMatch ? 0.3 : 0, description: 'Matches your interests' }
            ],
            similarContent: [],
            socialSignals: ['Trending globally'],
            availabilityInfo: {
              platforms: item.streamingPlatforms?.map((p: any) => p.provider_name) || [],
              hasUserPlatforms: item.streamingPlatforms?.some((p: any) => 
                userProfile.explicitPreferences.preferredPlatforms.includes(p.provider_name)
              ) || false
            }
          },
          confidence: 0.6
        };

        candidate.finalScore = this.calculateFinalScore(candidate);
        candidates.push(candidate);
      }

      return candidates.sort((a, b) => b.finalScore - a.finalScore).slice(0, limit);
    } catch (error) {
      console.error('Error fetching trending recommendations:', error);
      return [];
    }
  }

  // === Hybrid Algorithm ===

  static async getHybridRecommendations(
    userProfile: UserProfile,
    limit: number = 100
  ): Promise<RecommendationCandidate[]> {
    // Get recommendations from all algorithms
    const [contentBased, collaborative, social, trending] = await Promise.all([
      this.getContentBasedRecommendations(userProfile, Math.floor(limit * 0.4)),
      this.getCollaborativeRecommendations(userProfile, Math.floor(limit * 0.3)),
      this.getSocialRecommendations(userProfile, Math.floor(limit * 0.2)),
      this.getTrendingRecommendations(userProfile, Math.floor(limit * 0.1))
    ]);

    // Combine and deduplicate
    const allCandidates = [...contentBased, ...collaborative, ...social, ...trending];
    const deduped = new Map<number, RecommendationCandidate>();

    for (const candidate of allCandidates) {
      const existing = deduped.get(candidate.contentId);
      if (!existing || candidate.finalScore > existing.finalScore) {
        deduped.set(candidate.contentId, candidate);
      }
    }

    // Apply diversity and final ranking
    const finalCandidates = Array.from(deduped.values());
    return this.applyDiversityAndRanking(finalCandidates, userProfile).slice(0, limit);
  }

  // === Utility Methods ===

  private static calculateFinalScore(candidate: RecommendationCandidate): number {
    const boostSum = Object.values(candidate.boosts).reduce((sum, boost) => sum + boost, 0);
    const penaltySum = Object.values(candidate.penalties).reduce((sum, penalty) => sum + penalty, 0);
    
    return Math.max(0, Math.min(1, candidate.baseScore + boostSum - penaltySum));
  }

  private static async calculateAvailabilityBoost(
    userProfile: UserProfile, 
    content: ContentItem
  ): Promise<number> {
    const userPlatforms = userProfile.explicitPreferences.preferredPlatforms;
    const availablePlatforms = content.streamingPlatforms.map(p => p.provider_name);
    
    const hasUserPlatform = availablePlatforms.some(platform => 
      userPlatforms.includes(platform)
    );
    
    return hasUserPlatform ? 0.3 : 0;
  }

  private static calculateRecencyBoost(year?: number): number {
    if (!year) return 0;
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;
    return Math.max(0, (5 - age) / 5) * 0.1; // Boost newer content
  }

  private static calculateContentSimilarityScore(
    userProfile: UserProfile, 
    content: ContentItem
  ): number {
    let score = 0;
    let factors = 0;

    // Genre matching
    const genreMatches = content.genres.filter(genre => 
      userProfile.explicitPreferences.likedGenres.includes(genre)
    ).length;
    if (genreMatches > 0) {
      score += genreMatches / content.genres.length * 0.4;
      factors++;
    }

    // Implicit genre affinities
    const genreAffinity = content.genres.reduce((sum, genre) => 
      sum + (userProfile.implicitProfile.genreAffinities[genre] || 0), 0
    ) / content.genres.length;
    score += genreAffinity * 0.3;
    factors++;

    // Cast matching
    const castAffinity = content.cast.slice(0, 5).reduce((sum, actor) => 
      sum + (userProfile.implicitProfile.castAffinities[actor] || 0), 0
    ) / 5;
    score += castAffinity * 0.2;
    factors++;

    // Rating preference
    if (content.rating && content.rating >= 7) {
      score += 0.1;
      factors++;
    }

    return factors > 0 ? score / factors : 0.1;
  }

  private static async findSimilarContent(contentId: number, limit: number): Promise<ContentItem[]> {
    // This would use your content similarity table or real-time similarity calculation
    // For now, we'll use a basic genre-based approach
    const baseContent = await this.getContentDetails(contentId);
    if (!baseContent) return [];

    // Find content with similar genres
    const similar = await db.query.shows.findMany({
      where: (show, { ne, and }) => and(
        ne(show.id, contentId)
        // Add genre filtering based on your schema
      ),
      limit: limit * 2
    });

    return similar.slice(0, limit).map(show => this.mapToContentItem(show));
  }

  private static async findSimilarUsers(userId: string, limit: number): Promise<Array<{
    userId: string;
    username: string;
    similarity: number;
    isFriend: boolean;
  }>> {
    // Simplified collaborative filtering - find users with overlapping watch history
    const userWatched = await db.query.watchHistory.findMany({
      where: (history, { eq }) => eq(history.userId, userId),
      limit: 100
    });

    const userWatchedIds = new Set(userWatched.map(w => w.showId));

    // Find users who watched similar content
    const otherUsers = await db.query.watchHistory.findMany({
      where: (history, { ne, inArray }) => and(
        ne(history.userId, userId),
        inArray(history.showId, Array.from(userWatchedIds))
      ),
      with: {
        user: true
      },
      limit: 1000
    });

    // Calculate similarity scores
    const userSimilarity = new Map<string, { count: number; user: any }>();
    
    for (const watch of otherUsers) {
      const existing = userSimilarity.get(watch.userId) || { count: 0, user: watch.user };
      existing.count++;
      userSimilarity.set(watch.userId, existing);
    }

    // Convert to similarity scores and sort
    const similarities = Array.from(userSimilarity.entries())
      .map(([id, data]) => ({
        userId: id,
        username: data.user.username || data.user.email || 'User',
        similarity: data.count / userWatchedIds.size,
        isFriend: false // You'd check friendship table here
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return similarities;
  }

  private static async getContentDetails(contentId: number): Promise<ContentItem | null> {
    const show = await db.query.shows.findFirst({
      where: (shows, { eq }) => eq(shows.id, contentId)
    });

    if (!show) return null;

    // Get streaming availability from your multi-API service
    let streamingPlatforms: EnhancedStreamingPlatform[] = [];
    try {
      const streamingData = await MultiAPIStreamingService.getComprehensiveAvailability(
        show.tmdbId,
        show.title,
        'tv' // You'd determine this based on content type
      );
      streamingPlatforms = streamingData.platforms;
    } catch (error) {
      console.warn('Error fetching streaming data:', error);
    }

    return this.mapToContentItem(show, streamingPlatforms);
  }

  private static mapToContentItem(show: any, streamingPlatforms: EnhancedStreamingPlatform[] = []): ContentItem {
    return {
      id: show.id,
      tmdbId: show.tmdbId,
      title: show.title,
      type: 'tv', // You'd determine this from your schema
      genres: this.parseJsonArray(show.genres) || [],
      cast: [], // You'd extract this from your cast data
      year: show.firstAirDate ? new Date(show.firstAirDate).getFullYear() : undefined,
      rating: show.rating ? parseFloat(show.rating) : undefined,
      popularity: show.popularity || 0,
      keywords: [], // You'd have keywords in your content features
      streamingPlatforms,
      features: {} // ML features would go here
    };
  }

  private static applyDiversityAndRanking(
    candidates: RecommendationCandidate[], 
    userProfile: UserProfile
  ): RecommendationCandidate[] {
    // Simple diversity: limit items per genre
    const genreCounts = new Map<string, number>();
    const diverseCandidates: RecommendationCandidate[] = [];

    for (const candidate of candidates.sort((a, b) => b.finalScore - a.finalScore)) {
      const content = candidate.explanation.availabilityInfo; // Simplified
      
      // Apply diversity penalty
      let diversityPenalty = 0;
      // You'd implement genre diversity logic here
      
      candidate.penalties.diversity = diversityPenalty;
      candidate.finalScore = this.calculateFinalScore(candidate);
      
      diverseCandidates.push(candidate);
    }

    return diverseCandidates.sort((a, b) => b.finalScore - a.finalScore);
  }

  private static async extractTimePreferences(behavior: any[]): Promise<string[]> {
    const hourCounts = new Map<number, number>();
    
    for (const event of behavior) {
      if (event.timestamp) {
        const hour = new Date(event.timestamp).getHours();
        hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
      }
    }

    // Find peak hours
    const sortedHours = Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => {
        if (hour >= 6 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 22) return 'evening';
        return 'night';
      });

    return [...new Set(sortedHours)];
  }

  // === Caching Utilities ===

  private static isValidCache(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    return expiry ? expiry > Date.now() : false;
  }

  private static setCache(key: string, value: any, ttlMs: number): void {
    this.cache.set(key, value);
    this.cacheExpiry.set(key, Date.now() + ttlMs);
  }

  // === Parsing Utilities ===

  private static parseJsonArray(value: any): string[] | null {
    if (!value) return null;
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : null;
      } catch {
        return null;
      }
    }
    return null;
  }

  private static parseJson(value: any): any {
    if (!value) return null;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    }
    return value;
  }

  // === Main Recommendation Pipeline ===

  static async generateRecommendations(userId: string): Promise<RecommendationSection[]> {
    try {
      console.log(`🎯 Generating comprehensive recommendations for user: ${userId}`);
      
      // Build user profile
      const userProfile = await this.buildUserProfile(userId);
      
      // Generate different types of recommendations
      const [hybrid, social, trending] = await Promise.all([
        this.getHybridRecommendations(userProfile, 30),
        this.getSocialRecommendations(userProfile, 15),
        this.getTrendingRecommendations(userProfile, 20)
      ]);

      // Create recommendation sections
      const sections: RecommendationSection[] = [
        {
          key: 'for_you',
          title: 'For You',
          description: 'Personalized picks based on your taste',
          items: hybrid.slice(0, 20),
          algorithm: 'hybrid',
          refreshable: true
        },
        {
          key: 'friends_watching',
          title: 'Friends Are Watching',
          description: 'See what your friends are enjoying',
          items: social,
          algorithm: 'social',
          refreshable: true
        },
        {
          key: 'trending_now',
          title: 'Trending Now',
          description: 'Popular across all platforms',
          items: trending.slice(0, 15),
          algorithm: 'trending',
          refreshable: true
        }
      ];

      // Store recommendations in database for analytics
      await this.storeRecommendations(userId, sections);

      console.log(`✅ Generated ${sections.reduce((sum, s) => sum + s.items.length, 0)} recommendations`);
      return sections;

    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }

  private static async storeRecommendations(userId: string, sections: RecommendationSection[]): Promise<void> {
    try {
      // Clear old recommendations
      await db.delete(aiRecommendations).where(eq(aiRecommendations.userId, userId));

      // Store new recommendations
      const toInsert = sections.flatMap(section => 
        section.items.map(item => ({
          userId,
          showId: item.contentId,
          score: item.finalScore,
          reason: item.explanation.primaryReason,
          recommendationType: item.algorithmType,
          metadata: JSON.stringify({
            section: section.key,
            explanation: item.explanation,
            confidence: item.confidence
          })
        }))
      );

      if (toInsert.length > 0) {
        await db.insert(aiRecommendations).values(toInsert);
      }
    } catch (error) {
      console.error('Error storing recommendations:', error);
    }
  }
}
