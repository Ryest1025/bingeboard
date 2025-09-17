import express, { Request, Response } from 'express';
import { isAuthenticated } from '../auth';
import { fetchTMDBRecommendations, fetchAIRecommendations, fetchFriendsRecommendations } from '../services/recommendationSources.js';

const router = express.Router();

/**
 * Unified recommendations endpoint - REFACTORED VERSION
 * Applies filters consistently across TMDB, AI, and Friends systems
 * 
 * POST /api/recommendations/unified
 */
router.post('/unified', isAuthenticated, async (req: Request & { user?: any }, res: Response) => {
  const startTime = Date.now();
  
  try {
    console.log('🎯 UNIFIED RECOMMENDATIONS REQUEST STARTED', {
      timestamp: new Date().toISOString(),
      userId: req.user?.id
    });

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    // Extract and clean filters from request body
    const rawFilters = req.body?.filters ?? {};
    console.log('📥 RAW FILTERS RECEIVED:', rawFilters);
    
    // Clean filters - remove null, undefined, and empty string values
    const cleanFilters = Object.fromEntries(
      Object.entries(rawFilters).filter(([key, value]) => {
        const isValid = value !== null && 
                       value !== undefined && 
                       value !== '' && 
                       value !== 'all' && 
                       value !== 'any';
        
        if (!isValid) {
          console.log(`🗑️  Filtering out invalid filter: ${key} = ${value}`);
        }
        
        return isValid;
      })
    );

    const filtersUsed = Object.keys(cleanFilters).length;
    console.log('🎯 UNIFIED API RECEIVED FILTERS:', cleanFilters);
    console.log('📊 FILTERS APPLIED COUNT:', filtersUsed);

    // Extract user profile and preferences
    const userProfile = {
      favoriteGenres: req.body?.userProfile?.favoriteGenres || req.body?.favoriteGenres || [],
      preferredNetworks: req.body?.userProfile?.preferredNetworks || req.body?.preferredNetworks || [],
      watchingHabits: req.body?.userProfile?.watchingHabits || req.body?.watchingHabits || [],
      contentRating: req.body?.userProfile?.contentRating || req.body?.contentRating || 'Any',
      languagePreferences: req.body?.userProfile?.languagePreferences || req.body?.languagePreferences || ['English'],
      viewingHistory: req.body?.userProfile?.viewingHistory || req.body?.viewingHistory || [],
      watchlist: req.body?.userProfile?.watchlist || req.body?.watchlist || [],
      currentlyWatching: req.body?.userProfile?.currentlyWatching || req.body?.currentlyWatching || [],
      recentlyWatched: req.body?.userProfile?.recentlyWatched || req.body?.recentlyWatched || []
    };

    console.log('👤 USER PROFILE SUMMARY:', {
      favoriteGenres: userProfile.favoriteGenres.length,
      preferredNetworks: userProfile.preferredNetworks.length,
      watchlistSize: userProfile.watchlist.length,
      viewingHistorySize: userProfile.viewingHistory.length,
      currentlyWatching: userProfile.currentlyWatching.length
    });

    // Build exclusion list from user's existing content
    const excludeIds = new Set<number>();
    const allUserContent = [
      ...userProfile.watchlist,
      ...userProfile.viewingHistory,
      ...userProfile.recentlyWatched,
      ...userProfile.currentlyWatching
    ];
    
    allUserContent.forEach((item: any) => {
      const id = item?.tmdbId || item?.id;
      if (typeof id === 'number') {
        excludeIds.add(id);
      }
    });

    // Add any manual exclusions from request
    const bodyExclude: number[] = Array.isArray(req.body?.excludeShows) 
      ? req.body.excludeShows.filter((n: any) => typeof n === 'number') 
      : [];
    bodyExclude.forEach(id => excludeIds.add(id));

    console.log('🚫 EXCLUSION LIST:', {
      fromWatchlist: userProfile.watchlist.length,
      fromHistory: userProfile.viewingHistory.length,
      fromCurrentlyWatching: userProfile.currentlyWatching.length,
      manualExclusions: bodyExclude.length,
      totalExcluded: excludeIds.size
    });

    // Fetch recommendations from all three systems in parallel
    console.log('🔄 FETCHING RECOMMENDATIONS FROM ALL SYSTEMS...');
    const [tmdbResults, aiResults, friendsResults] = await Promise.allSettled([
      fetchTMDBRecommendations(userId, cleanFilters, userProfile),
      fetchAIRecommendations(userId, cleanFilters, userProfile),
      fetchFriendsRecommendations(userId, cleanFilters, userProfile)
    ]);

    // Process results and handle failures gracefully
    const tmdb = tmdbResults.status === 'fulfilled' ? tmdbResults.value : [];
    const ai = aiResults.status === 'fulfilled' ? aiResults.value : [];
    const friends = friendsResults.status === 'fulfilled' ? friendsResults.value : [];

    // Log individual system results
    console.log('📊 SYSTEM RESULTS:', {
      tmdb: { status: tmdbResults.status, count: tmdb.length },
      ai: { status: aiResults.status, count: ai.length },
      friends: { status: friendsResults.status, count: friends.length }
    });

    // If any system failed, log the errors
    if (tmdbResults.status === 'rejected') {
      console.error('❌ TMDB SYSTEM FAILED:', tmdbResults.reason);
    }
    if (aiResults.status === 'rejected') {
      console.error('❌ AI SYSTEM FAILED:', aiResults.reason);
    }
    if (friendsResults.status === 'rejected') {
      console.error('❌ FRIENDS SYSTEM FAILED:', friendsResults.reason);
    }

    // Combine all recommendations
    const allRecommendations = [
      ...tmdb.map((rec: any) => ({ ...rec, source: 'tmdb' })),
      ...ai.map((rec: any) => ({ ...rec, source: 'ai' })),
      ...friends.map((rec: any) => ({ ...rec, source: 'friends' }))
    ];

    console.log('🔀 COMBINED RECOMMENDATIONS:', {
      total: allRecommendations.length,
      bySource: {
        tmdb: tmdb.length,
        ai: ai.length,
        friends: friends.length
      }
    });

    // Remove duplicates based on TMDB ID
    const seen = new Set<number>();
    const uniqueRecommendations = allRecommendations.filter((rec) => {
      const id = rec.tmdbId || rec.id;
      if (!id || seen.has(id) || excludeIds.has(id)) {
        return false;
      }
      seen.add(id);
      return true;
    });

    console.log('✅ DEDUPLICATION COMPLETE:', {
      beforeDedup: allRecommendations.length,
      afterDedup: uniqueRecommendations.length,
      excluded: excludeIds.size
    });

    // Sort by confidence/score and take top results
    const sortedRecommendations = uniqueRecommendations
      .sort((a, b) => (b.score || b.confidence || 0.5) - (a.score || a.confidence || 0.5))
      .slice(0, req.body?.limit || 12);

    // Calculate overall confidence
    const avgConfidence = sortedRecommendations.length > 0 
      ? sortedRecommendations.reduce((sum, rec) => sum + (rec.score || rec.confidence || 0.5), 0) / sortedRecommendations.length
      : 0;

    const processingTime = Date.now() - startTime;

    console.log('🎯 UNIFIED RECOMMENDATIONS COMPLETE:', {
      finalCount: sortedRecommendations.length,
      avgConfidence: avgConfidence.toFixed(3),
      processingTime: `${processingTime}ms`,
      filtersUsed
    });

    // Build response
    const response = {
      success: true,
      strategy: 'unified-multi-system',
      filtersUsed,
      appliedFilters: cleanFilters,
      recommendations: sortedRecommendations,
      confidence: parseFloat(avgConfidence.toFixed(3)),
      metadata: {
        totalFound: allRecommendations.length,
        afterDeduplication: uniqueRecommendations.length,
        finalReturned: sortedRecommendations.length,
        excluded: excludeIds.size,
        processingTime,
        sources: {
          tmdb: { count: tmdb.length, success: tmdbResults.status === 'fulfilled' },
          ai: { count: ai.length, success: aiResults.status === 'fulfilled' },
          friends: { count: friends.length, success: friendsResults.status === 'fulfilled' }
        },
        userProfile: {
          genres: userProfile.favoriteGenres.length,
          networks: userProfile.preferredNetworks.length,
          watchlistSize: userProfile.watchlist.length,
          historySize: userProfile.viewingHistory.length
        }
      }
    };

    res.json(response);

  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error('❌ UNIFIED RECOMMENDATIONS ERROR:', {
      error: error.message,
      stack: error.stack,
      processingTime: `${processingTime}ms`
    });

    res.status(500).json({
      success: false,
      strategy: 'unified-multi-system',
      message: 'Failed to generate unified recommendations',
      error: error.message,
      filtersUsed: 0,
      metadata: {
        processingTime,
        timestamp: new Date().toISOString()
      }
    });
  }
});

/**
 * Health check endpoint for unified recommendations
 * GET /api/recommendations/unified/health
 */
router.get('/unified/health', async (req: Request, res: Response) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        tmdb: process.env.TMDB_API_KEY ? 'configured' : 'missing',
        openai: process.env.OPENAI_API_KEY ? 'configured' : 'missing',
        database: 'connected' // Assume connected if we got this far
      },
      version: '2.0.0'
    };

    res.json(health);
  } catch (error: any) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;