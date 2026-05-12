const CACHE_NAME = 'fta-tax-shell-v1';
const APP_SHELL = ['/', '/index.html', '/offline.html', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.pathname.startsWith('/api') || url.pathname.includes('tax') || req.headers.get('accept')?.includes('application/json')) {
    return;
  }

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match(req).then((res) => res || caches.match('/offline.html')))
    );
    return;
  }

  event.respondWith(caches.match(req).then((res) => res || fetch(req).then((networkRes) => {
    if (networkRes.ok && (req.destination === 'script' || req.destination === 'style' || req.destination === 'image' || req.destination === 'font')) {
      const clone = networkRes.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
    }
    return networkRes;
  })));
});
