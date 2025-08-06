/**
 * Preferences API Logic
 * 
 * Centralized logic for handling user preferences across multiple storage backends
 * Created: August 5, 2025
 */

import { getFirestore, doc, setDoc, updateDoc, getDoc } from "firebase/firestore";
import app from "@/firebase/config";
import type { 
  UserPreferences, 
  PreferencesApiResponse, 
  PreferencesLoadResult,
  PreferencesSource,
  FirestorePreferencesDocument 
} from "@/types/preferences";

export class PreferencesService {
  private static db = getFirestore(app);

  /**
   * Save user preferences with multi-tier fallback
   * 1. Firebase Firestore (primary)
   * 2. Backend API (secondary) 
   * 3. localStorage (fallback)
   */
  static async savePreferences(
    userId: string, 
    userEmail: string, 
    preferences: UserPreferences
  ): Promise<PreferencesApiResponse> {
    // Try Firestore first
    try {
      const result = await this.saveToFirestore(userId, userEmail, preferences);
      if (result.success) {
        // Also backup to API
        this.saveToAPI(userId, preferences).catch(error => 
          console.warn('⚠️ API backup failed:', error)
        );
        return result;
      }
    } catch (error) {
      console.warn('⚠️ Firestore save failed:', error);
    }

    // Fallback to API
    try {
      const result = await this.saveToAPI(userId, preferences);
      if (result.success) {
        return result;
      }
    } catch (error) {
      console.warn('⚠️ API save failed:', error);
    }

    // Final fallback to localStorage
    return this.saveToLocalStorage(preferences);
  }

  /**
   * Load user preferences with multi-tier fallback
   */
  static async loadPreferences(userId?: string): Promise<PreferencesLoadResult> {
    if (userId) {
      // Try Firestore first
      try {
        const result = await this.loadFromFirestore(userId);
        if (result.success && result.preferences) {
          return result;
        }
      } catch (error) {
        console.warn('⚠️ Firestore load failed:', error);
      }

      // Fallback to API
      try {
        const result = await this.loadFromAPI();
        if (result.success && result.preferences) {
          return result;
        }
      } catch (error) {
        console.warn('⚠️ API load failed:', error);
      }
    }

    // Final fallback to localStorage
    return this.loadFromLocalStorage();
  }

  /**
   * Firebase Firestore operations
   */
  private static async saveToFirestore(
    userId: string, 
    userEmail: string, 
    preferences: UserPreferences
  ): Promise<PreferencesApiResponse> {
    const userDocRef = doc(this.db, "userPreferences", userId);
    const userDocSnap = await getDoc(userDocRef);
    
    const documentData: FirestorePreferencesDocument = {
      userId,
      userEmail,
      preferences,
      createdAt: userDocSnap.exists() ? userDocSnap.data().createdAt : new Date(),
      updatedAt: new Date(),
    };

    if (userDocSnap.exists()) {
      await updateDoc(userDocRef, {
        preferences: preferences,
        updatedAt: new Date(),
      });
      console.log('✅ Preferences updated in Firestore');
    } else {
      await setDoc(userDocRef, documentData);
      console.log('✅ Preferences created in Firestore');
    }

    return { success: true, preferences };
  }

  private static async loadFromFirestore(userId: string): Promise<PreferencesLoadResult> {
    const userDocRef = doc(this.db, "userPreferences", userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      const data = userDocSnap.data() as FirestorePreferencesDocument;
      console.log('✅ Preferences loaded from Firestore');
      return {
        preferences: data.preferences,
        source: 'firestore',
        success: true
      };
    }

    return {
      source: 'firestore',
      success: false,
      error: 'Document not found'
    };
  }

  /**
   * Backend API operations
   */
  private static async saveToAPI(
    userId: string, 
    preferences: UserPreferences
  ): Promise<PreferencesApiResponse> {
    const response = await fetch('/api/user/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        userId,
        preferences,
      }),
    });

    if (!response.ok) {
      throw new Error(`API save failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Preferences saved to backend API');
    return { success: true, preferences: data.preferences || preferences };
  }

  private static async loadFromAPI(): Promise<PreferencesLoadResult> {
    const response = await fetch('/api/user/preferences', {
      credentials: 'include',
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.preferences) {
        console.log('✅ Preferences loaded from API');
        return {
          preferences: data.preferences,
          source: 'api',
          success: true
        };
      }
    }

    return {
      source: 'api',
      success: false,
      error: `API load failed: ${response.status}`
    };
  }

  /**
   * localStorage operations
   */
  static saveToLocalStorage(preferences: UserPreferences): PreferencesApiResponse {
    try {
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
      console.log('💾 Preferences saved to localStorage');
      return { success: true, preferences };
    } catch (error) {
      console.error('❌ localStorage save failed:', error);
      return { success: false, error: 'localStorage save failed' };
    }
  }

  private static loadFromLocalStorage(): PreferencesLoadResult {
    try {
      const stored = localStorage.getItem('userPreferences');
      if (stored) {
        const preferences = JSON.parse(stored) as UserPreferences;
        console.log('✅ Preferences loaded from localStorage');
        return {
          preferences,
          source: 'localStorage',
          success: true
        };
      }
    } catch (error) {
      console.error('❌ localStorage load failed:', error);
    }

    return {
      source: 'localStorage',
      success: false,
      error: 'No preferences found in localStorage'
    };
  }

  /**
   * Utility methods
   */
  static getDefaultPreferences(): UserPreferences {
    return {
      favoriteGenres: [],
      viewingStyle: [],
      defaultRecommendationMode: 'ai'
    };
  }

  static validatePreferences(preferences: any): preferences is UserPreferences {
    return (
      preferences &&
      Array.isArray(preferences.favoriteGenres) &&
      Array.isArray(preferences.viewingStyle) &&
      typeof preferences.defaultRecommendationMode === 'string'
    );
  }
}
