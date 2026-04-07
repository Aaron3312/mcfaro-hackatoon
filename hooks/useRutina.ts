"use client";
import { useState, useEffect, useCallback } from "react";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { BloqueRutina } from "@/lib/types";
import { format } from "date-fns";
import { logger } from "@/lib/logger";

export function useRutina() {
  const { usuario } = useAuth();
  const [bloques, setBloques] = useState<BloqueRutina[]>([]);
  const [cargando, setCargando] = useState(true);
  const [generando, setGenerando] = useState(false);

  const hoy = format(new Date(), "yyyy-MM-dd");

  // Cargar rutina del día desde Firestore
  const cargarRutina = useCallback(async () => {
    if (!usuario) return;
    setCargando(true);
    try {
      const q = query(
        collection(db, "rutinas"),
        where("familiaId", "==", usuario.uid),
        where("fecha", "==", hoy),
        orderBy("generadaEn", "desc"),
        limit(1)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const data = snap.docs[0].data();
        setBloques(JSON.parse(data.contenido) as BloqueRutina[]);
      }
    } catch (err) {
      logger.error("Error cargando rutina:", err);
    } finally {
      setCargando(false);
    }
  }, [usuario, hoy]);

  useEffect(() => { cargarRutina(); }, [cargarRutina]);

  // Generar nueva rutina con Gemini via API
  const generarRutina = async () => {
    if (!usuario) return;
    setGenerando(true);
    try {
      const token = await usuario.getIdToken();
      const res = await fetch("/api/rutina", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error en API");
      const { bloques: nuevos } = await res.json() as { bloques: BloqueRutina[] };
      setBloques(nuevos);
    } catch (err) {
      logger.error("Error generando rutina:", err);
      throw err;
    } finally {
      setGenerando(false);
    }
  };

  return { bloques, cargando, generando, generarRutina };
}
