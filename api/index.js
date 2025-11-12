// Vercel Serverless Function Handler - Minimal Test

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

  // Content discover stub
  if (url.startsWith('/api/content/discover')) {
    return res.status(200).json({
      page: 1,
      results: [],
      message: 'Discover stub - will add TMDB integration next'
    });
  }

  // Dashboard content stub
  if (url.startsWith('/api/content/dashboard')) {
    return res.status(200).json({
      trending: { tv: [], movie: [] },
      personalized: { tv: [], movie: [] },
      message: 'Dashboard stub'
    });
  }

  // 404 for other routes
  return res.status(404).json({
    error: 'Not Found',
    path: url,
    message: 'Route not implemented yet'
  });
}
