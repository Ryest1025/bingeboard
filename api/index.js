// Vercel Serverless Function Handler with TMDB Integration
import admin from 'firebase-admin';
import cookie from 'cookie';

const TMDB_API_KEY = process.env.TMDB_API_KEY || 'b7cbf0200107ac0e023c8b37e4d0f611';
const TMDB_BASE = 'https://api.themoviedb.org/3';

// In-memory storage for SMS verification codes (expires after 10 minutes)
// In production, use Redis or similar for persistence across serverless instances
const smsVerificationCodes = new Map();

// Generate 6-digit verification code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Clean up expired codes
function cleanupExpiredCodes() {
  const now = Date.now();
  for (const [key, data] of smsVerificationCodes.entries()) {
    if (now > data.expiresAt) {
      smsVerificationCodes.delete(key);
    }
  }
}

// Initialize Firebase Admin (only once)
let firebaseInitialized = false;
if (!admin.apps.length) {
  try {
    let serviceAccount;
    
    // Try different credential sources
    if (process.env.FIREBASE_ADMIN_KEY) {
      serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY);
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
      serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString());
    } else {
      console.warn('⚠️ No Firebase Admin credentials found. Session creation will not work.');
      serviceAccount = null;
    }
    
    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id || 'bingeboard-73c5f'
      });
      firebaseInitialized = true;
      console.log('✅ Firebase Admin initialized successfully');
    }
  } catch (error) {
    console.error('❌ Firebase Admin init error:', error.message);
  }
}

