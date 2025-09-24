import React from 'react';
import { getPlatformLogo } from '@/utils/platformLogos';

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

  // Get the primary (highest priority) platform
  const primaryProvider = providers.reduce((best, current) => {
    const currentName = current.provider_name || '';
    const bestName = best.provider_name || '';
    const currentPriority = platformPriority[currentName] || 0;
    const bestPriority = platformPriority[bestName] || 0;
    return currentPriority > bestPriority ? current : best;
  });

  const displayedProviders = [primaryProvider];
  const hasMore = providers.length > 1;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400 mr-1">On:</span>
      {displayedProviders.map((provider) => {
        // Use the entire provider object so getPlatformLogo can access logo_path
        const logoUrl = getPlatformLogo(provider);
        
        return (
          <div
            key={provider.provider_id}
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
        <span className="text-xs text-gray-400">+{providers.length - 1} more</span>
      )}
    </div>
  );
}