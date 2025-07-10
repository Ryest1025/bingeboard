import * as client from "openid-client";
import { Strategy as OIDCStrategy, type VerifyFunction } from "openid-client/passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import bcrypt from "bcryptjs";
import { storage } from "./storage";

if (!process.env.REPLIT_DOMAINS) {
  console.warn("Environment variable REPLIT_DOMAINS not provided, using default");
  process.env.REPLIT_DOMAINS = "80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev";
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

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
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Replit OIDC Strategy
  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  // Register strategies for all domains (custom + Replit)
  const customDomains = process.env.REPLIT_DOMAINS?.split(',') || [];
  const replitDomain = process.env.REPLIT_DEV_DOMAIN || '80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev';
  const allDomains = [...customDomains, replitDomain];
  console.log('All configured domains:', allDomains.join(', '));
  
  for (const domain of allDomains) {
    const strategy = new OIDCStrategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  // Also register for localhost development
  const localhostStrategy = new OIDCStrategy(
    {
      name: `replitauth:localhost`,
      config,
      scope: "openid email profile offline_access",
      callbackURL: `https://${process.env.REPLIT_DOMAINS!.split(",")[0]}/api/callback`,
    },
    verify,
  );
  passport.use(localhostStrategy);

  // Local Email/Password Strategy
  passport.use(new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email: string, password: string, done) => {
      try {
        const user = await storage.getUserByEmail(email);
        
        if (!user) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        if (!user.passwordHash) {
          return done(null, false, { message: 'Please use social login for this account' });
        }

        const isValidPassword = await verifyPassword(password, user.passwordHash);
        
        if (!isValidPassword) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        // Create session user object
        const sessionUser = {
          claims: {
            sub: user.id,
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName,
            profile_image_url: user.profileImageUrl,
            exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
          }
        };

        return done(null, sessionUser);
      } catch (error) {
        return done(error);
      }
    }
  ));

  // Facebook Strategy
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    // Use current Replit domain for callback URL
    const currentDomain = process.env.REPLIT_DEV_DOMAIN || '80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev';
    const callbackURL = `https://${currentDomain}/api/auth/facebook/callback`;
    
    console.log(`Configuring Facebook auth with callback: ${callbackURL}`);
    console.log(`Facebook App ID: ${process.env.FACEBOOK_APP_ID}`);
    console.log(`Current domain: ${currentDomain}`);
    
    passport.use(new FacebookStrategy({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: callbackURL,
      profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
      scope: ['email', 'public_profile']
    },
    async (accessToken: string, refreshToken: string, profile: any, done) => {
      try {
        console.log('Facebook auth success - Profile received:', {
          id: profile.id,
          emails: profile.emails,
          name: profile.name
        });
        
        const email = profile.emails?.[0]?.value;
        const firstName = profile.name?.givenName;
        const lastName = profile.name?.familyName;
        const profileImageUrl = profile.photos?.[0]?.value;

        // Check if user exists by Facebook ID or email
        let user = await storage.getUserByFacebookId(profile.id);
        
        if (!user && email) {
          user = await storage.getUserByEmail(email);
        }

        if (user) {
          // Update Facebook ID if not set
          if (!user.facebookId) {
            user = await storage.updateUser(user.id, { facebookId: profile.id });
          }
        } else {
          // Create new user
          user = await storage.upsertUser({
            id: `fb_${profile.id}`,
            email: email,
            firstName: firstName,
            lastName: lastName,
            profileImageUrl: profileImageUrl,
            facebookId: profile.id,
            authProvider: 'facebook'
          });
        }

        // Create session user object
        const sessionUser = {
          claims: {
            sub: user.id,
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName,
            profile_image_url: user.profileImageUrl,
            exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
          }
        };

        return done(null, sessionUser);
      } catch (error) {
        console.error('Facebook auth error:', error);
        return done(error);
      }
    }));
  } else {
    console.log('Facebook OAuth not configured - missing FACEBOOK_APP_ID or FACEBOOK_APP_SECRET');
  }

  // Google Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    // Use current Replit domain for callback URL
    const currentDomain = process.env.REPLIT_DEV_DOMAIN || '80d1bb7f-86b2-4c58-a8e0-62a1673122a3-00-2vv88inpi4v1.riker.replit.dev';
    const callbackURL = `https://${currentDomain}/api/auth/google/callback`;
    
    console.log(`Configuring Google auth with callback: ${callbackURL}`);
    console.log(`Google Client ID: ${process.env.GOOGLE_CLIENT_ID}`);
    console.log(`Google Client Secret exists: ${!!process.env.GOOGLE_CLIENT_SECRET}`);
    console.log(`Current domain: ${currentDomain}`);
    
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: callbackURL,
      scope: ['profile', 'email']
    },
    async (accessToken: string, refreshToken: string, profile: any, done) => {
      try {
        console.log('Google auth success - Profile received:', {
          id: profile.id,
          emails: profile.emails,
          name: profile.name
        });
        
        const email = profile.emails?.[0]?.value;
        const firstName = profile.name?.givenName;
        const lastName = profile.name?.familyName;
        const profileImageUrl = profile.photos?.[0]?.value;

        // Check if user exists by Google ID or email
        let user = await storage.getUserByGoogleId(profile.id);
        
        if (!user && email) {
          user = await storage.getUserByEmail(email);
        }

        if (user) {
          // Update Google ID if not set
          if (!user.googleId) {
            user = await storage.updateUser(user.id, { googleId: profile.id });
          }
        } else {
          // Create new user
          user = await storage.upsertUser({
            id: `g_${profile.id}`,
            email: email,
            firstName: firstName,
            lastName: lastName,
            profileImageUrl: profileImageUrl,
            googleId: profile.id,
            authProvider: 'google'
          });
        }

        // Create session user object for Google OAuth
        const sessionUser = {
          claims: {
            sub: user.id,
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName,
            profile_image_url: user.profileImageUrl,
            exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
          }
        };

        console.log('Google auth - created session user:', sessionUser.claims.email);
        return done(null, sessionUser);
      } catch (error) {
        console.error('Google auth error:', error);
        return done(error);
      }
    }));
  }

  passport.serializeUser((user: Express.User, cb) => {
    console.log('Serializing user:', JSON.stringify(user, null, 2));
    cb(null, user);
  });
  
  passport.deserializeUser((user: Express.User, cb) => {
    console.log('Deserializing user:', JSON.stringify(user, null, 2));
    cb(null, user);
  });

  // Replit Auth Routes
  app.get("/api/login", (req, res, next) => {
    try {
      const hostname = req.hostname || req.headers.host?.split(':')[0] || 'localhost';
      console.log(`Login attempt for hostname: ${hostname}`);
      console.log('Available strategies:', Object.keys(passport._strategies || {}));
      
      // Check if the strategy exists
      const strategyName = `replitauth:${hostname}`;
      if (!passport._strategies[strategyName]) {
        console.error(`Strategy ${strategyName} not found`);
        return res.status(500).json({ 
          message: "Authentication strategy not configured", 
          hostname,
          availableStrategies: Object.keys(passport._strategies || {})
        });
      }
      
      const authenticator = passport.authenticate(strategyName, {
        prompt: "login consent",
        scope: ["openid", "email", "profile", "offline_access"],
      });
      
      authenticator(req, res, (err) => {
        if (err) {
          console.error('Authentication error:', err);
          return res.status(401).json({ 
            message: "Authentication failed", 
            error: err.message,
            strategy: strategyName 
          });
        }
        next();
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: "Authentication error", error: error.message });
    }
  });

  app.get("/api/callback", (req, res, next) => {
    const hostname = req.hostname || req.headers.host?.split(':')[0] || 'localhost';
    console.log(`Callback attempt for hostname: ${hostname}`);
    
    passport.authenticate(`replitauth:${hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/",
    })(req, res, next);
  });

  // Email Registration Route
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Check if user exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create user
      const userId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const user = await storage.upsertUser({
        id: userId,
        email,
        firstName,
        lastName,
        passwordHash,
        authProvider: 'email'
      });

      res.json({ message: "Registration successful", userId: user.id });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Email Login Route
  app.post("/api/auth/login", (req, res, next) => {
    const { rememberMe } = req.body;
    
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Login failed" });
      }
      
      if (!user) {
        return res.status(401).json({ message: info?.message || "Login failed" });
      }

      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed" });
        }
        
        // Set session duration based on remember me preference
        if (rememberMe) {
          req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        } else {
          req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 24 hours
        }
        
        return res.json({ message: "Login successful", user: { id: user.claims.sub, email: user.claims.email } });
      });
    })(req, res, next);
  });

  // Forgot Password Route
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Check if user exists
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Return success even if user doesn't exist for security
        return res.json({ message: "If an account with this email exists, a password reset link has been sent." });
      }

      // Generate reset token
      const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now
      
      // Save reset token to user
      await storage.updateUser(user.id, { 
        resetToken, 
        resetTokenExpiry 
      });

      // Send reset email using SendGrid
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);

      const resetUrl = `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}`;
      
      const msg = {
        to: email,
        from: 'noreply@joinbingeboard.com',
        subject: 'Password Reset - BingeBoard',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0f766e;">Reset Your Password</h2>
            <p>You requested a password reset for your BingeBoard account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" style="background-color: #0f766e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
            <p>If you didn't request this, please ignore this email.</p>
            <p>This link will expire in 1 hour.</p>
          </div>
        `
      };

      await sgMail.send(msg);
      
      res.json({ message: "If an account with this email exists, a password reset link has been sent." });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: "Failed to send password reset email" });
    }
  });

  // Facebook Auth Routes
  app.get("/api/auth/facebook", (req, res, next) => {
    console.log('=== FACEBOOK AUTH INITIATED ===');
    console.log('Request host:', req.get('host'));
    console.log('Request URL:', req.url);
    console.log('Facebook App ID:', process.env.FACEBOOK_APP_ID);
    console.log('Facebook App Secret exists:', !!process.env.FACEBOOK_APP_SECRET);
    console.log('Available strategies:', Object.keys(passport._strategies || {}));
    
    if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
      console.log('Facebook OAuth not configured - missing credentials');
      return res.redirect('/?error=facebook_not_configured');
    }
    
    try {
      passport.authenticate('facebook', { 
        scope: ['email', 'public_profile'],
        failureRedirect: '/login?error=facebook_auth_failed'
      })(req, res, next);
    } catch (error) {
      console.error('Facebook auth error during initiation:', error);
      return res.redirect('/?error=facebook_init_error');
    }
  });

  // Test endpoint to verify callback URL is reachable
  app.get("/api/auth/facebook/test", (req, res) => {
    res.json({ 
      message: "Facebook callback URL is reachable",
      timestamp: new Date().toISOString(),
      host: req.get('host')
    });
  });

  // Test endpoint to verify Google OAuth config
  app.get("/api/auth/google/test", (req, res) => {
    res.json({ 
      message: "Google OAuth configuration test",
      timestamp: new Date().toISOString(),
      host: req.get('host'),
      hasClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      clientId: process.env.GOOGLE_CLIENT_ID?.substring(0, 10) + "...",
      callbackUrl: `https://${req.get('host')}/api/auth/google/callback`,
      configuredDomains: process.env.REPLIT_DOMAINS,
      actualCallbackUrl: `https://${process.env.REPLIT_DOMAINS!.split(",")[0]}/api/auth/google/callback`
    });
  });

  // Direct callback test endpoints
  app.get("/api/auth/google/callback/test", (req, res) => {
    console.log('Google callback test endpoint reached');
    res.json({ 
      message: "Google callback endpoint is reachable",
      timestamp: new Date().toISOString(),
      host: req.get('host'),
      query: req.query
    });
  });

  app.get("/api/auth/facebook/callback/test", (req, res) => {
    console.log('Facebook callback test endpoint reached');
    res.json({ 
      message: "Facebook callback endpoint is reachable", 
      timestamp: new Date().toISOString(),
      host: req.get('host'),
      query: req.query
    });
  });

  app.get("/api/auth/facebook/callback", (req, res, next) => {
    console.log('=== FACEBOOK CALLBACK RECEIVED ===');
    console.log('Query params:', req.query);
    console.log('URL:', req.url);
    console.log('Session ID:', req.sessionID);
    console.log('Headers:', req.headers);
    
    // Check for OAuth errors
    if (req.query.error) {
      console.error('Facebook OAuth error:', req.query.error, req.query.error_description);
      return res.redirect('/login?error=facebook_oauth_error');
    }
    
    // Check for authorization code
    if (!req.query.code) {
      console.log('No authorization code received from Facebook - likely app restriction');
      console.log('Facebook app may be in development mode or user not authorized');
      return res.redirect('/login?error=facebook_no_code');
    }
    
    console.log('Facebook authorization code received:', req.query.code);
    
    passport.authenticate('facebook', (err, user, info) => {
      console.log('Facebook passport authenticate result:', { 
        err: err ? err.message : null, 
        user: user ? JSON.stringify(user, null, 2) : 'No user', 
        info 
      });
      
      if (err) {
        console.error('Facebook auth error:', err);
        console.error('Error stack:', err.stack);
        return res.redirect('/login?error=facebook_error');
      }
      
      if (!user) {
        console.log('Facebook auth failed:', info);
        return res.redirect('/login?error=facebook_auth_failed');
      }
      
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          console.error('Facebook login error:', loginErr);
          console.error('Login error stack:', loginErr.stack);
          return res.redirect('/login?error=login_failed');
        }
        
        console.log('Facebook auth successful for user:', user.claims?.email);
        console.log('Session after login:', req.session);
        console.log('User object in session:', req.user);
        return res.redirect('/');
      });
    })(req, res, next);
  });

  // Google Auth Routes
  app.get("/api/auth/google", (req, res, next) => {
    console.log('=== GOOGLE AUTH INITIATED ===');
    console.log('Request host:', req.headers.host);
    console.log('Request URL:', req.url);
    console.log('Google Client ID:', process.env.GOOGLE_CLIENT_ID);
    console.log('Google Client Secret exists:', !!process.env.GOOGLE_CLIENT_SECRET);
    console.log('Available strategies:', Object.keys(passport._strategies || {}));
    
    // Check if Google strategy is available
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.log('Google OAuth not configured - redirecting with error');
      return res.redirect('/?error=google_not_configured');
    }
    
    try {
      const authenticator = passport.authenticate('google', { 
        scope: ['profile', 'email'],
        failureRedirect: '/?error=google_auth_failed',
        failureFlash: false
      });
      
      authenticator(req, res, (err) => {
        if (err) {
          console.error('Google authentication error:', err);
          console.error('Error details:', JSON.stringify(err, null, 2));
          return res.redirect('/?error=google_auth_error');
        }
        next();
      });
    } catch (error) {
      console.error('Google auth error:', error);
      return res.redirect('/?error=google_oauth_error');
    }
  });

  // Add a simple test route first to verify routing works
  app.get("/api/auth/google/callback", (req, res, next) => {
    console.log('=== GOOGLE CALLBACK RECEIVED ===');
    console.log('Query params:', req.query);
    console.log('URL:', req.url);
    console.log('Session ID:', req.sessionID);
    console.log('Headers:', req.headers);
    
    // Check for OAuth errors
    if (req.query.error) {
      console.error('Google OAuth error:', req.query.error, req.query.error_description);
      return res.redirect('/login?error=google_oauth_error');
    }
    
    // Check for authorization code
    if (!req.query.code) {
      console.log('No authorization code received from Google - likely app restriction');
      console.log('Google app may be in testing mode or user not authorized');
      return res.redirect('/login?error=google_no_code');
    }
    
    console.log('Google authorization code received:', req.query.code);
    
    passport.authenticate('google', (err, user, info) => {
      console.log('Google passport authenticate result:', { 
        err: err ? err.message : null, 
        user: user ? JSON.stringify(user, null, 2) : 'No user', 
        info 
      });
      
      if (err) {
        console.error('Google auth error:', err);
        console.error('Error stack:', err.stack);
        return res.redirect('/login?error=google_error');
      }
      
      if (!user) {
        console.log('Google auth failed - no user returned:', info);
        return res.redirect('/login?error=google_auth_failed');
      }
      
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          console.error('Google login error:', loginErr);
          console.error('Login error stack:', loginErr.stack);
          return res.redirect('/login?error=login_failed');
        }
        
        console.log('Google auth successful for user:', user.claims?.email || user.id);
        console.log('Session after login:', req.session);
        console.log('User object in session:', req.user);
        return res.redirect('/');
      });
    })(req, res, next);
  });

  // Logout Route
  app.get("/api/logout", (req, res) => {
    console.log('Logout request received for user:', req.user);
    
    if (req.user && (req.user as any).access_token) {
      // Replit logout
      console.log('Performing Replit logout');
      req.logout(() => {
        res.redirect(
          client.buildEndSessionUrl(config, {
            client_id: process.env.REPL_ID!,
            post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
          }).href
        );
      });
    } else {
      // Local/Firebase logout
      console.log('Performing local/Firebase logout');
      req.logout((err) => {
        if (err) {
          console.error('Logout error:', err);
          return res.status(500).json({ message: 'Logout failed' });
        }
        console.log('Logout successful, redirecting to main page');
        res.redirect(`${req.protocol}://${req.hostname}/`);
      });
    }
  });

  // Password Reset Route (basic implementation)
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists
        return res.json({ message: "If the email exists, a reset link has been sent" });
      }

      // TODO: Implement actual email sending with reset token
      // For now, just return success
      console.log(`Password reset requested for: ${email}`);
      
      res.json({ message: "If the email exists, a reset link has been sent" });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ message: "Password reset failed" });
    }
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  // Only log authentication checks occasionally to avoid spam
  if (Math.random() < 0.01) { // Log 1% of requests
    console.log('Auth check:', {
      authenticated: req.isAuthenticated(),
      hasUser: !!user,
      sessionID: req.sessionID,
      cookies: req.headers.cookie ? 'present' : 'missing'
    });
  }

  if (!req.isAuthenticated() || !user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Handle different session types
  if (user.claims) {
    // Firebase/Google/Facebook sessions with claims
    const now = Math.floor(Date.now() / 1000);
    
    // Check if it's a Replit user with token expiration
    if (user.expires_at && now > user.expires_at) {
      const refreshToken = user.refresh_token;
      if (!refreshToken) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      try {
        const config = await getOidcConfig();
        const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
        updateUserSession(user, tokenResponse);
        return next();
      } catch (error) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
    }

    // For Firebase/Google/Facebook users, check basic expiration
    if (user.claims.exp && now > user.claims.exp) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    return next();
  } else if (user.id) {
    // Email/password sessions with direct user object
    return next();
  } else {
    return res.status(401).json({ message: "Unauthorized" });
  }
};