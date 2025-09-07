import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MultiAPIStreamingService, normalizePlatformName, EnhancedStreamingPlatform } from '../multiAPIStreamingService.js';
import { TMDBService } from '../tmdb.js';
import { WatchmodeService } from '../watchmodeService.js';

// Mock Utelly client functions (will be overridden per test where needed)
vi.mock('../../clients/utellyClient.js', () => ({
  searchStreamingAvailability: vi.fn().mockResolvedValue({ results: [] }),
  getStreamingByImdbId: vi.fn().mockResolvedValue({ results: [] })
}));

// Mock logger to avoid noisy console output & capture messages
const logs: { level: string; msg: any[] }[] = [];
const mockLogger = {
  info: (...args: any[]) => logs.push({ level: 'info', msg: args }),
  warn: (...args: any[]) => logs.push({ level: 'warn', msg: args }),
  error: (...args: any[]) => logs.push({ level: 'error', msg: args }),
  debug: (...args: any[]) => logs.push({ level: 'debug', msg: args }),
  log: (...args: any[]) => logs.push({ level: 'log', msg: args })
};

// Provide minimal platform stub for affiliate tests
const basePlatform = (overrides: Partial<EnhancedStreamingPlatform>): EnhancedStreamingPlatform => ({
  provider_id: 1,
  provider_name: 'Netflix',
  type: 'sub',
  affiliate_supported: true,
  source: 'tmdb',
  ...overrides
});

describe('normalizePlatformName', () => {
  const cases: Array<[string, string]> = [
    ['Disney Plus', 'Disney+'],
    ['Amazon Prime', 'Amazon Prime Video'],
    ['Apple TV Plus', 'Apple TV+'],
    ['Paramount Plus', 'Paramount+'],
    ['HBO Max', 'Max'],
    ['Peacock Premium', 'Peacock'],
    ['YouTube TV', 'YouTube Premium'],
    ['Crunchyroll', 'Crunchyroll'] // unchanged
  ];
  it.each(cases)('maps %s -> %s', (input, expected) => {
    expect(normalizePlatformName(input)).toBe(expected);
  });
});

describe('affiliate URL generation', () => {
  beforeEach(() => {
    logs.length = 0;
    MultiAPIStreamingService.setLogger(mockLogger as any);
  });

  it('generates Netflix affiliate URL with tracking id', () => {
    const p = basePlatform({ provider_name: 'Netflix', web_url: 'https://www.netflix.com/title/123' });
    const url = MultiAPIStreamingService.generateAffiliateUrl(p, 'user-1', 999, 'Show Title');
    expect(url).toMatch(/https:\/\/www\.netflix\.com\/title\/123\?trkid=BINGEBOARD_/);
  });

  it('falls back to generic for supported platform without template', () => {
    const p = basePlatform({ provider_name: 'Starz', web_url: 'https://www.starz.com/show/abc', affiliate_supported: true });
    const url = MultiAPIStreamingService.generateAffiliateUrl(p, 'u2', 55, 'Some Show');
    expect(url).toMatch(/ref=BINGEBOARD_/);
    const infoLog = logs.find(l => l.level === 'info');
    expect(infoLog).toBeTruthy();
  });

  it('returns search URL when no web_url + affiliate', () => {
    const p = basePlatform({ provider_name: 'Netflix', web_url: undefined });
    const url = MultiAPIStreamingService.generateAffiliateUrl(p, 'u3', 100, 'Cool Show');
    expect(url).toMatch(/google\.com\/search\?q=Cool%20Show%20streaming/);
  });
});

describe('tracking id format', () => {
  it('contains expected segments', () => {
    const p = basePlatform({ provider_name: 'Netflix', web_url: 'https://n.test' });
    const url = MultiAPIStreamingService.generateAffiliateUrl(p, 'user-äö', 42, 'Title');
    const match = url.match(/trkid=BINGEBOARD_([^&]+)/);
    expect(match).toBeTruthy();
    const id = match![1];
    const parts = id.split('_');
    // userHash, showHash, platformHash, timestamp, randomHash
    expect(parts.length).toBe(5);
    expect(parts[1]).toBe('16'); // 42 in base36
    expect(parts[2]).toBe('netf');
  });
});

