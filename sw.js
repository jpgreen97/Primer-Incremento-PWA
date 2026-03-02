// Archivo: sw.js
const CACHE_NAME = "version-mvp-1";
const ARCHIVOS_PARA_CACHEAR = [
  "./UI2.html", // Tu archivo principal
  "./",         // La raíz de la carpeta
];

// 1. INSTALACIÓN: Guardamos el HTML en la caché
self.addEventListener("install", (event) => {
  console.log("Service Worker: Instalando...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Service Worker: Cacheando archivos...");
      return cache.addAll(ARCHIVOS_PARA_CACHEAR);
    })
  );
});

// 2. ACTIVACIÓN: Limpiamos cachés viejas si actualizamos la versión
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// 3. INTERCEPTOR (FETCH): La magia Offline
// Si no hay internet, devuelve lo que guardó en caché.
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((respuestaCacheada) => {
      // Si está en caché, úsalo. Si no, pídelo a internet.
      return respuestaCacheada || fetch(event.request);
    })
  );
});