// Service Worker for BingeBoard PWA - FORCE CACHE CLEAR Oct 17 2025
const CACHE_NAME = 'bingeboard-v4-oct17';
const STATIC_CACHE_NAME = 'bingeboard-static-v4-oct17';
const DYNAMIC_CACHE_NAME = 'bingeboard-dynamic-v4-oct17';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  // Removed /offline.html - file doesn't exist
];

// API endpoints to cache with network-first strategy
const API_CACHE_PATTERNS = [
  '/api/tmdb/trending',
  '/api/tmdb/popular',
  '/api/watchlist',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }
  
  // Force HTTPS for all requests
  if (url.protocol === 'http:' && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
    const httpsUrl = url.toString().replace('http:', 'https:');
    event.respondWith(fetch(httpsUrl));
    return;
  }
  
  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }
  
  // Handle static assets with cache-first strategy
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }
  
  // Handle navigation requests with network-first, fallback to cache
  if (request.mode === 'navigate') {
    event.respondWith(navigationStrategy(request));
    return;
  }
  
  // Default: network-first for everything else
  event.respondWith(networkFirstStrategy(request));
});

// Network-first strategy with cache fallback
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses for API endpoints
    if (networkResponse.ok && shouldCache(request.url)) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If it's an API request that failed, return a custom offline response
    if (request.url.includes('/api/')) {
      return new Response(
        JSON.stringify({ 
          error: 'You are offline. Please check your internet connection.',
          offline: true 
        }),
        {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    throw error;
  }
}

// Cache-first strategy for static assets
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(STATIC_CACHE_NAME);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Failed to fetch static asset', request.url);
    throw error;
  }
}

// Navigation strategy - network-first with offline fallback
async function navigationStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Navigation failed, serving offline page');
    
    const offlineResponse = await caches.match('/offline.html');
    if (offlineResponse) {
      return offlineResponse;
    }
    
    // Fallback offline page if none cached
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>BingeBoard - Offline</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; text-align: center; padding: 50px; }
            .offline { color: #666; }
          </style>
        </head>
        <body>
          <div class="offline">
            <h1>You're offline</h1>
            <p>Please check your internet connection and try again.</p>
            <button onclick="window.location.reload()">Retry</button>
          </div>
        </body>
      </html>`,
      {
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

// Helper functions
function isStaticAsset(pathname) {
  // NEVER cache JS files - always fetch fresh to avoid stale bundle issues
  if (pathname.includes('.js')) {
    return false;
  }
  return pathname.includes('.css') || 
         pathname.includes('.png') || 
         pathname.includes('.jpg') || 
         pathname.includes('.svg') || 
         pathname.includes('.ico') ||
         pathname.includes('.woff');
}

function shouldCache(url) {
  return API_CACHE_PATTERNS.some(pattern => url.includes(pattern));
}

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});