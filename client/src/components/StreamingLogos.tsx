import React, { useState } from 'react';
import { getStreamingNetwork } from '@/utils/streaming-networks';
import ProviderLogo from './ProviderLogo';

// Mapping for logo file names that don't match network IDs exactly
const LOGO_FILE_MAPPING: Record<string, string> = {
  'apple': 'appletv',
  'prime': 'primevideo',
  'hbo': 'max',
  'paramount': 'paramountplus',
};

// Component to handle SVG logo loading with fallback (kept for local SVG support)
const NetworkLogo: React.FC<{ 
  networkId: string; 
  fallback: string; 
  tmdbLogo?: string; 
}> = ({ networkId, fallback, tmdbLogo }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // If we have a TMDB logo, use ProviderLogo component instead
  if (tmdbLogo) {
    return <ProviderLogo logoPath={tmdbLogo} name={fallback} />;
  }
  
  // Otherwise use local SVG
  const logoSrc = `/logos/${LOGO_FILE_MAPPING[networkId] || networkId}.svg`;

  if (imageError) {
    return (
      <span className="text-xs font-semibold opacity-90">
        {fallback}
      </span>
    );
  }

  return (
    <>
      <img
        src={logoSrc}
        alt={networkId}
        className={`w-full h-full object-contain transition-opacity duration-200 ${
          imageLoaded ? 'opacity-90' : 'opacity-0'
        }`}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
      />
      {!imageLoaded && !imageError && (
        <span className="text-xs font-semibold opacity-60 animate-pulse">
          {fallback}
        </span>
      )}
    </>
  );
};

interface StreamingPlatform {
  provider_id?: number;
  provider_name?: string;
  name?: string;
  logo_path?: string;
  affiliate_supported?: boolean;
  web_url?: string;
}

interface StreamingLogosProps {
  networks: (string | StreamingPlatform)[];
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showTitle?: string; // For affiliate tracking
  showId?: number; // For affiliate tracking
  enableAffiliateLinks?: boolean;
}

const StreamingLogos: React.FC<StreamingLogosProps> = ({ 
  networks, 
  size = 'md', 
  className = '',
  showTitle,
  showId,
  enableAffiliateLinks = true
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };

  const validNetworks = networks
    .slice(0, 3) // Limit to 3 networks to avoid clutter
    .map(networkItem => {
      if (typeof networkItem === 'string') {
        // Handle string case (legacy)
        return getStreamingNetwork(networkItem);
      } else {
        // Handle platform object case - use TMDB logo if available
        const name = networkItem.provider_name || networkItem.name || '';
        const tmdbLogo = networkItem.logo_path 
          ? `https://image.tmdb.org/t/p/w92${networkItem.logo_path}`
          : null;
        
        const network = getStreamingNetwork(name);
        
        // Return enhanced network with TMDB logo and affiliate info if available
        return network ? {
          ...network,
          tmdbLogo,
          affiliateSupported: networkItem.affiliate_supported || false,
          webUrl: networkItem.web_url,
          providerId: networkItem.provider_id,
          providerName: networkItem.provider_name || networkItem.name
        } : null;
      }
    })
    .filter(Boolean);

  if (validNetworks.length === 0) return null;

  // Generate affiliate URL for a platform
  const getAffiliateUrl = (network: any) => {
    if (!enableAffiliateLinks || !network.affiliateSupported || !showTitle || !showId) {
      return network.webUrl || '#';
    }
    
    const params = new URLSearchParams({
      provider: network.providerName || network.name,
      title: showTitle,
      showId: showId.toString()
    });
    
    return `/api/affiliate/redirect?${params.toString()}`;
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {validNetworks.map((network, index) => {
        const affiliateUrl = getAffiliateUrl(network);
        const isAffiliate = enableAffiliateLinks && (network as any).affiliateSupported && showTitle && showId;
        
        const logoElement = (
          <div
            className={`
              ${sizeClasses[size]} 
              rounded-full 
              flex items-center justify-center 
              relative
              bg-slate-800/80 
              backdrop-blur-sm 
              border border-slate-600/50
              hover:scale-110 
              transition-transform 
              duration-200
              ${isAffiliate ? 'cursor-pointer hover:border-green-400/60' : ''}
            `}
            style={{ 
              backgroundColor: `${network!.color}20`,
              borderColor: `${network!.color}40`
            }}
            title={`${network!.name}${isAffiliate ? ' (Affiliate Link)' : ''}`}
          >
            <NetworkLogo 
              networkId={network!.id} 
              fallback={network!.logo} 
              tmdbLogo={(network as any).tmdbLogo}
            />
            {/* Affiliate badge */}
            {isAffiliate && (
              <span className="absolute -top-1 -right-1 text-[8px] bg-green-500 text-white px-1 py-0.5 rounded-full font-bold leading-none">
                $
              </span>
            )}
          </div>
        );

        // Wrap in link if affiliate is supported
        if (isAffiliate) {
          return (
            <a
              key={`${network!.id}-${index}`}
              href={affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              {logoElement}
            </a>
          );
        }

        return (
          <div key={`${network!.id}-${index}`}>
            {logoElement}
          </div>
        );
      })}
      {networks.length > 3 && (
        <div
          className={`
            ${sizeClasses[size]} 
            rounded-full 
            flex items-center justify-center 
            bg-slate-700/80 
            text-slate-400 
            text-xs
            border border-slate-600/50
          `}
          title={`+${networks.length - 3} more`}
        >
          +{networks.length - 3}
        </div>
      )}
    </div>
  );
};

export default StreamingLogos;