/**
 * Platform name normalization utilities for consistent streaming provider matching
 */

// Platform name mappings for common variations
const PLATFORM_NORMALIZATIONS: Record<string, string> = {
  // HBO variations
  'hbo max': 'max',
  'hbo': 'max',
  'hbo max amazon channel': 'max',
  'max amazon channel': 'max',
  
  // Amazon variations
  'amazon prime video': 'prime-video',
  'prime video': 'prime-video',
  'amazon video': 'prime-video',
  'amazon prime': 'prime-video',
  'amazon prime video with ads': 'prime-video',
  
  // Apple variations
  'apple tv+': 'apple-tv',
  'apple tv plus': 'apple-tv',
  'apple tv': 'apple-tv',
  'apple tv plus amazon channel': 'apple-tv',
  
  // Disney variations
  'disney+': 'disney-plus',
  'disney plus': 'disney-plus',
  'disney': 'disney-plus',
  
  // Netflix variations
  'netflix': 'netflix',
  'netflix standard with ads': 'netflix',
  'netflix basic with ads': 'netflix',
  
  // Hulu variations
  'hulu': 'hulu',
  'hulu (no ads)': 'hulu',
  'hulu + live tv': 'hulu',
  
  // Paramount variations
  'paramount+': 'paramount-plus',
  'paramount plus': 'paramount-plus',
  'paramount': 'paramount-plus',
  'cbs all access': 'paramount-plus',
  
  // Peacock variations
  'peacock': 'peacock',
  'peacock premium': 'peacock',
  'peacock premium plus': 'peacock',
  
  // Showtime variations
  'showtime': 'showtime',
  'showtime amazon channel': 'showtime',
  'paramount+ with showtime': 'showtime',
  
  // Starz variations
  'starz': 'starz',
  'starz amazon channel': 'starz',
  
  // Other common variations
  'crunchyroll': 'crunchyroll',
  'crunchyroll amazon channel': 'crunchyroll',
  'funimation': 'crunchyroll', // Merged with Crunchyroll
  'espn+': 'espn-plus',
  'espn plus': 'espn-plus',
  'discovery+': 'discovery-plus',
  'discovery plus': 'discovery-plus',
  'tubi': 'tubi',
  'pluto tv': 'pluto-tv',
  'youtube tv': 'youtube-tv',
  'fubo': 'fubo',
  'fubotv': 'fubo'
};

/**
 * Normalize platform names for consistent matching
 */
export const normalizePlatformName = (platformName: string): string => {
  if (!platformName) return '';
  
  const normalized = platformName.toLowerCase().trim();
  return PLATFORM_NORMALIZATIONS[normalized] || normalized;
};

/**
 * Check if two platform names represent the same service
 */
export const platformsMatch = (platform1: string, platform2: string): boolean => {
  if (!platform1 || !platform2) return false;
  
  const norm1 = normalizePlatformName(platform1);
  const norm2 = normalizePlatformName(platform2);
  
  return norm1 === norm2;
};

/**
 * Find matching platform in an array of platforms
 */
export const findMatchingPlatform = (
  targetPlatform: string,
  platforms: Array<{ provider_name?: string; name?: string }>
): any | null => {
  if (!targetPlatform || !platforms) return null;
  
  return platforms.find(platform => {
    const platformName = platform.provider_name || platform.name || '';
    return platformsMatch(targetPlatform, platformName);
  }) || null;
};

/**
 * Get canonical platform name for display
 */
export const getCanonicalPlatformName = (platformName: string): string => {
  const normalized = normalizePlatformName(platformName);
  
  // Return display-friendly names
  const displayNames: Record<string, string> = {
    'max': 'Max',
    'prime-video': 'Prime Video',
    'apple-tv': 'Apple TV+',
    'disney-plus': 'Disney+',
    'netflix': 'Netflix',
    'hulu': 'Hulu',
    'paramount-plus': 'Paramount+',
    'peacock': 'Peacock',
    'showtime': 'Showtime',
    'starz': 'Starz',
    'crunchyroll': 'Crunchyroll',
    'espn-plus': 'ESPN+',
    'discovery-plus': 'Discovery+',
    'tubi': 'Tubi',
    'pluto-tv': 'Pluto TV',
    'youtube-tv': 'YouTube TV',
    'fubo': 'Fubo'
  };
  
  return displayNames[normalized] || platformName;
};

/**
 * Debug helper to see platform normalization
 */
export const debugPlatformNormalization = (platforms: Array<{ provider_name?: string; name?: string }>) => {
  if (process.env.NODE_ENV !== 'development') return;
  
  console.group('🔧 Platform Normalization Debug');
  platforms.forEach((platform, index) => {
    const original = platform.provider_name || platform.name || 'Unknown';
    const normalized = normalizePlatformName(original);
    const canonical = getCanonicalPlatformName(original);
    
    console.log(`${index + 1}. "${original}" → "${normalized}" → "${canonical}"`);
  });
  console.groupEnd();
};