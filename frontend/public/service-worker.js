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
      return self.clients.claim();
    })
  );
});

// ─── FIXED FETCH HANDLER – Skip API & non-GET requests ───
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip API requests, non-GET methods, and external URLs
  if (
    url.pathname.startsWith('/api/') ||
    event.request.method !== 'GET' ||
    url.origin !== self.location.origin
  ) {
    // Let the browser handle these normally
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
      .catch(() => {
        // For navigation requests, show a simple offline page
        if (event.request.mode === 'navigate') {
          return new Response('You are offline. Please check your internet connection.', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain' },
          });
        }
        // For other failed requests, just return a generic 503
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      })
  );
});