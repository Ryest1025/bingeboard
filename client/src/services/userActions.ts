/**
 * User Actions Service
 * Centralized service for watchlist, reminders, and user preferences
 */

import { apiFetch } from '@/utils/api-config';

export interface MediaItem {
  id: string;
  title?: string;
  name?: string;
  type: 'movie' | 'tv';
  poster_path?: string;
  backdrop_path?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  overview?: string;
  genre_ids?: number[];
  original_language?: string;
  imdb_id?: string;
}

export interface WatchlistItem extends MediaItem {
  addedAt: string;
  userId?: string;
  notes?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface ReminderItem extends MediaItem {
  remindAt: string;
  userId?: string;
  reminderType: 'release' | 'custom' | 'episode';
  isActive: boolean;
  notificationSent?: boolean;
  customMessage?: string;
}

export interface UserPreferences {
  userId?: string;
  favoriteGenres: number[];
  favoriteStreamingServices: string[];
  reminderSettings: {
    emailEnabled: boolean;
    pushEnabled: boolean;
    smsEnabled: boolean;
    advanceDays: number;
  };
  watchlistSettings: {
    autoRemoveWatched: boolean;
    sortBy: 'addedAt' | 'title' | 'releaseDate' | 'rating';
    showOnlyAvailable: boolean;
  };
}

/**
 * Local Storage Keys
 */
const STORAGE_KEYS = {
  WATCHLIST: 'bingeboard_watchlist',
  REMINDERS: 'bingeboard_reminders',
  PREFERENCES: 'bingeboard_preferences',
} as const;

/**
 * API Endpoints
 */
const API_ENDPOINTS = {
  WATCHLIST: '/api/user/watchlist',
  REMINDERS: '/api/user/reminders',
  PREFERENCES: '/api/user/preferences',
} as const;

class UserActionsService {
  private userId: string | null = null;

  /**
   * Set the current user ID
   */
  setUserId(userId: string | null) {
    this.userId = userId;
  }

  /**
   * Get stored data from localStorage with fallback
   */
  private getStoredData<T>(key: string, defaultValue: T): T {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
      console.warn(`Error parsing stored data for ${key}:`, error);
      return defaultValue;
    }
  }

