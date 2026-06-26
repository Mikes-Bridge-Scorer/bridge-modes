// Bridge Modes Calculator - COMPLETE Offline Service Worker
// Version: 2025-02-13-TABLE-CARDS - All files included for cruise use
// This caches EVERYTHING needed for 100% offline operation
const CACHE_VERSION = 'bridge-modes-v2026-06-14f-2x3 fix17';
const STATIC_CACHE = CACHE_VERSION + '-static';
const DYNAMIC_CACHE = CACHE_VERSION + '-dynamic';

// COMPLETE LIST: Every file your app needs to work offline
const STATIC_FILES = [
    // Core app files
    './',
    './index.html',
    './manifest.json',
    './styles.css',
    './favicon.ico',
    
    // Main JavaScript files (root level)
    './app.js',
    './license.js',
    './update-manager.js',
    './duplicateTemplates.js',
    
    // Bridge mode modules (in js/bridge-modes/ folder)
    './js/bridge-modes/base-mode.js',
    './js/bridge-modes/kitchen.js',
    './js/bridge-modes/bonus.js',
    './js/bridge-modes/chicago.js',
    './js/bridge-modes/rubber.js',
    './js/bridge-modes/duplicate.js',
    './js/bridge-modes/scoring.js',
    './js/bridge-modes/ui-controller.js',
    './js/bridge-modes/game-state.js',
    './js/bridge-modes/enhanced-movements.js',
    './js/bridge-modes/table-card-generator.js',
    './js/bridge-modes/session-recovery.js',
    './js/bridge-modes/progress-indicator.js'
];

// Optional files (won't fail if missing)
const OPTIONAL_FILES = [
    './assets/icon-192.png',
    './assets/icon-512.png'
];

// Files that should check for updates when online
const DYNAMIC_FILES = [
    './app.js',
    './license.js',
    './update-manager.js',
    './duplicateTemplates.js',
    './js/bridge-modes/base-mode.js',
    './js/bridge-modes/kitchen.js',
    './js/bridge-modes/bonus.js',
    './js/bridge-modes/chicago.js',
    './js/bridge-modes/rubber.js',
    './js/bridge-modes/duplicate.js',
    './js/bridge-modes/scoring.js',
    './js/bridge-modes/ui-controller.js',
    './js/bridge-modes/game-state.js',
    './js/bridge-modes/enhanced-movements.js',
    './js/bridge-modes/table-card-generator.js',
    './js/bridge-modes/session-recovery.js',
    './js/bridge-modes/progress-indicator.js'
];

