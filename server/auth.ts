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
  
  console.log('Firebase authentication system initialized');
  console.log('All OAuth authentication handled by Firebase');
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  console.log("🔍 isAuthenticated middleware triggered");

  // Check if session exists
  if (!req.session) {
    console.warn("⚠️ req.session is missing");
    return res.status(401).json({ message: "Unauthorized - no session" });
  }

  // Check if user is set on session
  if (!req.session.user) {
    console.warn("⚠️ req.session.user is undefined");
    console.log("🔎 req.session:", JSON.stringify(req.session, null, 2));
    return res.status(401).json({ message: "Unauthorized - no user" });
  }

  // Check if user has claims
  if (!req.session.user.claims) {
    console.warn("⚠️ req.session.user.claims is undefined");
    return res.status(401).json({ message: "Unauthorized - no claims" });
  }

  // Check if token is expired
  const now = Math.floor(Date.now() / 1000);
  if (req.session.user.claims.exp && now > req.session.user.claims.exp) {
    console.warn("⚠️ Token expired");
    return res.status(401).json({ message: "Unauthorized - token expired" });
  }

  // Set req.user for route handlers
  (req as any).user = req.session.user;
  console.log("✅ Authenticated user:", req.session.user.email || req.session.user.id);
  console.log("✅ Set req.user:", JSON.stringify((req as any).user, null, 2));
  
  next();
};

// Export utility functions for password handling
export { hashPassword, verifyPassword };