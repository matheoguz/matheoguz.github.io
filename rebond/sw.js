// Service worker : rend Rebond installable et affiche l'interface même avec un réseau faible.
// Ne met jamais en cache les appels à Supabase ou Stripe (autres domaines) : les données restent toujours fraîches.
const CACHE = "rebond-v1";
const SHELL = ["./", "index.html", "config.js", "assets/styles.css", "assets/app.js", "assets/consent.js", "manifest.webmanifest",
  "assets/fonts.css", "assets/vendor/supabase.js", "assets/icons/icon-192.png", "assets/icons/icon-512.png", "assets/icons/favicon.svg"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;
  if (req.mode === "navigate") {
    // Pages : réseau d'abord, copie locale si hors ligne.
    e.respondWith(fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; })
      .catch(() => caches.match(req).then(r => r || caches.match("index.html"))));
    return;
  }
  // Fichiers : copie locale tout de suite, mise à jour en arrière-plan.
  e.respondWith(caches.match(req).then(cached => {
    const fresh = fetch(req).then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; }).catch(() => cached);
    return cached || fresh;
  }));
});
