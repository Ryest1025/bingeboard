// Vercel Serverless Function Handler
// This handler imports the full Express server from the built dist/index.js

// Import the full Express app from the build output
import app from '../dist/index.js';

// Export Vercel-compatible serverless handler
export default async function handler(req, res) {
  // Delegate all requests to the Express app
  return app(req, res);
}
