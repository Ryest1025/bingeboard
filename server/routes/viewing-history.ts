import type { Express } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";

/**
 * 📺 VIEWING HISTORY & PROGRESS TRACKING API ROUTES
 * 
 * Core endpoints for tracking what users watch and their progress:
 * - GET /api/viewing-history - Get user's viewing history
 * - POST /api/viewing-history - Add new viewing history entry
 * - GET /api/progress/current - Get currently watching shows with progress
 * - POST /api/progress/update - Update viewing progress for a show/episode
 * - GET /api/continue-watching - Get shows ready to continue watching
 */

export function registerViewingHistoryRoutes(app: Express) {

  // Get user's viewing history
  app.get('/api/viewing-history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const limit = parseInt(req.query.limit as string) || 50;

      console.log(`📺 Fetching viewing history for user: ${userId} (limit: ${limit})`);

      // For now, return mock data until we implement the real viewing history storage
      const mockHistory = [
        {
          id: 1,
          userId,
          showId: 94997,
          title: "House of the Dragon",
          mediaType: "tv",
          episodeId: null,
          seasonNumber: 1,
          episodeNumber: 8,
          watchedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          duration: 60,
          platform: "HBO Max"
        },
        {
          id: 2,
          userId,
          showId: 1396,
          title: "Breaking Bad",
          mediaType: "tv",
          episodeId: null,
          seasonNumber: 5,
          episodeNumber: 16,
          watchedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
          duration: 47,
          platform: "Netflix"
        }
      ];

      console.log(`✅ Found ${mockHistory.length} viewing history entries`);

      res.json({
        success: true,
        history: mockHistory,
        count: mockHistory.length
      });

    } catch (error) {
      console.error('❌ Error fetching viewing history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch viewing history',
        error: (error as Error).message
      });
    }
  });

  // Add new viewing history entry
  app.post('/api/viewing-history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const { showId, tmdbId, title, mediaType, episodeId, seasonNumber, episodeNumber, watchedAt, duration, platform } = req.body;

      console.log(`📺 Adding viewing history entry for user: ${userId}`, {
        showId, tmdbId, title, mediaType, episodeId
      });

      // Create mock entry for now
      const historyEntry = {
        id: Date.now(),
        userId,
        showId: showId || tmdbId || 0,
        title: title || `Show ${showId || tmdbId}`,
        mediaType: mediaType || 'tv',
        episodeId,
        seasonNumber,
        episodeNumber,
        watchedAt: watchedAt || new Date().toISOString(),
        duration: duration || 0,
        platform: platform || 'Unknown'
      };

      console.log(`✅ Created viewing history entry:`, historyEntry.id);

      res.json({
        success: true,
        message: 'Viewing history entry created',
        entry: historyEntry
      });

    } catch (error) {
      console.error('❌ Error creating viewing history entry:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create viewing history entry',
        error: (error as Error).message
      });
    }
  });

  // Get continue watching list with progress bars
  app.get('/api/continue-watching', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const limit = parseInt(req.query.limit as string) || 10;

      console.log(`▶️ Fetching continue watching list for user: ${userId}`);

      // Mock continue watching data with TMDB poster enrichment
      const continueWatching = [
        {
          showId: 94997,
          title: "House of the Dragon",
          mediaType: "tv",
          lastWatched: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          platform: "HBO Max",
          poster_path: "/7QMsOTMUswlwxJP0rTTZfmz2tX2.jpg", // TMDB poster path
          backdrop_path: "/17SQAkcYWKq5WMcjdkJzYQJlrOl.jpg", // TMDB backdrop path
          currentEpisode: {
            seasonNumber: 1,
            episodeNumber: 9,
            progressPercentage: 35,
            duration: 60,
            watchedDuration: 21
          },
          totalEpisodes: 20,
          completedEpisodes: 8
        },
        {
          showId: 1396,
          title: "Breaking Bad",
          mediaType: "tv",
          lastWatched: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
          platform: "Netflix",
          poster_path: "/3xnWaLQjelJDDF7LT1WBo6f4BRe.jpg", // TMDB poster path
          backdrop_path: "/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg", // TMDB backdrop path
          currentEpisode: {
            seasonNumber: 2,
            episodeNumber: 1,
            progressPercentage: 0,
            duration: 47,
            watchedDuration: 0
          },
          totalEpisodes: 62,
          completedEpisodes: 13
        }
      ];

      console.log(`✅ Found ${continueWatching.length} shows to continue watching`);

      res.json({
        success: true,
        continueWatching: continueWatching.slice(0, limit),
        count: continueWatching.length
      });

    } catch (error) {
      console.error('❌ Error fetching continue watching list:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch continue watching list',
        error: (error as Error).message
      });
    }
  });

  // Update viewing progress for a specific episode
  app.post('/api/progress/update', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const {
        showId,
        tmdbId,
        seasonNumber,
        episodeNumber,
        progressPercentage,
        duration,
        watchedDuration,
        completed
      } = req.body;

      console.log(`⏱️ Updating progress for user: ${userId}`, {
        showId: showId || tmdbId, seasonNumber, episodeNumber, progressPercentage, completed
      });

      // Create mock progress entry for now
      const progressEntry = {
        id: Date.now(),
        userId,
        showId: showId || tmdbId || 0,
        seasonNumber: seasonNumber || 1,
        episodeNumber: episodeNumber || 1,
        progressPercentage: progressPercentage || 0,
        duration: duration || 0,
        watchedDuration: watchedDuration || 0,
        completed: completed || false,
        lastWatched: new Date().toISOString()
      };

      console.log(`✅ Updated episode progress:`, progressEntry.id);

      res.json({
        success: true,
        message: 'Progress updated successfully',
        progress: progressEntry
      });

    } catch (error) {
      console.error('❌ Error updating progress:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update progress',
        error: (error as Error).message
      });
    }
  });

  // Get current viewing progress for all shows
  app.get('/api/progress/current', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;

      console.log(`⏱️ Fetching current viewing progress for user: ${userId}`);

      // Mock current progress data
      const currentProgress = [
        {
          showId: 94997,
          title: "House of the Dragon",
          mediaType: "tv",
          lastWatched: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          platform: "HBO Max",
          currentEpisode: {
            seasonNumber: 1,
            episodeNumber: 9,
            progressPercentage: 35,
            duration: 60,
            watchedDuration: 21
          },
          totalEpisodes: 20,
          completedEpisodes: 8
        }
      ];

      console.log(`✅ Found ${currentProgress.length} shows with active progress`);

      res.json({
        success: true,
        currentlyWatching: currentProgress,
        count: currentProgress.length
      });

    } catch (error) {
      console.error('❌ Error fetching current progress:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch current progress',
        error: (error as Error).message
      });
    }
  });

  // Batch import viewing history (for CSV uploads)
  app.post('/api/viewing-history/import', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const { entries } = req.body;

      if (!Array.isArray(entries)) {
        return res.status(400).json({
          success: false,
          message: 'Expected entries array'
        });
      }

      console.log(`📤 Importing ${entries.length} viewing history entries for user: ${userId}`);

      // Mock import for now
      const imported = entries.map((entry, index) => ({
        id: Date.now() + index,
        userId,
        showId: entry.showId || entry.tmdbId || 0,
        title: entry.title || 'Unknown Title',
        mediaType: entry.mediaType || 'tv',
        episodeId: entry.episodeId,
        seasonNumber: entry.seasonNumber,
        episodeNumber: entry.episodeNumber,
        watchedAt: entry.watchedAt || new Date().toISOString(),
        duration: entry.duration || 0,
        platform: entry.platform || 'Imported'
      }));

      console.log(`✅ Imported ${imported.length} entries`);

      res.json({
        success: true,
        message: `Successfully imported ${imported.length} viewing history entries`,
        imported: imported.length,
        errors: 0
      });

    } catch (error) {
      console.error('❌ Error importing viewing history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to import viewing history',
        error: (error as Error).message
      });
    }
  });

  // Enhanced continue watching endpoint for dashboard (with TMDB enrichment)
  app.get('/api/viewing-history/continue-watching-enhanced', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const limit = parseInt(req.query.limit as string) || 10;

      console.log(`🎬 Fetching enhanced continue watching for user: ${userId}`);

      // Mock enhanced continue watching data with rich TMDB metadata
      const enhancedContinueWatching = [
        {
          id: 94997,
          tmdb_id: 94997,
          title: "House of the Dragon",
          name: "House of the Dragon",
          media_type: "tv",
          poster_path: "/7QMsOTMUswlwxJP0rTTZfmz2tX2.jpg",
          backdrop_path: "/17SQAkcYWKq5WMcjdkJzYQJlrOl.jpg",
          overview: "The Targaryen dynasty is at the absolute apex of its power, with more than 15 dragons under their yoke. Most empires crumble from such heights.",
          vote_average: 8.4,
          vote_count: 4500,
          first_air_date: "2022-08-21",
          genre_ids: [18, 10765, 10759],
          streaming_platforms: ["HBO Max", "Sky Atlantic"],
          streamingPlatforms: [
            { name: "HBO Max", logo: "hbo-max", available: true },
            { name: "Sky Atlantic", logo: "sky", available: true }
          ],
          streaming: [
            { provider_id: 384, provider_name: "HBO Max", logo_path: "/hbo-max.jpg" },
            { provider_id: 88, provider_name: "Sky Atlantic", logo_path: "/sky.jpg" }
          ],
          lastWatched: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          progress: {
            seasonNumber: 1,
            episodeNumber: 9,
            progressPercentage: 35,
            duration: 60,
            watchedDuration: 21,
            totalEpisodes: 20,
            completedEpisodes: 8
          }
        },
        {
          id: 1396,
          tmdb_id: 1396,
          title: "Breaking Bad",
          name: "Breaking Bad",
          media_type: "tv",
          poster_path: "/3xnWaLQjelJDDF7LT1WBo6f4BRe.jpg",
          backdrop_path: "/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
          overview: "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine.",
          vote_average: 9.5,
          vote_count: 12000,
          first_air_date: "2008-01-20",
          genre_ids: [18, 80],
          streaming_platforms: ["Netflix", "Amazon Prime"],
          streamingPlatforms: [
            { name: "Netflix", logo: "netflix", available: true },
            { name: "Amazon Prime Video", logo: "amazon-prime", available: true }
          ],
          streaming: [
            { provider_id: 8, provider_name: "Netflix", logo_path: "/netflix.jpg" },
            { provider_id: 119, provider_name: "Amazon Prime Video", logo_path: "/amazon.jpg" }
          ],
          lastWatched: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
          progress: {
            seasonNumber: 2,
            episodeNumber: 1,
            progressPercentage: 0,
            duration: 47,
            watchedDuration: 0,
            totalEpisodes: 62,
            completedEpisodes: 13
          }
        }
      ];

      console.log(`✅ Found ${enhancedContinueWatching.length} enhanced continue watching shows`);

      res.json({
        success: true,
        results: enhancedContinueWatching.slice(0, limit),
        continueWatching: enhancedContinueWatching.slice(0, limit),
        count: enhancedContinueWatching.length
      });

    } catch (error) {
      console.error('❌ Error fetching enhanced continue watching:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch enhanced continue watching',
        error: (error as Error).message
      });
    }
  });

  console.log('📺 Viewing History API routes registered');
}
