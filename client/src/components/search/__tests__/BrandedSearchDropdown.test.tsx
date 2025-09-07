// __tests__/BrandedSearchDropdown.test.tsx - Test suite for BrandedSearchDropdown
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BrandedSearchDropdown from '../BrandedSearchDropdown';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

// Mock framer-motion for deterministic tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Play: () => <div data-testid="play-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  Star: () => <div data-testid="star-icon" />,
  Video: () => <div data-testid="video-icon" />,
  Plus: () => <div data-testid="plus-icon" />,
}));

const mockResults = [
  {
    id: '1',
    title: 'The Matrix',
    type: 'movie',
    year: 1999,
    vote_average: 8.7,
    synopsis: 'A computer programmer is led to fight an underground war against powerful computers.',
    poster: '/matrix-poster.jpg',
  },
  {
    id: '2',
    title: 'Breaking Bad',
    type: 'tv',
    year: 2008,
    vote_average: 9.5,
    synopsis: 'A high school chemistry teacher turned methamphetamine producer.',
    poster: '/breaking-bad-poster.jpg',
  },
];

const defaultProps = {
  results: mockResults,
  loading: false,
  highlightedIndex: 0,
  onHoverIndex: vi.fn(),
  onChoose: vi.fn(),
  onWatchTrailer: vi.fn(),
  onAddToWatchlist: vi.fn(),
};

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('BrandedSearchDropdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      renderWithQueryClient(<BrandedSearchDropdown {...defaultProps} />);

      const listbox = screen.getByRole('listbox');
      expect(listbox).toHaveAttribute('aria-activedescendant', 'result-0');
      expect(listbox).toHaveAttribute('tabIndex', '0');

      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(2);
      expect(options[0]).toHaveAttribute('aria-selected', 'true');
      expect(options[1]).toHaveAttribute('aria-selected', 'false');
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      const onHoverIndex = vi.fn();

      renderWithQueryClient(
        <BrandedSearchDropdown {...defaultProps} onHoverIndex={onHoverIndex} />
      );

      const listbox = screen.getByRole('listbox');

      // Arrow down should highlight next item
      await user.type(listbox, '{ArrowDown}');
      expect(onHoverIndex).toHaveBeenCalledWith(1);

      // Arrow up should highlight previous item
      await user.type(listbox, '{ArrowUp}');
      expect(onHoverIndex).toHaveBeenCalledWith(0);

      // Enter should select the highlighted item
      await user.type(listbox, '{Enter}');
      expect(defaultProps.onChoose).toHaveBeenCalledWith(mockResults[0]);
    });

    it('should handle focus management properly', async () => {
      const user = userEvent.setup();

      renderWithQueryClient(<BrandedSearchDropdown {...defaultProps} />);

      const firstOption = screen.getAllByRole('option')[0];
      await user.tab();
      expect(firstOption).toHaveFocus();
    });
  });

  describe('Loading States', () => {
    it('should show loading skeleton when loading', () => {
      renderWithQueryClient(
        <BrandedSearchDropdown {...defaultProps} loading={true} results={[]} />
      );

      expect(screen.getByText('Searching BingeBoard...')).toBeInTheDocument();
      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    });

    it('should show empty state when no results', () => {
      renderWithQueryClient(
        <BrandedSearchDropdown {...defaultProps} results={[]} />
      );

      expect(screen.getByText('No results found')).toBeInTheDocument();
      expect(screen.getByText('Try searching for a different show or movie')).toBeInTheDocument();
    });
  });

  describe('Result Display', () => {
    it('should display show information correctly', () => {
      renderWithQueryClient(<BrandedSearchDropdown {...defaultProps} />);

      expect(screen.getByText('The Matrix')).toBeInTheDocument();
      expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
      expect(screen.getByText('MOVIE')).toBeInTheDocument();
      expect(screen.getByText('TV')).toBeInTheDocument();
      expect(screen.getByText('1999')).toBeInTheDocument();
      expect(screen.getByText('8.7')).toBeInTheDocument();
    });

    it('should handle missing poster images', () => {
      const resultsWithoutPoster = [
        { ...mockResults[0], poster: null },
      ];

      renderWithQueryClient(
        <BrandedSearchDropdown {...defaultProps} results={resultsWithoutPoster} />
      );

      const image = screen.getByAltText('The Matrix');
      expect(image).toHaveAttribute('src', '/placeholder.png');
    });

    it('should truncate long synopses', () => {
      const longSynopsis = 'A'.repeat(150);
      const resultsWithLongSynopsis = [
        { ...mockResults[0], synopsis: longSynopsis },
      ];

      renderWithQueryClient(
        <BrandedSearchDropdown {...defaultProps} results={resultsWithLongSynopsis} />
      );

      const synopsis = screen.getByText(/A{120}\.\.\.$/);
      expect(synopsis).toBeInTheDocument();
    });
  });

  describe('Inline Actions', () => {
    it('should call onWatchTrailer when trailer button clicked', async () => {
      const user = userEvent.setup();
      const onWatchTrailer = vi.fn();

      renderWithQueryClient(
        <BrandedSearchDropdown {...defaultProps} onWatchTrailer={onWatchTrailer} />
      );

      const trailerButtons = screen.getAllByText('Trailer');
      await user.click(trailerButtons[0]);

      expect(onWatchTrailer).toHaveBeenCalledWith(mockResults[0]);
    });

    it('should call onAddToWatchlist when watchlist button clicked', async () => {
      const user = userEvent.setup();
      const onAddToWatchlist = vi.fn();

      renderWithQueryClient(
        <BrandedSearchDropdown {...defaultProps} onAddToWatchlist={onAddToWatchlist} />
      );

      const watchlistButtons = screen.getAllByText('Watchlist');
      await user.click(watchlistButtons[0]);

      expect(onAddToWatchlist).toHaveBeenCalledWith(mockResults[0]);
    });

    it('should prevent event propagation on inline action clicks', async () => {
      const user = userEvent.setup();
      const onChoose = vi.fn();

      renderWithQueryClient(
        <BrandedSearchDropdown {...defaultProps} onChoose={onChoose} />
      );

      const trailerButton = screen.getAllByText('Trailer')[0];
      await user.click(trailerButton);

      // onChoose should not be called when clicking inline actions
      expect(onChoose).not.toHaveBeenCalled();
    });
  });

  describe('Highlighting', () => {
    it('should highlight the correct item based on highlightedIndex', () => {
      renderWithQueryClient(
        <BrandedSearchDropdown {...defaultProps} highlightedIndex={1} />
      );

      const options = screen.getAllByRole('option');
      expect(options[0]).toHaveAttribute('aria-selected', 'false');
      expect(options[1]).toHaveAttribute('aria-selected', 'true');
    });

    it('should update highlight on mouse enter', async () => {
      const user = userEvent.setup();
      const onHoverIndex = vi.fn();

      renderWithQueryClient(
        <BrandedSearchDropdown {...defaultProps} onHoverIndex={onHoverIndex} />
      );

      const secondOption = screen.getAllByRole('option')[1];
      await user.hover(secondOption);

      expect(onHoverIndex).toHaveBeenCalledWith(1);
    });
  });

  describe('Footer', () => {
    it('should show navigation hints when results are present', () => {
      renderWithQueryClient(<BrandedSearchDropdown {...defaultProps} />);

      expect(screen.getByText('Use ↑↓ to navigate')).toBeInTheDocument();
      expect(screen.getByText('Press Enter to select')).toBeInTheDocument();
    });

    it('should not show navigation hints when no results', () => {
      renderWithQueryClient(
        <BrandedSearchDropdown {...defaultProps} results={[]} />
      );

      expect(screen.queryByText('Use ↑↓ to navigate')).not.toBeInTheDocument();
    });
  });

  describe('Responsiveness', () => {
    it('should have proper mobile styling classes', () => {
      renderWithQueryClient(<BrandedSearchDropdown {...defaultProps} />);

      const container = screen.getByRole('listbox');
      expect(container).toHaveClass('max-h-[26rem]', 'md:max-h-[30rem]');
    });
  });

  describe('Performance', () => {
    it('should render large result sets efficiently', () => {
      const largeResults = Array.from({ length: 50 }, (_, i) => ({
        ...mockResults[0],
        id: i.toString(),
        title: `Movie ${i}`,
      }));

      const startTime = performance.now();
      renderWithQueryClient(
        <BrandedSearchDropdown {...defaultProps} results={largeResults} />
      );
      const endTime = performance.now();

      // Rendering should be fast (under 100ms for 50 items)
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});
