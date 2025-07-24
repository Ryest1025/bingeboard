// Simple user data types
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
    privacy: 'public' | 'private' | 'friends';
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
  dateAdded: string;
  notes?: string;
  rating?: number;
}

// Simplified GitHub service that uses fetch API
class SimpleGitHubUserDataService {
  private githubToken: string;
  private cache: Map<string, UserData> = new Map();
  private gistId: string | null = null;
  private baseUrl = 'https://api.github.com';

  constructor(githubToken: string) {
    this.githubToken = githubToken;
  }

  private getHeaders() {
    return {
      'Authorization': `token ${this.githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };
  }

  // Find or create the BingeBoard data gist
  async findOrCreateGist(): Promise<string | null> {
    try {
      // First, try to find existing gist
      const response = await fetch(`${this.baseUrl}/gists`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        console.error('Failed to fetch gists:', response.status);
        return null;
      }

      const gists = await response.json();
      const bingeboardGist = gists.find((gist: any) =>
        gist.description === 'BingeBoard User Data' &&
        gist.files['bingeboard-data.json']
      );

      if (bingeboardGist) {
        this.gistId = bingeboardGist.id;
        console.log('✅ Found existing BingeBoard gist');
        return bingeboardGist.id;
      }

      // Create new gist if not found
      const createResponse = await fetch(`${this.baseUrl}/gists`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          description: 'BingeBoard User Data',
          public: false,
          files: {
            'bingeboard-data.json': {
              content: JSON.stringify({})
            }
          }
        })
      });

      if (!createResponse.ok) {
        console.error('Failed to create gist:', createResponse.status);
        return null;
      }

      const newGist = await createResponse.json();
      this.gistId = newGist.id;
      console.log('✅ Created new BingeBoard gist');
      return newGist.id;

    } catch (error) {
      console.error('❌ Error with gist operations:', error);
      return null;
    }
  }

  // Get user data from gist
  async getUserData(userId: string): Promise<UserData | null> {
    try {
      // Check cache first
      if (this.cache.has(userId)) {
        return this.cache.get(userId)!;
      }

      if (!this.gistId) {
        this.gistId = await this.findOrCreateGist();
        if (!this.gistId) return null;
      }

      const response = await fetch(`${this.baseUrl}/gists/${this.gistId}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        console.error('Failed to fetch gist:', response.status);
        return null;
      }

      const gist = await response.json();
      const fileContent = gist.files['bingeboard-data.json']?.content;

      if (!fileContent) {
        console.log('No data file found in gist');
        return null;
      }

      const allUserData = JSON.parse(fileContent);
      const userData = allUserData[userId];

      if (userData) {
        this.cache.set(userId, userData);
        console.log('✅ Loaded user data from GitHub');
      }

      return userData || null;

    } catch (error) {
      console.error('❌ Error loading user data:', error);
      return null;
    }
  }

  // Save user data to gist
  async saveUserData(userData: UserData): Promise<boolean> {
    try {
      if (!this.gistId) {
        this.gistId = await this.findOrCreateGist();
        if (!this.gistId) return false;
      }

      // Get current data
      const response = await fetch(`${this.baseUrl}/gists/${this.gistId}`, {
        headers: this.getHeaders(),
      });

      let allUserData: Record<string, UserData> = {};
      if (response.ok) {
        const gist = await response.json();
        const fileContent = gist.files['bingeboard-data.json']?.content;
        if (fileContent) {
          allUserData = JSON.parse(fileContent);
        }
      }

      // Update with new user data
      allUserData[userData.userId] = userData;

      // Save back to gist
      const updateResponse = await fetch(`${this.baseUrl}/gists/${this.gistId}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({
          files: {
            'bingeboard-data.json': {
              content: JSON.stringify(allUserData, null, 2)
            }
          }
        })
      });

      if (!updateResponse.ok) {
        console.error('Failed to update gist:', updateResponse.status);
        return false;
      }

      // Update cache
      this.cache.set(userData.userId, userData);
      console.log('✅ Saved user data to GitHub');
      return true;

    } catch (error) {
      console.error('❌ Error saving user data:', error);
      return false;
    }
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Delete user data
  async deleteUserData(userId: string): Promise<boolean> {
    try {
      if (!this.gistId) {
        this.gistId = await this.findOrCreateGist();
        if (!this.gistId) return false;
      }

      // Get current data
      const response = await fetch(`${this.baseUrl}/gists/${this.gistId}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) return false;

      const gist = await response.json();
      const fileContent = gist.files['bingeboard-data.json']?.content;

      if (!fileContent) return true;

      const allUserData: Record<string, UserData> = JSON.parse(fileContent);
      delete allUserData[userId];

      // Save back to gist
      const updateResponse = await fetch(`${this.baseUrl}/gists/${this.gistId}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({
          files: {
            'bingeboard-data.json': {
              content: JSON.stringify(allUserData, null, 2)
            }
          }
        })
      });

      if (updateResponse.ok) {
        this.cache.delete(userId);
        console.log('✅ Deleted user data from GitHub');
        return true;
      }

      return false;

    } catch (error) {
      console.error('❌ Error deleting user data:', error);
      return false;
    }
  }
}

export default SimpleGitHubUserDataService;
