// Vercel-compatible API handler
import express from "express";
import cors from "cors";

const app = express();

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://bingeboardapp.com',
      'http://bingeboardapp.com',
      'https://www.bingeboardapp.com',
      'http://www.bingeboardapp.com',
      'https://ryest1025.github.io'
    ];
    
    const isAllowed = allowedOrigins.includes(origin);
    callback(null, isAllowed);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json());

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Backend is working',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Basic trending endpoint (mock data for now)
app.get('/api/trending/tv/day', (req, res) => {
  res.json({
    results: [
      {
        id: 1,
        name: "Test Show",
        overview: "This is a test show to verify the API is working",
        poster_path: "/test.jpg",
        vote_average: 8.5
      }
    ]
  });
});

// Export for Vercel
export default app;