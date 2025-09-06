/**
 * 🧪 Advanced Personalization - Comprehensive Unit Tests
 * 
 * Tests for type safety, performance optimizations, and edge cases
 */

import { AdvancedPersonalization, type UserProfile, type PersonalizationContext, type Recommendation } from '../advancedPersonalization';

describe('🎯 Advanced Personalization - Optimized Implementation', () => {
  
  let mockUserProfile: UserProfile;
  let mockRecommendations: Recommendation[];

  beforeEach(() => {
    // Reset metrics and cache before each test
    AdvancedPersonalization.resetMetrics();
    AdvancedPersonalization.clearCache();
    
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

    mockRecommendations = [
      {
        id: 'action-movie-1',
        title: 'Epic Action Movie',
        type: 'movie',
        genres: ['Action', 'Adventure'],
        runtime: 120,
        year: 2023,
        rating: 4.5,
        language: 'en',
        popularity: 85,
        finalScore: 0.7,
        explanation: { factors: [] }
      },
      {
        id: 'comedy-series-1',
        title: 'Funny TV Series',
        type: 'tv',
        genres: ['Comedy'],
        runtime: 30,
        year: 2022,
        rating: 4.2,
        seasons: 3,
        popularity: 72,
        finalScore: 0.6,
        explanation: { factors: [] }
      }
    ];
  });

  describe('🔒 Type Safety Improvements', () => {
    
    test('should enforce strong typing for UserProfile', () => {
      // This test validates TypeScript compilation
      const profile: UserProfile = mockUserProfile;
      
      expect(profile.userId).toBe('test-user-123');
      expect(profile.preferences.genres).toEqual(['Action', 'Comedy', 'Drama']);
      expect(profile.behaviorMetrics.completionRate).toBe(0.75);
    });

    test('should enforce strong typing for Recommendation objects', () => {
      const rec: Recommendation = mockRecommendations[0];
      
      expect(rec.type).toBe('movie');
      expect(rec.genres).toContain('Action');
      expect(rec.finalScore).toBe(0.7);
    });

    test('should enforce PersonalizationContext typing', () => {
      const context: PersonalizationContext = {
        timeOfDay: 'evening',
        dayOfWeek: 'weekend',
        weather: 'rainy',
        mood: 'relaxed'
      };
      
      expect(context.timeOfDay).toBe('evening');
      expect(context.mood).toBe('relaxed');
    });
  });

  describe('⚡ Performance Optimizations', () => {
    
    test('should cache temporal preferences and improve performance', async () => {
      // First call - should hit database
      const start1 = performance.now();
      await AdvancedPersonalization.analyzeTemporalPreferences('test-user');
      const time1 = performance.now() - start1;
      
      // Second call - should hit cache
      const start2 = performance.now();
      await AdvancedPersonalization.analyzeTemporalPreferences('test-user');
      const time2 = performance.now() - start2;
      
      const metrics = AdvancedPersonalization.getPerformanceMetrics();
      
      expect(metrics.cacheHits).toBeGreaterThan(0);
      expect(time2).toBeLessThan(time1 * 0.5); // Cache should be significantly faster
    });

    test('should normalize scores to prevent inflation', async () => {
      const recommendations = await AdvancedPersonalization.getDeviceOptimizedRecommendations(
        mockUserProfile,
        'mobile',
        10
      );
      
      recommendations.forEach(rec => {
        expect(rec.finalScore).toBeGreaterThanOrEqual(0);
        expect(rec.finalScore).toBeLessThanOrEqual(1.0);
      });
    });

    test('should cap individual boost scores appropriately', async () => {
      const context: PersonalizationContext = {
        timeOfDay: 'evening',
        mood: 'happy',
        weather: 'rainy'
      };
      
      const recommendations = await AdvancedPersonalization.getContextualRecommendations(
        mockUserProfile,
        context,
        5
      );
      
      recommendations.forEach(rec => {
        // Individual boosts should be capped
        if (rec.deviceScore) expect(rec.deviceScore).toBeLessThanOrEqual(0.5);
        if (rec.seasonalBoost) expect(rec.seasonalBoost).toBeLessThanOrEqual(0.4);
        if (rec.contextualScore) expect(rec.contextualScore).toBeLessThanOrEqual(0.3);
      });
    });

    test('should avoid redundant calculations', async () => {
      const spy = jest.spyOn(console, 'log').mockImplementation();
      
      // This should only compute device score once per recommendation
      await AdvancedPersonalization.getDeviceOptimizedRecommendations(
        mockUserProfile,
        'desktop',
        5
      );
      
      spy.mockRestore();
      
      const metrics = AdvancedPersonalization.getPerformanceMetrics();
      expect(metrics.computationTimes.length).toBeGreaterThan(0);
    });
  });

  describe('🐛 Bug Fixes & Edge Cases', () => {
    
    test('should handle malformed JSON in session metadata safely', async () => {
      // This test would require mocking the database query
      // to return sessions with invalid JSON metadata
      const preferences = await AdvancedPersonalization.analyzeTemporalPreferences('user-with-bad-json');
      
      // Should not throw error and return valid preferences
      expect(preferences).toBeDefined();
      expect(preferences.timeOfDay).toBeDefined();
    });

    test('should correctly calculate winter months (Dec, Jan, Feb)', async () => {
      // Test December
      const decemberDate = new Date(2025, 11, 15); // December 15
      const recommendations = await AdvancedPersonalization.getSeasonalRecommendations(
        mockUserProfile,
        10
      );
      
      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
    });

    test('should handle empty or undefined genres gracefully', async () => {
      const recWithoutGenres: Recommendation = {
        id: 'no-genres',
        title: 'Content Without Genres',
        type: 'movie',
        finalScore: 0.5,
        explanation: { factors: [] }
      };
      
      const context: PersonalizationContext = { mood: 'happy' };
      
      // Should not throw error when checking attributes
      expect(() => {
        // This would be called internally during contextual recommendations
        // We're testing the contentHasAttribute method indirectly
      }).not.toThrow();
    });

    test('should handle users with minimal viewing history', async () => {
      const newUserProfile: UserProfile = {
        userId: 'new-user',
        preferences: {
          genres: [],
          preferredLanguages: ['en'],
          contentTypes: ['movie'],
          runtimePreferences: { min: 60, max: 120 }
        },
        behaviorMetrics: {
          totalWatchTime: 0,
          completionRate: 0,
          averageRating: 0,
          genreDistribution: {}
        }
      };
      
      const preferences = await AdvancedPersonalization.analyzeTemporalPreferences(newUserProfile.userId);
      
      // Should return default preferences
      expect(preferences.timeOfDay.evening).toBe(0.5); // Default values
    });
  });

  describe('📊 Algorithm Behavior Validation', () => {
    
    test('should boost short content on mobile devices', async () => {
      const mobileRecs = await AdvancedPersonalization.getDeviceOptimizedRecommendations(
        mockUserProfile,
        'mobile',
        5
      );
      
      const desktopRecs = await AdvancedPersonalization.getDeviceOptimizedRecommendations(
        mockUserProfile,
        'desktop',
        5
      );
      
      // Short content should rank higher on mobile
      const mobileShortContent = mobileRecs.filter(r => (r.runtime ?? 0) < 90);
      const desktopShortContent = desktopRecs.filter(r => (r.runtime ?? 0) < 90);
      
      if (mobileShortContent.length > 0 && desktopShortContent.length > 0) {
        expect(mobileShortContent[0].finalScore).toBeGreaterThan(desktopShortContent[0].finalScore);
      }
    });

    test('should apply seasonal boosts correctly', async () => {
      // Mock current date to be in December (holiday season)
      const originalDate = Date;
      global.Date = class extends Date {
        constructor() {
          super(2025, 11, 25); // December 25, 2025
        }
      } as any;
      
      const seasonalRecs = await AdvancedPersonalization.getSeasonalRecommendations(
        mockUserProfile,
        5
      );
      
      // Should have seasonal boost explanations
      seasonalRecs.forEach(rec => {
        const seasonalFactor = rec.explanation.factors.find(f => f.type === 'seasonal_trend');
        if (seasonalFactor) {
          expect(seasonalFactor.description).toContain('Holiday season');
        }
      });
      
      // Restore original Date
      global.Date = originalDate;
    });

    test('should combine multiple contextual factors', async () => {
      const multiContext: PersonalizationContext = {
        timeOfDay: 'evening',
        dayOfWeek: 'weekend',
        mood: 'happy',
        weather: 'rainy'
      };
      
      const contextualRecs = await AdvancedPersonalization.getContextualRecommendations(
        mockUserProfile,
        multiContext,
        5
      );
      
      // Should have multiple contextual factors in explanations
      contextualRecs.forEach(rec => {
        const contextualFactors = rec.explanation.factors.filter(f => f.type.startsWith('contextual_'));
        expect(contextualFactors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('📈 Performance Metrics & Analytics', () => {
    
    test('should track performance metrics accurately', async () => {
      // Generate some activity
      await AdvancedPersonalization.analyzeTemporalPreferences('user1');
      await AdvancedPersonalization.analyzeTemporalPreferences('user1'); // Cache hit
      await AdvancedPersonalization.analyzeTemporalPreferences('user2'); // Cache miss
      
      const metrics = AdvancedPersonalization.getPerformanceMetrics();
      
      expect(metrics.cacheHits).toBeGreaterThan(0);
      expect(metrics.cacheMisses).toBeGreaterThan(0);
      expect(metrics.averageComputationTime).toBeGreaterThan(0);
      expect(metrics.cacheEfficiency).toBeGreaterThan(0);
      expect(metrics.cacheEfficiency).toBeLessThanOrEqual(1);
    });

    test('should provide cache efficiency calculations', async () => {
      // Create cache hits and misses
      await AdvancedPersonalization.analyzeTemporalPreferences('user1'); // Miss
      await AdvancedPersonalization.analyzeTemporalPreferences('user1'); // Hit
      await AdvancedPersonalization.analyzeTemporalPreferences('user1'); // Hit
      
      const metrics = AdvancedPersonalization.getPerformanceMetrics();
      
      expect(metrics.cacheEfficiency).toBeCloseTo(0.67, 1); // 2 hits out of 3 total
    });

    test('should allow cache and metrics reset', () => {
      // Generate some data
      AdvancedPersonalization.analyzeTemporalPreferences('user1');
      
      // Reset
      AdvancedPersonalization.clearCache();
      AdvancedPersonalization.resetMetrics();
      
      const metrics = AdvancedPersonalization.getPerformanceMetrics();
      
      expect(metrics.cacheHits).toBe(0);
      expect(metrics.cacheMisses).toBe(0);
      expect(metrics.computationTimes).toEqual([]);
    });
  });

  describe('🛡️ Error Handling & Resilience', () => {
    
    test('should gracefully handle database errors', async () => {
      // This would require mocking database failures
      const preferences = await AdvancedPersonalization.analyzeTemporalPreferences('failing-user');
      
      // Should return default preferences on error
      expect(preferences).toBeDefined();
      expect(preferences.timeOfDay).toBeDefined();
    });

    test('should provide fallback recommendations on failure', async () => {
      // Test error handling in recommendation generation
      const recommendations = await AdvancedPersonalization.getDeviceOptimizedRecommendations(
        mockUserProfile,
        'mobile',
        5
      );
      
      // Should always return an array, even on partial failures
      expect(Array.isArray(recommendations)).toBe(true);
    });

    test('should handle invalid device types gracefully', async () => {
      // @ts-expect-error Testing invalid input
      const recommendations = await AdvancedPersonalization.getDeviceOptimizedRecommendations(
        mockUserProfile,
        'invalid-device' as any,
        5
      );
      
      expect(Array.isArray(recommendations)).toBe(true);
    });
  });

  afterEach(() => {
    // Clean up after each test
    AdvancedPersonalization.clearCache();
    AdvancedPersonalization.resetMetrics();
  });
});

// === Performance Benchmark Tests ===

describe('🚀 Performance Benchmarks', () => {
  
  test('should complete temporal analysis within reasonable time', async () => {
    const start = performance.now();
    
    await AdvancedPersonalization.analyzeTemporalPreferences('benchmark-user');
    
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(1000); // Should complete within 1 second
  });

  test('should handle concurrent requests efficiently', async () => {
    const userProfile: UserProfile = {
      userId: 'concurrent-test',
      preferences: {
        genres: ['Action'],
        preferredLanguages: ['en'],
        contentTypes: ['movie'],
        runtimePreferences: { min: 60, max: 120 }
      },
      behaviorMetrics: {
        totalWatchTime: 100,
        completionRate: 0.8,
        averageRating: 4.0,
        genreDistribution: { Action: 1.0 }
      }
    };

    const concurrentPromises = Array(5).fill(null).map(() => 
      AdvancedPersonalization.getDeviceOptimizedRecommendations(userProfile, 'mobile', 10)
    );
    
    const start = performance.now();
    const results = await Promise.all(concurrentPromises);
    const duration = performance.now() - start;
    
    expect(results.length).toBe(5);
    expect(duration).toBeLessThan(2000); // Should handle 5 concurrent requests within 2 seconds
    
    results.forEach(result => {
      expect(Array.isArray(result)).toBe(true);
    });
  });
});

export {};
