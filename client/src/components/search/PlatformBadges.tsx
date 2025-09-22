import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import React from 'react';

export interface PlatformInfo {
  provider_id?: number;
  provider_name?: string;
  logo_path?: string | null;
}

interface PlatformBadgesProps {
  platforms: PlatformInfo[];
  maxVisible?: number;
  size?: 'xs' | 'sm';
  className?: string;
}

export const PlatformBadges: React.FC<PlatformBadgesProps> = ({ platforms, maxVisible = 4, size = 'sm', className }) => {
  if (!platforms || platforms.length === 0) return null;
  const visible = platforms.slice(0, maxVisible);
  const remaining = platforms.length - visible.length;
  const sizeClasses = size === 'xs' ? 'h-5 w-5 text-[10px]' : 'h-6 w-6 text-xs';

  // Local logo mapping (same as landing page)
  const localLogos: Record<string, string> = {
    Netflix: "/logos/netflix.svg",
    "Amazon Prime Video": "/logos/PrimeVideo.svg",
    "Prime Video": "/logos/PrimeVideo.svg",
    "Amazon Video": "/logos/PrimeVideo.svg",
    "Amazon Prime": "/logos/PrimeVideo.svg",
    Hulu: "/logos/hulu.svg",
    "Disney Plus": "/logos/disney.svg",
    "Disney+": "/logos/disney.svg",
    "HBO Max": "/logos/Max.svg",
    "Max": "/logos/Max.svg",
    "Apple TV Plus": "/logos/appletv.svg",
    "Apple TV": "/logos/appletv.svg",
    "Apple TV+": "/logos/appletv.svg",
    Peacock: "/logos/peacock.svg",
    "Paramount Plus": "/logos/paramountplus.svg",
    "Paramount+": "/logos/paramountplus.svg",
    Paramount: "/logos/Paramount.svg",
    Crunchyroll: "/logos/crunchyroll.svg",
    ESPN: "/logos/espn.svg",
    Starz: "/logos/starz.svg",
    Showtime: "/logos/showtime.svg",
    "Discovery Plus": "/logos/discoveryplus.svg",
    "Discovery+": "/logos/discoveryplus.svg"
  };

  const getLogoSrc = (platform: PlatformInfo): string | null => {
    const providerName = platform.provider_name || '';
    const localLogo = localLogos[providerName];
    
    // Return local logo if available
    if (localLogo) return localLogo;
    
    // Handle platform.logo_path
    if (platform.logo_path) {
      // If logo_path is already a full URL, return it as-is
      if (platform.logo_path.startsWith('http')) {
        return platform.logo_path;
      }
      // Otherwise, construct TMDB URL
      return `https://image.tmdb.org/t/p/w45${platform.logo_path}`;
    }
    
    return null;
  };

  return (
    <TooltipProvider>
      <div className={"flex items-center gap-1 flex-wrap " + (className || '')}>
        {visible.map(p => {
          const label = p.provider_name || 'Unknown';
          const logo = getLogoSrc(p);
          return (
            <Tooltip key={p.provider_id || label}>
              <TooltipTrigger asChild>
                {logo ? (
                  <img
                    src={logo}
                    alt={label}
                    className={`rounded-sm object-cover bg-gray-800 ${sizeClasses}`}
                    loading="lazy"
                  />
                ) : (
                  <Badge variant="secondary" className="bg-gray-700 text-gray-200">
                    {label.slice(0, 4)}
                  </Badge>
                )}
              </TooltipTrigger>
              <TooltipContent>{label}</TooltipContent>
            </Tooltip>
          );
        })}
        {remaining > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="cursor-default">+{remaining}</Badge>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <div className="text-xs space-y-1">
                {platforms.slice(maxVisible).map(p => (
                  <div key={p.provider_id || p.provider_name}>{p.provider_name}</div>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};

export default PlatformBadges;
