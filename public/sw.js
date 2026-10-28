/* Color My World service worker: offline shell, cached pages and immutable build assets. */
const VERSION = "cmw-v1";
const SHELL = ["/", "/play", "/gallery", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

function put(request, response) {
  if (response && response.ok && response.type === "basic") {
    const copy = response.clone();
    caches.open(VERSION).then((cache) => cache.put(request, copy));
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  // Pages: network first so updates arrive, cached copy (or home) when offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => put(request, response))
        .catch(() => caches.match(request).then((hit) => hit || caches.match("/")))
    );
    return;
  }

  // Hashed build output never changes: cache first.
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(caches.match(request).then((hit) => hit || fetch(request).then((response) => put(request, response))));
    return;
  }

  // Everything else (RSC payloads, images): stale-while-revalidate.
  event.respondWith(
    caches.match(request).then((hit) => {
      const network = fetch(request).then((response) => put(request, response)).catch(() => hit);
      return hit || network;
    })
  );
});
