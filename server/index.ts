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

// Mobile detection middleware - serves mobile HTML directly
app.use((req, res, next) => {
  const userAgent = req.get('user-agent') || '';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone|Mobile/i.test(userAgent);
  
  console.log(`🌍 Request: ${req.method} ${req.get('host')}${req.path} - Mobile: ${isMobile} - UA: ${userAgent.substring(0, 50)}...`);
  
  // Serve mobile HTML directly for mobile devices requesting the root path or any main routes
  if (isMobile && (req.path === '/' || req.path === '/discover' || req.path === '/lists' || req.path === '/social' || req.path === '/profile') && req.method === 'GET') {
    console.log('📱 MOBILE DEVICE DETECTED - SERVING MOBILE HTML DIRECTLY');
    console.log('📱 User Agent:', userAgent);
    console.log('📱 Requested Path:', req.path);
    
    const mobileHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BingeBoard Mobile</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #000; color: #fff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; min-height: 100vh; padding: 20px; }
        .container { max-width: 400px; margin: 0 auto; }
        .logo { display: flex; align-items: center; justify-content: center; margin-bottom: 30px; }
        .logo-icon { width: 48px; height: 48px; background: linear-gradient(135deg, #1f2937, #374151); border-radius: 12px; display: flex; align-items: center; justify-content: center; border: 2px solid #fff; margin-right: 12px; }
        .logo-icon::before { content: 'B'; font-size: 24px; font-weight: bold; color: #14b8a6; }
        .logo-text { font-size: 28px; font-weight: bold; }
        .logo-text .binge { background: linear-gradient(135deg, #14b8a6, #0d9488); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .subtitle { text-align: center; color: #9ca3af; margin-bottom: 30px; font-size: 16px; }
        .card { background: #1f2937; border-radius: 16px; padding: 24px; border: 1px solid #374151; margin-bottom: 24px; }
        .card h2 { color: #14b8a6; margin-bottom: 16px; font-size: 20px; }
        .button { background: #14b8a6; color: white; border: none; padding: 16px 24px; border-radius: 8px; font-size: 16px; font-weight: 500; cursor: pointer; width: 100%; margin-bottom: 12px; transition: background 0.2s; }
        .button:hover { background: #0d9488; }
        .button.secondary { background: #374151; color: #d1d5db; }
        .button.secondary:hover { background: #4b5563; }
        .status { padding: 12px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; text-align: center; }
        .status.success { background: #064e3b; color: #6ee7b7; border: 1px solid #047857; }
        .status.error { background: #7f1d1d; color: #fca5a5; border: 1px solid #dc2626; }
        .status.loading { background: #78350f; color: #fbbf24; border: 1px solid #d97706; }
        .show-card { display: flex; align-items: center; padding: 12px; border-bottom: 1px solid #374151; }
        .show-poster { width: 40px; height: 60px; background: #374151; border-radius: 4px; margin-right: 12px; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 10px; text-align: center; }
        .show-info { flex: 1; }
        .show-title { font-weight: 500; color: #fff; margin-bottom: 4px; font-size: 14px; }
        .show-rating { font-size: 12px; color: #9ca3af; }
        .quick-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 16px; }
        .quick-actions .button { margin-bottom: 0; padding: 12px 16px; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <div class="logo-icon"></div>
            <div class="logo-text">
                <span class="binge">Binge</span>Board
            </div>
        </div>
        
        <p class="subtitle">Mobile Entertainment Hub</p>
        
        <div class="card">
            <h2>Welcome!</h2>
            <div class="status success">Mobile version loaded successfully</div>
            <button class="button" onclick="loadTrending()">View Trending Shows</button>
            <button class="button secondary" onclick="window.location.href='/?desktop=true'">Try Desktop Version</button>
        </div>
        
        <div class="card" id="trending-section" style="display: none;">
            <h2>Trending Now</h2>
            <div id="trending-content">
                <div class="status loading">Loading shows...</div>
            </div>
        </div>
    </div>

    <script>
        console.log('Mobile BingeBoard loaded via server-side detection');
        
        function loadTrending() {
            const section = document.getElementById('trending-section');
            section.style.display = 'block';
            
            fetch('/api/tmdb/trending')
                .then(response => response.json())
                .then(data => {
                    const content = document.getElementById('trending-content');
                    if (data.results && data.results.length > 0) {
                        const showsHtml = data.results.slice(0, 5).map(show => 
                            '<div class="show-card"><div class="show-poster">' +
                            (show.poster_path ? 
                                '<img src="https://image.tmdb.org/t/p/w92' + show.poster_path + '" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;">' :
                                'No Image'
                            ) + '</div><div class="show-info"><div class="show-title">' + 
                            (show.name || show.title) + '</div><div class="show-rating">★ ' + 
                            show.vote_average.toFixed(1) + '/10</div></div></div>'
                        ).join('');
                        content.innerHTML = showsHtml;
                    } else {
                        content.innerHTML = '<div class="status error">No trending shows found</div>';
                    }
                })
                .catch(error => {
                    document.getElementById('trending-content').innerHTML = '<div class="status error">Failed to load shows</div>';
                });
        }
    </script>
</body>
</html>`;
    
    return res.send(mobileHtml);
  }
  
  // Allow desktop override
  if (req.query.desktop === 'true') {
    console.log('🖥️ Desktop override requested');
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
