// Affiliate link utilities for streaming platform lead generation

interface AffiliateLink {
  platform: string;
  url: string;
  commission: number;
  tracking: string;
}

interface StreamingPlatformAffiliate {
  id: string;
  name: string;
  baseUrl: string;
  affiliateUrl: string;
  commission: number;
  trackingParam: string;
  deepLinkSupported: boolean;
}

// Affiliate partnerships configuration
const AFFILIATE_PLATFORMS: Record<string, StreamingPlatformAffiliate> = {
  "Netflix": {
    id: "netflix",
    name: "Netflix",
    baseUrl: "https://www.netflix.com",
    affiliateUrl: "https://www.netflix.com/signup?trkid=BINGEBOARD_{TRACKING_ID}",
    commission: 8.5,
    trackingParam: "trkid",
    deepLinkSupported: true
  },
  "Hulu": {
    id: "hulu",
    name: "Hulu",
    baseUrl: "https://www.hulu.com",
    affiliateUrl: "https://www.hulu.com/start?ref=BINGEBOARD_{TRACKING_ID}",
    commission: 6.0,
    trackingParam: "ref",
    deepLinkSupported: true
  },
  "Disney Plus": {
    id: "disney",
    name: "Disney Plus",
    baseUrl: "https://www.disneyplus.com",
    affiliateUrl: "https://www.disneyplus.com/sign-up?cid=BINGEBOARD_{TRACKING_ID}",
    commission: 7.2,
    trackingParam: "cid",
    deepLinkSupported: true
  },
  "HBO Max": {
    id: "hbomax",
    name: "HBO Max",
    baseUrl: "https://www.hbomax.com",
    affiliateUrl: "https://www.hbomax.com/subscribe?src=BINGEBOARD_{TRACKING_ID}",
    commission: 9.0,
    trackingParam: "src",
    deepLinkSupported: true
  },
  "Amazon Prime Video": {
    id: "prime",
    name: "Amazon Prime Video",
    baseUrl: "https://www.amazon.com/gp/video/primesignup",
    affiliateUrl: "https://www.amazon.com/gp/video/primesignup?tag=bingeboard-20&ref_=BINGEBOARD_{TRACKING_ID}",
    commission: 4.5,
    trackingParam: "tag",
    deepLinkSupported: true
  },
  "Apple TV Plus": {
    id: "appletv",
    name: "Apple TV Plus",
    baseUrl: "https://tv.apple.com",
    affiliateUrl: "https://tv.apple.com/subscribe?at=BINGEBOARD_{TRACKING_ID}",
    commission: 5.0,
    trackingParam: "at",
    deepLinkSupported: true
  },
  "Paramount Plus": {
    id: "paramount",
    name: "Paramount Plus",
    baseUrl: "https://www.paramountplus.com",
    affiliateUrl: "https://www.paramountplus.com/account/signup?promo=BINGEBOARD_{TRACKING_ID}",
    commission: 5.5,
    trackingParam: "promo",
    deepLinkSupported: true
  },
  "Peacock": {
    id: "peacock",
    name: "Peacock",
    baseUrl: "https://www.peacocktv.com",
    affiliateUrl: "https://www.peacocktv.com/signup?partner=BINGEBOARD_{TRACKING_ID}",
    commission: 4.8,
    trackingParam: "partner",
    deepLinkSupported: true
  },
  "Crunchyroll": {
    id: "crunchyroll",
    name: "Crunchyroll",
    baseUrl: "https://www.crunchyroll.com",
    affiliateUrl: "https://www.crunchyroll.com/signup?affiliate=BINGEBOARD_{TRACKING_ID}",
    commission: 6.5,
    trackingParam: "affiliate",
    deepLinkSupported: true
  }
};

// Generate unique tracking ID for each user/show combination
export function generateTrackingId(userId: string, showId: number, platform: string): string {
  const timestamp = Date.now().toString(36);
  const userHash = btoa(userId).slice(0, 6);
  const showHash = showId.toString(36);
  return `${userHash}_${showHash}_${platform}_${timestamp}`;
}

