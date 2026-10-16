// Minimal service worker — makes the app installable as a PWA.
// No offline caching yet (phase 1); this can be extended later to cache
// the app shell (script.js/styles.css/icons) for offline use.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
