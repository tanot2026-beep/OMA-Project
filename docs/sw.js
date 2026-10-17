// Service worker — makes the app installable (PWA) and caches the app shell.
// Phase 1: static files (styles.css, script.js, icons, CDN libraries, fonts) are served from
// cache first and refreshed in the background, so repeat visits open much faster.
// The HTML page itself is network-first (so a new deployment shows up immediately).
// API calls (/api/*) and non-GET requests are never cached.
// Bump CACHE_VERSION when you want every device to drop its old cached files.
const CACHE_VERSION = 'v2';
const CACHE = 'oma-shell-' + CACHE_VERSION;
const CDN_HOSTS = ['cdnjs.cloudflare.com', 'cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('oma-shell-') && k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin && url.pathname.startsWith('/api/')) return;
  if (url.origin !== location.origin && CDN_HOSTS.indexOf(url.hostname) === -1) return;

  // HTML: network first, fall back to cache when offline
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const res = await fetch(req);
        if (res && res.ok) { const c = await caches.open(CACHE); c.put(req, res.clone()); }
        return res;
      } catch (e) {
        const hit = await caches.match(req) || await caches.match('/') || await caches.match('index.html');
        return hit || Response.error();
      }
    })());
    return;
  }

  // Static files: cache first, refresh in the background
  event.respondWith((async () => {
    const c = await caches.open(CACHE);
    const hit = await c.match(req);
    const refresh = fetch(req).then(res => {
      if (res && (res.ok || res.type === 'opaque')) c.put(req, res.clone());
      return res;
    }).catch(() => hit || Response.error());
    return hit || refresh;
  })());
});
