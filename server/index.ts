
// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();
console.log("FIREBASE_ADMIN_KEY present:", !!process.env.FIREBASE_ADMIN_KEY);


import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeFirebaseAdmin } from "./services/firebaseAdmin";
import fs from 'fs';
import https from 'https';
import http from 'http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// Set Express environment explicitly
app.set('env', process.env.NODE_ENV || 'development');

console.log('🔍 Environment check:');
console.log('  process.env.NODE_ENV:', process.env.NODE_ENV);
console.log('  app.get("env"):', app.get('env'));

// Enable CORS for all routes with specific configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow all origins for development
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    // Allow specific origins in production
    const allowedOrigins = [
      'https://www.joinbingeboard.com',
      'https://joinbingeboard.com',
      /\.replit\.dev$/
    ];

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

// CRITICAL: Mobile detection DISABLED - allow all devices to access full React app
app.use((req, res, next) => {
  // Mobile redirects completely disabled - just pass through
  next();
});

app.use(express.json({ limit: '50mb' })); // Increase limit for large CSV uploads
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Secondary mobile detection middleware - COMPLETELY DISABLED
app.use((req, res, next) => {
  // Mobile redirects completely disabled - just pass through
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize Firebase Admin SDK
  initializeFirebaseAdmin();

  // Create HTTP or HTTPS server based on environment
  let server;

  if (process.env.HTTPS === 'true') {
    console.log('🔒 Creating HTTPS server...');
    try {
      const privateKey = fs.readFileSync('./localhost.key', 'utf8');
      const certificate = fs.readFileSync('./localhost.crt', 'utf8');
      const credentials = { key: privateKey, cert: certificate };
      server = https.createServer(credentials, app);
      console.log('✅ HTTPS server created successfully');
    } catch (error) {
      console.error('❌ Error creating HTTPS server:', error);
      console.log('⚠️ Falling back to HTTP server');
      server = http.createServer(app);
    }
  } else {
    console.log('Creating HTTP server');
    server = http.createServer(app);
  }

  // Register routes but ignore the returned server
  await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  console.log('🔍 About to check environment for Vite setup...');
  const env = app.get("env");
  console.log('  app.get("env"):', JSON.stringify(env));
  console.log('  env length:', env.length);
  console.log('  env === "development":', env === "development");
  console.log('  env.trim() === "development":', env.trim() === "development");
  console.log('  process.env.NODE_ENV:', JSON.stringify(process.env.NODE_ENV));

  // Check if we should run in API-only mode (port 5000) or full-stack mode (port 5000 with Vite)
  const port = parseInt(process.env.PORT || '5000');
  const isApiOnlyMode = process.env.API_ONLY === 'true';

  if (env === "development" && !isApiOnlyMode) {
    console.log('✅ Setting up Vite development server...');

    // Serve static files from client/public directory for development
    const clientPublicPath = path.resolve(__dirname, "..", "client", "public");
    console.log('📁 Serving static files from:', clientPublicPath);
    app.use(express.static(clientPublicPath));

    await setupVite(app, server);
  } else if (env === "production") {
    console.log('📦 Setting up static file serving...');
    serveStatic(app);
  } else {
    console.log('🔧 Running in API-only mode (no Vite setup)...');
  }

  let isRetrying = false;

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE' && !isRetrying) {
      isRetrying = true;
      console.error(`Port ${port} is already in use. Waiting 2 seconds and retrying...`);
      setTimeout(() => {
        server.close();
        server.listen(port, "0.0.0.0", () => {
          log(`serving on port ${port}`);
          isRetrying = false;
        });
      }, 2000);
    } else if (err.code !== 'EADDRINUSE') {
      console.error('Server error:', err);
      process.exit(1);
    }
  });

  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
