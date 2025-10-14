import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MultiAPIStreamingService } from '../multiAPIStreamingService.js';
import type { EnhancedStreamingPlatform } from '../multiAPIStreamingService.js';
import type { UserPreferences } from '../multiAPIStreamingService.js';

// We will spy on the underlying comprehensive call and feed deterministic data.
const baseResponse = {
  tmdbId: 100,
  title: 'Sample Show',
  platforms: [
    { provider_id: 1, provider_name: 'Netflix', type: 'sub', source: 'tmdb', affiliate_supported: true } as EnhancedStreamingPlatform,
    { provider_id: 2, provider_name: 'Disney+', type: 'sub', source: 'tmdb', affiliate_supported: true } as EnhancedStreamingPlatform,
    { provider_id: 3, provider_name: 'Crackle', type: 'free', source: 'watchmode', affiliate_supported: false } as EnhancedStreamingPlatform,
    { provider_id: 4, provider_name: 'Amazon Prime Video', type: 'sub', source: 'tmdb', affiliate_supported: true } as EnhancedStreamingPlatform,
    { provider_id: 5, provider_name: 'iTunes', type: 'buy', source: 'watchmode', affiliate_supported: false } as EnhancedStreamingPlatform
  ],
  totalPlatforms: 5,
  affiliatePlatforms: 3,
  premiumPlatforms: 4,
  freePlatforms: 1,
  sources: { tmdb: true, watchmode: true, utelly: false, streamingAvailability: false }
};

describe('Preference-Aware Streaming Filtering', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(MultiAPIStreamingService, 'getComprehensiveAvailability').mockResolvedValue({ ...baseResponse });
  });

  it('returns unfiltered results when no preferences provided', async () => {
    const result = await MultiAPIStreamingService.getPreferenceAwareAvailability(100, 'Sample Show', 'tv');
    expect(result.totalPlatforms).toBe(5);
    expect(result.platforms.map(p => p.provider_name)).toContain('Netflix');
  expect((result as any).preferenceMeta.filteredOut).toBe(0);
  });

  it('filters by preferred platforms', async () => {
    const prefs: UserPreferences = { preferredPlatforms: ['Netflix', 'Crackle'] };
    const result = await MultiAPIStreamingService.getPreferenceAwareAvailability(100, 'Sample Show', 'tv', prefs);
    expect(result.totalPlatforms).toBe(2);
    expect(result.platforms.map(p => p.provider_name).sort()).toEqual(['Crackle','Netflix']);
  });

  it('excludes blacklisted platforms', async () => {
    const prefs: UserPreferences = { excludedPlatforms: ['Netflix', 'Disney+'] };
    const result = await MultiAPIStreamingService.getPreferenceAwareAvailability(100, 'Sample Show', 'tv', prefs);
    expect(result.totalPlatforms).toBe(3);
    expect(result.platforms.find(p => p.provider_name === 'Netflix')).toBeFalsy();
  });

  it('restricts by subscription types', async () => {
    const prefs: UserPreferences = { subscriptionTypes: ['free'] };
    const result = await MultiAPIStreamingService.getPreferenceAwareAvailability(100, 'Sample Show', 'tv', prefs);
    expect(result.totalPlatforms).toBe(1);
    expect(result.platforms[0].provider_name).toBe('Crackle');
  });

  it('affiliate only filter reduces to affiliate_supported platforms', async () => {
    const prefs: UserPreferences = { onlyAffiliateSupported: true };
    const result = await MultiAPIStreamingService.getPreferenceAwareAvailability(100, 'Sample Show', 'tv', prefs);
    expect(result.platforms.every(p => p.affiliate_supported)).toBe(true);
  });

  it('combines inclusion, exclusion and type filters', async () => {
    const prefs: UserPreferences = {
      preferredPlatforms: ['Netflix', 'Amazon Prime Video', 'iTunes'],
      excludedPlatforms: ['Netflix'],
      subscriptionTypes: ['sub']
    };
    const result = await MultiAPIStreamingService.getPreferenceAwareAvailability(100, 'Sample Show', 'tv', prefs);
    // Netflix excluded, iTunes is type buy (not sub), so only Amazon Prime Video remains
    expect(result.totalPlatforms).toBe(1);
    expect(result.platforms[0].provider_name).toBe('Amazon Prime Video');
  });

  it('batch filtering applies preferences to each entry', async () => {
    const prefs: UserPreferences = { preferredPlatforms: ['Disney+','Netflix'] };
    const titles: Array<{ tmdbId: number; title: string; mediaType: 'tv' }> = [
      { tmdbId: 100, title: 'Sample Show', mediaType: 'tv' },
      { tmdbId: 101, title: 'Other Show', mediaType: 'tv' }
    ];
    vi.spyOn(MultiAPIStreamingService, 'getBatchAvailability').mockResolvedValue(new Map([
      [100, { ...baseResponse }],
      [101, { ...baseResponse, tmdbId: 101, title: 'Other Show' }]
    ]));

    const batch = await MultiAPIStreamingService.getBatchAvailabilityWithPreferences(titles, prefs);
    expect(batch.size).toBe(2);
    batch.forEach(r => {
      expect(r.totalPlatforms).toBe(2);
      expect(r.platforms.map(p => p.provider_name).sort()).toEqual(['Disney+','Netflix']);
    });
  });
});