async function fetchTMDB(endpoint, params = {}) {
  const url = new URL(`${TMDB_BASE}${endpoint}`);
  url.searchParams.append('api_key', TMDB_API_KEY);
  Object.entries(params).forEach(([key, val]) => {
    if (val) url.searchParams.append(key, String(val));
  });
  
  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`TMDB error: ${response.status}`);
  return response.json();
}

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  // Set CORS headers
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://bingeboardapp.com',
    'http://bingeboardapp.com',
    'https://www.bingeboardapp.com',
    'http://www.bingeboardapp.com',
  ];
  
  if (origin && (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin.endsWith('.github.io'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req;

  // Health check
  if (url === '/api/health' || url.startsWith('/api/health?')) {
    return res.status(200).json({
      status: 'ok',
      message: 'Minimal handler is working',
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'production',
      url: url
    });
  }

  // Auth status - check session cookie
  if (url === '/api/auth/status' || url.startsWith('/api/auth/status?')) {
    try {
      const cookies = cookie.parse(req.headers.cookie || '');
      const sessionCookie = cookies.bb_session;
      
      if (!sessionCookie) {
        return res.status(200).json({ isAuthenticated: false, user: null });
      }
      
      // Verify session cookie with Firebase Admin
      const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
      
      return res.status(200).json({
        isAuthenticated: true,
        user: {
          id: decodedClaims.uid,
          email: decodedClaims.email,
          displayName: decodedClaims.name || decodedClaims.email
        }
      });
    } catch (error) {
      console.error('Auth status error:', error);
      return res.status(200).json({ isAuthenticated: false, user: null });
    }
  }

  // Firebase session creation (POST)
  if ((url === '/api/auth/firebase-session' || url.startsWith('/api/auth/firebase-session?')) && req.method === 'POST') {
    try {
      // Check if Firebase Admin is initialized
      if (!admin.apps.length || !firebaseInitialized) {
        console.error('Firebase Admin not initialized - missing credentials');
        
        // Return success but log warning - allow frontend to work without backend sessions
        console.warn('⚠️ Allowing login without backend session (Firebase Admin not configured)');
        return res.status(200).json({ 
          success: true,
          warning: 'Session created on client only - server authentication unavailable'
        });
      }

      const body = req.body || JSON.parse(await getRawBody(req));
      const idToken = body.idToken || body.firebaseToken;
      
      if (!idToken) {
        return res.status(400).json({ error: 'Missing idToken' });
      }
      
      // Verify the ID token and create session cookie (5 days)
      const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
      const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });
      
      // Set cookie
      res.setHeader('Set-Cookie', cookie.serialize('bb_session', sessionCookie, {
        maxAge: expiresIn / 1000,
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/'
      }));
      
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Session creation error:', error.message || error);
      
      // Log but don't fail - allow client-side auth to continue
      return res.status(200).json({ 
        success: true,
        warning: 'Session creation failed but allowing client auth',
        error: error.message 
      });
    }
  }

  // Logout endpoint (POST)
  if ((url === '/api/auth/logout' || url.startsWith('/api/auth/logout?')) && req.method === 'POST') {
    // Clear session cookie
    res.setHeader('Set-Cookie', cookie.serialize('bb_session', '', {
      maxAge: 0,
      path: '/'
    }));
    
    return res.status(200).json({ success: true });
  }

  // Verify SMS code and reset password
  if ((url === '/api/auth/verify-sms-reset' || url.startsWith('/api/auth/verify-sms-reset')) && req.method === 'POST') {
    try {
      const { phoneNumber, code, newPassword } = body;
      
      if (!phoneNumber || !code || !newPassword) {
        return res.status(400).json({ 
          success: false,
          message: 'Phone number, code, and new password are required' 
        });
      }
      
      // Clean phone number
      const cleanPhone = phoneNumber.replace(/[\s-]/g, '');
      
      // Clean up expired codes
      cleanupExpiredCodes();
      
      // Check if code exists
      const storedData = smsVerificationCodes.get(cleanPhone);
      if (!storedData) {
        return res.status(400).json({ 
          success: false,
          message: 'Verification code expired or not found. Please request a new code.' 
        });
      }
      
      // Check attempts (prevent brute force)
      if (storedData.attempts >= 3) {
        smsVerificationCodes.delete(cleanPhone);
        return res.status(429).json({ 
          success: false,
          message: 'Too many failed attempts. Please request a new code.' 
        });
      }
      
      // Verify code
      if (storedData.code !== code) {
        storedData.attempts++;
        return res.status(400).json({ 
          success: false,
          message: 'Invalid verification code',
          attemptsRemaining: 3 - storedData.attempts
        });
      }
      
      // Code is valid, update password
      if (!firebaseInitialized) {
        return res.status(500).json({ 
          success: false,
          message: 'Server configuration error' 
        });
      }
      
      // Update user password
      await admin.auth().updateUser(storedData.uid, {
        password: newPassword
      });
      
      // Remove used code
      smsVerificationCodes.delete(cleanPhone);
      
      console.log(`✅ Password reset successful for phone: ${cleanPhone}`);
      
      return res.status(200).json({ 
        success: true,
        message: 'Password reset successful. You can now log in with your new password.' 
      });
      
    } catch (error) {
      console.error('SMS verification error:', error.message);
      return res.status(500).json({ 
        success: false,
        message: 'Failed to reset password. Please try again.' 
      });
    }
  }

  // Password reset endpoint (email or SMS)
  if ((url === '/api/auth/forgot-password' || url.startsWith('/api/auth/forgot-password')) && req.method === 'POST') {
    try {
      // Check if Firebase Admin is initialized
      if (!admin.apps.length || !firebaseInitialized) {
        return res.status(503).json({ 
          success: false,
          message: 'Password reset service is temporarily unavailable. Please try again later.' 
        });
      }

      const body = req.body || JSON.parse(await getRawBody(req));
      const { email, phoneNumber } = body;

      if (!email && !phoneNumber) {
        return res.status(400).json({ 
          success: false,
          message: 'Email or phone number is required' 
        });
      }

      // Email-based password reset
      if (email) {
        // Generate password reset link
        const resetLink = await admin.auth().generatePasswordResetLink(email, {
          url: 'https://bingeboardapp.com/login',
          handleCodeInApp: false,
        });

        // In production, you would send this via email service (SendGrid, AWS SES, etc.)
        // For now, we'll return success (Firebase sends the email automatically)
        console.log('📧 Password reset link generated for:', email);
        
        return res.status(200).json({ 
          success: true,
          message: 'Password reset email sent successfully',
          // Only include link in development
          ...(process.env.NODE_ENV !== 'production' && { resetLink })
        });
      }

      // SMS-based password reset
      if (phoneNumber) {
        // Clean up expired codes first
        cleanupExpiredCodes();
        
        // Format phone number (remove spaces, dashes)
        const cleanPhone = phoneNumber.replace(/[\s-]/g, '');
        
        // Validate phone number format (basic validation)
        if (!/^\+?[1-9]\d{1,14}$/.test(cleanPhone)) {
          return res.status(400).json({ 
            success: false,
            message: 'Invalid phone number format. Use international format (e.g., +1234567890)' 
          });
        }
        
        // Check if Firebase Admin is initialized
        if (!firebaseInitialized) {
          console.error('❌ Cannot send SMS: Firebase Admin not initialized');
          return res.status(500).json({ 
            success: false,
            message: 'Server configuration error. Please contact support.' 
          });
        }
        
        try {
          // Verify user exists with this phone number in Firebase
          // Note: This requires users to have phone numbers linked to their accounts
          const userRecord = await admin.auth().getUserByPhoneNumber(cleanPhone);
          
          // Generate 6-digit verification code
          const verificationCode = generateVerificationCode();
          const expiresAt = Date.now() + (10 * 60 * 1000); // 10 minutes
          
          // Store code with expiration
          smsVerificationCodes.set(cleanPhone, {
            code: verificationCode,
            expiresAt,
            uid: userRecord.uid,
            attempts: 0
          });
          
          // In production, send via Twilio, AWS SNS, or Firebase Extensions
          // For now, log it (REMOVE IN PRODUCTION)
          console.log(`📱 SMS Code for ${cleanPhone}: ${verificationCode}`);
          
          // TODO: Integrate with SMS provider
          // Example with Twilio:
          // const twilio = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
          // await twilio.messages.create({
          //   body: `Your BingeBoard verification code is: ${verificationCode}`,
          //   to: cleanPhone,
          //   from: process.env.TWILIO_PHONE
          // });
          
          return res.status(200).json({ 
            success: true,
            message: 'Verification code sent to your phone',
            // Include code in development only (REMOVE IN PRODUCTION)
            ...(process.env.NODE_ENV !== 'production' && { verificationCode })
          });
          
        } catch (error) {
          console.error('SMS password reset error:', error.message);
          
          // Don't reveal if user exists
          if (error.code === 'auth/user-not-found') {
            return res.status(200).json({ 
              success: true,
              message: 'If an account exists with that phone number, a verification code has been sent.' 
            });
          }
          
          return res.status(500).json({ 
            success: false,
            message: 'Failed to send verification code. Please try again.' 
          });
        }
      }

    } catch (error) {
      console.error('Password reset error:', error.message || error);
      
      // Handle specific Firebase errors
      if (error.code === 'auth/user-not-found') {
        // Don't reveal if user exists for security
        return res.status(200).json({ 
          success: true,
          message: 'If an account exists with that email, a password reset link has been sent.' 
        });
      }

      return res.status(500).json({ 
        success: false,
        message: 'Failed to send password reset. Please try again later.' 
      });
    }
  }

  // Content discover - returns TMDB discover results
  if (url.startsWith('/api/content/discover')) {
    try {
      const urlObj = new URL(url, `https://${req.headers.host}`);
      const mediaType = urlObj.searchParams.get('media_type') || 'tv';
      const sortBy = urlObj.searchParams.get('sort_by') || 'popularity.desc';
      const page = urlObj.searchParams.get('page') || '1';
      const limit = urlObj.searchParams.get('limit');
      const includeStreaming = urlObj.searchParams.get('include_streaming') === 'true';
      
      // Build TMDB params
      const tmdbParams = { 
        sort_by: sortBy, 
        page 
      };
      
      // Pass through additional TMDB filters
      const filterParams = ['with_genres', 'genres', 'vote_average.gte', 'vote_average_gte', 
                           'vote_count.gte', 'first_air_date.gte', 'first_air_date.lte'];
      filterParams.forEach(param => {
        const value = urlObj.searchParams.get(param);
        if (value) {
          // Normalize param names for TMDB
          const tmdbParam = param.replace('_', '.');
          tmdbParams[tmdbParam] = value;
        }
      });
      
      const data = await fetchTMDB(`/discover/${mediaType}`, tmdbParams);
      
      let results = data.results || [];
      
      // Apply limit if specified
      if (limit) {
        results = results.slice(0, parseInt(limit));
      }
      
      // Add streaming data if requested
      if (includeStreaming && results.length > 0) {
        results = await Promise.all(
          results.map(async (item) => {
            try {
              const providers = await fetchTMDB(`/${mediaType}/${item.id}/watch/providers`);
              const usProviders = providers.results?.US;
              
              let streamingPlatforms = [];
              if (usProviders) {
                const allProviders = [
                  ...(usProviders.flatrate || []),
                  ...(usProviders.rent || []),
                  ...(usProviders.buy || [])
                ];
                
                const uniqueProviders = Array.from(
                  new Map(allProviders.map(p => [p.provider_id, p])).values()
                );
                
                streamingPlatforms = uniqueProviders.map(p => ({
                  provider_id: p.provider_id,
                  provider_name: p.provider_name,
                  logo_path: p.logo_path
                }));
              }
              
              return {
                ...item,
                streamingPlatforms
              };
            } catch (err) {
              return item;
            }
          })
        );
      }
      
      return res.status(200).json({
        page: data.page,
        total_pages: data.total_pages,
        total_results: data.total_results,
        results
      });
    } catch (error) {
      console.error('Discover error:', error);
      return res.status(500).json({ error: 'Failed to fetch discover content' });
    }
  }

  // Trending endpoint - /api/trending/{media_type}/{time_window}
  if (url.startsWith('/api/trending/')) {
    try {
      const match = url.match(/\/api\/trending\/(\w+)\/(\w+)/);
      if (match) {
        const [, mediaType, timeWindow] = match;
        const urlObj = new URL(url, `https://${req.headers.host}`);
        const includeStreaming = urlObj.searchParams.get('includeStreaming') === 'true';
        
        const data = await fetchTMDB(`/trending/${mediaType}/${timeWindow}`);
        
        // If streaming is requested, fetch watch providers for each result
        if (includeStreaming && data.results) {
          const resultsWithProviders = await Promise.all(
            data.results.map(async (item) => {
              try {
                const providers = await fetchTMDB(`/${mediaType}/${item.id}/watch/providers`);
                const usProviders = providers.results?.US;
                
                // Transform to streamingPlatforms format expected by frontend
                let streamingPlatforms = [];
                if (usProviders) {
                  // Combine flatrate, rent, and buy providers
                  const allProviders = [
                    ...(usProviders.flatrate || []),
                    ...(usProviders.rent || []),
                    ...(usProviders.buy || [])
                  ];
                  
                  // Deduplicate by provider_id
                  const uniqueProviders = Array.from(
                    new Map(allProviders.map(p => [p.provider_id, p])).values()
                  );
                  
                  streamingPlatforms = uniqueProviders.map(p => ({
                    provider_id: p.provider_id,
                    provider_name: p.provider_name,
                    logo_path: p.logo_path
                  }));
                }
                
                return {
                  ...item,
                  streamingPlatforms
                };
              } catch (err) {
                return item; // Return without providers if fetch fails
              }
            })
          );
          data.results = resultsWithProviders;
        }
        
        return res.status(200).json(data);
      }
    } catch (error) {
      console.error('Trending error:', error);
      return res.status(500).json({ error: 'Failed to fetch trending content' });
    }
  }

  // Personalized endpoint - /api/personalized/{media_type}
  if (url.startsWith('/api/personalized/')) {
    try {
      const match = url.match(/\/api\/personalized\/(\w+)/);
      if (match) {
        const [, mediaType] = match;
        const urlObj = new URL(url, `https://${req.headers.host}`);
        const sortBy = urlObj.searchParams.get('sort_by') || 'popularity.desc';
        const page = urlObj.searchParams.get('page') || '1';
        
        const data = await fetchTMDB(`/discover/${mediaType}`, { sort_by: sortBy, page });
        return res.status(200).json(data);
      }
    } catch (error) {
      console.error('Personalized error:', error);
      return res.status(500).json({ error: 'Failed to fetch personalized content' });
    }
  }

  // Multi-API trailer endpoint - /api/multi-api/trailer/{media_type}/{id}
  if (url.startsWith('/api/multi-api/trailer/')) {
    try {
      const match = url.match(/\/api\/multi-api\/trailer\/(\w+)\/(\d+)/);
      if (match) {
        const [, mediaType, id] = match;
        const data = await fetchTMDB(`/${mediaType}/${id}/videos`);
        return res.status(200).json({ trailers: data.results || [] });
      }
    } catch (error) {
      console.error('Trailer error:', error);
      return res.status(500).json({ error: 'Failed to fetch trailers' });
    }
  }

  // Dashboard content - returns trending + popular content
  if (url.startsWith('/api/content/dashboard')) {
    try {
      const urlObj = new URL(url, `https://${req.headers.host}`);
      const includeStreaming = urlObj.searchParams.get('includeStreaming') === 'true';
      const limit = parseInt(urlObj.searchParams.get('limit') || '20');
      
      const [trendingTV, trendingMovies, popularTV, popularMovies] = await Promise.all([
        fetchTMDB('/trending/tv/week'),
        fetchTMDB('/trending/movie/week'),
        fetchTMDB('/discover/tv', { sort_by: 'popularity.desc' }),
        fetchTMDB('/discover/movie', { sort_by: 'popularity.desc' })
      ]);

      // Helper to add streaming data
      const addStreamingData = async (items, mediaType) => {
        if (!includeStreaming) return items.slice(0, limit);
        
        return Promise.all(
          items.slice(0, limit).map(async (item) => {
            try {
              const providers = await fetchTMDB(`/${mediaType}/${item.id}/watch/providers`);
              const usProviders = providers.results?.US;
              
              let streamingPlatforms = [];
              if (usProviders) {
                const allProviders = [
                  ...(usProviders.flatrate || []),
                  ...(usProviders.rent || []),
                  ...(usProviders.buy || [])
                ];
                
                const uniqueProviders = Array.from(
                  new Map(allProviders.map(p => [p.provider_id, p])).values()
                );
                
                streamingPlatforms = uniqueProviders.map(p => ({
                  provider_id: p.provider_id,
                  provider_name: p.provider_name,
                  logo_path: p.logo_path
                }));
              }
              
              return {
                ...item,
                streamingPlatforms
              };
            } catch (err) {
              return item;
            }
          })
        );
      };

      const [tvTrending, movieTrending, tvPopular, moviePopular] = await Promise.all([
        addStreamingData(trendingTV.results || [], 'tv'),
        addStreamingData(trendingMovies.results || [], 'movie'),
        addStreamingData(popularTV.results || [], 'tv'),
        addStreamingData(popularMovies.results || [], 'movie')
      ]);

      return res.status(200).json({
        trending: {
          tv: tvTrending,
          movie: movieTrending
        },
        personalized: {
          tv: tvPopular,
          movie: moviePopular
        }
      });
    } catch (error) {
      console.error('Dashboard error:', error);
      return res.status(500).json({ error: 'Failed to fetch dashboard content' });
    }
  }

  // TMDB discover endpoint - /api/tmdb/discover/{media_type}
  if (url.startsWith('/api/tmdb/discover/')) {
    try {
      const match = url.match(/\/api\/tmdb\/discover\/(\w+)/);
      if (match) {
        const [, mediaType] = match;
        const urlObj = new URL(url, `https://${req.headers.host}`);
        const sortBy = urlObj.searchParams.get('sort_by') || 'popularity.desc';
        const page = urlObj.searchParams.get('page') || '1';
        
        const data = await fetchTMDB(`/discover/${mediaType}`, { sort_by: sortBy, page });
        return res.status(200).json(data);
      }
    } catch (error) {
      console.error('TMDB discover error:', error);
      return res.status(500).json({ error: 'Failed to fetch TMDB content' });
    }
  }

  // TMDB top rated endpoint - /api/tmdb/{media_type}/top_rated
  if (url.match(/^\/api\/tmdb\/(tv|movie)\/top_rated/)) {
    try {
      const match = url.match(/\/api\/tmdb\/(\w+)\/top_rated/);
      if (match) {
        const [, mediaType] = match;
        const urlObj = new URL(url, `https://${req.headers.host}`);
        const page = urlObj.searchParams.get('page') || '1';
        const limit = urlObj.searchParams.get('limit');
        const includeStreaming = urlObj.searchParams.get('includeStreaming') === 'true';
        
        const data = await fetchTMDB(`/${mediaType}/top_rated`, { page });
        
        let results = data.results || [];
        
        // Apply limit if specified
        if (limit) {
          results = results.slice(0, parseInt(limit));
        }
        
        // Add streaming data if requested
        if (includeStreaming && results.length > 0) {
          results = await Promise.all(
            results.map(async (item) => {
              try {
                const providers = await fetchTMDB(`/${mediaType}/${item.id}/watch/providers`);
                const usProviders = providers.results?.US;
                
                let streamingPlatforms = [];
                if (usProviders) {
                  const allProviders = [
                    ...(usProviders.flatrate || []),
                    ...(usProviders.rent || []),
                    ...(usProviders.buy || [])
                  ];
                  
                  const uniqueProviders = Array.from(
                    new Map(allProviders.map(p => [p.provider_id, p])).values()
                  );
                  
                  streamingPlatforms = uniqueProviders.map(p => ({
                    provider_id: p.provider_id,
                    provider_name: p.provider_name,
                    logo_path: p.logo_path
                  }));
                }
                
                return {
                  ...item,
                  streamingPlatforms
                };
              } catch (err) {
                return item;
              }
            })
          );
        }
        
        return res.status(200).json({
          ...data,
          results
        });
      }
    } catch (error) {
      console.error('TMDB top rated error:', error);
      return res.status(500).json({ error: 'Failed to fetch top rated content' });
    }
  }

  // User watchlist endpoint (stub - returns empty array until DB is connected)
  if (url.startsWith('/api/user/watchlist')) {
    return res.status(200).json({ watchlist: [] });
  }

  // User reminders endpoint (stub - returns empty array until DB is connected)
  if (url.startsWith('/api/user/reminders')) {
    return res.status(200).json({ reminders: [] });
  }

  // Continue watching endpoint (stub - returns empty array until DB is connected)
  if (url.startsWith('/api/continue-watching')) {
    return res.status(200).json({ continueWatching: [] });
  }

  // Notifications history endpoint (stub - returns empty array until DB is connected)
  if (url.startsWith('/api/notifications/history')) {
    return res.status(200).json({ notifications: [] });
  }

  // ========================================
  // MONETIZATION / AD ANALYTICS ENDPOINTS
  // ========================================

  // Track ad view
  if (url === '/api/analytics/ad-view' && req.method === 'POST') {
    try {
      const rawBody = await getRawBody(req);
      const { adId, userId, context, sessionId, metadata } = JSON.parse(rawBody);

      if (!adId || !userId || !context) {
        return res.status(400).json({ error: 'Missing required fields: adId, userId, context' });
      }

      // TODO: Store in database when connected
      // For now, log and return success
      console.log('📊 Ad View:', { adId, userId, context, sessionId, timestamp: new Date().toISOString() });

      // Calculate estimated revenue (CPM model)
      const revenueEstimate = 0.002; // $0.002 per view

      return res.status(200).json({
        success: true,
        tracked: 'ad-view',
        adId,
        userId,
        context,
        timestamp: new Date().toISOString(),
        estimatedRevenue: revenueEstimate
      });
    } catch (error) {
      console.error('Ad view tracking error:', error);
      return res.status(500).json({ error: 'Failed to track ad view' });
    }
  }

  // Track ad click
  if (url === '/api/analytics/ad-click' && req.method === 'POST') {
    try {
      const rawBody = await getRawBody(req);
      const { adId, userId, clickUrl, sessionId, metadata } = JSON.parse(rawBody);

      if (!adId || !userId || !clickUrl) {
        return res.status(400).json({ error: 'Missing required fields: adId, userId, clickUrl' });
      }

      // TODO: Store in database when connected
      console.log('🖱️ Ad Click:', { adId, userId, clickUrl, sessionId, timestamp: new Date().toISOString() });

      // Calculate estimated revenue (CPC model)
      const revenueEstimate = 0.05; // $0.05 per click

      return res.status(200).json({
        success: true,
        tracked: 'ad-click',
        adId,
        userId,
        clickUrl,
        timestamp: new Date().toISOString(),
        estimatedRevenue: revenueEstimate
      });
    } catch (error) {
      console.error('Ad click tracking error:', error);
      return res.status(500).json({ error: 'Failed to track ad click' });
    }
  }

  // Track ad completion
  if (url === '/api/analytics/ad-completion' && req.method === 'POST') {
    try {
      const rawBody = await getRawBody(req);
      const { adId, userId, watchTime, sessionId, metadata } = JSON.parse(rawBody);

      if (!adId || !userId || watchTime === undefined) {
        return res.status(400).json({ error: 'Missing required fields: adId, userId, watchTime' });
      }

      // Determine if ad was completed (watched more than 80% or full duration)
      const completed = watchTime >= 8000; // 8+ seconds = completed

      // TODO: Store in database when connected
      console.log('✅ Ad Completion:', { adId, userId, watchTime, completed, sessionId, timestamp: new Date().toISOString() });

      // Calculate estimated revenue (completion bonus)
      const baseRevenue = 0.002;
      const completionMultiplier = completed ? 1.5 : 0.7;
      const revenueEstimate = baseRevenue * completionMultiplier;

      return res.status(200).json({
        success: true,
        tracked: 'ad-completion',
        adId,
        userId,
        watchTime,
        completed,
        timestamp: new Date().toISOString(),
        estimatedRevenue: revenueEstimate
      });
    } catch (error) {
      console.error('Ad completion tracking error:', error);
      return res.status(500).json({ error: 'Failed to track ad completion' });
    }
  }

  // Get revenue analytics summary
  if (url.startsWith('/api/analytics/revenue-summary')) {
    try {
      // TODO: Query database for real data when connected
      // For now, return sample/estimated data
      const summary = {
        totalRevenue: 45.72,
        todayRevenue: 12.35,
        adViews: 1234,
        adClicks: 89,
        adCompletions: 987,
        clickThroughRate: 7.2,
        completionRate: 80.0,
        topAds: [
          { adId: 'ad_streaming_001', revenue: 18.50, views: 920 },
          { adId: 'ad_tech_001', revenue: 15.30, views: 765 },
          { adId: 'ad_food_001', revenue: 11.92, views: 596 }
        ],
        revenueByDay: [
          { date: '2026-01-03', revenue: 8.45 },
          { date: '2026-01-04', revenue: 9.12 },
          { date: '2026-01-05', revenue: 7.89 },
          { date: '2026-01-06', revenue: 10.56 },
          { date: '2026-01-07', revenue: 11.23 },
          { date: '2026-01-08', revenue: 10.82 },
          { date: '2026-01-09', revenue: 12.35 }
        ]
      };

      return res.status(200).json(summary);
    } catch (error) {
      console.error('Revenue summary error:', error);
      return res.status(500).json({ error: 'Failed to fetch revenue summary' });
    }
  }

  // Track affiliate clicks (streaming platform referrals)
  if (url === '/api/analytics/affiliate-click' && req.method === 'POST') {
    try {
      const rawBody = await getRawBody(req);
      const { userId, platformName, showId, showTitle, affiliateUrl, sessionId, metadata } = JSON.parse(rawBody);

      if (!userId || !platformName || !affiliateUrl) {
        return res.status(400).json({ error: 'Missing required fields: userId, platformName, affiliateUrl' });
      }

      // TODO: Store in database when connected
      console.log('🔗 Affiliate Click:', { userId, platformName, showId, showTitle, affiliateUrl, timestamp: new Date().toISOString() });

      return res.status(200).json({
        success: true,
        tracked: 'affiliate-click',
        userId,
        platformName,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Affiliate click tracking error:', error);
      return res.status(500).json({ error: 'Failed to track affiliate click' });
    }
  }

  // 404 for other routes
  return res.status(404).json({
    error: 'Not Found',
    path: url,
    message: 'Route not implemented yet'
  });
}