// Get affiliate link for a streaming platform
export function getAffiliateLink(
  platform: string, 
  userId: string, 
  showId: number, 
  showTitle: string
): AffiliateLink | null {
  const affiliatePlatform = AFFILIATE_PLATFORMS[platform];
  if (!affiliatePlatform) return null;

  const trackingId = generateTrackingId(userId, showId, affiliatePlatform.id);
  const affiliateUrl = affiliatePlatform.affiliateUrl.replace('{TRACKING_ID}', trackingId);
  
  return {
    platform: affiliatePlatform.name,
    url: affiliateUrl,
    commission: affiliatePlatform.commission,
    tracking: trackingId
  };
}

// Track affiliate click for analytics
export async function trackAffiliateClick(
  platform: string,
  userId: string,
  showId: number,
  trackingId: string
): Promise<void> {
  try {
    await fetch('/api/analytics/affiliate-click', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        platform,
        userId,
        showId,
        trackingId,
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error('Failed to track affiliate click:', error);
  }
}

// Get all available affiliate platforms
export function getAvailableAffiliatePlatforms(): StreamingPlatformAffiliate[] {
  return Object.values(AFFILIATE_PLATFORMS);
}

// Check if platform supports affiliate links
export function hasAffiliateSupport(platform: string): boolean {
  return platform in AFFILIATE_PLATFORMS;
}

// Get commission rate for platform
export function getCommissionRate(platform: string): number {
  const affiliatePlatform = AFFILIATE_PLATFORMS[platform];
  return affiliatePlatform?.commission || 0;
}

// Open affiliate link with tracking
export function openAffiliateLink(
  platform: string,
  userId: string,
  showId: number,
  showTitle: string
): void {
  const affiliateLink = getAffiliateLink(platform, userId, showId, showTitle);
  if (!affiliateLink) {
    console.warn(`No affiliate link available for platform: ${platform}`);
    return;
  }

  // Track the click
  trackAffiliateClick(platform, userId, showId, affiliateLink.tracking);
  
  // Open the affiliate link
  window.open(affiliateLink.url, '_blank');
}

// Calculate potential earnings from affiliate conversion
export function calculatePotentialEarnings(platform: string, subscriptionValue: number): number {
  const commissionRate = getCommissionRate(platform);
  return (subscriptionValue * commissionRate) / 100;
}

// Get affiliate CTA text based on platform
export function getAffiliateCTA(platform: string): string {
  const ctas: Record<string, string> = {
    "Netflix": "Start Free Trial",
    "Hulu": "Try Hulu Free",
    "Disney Plus": "Subscribe & Save",
    "HBO Max": "Stream HBO Max",
    "Amazon Prime Video": "Prime Video Free Trial",
    "Apple TV Plus": "Try Apple TV+",
    "Paramount Plus": "Watch Free",
    "Peacock": "Stream Free",
    "Crunchyroll": "Start Watching"
  };
  
  return ctas[platform] || "Subscribe Now";
}

// Enhanced streaming platform URL with affiliate tracking
export function getStreamingUrl(
  platform: string,
  showTitle: string,
  userId: string,
  showId: number,
  useAffiliate: boolean = true
): string {
  if (useAffiliate && hasAffiliateSupport(platform)) {
    const affiliateLink = getAffiliateLink(platform, userId, showId, showTitle);
    if (affiliateLink) {
      return affiliateLink.url;
    }
  }
  
  // Fallback to direct platform search
  const platformUrls: Record<string, string> = {
    'Netflix': 'https://www.netflix.com/search?q=',
    'Disney Plus': 'https://www.disneyplus.com/search?q=',
    'Hulu': 'https://www.hulu.com/search?q=',
    'HBO Max': 'https://www.hbomax.com/search?q=',
    'Amazon Prime Video': 'https://www.amazon.com/s?k=',
    'Apple TV Plus': 'https://tv.apple.com/search?term=',
    'Paramount Plus': 'https://www.paramountplus.com/search/?query=',
    'Peacock': 'https://www.peacocktv.com/search?q=',
    'Crunchyroll': 'https://www.crunchyroll.com/search?q='
  };
  
  const baseUrl = platformUrls[platform] || `https://www.google.com/search?q=`;
  return baseUrl + encodeURIComponent(showTitle + ' watch online');
}