/* eslint-disable no-restricted-globals */

const CACHE_VERSION = 'v2';
const CACHE_NAME = `emergency-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `emergency-runtime-${CACHE_VERSION}`;
const IMAGE_CACHE = `emergency-images-${CACHE_VERSION}`;
const API_CACHE = `emergency-api-${CACHE_VERSION}`;

// Cache expiry times (in milliseconds)
const CACHE_EXPIRY = {
  STATIC: 7 * 24 * 60 * 60 * 1000, // 7 days
  RUNTIME: 24 * 60 * 60 * 1000, // 1 day
  IMAGES: 30 * 24 * 60 * 60 * 1000, // 30 days
  API: 5 * 60 * 1000 // 5 minutes
};

// Resources to cache immediately on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json',
  '/offline.html',
  '/pwa-icons/icon-192x192.png',
  '/pwa-icons/icon-512x512.png'
];

// Helper: Add timestamp to cached responses
async function addTimestampToResponse(response) {
  const headers = new Headers(response.headers);
  headers.set('sw-cached-at', new Date().toISOString());
  
  const responseBlob = await response.blob();
  return new Response(responseBlob, {
    status: response.status,
    statusText: response.statusText,
    headers: headers
  });
}

// Helper: Check if cache is expired
function isCacheExpired(response, maxAge) {
  const cachedAt = response.headers.get('sw-cached-at');
  if (!cachedAt) return true;
  
  const age = Date.now() - new Date(cachedAt).getTime();
  return age > maxAge;
}

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[Service Worker] Precaching app shell');
      try {
        // Add URLs one by one to handle failures gracefully
        for (const url of PRECACHE_URLS) {
          try {
            const request = new Request(url, {cache: 'reload'});
            const response = await fetch(request);
            if (response.ok) {
              const timestampedResponse = await addTimestampToResponse(response);
              await cache.put(url, timestampedResponse);
            }
          } catch (err) {
            console.warn('[Service Worker] Failed to cache:', url, err);
          }
        }
      } catch (err) {
        console.error('[Service Worker] Precache failed:', err);
      }
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE, IMAGE_CACHE, API_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!currentCaches.includes(cacheName)) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - implement advanced caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle API requests (cross-origin and same-origin)
  if (request.url.includes('/api/')) {
    event.respondWith(handleAPIRequest(request));
    return;
  }

  // Handle OpenStreetMap tiles with aggressive caching
  if (url.hostname.includes('tile.openstreetmap.org')) {
    event.respondWith(handleMapTile(request));
    return;
  }

  // Skip other cross-origin requests except for fonts and common CDNs
  if (url.origin !== location.origin) {
    if (request.destination === 'font' || url.hostname.includes('googleapis.com') || url.hostname.includes('gstatic.com')) {
      event.respondWith(handleStaticAsset(request, IMAGE_CACHE));
    }
    return;
  }

  // Images - Cache first, fallback to network
  if (request.destination === 'image') {
    event.respondWith(handleImage(request));
    return;
  }

  // HTML pages - Network first, fallback to cache, then offline page
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(handleNavigation(request));
    return;
  }

  // CSS and JS - Cache first, fallback to network
  if (request.destination === 'script' || request.destination === 'style') {
    event.respondWith(handleStaticAsset(request, CACHE_NAME));
    return;
  }

  // Other requests - Stale while revalidate
  event.respondWith(handleStaleWhileRevalidate(request));
});

// Strategy: Network first for API with cache fallback and timeout
async function handleAPIRequest(request) {
  const cacheName = API_CACHE;
  
  try {
    // Try network with timeout
    const networkPromise = fetch(request);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Network timeout')), 5000)
    );
    
    const response = await Promise.race([networkPromise, timeoutPromise]);
    
    // Cache successful GET responses
    if (response.ok && request.method === 'GET') {
      const cache = await caches.open(cacheName);
      const timestampedResponse = await addTimestampToResponse(response.clone());
      cache.put(request, timestampedResponse);
    }
    
    return response;
  } catch (error) {
    console.log('[Service Worker] Network failed for API, checking cache:', error.message);
    
    // Try cache
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Check if cache is too old
      if (!isCacheExpired(cachedResponse, CACHE_EXPIRY.API)) {
        console.log('[Service Worker] Serving cached API response');
        return cachedResponse;
      } else {
        console.log('[Service Worker] Cached API response expired');
      }
    }
    
    // Return offline error response
    return new Response(
      JSON.stringify({ 
        error: 'Offline',
        message: 'Unable to fetch data. Please check your internet connection.',
        cached: false
      }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}

// Strategy: Cache first for images with network fallback
async function handleImage(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse && !isCacheExpired(cachedResponse, CACHE_EXPIRY.IMAGES)) {
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const timestampedResponse = await addTimestampToResponse(response.clone());
      cache.put(request, timestampedResponse);
    }
    return response;
  } catch (error) {
    // Return cached version even if expired
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return placeholder image
    return new Response(
      '<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect fill="#f3f4f6" width="400" height="300"/><text x="50%" y="50%" text-anchor="middle" fill="#9ca3af" font-family="Arial" font-size="16">Image Unavailable</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
}

// Strategy: Cache first for map tiles with long expiry
async function handleMapTile(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cachedResponse = await cache.match(request);
  
  // Map tiles rarely change, so use cached version if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const timestampedResponse = await addTimestampToResponse(response.clone());
      cache.put(request, timestampedResponse);
    }
    return response;
  } catch (error) {
    // Return placeholder tile
    const canvas = '<svg width="256" height="256" xmlns="http://www.w3.org/2000/svg"><rect fill="#f3f4f6" width="256" height="256"/><text x="128" y="128" text-anchor="middle" fill="#9ca3af" font-family="Arial" font-size="14">Tile Unavailable</text></svg>';
    return new Response(canvas, { headers: { 'Content-Type': 'image/svg+xml' } });
  }
}

// Strategy: Network first for navigation with cache and offline fallback
async function handleNavigation(request) {
  try {
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      const timestampedResponse = await addTimestampToResponse(response.clone());
      cache.put(request, timestampedResponse);
    }
    
    return response;
  } catch (error) {
    console.log('[Service Worker] Network failed for navigation, checking cache');
    
    // Try cache
    const cache = await caches.open(RUNTIME_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Try cached root
    const rootResponse = await cache.match('/');
    if (rootResponse) {
      return rootResponse;
    }
    
    // Return offline page
    return caches.match('/offline.html');
  }
}

// Strategy: Cache first for static assets
async function handleStaticAsset(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse && !isCacheExpired(cachedResponse, CACHE_EXPIRY.STATIC)) {
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const timestampedResponse = await addTimestampToResponse(response.clone());
      cache.put(request, timestampedResponse);
    }
    return response;
  } catch (error) {
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Strategy: Stale while revalidate
async function handleStaleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then(async (response) => {
    if (response.ok) {
      const timestampedResponse = await addTimestampToResponse(response.clone());
      cache.put(request, timestampedResponse);
    }
    return response;
  }).catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

// Background sync for offline incident reports
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  if (event.tag === 'sync-incidents') {
    event.waitUntil(
      syncIncidents()
    );
  }
});

function syncIncidents() {
  // Get pending incidents from IndexedDB and sync with server
  return self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_INCIDENTS',
        message: 'Syncing offline incident reports...'
      });
    });
  });
}

// Push notifications - Enhanced
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received');
  let data = { 
    title: 'Emergency Alert', 
    body: 'New emergency notification',
    icon: '/pwa-icons/icon-192x192.png',
    data: {}
  };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error('[Service Worker] Failed to parse push data:', e);
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/pwa-icons/icon-192x192.png',
    badge: '/pwa-icons/icon-72x72.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: data.data?.notification_id || 'emergency-alert',
    requireInteraction: data.data?.requireInteraction !== false,
    data: data.data || {},
    actions: [
      { action: 'view', title: 'View Details' },
      { action: 'close', title: 'Dismiss' }
    ],
    timestamp: data.timestamp ? new Date(data.timestamp).getTime() : Date.now()
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event.action);
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handler for communication with main app
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});
