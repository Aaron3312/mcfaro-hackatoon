// Service Worker mcFaro v4 — caché offline mejorado para PWA
// v4: Caché expandido para funcionalidad offline completa
const CACHE_ESTATICO = "mcfaro-static-v4";
const CACHE_DINAMICO = "mcfaro-dynamic-v4";
const CACHE_DATOS = "mcfaro-datos-v4";

// Recursos que se pre-cachean en la instalación
const PRECACHE_URLS = [
  "/",
  "/dashboard",
  "/menu",
  "/transporte",
  "/actividades",
  "/recursos",
  "/perfil",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
  "/icons/icon-faro.svg",
];

// Rutas de API que nunca deben cachearse
const API_PATTERNS = ["/api/", "firestore.googleapis.com", "firebase", "fcm.googleapis.com"];

// ── Instalación — pre-cachear recursos estáticos ──────────────────────────────
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE_ESTATICO)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ── Activación — limpiar caches anteriores ────────────────────────────────────
self.addEventListener("activate", (e) => {
  const cachesValidos = [CACHE_ESTATICO, CACHE_DINAMICO, CACHE_DATOS];
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !cachesValidos.includes(k))
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function esRecursoEstatico(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".ico") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname === "/manifest.json"
  );
}

function esLlamadaAPI(url) {
  return API_PATTERNS.some((p) => url.href.includes(p));
}

// Datos críticos que deben cachearse para funcionalidad offline
function esDatoCacheable(url) {
  const pathname = url.pathname;
  return (
    pathname.includes("/menu") ||
    pathname.includes("/actividades") ||
    pathname.includes("/transporte") ||
    pathname.includes("/recursos") ||
    pathname.includes("/perfil") ||
    pathname.includes("/dashboard")
  );
}

// Rutas que deben funcionar offline (caché con stale-while-revalidate)
const RUTAS_OFFLINE = [
  "/dashboard",
  "/menu",
  "/actividades",
  "/transporte",
  "/recursos",
  "/perfil",
];

// ── Fetch — estrategia dual ───────────────────────────────────────────────────
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Solo interceptar GET del mismo origen (o CDN de Next.js)
  if (e.request.method !== "GET") return;

  // Llamadas a API: siempre red, sin cache
  if (esLlamadaAPI(url)) return;

  // Recursos estáticos: Cache First
  if (esRecursoEstatico(url)) {
    e.respondWith(
      caches.match(e.request).then(
        (cached) =>
          cached ||
          fetch(e.request).then((res) => {
            const copia = res.clone();
            caches.open(CACHE_ESTATICO).then((c) => c.put(e.request, copia));
            return res;
          })
      )
    );
    return;
  }

  // Páginas y datos críticos: Stale While Revalidate para mejor offline
  if (RUTAS_OFFLINE.some((ruta) => url.pathname === ruta || url.pathname.startsWith(ruta + "/"))) {
    e.respondWith(
      caches.match(e.request).then((cachedResponse) => {
        const fetchPromise = fetch(e.request)
          .then((res) => {
            if (res.ok) {
              const copia = res.clone();
              const cacheName = esDatoCacheable(url) ? CACHE_DATOS : CACHE_DINAMICO;
              caches.open(cacheName).then((c) => c.put(e.request, copia));
            }
            return res;
          })
          .catch(() => {
            // Si falla fetch y no hay cache, mostrar página offline
            if (!cachedResponse) {
              return new Response(
                JSON.stringify({ error: "Sin conexión", offline: true }),
                { status: 503, headers: { "Content-Type": "application/json" } }
              );
            }
            return cachedResponse;
          });

        // Devolver cache inmediatamente si existe, mientras se actualiza en segundo plano
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Resto de páginas y datos: Network First con fallback a cache
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // Cachear respuestas válidas
        if (res.ok) {
          const copia = res.clone();
          const cacheName = esDatoCacheable(url) ? CACHE_DATOS : CACHE_DINAMICO;
          caches.open(cacheName).then((c) => c.put(e.request, copia));
        }
        return res;
      })
      .catch(() =>
        caches.match(e.request).then(
          (cached) =>
            cached ||
            new Response(
              JSON.stringify({ error: "Sin conexión", offline: true }),
              { status: 503, headers: { "Content-Type": "application/json" } }
            )
        )
      )
  );
});

// ── Background Sync — reintenta solicitudes pendientes ────────────────────────
self.addEventListener("sync", (e) => {
  if (e.tag === "sync-transporte") {
    e.waitUntil(sincronizarSolicitudesPendientes());
  }
});

async function sincronizarSolicitudesPendientes() {
  // Las solicitudes guardadas offline se reenvían cuando vuelve la conexión
  // La lógica de cola está en el cliente via IndexedDB
  const clientes = await self.clients.matchAll();
  clientes.forEach((c) => c.postMessage({ tipo: "SYNC_COMPLETADO" }));
}

// ── Push notifications ────────────────────────────────────────────────────────
self.addEventListener("push", (e) => {
  let datos = { title: "mcFaro", body: "Tienes una notificación nueva" };
  try {
    datos = e.data?.json() ?? datos;
  } catch {
    // datos por defecto
  }

  e.waitUntil(
    self.registration.showNotification(datos.title, {
      body: datos.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      vibrate: [200, 100, 200],
      data: datos,
    })
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = e.notification.data?.url ?? "/dashboard";
  e.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientes) => {
        const existente = clientes.find((c) => c.url.includes(url));
        if (existente) return existente.focus();
        return self.clients.openWindow(url);
      })
  );
});
