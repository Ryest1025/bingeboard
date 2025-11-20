import { rest } from 'msw';

export const handlers = [
  // Multi-API Discover endpoint
  rest.get('/api/multi-api/discover', (req, res, ctx) => {
    const limit = req.url.searchParams.get('limit') || '100';
    return res(
      ctx.status(200),
      ctx.json({
        results: [
          {
            id: 1001,
            title: 'Trending Show A',
            media_type: 'tv',
            poster_path: '/poster-a.jpg',
            backdrop_path: '/backdrop-a.jpg',
            popularity: 90.5,
            vote_average: 8.8,
            overview: 'An exciting trending show',
            first_air_date: '2024-01-15',
            providers: [
              {
                provider_id: 8,
                name: 'Netstream',
                logo_path: '/netstream.png',
                display_priority: 1
              }
            ]
          },
          {
            id: 1002,
            title: 'Popular Movie B',
            media_type: 'movie',
            poster_path: '/poster-b.jpg',
            backdrop_path: '/backdrop-b.jpg',
            popularity: 65.3,
            vote_average: 7.6,
            overview: 'A popular blockbuster movie',
            release_date: '2024-03-22',
            providers: [
              {
                provider_id: 9,
                name: 'PrimeNow',
                logo_path: '/primenow.png',
                display_priority: 2
              }
            ]
          },
          {
            id: 1003,
            title: 'Hidden Gem C',
            media_type: 'tv',
            poster_path: '/poster-c.jpg',
            backdrop_path: '/backdrop-c.jpg',
            popularity: 22.1,
            vote_average: 7.5,
            overview: 'An underrated gem',
            first_air_date: '2023-11-10',
            availability: []
          }
        ],
        page: 1,
        total_pages: 10,
        total_results: 150
      })
    );
  }),

  // Multi-API Availability
  rest.get('/api/multi-api/availability', (req, res, ctx) => {
    const ids = req.url.searchParams.get('ids');
    return res(
      ctx.status(200),
      ctx.json({
        items: [
          {
            id: 1001,
            providers: [
              {
                provider_id: 8,
                name: 'Netstream',
                url: 'https://netstream.example.com/watch/1001',
                logo_path: '/netstream.png'
              }
            ]
          },
          {
            id: 1002,
            providers: [
              {
                provider_id: 9,
                name: 'PrimeNow',
                url: 'https://primenow.example.com/dp/1002',
                logo_path: '/primenow.png'
              }
            ]
          }
        ]
      })
    );
  }),

  // Fallback TMDB Discover TV
  rest.get('/api/tmdb/discover/tv', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        results: [
          {
            id: 2001,
            name: 'TMDB Fallback Show',
            poster_path: '/fallback.jpg',
            backdrop_path: '/fallback-backdrop.jpg',
            vote_average: 7.0,
            overview: 'Fallback content from TMDB',
            first_air_date: '2023-06-15'
          }
        ],
        page: 1,
        total_pages: 5,
        total_results: 50
      })
    );
  }),

  // TMDB Top Rated
  rest.get('/api/tmdb/tv/top_rated', (req, res, ctx) => {
    const limit = req.url.searchParams.get('limit') || '20';
    return res(
      ctx.status(200),
      ctx.json({
        results: [
          {
            id: 3001,
            name: 'Top Rated Show',
            poster_path: '/top.jpg',
            backdrop_path: '/top-backdrop.jpg',
            vote_average: 9.2,
            overview: 'Critically acclaimed series',
            first_air_date: '2022-08-01',
            streamingPlatforms: [
              {
                provider_id: 8,
                provider_name: 'Netstream',
                logo_path: '/netstream.png'
              }
            ]
          }
        ]
      })
    );
  }),

  // Content Dashboard
  rest.get('/api/content/dashboard', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        trending: [
          { id: 4001, title: 'Trending Item 1', media_type: 'tv', poster_path: '/t1.jpg' }
        ],
        popular: [
          { id: 4002, title: 'Popular Item 1', media_type: 'movie', poster_path: '/p1.jpg' }
        ],
        topRated: [
          { id: 4003, title: 'Top Rated Item 1', media_type: 'tv', poster_path: '/tr1.jpg' }
        ]
      })
    );
  })
];
