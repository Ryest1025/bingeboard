import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi } from 'vitest';
import BrandedSearchBar from '@/components/search/BrandedSearchBar';
import { getA11ySnapshot } from './a11ySnapshot.util';

vi.mock('@/hooks/useSearchShows', () => ({
  default: vi.fn((q: string) => ({
    data: q.length < 2 ? [] : [
      { id: '1', title: 'Alpha', type: 'movie' },
      { id: '2', title: 'Beta', type: 'tv' }
    ],
    isFetching: false,
  }))
}));

vi.mock('@/hooks/useShowDetails', () => ({
  default: vi.fn(() => ({ data: null, isLoading: false }))
}));

vi.mock('framer-motion', () => ({
  motion: new Proxy({}, { get: () => (p: any) => <div {...p}>{p.children}</div> }),
  AnimatePresence: ({ children }: any) => children
}));

function renderWithClient(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

describe('BrandedSearchBar accessibility snapshot', () => {
  it('captures expected roles before and after typing', async () => {
    const { getByRole } = renderWithClient(<BrandedSearchBar />);
    const input = getByRole('combobox');
    const initial = getA11ySnapshot();
    // Initially only combobox expected
    expect(Object.keys(initial)).toContain('combobox');
    fireEvent.change(input, { target: { value: 'Al' } });
    await waitFor(() => {
      const after = getA11ySnapshot();
      expect(Object.keys(after)).toContain('listbox');
      expect(after.listbox.length).toBe(1);
      expect(after.option.length).toBeGreaterThanOrEqual(2);
      const combo = after.combobox?.[0];
      expect(combo.expanded).toBe('true');
    });
  });
});
