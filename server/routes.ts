import type { Express } from "express";
import { type Server } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// import authRoutes from './routes/auth';
import analyticsRoutes from './routes/analytics.js';
import { storage } from "./storage";
import { setupAuth, isAuthenticated, verifyPassword } from "./auth";
import { db } from "./db";
import { eq } from "drizzle-orm";
import {
  insertWatchlistSchema, insertActivitySchema, insertFriendshipSchema,
  insertActivityLikeSchema, insertActivityCommentSchema, insertUpcomingReleaseSchema,
  insertReleaseReminderSchema, insertNotificationSchema, insertStreamingIntegrationSchema,
  insertViewingHistorySchema, insertUserBehaviorSchema, insertRecommendationTrainingSchema
} from "@shared/schema";
import { users } from "../shared/schema-sqlite";
import { initializeFirebaseAdmin, sendPushNotification } from "./services/firebaseAdmin";
import { TMDBService } from "./services/tmdb";
import { sportsService } from "./services/sports";
import { StreamingService } from "./services/streamingService";
import { WatchmodeService } from "./services/watchmodeService";
import { MultiAPIStreamingService } from "./services/multiAPIStreamingService";
import { searchStreamingAvailability, getStreamingByImdbId } from "./clients/utellyClient";
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

  // Analytics routes for monetization tracking
  app.use('/api/analytics', analyticsRoutes);

  // Auth middleware
  await setupAuth(app);

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
      const { firebaseToken, user: userFromBody } = req.body;

      if (!authHeader?.startsWith('Bearer ') && !firebaseToken) {
        return res.status(401).json({ message: 'Authorization token required' });
      }

      let user;

      // Check if Firebase Admin is available
      const firebaseAdmin = initializeFirebaseAdmin();

      if (authHeader?.startsWith('Bearer ') && firebaseAdmin) {
        // Verify Firebase ID token using Admin SDK
        const idToken = authHeader.substring(7);
        console.log('🔐 Firebase token extracted, attempting verification...');

        try {
          const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
          console.log('🔍 Firebase token decoded:', {
            uid: decodedToken.uid,
            email: decodedToken.email,
            email_verified: decodedToken.email_verified,
            name: decodedToken.name,
            picture: decodedToken.picture,
            provider_id: decodedToken.firebase?.identities
          });

          user = {
            id: decodedToken.uid,
            email: decodedToken.email || null,
            firstName: decodedToken.name?.split(' ')[0] || '',
            lastName: decodedToken.name?.split(' ').slice(1).join(' ') || '',
            phoneNumber: decodedToken.phone_number || null,
            profileImageUrl: decodedToken.picture || '',
            authProvider: 'firebase'
          };

          console.log('✅ Firebase user object created:', {
            id: user.id,
            email: user.email,
            hasEmail: !!user.email,
            firstName: user.firstName
          });
        } catch (error) {
          console.error('❌ Firebase token verification failed:', error);
          return res.status(401).json({ message: 'Invalid Firebase token' });
        }
      } else if (firebaseToken || userFromBody) {
        // Decode the Firebase token to extract user data
        let decodedUser = null;

        if (firebaseToken && typeof firebaseToken === 'string') {
          try {
            // Decode the JWT token (just parsing, not verifying for local dev)
            const base64Payload = firebaseToken.split('.')[1];
            const decodedPayload = JSON.parse(atob(base64Payload));

            console.log('🔍 Decoded Firebase token payload:', {
              uid: decodedPayload.user_id || decodedPayload.sub,
              email: decodedPayload.email,
              name: decodedPayload.name,
              picture: decodedPayload.picture,
              email_verified: decodedPayload.email_verified
            });

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

        // Use decoded token data or provided user data
        const userData = userFromBody || decodedUser || {};

        console.log('🔍 Using Firebase token data for local development:', {
          uid: userData.uid,
          email: userData.email,
          displayName: userData.displayName,
          photoURL: userData.photoURL
        });

        user = {
          id: userData.uid || `firebase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          email: userData.email || null,
          firstName: (userData.displayName)?.split(' ')[0] || '',
          lastName: (userData.displayName)?.split(' ').slice(1).join(' ') || '',
          phoneNumber: userData.phoneNumber || null,
          profileImageUrl: userData.photoURL || '',
          authProvider: 'firebase'
        };

        console.log('✅ Local Firebase user object created:', {
          id: user.id,
          email: user.email,
          hasEmail: !!user.email,
          firstName: user.firstName
        });
      } else {
        console.warn('⚠️  Firebase Admin not configured and no token data provided');
        return res.status(401).json({ message: 'Firebase authentication not available' });
      }

      if (!user) {
        return res.status(401).json({ message: 'No valid user data found' });
      }

      // Store user in database
      console.log('Storage: Upserting user with data:', user);
      const dbUser = await storage.upsertUser(user);
      console.log('Storage: User upserted successfully:', dbUser.id, dbUser.email);

      console.log('User created/updated in database:', dbUser.id, dbUser.email);

      // Create session structure
      const sessionUser = {
        claims: {
          sub: dbUser.id,
          email: dbUser.email,
          first_name: dbUser.firstName,
          last_name: dbUser.lastName,
          profile_image_url: dbUser.profileImageUrl,
          exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours from now
        },
        id: dbUser.id,
        email: dbUser.email
      };

      console.log('Session created with structure:', sessionUser);

      // Save session
      (req as any).session.user = sessionUser;

      console.log('Session ID:', (req as any).sessionID);
      (req as any).session.save((err: any) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ message: 'Session creation failed' });
        }

        console.log('✅ Session saved successfully');
        console.log('📋 Session data after save:', JSON.stringify((req as any).session, null, 2));
        console.log('🍪 Session cookie should be set with name: bingeboard.session');
        console.log('🍪 Cookie settings: secure=false, httpOnly=true, sameSite=lax (development mode)');
        console.log('🌐 Response will include Set-Cookie header for domain:', req.get('host'));

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
      });

    } catch (error: any) {
      console.error('Firebase session creation error:', error);
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

      const result = await tmdbService.getTrending(mediaType as 'tv' | 'movie' | 'all', timeWindow as 'day' | 'week');

      // Enrich with streaming data if requested
      if (includeStreaming && result.results) {
        const enrichedResults = await Promise.all(
          result.results.slice(0, 20).map(async (item: any) => { // Limit to first 20 for performance
            try {
              const itemMediaType = item.title ? 'movie' : 'tv';
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
                streamingPlatforms: streamingData.platforms
              };
            } catch (error) {
              console.warn(`Failed to get streaming data for ${item.id}:`, error);
              return item;
            }
          })
        );

        result.results = enrichedResults;
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

  app.get('/api/tmdb/discover/:type', async (req, res) => {
    try {
      const { type } = req.params;
      const filters = req.query;
      if (type === 'tv' || type === 'movie') {
        const result = await tmdbService.discover(type as 'tv' | 'movie', filters);
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



  // Firebase configuration test endpoint
  app.get('/api/test-firebase', (req, res) => {
    const firebaseConfig = {
      apiKey: process.env.VITE_FIREBASE_API_KEY ? 'Set' : 'Missing',
      authDomain: `${process.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      appId: process.env.VITE_FIREBASE_APP_ID ? 'Set' : 'Missing',
      currentDomain: req.get('host')
    };

    res.json({
      message: 'Firebase configuration check',
      config: firebaseConfig,
      timestamp: Date.now()
    });
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
      console.log('🔐 Firebase logout endpoint called');
      console.log('📋 Session ID before logout:', req.sessionID);
      console.log('📋 Session data:', JSON.stringify(req.session, null, 2));

      // Clear the session
      req.session.destroy((err: any) => {
        if (err) {
          console.error('❌ Session destroy error:', err);
          return res.status(500).json({ message: 'Failed to logout' });
        }

        console.log('✅ Session destroyed successfully');
        // Clear the custom session cookie (bingeboard.session)
        res.clearCookie('bingeboard.session', {
          path: '/',
          domain: undefined,
          secure: true,
          httpOnly: true,
          sameSite: 'none'
        });

        console.log('✅ Session cookie cleared');
        res.json({ success: true, message: 'Logged out successfully' });
      });
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
        // Clear the custom session cookie (bingeboard.session)
        res.clearCookie('bingeboard.session', {
          path: '/',
          domain: undefined,
          secure: true,
          httpOnly: true,
          sameSite: 'none'
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

      // Update user in database
      const user = await storage.updateUser('manual_1752272712977_25fdy83s7', {
        onboardingCompleted: true
      });

      console.log('✅ Onboarding force completed for user:', email);
      res.json({ success: true, user, message: 'Onboarding marked as complete' });
    } catch (error) {
      console.error('Error force completing onboarding:', error);
      res.status(500).json({ message: 'Failed to complete onboarding' });
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
            preferredGenres: onboardingData.preferences.genres || [],
            preferredNetworks: onboardingData.preferences.platforms || [],
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
          });
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
      const createdUser = await storage.upsertUser(newUser);

      console.log('✅ Manual user created successfully:', createdUser.id, createdUser.email);
      res.json({ message: 'User created successfully', user: createdUser });

    } catch (error: any) {
      console.error('❌ Error creating manual user:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Debug endpoint to set a test password for a user
  app.post('/api/debug/set-password', async (req, res) => {
    try {
      const { email, password = 'test123' } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      console.log(`🔧 Setting test password for: ${email}`);

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        console.log(`❌ No user found for email: ${email}`);
        return res.status(404).json({ error: 'User not found' });
      }

      // Hash the password
      const { hashPassword } = await import('./auth');
      const hashedPassword = await hashPassword(password);

      // Update user with password hash
      const updatedUser = await storage.upsertUser({
        ...user,
        passwordHash: hashedPassword,
        authProvider: 'email' // Ensure it's set to email for password login
      });

      console.log(`✅ Password set for user: ${email}`);
      res.json({
        message: 'Password set successfully',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          hasPassword: !!updatedUser.passwordHash
        }
      });

    } catch (error: any) {
      console.error('❌ Error setting password:', error);
      res.status(500).json({ error: error.message });
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

  // User stats endpoint for dashboard
  app.get('/api/user/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;

      // Get comprehensive user stats from storage
      const stats = await storage.getUserStats(userId);

      res.json(stats);
    } catch (error: any) {
      console.error('Error fetching user stats:', error);
      res.status(500).json({ error: 'Failed to fetch user stats' });
    }
  });

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
      let userPreferences = await storage.getUserPreferences(userId);

      // If no preferences, create smart defaults based on popular choices
      if (!userPreferences || !userPreferences.preferredGenres) {
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
      if (userPreferences && userPreferences.preferredGenres?.length && !userPreferences.onboardingCompleted) {
        try {
          userPreferences.onboardingCompleted = true;
          await storage.updateUserPreferences(userId, { ...userPreferences, onboardingCompleted: true });
          console.log('✅ Onboarding marked as completed since user has preferences');
        } catch (error) {
          console.error('❌ Error updating onboarding status:', error);
        }
      }

      console.log('📊 Using preferences:', {
        genres: userPreferences?.preferredGenres,
        networks: userPreferences?.preferredNetworks,
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
            const genreMatches = itemGenres.filter((genre: string) =>
              userPreferences?.preferredGenres?.some((prefGenre: string) =>
                prefGenre.toLowerCase().includes(genre.toLowerCase()) ||
                genre.toLowerCase().includes(prefGenre.toLowerCase())
              )
            );
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

  // Progress tracking endpoint
  app.get('/api/progress/current', isAuthenticated, async (req: any, res) => {
    try {
      // TODO: Implement progress tracking from database
      res.json({
        currentlyWatching: [],
        message: "Progress tracking feature coming soon"
      });
    } catch (error) {
      console.error('Error fetching progress:', error);
      res.status(500).json({ error: 'Failed to fetch progress' });
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

  // Return undefined - server is created in index.ts
  return undefined as unknown as Server;
}
