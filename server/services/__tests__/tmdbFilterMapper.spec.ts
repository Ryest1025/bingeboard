import { describe, it, expect } from 'vitest';
import { mapDiscoverFilters } from '../tmdbFilterMapper';

describe('mapDiscoverFilters', () => {
  it('maps camelCase keys to expected snake_case', () => {
    const params = mapDiscoverFilters({
      genres: '18',
      networks: '213',
      voteAverageGte: 7,
      firstAirDateYear: 2024,
      watchProviders: '8',
      watchRegion: 'US',
      originalLanguage: 'en'
    });
    const str = params.toString();
    expect(str).toContain('with_genres=18');
    expect(str).toContain('with_networks=213');
    expect(str).toContain('vote_average.gte=7');
    expect(str).toContain('first_air_date_year=2024');
    expect(str).toContain('with_watch_providers=8');
    expect(str).toContain('watch_region=US');
    expect(str).toContain('with_original_language=en');
  });

  it('omits undefined values', () => {
    const params = mapDiscoverFilters({ genres: undefined, page: 3 });
    const str = params.toString();
    expect(str).toBe('page=3');
  });
});
