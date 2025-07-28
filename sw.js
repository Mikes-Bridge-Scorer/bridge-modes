/**
 * Bridge Modes Calculator - Service Worker
 * Fixed Response cloning issues for PWA functionality
 */

const CACHE_NAME = 'bridge-modes-v1.2.0';
const STATIC_CACHE_NAME = 'bridge-modes-static-v1.2.0';

// Files to cache immediately on install
const STATIC_ASSETS = [
    './',
    './index.html',
    './app.js',
    './styles.css',
    './manifest.json'
];

// Files that can be cached on demand
const DYNAMIC_ASSETS = [
    './js/bridge-modes/base-mode.js',
    './js/bridge-modes/kitchen.js',
    './js/bridge-modes/bonus.js',
    './js/bridge-modes/chicago.js',
    './js/bridge-modes/rubber.js',
    './js/bridge-modes/duplicate.js'
];

self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then((cache) => {
                console.log('📦 Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('✅ Static assets cached');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Failed to cache static assets:', error);
            })
    );
});

self.addEventListener('activate', (event) => {
    console.log('🔄 Service Worker activating...');
    
    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
                            console.log('🗑️ Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // Take control of all clients
            self.clients.claim()
        ]).then(() => {
            console.log('✅ Service Worker activated');
        })
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return;
    }
    
    // Handle different types of requests
    if (STATIC_ASSETS.some(asset => url.pathname.endsWith(asset.replace('./', '')))) {
        // Static assets - Cache first strategy
        event.respondWith(handleStaticAssets(request));
    } else if (DYNAMIC_ASSETS.some(asset => url.pathname.endsWith(asset.replace('./', '')))) {
        // Dynamic assets - Stale while revalidate
        event.respondWith(handleDynamicAssets(request));
    } else if (url.pathname === '/' || url.pathname.endsWith('.html')) {
        // HTML files - Network first with cache fallback
        event.respondWith(handleHtmlRequests(request));
    } else {
        // Everything else - Network first
        event.respondWith(handleOtherRequests(request));
    }
});

async function handleStaticAssets(request) {
    try {
        // Try cache first
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            console.log('📦 Serving from cache:', request.url);
            return cachedResponse;
        }
        
        // If not in cache, fetch and cache
        console.log('🌐 Fetching and caching:', request.url);
        const response = await fetch(request);
        
        if (response.ok) {
            const cache = await caches.open(STATIC_CACHE_NAME);
            // Clone before caching
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        console.error('❌ Static asset error:', error);
        return new Response('Asset not available', { status: 404 });
    }
}

async function handleDynamicAssets(request) {
    try {
        const cache = await caches.open(CACHE_NAME);
        
        // Try to get from cache first
        const cachedResponse = await cache.match(request);
        
        // Start network request
        const networkPromise = fetch(request).then(async (response) => {
            if (response.ok) {
                console.log('🔄 Updating cache for:', request.url);
                // Clone before caching
                await cache.put(request, response.clone());
            }
            return response;
        }).catch((error) => {
            console.log('🌐 Network failed for:', request.url, error.message);
            return null;
        });
        
        // Return cache immediately if available, otherwise wait for network
        if (cachedResponse) {
            console.log('📦 Serving from cache (updating in background):', request.url);
            // Update cache in background
            networkPromise.catch(() => {}); // Ignore errors for background update
            return cachedResponse;
        } else {
            console.log('🌐 No cache, waiting for network:', request.url);
            const networkResponse = await networkPromise;
            
            if (networkResponse) {
                return networkResponse;
            } else {
                return new Response('Module not available', { status: 404 });
            }
        }
    } catch (error) {
        console.error('❌ Dynamic asset error:', error);
        return new Response('Module error', { status: 500 });
    }
}

async function handleHtmlRequests(request) {
    try {
        // Try network first
        const response = await fetch(request);
        
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            // Clone before caching
            cache.put(request, response.clone());
            return response;
        }
        
        throw new Error('Network response not ok');
    } catch (error) {
        console.log('🌐 Network failed, trying cache:', request.url);
        
        // Try cache as fallback
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline page or basic HTML
        return new Response(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Bridge Modes - Offline</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body>
                <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
                    <h1>🃏 Bridge Modes</h1>
                    <p>You appear to be offline. Please check your connection and try again.</p>
                    <button onclick="location.reload()">Try Again</button>
                </div>
            </body>
            </html>
        `, {
            headers: { 'Content-Type': 'text/html' }
        });
    }
}

async function handleOtherRequests(request) {
    try {
        return await fetch(request);
    } catch (error) {
        console.log('🌐 Request failed:', request.url, error.message);
        return new Response('Request failed', { status: 404 });
    }
}

// Handle service worker messages
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('⏭️ Skipping waiting...');
        self.skipWaiting();
    }
});

// Error handling for unhandled promise rejections
self.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Service Worker Unhandled Rejection:', event.reason);
    event.preventDefault();
});

console.log('🚀 Bridge Modes Service Worker loaded');