  /**
   * Store data in localStorage
   */
  private setStoredData<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error storing data for ${key}:`, error);
    }
  }

  /**
   * Make API request with error handling
   */
  private async apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T | null> {
    try {
      const response = await apiFetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request error for ${endpoint}:`, error);
      return null;
    }
  }

  /**
   * Sync local data with server
   */
  private async syncWithServer<T>(
    localData: T,
    endpoint: string,
    storageKey: string
  ): Promise<T> {
    if (!this.userId) {
      return localData;
    }

    try {
      // Try to sync with server
      const serverData = await this.apiRequest<T>(endpoint);
      if (serverData) {
        // Update local storage with server data
        this.setStoredData(storageKey, serverData);
        return serverData;
      }
    } catch (error) {
      console.warn('Server sync failed, using local data:', error);
    }

    return localData;
  }

  // WATCHLIST METHODS

  /**
   * Get user's watchlist
   */
  async getWatchlist(): Promise<WatchlistItem[]> {
    const localWatchlist = this.getStoredData<WatchlistItem[]>(
      STORAGE_KEYS.WATCHLIST,
      []
    );

    return this.syncWithServer(
      localWatchlist,
      API_ENDPOINTS.WATCHLIST,
      STORAGE_KEYS.WATCHLIST
    );
  }

  /**
   * Add item to watchlist
   */
  async addToWatchlist(media: MediaItem): Promise<boolean> {
    try {
      const watchlist = await this.getWatchlist();
      
      // Check if item already exists
      const exists = watchlist.some(item => 
        item.id === media.id && item.type === media.type
      );

      if (exists) {
        console.warn('Item already in watchlist');
        return false;
      }

      const watchlistItem: WatchlistItem = {
        ...media,
        addedAt: new Date().toISOString(),
        userId: this.userId || undefined,
        priority: 'medium',
      };

      const updatedWatchlist = [...watchlist, watchlistItem];
      this.setStoredData(STORAGE_KEYS.WATCHLIST, updatedWatchlist);

      // Sync with server
      if (this.userId) {
        await this.apiRequest(API_ENDPOINTS.WATCHLIST, {
          method: 'POST',
          body: JSON.stringify(watchlistItem),
        });
      }

      return true;
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      return false;
    }
  }

  /**
   * Remove item from watchlist
   */
  async removeFromWatchlist(mediaId: string, mediaType: string): Promise<boolean> {
    try {
      const watchlist = await this.getWatchlist();
      const updatedWatchlist = watchlist.filter(
        item => !(item.id === mediaId && item.type === mediaType)
      );

      this.setStoredData(STORAGE_KEYS.WATCHLIST, updatedWatchlist);

      // Sync with server
      if (this.userId) {
        await this.apiRequest(`${API_ENDPOINTS.WATCHLIST}/${mediaId}`, {
          method: 'DELETE',
        });
      }

      return true;
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      return false;
    }
  }

  /**
   * Check if item is in watchlist
   */
  async isInWatchlist(mediaId: string, mediaType: string): Promise<boolean> {
    const watchlist = await this.getWatchlist();
    return watchlist.some(item => item.id === mediaId && item.type === mediaType);
  }

  // REMINDER METHODS

  /**
   * Get user's reminders
   */
  async getReminders(): Promise<ReminderItem[]> {
    const localReminders = this.getStoredData<ReminderItem[]>(
      STORAGE_KEYS.REMINDERS,
      []
    );

    return this.syncWithServer(
      localReminders,
      API_ENDPOINTS.REMINDERS,
      STORAGE_KEYS.REMINDERS
    );
  }

  /**
   * Set reminder for content
   */
  async setReminder(
    media: MediaItem,
    remindAt: string,
    type: ReminderItem['reminderType'] = 'release',
    customMessage?: string
  ): Promise<boolean> {
    try {
      const reminders = await this.getReminders();
      
      // Check if reminder already exists
      const exists = reminders.some(item => 
        item.id === media.id && item.type === media.type && item.reminderType === type
      );

      if (exists) {
        console.warn('Reminder already set for this content');
        return false;
      }

      const reminderItem: ReminderItem = {
        ...media,
        remindAt,
        userId: this.userId || undefined,
        reminderType: type,
        isActive: true,
        customMessage,
      };

      const updatedReminders = [...reminders, reminderItem];
      this.setStoredData(STORAGE_KEYS.REMINDERS, updatedReminders);

      // Sync with server
      if (this.userId) {
        await this.apiRequest(API_ENDPOINTS.REMINDERS, {
          method: 'POST',
          body: JSON.stringify(reminderItem),
        });
      }

      return true;
    } catch (error) {
      console.error('Error setting reminder:', error);
      return false;
    }
  }

  /**
   * Remove reminder
   */
  async removeReminder(mediaId: string, mediaType: string, reminderType: string): Promise<boolean> {
    try {
      const reminders = await this.getReminders();
      const updatedReminders = reminders.filter(
        item => !(item.id === mediaId && item.type === mediaType && item.reminderType === reminderType)
      );

      this.setStoredData(STORAGE_KEYS.REMINDERS, updatedReminders);

      // Sync with server
      if (this.userId) {
        await this.apiRequest(`${API_ENDPOINTS.REMINDERS}/${mediaId}`, {
          method: 'DELETE',
        });
      }

      return true;
    } catch (error) {
      console.error('Error removing reminder:', error);
      return false;
    }
  }

  /**
   * Get active reminders (due soon)
   */
  async getActiveReminders(withinDays: number = 7): Promise<ReminderItem[]> {
    const reminders = await this.getReminders();
    const now = new Date();
    const cutoff = new Date(now.getTime() + withinDays * 24 * 60 * 60 * 1000);

    return reminders.filter(reminder => {
      const remindDate = new Date(reminder.remindAt);
      return reminder.isActive && remindDate <= cutoff && remindDate >= now;
    });
  }

  // PREFERENCES METHODS

  /**
   * Get user preferences
   */
  async getPreferences(): Promise<UserPreferences> {
    const defaultPreferences: UserPreferences = {
      favoriteGenres: [],
      favoriteStreamingServices: [],
      reminderSettings: {
        emailEnabled: true,
        pushEnabled: true,
        smsEnabled: false,
        advanceDays: 1,
      },
      watchlistSettings: {
        autoRemoveWatched: false,
        sortBy: 'addedAt',
        showOnlyAvailable: false,
      },
    };

    const localPreferences = this.getStoredData<UserPreferences>(
      STORAGE_KEYS.PREFERENCES,
      defaultPreferences
    );

    return this.syncWithServer(
      localPreferences,
      API_ENDPOINTS.PREFERENCES,
      STORAGE_KEYS.PREFERENCES
    );
  }

  /**
   * Update user preferences
   */
  async updatePreferences(preferences: Partial<UserPreferences>): Promise<boolean> {
    try {
      const currentPreferences = await this.getPreferences();
      const updatedPreferences = { ...currentPreferences, ...preferences };

      this.setStoredData(STORAGE_KEYS.PREFERENCES, updatedPreferences);

      // Sync with server
      if (this.userId) {
        await this.apiRequest(API_ENDPOINTS.PREFERENCES, {
          method: 'PUT',
          body: JSON.stringify(updatedPreferences),
        });
      }

      return true;
    } catch (error) {
      console.error('Error updating preferences:', error);
      return false;
    }
  }

  /**
   * Clear all user data (logout)
   */
  clearUserData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    this.userId = null;
  }

  /**
   * Export user data for backup
   */
  async exportUserData(): Promise<{
    watchlist: WatchlistItem[];
    reminders: ReminderItem[];
    preferences: UserPreferences;
  }> {
    const [watchlist, reminders, preferences] = await Promise.all([
      this.getWatchlist(),
      this.getReminders(),
      this.getPreferences(),
    ]);

    return {
      watchlist,
      reminders,
      preferences,
    };
  }

  /**
   * Import user data from backup
   */
  async importUserData(data: {
    watchlist?: WatchlistItem[];
    reminders?: ReminderItem[];
    preferences?: UserPreferences;
  }): Promise<boolean> {
    try {
      if (data.watchlist) {
        this.setStoredData(STORAGE_KEYS.WATCHLIST, data.watchlist);
      }
      if (data.reminders) {
        this.setStoredData(STORAGE_KEYS.REMINDERS, data.reminders);
      }
      if (data.preferences) {
        this.setStoredData(STORAGE_KEYS.PREFERENCES, data.preferences);
      }

      return true;
    } catch (error) {
      console.error('Error importing user data:', error);
      return false;
    }
  }
}

// Export singleton instance
export const userActionsService = new UserActionsService();

// Export convenience functions
export const {
  setUserId,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist,
  getReminders,
  setReminder,
  removeReminder,
  getActiveReminders,
  getPreferences,
  updatePreferences,
  clearUserData,
  exportUserData,
  importUserData,
} = userActionsService;