// Streaming platform deep link utilities

interface StreamingPlatform {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

interface StreamingLink {
  name: string;
  baseUrl: string;
  appScheme?: string; // For mobile app deep links
  searchPath?: string;
  showPath?: string;
}

// Platform configurations for deep linking
const STREAMING_PLATFORMS: Record<string, StreamingLink> = {
  'Netflix': {
    name: 'Netflix',
    baseUrl: 'https://www.netflix.com',
    appScheme: 'netflix://www.netflix.com',
    searchPath: '/search?q=',
    showPath: '/title/'
  },
  'Amazon Prime Video': {
    name: 'Amazon Prime Video',
    baseUrl: 'https://www.amazon.com/gp/video',
    appScheme: 'aiv://aiv/resume',
    searchPath: '/search/ref=atv_sr_sug_0?phrase=',
    showPath: '/detail/'
  },
  'Disney Plus': {
    name: 'Disney+',
    baseUrl: 'https://www.disneyplus.com',
    appScheme: 'disneyplus://content/',
    searchPath: '/search?q=',
    showPath: '/series/'
  },
  'Hulu': {
    name: 'Hulu',
    baseUrl: 'https://www.hulu.com',
    appScheme: 'hulu://content/',
    searchPath: '/search?q=',
    showPath: '/series/'
  },
  'HBO Max': {
    name: 'HBO Max',
    baseUrl: 'https://www.max.com',
    appScheme: 'hbomax://content/',
    searchPath: '/search?q=',
    showPath: '/series/'
  },
  'Apple TV Plus': {
    name: 'Apple TV+',
    baseUrl: 'https://tv.apple.com',
    appScheme: 'videos://tv.apple.com',
    searchPath: '/search?term=',
    showPath: '/show/'
  },
  'Paramount Plus': {
    name: 'Paramount+',
    baseUrl: 'https://www.paramountplus.com',
    appScheme: 'paramountplus://content/',
    searchPath: '/search?query=',
    showPath: '/shows/'
  },
  'Peacock': {
    name: 'Peacock',
    baseUrl: 'https://www.peacocktv.com',
    appScheme: 'peacocktv://content/',
    searchPath: '/search?q=',
    showPath: '/watch/'
  },
  'YouTube TV': {
    name: 'YouTube TV',
    baseUrl: 'https://tv.youtube.com',
    appScheme: 'youtube://www.youtube.com',
    searchPath: '/search?q=',
    showPath: '/browse/'
  },
  'Crunchyroll': {
    name: 'Crunchyroll',
    baseUrl: 'https://www.crunchyroll.com',
    appScheme: 'crunchyroll://content/',
    searchPath: '/search?q=',
    showPath: '/series/'
  }
};

export function getStreamingLink(
  platformName: string, 
  showTitle: string, 
  tmdbId?: number
): string {
  const platform = STREAMING_PLATFORMS[platformName];
  
  if (!platform) {
    // Fallback to generic search
    return `https://www.google.com/search?q=${encodeURIComponent(showTitle + ' streaming')}`;
  }

  // Try app scheme first on mobile devices
  if (isMobileDevice() && platform.appScheme) {
    try {
      return platform.appScheme + encodeURIComponent(showTitle);
    } catch (error) {
      // Fall back to web link if app scheme fails
    }
  }

  // Use search path for web browsers
  if (platform.searchPath) {
    return platform.baseUrl + platform.searchPath + encodeURIComponent(showTitle);
  }

  return platform.baseUrl;
}

export function openStreamingApp(
  platformName: string, 
  showTitle: string, 
  tmdbId?: number
): void {
  const link = getStreamingLink(platformName, showTitle, tmdbId);
  
  console.log(`Opening: ${platformName} for show: ${showTitle}`);
  
  // Enhanced window opening with specific parameters for better compatibility
  const windowFeatures = 'width=1280,height=720,scrollbars=yes,resizable=yes,toolbar=yes,menubar=yes,location=yes';
  
  try {
    // Try to open in new window/tab with enhanced parameters
    const newWindow = window.open(link, '_blank', windowFeatures);
    
    // Check if window opened successfully
    if (newWindow) {
      // Focus the new window
      setTimeout(() => {
        try {
          newWindow.focus();
        } catch (e) {
          // Ignore focus errors in some browsers
        }
      }, 100);
    } else {
      // Popup was blocked, try alternative method
      throw new Error('Popup blocked');
    }
  } catch (error) {
    // Fallback: Create a temporary link element and click it
    const tempLink = document.createElement('a');
    tempLink.href = link;
    tempLink.target = '_blank';
    tempLink.rel = 'noopener noreferrer';
    
    // Add to DOM temporarily
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
  }
}

export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

export function getPrimaryStreamingPlatform(platforms: StreamingPlatform[]): StreamingPlatform | null {
  if (!platforms || !Array.isArray(platforms) || platforms.length === 0) return null;

  // Priority order for major platforms
  const priorityPlatforms = [
    'Netflix', 'Amazon Prime Video', 'Disney Plus', 'HBO Max', 
    'Hulu', 'Apple TV Plus', 'Paramount Plus', 'Peacock'
  ];

  // Find the highest priority platform
  for (const priority of priorityPlatforms) {
    const platform = platforms.find(p => {
      if (!p || !p.provider_name) return false;
      return p.provider_name.toLowerCase().includes(priority.toLowerCase()) ||
             priority.toLowerCase().includes(p.provider_name.toLowerCase());
    });
    if (platform) return platform;
  }

  // Return first available platform if no priority match
  return platforms[0] || null;
}

export function getAllAvailablePlatforms(platforms: StreamingPlatform[]): StreamingPlatform[] {
  if (!platforms || !Array.isArray(platforms)) return [];
  
  // Filter to only supported platforms
  return platforms.filter(platform => {
    if (!platform || !platform.provider_name) return false;
    
    return Object.keys(STREAMING_PLATFORMS).some(supportedName => 
      platform.provider_name.toLowerCase().includes(supportedName.toLowerCase()) ||
      supportedName.toLowerCase().includes(platform.provider_name.toLowerCase())
    );
  });
}

// Short button text for primary buttons
export function getShortButtonText(platformName: string): string {
  const shortTexts: Record<string, string> = {
    'Netflix': 'Netflix',
    'Netflix Standard with Ads': 'Netflix',
    'Netflix Basic with Ads': 'Netflix',
    'Amazon Prime Video': 'Prime',
    'Disney Plus': 'Disney+',
    'HBO Max': 'Max',
    'Hulu': 'Hulu',
    'Apple TV Plus': 'Apple TV+',
    'Paramount Plus': 'Paramount+',
    'Peacock': 'Peacock',
    'YouTube TV': 'YouTube',
    'Crunchyroll': 'Crunchyroll'
  };

  return shortTexts[platformName] || platformName.split(' ')[0];
}

// Detailed text for dropdown menu items and tooltips
export function getWatchNowText(platformName: string): string {
  const watchTexts: Record<string, string> = {
    'Netflix': 'Watch on Netflix',
    'Netflix Standard with Ads': 'Watch on Netflix',
    'Netflix Basic with Ads': 'Watch on Netflix',
    'Amazon Prime Video': 'Watch on Prime Video',
    'Disney Plus': 'Watch on Disney+',
    'HBO Max': 'Watch on Max',
    'Hulu': 'Watch on Hulu',
    'Apple TV Plus': 'Watch on Apple TV+',
    'Paramount Plus': 'Watch on Paramount+',
    'Peacock': 'Watch on Peacock',
    'YouTube TV': 'Watch on YouTube TV',
    'Crunchyroll': 'Watch on Crunchyroll'
  };

  return watchTexts[platformName] || `Watch on ${platformName}`;
}