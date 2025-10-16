import React, { useState, useEffect, useCallback } from 'react';

// Local fallback logos mapping to existing SVG logo files
export const PLATFORM_LOGOS: Record<string, string> = {
  // Main streaming services - using actual available logo files
  'Netflix': '/logos/icons8-netflix (1).svg',
  'Prime Video': '/logos/icons8-amazon-prime-video (1).svg',
  'Disney+': '/logos/icons8-disney-plus.svg',
  'Max': '/logos/icons8-hbo-max.svg',
  'Apple TV+': '/logos/Apple-tv-plus-official.svg',
  'Peacock': '/logos/icons8-peacock-tv.svg',
  'Paramount+': '/logos/icons8-paramount-plus.svg',
  'Crunchyroll': '/logos/icons8-crunchyroll.svg',
    'Starz': '/logos/Starz--Streamline-Simple-Icons.svg',
  'Showtime': '/logos/Showtime--Streamline-Simple-Icons.svg',
  'Hulu': '/logos/hulu-official.svg',
  'YouTube TV': '/logos/icons8-youtube-tv.svg', // Will fallback to badge if not found
  'Discovery+': '/logos/icons8-discovery-plus.svg', // Will fallback to badge if not found
  'ESPN': '/logos/icons8-espn.svg', // Will fallback to badge if not found

  // Lowercase variants for backup lookup
  'netflix': '/logos/icons8-netflix (1).svg',
  'prime video': '/logos/icons8-amazon-prime-video (1).svg',
  'disney+': '/logos/icons8-disney-plus.svg',
  'max': '/logos/icons8-hbo-max.svg',
  'apple tv+': '/logos/Apple-tv-plus-official.svg',
  'peacock': '/logos/icons8-peacock-tv.svg',
  'paramount+': '/logos/icons8-paramount-plus.svg',
  'crunchyroll': '/logos/icons8-crunchyroll.svg',
  'starz': '/logos/Starz--Streamline-Simple-Icons.svg',
  'showtime': '/logos/Showtime--Streamline-Simple-Icons.svg',
  'hulu': '/logos/hulu-official.svg',
  'youtube tv': '/logos/icons8-youtube-tv.svg',
  'discovery+': '/logos/icons8-discovery-plus.svg',
  'espn': '/logos/icons8-espn.svg',
};

// TMDB provider ID mapping for API integration
export const TMDB_PROVIDER_MAP: Record<string, number> = {
  netflix: 8,
  hulu: 15,
  'amazon prime video': 9,
  'prime video': 9,
  'disney plus': 337,
  'disney+': 337,
  'hbo max': 384,
  max: 384,
  'apple tv plus': 350,
  'apple tv+': 350,
  peacock: 386,
  'paramount plus': 531,
  'paramount+': 531,
  crunchyroll: 283,
  starz: 43,
  showtime: 37,
  'discovery plus': 524,
  'discovery+': 524,
};

interface LogoCache {
  [platform: string]: string;
}

// Simple in-memory cache for logos
const logoCache: LogoCache = {};

// Platform name normalization map
const PLATFORM_NORMALIZE_MAP: Record<string, string> = {
  // Amazon Prime Video variations
  'amazon prime video': 'Prime Video',
  'amazon prime video with ads': 'Prime Video',
  'prime video': 'Prime Video',
  'amazon video': 'Prime Video',
  'amazon prime': 'Prime Video',
  'prime': 'Prime Video',
  
  // Netflix variations
  'netflix': 'Netflix',
  'netflix standard with ads': 'Netflix',
  
  // Disney variations
  'disney plus': 'Disney+',
  'disney+': 'Disney+',
  'disney': 'Disney+',
  
  // HBO Max / Max variations
  'hbo max': 'Max',
  'max': 'Max',
  'hbo max amazon channel': 'Max',
  'hbo max  amazon channel': 'Max', // Extra space case
  
  // Apple TV variations
  'apple tv': 'Apple TV+',
  'apple tv+': 'Apple TV+',
  'apple tv plus': 'Apple TV+',
  
  // Paramount variations
  'paramount+': 'Paramount+',
  'paramount plus': 'Paramount+',
  'paramount': 'Paramount+',
  'paramount plus apple tv channel': 'Paramount+',
  'paramount+ amazon channel': 'Paramount+',
  'paramount+ roku premium channel': 'Paramount+',
  'paramount+ originals amazon channel': 'Paramount+',
  'paramount+ mtv amazon channel': 'Paramount+',
  
  // Hulu variations
  'hulu': 'Hulu',
  
  // Crunchyroll variations
  'crunchyroll': 'Crunchyroll',
  'crunchyroll amazon channel': 'Crunchyroll',
  
  // Other services
  'peacock': 'Peacock',
  'peacock premium': 'Peacock', 
  'starz': 'Starz',
  'starz amazon channel': 'Starz',
  'showtime': 'Showtime',
  'showtime amazon channel': 'Showtime',
  'discovery+': 'Discovery+',
  'discovery plus': 'Discovery+',
  'espn': 'ESPN',
  'espn+': 'ESPN',
  'espn plus': 'ESPN',
  'adult swim': 'Adult Swim',
  'tbs': 'TBS',
  'tnt': 'TNT',
  'youtube premium': 'YouTube Premium',
  'youtube tv': 'YouTube TV',
  'fandango at home': 'Vudu',
  'google play movies': 'Google Play',
  'spectrum on demand': 'Spectrum',
  'fubotv': 'fuboTV',
  'amc+': 'AMC+',
  'amc plus': 'AMC+',
};

/**
 * Normalize platform name to consistent format
 */
