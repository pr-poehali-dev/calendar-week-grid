const CACHE_NAME = 'calendar-v11';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

const NETWORK_FIRST_URLS = [
  '/src/main.tsx',
  '/src/App.tsx'
];

const API_CACHE_NAME = 'api-cache-v1';
const API_URLS = [
  'https://functions.poehali.dev/992d8e44-58a4-4f61-badd-a38834435786',
  'https://functions.poehali.dev/3e1fb086-3bcf-4adf-a785-54c8948d0b0d'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const isApiRequest = API_URLS.some(url => event.request.url.startsWith(url));
  
  if (isApiRequest) {
    event.respondWith(
      caches.open(API_CACHE_NAME).then(cache => {
        return cache.match(event.request).then(cachedResponse => {
          const fetchPromise = fetch(event.request).then(networkResponse => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => cachedResponse);
          
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  const isNetworkFirst = NETWORK_FIRST_URLS.some(url => event.request.url.includes(url));
  
  if (isNetworkFirst) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  if (event.request.url.includes('manifest.json') || 
      event.request.url.includes('favicon') ||
      event.request.url.includes('.jpg') ||
      event.request.url.includes('.png') ||
      event.request.url.includes('.js') ||
      event.request.url.includes('.css') ||
      event.request.url.includes('.woff') ||
      event.request.url.includes('.woff2')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          fetch(event.request).then((response) => {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, response);
            });
          }).catch(() => {});
          return cachedResponse;
        }
        return fetch(event.request).then((response) => {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        }).catch(() => cachedResponse);
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          return response;
        });
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }).then(() => {
        return self.clients.matchAll();
      }).then((clients) => {
        clients.forEach(client => client.postMessage({ type: 'CACHE_CLEARED' }));
      })
    );
  }
});