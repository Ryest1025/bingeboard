import React, { useState, useEffect, useCallback } from 'react';

// Local fallback logos mapping to your existing logo files
export const PLATFORM_LOGOS: Record<string, string> = {
  // Main streaming services - matching actual file names
  netflix: '/logos/netflix.svg',
  'amazon prime video': '/logos/PrimeVideo.svg',
  'prime video': '/logos/PrimeVideo.svg',
  'amazon video': '/logos/PrimeVideo.svg',
  'amazon prime': '/logos/PrimeVideo.svg',
  'prime': '/logos/PrimeVideo.svg',
  hulu: '/logos/hulu.svg',
  'disney plus': '/logos/disney.svg',
  'disney+': '/logos/disney.svg',
  'disney': '/logos/disney.svg',
  'hbo max': '/logos/Max.svg',
  'max': '/logos/Max.svg',
  'apple tv plus': '/logos/appletv.svg',
  'apple tv': '/logos/appletv.svg',
  'apple tv+': '/logos/appletv.svg',
  peacock: '/logos/peacock.svg',
  'paramount plus': '/logos/paramountplus.svg',
  'paramount+': '/logos/paramountplus.svg',
  'paramount': '/logos/Paramount.svg',
  crunchyroll: '/logos/crunchyroll.svg',
  espn: '/logos/espn.svg',
  starz: '/logos/starz.svg',
  showtime: '/logos/showtime.svg',
  'discovery plus': '/logos/discoveryplus.svg',
  'discovery+': '/logos/discoveryplus.svg',
  
  // Additional common variations
  'netflix standard with ads': '/logos/netflix.svg',
  'paramount plus apple tv channel': '/logos/paramountplus.svg',
  'paramount+ amazon channel': '/logos/paramountplus.svg',
  'hbo max amazon channel': '/logos/Max.svg',
  'amazon prime video with ads': '/logos/PrimeVideo.svg',
  'crunchyroll amazon channel': '/logos/crunchyroll.svg',
  
  // Default fallback
  all: '/logos/default.svg',
  unknown: '/logos/default.svg',
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

/**
 * Get platform logo with fallback to local logos
 */
export function getPlatformLogo(platform: string): string {
  if (!platform) return PLATFORM_LOGOS.unknown;
  
  const normalizedPlatform = platform.toLowerCase().trim();
  
  // Check local logos first
  if (PLATFORM_LOGOS[normalizedPlatform]) {
    return PLATFORM_LOGOS[normalizedPlatform];
  }
  
  // Check cache
  if (logoCache[normalizedPlatform]) {
    return logoCache[normalizedPlatform];
  }
  
  // Return default if no match
  return PLATFORM_LOGOS.unknown;
}

/**
 * Hook for dynamic platform logo loading with TMDB integration
 */
export function usePlatformLogo(platform: string): string {
  const [logoUrl, setLogoUrl] = useState<string>(() => getPlatformLogo(platform));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!platform) {
      setLogoUrl(PLATFORM_LOGOS.unknown);
      return;
    }

    const normalizedPlatform = platform.toLowerCase().trim();

    // Return local logo immediately if available
    if (PLATFORM_LOGOS[normalizedPlatform]) {
      setLogoUrl(PLATFORM_LOGOS[normalizedPlatform]);
      return;
    }

    // Return cached logo if available
    if (logoCache[normalizedPlatform]) {
      setLogoUrl(logoCache[normalizedPlatform]);
      return;
    }

    // Try to fetch from TMDB if we have a provider ID
    const providerId = TMDB_PROVIDER_MAP[normalizedPlatform];
    if (!providerId) {
      setLogoUrl(PLATFORM_LOGOS.unknown);
      return;
    }

    setIsLoading(true);

    // Fetch logo from TMDB
    const tmdbLogoUrl = `https://image.tmdb.org/t/p/original/logo/${providerId}.jpg`;
    
    // Preload image to check if it exists
    const img = new Image();
    img.onload = () => {
      logoCache[normalizedPlatform] = tmdbLogoUrl;
      setLogoUrl(tmdbLogoUrl);
      setIsLoading(false);
    };
    img.onerror = () => {
      // Fallback to default logo
      logoCache[normalizedPlatform] = PLATFORM_LOGOS.unknown;
      setLogoUrl(PLATFORM_LOGOS.unknown);
      setIsLoading(false);
    };
    img.src = tmdbLogoUrl;

  }, [platform]);

  return logoUrl;
}

/**
 * Hook for preloading logos for multiple platforms
 */
export function usePreloadedLogos(platforms: string[]): {
  logos: LogoCache;
  isLoading: boolean;
  error: string | null;
} {
  const [logos, setLogos] = useState<LogoCache>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preloadLogos = useCallback(async () => {
    if (!platforms.length) return;

    setIsLoading(true);
    setError(null);

    try {
      const newLogos: LogoCache = {};
      const uniquePlatforms = Array.from(new Set(platforms.map(p => p.toLowerCase().trim())));

      // Process platforms in parallel
      await Promise.allSettled(
        uniquePlatforms.map(async (platform) => {
          // Check local logos first
          if (PLATFORM_LOGOS[platform]) {
            newLogos[platform] = PLATFORM_LOGOS[platform];
            return;
          }

          // Check cache
          if (logoCache[platform]) {
            newLogos[platform] = logoCache[platform];
            return;
          }

          // Try TMDB
          const providerId = TMDB_PROVIDER_MAP[platform];
          if (!providerId) {
            newLogos[platform] = PLATFORM_LOGOS.unknown;
            logoCache[platform] = PLATFORM_LOGOS.unknown;
            return;
          }

          const tmdbLogoUrl = `https://image.tmdb.org/t/p/original/logo/${providerId}.jpg`;

          try {
            // Preload image
            await new Promise<void>((resolve, reject) => {
              const img = new Image();
              img.onload = () => resolve();
              img.onerror = () => reject(new Error('Image failed to load'));
              img.src = tmdbLogoUrl;
            });

            newLogos[platform] = tmdbLogoUrl;
            logoCache[platform] = tmdbLogoUrl;
          } catch {
            newLogos[platform] = PLATFORM_LOGOS.unknown;
            logoCache[platform] = PLATFORM_LOGOS.unknown;
          }
        })
      );

      setLogos(prevLogos => ({ ...prevLogos, ...newLogos }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to preload logos');
    } finally {
      setIsLoading(false);
    }
  }, [platforms]);

  useEffect(() => {
    preloadLogos();
  }, [preloadLogos]);

  return { logos, isLoading, error };
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
  const logoUrl = preloaded ? getPlatformLogo(platform) : usePlatformLogo(platform);

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
        const fallback = PLATFORM_LOGOS.unknown;
        if (target.src !== fallback) {
          target.src = fallback;
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