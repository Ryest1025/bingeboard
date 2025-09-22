/**
 * TMDB API utilities for fetching platform logos and content data
 */

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || 'your-tmdb-api-key';
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
};