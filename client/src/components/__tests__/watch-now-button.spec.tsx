import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WatchNowButton from '../watch-now-button';

// Mock hooks & utilities used inside component
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'u1', subscription: { plan: 'free' } } }) }));
vi.mock('@/lib/streamingUtils', () => ({
  getPrimaryStreamingPlatform: (p: any[]) => p[0],
  getAllAvailablePlatforms: (p: any[]) => p,
  getWatchNowText: (n: string) => `Watch on ${n}`,
  getShortButtonText: (n: string) => n.slice(0, 6),
  openStreamingApp: vi.fn(),
  getPlatformDirectUrl: (p: string, title: string) => `https://example.com/${p}/${title}`,
}));
vi.mock('@/lib/affiliateUtils', () => ({
  openAffiliateLink: vi.fn(),
  hasAffiliateSupport: () => true,
  getAffiliateCTA: () => 'Affiliate'
}));
vi.mock('@/lib/trailerUtils', () => ({
  getBestTrailer: vi.fn().mockResolvedValue({ key: 'abc123' }),
  getYouTubeEmbedUrl: (k: string) => `https://youtube.com/embed/${k}`,
  trackTrailerView: vi.fn(),
  hasTrailer: () => true
}));

const PLATFORM = { provider_id: 1, provider_name: 'Netflix', logo_path: '' };

describe('WatchNowButton', () => {
  it('renders null when no platforms', () => {
    const { container } = render(<WatchNowButton show={{ title: 'Test Show', streamingPlatforms: [] }} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders single platform button when one platform present', () => {
    render(<WatchNowButton show={{ title: 'Test Show', streamingPlatforms: [PLATFORM], tmdbId: 101 }} />);
    expect(screen.getByRole('button')).toHaveTextContent(/Watch on/i);
  });

  it('does not throw when trailer clicked without tmdbId (guard works)', async () => {
    const multi = [PLATFORM, { provider_id: 2, provider_name: 'Hulu', logo_path: '' }];
    render(<WatchNowButton show={{ title: 'Guarded Show', streamingPlatforms: multi }} />);
    // open dropdown
    fireEvent.click(screen.getByRole('button', { name: /Watch Now/i }));
    // trailer option
    const trailer = await screen.findByText(/Watch Trailer/i);
    fireEvent.click(trailer); // should not throw
    expect(trailer).toBeInTheDocument();
  });
});
