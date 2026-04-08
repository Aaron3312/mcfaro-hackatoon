"use client";
// Hook para gestionar el menú del día en tiempo real con Firestore
import { useState, useEffect } from "react";
import {
  doc,
  onSnapshot,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Menu } from "@/lib/types";

export function useMenu(casaRonald: string | undefined) {
  const [menuHoy, setMenuHoy] = useState<Menu | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!casaRonald) {
      setMenuHoy(null);
      setCargando(false);
      return;
    }

    // Construir ID del documento: {fecha}-{casaRonald}
    const hoy = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const menuId = `${hoy}-${casaRonald}`;

    const unsubscribe = onSnapshot(
      doc(db, "menus", menuId),
      (snapshot) => {
        if (snapshot.exists()) {
          setMenuHoy({
            id: snapshot.id,
            ...snapshot.data(),
          } as Menu);
        } else {
          setMenuHoy(null);
        }
        setCargando(false);
        setError(null);
      },
      (err) => {
        console.error("Error al escuchar menú:", err);
        setError(err.message);
        setCargando(false);
      }
    );

    return unsubscribe;
  }, [casaRonald]);

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
      console.error("Error al notificar familias:", err);
      throw err;
    }
  };

  return { menuHoy, cargando, error, marcarDisponible };
}
