import type { Express } from "express";
import { type Server } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// import authRoutes from './routes/auth';
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
  // Auth middleware
  await setupAuth(app);

  // Debug middleware to log all requests and cookies
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/auth')) {
      console.log(`📋 ${req.method} ${req.path}`);
      console.log('📋 Session ID:', (req as any).sessionID);
      console.log('📋 Session exists:', !!(req as any).session);
      console.log('📋 Session data:', JSON.stringify((req as any).session, null, 2));
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
        
        console.log('Session saved successfully');
        console.log('Session data after save:', JSON.stringify((req as any).session, null, 2));
        
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
      const user = await storage.getUser(userId);
      
      if (!user) {
        console.error('User not found in database:', userId);
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
      req.session.destroy((err) => {
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
      req.session.destroy((err) => {
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
      
      if (!email || !password) {
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

  // Return undefined - server is created in index.ts
  return undefined as unknown as Server;
}
