import React from "react";

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

  const baseUrl = "https://image.tmdb.org/t/p/w92";
  const localLogos: Record<string, string> = {
    Netflix: "/logos/netflix.svg",
    // Amazon Prime Video variations - all use the same local logo
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
    "HBO": "/logos/hbo-max.png",
    "Apple TV Plus": "/logos/appletv.svg",
    "Apple TV": "/logos/appletv.svg",
    "Apple TV+": "/logos/appletv.svg",
    Peacock: "/logos/peacock.svg",
    "Paramount Plus": "/logos/paramountplus.svg",
    "Paramount+": "/logos/paramount-plus.png",
    Crunchyroll: "/logos/crunchyroll.svg",
    ESPN: "/logos/espn.svg",
    Starz: "/logos/starz.svg",
    "YouTube TV": "/logos/youtube-tv.png",
    Showtime: "/logos/showtime.png",
    "Discovery Plus": "/logos/discovery-plus.png",
    "Discovery+": "/logos/discovery-plus.png"
  };

  const providerName = primaryProvider.provider_name || primaryProvider.name || '';
  
  // Prioritize local logos for better brand consistency and to avoid incorrect TMDB logos
  const src = localLogos[providerName] || (primaryProvider.logo_path
    ? `${baseUrl}${primaryProvider.logo_path}`
    : null);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center justify-center w-10 h-10 bg-gray-900 rounded-lg overflow-hidden">
        {src ? (
          <img
            src={src}
            alt={providerName}
            className="object-contain w-full h-full"
            onError={(e) => {
              console.warn(
                `⚠️ Logo missing for ${providerName}, falling back to text`
              );
              (e.currentTarget as HTMLImageElement).style.display = "none";
              e.currentTarget.insertAdjacentHTML(
                "afterend",
                `<span style="color:white;font-size:0.7rem;">${providerName}</span>`
              );
            }}
          />
        ) : (
          <span className="text-xs text-white">{providerName}</span>
        )}
      </div>
      {providers.length > 1 && (
        <span className="text-xs text-gray-400">+{providers.length - 1} more</span>
      )}
    </div>
  );
};

export default StreamingLogoGrid;