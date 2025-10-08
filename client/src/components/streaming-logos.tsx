import React from 'react';
import { getPlatformLogo, normalizePlatformName } from '@/utils/platformLogos';

interface StreamingLogosProps {
  providers?: Array<{
    provider_id: number;
    provider_name: string;
    logo_path?: string;
  }>;
  size?: 'sm' | 'md' | 'lg';
  maxDisplayed?: number;
}

const FALLBACK_COLORS: Record<string, string> = {
  'Netflix': 'bg-red-600',
  'Disney Plus': 'bg-blue-600',
  'Amazon Prime Video': 'bg-blue-500',
  'HBO Max': 'bg-purple-600',
  'Hulu': 'bg-green-500',
  'Apple TV Plus': 'bg-black',
  'Paramount Plus': 'bg-blue-700',
  'Peacock': 'bg-purple-500',
  'YouTube': 'bg-red-500',
  'Crunchyroll': 'bg-orange-500'
};

export default function StreamingLogos({ providers = [], size = 'md', maxDisplayed = 1 }: StreamingLogosProps) {
  // Early return if no providers
  if (!providers || providers.length === 0) {
    return null;
  }

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  // Platform priority ranking - higher priority platforms shown first
  const platformPriority: Record<string, number> = {
    "Netflix": 10,
    "Disney+": 9,
    "Disney Plus": 9,
    // Amazon Prime Video variations - all same priority
    "Amazon Prime Video": 8,
    "Prime Video": 8,
    "Amazon Video": 8,
    "Amazon Prime": 8,
    "Amazon Prime Video with Ads": 8,
    // Other platforms
    "HBO Max": 7,
    "Max": 7,
    "Apple TV+": 6,
    "Apple TV Plus": 6,
    "Apple TV": 6,
    "Hulu": 5,
    "Paramount+": 4,
    "Paramount Plus": 4,
    "Peacock": 3,
    "Crunchyroll": 2,
    "Discovery+": 1,
    "Discovery Plus": 1
  };

  // Enhanced deduplication by normalized base platform name
  const seenPlatforms = new Set<string>();
  const uniqueProviders = providers.filter(provider => {
    if (!provider || !provider.provider_name) return false;
    
    // Extract base platform name (remove variations like "with Ads", "Standard", etc.)
    let baseName = provider.provider_name
      .toLowerCase()
      .trim()
      .replace(/\s+(with\s+ads?|standard|premium|plus|4k|uhd|hd).*$/i, '')
      .replace(/\s+/g, '');
    
    // Normalize common platform variations to prevent duplicates
    if (baseName.includes('amazon') || baseName.includes('prime')) {
      baseName = 'amazon';
    } else if (baseName.includes('disney')) {
      baseName = 'disney';
    } else if (baseName.includes('hbo') || baseName.includes('max')) {
      baseName = 'hbo';
    } else if (baseName.includes('apple')) {
      baseName = 'apple';
    } else if (baseName.includes('paramount')) {
      baseName = 'paramount';
    } else if (baseName.includes('netflix')) {
      baseName = 'netflix';
    } else if (baseName.includes('hulu')) {
      baseName = 'hulu';
    } else if (baseName.includes('peacock')) {
      baseName = 'peacock';
    } else if (baseName.includes('crunchyroll')) {
      baseName = 'crunchyroll';
    } else if (baseName.includes('discovery')) {
      baseName = 'discovery';
    }
    
    if (seenPlatforms.has(baseName)) {
      return false;
    }
    
    seenPlatforms.add(baseName);
    return true;
  });

  // Sort by priority descending
  const sortedProviders = uniqueProviders.slice().sort((a, b) => {
    const aName = a.provider_name || '';
    const bName = b.provider_name || '';
    const ap = platformPriority[aName] || 0;
    const bp = platformPriority[bName] || 0;
    return bp - ap;
  });

  const displayedProviders = sortedProviders.slice(0, Math.max(1, maxDisplayed));
  const remaining = Math.max(0, sortedProviders.length - displayedProviders.length);
  const hasMore = remaining > 0;

  // Debug logging for development
  if (process.env.NODE_ENV === 'development') {
    console.log('🎬 StreamingLogos processing (updated 4:15pm):', { 
      originalCount: providers.length, 
      uniqueCount: uniqueProviders.length, 
      sortedCount: sortedProviders.length,
      displayedCount: displayedProviders.length,
      remaining,
      displayed: displayedProviders.map((p: any) => p.provider_name)
    });
  }

  return (
    <div className="flex items-center gap-2">
      {displayedProviders.map((provider: any, index: number) => {
        // Use the entire provider object so getPlatformLogo can access logo_path
        const logoUrl = getPlatformLogo(provider);
        
        return (
          <div
            key={`${provider.provider_id || index}-${provider.provider_name}`}
            className={`${sizeClasses[size]} rounded-md overflow-hidden flex items-center justify-center bg-white/10 p-1`}
            title={provider.provider_name}
          >
            <img
              src={logoUrl}
              alt={provider.provider_name}
              className={`${sizeClasses[size]} object-contain`}
              onError={(e) => {
                // More robust fallback to colored badge if TMDB/local image fails
                const target = e.target as HTMLImageElement;
                const parent = target.parentElement;
                
                // Try local fallback first if we were using TMDB
                if (provider.logo_path && !target.src.includes('/logos/')) {
                  target.src = getPlatformLogo(provider);
                } else if (parent && target.src !== '/logos/default.svg') {
                  // Try default logo
                  target.src = '/logos/default.svg';
                } else if (parent) {
                  // If all fails, show colored badge
                  parent.innerHTML = `
                    <div class="${sizeClasses[size]} ${FALLBACK_COLORS[provider.provider_name] || 'bg-gray-600'} rounded-md flex items-center justify-center">
                      <span class="${textSizeClasses[size]} font-bold text-white">${provider.provider_name.charAt(0)}</span>
                    </div>
                  `;
                }
              }}
            />
          </div>
        );
      })}
      
      {hasMore && (
        <span className="text-xs text-gray-400">+{remaining} more</span>
      )}
    </div>
  );
}