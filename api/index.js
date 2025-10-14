// Vercel Serverless Function Handler
// Simplified handler that works with Vercel's serverless environment

import express from "express";
import cors from "cors";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration for production
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://bingeboardapp.com',
      'http://bingeboardapp.com',
      'https://www.bingeboardapp.com',
      'http://www.bingeboardapp.com',
      'https://ryest1025.github.io',
      /\.vercel\.app$/  // Allow Vercel preview URLs
    ];
    
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    });
    
    callback(null, isAllowed);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Backend is running on Vercel',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'production'
  });
});

// Import and register routes dynamically
// This allows the full backend to work in serverless environment
let routesRegistered = false;

async function ensureRoutes() {
  if (routesRegistered) return;
  
  try {
    // Import the route registration function
    const { registerRoutes } = await import('../server/routes.js');
    
    // Register all routes (this sets up all API endpoints)
    await registerRoutes(app);
    
    routesRegistered = true;
    console.log('✅ All routes registered successfully');
  } catch (error) {
    console.error('❌ Error registering routes:', error);
    throw error;
  }
}

// Middleware to ensure routes are loaded
app.use(async (req, res, next) => {
  if (!routesRegistered && req.path.startsWith('/api/')) {
    try {
      await ensureRoutes();
    } catch (error) {
      return res.status(500).json({ 
        error: 'Failed to initialize server',
        message: error.message 
      });
    }
  }
  next();
});

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    path: req.path,
    message: 'The requested endpoint does not exist'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred'
  });
});

// Export for Vercel
export default app;