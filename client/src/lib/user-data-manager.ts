// User data service that integrates Firebase Auth with GitHub storage
import SimpleGitHubUserDataService from './simple-github-data';
import type { UserData } from './simple-github-data';
import { auth } from '../firebase/config';
import { User } from 'firebase/auth';

class UserDataManager {
  private githubService: SimpleGitHubUserDataService | null = null;
  private currentUser: UserData | null = null;

  // Initialize with GitHub token (from environment or user input)
  async initialize(githubToken?: string): Promise<boolean> {
    try {
      // For development, we'll use a simple localStorage fallback
      // In production, you'd get the GitHub token from user authentication
      if (githubToken) {
        this.githubService = new SimpleGitHubUserDataService(githubToken);
        console.log('✅ GitHub user data service initialized');
        return true;
      } else {
        console.log('⚠️ No GitHub token provided, using localStorage fallback');
        return true;
      }
    } catch (error) {
      console.error('❌ Failed to initialize user data service:', error);
      return false;
    }
  }

  // Get current user data
  async getCurrentUser(): Promise<UserData | null> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      console.log('❌ No authenticated user');
      return null;
    }

    return await this.getUserData(firebaseUser.uid);
  }

  // Get user data by ID
  async getUserData(userId: string): Promise<UserData | null> {
    try {
      if (this.githubService) {
        // Try GitHub first
        const userData = await this.githubService.getUserData(userId);
        if (userData) {
          this.currentUser = userData;
          return userData;
        }
      }

      // Fallback to localStorage
      const localData = localStorage.getItem(`bingeboard-user-${userId}`);
      if (localData) {
        const userData = JSON.parse(localData) as UserData;
        this.currentUser = userData;
        console.log('📦 Loaded user data from localStorage');
        return userData;
      }

      return null;
    } catch (error) {
      console.error('❌ Error loading user data:', error);
      return null;
    }
  }

  // Create new user after Firebase authentication
  async createUserFromFirebase(firebaseUser: User): Promise<UserData> {
    const userData: UserData = {
      userId: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || 'User',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      preferences: {
        favoriteGenres: [],
        watchingGoals: '',
        experience: '',
        notifications: true,
        privacy: 'private'
      },
      watchlists: {
        watching: [],
        completed: [],
        planToWatch: [],
        dropped: []
      },
      stats: {
        showsWatched: 0,
        moviesWatched: 0,
        totalHours: 0,
        favoriteGenres: []
      },
      social: {
        friends: [],
        following: [],
        followers: []
      }
    };

    await this.saveUserData(userData);
    this.currentUser = userData;

    console.log('👤 Created new user profile');
    return userData;
  }

  // Save user data
  async saveUserData(userData: UserData): Promise<boolean> {
    try {
      userData.lastUpdated = new Date().toISOString();

      // Try GitHub first
      if (this.githubService) {
        const success = await this.githubService.saveUserData(userData);
        if (success) {
          this.currentUser = userData;
          // Also save to localStorage as backup
          localStorage.setItem(`bingeboard-user-${userData.userId}`, JSON.stringify(userData));
          return true;
        }
      }

      // Fallback to localStorage
      localStorage.setItem(`bingeboard-user-${userData.userId}`, JSON.stringify(userData));
      this.currentUser = userData;
      console.log('💾 Saved user data to localStorage');
      return true;
    } catch (error) {
      console.error('❌ Error saving user data:', error);
      return false;
    }
  }

  // Update user preferences from onboarding
  async updatePreferences(preferences: {
    favoriteGenres: string[];
    watchingGoals: string;
    experience: string;
  }): Promise<boolean> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      console.error('❌ No authenticated user');
      return false;
    }

    let userData = await this.getUserData(firebaseUser.uid);

    if (!userData) {
      // Create user if doesn't exist
      userData = await this.createUserFromFirebase(firebaseUser);
    }

    userData.preferences = {
      ...userData.preferences,
      ...preferences
    };

    return await this.saveUserData(userData);
  }

  // Add to watchlist
  async addToWatchlist(item: {
    id: string;
    title: string;
    type: 'movie' | 'tv';
    poster?: string;
  }, listType: 'watching' | 'completed' | 'planToWatch' | 'dropped' = 'planToWatch'): Promise<boolean> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      console.error('❌ No authenticated user');
      return false;
    }

    let userData = await this.getUserData(firebaseUser.uid);

    if (!userData) {
      userData = await this.createUserFromFirebase(firebaseUser);
    }

    const watchlistItem = {
      ...item,
      dateAdded: new Date().toISOString(),
      notes: '',
      rating: undefined
    };

    // Check if already exists
    const exists = userData.watchlists[listType].some(i => i.id === item.id);
    if (!exists) {
      userData.watchlists[listType].push(watchlistItem);
      return await this.saveUserData(userData);
    }

    return true;
  }

  // Get user stats
  getUserStats(): UserData['stats'] | null {
    return this.currentUser?.stats || null;
  }

  // Get user watchlists
  getUserWatchlists(): UserData['watchlists'] | null {
    return this.currentUser?.watchlists || null;
  }

  // Get user preferences
  getUserPreferences(): UserData['preferences'] | null {
    return this.currentUser?.preferences || null;
  }

  // Clear current user data (for logout)
  clearCurrentUser(): void {
    this.currentUser = null;
    if (this.githubService) {
      this.githubService.clearCache();
    }
  }
}

// Export singleton instance
export const userDataManager = new UserDataManager();
export { UserData };
export default UserDataManager;
