/**
 * Service Worker Disabled Stub
 * This stub purposefully does nothing except immediately clear any old caches
 * and unregister itself if it ever gets executed (legacy registrations).
 *
 * Short-term strategy: fully disable offline caching to eliminate stale asset issues.
 * Future strategy: introduce versioned SW with explicit asset manifest + soft rollout.
 */

// eslint-disable-next-line no-restricted-globals
self.addEventListener('install', (event) => {
  // Skip waiting so we can promptly activate and self-destruct
  // eslint-disable-next-line no-restricted-globals
  event.waitUntil(self.skipWaiting());
});

// eslint-disable-next-line no-restricted-globals
self.addEventListener('activate', (event) => {
  // Clear all caches and then unregister
  // eslint-disable-next-line no-restricted-globals
  event.waitUntil((async () => {
    try {
      const names = await caches.keys();
      await Promise.all(names.map(n => caches.delete(n)));
      // eslint-disable-next-line no-console
      console.log('[SW-disabled] Cleared', names.length, 'cache buckets');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[SW-disabled] Cache clear failed', e);
    }
    try {
      // eslint-disable-next-line no-restricted-globals
      const regs = await self.registration.unregister();
      // eslint-disable-next-line no-console
      console.log('[SW-disabled] Unregistered self:', regs);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[SW-disabled] Unregister failed', e);
    }
    // Take control of clients to ensure no old SW remains
    // eslint-disable-next-line no-restricted-globals
    await self.clients.claim();
  })());
});

// No fetch handlers intentionally.
