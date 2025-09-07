// API configuration for proper backend communication
export const API_CONFIG = {
  // Use environment variable for Codespaces or fall back to window.location.origin
  baseURL: typeof window !== 'undefined' ? window.location.origin : 'https://fuzzy-xylophone-5g97jqp4vq9wf4jjr-5000.app.github.dev',
  
  // Helper function to create full API URLs
  getApiUrl: (path: string) => {
    // Get base URL from environment or default to Codespaces URL
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 
                   (typeof window !== 'undefined' ? window.location.origin : 'https://fuzzy-xylophone-5g97jqp4vq9wf4jjr-5000.app.github.dev');
    
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