export function normalizePlatformName(platformName: string): string {
  if (!platformName || typeof platformName !== 'string') return 'Unknown';
  
  const normalized = platformName.toLowerCase().trim();
  return PLATFORM_NORMALIZE_MAP[normalized] || platformName;
}

/**
 * Get platform logo URL - prioritizes API-provided logos over local files
 * @param platform - Platform name or object with logo_path
 * @param logoPath - Optional logo path (could be TMDB path or external URL)
 */
export const getPlatformLogo = (platform: string | { name?: string; provider_name?: string; logo_path?: string } | any): string => {
  const platformName: string | undefined = typeof platform === 'string' ? platform : (platform?.name || platform?.provider_name);
  const normalizedName = platformName ? normalizePlatformName(platformName) : 'Unknown';

  // Debug logging
  if (process.env.NODE_ENV === 'development' && platform && typeof platform === 'object') {
    console.log('🎨 getPlatformLogo:', { 
      platformName, 
      hasLogoPath: !!platform.logo_path,
      logo_path: platform.logo_path,
      fullObject: platform 
    });
  }

  // 1) If TMDB logo is provided, use it
  if (platform && typeof platform === 'object' && platform.logo_path) {
    const path: string = platform.logo_path;
    if (path.startsWith('http')) return path;
    if (path.startsWith('/')) {
      const tmdbUrl = `https://image.tmdb.org/t/p/w92${path}`;
      console.log('✅ Using TMDB logo:', tmdbUrl);
      return tmdbUrl;
    }
  }

  // 2) Generate a colored badge (no local file fallback)
  console.log('⚠️ Falling back to badge for:', normalizedName);
  return generatePlatformBadge(normalizedName);
}

/**
 * Generate a colored badge with platform's first letter instead of using fake logos
 */
function generatePlatformBadge(platformName: string): string {
  const colors = [
    '#E50914', // Netflix red
    '#113CCF', // Disney blue
    '#002BE7', // Max blue
    '#00A8E1', // Prime blue
    '#1CE783', // Hulu green
    '#000000', // Apple black
    '#0064FF', // Paramount blue
    '#FA6B00', // Peacock orange
    '#FF6600', // Crunchyroll orange
    '#FF0000', // YouTube red
    '#0077C8', // Discovery blue
  ];
  
  const platformKey = platformName.toLowerCase().trim();
  const colorIndex = platformKey.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % colors.length;
  const color = colors[colorIndex];
  const letter = platformName.charAt(0).toUpperCase();
  
  // Return a data URL for a simple colored badge
  const svg = `<svg width="32" height="24" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="24" fill="${color}" rx="4"/>
    <text x="16" y="16" font-family="Arial, sans-serif" font-size="12" font-weight="bold" 
          text-anchor="middle" fill="white">${letter}</text>
  </svg>`;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Hook for platform logo loading - LOCAL ONLY (no external fetching)
 */
export function usePlatformLogo(platform: string): string {
  // Always use the getPlatformLogo function for consistency
  // No useState or external fetching to avoid 404 errors
  return getPlatformLogo(platform);
}

/**
 * Hook for preloading logos for multiple platforms - LOCAL ONLY
 */
export function usePreloadedLogos(platforms: string[]): {
  logos: LogoCache;
  isLoading: boolean;
  error: string | null;
} {
  const [logos, setLogos] = useState<LogoCache>({});

  useEffect(() => {
    if (!platforms.length) return;

    const newLogos: LogoCache = {};
    const uniquePlatforms = Array.from(new Set(platforms.map(p => p.toLowerCase().trim())));

    // Only use local logos - no external fetching
    uniquePlatforms.forEach(platform => {
      newLogos[platform] = getPlatformLogo(platform);
    });

    setLogos(newLogos);
  }, [platforms]);

  // Always return no loading/error since we're only using local logos
  return { 
    logos, 
    isLoading: false, 
    error: null 
  };
}

/**
 * Get TMDB image URL for any path
 */
export function getTMDBImageUrl(
  path: string | null, 
  size: 'w45' | 'w92' | 'w154' | 'w185' | 'w300' | 'w500' | 'w780' | 'original' = 'w300'
): string | undefined {
  if (!path) return undefined;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

/**
 * Platform logo component with automatic loading and fallback
 */
interface PlatformLogoProps {
  platform: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  alt?: string;
  preloaded?: boolean; // Use preloaded logos from context
}

export const PlatformLogo: React.FC<PlatformLogoProps> = ({ 
  platform, 
  size = 'md', 
  className = '', 
  alt,
  preloaded = false 
}) => {
  // Always use getPlatformLogo for consistency (no external fetching)
  const logoUrl = getPlatformLogo(platform);

  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <img
      src={logoUrl}
      alt={alt || `${platform} logo`}
      className={`${sizeClasses[size]} object-contain rounded ${className}`}
      loading="lazy"
      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
        const target = e.target as HTMLImageElement;
        // Fallback to a generated badge to avoid broken image icons
        const badge = generatePlatformBadge(normalizePlatformName(platform));
        if (target.src !== badge) {
          console.warn(`Logo failed for ${platform}, falling back to generated badge.`);
          target.src = badge;
        }
      }}
    />
  );
};

/**
 * Batch logo URL resolver for server-side or bulk operations
 */
export function resolvePlatformLogos(platforms: string[]): Record<string, string> {
  const resolved: Record<string, string> = {};
  
  platforms.forEach(platform => {
    resolved[platform] = getPlatformLogo(platform);
  });
  
  return resolved;
}

export default {
  getPlatformLogo,
  usePlatformLogo,
  usePreloadedLogos,
  getTMDBImageUrl,
  PlatformLogo,
  resolvePlatformLogos,
  PLATFORM_LOGOS,
  TMDB_PROVIDER_MAP,
};