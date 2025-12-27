const CACHE_NAME = 'migrenoznik-v1.0.0';

const urlsToCache = [
  '/',
  '/static/assets/style/main.css',
  '/static/assets/scripts/diary/main.js',
  '/static/assets/scripts/diary/pageload.js',
  '/static/assets/scripts/lib/browser.js',
  '/static/assets/scripts/lib/datetime.js',
  '/static/assets/images/icons/calendar.svg',
  '/static/manifest.json',
];

// В sw.js
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Installed');
        return self.skipWaiting(); // Принудительная активация
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  event.waitUntil(self.clients.claim()); // Немедленный контроль над страницами
});

// self.addEventListener('fetch', (event) => {
//   event.respondWith(
//     caches.match(event.request)
//       .then((response) => {
//         if (response) {
//           return response;
//         }
//         return fetch(event.request);
//       })
//   );
// });

self.addEventListener('fetch', (event) => {
  // Обрабатываем только GET-запросы и только к нашему домену
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Если есть в кэше - возвращаем
        if (response) {
          return response;
        }
        // Иначе загружаем из сети
        return fetch(event.request)
          .then(response => {
            // Можно опционально кэшировать новые ресурсы
            // Но для начала лучше отключить это
            return response;
          })
          .catch(() => {
            // Для HTML-запросов можно вернуть заглушку
            if (event.request.destination === 'document') {
              return caches.match('/');
            }
            return new Response('Оффлайн');
          });
      })
  );
});


self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});