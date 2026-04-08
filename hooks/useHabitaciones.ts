"use client";
// Hook para habitaciones e historial en tiempo real
import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
// Nota: se evitan orderBy compuestos en habitaciones para no requerir índices compuestos en Firestore
import { db } from "@/lib/firebase";
import { Habitacion, HistorialHabitacion, Familia } from "@/lib/types";

export function useHabitaciones() {
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [familias, setFamilias] = useState<Familia[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const unsubHab = onSnapshot(
      collection(db, "habitaciones"),
      (snap) => {
        const docs = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }) as Habitacion)
          .sort((a, b) => {
            const pisoCmp = String(a.piso).localeCompare(String(b.piso), "es", { numeric: true });
            return pisoCmp !== 0
              ? pisoCmp
              : String(a.numero).localeCompare(String(b.numero), "es", { numeric: true });
          });
        setHabitaciones(docs);
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

  const liberar = async (habitacionId: string, familiaId: string) => {
    const res = await fetch("/api/habitaciones/liberar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habitacionId, familiaId }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error ?? "Error al liberar");
  };

  const cambiarEstado = async (habitacionId: string, estado: "disponible" | "mantenimiento" | "bloqueada") => {
    const res = await fetch("/api/habitaciones/estado", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habitacionId, estado }),
    });
    if (!res.ok) throw new Error("Error al cambiar estado");
  };

  const crearHabitacion = async (datos: {
    numero: string; piso: string; capacidad: number; casaRonald: string;
  }) => {
    const res = await fetch("/api/habitaciones/crear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error ?? "Error al crear habitación");
  };

  const editarHabitacion = async (habitacionId: string, cambios: {
    numero?: string; piso?: string; capacidad?: number;
  }) => {
    const res = await fetch("/api/habitaciones/editar", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habitacionId, ...cambios }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error ?? "Error al editar habitación");
  };

  const eliminarHabitacion = async (habitacionId: string) => {
    const res = await fetch("/api/habitaciones/eliminar", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habitacionId }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error ?? "Error al eliminar habitación");
  };

  // Agrupar por piso
  const porPiso = habitaciones.reduce<Record<string, Habitacion[]>>((acc, h) => {
    const p = h.piso || "Sin piso";
    if (!acc[p]) acc[p] = [];
    acc[p].push(h);
    return acc;
  }, {});

  // Familias sin habitación asignada (revisa el array ocupantes y el campo legacy)
  const familiasSinHab = familias.filter(
    (f) => !habitaciones.some(
      (h) =>
        (h.ocupantes ?? []).some((o) => o.familiaId === f.id) ||
        h.familiaId === f.id
    )
  );

  return {
    habitaciones, familias, familiasSinHab, porPiso, cargando,
    asignar, liberar, cambiarEstado,
    crearHabitacion, editarHabitacion, eliminarHabitacion,
  };
}

export function useHistorialHabitacion(habitacionId: string | null) {
  const [historial, setHistorial] = useState<HistorialHabitacion[]>([]);

  useEffect(() => {
    if (!habitacionId) { setHistorial([]); return; }

    const q = query(
      collection(db, "historialHabitaciones"),
      where("habitacionId", "==", habitacionId),
      limit(20)
    );

    return onSnapshot(q, (snap) => {
      const docs = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as HistorialHabitacion)
        .sort((a, b) => b.fechaIngreso.toMillis() - a.fechaIngreso.toMillis())
        .slice(0, 10);
      setHistorial(docs);
    });
  }, [habitacionId]);

  return historial;
}
