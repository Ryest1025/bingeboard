import { vi } from 'vitest';
import type { MockUserProfileOptions, TestUser, TestMetrics } from './types';
import type { UserProfile } from '../server/services/advancedPersonalization';

/**
 * Creates a mock user profile for testing
 */
export function createMockUserProfile(options: MockUserProfileOptions = {}): UserProfile {
  return {
    userId: options.userId || 'test-user-' + Math.random().toString(36).substr(2, 9),
    preferences: {
      genres: options.preferences?.genres || ['action', 'drama'],
      preferredLanguages: options.preferences?.preferredLanguages || ['en', 'es'],
      contentTypes: options.preferences?.contentTypes || ['movie', 'tv'],
      runtimePreferences: options.preferences?.runtimePreferences || { min: 60, max: 180 }
    },
    behaviorMetrics: {
      totalWatchTime: options.behavior?.totalWatchTime || 86400,
      completionRate: options.behavior?.completionRate || 0.75,
      averageRating: options.behavior?.averageRating || 4.2,
      genreDistribution: options.behavior?.genreDistribution || { action: 0.3, drama: 0.4, comedy: 0.3 }
    },
    socialData: {
      friends: options.socialData?.friends || [],
      followedUsers: options.socialData?.followedUsers || [],
      groupMemberships: options.socialData?.groupMemberships || []
    }
  };
}

/**
 * Creates a mock test user
 */
export function createMockTestUser(profileOptions: MockUserProfileOptions = {}): TestUser {
  return {
    id: 'test-user-' + Math.random().toString(36).substr(2, 9),
    email: 'test@example.com',
    username: 'testuser',
    createdAt: new Date(),
    updatedAt: new Date(),
    profile: createMockUserProfile(profileOptions)
  } as TestUser;
}

/**
 * Creates mock test metrics
 */
export function createMockMetrics(userId: string): TestMetrics {
  return {
    timestamp: new Date(),
    userId,
    responseTime: Math.random() * 1000,
    cacheHit: Math.random() > 0.5,
    errorCount: 0
  };
}

/**
 * Property-based testing helper for generating random user profiles
 */
export function generateRandomUserProfile(): UserProfile {
  const genres = ['action', 'drama', 'comedy', 'thriller', 'sci-fi', 'documentary'];
  const languages = ['en', 'es', 'fr', 'de', 'ja'];
  const contentTypes: ('movie' | 'tv')[] = ['movie', 'tv'];
  
  return {
    userId: 'random-user-' + Math.random().toString(36).substr(2, 9),
    preferences: {
      genres: shuffleArray(genres).slice(0, Math.floor(Math.random() * 3) + 1),
      preferredLanguages: shuffleArray(languages).slice(0, Math.floor(Math.random() * 2) + 1),
      contentTypes: shuffleArray(contentTypes).slice(0, Math.floor(Math.random() * 2) + 1),
      runtimePreferences: {
        min: Math.floor(Math.random() * 60) + 30, // 30-90 min
        max: Math.floor(Math.random() * 120) + 120 // 120-240 min
      }
    },
    behaviorMetrics: {
      totalWatchTime: Math.floor(Math.random() * 172800) + 3600, // 1hr to 48hrs
      completionRate: Math.random() * 0.8 + 0.2, // 0.2 to 1.0
      averageRating: Math.random() * 3 + 2, // 2.0 to 5.0
      genreDistribution: {
        action: Math.random(),
        drama: Math.random(),
        comedy: Math.random()
      }
    },
    socialData: {
      friends: [],
      followedUsers: [],
      groupMemberships: []
    }
  };
}

/**
 * Utility function to shuffle an array
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Mock timer helper for safe date/time testing
 */
export function mockSystemTime(date: Date | string | number) {
  vi.setSystemTime(date);
}

/**
 * Reset system time to current time
 */
export function resetSystemTime() {
  vi.useRealTimers();
  vi.useFakeTimers();
}

/**
 * Async test helper with timeout
 */
export async function withTimeout<T>(
  promise: Promise<T>, 
  timeoutMs: number = 5000,
  errorMessage = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    )
  ]);
}

/**
 * Performance testing helper
 */
export async function measurePerformance<T>(
  operation: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await operation();
  const duration = performance.now() - start;
  return { result, duration };
}
