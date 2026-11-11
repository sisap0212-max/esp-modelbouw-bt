// Bewaart de bedienpagina en de software op de telefoon, zodat alles ook zonder internet werkt.
// Met internet wordt altijd eerst de nieuwste versie gehaald.
const KAST = 'billboard-v1';
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const k = await caches.open(KAST);
    await k.addAll(['./', 'bluetooth.html', 'manifest.webmanifest', 'versies.json']).catch(() => {});
    try {   // de nieuwste software per bordje alvast bewaren
      const l = await (await fetch('versies.json', { cache: 'no-store' })).json();
      const best = [];
      for (const b of Object.values(l)) if (b && b.versies && b.versies.length) best.push(b.versies[0].bestand);
      await k.addAll(best);
    } catch (e) {}
    self.skipWaiting();
  })());
});
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith((async () => {
    const k = await caches.open(KAST);
    try {
      const r = await fetch(e.request);
      if (r.ok) k.put(e.request, r.clone());
      return r;
    } catch (x) {
      const c = await k.match(e.request, { ignoreSearch: true });
      if (c) return c;
      throw x;
    }
  })());
});
