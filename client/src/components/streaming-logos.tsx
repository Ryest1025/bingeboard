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

export default function StreamingLogos({ providers = [], size = 'md', maxDisplayed = 4 }: StreamingLogosProps) {
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

  const displayedProviders = providers.slice(0, maxDisplayed);
  const hasMore = providers.length > maxDisplayed;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400 mr-1">Available on:</span>
      {displayedProviders.map((provider) => {
        // Use centralized logo system
        const logoUrl = getPlatformLogo(provider.provider_name);
        
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
                // Fallback to colored badge if image fails
                const target = e.target as HTMLImageElement;
                const parent = target.parentElement;
                if (parent) {
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
        <div className={`${sizeClasses[size]} bg-gray-700 rounded-md flex items-center justify-center`}>
          <span className={`${textSizeClasses[size]} font-bold text-white`}>
            +{providers.length - maxDisplayed}
          </span>
        </div>
      )}
    </div>
  );
}