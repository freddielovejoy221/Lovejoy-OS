// Lovejoy OS service worker — push notifications + click handling.
// Scope: /Lovejoy-OS/
const APP_URL = '/Lovejoy-OS/';

self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()); });

// Incoming push → show a notification
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) { data = { title: 'Lovejoy OS', body: event.data ? event.data.text() : '' }; }
  const title = data.title || 'Lovejoy OS';
  const options = {
    body: data.body || '',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    tag: data.tag || undefined,
    data: { url: data.url || APP_URL, type: data.type || 'test' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Tap → focus an existing window or open the app (optionally deep-linking)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || APP_URL;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes('/Lovejoy-OS/') && 'focus' in client) {
          client.navigate(target).catch(() => {});
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
    })
  );
});
