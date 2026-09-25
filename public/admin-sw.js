// Minimal service worker, scoped to /admin/, needed only to satisfy PWA
// installability criteria. Intentionally does not cache anything: admin
// data is dynamic and must never be served stale.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
