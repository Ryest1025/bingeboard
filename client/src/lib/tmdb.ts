/**
 * TMDB API utilities for fetching platform logos and content data
 * Enhanced with content discovery and search functionality
 */

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY || 'your-tmdb-api-key';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w45';

// Platform name to TMDB provider ID mapping
const PLATFORM_PROVIDER_MAP: Record<string, number> = {
  'netflix': 8,
  'amazon prime video': 9,
  'prime video': 9,
  'prime': 9,
  'disney+': 337,
  'disney plus': 337,
  'hulu': 15,
  'hbo max': 384,
  'max': 384,
  'apple tv+': 350,
  'apple tv': 350,
  'paramount+': 531,
  'paramount plus': 531,
  'peacock': 386,
  'crunchyroll': 283,
  'funimation': 269,
  'youtube premium': 188,
  'youtube': 188,
  'starz': 43,
  'showtime': 37,
  'cinemax': 200,
  'epix': 634,
  'mgm+': 634,
  'amc+': 526,
  'discovery+': 520,
  'pluto tv': 300,
  'tubi': 73,
  'vudu': 7,
  'google play movies': 3,
  'microsoft store': 68,
  'roku channel': 207,
};

// Local logo fallbacks for major platforms
const LOCAL_LOGO_MAP: Record<string, string> = {
  'netflix': '/logos/Netflix.svg',
  'amazon prime video': '/logos/PrimeVideo.svg',
  'prime video': '/logos/PrimeVideo.svg',
  'prime': '/logos/PrimeVideo.svg',
  'disney+': '/logos/DisneyPlus.svg',
  'disney plus': '/logos/DisneyPlus.svg',
  'hulu': '/logos/Hulu.svg',
  'hbo max': '/logos/Max.svg',
  'max': '/logos/Max.svg',
  'apple tv+': '/logos/AppleTVPlus.svg',
  'apple tv': '/logos/AppleTVPlus.svg',
  'paramount+': '/logos/ParamountPlus.svg',
  'paramount plus': '/logos/ParamountPlus.svg',
  'peacock': '/logos/Peacock.svg',
  'crunchyroll': '/logos/Crunchyroll.svg',
  'youtube': '/logos/YouTube.svg',
  'starz': '/logos/Starz.svg',
  'showtime': '/logos/Showtime.svg',
};

const FALLBACK_LOGO = '/logos/default.png';
const logoCache: Record<string, string> = {};

/**
 * Fetch platform logo from TMDB API
 */
