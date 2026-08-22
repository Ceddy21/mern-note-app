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

// ─── FETCH HANDLER – Skip API, Network-First for Navigation, Cache-First for Assets ───
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip API calls, non-GET methods, and external requests
  if (
    url.pathname.startsWith('/api/') ||
    event.request.method !== 'GET' ||
    url.origin !== self.location.origin
  ) {
    return; // Let the browser handle these normally
  }

  // ── For navigation (HTML pages) ──
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // Fallback to cached root (index.html) if network fails
          return caches.match('/');
        })
    );
    return;
  }

  // ── For assets (JS, CSS, images) – cache-first ──
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});