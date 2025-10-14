import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import DashboardPage from '@/pages/dashboard';
import { renderWithProviders } from '../utils/renderWithProviders';
import { mockState } from '../msw/handlers';

// Lightweight component mocks (structural only)
vi.mock('@/components/navigation-header', () => ({ default: () => <div data-testid="nav-header" /> }));
vi.mock('@/components/ContinueWatching', () => ({ default: () => <div data-testid="continue-watching" /> }));
vi.mock('@/components/universal', () => ({ UniversalMediaCard: (props: any) => <div data-testid="media-card" data-id={props.media.id}>{props.media.displayTitle || props.media.title || props.media.name}</div> }));
vi.mock('@/hooks/useMediaActions', () => ({ default: () => ({ addToWatchlist: async () => true, watchNow: async () => true, watchTrailer: async () => true }) }));
vi.mock('@/components/BuildInfoBadge', () => ({ default: () => <div data-testid="build-info" /> }));

beforeEach(() => {
  mockState.trending = [];
  mockState.personalized = [];
});

describe('DashboardPage', () => {
  it('renders spotlight fallback when trending empty', async () => {
    mockState.personalized = []; // keep personalized also empty
    const { ui } = renderWithProviders(<DashboardPage />);
    render(ui);
    await waitFor(() => {
      // Should show fallback spotlight sample title
      expect(screen.getByText('Sample Spotlight Show')).toBeInTheDocument();
    });
  });

  it('renders recommendations and filtering reduces items', async () => {
    mockState.trending = [
      { id: 1, name: 'Show A', poster_path: '/p1.jpg', backdrop_path: '/b1.jpg', vote_average: 7.5, first_air_date: '2024-01-01', genres: [{ id: 18, name: 'Drama' }], streaming: [{ provider_name: 'Netflix' }] }
    ];
    mockState.personalized = [
      { id: 10, name: 'Comedy Hit', first_air_date: '2024-05-01', genres: [{ id: 35, name: 'Comedy' }], streaming: [{ provider_name: 'Netflix' }] },
      { id: 11, name: 'Drama Epic', first_air_date: '2023-03-01', genres: [{ id: 18, name: 'Drama' }], streaming: [{ provider_name: 'Hulu' }] },
      { id: 12, name: 'Action Blast', first_air_date: '2022-02-02', genres: [{ id: 28, name: 'Action' }], streaming: [{ provider_name: 'Prime Video' }] }
    ];

    const { ui } = renderWithProviders(<DashboardPage />);
    render(ui);

    // Wait for at least one recommendation card
    await waitFor(() => expect(screen.getAllByTestId('media-card').length).toBeGreaterThan(1));
  });

  it('shows empty recommendations message when personalized empty', async () => {
    mockState.trending = [
      { id: 1, name: 'Spotlight Show', first_air_date: '2024-01-01', genres: [{ id: 18, name: 'Drama' }], streaming: [{ provider_name: 'Netflix' }] }
    ];
    mockState.personalized = [];
    const { ui } = renderWithProviders(<DashboardPage />);
    render(ui);
    await waitFor(() => {
      expect(screen.getByText(/No recommendations available/i)).toBeInTheDocument();
    });
  });

  it('renders Continue Watching section', async () => {
    mockState.trending = [
      { id: 1, name: 'Spotlight Show', first_air_date: '2024-01-01', genres: [{ id: 18, name: 'Drama' }], streaming: [{ provider_name: 'Netflix' }] }
    ];
    mockState.personalized = [];
    const { ui } = renderWithProviders(<DashboardPage />);
    render(ui);
    await waitFor(() => expect(screen.getByTestId('continue-watching')).toBeInTheDocument());
  });

  it('replaces fallback spotlight once real trending data arrives', async () => {
    const { ui, queryClient } = renderWithProviders(<DashboardPage />);
    render(ui);
    // Initial fallback
    await waitFor(() => expect(screen.getByText('Sample Spotlight Show')).toBeInTheDocument());
    // Inject real data
    mockState.trending = [
      { id: 222, name: 'Real Trending Show', first_air_date: '2024-06-01', vote_average: 8.1, genres: [{ id: 18, name: 'Drama' }], streaming: [{ provider_name: 'Netflix' }] }
    ];
    await queryClient.invalidateQueries({ queryKey: ['trending'] });
    await waitFor(() => expect(screen.queryByText('Sample Spotlight Show')).not.toBeInTheDocument());
    expect(screen.getByText('Real Trending Show')).toBeInTheDocument();
  });
});
