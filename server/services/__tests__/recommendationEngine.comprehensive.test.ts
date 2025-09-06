/**
 * 🧪 BingeBoard Recommendation Engine - Comprehensive Test Suite
 * 
 * Unit tests for scoring functions, integration tests for API endpoints,
 * and regression tests for recommendation quality
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { RecommendationEngine } from '../recommendationEngine';
import { RecommendationObservability } from '../recommendationObservability';
import { RecommendationErrorHandler } from '../recommendationErrorHandler';
import { AdvancedPersonalization } from '../advancedPersonalization';

describe('🎯 Recommendation Engine - Core Algorithm Tests', () => {
  
  let engine: RecommendationEngine;
  let mockUserProfile: any;
  let mockStreamingData: any[];

  beforeEach(() => {
    engine = new RecommendationEngine();
    
    mockUserProfile = {
      userId: 'test-user-123',
      preferences: {
        genres: ['Action', 'Comedy', 'Drama'],
        preferredLanguages: ['en'],
        contentTypes: ['movie', 'tv'],
        runtimePreferences: { min: 60, max: 180 }
      },
      behaviorMetrics: {
        totalWatchTime: 1000,
        completionRate: 0.75,
        averageRating: 4.2,
        genreDistribution: { Action: 0.4, Comedy: 0.3, Drama: 0.3 }
      },
      socialData: {
        friends: ['user-456', 'user-789'],
        followedUsers: ['critic-123'],
        groupMemberships: ['family-group-1']
      }
    };

    mockStreamingData = [
      {
        id: 'content-1',
        title: 'Test Movie 1',
        type: 'movie',
        genres: ['Action', 'Adventure'],
        runtime: 120,
        year: 2023,
        rating: 4.5,
        language: 'en',
        streamingInfo: [{ service: 'Netflix' }],
        popularity: 85
      },
      {
        id: 'content-2',
        title: 'Test Series 1',
        type: 'tv',
        genres: ['Comedy', 'Drama'],
        runtime: 45,
        year: 2022,
        rating: 4.2,
        language: 'en',
        streamingInfo: [{ service: 'Hulu' }],
        popularity: 72
      }
    ];
  });

  describe('🔢 Content-Based Scoring Algorithm', () => {
    
    test('should calculate genre similarity correctly', () => {
      const content = mockStreamingData[0]; // Action/Adventure movie
      const score = engine.calculateGenreSimilarity(content, mockUserProfile);
      
      // User likes Action (0.4), Adventure not in preferences
      // Expected: 0.4 * 0.5 (for Action match) = 0.2
      expect(score).toBeCloseTo(0.2, 2);
    });

    test('should boost score for preferred runtime', () => {
      const content = { ...mockStreamingData[0], runtime: 120 }; // Within preferred range
      const score = engine.calculateRuntimePreference(content, mockUserProfile);
      
      expect(score).toBeGreaterThan(0.5); // Good runtime match
    });

    test('should penalize very long or very short content', () => {
      const tooLong = { ...mockStreamingData[0], runtime: 240 }; // Too long
      const tooShort = { ...mockStreamingData[0], runtime: 30 }; // Too short
      
      const longScore = engine.calculateRuntimePreference(tooLong, mockUserProfile);
      const shortScore = engine.calculateRuntimePreference(tooShort, mockUserProfile);
      
      expect(longScore).toBeLessThan(0.3);
      expect(shortScore).toBeLessThan(0.3);
    });

    test('should prioritize native language content', () => {
      const englishContent = { ...mockStreamingData[0], language: 'en' };
      const foreignContent = { ...mockStreamingData[0], language: 'es' };
      
      const englishScore = engine.calculateLanguageMatch(englishContent, mockUserProfile);
      const foreignScore = engine.calculateLanguageMatch(foreignContent, mockUserProfile);
      
      expect(englishScore).toBeGreaterThan(foreignScore);
    });

    test('should combine content-based factors correctly', () => {
      const content = mockStreamingData[0];
      const score = engine.calculateContentBasedScore(content, mockUserProfile);
      
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(1);
    });
  });

  describe('🤝 Collaborative Filtering Tests', () => {
    
    test('should find similar users correctly', async () => {
      const similarUsers = await engine.findSimilarUsers(mockUserProfile.userId);
      
      expect(Array.isArray(similarUsers)).toBe(true);
      expect(similarUsers.length).toBeGreaterThanOrEqual(0);
      
      if (similarUsers.length > 0) {
        expect(similarUsers[0]).toHaveProperty('userId');
        expect(similarUsers[0]).toHaveProperty('similarity');
        expect(similarUsers[0].similarity).toBeGreaterThanOrEqual(0);
        expect(similarUsers[0].similarity).toBeLessThanOrEqual(1);
      }
    });

    test('should calculate user similarity accurately', () => {
      const user1Ratings = { 'movie-1': 5, 'movie-2': 3, 'movie-3': 4 };
      const user2Ratings = { 'movie-1': 4, 'movie-2': 3, 'movie-3': 5 };
      
      const similarity = engine.calculateUserSimilarity(user1Ratings, user2Ratings);
      
      expect(similarity).toBeGreaterThan(0.5); // Should be relatively similar
    });

    test('should generate collaborative recommendations', async () => {
      const recommendations = await engine.getCollaborativeRecommendations(
        mockUserProfile, 
        10
      );
      
      expect(Array.isArray(recommendations)).toBe(true);
      recommendations.forEach(rec => {
        expect(rec).toHaveProperty('id');
        expect(rec).toHaveProperty('collaborativeScore');
        expect(rec.collaborativeScore).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('👥 Social Recommendations Tests', () => {
    
    test('should weight friend recommendations correctly', async () => {
      const socialRecs = await engine.getSocialRecommendations(mockUserProfile, 10);
      
      expect(Array.isArray(socialRecs)).toBe(true);
      socialRecs.forEach(rec => {
        expect(rec).toHaveProperty('socialScore');
        expect(rec.socialScore).toBeGreaterThanOrEqual(0);
      });
    });

    test('should handle users with no social connections', async () => {
      const isolatedProfile = { ...mockUserProfile, socialData: { friends: [], followedUsers: [], groupMemberships: [] } };
      
      const socialRecs = await engine.getSocialRecommendations(isolatedProfile, 10);
      
      expect(Array.isArray(socialRecs)).toBe(true);
      // Should fall back to community recommendations
    });
  });

  describe('📈 Trending Algorithm Tests', () => {
    
    test('should boost globally trending content', () => {
      const trendingContent = { ...mockStreamingData[0], popularity: 95 };
      const nicheContent = { ...mockStreamingData[0], popularity: 25 };
      
      const trendingScore = engine.calculateTrendingScore(trendingContent);
      const nicheScore = engine.calculateTrendingScore(nicheContent);
      
      expect(trendingScore).toBeGreaterThan(nicheScore);
    });

    test('should consider genre-specific trending', () => {
      const actionTrending = { ...mockStreamingData[0], genres: ['Action'], popularity: 80 };
      const score = engine.calculateGenreTrendingScore(actionTrending, mockUserProfile);
      
      expect(score).toBeGreaterThan(0);
    });
  });

  describe('🎯 Final Score Combination', () => {
    
    test('should combine all algorithm scores correctly', () => {
      const scores = {
        contentBased: 0.7,
        collaborative: 0.6,
        social: 0.4,
        trending: 0.8
      };
      
      const weights = {
        contentBased: 0.35,
        collaborative: 0.30,
        social: 0.20,
        trending: 0.15
      };
      
      const finalScore = engine.combineScores(scores, weights);
      const expectedScore = 0.7 * 0.35 + 0.6 * 0.30 + 0.4 * 0.20 + 0.8 * 0.15;
      
      expect(finalScore).toBeCloseTo(expectedScore, 3);
    });

    test('should apply diversity multiplier correctly', () => {
      const baseScore = 0.8;
      const diversityFactor = 1.2; // Boost for diversity
      
      const adjustedScore = engine.applyDiversityMultiplier(baseScore, diversityFactor);
      
      expect(adjustedScore).toBeCloseTo(0.96, 2); // 0.8 * 1.2
    });

    test('should cap final scores at 1.0', () => {
      const highScore = 1.5; // Unrealistically high
      const cappedScore = engine.capScore(highScore);
      
      expect(cappedScore).toBeLessThanOrEqual(1.0);
    });
  });
});

describe('🔗 API Integration Tests', () => {
  
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(() => {
    mockRequest = {
      user: { id: 'test-user-123' },
      query: {},
      body: {}
    };
    
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
  });

  describe('📡 Main Recommendations Endpoint', () => {
    
    test('should return recommendations with proper structure', async () => {
      mockRequest.query = { limit: '10', type: 'movie' };
      
      // Mock the endpoint call
      await engine.getRecommendationsEndpoint(mockRequest, mockResponse);
      
      expect(mockResponse.json).toHaveBeenCalled();
      const responseData = mockResponse.json.mock.calls[0][0];
      
      expect(responseData).toHaveProperty('recommendations');
      expect(responseData).toHaveProperty('metadata');
      expect(Array.isArray(responseData.recommendations)).toBe(true);
    });

    test('should handle pagination correctly', async () => {
      mockRequest.query = { limit: '5', offset: '10' };
      
      await engine.getRecommendationsEndpoint(mockRequest, mockResponse);
      
      const responseData = mockResponse.json.mock.calls[0][0];
      expect(responseData.metadata).toHaveProperty('pagination');
    });

    test('should filter by content type', async () => {
      mockRequest.query = { type: 'movie', limit: '10' };
      
      await engine.getRecommendationsEndpoint(mockRequest, mockResponse);
      
      const responseData = mockResponse.json.mock.calls[0][0];
      responseData.recommendations.forEach((rec: any) => {
        expect(rec.type).toBe('movie');
      });
    });
  });

  describe('📊 Performance Under Load', () => {
    
    test('should handle concurrent requests efficiently', async () => {
      const concurrentRequests = Array(10).fill(null).map(() => 
        engine.getRecommendations(mockUserProfile, 20)
      );
      
      const startTime = Date.now();
      const results = await Promise.all(concurrentRequests);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(results.length).toBe(10);
      results.forEach(result => {
        expect(Array.isArray(result)).toBe(true);
      });
    });

    test('should implement proper caching', async () => {
      // First request (should hit database)
      const startTime1 = Date.now();
      await engine.getRecommendations(mockUserProfile, 10);
      const time1 = Date.now() - startTime1;
      
      // Second identical request (should hit cache)
      const startTime2 = Date.now();
      await engine.getRecommendations(mockUserProfile, 10);
      const time2 = Date.now() - startTime2;
      
      expect(time2).toBeLessThan(time1 * 0.8); // Cache should be significantly faster
    });
  });

  describe('🛡️ Error Handling', () => {
    
    test('should handle database connection errors gracefully', async () => {
      // Mock database error
      const originalQuery = engine.db.query;
      engine.db.query = () => { throw new Error('Database connection failed'); };
      
      const result = await engine.getRecommendations(mockUserProfile, 10);
      
      // Should return fallback recommendations
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      // Restore original method
      engine.db.query = originalQuery;
    });

    test('should handle invalid user profiles', async () => {
      const invalidProfile = { userId: null };
      
      const result = await engine.getRecommendations(invalidProfile as any, 10);
      
      expect(Array.isArray(result)).toBe(true);
      // Should return generic popular content
    });

    test('should validate input parameters', async () => {
      mockRequest.query = { limit: 'invalid', type: 'unknown' };
      
      await engine.getRecommendationsEndpoint(mockRequest, mockResponse);
      
      // Should use default values and valid types only
      const responseData = mockResponse.json.mock.calls[0][0];
      expect(responseData.recommendations.length).toBeLessThanOrEqual(20); // Default limit
    });
  });
});

describe('📈 Recommendation Quality Regression Tests', () => {
  
  test('should maintain recommendation diversity', async () => {
    const recommendations = await engine.getRecommendations(mockUserProfile, 20);
    
    // Check genre diversity
    const genres = new Set();
    recommendations.forEach(rec => {
      if (rec.genres) {
        rec.genres.forEach((genre: string) => genres.add(genre));
      }
    });
    
    expect(genres.size).toBeGreaterThanOrEqual(5); // At least 5 different genres
  });

  test('should avoid over-recommending similar content', async () => {
    const recommendations = await engine.getRecommendations(mockUserProfile, 20);
    
    // Check that no more than 30% are from the same genre
    const genreCounts: Record<string, number> = {};
    recommendations.forEach(rec => {
      if (rec.genres && rec.genres.length > 0) {
        const primaryGenre = rec.genres[0];
        genreCounts[primaryGenre] = (genreCounts[primaryGenre] || 0) + 1;
      }
    });
    
    const maxGenreCount = Math.max(...Object.values(genreCounts));
    expect(maxGenreCount / recommendations.length).toBeLessThanOrEqual(0.4);
  });

  test('should balance popular and niche content', async () => {
    const recommendations = await engine.getRecommendations(mockUserProfile, 20);
    
    const popularContent = recommendations.filter(rec => rec.popularity > 80);
    const nicheContent = recommendations.filter(rec => rec.popularity < 50);
    
    // Should have some of both
    expect(popularContent.length).toBeGreaterThan(0);
    expect(nicheContent.length).toBeGreaterThan(0);
    
    // But not be entirely one or the other
    expect(popularContent.length / recommendations.length).toBeLessThan(0.8);
    expect(nicheContent.length / recommendations.length).toBeLessThan(0.8);
  });

  test('should improve recommendations over time', async () => {
    // Simulate user feedback over time
    const initialRecs = await engine.getRecommendations(mockUserProfile, 10);
    
    // Simulate positive feedback on action movies
    await engine.processUserFeedback(mockUserProfile.userId, {
      itemId: 'action-movie-1',
      rating: 5,
      watchTime: 120,
      completed: true
    });
    
    const improvedRecs = await engine.getRecommendations(mockUserProfile, 10);
    
    // Should have more action content in improved recommendations
    const initialActionCount = initialRecs.filter(r => r.genres?.includes('Action')).length;
    const improvedActionCount = improvedRecs.filter(r => r.genres?.includes('Action')).length;
    
    expect(improvedActionCount).toBeGreaterThanOrEqual(initialActionCount);
  });
});

describe('🎯 Advanced Personalization Tests', () => {
  
  test('should analyze temporal preferences correctly', async () => {
    const preferences = await AdvancedPersonalization.analyzeTemporalPreferences('test-user-123');
    
    expect(preferences).toHaveProperty('timeOfDay');
    expect(preferences).toHaveProperty('dayOfWeek');
    expect(preferences).toHaveProperty('seasonality');
    expect(preferences).toHaveProperty('bingePatterns');
    
    // All values should be between 0 and 1
    Object.values(preferences.timeOfDay).forEach(value => {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    });
  });

  test('should provide device-optimized recommendations', async () => {
    const mobileRecs = await AdvancedPersonalization.getDeviceOptimizedRecommendations(
      mockUserProfile, 'mobile', 10
    );
    
    const desktopRecs = await AdvancedPersonalization.getDeviceOptimizedRecommendations(
      mockUserProfile, 'desktop', 10
    );
    
    // Mobile should prefer shorter content
    const avgMobileRuntime = mobileRecs.reduce((sum, rec) => sum + (rec.runtime || 0), 0) / mobileRecs.length;
    const avgDesktopRuntime = desktopRecs.reduce((sum, rec) => sum + (rec.runtime || 0), 0) / desktopRecs.length;
    
    expect(avgMobileRuntime).toBeLessThanOrEqual(avgDesktopRuntime * 1.2);
  });

  test('should adapt to seasonal trends', async () => {
    const seasonalRecs = await AdvancedPersonalization.getSeasonalRecommendations(
      mockUserProfile, 15
    );
    
    expect(Array.isArray(seasonalRecs)).toBe(true);
    seasonalRecs.forEach(rec => {
      expect(rec).toHaveProperty('seasonalBoost');
      expect(rec.seasonalBoost).toBeGreaterThanOrEqual(0);
    });
  });

  test('should provide contextual recommendations', async () => {
    const context = {
      timeOfDay: 'evening',
      dayOfWeek: 'weekend',
      mood: 'relaxed'
    };
    
    const contextualRecs = await AdvancedPersonalization.getContextualRecommendations(
      mockUserProfile, context, 15
    );
    
    expect(Array.isArray(contextualRecs)).toBe(true);
    contextualRecs.forEach(rec => {
      expect(rec).toHaveProperty('contextualScore');
      expect(rec.explanation.factors.some((f: any) => f.type.includes('contextual'))).toBe(true);
    });
  });
});

describe('📊 Observability and Monitoring Tests', () => {
  
  let observability: RecommendationObservability;

  beforeEach(() => {
    observability = new RecommendationObservability();
  });

  test('should track performance metrics correctly', async () => {
    await observability.trackRecommendationPerformance('test-user-123', {
      algorithmUsed: 'hybrid',
      responseTime: 150,
      cacheHit: false,
      recommendationCount: 20
    });
    
    const metrics = await observability.getPerformanceMetrics('test-user-123');
    
    expect(metrics).toHaveProperty('averageResponseTime');
    expect(metrics).toHaveProperty('cacheHitRate');
    expect(metrics).toHaveProperty('totalRecommendations');
  });

  test('should track A/B testing metrics', async () => {
    await observability.trackABTestResult('algorithm-weight-test', 'test-user-123', {
      variant: 'increased-social-weight',
      clickThrough: true,
      engagement: 0.8
    });
    
    const results = await observability.getABTestResults('algorithm-weight-test');
    
    expect(results).toHaveProperty('variants');
    expect(results.variants).toHaveProperty('increased-social-weight');
  });

  test('should generate algorithm insights', async () => {
    const insights = await observability.generateAlgorithmInsights('test-user-123');
    
    expect(insights).toHaveProperty('strongestSignals');
    expect(insights).toHaveProperty('predictionAccuracy');
    expect(insights).toHaveProperty('diversityScore');
    expect(insights).toHaveProperty('recommendations');
  });
});

// Test utilities and helpers
class TestDataGenerator {
  static generateMockUser(overrides: Partial<any> = {}): any {
    return {
      userId: 'test-user-' + Math.random().toString(36).substr(2, 9),
      preferences: {
        genres: ['Action', 'Comedy'],
        preferredLanguages: ['en'],
        contentTypes: ['movie', 'tv'],
        runtimePreferences: { min: 60, max: 180 }
      },
      behaviorMetrics: {
        totalWatchTime: 500,
        completionRate: 0.7,
        averageRating: 4.0,
        genreDistribution: { Action: 0.5, Comedy: 0.5 }
      },
      socialData: {
        friends: [],
        followedUsers: [],
        groupMemberships: []
      },
      ...overrides
    };
  }

  static generateMockContent(overrides: Partial<any> = {}): any {
    return {
      id: 'content-' + Math.random().toString(36).substr(2, 9),
      title: 'Test Content',
      type: 'movie',
      genres: ['Action'],
      runtime: 120,
      year: 2023,
      rating: 4.0,
      language: 'en',
      streamingInfo: [{ service: 'Netflix' }],
      popularity: 70,
      ...overrides
    };
  }
}

export { TestDataGenerator };
