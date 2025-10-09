// API configuration for different environments
export const getApiBaseUrl = () => {
  // Check if we have a custom API base URL (for production with hosted backend)
  const customApiBase = import.meta.env.VITE_API_BASE_URL;
  if (customApiBase) {
    // Temporarily disable broken backend - fallback to local origin
    // TODO: Re-enable when backend is fixed
    // return customApiBase;
    console.warn('🚨 Backend API unavailable, using fallback mode');
  }
  
  // Default to current origin for local development
  return window.location.origin;
};

export const makeApiUrl = (endpoint: string) => {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

// Enhanced fetch that automatically uses the correct API base URL
export const apiFetch = async (endpoint: string, options?: RequestInit) => {
  const url = makeApiUrl(endpoint);
  console.log(`🌐 API call: ${url}`);
  return fetch(url, {
    credentials: 'include',
    ...options,
  });
};