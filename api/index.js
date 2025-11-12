// Vercel Serverless Function Handler with TMDB Integration

const TMDB_API_KEY = process.env.TMDB_API_KEY || 'b7cbf0200107ac0e023c8b37e4d0f611';
const TMDB_BASE = 'https://api.themoviedb.org/3';

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

  // Auth status stub
  if (url === '/api/auth/status' || url.startsWith('/api/auth/status?')) {
    return res.status(200).json({
      isAuthenticated: false,
      user: null,
      message: 'Auth stub - full routes coming next'
    });
  }

  // Firebase session creation (POST)
  if ((url === '/api/auth/firebase-session' || url.startsWith('/api/auth/firebase-session?')) && req.method === 'POST') {
    return res.status(200).json({
      success: true,
      message: 'Session stub - returns success but does not persist'
    });
  }

  // Logout endpoint (POST)
  if ((url === '/api/auth/logout' || url.startsWith('/api/auth/logout?')) && req.method === 'POST') {
    return res.status(200).json({
      success: true,
      message: 'Logout stub'
    });
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
