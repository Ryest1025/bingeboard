// (Debug endpoints registered inside registerRoutes to avoid top-level app usage before definition)
import type { Express } from "express";
import { type Server } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// import authRoutes from './routes/auth';
import analyticsRoutes from './routes/analytics.js';
import { getDashboardContent, getDiscoverContent, getSearchContent } from './routes/content';
import { storage } from "./storage";
import { setupAuth, isAuthenticated, verifyPassword } from "./auth";
import { db, sqlite } from "./db";
import { eq, and, inArray, desc, gte, lte } from "drizzle-orm";
import {
  insertWatchlistSchema, insertActivitySchema, insertFriendshipSchema,
  insertActivityLikeSchema, insertActivityCommentSchema, insertUpcomingReleaseSchema,
  insertReleaseReminderSchema, insertNotificationSchema, insertStreamingIntegrationSchema,
  insertViewingHistorySchema, insertUserBehaviorSchema, insertRecommendationTrainingSchema
} from "@shared/schema";
import { users, upcomingReleases, releaseReminders } from "../shared/schema";
import { initializeFirebaseAdmin, sendPushNotification, getFirebaseAdminForAuth } from "./services/firebaseAdmin";
import { TMDBService } from "./services/tmdb";
import { sportsService } from "./services/sports";
import { StreamingService } from "./services/streamingService";
import { WatchmodeService } from "./services/watchmodeService";
import { MultiAPIStreamingService } from "./services/multiAPIStreamingService";
import { searchStreamingAvailability, getStreamingByImdbId } from "./clients/utellyClient";
import { registerViewingHistoryRoutes } from "./routes/viewing-history";
import { registerUserPreferencesRoutes } from "./routes/user-preferences";
import { registerFilterRoutes } from "./routes/filters";
import { registerAIRecommendationRoutes } from "./routes/aiRecommendations";
import { registerEnhancedRecommendationRoutes } from "./routes/enhancedRecommendations.js";
import { registerABTestingRoutes } from "./routes/abTesting";
import { registerAffiliateRoutes } from "./routes/affiliate.js";
import testRoutes from "./routes/test.js";
import { DatabaseIntegrationService } from "./services/databaseIntegration";
import multer from "multer";
import csvParser from "csv-parser";
import { Readable } from "stream";
import admin from "firebase-admin";

// Utility function to convert data to CSV format
function convertToCSV(data: any): string {
  const rows = [];

  // Add headers
  rows.push('Category,Field,Value');

  // Convert each data category to CSV rows
  Object.entries(data).forEach(([category, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === 'object' && item !== null) {
          Object.entries(item).forEach(([field, val]) => {
            rows.push(`"${category}[${index}]","${field}","${String(val).replace(/"/g, '""')}"`);
          });
        } else {
          rows.push(`"${category}","${index}","${String(item).replace(/"/g, '""')}"`);
        }
      });
    } else if (typeof value === 'object' && value !== null) {
      Object.entries(value).forEach(([field, val]) => {
        rows.push(`"${category}","${field}","${String(val).replace(/"/g, '""')}"`);
      });
    } else {
      rows.push(`"${category}","value","${String(value).replace(/"/g, '""')}"`);
    }
  });

  return rows.join('\n');
}

