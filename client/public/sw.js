// YCORE Progressive Web App Service Worker
const CACHE_NAME = 'ycore-v1.0.0';
const STATIC_CACHE_NAME = 'ycore-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'ycore-dynamic-v1.0.0';

// Resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/auth',
  '/dashboard',
  '/manifest.json',
  // Core CSS and JS will be cached automatically by the network-first strategy
];

// API endpoints that should work offline with cached data
const OFFLINE_FALLBACK_DATA = {
  '/api/user': { 
    error: 'Offline mode - Please connect to internet for real-time data',
    offline: true 
  }
};

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('🚀 YCORE SW: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('📦 YCORE SW: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ YCORE SW: Static assets cached');
        return self.skipWaiting(); // Activate immediately
      })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  console.log('⚡ YCORE SW: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => 
              cacheName.startsWith('ycore-') && 
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE_NAME
            )
            .map(cacheName => {
              console.log('🗑️ YCORE SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('✅ YCORE SW: Activated and ready');
        return self.clients.claim(); // Take control immediately
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip Chrome extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Strategy for different types of requests
  if (url.pathname.startsWith('/api/')) {
    // API requests: Network first, cache fallback with offline data
    event.respondWith(networkFirstWithOfflineFallback(request));
  } else if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2)$/)) {
    // Static assets: Cache first
    event.respondWith(cacheFirst(request));
  } else {
    // Pages: Network first with cache fallback
    event.respondWith(networkFirst(request));
  }
});

// Network first strategy with offline fallback
async function networkFirstWithOfflineFallback(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🔄 YCORE SW: Network failed, trying cache...');
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline fallback data for API requests
    const url = new URL(request.url);
    const fallbackData = OFFLINE_FALLBACK_DATA[url.pathname];
    
    if (fallbackData) {
      return new Response(JSON.stringify(fallbackData), {
        status: 200,
        statusText: 'OK (Offline)',
        headers: {
          'Content-Type': 'application/json',
          'X-Offline-Response': 'true'
        }
      });
    }
    
    // Generic offline response
    return new Response('Offline - Please check your connection', {
      status: 503,
      statusText: 'Service Unavailable (Offline)'
    });
  }
}

// Cache first strategy
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('❌ YCORE SW: Failed to fetch:', request.url);
    throw error;
  }
}

// Network first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🔄 YCORE SW: Network failed for page, trying cache...');
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page fallback
    return caches.match('/');
  }
}

// Handle background sync
self.addEventListener('sync', event => {
  console.log('🔄 YCORE SW: Background sync triggered');
  
  if (event.tag === 'background-data-sync') {
    event.waitUntil(syncOfflineData());
  }
});

// Sync offline data when connection is restored
async function syncOfflineData() {
  console.log('📡 YCORE SW: Syncing offline data...');
  
  // Here you can implement logic to sync any offline data
  // when the connection is restored
  
  try {
    // Example: sync any pending form submissions or actions
    const offlineActions = await getOfflineActions();
    
    for (const action of offlineActions) {
      await fetch(action.url, action.options);
    }
    
    await clearOfflineActions();
    console.log('✅ YCORE SW: Offline data synced successfully');
  } catch (error) {
    console.log('❌ YCORE SW: Failed to sync offline data:', error);
  }
}

// Placeholder functions for offline data management
async function getOfflineActions() {
  // In a real implementation, you'd retrieve stored offline actions
  return [];
}

async function clearOfflineActions() {
  // In a real implementation, you'd clear stored offline actions
}

// Handle push notifications (future enhancement)
self.addEventListener('push', event => {
  console.log('📱 YCORE SW: Push notification received');
  
  const options = {
    body: 'You have new updates in YCORE',
    icon: '/pwa-assets/icon-192.png',
    badge: '/pwa-assets/badge-72.png',
    tag: 'ycore-notification',
    renotify: true,
    actions: [
      {
        action: 'open',
        title: 'Open YCORE'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('YCORE Update', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('📱 YCORE SW: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('🎯 YCORE Service Worker loaded and ready');