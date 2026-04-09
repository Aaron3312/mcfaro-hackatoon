"use client";
// Hook para gestionar el menú del día en tiempo real con Firestore + caché offline
import { useState, useEffect } from "react";
import {
  doc,
  onSnapshot,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Menu } from "@/lib/types";
import { logger } from "@/lib/logger";
import { saveToCache, getFromCache, STORES } from "@/lib/offlineCache";

export function useMenu(casaRonald: string | undefined) {
  const [menuHoy, setMenuHoy] = useState<Menu | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [desdeCache, setDesdeCache] = useState(false);

  useEffect(() => {
    if (!casaRonald) {
      setMenuHoy(null);
      setCargando(false);
      return;
    }

    // Construir ID del documento: {fecha}-{casaRonald}
    const hoy = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const menuId = `${hoy}-${casaRonald}`;

    // Intentar cargar desde caché primero
    let cacheLoaded = false;
    getFromCache<Menu>(STORES.MENUS, menuId).then((cached) => {
      if (cached && !cacheLoaded) {
        setMenuHoy(cached);
        setDesdeCache(true);
        setCargando(false);
        cacheLoaded = true;
      }
    });

    const unsubscribe = onSnapshot(
      doc(db, "menus", menuId),
      (snapshot) => {
        if (snapshot.exists()) {
          const menuData = {
            id: snapshot.id,
            ...snapshot.data(),
          } as Menu;

          setMenuHoy(menuData);
          setDesdeCache(false);

          // Guardar en caché para uso offline
          saveToCache(STORES.MENUS, menuData).catch((err) => {
            logger.error("Error al guardar menú en caché:", err);
          });
        } else {
          setMenuHoy(null);
          setDesdeCache(false);
        }
        setCargando(false);
        setError(null);
      },
      async (err) => {
        logger.error("Error al escuchar menú:", err);

        // Si hay error (probablemente sin conexión), intentar cargar desde caché
        const cached = await getFromCache<Menu>(STORES.MENUS, menuId);
        if (cached) {
          setMenuHoy(cached);
          setDesdeCache(true);
          setError("Sin conexión - mostrando datos guardados");
        } else {
          setError(err.message);
        }

        setCargando(false);
      }
    );

    return unsubscribe;
  }, [casaRonald]);

  const publicarMenu = async (datos: {
    desayuno: { hora: string; descripcion: string };
    comida:   { hora: string; descripcion: string };
    cena:     { hora: string; descripcion: string };
    publicadoPor: string;
  }): Promise<void> => {
    if (!casaRonald) throw new Error("Casa Ronald no definida");

    const res = await fetch("/api/menu/publicar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ casaRonald, ...datos }),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error ?? "Error al publicar menú");
    }
  };

  const marcarDisponible = async (
    tipo: "desayuno" | "comida" | "cena"
  ): Promise<void> => {
    if (!menuHoy) throw new Error("No hay menú del día");

    const hoy = new Date().toISOString().split("T")[0];
    const menuId = `${hoy}-${casaRonald}`;

    // Actualizar disponibilidad en Firestore
    await updateDoc(doc(db, "menus", menuId), {
      [`comidas.${tipo}.disponible`]: true,
      [`comidas.${tipo}.notificadaEn`]: Timestamp.now(),
    });

    // Llamar endpoint de notificaciones
    try {
      const response = await fetch("/api/menu-disponible", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          casaRonald,
          comidaTipo: tipo,
          menuId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al enviar notificaciones");
      }
    } catch (err) {
      logger.error("Error al notificar familias:", err);
      throw err;
    }
  };

  return { menuHoy, cargando, error, desdeCache, publicarMenu, marcarDisponible };
}
