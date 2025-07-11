import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { db } from './db';
import { setupAuth } from './auth';
import { registerRoutes } from './routes';
import { createServer } from 'http';
import path from 'path';
import fs from 'fs';

const app = express();
const port = process.env.PORT || 5000;

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://localhost:3000',
  /^https?:\/\/.*\.replit\.dev$/,
  /^https?:\/\/.*\.repl\.co$/,
  'https://www.joinbingeboard.com',
  'https://joinbingeboard.com'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return origin === allowed;
      } else {
        return allowed.test(origin);
      }
    });
    
    callback(null, isAllowed);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

// MOBILE DETECTION FIRST - PERMANENT SOLUTION
app.use((req, res, next) => {
  const userAgent = req.get('user-agent') || '';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone|Mobile|IEMobile|Opera Mini/i.test(userAgent);
  
  console.log(`📱 Mobile check: ${isMobile} - Path: ${req.path}`);
  
  // Serve mobile HTML for mobile devices (except API calls)
  if ((isMobile || req.query.mobile === 'true') && !req.path.startsWith('/api') && !req.path.includes('.') && req.method === 'GET') {
    console.log('📱 MOBILE REDIRECT - Serving mobile-simple.html');
    
    try {
      const mobileHtmlPath = path.join(__dirname, '..', 'mobile-simple.html');
      return res.sendFile(mobileHtmlPath);
    } catch (error) {
      console.log('📱 Error loading mobile-simple.html, serving fallback');
      return res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BingeBoard Mobile</title>
    <style>
        body { background: #000; color: #fff; font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 20px; }
        .logo { font-size: 32px; font-weight: bold; margin: 40px 0; text-align: center; }
        .status { background: #064e3b; color: #6ee7b7; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center; }
    </style>
</head>
<body>
    <div class="logo">BingeBoard</div>
    <div class="status">✅ Mobile version loaded successfully</div>
</body>
</html>`);
    }
  }
  
  next();
});

// Express middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Setup authentication
setupAuth(app);

// Register API routes
const httpServer = createServer(app);
registerRoutes(app, httpServer);

// Start server
httpServer.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`🔥 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📱 Mobile detection: ACTIVE`);
});

export { app, httpServer };