// GitHub-based user data storage using Gists
import { Octokit } from "@octokit/rest";

// Types for user data
export interface UserData {
  userId: string;
  email: string;
  displayName: string;
  createdAt: string;
  lastUpdated: string;
  preferences: {
    favoriteGenres: string[];
    watchingGoals: string;
    experience: string;
    notifications: boolean;
    privacy: 'public' | 'private';
  };
  watchlists: {
    watching: WatchlistItem[];
    completed: WatchlistItem[];
    planToWatch: WatchlistItem[];
    dropped: WatchlistItem[];
  };
  stats: {
    showsWatched: number;
    moviesWatched: number;
    totalHours: number;
    favoriteGenres: string[];
  };
  social: {
    friends: string[];
    following: string[];
    followers: string[];
  };
}

export interface WatchlistItem {
  id: string;
  title: string;
  type: 'movie' | 'tv';
  poster?: string;
  rating?: number;
  notes?: string;
  dateAdded: string;
  progress?: {
    currentEpisode?: number;
    currentSeason?: number;
    totalEpisodes?: number;
    totalSeasons?: number;
  };
}

class GitHubUserDataService {
  private octokit: Octokit;
  private gistCache: Map<string, any> = new Map();

  constructor(githubToken: string) {
    this.octokit = new Octokit({
      auth: githubToken,
    });
  }

  // Create default user data structure
  private createDefaultUserData(userId: string, email: string, displayName: string): UserData {
    return {
      userId,
      email,
      displayName,
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
  }

  // Get user data from GitHub Gist
  async getUserData(userId: string): Promise<UserData | null> {
    try {
      console.log(`📚 Loading user data for: ${userId}`);

      // Check cache first
      if (this.gistCache.has(userId)) {
        console.log('📦 Returning cached user data');
        return this.gistCache.get(userId);
      }

      // Find user's gist by description
      const gists = await this.octokit.rest.gists.list();
      const userGist = gists.data.find(gist =>
        gist.description === `BingeBoard-UserData-${userId}`
      );

      if (!userGist) {
        console.log('📝 No user data found');
        return null;
      }

      // Get gist content
      const gistDetail = await this.octokit.rest.gists.get({
        gist_id: userGist.id
      });

      const userDataFile = gistDetail.data.files?.['userdata.json'];
      if (!userDataFile?.content) {
        console.log('📝 No user data content found');
        return null;
      }

      const userData = JSON.parse(userDataFile.content) as UserData;

      // Cache the data
      this.gistCache.set(userId, userData);

      console.log('✅ User data loaded successfully');
      return userData;
    } catch (error) {
      console.error('❌ Error loading user data:', error);
      return null;
    }
  }

  // Save user data to GitHub Gist
  async saveUserData(userData: UserData): Promise<boolean> {
    try {
      console.log(`💾 Saving user data for: ${userData.userId}`);

      userData.lastUpdated = new Date().toISOString();

      // Check if gist already exists
      const gists = await this.octokit.rest.gists.list();
      const existingGist = gists.data.find(gist =>
        gist.description === `BingeBoard-UserData-${userData.userId}`
      );

      const gistData = {
        description: `BingeBoard-UserData-${userData.userId}`,
        public: false, // Keep user data private
        files: {
          'userdata.json': {
            content: JSON.stringify(userData, null, 2)
          },
          'README.md': {
            content: `# BingeBoard User Data\n\nUser: ${userData.displayName}\nEmail: ${userData.email}\nLast Updated: ${userData.lastUpdated}\n\nThis gist contains private user data for the BingeBoard app.`
          }
        }
      };

      if (existingGist) {
        // Update existing gist
        await this.octokit.rest.gists.update({
          gist_id: existingGist.id,
          ...gistData
        });
        console.log('✅ User data updated successfully');
      } else {
        // Create new gist
        await this.octokit.rest.gists.create(gistData);
        console.log('✅ User data created successfully');
      }

      // Update cache
      this.gistCache.set(userData.userId, userData);

      return true;
    } catch (error) {
      console.error('❌ Error saving user data:', error);
      return false;
    }
  }

  // Create new user
  async createUser(userId: string, email: string, displayName: string): Promise<UserData> {
    console.log(`👤 Creating new user: ${displayName} (${email})`);

    const userData = this.createDefaultUserData(userId, email, displayName);

    const success = await this.saveUserData(userData);
    if (!success) {
      throw new Error('Failed to create user data');
    }

    return userData;
  }

  // Update user preferences (from onboarding)
  async updateUserPreferences(userId: string, preferences: Partial<UserData['preferences']>): Promise<boolean> {
    try {
      const userData = await this.getUserData(userId);
      if (!userData) {
        throw new Error('User not found');
      }

      userData.preferences = { ...userData.preferences, ...preferences };
      return await this.saveUserData(userData);
    } catch (error) {
      console.error('❌ Error updating user preferences:', error);
      return false;
    }
  }

  // Add item to watchlist
  async addToWatchlist(userId: string, item: WatchlistItem, listType: keyof UserData['watchlists'] = 'planToWatch'): Promise<boolean> {
    try {
      const userData = await this.getUserData(userId);
      if (!userData) {
        throw new Error('User not found');
      }

      // Check if item already exists
      const existingItem = userData.watchlists[listType].find(i => i.id === item.id);
      if (existingItem) {
        console.log('📺 Item already in watchlist');
        return true;
      }

      userData.watchlists[listType].push(item);
      return await this.saveUserData(userData);
    } catch (error) {
      console.error('❌ Error adding to watchlist:', error);
      return false;
    }
  }

  // Update user stats
  async updateStats(userId: string, stats: Partial<UserData['stats']>): Promise<boolean> {
    try {
      const userData = await this.getUserData(userId);
      if (!userData) {
        throw new Error('User not found');
      }

      userData.stats = { ...userData.stats, ...stats };
      return await this.saveUserData(userData);
    } catch (error) {
      console.error('❌ Error updating stats:', error);
      return false;
    }
  }

  // Clear cache (useful for testing)
  clearCache(): void {
    this.gistCache.clear();
    console.log('🗑️ User data cache cleared');
  }
}

export default GitHubUserDataService;
