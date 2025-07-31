// Smart Service Worker with Version Control
// This ensures users get updates while still benefiting from caching

const CACHE_VERSION = 'bridge-modes-v2025-01-31-001'; // Update this for each release
const STATIC_CACHE = CACHE_VERSION + '-static';
const DYNAMIC_CACHE = CACHE_VERSION + '-dynamic';

// Files that should always be cached
const STATIC_FILES = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/license.js'
];

// Files that should be checked for updates frequently
const DYNAMIC_FILES = [
    '/app.js',
    '/license.js'
];

self.addEventListener('install', event => {
    console.log('🔧 Service Worker installing version:', CACHE_VERSION);
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('📦 Caching static assets');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('✅ Static assets cached');
                // Force immediate activation of new service worker
                return self.skipWaiting();
            })
    );
});

self.addEventListener('activate', event => {
    console.log('🔄 Service Worker activating version:', CACHE_VERSION);
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        // Delete old caches when version changes
                        if (cacheName.startsWith('bridge-modes-v') && cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('🗑️ Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker activated');
                // Take control of all pages immediately
                return self.clients.claim();
            })
    );
});

self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Only handle requests to your domain
    if (url.origin !== location.origin) {
        return;
    }
    
    // Check if this is a dynamic file that should be updated frequently
    const isDynamicFile = DYNAMIC_FILES.some(file => url.pathname.endsWith(file));
    
    if (isDynamicFile) {
        // For dynamic files: Network first, then cache
        event.respondWith(
            fetch(request)
                .then(response => {
                    // If network fetch succeeds, update cache and return response
                    if (response.ok) {
                        const responseClone = response.clone();
                        caches.open(DYNAMIC_CACHE)
                            .then(cache => cache.put(request, responseClone));
                    }
                    return response;
                })
                .catch(() => {
                    // If network fails, try cache
                    return caches.match(request);
                })
        );
    } else {
        // For static files: Cache first, then network
        event.respondWith(
            caches.match(request)
                .then(response => {
                    if (response) {
                        return response;
                    }
                    return fetch(request)
                        .then(response => {
                            if (response.ok) {
                                const responseClone = response.clone();
                                caches.open(STATIC_CACHE)
                                    .then(cache => cache.put(request, responseClone));
                            }
                            return response;
                        });
                })
        );
    }
});

// Listen for messages from the main app
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('🔄 Received skip waiting message');
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({
            type: 'VERSION_INFO',
            version: CACHE_VERSION
        });
    }
});

// Notify app when there's an update available
self.addEventListener('controllerchange', () => {
    console.log('🔄 Controller changed - new version active');
});

console.log('🚀 Bridge Modes Service Worker loaded - Version:', CACHE_VERSION);