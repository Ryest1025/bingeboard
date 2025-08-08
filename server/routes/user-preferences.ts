import type { Express } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";

/**
 * 🎯 USER PREFERENCES API ROUTES
 * 
 * Enhanced endpoints for managing user preferences and onboarding data:
 * - GET /api/user/preferences - Get complete user preferences
 * - PUT /api/user/preferences - Update user preferences
 * - POST /api/user/preferences/sync-onboarding - Sync onboarding data to preferences
 * - GET /api/user/profile - Get user profile with preferences
 */

export function registerUserPreferencesRoutes(app: Express) {
  
  // Get complete user preferences
  app.get('/api/user/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;

      console.log(`🎯 Fetching preferences for user: ${userId}`);

      // Get user preferences from storage
      let preferences = await storage.getUserPreferences(userId);

      // If no preferences exist, create defaults
      if (!preferences) {
        console.log('📋 No preferences found, creating defaults...');
        
        const defaultPreferences = {
          userId,
          preferredGenres: [],
          preferredNetworks: [],
          favoriteSports: [],
          favoriteTeams: [],
          watchingHabits: JSON.stringify({
            theme: "dark",
            contentTypes: ["TV Shows", "Movies"],
            preferredTime: "evening",
            bingeDuration: "2-3 hours",
            weeklyGoal: "5-10 hours"
          }),
          contentRating: "All",
          languagePreferences: ["English"],
          aiPersonality: "balanced",
          notificationFrequency: "weekly",
          sportsNotifications: true,
          onboardingCompleted: false
        };

        await storage.updateUserPreferences(userId, defaultPreferences);
        preferences = defaultPreferences as any;
      }

      // Parse watching habits JSON
      let watchingHabits = {};
      try {
        if (preferences?.watchingHabits) {
          watchingHabits = JSON.parse(preferences.watchingHabits);
        }
      } catch (error) {
        console.warn('Failed to parse watching habits JSON:', error);
      }

      const response = {
        ...preferences,
        watchingHabits,
        // Add derived data
        hasCompletedOnboarding: preferences?.onboardingCompleted || false,
        preferenceCount: (preferences?.preferredGenres?.length || 0) + 
                        (preferences?.preferredNetworks?.length || 0) +
                        (preferences?.favoriteTeams?.length || 0),
        lastUpdated: preferences?.updatedAt || new Date().toISOString()
      };

      console.log(`✅ Retrieved preferences with ${response.preferenceCount} items set`);

      res.json({
        success: true,
        preferences: response
      });

    } catch (error) {
      console.error('❌ Error fetching user preferences:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch user preferences',
        error: (error as Error).message 
      });
    }
  });

  // Update user preferences
  app.put('/api/user/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const updates = req.body;

      console.log(`🎯 Updating preferences for user: ${userId}`, {
        keys: Object.keys(updates),
        genreCount: updates.preferredGenres?.length || 0,
        networkCount: updates.preferredNetworks?.length || 0
      });

      // Handle watching habits object -> JSON conversion
      if (updates.watchingHabits && typeof updates.watchingHabits === 'object') {
        updates.watchingHabits = JSON.stringify(updates.watchingHabits);
      }

      // Update preferences in storage
      const updatedPreferences = await storage.updateUserPreferences(userId, {
        ...updates,
        updatedAt: new Date().toISOString()
      });

      console.log(`✅ Updated preferences successfully`);

      res.json({
        success: true,
        message: 'Preferences updated successfully',
        preferences: updatedPreferences
      });

    } catch (error) {
      console.error('❌ Error updating user preferences:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update user preferences',
        error: (error as Error).message 
      });
    }
  });

  // Sync onboarding data to preferences
  app.post('/api/user/preferences/sync-onboarding', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const { onboardingData } = req.body;

      console.log(`🔄 Syncing onboarding data to preferences for user: ${userId}`);

      if (!onboardingData) {
        return res.status(400).json({
          success: false,
          message: 'Onboarding data is required'
        });
      }

      // Convert onboarding data to preferences format
      const preferencesUpdate: any = {
        onboardingCompleted: true,
        updatedAt: new Date().toISOString()
      };

      // Map onboarding fields to preferences
      if (onboardingData.favoriteGenres) {
        preferencesUpdate.preferredGenres = onboardingData.favoriteGenres;
      }

      if (onboardingData.streamingPlatforms) {
        preferencesUpdate.preferredNetworks = onboardingData.streamingPlatforms;
      }

      if (onboardingData.favoriteTeams) {
        preferencesUpdate.favoriteTeams = onboardingData.favoriteTeams;
        if (onboardingData.favoriteTeams.length > 0) {
          preferencesUpdate.favoriteSports = ["Sports"];
        }
      }

      if (onboardingData.contentTypes) {
        const watchingHabits = {
          theme: onboardingData.theme || "dark",
          contentTypes: onboardingData.contentTypes,
          preferredTime: onboardingData.viewingHabits?.preferredTime || "evening",
          bingeDuration: onboardingData.viewingHabits?.bingeDuration || "2-3 hours",
          weeklyGoal: onboardingData.viewingHabits?.weeklyGoal || "5-10 hours"
        };
        preferencesUpdate.watchingHabits = JSON.stringify(watchingHabits);
      }

      if (onboardingData.notifications) {
        preferencesUpdate.notificationFrequency = onboardingData.notifications.weeklyRecap ? "weekly" : "never";
        preferencesUpdate.sportsNotifications = onboardingData.notifications.friendActivity || false;
      }

      if (onboardingData.contentFilters) {
        preferencesUpdate.contentRating = onboardingData.contentFilters.maxRating || "All";
      }

      // Update preferences
      const updatedPreferences = await storage.updateUserPreferences(userId, preferencesUpdate);

      console.log(`✅ Synced onboarding data to preferences:`, {
        genres: preferencesUpdate.preferredGenres?.length || 0,
        networks: preferencesUpdate.preferredNetworks?.length || 0,
        teams: preferencesUpdate.favoriteTeams?.length || 0
      });

      res.json({
        success: true,
        message: 'Onboarding data synced to preferences successfully',
        preferences: updatedPreferences,
        syncedFields: Object.keys(preferencesUpdate)
      });

    } catch (error) {
      console.error('❌ Error syncing onboarding data:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to sync onboarding data',
        error: (error as Error).message 
      });
    }
  });

  // Get user profile with preferences
  app.get('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;

      console.log(`👤 Fetching complete profile for user: ${userId}`);

      // Get user basic info
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Get user preferences
      const preferences = await storage.getUserPreferences(userId);

      // Get viewing statistics
      const viewingHistory = await storage.getUserViewingHistory(userId, 10);
      
      // Parse watching habits
      let watchingHabits = {};
      try {
        watchingHabits = JSON.parse(preferences?.watchingHabits || '{}');
      } catch (error) {
        console.warn('Failed to parse watching habits:', error);
      }

      const profile = {
        // Basic user info
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: `${user.firstName} ${user.lastName}`.trim() || user.email,
        profileImageUrl: user.profileImageUrl,
        createdAt: user.createdAt,
        
        // Preferences
        preferences: preferences ? {
          ...preferences,
          watchingHabits
        } : null,
        
        // Derived stats
        stats: {
          hasCompletedOnboarding: preferences?.onboardingCompleted || false,
          totalGenres: preferences?.preferredGenres?.length || 0,
          totalNetworks: preferences?.preferredNetworks?.length || 0,
          totalTeams: preferences?.favoriteTeams?.length || 0,
          recentWatchCount: viewingHistory.length,
          accountAge: user.createdAt ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0
        }
      };

      console.log(`✅ Retrieved complete profile for ${profile.displayName}`);

      res.json({
        success: true,
        profile
      });

    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch user profile',
        error: (error as Error).message 
      });
    }
  });

  // Get user statistics for dashboard
  app.get('/api/user/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;

      console.log(`📊 Generating user stats for: ${userId}`);

      // Get viewing history
      const viewingHistory = await storage.getUserViewingHistory(userId, 100);
      
      // Get preferences
      const preferences = await storage.getUserPreferences(userId);

      // Calculate stats
      const totalWatched = viewingHistory.length;
      const uniqueShows = new Set(viewingHistory.map(vh => vh.contentId)).size;
      const thisWeekCount = viewingHistory.filter(vh => {
        const watchDate = new Date(vh.watchedAt * 1000); // Convert Unix timestamp to Date
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return watchDate >= weekAgo;
      }).length;

      // Calculate total watch time (estimate - since SQLite schema doesn't have duration fields)
      const totalMinutes = viewingHistory.length * 45; // Estimate 45 minutes per entry
      const totalHours = Math.round(totalMinutes / 60);

      // Genre distribution - handle JSON string format from SQLite
      let favoriteGenres = [];
      try {
        if (preferences?.preferredGenres) {
          favoriteGenres = typeof preferences.preferredGenres === 'string' 
            ? JSON.parse(preferences.preferredGenres) 
            : preferences.preferredGenres;
        }
      } catch (error) {
        console.warn('Error parsing preferred genres:', error);
        favoriteGenres = [];
      }

      const genreStats = favoriteGenres.map((genre: string) => ({
        name: genre,
        count: Math.floor(Math.random() * 20) + 5, // Mock data for now
        percentage: Math.floor(Math.random() * 30) + 10
      })) || [];

      const stats = {
        totalWatched,
        uniqueShows,
        totalHours,
        thisWeekCount,
        averagePerWeek: Math.round(totalWatched / Math.max(1, Math.floor(totalHours / (24 * 7)))),
        favoriteGenres: genreStats.slice(0, 5),
        completionRate: Math.round(Math.random() * 40 + 60), // Mock for now
        discoveryScore: Math.round(Math.random() * 30 + 70), // Mock for now
        streakDays: Math.floor(Math.random() * 15) + 1, // Mock for now
        accountLevel: totalWatched < 10 ? 'Beginner' : totalWatched < 50 ? 'Regular' : totalWatched < 200 ? 'Enthusiast' : 'Expert'
      };

      console.log(`✅ Generated stats: ${stats.totalWatched} watched, ${stats.uniqueShows} unique shows`);

      res.json({
        success: true,
        stats
      });

    } catch (error) {
      console.error('❌ Error generating user stats:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to generate user stats',
        error: (error as Error).message 
      });
    }
  });

  console.log('🎯 User Preferences API routes registered');
}
