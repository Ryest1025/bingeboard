// Advertisement configuration and management for trailer monetization

export interface AdPartner {
  id: string;
  name: string;
  weight: number; // Higher weight = more likely to be selected
  active: boolean;
  commissionRate?: number; // For tracking purposes
}

export interface AdContent {
  id: string;
  partnerId: string;
  title: string;
  description: string;
  videoUrl: string;
  clickUrl?: string;
  advertiser: string;
  duration: number;
  skipAfter?: number;
  category: 'streaming' | 'entertainment' | 'lifestyle' | 'tech' | 'food';
  targetAudience?: string[];
  active: boolean;
}

// Ad Partners Configuration
export const AD_PARTNERS: AdPartner[] = [
  {
    id: 'streammax',
    name: 'StreamMax',
    weight: 30,
    active: true,
    commissionRate: 0.08
  },
  {
    id: 'cinemahub',
    name: 'CinemaHub',
    weight: 25,
    active: true,
    commissionRate: 0.06
  },
  {
    id: 'techvision',
    name: 'TechVision',
    weight: 20,
    active: true,
    commissionRate: 0.05
  },
  {
    id: 'snacktime',
    name: 'SnackTime',
    weight: 15,
    active: true,
    commissionRate: 0.04
  },
  {
    id: 'gamezone',
    name: 'GameZone',
    weight: 10,
    active: true,
    commissionRate: 0.07
  }
];

// Sample Advertisement Content
export const AD_CONTENT: AdContent[] = [
  {
    id: 'ad_streaming_001',
    partnerId: 'streammax',
    title: 'Stream Unlimited Movies & Shows',
    description: 'Get access to thousands of movies and TV shows with StreamMax Premium',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    clickUrl: 'https://streammax.example.com/signup?ref=bingeboard',
    advertiser: 'StreamMax',
    duration: 15,
    skipAfter: 5,
    category: 'streaming',
    targetAudience: ['movie-lovers', 'tv-fans'],
    active: true
  },
  {
    id: 'ad_tech_001',
    partnerId: 'techvision',
    title: 'Upgrade Your Home Theater',
    description: 'Experience cinema-quality sound and picture with TechVision Smart TVs',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    clickUrl: 'https://techvision.example.com/smart-tv?ref=bingeboard',
    advertiser: 'TechVision',
    duration: 20,
    skipAfter: 8,
    category: 'tech',
    targetAudience: ['tech-enthusiasts', 'home-theater'],
    active: true
  },
  {
    id: 'ad_food_001',
    partnerId: 'snacktime',
    title: 'Perfect Movie Night Snacks',
    description: 'Gourmet popcorn and snacks delivered to your door',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    clickUrl: 'https://snacktime.example.com/movie-snacks?ref=bingeboard',
    advertiser: 'SnackTime',
    duration: 10,
    skipAfter: 3,
    category: 'food',
    targetAudience: ['snack-lovers', 'movie-fans'],
    active: true
  },
  {
    id: 'ad_cinema_001',
    partnerId: 'cinemahub',
    title: 'Local Cinema Experience',
    description: 'Book premium movie tickets at your local CinemaHub theater',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    clickUrl: 'https://cinemahub.example.com/tickets?ref=bingeboard',
    advertiser: 'CinemaHub',
    duration: 12,
    skipAfter: 4,
    category: 'entertainment',
    targetAudience: ['cinema-goers', 'date-night'],
    active: true
  },
  {
    id: 'ad_gaming_001',
    partnerId: 'gamezone',
    title: 'Level Up Your Gaming',
    description: 'Discover the latest games and gaming gear at GameZone',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    clickUrl: 'https://gamezone.example.com/latest?ref=bingeboard',
    advertiser: 'GameZone',
    duration: 18,
    skipAfter: 6,
    category: 'entertainment',
    targetAudience: ['gamers', 'tech-enthusiasts'],
    active: true
  }
];

// Ad Selection Algorithm
export class AdSelector {
  private static getActivePartners(): AdPartner[] {
    return AD_PARTNERS.filter(partner => partner.active);
  }

  private static getActiveAds(): AdContent[] {
    const activePartners = this.getActivePartners().map(p => p.id);
    return AD_CONTENT.filter(ad =>
      ad.active && activePartners.includes(ad.partnerId)
    );
  }

