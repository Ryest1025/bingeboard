// API configuration for proper backend communication
export const API_CONFIG = {
  // Use window.location.origin in development to handle both localhost and Replit domains
  baseURL: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000',
  
  // Helper function to create full API URLs
  getApiUrl: (path: string) => {
    // Get base URL from environment or default to current origin
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 
                   (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000');
    
    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    
    return `${baseUrl}${normalizedPath}`;
  }
};

// Export individual API endpoints
export const API_ENDPOINTS = {
  AUTH_USER: '/api/auth/user',
  TMDB_TRENDING: '/api/tmdb/trending',
  TMDB_SEARCH: '/api/tmdb/search',
  WATCHLIST: '/api/watchlist',
  ACTIVITIES: '/api/activities',
  FRIENDS: '/api/friends',
  NOTIFICATIONS: '/api/notifications',
};