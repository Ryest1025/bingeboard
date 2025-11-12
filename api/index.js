// Vercel Serverless Function Handler with TMDB Integration
import admin from 'firebase-admin';
import cookie from 'cookie';

const TMDB_API_KEY = process.env.TMDB_API_KEY || 'b7cbf0200107ac0e023c8b37e4d0f611';
const TMDB_BASE = 'https://api.themoviedb.org/3';

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_ADMIN_KEY || 
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 || '', 'base64').toString()
    );
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID || 'bingeboard-73c5f'
    });
  } catch (error) {
    console.error('Firebase Admin init error:', error);
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
      console.error('Session creation error:', error);
      return res.status(500).json({ error: 'Failed to create session' });
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

  // Content discover - returns TMDB discover results
  if (url.startsWith('/api/content/discover')) {
    try {
      const urlObj = new URL(url, `https://${req.headers.host}`);
      const mediaType = urlObj.searchParams.get('media_type') || 'tv';
      const sortBy = urlObj.searchParams.get('sort_by') || 'popularity.desc';
      const page = urlObj.searchParams.get('page') || '1';
      
      const data = await fetchTMDB(`/discover/${mediaType}`, { sort_by: sortBy, page });
      
      return res.status(200).json({
        page: data.page,
        total_pages: data.total_pages,
        total_results: data.total_results,
        results: data.results || []
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
        const data = await fetchTMDB(`/trending/${mediaType}/${timeWindow}`);
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
      const [trendingTV, trendingMovies, popularTV, popularMovies] = await Promise.all([
        fetchTMDB('/trending/tv/week'),
        fetchTMDB('/trending/movie/week'),
        fetchTMDB('/discover/tv', { sort_by: 'popularity.desc' }),
        fetchTMDB('/discover/movie', { sort_by: 'popularity.desc' })
      ]);

      return res.status(200).json({
        trending: {
          tv: trendingTV.results?.slice(0, 20) || [],
          movie: trendingMovies.results?.slice(0, 20) || []
        },
        personalized: {
          tv: popularTV.results?.slice(0, 20) || [],
          movie: popularMovies.results?.slice(0, 20) || []
        }
      });
    } catch (error) {
      console.error('Dashboard error:', error);
      return res.status(500).json({ error: 'Failed to fetch dashboard content' });
    }
  }

  // 404 for other routes
  return res.status(404).json({
    error: 'Not Found',
    path: url,
    message: 'Route not implemented yet'
  });
}
