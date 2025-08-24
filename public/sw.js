// Service Worker para Efectivo Fácil PWA
const CACHE_NAME = 'efectivo-facil-v1'
const STATIC_CACHE = 'efectivo-facil-static-v1'

const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/perfil',
  '/configuracion',
  '/static/style.css',
  '/static/app.js',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css'
]

const DYNAMIC_CACHE = [
  '/api/estadisticas',
  '/api/transacciones',
  '/api/perfil'
]

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('SW Install')
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .catch(error => {
        console.log('Error caching static assets:', error)
      })
  )
  self.skipWaiting()
})

// Activate event - clean old caches
self.addEventListener('activate', event => {
  console.log('SW Activate')
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE) {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)
  
  // Handle API requests differently
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache successful API responses
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          // Serve from cache if network fails
          return caches.match(request)
        })
    )
    return
  }
  
  // Handle static assets and pages
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse
        }
        
        return fetch(request)
          .then(response => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }
            
            // Cache successful responses
            const responseToCache = response.clone()
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseToCache)
            })
            
            return response
          })
      })
      .catch(() => {
        // Offline fallback
        if (request.destination === 'document') {
          return caches.match('/dashboard')
        }
      })
  )
})

// Background sync for offline cash-out requests
self.addEventListener('sync', event => {
  console.log('Background sync:', event.tag)
  
  if (event.tag === 'cashout-sync') {
    event.waitUntil(
      // Process pending cash-out requests
      processPendingCashouts()
    )
  }
})

// Push notification handling
self.addEventListener('push', event => {
  console.log('Push notification received')
  
  const options = {
    body: event.data ? event.data.text() : 'Nueva actualización en tu cash-out',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2'
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver Detalles',
        icon: '/icon-check.png'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/icon-close.png'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('Efectivo Fácil', options)
  )
})

// Notification click handling
self.addEventListener('notificationclick', event => {
  console.log('Notification click received.')
  
  event.notification.close()
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    )
  }
})

// Helper function to process pending cash-outs
async function processPendingCashouts() {
  try {
    // Get pending requests from IndexedDB or localStorage
    // This would be implemented based on your offline storage strategy
    console.log('Processing pending cash-out requests...')
    
    // Example implementation would sync with server
    const response = await fetch('/api/sync-cashouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      console.log('Cash-out sync completed')
    }
  } catch (error) {
    console.log('Cash-out sync failed:', error)
  }
}