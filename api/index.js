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

// Auth status endpoint
app.get('/api/auth/status', (req, res) => {
  res.json({
    isAuthenticated: false,
    user: null,
    message: 'Firebase auth not configured yet'
  });
});

// Basic trending endpoint (mock data for now)
app.get('/api/trending/tv/day', (req, res) => {
  res.json({
    results: [
      {
        id: 1,
        name: "Stranger Things",
        overview: "A group of young friends witness supernatural forces and secret government exploits.",
        poster_path: "/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
        vote_average: 8.7,
        first_air_date: "2016-07-15"
      },
      {
        id: 2,
        name: "The Bear",
        overview: "A young chef from the fine dining world returns to Chicago to run his family's sandwich shop.",
        poster_path: "/placeholder.jpg", 
        vote_average: 8.5,
        first_air_date: "2022-06-23"
      },
      {
        id: 3,
        name: "Wednesday",
        overview: "A coming-of-age supernatural mystery comedy horror series that follows Wednesday Addams.",
        poster_path: "/9PFonBhy4cQy7Jz20NpMygczOkv.jpg",
        vote_average: 8.8,
        first_air_date: "2022-11-23"
      }
    ]
  });
});

// Multi-API trailer endpoint (mock for now)
app.get('/api/multi-api/trailer/tv/:id', (req, res) => {
  const { id } = req.params;
  const { title } = req.query;
  
  res.json({
    trailers: [
      {
        key: "sBjh3OBkval",
        name: `${title || 'Show'} Official Trailer`,
        site: "YouTube",
        size: 1080,
        type: "Trailer"
      }
    ],
    message: `Trailer for ${title || 'show'} (ID: ${id})`
  });
});

// Export for Vercel
export default app;