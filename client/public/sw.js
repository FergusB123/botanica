const CACHE_VERSION = 'botanica-v1'
const STATIC_CACHE  = `${CACHE_VERSION}-static`
const IMAGE_CACHE   = `${CACHE_VERSION}-images`

const PRECACHE_URLS = ['/', '/offline.html']

// ── Install: precache shell ───────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  )
})

// ── Activate: clear old caches ────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => !k.startsWith(CACHE_VERSION))
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  )
})

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Never intercept API calls — always go to network
  if (url.pathname.startsWith('/api/')) return

  // Never intercept non-GET requests
  if (request.method !== 'GET') return

  // Navigation requests: network-first, fall back to cached / or offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone()
          caches.open(STATIC_CACHE).then(cache => cache.put(request, clone))
          return response
        })
        .catch(() =>
          caches.match(request)
            .then(cached => cached || caches.match('/') || caches.match('/offline.html'))
        )
    )
    return
  }

  // Images: cache-first with network fallback
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached
        return fetch(request).then(response => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(IMAGE_CACHE).then(cache => cache.put(request, clone))
          }
          return response
        }).catch(() => cached)
      })
    )
    return
  }

  // Static assets (JS, CSS): stale-while-revalidate
  event.respondWith(
    caches.match(request).then(cached => {
      const networkFetch = fetch(request).then(response => {
        if (response.ok) {
          const clone = response.clone()
          caches.open(STATIC_CACHE).then(cache => cache.put(request, clone))
        }
        return response
      }).catch(() => cached)

      return cached || networkFetch
    })
  )
})

// ── Push notifications ────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return
  const data = event.data.json()
  event.waitUntil(
    self.registration.showNotification(data.title || 'Botanica', {
      body:    data.body || 'You have a plant care reminder',
      icon:    '/icon-192.png',
      badge:   '/icon-192.png',
      tag:     data.tag || 'botanica-reminder',
      data:    { url: data.url || '/' },
      actions: [
        { action: 'open',    title: 'View plant' },
        { action: 'dismiss', title: 'Dismiss'    },
      ]
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.action === 'dismiss') return
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      const existing = clientList.find(c => c.url.includes(url) && 'focus' in c)
      if (existing) return existing.focus()
      return clients.openWindow(url)
    })
  )
})
