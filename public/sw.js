const STATIC_CACHE = "rateio-contas-static-v1";
const STATIC_ASSETS = [
  "/",
  "/manifest.webmanifest",
  "/pwa/icon-192",
  "/pwa/icon-512",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .catch(() => undefined),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(request.url);

  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match("/").then((response) => response),
      ),
    );
    return;
  }

  if (
    requestUrl.pathname.startsWith("/pwa/") ||
    requestUrl.pathname === "/manifest.webmanifest"
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((response) => {
          const clonedResponse = response.clone();

          void caches
            .open(STATIC_CACHE)
            .then((cache) => cache.put(request, clonedResponse));

          return response;
        });
      }),
    );
  }
});
