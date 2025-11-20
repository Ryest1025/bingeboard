import { formatApiItem, dedupeMedia, MediaItem } from '../formatApiItem';

describe('formatApiItem', () => {
  test('normalizes tmdb-like object', () => {
    const raw = {
      id: 10,
      title: 'Hello World',
      poster_path: '/p.jpg',
      backdrop_path: '/b.jpg',
      vote_average: 8.2,
      media_type: 'movie'
    };
    const out = formatApiItem(raw);
    expect(out.id).toBe(10);
    expect(out.title).toBe('Hello World');
    expect(out.poster_path).toBe('/p.jpg');
    expect(out.media_type).toBe('movie');
    expect(out.vote_average).toBe(8.2);
  });

  test('handles various streaming shapes from multi-API', () => {
    const raw = {
      id: 11,
      name: 'The Show',
      providers: [{ provider_id: 2, name: 'Netflix' }],
      media_type: 'tv'
    };
    const out = formatApiItem(raw);
    expect(out.streaming).toBeDefined();
    expect(out.streaming?.[0].provider_name).toBe('Netflix');
  });

  test('throws on missing raw', () => {
    // @ts-ignore
    expect(() => formatApiItem(null)).toThrow();
  });

  test('formats a valid API item with all fields', () => {
    const item = {
      id: 101,
      title: 'Test Movie',
      overview: 'A great movie',
      poster_path: '/poster.jpg',
      backdrop_path: '/backdrop.jpg',
      vote_average: 8.4,
      release_date: '2025-01-01',
      genre_ids: [28, 12],
      popularity: 123.45,
      vote_count: 1000,
      media_type: 'movie'
    };

    const result = formatApiItem(item);

    expect(result).toMatchObject({
      id: 101,
      title: 'Test Movie',
      name: 'Test Movie',
      overview: 'A great movie',
      poster_path: '/poster.jpg',
      backdrop_path: '/backdrop.jpg',
      vote_average: 8.4,
      release_date: '2025-01-01',
      genre_ids: [28, 12],
      popularity: 123.45,
      vote_count: 1000,
      media_type: 'movie'
    });
  });

  test('handles TV shows with name field', () => {
    const item = {
      id: 202,
      name: 'Test TV Show',
      first_air_date: '2025-01-01',
      overview: 'Great TV show',
      poster_path: '/tv-poster.jpg'
    };

    const result = formatApiItem(item);

    expect(result).toMatchObject({
      id: 202,
      title: 'Test TV Show',
      name: 'Test TV Show',
      media_type: 'tv',
      first_air_date: '2025-01-01'
    });
  });

  test('handles missing fields with sensible defaults', () => {
    const item = {
      id: 303,
      title: null,
      overview: null,
      poster_path: null,
      backdrop_path: null,
      vote_average: null,
    };

    const result = formatApiItem(item);

    expect(result).toMatchObject({
      id: 303,
      title: 'Unknown Title',
      name: 'Unknown Title',
      overview: '',
      poster_path: null,
      backdrop_path: null,
      vote_average: 0,
      genre_ids: [],
      streaming: [],
      streaming_platforms: []
    });
  });

  test('parses string ID to number', () => {
    const item = {
      id: '12345',
      title: 'String ID Test'
    };

    const result = formatApiItem(item);

    expect(result.id).toBe(12345);
    expect(typeof result.id).toBe('number');
  });

  test('normalizes streaming data from array', () => {
    const item = {
      id: 404,
      title: 'Streaming Test',
      streamingPlatforms: [
        { provider_id: 8, provider_name: 'Netflix', logo_path: '/netflix.jpg' },
        { provider_id: 9, provider_name: 'Prime Video', logo_path: '/prime.jpg' }
      ]
    };

    const result = formatApiItem(item);

    expect(result.streamingPlatforms).toHaveLength(2);
    expect(result.streaming_platforms).toHaveLength(2);
    expect(result.streamingPlatforms[0].provider_name).toBe('Netflix');
  });

  test('normalizes streaming data from single object', () => {
    const item = {
      id: 505,
      title: 'Single Streaming Test',
      streaming: { provider_id: 8, provider_name: 'Netflix' }
    };

    const result = formatApiItem(item);

    expect(result.streaming).toHaveLength(1);
    expect(result.streaming[0].provider_name).toBe('Netflix');
  });

  test('handles alternative field names (poster_url, backdrop_url)', () => {
    const item = {
      id: 606,
      title: 'Alt Fields Test',
      poster_url: '/alt-poster.jpg',
      backdrop_url: '/alt-backdrop.jpg'
    };

    const result = formatApiItem(item);

    expect(result.poster_path).toBe('/alt-poster.jpg');
    expect(result.backdrop_path).toBe('/alt-backdrop.jpg');
  });

  test('determines media_type from context when not provided', () => {
    const tvItem = {
      id: 701,
      name: 'TV Show',
      first_air_date: '2025-01-01'
    };

    const movieItem = {
      id: 702,
      title: 'Movie',
      release_date: '2025-01-01'
    };

    expect(formatApiItem(tvItem).media_type).toBe('tv');
    expect(formatApiItem(movieItem).media_type).toBe('movie');
  });

  test('handles genres from array of objects', () => {
    const item = {
      id: 808,
      title: 'Genre Test',
      genres: [
        { id: 28, name: 'Action' },
        { id: 12, name: 'Adventure' }
      ]
    };

    const result = formatApiItem(item);

    expect(result.genre_ids).toEqual([28, 12]);
  });

  test('preserves extra fields from raw data', () => {
    const item = {
      id: 909,
      title: 'Extra Fields',
      custom_field: 'custom value',
      another_prop: 123
    };

    const result = formatApiItem(item);

    expect(result.custom_field).toBe('custom value');
    expect(result.another_prop).toBe(123);
  });
});

