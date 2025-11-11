/* Inert service worker — safely unregisters itself and clears caches.
   Purpose: stop stale/surprising cached bundles while we deploy a new site.
   This file intentionally does NOT intercept fetch requests or cache responses.
*/

self.addEventListener('install', (event) => {
  console.log('Inert SW: install — attempting to unregister');
  event.waitUntil((async () => {
    try {
      // Immediately unregister this service worker so it won't control new clients
      await self.registration.unregister();
      // Ensure waiting workers skipWaiting if any
      await self.skipWaiting();
      console.log('Inert SW: unregistered during install');
    } catch (e) {
      console.warn('Inert SW: unregister during install failed', e);
    }
  })());
});

self.addEventListener('activate', (event) => {
  console.log('Inert SW: activate — clearing caches and unregistering');
  event.waitUntil((async () => {
    try {
      // Clear all caches created by previous service workers
      if (self.caches) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
        console.log('Inert SW: cleared caches:', keys);
      }

      // Try to unregister again (best-effort)
      try { await self.registration.unregister(); } catch (e) { /* ignore */ }

      // Claim clients to allow pages to update their controlled worker state
      try { await self.clients.claim(); } catch (e) { /* ignore */ }
      console.log('Inert SW: activation complete');
    } catch (e) {
      console.warn('Inert SW: activation error', e);
    }
  })());
});

// Do not handle fetch events — let the browser perform normal network requests
// This keeps the service worker inert and avoids serving stale responses.
self.addEventListener('fetch', (event) => {
  // Intentionally no-op
});

// Support explicit remote unregistration via postMessage if needed
self.addEventListener('message', (event) => {
  if (event?.data === 'unregister') {
    console.log('Inert SW: received unregister message — attempting to unregister');
    self.registration.unregister().then(() => {
      console.log('Inert SW: unregistered via message');
    }).catch((e) => console.warn('Inert SW: message-driven unregister failed', e));
  }
});
