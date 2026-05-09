// public/sw.js

const CACHE_NAME = 'VAULT_CACHE_V1';
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  // On ne peut pas mettre tous les assets JS/CSS ici car ils sont générés dynamiquement par Next.js (hash)
  // Ils seront mis en cache lors du premier fetch via la stratégie cache-first
];

// Installation : Mise en cache des assets statiques de base
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activation : Nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch : Stratégie hybride
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Stratégie pour les assets statiques (fonts, images, scripts, styles)
  // On détecte les extensions ou le dossier _next/static
  if (
    request.destination === 'font' ||
    request.destination === 'image' ||
    request.destination === 'script' ||
    request.destination === 'style' ||
    url.pathname.startsWith('/_next/static')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        
        return fetch(request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // Stratégie Network-first pour les routes Next.js et API Supabase
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        // Optionnel : on pourrait mettre en cache les pages pour le offline
        return networkResponse;
      })
      .catch(() => {
        // En cas d'échec réseau (offline)
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          
          // Si c'est une navigation (page HTML), on affiche la page offline
          if (request.mode === 'navigate') {
            return caches.match('/offline');
          }
        });
      })
  );
});
