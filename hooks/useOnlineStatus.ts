"use client";
// Hook para monitorear el estado de conectividad del dispositivo.
// Usa los eventos nativos online/offline del navegador.
// Útil en entornos hospitalarios donde el WiFi puede ser inestable.
import { useState, useEffect } from "react";

export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const marcarOnline  = () => setOnline(true);
    const marcarOffline = () => setOnline(false);

    window.addEventListener("online",  marcarOnline);
    window.addEventListener("offline", marcarOffline);

    return () => {
      window.removeEventListener("online",  marcarOnline);
      window.removeEventListener("offline", marcarOffline);
    };
  }, []);

  return online;
}