export async function fetchTMDBPlatformLogo(platformName: string): Promise<string | null> {
  const normalizedPlatform = platformName.toLowerCase().trim();
  
  // Check cache first
  if (logoCache[normalizedPlatform]) {
    return logoCache[normalizedPlatform];
  }

  // Try local logo first
  if (LOCAL_LOGO_MAP[normalizedPlatform]) {
    logoCache[normalizedPlatform] = LOCAL_LOGO_MAP[normalizedPlatform];
    return LOCAL_LOGO_MAP[normalizedPlatform];
  }

  // Get TMDB provider ID
  const providerId = PLATFORM_PROVIDER_MAP[normalizedPlatform];
  if (!providerId) {
    console.warn(`No TMDB provider ID found for platform: ${platformName}`);
    logoCache[normalizedPlatform] = FALLBACK_LOGO;
    return FALLBACK_LOGO;
  }

  try {
    // Fetch provider details from TMDB
    const response = await fetch(
      `${TMDB_BASE_URL}/watch/providers/movie?api_key=${TMDB_API_KEY}&watch_region=US`
    );
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.statusText}`);
    }

    const data = await response.json();
    const provider = data.results?.US?.flatrate?.find((p: any) => p.provider_id === providerId) ||
                    data.results?.US?.buy?.find((p: any) => p.provider_id === providerId) ||
                    data.results?.US?.rent?.find((p: any) => p.provider_id === providerId);

    if (provider?.logo_path) {
      const logoUrl = `${TMDB_IMAGE_BASE}${provider.logo_path}`;
      logoCache[normalizedPlatform] = logoUrl;
      return logoUrl;
    } else {
      console.warn(`No logo found in TMDB for provider: ${platformName}`);
      logoCache[normalizedPlatform] = FALLBACK_LOGO;
      return FALLBACK_LOGO;
    }
  } catch (error) {
    console.error(`Error fetching TMDB logo for ${platformName}:`, error);
    logoCache[normalizedPlatform] = FALLBACK_LOGO;
    return FALLBACK_LOGO;
  }
}

/**
 * Preload multiple platform logos
 */
export async function preloadPlatformLogos(platforms: string[]): Promise<Record<string, string>> {
  const logos: Record<string, string> = {};
  
  await Promise.all(
    platforms.map(async (platform) => {
      const logo = await fetchTMDBPlatformLogo(platform);
      logos[platform.toLowerCase()] = logo || FALLBACK_LOGO;
    })
  );

  return logos;
}

/**
 * Get logo URL with fallback
 */
export function getPlatformLogo(platformName: string): string {
  const normalizedPlatform = platformName.toLowerCase().trim();
  
  // Check cache first
  if (logoCache[normalizedPlatform]) {
    return logoCache[normalizedPlatform];
  }

  // Return local logo if available
  if (LOCAL_LOGO_MAP[normalizedPlatform]) {
    return LOCAL_LOGO_MAP[normalizedPlatform];
  }

  // Return fallback
  return FALLBACK_LOGO;
}

/**
 * Clear logo cache (useful for testing)
 */
export function clearLogoCache(): void {
  Object.keys(logoCache).forEach(key => delete logoCache[key]);
}

/**
 * Get cached logo count (for debugging)
 */
export function getCachedLogoCount(): number {
  return Object.keys(logoCache).length;
}

export default {
  fetchTMDBPlatformLogo,
  preloadPlatformLogos,
  getPlatformLogo,
  clearLogoCache,
  getCachedLogoCount,
  // Content fetching functions
  fetchTMDB,
  getMediaByCategory,
  searchMulti,
  getStreamingProviders,
  getTMDBImageUrl,
  formatTMDBItem,
};

// ==========================================
// CONTENT DISCOVERY & SEARCH FUNCTIONALITY  
// ==========================================

interface TMDBResponse {
  results: any[];
  total_pages?: number;
  total_results?: number;
}

interface TMDBError {
  status_message: string;
  status_code: number;
}

/**
 * Generic TMDB API fetch function with error handling
 */
export async function fetchTMDB(endpoint: string, params: Record<string, string> = {}): Promise<any[]> {
  if (!TMDB_API_KEY || TMDB_API_KEY === 'your-tmdb-api-key') {
    throw new Error("TMDB API key not found. Please add VITE_TMDB_API_KEY to your .env file.");
  }

  const searchParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: 'en-US',
    ...params
  });

  const url = `${TMDB_BASE_URL}${endpoint}?${searchParams.toString()}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData: TMDBError = await response.json();
      throw new Error(`TMDB API Error: ${errorData.status_message || response.statusText}`);
    }
    
    const data: TMDBResponse = await response.json();
    return data.results || [];
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch data from TMDB");
  }
}

/**
 * Get media content by category and type
 */
