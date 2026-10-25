const CACHE_NAME = 'merch-cashier-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/data.js',
  '/storage.js',
  '/app.js',
  '/manifest.json',
  'icons/icon-192.svg',
  'icons/icon-512.svg',
  'icons/favicon-96x96.png',
  'icons/favicon.ico',
  'icons/apple-touch-icon.png',
  // Postcards
  'products/postcards/scanty.png',
  'products/postcards/kneesocks.png',
  'products/postcards/stocking.png',
  'products/postcards/panty.png',
  'products/postcards/bocci_gorilla.png',
  'products/postcards/miku_hmo.png',
  'products/postcards/miku_ufo.png',
  'products/postcards//miku_calne_ca.png',
  'products/postcards//sonico_horiz.png',
  'products/postcards//sonico_vert.png',
  // Keychain
  'products/keychain/yotsuba.png',
  // Badges
  'products/badges/bocci.png',
  'products/badges/mew.png',
  'products/badges/slowpoke.png',
  'products/badges/meowth.png',
  // Posters
  'products/posters/miku_calne_ca.png',
  'products/posters/sonico_horiz.png',
  'products/posters/sonico_vert.png',
  'products/posters/bocci.png',
  // Stickers
  'products/stickers/miku_paint.png',
  'products/stickers/scanty.png',
  'products/stickers/kneesocks.png',
  'products/stickers/stocking.png',
  'products/stickers/panty.png',
  // Sticker packs
  'products/stickerpacks/miku_hmo_ufo.png',
  'products/stickerpacks/bocci.png',
  'products/stickerpacks/sonico.png',
  'products/stickerpacks/miku_calne_ca.png',
  'products/stickerpacks/sanrio.png',
  'products/stickerpacks/pokemon.png',
  // Swapcards
  'products/swapcards/hippie.png',
  'products/swapcards/emo.png',
  'products/swapcards/rap.png',
  'products/swapcards/punk.png',
  'products/swapcards/goth.png',
  // Free stuff
  'products/free_stuff/hippie.png',
  'products/free_stuff/emo.png',
  'products/free_stuff/rap.png',
  'products/free_stuff/punk.png',
  'products/free_stuff/goth.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(ASSETS.map(async url => {
        try {
          const response = await fetch(url);
          if (response.ok) {
            await cache.put(url, response);
          }
        } catch (e) {
          // Файл недоступен — пропускаем (например, при открытии через file://)
        }
      }))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Кэшируем только GET-запросы
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
