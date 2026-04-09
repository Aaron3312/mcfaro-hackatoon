"use client";
// Hook para leer y guardar recursos (reglamento, FAQ, contactos, horarios) desde Firestore
import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { RecursosData } from "@/lib/types";

export function useRecursos(casaRonald: string | undefined) {
  const [recursos, setRecursos] = useState<RecursosData | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!casaRonald) { setCargando(false); return; }

    const ref = doc(db, "recursos", casaRonald);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setRecursos(snap.exists() ? (snap.data() as RecursosData) : null);
        setCargando(false);
      },
      () => setCargando(false)
    );
    return unsub;
  }, [casaRonald]);

  const guardar = async (datos: Omit<RecursosData, "casaRonald" | "actualizadoEn">) => {
    if (!casaRonald) throw new Error("casaRonald requerido");
    const res = await fetch("/api/recursos/actualizar", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ casaRonald, ...datos }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? "Error al guardar recursos");
    }
  };

  return { recursos, cargando, guardar };
}
