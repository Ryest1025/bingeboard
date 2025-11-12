// Vercel Serverless Function Handler
// This creates the Express app without starting a server

import express from "express";
import cors from "cors";
import { registerRoutes } from "../server/routes.js";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'production'
  });
});

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'https://bingeboardapp.com',
      'http://bingeboardapp.com',
      'https://www.bingeboardapp.com',
      'http://www.bingeboardapp.com',
      'https://www.joinbingeboard.com',
      'https://joinbingeboard.com',
      process.env.CORS_ORIGIN,
    ].filter(Boolean);

    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return origin === allowed;
      } else if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    }) || origin.endsWith('.vercel.app') || origin.endsWith('.github.io');

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Register routes (auth, content, etc.)
registerRoutes(app);

// Export for Vercel serverless
export default app;
