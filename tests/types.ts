// Type definitions for enhanced test suite
import type { User } from '../shared/schema';
import type { UserProfile, MoodType as PersonalizationMoodType } from '../server/services/advancedPersonalization';

export interface MockUserProfileOptions {
  userId?: string;
  preferences?: {
    genres?: string[];
    preferredLanguages?: string[];
    contentTypes?: ('movie' | 'tv')[];
    runtimePreferences?: { min: number; max: number };
  };
  behavior?: {
    totalWatchTime?: number;
    completionRate?: number;
    averageRating?: number;
    genreDistribution?: Record<string, number>;
  };
  socialData?: {
    friends?: string[];
    followedUsers?: string[];
    groupMemberships?: string[];
  };
}

export interface TestUser extends User {
  profile: UserProfile;
}

export interface MockRecommendationOptions {
  count?: number;
  includeExplanations?: boolean;
  includeMetrics?: boolean;
}

export interface TestMetrics {
  timestamp: Date;
  userId: string;
  responseTime: number;
  cacheHit: boolean;
  errorCount: number;
}

export type MoodType = 'ENERGETIC' | 'CALM' | 'FOCUSED' | 'CREATIVE' | 'SOCIAL';

export interface PropertyTestOptions {
  iterations?: number;
  seed?: number;
  timeout?: number;
}

export interface StressTestConfig {
  concurrentUsers?: number;
  requestsPerUser?: number;
  duration?: number;
}
