const CACHE_NAME = 'kazuki-cache-v1.0.3';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/images/icon-192.png',
  '/assets/images/icon-512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // Không cache file sw.js và các file từ catbox/media
  if (url.pathname.includes('sw.js') || url.hostname.includes('files.catbox.moe')) return;
  if (
    request.destination === 'image' ||
    request.destination === 'audio' ||
    request.destination === 'video'
  ) return;

  // Network-first for navigations (HTML)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // For scripts/styles/fonts, prefer network-first to get latest assets
  const networkFirstFor = ['script', 'style', 'font'];
  if (networkFirstFor.includes(request.destination) || /\.(js|css|json)$/.test(url.pathname)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Default: cache-first, then network (for images/audio/video we skip caching earlier)
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(() =>
          new Response('Offline', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
          })
        );
    })
  );
});