// Firebase authentication only

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // Initialize Enhanced Database Integration Service
  console.log('🗄️ Initializing Enhanced Database Integration Service...');
  const dbService = new DatabaseIntegrationService({
    type: process.env.NODE_ENV === 'production' ? 'postgres' : 'sqlite',
    sqlitePath: './dev.db',
    postgresUrl: process.env.DATABASE_URL
  });
  console.log('✅ Database Integration Service initialized');

  // CRITICAL: Set up authentication and session middleware FIRST
  // This must happen before any routes that use isAuthenticated middleware
  await setupAuth(app);

  // Analytics routes for monetization tracking
  app.use('/api/analytics', analyticsRoutes);

  // Multi-API trailer routes
  const multiapiRoutes = await import('./routes/multiapi');
  app.use('/api/multiapi', multiapiRoutes.default);

  // Personalized multi-API enriched content routes
  const personalizedRoutes = await import('./routes/personalized.js');
  app.use('/api/personalized', personalizedRoutes.default);

  // Viewing History & Progress Tracking Routes
  registerViewingHistoryRoutes(app);

  // User Preferences & Profile Routes
  registerUserPreferencesRoutes(app);

  // Filter Data Routes for Enhanced Filter System
  registerFilterRoutes(app);

  // AI Recommendation Routes
  registerAIRecommendationRoutes(app);
  registerEnhancedRecommendationRoutes(app);

  // Unified Recommendations Routes (NEW)
  const unifiedRecommendationRoutes = await import('./routes/unifiedRecommendations.js');
  app.use('/api/recommendations', unifiedRecommendationRoutes.default);

  // A/B Testing Framework Routes
  registerABTestingRoutes(app, dbService);
  console.log('🧪 A/B Testing Framework routes registered');

  // Affiliate Routes
  registerAffiliateRoutes(app);
  console.log('💰 Affiliate routes registered');

  // Test Routes for Development
  app.use('/api/test', testRoutes);
  console.log('🧪 Test routes registered');

  // Test endpoint for streaming data (no auth required)
  app.get('/api/test/recommendations-streaming', async (req, res) => {
    try {
      const tmdbService = new TMDBService();
      
      // Get some trending shows
      const trending = await tmdbService.getTrending('tv', 'day');
      const testShows = trending.results.slice(0, 3);
      
      console.log('🧪 Testing streaming enrichment on shows:', testShows.map((s: any) => s.name));
      
      // Enrich with streaming data
      await Promise.all(testShows.map(async (item: any) => {
        try {
          const streamingData = await MultiAPIStreamingService.getComprehensiveAvailability(
            item.id,
            item.name || item.title || '',
            'tv'
          );
          item.streamingPlatforms = streamingData.platforms;
          item.streamingStats = streamingData;
        } catch (e) {
          console.warn('Streaming enrich failed:', (e as Error).message);
        }
      }));
      
      res.json({ 
        shows: testShows,
        message: 'Test recommendations with streaming data' 
      });
    } catch (error) {
      console.error('Test recommendations error:', error);
      res.status(500).json({ error: 'Failed to fetch test recommendations' });
    }
  });

  // Content API Routes for Enhanced Filter System
  app.get('/api/content/dashboard', getDashboardContent);
  app.get('/api/content/discover', getDiscoverContent);
  app.get('/api/content/search', getSearchContent);

  // Enhanced Dashboard Clean API Routes
  const { getRecommendations } = await import('./api/recommendations.js');
  const { getContinueWatching } = await import('./api/continue-watching.js');
  const { getAwards } = await import('./api/awards.js');
  const { getProgress, updateProgress } = await import('./api/progress.js');
  
  app.get('/api/recommendations', getRecommendations);
  app.get('/api/continue-watching', getContinueWatching);
  app.get('/api/awards', getAwards);
  app.get('/api/progress', getProgress);
  app.post('/api/progress', updateProgress);

  // Import the new content functions - TEMPORARILY COMMENTED OUT
  // const { getTrendingByNetwork, getUpcoming, getNetworks, getGenres } = await import('./routes/content.js');
  
  // New content endpoints for ModernDiscoverEnhanced - TEMPORARILY COMMENTED OUT
  // app.get('/api/content/trending-by-network', getTrendingByNetwork);
  // app.get('/api/content/upcoming', getUpcoming);
  // app.get('/api/content/networks', getNetworks);
  // app.get('/api/content/genres', getGenres);

  // Debug middleware to log all requests and cookies
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/auth')) {
      console.log(`📋 ${req.method} ${req.path}`);
      console.log('📋 Session ID:', (req as any).sessionID);
      console.log('📋 Session exists:', !!(req as any).session);
      console.log('📋 Session data:', JSON.stringify((req as any).session, null, 2));
      console.log('📋 Cookie header:', req.headers.cookie || 'No cookie header');
      console.log('📋 req.user in debug middleware:', JSON.stringify((req as any).user, null, 2));
    }
    next();
  });

  // Firebase authentication only

  // Firebase session creation endpoint
  app.post('/api/auth/firebase-session', async (req, res) => {
    try {
      console.log('🔐 Firebase session endpoint called');
      console.log('📥 Request body:', JSON.stringify(req.body, null, 2));

      const authHeader = req.headers.authorization;
      const { firebaseToken, idToken, user: userFromBody } = req.body;

      // Extract the ID token from various sources
      const extractedIdToken = 
        (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null) ||
        idToken ||
        firebaseToken;

      if (!extractedIdToken && !userFromBody) {
        return res.status(401).json({ message: 'ID token required' });
      }

      let user;
      let sessionCookie;

      // Check if Firebase Admin is available
      const firebaseAdmin = getFirebaseAdminForAuth();

      if (extractedIdToken && firebaseAdmin) {
        try {
          console.log('🔐 Attempting Firebase token verification with Admin SDK...');
          
          // Verify the ID token first
          const decodedToken = await firebaseAdmin.auth().verifyIdToken(extractedIdToken);
          console.log('🔍 Firebase token decoded successfully:', {
            uid: decodedToken.uid,
            email: decodedToken.email,
            email_verified: decodedToken.email_verified,
          });

          // Create a session cookie (expires in 5 days)
          const expiresIn = 5 * 24 * 60 * 60 * 1000; // 5 days in milliseconds
          sessionCookie = await firebaseAdmin.auth().createSessionCookie(extractedIdToken, { expiresIn });
          console.log('✅ Firebase session cookie created');

          user = {
            id: decodedToken.uid,
            email: decodedToken.email || null,
            firstName: decodedToken.name?.split(' ')[0] || '',
            lastName: decodedToken.name?.split(' ').slice(1).join(' ') || '',
            phoneNumber: decodedToken.phone_number || null,
            profileImageUrl: decodedToken.picture || '',
            authProvider: 'email'
          };

          console.log('✅ Firebase user object created:', {
            id: user.id,
            email: user.email,
          });
        } catch (error) {
          console.error('❌ Firebase session creation failed:', error);
          return res.status(401).json({ message: 'Invalid Firebase token' });
        }
      } else if (extractedIdToken || userFromBody) {
        // Fallback for development without Firebase Admin
        let decodedUser = null;

        if (extractedIdToken && typeof extractedIdToken === 'string') {
          try {
            const base64Payload = extractedIdToken.split('.')[1];
            const decodedPayload = JSON.parse(atob(base64Payload));

            decodedUser = {
              uid: decodedPayload.user_id || decodedPayload.sub,
              email: decodedPayload.email,
              displayName: decodedPayload.name,
              photoURL: decodedPayload.picture,
              emailVerified: decodedPayload.email_verified
            };
          } catch (error) {
            console.error('❌ Failed to decode Firebase token:', error);
          }
        }

        const userData = userFromBody || decodedUser || {};
        
        // Create fallback session using JWT
        const { createAuthToken } = await import('./auth.js');
        const authUser = {
          id: userData.uid || `firebase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          email: userData.email || '',
          displayName: userData.displayName || '',
        };
        sessionCookie = createAuthToken(authUser);
        console.log('⚠️ Using fallback JWT token (Firebase Admin not available)');

        user = {
          id: authUser.id,
          email: userData.email || null,
          firstName: (userData.displayName)?.split(' ')[0] || '',
          lastName: (userData.displayName)?.split(' ').slice(1).join(' ') || '',
          phoneNumber: userData.phoneNumber || null,
          profileImageUrl: userData.photoURL || '',
          authProvider: 'email'
        };
      } else {
        console.warn('⚠️ Firebase Admin not configured and no token data provided');
        return res.status(401).json({ message: 'Firebase authentication not available' });
      }

      if (!user || !sessionCookie) {
        return res.status(401).json({ message: 'Session creation failed' });
      }

      // Store user in database
      console.log('💾 Storing user in database...');
      const dbUser = await storage.upsertUser(user as any);
      console.log('✅ User stored:', dbUser.email);

      // Set the session cookie
      // CRITICAL: For cross-origin requests, use sameSite: 'none' and secure: true
      const cookieOptions = {
        httpOnly: true,
        secure: true, // Required for sameSite: 'none'
        sameSite: 'none' as const, // Required for cross-origin
        maxAge: 5 * 24 * 60 * 60 * 1000, // 5 days
        path: '/',
      };
      
      res.cookie('bb_session', sessionCookie, cookieOptions);

      console.log('🍪 Session cookie set:', {
        name: 'bb_session',
        ...cookieOptions,
        maxAge: '5 days',
      });

      res.json({
        success: true,
        user: {
          id: dbUser.id,
          email: dbUser.email,
          firstName: dbUser.firstName,
          lastName: dbUser.lastName,
          profileImageUrl: dbUser.profileImageUrl
        }
      });

    } catch (error: any) {
      console.error('❌ Firebase session creation error:', error);
      res.status(500).json({ message: 'Session creation failed', error: error.message });
    }
  });

  const tmdbService = new TMDBService();

  // TMDB API Endpoints
  app.get('/api/tmdb/trending', async (req, res) => {
    try {
      const { mediaType = 'tv', timeWindow = 'week' } = req.query;
      const result = await tmdbService.getTrending(mediaType as 'tv' | 'movie' | 'all', timeWindow as 'day' | 'week');
      res.json(result);
    } catch (error) {
      console.error('TMDB trending error:', error);
      res.status(500).json({ message: 'Failed to fetch trending content' });
    }
  });

  // Additional trending endpoints for frontend compatibility
  app.get('/api/trending/:mediaType/:timeWindow', async (req, res) => {
    try {
      const { mediaType, timeWindow } = req.params;
      const includeStreaming = req.query.includeStreaming === 'true';
      console.log(`🎬 Trending API called: ${mediaType}/${timeWindow}, includeStreaming: ${includeStreaming}`);

      const result = await tmdbService.getTrending(mediaType as 'tv' | 'movie' | 'all', timeWindow as 'day' | 'week');
      console.log(`📊 TMDB returned ${result.results?.length || 0} results`);

      // PERFORMANCE OPTIMIZATION: Only enrich streaming data for spotlight (first 8 items)
      if (includeStreaming && result.results) {
        const itemsToEnrich = Math.min(8, result.results.length); // Only first 8 for better performance
        console.log(`🎬 Enriching ${itemsToEnrich} shows with streaming data...`);

        // Process in parallel batches of 5 for optimal performance
        const batchSize = 5;
        const enrichedResults = [];

        for (let i = 0; i < itemsToEnrich; i += batchSize) {
          const batch = result.results.slice(i, i + batchSize);

          const batchPromises = batch.map(async (item: any, batchIndex: number) => {
            const globalIndex = i + batchIndex + 1;
            try {
              const itemMediaType = item.title ? 'movie' : 'tv';
              const title = item.title || item.name || '';
              console.log(`📺 [${globalIndex}/${itemsToEnrich}] Getting streaming for: "${title}" (ID: ${item.id})`);

              const streamingData = await MultiAPIStreamingService.getComprehensiveAvailability(
                item.id,
                title,
                itemMediaType
              );

              console.log(`✅ [${globalIndex}/${itemsToEnrich}] "${title}" streaming platforms:`, streamingData.platforms.length, 'found');
              if (streamingData.platforms.length > 0) {
                console.log(`📋 [${globalIndex}/${itemsToEnrich}] Platform details:`, streamingData.platforms.map(p => p.provider_name));
              }

              return {
                ...item,
                watchProviders: streamingData.platforms,
                streamingProviders: streamingData.platforms,
                streamingPlatforms: streamingData.platforms,
                streaming_platforms: streamingData.platforms
              };
            } catch (error) {
              console.warn(`⚠️ [${globalIndex}/${itemsToEnrich}] Failed to get streaming data for "${item.title || item.name}":`, (error as Error).message);
              return item;
            }
          });

          const batchResults = await Promise.all(batchPromises);
          enrichedResults.push(...batchResults);

          // Small delay between batches to avoid rate limits
          if (i + batchSize < itemsToEnrich) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }

        // Replace enriched items and keep the rest unchanged
        result.results = [
          ...enrichedResults,
          ...result.results.slice(itemsToEnrich)
        ];

        console.log(`✅ Streaming enrichment complete. Processing time optimized for spotlight display.`);
      }

      res.json(result);
    } catch (error) {
      console.error('TMDB trending error:', error);
      res.status(500).json({ message: 'Failed to fetch trending content' });
    }
  });

  app.get('/api/tmdb/search', async (req, res) => {
    try {
      const { query, type = 'multi' } = req.query;
      if (!query) {
        return res.status(400).json({ message: 'Search query is required' });
      }
      const result = await tmdbService.search(query as string, { mediaType: type as 'movie' | 'tv' | 'multi' });
      res.json(result);
    } catch (error) {
      console.error('TMDB search error:', error);
      res.status(500).json({ message: 'Failed to search content' });
    }
  });

  // Enhanced search with actor support and relevancy scoring
  app.get('/api/streaming/enhanced-search', async (req, res) => {
    try {
      const { query, type = 'multi' } = req.query;
      if (!query) {
        return res.status(400).json({ message: 'Search query is required' });
      }

      // Search for content, people, and get trending data for relevancy scoring
      const [contentResults, personResults, trendingMovies, trendingTV] = await Promise.all([
        tmdbService.multiSearch(query as string),
        tmdbService.searchPerson(query as string),
        tmdbService.getTrending('movie', 'week').catch(() => ({ results: [] })),
        tmdbService.getTrending('tv', 'week').catch(() => ({ results: [] }))
      ]);

      // Create trending lookup for relevancy boost
      const trendingIds = new Set([
        ...(trendingMovies.results || []).map((item: any) => `movie-${item.id}`),
        ...(trendingTV.results || []).map((item: any) => `tv-${item.id}`)
      ]);

      let allResults = [...((contentResults as any).results || [])];

      // Add content from actors' known_for (if person found)
      if ((personResults as any).results?.length > 0) {
        for (const person of (personResults as any).results.slice(0, 3)) { // Top 3 matching actors
          if (person.known_for) {
            const actorContent = person.known_for.map((item: any) => ({
              ...item,
              _from_actor: person.name,
              _actor_relevance: person.popularity || 0
            }));
            allResults = [...allResults, ...actorContent];
          }
        }
      }

      // Enhanced relevancy scoring
      const scoredResults = allResults.map((item: any) => {
        let relevanceScore = 0;

        const title = (item.title || item.name || '').toLowerCase();
        const searchTerm = (query as string).toLowerCase();

        // Exact title match gets highest score
        if (title === searchTerm) {
          relevanceScore += 1000;
        }
        // Title starts with search term
        else if (title.startsWith(searchTerm)) {
          relevanceScore += 500;
        }
        // Title contains search term
        else if (title.includes(searchTerm)) {
          relevanceScore += 200;
        }

        // Boost trending content
        const itemKey = `${item.media_type || (item.title ? 'movie' : 'tv')}-${item.id}`;
        if (trendingIds.has(itemKey)) {
          relevanceScore += 300;
        }

        // Boost by popularity
        relevanceScore += (item.popularity || 0) * 0.1;

        // Boost if from actor search
        if (item._from_actor) {
          relevanceScore += (item._actor_relevance || 0) * 0.05;
        }

        // Boost recent content
        const releaseYear = new Date(item.release_date || item.first_air_date || '2000').getFullYear();
        const currentYear = new Date().getFullYear();
        if (releaseYear >= currentYear - 2) {
          relevanceScore += 50;
        }

        return { ...item, _relevance_score: relevanceScore };
      });

      // Sort by relevance score and remove duplicates
      const uniqueResults = scoredResults
        .sort((a, b) => (b._relevance_score || 0) - (a._relevance_score || 0))
        .filter((item, index, arr) => 
          arr.findIndex(other => other.id === item.id && 
            (other.media_type || (other.title ? 'movie' : 'tv')) === 
            (item.media_type || (item.title ? 'movie' : 'tv'))
          ) === index
        )
        .slice(0, 20); // Limit to top 20 results

      res.json({
        results: uniqueResults,
        total_results: uniqueResults.length,
        query,
        actor_matches: (personResults as any).results?.slice(0, 3).map((p: any) => p.name) || []
      });
    } catch (error) {
      console.error('Enhanced search error:', error);
      res.status(500).json({ message: 'Failed to perform enhanced search' });
    }
  });

  // Get genres list from TMDB
  app.get('/api/tmdb/genre/:type/list', async (req, res) => {
    try {
      const { type } = req.params;
      if (type !== 'tv' && type !== 'movie') {
        return res.status(400).json({ message: 'Type must be either "tv" or "movie"' });
      }
      const result = await tmdbService.getGenres(type as 'tv' | 'movie');
      res.json(result);
    } catch (error) {
      console.error('TMDB genres error:', error);
      res.status(500).json({ message: 'Failed to fetch genres' });
    }
  });

  // Enhanced genres endpoint used by dashboard (adds custom genres like Sports and caching hint)
  app.get('/api/content/genres-enhanced/:type/list', async (req, res) => {
    try {
      const { type } = req.params;
      if (type !== 'tv' && type !== 'movie') {
        return res.status(400).json({ message: 'Type must be either "tv" or "movie"' });
      }

      const base = await tmdbService.getGenres(type as 'tv' | 'movie');
      const genres = Array.isArray((base as any).genres) ? (base as any).genres.slice() : [];

      // Inject custom genre(s) if not present
      if (!genres.find((g: any) => g.name === 'Sports')) {
        genres.push({ id: 99999, name: 'Sports' });
      }
      if (!genres.find((g: any) => g.name === 'Thriller')) {
        genres.push({ id: 53, name: 'Thriller' });
      }
      if (!genres.find((g: any) => g.name === 'Romance')) {
        genres.push({ id: 10749, name: 'Romance' });
      }

      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.json({ genres, source: 'enhanced', count: genres.length });
    } catch (error) {
      console.error('Enhanced genres error:', error);
      res.status(500).json({ message: 'Failed to fetch enhanced genres' });
    }
  });

  // NEW: Combined genres endpoint merging TV + Movie genres to ensure broader coverage (Thriller, Romance, etc.)
  app.get('/api/content/genres-combined/list', async (_req, res) => {
    try {
      console.log('🎬 Combined genres endpoint hit');
      const tv = await tmdbService.getGenres('tv');
      const movie = await tmdbService.getGenres('movie');
      const map = new Map<number, string>();
      // Helper to insert preserving first casing
      const addAll = (arr: any) => Array.isArray(arr?.genres) && arr.genres.forEach((g: any) => { if (!map.has(g.id)) map.set(g.id, g.name); });
      addAll(tv);
      addAll(movie);

      // Ensure presence of expected onboarding genres even if TMDB omits them for a category
      const mustHave = [
        { id: 99999, name: 'Sports' },
        { id: 53, name: 'Thriller' }, // TMDB movie genre id
        { id: 10749, name: 'Romance' }
      ];
      mustHave.forEach(g => { if (!Array.from(map.values()).some(v => v.toLowerCase() === g.name.toLowerCase())) map.set(g.id, g.name); });

      const genres = Array.from(map.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.json({ genres, source: 'combined', count: genres.length });
    } catch (e) {
      console.error('Combined genres error:', e);
      res.status(500).json({ message: 'Failed to fetch combined genres' });
    }
  });

  // Global alias outside /api/content to avoid middleware ordering issues
  app.get('/api/genres/combined', async (_req, res) => {
    try {
      const tv = await tmdbService.getGenres('tv');
      const movie = await tmdbService.getGenres('movie');
      const map = new Map<number, string>();
      const addAll = (arr: any) => Array.isArray(arr?.genres) && arr.genres.forEach((g: any) => { if (!map.has(g.id)) map.set(g.id, g.name); });
      addAll(tv); addAll(movie);
      [{ id: 99999, name: 'Sports' }, { id: 53, name: 'Thriller' }, { id: 10749, name: 'Romance' }].forEach(g => { if (!Array.from(map.values()).some(v => v.toLowerCase() === g.name.toLowerCase())) map.set(g.id, g.name); });
      const genres = Array.from(map.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.json({ genres, source: 'combined-alias', count: genres.length });
    } catch (e) {
      console.error('Combined alias genres error:', e);
      res.status(500).json({ message: 'Failed to fetch combined genres (alias)' });
    }
  });

  // Backwards-compatible alias (some clients may request with /api/content/genres-combined/tv/list erroneously)
  app.get('/api/content/genres-combined/:maybeType/list', async (req, res, next) => {
    const { maybeType } = req.params;
    // Only treat as alias if param looks like media type, otherwise skip
    if (maybeType === 'tv' || maybeType === 'movie') {
      console.log('🎬 Combined genres alias hit with type param:', maybeType);
      return (app as any)._router.handle({
        ...req,
        method: 'GET',
        url: '/api/content/genres-combined/list'
      }, res, next);
    }
    next();
  });

  app.get('/api/tmdb/discover/:type', async (req, res) => {
    try {
      const { type } = req.params;
      const filters = req.query;
      const includeStreaming = req.query.includeStreaming === 'true';

      if (type === 'tv' || type === 'movie') {
        const result = await tmdbService.discover(type as 'tv' | 'movie', filters);

        // PERFORMANCE OPTIMIZATION: Only enrich first 8 items for spotlight display
        if (includeStreaming && result.results) {
          const itemsToEnrich = Math.min(8, result.results.length); // Reduced from 20 to 8
          console.log(`🔍 Enriching ${itemsToEnrich} discover results with streaming data...`);

          // Process in batches for better performance
          const batchSize = 4;
          const enrichedResults = [];

          for (let i = 0; i < itemsToEnrich; i += batchSize) {
            const batch = result.results.slice(i, i + batchSize);

            const batchPromises = batch.map(async (item: any, batchIndex: number) => {
              const globalIndex = i + batchIndex + 1;
              try {
                const itemMediaType = type;
                const title = item.title || item.name || '';
                const streamingData = await MultiAPIStreamingService.getComprehensiveAvailability(
                  item.id,
                  title,
                  itemMediaType
                );

                return {
                  ...item,
                  watchProviders: streamingData.platforms,
                  streamingProviders: streamingData.platforms,
                  streamingPlatforms: streamingData.platforms,
                  streaming_platforms: streamingData.platforms
                };
              } catch (error) {
                console.warn(`⚠️ [${globalIndex}/${itemsToEnrich}] Failed to get streaming data for ${item.id}:`, (error as Error).message);
                return item;
              }
            });

            const batchResults = await Promise.all(batchPromises);
            enrichedResults.push(...batchResults);

            // Small delay between batches
            if (i + batchSize < itemsToEnrich) {
              await new Promise(resolve => setTimeout(resolve, 50));
            }
          }

          // Replace enriched items and keep the rest unchanged
          result.results = [
            ...enrichedResults,
            ...result.results.slice(itemsToEnrich)
          ];

          console.log(`✅ Streaming enrichment complete. First item platforms:`, enrichedResults[0]?.streamingPlatforms?.length || 0);
        }

        res.json(result);
      } else {
        res.status(400).json({ message: 'Type must be either "tv" or "movie"' });
      }
    } catch (error) {
      console.error('TMDB discover error:', error);
      res.status(500).json({ message: 'Failed to discover content' });
    }
  });

  app.get('/api/tmdb/:type/:id', async (req, res) => {
    try {
      const { type, id } = req.params;
      let result;
      if (type === 'tv') {
        result = await tmdbService.getShowDetails(parseInt(id));
      } else if (type === 'movie') {
        result = await tmdbService.getMovieDetails(parseInt(id));
      } else {
        return res.status(400).json({ message: 'Type must be either "tv" or "movie"' });
      }
      res.json(result);
    } catch (error) {
      console.error('TMDB details error:', error);
      res.status(500).json({ message: 'Failed to fetch content details' });
    }
  });

  // TMDB Video endpoints for trailer support
  app.get('/api/tmdb/:type/:id/videos', async (req, res) => {
    try {
      const { type, id } = req.params;
      if (type !== 'tv' && type !== 'movie') {
        return res.status(400).json({ message: 'Type must be either "tv" or "movie"' });
      }
      const result = await tmdbService.getVideos(type as 'tv' | 'movie', parseInt(id));
      res.json(result);
    } catch (error) {
      console.error('TMDB videos error:', error);
      res.status(500).json({ message: 'Failed to fetch videos' });
    }
  });

  // Get watch providers for affiliate linking
  app.get('/api/tmdb/:type/:id/watch/providers', async (req, res) => {
    try {
      const { type, id } = req.params;
      const region = req.query.region || 'US';
      if (type !== 'tv' && type !== 'movie') {
        return res.status(400).json({ message: 'Type must be either "tv" or "movie"' });
      }
      const result = await tmdbService.getWatchProviders(type as 'tv' | 'movie', parseInt(id), region as string);
      res.json(result);
    } catch (error) {
      console.error('TMDB watch providers error:', error);
      res.status(500).json({ message: 'Failed to fetch watch providers' });
    }
  });

  // Awards-based content filtering
  app.get('/api/tmdb/awards-content', async (req, res) => {
    try {
      const award = req.query.award as string;
      let results: any[] = [];

      switch (award) {
        case 'oscar':
          // Query for Academy Award winners using TMDB's discover endpoint with keywords
          const oscarResponse = await tmdbService.discover('movie', {
            keywords: '210024', // Academy Award winner keyword
            sortBy: 'vote_average.desc',
            voteAverageGte: 7.0,
            page: 1
          });
          results = oscarResponse.results || [];
          break;

        case 'emmy':
          // Query for Emmy Award winning TV shows
          const emmyResponse = await tmdbService.discover('tv', {
            keywords: '4565', // Emmy Award keyword
            sortBy: 'vote_average.desc',
            voteAverageGte: 7.0,
            page: 1
          });
          results = emmyResponse.results || [];
          break;

        case 'golden-globe':
          // Query for Golden Globe winners (movies and TV)
          const goldenGlobeMovies = await tmdbService.discover('movie', {
            keywords: '5846', // Golden Globe keyword
            sortBy: 'vote_average.desc',
            voteAverageGte: 7.0,
            page: 1
          });
          const goldenGlobeTV = await tmdbService.discover('tv', {
            keywords: '5846',
            sortBy: 'vote_average.desc',
            voteAverageGte: 7.0,
            page: 1
          });
          results = [...(goldenGlobeMovies.results || []), ...(goldenGlobeTV.results || [])];
          break;

        case 'sag':
          // Query for SAG Award winners
          const sagResponse = await tmdbService.discover('movie', {
            keywords: '34627', // SAG Award keyword
            sortBy: 'vote_average.desc',
            voteAverageGte: 7.0,
            page: 1
          });
          results = sagResponse.results || [];
          break;

        default:
          // Fallback to highly rated content
          const fallbackResponse = await tmdbService.discover('movie', {
            sortBy: 'vote_average.desc',
            voteAverageGte: 8.0,
            page: 1
          });
          results = fallbackResponse.results || [];
      }

      res.json({ results: results.slice(0, 20) });
    } catch (error) {
      console.error('TMDB awards content error:', error);
      res.status(500).json({ message: 'Failed to fetch awards content' });
    }
  });

  // Multi-API Trailer Aggregation (initial TMDB-only implementation with future expansion hooks)
  app.get('/api/multi-api/trailer/:type/:id', async (req, res) => {
    try {
      const { type, id } = req.params;
      const title = (req.query.title as string) || '';
      if (type !== 'tv' && type !== 'movie') {
        return res.status(400).json({ message: 'Type must be either "tv" or "movie"' });
      }

      // Primary source: TMDB videos
      let tmdbVideos: any = null;
      try {
        tmdbVideos = await tmdbService.getVideos(type as 'tv' | 'movie', parseInt(id));
      } catch (e) {
        console.warn('⚠️ TMDB videos fetch failed for trailer aggregation:', (e as Error).message);
      }

      // Placeholder monetization heuristic (stub) - will integrate real data later
      const assessMonetization = (video: any): { monetized: boolean; monetizationScore: number } => {
        // Basic heuristic: official trailers maybe monetizable later; score reserved
        const isOfficial = !!video.official;
        const name = (video.name || '').toLowerCase();
        const looksLikeOfficial = name.includes('official trailer');
        const monetized = false; // Always false until affiliate / ad data integrated
        const monetizationScore = (isOfficial || looksLikeOfficial) ? 0.6 : 0.2; // Placeholder scoring
        return { monetized, monetizationScore };
      };

      const trailers: any[] = [];
      if (tmdbVideos?.results?.length) {
        for (const v of tmdbVideos.results) {
          if ((v.type === 'Trailer' || v.type === 'Teaser') && v.site === 'YouTube' && v.key) {
            const monetizationMeta = assessMonetization(v);
            trailers.push({
              source: 'tmdb',
              platform: 'youtube',
              videoType: v.type.toLowerCase(),
              key: v.key,
              name: v.name,
              official: !!v.official,
              published_at: v.published_at || null,
              url: `https://www.youtube.com/watch?v=${v.key}`,
              embeddableUrl: `https://www.youtube.com/embed/${v.key}`,
              monetized: monetizationMeta.monetized,
              monetizationScore: monetizationMeta.monetizationScore
            });
          }
        }
      }

      // Select primary trailer preference order: official trailer > trailer > teaser > first
      const primaryTrailer = trailers
        .sort((a, b) => (b.monetizationScore ?? 0) - (a.monetizationScore ?? 0))
        .find(t => t.videoType === 'trailer' && t.official) ||
        trailers.find(t => t.videoType === 'trailer') ||
        trailers.find(t => t.videoType === 'teaser') ||
        trailers[0] || null;

      res.setHeader('Cache-Control', 'public, max-age=1800'); // 30 min cache
      return res.json({
        id: parseInt(id),
        type,
        title,
        trailers,
        primaryTrailer,
        stats: {
          total: trailers.length,
          monetized: trailers.filter(t => t.monetized).length
        },
        sources: {
          tmdb: true,
          youtube_api: false, // placeholder for future direct YouTube Data API integration
          external_affiliate: false
        },
        monetization: {
          strategy: 'heuristic-stub',
          notes: 'Monetization flags are placeholders; integration with partner APIs pending.'
        },
        generatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Multi-API trailer aggregation error:', error);
      res.status(500).json({ message: 'Failed to aggregate trailers' });
    }
  });

  // Get comprehensive streaming availability from all APIs
  app.get('/api/streaming/comprehensive/:type/:id', async (req, res) => {
    try {
      const { type, id } = req.params;
      const title = req.query.title as string;
      const imdbId = req.query.imdbId as string;

      if (type !== 'tv' && type !== 'movie') {
        return res.status(400).json({ message: 'Type must be either "tv" or "movie"' });
      }

      if (!title) {
        return res.status(400).json({ message: 'Title parameter is required' });
      }

      const result = await MultiAPIStreamingService.getComprehensiveAvailability(
        parseInt(id),
        title,
        type as 'movie' | 'tv',
        imdbId
      );

      res.json(result);
    } catch (error) {
      console.error('Comprehensive streaming availability error:', error);
      res.status(500).json({ message: 'Failed to fetch streaming availability' });
    }
  });

  // Batch streaming availability endpoint
  // POST /api/streaming/batch-availability
  // Body: { items: [{ tmdbId:number; title:string; mediaType:'movie'|'tv'; imdbId?:string }] }
  app.post('/api/streaming/batch-availability', async (req, res) => {
    const started = Date.now();
    try {
      const items = Array.isArray(req.body?.items) ? req.body.items : [];
      if (items.length === 0) {
        return res.status(400).json({ message: 'items array required' });
      }
      // Basic validation & limits
      const MAX_ITEMS = 25;
      if (items.length > MAX_ITEMS) {
        return res.status(400).json({ message: `Too many items (max ${MAX_ITEMS})` });
      }
      const sanitized = items
        .filter((it: any) => it && typeof it.tmdbId === 'number' && it.title && (it.mediaType === 'movie' || it.mediaType === 'tv'))
        .map((it: any) => ({ tmdbId: it.tmdbId, title: it.title, mediaType: it.mediaType, imdbId: it.imdbId }));
      if (sanitized.length === 0) {
        return res.status(400).json({ message: 'No valid items provided' });
      }

      const availabilityMap = await MultiAPIStreamingService.getBatchAvailability(sanitized);
      const results: Record<string, any> = {};
      availabilityMap.forEach((value, key) => {
        results[key] = value;
      });
      const duration = Date.now() - started;
      res.json({
        results,
        order: sanitized.map((i: any) => i.tmdbId),
        stats: {
          requested: items.length,
          processed: sanitized.length,
          returned: availabilityMap.size,
          durationMs: duration
        }
      });
    } catch (error) {
      console.error('Batch availability error:', error);
      res.status(500).json({ message: 'Failed to fetch batch availability' });
    }
  });

  // Enhanced multi-API search endpoint leveraging TMDB + streaming availability
  // GET /api/streaming/enhanced-search?query=...&type=multi|movie|tv
  app.get('/api/streaming/enhanced-search', async (req, res) => {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).slice(2, 9);
    
    try {
      const query = (req.query.query || req.query.q || '').toString().trim();
      const mediaType = (req.query.type || req.query.mediaType || 'multi').toString();
      
      console.log(`🔍 [${requestId}] Enhanced search started: query="${query}", type="${mediaType}"`);
      
      if (!query || query.length < 2) {
        console.log(`⚠️ [${requestId}] Query too short: "${query}"`);
        return res.json({ results: [] });
      }

      const searchResponse = await tmdbService.search(query, { mediaType: mediaType as any, page: 1 });
      const rawResults: any[] = (searchResponse.results || []).slice(0, 20);
      
      console.log(`📊 [${requestId}] TMDB returned ${rawResults.length} results`);

      // Enrich first 8 results with streaming data (performance conscious)
      const ENRICH_LIMIT = 8;
      const enriched = await Promise.all(rawResults.map(async (item, index) => {
        const base: any = { ...item };
        base.media_type = base.media_type || (base.title ? 'movie' : 'tv');
        if (index < ENRICH_LIMIT) {
          try {
            const streamingData = await MultiAPIStreamingService.getComprehensiveAvailability(
              base.id,
              base.title || base.name || '',
              base.media_type === 'movie' ? 'movie' : 'tv'
            );
            base.streaming = streamingData.platforms || [];
            base.streamingStats = {
              totalPlatforms: streamingData.totalPlatforms,
              affiliatePlatforms: streamingData.affiliatePlatforms,
              premiumPlatforms: streamingData.premiumPlatforms,
              freePlatforms: streamingData.freePlatforms,
              sources: streamingData.sources
            };
          } catch (e) {
            // Non-fatal; skip enrichment for this item
          }
        }
        return base;
      }));

      const duration = Date.now() - startTime;
      console.log(`✅ [${requestId}] Enhanced search completed in ${duration}ms, enriched ${Math.min(ENRICH_LIMIT, rawResults.length)}/${rawResults.length} results`);

      res.json({ results: enriched });
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ [${requestId}] Enhanced streaming search error after ${duration}ms:`, error);
      res.status(500).json({ message: 'Failed to perform enhanced streaming search' });
    }
  });

  // NEW: Enhanced filtered search (POST) under /api/streaming namespace
  // Mirrors legacy /api/content/enhanced-search but aligned with streaming multi-API naming
  app.post('/api/streaming/enhanced-search', async (req, res) => {
    try {
      const filters = req.body || {};
      const type = (filters.type || filters.mediaType || 'multi').toString(); // tv | movie | multi
      const includeStreaming = !!filters.includeStreaming;

      const baseDiscoverParams: any = {
        page: 1,
        sort_by: filters.sortBy || 'popularity.desc'
      };
      if (Array.isArray(filters.genres) && filters.genres.length > 0) {
        const genreIds = filters.genres.map((g: any) => g.id ? g.id : g).filter((g: any) => !!g);
        if (genreIds.length) baseDiscoverParams.with_genres = genreIds.join(',');
      }
      if (Array.isArray(filters.ratingRange) && filters.ratingRange.length === 2) {
        baseDiscoverParams['vote_average.gte'] = filters.ratingRange[0];
        baseDiscoverParams['vote_average.lte'] = filters.ratingRange[1];
      }
      if (filters.releaseYear) {
        baseDiscoverParams.primary_release_year = filters.releaseYear; // movies
        baseDiscoverParams.first_air_date_year = filters.releaseYear;  // tv
      }
      if (Array.isArray(filters.providers) && filters.providers.length > 0) {
        baseDiscoverParams.with_watch_providers = filters.providers.join('|');
        baseDiscoverParams.watch_region = 'US';
      }

      // Helper to run discover for a media type
      const runDiscover = async (mt: 'tv' | 'movie') => {
        try {
          return await tmdbService.discover(mt, baseDiscoverParams);
        } catch (e) {
          console.warn(`⚠️ Discover failed for ${mt}:`, (e as Error).message);
          return { results: [], total_results: 0 };
        }
      };

      let tvResults: any = { results: [], total_results: 0 };
      let movieResults: any = { results: [], total_results: 0 };
      if (type === 'tv') {
        tvResults = await runDiscover('tv');
      } else if (type === 'movie') {
        movieResults = await runDiscover('movie');
      } else { // multi
        [tvResults, movieResults] = await Promise.all([runDiscover('tv'), runDiscover('movie')]);
      }

      let combinedResults: any[] = [
        ...(tvResults.results || []).map((r: any) => ({ ...r, media_type: 'tv' })),
        ...(movieResults.results || []).map((r: any) => ({ ...r, media_type: 'movie' }))
      ];

      // Basic distinct by TMDB id + media_type
      const seen = new Set<string>();
      combinedResults = combinedResults.filter(r => {
        const key = `${r.media_type}_${r.id}`;
        if (seen.has(key)) return false;
        seen.add(key); return true;
      }).slice(0, 40);

      // Optional streaming enrichment (first 8 items)
      if (includeStreaming) {
        const ENRICH_LIMIT = 8;
        await Promise.all(combinedResults.slice(0, ENRICH_LIMIT).map(async (item, index) => {
          try {
            const streamingData = await MultiAPIStreamingService.getComprehensiveAvailability(
              item.id,
              item.title || item.name || '',
              item.media_type === 'movie' ? 'movie' : 'tv'
            );
            item.streaming = streamingData.platforms || [];
            item.streamingStats = {
              totalPlatforms: streamingData.totalPlatforms,
              affiliatePlatforms: streamingData.affiliatePlatforms,
              premiumPlatforms: streamingData.premiumPlatforms,
              freePlatforms: streamingData.freePlatforms,
              sources: streamingData.sources
            };
          } catch (e) {
            if (index < 3) console.warn('⚠️ Streaming enrich failed:', (e as Error).message);
          }
        }));
      }

      res.json({
        results: combinedResults,
        totalResults: (tvResults.total_results || 0) + (movieResults.total_results || 0),
        enriched: includeStreaming,
        stats: {
          tvCount: tvResults.results?.length || 0,
          movieCount: movieResults.results?.length || 0,
          returned: combinedResults.length
        }
      });
    } catch (error) {
      console.error('Error performing streaming enhanced filtered search:', error);
      res.status(500).json({ error: 'Failed to perform enhanced filtered search' });
    }
  });

  // Configure multer for file uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (
        file.mimetype === 'text/csv' ||
        file.mimetype === 'application/json' ||
        file.originalname.endsWith('.csv') ||
        file.originalname.endsWith('.json')
      ) {
        cb(null, true);
      } else {
        cb(new Error('Only CSV and JSON files are allowed'));
      }
    }
  });

  // Test endpoint to verify connectivity
  app.get('/api/test', (_req, res) => {
    console.log('Test endpoint called');
    res.json({ message: 'API is working', timestamp: Date.now() });
  });

  // Firebase configuration test endpoint
  app.get('/api/test-firebase', (req, res) => {
    const firebaseConfig = {
      apiKey: process.env.VITE_FIREBASE_API_KEY ? 'Set' : 'Missing',
      authDomain: process.env.VITE_FIREBASE_PROJECT_ID ? `${process.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com` : 'Missing',
      projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'Missing',
      appId: process.env.VITE_FIREBASE_APP_ID ? 'Set' : 'Missing',
      currentDomain: req.get('host')
    };
    res.json({
      message: 'Firebase configuration check',
      config: firebaseConfig,
      timestamp: Date.now()
    });
  });

  // 🔐 Session Status Endpoint - Checks if user has valid session
  app.get('/api/auth/session', async (req: any, res) => {
    try {
      console.log('🔍 Session check endpoint called');
      console.log('📋 Session exists:', !!req.session);
      console.log('📋 Session user:', req.session?.user?.email);
      if (req.session?.user) {
        // Enrich user object with onboarding status from database
        let enrichedUser = { ...req.session.user };
        
        try {
          const userId = req.session.user.id;
          const userPreferences = await storage.getUserPreferences(userId);
          
          console.log('🔍 DEBUG - userPreferences object:', userPreferences);
          console.log('🔍 DEBUG - onboardingCompleted field:', userPreferences?.onboardingCompleted);
          console.log('🔍 DEBUG - typeof onboardingCompleted:', typeof userPreferences?.onboardingCompleted);
          
          if (userPreferences) {
            // Add onboarding status from preferences - handle various data types
            const onboardingStatus = userPreferences.onboardingCompleted;
            enrichedUser.onboardingCompleted = Boolean(onboardingStatus);
            console.log('✅ Enriched user with onboarding status:', enrichedUser.onboardingCompleted);
          } else {
            // No preferences found, onboarding not completed
            enrichedUser.onboardingCompleted = false;
            console.log('📋 No preferences found, onboarding not completed');
          }
        } catch (prefError) {
          console.error('❌ Error fetching preferences for session:', prefError);
          // Default to false if we can't check
          enrichedUser.onboardingCompleted = false;
        }
        
        return res.json({ authenticated: true, user: enrichedUser });
      }
      return res.status(401).json({ authenticated: false, message: 'No valid session' });
    } catch (error) {
      console.error('❌ Session check error:', error);
      res.status(500).json({ authenticated: false, message: 'Session check failed' });
    }
  });

  // 🔓 PUBLIC Authentication Status Check - No auth required
  // This endpoint checks if user is authenticated without requiring authentication
  app.get('/api/auth/status', async (req: any, res) => {
    try {
      // Check for Firebase session cookie first
      const sessionCookie = req.cookies['bb_session'];
      const legacyToken = req.cookies['bingeboard_auth'];
      
      console.log('🔍 Auth status check:', {
        allCookies: Object.keys(req.cookies || {}),
        hasSessionCookie: !!sessionCookie,
        hasLegacyToken: !!legacyToken,
        origin: req.headers.origin,
        referer: req.headers.referer,
      });

      // Try Firebase Session Cookie first (most secure)
      if (sessionCookie) {
        try {
          const { getFirebaseAdminForAuth } = await import('./services/firebaseAdmin.js');
          const admin = getFirebaseAdminForAuth();

          if (admin) {
            // Verify the session cookie
            const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
            console.log('✅ Session cookie verified:', decodedClaims.email);

            return res.json({
              isAuthenticated: true,
              user: {
                id: decodedClaims.uid,
                uid: decodedClaims.uid,
                email: decodedClaims.email,
                displayName: decodedClaims.name || decodedClaims.email,
                name: decodedClaims.name || null,
                picture: decodedClaims.picture || null,
              }
            });
          } else {
            console.warn('⚠️ Firebase Admin not available, falling back to legacy token');
          }
        } catch (error) {
          console.error('❌ Session cookie verification failed:', error);
          // Clear invalid session cookie
          res.clearCookie('bb_session', {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/',
          });
          // Fall through to check legacy token
        }
      }

      // Fallback to legacy JWT token
      if (legacyToken) {
        const { verifyAuthToken } = await import('./auth.js');
        const user = verifyAuthToken(legacyToken);

        if (user) {
          console.log('✅ Legacy token verified:', user.email);
          return res.json({
            user: {
              id: user.id,
              email: user.email,
              displayName: user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
            },
            isAuthenticated: true
          });
        } else {
          // Clear invalid legacy cookie
          res.clearCookie('bingeboard_auth');
        }
      }

      // No valid authentication found
      console.log('❌ No valid authentication found');
      return res.json({ user: null, isAuthenticated: false });

    } catch (error) {
      console.error('❌ Auth status check error:', error);
      return res.json({ user: null, isAuthenticated: false });
    }
  });

  // 🛠️ DEVELOPMENT LOGIN - Quick authentication for development
  app.post('/api/auth/dev-login', async (req: any, res) => {
    try {
      console.log('🔐 Development login endpoint called');
      
      // Create development user
      const devUser = {
        id: "manual_dev_user_123",
        email: "rachel.gubin@gmail.com",
        displayName: "Rachel Gubin",
        firstName: "Rachel",
        lastName: "Gubin"
      };

      // Create JWT token
      const { createAuthToken } = await import('./auth.js');
      const token = createAuthToken(devUser);
      
      // Set HTTP-only cookie with cross-origin support
      const cookieOptions = {
        httpOnly: true,
        secure: true, // Always true for cross-origin (requires HTTPS)
        sameSite: 'none' as const, // Required for cross-origin cookies
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
      };
      
      res.cookie('bingeboard_auth', token, cookieOptions);
      
      console.log('🔐 Development user JWT created:', devUser.email);
      
      return res.json({
        user: {
          id: devUser.id,
          email: devUser.email,
          displayName: devUser.displayName
        },
        isAuthenticated: true
      });
    } catch (error) {
      console.error('❌ Dev login error:', error);
      res.status(500).json({ message: 'Failed to create dev token' });
    }
  });

  // 🔐 CRITICAL AUTHENTICATION ENDPOINT - Session Validation
  // 🚨 PROTECTED: This endpoint validates local sessions and is ESSENTIAL
  // for the useAuth hook's local session check (first priority)
  // Status: ✅ LOCKED - Session validation working perfectly
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      console.log('User object in request:', JSON.stringify(req.user, null, 2));
      const userId = req.user?.claims?.sub || req.user?.id;
      if (!userId) {
        console.error('No user ID found in session');
        return res.status(401).json({ message: "No user ID in session" });
      }

      console.log('Fetching user data for userId:', userId);
      let user;
      try {
        user = await storage.getUser(userId);
      } catch (dbError) {
        console.error('Database error when fetching user:', dbError);
        // Fallback to session user data if database fails
        if (req.user) {
          console.log('🔄 Database failed, falling back to session user data');
          // Ensure Rachel's onboarding is marked complete
          if (req.user.email === 'rachel.gubin@gmail.com') {
            req.user.onboardingCompleted = true;
          }
          return res.json(req.user);
        }
        throw dbError;
      }

      if (!user) {
        console.error('User not found in database:', userId);
        // Fallback to session user data if database fails
        if (req.user) {
          console.log('🔄 Falling back to session user data');
          // Ensure Rachel's onboarding is marked complete
          if (req.user.email === 'rachel.gubin@gmail.com') {
            req.user.onboardingCompleted = true;
          }
          return res.json(req.user);
        }
        return res.status(404).json({ message: "User not found" });
      }

      console.log('User data from database:', JSON.stringify(user, null, 2));
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Firebase-only logout endpoint
  app.post('/api/auth/logout', (req: any, res) => {
    try {
      console.log('🔐 Logout endpoint called');

      // Clear Firebase session cookie
      res.clearCookie('bb_session', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
      });

      // Clear legacy JWT cookie
      res.clearCookie('bingeboard_auth', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
      });

      // Clear old session cookie if exists
      res.clearCookie('bingeboard.session', {
        path: '/',
        httpOnly: true,
        sameSite: 'lax'
      });

      console.log('✅ All auth cookies cleared');
      res.json({ success: true, message: 'Logged out successfully' });

    } catch (error) {
      console.error('❌ Logout error:', error);
      res.status(500).json({ message: 'Failed to logout' });
    }
  });

  // GET logout endpoint for compatibility (redirects)
  app.get('/api/logout', (req: any, res) => {
    try {
      console.log('🔐 GET Logout endpoint called (redirect method)');

      // Clear the session
      req.session.destroy((err: any) => {
        if (err) {
          console.error('❌ Session destroy error:', err);
          return res.redirect('/?logout=error');
        }

        console.log('✅ Session destroyed successfully');
        // Clear the custom session cookie (bingeboard.session) - development settings  
        res.clearCookie('bingeboard.session', {
          path: '/',
          domain: undefined,
          secure: false, // false in development
          httpOnly: true,
          sameSite: 'lax' // lax in development
        });

        console.log('✅ Session cookie cleared, redirecting to home');
        res.redirect('/?logout=success');
      });
    } catch (error) {
      console.error('❌ Logout error:', error);
      res.redirect('/?logout=error');
    }
  });

  // Password Reset Routes
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email, phoneNumber, method } = req.body;

      if (!email && !phoneNumber) {
        return res.status(400).json({ message: 'Email or phone number is required' });
      }

      if (!method || !['email', 'sms'].includes(method)) {
        return res.status(400).json({ message: 'Method must be either "email" or "sms"' });
      }

      // Find user by email or phone
      let user;
      if (email) {
        console.log(`🔍 Looking for user with email: ${email}`);
        user = await storage.getUserByEmail(email);
        console.log(`🔍 User found:`, user ? `${user.id} (${user.email})` : 'No user found');
      }

      if (!user) {
        console.log(`⚠️  No user found for email: ${email}`);
        // Don't reveal if email/phone exists for security
        return res.json({ message: 'If the account exists, a reset code will be sent.' });
      }

      const currentTime = Math.floor(Date.now() / 1000);

      if (method === 'email') {
        // Generate secure token for email reset (link-based)
        const crypto = await import('crypto');
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = currentTime + (60 * 60); // 1 hour

        await storage.createPasswordResetToken(user.id, token, expiresAt);

        // Send email
        const { EmailService } = await import('./services/emailService');
        const emailService = new EmailService();

        if (!emailService.isEmailConfigured()) {
          console.error('❌ Email service not configured - EMAIL_USER and EMAIL_PASS environment variables required');
          return res.status(500).json({
            message: 'Email service not configured. Please contact support or try SMS method.'
          });
        }

        const emailSent = await emailService.sendPasswordResetEmail(email, token, false);

        if (!emailSent) {
          return res.status(500).json({ message: 'Failed to send reset email' });
        }

        console.log(`✅ Password reset email sent to ${email}`);
        res.json({ message: 'Password reset email sent successfully' });

      } else if (method === 'sms') {
        // Use provided phone number or user's stored phone number
        const targetPhoneNumber = phoneNumber || user.phoneNumber;

        if (!targetPhoneNumber) {
          return res.status(400).json({
            message: 'No phone number provided and none on file. Please provide a phone number or use email method.'
          });
        }

        // Generate 6-digit code for SMS
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = currentTime + (15 * 60); // 15 minutes

        const resetCode = await storage.createPasswordResetCode({
          userId: user.id,
          code: code,
          email: null,
          phoneNumber: targetPhoneNumber,
          deliveryMethod: 'sms',
          isUsed: 0,
          expiresAt: expiresAt,
          createdAt: currentTime
        });

        // Send SMS
        const { SmsService } = await import('./services/smsService');
        const smsService = new SmsService();

        if (!smsService.isConfigured()) {
          return res.status(500).json({
            message: 'SMS service not configured. Please use email method or contact support.'
          });
        }

        const smsSent = await smsService.sendPasswordResetCode(targetPhoneNumber, code);

        if (!smsSent) {
          return res.status(500).json({ message: 'Failed to send reset code' });
        }

        console.log(`✅ Password reset code sent via SMS to ${targetPhoneNumber}`);
        res.json({
          message: 'Password reset code sent successfully',
          codeId: resetCode.id // For verification
        });
      }

    } catch (error) {
      console.error('❌ Forgot password error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, code, email, phoneNumber, password, codeId } = req.body;

      if (!password || password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
      }

      let user;

      if (token) {
        // Token-based reset (email link)
        user = await storage.verifyPasswordResetToken(token);
        if (!user) {
          return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Update password using Firebase Admin (for Firebase users) or direct DB update
        const { hashPassword } = await import('./auth');
        const hashedPassword = await hashPassword(password);

        await storage.updateUser(user.id, { passwordHash: hashedPassword });
        await storage.clearPasswordResetToken(user.id);

        console.log(`✅ Password reset successful for user ${user.email} via token`);
        res.json({ message: 'Password reset successful' });

      } else if (code) {
        // Code-based reset (SMS)
        const resetCode = await storage.verifyPasswordResetCode(code, email, phoneNumber);
        if (!resetCode) {
          return res.status(400).json({ message: 'Invalid or expired reset code' });
        }

        user = await storage.getUser(resetCode.userId);
        if (!user) {
          return res.status(400).json({ message: 'User not found' });
        }

        // Update password
        const { hashPassword } = await import('./auth');
        const hashedPassword = await hashPassword(password);

        await storage.updateUser(user.id, { passwordHash: hashedPassword });
        await storage.clearPasswordResetCode(resetCode.id);

        console.log(`✅ Password reset successful for user ${user.email} via code`);
        res.json({ message: 'Password reset successful' });

      } else {
        return res.status(400).json({ message: 'Reset token or code is required' });
      }

    } catch (error) {
      console.error('❌ Reset password error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // User Profile routes
  app.put('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const updates = req.body;

      const user = await storage.updateUser(userId, updates);
      res.json(user);
    } catch (error) {
      console.error('❌ Profile update error:', error);
      res.status(500).json({ message: 'Failed to update profile' });
    }
  });

  // Debug endpoint to check users (remove in production)
  app.get('/api/debug/users', async (req, res) => {
    try {
      const userList = await db.select().from(users).limit(10);
      console.log('🔍 Debug: Users in database:', userList.length);

      // Log each user individually for better debugging
      userList.forEach((user: any, index: number) => {
        console.log(`👤 User ${index + 1}:`, {
          id: user.id,
          email: user.email,
          authProvider: user.authProvider,
          displayName: user.displayName
        });
      });

      res.json({
        count: userList.length,
        users: userList.map((u: any) => ({
          id: u.id,
          email: u.email,
          authProvider: u.authProvider,
          displayName: u.displayName
        }))
      });
    } catch (error: any) {
      console.error('❌ Debug users error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Quick fix endpoint to manually complete onboarding for specific user
  app.post('/api/auth/force-complete-onboarding', async (req: any, res) => {
    try {
      const { email } = req.body;

      if (email !== 'rachel.gubin@gmail.com') {
        return res.status(403).json({ message: 'Not authorized for this action' });
      }

      console.log('🔧 Force completing onboarding for:', email);

      // Try to find user by email
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found with that email' });
      }

      console.log('Found user:', user.id, user.email);

      // Update user in database - SQLite uses integers for booleans
      const updatedUser = await storage.updateUser(user.id, {
        onboardingCompleted: 1 as any  // Cast to bypass TypeScript, SQLite requires integer
      });

      // Skip preferences update for now since SQLite schema doesn't have onboardingCompleted field
      console.log('✅ User updated, skipping preferences update due to schema mismatch');

      console.log('✅ Onboarding force completed for user:', email);
      res.json({ success: true, user: updatedUser, message: 'Onboarding marked as complete' });
    } catch (error) {
      console.error('Error force completing onboarding:', error);
      res.status(500).json({ message: 'Failed to complete onboarding', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Quick fix endpoint to refresh session with database user data
  app.post('/api/auth/refresh-session', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      console.log('🔄 Refreshing session for user:', userId);

      // Try to get user from database
      let user;
      try {
        user = await storage.getUser(userId);
      } catch (dbError) {
        console.error('Database error during session refresh:', dbError);
        return res.status(500).json({ message: 'Database error' });
      }

      if (user) {
        // Update session with database user data
        req.user.onboardingCompleted = user.onboardingCompleted;
        req.user.firstName = user.firstName;
        req.user.lastName = user.lastName;

        req.session.save((err: any) => {
          if (err) {
            console.error('Session save error during refresh:', err);
            return res.status(500).json({ message: 'Session save failed' });
          }
          console.log('✅ Session refreshed with database data');
          res.json({ success: true, user: req.user });
        });
      } else {
        res.status(404).json({ message: 'User not found in database' });
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      res.status(500).json({ message: 'Failed to refresh session' });
    }
  });

  // Mark onboarding as completed with comprehensive data saving
  app.post('/api/user/onboarding/complete', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const { onboardingData } = req.body;

      console.log('🎯 Onboarding completion request for user:', userId);
      console.log('📋 Onboarding data received:', JSON.stringify(onboardingData, null, 2));

      // Get current user first
      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update user with onboarding completion flag
      const user = await storage.updateUser(userId, {
        onboardingCompleted: true,
        firstName: onboardingData?.profile?.firstName || currentUser?.firstName,
        lastName: onboardingData?.profile?.lastName || currentUser?.lastName,
        phoneNumber: onboardingData?.profile?.phone
      });

      // Save user preferences if provided
      if (onboardingData?.preferences) {
        try {
          await storage.updateUserPreferences(userId, {
            favoriteSports: onboardingData.preferences.teams ? ["Sports"] : [],
            favoriteTeams: onboardingData.preferences.teams || [],
            watchingHabits: JSON.stringify({
              theme: onboardingData.preferences.theme || "dark",
              contentTypes: onboardingData.preferences.contentTypes || []
            }),
            contentRating: "All",
            languagePreferences: ["English"],
            aiPersonality: "balanced",
            notificationFrequency: "weekly",
            sportsNotifications: true,
            onboardingCompleted: true
          } as any);
          console.log('✅ User preferences saved successfully');
        } catch (prefError) {
          console.error('❌ Error saving preferences:', prefError);
        }
      }

      console.log('🎊 Onboarding completed successfully for user:', userId);

      // Update session user data to include onboardingCompleted flag
      if (req.user) {
        req.user.onboardingCompleted = true;
        req.session.save((err: any) => {
          if (err) {
            console.error('Session save error:', err);
          } else {
            console.log('✅ Session updated with onboarding completion');
          }
        });
      }

      res.json({
        success: true,
        user,
        message: "Onboarding completed successfully",
        savedData: {
          profile: !!onboardingData?.profile,
          preferences: !!onboardingData?.preferences,
          settings: !!onboardingData?.settings
        }
      });
    } catch (error) {
      console.error("❌ Error marking onboarding as complete:", error);
      res.status(500).json({ message: "Failed to complete onboarding" });
    }
  });

  // Temporary endpoint to create a user record for testing
  app.post('/api/debug/create-user', async (req, res) => {
    try {
      const { email, firstName = 'Rachel', lastName = 'Gubin', phoneNumber } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      console.log(`🔧 Manual user creation request for: ${email}`);

      // Check if user already exists by email
      const existingByEmail = await storage.getUserByEmail(email);
      if (existingByEmail) {
        console.log(`✅ User already exists by email:`, existingByEmail.id, existingByEmail.email);
        return res.json({ message: 'User already exists', user: existingByEmail });
      }

      // Create new user with manual ID
      const newUser = {
        id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: email,
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phoneNumber || null,
        profileImageUrl: '',
        authProvider: 'email',
      };

      console.log(`➕ Creating manual user:`, newUser);
  const createdUser = await storage.upsertUser(newUser as any);

      console.log('✅ Manual user created successfully:', createdUser.id, createdUser.email);
      res.json({ message: 'User created successfully', user: createdUser });

    } catch (error: any) {
      console.error('❌ Error creating manual user:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Debug: get user by email (optionally create)
  app.post('/api/debug/user-by-email', async (req, res) => {
    try {
      const { email, createIfMissing = false, firstName, lastName, password } = req.body || {};
      if (!email) return res.status(400).json({ error: 'Email is required' });

      let user = await storage.getUserByEmail(email);
      if (!user && createIfMissing) {
        console.log('🔧 Creating missing user for debug:', email);
        const id = `manual_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        user = await storage.upsertUser({
          id,
          email,
          firstName: firstName || null,
          lastName: lastName || null,
          authProvider: 'email',
          username: (firstName || email.split('@')[0]),
          profileImageUrl: null,
          phoneNumber: null
        });
        if (password) {
          const { hashPassword } = await import('./auth');
          const hashedPassword = await hashPassword(password);
          user = (await storage.updateUserPassword(email, hashedPassword)) || user;
        }
      }

      if (!user) return res.status(404).json({ error: 'User not found' });

      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          hasPassword: !!user.passwordHash
        }
      });
    } catch (err: any) {
      console.error('❌ /api/debug/user-by-email error', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Debug: echo cookies endpoint for session debugging
  app.get('/api/debug/echo-cookies', (req, res) => {
    try {
      console.log('🍪 Debug echo-cookies endpoint called');
      
      const cookiesInfo = {
        headers: {
          cookie: req.headers.cookie || null,
          authorization: req.headers.authorization || null,
          'user-agent': req.headers['user-agent'] || null,
          origin: req.headers.origin || null,
          referer: req.headers.referer || null
        },
        parsedCookies: req.cookies || {},
        sessionInfo: {
          sessionID: (req as any).sessionID || null,
          sessionExists: !!(req as any).session,
          sessionUser: (req as any).session?.user?.email || null,
          sessionClaims: (req as any).session?.user?.claims?.sub || null
        },
        rawCookieString: req.headers.cookie || 'No cookies',
        timestamp: new Date().toISOString()
      };

      console.log('🍪 Cookie debug info:', cookiesInfo);
      res.json(cookiesInfo);
    } catch (err: any) {
      console.error('❌ /api/debug/echo-cookies error', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Debug: streaming sources breakdown endpoint
  app.get('/api/debug/streaming-sources', async (req, res) => {
    try {
      const { tmdbId, title, mediaType = 'tv', imdbId } = req.query;
      
      if (!tmdbId) {
        return res.status(400).json({ error: 'tmdbId parameter is required' });
      }

      if (!title) {
        return res.status(400).json({ error: 'title parameter is required' });
      }

      console.log(`🔍 Debug streaming sources for TMDB ID ${tmdbId}: "${title}" (${mediaType})`);

      // Get comprehensive availability with full source breakdown
      const startTime = Date.now();
      const streamingData = await MultiAPIStreamingService.getComprehensiveAvailability(
        parseInt(tmdbId as string),
        title as string,
        mediaType as 'movie' | 'tv',
        imdbId as string
      );
      const duration = Date.now() - startTime;

      // Detailed source breakdown for debugging
      const sourceBreakdown = {
        tmdb: {
          platforms: streamingData.platforms.filter(p => p.source === 'tmdb'),
          count: streamingData.platforms.filter(p => p.source === 'tmdb').length
        },
        watchmode: {
          platforms: streamingData.platforms.filter(p => p.source === 'watchmode'),
          count: streamingData.platforms.filter(p => p.source === 'watchmode').length
        },
        utelly: {
          platforms: streamingData.platforms.filter(p => p.source === 'utelly'),
          count: streamingData.platforms.filter(p => p.source === 'utelly').length
        },
        streamingAvailability: {
          platforms: streamingData.platforms.filter(p => p.source === 'streaming-availability'),
          count: streamingData.platforms.filter(p => p.source === 'streaming-availability').length
        },
        other: {
          platforms: streamingData.platforms.filter(p => !['tmdb', 'watchmode', 'utelly', 'streaming-availability'].includes(p.source || '')),
          count: streamingData.platforms.filter(p => !['tmdb', 'watchmode', 'utelly', 'streaming-availability'].includes(p.source || '')).length
        }
      };

      res.json({
        input: {
          tmdbId: parseInt(tmdbId as string),
          title: title as string,
          mediaType: mediaType as string,
          imdbId: imdbId as string || null
        },
        timing: {
          durationMs: duration,
          timestamp: new Date().toISOString()
        },
        summary: {
          totalPlatforms: streamingData.totalPlatforms,
          affiliatePlatforms: streamingData.affiliatePlatforms,
          premiumPlatforms: streamingData.premiumPlatforms,
          freePlatforms: streamingData.freePlatforms,
          sources: streamingData.sources
        },
        sourceBreakdown,
        allPlatforms: streamingData.platforms.map(p => ({
          provider_name: p.provider_name,
          provider_id: p.provider_id,
          source: p.source || 'unknown',
          logo_path: p.logo_path,
          // Only include fields defined in EnhancedStreamingPlatform interface
          type: p.type,
          web_url: (p as any).web_url,
          affiliate_supported: (p as any).affiliate_supported,
          commission_rate: (p as any).commission_rate
        })),
        rawResponse: streamingData
      });
    } catch (error) {
      console.error('❌ Debug streaming sources error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch streaming sources debug info',
        message: (error as Error).message 
      });
    }
  });

  // Debug endpoint to set / reset a test password for a user (uses dedicated updater)
  app.post('/api/debug/set-password', async (req, res) => {
    try {
      const { email, password = 'test123' } = req.body || {};
      if (!email) return res.status(400).json({ error: 'Email is required' });
      console.log(`🔧 Setting password for ${email}`);

      const user = await storage.getUserByEmail(email);
      if (!user) return res.status(404).json({ error: 'User not found' });

      const { hashPassword } = await import('./auth');
      const hashedPassword = await hashPassword(password);
      const updated = await storage.updateUserPassword(email, hashedPassword);

      if (!updated) return res.status(500).json({ error: 'Failed to update password' });
      res.json({
        message: 'Password set',
        user: { id: updated.id, email: updated.email, hasPassword: !!updated.passwordHash }
      });
    } catch (err: any) {
      console.error('❌ /api/debug/set-password error', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Email/Password Registration (for manual account creation)
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
      }

      console.log(`🔐 Registration attempt for email: ${email}`);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        console.log(`❌ User already exists for email: ${email}`);
        return res.status(409).json({ message: 'User already exists with this email' });
      }

      // Hash password
      const { hashPassword } = await import('./auth');
      const hashedPassword = await hashPassword(password);

      // Create user with password hash - generate unique ID
      const userId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newUser = await storage.upsertUser({
        id: userId,
        email,
        passwordHash: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
        username: firstName || email.split('@')[0],
        authProvider: 'email',
        profileImageUrl: null,
        phoneNumber: null
      });

      console.log(`✅ User created successfully:`, {
        id: newUser.id,
        email: newUser.email,
        authProvider: newUser.authProvider
      });

      // Create session
      const sessionUser = {
        id: newUser.id,
        email: newUser.email,
        displayName: newUser.firstName && newUser.lastName ? `${newUser.firstName} ${newUser.lastName}` : newUser.username || newUser.email,
        authProvider: newUser.authProvider,
        claims: {
          sub: newUser.id,
          email: newUser.email,
          exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
        }
      };

      (req as any).session.user = sessionUser;

      res.status(201).json({
        message: 'Registration successful',
        user: {
          id: newUser.id,
          email: newUser.email,
          displayName: newUser.firstName && newUser.lastName ? `${newUser.firstName} ${newUser.lastName}` : newUser.username || newUser.email
        }
      });

    } catch (error) {
      console.error('❌ Registration error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // 🔐 CRITICAL AUTHENTICATION ENDPOINT - Email/Password Login
  // 🚨 PROTECTED: This endpoint is ESSENTIAL for local authentication
  // Working credentials: rachel.gubin@gmail.com / newpassword123
  // Status: ✅ LOCKED - Session creation working perfectly
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      // Enhanced debugging
      console.log('🔐 Login request received:', {
        email,
        passwordLength: password?.length || 0,
        body: req.body,
        headers: {
          'content-type': req.headers['content-type'],
          'origin': req.headers['origin'],
          'user-agent': req.headers['user-agent']?.substring(0, 50)
        }
      });

      if (!email || !password) {
        console.log('❌ Missing credentials:', { email: !!email, password: !!password });
        return res.status(400).json({ message: 'Email and password are required' });
      }

      console.log(`🔐 Login attempt for email: ${email}`);

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        console.log(`❌ No user found for email: ${email}`);
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      console.log(`👤 Found user:`, {
        id: user.id,
        email: user.email,
        authProvider: user.authProvider,
        hasPasswordHash: !!user.passwordHash
      });

      // Check if user has a password hash (manual/email accounts)
      if (!user.passwordHash) {
        console.log(`❌ User ${email} has no password hash - cannot login with password`);
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Verify password
      console.log('🔍 Password debug:', {
        providedLength: password.length,
        hashPresent: !!user.passwordHash,
        hashSnippet: user.passwordHash?.slice(0, 12)
      });
      const isValidPassword = await verifyPassword(password, user.passwordHash);
      if (!isValidPassword) {
        console.log(`❌ Invalid password for user: ${email}`);
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // 🔑 CRITICAL: Session creation - DO NOT MODIFY
      const sessionUser = {
        id: user.id,
        email: user.email,
        displayName: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username || user.email,
        authProvider: user.authProvider,
        claims: {
          sub: user.id,
          email: user.email,
          exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
        }
      };

      (req as any).session.user = sessionUser;

      // 🚨 CRITICAL: Explicit session save - ESSENTIAL for persistence
      (req as any).session.save((err: any) => {
        if (err) {
          console.error('❌ Session save error:', err);
          return res.status(500).json({ message: 'Session save failed' });
        }

        console.log(`✅ Login successful for user: ${email}`);
        console.log(`✅ Session saved with user data:`, sessionUser.email);
        res.json({
          message: 'Login successful',
          user: {
            id: user.id,
            email: user.email,
            displayName: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username || user.email
          }
        });
      });

    } catch (error) {
      console.error('❌ Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Mobile access helper page
  app.get('/mobile-access', (req, res) => {
    res.sendFile(path.join(__dirname, '../mobile-access.html'));
  });

  // Mobile-specific routes and diagnostics
  app.get('/mobile-status', (req, res) => {
    res.sendFile(path.join(__dirname, '../mobile-status.html'));
  });

  app.get('/api/mobile/status', (req, res) => {
    const userAgent = req.get('User-Agent') || '';
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone|Mobile/i.test(userAgent);

    res.json({
      timestamp: new Date().toISOString(),
      isMobile,
      userAgent: userAgent.substring(0, 100),
      ip: req.ip || req.connection.remoteAddress,
      headers: {
        'x-forwarded-for': req.get('x-forwarded-for'),
        'x-real-ip': req.get('x-real-ip'),
        'host': req.get('host'),
        'origin': req.get('origin'),
        'referer': req.get('referer')
      },
      connection: {
        secure: req.secure,
        protocol: req.protocol,
        method: req.method,
        url: req.url,
        originalUrl: req.originalUrl
      }
    });
  });

  // =============================================================================
  // MISSING API ENDPOINTS - Adding the missing routes that frontend expects
  // =============================================================================

  // Watchlist endpoint
  app.get('/api/watchlist', isAuthenticated, async (req: any, res) => {
    try {
      // TODO: Implement actual watchlist from database
      res.json({
        watchlist: [],
        message: "Watchlist feature coming soon"
      });
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      res.status(500).json({ error: 'Failed to fetch watchlist' });
    }
  });

  // User lists endpoint
  app.get('/api/lists', isAuthenticated, async (req: any, res) => {
    try {
      // TODO: Implement actual user lists from database
      res.json({
        lists: [],
        message: "Custom lists feature coming soon"
      });
    } catch (error) {
      console.error('Error fetching lists:', error);
      res.status(500).json({ error: 'Failed to fetch lists' });
    }
  });

  // User lists endpoint (new dashboard format)
  app.get('/api/user/lists', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;

      // Mock user lists - replace with actual database queries
      const mockUserLists = [
        { id: 1, name: "Sci-Fi Favorites", itemCount: 12 },
        { id: 2, name: "Comedy Watchlist", itemCount: 8 },
        { id: 3, name: "Completed Shows", itemCount: 84 },
        { id: 4, name: "Want to Watch", itemCount: 27 }
      ];

      // TODO: Replace with actual database query
      // const lists = await storage.getUserLists(userId);

      res.json({ lists: mockUserLists });
    } catch (error) {
      console.error('Error fetching user lists:', error);
      res.status(500).json({ error: 'Failed to fetch user lists' });
    }
  });

  // Discover route integration
  const discoverRoutes = await import('./routes/discover.js');
  app.use('/api/content', discoverRoutes.default);

  // Because You Watched recommendations endpoint
  app.get('/api/recommendations/because-you-watched', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;

      // Use TMDB to get real recommendations
      const tmdbService = new TMDBService();

      // Get popular TV shows as recommendations (later can be personalized)
      const popularShows = await tmdbService.getPopular('tv');

      // Transform TMDB data to match our expected format
      const recommendations = {
        shows: popularShows.results.slice(0, 8).map((show: any) => ({
          id: show.id,
          title: show.name,
          poster_path: show.poster_path,
          backdrop_path: show.backdrop_path,
          vote_average: show.vote_average,
          overview: show.overview,
          first_air_date: show.first_air_date,
          genre_ids: show.genre_ids,
          media_type: 'tv'
        }))
      };

      res.json(recommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
  });

  // General recommendations endpoint for dashboard
  app.get('/api/recommendations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const tmdbService = new TMDBService();
      
      // Get mixed content from TMDB
      const [popularTv, popularMovies] = await Promise.all([
        tmdbService.getPopular('tv'),
        tmdbService.getPopular('movie')
      ]);

      // Mix and match TV shows and movies
      const allContent = [
        ...popularTv.results.slice(0, 6).map((item: any) => ({
          ...item,
          media_type: 'tv',
          title: item.name || item.title,
          isAI: Math.random() > 0.5, // Mock AI flag
          aiScore: Math.random() * 0.3 + 0.7, // Mock AI score 0.7-1.0
          trending: Math.random() > 0.6,
          friendsWatching: Math.floor(Math.random() * 6),
          friendRecommendations: Math.random() > 0.7 ? ['Sarah M.', 'Mike D.'] : [],
          personalizedScore: Math.random() * 0.3 + 0.6 // 0.6-0.9
        })),
        ...popularMovies.results.slice(0, 6).map((item: any) => ({
          ...item,
          media_type: 'movie',
          title: item.name || item.title,
          isAI: Math.random() > 0.5,
          aiScore: Math.random() * 0.3 + 0.7,
          trending: Math.random() > 0.6,
          friendsWatching: Math.floor(Math.random() * 6),
          friendRecommendations: Math.random() > 0.7 ? ['Alex K.', 'Rachel P.'] : [],
          personalizedScore: Math.random() * 0.3 + 0.6
        }))
      ];

      // Shuffle the content
      const shuffled = allContent.sort(() => Math.random() - 0.5);

      res.json({ 
        recommendations: shuffled.slice(0, 12),
        success: true 
      });
    } catch (error) {
      console.error('Error fetching general recommendations:', error);
      res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
  });

  // Personalized recommendations endpoint for enhanced dashboard
  app.get('/api/recommendations/personalized', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const includeStreaming = req.query.includeStreaming === 'true';
      const tmdbService = new TMDBService();
      
      console.log(`🎯 Personalized recommendations -> userId=${userId} includeStreaming=${includeStreaming}`);
      
      // Get user preferences (you can expand this based on actual user data)
      const [trending, popular] = await Promise.all([
        tmdbService.getTrending('all', 'day'),
        tmdbService.getPopular('tv')
      ]);

      // Combine and personalize recommendations
      const personalizedContent = [
        ...trending.results.slice(0, 8).map((item: any) => ({
          ...item,
          media_type: item.media_type || 'tv',
          title: item.name || item.title,
          personalizedScore: Math.random() * 0.3 + 0.7, // 0.7-1.0
          reason: 'Because you like trending content'
        })),
        ...popular.results.slice(0, 4).map((item: any) => ({
          ...item,
          media_type: 'tv',
          title: item.name || item.title,
          personalizedScore: Math.random() * 0.3 + 0.6, // 0.6-0.9
          reason: 'Popular in your area'
        }))
      ];

      // Sort by personalized score
      const sortedContent = personalizedContent.sort((a, b) => b.personalizedScore - a.personalizedScore);

      // Conditional streaming enrichment
      if (includeStreaming && sortedContent.length) {
        const ENRICH_LIMIT = Math.min(8, sortedContent.length);
        console.log(`🎬 Enriching first ${ENRICH_LIMIT} recommended items with streaming data`);
        
        await Promise.all(sortedContent.slice(0, ENRICH_LIMIT).map(async (item, idx) => {
          try {
            const streamingData = await MultiAPIStreamingService.getComprehensiveAvailability(
              item.id,
              item.title || item.name || '',
              item.media_type === 'movie' ? 'movie' : 'tv'
            );
            item.streamingPlatforms = streamingData.platforms;
            item.streamingStats = {
              totalPlatforms: streamingData.totalPlatforms,
              affiliatePlatforms: streamingData.affiliatePlatforms,
              premiumPlatforms: streamingData.premiumPlatforms,
              freePlatforms: streamingData.freePlatforms,
              sources: streamingData.sources
            };
          } catch (e) {
            if (idx < 3) console.warn('⚠️ Streaming enrich failed (personalized recommendations):', (e as Error).message);
          }
        }));
      }

      res.json({ 
        recommendations: sortedContent.slice(0, 12),
        success: true 
      });
    } catch (error) {
      console.error('Error fetching personalized recommendations:', error);
      res.status(500).json({ error: 'Failed to fetch personalized recommendations' });
    }
  });

  // Continue watching endpoint for dashboard
  app.get('/api/user/continue-watching', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      
      // Mock continue watching data - in production, this would come from user viewing history
      const mockContinueWatching = [
        {
          id: 'continue-1',
          show: {
            id: 66732,
            title: 'Stranger Things',
            poster_path: '/49WJfeN0moxb9IPfFn8G97lLBNJ.jpg',
            backdrop_path: '/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
            media_type: 'tv',
            vote_average: 8.6,
            overview: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.',
            streaming_platforms: [
              { provider_name: 'Netflix', logo_path: '/9A1JSVmSxsyaBK4SUFsYVqbAYfW.jpg' }
            ]
          },
          progress: 65,
          lastWatched: new Date(Date.now() - 86400000).toISOString(),
          episodeNumber: 4,
          seasonNumber: 4
        },
        {
          id: 'continue-2',
          show: {
            id: 100088,
            title: 'The Last of Us',
            poster_path: '/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg',
            backdrop_path: '/qGQf2OHIZOmVqaj5V3c26eZTQs9.jpg',
            media_type: 'tv',
            vote_average: 8.8,
            overview: 'Twenty years after modern civilization has been destroyed, Joel, a hardened survivor, is hired to smuggle Ellie, a 14-year-old girl, out of an oppressive quarantine zone.',
            streaming_platforms: [
              { provider_name: 'HBO Max', logo_path: '/Ajqyt5aNxNGjmF9uOfxArGrdf3X.jpg' }
            ]
          },
          progress: 80,
          lastWatched: new Date(Date.now() - 172800000).toISOString(),
          episodeNumber: 2,
          seasonNumber: 1
        },
        {
          id: 'continue-3',
          show: {
            id: 119051,
            title: 'Wednesday',
            poster_path: '/9PFonBhy4cQy7Jz20NpMygczOkv.jpg',
            backdrop_path: '/iHSwvRVsRyxpX7FE7GbviaDvgGZ.jpg',
            media_type: 'tv',
            vote_average: 8.5,
            overview: 'Wednesday Addams is sent to Nevermore Academy, a bizarre boarding school where she attempts to master her psychic powers, stop a monstrous killing spree of the town citizens, and solve the supernatural mystery that embroiled her parents 25 years ago.',
            streaming_platforms: [
              { provider_name: 'Netflix', logo_path: '/9A1JSVmSxsyaBK4SUFsYVqbAYfW.jpg' }
            ]
          },
          progress: 45,
          lastWatched: new Date(Date.now() - 259200000).toISOString(),
          episodeNumber: 3,
          seasonNumber: 1
        }
      ];

      res.json({ 
        items: mockContinueWatching,
        success: true 
      });
    } catch (error) {
      console.error('Error fetching continue watching:', error);
      res.status(500).json({ error: 'Failed to fetch continue watching data' });
    }
  });

  // Friend activity endpoint for dashboard
  app.get('/api/friends/activity', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      
      // Mock friend activity data
      const mockActivities = [
        {
          id: 1,
          user: { name: 'Sarah M.', avatar: 'SM' },
          action: 'finished watching',
          show: 'Wednesday',
          timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
          rating: 5
        },
        {
          id: 2,
          user: { name: 'Mike D.', avatar: 'MD' },
          action: 'added to watchlist',
          show: 'The Last of Us',
          timestamp: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
        },
        {
          id: 3,
          user: { name: 'Alex K.', avatar: 'AK' },
          action: 'rated',
          show: 'House of the Dragon',
          timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          rating: 4
        },
        {
          id: 4,
          user: { name: 'Rachel P.', avatar: 'RP' },
          action: 'started watching',
          show: 'Stranger Things',
          timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        },
        {
          id: 5,
          user: { name: 'Jake L.', avatar: 'JL' },
          action: 'completed season',
          show: 'The Bear',
          timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
          rating: 5
        }
      ];

      res.json({ 
        activities: mockActivities,
        success: true 
      });
    } catch (error) {
      console.error('Error fetching friend activity:', error);
      res.status(500).json({ error: 'Failed to fetch friend activity' });
    }
  });

  // Friend activity endpoint (alternative path to match frontend expectations)
  app.get('/api/friend-activity', async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id || 'guest';
      
      // Mock friend activity data
      const mockActivities = [
        {
          id: 1,
          user: { name: 'Sarah M.', avatar: 'SM' },
          action: 'finished watching',
          show: 'Wednesday',
          timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
          rating: 5
        },
        {
          id: 2,
          user: { name: 'Mike D.', avatar: 'MD' },
          action: 'added to watchlist',
          show: 'The Last of Us',
          timestamp: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
        },
        {
          id: 3,
          user: { name: 'Alex K.', avatar: 'AK' },
          action: 'rated',
          show: 'House of the Dragon',
          timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          rating: 4
        },
        {
          id: 4,
          user: { name: 'Rachel P.', avatar: 'RP' },
          action: 'started watching',
          show: 'Stranger Things',
          timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        },
        {
          id: 5,
          user: { name: 'Jake L.', avatar: 'JL' },
          action: 'completed season',
          show: 'The Bear',
          timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
          rating: 5
        }
      ];

      res.json({ 
        activities: mockActivities,
        success: true 
      });
    } catch (error) {
      console.error('Error fetching friend activity:', error);
      res.status(500).json({ error: 'Failed to fetch friend activity' });
    }
  });

  // Spotlight/TMDB endpoint for dashboard
  app.get('/api/tmdb/spotlight', async (req: any, res) => {
    try {
      const tmdbService = new TMDBService();
      
      // Get trending content for spotlight
      const trending = await tmdbService.getTrending('all', 'day');
      
      res.json({ 
        trending: trending.results.slice(0, 8).map((item: any) => ({
          ...item,
          title: item.name || item.title,
          trending: true
        })),
        success: true 
      });
    } catch (error) {
      console.error('Error fetching spotlight data:', error);
      res.status(500).json({ error: 'Failed to fetch spotlight data' });
    }
  });

  // 🎯 DUAL SPOTLIGHT: #1 Trending + #1 Most Anticipated Upcoming
  app.get('/api/recommendations/spotlight', async (req: any, res) => {
    try {
      const tmdbService = new TMDBService();
      
      // Try to get user from session (optional - works for authenticated and non-authenticated)
      const userId = req.session?.user?.id;
      
      console.log('🎯 Fetching dual spotlight: trending + upcoming releases...');
      
      // Get user's onboarding preferences for personalized trending
      let userGenres: string[] = [];
      if (userId) {
        try {
          const userPrefs = await storage.getUserPreferences(userId);
          const userPrefsAny = userPrefs as any;
          if (userPrefsAny?.preferredGenres) {
            userGenres = JSON.parse(userPrefsAny.preferredGenres);
            console.log('👤 User preferred genres for spotlight:', userGenres);
          }
        } catch (error) {
          console.log('⚠️ Could not fetch user preferences, using generic trending');
        }
      }

      // 🔥 TRENDING SPOTLIGHT: Get #1 trending show based on user preferences
      let trendingSpotlight;
      if (userGenres.length > 0) {
        // Get trending filtered by user's preferred genres
        const genreMap: { [key: string]: number } = {
          'Action': 28, 'Adventure': 12, 'Animation': 16, 'Comedy': 35, 'Crime': 80,
          'Documentary': 99, 'Drama': 18, 'Family': 10751, 'Fantasy': 14, 'History': 36,
          'Horror': 27, 'Music': 10402, 'Mystery': 9648, 'Romance': 10749, 'Science Fiction': 878,
          'Thriller': 53, 'War': 10752, 'Western': 37
        };
        
        const userGenreIds = userGenres.map(g => genreMap[g]).filter(Boolean);
        console.log('🎭 Looking for trending shows in user genres:', userGenreIds);
        
        // Discover trending shows in user's preferred genres
        const personalizedTrending = await tmdbService.discover('tv', {
          genres: userGenreIds.join(','),
          sortBy: 'popularity.desc',
          firstAirDateGte: '2020-01-01', // Recent shows only
          voteAverageGte: 6.0, // Well-rated shows
          page: 1
        });
        
        trendingSpotlight = personalizedTrending.results?.[0];
      } else {
        // Fallback to general trending
        const trending = await tmdbService.getTrending('tv', 'day');
        trendingSpotlight = trending.results?.[0];
      }

      // 🚀 UPCOMING SPOTLIGHT: Get #1 most anticipated upcoming release  
      const today = new Date().toISOString().split('T')[0];
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const oneYearFromNow = futureDate.toISOString().split('T')[0];
      
      console.log('🔮 Searching for upcoming releases between:', today, 'and', oneYearFromNow);
      
      const upcomingReleases = await tmdbService.discover('tv', {
        firstAirDateGte: today,
        firstAirDateLte: oneYearFromNow,
        sortBy: 'popularity.desc',
        voteAverageGte: 5.0, // Has some buzz/votes
        page: 1
      });
      
      // Find an upcoming show that's different from the trending one
      let upcomingSpotlight = upcomingReleases.results?.[0];
      if (trendingSpotlight && upcomingReleases.results) {
        const trendingId = (trendingSpotlight as any).id;
        upcomingSpotlight = upcomingReleases.results.find((show: any) => show.id !== trendingId) || upcomingReleases.results[0];
      }

      // 🎬 Build dual spotlight response
      const spotlightData = [];
      
      if (trendingSpotlight) {
        const showTitle = (trendingSpotlight as any).name || (trendingSpotlight as any).title;
        spotlightData.push({
          ...trendingSpotlight,
          title: showTitle,
          spotlight_type: 'trending',
          spotlight_label: userGenres.length > 0 ? 'Trending in Your Genres' : 'Trending Now',
          media_type: 'tv',
          personalized: userGenres.length > 0
        });
      }
      
      if (upcomingSpotlight) {
        const showTitle = (upcomingSpotlight as any).name || (upcomingSpotlight as any).title;
        spotlightData.push({
          ...upcomingSpotlight,
          title: showTitle,
          spotlight_type: 'upcoming',
          spotlight_label: 'Most Anticipated Upcoming',
          media_type: 'tv',
          upcoming: true
        });
      }

      console.log('✅ Dual spotlight ready:', {
        trending: (trendingSpotlight as any)?.name || 'none',
        upcoming: (upcomingSpotlight as any)?.name || 'none',
        personalizedTrending: userGenres.length > 0,
        totalItems: spotlightData.length
      });
      
      res.json(spotlightData);
    } catch (error) {
      console.error('❌ Error fetching dual spotlight data:', error);
      res.status(500).json({ error: 'Failed to fetch spotlight data' });
    }
  });

  // Quick fix endpoint to set up test AI recommendations preferences
  app.post('/api/debug/setup-ai-preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      console.log('🔧 Setting up test AI preferences for user:', userId);

      // Set up default preferences for testing
      const defaultPreferences = {
        preferredGenres: ['Action', 'Drama', 'Comedy', 'Sci-Fi'],
        preferredNetworks: ['Netflix', 'HBO', 'Amazon Prime', 'Disney+'],
        favoriteSports: [],
        favoriteTeams: [],
        watchingHabits: JSON.stringify({
          theme: "dark",
          contentTypes: ["tv", "movies"]
        }),
        contentRating: "All",
        languagePreferences: ["English"],
        aiPersonality: "balanced",
        notificationFrequency: "weekly",
        sportsNotifications: true,
        onboardingCompleted: true
      };

      await storage.updateUserPreferences(userId, defaultPreferences);
      console.log('✅ Test preferences set for user:', userId);

      res.json({
        success: true,
        message: 'Test AI preferences set successfully',
        preferences: defaultPreferences
      });

    } catch (error) {
      console.error('❌ Error setting up test preferences:', error);
      res.status(500).json({ error: 'Failed to set up test preferences' });
    }
  });

  // AI recommendations endpoint - Hybrid approach combining preferences + real API data
  app.get('/api/ai-recommendations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      console.log('🤖 Generating hybrid AI recommendations for user:', userId);

      // STEP 1: Get or create user preferences
      let rawUserPreferences = await storage.getUserPreferences(userId);

      // Parse JSON fields from database
      let userPreferences = null;
      if (rawUserPreferences) {
        const anyPrefs = rawUserPreferences as any;
        // Gracefully handle legacy fields if present; otherwise default
        let parsedGenres: any[] = [];
        if (anyPrefs.preferredGenres) {
          if (typeof anyPrefs.preferredGenres === 'string') {
            try {
              parsedGenres = JSON.parse(anyPrefs.preferredGenres);
            } catch {
              parsedGenres = [];
            }
          } else if (Array.isArray(anyPrefs.preferredGenres)) {
            parsedGenres = anyPrefs.preferredGenres;
          }
        }

        let parsedNetworks: any[] = [];
        if (anyPrefs.preferredNetworks) {
          if (typeof anyPrefs.preferredNetworks === 'string') {
            try { parsedNetworks = JSON.parse(anyPrefs.preferredNetworks); } catch { parsedNetworks = []; }
          } else if (Array.isArray(anyPrefs.preferredNetworks)) {
            parsedNetworks = anyPrefs.preferredNetworks;
          }
        }

        userPreferences = {
          ...anyPrefs,
          preferredGenres: parsedGenres,
            preferredNetworks: parsedNetworks
        } as any;
      }

      // If no preferences, create smart defaults based on popular choices
  if (!userPreferences || !(userPreferences as any).preferredGenres || (userPreferences as any).preferredGenres.length === 0) {
        console.log('📋 Creating smart default preferences for new user');

        const smartDefaults = {
          userId,
          preferredGenres: ['Action', 'Drama', 'Comedy', 'Thriller'],
          preferredNetworks: ['Netflix', 'HBO', 'Amazon Prime', 'Disney+'],
          favoriteSports: [],
          favoriteTeams: [],
          watchingHabits: JSON.stringify({
            theme: "dark",
            contentTypes: ["TV Shows", "Movies"]
          }),
          contentRating: "All",
          languagePreferences: ["English"],
          aiPersonality: "balanced",
          notificationFrequency: "weekly",
          sportsNotifications: true,
          onboardingCompleted: false // Will prompt user to complete onboarding
        };

        try {
          await storage.updateUserPreferences(userId, smartDefaults);
          userPreferences = smartDefaults as any;
          console.log('✅ Smart default preferences created');
        } catch (prefError) {
          console.error('❌ Error creating default preferences:', prefError);
          // Continue with in-memory defaults
          userPreferences = smartDefaults as any;
        }
      }

      // If user has preferences, mark onboarding as completed
  if (userPreferences && (userPreferences as any).preferredGenres?.length && !userPreferences.onboardingCompleted) {
        try {
          userPreferences.onboardingCompleted = true;
          await storage.updateUserPreferences(userId, { ...userPreferences, onboardingCompleted: true });
          console.log('✅ Onboarding marked as completed since user has preferences');
        } catch (error) {
          console.error('❌ Error updating onboarding status:', error);
        }
      }

      console.log('📊 Using preferences:', {
        genres: userPreferences?.preferredGenres || 'none',
        genresType: typeof userPreferences?.preferredGenres,
        genresArray: Array.isArray(userPreferences?.preferredGenres),
        genresLength: userPreferences?.preferredGenres?.length || 0,
        networks: userPreferences?.preferredNetworks || 'none',
        onboardingCompleted: userPreferences?.onboardingCompleted
      });

      // STEP 2: Get real trending/popular content from TMDB API
      const recommendations = [];

      try {
        // Get trending TV shows and movies
        const trendingTV = await tmdbService.getTrending('tv', 'week');
        const trendingMovies = await tmdbService.getTrending('movie', 'week');

        // Combine and filter content based on user preferences
        const allContent = [
          ...(trendingTV.results || []).map((item: any) => ({ ...item, mediaType: 'tv' })),
          ...(trendingMovies.results || []).map((item: any) => ({ ...item, mediaType: 'movie' }))
        ];

        console.log(`📺 Retrieved ${allContent.length} trending items from TMDB`);

        // STEP 3: Smart filtering and scoring based on user preferences
        for (const item of allContent.slice(0, 20)) { // Process top 20 for performance
          try {
            // Get detailed info for better genre matching
            let details;
            if (item.mediaType === 'tv') {
              details = await tmdbService.getShowDetails(item.id);
            } else {
              details = await tmdbService.getMovieDetails(item.id);
            }

            // Calculate AI score based on multiple factors
            let aiScore = 50; // Base score

            // Genre matching (major factor)
            const itemGenres = (details as any).genres?.map((g: any) => g.name) || [];
            let genreMatches = [];

            // Safely check preferred genres - handle both array and string cases
            if (userPreferences?.preferredGenres) {
              let preferredGenresList = userPreferences.preferredGenres;

              // If still a string, parse it
              if (typeof preferredGenresList === 'string') {
                try {
                  preferredGenresList = JSON.parse(preferredGenresList);
                } catch (e) {
                  console.warn('⚠️ Failed to parse preferredGenres string:', preferredGenresList);
                  preferredGenresList = [];
                }
              }

              // Now safely use the array
              if (Array.isArray(preferredGenresList)) {
                genreMatches = itemGenres.filter((genre: string) =>
                  preferredGenresList.some((prefGenre: string) =>
                    prefGenre.toLowerCase().includes(genre.toLowerCase()) ||
                    genre.toLowerCase().includes(prefGenre.toLowerCase())
                  )
                );
              } else {
                console.warn('⚠️ preferredGenres is not an array after parsing:', typeof preferredGenresList, preferredGenresList);
              }
            }

            aiScore += genreMatches.length * 15; // +15 per genre match

            // Popularity boost
            const popularity = item.popularity || 0;
            aiScore += Math.min(popularity / 100, 20); // Up to +20 for popularity

            // Rating boost  
            const rating = item.vote_average || 0;
            aiScore += rating; // Direct rating boost

            // Recency boost (newer content gets slight preference)
            const releaseDate = item.first_air_date || item.release_date;
            if (releaseDate) {
              const releaseYear = new Date(releaseDate).getFullYear();
              const currentYear = new Date().getFullYear();
              if (currentYear - releaseYear <= 2) {
                aiScore += 10; // Recent content bonus
              }
            }

            // Only include if score is decent and we have space
            if (aiScore >= 60 && recommendations.length < 8) {

              // Get streaming availability (fallback to mock data due to API limits)
              let streamingInfo: {
                available: boolean;
                services: string[];
                whereToWatch: string;
                platforms: Array<{
                  provider_id: number;
                  provider_name: string;
                  logo_path?: string;
                }>;
              } = {
                available: true,
                services: ['Netflix', 'Hulu', 'Amazon Prime'].slice(0, Math.floor(Math.random() * 3) + 1),
                whereToWatch: 'Available on multiple platforms',
                platforms: []
              };

              // Create mock streaming platforms with proper logos
              const mockPlatforms = [
                { provider_id: 8, provider_name: 'Netflix', logo_path: '/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg' },
                { provider_id: 337, provider_name: 'Disney Plus', logo_path: '/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg' },
                { provider_id: 119, provider_name: 'Amazon Prime Video', logo_path: '/emthp39XA2YScoYL1p0sdbAH2WA.jpg' },
                { provider_id: 384, provider_name: 'HBO Max', logo_path: '/nmU4OUJbRVbGiECMwLpIyRlh2vb.jpg' },
                { provider_id: 15, provider_name: 'Hulu', logo_path: '/pqUTCYPVc8R8gQQBQRrJt5bY7dq.jpg' },
                { provider_id: 350, provider_name: 'Apple TV Plus', logo_path: '/6uhKBfmtzFqOcLousHwZuzcrScK.jpg' }
              ];

              const randomPlatforms = mockPlatforms
                .sort(() => Math.random() - 0.5)
                .slice(0, Math.floor(Math.random() * 3) + 1);

              streamingInfo.platforms = randomPlatforms;
              streamingInfo.services = randomPlatforms.map(p => p.provider_name);

              // Get trailer information from TMDB
              let trailerInfo: {
                hasTrailer: boolean;
                trailerKey: string | null;
                trailerUrl: string | null;
              } = {
                hasTrailer: false,
                trailerKey: null,
                trailerUrl: null
              };

              try {
                const videos = await tmdbService.getVideos(item.mediaType as 'tv' | 'movie', item.id);
                const trailer = (videos as any).results?.find((video: any) =>
                  video.type === 'Trailer' && video.site === 'YouTube'
                );

                if (trailer) {
                  trailerInfo = {
                    hasTrailer: true,
                    trailerKey: trailer.key,
                    trailerUrl: `https://www.youtube.com/watch?v=${trailer.key}`
                  };
                }
              } catch (videoError) {
                console.warn(`⚠️ Could not get trailer for ${item.title || item.name}:`, (videoError as Error).message);
              }

              // Disable Utelly for now due to API rate limits
              /*
              try {
                const title = item.title || item.name;
                const streamingData = await searchStreamingAvailability(title);
                if (streamingData.results.length > 0) {
                  const locations = streamingData.results[0].locations || [];
                  streamingInfo = {
                    available: locations.length > 0,
                    services: locations.slice(0, 3).map(loc => loc.display_name),
                    whereToWatch: locations.length > 0 
                      ? `Available on ${locations.slice(0, 3).map(loc => loc.display_name).join(', ')}`
                      : 'Check your streaming services'
                  };
                }
              } catch (streamingError) {
                console.warn(`⚠️ Could not get streaming info for ${item.title || item.name}:`, (streamingError as Error).message);
              }
              */

              // Generate personalized reason
              let reason = "Recommended for you";
              if (genreMatches.length > 0) {
                reason = `Perfect match for your love of ${genreMatches.slice(0, 2).join(' and ')} ${item.mediaType === 'tv' ? 'shows' : 'movies'}`;
              } else if (rating >= 8) {
                reason = `Highly rated ${item.mediaType === 'tv' ? 'series' : 'movie'} trending now`;
              } else {
                reason = `Popular ${item.mediaType === 'tv' ? 'series' : 'movie'} you might enjoy`;
              }

              recommendations.push({
                id: recommendations.length + 1,
                showId: item.id,
                score: Math.min(Math.round(aiScore), 100),
                reason: reason,
                recommendationType: genreMatches.length > 0 ? "personalized_match" : "trending_popular",
                metadata: JSON.stringify({
                  matchedGenres: genreMatches,
                  tmdbPopularity: popularity,
                  tmdbRating: rating,
                  mediaType: item.mediaType,
                  confidence: genreMatches.length > 1 ? "high" : genreMatches.length > 0 ? "medium" : "low",
                  // Add streaming information
                  streamingAvailable: streamingInfo.available,
                  streamingServices: streamingInfo.services,
                  whereToWatch: streamingInfo.whereToWatch,
                  // Add trailer information
                  hasTrailer: trailerInfo.hasTrailer,
                  trailerKey: trailerInfo.trailerKey,
                  trailerUrl: trailerInfo.trailerUrl
                }),
                isViewed: false,
                isInteracted: false,
                feedback: null,
                createdAt: new Date().toISOString(),
                show: {
                  tmdbId: item.id,
                  title: item.title || item.name,
                  overview: item.overview || (details as any).overview || "No description available",
                  posterPath: item.poster_path || (details as any).poster_path,
                  backdropPath: item.backdrop_path || (details as any).backdrop_path,
                  rating: rating.toFixed(1),
                  genres: itemGenres,
                  networks: (details as any).networks?.map((n: any) => n.name) || ["Streaming"],
                  firstAirDate: releaseDate,
                  status: (details as any).status || "Released",
                  mediaType: item.mediaType,
                  // Add streaming information to show object as well
                  streamingAvailable: streamingInfo.available,
                  streamingServices: streamingInfo.services,
                  whereToWatch: streamingInfo.whereToWatch,
                  streamingPlatforms: streamingInfo.platforms,
                  // Add trailer information to show object
                  hasTrailer: trailerInfo.hasTrailer,
                  trailerKey: trailerInfo.trailerKey,
                  trailerUrl: trailerInfo.trailerUrl
                }
              });
            }
          } catch (itemError) {
            console.warn(`⚠️ Error processing item ${item.id}:`, (itemError as Error).message);
            continue;
          }
        }

      } catch (apiError) {
        console.error('❌ TMDB API error, falling back to curated recommendations:', apiError);

        // FALLBACK: Curated recommendations based on preferences
        const curatedShows = [
          { id: 94997, title: "House of the Dragon", genres: ["Action", "Adventure", "Drama"], networks: ["HBO"], rating: "8.4", mediaType: "tv" },
          { id: 1396, title: "Breaking Bad", genres: ["Drama", "Crime"], networks: ["AMC"], rating: "9.5", mediaType: "tv" },
          { id: 60625, title: "Rick and Morty", genres: ["Comedy", "Animation"], networks: ["Adult Swim"], rating: "9.1", mediaType: "tv" },
          { id: 76479, title: "The Boys", genres: ["Action", "Comedy", "Crime"], networks: ["Amazon Prime"], rating: "8.7", mediaType: "tv" },
          { id: 550, title: "Fight Club", genres: ["Drama", "Thriller"], networks: ["Streaming"], rating: "8.8", mediaType: "movie" },
          { id: 13, title: "Forrest Gump", genres: ["Drama", "Romance"], networks: ["Streaming"], rating: "8.8", mediaType: "movie" }
        ];

        // Filter curated shows by user preferences
        for (const show of curatedShows) {
          const genreMatches = show.genres.filter((genre: string) =>
            userPreferences?.preferredGenres?.includes(genre)
          );

          if (genreMatches.length > 0 || recommendations.length < 3) {
            recommendations.push({
              id: recommendations.length + 1,
              showId: show.id,
              score: 75 + genreMatches.length * 10,
              reason: genreMatches.length > 0
                ? `Curated pick for your ${genreMatches.join(' and ')} preferences`
                : `Highly recommended ${show.mediaType}`,
              recommendationType: "curated_pick",
              metadata: JSON.stringify({
                matchedGenres: genreMatches,
                confidence: "high",
                source: "curated"
              }),
              isViewed: false,
              isInteracted: false,
              feedback: null,
              createdAt: new Date().toISOString(),
              show: {
                tmdbId: show.id,
                title: show.title,
                overview: `Highly recommended ${show.mediaType} based on your preferences.`,
                posterPath: `/placeholder-poster-${show.id}.jpg`,
                backdropPath: `/placeholder-backdrop-${show.id}.jpg`,
                rating: show.rating,
                genres: show.genres,
                networks: show.networks,
                firstAirDate: "2020-01-01",
                status: "Released",
                mediaType: show.mediaType
              }
            });
          }
        }
      }

      // STEP 4: Sort by AI score (highest first)
      recommendations.sort((a, b) => b.score - a.score);

      console.log(`🎯 Generated ${recommendations.length} hybrid AI recommendations`);
      console.log('📈 Score distribution:', recommendations.map(r => `${r.show.title}: ${r.score}`));

      // STEP 5: Return recommendations with proper messaging
      const response = {
        recommendations,
        hasPreferences: !!(userPreferences?.preferredGenres?.length),
        onboardingCompleted: userPreferences?.onboardingCompleted || false,
        message: userPreferences?.onboardingCompleted || userPreferences?.preferredGenres?.length
          ? `${recommendations.length} personalized recommendations with streaming availability`
          : "Complete onboarding for more personalized recommendations!"
      };

      res.json(response);

    } catch (error) {
      console.error('❌ Error generating AI recommendations:', error);
      res.status(500).json({ error: 'Failed to generate AI recommendations' });
    }
  });

  // Generate new AI recommendations endpoint
  app.post('/api/ai-recommendations/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      console.log('🔄 Regenerating AI recommendations for user:', userId);

      // For now, just return success - the frontend will refetch the recommendations
      // In a real implementation, you might clear cached recommendations or trigger new generation
      res.json({
        success: true,
        message: 'New recommendations generated successfully'
      });

    } catch (error) {
      console.error('Error generating AI recommendations:', error);
      res.status(500).json({ error: 'Failed to generate new recommendations' });
    }
  });

  // Mark recommendation as viewed endpoint
  app.post('/api/ai-recommendations/:id/viewed', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const recommendationId = parseInt(req.params.id);

      console.log(`👁️ Marking recommendation ${recommendationId} as viewed for user:`, userId);

      // Store view in database for analytics and improved recommendations
      try {
        // Mark recommendation as viewed in aiRecommendations table
        await storage.markRecommendationAsViewed(recommendationId, userId);
        console.log('✅ Updated aiRecommendations table with view');

        // Track user behavior for analytics
        await storage.trackUserBehavior({
          userId,
          actionType: 'recommendation_view',
          targetType: 'recommendation',
          targetId: recommendationId,
          metadata: {
            action: 'eye_button_click',
            timestamp: new Date().toISOString()
          }
        });

        console.log('✅ Stored view interaction in user behavior analytics');

      } catch (dbError) {
        console.error('❌ Database error storing view:', dbError);
        // Continue anyway - don't fail the request for analytics
      }

      res.json({ success: true, message: 'Recommendation marked as viewed' });

    } catch (error) {
      console.error('Error marking recommendation as viewed:', error);
      res.status(500).json({ error: 'Failed to mark recommendation as viewed' });
    }
  });

  // Recommendation feedback endpoint
  app.post('/api/ai-recommendations/:id/feedback', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const recommendationId = parseInt(req.params.id);
      const { feedback } = req.body;

      console.log(`👍 Received feedback "${feedback}" for recommendation ${recommendationId} from user:`, userId);

      // Store feedback in database for improving AI recommendations
      try {
        // Update the recommendation with feedback
        await storage.updateRecommendationFeedback(recommendationId, userId, feedback);
        console.log('✅ Updated aiRecommendations table with feedback');

        // Track user behavior for analytics
        await storage.trackUserBehavior({
          userId,
          actionType: 'recommendation_feedback',
          targetType: 'recommendation',
          targetId: recommendationId,
          metadata: {
            feedback,
            action: feedback === 'like' ? 'thumbs_up_click' : 'thumbs_down_click',
            timestamp: new Date().toISOString()
          }
        });

        // Create training data for ML improvement
        const interactionScore = feedback === 'like' ? 0.8 : 0.2; // High score for likes, low for dislikes

        // Get the show ID from the recommendation (we might need to query this)
        const userRecs = await storage.getUserRecommendations(userId);
        const targetRec = userRecs.find(rec => rec.id === recommendationId);

        if (targetRec && targetRec.showId) {
          await storage.createRecommendationTraining({
            userId,
            showId: targetRec.showId,
            interactionType: feedback === 'like' ? 'positive' : 'negative',
            interactionScore,
            features: targetRec.metadata || {},
            context: {
              timestamp: new Date().toISOString(),
              feedbackType: feedback,
              aiScore: targetRec.score || 0
            }
          });
          console.log('✅ Created ML training data for AI improvement');
        }

        console.log('✅ Stored feedback interaction in user behavior analytics');

      } catch (dbError) {
        console.error('❌ Database error storing feedback:', dbError);
        // Continue anyway - don't fail the request for analytics
      }

      res.json({ success: true, message: 'Feedback recorded successfully' });

    } catch (error) {
      console.error('Error recording recommendation feedback:', error);
      res.status(500).json({ error: 'Failed to record feedback' });
    }
  });

  // Monetization endpoint - Track ad views and trailer plays
  app.post('/api/monetization/trailer-view', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const { recommendationId, showId, showTitle, trailerKey, adDuration = 3000 } = req.body;

      console.log(`💰 Monetization: User ${userId} viewed trailer for ${showTitle} (${showId}) with ${adDuration}ms ad`);

      // TODO: Store in analytics database for revenue tracking
      // This could include:
      // - User demographics for ad targeting
      // - Content preferences for better ad placement
      // - Revenue attribution per user/content

      const monetizationData = {
        userId,
        recommendationId,
        showId,
        showTitle,
        trailerKey,
        adDuration,
        timestamp: new Date().toISOString(),
        revenue: 0.05, // Example: 5 cents per trailer view
        action: 'trailer_view_with_ad'
      };

      // In a real app, save to analytics/monetization database
      console.log('💰 Monetization data:', monetizationData);

      res.json({
        success: true,
        message: 'Trailer view tracked for monetization',
        revenue: monetizationData.revenue
      });

    } catch (error) {
      console.error('Error tracking monetization data:', error);
      res.status(500).json({ error: 'Failed to track monetization data' });
    }
  });

  // Monetization endpoint - Track streaming platform redirects
  app.post('/api/monetization/platform-redirect', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const { recommendationId, showId, showTitle, platform, affiliateLink } = req.body;

      console.log(`💰 Monetization: User ${userId} redirected to ${platform} for ${showTitle} (${showId})`);

      // TODO: In a real app, this could include affiliate links for revenue sharing
      const monetizationData = {
        userId,
        recommendationId,
        showId,
        showTitle,
        platform,
        affiliateLink: affiliateLink || null,
        timestamp: new Date().toISOString(),
        revenue: 0.10, // Example: 10 cents per platform redirect
        action: 'platform_redirect'
      };

      console.log('💰 Monetization data:', monetizationData);

      res.json({
        success: true,
        message: 'Platform redirect tracked for monetization',
        revenue: monetizationData.revenue
      });

    } catch (error) {
      console.error('Error tracking platform redirect:', error);
      res.status(500).json({ error: 'Failed to track platform redirect' });
    }
  });

  // Progress tracking endpoint - REPLACED with full implementation in viewing-history.ts
  app.get('/api/progress/current', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;

      // Get real continue watching data from viewing history
      const continueWatchingResponse = await fetch(`${req.protocol}://${req.get('host')}/api/continue-watching`, {
        headers: {
          'Authorization': req.headers.authorization || '',
          'Cookie': req.headers.cookie || ''
        }
      });

      if (continueWatchingResponse.ok) {
        const data = await continueWatchingResponse.json();
        res.json({
          currentlyWatching: data.continueWatching || [],
          message: data.continueWatching?.length > 0 ?
            `Found ${data.continueWatching.length} shows to continue watching` :
            "No shows in progress - start watching to see progress here"
        });
      } else {
        res.json({
          currentlyWatching: [],
          message: "Progress tracking is now available - start watching shows to see your progress"
        });
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
      res.json({
        currentlyWatching: [],
        message: "Progress tracking feature ready - visit /api/continue-watching for full functionality"
      });
    }
  });

  // Friend activities endpoint
  app.get('/api/activities/friends', isAuthenticated, async (req: any, res) => {
    try {
      // TODO: Implement friend activity feed from database
      res.json({
        activities: [],
        message: "Friend activities feature coming soon"
      });
    } catch (error) {
      console.error('Error fetching friend activities:', error);
      res.status(500).json({ error: 'Failed to fetch friend activities' });
    }
  });

  // Notifications history endpoint
  app.get('/api/notifications/history', isAuthenticated, async (req: any, res) => {
    try {
      // TODO: Implement notifications history from database
      res.json({
        notifications: [],
        message: "Notifications history feature coming soon"
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  });

  // Enhanced Features API Routes

  // Moods API
  app.get('/api/moods', async (req, res) => {
    try {
      console.log('🎭 Fetching moods from database...');

      // Use raw SQL with sqlite instance
      if (!sqlite) throw new Error('SQLite database not available');

      // First check if table exists and get its structure
      const tableInfo = sqlite.prepare('PRAGMA table_info(moods)').all();
      console.log('🎭 Moods table structure:', tableInfo);

      // Simple query first
      const result = sqlite.prepare('SELECT * FROM moods ORDER BY name ASC LIMIT 10').all();
      console.log('🎭 Found', result.length, 'moods');
      res.json({ moods: result });
    } catch (error) {
      console.error('Error fetching moods:', error);
      res.status(500).json({ error: 'Failed to fetch moods' });
    }
  });

  // Streaming Services API
  app.get('/api/streaming-services', async (req, res) => {
    try {
      if (!sqlite) throw new Error('SQLite database not available');
      const result = sqlite.prepare('SELECT * FROM streaming_services ORDER BY name ASC').all();
      res.json({ services: result });
    } catch (error) {
      console.error('Error fetching streaming services:', error);
      res.status(500).json({ error: 'Failed to fetch streaming services' });
    }
  });

  // User Feedback API
  app.post('/api/user-feedback', isAuthenticated, async (req: any, res) => {
    try {
      const {
        content_id,
        content_type,
        rating,
        feedback_type,
        comment,
        watch_status,
        tags
      } = req.body;

      const user_id = req.user?.id;

      if (!user_id || !content_id || !content_type || rating === undefined || !feedback_type) {
        return res.status(400).json({
          error: 'Missing required fields: content_id, content_type, rating, feedback_type'
        });
      }

      // Insert feedback using raw SQL
      if (!sqlite) throw new Error('SQLite database not available');

      const insertStmt = sqlite.prepare(`
        INSERT OR REPLACE INTO user_feedback (
          user_id, content_id, content_type, rating, feedback_type, 
          comment, watch_status, tags, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `);

      const result = insertStmt.run(
        user_id,
        content_id,
        content_type,
        rating,
        feedback_type,
        comment || null,
        watch_status || 'want_to_watch',
        tags ? JSON.stringify(tags) : null
      );

      // Log activity
      const logStmt = sqlite.prepare(`
        INSERT INTO user_activity_log (
          user_id, activity_type, entity_type, entity_id, 
          metadata, created_at
        ) VALUES (?, ?, ?, ?, ?, datetime('now'))
      `);

      logStmt.run(
        user_id,
        'feedback_submitted',
        'content',
        content_id,
        JSON.stringify({
          content_type,
          rating,
          feedback_type,
          watch_status
        })
      );

      res.status(201).json({
        success: true,
        feedback_id: result.lastInsertRowid,
        message: 'Feedback submitted successfully'
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      res.status(500).json({ error: 'Failed to submit feedback' });
    }
  });

  // Filter Presets API
  app.get('/api/filter-presets', isAuthenticated, async (req: any, res) => {
    try {
      const user_id = req.user?.id;
      const { include_public } = req.query;

      let query = `
        SELECT 
          fp.*,
          0 as usage_count
        FROM filter_presets fp
        WHERE fp.deleted_at IS NULL
        AND (fp.user_id = ? ${include_public === 'true' ? 'OR fp.is_public = 1' : ''})
        ORDER BY fp.updated_at DESC
      `;

      if (!sqlite) throw new Error('SQLite database not available');
      const presets = sqlite.prepare(query).all(user_id) as any[];

      // Parse filters JSON
      const parsedPresets = presets.map((preset: any) => ({
        ...preset,
        filters: preset.filters ? JSON.parse(preset.filters) : {},
        is_public: Boolean(preset.is_public)
      }));

      res.json({ presets: parsedPresets });
    } catch (error) {
      console.error('Error fetching filter presets:', error);
      res.status(500).json({ error: 'Failed to fetch filter presets' });
    }
  });

  app.post('/api/filter-presets', isAuthenticated, async (req: any, res) => {
    try {
      const {
        name,
        description,
        filters,
        is_public
      } = req.body;

      const user_id = req.user?.id;

      if (!user_id || !name || !filters) {
        return res.status(400).json({
          error: 'Missing required fields: name, filters'
        });
      }

      if (!sqlite) throw new Error('SQLite database not available');
      const insertStmt = sqlite.prepare(`
        INSERT INTO filter_presets (
          user_id, name, description, filters, is_public, 
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `);

      const result = insertStmt.run(
        user_id,
        name,
        description || null,
        JSON.stringify(filters),
        is_public || false
      );

      res.status(201).json({
        success: true,
        preset_id: result.lastInsertRowid,
        message: 'Filter preset created successfully'
      });
    } catch (error) {
      console.error('Error creating filter preset:', error);
      res.status(500).json({ error: 'Failed to create filter preset' });
    }
  });

  // Collections API
  app.get('/api/collections', isAuthenticated, async (req: any, res) => {
    try {
      const user_id = req.user?.id;
      const { include_deleted, search, sort_by, tags: tagFilter } = req.query;

      let query = `
        SELECT 
          uc.*,
          0 as item_count
        FROM user_collections uc
        WHERE uc.user_id = ?
      `;

      const params: any[] = [user_id];

      // Handle soft delete filter
      if (include_deleted !== 'true') {
        query += ' AND uc.deleted_at IS NULL';
      }

      // Handle search
      if (search && typeof search === 'string') {
        query += ' AND (uc.name LIKE ? OR uc.description LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }

      // Handle sorting
      const sortBy = sort_by as string;
      switch (sortBy) {
        case 'name':
          query += ' ORDER BY uc.name ASC';
          break;
        case 'created_at':
          query += ' ORDER BY uc.created_at DESC';
          break;
        case 'updated_at':
        default:
          query += ' ORDER BY uc.updated_at DESC';
          break;
      }

      if (!sqlite) throw new Error('SQLite database not available');
      const collections = sqlite.prepare(query).all(...params) as any[];

      // Parse tags JSON
      const parsedCollections = collections.map((collection: any) => ({
        ...collection,
        tags: collection.tags ? JSON.parse(collection.tags) : [],
        is_public: Boolean(collection.is_public)
      }));

      res.json({ collections: parsedCollections });
    } catch (error) {
      console.error('Error fetching collections:', error);
      res.status(500).json({ error: 'Failed to fetch collections' });
    }
  });

  app.post('/api/collections', isAuthenticated, async (req: any, res) => {
    try {
      const {
        name,
        description,
        is_public,
        tags
      } = req.body;

      const user_id = req.user?.id;

      if (!user_id || !name) {
        return res.status(400).json({
          error: 'Missing required fields: name'
        });
      }

      if (!sqlite) throw new Error('SQLite database not available');
      const insertStmt = sqlite.prepare(`
        INSERT INTO user_collections (
          user_id, name, description, is_public, tags,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `);

      const result = insertStmt.run(
        user_id,
        name,
        description || null,
        is_public || false,
        tags ? JSON.stringify(tags) : null
      );

      res.status(201).json({
        success: true,
        collection_id: result.lastInsertRowid,
        message: 'Collection created successfully'
      });
    } catch (error) {
      console.error('Error creating collection:', error);
      res.status(500).json({ error: 'Failed to create collection' });
    }
  });

  // Collections Tags API
  app.get('/api/collections/tags', isAuthenticated, async (req: any, res) => {
    try {
      if (!sqlite) throw new Error('SQLite database not available');

      // Get all unique tags from user_collections
      const tagsResult = sqlite.prepare(`
        SELECT DISTINCT json_extract(tags.value, '$') as tag
        FROM user_collections, json_each(user_collections.tags) as tags
        WHERE user_id = ? AND tags.value IS NOT NULL
        ORDER BY tag ASC
      `).all(req.user?.id || 'user-id');

      const tags = tagsResult.map((row: any) => row.tag).filter(Boolean);

      res.json({ tags });
    } catch (error) {
      console.error('Error fetching collection tags:', error);
      res.status(500).json({ error: 'Failed to fetch collection tags' });
    }
  });

  // Watchlist endpoints
  app.post('/api/collections/watchlist/add', isAuthenticated, async (req: any, res) => {
    try {
      const user_id = req.user?.id;
      const { show_id, show_title, show_poster } = req.body;

      if (!user_id || !show_id) {
        return res.status(400).json({ 
          error: 'Missing required fields: show_id' 
        });
      }

      if (!sqlite) throw new Error('SQLite database not available');

      // Create or get watchlist collection for user
      let watchlistStmt = sqlite.prepare(`
        SELECT id FROM user_collections 
        WHERE user_id = ? AND name = 'Watchlist'
      `);
      
      let watchlist = watchlistStmt.get(user_id) as { id: number } | undefined;
      
      if (!watchlist) {
        // Create watchlist collection
        const createWatchlistStmt = sqlite.prepare(`
          INSERT INTO user_collections (
            user_id, name, description, is_public, tags,
            created_at, updated_at
          ) VALUES (?, 'Watchlist', 'My shows to watch', 0, '[]', datetime('now'), datetime('now'))
        `);
        
        const result = createWatchlistStmt.run(user_id);
        watchlist = { id: Number(result.lastInsertRowid) };
      }

      // Add show to watchlist
      const addShowStmt = sqlite.prepare(`
        INSERT OR REPLACE INTO collection_items (
          collection_id, show_id, show_title, show_poster, added_at
        ) VALUES (?, ?, ?, ?, datetime('now'))
      `);
      
      addShowStmt.run(watchlist.id, show_id, show_title || 'Unknown Title', show_poster || '');
      
      res.json({ success: true, message: 'Added to watchlist' });
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      res.status(500).json({ error: 'Failed to add to watchlist' });
    }
  });

  // Share endpoint
  app.post('/api/collections/share', async (req, res) => {
    try {
      const { show_id, show_title, platform } = req.body;
      
      // For now, just return success - real sharing would integrate with social platforms
      console.log(`Sharing ${show_title} (${show_id}) on ${platform}`);
      
      res.json({ 
        success: true, 
        message: `Shared "${show_title}" successfully`,
        share_url: `https://bingeboard.com/show/${show_id}`
      });
    } catch (error) {
      console.error('Error sharing show:', error);
      res.status(500).json({ error: 'Failed to share show' });
    }
  });

  // =============================================================================
  // DASHBOARD API ENDPOINTS
  // =============================================================================

  // Spotlight data for dashboard (trending content + continue watching)
  app.get('/api/tmdb/spotlight', async (req, res) => {
    try {
      const tmdbService = new TMDBService();

      // Get trending TV shows and movies
      const [trendingTV, trendingMovies] = await Promise.all([
        tmdbService.getTrending('tv', 'day'),
        tmdbService.getTrending('movie', 'day')
      ]);

      // Combine and get top 10 trending items
      const allTrending = [...(trendingTV.results || []), ...(trendingMovies.results || [])].slice(0, 10);

      // Enrich with streaming provider data
      const enrichedTrending = await Promise.all(
        allTrending.map(async (item: any) => {
          try {
            const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
            const watchProviders = await tmdbService.getWatchProviders(mediaType, item.id);

            // Extract streaming platforms from watch providers
            const providers = (watchProviders as any)?.results?.US;
            const streamingPlatforms = [];

            if (providers?.flatrate) {
              streamingPlatforms.push(...providers.flatrate.map((p: any) => ({
                name: p.provider_name,
                logo: p.logo_path,
                id: p.provider_id
              })));
            }
            if (providers?.buy) {
              streamingPlatforms.push(...providers.buy.slice(0, 2).map((p: any) => ({
                name: p.provider_name,
                logo: p.logo_path,
                id: p.provider_id,
                type: 'buy'
              })));
            }

            return {
              ...item,
              streamingPlatforms,
              watchProviders: providers
            };
          } catch (error) {
            console.warn(`Failed to get watch providers for ${item.title || item.name}:`, error);
            return item; // Return original item if provider fetch fails
          }
        })
      );

      // Mock continue watching data - replace with actual user data
      const continueWatching = [
        {
          id: 1,
          title: "The Bear",
          poster_path: "/sHFlbKS3WLqfGlFLQ4wdAoLNN2B.jpg",
          progress: 75,
          platform: "Hulu",
          nextEpisode: "S3 E8"
        },
        {
          id: 2,
          title: "House of the Dragon",
          poster_path: "/7QMsOTMUswlwxJP0rTTZfmz2tX2.jpg",
          progress: 45,
          platform: "HBO Max",
          nextEpisode: "S2 E4"
        }
      ];

      const spotlight = {
        trending: enrichedTrending,
        continueWatching
      };

      res.json(spotlight);
    } catch (error) {
      console.error('Error fetching spotlight data:', error);
      res.status(500).json({ error: 'Failed to fetch spotlight data' });
    }
  });

  // ---------------------------------------------------------------------------
  // Missing enhanced trending endpoint expected by several frontend pages
  // GET /api/content/trending-enhanced?mediaType=tv|movie|all&timeWindow=day|week&includeStreaming=true&genre=ID&network=NETWORK_ID
  // Returns a normalized shape: { results: [...]} similar to other list endpoints
  // NOTE: This intentionally reuses tmdbService.getTrending and optional enrichment
  // to avoid duplicating logic from /api/trending/:mediaType/:timeWindow while
  // adding lightweight server-side filtering for genre and network.
  // ---------------------------------------------------------------------------
  app.get('/api/content/trending-enhanced', async (req, res) => {
    try {
      const mediaType = (req.query.mediaType || req.query.type || 'tv').toString() as 'tv' | 'movie' | 'all';
      const timeWindow = (req.query.timeWindow || 'day').toString() as 'day' | 'week';
      const includeStreaming = req.query.includeStreaming === 'true';
      const genreFilter = req.query.genre || req.query.with_genres; // single id supported for now
      const networkFilter = req.query.network; // TMDB network id

      console.log(`🔥 /api/content/trending-enhanced -> mediaType=${mediaType} timeWindow=${timeWindow} includeStreaming=${includeStreaming} genre=${genreFilter || 'none'} network=${networkFilter || 'none'}`);

      // Fetch trending (if all => combine tv + movie like spotlight)
      let baseResults: any[] = [];
      if (mediaType === 'all') {
        const [tv, movie] = await Promise.all([
          tmdbService.getTrending('tv', timeWindow),
          tmdbService.getTrending('movie', timeWindow)
        ]);
        baseResults = [ ...(tv.results || []).map((r:any)=>({...r, media_type: 'tv'})), ...(movie.results || []).map((r:any)=>({...r, media_type: 'movie'})) ];
      } else {
        const single = await tmdbService.getTrending(mediaType, timeWindow);
        baseResults = (single.results || []).map((r:any)=> ({...r, media_type: r.media_type || (r.title ? 'movie':'tv')}));
      }

      // Basic filtering by genre id (single). Accept comma but treat first for simplicity.
      let filtered = baseResults;
      if (genreFilter) {
        const firstGenre = genreFilter.toString().split(',')[0];
        filtered = filtered.filter(r => Array.isArray(r.genre_ids) && r.genre_ids.includes(parseInt(firstGenre)));
      }

      // Basic filtering by network (only applies to tv). Requires detail lookup if networks missing.
      if (networkFilter) {
        const networkIdNum = parseInt(networkFilter.toString());
        // If some tv items lack networks array, leave them (avoid N extra detail calls). Only filter when 'origin_country' or known network id available in an embedded field (rare). For accurate network filtering the client should call discover.
        filtered = filtered.filter(r => r.media_type !== 'tv' || !networkIdNum || !r.networks || r.networks.some((n:any)=> n?.id === networkIdNum));
      }

      // Optional streaming enrichment (reuse approach from /api/trending route)
      if (includeStreaming && filtered.length) {
        const ENRICH_LIMIT = Math.min(8, filtered.length);
        console.log(`🎬 Enriching first ${ENRICH_LIMIT} trending items with streaming data (enhanced endpoint)`);
        await Promise.all(filtered.slice(0, ENRICH_LIMIT).map(async (item, idx) => {
          try {
            const streamingData = await MultiAPIStreamingService.getComprehensiveAvailability(
              item.id,
              item.title || item.name || '',
              item.media_type === 'movie' ? 'movie' : 'tv'
            );
            item.streamingPlatforms = streamingData.platforms;
            item.streaming = streamingData.platforms;
            item.streamingStats = {
              totalPlatforms: streamingData.totalPlatforms,
              affiliatePlatforms: streamingData.affiliatePlatforms,
              premiumPlatforms: streamingData.premiumPlatforms,
              freePlatforms: streamingData.freePlatforms,
              sources: streamingData.sources
            };
          } catch (e) {
            if (idx < 3) console.warn('⚠️ Streaming enrich failed (enhanced trending):', (e as Error).message);
          }
        }));
      }

      res.json({ results: filtered.slice(0, 40) });
    } catch (error) {
      console.error('Error in /api/content/trending-enhanced:', error);
      res.status(500).json({ error: 'Failed to fetch enhanced trending content' });
    }
  });

  // Social activity endpoint for friends watching
  app.get('/api/social/activity', isAuthenticated, async (req: any, res) => {
    try {
      // Mock friend activity data - replace with actual social features
      const friendActivity = [
        {
          id: 1,
          friendName: "Alex",
          action: "started watching",
          showTitle: "The Bear",
          timestamp: new Date().toISOString()
        },
        {
          id: 2,
          friendName: "Sam",
          action: "added to watchlist",
          showTitle: "House of the Dragon",
          timestamp: new Date(Date.now() - 3600000).toISOString()
        }
      ];

      res.json(friendActivity);
    } catch (error) {
      console.error('Error fetching social activity:', error);
      res.status(500).json({ error: 'Failed to fetch social activity' });
    }
  });

  // Enhanced filter search endpoint
  app.post('/api/content/enhanced-search', async (req, res) => {
    console.warn('[DEPRECATION] /api/content/enhanced-search is deprecated. Use /api/streaming/enhanced-search (POST) instead.');
    try {
      const filters = req.body;
      const tmdbService = new TMDBService();

      // Build TMDB discover query from enhanced filters
      const discoverParams: any = {
        page: 1,
        sort_by: filters.sortBy || 'popularity.desc'
      };

      if (filters.genres?.length > 0) {
        discoverParams.with_genres = filters.genres.join(',');
      }

      if (filters.ratingRange) {
        discoverParams['vote_average.gte'] = filters.ratingRange[0];
        discoverParams['vote_average.lte'] = filters.ratingRange[1];
      }

      if (filters.releaseYear) {
        discoverParams.primary_release_year = filters.releaseYear;
      }

      if (filters.providers?.length > 0) {
        discoverParams.with_watch_providers = filters.providers.join('|');
        discoverParams.watch_region = 'US';
      }

      // Get results for both TV and movies
      const [tvResults, movieResults] = await Promise.all([
        tmdbService.discover('tv', discoverParams),
        tmdbService.discover('movie', discoverParams)
      ]);

      const combinedResults = [
        ...(tvResults.results || []).map((item: any) => ({ ...item, media_type: 'tv' })),
        ...(movieResults.results || []).map((item: any) => ({ ...item, media_type: 'movie' }))
      ].slice(0, 20);

      res.json({
        results: combinedResults,
        totalResults: (tvResults.total_results || 0) + (movieResults.total_results || 0)
      });
    } catch (error) {
      console.error('Error performing enhanced search:', error);
      res.status(500).json({ error: 'Failed to perform enhanced search' });
    }
  });

  // New releases endpoint
  app.get('/api/content/new-releases', async (req, res) => {
    try {
      const tmdbService = new TMDBService();

      // Get current date and 30 days ago
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));

      const discoverParams = {
        'primary_release_date.gte': thirtyDaysAgo.toISOString().split('T')[0],
        'primary_release_date.lte': today.toISOString().split('T')[0],
        sort_by: 'primary_release_date.desc',
        page: 1
      };

      const [newMovies, newTVShows] = await Promise.all([
        tmdbService.discover('movie', discoverParams),
        tmdbService.discover('tv', {
          ...(discoverParams as any),
          'first_air_date.gte': (discoverParams as any)['primary_release_date.gte'],
          'first_air_date.lte': (discoverParams as any)['primary_release_date.lte']
        } as any)
      ]);

      const releases = [
        ...(newMovies.results || []).slice(0, 10).map((item: any) => ({ ...item, media_type: 'movie' })),
        ...(newTVShows.results || []).slice(0, 10).map((item: any) => ({ ...item, media_type: 'tv' }))
      ].slice(0, 20);

      res.json({ releases });
    } catch (error) {
      console.error('Error fetching new releases:', error);
      res.status(500).json({ error: 'Failed to fetch new releases' });
    }
  });

  // User Lists Management endpoints
  app.post('/api/user/lists/:listId/add', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const { listId } = req.params;
      const { itemId, itemType, title, posterPath } = req.body;

      if (!itemId || !itemType) {
        return res.status(400).json({ error: 'itemId and itemType are required' });
      }

      console.log(`📝 Adding item to list: User ${userId}, List ${listId}, Item ${itemId} (${itemType})`);

      // TODO: Replace with actual database implementation
      // For now, return success to unblock the UI
      res.json({
        success: true,
        message: 'Item added to list successfully',
        listId: listId,
        itemId: itemId,
        itemType: itemType
      });
    } catch (error) {
      console.error('Error adding item to list:', error);
      res.status(500).json({ error: 'Failed to add item to list' });
    }
  });

  app.delete('/api/user/lists/:listId/remove/:itemId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const { listId, itemId } = req.params;

      console.log(`🗑️ Removing item from list: User ${userId}, List ${listId}, Item ${itemId}`);

      // TODO: Replace with actual database implementation
      // For now, return success to unblock the UI
      res.json({
        success: true,
        message: 'Item removed from list successfully',
        listId: listId,
        itemId: itemId
      });
    } catch (error) {
      console.error('Error removing item from list:', error);
      res.status(500).json({ error: 'Failed to remove item from list' });
    }
  });

  app.post('/api/user/lists', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const { name, description, isPublic } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'List name is required' });
      }

      console.log(`📝 Creating new list: User ${userId}, Name: ${name}`);

      // TODO: Replace with actual database implementation
      // For now, return mock data to unblock the UI
      const newList = {
        id: Date.now(), // Mock ID
        name: name,
        description: description || '',
        itemCount: 0,
        isPublic: isPublic || false,
        createdAt: new Date().toISOString()
      };

      res.json({
        success: true,
        message: 'List created successfully',
        list: newList
      });
    } catch (error) {
      console.error('Error creating list:', error);
      res.status(500).json({ error: 'Failed to create list' });
    }
  });

  app.get('/api/user/lists/:listId/items', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const { listId } = req.params;

      console.log(`📋 Fetching items for list: User ${userId}, List ${listId}`);

      // TODO: Replace with actual database implementation
      // For now, return empty array to unblock the UI
      res.json({
        items: [],
        listId: listId,
        totalCount: 0
      });
    } catch (error) {
      console.error('Error fetching list items:', error);
      res.status(500).json({ error: 'Failed to fetch list items' });
    }
  });

  // Sports Highlights API endpoints
  app.get('/api/sports/highlights', isAuthenticated, async (req: any, res) => {
    try {
      console.log('🏈 Fetching sports highlights for user:', req.user?.email);

      // Get recent games from multiple sports
      const [nflGames, nbaGames, mlbGames] = await Promise.all([
        sportsService.getUpcomingGames('NFL', 3),
        sportsService.getUpcomingGames('NBA', 3),
        sportsService.getUpcomingGames('MLB', 3)
      ]);

      const allGames = [...nflGames, ...nbaGames, ...mlbGames];

      // Transform the data to include highlight-style information
      const processedHighlights = allGames.map((game: any) => ({
        id: game.idEvent || `highlight_${game.idHomeTeam}_${game.idAwayTeam}`,
        title: `${game.strHomeTeam} vs ${game.strAwayTeam}`,
        description: game.strStatus || 'Upcoming Game',
        sport: game.strSport || 'Football',
        league: game.strLeague || 'NFL',
        date: game.dateEvent,
        time: game.strTime,
        venue: game.strVenue || 'Stadium',
        homeTeam: {
          name: game.strHomeTeam,
          logo: game.strHomeTeamBadge,
          score: game.intHomeScore
        },
        awayTeam: {
          name: game.strAwayTeam,
          logo: game.strAwayTeamBadge,
          score: game.intAwayScore
        },
        status: game.strStatus,
        thumbnail: game.strThumb || game.strHomeTeamBadge,
        // Add mock video URL for demo - replace with real highlight videos
        videoUrl: game.strVideo || `https://www.youtube.com/embed/dQw4w9WgXcQ?si=example`,
        isLive: game.strStatus === 'Match Finished' ? false : true,
        category: game.strSport?.toLowerCase() || 'football'
      }));

      console.log('✅ Sports highlights processed:', processedHighlights.length, 'items');

      res.json(processedHighlights.slice(0, 10)); // Limit to 10 highlights
    } catch (error) {
      console.error('❌ Error fetching sports highlights:', error);
      res.status(500).json({ error: 'Failed to fetch sports highlights' });
    }
  });

  // Sports TV Schedule endpoint
  app.get('/api/sports/tv-schedule', isAuthenticated, async (req: any, res) => {
    try {
      console.log('📺 Fetching sports TV schedule');

      const schedule = await sportsService.getTodaysTvSchedule();

      res.json(schedule);
    } catch (error) {
      console.error('❌ Error fetching sports TV schedule:', error);
      res.status(500).json({ error: 'Failed to fetch sports TV schedule' });
    }
  });

  // Sports by category endpoint
  app.get('/api/sports/highlights/:category', isAuthenticated, async (req: any, res) => {
    try {
      const { category } = req.params;
      console.log('🎯 Fetching sports highlights for category:', category);

      // Map category to sport type
      const sportMapping: { [key: string]: string } = {
        'nfl': 'NFL',
        'nba': 'NBA',
        'mlb': 'MLB',
        'nhl': 'NHL',
        'tennis': 'Tennis'
      };

      const sport = sportMapping[category.toLowerCase()];

      if (!sport) {
        return res.status(400).json({ error: 'Invalid sports category' });
      }

      // Get games for specific sport
      const highlights = await sportsService.getUpcomingGames(sport, 7);
      const filteredHighlights = highlights.map((game: any) => ({
        id: game.idEvent || `highlight_${game.idHomeTeam}_${game.idAwayTeam}`,
        title: `${game.strHomeTeam} vs ${game.strAwayTeam}`,
        description: game.strStatus || 'Upcoming Game',
        sport: game.strSport,
        league: game.strLeague,
        date: game.dateEvent,
        time: game.strTime,
        homeTeam: {
          name: game.strHomeTeam,
          logo: game.strHomeTeamBadge,
          score: game.intHomeScore
        },
        awayTeam: {
          name: game.strAwayTeam,
          logo: game.strAwayTeamBadge,
          score: game.intAwayScore
        },
        status: game.strStatus,
        thumbnail: game.strThumb || game.strHomeTeamBadge,
        videoUrl: game.strVideo || `https://www.youtube.com/embed/dQw4w9WgXcQ?si=${category}`,
        isLive: game.strStatus !== 'Match Finished',
        category: category
      }));

      res.json(filteredHighlights.slice(0, 10));
    } catch (error) {
      console.error('❌ Error fetching sports highlights by category:', error);
      res.status(500).json({ error: 'Failed to fetch sports highlights' });
    }
  });

  // =========================================================
  // 📅 Release Reminders API
  // Endpoints:
  //   GET    /api/reminders                -> List all reminders for user (with release details)
  //   GET    /api/reminders/upcoming       -> Upcoming releases with active reminders (next X days)
  //   POST   /api/reminders                -> Create a reminder (optionally creating the release)
  //   DELETE /api/reminders/:id            -> Delete a reminder
  // =========================================================

  // GET /api/reminders
  app.get('/api/reminders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Join reminders with their releases for richer payload
      const results = await db
        .select({
          id: releaseReminders.id,
            releaseId: releaseReminders.releaseId,
            reminderType: releaseReminders.reminderType,
            triggerDate: releaseReminders.triggerDate,
            isTriggered: releaseReminders.isTriggered,
            createdAt: releaseReminders.createdAt,
            updatedAt: releaseReminders.updatedAt,
            release: {
              id: upcomingReleases.id,
              showId: upcomingReleases.showId,
              seasonNumber: upcomingReleases.seasonNumber,
              episodeNumber: upcomingReleases.episodeNumber,
              releaseDate: upcomingReleases.releaseDate,
              releaseType: upcomingReleases.releaseType,
              title: upcomingReleases.title,
              description: upcomingReleases.description,
              isConfirmed: upcomingReleases.isConfirmed,
            }
        })
        .from(releaseReminders)
        .leftJoin(upcomingReleases, eq(releaseReminders.releaseId, upcomingReleases.id))
        .where(eq(releaseReminders.userId, userId))
        .orderBy(desc(releaseReminders.triggerDate));

      res.json({ reminders: results });
    } catch (error) {
      console.error('❌ Error fetching reminders:', error);
      res.status(500).json({ error: 'Failed to fetch reminders' });
    }
  });

  // GET /api/reminders/upcoming?days=30
  app.get('/api/reminders/upcoming', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const days = Math.min(parseInt(req.query.days as string) || 30, 120); // cap at 120
      const now = new Date();
      const windowEnd = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

      const joined = await db
        .select({
          id: releaseReminders.id,
          releaseId: releaseReminders.releaseId,
          reminderType: releaseReminders.reminderType,
          triggerDate: releaseReminders.triggerDate,
          releaseDate: upcomingReleases.releaseDate,
          title: upcomingReleases.title,
          releaseType: upcomingReleases.releaseType,
          showId: upcomingReleases.showId,
        })
        .from(releaseReminders)
        .innerJoin(upcomingReleases, eq(releaseReminders.releaseId, upcomingReleases.id))
        .where(eq(releaseReminders.userId, userId));

      const upcoming = joined.filter((r: any) => {
        const d = new Date(r.releaseDate as any);
        return d >= now && d <= windowEnd;
      });

      res.json({ windowDays: days, reminders: upcoming });
    } catch (error) {
      console.error('❌ Error fetching upcoming reminder releases:', error);
      res.status(500).json({ error: 'Failed to fetch upcoming reminder releases' });
    }
  });

  // POST /api/reminders
  // Body options:
  //   { releaseId, reminderType, triggerDate? }
  //   or { release: { showId, releaseDate, releaseType, title?, description? }, reminderType, triggerDate? }
  app.post('/api/reminders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { releaseId, reminderType, triggerDate, release } = req.body || {};
      if (!reminderType) {
        return res.status(400).json({ error: 'reminderType is required' });
      }

      let finalReleaseId = releaseId;

      // Optionally create the release record if details provided instead of releaseId
      if (!finalReleaseId && release) {
        try {
          // Minimal validation – required core fields
            if (!release.showId || !release.releaseDate || !release.releaseType) {
              return res.status(400).json({ error: 'release.showId, release.releaseDate, and release.releaseType are required' });
            }

          const newRelease = await storage.createUpcomingRelease({
            showId: release.showId,
            seasonNumber: release.seasonNumber || null,
            episodeNumber: release.episodeNumber || 1,
            releaseDate: new Date(release.releaseDate),
            releaseType: release.releaseType,
            title: release.title || null,
            description: release.description || null,
            isConfirmed: release.isConfirmed ?? false
          });
          finalReleaseId = newRelease.id;
        } catch (e) {
          console.error('Failed creating upcoming release for reminder:', e);
          return res.status(500).json({ error: 'Failed to create upcoming release' });
        }
      }

      if (!finalReleaseId) {
        return res.status(400).json({ error: 'releaseId or release object required' });
      }

      // Fetch release for trigger date calculation if needed
      let releaseRecord: any = null;
      if (!triggerDate) {
        const [found] = await db
          .select()
          .from(upcomingReleases)
          .where(eq(upcomingReleases.id, finalReleaseId));
        releaseRecord = found;
        if (!releaseRecord) {
          return res.status(404).json({ error: 'Release not found for trigger date calculation' });
        }
      }

      // Default trigger: 24h before release (or now if already within 24h)
      let triggerAt: Date;
      if (triggerDate) {
        triggerAt = new Date(triggerDate);
      } else {
        const rel = new Date(releaseRecord.releaseDate);
        const fallback = new Date(rel.getTime() - 24 * 60 * 60 * 1000);
        triggerAt = fallback < new Date() ? new Date() : fallback;
      }

      try {
        const newReminder = await storage.createReleaseReminder({
          userId,
          releaseId: finalReleaseId,
          reminderType,
          triggerDate: triggerAt
        });

        res.status(201).json({ reminder: newReminder });
      } catch (e: any) {
        // Handle uniqueness constraint (duplicate reminder)
        if (e?.message?.includes('duplicate') || e?.code === 'SQLITE_CONSTRAINT') {
          return res.status(409).json({ error: 'Reminder already exists for this release and type' });
        }
        console.error('❌ Error creating reminder:', e);
        res.status(500).json({ error: 'Failed to create reminder' });
      }
    } catch (error) {
      console.error('❌ Unexpected error creating reminder:', error);
      res.status(500).json({ error: 'Failed to create reminder' });
    }
  });

  // DELETE /api/reminders/:id
  app.delete('/api/reminders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error: 'Reminder id required' });
      }
      await storage.deleteReleaseReminder(Number(id), userId);
      res.json({ success: true });
    } catch (error) {
      console.error('❌ Error deleting reminder:', error);
      res.status(500).json({ error: 'Failed to delete reminder' });
    }
  });

  // =========================================================
  // 🚀 Upcoming Releases Aggregated Endpoint
  // GET /api/content/upcoming?days=90&mediaType=all|tv|movie&limit=40
  // Combines:
  //   1. Local upcoming_releases (authoritative user-curated / previously stored)
  //   2. TMDB discover upcoming (future window) for TV + Movies
  // Adds reminder metadata for authenticated user
  // =========================================================
  app.get('/api/content/upcoming', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const days = Math.min(parseInt(req.query.days as string) || 90, 180);
      const mediaType = (req.query.mediaType as string) || 'all'; // all|tv|movie
      const limit = Math.min(parseInt(req.query.limit as string) || 40, 100);
      const now = new Date();
      const windowEnd = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

      // 1. Local releases within window
      const localReleases = await db
        .select()
        .from(upcomingReleases)
        .where(and(
          gte(upcomingReleases.releaseDate, now),
          lte(upcomingReleases.releaseDate, windowEnd)
        ))
        .orderBy(desc(upcomingReleases.releaseDate));

      // 2. User reminders mapped by releaseId for quick lookup
      const userReminders = await storage.getUserReminders(userId);
      const reminderByReleaseId = new Map<number, any>();
      userReminders.forEach(r => reminderByReleaseId.set(r.releaseId as number, r));

      // 3. TMDB upcoming (basic). We'll fetch TV and Movie unless mediaType restricts
      const tmdbService = new TMDBService();
      const tmdbResults: any[] = [];
      const dateFrom = now.toISOString().split('T')[0];
      const dateTo = windowEnd.toISOString().split('T')[0];

      const fetchers: Promise<any>[] = [];
      if (mediaType === 'all' || mediaType === 'tv') {
        fetchers.push(tmdbService.discover('tv', {
          // Cast to any: TMDB discover supports these dynamic range params
          'first_air_date.gte': dateFrom,
          'first_air_date.lte': dateTo,
          sort_by: 'first_air_date.asc'
        } as any).then(r => ({ type: 'tv', ...r })).catch(() => null));
      }
      if (mediaType === 'all' || mediaType === 'movie') {
        fetchers.push(tmdbService.discover('movie', {
          'primary_release_date.gte': dateFrom,
          'primary_release_date.lte': dateTo,
          sort_by: 'primary_release_date.asc'
        } as any).then(r => ({ type: 'movie', ...r })).catch(() => null));
      }

      const remoteSets = await Promise.all(fetchers);
      remoteSets.filter(Boolean).forEach(set => {
        if (set?.results) {
          set.results.forEach((item: any) => tmdbResults.push({ ...item, media_type: set.type }));
        }
      });

      // 4. Normalize local releases to a common shape and add reminder metadata
      const normalizedLocal = localReleases.map((r: any) => ({
        source: 'local',
        releaseId: r.id,
        showId: r.showId,
        seasonNumber: r.seasonNumber,
        episodeNumber: r.episodeNumber,
        releaseDate: r.releaseDate,
        releaseType: r.releaseType,
        title: r.title,
        description: r.description,
        isConfirmed: r.isConfirmed,
        hasReminder: reminderByReleaseId.has(r.id),
        reminder: reminderByReleaseId.get(r.id) || null
      }));

      // 5. Remote normalization (subset of fields)
      const normalizedRemote = tmdbResults.map(item => ({
        source: 'tmdb',
        tmdbId: item.id,
        mediaType: item.media_type,
        title: item.name || item.title,
        overview: item.overview,
        posterPath: item.poster_path,
        backdropPath: item.backdrop_path,
        popularity: item.popularity,
        voteAverage: item.vote_average,
        releaseDate: item.first_air_date || item.release_date,
        originalLanguage: item.original_language,
      })).filter(i => i.releaseDate);

      // 6. Combine & sort by date ascending (soonest first)
      const combined = [...normalizedLocal, ...normalizedRemote].sort((a, b) => {
        const da = new Date(a.releaseDate).getTime();
        const db = new Date(b.releaseDate).getTime();
        return da - db;
      });

      res.json({
        windowDays: days,
        total: combined.length,
        results: combined.slice(0, limit),
        localCount: normalizedLocal.length,
        remoteCount: normalizedRemote.length,
        reminderCount: normalizedLocal.filter((r: any) => r.hasReminder).length
      });
    } catch (error) {
      console.error('❌ Error fetching upcoming releases aggregate:', error);
      res.status(500).json({ error: 'Failed to fetch upcoming releases' });
    }
  });

  // =========================================================
  // 🔍 Discover Search Endpoint
  // GET /api/discover/search?mediaType=tv|movie&genres=18,35&year=2025&platform=8&sort=popularity.desc&page=1&includeStreaming=true
  // Maps to TMDB discover API and (optionally) enriches with streaming availability.
  // Parameters:
  //   mediaType: tv|movie (default tv)
  //   genres: comma-separated TMDB genre ids
  //   year: release year (tv: first_air_date_year, movie: primary_release_year)
  //   platform: watch provider id (maps to with_watch_providers + watch_region=US)
  //   sort: popularity.desc | vote_average.desc | first_air_date.desc | release_date.desc (fallback popularity.desc)
  //   page: pagination (1..N)
  //   includeStreaming: boolean to trigger enrichment (slow path)
  // =========================================================
  app.get('/api/discover/search', isAuthenticated, async (req: any, res) => {
    const started = Date.now();
    try {
      const userId = req.user?.claims?.sub || req.user?.id; // reserved for future personalization
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const mediaType = (req.query.mediaType as string) === 'movie' ? 'movie' : 'tv';
      const rawGenres = (req.query.genres as string) || '';
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;
      const platform = req.query.platform ? String(req.query.platform) : undefined; // watch provider id
      const sort = (req.query.sort as string) || 'popularity.desc';
      const page = Math.max(1, Math.min(parseInt(req.query.page as string) || 1, 50));
      const includeStreaming = (req.query.includeStreaming === 'true' || req.query.includeStreaming === '1');

      // Map allowed sort values to TMDB params
      const allowedSort = new Set([
        'popularity.desc', 'popularity.asc',
        'vote_average.desc', 'vote_average.asc',
        mediaType === 'tv' ? 'first_air_date.desc' : 'primary_release_date.desc',
        mediaType === 'tv' ? 'first_air_date.asc' : 'primary_release_date.asc'
      ]);
      const sortBy = allowedSort.has(sort) ? sort : 'popularity.desc';

      // Build discover query params (typed loosening with any for dynamic keys)
      const discoverParams: any = { sort_by: sortBy, page };
      if (rawGenres) discoverParams.with_genres = rawGenres;
      if (year) {
        if (mediaType === 'tv') {
          discoverParams.first_air_date_year = year;
        } else {
          discoverParams.primary_release_year = year;
        }
      }
      if (platform) {
        discoverParams.with_watch_providers = platform;
        discoverParams.watch_region = 'US';
      }

      const tmdbService = new TMDBService();
      const response = await tmdbService.discover(mediaType as any, discoverParams);

      let results = response.results || [];

      // Streaming enrichment (optional & bounded)
      if (includeStreaming && results.length > 0) {
        const limited = results.slice(0, 12); // cap enrichment to reduce latency
        await Promise.race([
          Promise.all(limited.map(async (item: any) => {
            try {
              const streaming = await MultiAPIStreamingService.getComprehensiveAvailability(
                item.id,
                item.name || item.title || '',
                mediaType
              );
              item.streamingPlatforms = streaming.platforms;
              item.streamingStats = {
                totalPlatforms: streaming.platforms?.length || 0,
                lastUpdated: new Date().toISOString()
              };
            } catch (e) {
              item.streamingError = (e as Error).message;
            }
          })),
          new Promise(resolve => setTimeout(resolve, 3500)) // 3.5s timeout safety
        ]);
      }

      // Normalize output structure
      const normalized = results.map((item: any) => ({
        tmdbId: item.id,
        mediaType,
        title: item.name || item.title,
        overview: item.overview,
        posterPath: item.poster_path,
        backdropPath: item.backdrop_path,
        popularity: item.popularity,
        voteAverage: item.vote_average,
        voteCount: item.vote_count,
        firstAirDate: item.first_air_date,
        releaseDate: item.release_date,
        genreIds: item.genre_ids,
        originCountry: item.origin_country,
        originalLanguage: item.original_language,
        streamingPlatforms: item.streamingPlatforms || null,
        streamingStats: item.streamingStats || null,
        streamingError: item.streamingError || null
      }));

      res.json({
        page: response.page || page,
        totalPages: response.total_pages || 1,
        totalResults: response.total_results || normalized.length,
        results: normalized,
        meta: {
          mediaType,
          sort: sortBy,
          genres: rawGenres || null,
          year: year || null,
          platform: platform || null,
          includeStreaming,
          elapsedMs: Date.now() - started
        }
      });
    } catch (error) {
      console.error('❌ Discover search error:', error);
      res.status(500).json({ error: 'Failed to perform discover search' });
    }
  });

  // Return undefined - server is created in index.ts
  return undefined as unknown as Server;
}
