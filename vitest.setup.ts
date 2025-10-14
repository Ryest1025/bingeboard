// vitest.setup.ts - global test setup
import '@testing-library/jest-dom';
import { server } from './client/test/msw/server';

// MSW lifecycle
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Additional polyfills or globals can be added here
