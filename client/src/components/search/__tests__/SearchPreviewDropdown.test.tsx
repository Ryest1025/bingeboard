import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import '@testing-library/jest-dom';
import { SearchPreviewDropdown } from '../SearchPreviewDropdown';
import useEnhancedSearch from '@/hooks/useEnhancedSearch';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useReducedMotion: () => true,
}));

vi.mock('@/hooks/useEnhancedSearch', () => ({
  default: vi.fn(() => ({
    data: {
      success: true, data: {
        results: [
          { id: 'r1', title: 'Result One', media_type: 'movie', vote_average: 7.8 },
          { id: 'r2', title: 'Result Two', media_type: 'tv', vote_average: 8.2 },
        ]
      }
    },
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }))
}));

vi.mock('@/context/GenreContext', () => ({ useGenres: () => ({ genres: [], loading: false, error: null }) }));

describe('SearchPreviewDropdown', () => {
  const renderWithClient = (ui: React.ReactElement) => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it('renders recent searches when query empty', () => {
    localStorage.setItem('bingeboard_recent_searches', JSON.stringify(['matrix', 'breaking bad']));
    renderWithClient(
      <SearchPreviewDropdown
        query=""
        isVisible
        onSelectShow={() => { }}
        onHoverShow={() => { }}
        onClose={() => { }}
        hoveredShow={null}
      />
    );
    expect(screen.getByRole('listbox', { name: 'Search suggestions' })).toBeInTheDocument();
    expect(screen.getByText('matrix')).toBeInTheDocument();
  });

  it('navigates recent searches with arrow keys', async () => {
    const user = userEvent.setup();
    localStorage.setItem('bingeboard_recent_searches', JSON.stringify(['alpha', 'beta', 'gamma']));
    renderWithClient(
      <SearchPreviewDropdown
        query=""
        isVisible
        onSelectShow={() => { }}
        onHoverShow={() => { }}
        onClose={() => { }}
        hoveredShow={null}
      />
    );
    const listbox = screen.getByRole('listbox', { name: 'Search suggestions' });
    await user.click(listbox);
    await user.keyboard('{ArrowDown}');
    expect(listbox).toHaveAttribute('aria-activedescendant', 'recent-searches-option-0');
    await user.keyboard('{ArrowDown}');
    expect(listbox).toHaveAttribute('aria-activedescendant', 'recent-searches-option-1');
  });

  it('wraps around when navigating past last recent search', async () => {
    const user = userEvent.setup();
    localStorage.setItem('bingeboard_recent_searches', JSON.stringify(['one', 'two']));
    renderWithClient(
      <SearchPreviewDropdown
        query=""
        isVisible
        onSelectShow={() => { }}
        onHoverShow={() => { }}
        onClose={() => { }}
        hoveredShow={null}
      />
    );
    const listbox = screen.getByRole('listbox', { name: 'Search suggestions' });
    await user.click(listbox);
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}'); // 3 downs over 2 items -> wraps to 0
    expect(listbox).toHaveAttribute('aria-activedescendant', 'recent-searches-option-0');
  });

  it('selects a recent search with Enter and persists it to top', async () => {
    const user = userEvent.setup();
    localStorage.setItem('bingeboard_recent_searches', JSON.stringify(['foo', 'bar']));
    renderWithClient(
      <SearchPreviewDropdown
        query=""
        isVisible
        onSelectShow={() => { }}
        onHoverShow={() => { }}
        onClose={() => { }}
        hoveredShow={null}
      />
    );
    const listbox = screen.getByRole('listbox', { name: 'Search suggestions' });
    await user.click(listbox);
    await user.keyboard('{ArrowDown}{Enter}'); // select first (foo)
    const saved = JSON.parse(localStorage.getItem('bingeboard_recent_searches') || '[]');
    expect(saved[0]).toBe('foo');
  });

  it('switches from recent searches to results and resets active descendant scheme', async () => {
    const user = userEvent.setup();
    // start with recent searches present
    localStorage.setItem('bingeboard_recent_searches', JSON.stringify(['alpha', 'beta']));
    renderWithClient(
      <SearchPreviewDropdown
        query="al" // less than 2 triggers recent only
        isVisible
        onSelectShow={() => { }}
        onHoverShow={() => { }}
        onClose={() => { }}
        hoveredShow={null}
      />
    );
    const listbox = screen.getByRole('listbox', { name: 'Search suggestions' });
    await user.click(listbox);
    await user.keyboard('{ArrowDown}');
    expect(listbox).toHaveAttribute('aria-activedescendant', 'recent-searches-option-0');
    // Rerender with query >=2 to pull results
    renderWithClient(
      <SearchPreviewDropdown
        query="alpha" // will show results
        isVisible
        onSelectShow={() => { }}
        onHoverShow={() => { }}
        onClose={() => { }}
        hoveredShow={null}
      />
    );
    const listbox2 = screen.getByRole('listbox', { name: 'Search suggestions' });
    await user.click(listbox2);
    await user.keyboard('{ArrowDown}');
    // Now should follow results id pattern
    expect(listbox2.getAttribute('aria-activedescendant')).toMatch(/search-preview-dropdown-option-0|recent-searches-option-0/);
  });

  it('shows results when query length >=2', () => {
    renderWithClient(
      <SearchPreviewDropdown
        query="re"
        isVisible
        onSelectShow={() => { }}
        onHoverShow={() => { }}
        onClose={() => { }}
        hoveredShow={null}
      />
    );
    const listbox = screen.getByRole('listbox', { name: 'Search suggestions' });
    expect(listbox).toBeInTheDocument();
    const options = screen.getAllByRole('option');
    expect(options.length).toBeGreaterThan(0);
  });

  it('persists search term when selecting result via Enter', async () => {
    const user = userEvent.setup();
    const onSelectShow = vi.fn();
    renderWithClient(
      <SearchPreviewDropdown
        query="res"
        isVisible
        onSelectShow={onSelectShow}
        onHoverShow={() => { }}
        onClose={() => { }}
        hoveredShow={null}
      />
    );
    const listbox = screen.getByRole('listbox', { name: 'Search suggestions' });
    await user.click(listbox);
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onSelectShow).toHaveBeenCalled();
    const stored = JSON.parse(localStorage.getItem('bingeboard_recent_searches') || '[]');
    expect(stored[0]).toBe('res');
  });

  it('updates active descendant on hover over search result', async () => {
    const user = userEvent.setup();
    renderWithClient(
      <SearchPreviewDropdown
        query="res"
        isVisible
        onSelectShow={() => { }}
        onHoverShow={() => { }}
        onClose={() => { }}
        hoveredShow={null}
      />
    );
    const listbox = screen.getByRole('listbox', { name: 'Search suggestions' });
    const options = screen.getAllByRole('option');
    await user.hover(options[1]);
    expect(listbox).toHaveAttribute('aria-activedescendant', options[1].id);
  });

  it('calls onClose when Escape is pressed', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithClient(
      <SearchPreviewDropdown
        query="res"
        isVisible
        onSelectShow={() => { }}
        onHoverShow={() => { }}
        onClose={onClose}
        hoveredShow={null}
      />
    );
    const listbox = screen.getByRole('listbox', { name: 'Search suggestions' });
    listbox.focus();
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  it('shows "With Streaming Data" badge when results contain streaming info', () => {
    (useEnhancedSearch as any).mockReturnValue({
      data: {
        success: true, data: {
          results: [
            { id: 'r1', title: 'Result One', media_type: 'movie', vote_average: 7.8, streaming: ['netflix'] },
            { id: 'r2', title: 'Result Two', media_type: 'tv', vote_average: 8.2 }
          ]
        }
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    renderWithClient(
      <SearchPreviewDropdown
        query="res"
        isVisible
        onSelectShow={() => { }}
        onHoverShow={() => { }}
        onClose={() => { }}
        hoveredShow={null}
      />
    );
    expect(screen.getByText('With Streaming Data')).toBeInTheDocument();
  });
});
