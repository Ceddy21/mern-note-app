// frontend/public/service-worker.js
const CACHE_NAME = 'nota-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Cache opened');
        // Cache each URL individually, ignore failures
        const cachePromises = urlsToCache.map(async (url) => {
          try {
            const response = await fetch(url);
            if (response.ok) {
              await cache.put(url, response);
              console.log(`✅ Cached: ${url}`);
            } else {
              console.warn(`⚠️ Failed to cache ${url}: status ${response.status}`);
            }
          } catch (err) {
            console.warn(`❌ Failed to cache ${url}:`, err);
          }
        });
        return Promise.all(cachePromises);
      })
      .then(() => {
        console.log('✅ All cache attempts complete');
        // Force the waiting service worker to become active
        return self.skipWaiting();
      })
      .catch((err) => {
        console.error('❌ Cache open failed:', err);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log(`🗑️ Deleting old cache: ${name}`);
            return caches.delete(name);
          }
        })
      );
    }).then(() => {
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        // For non-cached requests, try to fetch and cache dynamically
        return fetch(event.request).catch(() => {
          // Fallback to offline page if needed (optional)
        });
      })
  );
});