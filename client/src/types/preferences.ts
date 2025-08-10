/**
 * User Preferences Types
 * 
 * Centralized type definitions for user preferences across the application
 * Created: August 5, 2025
 */

export interface UserPreferences {
  favoriteGenres: number[];
  viewingStyle: string[];
  defaultRecommendationMode: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PreferencesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (preferences: UserPreferences) => void;
}

export interface Genre {
  id: number;
  name: string;
}

export interface ViewingPreference {
  id: string;
  title: string;
  desc: string;
}

export interface PreferencesApiResponse {
  success: boolean;
  preferences?: UserPreferences;
  error?: string;
}

export interface FirestorePreferencesDocument {
  userId: string;
  userEmail?: string;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

// Viewing style options
export type ViewingStyleOption =
  | 'binge-worthy'
  | 'quick-watches'
  | 'highly-rated'
  | 'new-releases';

// Recommendation modes
export type RecommendationMode = 'ai' | 'trending' | 'popular' | 'new';

// Storage sources for preferences
export type PreferencesSource = 'firestore' | 'api' | 'localStorage';

export interface PreferencesLoadResult {
  preferences?: UserPreferences;
  source: PreferencesSource;
  success: boolean;
  error?: string;
}
