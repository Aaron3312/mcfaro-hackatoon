"use client";
// Hook para obtener o generar la rutina del día
import { useState, useEffect, useCallback } from "react";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Rutina } from "@/lib/types";
import { RutinaGenerada } from "@/lib/gemini";
import { format } from "date-fns";

export function useRutina(familiaId: string | undefined) {
  const [rutina, setRutina] = useState<RutinaGenerada | null>(null);
  const [cargando, setCargando] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fechaHoy = format(new Date(), "yyyy-MM-dd");

  const cargarRutina = useCallback(async () => {
    if (!familiaId) {
      setCargando(false);
      return;
    }

    try {
      // Buscar rutina del día en Firestore (funciona offline gracias a la caché)
      const q = query(
        collection(db, "rutinas"),
        where("familiaId", "==", familiaId),
        where("fecha", "==", fechaHoy),
        limit(1)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const doc = snapshot.docs[0].data() as Omit<Rutina, "id">;
        setRutina(JSON.parse(doc.contenido) as RutinaGenerada);
        setCargando(false);
        return;
      }

      // No existe rutina del día — generarla
      setCargando(false);
    } catch (err) {
      console.error("Error al cargar rutina:", err);
      setCargando(false);
    }
  }, [familiaId, fechaHoy]);

  const generarRutina = useCallback(async () => {
    if (!familiaId) return;

    setGenerando(true);
    setError(null);

    try {
      const respuesta = await fetch("/api/rutina", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ familiaId, fecha: fechaHoy }),
      });

      if (!respuesta.ok) {
        throw new Error("Error al generar rutina");
      }

      const datos = (await respuesta.json()) as RutinaGenerada;
      setRutina(datos);
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : "Error desconocido";
      setError(mensaje);
    } finally {
      setGenerando(false);
    }
  }, [familiaId, fechaHoy]);

  useEffect(() => {
    cargarRutina();
  }, [cargarRutina]);

  return { rutina, cargando, generando, error, generarRutina };
}
