import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import bcrypt from "bcryptjs";
import { storage } from "./storage";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  // Add error handling for session store
  sessionStore.on('error', (error) => {
    console.error('Session store error:', error);
  });
  
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to false for development (HTTP)
      sameSite: 'lax', // Allow cross-site cookies for OAuth
      maxAge: sessionTtl,
      path: '/', // Ensure cookie is available for all paths
      domain: undefined, // Let browser determine domain
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
  
  // Add bulletproof authentication middleware
  const { BulletproofAuth } = await import('./bulletproof-auth');
  
  // Add session recovery middleware for all requests
  app.use(BulletproofAuth.createSessionRecoveryMiddleware());
  
  // Add emergency fallback for complete failures
  app.use(BulletproofAuth.createEmergencyFallback());
  
  // Validate system stability on startup
  const isStable = await BulletproofAuth.validateReplicationStability();
  if (!isStable) {
    console.error('🚨 System stability check failed - authentication may be unreliable');
  }
  
  console.log('✅ Firebase authentication system initialized with bulletproof protection');
  console.log('✅ All OAuth authentication handled by Firebase with fallback systems');
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const { BulletproofAuth } = await import('./bulletproof-auth');
  return BulletproofAuth.createRobustAuthMiddleware()(req, res, next);
};

// Export utility functions for password handling
export { hashPassword, verifyPassword };