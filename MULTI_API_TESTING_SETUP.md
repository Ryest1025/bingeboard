# Multi-API Integration & Testing Setup Guide

## Overview

This guide covers the new multi-API integration system with comprehensive testing infrastructure for the Discover page.

## Architecture

```
┌─────────────────┐
│  Discover Page  │
└────────┬────────┘
         │
    ┌────▼────┐
    │ Utilities│
    ├─────────┤
    │ multiApiFetch    → Calls /api/multi-api/* with fallback
    │ formatApiItem    → Normalizes TMDB/Multi-API/JustWatch
    │ spotlight        → Rotation logic (no repeats)
    └────────┘
```

## Files Added

### Utilities (`client/src/utils/`)
- **`multiApiFetch.ts`** - Multi-API endpoint wrapper with timeout & fallback
- **`formatApiItem.ts`** - Universal API response normalizer (updated)
- **`spotlight.ts`** - Spotlight rotation logic (updated)

### Tests (`client/src/utils/__tests__/`)
- **`formatApiItem.test.ts`** - 35+ unit tests
- **`spotlight.test.ts`** - 25+ unit tests
- **`README.md`** - Test documentation

## Setup Instructions

### 1. Install Testing Dependencies

```bash
npm install --save-dev \
  @types/jest \
  @testing-library/react \
  @testing-library/jest-dom \
  msw \
  whatwg-fetch
```

### 2. Configure Jest

Create or update `jest.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/client/src/setupTests.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/client/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(t|j)sx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      }
    }]
  },
  testMatch: [
    '**/__tests__/**/*.(test|spec).(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)'
  ],
  collectCoverageFrom: [
    'client/src/**/*.{ts,tsx}',
    '!client/src/**/*.d.ts',
    '!client/src/**/*.stories.tsx'
  ]
};
```

### 3. Create Test Setup File

Create `client/src/setupTests.ts`:

```typescript
import '@testing-library/jest-dom';
import { server } from './mocks/server';

// Establish API mocking before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Clean up after tests
afterAll(() => server.close());

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
```

### 4. Setup Mock Service Worker (MSW)

Create `client/src/mocks/handlers.ts`:

```typescript
import { rest } from 'msw';

export const handlers = [
  // Multi-API Discover
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
            popularity: 90,
            vote_average: 8.8,
            providers: [
              { provider_id: 8, name: 'Netflix', logo_path: '/netflix.png' }
            ]
          },
          {
            id: 1002,
            title: 'Popular Movie B',
            media_type: 'movie',
            poster_path: '/poster-b.jpg',
            popularity: 60,
            vote_average: 7.6,
            providers: [
              { provider_id: 9, name: 'Prime Video', logo_path: '/prime.png' }
            ]
          },
          {
            id: 1003,
            title: 'Hidden Gem C',
            media_type: 'tv',
            poster_path: '/poster-c.jpg',
            popularity: 20,
            vote_average: 7.5,
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
    return res(
      ctx.status(200),
      ctx.json({
        items: [
          {
            id: 1001,
            providers: [
              {
                provider_id: 8,
                name: 'Netflix',
                url: 'https://netflix.com/watch/...'
              }
            ]
          }
        ]
      })
    );
  }),

  // Fallback TMDB endpoint
  rest.get('/api/tmdb/discover/tv', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        results: [
          {
            id: 2001,
            name: 'TMDB Fallback Show',
            poster_path: '/fallback.jpg',
            vote_average: 7.0,
            media_type: 'tv'
          }
        ]
      })
    );
  }),

  // TMDB Top Rated
  rest.get('/api/tmdb/tv/top_rated', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        results: [
          {
            id: 3001,
            name: 'Top Rated Show',
            poster_path: '/top.jpg',
            vote_average: 9.2
          }
        ]
      })
    );
  })
];
```

Create `client/src/mocks/server.ts`:

```typescript
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

### 5. Update package.json Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  }
}
```

## Running Tests

```bash
# Run all tests
npm test

# Watch mode (for development)
npm run test:watch

# With coverage report
npm run test:coverage

# CI mode (for GitHub Actions)
npm run test:ci
```

## Multi-API Integration

### Using multiApiFetch

```typescript
import { multiApiFetch } from '@/utils/multiApiFetch';

// With timeout and error handling
const result = await multiApiFetch('/discover?limit=100', {}, 10_000);

if (result.ok) {
  const data = result.body;
  // Process data
} else {
  console.error('Multi-API failed:', result.error);
  // Fallback to TMDB
}
```

### Normalizing Responses

```typescript
import { formatApiItem } from '@/utils/formatApiItem';

// Works with TMDB
const tmdbItem = formatApiItem(tmdbResponse.results[0]);

// Works with Multi-API
const multiApiItem = formatApiItem(multiApiResponse.results[0]);

// Works with JustWatch
const justWatchItem = formatApiItem(justWatchResponse.items[0]);

// All return consistent MediaItem shape
```

### Spotlight Rotation

```typescript
import { pickNextSpotlight } from '@/utils/spotlight';

const spotlights = [item1, item2, item3];
const previousSpotlight = spotlights[0];

// Picks random item, avoiding immediate repeat
const nextSpotlight = pickNextSpotlight(spotlights, previousSpotlight);
```

## Test Coverage Goals

- ✅ **Unit Tests**: >90% coverage for utilities
- ✅ **Integration Tests**: Full Discover page flow
- ✅ **Edge Cases**: Null handling, empty arrays, timeouts
- ✅ **Type Safety**: Full TypeScript coverage

## CI/CD Integration

Add to `.github/workflows/test.yml`:

```yaml
name: Test Suite

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:ci
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

## Troubleshooting

### "Cannot find name 'expect'"
Install Jest types: `npm install --save-dev @types/jest`

### "fetch is not defined"
Install whatwg-fetch: `npm install --save-dev whatwg-fetch`
Add to setupTests.ts: `import 'whatwg-fetch';`

### MSW warnings
Update handlers to handle all endpoint variations
Use `onUnhandledRequest: 'warn'` in server.listen()

### TypeScript errors in tests
Ensure jest.config.js has proper ts-jest transform
Check tsconfig.json includes test files

## Next Steps

1. ✅ Install dependencies
2. ✅ Configure Jest
3. ✅ Setup MSW handlers
4. ✅ Run tests: `npm test`
5. ✅ Integrate into CI/CD
6. 🔄 Create Discover page integration test
7. 🔄 Add E2E tests with Playwright

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [MSW Documentation](https://mswjs.io/)
- [TypeScript Jest](https://kulshekhar.github.io/ts-jest/)
