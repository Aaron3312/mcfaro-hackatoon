"use client";
// Hook para actividades en tiempo real — suscripción + registro/cancelación
import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Actividad, RegistroActividad } from "@/lib/types";

export function useActividades(casaRonald: string | undefined, familiaId: string | undefined) {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [misRegistros, setMisRegistros] = useState<RegistroActividad[]>([]);
  const [cargando, setCargando] = useState(true);

  // Suscripción a actividades de la casa
  useEffect(() => {
    if (!casaRonald) {
      setCargando(false);
      return;
    }

    // Solo filtramos por casaRonald — el resto se hace en cliente para evitar índices compuestos
    const q = query(
      collection(db, "actividades"),
      where("casaRonald", "==", casaRonald)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const todas = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Actividad);
        // Filtrar activas y ordenar por fechaHora en cliente
        const activas = todas
          .filter((a) => a.estado === "programada" || a.estado === "en_curso")
          .sort((a, b) => a.fechaHora.toMillis() - b.fechaHora.toMillis());
        setActividades(activas);
        setCargando(false);
      },
      () => setCargando(false)
    );

    return unsub;
  }, [casaRonald]);

  // Suscripción a mis registros
  useEffect(() => {
    if (!familiaId) { setMisRegistros([]); return; }

    const q = query(
      collection(db, "registrosActividad"),
      where("familiaId", "==", familiaId)
    );

    return onSnapshot(q, (snap) => {
      setMisRegistros(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as RegistroActividad));
    });
  }, [familiaId]);

  const registrar = async (actividadId: string, nombreCuidador: string): Promise<void> => {
    if (!familiaId) throw new Error("No autenticado");
    const res = await fetch("/api/actividades/registrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actividadId, familiaId, nombreCuidador, accion: "registrar" }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? "Error al registrarse");
    }
  };

  const cancelarRegistro = async (actividadId: string, nombreCuidador: string): Promise<void> => {
    if (!familiaId) throw new Error("No autenticado");
    const res = await fetch("/api/actividades/registrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actividadId, familiaId, nombreCuidador, accion: "cancelar" }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? "Error al cancelar registro");
    }
  };

  const estaRegistrado = (actividadId: string) =>
    misRegistros.some((r) => r.actividadId === actividadId);

  // Actividades agrupadas por fecha (YYYY-MM-DD)
  const porFecha = actividades.reduce<Record<string, Actividad[]>>((acc, a) => {
    const clave = a.fechaHora.toDate().toISOString().slice(0, 10);
    if (!acc[clave]) acc[clave] = [];
    acc[clave].push(a);
    return acc;
  }, {});

  // Días del mes con actividades
  const diasConActividad = new Set(Object.keys(porFecha).map((d) => d.slice(8, 10)));

  return {
    actividades,
    misRegistros,
    cargando,
    estaRegistrado,
    porFecha,
    diasConActividad,
    registrar,
    cancelarRegistro,
  };
}
