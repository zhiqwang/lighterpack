const CACHE_NAME = 'lighterpack-v1';
const STATIC_ASSETS = [
    '/',
    '/dist/lighterpack.css',
    '/dist/lighterpack.js',
    '/dist/share.css',
    '/manifest.json',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // API requests: network-first
    if (url.pathname.startsWith('/signin') ||
        url.pathname.startsWith('/saveLibrary') ||
        url.pathname.startsWith('/register') ||
        url.pathname.startsWith('/externalId') ||
        url.pathname.startsWith('/imageUpload') ||
        url.pathname.startsWith('/account') ||
        url.pathname.startsWith('/forgotPassword') ||
        url.pathname.startsWith('/forgotUsername') ||
        url.pathname.startsWith('/delete-account') ||
        url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(event.request)
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Image requests: cache-first with network fallback
    if (url.hostname === 'i.imgur.com' ||
        url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)) {
        event.respondWith(
            caches.match(event.request).then((cached) => {
                if (cached) return cached;
                return fetch(event.request).then((response) => {
                    if (response && response.status === 200) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                    }
                    return response;
                }).catch(() => new Response('', { status: 404 }));
            })
        );
        return;
    }

    // Static assets & navigation: cache-first
    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) return cached;
            return fetch(event.request).then((response) => {
                if (response && response.status === 200 && response.type === 'basic') {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                }
                return response;
            });
        }).catch(() => caches.match('/'))
    );
});
