import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import { getPlatformLogo } from '@/utils/platformLogos';

interface StreamingLogosProps {
  providers: any[];
  maxLogos?: number;
  size?: 'sm' | 'md' | 'lg';
  showNames?: boolean;
  showAffiliateIndicator?: boolean;
}

export const StreamingLogos: React.FC<StreamingLogosProps> = ({
  providers = [],
  maxLogos = 1,
  size = 'sm',
  showNames = false,
  showAffiliateIndicator = false
}) => {
  if (!providers || providers.length === 0) {
    return (
      <div className="flex items-center gap-1 mb-2">
        <span className="text-xs text-gray-500">No streaming info</span>
      </div>
    );
  }

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
    const currentName = current.provider_name || current.name || '';
    const bestName = best.provider_name || best.name || '';
    const currentPriority = platformPriority[currentName] || 0;
    const bestPriority = platformPriority[bestName] || 0;
    return currentPriority > bestPriority ? current : best;
  });

  // Use only the primary provider
  const displayProviders = [primaryProvider];



  // Helper function to get the best logo source using centralized system
  const getLogoSrc = (provider: any) => {
    if (provider.logo_path) {
      // ✅ Use TMDB's official logo asset directly
      return `https://image.tmdb.org/t/p/original${provider.logo_path}`;
    }

    // ✅ Otherwise fallback to local mapping
    const providerName = provider.provider_name || provider.name || '';
    return getPlatformLogo(providerName);
  };

  // Universal consistent sizing for all streaming logos
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-5 h-5',
    lg: 'w-5 h-5'
  };

  const containerClasses = {
    sm: 'gap-1.5',
    md: 'gap-1.5',
    lg: 'gap-1.5'
  };

  return (
    <div className={`flex items-center ${containerClasses[size]} mb-2 flex-wrap min-h-[24px]`}>
      <span className="text-xs text-gray-400 mr-2 whitespace-nowrap">On:</span>
      {displayProviders.map((provider: any, index: number) => (
        <div key={`${provider.provider_id || provider.provider_name || provider.name || 'unknown'}-${index}`} className="flex items-center relative">
          {showNames ? (
            <Badge
              variant="outline"
              className="text-xs bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50 transition-colors h-6 px-2"
            >
              <img
                src={getLogoSrc(provider)}
                alt={provider.provider_name || 'Streaming Platform'}
                className="w-3 h-3 rounded-sm mr-1 flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="whitespace-nowrap">{provider.provider_name || 'Platform'}</span>
              {showAffiliateIndicator && (
                <ExternalLink className="w-2 h-2 ml-1 text-green-400 flex-shrink-0" />
              )}
            </Badge>
          ) : (
            <div className="relative group">
              <img
                src={getLogoSrc(provider)}
                alt={provider.provider_name || 'Streaming Platform'}
                className={`${sizeClasses[size]} rounded-sm border border-slate-600 bg-white/10 backdrop-blur-sm hover:border-teal-400 transition-colors cursor-pointer flex-shrink-0`}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {provider.provider_name || 'Streaming Platform'}
                {showAffiliateIndicator && <span className="text-green-400 ml-1">💰</span>}
              </div>
              {showAffiliateIndicator && (
                <ExternalLink className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 text-green-400 bg-black/80 rounded-full p-0.5" />
              )}
            </div>
          )}
        </div>
      ))}
      {providers.length > 1 && (
        <Badge variant="secondary" className="text-xs h-6 px-2 bg-slate-700/50 border-slate-600">
          +{providers.length - 1} more
        </Badge>
      )}
    </div>
  );
};