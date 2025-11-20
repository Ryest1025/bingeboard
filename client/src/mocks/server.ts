import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Setup server with all handlers
export const server = setupServer(...handlers);
