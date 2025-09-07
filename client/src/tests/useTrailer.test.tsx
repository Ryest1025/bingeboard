// tests/useTrailer.test.tsx - unit tests for useTrailer hook
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useTrailer from '@/hooks/useTrailer';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return Wrapper;
};

describe('useTrailer hook', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('fetches primary trailer successfully', async () => {
    const mockResponse = {
      id: 1,
      type: 'movie',
      trailers: [
        { key: 'abc', url: 'https://youtube.com/watch?v=abc', videoType: 'trailer', monetizationScore: 0.6 },
        { key: 'def', url: 'https://youtube.com/watch?v=def', videoType: 'teaser', monetizationScore: 0.2 }
      ],
      primaryTrailer: { key: 'abc', url: 'https://youtube.com/watch?v=abc', videoType: 'trailer' },
      stats: { total: 2, monetized: 0 }
    } as any;

    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(mockResponse) } as any);

    const { result } = renderHook(() => useTrailer(1, 'movie', 'Test Movie'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(global.fetch).toHaveBeenCalledWith('/api/multi-api/trailer/movie/1?title=Test%20Movie');
    expect(result.current.data?.primaryTrailer?.key).toBe('abc');
  });

  it('respects monetizationScore ordering (server-provided primary)', async () => {
    const mockResponse = {
      id: 9,
      type: 'movie',
      trailers: [
        { key: 'low', url: 'https://youtube.com/watch?v=low', videoType: 'trailer', monetizationScore: 0.1 },
        { key: 'high', url: 'https://youtube.com/watch?v=high', videoType: 'trailer', monetizationScore: 0.9 }
      ],
      primaryTrailer: { key: 'high', url: 'https://youtube.com/watch?v=high', videoType: 'trailer', monetizationScore: 0.9 }
    } as any;
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(mockResponse) } as any);
    const { result } = renderHook(() => useTrailer(9, 'movie', 'Score Test'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.primaryTrailer?.key).toBe('high');
  });

  it('handles empty trailer list', async () => {
    const mockResponse = { id: 2, type: 'movie', trailers: [], primaryTrailer: null, stats: { total: 0, monetized: 0 } };
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(mockResponse) } as any);

    const { result } = renderHook(() => useTrailer(2, 'movie', 'Empty'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.trailers.length).toBe(0);
    expect(result.current.data?.primaryTrailer).toBeNull();
  });

  it('propagates fetch error', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false } as any);

    const { result } = renderHook(() => useTrailer(3, 'movie', 'Err'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('disabled when id missing or type invalid', async () => {
    global.fetch = vi.fn();
    const { result, rerender } = renderHook((props: { id: number | null; type: string }) => useTrailer(props.id, props.type, 'X'), {
      initialProps: { id: null as number | null, type: 'movie' },
      wrapper: createWrapper()
    });

    expect(result.current.fetchStatus).toBe('idle');
    rerender({ id: 10, type: 'other' });
    expect(result.current.fetchStatus).toBe('idle');
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
