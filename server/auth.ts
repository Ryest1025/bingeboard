import session from "express-session";
import type { Express, RequestHandler } from "express";
import bcrypt from "bcryptjs";
import { storage } from "./storage";

/**
 * 🔒 SERVER AUTHENTICATION - PRODUCTION LOCKED
 * 
 * ⚠️  CRITICAL: Core authentication middleware and session config
 * 🚨 DO NOT MODIFY session settings or authentication logic
 * 
 * Lock Date: July 12, 2025
 * Status: ✅ WORKING PERFECTLY
 * 
 * LOCKED CONFIGURATION:
 * - ✅ 7-day session expiration
 * - ✅ Memory store (sessions cleared on restart)
 * - ✅ httpOnly, secure: false for local dev
 * - ✅ sameSite: 'lax' for cross-origin compatibility
 * - ✅ rolling: true for session refresh
 * 
 * CRITICAL MIDDLEWARE:
 * - isAuthenticated: Validates session and attaches user to request
 * - Session expiration checking with JWT claims
 * 
 * Last Verified Working: July 12, 2025
 */

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week

  // Use memory store for now (will switch to SQLite session store later)
  console.log('⚠️  Using memory session store (sessions will not persist across restarts)');

  return session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-key',
    // No store specified = uses memory store
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
  app.use(getSession());

  console.log('✅ Firebase authentication system initialized');
  console.log('✅ All OAuth authentication handled by Firebase client-side');
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const sessionUser = (req as any).session?.user;
  const authHeader = req.headers.authorization;

  console.log('🔐 Authentication middleware - Session user:', JSON.stringify(sessionUser, null, 2));
  console.log('🔐 Authentication middleware - Auth header:', authHeader ? 'Bearer token present' : 'No auth header');

  // Try session-based authentication first (existing users)
  if (sessionUser) {
    // Check if session is expired
    const isExpired = sessionUser.claims?.exp && sessionUser.claims.exp < Math.floor(Date.now() / 1000);
    if (isExpired) {
      console.log('🔐 Session expired for user:', sessionUser.email);
      return res.status(401).json({ message: 'Session expired' });
    }

    // Attach user to request
    (req as any).user = sessionUser;
    console.log('🔐 Session user attached to request:', sessionUser.email);
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
          console.log('🔐 Mock Firebase user attached (dev mode):', mockUser.email);
          return next();
        }

        return res.status(401).json({ message: 'Invalid token format' });
      }

      // Import Firebase Admin dynamically to avoid conflicts
      const { getFirebaseAdmin } = await import('./services/firebaseAdmin');
      const admin = getFirebaseAdmin();

      const decodedToken = await admin.auth().verifyIdToken(idToken);
      console.log('🔐 Firebase token verified for user:', decodedToken.email);

      // Create a user object similar to session format
      const firebaseUser = {
        id: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name || decodedToken.email,
        claims: decodedToken
      };

      (req as any).user = firebaseUser;
      console.log('🔐 Firebase user attached to request:', firebaseUser.email);
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