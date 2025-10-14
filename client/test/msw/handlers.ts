import { http, HttpResponse } from 'msw';

// Mutable state for handlers (simple in-memory store per test lifecycle)
export const mockState = {
  trending: [] as any[],
  personalized: [] as any[]
};

export const handlers = [
  // Trending TV (ignore query params)
  http.get('/api/trending/tv/day', () => {
    return HttpResponse.json({ results: mockState.trending });
  }),
  // Personalized discover (multi-API endpoint for v1+)
  http.get('/api/personalized/tv', () => {
    return HttpResponse.json({ results: mockState.personalized });
  }),
  // Legacy TMDB discover (kept for compatibility if needed by other code)
  http.get('/api/tmdb/discover/tv', () => {
    return HttpResponse.json({ results: mockState.personalized });
  })
];
