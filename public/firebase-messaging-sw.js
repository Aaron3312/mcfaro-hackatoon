// firebase-messaging-sw.js
// Las notificaciones en background las maneja /sw.js directamente.
// Este archivo existe para satisfacer la ruta esperada por Firebase,
// pero el token se obtiene pasando serviceWorkerRegistration=/sw.js en getToken().
self.addEventListener("push", () => {
  // No-op: el handler real está en /sw.js
});
