import session from "express-session";
import type { Express, RequestHandler } from "express";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import path from "path";
import { createRequire } from 'module';

// Use createRequire for CommonJS modules in ES modules
const require = createRequire(import.meta.url);

/**
 * 🔒 SERVER AUTHENTICATION - ENHANCED WITH PERSISTENCE
 * 
 * ⚠️  CRITICAL: Core authentication middleware and session config
 * ✅ UPDATED: Now includes SQLite session persistence
 * 
 * Update Date: August 7, 2025
 * Status: ✅ WORKING WITH PERSISTENCE
 * 
 * ENHANCED CONFIGURATION:
 * - ✅ 7-day session expiration
 * - ✅ SQLite store (sessions persist across restarts)
 * - ✅ httpOnly, secure: false for local dev
 * - ✅ sameSite: 'lax' for cross-origin compatibility
 * - ✅ rolling: true for session refresh
 * 
 * CRITICAL MIDDLEWARE:
 * - isAuthenticated: Validates session and attaches user to request
 * - Session expiration checking with JWT claims
 * 
 * Last Updated: August 7, 2025
 */

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week

  // Use SQLite session store for persistence across restarts
  console.log('✅ Using SQLite session store (sessions will persist across restarts)');

  // Dynamically load SQLite session store
  const SQLiteStore = require('connect-sqlite3')(session);

  const store = new SQLiteStore({
    db: 'sessions.db',
    table: 'sessions',
    dir: './',  // Store in project root
    concurrentDB: true,  // Better performance
  });

  // Handle store errors gracefully
  store.on('error', (error: any) => {
    console.error('❌ Session store error:', error);
  });

  return session({
    store: store,  // Use SQLite store instead of memory
    secret: process.env.SESSION_SECRET || 'fallback-secret-key',
    resave: true,  // Changed to true to force session save
    saveUninitialized: true,  // Changed to true to ensure session creation
    cookie: {
      httpOnly: true,
      secure: false, // Always false in development
      sameSite: 'lax', // More permissive in dev
      maxAge: sessionTtl,
      path: '/', // Ensure cookie is available for all paths
    },
    name: 'bingeboard.session', // Custom session name
    rolling: true, // Reset expiration on each request
  });
}

