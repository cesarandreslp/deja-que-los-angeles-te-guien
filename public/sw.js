// Service Worker para PWA Oráculo Angelical
const CACHE_NAME = 'oraculo-angelical-v4';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-384x384.png',
  '/alas.svg'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Cachear archivos uno por uno para manejar errores individualmente
        return Promise.allSettled(
          urlsToCache.map(url => 
            cache.add(url).catch(error => {
              console.warn(`Failed to cache ${url}:`, error);
              return null;
            })
          )
        );
      })
      .catch(error => {
        console.error('Error opening cache:', error);
      })
  );
  self.skipWaiting();
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Limpiar caches antiguos
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Eliminando cache antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Recachear manifest.json
      caches.open(CACHE_NAME).then(cache => {
        return cache.add('/manifest.json').catch(error => {
          console.warn('No se pudo cachear manifest.json:', error);
        });
      })
    ])
  );
  self.clients.claim();
});

// Estrategia de cache: Network First para API, Cache First para assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Excluir rutas problemáticas del Service Worker
  if (url.pathname.includes('/_next/') || 
      url.pathname.includes('/api/auth/_log') ||
      url.pathname.includes('webpack-hmr')) {
    return; // Dejar que el navegador maneje estas rutas normalmente
  }

  // API routes - Network First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Solo cachear respuestas exitosas y válidas
          if (response && response.status === 200 && response.type === 'basic') {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone).catch(error => {
                console.warn('No se pudo cachear:', request.url, error);
              });
            });
          }
          return response;
        })
        .catch((error) => {
          console.warn('Fetch failed for:', request.url, error);
          return caches.match(request).then(cachedResponse => {
            return cachedResponse || new Response('Network error', { status: 503 });
          });
        })
    );
    return;
  }

  // Assets estáticos - Cache First
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        });
      })
  );
});

// Manejo de notificaciones push
self.addEventListener('push', (event) => {
  const options = {
    body: 'Tienes una consulta programada próximamente',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    image: '/icons/notification-banner.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver consulta',
        icon: '/icons/action-view.png'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/icons/action-close.png'
      }
    ],
    requireInteraction: true,
    silent: false,
    renotify: true,
    tag: 'consultation-reminder'
  };

  if (event.data) {
    const data = event.data.json();
    options.title = data.title || 'Recordatorio de Consulta';
    options.body = data.body || options.body;
    options.data = { ...options.data, ...data };
  } else {
    options.title = 'Recordatorio de Consulta';
  }

  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Manejo de clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    // Abrir la página de consultas
    event.waitUntil(
      clients.openWindow('/user/consultations')
    );
  } else if (event.action === 'close') {
    // Solo cerrar la notificación
    return;
  } else {
    // Click en el cuerpo de la notificación
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});

// Manejo de cierre de notificaciones
self.addEventListener('notificationclose', (event) => {
  console.log('Notificación cerrada:', event.notification.data);
});

// Background Sync para recordatorios offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'consultation-reminder') {
    event.waitUntil(
      // Verificar recordatorios pendientes cuando se recupere la conexión
      fetch('/api/reminders/check')
        .then((response) => response.json())
        .then((data) => {
          if (data.reminders && data.reminders.length > 0) {
            data.reminders.forEach((reminder) => {
              self.registration.showNotification(reminder.title, {
                body: reminder.body,
                icon: '/icons/icon-192x192.png',
                data: reminder.data
              });
            });
          }
        })
        .catch((error) => {
          console.error('Error al verificar recordatorios:', error);
        })
    );
  }
});

// Periodic Background Sync (experimental)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'consultation-check') {
    event.waitUntil(
      fetch('/api/reminders/upcoming')
        .then((response) => response.json())
        .then((data) => {
          if (data.upcoming && data.upcoming.length > 0) {
            data.upcoming.forEach((consultation) => {
              const timeUntil = new Date(consultation.scheduledFor) - new Date();
              const minutesUntil = Math.floor(timeUntil / (1000 * 60));
              
              if (minutesUntil <= 15 && minutesUntil > 0) {
                self.registration.showNotification('Consulta Próxima', {
                  body: `Tu consulta con ${consultation.consultantName} comenzará en ${minutesUntil} minutos`,
                  icon: '/icons/icon-192x192.png',
                  data: { consultationId: consultation.id }
                });
              }
            });
          }
        })
    );
  }
});