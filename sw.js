// Minimal service worker: makes the dashboard installable as an app and keeps the page
// shell available when the connection blips. Data and video are never cached here.
const SHELL = "leonida-shell-v2";
const FILES = ["./", "index.html", "config.js", "manifest.webmanifest", "icon-192.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(SHELL).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== SHELL).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;      // database, storage, fonts: straight to the network
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(SHELL).then(c => c.put(e.request, copy)); return r; })
    .catch(() => caches.match(e.request).then(hit => hit || caches.match("index.html"))));
});
