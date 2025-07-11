import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeFirebaseAdmin } from "./services/firebaseAdmin";

const app = express();

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

app.use(express.json({ limit: '50mb' })); // Increase limit for large CSV uploads
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Custom domain redirect disabled for API calls to prevent fetch errors
// Only redirect frontend pages, not API endpoints
app.use((req, res, next) => {
  const host = req.get('host');
  const customDomain = 'www.joinbingeboard.com';
  
  // Only redirect if accessing via Replit domain and not already on custom domain
  if (host && host.includes('replit.dev') && !host.includes(customDomain)) {
    // Temporarily disabled redirect for login pages to fix loading issues
    // if ((req.path.startsWith('/login') || req.path.startsWith('/auth')) && !req.path.startsWith('/api/')) {
    //   const redirectUrl = `https://${customDomain}${req.originalUrl}`;
    //   console.log(`🔄 Redirecting auth request to custom domain: ${redirectUrl}`);
    //   return res.redirect(301, redirectUrl);
    // }
  }
  
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
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  
  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Waiting 2 seconds and retrying...`);
      setTimeout(() => {
        server.close();
        server.listen(port, "0.0.0.0", () => {
          log(`serving on port ${port}`);
        });
      }, 2000);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
  
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
