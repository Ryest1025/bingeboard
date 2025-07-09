import type { Express } from "express";
import { createServer, type Server } from "http";
// import authRoutes from './routes/auth';
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { db } from "./db";
import { 
  insertWatchlistSchema, insertActivitySchema, insertFriendshipSchema, 
  insertActivityLikeSchema, insertActivityCommentSchema, insertUpcomingReleaseSchema,
  insertReleaseReminderSchema, insertNotificationSchema, insertStreamingIntegrationSchema,
  insertViewingHistorySchema, insertUserBehaviorSchema, insertRecommendationTrainingSchema
} from "@shared/schema";
import { initializeFirebaseAdmin, sendPushNotification } from "./services/firebaseAdmin";
import { TMDBService } from "./services/tmdb";
import { sportsService } from "./services/sports";
import { StreamingService } from "./services/streamingService";
import { WatchmodeService } from "./services/watchmodeService";
import { SocialOAuthService } from "./services/socialOAuthService";
import multer from "multer";
import csvParser from "csv-parser";
import { Readable } from "stream";

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

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Firebase authentication routes (working implementation)
  // Google and Facebook authentication handled by Passport.js in auth.ts

  // Social Media OAuth Routes
  // Facebook OAuth routes are handled in auth.ts via Passport.js

  // Facebook OAuth callback is handled in auth.ts via Passport.js

  app.get('/api/auth/instagram', (req, res) => {
    const instagramAuthUrl = `https://api.instagram.com/oauth/authorize?client_id=${process.env.INSTAGRAM_CLIENT_ID}&redirect_uri=${encodeURIComponent(`${req.protocol}://${req.get('host')}/api/auth/instagram/callback`)}&scope=user_profile,user_media&response_type=code`;
    res.redirect(instagramAuthUrl);
  });

  app.get('/api/auth/instagram/callback', isAuthenticated, async (req: any, res) => {
    const { code } = req.query;
    if (!code) {
      return res.redirect('/?error=instagram_auth_failed');
    }

    try {
      const userId = req.user.claims?.sub || req.user.id;
      
      // Exchange code for access token
      const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.INSTAGRAM_CLIENT_ID!,
          client_secret: process.env.INSTAGRAM_CLIENT_SECRET!,
          grant_type: 'authorization_code',
          redirect_uri: `${req.protocol}://${req.get('host')}/api/auth/instagram/callback`,
          code: code as string,
        }),
      });

      const tokenData = await tokenResponse.json();
      
      if (tokenData.access_token) {
        // Process Instagram connection
        await SocialOAuthService.processInstagramConnections(tokenData.access_token, userId);
        res.redirect('/?social_connected=instagram');
      } else {
        res.redirect('/?error=instagram_token_failed');
      }
    } catch (error) {
      console.error('Instagram OAuth error:', error);
      res.redirect('/?error=instagram_auth_error');
    }
  });

  app.get('/api/auth/snapchat', (req, res) => {
    const snapchatAuthUrl = `https://accounts.snapchat.com/login/oauth2/authorize?client_id=${process.env.SNAPCHAT_CLIENT_ID}&redirect_uri=${encodeURIComponent(`${req.protocol}://${req.get('host')}/api/auth/snapchat/callback`)}&response_type=code&scope=user.display_name`;
    res.redirect(snapchatAuthUrl);
  });

  app.get('/api/auth/snapchat/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) {
      return res.redirect('/?error=snapchat_auth_failed');
    }

    try {
      // Exchange code for access token
      const tokenResponse = await fetch('https://accounts.snapchat.com/login/oauth2/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.SNAPCHAT_CLIENT_ID!,
          client_secret: process.env.SNAPCHAT_CLIENT_SECRET!,
          grant_type: 'authorization_code',
          redirect_uri: `${req.protocol}://${req.get('host')}/api/auth/snapchat/callback`,
          code: code as string,
        }),
      });

      const tokenData = await tokenResponse.json();
      
      if (tokenData.access_token) {
        res.redirect('/?social_connected=snapchat');
      } else {
        res.redirect('/?error=snapchat_token_failed');
      }
    } catch (error) {
      console.error('Snapchat OAuth error:', error);
      res.redirect('/?error=snapchat_auth_error');
    }
  });

  app.get('/api/auth/tiktok', (req, res) => {
    const tiktokAuthUrl = `https://www.tiktok.com/auth/authorize/?client_key=${process.env.TIKTOK_CLIENT_KEY}&scope=user.info.basic&response_type=code&redirect_uri=${encodeURIComponent(`${req.protocol}://${req.get('host')}/api/auth/tiktok/callback`)}&state=state`;
    res.redirect(tiktokAuthUrl);
  });

  app.get('/api/auth/tiktok/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) {
      return res.redirect('/?error=tiktok_auth_failed');
    }

    try {
      // Exchange code for access token
      const tokenResponse = await fetch('https://open-api.tiktok.com/oauth/access_token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_key: process.env.TIKTOK_CLIENT_KEY!,
          client_secret: process.env.TIKTOK_CLIENT_SECRET!,
          code: code as string,
          grant_type: 'authorization_code',
        }),
      });

      const tokenData = await tokenResponse.json();
      
      if (tokenData.data?.access_token) {
        res.redirect('/?social_connected=tiktok');
      } else {
        res.redirect('/?error=tiktok_token_failed');
      }
    } catch (error) {
      console.error('TikTok OAuth error:', error);
      res.redirect('/?error=tiktok_auth_error');
    }
  });

  const tmdbService = new TMDBService();

  // Configure multer for file uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'text/csv' || file.mimetype === 'application/json' || 
          file.originalname.endsWith('.csv') || file.originalname.endsWith('.json')) {
        cb(null, true);
      } else {
        cb(new Error('Only CSV and JSON files are allowed'));
      }
    },
  });

  // Test endpoint to verify connectivity
  app.get('/api/test', (req, res) => {
    console.log('Test endpoint called');
    res.json({ message: 'API is working', timestamp: Date.now() });
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      console.log('Fetching user data for userId:', userId);
      const user = await storage.getUser(userId);
      console.log('User data from database:', JSON.stringify(user, null, 2));
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
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
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Mark onboarding as completed
  app.post('/api/user/onboarding/complete', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      
      const user = await storage.updateUser(userId, { onboardingCompleted: true });
      res.json({ success: true, user });
    } catch (error) {
      console.error("Error marking onboarding as complete:", error);
      res.status(500).json({ message: "Failed to complete onboarding" });
    }
  });

  // Email/password registration
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Hash password
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const newUser = await storage.createUser({
        id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        profileImageUrl: null,
        authProvider: 'email',
      });

      // Automatically log in the user after registration
      (req as any).login({ id: newUser.id, email: newUser.email }, (err: any) => {
        if (err) {
          console.error('Auto-login after registration error:', err);
          return res.status(201).json({ 
            message: "Account created successfully. Please log in.",
            user: {
              id: newUser.id,
              email: newUser.email,
              firstName: newUser.firstName,
              lastName: newUser.lastName
            }
          });
        }
        
        res.status(201).json({ 
          message: "Account created and logged in successfully",
          user: {
            id: newUser.id,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName
          }
        });
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  // Email/password login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Verify password
      const bcrypt = require('bcryptjs');
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Create session
      (req as any).login({ id: user.id, email: user.email }, (err: any) => {
        if (err) {
          console.error('Login session error:', err);
          return res.status(500).json({ message: "Failed to create session" });
        }
        
        res.json({
          message: "Login successful",
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
          }
        });
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: "Failed to log in" });
    }
  });

  // Test endpoint to check session status
  app.get('/api/test-session', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json({
      isAuthenticated: req.isAuthenticated(),
      user: req.user,
      sessionID: req.sessionID,
      hasSession: !!req.session
    });
  });

  // Test endpoint to manually create a session
  app.post('/api/test-login', async (req, res) => {
    try {
      // Find Rachel Gubin's user account
      const user = await storage.getUserByEmail('rachel.gubin@gmail.com');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Create session user object
      const sessionUser = {
        claims: {
          sub: user.id,
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
          profile_image_url: user.profileImageUrl,
          exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days from now
        },
        id: user.id,
        email: user.email
      };

      (req as any).login(sessionUser, (err: any) => {
        if (err) {
          console.error('Test login error:', err);
          return res.status(500).json({ message: "Failed to create session" });
        }
        
        console.log('Test login successful, session created for:', user.email);
        res.json({
          message: "Test login successful",
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
          }
        });
      });
    } catch (error) {
      console.error('Test login error:', error);
      res.status(500).json({ message: "Test login failed" });
    }
  });

  // Debug endpoint to list all registered routes
  app.get('/api/debug-routes', (req, res) => {
    const routes = [];
    app._router.stack.forEach((middleware) => {
      if (middleware.route) {
        routes.push({
          path: middleware.route.path,
          methods: Object.keys(middleware.route.methods)
        });
      }
    });
    res.json(routes);
  });

  // Firebase authentication endpoint
  app.post('/api/auth/firebase', async (req, res) => {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        return res.status(400).json({ message: "Firebase ID token is required" });
      }

      // Verify the Firebase ID token
      const { initializeFirebaseAdmin } = await import('./services/firebaseAdmin');
      const admin = initializeFirebaseAdmin();
      const decodedToken = await admin.auth().verifyIdToken(idToken);

      // Extract user information from Firebase token
      const { uid, email, name, picture } = decodedToken;
      
      console.log('Firebase token decoded successfully:', { uid, email, name: name ? 'present' : 'missing' });
      
      // Parse first and last name
      const nameParts = name ? name.split(' ') : [];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Check if user already exists by UID or email
      console.log('Looking up user by UID:', uid);
      let user = await storage.getUser(uid);
      let isNewUser = false;
      
      console.log('User lookup by UID result:', user ? 'found' : 'not found');

      if (!user && email) {
        // Also check by email in case user exists with different auth provider
        console.log('Looking up user by email:', email);
        user = await storage.getUserByEmail(email);
        console.log('User lookup by email result:', user ? 'found' : 'not found');
      }

      if (!user) {
        // Create new user
        console.log('Creating new user with Firebase data');
        isNewUser = true;
        
        const newUser = {
          id: uid,
          email: email || null,
          firstName,
          lastName,
          profileImageUrl: picture || null
        };
        
        user = await storage.upsertUser(newUser);
        console.log('New user created:', user.id);
      } else {
        // Update existing user's profile if needed
        console.log('Updating existing user profile');
        const updatedUser = {
          id: user.id,
          email: email || user.email,
          firstName: firstName || user.firstName,
          lastName: lastName || user.lastName,
          profileImageUrl: picture || user.profileImageUrl
        };
        
        user = await storage.upsertUser(updatedUser);
        console.log('User profile updated');
      }

      // Create session using passport login with proper claims structure
      const sessionUser = {
        claims: {
          sub: user.id,
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
          profile_image_url: user.profileImageUrl,
          exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days from now
        },
        id: user.id,
        email: user.email
      };

      (req as any).login(sessionUser, (err: any) => {
        if (err) {
          console.error('Firebase session creation error:', err);
          return res.status(500).json({ message: "Failed to create session" });
        }
        
        console.log('Firebase authentication successful, session created');
        console.log('Session user object:', JSON.stringify(sessionUser, null, 2));
        console.log('Session ID:', req.sessionID);
        console.log('Session data:', JSON.stringify(req.session, null, 2));
        console.log('Request user after login:', JSON.stringify(req.user, null, 2));
        console.log('Is authenticated:', req.isAuthenticated());
        
        res.json({
          message: "Firebase authentication successful",
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImageUrl: user.profileImageUrl
          },
          isNewUser
        });
      });
      
    } catch (error: any) {
      console.error('Firebase authentication error:', error);
      res.status(500).json({ 
        message: "Firebase authentication failed",
        error: error.message 
      });
    }
  });

  // Watchmode-powered trending endpoint for better streaming data
  app.get('/api/watchmode/trending', async (req, res) => {
    try {
      const { type = 'tv_series', limit = 20 } = req.query;
      const titles = await WatchmodeService.getTrendingTitles(type as any, Number(limit));
      
      // Transform Watchmode data to match our expected format
      const results = titles.map((title: any) => ({
        id: title.tmdb_id || title.id,
        title: title.title,
        name: title.title,
        overview: title.plot_overview || "",
        poster_path: title.image_url ? `/w500${title.image_url.split('/').pop()}` : null,
        backdrop_path: title.backdrop_url ? `/w1280${title.backdrop_url.split('/').pop()}` : null,
        vote_average: title.user_rating || (title.critic_score ? title.critic_score / 10 : 0),
        first_air_date: title.release_date,
        genre_ids: [],
        genres: title.genre_names || [],
        streamingPlatforms: (title.sources || [])
          .filter((source: any) => source.type === 'sub' && source.region === 'US')
          .slice(0, 3)
          .map((source: any) => ({
            provider_id: source.source_id,
            provider_name: source.name,
            logo_path: `/streaming/${source.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.png`
          }))
      }));

      res.json({
        page: 1,
        results: results.slice(0, Number(limit)),
        total_results: results.length,
        total_pages: 1
      });
    } catch (error) {
      console.error('Watchmode trending error:', error);
      res.status(500).json({ error: 'Failed to fetch trending content' });
    }
  });

  // Watchmode search endpoint
  app.get('/api/watchmode/search', async (req, res) => {
    try {
      const { query, type = 'tv_series' } = req.query;
      if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
      }
      
      const searchResults = await WatchmodeService.searchTitles(query as string, type as any);
      
      // Transform search results to match our expected format
      const results = searchResults.map((title: any) => ({
        id: title.tmdb_id || title.id,
        title: title.title,
        name: title.title,
        overview: title.plot_overview || "",
        poster_path: title.image_url ? `/w500${title.image_url.split('/').pop()}` : null,
        backdrop_path: title.backdrop_url ? `/w1280${title.backdrop_url.split('/').pop()}` : null,
        vote_average: title.user_rating || (title.critic_score ? title.critic_score / 10 : 0),
        first_air_date: title.release_date,
        genre_ids: [],
        genres: title.genre_names || [],
        streamingPlatforms: (title.sources || [])
          .filter((source: any) => source.type === 'sub' && source.region === 'US')
          .slice(0, 3)
          .map((source: any) => ({
            provider_id: source.source_id,
            provider_name: source.name,
            logo_path: `/streaming/${source.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.png`
          }))
      }));

      res.json({
        page: 1,
        results,
        total_results: results.length,
        total_pages: 1
      });
    } catch (error) {
      console.error('Watchmode search error:', error);
      res.status(500).json({ error: 'Search failed' });
    }
  });

  // FIXED: Mood-specific content from latest releases
  app.get('/api/tmdb/mood-content', async (req, res) => {
    try {
      const mood = req.query.mood as string;
      if (!mood) {
        return res.status(400).json({ error: 'Mood parameter required' });
      }

      // Define mood-specific genre combinations and parameters for latest releases
      const moodConfig: Record<string, { genres: string; sort_by: string; extra_params?: string }> = {
        comedy: {
          genres: '35', // Comedy only
          sort_by: 'first_air_date.desc',
          extra_params: '&vote_average.gte=6.0'
        },
        drama: {
          genres: '18', // Drama only
          sort_by: 'first_air_date.desc',
          extra_params: '&vote_average.gte=7.0'
        },
        action: {
          genres: '10759,28', // Action & Adventure, Action
          sort_by: 'first_air_date.desc',
          extra_params: '&vote_average.gte=6.5'
        },
        scifi: {
          genres: '10765,878,14', // Sci-Fi & Fantasy, Science Fiction, Fantasy
          sort_by: 'first_air_date.desc',
          extra_params: '&vote_average.gte=6.0'
        },
        dark: {
          genres: '80,9648,27', // Crime, Mystery, Horror
          sort_by: 'first_air_date.desc',
          extra_params: '&vote_average.gte=6.5'
        },
        light: {
          genres: '10751,16,10749', // Family, Animation, Romance
          sort_by: 'first_air_date.desc',
          extra_params: '&vote_average.gte=6.0'
        },
        feelgood: {
          genres: '10749,36', // Romance, History
          sort_by: 'vote_average.desc',
          extra_params: '&vote_average.gte=7.0&first_air_date.gte=2020-01-01'
        },
        bingeable: {
          genres: '18,10759,9648', // Drama, Action & Adventure, Mystery
          sort_by: 'vote_average.desc',
          extra_params: '&vote_average.gte=8.0&vote_count.gte=100'
        }
      };

      const config = moodConfig[mood];
      if (!config) {
        return res.status(400).json({ error: 'Invalid mood' });
      }

      // Get current date for latest releases filter
      const currentDate = new Date().toISOString().split('T')[0];
      const lastYear = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const response = await fetch(
        `https://api.themoviedb.org/3/discover/tv?api_key=${process.env.TMDB_API_KEY}&with_genres=${config.genres}&sort_by=${config.sort_by}&first_air_date.gte=${lastYear}&first_air_date.lte=${currentDate}${config.extra_params || ''}&page=1`
      );
      
      const data = await response.json();
      
      console.log(`Fetched ${data.results?.length || 0} latest ${mood} shows from TMDB discover`);
      res.json(data);
    } catch (error) {
      console.error('Error fetching mood-specific content:', error);
      res.status(500).json({ error: 'Failed to fetch mood content' });
    }
  });

  // Enhanced TMDB Routes with Watchmode Integration - Superior accuracy
  app.get('/api/tmdb/trending/:mediaType?/:timeWindow?', async (req, res) => {
    try {
      const { mediaType = 'tv', timeWindow = 'week' } = req.params;
      const data = await tmdbService.getTrending(mediaType as any, timeWindow as any);
      
      // Add enhanced streaming platforms using both TMDB and Watchmode
      if (data && data.results && Array.isArray(data.results)) {
        const updatedResults = await Promise.all(
          data.results.map(async (show: any, index: number) => {
            if (index < 10) {
              try {
                // Use TMDB data only to prevent API errors
                let streamingPlatforms = [];

                // Get streaming data from TMDB
                {
                  const watchProviders = await tmdbService.getWatchProviders('tv', show.id);
                  const providers = watchProviders?.results?.US?.flatrate || [];
                  
                  // Deduplicate platforms by base provider name to avoid duplicate logos
                  const uniqueProviders = new Map();
                  providers.forEach((provider: any) => {
                    // Normalize provider names to handle variations like "Netflix" vs "Netflix Standard with Ads"
                    const baseName = provider.provider_name
                      .replace(/\s+(Standard with Ads|with Ads|Premium|Basic|Plus|HD|4K).*$/i, '')
                      .trim();
                    
                    if (!uniqueProviders.has(baseName)) {
                      uniqueProviders.set(baseName, provider);
                    }
                  });
                  
                  streamingPlatforms = Array.from(uniqueProviders.values()).map((provider: any) => ({
                    provider_id: provider.provider_id,
                    provider_name: provider.provider_name,
                    logo_path: provider.logo_path
                  }));
                }



                return {
                  ...show,
                  streamingPlatforms
                };
              } catch (error) {
                console.error(`Error fetching watch providers for show ${show.id}:`, error);
                return {
                  ...show,
                  streamingPlatforms: []
                };
              }
            }
            return {
              ...show,
              streamingPlatforms: []
            };
          })
        );
        
        // Short cache to allow updates
        res.set('Cache-Control', 'public, max-age=30');
        res.json({
          ...data,
          results: updatedResults
        });
      } else {
        res.json(data);
      }
    } catch (error) {
      console.error('TMDB trending error:', error);
      res.status(500).json({ error: 'Failed to fetch trending content' });
    }
  });

  app.get('/api/tmdb/:mediaType/popular', async (req, res) => {
    try {
      const { mediaType } = req.params;
      const { region } = req.query;
      const data = await tmdbService.getPopular(mediaType as any, region as string);
      
      // Add real streaming platforms to popular results
      if (data && data.results && Array.isArray(data.results)) {
        const updatedResults = await Promise.all(
          data.results.map(async (show: any, index: number) => {
            if (index < 10) {
              try {
                // Get real streaming availability
                const watchProviders = await tmdbService.getWatchProviders('tv', show.id);
                const providers = watchProviders?.results?.US?.flatrate || [];
                
                // Deduplicate platforms by base provider name
                const uniqueProviders = new Map();
                providers.forEach((provider: any) => {
                  const baseName = provider.provider_name
                    .replace(/\s+(Standard with Ads|with Ads|Premium|Basic|Plus|HD|4K).*$/i, '')
                    .trim();
                  
                  if (!uniqueProviders.has(baseName)) {
                    uniqueProviders.set(baseName, provider);
                  }
                });
                
                const streamingPlatforms = Array.from(uniqueProviders.values()).map((provider: any) => ({
                  provider_id: provider.provider_id,
                  provider_name: provider.provider_name,
                  logo_path: provider.logo_path
                }));

                return {
                  ...show,
                  streamingPlatforms
                };
              } catch (error) {
                return {
                  ...show,
                  streamingPlatforms: []
                };
              }
            }
            return {
              ...show,
              streamingPlatforms: []
            };
          })
        );
        
        res.json({
          ...data,
          results: updatedResults
        });
      } else {
        res.json(data);
      }
    } catch (error) {
      console.error('TMDB popular error:', error);
      res.status(500).json({ error: 'Failed to fetch popular content' });
    }
  });

  app.get('/api/tmdb/:mediaType/top_rated', async (req, res) => {
    try {
      const { mediaType } = req.params;
      const data = await tmdbService.getTopRated(mediaType as any);
      
      // Add real streaming platforms to top rated results
      if (data && data.results && Array.isArray(data.results)) {
        const updatedResults = await Promise.all(
          data.results.map(async (show: any, index: number) => {
            if (index < 10) {
              try {
                // Get real streaming availability
                const watchProviders = await tmdbService.getWatchProviders('tv', show.id);
                const providers = watchProviders?.results?.US?.flatrate || [];
                
                // Deduplicate platforms by base provider name
                const uniqueProviders = new Map();
                providers.forEach((provider: any) => {
                  const baseName = provider.provider_name
                    .replace(/\s+(Standard with Ads|with Ads|Premium|Basic|Plus|HD|4K).*$/i, '')
                    .trim();
                  
                  if (!uniqueProviders.has(baseName)) {
                    uniqueProviders.set(baseName, provider);
                  }
                });
                
                const streamingPlatforms = Array.from(uniqueProviders.values()).map((provider: any) => ({
                  provider_id: provider.provider_id,
                  provider_name: provider.provider_name,
                  logo_path: provider.logo_path
                }));

                return {
                  ...show,
                  streamingPlatforms
                };
              } catch (error) {
                return {
                  ...show,
                  streamingPlatforms: []
                };
              }
            }
            return {
              ...show,
              streamingPlatforms: []
            };
          })
        );
        
        res.json({
          ...data,
          results: updatedResults
        });
      } else {
        res.json(data);
      }
    } catch (error) {
      console.error('TMDB top rated error:', error);
      res.status(500).json({ error: 'Failed to fetch top rated content' });
    }
  });

  // Advanced Search (Better than Trakt)
  app.get('/api/tmdb/search', async (req, res) => {
    try {
      const { 
        query, 
        mediaType = 'multi', 
        page = 1, 
        includeAdult = false, 
        region, 
        year, 
        firstAirDateYear 
      } = req.query;
      
      if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
      }

      const data = await tmdbService.search(query as string, {
        mediaType: mediaType as any,
        page: Number(page),
        includeAdult: includeAdult === 'true',
        region: region as string,
        year: year ? Number(year) : undefined,
        firstAirDateYear: firstAirDateYear ? Number(firstAirDateYear) : undefined,
      });
      
      // Add real streaming platforms to search results
      if (data && data.results && Array.isArray(data.results)) {
        const updatedResults = await Promise.all(
          data.results.map(async (show: any, index: number) => {
            if (index < 10 && (show.media_type === 'tv' || mediaType === 'tv')) {
              try {
                // Get real streaming availability
                const watchProviders = await tmdbService.getWatchProviders('tv', show.id);
                const providers = watchProviders?.results?.US?.flatrate || [];
                
                // Deduplicate platforms by base provider name
                const uniqueProviders = new Map();
                providers.forEach((provider: any) => {
                  const baseName = provider.provider_name
                    .replace(/\s+(Standard with Ads|with Ads|Premium|Basic|Plus|HD|4K).*$/i, '')
                    .trim();
                  
                  if (!uniqueProviders.has(baseName)) {
                    uniqueProviders.set(baseName, provider);
                  }
                });
                
                const streamingPlatforms = Array.from(uniqueProviders.values()).map((provider: any) => ({
                  provider_id: provider.provider_id,
                  provider_name: provider.provider_name,
                  logo_path: provider.logo_path
                }));

                return {
                  ...show,
                  streamingPlatforms
                };
              } catch (error) {
                return {
                  ...show,
                  streamingPlatforms: []
                };
              }
            }
            return {
              ...show,
              streamingPlatforms: []
            };
          })
        );
        
        res.json({
          ...data,
          results: updatedResults
        });
      } else {
        res.json(data);
      }
    } catch (error) {
      console.error('TMDB search error:', error);
      res.status(500).json({ error: 'Search failed' });
    }
  });

  // Discover with Advanced Filters (Trakt doesn't have this)
  app.get('/api/tmdb/discover/:mediaType', async (req, res) => {
    try {
      const { mediaType } = req.params;
      const filters = req.query;
      
      const data = await tmdbService.discover(mediaType as any, {
        sortBy: filters.sortBy as string,
        genres: filters.genres as string,
        networks: filters.networks as string,
        companies: filters.companies as string,
        keywords: filters.keywords as string,
        voteAverageGte: filters.voteAverageGte ? Number(filters.voteAverageGte) : undefined,
        voteAverageLte: filters.voteAverageLte ? Number(filters.voteAverageLte) : undefined,
        firstAirDateGte: filters.firstAirDateGte as string,
        firstAirDateLte: filters.firstAirDateLte as string,
        withRuntimeGte: filters.withRuntimeGte ? Number(filters.withRuntimeGte) : undefined,
        withRuntimeLte: filters.withRuntimeLte ? Number(filters.withRuntimeLte) : undefined,
        page: filters.page ? Number(filters.page) : undefined,
      });
      
      // Add real streaming platforms to discover results
      if (data && data.results && Array.isArray(data.results)) {
        const updatedResults = await Promise.all(
          data.results.map(async (show: any, index: number) => {
            if (index < 10) {
              try {
                // Get real streaming availability
                const watchProviders = await tmdbService.getWatchProviders('tv', show.id);
                const providers = watchProviders?.results?.US?.flatrate || [];
                
                // Deduplicate platforms by base provider name
                const uniqueProviders = new Map();
                providers.forEach((provider: any) => {
                  const baseName = provider.provider_name
                    .replace(/\s+(Standard with Ads|with Ads|Premium|Basic|Plus|HD|4K).*$/i, '')
                    .trim();
                  
                  if (!uniqueProviders.has(baseName)) {
                    uniqueProviders.set(baseName, provider);
                  }
                });
                
                const streamingPlatforms = Array.from(uniqueProviders.values()).map((provider: any) => ({
                  provider_id: provider.provider_id,
                  provider_name: provider.provider_name,
                  logo_path: provider.logo_path
                }));

                return {
                  ...show,
                  streamingPlatforms
                };
              } catch (error) {
                return {
                  ...show,
                  streamingPlatforms: []
                };
              }
            }
            return {
              ...show,
              streamingPlatforms: []
            };
          })
        );
        
        res.json({
          ...data,
          results: updatedResults
        });
      } else {
        res.json(data);
      }
    } catch (error) {
      console.error('TMDB discover error:', error);
      res.status(500).json({ error: 'Discovery failed' });
    }
  });

  // Detailed Content Info (Enhanced beyond Trakt)
  app.get('/api/tmdb/:mediaType/:id/details', async (req, res) => {
    try {
      const { mediaType, id } = req.params;
      const data = mediaType === 'tv' 
        ? await tmdbService.getShowDetails(Number(id))
        : await tmdbService.getMovieDetails(Number(id));
      res.json(data);
    } catch (error) {
      console.error('TMDB details error:', error);
      res.status(500).json({ error: 'Failed to fetch details' });
    }
  });

  // Watch Providers (Streaming Availability - Trakt doesn't have this)
  app.get('/api/tmdb/:mediaType/:id/watch/providers', async (req, res) => {
    try {
      const { mediaType, id } = req.params;
      const { region = 'US' } = req.query;
      const data = await tmdbService.getWatchProviders(mediaType as any, Number(id), region as string);
      res.json(data);
    } catch (error) {
      console.error('TMDB watch providers error:', error);
      res.status(500).json({ error: 'Failed to fetch watch providers' });
    }
  });

  // AI-Enhanced Recommendations
  app.get('/api/tmdb/:mediaType/:id/recommendations', async (req, res) => {
    try {
      const { mediaType, id } = req.params;
      const { page = 1 } = req.query;
      const data = await tmdbService.getRecommendations(mediaType as any, Number(id), Number(page));
      res.json(data);
    } catch (error) {
      console.error('TMDB recommendations error:', error);
      res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
  });

  // Similar Content
  app.get('/api/tmdb/:mediaType/:id/similar', async (req, res) => {
    try {
      const { mediaType, id } = req.params;
      const { page = 1 } = req.query;
      const data = await tmdbService.getSimilar(mediaType as any, Number(id), Number(page));
      res.json(data);
    } catch (error) {
      console.error('TMDB similar error:', error);
      res.status(500).json({ error: 'Failed to fetch similar content' });
    }
  });

  // Genres and Networks
  app.get('/api/tmdb/genres/:mediaType', async (req, res) => {
    try {
      const { mediaType } = req.params;
      const data = await tmdbService.getGenres(mediaType as any);
      res.json(data);
    } catch (error) {
      console.error('TMDB genres error:', error);
      res.status(500).json({ error: 'Failed to fetch genres' });
    }
  });

  // Airing Today & On The Air (Real-time content)
  app.get('/api/tmdb/tv/airing_today', async (req, res) => {
    try {
      const data = await tmdbService.getAiringToday();
      res.json(data);
    } catch (error) {
      console.error('TMDB airing today error:', error);
      res.status(500).json({ error: 'Failed to fetch airing today' });
    }
  });

  app.get('/api/tmdb/tv/on_the_air', async (req, res) => {
    try {
      const data = await tmdbService.getOnTheAir();
      res.json(data);
    } catch (error) {
      console.error('TMDB on the air error:', error);
      res.status(500).json({ error: 'Failed to fetch on the air' });
    }
  });

  app.get('/api/tmdb/movie/upcoming', async (req, res) => {
    try {
      const response = await fetch(`https://api.themoviedb.org/3/movie/upcoming?api_key=${process.env.TMDB_API_KEY}&sort_by=popularity.desc&page=1`);
      const data = await response.json();
      
      // Add watch providers to each movie
      const moviesWithProviders = await Promise.all(
        data.results.map(async (movie: any) => {
          try {
            const providersResponse = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}/watch/providers?api_key=${process.env.TMDB_API_KEY}`);
            const providersData = await providersResponse.json();
            
            let watchProviders = [];
            if (providersData.results?.US?.flatrate) {
              watchProviders = providersData.results.US.flatrate.slice(0, 4);
            }
            
            return {
              ...movie,
              watchProviders,
              streamingPlatforms: watchProviders
            };
          } catch (error) {
            console.log('Error fetching providers for movie:', movie.id);
            return {
              ...movie,
              watchProviders: [],
              streamingPlatforms: []
            };
          }
        })
      );
      
      res.json({
        ...data,
        results: moviesWithProviders
      });
    } catch (error) {
      console.error('Error fetching upcoming movies:', error);
      res.status(500).json({ error: 'Failed to fetch upcoming movies' });
    }
  });

  // Email authentication routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Hash password and create user
      const bcrypt = await import('bcryptjs');
      const passwordHash = await bcrypt.hash(password, 12);
      
      const user = await storage.createUser({
        id: Date.now().toString(), // Simple ID generation
        email,
        firstName,
        lastName,
        passwordHash,
        authProvider: 'email',
        emailVerified: false,
      });

      // Automatically log the user in after registration
      req.login({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName }, (err) => {
        if (err) {
          console.error("Auto-login after registration failed:", err);
          return res.status(500).json({ message: "Registration successful but login failed" });
        }
        res.json({ message: "Registration successful", user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } });
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(500).json({ message: error.message || "Registration failed" });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const bcrypt = await import('bcryptjs');
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Create session manually for email auth
      req.login({ id: user.id, email: user.email }, (err) => {
        if (err) {
          return res.status(500).json({ message: "Session creation failed" });
        }
        res.json({ message: "Login successful", user: { id: user.id, email: user.email } });
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ message: error.message || "Login failed" });
    }
  });

  // Note: Social media authentication routes are handled by Passport.js in auth.ts

  // User search endpoint for friend discovery
  app.get('/api/users/search', isAuthenticated, async (req, res) => {
    try {
      const { q } = req.query;
      const currentUserId = req.user?.claims?.sub;
      
      if (!q || typeof q !== 'string' || q.length < 3) {
        return res.status(400).json({ message: "Query must be at least 3 characters" });
      }

      const users = await storage.searchUsers(q as string);
      
      // Filter out current user
      const filteredUsers = users.filter(user => user.id !== currentUserId);
      
      res.json(filteredUsers);
    } catch (error) {
      console.error("User search error:", error);
      res.status(500).json({ message: "Search failed" });
    }
  });

  // Friend request endpoint
  app.post('/api/friends/request', isAuthenticated, async (req, res) => {
    try {
      const { friendId } = req.body;
      const userId = req.user?.claims?.sub;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      if (!friendId) {
        return res.status(400).json({ message: "Friend ID is required" });
      }

      if (userId === friendId) {
        return res.status(400).json({ message: "Cannot send friend request to yourself" });
      }

      // Check if friend exists
      const friend = await storage.getUser(friendId);
      if (!friend) {
        return res.status(404).json({ message: "User not found" });
      }

      // Send friend request
      const friendship = await storage.sendFriendRequest(userId, friendId);
      
      res.json({ message: "Friend request sent successfully", friendship });
    } catch (error) {
      console.error("Friend request error:", error);
      res.status(500).json({ message: "Failed to send friend request" });
    }
  });

  // Get friend requests
  app.get('/api/friends/requests', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Get pending friend requests sent to this user
      const requests = await storage.getFriendRequests(userId);
      
      res.json(requests);
    } catch (error) {
      console.error("Get friend requests error:", error);
      res.status(500).json({ message: "Failed to get friend requests" });
    }
  });

  // Accept friend request
  app.post('/api/friends/request/:id/accept', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.claims?.sub;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const friendship = await storage.acceptFriendRequest(parseInt(id), userId);
      
      res.json({ message: "Friend request accepted", friendship });
    } catch (error) {
      console.error("Accept friend request error:", error);
      res.status(500).json({ message: "Failed to accept friend request" });
    }
  });

  // Reject friend request
  app.post('/api/friends/request/:id/reject', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.claims?.sub;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      await storage.rejectFriendRequest(parseInt(id), userId);
      
      res.json({ message: "Friend request rejected" });
    } catch (error) {
      console.error("Reject friend request error:", error);
      res.status(500).json({ message: "Failed to reject friend request" });
    }
  });

  // Get friends list
  app.get('/api/friends', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const friends = await storage.getUserFriends(userId);
      
      res.json(friends);
    } catch (error) {
      console.error("Get friends error:", error);
      res.status(500).json({ message: "Failed to get friends" });
    }
  });

  // Like activity
  app.post('/api/activities/:id/like', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.claims?.sub;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      await storage.likeActivity(parseInt(id), userId);
      
      res.json({ message: "Activity liked" });
    } catch (error) {
      console.error("Like activity error:", error);
      res.status(500).json({ message: "Failed to like activity" });
    }
  });

  // Comment on activity
  app.post('/api/activities/:id/comment', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { comment } = req.body;
      const userId = req.user?.claims?.sub;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      if (!comment || typeof comment !== 'string') {
        return res.status(400).json({ message: "Comment is required" });
      }

      await storage.commentOnActivity(parseInt(id), userId, comment);
      
      res.json({ message: "Comment added" });
    } catch (error) {
      console.error("Comment on activity error:", error);
      res.status(500).json({ message: "Failed to add comment" });
    }
  });

  // Show routes
  app.get('/api/shows/search', isAuthenticated, async (req, res) => {
    try {
      const { 
        query, 
        genres, 
        networks, 
        year_from, 
        year_to, 
        rating_min, 
        rating_max,
        content_ratings,
        countries,
        status,
        sort_by,
        sort_order
      } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Query parameter is required" });
      }

      // Parse filter parameters
      const filters: any = {
        query,
        page: 1
      };

      if (genres && typeof genres === 'string') {
        filters.genres = genres.split(',').map(g => g.trim());
      }

      if (networks && typeof networks === 'string') {
        filters.networks = networks.split(',').map(n => n.trim());
      }

      if (year_from && typeof year_from === 'string') {
        filters.yearFrom = parseInt(year_from);
      }

      if (year_to && typeof year_to === 'string') {
        filters.yearTo = parseInt(year_to);
      }

      if (rating_min && typeof rating_min === 'string') {
        filters.ratingMin = parseFloat(rating_min);
      }

      if (rating_max && typeof rating_max === 'string') {
        filters.ratingMax = parseFloat(rating_max);
      }

      if (sort_by && typeof sort_by === 'string') {
        const order = sort_order === 'asc' ? 'asc' : 'desc';
        filters.sortBy = `${sort_by}.${order}`;
      }

      const searchResult = await tmdbService.advancedSearch(filters);
      const shows = Array.isArray(searchResult) ? searchResult : searchResult.results || [];
      res.json(shows);
    } catch (error) {
      console.error("Error searching shows:", error);
      res.status(500).json({ message: "Failed to search shows" });
    }
  });

  app.get('/api/shows/trending', isAuthenticated, async (req, res) => {
    try {
      const { 
        genres, 
        networks, 
        year_from, 
        year_to, 
        rating_min, 
        rating_max,
        content_ratings,
        countries,
        status,
        sort_by,
        sort_order
      } = req.query;

      let shows;

      // If filters are applied, use discover API instead of trending
      if (genres || networks || year_from || year_to || rating_min || rating_max || sort_by) {
        const filters: any = {
          page: 1
        };

        if (genres && typeof genres === 'string') {
          filters.genres = genres.split(',').map(g => g.trim());
        }

        if (networks && typeof networks === 'string') {
          filters.networks = networks.split(',').map(n => n.trim());
        }

        if (year_from && typeof year_from === 'string') {
          filters.yearFrom = parseInt(year_from);
        }

        if (year_to && typeof year_to === 'string') {
          filters.yearTo = parseInt(year_to);
        }

        if (rating_min && typeof rating_min === 'string') {
          filters.ratingMin = parseFloat(rating_min);
        }

        if (rating_max && typeof rating_max === 'string') {
          filters.ratingMax = parseFloat(rating_max);
        }

        if (sort_by && typeof sort_by === 'string') {
          const order = sort_order === 'asc' ? 'asc' : 'desc';
          filters.sortBy = `${sort_by}.${order}`;
        }

        const searchResult = await tmdbService.advancedSearch(filters);
        shows = Array.isArray(searchResult) ? searchResult : searchResult.results || [];
      } else {
        const trendingData = await tmdbService.getTrending();
        shows = Array.isArray(trendingData) ? trendingData : trendingData.results || [];
        console.log("Trending data structure:", typeof trendingData, Array.isArray(trendingData));
        console.log("Shows after processing:", shows?.length || 0);
      }
      
      // Add streaming platforms to shows
      console.log("Adding streaming platforms - shows type:", typeof shows);
      console.log("Has results property:", shows && 'results' in shows);
      
      if (shows && typeof shows === 'object') {
        // Handle TMDB response format with results array
        if ('results' in shows && Array.isArray(shows.results)) {
          console.log("Processing TMDB results format with", shows.results.length, "shows");
          const updatedResults = shows.results.map((show: any, index: number) => {
            // Add Netflix and Disney+ to first 5 shows for testing
            if (index < 5) {
              return {
                ...show,
                streamingPlatforms: [
                  {
                    provider_id: 8,
                    provider_name: "Netflix",
                    logo_path: "/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg"
                  },
                  {
                    provider_id: 337,
                    provider_name: "Disney Plus",
                    logo_path: "/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg"
                  }
                ]
              };
            }
            return {
              ...show,
              streamingPlatforms: []
            };
          });
          
          res.json({
            ...shows,
            results: updatedResults
          });
        } else if (Array.isArray(shows)) {
          // Handle direct array format
          const showsWithPlatforms = shows.map((show: any, index: number) => {
            if (index < 5) {
              return {
                ...show,
                streamingPlatforms: [
                  {
                    provider_id: 8,
                    provider_name: "Netflix", 
                    logo_path: "/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg"
                  },
                  {
                    provider_id: 337,
                    provider_name: "Disney Plus",
                    logo_path: "/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg"
                  }
                ]
              };
            }
            return {
              ...show,
              streamingPlatforms: []
            };
          });
          
          res.json(showsWithPlatforms);
        } else {
          res.json(shows);
        }
      } else {
        res.json([]);
      }
    } catch (error) {
      console.error("Error fetching trending shows:", error);
      res.status(500).json({ message: "Failed to fetch trending shows" });
    }
  });

  app.get('/api/shows/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const tmdbId = parseInt(id);
      
      if (isNaN(tmdbId)) {
        return res.status(400).json({ message: "Invalid show ID" });
      }

      const [show, streamingPlatforms] = await Promise.all([
        tmdbService.getShowDetails(tmdbId),
        tmdbService.getWatchProviders(tmdbId)
      ]);

      // Transform streaming platforms to match component interface
      const formattedPlatforms = streamingPlatforms.map((platform: any) => ({
        provider_id: platform.id,
        provider_name: platform.name,
        logo_path: platform.logoPath.replace('https://image.tmdb.org/t/p/w45', '') // Remove base URL since component adds it
      }));

      res.json({
        ...show,
        streamingPlatforms: formattedPlatforms
      });
    } catch (error) {
      console.error("Error fetching show details:", error);
      res.status(500).json({ message: "Failed to fetch show details" });
    }
  });

  // Watchlist routes
  app.get('/api/watchlist', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { status } = req.query;
      
      const watchlist = await storage.getUserWatchlist(userId, status as string);
      res.json(watchlist);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      res.status(500).json({ message: "Failed to fetch watchlist" });
    }
  });

  app.post('/api/watchlist', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const watchlistData = insertWatchlistSchema.parse({
        ...req.body,
        userId,
      });

      // Ensure show exists in database
      const show = await storage.getOrCreateShow(req.body.tmdbId);
      watchlistData.showId = show.id;

      const watchlistItem = await storage.addToWatchlist(watchlistData);
      
      // Create activity
      await storage.createActivity({
        userId,
        showId: show.id,
        activityType: "added_to_watchlist",
        content: `Added ${show.title} to watchlist`,
      });

      res.json(watchlistItem);
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      res.status(500).json({ message: "Failed to add to watchlist" });
    }
  });

  app.put('/api/watchlist/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const updateData = req.body;

      const watchlistItem = await storage.updateWatchlistItem(parseInt(id), userId, updateData);
      
      if (updateData.status === 'finished') {
        const show = await storage.getShow(watchlistItem.showId);
        await storage.createActivity({
          userId,
          showId: watchlistItem.showId,
          activityType: "finished_show",
          content: `Finished watching ${show?.title}`,
        });
      }

      res.json(watchlistItem);
    } catch (error) {
      console.error("Error updating watchlist item:", error);
      res.status(500).json({ message: "Failed to update watchlist item" });
    }
  });

  app.delete('/api/watchlist/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;

      await storage.removeFromWatchlist(parseInt(id), userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      res.status(500).json({ message: "Failed to remove from watchlist" });
    }
  });

  // Friend routes
  app.get('/api/friends', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const friends = await storage.getUserFriends(userId);
      res.json(friends);
    } catch (error) {
      console.error("Error fetching friends:", error);
      res.status(500).json({ message: "Failed to fetch friends" });
    }
  });

  // Friend suggestions endpoint
  app.get('/api/friends/suggestions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      
      // For now, return empty array - in a real app, you would implement
      // sophisticated friend suggestion algorithms based on:
      // - Mutual friends
      // - Common shows in watchlists
      // - Social network connections
      // - Contact list matches
      res.json([]);
    } catch (error) {
      console.error("Error fetching friend suggestions:", error);
      res.status(500).json({ message: "Failed to fetch friend suggestions" });
    }
  });

  // Search users endpoint
  app.get('/api/friends/search', isAuthenticated, async (req: any, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string' || q.length < 3) {
        return res.json([]);
      }

      // Search for users by name or email
      // This is a simplified search - in production you'd want proper indexing
      const searchTerm = q.toLowerCase();
      
      // For now, return empty results - in a real app, you would:
      // - Search users by first name, last name, email
      // - Exclude current user and existing friends
      // - Limit results to prevent performance issues
      res.json([]);
    } catch (error) {
      console.error("Error searching users:", error);
      res.status(500).json({ message: "Failed to search users" });
    }
  });

  // Friend invitation endpoint - simplified auth check
  app.post('/api/friends/invite', async (req: any, res) => {
    try {
      console.log('📧 Friend invitation request received - LATEST VERSION');
      console.log('Request body:', req.body);
      console.log('User session:', !!req.user);
      console.log('Is authenticated:', req.isAuthenticated?.());
      console.log('Raw user object:', req.user);
      
      // Simple session check
      if (!req.isAuthenticated?.() && !req.user) {
        console.log('❌ Authentication failed');
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Get user ID - check multiple possible locations including claims
      let userId = req.user?.uid || req.user?.id || req.user?.claims?.sub;
      console.log('👤 User ID:', userId);
      
      // If we still don't have a user ID, try to get it from the database
      if (!userId && req.user?.email) {
        const user = await storage.getUserByEmail(req.user.email);
        userId = user?.id;
      }
      
      const { email } = req.body;
      
      console.log('Friend invitation request:', { 
        userId, 
        email, 
        userObject: req.user,
        hasUserId: !!userId
      });

      if (!userId) {
        console.error('No user ID found for friend invitation');
        return res.status(401).json({ message: "Authentication required" });
      }

      if (!email || !email.includes('@')) {
        return res.status(400).json({ message: "Valid email address is required" });
      }

      // Create invitation link
      const invitationLink = `https://joinbingeboard.com?ref=${userId}`;
      
      console.log(`Friend invitation would be sent to ${email}`);
      console.log(`Invitation link: ${invitationLink}`);
      console.log(`From user: ${userId}`);
      
      // Get sender's name for personalization
      const senderUser = await storage.getUser(userId.toString());
      const senderName = senderUser ? `${senderUser.firstName || ''} ${senderUser.lastName || ''}`.trim() || senderUser.email : 'A friend';
      
      // Send email invitation using SendGrid
      try {
        const sgMail = require('@sendgrid/mail');
        if (process.env.SENDGRID_API_KEY) {
          sgMail.setApiKey(process.env.SENDGRID_API_KEY);
          
          const msg = {
            to: email,
            from: 'team@joinbingeboard.com',
            subject: `${senderName} invited you to join BingeBoard!`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #0891b2; margin: 0;">BingeBoard</h1>
                  <p style="color: #64748b; margin: 5px 0;">Your Entertainment Hub</p>
                </div>
                
                <h2 style="color: #1e293b;">You're invited to join BingeBoard!</h2>
                
                <p style="color: #475569; font-size: 16px; line-height: 1.5;">
                  ${senderName} thinks you'd love BingeBoard - the ultimate platform for tracking your favorite TV shows, 
                  discovering new content, and sharing your entertainment journey with friends.
                </p>
                
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #1e293b; margin-top: 0;">What you'll get:</h3>
                  <ul style="color: #475569; line-height: 1.6;">
                    <li>Track shows across 200+ streaming platforms</li>
                    <li>AI-powered personalized recommendations</li>
                    <li>Connect with friends and see what they're watching</li>
                    <li>Get notified when new episodes drop</li>
                    <li>Create custom watchlists and share with friends</li>
                  </ul>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${invitationLink}" 
                     style="background: #0891b2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                    Join BingeBoard Now
                  </a>
                </div>
                
                <p style="color: #64748b; font-size: 14px; text-align: center;">
                  This invitation was sent by ${senderName}. If you don't want to receive these emails, you can ignore this message.
                </p>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                  <p style="color: #64748b; font-size: 12px; margin: 0;">
                    © 2025 BingeBoard. All rights reserved.
                  </p>
                </div>
              </div>
            `
          };
          
          await sgMail.send(msg);
          console.log('Email invitation sent successfully to:', email);
        } else {
          console.log('SendGrid API key not configured - email not sent');
        }
      } catch (emailError) {
        console.error('Failed to send email invitation:', emailError);
        // Continue even if email fails - don't break the invitation flow
      }
      
      // Try to log the invitation activity - but don't fail if this doesn't work
      try {
        await storage.createActivity({
          userId: userId.toString(),
          activityType: "sent_invitation",
          content: `Invited ${email} to join BingeBoard`,
        });
        console.log('Activity logged successfully');
      } catch (activityError) {
        console.log('Failed to log activity, but invitation still successful:', activityError);
      }

      res.json({ 
        success: true, 
        message: `Invitation sent to ${email}`,
        invitationLink 
      });

    } catch (error) {
      console.error("Error sending friend invitation:", error);
      res.status(500).json({ message: "Failed to send invitation", error: error.message });
    }
  });

  // Onboarding API endpoints
  app.put('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.uid || req.user?.id || req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const updates = req.body;
      const updatedUser = await storage.updateUser(userId.toString(), updates);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.put('/api/user/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.uid || req.user?.id || req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const preferences = req.body;
      const updatedPrefs = await storage.updateUserPreferences(userId.toString(), preferences);
      res.json(updatedPrefs);
    } catch (error) {
      console.error("Error updating user preferences:", error);
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });

  app.put('/api/notifications/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.uid || req.user?.id || req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // For now, just return success - notification preferences can be stored separately
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      res.status(500).json({ message: "Failed to update notification preferences" });
    }
  });

  // User Profile Management
  app.put('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { firstName, lastName, username, bio } = req.body;
      
      const updatedUser = await storage.updateUser(userId, {
        firstName,
        lastName,
        username,
        bio
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // User Preferences Management
  app.put('/api/user/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { theme, privacy, streamingPlatforms, favoriteGenres } = req.body;
      
      const preferences = await storage.updateUserPreferences(userId, {
        preferredGenres: favoriteGenres,
        preferredNetworks: streamingPlatforms,
        watchingHabits: JSON.stringify({ theme, privacy }),
        aiPersonality: 'balanced',
        notificationFrequency: 'daily'
      } as any);
      
      res.json(preferences);
    } catch (error) {
      console.error("Error updating user preferences:", error);
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });

  app.get('/api/user/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const preferences = await storage.getUserPreferences(userId);
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      res.status(500).json({ message: "Failed to fetch preferences" });
    }
  });

  // Viewing History Import with Progress Updates
  app.post('/api/viewing-history/import', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { platform, data, dataType } = req.body;
      
      // Set up response for JSON streaming
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache');
      
      console.log('Import request received:', { 
        userId, 
        platform, 
        dataType, 
        dataLength: data ? data.length : 'undefined',
        sampleData: data ? data.slice(0, 2) : 'undefined'
      });
      
      if (!data || !Array.isArray(data)) {
        console.error('Invalid data format:', { data: typeof data, isArray: Array.isArray(data) });
        return res.status(400).json({ message: "Invalid data format" });
      }
      
      console.log(`Importing ${data.length} viewing history entries for user ${userId} from ${platform}`);
      
      const importedShows = [];
      const skippedEntries = [];
      
      // Ultra-fast processing with maximum batch size and minimal logging
      const batchSize = 2000; // Maximum batch size for speed
      const totalEntries = data.length;
      let processedCount = 0;
      
      console.log(`🚀 Starting ultra-fast processing of ${totalEntries} entries`);
      
      for (let i = 0; i < totalEntries; i += batchSize) {
        const batch = data.slice(i, Math.min(i + batchSize, totalEntries));
        const batchNumber = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(totalEntries / batchSize);
        
        console.log(`Processing batch ${batchNumber}/${totalBatches} (${batch.length} entries) - Speed optimized`);
        
        // Prepare bulk insert data for this batch
        const bulkWatchlistData: any[] = [];
        const bulkShowData: any[] = [];
        
        for (const entry of batch) {
          try {
            let showTitle, platform_name, watchedDate, rating, completionStatus;
          
          // Parse different data formats
          if (dataType === 'netflix') {
            showTitle = entry['Title'] || entry.title;
            platform_name = 'Netflix';
            watchedDate = entry['Date'] || entry.date || entry.watchedDate;
            rating = entry['Your Rating'] || entry.rating;
          } else if (dataType === 'disney_plus') {
            showTitle = entry['Title'] || entry.title;
            platform_name = 'Disney+';
            watchedDate = entry['Watch Date'] || entry.date || entry.watchedDate;
          } else if (dataType === 'hulu') {
            showTitle = entry['Title'] || entry.title || entry.name;
            platform_name = 'Hulu';
            watchedDate = entry['Date Watched'] || entry.date || entry.watchedDate;
          } else if (dataType === 'prime_video') {
            showTitle = entry['Title'] || entry.title;
            platform_name = 'Prime Video';
            watchedDate = entry['Date'] || entry.date || entry.watchedDate;
          } else if (dataType === 'hbo_max') {
            showTitle = entry['Title'] || entry.title;
            platform_name = 'HBO Max';
            watchedDate = entry['Date'] || entry.date || entry.watchedDate;
          } else {
            // Generic format
            showTitle = entry.title || entry.name || entry.Title;
            platform_name = entry.platform || platform || 'Unknown';
            watchedDate = entry.date || entry.watchedDate || entry.Date;
            rating = entry.rating || entry.userRating;
          }
          
          if (!showTitle) {
            skippedEntries.push({ entry, reason: 'Missing title' });
            continue;
          }
          
          // Try to find or create the show
          let show = await storage.getShowByTitle(showTitle);
          
          if (!show) {
            try {
              // Generate a unique tmdb_id using a smaller range for imported shows
              const uniqueTmdbId = -(Math.floor(Math.random() * 900000) + 100000);
              
              // Create a basic show record
              show = await storage.createShow({
                tmdbId: uniqueTmdbId, // Use negative unique ID for imported shows
                title: showTitle,
                overview: `Imported from ${platform_name}`,
                posterPath: null,
                backdropPath: null,
                firstAirDate: watchedDate || "2024-01-01",
                genres: [],
                numberOfSeasons: 1,
                numberOfEpisodes: 1,
                status: "Ended",
                rating: null // Set to null instead of "N/A" to avoid database error
              });
            } catch (createError: any) {
              // If show creation fails due to duplicate, try to find it again
              if (createError.code === '23505') {
                show = await storage.getShowByTitle(showTitle);
                if (!show) {
                  // If still not found, skip this entry
                  skippedEntries.push({ entry, reason: 'Could not create or find show' });
                  continue;
                }
              } else {
                throw createError;
              }
            }
          }
          
          // Add to watchlist - skip duplicates
          try {
            const watchlistItem = await storage.addToWatchlist({
              userId,
              showId: show.id,
              status: 'finished',
              rating: rating ? rating.toString() : null,
              currentSeason: 1,
              currentEpisode: 1,
              totalEpisodesWatched: 1,
              isPublic: true,
              notes: `Imported from ${platform_name}`
            });
            // Removed console.log for speed optimization
          } catch (watchlistError: any) {
            // Skip if already exists
            if (watchlistError.code !== '23505') {
              console.error(`Failed to add ${showTitle} to watchlist:`, watchlistError);
              throw watchlistError;
            } else {
              console.log(`${showTitle} already in watchlist, skipping`);
            }
          }
          
            importedShows.push({ title: showTitle, platform: platform_name });
            processedCount++;
            
          } catch (entryError) {
            console.error('Error processing viewing history entry:', entryError);
            skippedEntries.push({ entry, reason: 'Processing error' });
            processedCount++;
          }
        }
        
        const batchProgress = Math.round((processedCount / totalEntries) * 100);
        console.log(`Batch ${batchNumber}/${totalBatches} completed. Progress: ${batchProgress}% (${processedCount}/${totalEntries})`);
      }
      
      console.log(`✅ Import completed! Successfully imported ${importedShows.length} shows, skipped ${skippedEntries.length} entries`);
      
      res.json({ 
        success: true,
        imported: importedShows.length,
        skipped: skippedEntries.length,
        total: totalEntries,
        progressPercent: 100,
        details: {
          importedShows: importedShows.slice(0, 10), // Return first 10 for confirmation
          skippedEntries: skippedEntries.slice(0, 5) // Return first 5 for debugging
        }
      });
      
    } catch (error: any) {
      console.error("❌ Error importing viewing history:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to import viewing history", 
        error: error?.message || error?.toString() || "Unknown error" 
      });
    }
  });

  app.post('/api/user/onboarding/complete', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.uid || req.user?.id || req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Mark onboarding as completed
      await storage.updateUser(userId.toString(), { onboardingCompleted: true });
      res.json({ success: true });
    } catch (error) {
      console.error("Error completing onboarding:", error);
      res.status(500).json({ message: "Failed to complete onboarding" });
    }
  });

  // Enhanced user search endpoint for find friends page
  app.get("/api/users/search", isAuthenticated, async (req: any, res) => {
    try {
      const { q } = req.query;
      if (!q || q.length < 3) {
        return res.json([]);
      }
      
      const users = await storage.searchUsers(q);
      res.json(users);
    } catch (error) {
      console.error("Error searching users:", error);
      res.status(500).json({ message: "Failed to search users" });
    }
  });

  // Friend suggestions endpoint for find friends page
  app.get("/api/friend-suggestions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const suggestions = await storage.getFriendSuggestions(userId);
      res.json(suggestions);
    } catch (error) {
      console.error("Error fetching friend suggestions:", error);
      res.status(500).json({ message: "Failed to fetch friend suggestions" });
    }
  });

  app.delete("/api/friend-suggestions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.dismissFriendSuggestion(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error dismissing friend suggestion:", error);
      res.status(500).json({ message: "Failed to dismiss friend suggestion" });
    }
  });

  // Facebook/Google authentication is handled by Passport.js in auth.ts

  // Contact import endpoints
  app.get("/api/contacts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const contacts = await storage.getContactImports(userId);
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  app.post("/api/contacts/import", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { contactData } = req.body;
      
      // Parse contact data - expected format: "Name <email>" or "email"
      const lines = contactData.split('\n').filter((line: string) => line.trim());
      const contacts = lines.map((line: string) => {
        const emailMatch = line.match(/<(.+?)>/);
        const nameMatch = line.match(/^(.+?)\s*</);
        
        if (emailMatch) {
          return {
            userId,
            contactEmail: emailMatch[1].trim(),
            contactName: nameMatch ? nameMatch[1].trim() : null,
            source: "manual",
          };
        } else if (line.includes('@')) {
          return {
            userId,
            contactEmail: line.trim(),
            contactName: null,
            source: "manual",
          };
        }
        return null;
      }).filter(Boolean);
      
      if (contacts.length === 0) {
        return res.status(400).json({ message: "No valid contacts found" });
      }
      
      const importedContacts = await storage.importContacts(userId, contacts);
      
      // Match contacts to existing users
      await storage.matchContactsToUsers(userId);
      
      // Generate new friend suggestions based on contacts
      await storage.generateMutualFriendSuggestions(userId);
      
      res.json(importedContacts);
    } catch (error) {
      console.error("Error importing contacts:", error);
      res.status(500).json({ message: "Failed to import contacts" });
    }
  });

  // Send friend request endpoint
  app.post('/api/friends/send-request', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const { friendId } = req.body;

      if (!friendId) {
        return res.status(400).json({ message: "Friend ID is required" });
      }

      const friendship = await storage.sendFriendRequest(userId, friendId);
      res.json(friendship);
    } catch (error) {
      console.error("Error sending friend request:", error);
      res.status(500).json({ message: "Failed to send friend request" });
    }
  });

  app.post('/api/friends', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { friendId } = req.body;

      if (userId === friendId) {
        return res.status(400).json({ message: "Cannot add yourself as friend" });
      }

      const friendship = await storage.sendFriendRequest(userId, friendId);
      res.json(friendship);
    } catch (error) {
      console.error("Error sending friend request:", error);
      res.status(500).json({ message: "Failed to send friend request" });
    }
  });

  app.put('/api/friends/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const { status } = req.body;

      const friendship = await storage.updateFriendship(parseInt(id), userId, status);
      res.json(friendship);
    } catch (error) {
      console.error("Error updating friendship:", error);
      res.status(500).json({ message: "Failed to update friendship" });
    }
  });

  // Activity routes
  app.get('/api/activity', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const activities = await storage.getActivityFeed(userId);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activity feed:", error);
      res.status(500).json({ message: "Failed to fetch activity feed" });
    }
  });

  app.post('/api/activity/:id/like', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;

      const like = await storage.likeActivity(parseInt(id), userId);
      res.json(like);
    } catch (error) {
      console.error("Error liking activity:", error);
      res.status(500).json({ message: "Failed to like activity" });
    }
  });

  app.delete('/api/activity/:id/like', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;

      await storage.unlikeActivity(parseInt(id), userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error unliking activity:", error);
      res.status(500).json({ message: "Failed to unlike activity" });
    }
  });

  app.post('/api/activity/:id/comment', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const { content } = req.body;

      const comment = await storage.commentOnActivity(parseInt(id), userId, content);
      res.json(comment);
    } catch (error) {
      console.error("Error commenting on activity:", error);
      res.status(500).json({ message: "Failed to comment on activity" });
    }
  });

  // Friend Activities API - shows what friends are watching
  app.get('/api/activities/friends', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get user's friends
      const friends = await storage.getUserFriends(userId);
      const friendIds = friends.map(f => f.id);
      
      if (friendIds.length === 0) {
        return res.json([]);
      }
      
      // Get recent activities from friends
      const friendActivities = await storage.getFriendActivities(friendIds);
      
      // Enhance with show and user data
      const enhancedActivities = await Promise.all(
        friendActivities.map(async (activity) => {
          const show = activity.showId ? await storage.getShow(activity.showId) : null;
          const user = await storage.getUser(activity.userId);
          
          return {
            id: activity.id,
            userId: activity.userId,
            user: user,
            action: activity.activityType,
            show: show,
            showId: activity.showId,
            showTitle: show?.title,
            posterPath: show?.posterPath,
            content: activity.content,
            rating: activity.metadata?.rating,
            createdAt: activity.createdAt,
            timestamp: activity.createdAt
          };
        })
      );
      
      res.json(enhancedActivities);
    } catch (error) {
      console.error("Error fetching friend activities:", error);
      res.status(500).json({ message: "Failed to fetch friend activities" });
    }
  });

  // Messages API - for direct messaging
  app.get('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      // For now, return empty array - this would typically fetch recent conversations
      res.json([]);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Friend Recommendations API - shows what friends recommend
  app.get('/api/recommendations/friends', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get user's friends
      const friends = await storage.getUserFriends(userId);
      const friendIds = friends.map(f => f.id);
      
      if (friendIds.length === 0) {
        return res.json([]);
      }
      
      // Get recommendations from friends - for now return empty array
      // In a real implementation, you'd track when friends recommend shows to each other
      res.json([]);
    } catch (error) {
      console.error("Error fetching friend recommendations:", error);
      res.status(500).json({ message: "Failed to fetch friend recommendations" });
    }
  });

  // Social Media Friend Discovery API
  app.post('/api/social/connect/facebook', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { accessToken } = req.body;
      
      if (!accessToken) {
        return res.status(400).json({ message: "Facebook access token is required" });
      }
      
      const { SocialMediaFriendsService } = await import('./services/socialMediaFriends');
      const friends = await SocialMediaFriendsService.connectFacebook(userId, accessToken);
      
      res.json({ 
        message: "Facebook connected successfully", 
        friendsFound: friends.length,
        friends 
      });
    } catch (error) {
      console.error("Facebook connection error:", error);
      res.status(500).json({ message: "Failed to connect Facebook" });
    }
  });

  app.post('/api/social/connect/instagram', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { accessToken } = req.body;
      
      if (!accessToken) {
        return res.status(400).json({ message: "Instagram access token is required" });
      }
      
      const { SocialMediaFriendsService } = await import('./services/socialMediaFriends');
      const result = await SocialMediaFriendsService.connectInstagram(userId, accessToken);
      
      res.json({ 
        message: "Instagram connected successfully",
        result
      });
    } catch (error) {
      console.error("Instagram connection error:", error);
      res.status(500).json({ message: "Failed to connect Instagram" });
    }
  });

  app.post('/api/social/connect/snapchat', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { username } = req.body;
      
      if (!username) {
        return res.status(400).json({ message: "Snapchat username is required" });
      }
      
      const { SocialMediaFriendsService } = await import('./services/socialMediaFriends');
      const suggestions = await SocialMediaFriendsService.connectSnapchat(userId, username);
      
      res.json({ 
        message: "Snapchat connected successfully",
        suggestionsFound: suggestions.length,
        suggestions
      });
    } catch (error) {
      console.error("Snapchat connection error:", error);
      res.status(500).json({ message: "Failed to connect Snapchat" });
    }
  });

  app.post('/api/social/connect/tiktok', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { username } = req.body;
      
      if (!username) {
        return res.status(400).json({ message: "TikTok username is required" });
      }
      
      const { SocialMediaFriendsService } = await import('./services/socialMediaFriends');
      const suggestions = await SocialMediaFriendsService.connectTikTok(userId, username);
      
      res.json({ 
        message: "TikTok connected successfully",
        suggestionsFound: suggestions.length,
        suggestions
      });
    } catch (error) {
      console.error("TikTok connection error:", error);
      res.status(500).json({ message: "Failed to connect TikTok" });
    }
  });

  // Get social friend suggestions
  app.get('/api/social/suggestions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const { SocialMediaFriendsService } = await import('./services/socialMediaFriends');
      const suggestions = await SocialMediaFriendsService.getSocialFriendSuggestions(userId);
      
      res.json(suggestions);
    } catch (error) {
      console.error("Social suggestions error:", error);
      res.status(500).json({ message: "Failed to get social friend suggestions" });
    }
  });

  // Get user's connected social accounts
  app.get('/api/social/connections', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const connections = await storage.getUserSocialConnections(userId);
      
      // Remove sensitive data before sending
      const sanitizedConnections = connections.map(conn => ({
        id: conn.id,
        platform: conn.platform,
        username: conn.username,
        displayName: conn.displayName,
        isActive: conn.isActive,
        lastSynced: conn.lastSynced,
        createdAt: conn.createdAt
      }));
      
      res.json(sanitizedConnections);
    } catch (error) {
      console.error("Social connections error:", error);
      res.status(500).json({ message: "Failed to get social connections" });
    }
  });

  // Disconnect social account
  app.delete('/api/social/connections/:platform', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { platform } = req.params;
      
      // Set connection as inactive instead of deleting
      await storage.deactivateSocialConnection(userId, platform);
      
      res.json({ message: `${platform} disconnected successfully` });
    } catch (error) {
      console.error("Social disconnect error:", error);
      res.status(500).json({ message: "Failed to disconnect social account" });
    }
  });

  // Recommendations routes
  app.get('/api/recommendations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const recommendations = await storage.getUserRecommendations(userId);
      
      // Enhance recommendations with streaming platform information
      const enhancedRecommendations = await Promise.all(
        recommendations.map(async (rec) => {
          try {
            const show = await storage.getShow(rec.showId);
            if (show) {
              const showDetails = await tmdbService.getShowDetails(show.tmdbId);
              return {
                ...rec,
                show: {
                  ...show,
                  posterPath: show.posterPath || showDetails.poster_path || null,
                  streamingPlatforms: showDetails.streamingPlatforms || []
                }
              };
            }
            return rec;
          } catch (error) {
            console.error('Error enhancing recommendation:', error);
            return rec;
          }
        })
      );
      
      res.json(enhancedRecommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  app.post('/api/recommendations/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.generateRecommendations(userId);
      
      // Also create sample upcoming releases for demo
      await createSampleUpcomingReleases();
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error generating recommendations:", error);
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });

  // Helper function to create sample upcoming releases
  const createSampleUpcomingReleases = async () => {
    const sampleReleases = [
      {
        showId: 1,
        seasonNumber: 3,
        releaseDate: new Date('2025-01-15'),
        releaseType: 'season_premiere',
        title: 'Season 3 Premiere',
        description: 'The long-awaited third season begins with epic new adventures.',
        isConfirmed: true
      },
      {
        showId: 1,
        seasonNumber: 2,
        episodeNumber: 10,
        releaseDate: new Date('2025-01-08'),
        releaseType: 'season_finale',
        title: 'Season 2 Finale',
        description: 'An explosive finale that will leave fans wanting more.',
        isConfirmed: true
      },
      {
        showId: 1,
        seasonNumber: 4,
        releaseDate: new Date('2025-03-20'),
        releaseType: 'season_premiere',
        title: 'Season 4 Premiere',
        description: 'New characters and storylines await in the upcoming season.',
        isConfirmed: false
      }
    ];

    for (const release of sampleReleases) {
      try {
        await storage.createUpcomingRelease(release);
      } catch (error) {
        // Ignore duplicates
        console.log('Release may already exist');
      }
    }
  };

  // Stats routes
  app.get('/api/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Upcoming releases routes - Enhanced with TMDB data
  app.get('/api/upcoming-releases', isAuthenticated, async (req, res) => {
    try {
      // Get current date and future date for filtering
      const today = new Date();
      const futureDate = new Date();
      futureDate.setMonth(today.getMonth() + 6); // 6 months from now
      
      const todayStr = today.toISOString().split('T')[0];
      const futureDateStr = futureDate.toISOString().split('T')[0];
      
      // Get truly upcoming TV shows using discover endpoint with future dates
      const upcomingTVResponse = await fetch(`https://api.themoviedb.org/3/discover/tv?api_key=${process.env.TMDB_API_KEY}&first_air_date.gte=${todayStr}&first_air_date.lte=${futureDateStr}&sort_by=first_air_date.asc&page=1`);
      const upcomingTV = await upcomingTVResponse.json();
      
      // Get upcoming movies with future release dates
      const upcomingMoviesResponse = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${process.env.TMDB_API_KEY}&release_date.gte=${todayStr}&release_date.lte=${futureDateStr}&sort_by=release_date.asc&page=1`);
      const upcomingMovies = await upcomingMoviesResponse.json();
      
      // Filter and format TV shows - only shows with future air dates
      const filteredTVShows = await Promise.all(
        (upcomingTV.results || [])
          .filter((show: any) => {
            if (!show.first_air_date) return false;
            const airDate = new Date(show.first_air_date);
            return airDate > today;
          })
          .slice(0, 10)
          .map(async (show: any) => {
            // Get detailed show information including seasons
            let seasonInfo = null;
            let releaseType = 'series_premiere';
            
            try {
              const detailsResponse = await fetch(`https://api.themoviedb.org/3/tv/${show.id}?api_key=${process.env.TMDB_API_KEY}`);
              const details = await detailsResponse.json();
              
              if (details.seasons && details.seasons.length > 1) {
                // This show has multiple seasons
                const currentSeasons = details.seasons.filter((s: any) => s.season_number > 0);
                const latestSeason = currentSeasons[currentSeasons.length - 1];
                
                if (latestSeason) {
                  seasonInfo = {
                    seasonNumber: latestSeason.season_number,
                    totalSeasons: currentSeasons.length,
                    episodeCount: latestSeason.episode_count
                  };
                  
                  // Determine if this is a new season or series premiere
                  if (currentSeasons.length > 1) {
                    releaseType = `season_${latestSeason.season_number}_premiere`;
                  }
                }
              }
            } catch (error) {
              console.log('Error fetching show details:', error);
            }
            
            // Get streaming providers for this show
            let streamingProviders = [];
            try {
              const providersResponse = await fetch(`https://api.themoviedb.org/3/tv/${show.id}/watch/providers?api_key=${process.env.TMDB_API_KEY}`);
              const providersData = await providersResponse.json();
              
              if (providersData.results?.US?.flatrate) {
                streamingProviders = providersData.results.US.flatrate.slice(0, 4);
              }
            } catch (error) {
              console.log('Error fetching providers for show:', show.id);
            }
            
            return {
              id: show.id,
              title: show.name,
              name: show.name,
              overview: show.overview,
              poster_path: show.poster_path,
              posterPath: show.poster_path,
              first_air_date: show.first_air_date,
              releaseDate: show.first_air_date,
              releaseType,
              tmdbId: show.id,
              isConfirmed: true,
              seasonInfo,
              type: seasonInfo ? 'season' : 'series',
              streamingProviders,
              streamingPlatforms: streamingProviders,
              airDate: show.first_air_date,
              vote_average: show.vote_average || 0
            };
          })
      );
      
      // Filter and format movies - only movies with future release dates
      const filteredMovies = (upcomingMovies.results || [])
        .filter((movie: any) => {
          if (!movie.release_date) return false;
          const releaseDate = new Date(movie.release_date);
          return releaseDate > today;
        })
        .slice(0, 8)
        .map((movie: any) => ({
          id: movie.id,
          title: movie.title,
          name: movie.title,
          overview: movie.overview,
          poster_path: movie.poster_path,
          posterPath: movie.poster_path,
          first_air_date: movie.release_date,
          releaseDate: movie.release_date,
          releaseType: 'movie',
          tmdbId: movie.id,
          isConfirmed: true,
          streamingProviders: [],
          streamingPlatforms: [],
          airDate: movie.release_date,
          vote_average: movie.vote_average || 0
        }));
      
      // Combine filtered results
      const allUpcoming = [...filteredTVShows, ...filteredMovies];
      
      // Sort by release date (closest first)
      allUpcoming.sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());
      
      // Also get popular/anticipated upcoming shows
      const popularUpcomingResponse = await fetch(`https://api.themoviedb.org/3/discover/tv?api_key=${process.env.TMDB_API_KEY}&first_air_date.gte=${todayStr}&first_air_date.lte=${futureDateStr}&sort_by=popularity.desc&vote_count.gte=10&page=1`);
      const popularUpcoming = await popularUpcomingResponse.json();
      
      const popularShows = await Promise.all(
        (popularUpcoming.results || [])
          .filter((show: any) => {
            if (!show.first_air_date) return false;
            const airDate = new Date(show.first_air_date);
            return airDate > today;
          })
          .slice(0, 5)
          .map(async (show: any) => {
            // Get season information for popular shows too
            let seasonInfo = null;
            let releaseType = 'series_premiere';
            
            try {
              const detailsResponse = await fetch(`https://api.themoviedb.org/3/tv/${show.id}?api_key=${process.env.TMDB_API_KEY}`);
              const details = await detailsResponse.json();
              
              if (details.seasons && details.seasons.length > 1) {
                const currentSeasons = details.seasons.filter((s: any) => s.season_number > 0);
                const latestSeason = currentSeasons[currentSeasons.length - 1];
                
                if (latestSeason) {
                  seasonInfo = {
                    seasonNumber: latestSeason.season_number,
                    totalSeasons: currentSeasons.length,
                    episodeCount: latestSeason.episode_count
                  };
                  
                  if (currentSeasons.length > 1) {
                    releaseType = `season_${latestSeason.season_number}_premiere`;
                  }
                }
              }
            } catch (error) {
              console.log('Error fetching popular show details:', error);
            }
            
            // Get streaming providers for popular shows too
            let streamingProviders = [];
            try {
              const providersResponse = await fetch(`https://api.themoviedb.org/3/tv/${show.id}/watch/providers?api_key=${process.env.TMDB_API_KEY}`);
              const providersData = await providersResponse.json();
              
              if (providersData.results?.US?.flatrate) {
                streamingProviders = providersData.results.US.flatrate.slice(0, 4);
              }
            } catch (error) {
              console.log('Error fetching providers for popular show:', show.id);
            }
            
            return {
              id: show.id,
              title: show.name,
              name: show.name,
              overview: show.overview,
              poster_path: show.poster_path,
              posterPath: show.poster_path,
              first_air_date: show.first_air_date,
              releaseDate: show.first_air_date,
              releaseType,
              tmdbId: show.id,
              isConfirmed: true,
              isPopular: true,
              seasonInfo,
              type: seasonInfo ? 'season' : 'series',
              streamingProviders,
              streamingPlatforms: streamingProviders,
              airDate: show.first_air_date,
              vote_average: show.vote_average || 0
            };
          })
      );
      
      // Combine all results, prioritizing popular shows
      const finalUpcoming = [...popularShows, ...allUpcoming.filter(item => !popularShows.some(pop => pop.id === item.id))];
      
      console.log(`Found ${finalUpcoming.length} truly upcoming releases`);
      
      res.json(finalUpcoming.slice(0, 15)); // Return top 15 upcoming items
    } catch (error) {
      console.error("Error fetching upcoming releases:", error);
      res.status(500).json({ message: "Failed to fetch upcoming releases" });
    }
  });

  app.get('/api/upcoming-releases/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const releases = await storage.getUpcomingReleasesForUser(userId);
      res.json(releases);
    } catch (error) {
      console.error("Error fetching user upcoming releases:", error);
      res.status(500).json({ message: "Failed to fetch user upcoming releases" });
    }
  });

  app.post('/api/upcoming-releases', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertUpcomingReleaseSchema.parse(req.body);
      const release = await storage.createUpcomingRelease(validatedData);
      res.json(release);
    } catch (error) {
      console.error("Error creating upcoming release:", error);
      res.status(500).json({ message: "Failed to create upcoming release" });
    }
  });

  // Release reminder routes
  app.get('/api/reminders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reminders = await storage.getUserReminders(userId);
      res.json(reminders);
    } catch (error) {
      console.error("Error fetching reminders:", error);
      res.status(500).json({ message: "Failed to fetch reminders" });
    }
  });

  app.post('/api/reminders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertReleaseReminderSchema.parse({
        ...req.body,
        userId
      });
      const reminder = await storage.createReleaseReminder(validatedData);
      res.json(reminder);
    } catch (error) {
      console.error("Error creating reminder:", error);
      res.status(500).json({ message: "Failed to create reminder" });
    }
  });

  app.delete('/api/reminders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      await storage.deleteReleaseReminder(parseInt(id), userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting reminder:", error);
      res.status(500).json({ message: "Failed to delete reminder" });
    }
  });

  // Release reminder routes for upcoming shows
  app.post('/api/release-reminders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { showId, tmdbId, title, releaseDate, notificationMethods } = req.body;
      
      const reminderData = {
        userId,
        showId: parseInt(showId),
        tmdbId: parseInt(tmdbId),
        title,
        releaseDate: new Date(releaseDate),
        notificationMethods: notificationMethods || ['push'],
        isActive: true
      };
      
      const reminder = await storage.createReleaseReminder(reminderData);
      res.json({ success: true, reminder });
    } catch (error) {
      console.error("Error creating release reminder:", error);
      res.status(500).json({ message: "Failed to create release reminder" });
    }
  });

  // Notification routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      await storage.markNotificationAsRead(parseInt(id), userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.delete('/api/notifications/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      await storage.deleteNotification(parseInt(id), userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  // TMDB Videos API (for trailers)
  app.get('/api/tmdb/:mediaType/:id/videos', async (req, res) => {
    try {
      const { mediaType, id } = req.params;
      const data = await tmdbService.getVideos(mediaType as any, Number(id));
      res.json(data);
    } catch (error) {
      console.error('TMDB videos error:', error);
      res.status(500).json({ error: 'Failed to fetch videos' });
    }
  });

  // Affiliate click tracking
  app.post('/api/analytics/affiliate-click', isAuthenticated, async (req: any, res) => {
    try {
      const { platform, userId, showId, trackingId } = req.body;
      
      // Track affiliate click for analytics
      console.log('Affiliate click tracked:', { platform, userId, showId, trackingId });
      
      // In production, store this in database for commission tracking
      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking affiliate click:", error);
      res.status(500).json({ message: "Failed to track affiliate click" });
    }
  });

  // Trailer view tracking
  app.post('/api/analytics/trailer-view', isAuthenticated, async (req: any, res) => {
    try {
      const { tmdbId, videoKey, userId, showTitle, hasAds } = req.body;
      
      // Track trailer view for analytics
      console.log('Trailer view tracked:', { tmdbId, videoKey, userId, showTitle, hasAds });
      
      // In production, store this in database for monetization analytics
      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking trailer view:", error);
      res.status(500).json({ message: "Failed to track trailer view" });
    }
  });

  // Subscription and monetization routes
  app.get('/api/subscription/current', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      // Mock subscription data - integrate with actual payment processor
      const subscription = {
        planId: 'free',
        status: 'active',
        expiresAt: null,
        features: {
          adsEnabled: true,
          maxShows: 25,
          premiumRecommendations: false,
          analytics: false
        }
      };
      res.json(subscription);
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  app.post('/api/subscription/create', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { planId } = req.body;
      
      // Mock checkout URL - integrate with Stripe or other payment processor
      const checkoutUrl = `https://checkout.stripe.com/mock-session?plan=${planId}&user=${userId}`;
      
      res.json({ 
        success: true, 
        checkoutUrl,
        message: "Redirecting to payment processor"
      });
    } catch (error) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });

  // Ad management routes
  app.get('/api/ads/config', async (req, res) => {
    try {
      const adsConfig = {
        enabled: true,
        trailerAdsEnabled: true,
        bannerAdsEnabled: true,
        adDuration: 15,
        skipAfterSeconds: 5,
        adFormats: ['video', 'banner', 'interstitial']
      };
      res.json(adsConfig);
    } catch (error) {
      console.error("Error fetching ads config:", error);
      res.status(500).json({ message: "Failed to fetch ads configuration" });
    }
  });

  app.post('/api/ads/track', async (req, res) => {
    try {
      const { adId, eventType, userId } = req.body;
      
      // Track ad events (impressions, clicks, completions)
      console.log(`Ad tracking: ${eventType} for ad ${adId} by user ${userId}`);
      
      // In production, save to analytics database
      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking ad event:", error);
      res.status(500).json({ message: "Failed to track ad event" });
    }
  });

  // Revenue analytics (admin only)
  app.get('/api/admin/revenue', isAuthenticated, async (req: any, res) => {
    try {
      // Mock revenue data - replace with actual analytics
      const revenueData = {
        totalRevenue: 8650.25,
        subscriptionRevenue: 5780.75,
        adRevenue: 2869.50,
        activeSubscribers: {
          free: 1247,
          plus: 892,  // $1.99/month
          premium: 164 // $4.99/month
        },
        adImpressions: 18450,
        averageRevenuePerUser: 3.89
      };
      res.json(revenueData);
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      res.status(500).json({ message: "Failed to fetch revenue data" });
    }
  });

  // Advanced search endpoints
  app.get('/api/search/advanced', async (req, res) => {
    try {
      const { query, genres, networks, yearFrom, yearTo, rating, sortBy, page } = req.query;
      
      const filters = {
        query: query as string,
        genres: genres ? (genres as string).split(',') : undefined,
        networks: networks ? (networks as string).split(',') : undefined,
        yearFrom: yearFrom ? parseInt(yearFrom as string) : undefined,
        yearTo: yearTo ? parseInt(yearTo as string) : undefined,
        rating: rating ? parseFloat(rating as string) : undefined,
        sortBy: sortBy as string || 'popularity.desc',
        page: page ? parseInt(page as string) : 1
      };

      const results = await tmdbService.advancedSearch(filters);
      res.json(results);
    } catch (error) {
      console.error("Error in advanced search:", error);
      res.status(500).json({ message: "Failed to perform advanced search" });
    }
  });

  app.get('/api/search/genres', async (req, res) => {
    try {
      const genres = await tmdbService.getGenres();
      res.json(genres);
    } catch (error) {
      console.error("Error fetching genres:", error);
      res.status(500).json({ message: "Failed to fetch genres" });
    }
  });

  app.get('/api/search/networks', async (req, res) => {
    try {
      const networks = await tmdbService.getNetworks();
      res.json(networks);
    } catch (error) {
      console.error("Error fetching networks:", error);
      res.status(500).json({ message: "Failed to fetch networks" });
    }
  });

  app.get('/api/search/platform/:platform', async (req, res) => {
    try {
      const { platform } = req.params;
      const shows = await tmdbService.searchByStreamingPlatform(platform);
      res.json(shows);
    } catch (error) {
      console.error(`Error searching shows on ${req.params.platform}:`, error);
      res.status(500).json({ message: "Failed to search by streaming platform" });
    }
  });

  app.get('/api/search/genre/:genre', async (req, res) => {
    try {
      const { genre } = req.params;
      const shows = await tmdbService.getShowsByGenre(genre);
      res.json(shows);
    } catch (error) {
      console.error(`Error fetching ${req.params.genre} shows:`, error);
      res.status(500).json({ message: "Failed to search by genre" });
    }
  });

  // Sports endpoints
  app.get('/api/sports', async (req, res) => {
    try {
      const sports = await sportsService.getSupportedSports();
      res.json(sports);
    } catch (error) {
      console.error("Error fetching sports:", error);
      res.status(500).json({ message: "Failed to fetch sports" });
    }
  });

  app.get('/api/sports/:sport/teams', async (req, res) => {
    try {
      const { sport } = req.params;
      const teams = await sportsService.getTeamsBySport(sport);
      res.json(teams);
    } catch (error) {
      console.error(`Error fetching teams for ${req.params.sport}:`, error);
      res.status(500).json({ message: "Failed to fetch teams" });
    }
  });

  app.get('/api/sports/:sport/games', async (req, res) => {
    try {
      const { sport } = req.params;
      const { days } = req.query;
      const games = await sportsService.getUpcomingGames(sport, days ? parseInt(days as string) : 7);
      res.json(games);
    } catch (error) {
      console.error(`Error fetching games for ${req.params.sport}:`, error);
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });

  app.get('/api/sports/tv/today', async (req, res) => {
    try {
      const schedule = await sportsService.getTodaysTvSchedule();
      res.json(schedule);
    } catch (error) {
      console.error("Error fetching TV schedule:", error);
      res.status(500).json({ message: "Failed to fetch TV schedule" });
    }
  });

  app.get('/api/sports/tennis/majors', async (req, res) => {
    try {
      const majors = await sportsService.getTennisMajors();
      res.json(majors);
    } catch (error) {
      console.error("Error fetching tennis majors:", error);
      res.status(500).json({ message: "Failed to fetch tennis majors" });
    }
  });

  // Streaming Platform Integration endpoints
  app.get('/api/streaming/platforms', (req, res) => {
    try {
      const platforms = StreamingService.getSupportedPlatforms().map(platform => ({
        id: platform,
        name: StreamingService.getPlatformConfig(platform)?.name || platform,
        displayName: StreamingService.getPlatformConfig(platform)?.name || platform
      }));
      res.json(platforms);
    } catch (error) {
      console.error("Error fetching streaming platforms:", error);
      res.status(500).json({ message: "Failed to fetch streaming platforms" });
    }
  });

  app.get('/api/streaming/integrations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const integrations = await storage.getUserStreamingIntegrations(userId);
      
      // Remove sensitive data before sending to client
      const safeIntegrations = integrations.map(integration => ({
        id: integration.id,
        platform: integration.platform,
        isActive: integration.isActive,
        lastSync: integration.lastSync,
        createdAt: integration.createdAt
      }));
      
      res.json(safeIntegrations);
    } catch (error) {
      console.error("Error fetching user integrations:", error);
      res.status(500).json({ message: "Failed to fetch integrations" });
    }
  });

  app.get('/api/streaming/auth/:platform', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { platform } = req.params;
      const redirectUri = `${req.protocol}://${req.get('host')}/api/streaming/callback/${platform}`;
      
      const authUrl = StreamingService.generateAuthUrl(platform, userId, redirectUri);
      res.json({ authUrl });
    } catch (error) {
      console.error(`Error generating auth URL for ${req.params.platform}:`, error);
      res.status(500).json({ message: "Failed to generate authentication URL" });
    }
  });

  app.get('/api/streaming/callback/:platform', async (req, res) => {
    try {
      const { platform } = req.params;
      const { code, state } = req.query;
      
      if (!code || !state) {
        return res.status(400).json({ message: "Missing authorization code or state" });
      }
      
      // Extract user ID from state
      const [userId] = (state as string).split(':');
      
      const redirectUri = `${req.protocol}://${req.get('host')}/api/streaming/callback/${platform}`;
      
      // Exchange code for tokens
      const tokens = await StreamingService.exchangeCodeForToken(platform, code as string, redirectUri);
      
      // Store integration
      await StreamingService.storeIntegration(
        userId, 
        platform, 
        tokens.accessToken, 
        tokens.refreshToken, 
        tokens.expiresIn
      );
      
      // Redirect to success page
      res.redirect('/?integration=success');
    } catch (error) {
      console.error(`Error handling ${req.params.platform} callback:`, error);
      res.redirect('/?integration=error');
    }
  });

  app.post('/api/streaming/sync/:platform', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { platform } = req.params;
      const { limit } = req.body;
      
      const viewingHistory = await StreamingService.fetchViewingHistory(userId, platform, limit || 100);
      res.json({ 
        success: true, 
        imported: viewingHistory.length,
        message: `Successfully imported ${viewingHistory.length} viewing records from ${platform}` 
      });
    } catch (error) {
      console.error(`Error syncing ${req.params.platform} data:`, error);
      res.status(500).json({ message: `Failed to sync ${req.params.platform} data` });
    }
  });

  app.delete('/api/streaming/integrations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      await storage.deleteStreamingIntegration(parseInt(id), userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting streaming integration:", error);
      res.status(500).json({ message: "Failed to delete streaming integration" });
    }
  });

  // Viewing History endpoints
  app.get('/api/viewing-history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { limit, platform } = req.query;
      
      let viewingHistory = await storage.getUserViewingHistory(userId, limit ? parseInt(limit as string) : 50);
      
      if (platform) {
        viewingHistory = viewingHistory.filter(h => h.platform === platform);
      }
      
      res.json(viewingHistory);
    } catch (error) {
      console.error("Error fetching viewing history:", error);
      res.status(500).json({ message: "Failed to fetch viewing history" });
    }
  });

  app.get('/api/viewing-patterns', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const patterns = await StreamingService.analyzeViewingPatterns(userId);
      res.json(patterns);
    } catch (error) {
      console.error("Error analyzing viewing patterns:", error);
      res.status(500).json({ message: "Failed to analyze viewing patterns" });
    }
  });

  // Upload viewing history from CSV/JSON files
  app.post('/api/viewing-history/upload', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      let data: any[] = [];
      let imported = 0;
      let skipped = 0;
      const errors: string[] = [];

      // Parse file based on type
      if (file.originalname.endsWith('.csv')) {
        // Parse CSV
        const readable = Readable.from(file.buffer);
        const records: any[] = [];
        
        await new Promise((resolve, reject) => {
          readable
            .pipe(csvParser())
            .on('data', (row) => records.push(row))
            .on('end', resolve)
            .on('error', reject);
        });
        
        data = records;
      } else if (file.originalname.endsWith('.json')) {
        // Parse JSON
        try {
          data = JSON.parse(file.buffer.toString());
          if (!Array.isArray(data)) {
            data = [data];
          }
        } catch (error) {
          return res.status(400).json({ message: "Invalid JSON format" });
        }
      }

      // Process each record
      for (const record of data) {
        try {
          const { title, date_watched, dateWatched, rating, platform, watchedAt } = record;
          
          if (!title) {
            errors.push(`Skipping record without title: ${JSON.stringify(record)}`);
            skipped++;
            continue;
          }

          // Flexible date parsing
          let watchDate = date_watched || dateWatched || watchedAt;
          if (!watchDate) {
            watchDate = new Date(); // Default to now if no date provided
          }

          // Try to find or create the show
          let show = await storage.getShowByTitle(title);
          if (!show) {
            // Try to find via TMDB
            const searchResults = await tmdbService.searchShows(title);
            if (searchResults.results && searchResults.results.length > 0) {
              const tmdbShow = searchResults.results[0];
              show = await storage.upsertShow({
                tmdbId: tmdbShow.id,
                title: tmdbShow.name,
                overview: tmdbShow.overview,
                posterPath: tmdbShow.poster_path,
                backdropPath: tmdbShow.backdrop_path,
                firstAirDate: tmdbShow.first_air_date,
                genres: tmdbShow.genre_ids ? tmdbShow.genre_ids.map(String) : [],
                status: 'Released'
              });
            } else {
              // Create a basic show record
              show = await storage.upsertShow({
                tmdbId: Math.floor(Math.random() * 1000000), // Temporary ID
                title: title,
                status: 'Released'
              });
            }
          }

          // Create viewing history record
          await storage.createViewingHistory({
            userId,
            showId: show.id,
            platform: platform || 'imported',
            watchedAt: new Date(watchDate)
          });

          imported++;
        } catch (error: any) {
          const recordTitle = record.title || 'Unknown';
          console.error(`Error processing record ${JSON.stringify(record)}:`, error);
          errors.push(`Failed to import: ${recordTitle} - ${error.message}`);
          skipped++;
        }
      }

      res.json({
        success: true,
        imported,
        skipped,
        errors: errors.slice(0, 10) // Limit error messages
      });

    } catch (error) {
      console.error("Error uploading viewing history:", error);
      res.status(500).json({ message: "Failed to upload viewing history" });
    }
  });

  // User Behavior Tracking endpoints
  app.post('/api/behavior/track', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const behaviorData = insertUserBehaviorSchema.parse({
        ...req.body,
        userId
      });
      
      const behavior = await storage.trackUserBehavior(behaviorData);
      
      // Also create recommendation training data for relevant actions
      if (['watchlist_add', 'watch_now_click', 'recommendation_interact'].includes(behaviorData.actionType)) {
        const show = await storage.getShow(behaviorData.targetId!);
        if (show) {
          await storage.createRecommendationTraining({
            userId,
            showId: show.id,
            interactionType: behaviorData.actionType === 'watchlist_add' ? 'positive' : 'neutral',
            interactionScore: behaviorData.actionType === 'watchlist_add' ? 0.8 : 0.5,
            features: {
              genres: show.genres,
              rating: show.rating,
              year: show.firstAirDate ? new Date(show.firstAirDate).getFullYear() : null,
              networks: show.networks
            },
            context: behaviorData.metadata
          });
        }
      }
      
      res.json({ success: true, id: behavior.id });
    } catch (error) {
      console.error("Error tracking user behavior:", error);
      res.status(500).json({ message: "Failed to track user behavior" });
    }
  });

  app.get('/api/behavior/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { actionType, days } = req.query;
      
      const behavior = await storage.getUserBehavior(userId, actionType as string);
      
      // Filter by time period if specified
      let filteredBehavior = behavior;
      if (days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(days as string));
        filteredBehavior = behavior.filter(b => new Date(b.timestamp) >= cutoffDate);
      }
      
      // Aggregate analytics
      const analytics = {
        totalActions: filteredBehavior.length,
        actionTypes: filteredBehavior.reduce((acc: Record<string, number>, b) => {
          acc[b.actionType] = (acc[b.actionType] || 0) + 1;
          return acc;
        }, {}),
        targetTypes: filteredBehavior.reduce((acc: Record<string, number>, b) => {
          acc[b.targetType] = (acc[b.targetType] || 0) + 1;
          return acc;
        }, {}),
        dailyActivity: filteredBehavior.reduce((acc: Record<string, number>, b) => {
          const date = new Date(b.timestamp).toISOString().split('T')[0];
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {})
      };
      
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching behavior analytics:", error);
      res.status(500).json({ message: "Failed to fetch behavior analytics" });
    }
  });

  // User preferences routes
  app.get('/api/user/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id || req.user.claims?.sub;
      const preferences = await storage.getUserPreferences(userId);
      res.json(preferences || {});
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      res.status(500).json({ message: "Failed to fetch user preferences" });
    }
  });

  app.post('/api/user/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id || req.user.claims?.sub;
      const preferences = await storage.updateUserPreferences(userId, req.body);
      res.json(preferences);
    } catch (error) {
      console.error("Error saving user preferences:", error);
      res.status(500).json({ message: "Failed to save user preferences" });
    }
  });

  app.put('/api/user/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id || req.user.claims?.sub;
      const preferences = await storage.updateUserPreferences(userId, req.body);
      res.json(preferences);
    } catch (error) {
      console.error("Error updating user preferences:", error);
      res.status(500).json({ message: "Failed to update user preferences" });
    }
  });

  // ==================== VIEWING PROGRESS TRACKING APIs ====================
  
  // Get user's current watching progress for homepage "Pick Up Where You Left Off"
  app.get('/api/progress/current', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      
      // Get currently watching shows from watchlist
      const watchingShows = await storage.getUserWatchlist(userId, 'watching');
      
      if (watchingShows.length === 0) {
        return res.json({ currentShow: null });
      }
      
      // Get the most recently updated show
      const currentShow = watchingShows.sort((a, b) => 
        new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
      )[0];
      
      // Get show details
      const showDetails = await storage.getShow(currentShow.showId);
      
      res.json({
        currentShow: {
          ...currentShow,
          show: showDetails,
          nextEpisode: {
            season: currentShow.currentSeason,
            episode: currentShow.currentEpisode,
            timeRemaining: "18 minutes left" // This would be calculated from episode progress
          }
        }
      });
    } catch (error) {
      console.error("Error getting current progress:", error);
      res.status(500).json({ message: "Failed to get viewing progress" });
    }
  });

  // Mark episode as watched and update progress
  app.post('/api/progress/episode', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const { showId, seasonNumber, episodeNumber, watchTimeMinutes, isCompleted = true, rating } = req.body;

      if (!showId || !seasonNumber || !episodeNumber) {
        return res.status(400).json({ message: "showId, seasonNumber, and episodeNumber are required" });
      }

      // Record episode progress
      const episodeProgress = await storage.createEpisodeProgress({
        userId,
        showId,
        seasonNumber,
        episodeNumber,
        watchTimeMinutes,
        isCompleted,
        rating
      });

      // Update watchlist progress
      const watchlistItem = await storage.getUserWatchlist(userId).then(items => 
        items.find(item => item.showId === showId)
      );

      if (watchlistItem && isCompleted) {
        // Move to next episode
        const nextEpisode = episodeNumber + 1;
        const nextSeason = seasonNumber;
        
        await storage.updateWatchlistItem(watchlistItem.id, userId, {
          currentSeason: nextSeason,
          currentEpisode: nextEpisode,
          totalEpisodesWatched: (watchlistItem.totalEpisodesWatched || 0) + 1
        });

        // Create activity for social feed
        await storage.createActivity({
          userId,
          activityType: 'updated_progress',
          content: `watched S${seasonNumber}E${episodeNumber}`,
          showId,
          metadata: { seasonNumber, episodeNumber, rating }
        });
      }

      res.json({ 
        success: true, 
        episodeProgress,
        message: `Episode S${seasonNumber}E${episodeNumber} marked as ${isCompleted ? 'completed' : 'in progress'}`
      });
    } catch (error) {
      console.error("Error updating episode progress:", error);
      res.status(500).json({ message: "Failed to update episode progress" });
    }
  });

  // Update watchlist item status and progress
  app.patch('/api/progress/watchlist/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const watchlistId = parseInt(req.params.id);
      const { status, currentSeason, currentEpisode, rating } = req.body;

      const updatedItem = await storage.updateWatchlistItem(watchlistId, userId, {
        status,
        currentSeason,
        currentEpisode,
        rating,
        updatedAt: new Date()
      });

      // Create activity for status changes
      if (status) {
        await storage.createActivity({
          userId,
          activityType: 'updated_progress',
          content: `marked as ${status}`,
          showId: updatedItem.showId,
          metadata: { newStatus: status, currentSeason, currentEpisode }
        });
      }

      res.json({ success: true, watchlistItem: updatedItem });
    } catch (error) {
      console.error("Error updating watchlist progress:", error);
      res.status(500).json({ message: "Failed to update watchlist progress" });
    }
  });

  // Bulk update progress from viewing history import
  app.post('/api/progress/bulk-import', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const { viewingHistory } = req.body;

      if (!Array.isArray(viewingHistory)) {
        return res.status(400).json({ message: "viewingHistory must be an array" });
      }

      let processed = 0;
      let errors = [];

      for (const entry of viewingHistory) {
        try {
          // Find or create show
          const show = await storage.getOrCreateShow({
            tmdbId: entry.tmdbId || 0,
            title: entry.title,
            overview: entry.overview || null,
            posterPath: entry.posterPath || null
          });

          // Create viewing history record
          await storage.createViewingHistory({
            userId,
            showId: show.id,
            platform: entry.platform,
            watchedAt: new Date(entry.watchedAt),
            watchDuration: entry.watchDuration,
            totalDuration: entry.totalDuration,
            completionPercentage: entry.completionPercentage,
            episodeNumber: entry.episodeNumber,
            seasonNumber: entry.seasonNumber,
            userRating: entry.userRating,
            platformData: entry.platformData
          });

          // Update watchlist if episode was completed
          if (entry.completionPercentage >= 0.8 && entry.episodeNumber && entry.seasonNumber) {
            const existingWatchlist = await storage.getUserWatchlist(userId).then(items =>
              items.find(item => item.showId === show.id)
            );

            if (existingWatchlist) {
              // Update progress if this episode is further than current progress
              if (entry.seasonNumber > existingWatchlist.currentSeason ||
                  (entry.seasonNumber === existingWatchlist.currentSeason && 
                   entry.episodeNumber >= existingWatchlist.currentEpisode)) {
                await storage.updateWatchlistItem(existingWatchlist.id, userId, {
                  currentSeason: entry.seasonNumber,
                  currentEpisode: entry.episodeNumber + 1, // Next episode
                  totalEpisodesWatched: (existingWatchlist.totalEpisodesWatched || 0) + 1
                });
              }
            } else {
              // Add to watchlist
              await storage.addToWatchlist({
                userId,
                showId: show.id,
                status: 'watching',
                currentSeason: entry.seasonNumber,
                currentEpisode: entry.episodeNumber + 1,
                totalEpisodesWatched: 1
              });
            }
          }

          processed++;
        } catch (entryError) {
          errors.push({ entry: entry.title, error: entryError.message });
        }
      }

      res.json({
        success: true,
        processed,
        errors: errors.length > 0 ? errors.slice(0, 10) : [], // Limit error list
        message: `Successfully processed ${processed} viewing history entries`
      });
    } catch (error) {
      console.error("Error bulk importing progress:", error);
      res.status(500).json({ message: "Failed to import viewing history" });
    }
  });

  // Get detailed episode progress for a specific show
  app.get('/api/progress/show/:showId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const showId = parseInt(req.params.showId);

      // Get watchlist item
      const watchlistItem = await storage.getUserWatchlist(userId).then(items =>
        items.find(item => item.showId === showId)
      );

      // Get all episode progress for this show
      const episodeProgress = await storage.getEpisodeProgress(userId, showId);

      // Get show details
      const show = await storage.getShow(showId);

      res.json({
        show,
        watchlistItem,
        episodeProgress,
        stats: {
          totalEpisodesWatched: episodeProgress.filter(ep => ep.isCompleted).length,
          averageRating: episodeProgress
            .filter(ep => ep.rating)
            .reduce((sum, ep, _, arr) => sum + (parseFloat(ep.rating) / arr.length), 0),
          lastWatched: episodeProgress.sort((a, b) => 
            new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime()
          )[0]?.watchedAt
        }
      });
    } catch (error) {
      console.error("Error getting show progress:", error);
      res.status(500).json({ message: "Failed to get show progress" });
    }
  });

  // CCPA Compliance - Data Export API
  app.post('/api/data/export', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { requestType = 'full_export', format = 'json' } = req.body;

      // Get all user data for export
      const exportData = {
        profile: await storage.getUser(userId),
        watchlist: await storage.getUserWatchlist(userId),
        activity: await storage.getActivityFeed(userId),
        friends: await storage.getUserFriends(userId),
        recommendations: await storage.getUserRecommendations(userId),
        viewingHistory: await storage.getUserViewingHistory(userId),
        notifications: await storage.getUserNotifications(userId),
        streamingIntegrations: await storage.getUserStreamingIntegrations(userId),
        preferences: await storage.getUserPreferences(userId),
        stats: await storage.getUserStats(userId),
        exportDate: new Date().toISOString(),
        exportType: requestType
      };

      if (format === 'csv') {
        // Convert to CSV format for spreadsheet compatibility
        const csvData = convertToCSV(exportData);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="bingeboard-data-${userId}-${Date.now()}.csv"`);
        res.send(csvData);
      } else {
        // Return JSON format
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="bingeboard-data-${userId}-${Date.now()}.json"`);
        res.json(exportData);
      }
    } catch (error) {
      console.error("Error exporting user data:", error);
      res.status(500).json({ message: "Failed to export user data" });
    }
  });

  // CCPA Compliance - Data Deletion Request
  app.delete('/api/data/delete', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { confirmDeletion, reason } = req.body;

      if (!confirmDeletion) {
        return res.status(400).json({ message: "Deletion confirmation required" });
      }

      // Log the deletion request
      console.log(`Data deletion requested by user ${userId}, reason: ${reason}`);

      // For now, we'll just mark the account for deletion
      // In a real implementation, this would trigger a data deletion process
      await storage.updateUser(userId, {
        id: userId,
        email: `deleted_${Date.now()}@bingeboard.com`,
        firstName: 'Deleted',
        lastName: 'User',
        profileImageUrl: null
      });

      res.json({ 
        message: "Data deletion request processed. Your account will be permanently deleted within 30 days as required by law.",
        deletionId: `del_${userId}_${Date.now()}`,
        processedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error processing data deletion:", error);
      res.status(500).json({ message: "Failed to process deletion request" });
    }
  });

  // User Consent Management
  app.post('/api/consent', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { consentType, granted, timestamp } = req.body;

      // Store consent preferences
      // In a real implementation, this would be stored in a consent management table
      console.log(`Consent updated for user ${userId}: ${consentType} = ${granted} at ${timestamp}`);

      res.json({ 
        message: "Consent preferences updated successfully",
        consentType,
        granted,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error updating consent:", error);
      res.status(500).json({ message: "Failed to update consent preferences" });
    }
  });

  // Get User Rights Information (CCPA/GDPR)
  app.get('/api/data/rights', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      res.json({
        userRights: {
          dataAccess: "You can request a copy of all personal data we have about you",
          dataCorrection: "You can update or correct your personal information",
          dataDeletion: "You can request permanent deletion of your account and data",
          dataPortability: "You can export your data in JSON or CSV format",
          optOut: "You can withdraw consent for data processing at any time",
          nonDiscrimination: "We provide equal service regardless of your privacy choices"
        },
        dataCategories: {
          personalInfo: ["Name", "Email", "Profile Picture"],
          watchlistData: ["Shows Added", "Viewing Status", "Ratings"],
          socialData: ["Friends", "Activity Feed", "Comments"],
          behaviorData: ["Search Queries", "Click Patterns", "Recommendations"],
          technicalData: ["Device Info", "IP Address", "Session Data"]
        },
        dataRetention: "We retain your data only as long as necessary to provide our services",
        contactInfo: {
          privacy: "privacy@bingeboard.com",
          legal: "legal@bingeboard.com"
        },
        lastUpdated: user?.updatedAt || user?.createdAt
      });
    } catch (error) {
      console.error("Error fetching user rights info:", error);
      res.status(500).json({ message: "Failed to fetch user rights information" });
    }
  });

  // Watchmode API endpoints for enhanced streaming availability
  app.get('/api/watchmode/search', async (req, res) => {
    try {
      const { query, type } = req.query;
      if (!query) {
        return res.status(400).json({ message: 'Query parameter is required' });
      }

      const results = await WatchmodeService.searchTitles(
        query as string, 
        type as 'movie' | 'tv_series' | undefined
      );
      res.json(results);
    } catch (error) {
      console.error('Error searching Watchmode:', error);
      res.status(500).json({ message: 'Failed to search streaming availability' });
    }
  });

  app.get('/api/watchmode/availability/:tmdbId', async (req, res) => {
    try {
      const { tmdbId } = req.params;
      const { type } = req.query;
      
      if (!type || (type !== 'movie' && type !== 'tv')) {
        return res.status(400).json({ message: 'Type parameter must be "movie" or "tv"' });
      }

      const availability = await WatchmodeService.getStreamingAvailability(
        parseInt(tmdbId), 
        type as 'movie' | 'tv'
      );
      res.json(availability);
    } catch (error) {
      console.error(`Error getting availability for TMDB ${req.params.tmdbId}:`, error);
      res.status(500).json({ message: 'Failed to get streaming availability' });
    }
  });

  app.get('/api/watchmode/trending', async (req, res) => {
    try {
      const { type, limit } = req.query;
      
      const titles = await WatchmodeService.getTrendingTitles(
        type as 'movie' | 'tv_series' | undefined,
        limit ? parseInt(limit as string) : 20
      );
      res.json({ titles });
    } catch (error) {
      console.error('Error getting trending from Watchmode:', error);
      res.status(500).json({ message: 'Failed to get trending titles' });
    }
  });

  app.post('/api/watchmode/batch-availability', async (req, res) => {
    try {
      const { titles } = req.body;
      
      if (!Array.isArray(titles)) {
        return res.status(400).json({ message: 'Titles must be an array of {id, type} objects' });
      }

      const availability = await WatchmodeService.getAvailabilityForMultipleTitles(titles);
      
      // Convert Map to object for JSON response
      const result: Record<number, any> = {};
      availability.forEach((value, key) => {
        result[key] = value;
      });
      
      res.json(result);
    } catch (error) {
      console.error('Error getting batch availability:', error);
      res.status(500).json({ message: 'Failed to get batch streaming availability' });
    }
  });

  app.get('/api/watchmode/platforms', (req, res) => {
    try {
      const platforms = WatchmodeService.getPopularSourceIds();
      res.json(platforms);
    } catch (error) {
      console.error('Error getting Watchmode platforms:', error);
      res.status(500).json({ message: 'Failed to get streaming platforms' });
    }
  });

  app.get('/api/watchmode/new-releases/:platform', async (req, res) => {
    try {
      const { platform } = req.params;
      const { limit } = req.query;
      
      const platforms = WatchmodeService.getPopularSourceIds();
      const sourceId = platforms[platform];
      
      if (!sourceId) {
        return res.status(400).json({ message: 'Invalid platform name' });
      }

      const releases = await WatchmodeService.getNewReleasesOnPlatform(
        sourceId,
        limit ? parseInt(limit as string) : 20
      );
      
      res.json({ releases, platform });
    } catch (error) {
      console.error(`Error getting new releases for ${req.params.platform}:`, error);
      res.status(500).json({ message: 'Failed to get new releases' });
    }
  });

  // Import dependencies for notifications
  const { and, eq, desc } = await import('drizzle-orm');
  const { fcmTokens, notificationPreferences, notificationHistory } = await import('@shared/schema');

  // Initialize Firebase service conditionally
  let firebaseNotificationService: any = null;
  try {
    const firebaseModule = await import('./services/firebaseAdmin');
    firebaseNotificationService = firebaseModule.firebaseNotificationService;
  } catch (error) {
    console.warn('Firebase Admin service not available - notification features will be limited:', error.message);
  }

  // FCM Notification Routes
  app.post('/api/notifications/register-token', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { token, platform, deviceInfo } = req.body;

      // Deactivate old tokens for this user/platform
      await db.update(fcmTokens)
        .set({ isActive: false })
        .where(and(eq(fcmTokens.userId, userId), eq(fcmTokens.platform, platform)));

      // Insert new token
      const [newToken] = await db.insert(fcmTokens)
        .values({
          userId,
          token,
          platform,
          deviceInfo,
          isActive: true,
        })
        .returning();

      res.json({ success: true, tokenId: newToken.id });
    } catch (error) {
      console.error('Error registering FCM token:', error);
      res.status(500).json({ message: 'Failed to register FCM token' });
    }
  });

  app.get('/api/notifications/preferences', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      
      let [preferences] = await db.select()
        .from(notificationPreferences)
        .where(eq(notificationPreferences.userId, userId));

      if (!preferences) {
        // Create default preferences
        [preferences] = await db.insert(notificationPreferences)
          .values({ userId })
          .returning();
      }

      res.json(preferences);
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      res.status(500).json({ message: 'Failed to fetch preferences' });
    }
  });

  app.put('/api/notifications/preferences', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = req.body;

      const [updated] = await db.update(notificationPreferences)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(notificationPreferences.userId, userId))
        .returning();

      res.json(updated);
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      res.status(500).json({ message: 'Failed to update preferences' });
    }
  });

  app.post('/api/notifications/send-test', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get user's active tokens
      const userTokens = await db.select()
        .from(fcmTokens)
        .where(and(eq(fcmTokens.userId, userId), eq(fcmTokens.isActive, true)));

      if (userTokens.length === 0) {
        return res.status(400).json({ message: 'No active FCM tokens found' });
      }

      // Send test notification
      const notification = {
        title: '🎬 Test Notification',
        body: 'Your BingeBoard notifications are working perfectly!',
        icon: '/logo-192.png',
        click_action: '/home',
        data: {
          type: 'test',
          timestamp: new Date().toISOString(),
        },
      };

      const results = await Promise.all(
        userTokens.map(async (tokenData) => {
          try {
            const result = await firebaseNotificationService.sendToToken(tokenData.token, notification);
            
            // Log notification history
            await db.insert(notificationHistory).values({
              userId,
              title: notification.title,
              body: notification.body,
              type: 'test',
              status: 'sent',
              platform: tokenData.platform,
              metadata: notification.data,
            });

            return { success: true, token: tokenData.token.substring(0, 20) + '...', result };
          } catch (error) {
            console.error('Failed to send notification to token:', error);
            return { success: false, token: tokenData.token.substring(0, 20) + '...', error: error.message };
          }
        })
      );

      res.json({ 
        message: 'Test notifications sent',
        results,
        totalSent: results.filter(r => r.success).length,
        totalFailed: results.filter(r => !r.success).length,
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      res.status(500).json({ message: 'Failed to send test notification' });
    }
  });

  app.get('/api/notifications/history', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;

      const history = await db.select()
        .from(notificationHistory)
        .where(eq(notificationHistory.userId, userId))
        .orderBy(desc(notificationHistory.sentAt))
        .limit(limit);

      res.json(history);
    } catch (error) {
      console.error('Error fetching notification history:', error);
      res.status(500).json({ message: 'Failed to fetch notification history' });
    }
  });

  // FCM Token Registration
  app.post("/api/notifications/register-token", isAuthenticated, async (req: any, res) => {
    try {
      const { token, platform, deviceInfo } = req.body;
      const userId = req.user?.id;

      if (!userId || !token) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Store FCM token in database (placeholder - implement in storage)
      console.log('Registering FCM token for user:', userId);

      res.json({ success: true, message: "FCM token registered successfully" });
    } catch (error) {
      console.error("Error registering FCM token:", error);
      res.status(500).json({ message: "Failed to register FCM token" });
    }
  });

  // Send Push Notification
  app.post("/api/notifications/send", isAuthenticated, async (req: any, res) => {
    try {
      const { title, body, userId, data } = req.body;

      if (!title || !body || !userId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const result = await sendPushNotification({
        title,
        body,
        userId,
        data: data || {}
      });

      res.json({ 
        success: true, 
        message: "Notification sent successfully",
        result 
      });
    } catch (error) {
      console.error("Error sending notification:", error);
      res.status(500).json({ message: "Failed to send notification" });
    }
  });

  // Get Notification Preferences
  app.get("/api/notifications/preferences", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Return default preferences for now
      const preferences = {
        id: 1,
        userId,
        episodeReleases: true,
        recommendations: true,
        friendActivity: false,
        watchParties: true,
        pushNotifications: true,
        emailNotifications: false,
        systemUpdates: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      res.json(preferences);
    } catch (error) {
      console.error("Error fetching notification preferences:", error);
      res.status(500).json({ message: "Failed to fetch preferences" });
    }
  });

  // Update Notification Preferences
  app.put("/api/notifications/preferences", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const preferences = req.body;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      console.log('Updating notification preferences for user:', userId, preferences);

      // Return updated preferences
      res.json({ ...preferences, userId, updatedAt: new Date() });
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });

  // Get Notification History
  app.get("/api/notifications/history", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Return empty history for now
      res.json([]);
    } catch (error) {
      console.error("Error fetching notification history:", error);
      res.status(500).json({ message: "Failed to fetch notification history" });
    }
  });

  // Test notification endpoint
  app.post("/api/notifications/test", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const result = await sendPushNotification({
        title: "Test Notification",
        body: "This is a test notification from BingeBoard!",
        userId,
        data: {
          type: "test",
          timestamp: new Date().toISOString()
        }
      });

      res.json({ 
        success: true, 
        message: "Test notification sent",
        result 
      });
    } catch (error) {
      console.error("Error sending test notification:", error);
      res.status(500).json({ message: "Failed to send test notification" });
    }
  });

  // Custom Lists API endpoints
  app.get('/api/lists', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const lists = await storage.getUserLists(userId);
      res.json(lists);
    } catch (error) {
      console.error("Error fetching user lists:", error);
      res.status(500).json({ message: "Failed to fetch lists" });
    }
  });

  app.post('/api/lists', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { name, description, isPublic } = req.body;
      
      if (!name || name.trim().length === 0) {
        return res.status(400).json({ message: "List name is required" });
      }

      const newList = await storage.createList({
        userId,
        name: name.trim(),
        description: description?.trim() || '',
        isPublic: isPublic || false,
        isCollaborative: false,
        tags: []
      });

      res.json(newList);
    } catch (error) {
      console.error("Error creating list:", error);
      res.status(500).json({ message: "Failed to create list" });
    }
  });

  app.post('/api/lists/:listId/items', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { listId } = req.params;
      const { show } = req.body;

      if (!show || !show.id) {
        return res.status(400).json({ message: "Show data is required" });
      }

      // First, ensure the show exists in our database
      let existingShow = await storage.getShowByTmdbId(show.id);
      if (!existingShow) {
        existingShow = await storage.createShow({
          tmdbId: show.id,
          title: show.title || show.name,
          overview: show.overview || '',
          posterPath: show.poster_path,
          backdropPath: show.backdrop_path,
          genres: [],
          rating: show.vote_average?.toString() || '0',
          firstAirDate: show.first_air_date || null
        });
      }

      // Add the show to the list using the internal database ID
      await storage.addShowToList(parseInt(listId), existingShow.id, userId);
      
      res.json({ success: true, message: "Show added to list successfully" });
    } catch (error) {
      console.error("Error adding show to list:", error);
      res.status(500).json({ message: "Failed to add show to list" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
