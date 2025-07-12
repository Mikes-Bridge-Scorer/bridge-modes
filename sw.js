// ===== BRIDGE MODES - SERVICE WORKER =====
// Provides offline functionality and caching for PWA

const CACHE_NAME = 'bridge-modes-v1.0.0';
const STATIC_CACHE = 'bridge-modes-static-v1';
const DYNAMIC_CACHE = 'bridge-modes-dynamic-v1';

// Files to cache for offline use
const STATIC_FILES = [
    './',
    './index.html',
    './manifest.json',
    './css/main.css',
    './css/calculator.css', 
    './css/themes.css',
    './css/responsive.css',
    './js/app.js',
    './js/ui-controller.js',
    './js/bridge-logic.js',
    './js/utils/wake-lock.js',
    './js/utils/storage.js'
];

// Dynamic cache patterns
const CACHE_PATTERNS = {
    fonts: /.*\.(woff|woff2|ttf|eot)$/,
    images: /.*\.(png|jpg|jpeg|svg|gif|webp)$/,
    scripts: /.*\.js$/,
    styles: /.*\.css$/
};

// ===== SERVICE WORKER EVENTS =====

// Install Event - Cache static files
self.addEventListener('install', event => {
    console.log('🔧 Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('🔧 Service Worker: Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('✅ Service Worker: Installation complete');
                return self.skipWaiting(); // Force activation
            })
            .catch(error => {
                console.error('❌ Service Worker: Installation failed', error);
            })
    );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', event => {
    console.log('🔧 Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName => {
                            // Delete old cache versions
                            return cacheName.startsWith('bridge-modes-') && 
                                   cacheName !== STATIC_CACHE && 
                                   cacheName !== DYNAMIC_CACHE;
                        })
                        .map(cacheName => {
                            console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => {
                console.log('✅ Service Worker: Activation complete');
                return self.clients.claim(); // Take control of all pages
            })
            .catch(error => {
                console.error('❌ Service Worker: Activation failed', error);
            })
    );
});

// Fetch Event - Handle network requests
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip cross-origin requests (unless specific patterns)
    if (url.origin !== location.origin) {
        return;
    }
    
    event.respondWith(handleFetch(request));
});

// ===== FETCH HANDLING STRATEGIES =====

async function handleFetch(request) {
    const url = new URL(request.url);
    
    try {
        // Strategy 1: Cache First (for static files)
        if (isStaticFile(url.pathname)) {
            return await cacheFirst(request);
        }
        
        // Strategy 2: Network First (for dynamic content)
        if (isDynamicContent(url.pathname)) {
            return await networkFirst(request);
        }
        
        // Strategy 3: Stale While Revalidate (for assets)
        if (isAsset(url.pathname)) {
            return await staleWhileRevalidate(request);
        }
        
        // Default: Network First
        return await networkFirst(request);
        
    } catch (error) {
        console.error('❌ Service Worker: Fetch failed', error);
        return await handleFetchError(request, error);
    }
}

// Cache First Strategy - Use cache, fallback to network
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        console.log('📦 Cache Hit:', request.url);
        return cachedResponse;
    }
    
    console.log('🌐 Cache Miss, fetching:', request.url);
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
        const cache = await caches.open(STATIC_CACHE);
        cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
}

// Network First Strategy - Try network, fallback to cache
async function networkFirst(request) {
    try {
        console.log('🌐 Network First:', request.url);
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
        
    } catch (error) {
        console.log('📦 Network failed, trying cache:', request.url);
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        throw error;
    }
}

// Stale While Revalidate - Return cache immediately, update in background
async function staleWhileRevalidate(request) {
    const cachedResponse = await caches.match(request);
    
    // Always try to update in background
    const networkUpdate = fetch(request)
        .then(response => {
            if (response.ok) {
                const cache = caches.open(DYNAMIC_CACHE);
                cache.then(c => c.put(request, response.clone()));
            }
            return response;
        })
        .catch(error => {
            console.warn('⚠️ Background update failed:', error);
        });
    
    // Return cached version immediately if available
    if (cachedResponse) {
        console.log('📦 Stale cache served:', request.url);
        return cachedResponse;
    }
    
    // Wait for network if no cache
    console.log('🌐 No cache, waiting for network:', request.url);
    return await networkUpdate;
}

// ===== ERROR HANDLING =====

async function handleFetchError(request, error) {
    const url = new URL(request.url);
    
    // Try to serve from cache as last resort
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        console.log('📦 Error fallback to cache:', request.url);
        return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
        const offlinePage = await caches.match('./index.html');
        if (offlinePage) {
            console.log('📱 Serving offline app');
            return offlinePage;
        }
    }
    
    // Create generic error response
    return new Response(
        JSON.stringify({
            error: 'Network error',
            message: 'Unable to fetch resource',
            offline: true
        }), 
        {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'application/json' }
        }
    );
}