describe('affiliate URL mappings (full matrix)', () => {
  beforeEach(() => {
    logs.length = 0;
    MultiAPIStreamingService.setLogger(mockLogger as any);
  });

  const matrix = [
    { name: 'Netflix', url: 'https://www.netflix.com/title/123', pattern: /trkid=BINGEBOARD_/ },
    { name: 'Amazon Prime Video', url: 'https://www.amazon.com/dp/B000TEST', pattern: /tag=bingeboard-20&ref_=[A-Za-z0-9_\-]+/ },
    { name: 'Hulu', url: 'https://www.hulu.com/series/abc', pattern: /ref=BINGEBOARD_/ },
    { name: 'Disney+', url: 'https://www.disneyplus.com/movies/xyz', pattern: /cid=BINGEBOARD_/ },
    { name: 'Max', url: 'https://www.max.com/movies/xyz', pattern: /src=BINGEBOARD_/ },
    { name: 'Apple TV+', url: 'https://tv.apple.com/show/xyz', pattern: /at=BINGEBOARD_/ },
    { name: 'Paramount+', url: 'https://www.paramountplus.com/shows/xyz', pattern: /promo=BINGEBOARD_/ },
    { name: 'Peacock', url: 'https://www.peacocktv.com/watch/xyz', pattern: /partner=BINGEBOARD_/ }
  ];

  it.each(matrix)('generates affiliate URL for %s', ({ name, url, pattern }) => {
    const p = basePlatform({ provider_name: name, web_url: url });
    const affUrl = MultiAPIStreamingService.generateAffiliateUrl(p, 'user1', 1, 'Title');
    expect(affUrl).toMatch(pattern);
    // Extract tracking id (after last _BINGEBOARD_ token or ref_=)
    const idMatch = affUrl.match(/BINGEBOARD_([^&]+)|ref_=([^&]+)/);
    expect(idMatch).toBeTruthy();
    const id = (idMatch![1] || idMatch![2]);
    // tracking id should contain 4 underscores (5 segments)
    expect((id.match(/_/g) || []).length).toBeGreaterThanOrEqual(4);
  });

  it('generic fallback keeps existing query string intact', () => {
    const p = basePlatform({ provider_name: 'Showtime', web_url: 'https://www.showtime.com/play?existing=1', affiliate_supported: true });
    const affUrl = MultiAPIStreamingService.generateAffiliateUrl(p, 'user2', 22, 'Show');
    expect(affUrl).toMatch(/existing=1/);
    expect(affUrl).toMatch(/&ref=BINGEBOARD_/);
  });
});

describe('deduplication behavior (same source duplicates)', () => {
  beforeEach(() => {
    MultiAPIStreamingService.setLogger(mockLogger as any);
  });

  it('removes duplicate provider entries within TMDB source keeping first (higher/equal score)', async () => {
    // Spy on TMDB service method used internally
    const spy = vi.spyOn(TMDBService.prototype as any, 'getWatchProviders').mockResolvedValue({
      results: {
        US: {
          flatrate: [
            { provider_id: 101, provider_name: 'Duplicate Platform', logo_path: '/a.png' }
          ],
          buy: [
            { provider_id: 102, provider_name: 'Duplicate Platform', logo_path: '/b.png' }
          ]
        }
      }
    });
    vi.spyOn(WatchmodeService as any, 'getStreamingAvailability').mockResolvedValue({ streamingPlatforms: [] });

    const result = await MultiAPIStreamingService.getComprehensiveAvailability(999001, 'Dup Title', 'tv');
    const duplicates = result.platforms.filter(p => p.provider_name === 'Duplicate Platform');
    expect(duplicates.length).toBe(1); // deduped
    // Ensure expected metadata preserved (logo from first wins because score tie)
    expect(duplicates[0].logo_path).toBe('/a.png');
    spy.mockRestore();
  });
});

describe('tracking id uniqueness', () => {
  it('generates unique tracking ids across many calls', () => {
    const p = basePlatform({ provider_name: 'Netflix', web_url: 'https://www.netflix.com/title/123' });
    const ids = new Set<string>();
    for (let i = 0; i < 500; i++) {
      const url = MultiAPIStreamingService.generateAffiliateUrl(p, 'user-' + i, i + 10, 'Show ' + i);
      const match = url.match(/BINGEBOARD_([^&]+)/);
      expect(match).toBeTruthy();
      ids.add(match![1]);
    }
    expect(ids.size).toBe(500);
  });
});
