import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';

interface StreamingLogosProps {
  providers: any[];
  maxLogos?: number;
  size?: 'sm' | 'md' | 'lg';
  showNames?: boolean;
  showAffiliateIndicator?: boolean;
}

export const StreamingLogos: React.FC<StreamingLogosProps> = ({
  providers = [],
  maxLogos = 4,
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

  // Local logos mapping - prioritize these over TMDB logos for consistency
  const localLogos: Record<string, string> = {
    Netflix: "/logos/netflix.svg",
    // Amazon Prime Video variations
    "Amazon Prime Video": "/logos/primevideo.svg", 
    "Prime Video": "/logos/primevideo.svg",
    "Amazon Video": "/logos/primevideo.svg",
    "Amazon Prime": "/logos/primevideo.svg",
    "Amazon Prime Video with Ads": "/logos/primevideo.svg",
    // Other platforms
    Hulu: "/logos/hulu.svg",
    "Disney Plus": "/logos/disney-plus.png",
    "Disney+": "/logos/disney-plus.png",
    "HBO Max": "/logos/max.svg",
    "Max": "/logos/max.svg",
    "Apple TV Plus": "/logos/appletv.svg",
    "Apple TV": "/logos/appletv.svg",
    "Apple TV+": "/logos/appletv.svg",
    Peacock: "/logos/peacock.svg",
    "Paramount Plus": "/logos/paramountplus.svg",
    "Paramount+": "/logos/paramountplus.svg",
    Crunchyroll: "/logos/crunchyroll.svg",
    ESPN: "/logos/espn.svg",
    Starz: "/logos/starz.svg"
  };

  // Helper function to get the best logo source
  const getLogoSrc = (provider: any) => {
    const providerName = provider.provider_name || provider.name || '';
    return localLogos[providerName] || (provider.logo_path 
      ? `https://image.tmdb.org/t/p/w45${provider.logo_path}` 
      : '/bingeboard-logo.png');
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
      <span className="text-xs text-gray-400 mr-2 whitespace-nowrap">Available on:</span>
      {providers.slice(0, maxLogos).map((provider: any, index: number) => (
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
      {providers.length > maxLogos && (
        <Badge variant="secondary" className="text-xs h-6 px-2 bg-slate-700/50 border-slate-600">
          +{providers.length - maxLogos}
        </Badge>
      )}
    </div>
  );
};