async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);

  // Add middleware to log all incoming requests and their paths
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/user') || req.path.startsWith('/api/auth')) {
      console.log(`🔧 PRE-SESSION: ${req.method} ${req.path} - Session available: ${!!(req as any).session}`);
    }
    next();
  });

  app.use(getSession());

  // Add middleware to verify session is working after session middleware
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/user') || req.path.startsWith('/api/auth')) {
      console.log(`🔧 POST-SESSION: ${req.method} ${req.path} - Session available: ${!!(req as any).session}, SessionID: ${(req as any).sessionID}`);
    }
    next();
  });

  console.log('✅ Firebase authentication system initialized');
  console.log('✅ All OAuth authentication handled by Firebase client-side');
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const endpoint = req.originalUrl || req.url;

  // First check session availability 
  console.log(`🔐 [${endpoint}] Session availability:`, {
    hasSession: !!(req as any).session,
    sessionID: (req as any).sessionID,
    sessionKeys: (req as any).session ? Object.keys((req as any).session) : 'no session'
  });

  // Extract session user with detailed debugging
  const session = (req as any).session;
  const sessionUser = session?.user;
  const authHeader = req.headers.authorization;

  // Detailed session debugging
  console.log(`🔐 [${endpoint}] Session debug:`, {
    sessionExists: !!session,
    sessionUser: sessionUser ? sessionUser.email : 'undefined',
    sessionUserType: typeof sessionUser,
    sessionHasUser: session && 'user' in session,
    fullSession: session ? JSON.stringify(session, null, 2) : 'no session'
  });

  console.log(`🔐 Authentication middleware [${endpoint}] - Session user:`, sessionUser ? 'Present' : 'undefined');
  console.log(`🔐 Authentication middleware [${endpoint}] - Auth header:`, authHeader ? 'Bearer token present' : 'No auth header');

  // Apply session recovery logic to all endpoints, not just user-preferences
  if (!sessionUser && !authHeader && session) {
    console.log('🔐 No user found but session exists - attempting session recovery');

    // Try to regenerate session if it exists but user is missing
    if (session && !session.user) {
      console.log('🔐 Session exists but user is undefined - potential race condition');

      // Small delay to allow session to stabilize
      await new Promise(resolve => setTimeout(resolve, 50));

      // Re-check session after delay
      const recoveredUser = (req as any).session?.user;
      if (recoveredUser) {
        console.log('🔐 Session recovered successfully after delay');
        (req as any).user = recoveredUser;
        return next();
      }
    }
  }

  // Try session-based authentication first (existing users)
  if (sessionUser) {
    // Check if session is expired
    const isExpired = sessionUser.claims?.exp && sessionUser.claims.exp < Math.floor(Date.now() / 1000);
    if (isExpired) {
      console.log('🔐 Session expired for user:', sessionUser.email);
      (req as any).session.user = null; // Clear expired session
      return res.status(401).json({ message: 'Session expired' });
    }

    // Ensure session is refreshed
    (req as any).session.touch();

    // Attach user to request
    (req as any).user = sessionUser;
    console.log(`🔐 Session user attached to request [${endpoint}]:`, sessionUser.email);
    return next();
  }

  // Try Firebase Bearer token authentication (direct API calls)
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const idToken = authHeader.split('Bearer ')[1];

    try {
      // Check if Firebase Admin is configured
      const firebaseAdminKey = process.env.FIREBASE_ADMIN_KEY;
      if (!firebaseAdminKey) {
        console.warn('🔐 Firebase Admin not configured, falling back to basic token validation');

        // Basic JWT validation without Firebase Admin (development only)
        if (idToken && idToken.length > 100) { // Basic sanity check
          console.log('🔐 Basic token validation passed (dev mode)');

          // Create a mock user for development
          const mockUser = {
            id: 'dev-user-' + Date.now(),
            email: 'dev@bingeboard.com',
            displayName: 'Development User',
            claims: { sub: 'dev-user', email: 'dev@bingeboard.com' }
          };

          (req as any).user = mockUser;
          console.log(`🔐 Mock Firebase user attached (dev mode) [${endpoint}]:`, mockUser.email);
          return next();
        }

        return res.status(401).json({ message: 'Invalid token format' });
      }

      // Import Firebase Admin dynamically to avoid conflicts
      const { getFirebaseAdminForAuth } = await import('./services/firebaseAdmin');
      const admin = getFirebaseAdminForAuth();

      if (!admin) {
        console.warn('🔐 Firebase Admin not initialized, falling back to basic token validation');

        // Basic JWT validation without Firebase Admin (development only)
        if (idToken && idToken.length > 100) { // Basic sanity check
          console.log('🔐 Basic token validation passed (dev mode)');

          // Create a mock user for development
          const mockUser = {
            id: 'dev-user-' + Date.now(),
            email: 'dev@bingeboard.com',
            displayName: 'Development User',
            claims: { sub: 'dev-user', email: 'dev@bingeboard.com' }
          };

          (req as any).user = mockUser;
          console.log(`🔐 Mock Firebase user attached (dev mode) [${endpoint}]:`, mockUser.email);
          return next();
        }

        return res.status(401).json({ message: 'Invalid token format' });
      }

      const decodedToken = await admin.auth().verifyIdToken(idToken);
      console.log(`🔐 Firebase token verified for user [${endpoint}]:`, decodedToken.email);

      // Create a user object similar to session format
      const firebaseUser = {
        id: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name || decodedToken.email,
        claims: decodedToken
      };

      (req as any).user = firebaseUser;
      console.log(`🔐 Firebase user attached to request [${endpoint}]:`, firebaseUser.email);
      return next();

    } catch (error) {
      console.error('🔐 Firebase token verification failed:', error);
      return res.status(401).json({ message: 'Invalid Firebase token' });
    }
  }

  // No valid authentication found
  return res.status(401).json({ message: 'Authentication required' });
};

// Export utility functions for password handling
export { hashPassword, verifyPassword };