describe('dedupeMedia', () => {
  test('removes duplicate items by media_type and id', () => {
    const items: MediaItem[] = [
      {
        id: 1,
        title: 'Show 1',
        name: 'Show 1',
        media_type: 'tv',
        poster_path: null,
        vote_average: 8
      },
      {
        id: 1,
        title: 'Show 1 Duplicate',
        name: 'Show 1 Duplicate',
        media_type: 'tv',
        poster_path: null,
        vote_average: 7
      },
      {
        id: 2,
        title: 'Show 2',
        name: 'Show 2',
        media_type: 'tv',
        poster_path: null,
        vote_average: 9
      }
    ];

    const result = dedupeMedia(items);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(2);
    // Should keep the first occurrence
    expect(result[0].title).toBe('Show 1');
  });

  test('allows same ID for different media types', () => {
    const items: MediaItem[] = [
      {
        id: 100,
        title: 'Movie',
        name: 'Movie',
        media_type: 'movie',
        poster_path: null
      },
      {
        id: 100,
        title: 'TV Show',
        name: 'TV Show',
        media_type: 'tv',
        poster_path: null
      }
    ];

    const result = dedupeMedia(items);

    expect(result).toHaveLength(2);
    expect(result.find(i => i.media_type === 'movie')).toBeDefined();
    expect(result.find(i => i.media_type === 'tv')).toBeDefined();
  });

  test('handles empty array', () => {
    const result = dedupeMedia([]);
    expect(result).toEqual([]);
  });

  test('preserves order of first occurrence', () => {
    const items: MediaItem[] = [
      { id: 3, title: 'Third', name: 'Third', media_type: 'tv', poster_path: null },
      { id: 1, title: 'First', name: 'First', media_type: 'tv', poster_path: null },
      { id: 2, title: 'Second', name: 'Second', media_type: 'tv', poster_path: null },
      { id: 1, title: 'First Dupe', name: 'First Dupe', media_type: 'tv', poster_path: null }
    ];

    const result = dedupeMedia(items);

    expect(result).toHaveLength(3);
    expect(result[0].id).toBe(3);
    expect(result[1].id).toBe(1);
    expect(result[2].id).toBe(2);
  });
});
