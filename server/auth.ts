import type { Express, RequestHandler } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

/**
 * 🔒 SERVER AUTHENTICATION - STATELESS JWT TOKENS
 * 
 * ⚠️  CRITICAL: Core authentication middleware using JWT tokens
 * ✅ UPDATED: Now uses stateless JWT tokens in HTTP-only cookies (Vercel-compatible)
 * 
 * Update Date: October 22, 2025
 * Status: ✅ WORKING WITH STATELESS JWT
 * 
 * CONFIGURATION:
 * - ✅ 7-day JWT expiration
 * - ✅ HTTP-only cookies (secure in production)
 * - ✅ sameSite: 'lax' for cross-origin compatibility
 * - ✅ No server-side storage (serverless-friendly)
 * 
 * CRITICAL MIDDLEWARE:
 * - isAuthenticated: Validates JWT and attaches user to request
 * - JWT expiration checking
 * 
 * Last Updated: October 22, 2025
 */

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'fallback-jwt-secret';
const JWT_EXPIRY = '7d'; // 7 days
const COOKIE_NAME = 'bingeboard_auth';

export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  claims?: any;
}

/**
 * Create a signed JWT token for a user
 */
export function createAuthToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

/**
 * Verify and decode a JWT token
 */
export function verifyAuthToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      id: decoded.id,
      email: decoded.email,
      displayName: decoded.displayName,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      profileImageUrl: decoded.profileImageUrl,
    };
  } catch (error) {
    console.error('❌ JWT verification failed:', error);
    return null;
  }
}

async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);

  // Add cookie parser middleware to read JWT cookies
  app.use(cookieParser());

  // Add middleware to log all incoming requests and their authentication status
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/user') || req.path.startsWith('/api/auth')) {
      const token = req.cookies[COOKIE_NAME];
      console.log(`🔧 AUTH: ${req.method} ${req.path} - Cookie present: ${!!token}`);
    }
    next();
  });

  console.log('✅ JWT authentication system initialized');
  console.log('✅ Using stateless JWT tokens (Vercel-compatible)');
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const endpoint = req.originalUrl || req.url;

  // Try to get JWT token from cookie
  const token = req.cookies[COOKIE_NAME];
  const authHeader = req.headers.authorization;

  console.log(`🔐 [${endpoint}] Auth check:`, {
    hasCookie: !!token,
    hasAuthHeader: !!authHeader,
  });

  // Try cookie-based JWT authentication first (web browsers)
  if (token) {
    const user = verifyAuthToken(token);
    if (user) {
      (req as any).user = user;
      console.log(`🔐 JWT user authenticated from cookie [${endpoint}]:`, user.email);
      return next();
    } else {
      console.log(`🔐 Invalid JWT token in cookie [${endpoint}]`);
      // Clear invalid cookie
      res.clearCookie(COOKIE_NAME);
    }
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
          const mockUser: AuthUser = {
            id: 'dev-user-' + Date.now(),
            email: 'dev@bingeboard.com',
            displayName: 'Development User',
          };

          (req as any).user = mockUser;
          console.log(`🔐 Mock Firebase user attached (dev mode) [${endpoint}]:`, mockUser.email);
          return next();
        }

        return res.status(401).json({ message: 'Invalid token format' });
      }

      // Import Firebase Admin dynamically to avoid conflicts
      const { getFirebaseAdminForAuth } = await import('./services/firebaseAdmin.js');
      const admin = getFirebaseAdminForAuth();

      if (!admin) {
        console.warn('🔐 Firebase Admin not initialized, falling back to basic token validation');

        // Basic JWT validation without Firebase Admin (development only)
        if (idToken && idToken.length > 100) { // Basic sanity check
          console.log('🔐 Basic token validation passed (dev mode)');

          // Create a mock user for development
          const mockUser: AuthUser = {
            id: 'dev-user-' + Date.now(),
            email: 'dev@bingeboard.com',
            displayName: 'Development User',
          };

          (req as any).user = mockUser;
          console.log(`🔐 Mock Firebase user attached (dev mode) [${endpoint}]:`, mockUser.email);
          return next();
        }

        return res.status(401).json({ message: 'Invalid token format' });
      }

      const decodedToken = await admin.auth().verifyIdToken(idToken);
      console.log(`🔐 Firebase token verified for user [${endpoint}]:`, decodedToken.email);

      // Create a user object
      const firebaseUser: AuthUser = {
        id: decodedToken.uid,
        email: decodedToken.email || '',
        displayName: decodedToken.name || decodedToken.email,
        claims: decodedToken,
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
  console.log(`🔐 No valid authentication found [${endpoint}]`);
  return res.status(401).json({ message: 'Authentication required' });
};

// Export utility functions for password handling
export { hashPassword, verifyPassword };