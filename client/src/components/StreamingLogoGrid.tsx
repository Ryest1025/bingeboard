import React from "react";
import { getPlatformLogo } from '@/utils/platformLogos';

type Provider = {
  provider_id?: number;
  provider_name?: string;
  name?: string;
  logo_path?: string | null;
};

interface StreamingLogoGridProps {
  providers?: Provider[];
}

const StreamingLogoGrid: React.FC<StreamingLogoGridProps> = ({ providers }) => {
  console.log('🎬 StreamingLogoGrid Debug:', {
    providers,
    providerCount: providers?.length || 0,
    hasProviders: !!(providers && providers.length > 0)
  });

  if (!providers || providers.length === 0) {
    console.log('❌ StreamingLogoGrid: No providers available');
    return <p className="text-sm text-gray-400">No streaming info available</p>;
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

  const providerName = primaryProvider.provider_name || primaryProvider.name || '';
  
  // Use the proper logo system that handles TMDB logos and fallbacks
  const src = getPlatformLogo(primaryProvider);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center justify-center w-10 h-10 bg-gray-900 rounded-lg overflow-hidden">
        <img
          src={src}
          alt={providerName}
          className="object-contain w-full h-full"
          onError={(e) => {
            console.warn(`❌ Logo failed for ${providerName}:`, src);
          }}
          onLoad={() => {
            console.log(`✅ Logo loaded successfully for ${providerName}:`, src);
          }}
        />
      </div>
      {providers.length > 1 && (
        <span className="text-xs text-gray-400">+{providers.length - 1} more</span>
      )}
    </div>
  );
};

export default StreamingLogoGrid;