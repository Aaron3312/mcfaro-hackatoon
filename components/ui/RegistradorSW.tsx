"use client";
// Registra el Service Worker al cargar la app
import { useEffect } from "react";

export function RegistradorSW() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    // En desarrollo Turbopack tiene su propio SW interno que conflictúa con el nuestro
    if (process.env.NODE_ENV !== "production") return;

    const registrar = async () => {
      try {
        const registro = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });

        // Verificar actualizaciones cada vez que el usuario vuelve a la pestaña
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") {
            registro.update();
          }
        });

        // Escuchar mensajes del SW (ej. sync completado)
        navigator.serviceWorker.addEventListener("message", (e) => {
          if (e.data?.tipo === "SYNC_COMPLETADO") {
            // El SW completó background sync — podría disparar un toast aquí
            window.dispatchEvent(new CustomEvent("mcfaro:sync", { detail: e.data }));
          }
        });
      } catch {
        // El SW no es crítico — la app sigue funcionando sin él
      }
    };

    registrar();
  }, []);

  return null;
}
