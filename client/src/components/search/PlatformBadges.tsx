import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { getPlatformLogo } from '@/utils/platformLogos';
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

export const PlatformBadges: React.FC<PlatformBadgesProps> = ({ platforms, maxVisible = 1, size = 'sm', className }) => {
  if (!platforms || platforms.length === 0) return null;
  const visible = platforms.slice(0, maxVisible);
  const remaining = platforms.length - visible.length;
  const sizeClasses = size === 'xs' ? 'h-5 w-5 text-[10px]' : 'h-6 w-6 text-xs';

  const getLogoSrc = (platform: PlatformInfo): string => {
    const providerName = platform.provider_name || '';
    
    // Use centralized platform logo system
    const centralizedLogo = getPlatformLogo(providerName);
    
    // If centralized system has a logo, use it
    if (centralizedLogo && !centralizedLogo.includes('default.svg')) { // default.svg is our fallback
      return centralizedLogo;
    }
    
    // Handle platform.logo_path from TMDB
    if (platform.logo_path) {
      // If logo_path is already a full URL, return it as-is
      if (platform.logo_path.startsWith('http')) {
        return platform.logo_path;
      }
      // Otherwise, construct TMDB URL
      return `https://image.tmdb.org/t/p/w45${platform.logo_path}`;
    }
    
    // Return centralized fallback
    return centralizedLogo;
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
                <img
                  src={logo}
                  alt={label}
                  className={`rounded-sm object-contain bg-white/10 p-0.5 ${sizeClasses}`}
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes('default.svg')) {
                      target.src = '/logos/default.svg'; // Final fallback
                    }
                  }}
                />
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