export async function getMediaByCategory(category: string, mediaType: string): Promise<any[]> {
  try {
    switch (category) {
      case "trending":
        // Get trending content for the week
        const trendingType = mediaType === "all" ? "all" : mediaType;
        return await fetchTMDB(`/trending/${trendingType}/week`);
        
      case "popular":
        if (mediaType === "all") {
          // Get both popular movies and TV shows, then combine
          const [movies, tvShows] = await Promise.all([
            fetchTMDB('/movie/popular'),
            fetchTMDB('/tv/popular')
          ]);
          // Add media_type to distinguish between movies and TV shows
          const moviesWithType = movies.map(item => ({ ...item, media_type: 'movie' }));
          const tvWithType = tvShows.map(item => ({ ...item, media_type: 'tv' }));
          return [...moviesWithType, ...tvWithType].slice(0, 20); // Limit to 20 items
        }
        return await fetchTMDB(`/${mediaType}/popular`);
        
      case "upcoming":
        // Upcoming is only available for movies
        if (mediaType === "tv") {
          // For TV shows, get airing today instead
          return await fetchTMDB('/tv/airing_today');
        }
        return await fetchTMDB('/movie/upcoming');
        
      case "top-rated":
        if (mediaType === "all") {
          // Get both top-rated movies and TV shows
          const [movies, tvShows] = await Promise.all([
            fetchTMDB('/movie/top_rated'),
            fetchTMDB('/tv/top_rated')
          ]);
          const moviesWithType = movies.map(item => ({ ...item, media_type: 'movie' }));
          const tvWithType = tvShows.map(item => ({ ...item, media_type: 'tv' }));
          return [...moviesWithType, ...tvWithType].slice(0, 20);
        }
        return await fetchTMDB(`/${mediaType}/top_rated`);
        
      case "award-winners":
        // For award winners, we'll use high-rated content from recent years
        // This is a creative interpretation since TMDB doesn't have direct award data
        const currentYear = new Date().getFullYear();
        const params = {
          'vote_average.gte': '7.5',
          'vote_count.gte': '100',
          'primary_release_year': (currentYear - 1).toString(), // Last year's content
          'sort_by': 'vote_average.desc'
        };
        
        if (mediaType === "all") {
          const [movies, tvShows] = await Promise.all([
            fetchTMDB('/discover/movie', params),
            fetchTMDB('/discover/tv', { 
              ...params, 
              'first_air_date_year': (currentYear - 1).toString() 
            })
          ]);
          const moviesWithType = movies.map(item => ({ ...item, media_type: 'movie' }));
          const tvWithType = tvShows.map(item => ({ ...item, media_type: 'tv' }));
          return [...moviesWithType, ...tvWithType].slice(0, 20);
        } else if (mediaType === "movie") {
          return await fetchTMDB('/discover/movie', params);
        } else {
          return await fetchTMDB('/discover/tv', { 
            ...params, 
            'first_air_date_year': (currentYear - 1).toString() 
          });
        }
        
      case "all":
      default:
        // Default to trending all content
        return await fetchTMDB('/trending/all/week');
    }
  } catch (error) {
    console.error(`Error fetching ${category} content:`, error);
    throw error;
  }
}

/**
 * Search for movies and TV shows
 */
export async function searchMulti(query: string): Promise<any[]> {
  if (!query.trim()) {
    return [];
  }
  
  return await fetchTMDB('/search/multi', { 
    query: encodeURIComponent(query.trim()) 
  });
}

/**
 * Get streaming providers for a movie or TV show
 */
export async function getStreamingProviders(mediaType: 'movie' | 'tv', id: number): Promise<any> {
  try {
    const data = await fetchTMDB(`/${mediaType}/${id}/watch/providers`);
    return data;
  } catch (error) {
    console.error(`Error fetching streaming providers for ${mediaType} ${id}:`, error);
    return null;
  }
}

/**
 * Format TMDB image URLs
 */
export function getTMDBImageUrl(path: string | null, size: string = 'w500'): string {
  if (!path) {
    return '/placeholder.svg'; // Fallback placeholder
  }
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

/**
 * Format TMDB data for our MediaItem interface
 */
export function formatTMDBItem(item: any): any {
  return {
    id: item.id,
    title: item.title || item.name,
    name: item.name,
    poster_path: getTMDBImageUrl(item.poster_path),
    backdrop_path: getTMDBImageUrl(item.backdrop_path, 'original'),
    release_date: item.release_date,
    first_air_date: item.first_air_date,
    vote_average: item.vote_average,
    overview: item.overview,
    genre_ids: item.genre_ids || [],
    media_type: item.media_type || (item.title ? 'movie' : 'tv'),
    streaming_platforms: [], // Can be enriched later with watch providers
    // Additional useful fields
    adult: item.adult,
    original_language: item.original_language,
    popularity: item.popularity,
    vote_count: item.vote_count
  };
}