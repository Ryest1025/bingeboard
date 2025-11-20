import { formatApiItem } from '../formatApiItem';

describe('formatApiItem - Basic', () => {
  test('formats a TMDB movie', () => {
    const raw = {
      id: 101,
      title: 'Test Movie',
      overview: 'A great movie',
      poster_path: '/poster.jpg',
      backdrop_path: '/backdrop.jpg',
      vote_average: 8.4,
      release_date: '2025-01-01',
      media_type: 'movie'
    };

    const result = formatApiItem(raw);

    expect(result.id).toBe(101);
    expect(result.title).toBe('Test Movie');
    expect(result.overview).toBe('A great movie');
    expect(result.poster_path).toBe('/poster.jpg');
    expect(result.media_type).toBe('movie');
    expect(result.vote_average).toBe(8.4);
  });

  test('formats a TMDB TV show', () => {
    const raw = {
      id: 202,
      name: 'Test Show',
      overview: 'A great show',
      poster_path: '/show-poster.jpg',
      backdrop_path: '/show-backdrop.jpg',
      vote_average: 9.1,
      first_air_date: '2024-06-15',
      media_type: 'tv'
    };

    const result = formatApiItem(raw);

    expect(result.id).toBe(202);
    expect(result.title).toBe('Test Show');
    expect(result.overview).toBe('A great show');
    expect(result.vote_average).toBe(9.1);
  });

  test('normalizes streaming platforms', () => {
    const raw = {
      id: 303,
      title: 'Streaming Movie',
      streamingPlatforms: [
        { provider_id: 8, provider_name: 'Netflix', logo_path: '/netflix.png' }
      ],
      media_type: 'movie'
    };

    const result = formatApiItem(raw);

    expect(result.streaming).toBeDefined();
    expect(result.streaming?.length).toBe(1);
    expect(result.streaming?.[0].provider_name).toBe('Netflix');
  });
});
