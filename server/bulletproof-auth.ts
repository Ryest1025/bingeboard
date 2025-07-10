/**
 * BULLETPROOF AUTHENTICATION SYSTEM
 * PURPOSE: Prevents daily authentication breakage caused by Replit instability
 * CRITICAL: This system is designed to survive Replit restarts and hot reloads
 */

import { RequestHandler } from "express";

export class BulletproofAuth {
  
  /**
   * Enhanced authentication middleware that survives Replit crashes
   * Implements multiple fallback mechanisms
   */
  static createRobustAuthMiddleware(): RequestHandler {
    return async (req, res, next) => {
      console.log('🛡️ BulletproofAuth: Starting enhanced authentication check');
      
      try {
        // Step 1: Check session structure with deep validation
        if (!req.session) {
          console.log('🛡️ BulletproofAuth: No session object found');
          return res.status(401).json({ message: "Unauthorized - no session" });
        }

        // Step 2: Check for user in session with detailed logging
        if (!req.session.user) {
          console.log('🛡️ BulletproofAuth: No user in session');
          console.log('🛡️ Session contents:', Object.keys(req.session));
          return res.status(401).json({ message: "Unauthorized - no user" });
        }

        const sessionUser = req.session.user;

        // Step 3: Validate user structure
        if (!sessionUser.id || !sessionUser.email) {
          console.log('🛡️ BulletproofAuth: Invalid user structure');
          console.log('🛡️ User object keys:', Object.keys(sessionUser));
          return res.status(401).json({ message: "Unauthorized - invalid user" });
        }

        // Step 4: Check claims structure (Firebase specific)
        if (!sessionUser.claims || !sessionUser.claims.sub) {
          console.log('🛡️ BulletproofAuth: Missing or invalid claims');
          return res.status(401).json({ message: "Unauthorized - invalid claims" });
        }

        // Step 5: Check token expiration with grace period
        const now = Math.floor(Date.now() / 1000);
        const exp = sessionUser.claims.exp;
        
        if (exp && exp < now) {
          const gracePeriod = 24 * 60 * 60; // 24 hours grace period
          if (exp + gracePeriod < now) {
            console.log('🛡️ BulletproofAuth: Token expired beyond grace period');
            return res.status(401).json({ message: "Unauthorized - token expired" });
          } else {
            console.log('🛡️ BulletproofAuth: Token expired but within grace period');
          }
        }

        // Step 6: Set req.user with enhanced logging
        req.user = sessionUser;
        console.log('✅ BulletproofAuth: Authentication successful');
        console.log('✅ User ID:', sessionUser.id);
        console.log('✅ User Email:', sessionUser.email);
        
        next();
        
      } catch (error) {
        console.error('🛡️ BulletproofAuth: Authentication error:', error);
        return res.status(401).json({ message: "Unauthorized - auth error" });
      }
    };
  }

  /**
   * Session recovery system for Firebase auth
   * Automatically restores sessions after Replit restarts
   */
  static createSessionRecoveryMiddleware(): RequestHandler {
    return async (req, res, next) => {
      // Only run on auth endpoints to avoid overhead
      if (!req.path.includes('/api/auth/')) {
        return next();
      }

      console.log('🔄 SessionRecovery: Checking for recovery needs');
      
      try {
        // Check if we need to recover a session
        const firebaseToken = req.headers.authorization?.replace('Bearer ', '');
        
        if (firebaseToken && !req.session.user) {
          console.log('🔄 SessionRecovery: Firebase token found but no session - attempting recovery');
          
          // Import Firebase admin for token verification
          const { initializeFirebaseAdmin } = await import('./firebase-admin');
          const admin = initializeFirebaseAdmin();
          
          try {
            const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
            
            // Recreate session from Firebase token
            const sessionUser = {
              id: decodedToken.uid,
              email: decodedToken.email,
              claims: {
                sub: decodedToken.uid,
                email: decodedToken.email,
                first_name: decodedToken.name?.split(' ')[0] || '',
                last_name: decodedToken.name?.split(' ').slice(1).join(' ') || '',
                profile_image_url: decodedToken.picture || '',
                exp: decodedToken.exp
              }
            };
            
            req.session.user = sessionUser;
            console.log('✅ SessionRecovery: Session recovered successfully');
            
          } catch (tokenError) {
            console.log('🔄 SessionRecovery: Invalid Firebase token');
          }
        }
        
        next();
        
      } catch (error) {
        console.error('🔄 SessionRecovery: Recovery error:', error);
        next(); // Continue even if recovery fails
      }
    };
  }

  /**
   * Replit-specific stability checks
   * Validates environment and dependencies
   */
  static async validateReplicationStability(): Promise<boolean> {
    try {
      console.log('🏗️ StabilityCheck: Validating Replit environment');
      
      // Check 1: Verify NODE_ENV is set
      if (!process.env.NODE_ENV) {
        console.error('🏗️ StabilityCheck: NODE_ENV not set - this causes inconsistent behavior');
        return false;
      }
      
      // Check 2: Verify critical packages are available
      const criticalPackages = [
        'express',
        'express-session', 
        'firebase-admin',
        'drizzle-orm'
      ];
      
      for (const pkg of criticalPackages) {
        try {
          require.resolve(pkg);
        } catch {
          console.error(`🏗️ StabilityCheck: Critical package missing: ${pkg}`);
          return false;
        }
      }
      
      // Check 3: Verify database connection
      try {
        const { db } = await import('./db');
        await db.select().from(require('@shared/schema').users).limit(1);
        console.log('✅ StabilityCheck: Database connection verified');
      } catch (dbError) {
        console.error('🏗️ StabilityCheck: Database connection failed:', dbError);
        return false;
      }
      
      // Check 4: Verify Firebase Admin SDK
      try {
        const { initializeFirebaseAdmin } = await import('./firebase-admin');
        const admin = initializeFirebaseAdmin();
        console.log('✅ StabilityCheck: Firebase Admin SDK verified');
      } catch (firebaseError) {
        console.error('🏗️ StabilityCheck: Firebase Admin SDK failed:', firebaseError);
        return false;
      }
      
      console.log('✅ StabilityCheck: All systems stable');
      return true;
      
    } catch (error) {
      console.error('🏗️ StabilityCheck: Validation failed:', error);
      return false;
    }
  }

  /**
   * Emergency fallback system for complete authentication failure
   * Provides graceful degradation instead of crashes
   */
  static createEmergencyFallback(): RequestHandler {
    return (req, res, next) => {
      // This runs if all other auth methods fail
      if (req.path.includes('/api/auth/user') && !req.user) {
        console.log('🚨 EmergencyFallback: Providing temporary session for stability');
        
        // Return a temporary error state instead of crashing
        return res.status(401).json({ 
          message: "Authentication system temporarily unavailable",
          recovery: true,
          instruction: "Please refresh the page to restore your session"
        });
      }
      
      next();
    };
  }
}

export default BulletproofAuth;