// Install event - cache all files for offline use
self.addEventListener('install', event => {
    console.log('🔧 Service Worker installing:', CACHE_VERSION);
    console.log('📦 Will cache', STATIC_FILES.length, 'required files');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('📦 Caching required files...');
                
                return Promise.all(
                    STATIC_FILES.map(file => 
                        cache.add(file)
                            .then(() => {
                                console.log('  ✅', file);
                                return true;
                            })
                            .catch(err => {
                                console.error('  ❌ FAILED:', file, err.message);
                                throw new Error(`Required file missing: ${file}`);
                            })
                    )
                )
                .then(() => {
                    console.log('✅ All required files cached!');
                    console.log('📦 Caching optional files...');
                    return Promise.allSettled(
                        OPTIONAL_FILES.map(file =>
                            cache.add(file)
                                .then(() => console.log('  ✅ Optional:', file))
                                .catch(() => console.log('  ⚠️  Optional file not found:', file))
                        )
                    );
                });
            })
            .then(() => {
                console.log('🚀 Service Worker installation complete');
                console.log('📡 App ready for offline use');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('❌ Installation FAILED:', error);
                console.error('⚠️  App will NOT work offline!');
                throw error;
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('🔄 Service Worker activating:', CACHE_VERSION);
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                const deletePromises = cacheNames
                    .filter(cacheName => 
                        cacheName.startsWith('bridge-modes-v') && 
                        cacheName !== STATIC_CACHE && 
                        cacheName !== DYNAMIC_CACHE
                    )
                    .map(cacheName => {
                        console.log('🗑️  Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    });
                
                return Promise.all(deletePromises);
            })
            .then(() => {
                console.log('✅ Old caches cleaned up');
                console.log('🌐 Taking control of all pages...');
                return self.clients.claim();
            })
            .then(() => {
                console.log('✅ Service Worker active and in control');
                console.log('🎉 App fully offline-capable!');
            })
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Only handle same-origin requests
    if (url.origin !== location.origin) {
        return;
    }
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // ── DOWNLOADS FOLDER: always fetch fresh from network, never cache ──
    // These are standalone HTML files served to website visitors and must
    // not be intercepted by the service worker.
    if (url.pathname.includes('/downloads/')) {
        event.respondWith(fetch(request));
        return;
    }
    
    // Clean up the pathname for matching
    let pathname = url.pathname;
    
    // Check if this is a dynamic file (JavaScript that might update)
    const isDynamicFile = DYNAMIC_FILES.some(file => {
        const cleanFile = file.replace('./', '');
        return pathname.endsWith(cleanFile) || pathname.includes(cleanFile);
    });
    
    if (isDynamicFile) {
        // NETWORK FIRST for JavaScript files
        event.respondWith(
            fetch(request)
                .then(response => {
                    if (response && response.ok) {
                        console.log('🌐 Fresh from network:', pathname);
                        const responseClone = response.clone();
                        caches.open(DYNAMIC_CACHE)
                            .then(cache => cache.put(request, responseClone))
                            .catch(err => console.log('Cache update failed:', err));
                    }
                    return response;
                })
                .catch(error => {
                    console.log('📡 OFFLINE - serving from cache:', pathname);
                    return caches.match(request)
                        .then(response => {
                            if (response) {
                                console.log('💾 Cache hit:', pathname);
                                return response;
                            }
                            
                            const urlWithoutQuery = new URL(request.url);
                            urlWithoutQuery.search = '';
                            
                            return caches.match(urlWithoutQuery.toString())
                                .then(response => {
                                    if (response) {
                                        console.log('💾 Cache hit (no query):', pathname);
                                        return response;
                                    }
                                    console.error('❌ File not in cache:', pathname);
                                    throw error;
                                });
                        });
                })
        );
    } else {
        // CACHE FIRST for static files (HTML, CSS, images)
        event.respondWith(
            caches.match(request)
                .then(response => {
                    if (response) {
                        console.log('⚡ Cache hit:', pathname);
                        return response;
                    }
                    
                    console.log('🌐 Fetching from network:', pathname);
                    return fetch(request)
                        .then(response => {
                            if (response && response.ok) {
                                const responseClone = response.clone();
                                caches.open(STATIC_CACHE)
                                    .then(cache => cache.put(request, responseClone))
                                    .catch(err => console.log('Cache put failed:', err));
                            }
                            return response;
                        })
                        .catch(error => {
                            console.error('❌ Fetch failed:', pathname, error.message);
                            return new Response('Offline - file not cached', {
                                status: 503,
                                statusText: 'Service Unavailable',
                                headers: { 'Content-Type': 'text/plain' }
                            });
                        });
                })
        );
    }
});

// Handle messages from the app
self.addEventListener('message', event => {
    const data = event.data;
    
    if (data && data.type === 'SKIP_WAITING') {
        console.log('🔄 Skip waiting - activating new version now');
        self.skipWaiting();
    }
    
    if (data && data.type === 'GET_VERSION') {
        console.log('📋 Version info requested');
        event.ports[0].postMessage({
            type: 'VERSION_INFO',
            version: CACHE_VERSION,
            filesCached: STATIC_FILES.length
        });
    }
    
    if (data && data.type === 'CHECK_CACHED_FILES') {
        console.log('📋 Checking cached files...');
        caches.open(STATIC_CACHE)
            .then(cache => cache.keys())
            .then(requests => {
                const cachedUrls = requests.map(req => req.url);
                console.log('📦 Cached files:', cachedUrls.length);
                event.ports[0].postMessage({
                    type: 'CACHED_FILES',
                    files: cachedUrls,
                    count: cachedUrls.length
                });
            })
            .catch(error => {
                console.error('Error checking cache:', error);
            });
    }
    
    if (data && data.type === 'CLEAR_CACHE') {
        console.log('🗑️  Clearing all caches...');
        event.waitUntil(
            caches.keys()
                .then(cacheNames => {
                    return Promise.all(
                        cacheNames.map(cacheName => {
                            console.log('🗑️  Deleting:', cacheName);
                            return caches.delete(cacheName);
                        })
                    );
                })
                .then(() => {
                    console.log('✅ All caches cleared');
                    if (event.ports && event.ports[0]) {
                        event.ports[0].postMessage({ type: 'CACHE_CLEARED' });
                    }
                })
        );
    }
});

// Service worker activated
console.log('🚀 Bridge Modes Service Worker loaded');
console.log('📦 Version:', CACHE_VERSION);
console.log('📁 Will cache', STATIC_FILES.length, 'required files');
console.log('📁 Plus', OPTIONAL_FILES.length, 'optional files');
console.log('✅ Ready for cruise-ready offline operation!');