  // Select an ad based on partner weights and user preferences
  static selectAd(userPreferences?: string[]): AdContent | null {
    const activeAds = this.getActiveAds();
    if (activeAds.length === 0) return null;

    // If user has preferences, try to match them
    if (userPreferences && userPreferences.length > 0) {
      const matchingAds = activeAds.filter(ad =>
        ad.targetAudience?.some(audience =>
          userPreferences.includes(audience)
        )
      );

      if (matchingAds.length > 0) {
        return this.weightedRandomSelection(matchingAds);
      }
    }

    // Fallback to weighted random selection from all active ads
    return this.weightedRandomSelection(activeAds);
  }

  private static weightedRandomSelection(ads: AdContent[]): AdContent {
    // Get partner weights for the ads
    const adsWithWeights = ads.map(ad => {
      const partner = AD_PARTNERS.find(p => p.id === ad.partnerId);
      return {
        ad,
        weight: partner?.weight || 1
      };
    });

    const totalWeight = adsWithWeights.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;

    for (const item of adsWithWeights) {
      random -= item.weight;
      if (random <= 0) {
        return item.ad;
      }
    }

    // Fallback to first ad
    return ads[0];
  }

  // Get multiple ads for A/B testing
  static selectMultipleAds(count: number = 3, userPreferences?: string[]): AdContent[] {
    const activeAds = this.getActiveAds();
    const selectedAds: AdContent[] = [];
    const usedPartners = new Set<string>();

    // Try to get ads from different partners for variety
    for (let i = 0; i < count && i < activeAds.length; i++) {
      const availableAds = activeAds.filter(ad =>
        !usedPartners.has(ad.partnerId) && !selectedAds.includes(ad)
      );

      if (availableAds.length === 0) break;

      const selectedAd = this.selectAd(userPreferences);
      if (selectedAd && !selectedAds.includes(selectedAd)) {
        selectedAds.push(selectedAd);
        usedPartners.add(selectedAd.partnerId);
      }
    }

    return selectedAds;
  }
}

// Analytics tracking for ads
export class AdAnalytics {
  static async trackAdView(adId: string, userId: string, context: string): Promise<void> {
    try {
      await fetch('/api/analytics/ad-view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          adId,
          userId,
          context,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Failed to track ad view:', error);
    }
  }

  static async trackAdClick(adId: string, userId: string, clickUrl: string): Promise<void> {
    try {
      await fetch('/api/analytics/ad-click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          adId,
          userId,
          clickUrl,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Failed to track ad click:', error);
    }
  }

  static async trackAdCompletion(adId: string, userId: string, watchTime: number): Promise<void> {
    try {
      await fetch('/api/analytics/ad-completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          adId,
          userId,
          watchTime,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Failed to track ad completion:', error);
    }
  }
}

// Revenue calculation utilities
export class RevenueCalculator {
  // Calculate estimated revenue per ad view
  static calculateAdRevenue(adId: string, completed: boolean = false): number {
    const ad = AD_CONTENT.find(a => a.id === adId);
    if (!ad) return 0;

    const partner = AD_PARTNERS.find(p => p.id === ad.partnerId);
    if (!partner) return 0;

    // Base revenue per view (CPM model)
    const baseRevenue = 0.002; // $0.002 per view

    // Completion bonus
    const completionMultiplier = completed ? 1.5 : 0.7;

    // Partner commission rate affects our revenue
    const partnerMultiplier = partner.commissionRate || 0.05;

    return baseRevenue * completionMultiplier * (1 + partnerMultiplier);
  }

  // Calculate click-through revenue
  static calculateClickRevenue(adId: string): number {
    const ad = AD_CONTENT.find(a => a.id === adId);
    if (!ad) return 0;

    const partner = AD_PARTNERS.find(p => p.id === ad.partnerId);
    if (!partner) return 0;

    // Base click revenue (CPC model)
    const baseClickRevenue = 0.05; // $0.05 per click

    // Partner-specific multiplier
    const partnerMultiplier = partner.commissionRate || 0.05;

    return baseClickRevenue * (1 + partnerMultiplier * 2);
  }
}

export default {
  AdSelector,
  AdAnalytics,
  RevenueCalculator,
  AD_PARTNERS,
  AD_CONTENT
};
