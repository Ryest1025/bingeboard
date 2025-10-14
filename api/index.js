// Vercel Serverless Function Handler
// Minimal working backend for production deployment

import fetch from 'node-fetch';

// TMDB API configuration
const TMDB_API_KEY = process.env.TMDB_API_KEY || 'b7cbf0200107ac0e023c8b37e4d0f611';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Helper to make TMDB requests
async function tmdbFetch(endpoint, params = {}) {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', TMDB_API_KEY);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value.toString());
    }
  });
  
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.statusText}`);
  }
  return response.json();
}

// Main handler function
export default async function handler(req, res) {
  // Set CORS headers
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://bingeboardapp.com',
    'http://bingeboardapp.com',
    'https://www.bingeboardapp.com',
    'http://www.bingeboardapp.com',
    'https://ryest1025.github.io'
  ];
  
  if (origin && (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, method } = req;
  
  try {
    // Health check
    if (url === '/api/health') {
      return res.status(200).json({
        status: 'ok',
        message: 'Backend is running on Vercel',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV || 'production'
      });
    }

    // Trending endpoint
    if (url.startsWith('/api/trending/')) {
      const match = url.match(/\/api\/trending\/(\w+)\/(\w+)/);
      if (match) {
        const [, mediaType, timeWindow] = match;
        const urlParams = new URL(url, `http://${req.headers.host}`).searchParams;
        const includeStreaming = urlParams.get('includeStreaming') === 'true';
        
        const data = await tmdbFetch(`/trending/${mediaType}/${timeWindow}`);
        
        // Add streaming data if requested
        if (includeStreaming && data.results) {
          const enrichedResults = await Promise.all(
            data.results.slice(0, 10).map(async (item) => {
              try {
                const providers = await tmdbFetch(`/${mediaType}/${item.id}/watch/providers`);
                const usProviders = providers.results?.US;
                
                if (usProviders) {
                  const allProviders = [
                    ...(usProviders.flatrate || []),
                    ...(usProviders.buy || []),
                    ...(usProviders.rent || [])
                  ];
                  
                  // Deduplicate by provider_id
                  const uniqueProviders = Array.from(
                    new Map(allProviders.map(p => [p.provider_id, p])).values()
                  );
                  
                  item.streaming = uniqueProviders.slice(0, 5);
                }
              } catch (err) {
                // Skip streaming data if fetch fails
              }
              return item;
            })
          );
          
          // Merge enriched results back
          data.results = [
            ...enrichedResults,
            ...data.results.slice(10)
          ];
        }
        
        return res.status(200).json(data);
      }
    }

    // Personalized endpoint (uses TMDB discover)
    if (url.startsWith('/api/personalized/')) {
      const match = url.match(/\/api\/personalized\/(\w+)/);
      if (match) {
        const [, mediaType] = match;
        const urlParams = new URL(url, `http://${req.headers.host}`).searchParams;
        const includeStreaming = urlParams.get('includeStreaming') === 'true';
        
        const data = await tmdbFetch(`/discover/${mediaType}`, {
          sort_by: urlParams.get('sort_by') || 'popularity.desc',
          page: urlParams.get('page') || '1'
        });
        
        // Add streaming data if requested
        if (includeStreaming && data.results) {
          const enrichedResults = await Promise.all(
            data.results.slice(0, 10).map(async (item) => {
              try {
                const providers = await tmdbFetch(`/${mediaType}/${item.id}/watch/providers`);
                const usProviders = providers.results?.US;
                
                if (usProviders) {
                  const allProviders = [
                    ...(usProviders.flatrate || []),
                    ...(usProviders.buy || []),
                    ...(usProviders.rent || [])
                  ];
                  
                  // Deduplicate by provider_id
                  const uniqueProviders = Array.from(
                    new Map(allProviders.map(p => [p.provider_id, p])).values()
                  );
                  
                  item.streaming = uniqueProviders.slice(0, 5);
                }
              } catch (err) {
                // Skip streaming data if fetch fails
              }
              return item;
            })
          );
          
          // Merge enriched results back
          data.results = [
            ...enrichedResults,
            ...data.results.slice(10)
          ];
        }
        
        return res.status(200).json(data);
      }
    }

    // TMDB discover endpoint
    if (url.startsWith('/api/tmdb/discover/')) {
      const match = url.match(/\/api\/tmdb\/discover\/(\w+)/);
      if (match) {
        const [, mediaType] = match;
        const urlParams = new URL(url, `http://${req.headers.host}`).searchParams;
        
        const data = await tmdbFetch(`/discover/${mediaType}`, {
          sort_by: urlParams.get('sort_by') || 'popularity.desc',
          page: urlParams.get('page') || '1'
        });
        return res.status(200).json(data);
      }
    }

    // Multi-API trailer endpoint
    if (url.startsWith('/api/multi-api/trailer/')) {
      const match = url.match(/\/api\/multi-api\/trailer\/(\w+)\/(\d+)/);
      if (match) {
        const [, mediaType, id] = match;
        const data = await tmdbFetch(`/${mediaType}/${id}/videos`);
        return res.status(200).json({ trailers: data.results || [] });
      }
    }

    // Multiapi trailer endpoint (alias)
    if (url.startsWith('/api/multiapi/trailer/')) {
      const match = url.match(/\/api\/multiapi\/trailer\/(\w+)\/(\d+)/);
      if (match) {
        const [, mediaType, id] = match;
        const data = await tmdbFetch(`/${mediaType}/${id}/videos`);
        return res.status(200).json({ trailers: data.results || [] });
      }
    }

    // User endpoints (return empty arrays for now)
    if (url === '/api/user/watchlist' || url.startsWith('/api/user/watchlist?')) {
      return res.status(200).json([]);
    }

    if (url === '/api/user/reminders' || url.startsWith('/api/user/reminders?')) {
      return res.status(200).json([]);
    }

    if (url === '/api/continue-watching' || url.startsWith('/api/continue-watching?')) {
      return res.status(200).json([]);
    }

    // Auth endpoints (stub responses)
    if (url === '/api/auth/status') {
      return res.status(200).json({
        isAuthenticated: false,
        user: null
      });
    }

    if (url === '/api/auth/user') {
      return res.status(200).json({ user: null });
    }

    // Firebase session endpoint
    if (url === '/api/auth/firebase-session' && method === 'POST') {
      return res.status(200).json({
        success: true,
        message: 'Session created (stub)'
      });
    }

    // Notifications history endpoint
    if (url === '/api/notifications/history' || url.startsWith('/api/notifications/history?')) {
      return res.status(200).json([]);
    }

    // Firebase session endpoint (POST)
    if (url === '/api/auth/firebase-session' || url.startsWith('/api/auth/firebase-session?')) {
      if (method === 'POST') {
        return res.status(200).json({
          success: true,
          message: 'Session created (stub)'
        });
      }
    }

    // Forgot password endpoint (POST)
    if (url === '/api/auth/forgot-password' || url.startsWith('/api/auth/forgot-password?')) {
      if (method === 'POST') {
        return res.status(200).json({
          success: true,
          message: 'Password reset email sent (stub)'
        });
      }
    }

    // Login endpoint (POST)
    if (url === '/api/auth/login' || url.startsWith('/api/auth/login?')) {
      if (method === 'POST') {
        return res.status(200).json({
          success: true,
          user: null,
          message: 'Login successful (stub)'
        });
      }
    }

    // Notifications history endpoint
    if (url === '/api/notifications/history' || url.startsWith('/api/notifications/history?')) {
      return res.status(200).json([]);
    }

    // 404 for unmatched routes
    return res.status(404).json({
      error: 'Not Found',
      path: url,
      message: 'The requested endpoint does not exist'
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'An unexpected error occurred'
    });
  }
}