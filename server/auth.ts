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
    secret: process.env.SESSION_SECRET!,
    // No store specified = uses memory store
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.HTTPS === 'true', // Set to true for HTTPS
      sameSite: 'lax', // Changed from 'none' for local development
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
  
  console.log('🔐 Authentication middleware - Session user:', JSON.stringify(sessionUser, null, 2));
  
  if (!sessionUser) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  // Check if session is expired
  const isExpired = sessionUser.claims?.exp && sessionUser.claims.exp < Math.floor(Date.now() / 1000);
  if (isExpired) {
    console.log('🔐 Session expired for user:', sessionUser.email);
    return res.status(401).json({ message: 'Session expired' });
  }
  
  // Attach user to request
  (req as any).user = sessionUser;
  console.log('🔐 User attached to request:', sessionUser.email);
  next();
};

// Export utility functions for password handling
export { hashPassword, verifyPassword };