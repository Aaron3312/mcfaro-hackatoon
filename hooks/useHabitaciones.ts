"use client";
// Hook para habitaciones e historial en tiempo real
import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Habitacion, HistorialHabitacion, Familia } from "@/lib/types";

export function useHabitaciones() {
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [familias, setFamilias] = useState<Familia[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const unsubHab = onSnapshot(
      query(collection(db, "habitaciones"), orderBy("piso"), orderBy("numero")),
      (snap) => {
        setHabitaciones(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Habitacion));
        setCargando(false);
      },
      () => setCargando(false)
    );

    const unsubFamilias = onSnapshot(
      query(collection(db, "familias"), where("rol", "==", "cuidador")),
      (snap) => setFamilias(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Familia))
    );

    return () => { unsubHab(); unsubFamilias(); };
  }, []);

  const asignar = async (habitacionId: string, familiaId: string, nombreFamilia: string) => {
    const res = await fetch("/api/habitaciones/asignar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habitacionId, familiaId, nombreFamilia }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? "Error al asignar");
    }
  };

  const liberar = async (habitacionId: string) => {
    const res = await fetch("/api/habitaciones/liberar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habitacionId }),
    });
    if (!res.ok) throw new Error("Error al liberar");
  };

  const cambiarEstado = async (habitacionId: string, estado: "disponible" | "mantenimiento" | "bloqueada") => {
    const res = await fetch("/api/habitaciones/estado", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habitacionId, estado }),
    });
    if (!res.ok) throw new Error("Error al cambiar estado");
  };

  // Agrupar por piso
  const porPiso = habitaciones.reduce<Record<string, Habitacion[]>>((acc, h) => {
    const p = h.piso || "Sin piso";
    if (!acc[p]) acc[p] = [];
    acc[p].push(h);
    return acc;
  }, {});

  // Familias sin habitación asignada
  const familiasSinHab = familias.filter(
    (f) => !habitaciones.some((h) => h.familiaId === f.id)
  );

  return { habitaciones, familias, familiasSinHab, porPiso, cargando, asignar, liberar, cambiarEstado };
}

export function useHistorialHabitacion(habitacionId: string | null) {
  const [historial, setHistorial] = useState<HistorialHabitacion[]>([]);

  useEffect(() => {
    if (!habitacionId) { setHistorial([]); return; }

    const q = query(
      collection(db, "historialHabitaciones"),
      where("habitacionId", "==", habitacionId),
      orderBy("fechaIngreso", "desc"),
      limit(10)
    );

    return onSnapshot(q, (snap) =>
      setHistorial(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as HistorialHabitacion))
    );
  }, [habitacionId]);

  return historial;
}