// ===== UTILITY FUNCTIONS =====

function isStaticFile(pathname) {
    const staticPatterns = [
        /^\/$/, // Root
        /^\/index\.html$/,
        /^\/manifest\.json$/,
        /^\/css\/.*\.css$/,
        /^\/js\/.*\.js$/
    ];
    
    return staticPatterns.some(pattern => pattern.test(pathname));
}

function isDynamicContent(pathname) {
    const dynamicPatterns = [
        /^\/api\//,
        /^\/data\//,
        /\.json$/
    ];
    
    return dynamicPatterns.some(pattern => pattern.test(pathname));
}

function isAsset(pathname) {
    return Object.values(CACHE_PATTERNS).some(pattern => pattern.test(pathname));
}

// ===== BACKGROUND SYNC (Optional) =====

// Register for background sync when online
self.addEventListener('sync', event => {
    console.log('🔄 Background Sync:', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    try {
        // Sync any pending data when back online
        console.log('🔄 Performing background sync...');
        
        // Here you could sync game data, scores, etc.
        // For now, just update caches
        await updateCaches();
        
        // Notify clients that sync is complete
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'BACKGROUND_SYNC_COMPLETE',
                timestamp: new Date().toISOString()
            });
        });
        
        console.log('✅ Background sync complete');
        
    } catch (error) {
        console.error('❌ Background sync failed:', error);
    }
}

async function updateCaches() {
    try {
        const cache = await caches.open(STATIC_CACHE);
        
        // Update critical files
        const criticalFiles = [
            './index.html',
            './js/app.js',
            './css/main.css'
        ];
        
        for (const file of criticalFiles) {
            try {
                const response = await fetch(file);
                if (response.ok) {
                    await cache.put(file, response);
                    console.log('🔄 Updated cache:', file);
                }
            } catch (error) {
                console.warn('⚠️ Failed to update:', file, error);
            }
        }
        
    } catch (error) {
        console.error('❌ Cache update failed:', error);
    }
}

// ===== PUSH NOTIFICATIONS (Optional) =====

self.addEventListener('push', event => {
    console.log('📱 Push notification received');
    
    const options = {
        body: 'Bridge Modes has been updated!',
        icon: './assets/icons/icon-192x192.png',
        badge: './assets/icons/icon-72x72.png',
        tag: 'bridge-modes-update',
        requireInteraction: false,
        actions: [
            {
                action: 'open',
                title: 'Open App',
                icon: './assets/icons/icon-72x72.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Bridge Modes', options)
    );
});

self.addEventListener('notificationclick', event => {
    console.log('📱 Notification clicked');
    
    event.notification.close();
    
    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            clients.openWindow('./')
        );
    }
});

// ===== MESSAGE HANDLING =====

self.addEventListener('message', event => {
    console.log('📨 Message received:', event.data);
    
    const { type, data } = event.data;
    
    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'CACHE_UPDATE':
            event.waitUntil(updateCaches());
            break;
            
        case 'CLEAR_CACHE':
            event.waitUntil(clearCaches());
            break;
            
        case 'GET_CACHE_INFO':
            event.waitUntil(sendCacheInfo(event.source));
            break;
    }
});

async function clearCaches() {
    try {
        const cacheNames = await caches.keys();
        const bridgeCaches = cacheNames.filter(name => name.startsWith('bridge-modes-'));
        
        await Promise.all(
            bridgeCaches.map(cacheName => caches.delete(cacheName))
        );
        
        console.log('🗑️ All caches cleared');
        
    } catch (error) {
        console.error('❌ Cache clearing failed:', error);
    }
}

async function sendCacheInfo(client) {
    try {
        const cacheNames = await caches.keys();
        const bridgeCaches = cacheNames.filter(name => name.startsWith('bridge-modes-'));
        
        const cacheInfo = {};
        
        for (const cacheName of bridgeCaches) {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();
            cacheInfo[cacheName] = {
                size: keys.length,
                files: keys.map(req => req.url)
            };
        }
        
        client.postMessage({
            type: 'CACHE_INFO',
            data: cacheInfo
        });
        
    } catch (error) {
        console.error('❌ Getting cache info failed:', error);
    }
}

// ===== DEBUGGING =====

console.log('🚀 Bridge Modes Service Worker loaded');

// Global error handler
self.addEventListener('error', event => {
    console.error('❌ Service Worker Error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
    console.error('❌ Service Worker Unhandled Rejection:', event.reason);
});