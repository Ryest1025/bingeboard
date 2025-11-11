/* Inert service worker for BingeBoard (dist) — unregisters itself and clears caches.
   This prevents the old SW from serving stale assets while we roll out fixed bundles.
*/

self.addEventListener('install', (event) => {
  console.log('Inert SW (dist): install — attempting to unregister');
  event.waitUntil((async () => {
    try {
      await self.registration.unregister();
      await self.skipWaiting();
      console.log('Inert SW (dist): unregistered during install');
    } catch (e) {
      console.warn('Inert SW (dist): unregister during install failed', e);
    }
  })());
});

self.addEventListener('activate', (event) => {
  console.log('Inert SW (dist): activate — clearing caches and unregistering');
  event.waitUntil((async () => {
    try {
      if (self.caches) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
        console.log('Inert SW (dist): cleared caches:', keys);
      }
      try { await self.registration.unregister(); } catch (e) {}
      try { await self.clients.claim(); } catch (e) {}
    } catch (e) {
      console.warn('Inert SW (dist): activation error', e);
    }
  })());
});

// No fetch handling — allow normal network behavior
self.addEventListener('fetch', (event) => {
  // intentionally no-op
});

self.addEventListener('message', (event) => {
  if (event?.data === 'unregister') {
    self.registration.unregister().then(() => console.log('Inert SW (dist): unregistered via message')).catch(() => {});
  }
});