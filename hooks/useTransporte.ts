"use client";
// Hook para solicitudes de transporte en tiempo real con Firestore
import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SolicitudTransporte } from "@/lib/types";

export function useTransporte(familiaId: string | undefined) {
  const [solicitudes, setSolicitudes] = useState<SolicitudTransporte[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!familiaId) {
      setSolicitudes([]);
      setCargando(false);
      return;
    }

    const q = query(
      collection(db, "solicitudesTransporte"),
      where("familiaId", "==", familiaId)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }) as SolicitudTransporte)
          .sort((a, b) => b.fechaHora.toMillis() - a.fechaHora.toMillis());
        setSolicitudes(docs);
        setCargando(false);
      },
      () => {
        setCargando(false);
      }
    );

    return unsub;
  }, [familiaId]);

  const solicitar = async (datos: {
    origen: string;
    destino: string;
    fechaHora: Date;
    pasajeros: number;
    notas?: string;
    nombreCuidador: string;
    nombrePaciente: string;
  }): Promise<void> => {
    if (!familiaId) throw new Error("No hay familia autenticada");

    const res = await fetch("/api/transporte/solicitar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        familiaId,
        nombreCuidador: datos.nombreCuidador,
        nombrePaciente: datos.nombrePaciente,
        origen: datos.origen,
        destino: datos.destino,
        fechaHora: datos.fechaHora.toISOString(),
        pasajeros: datos.pasajeros,
        notas: datos.notas ?? "",
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? "Error al crear solicitud");
    }
  };

  const cancelar = async (id: string): Promise<void> => {
    const res = await fetch(`/api/transporte/${id}/cancelar`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error al cancelar");
  };

  // Solo solicitudes activas (no canceladas ni completadas)
  const activas = solicitudes.filter(
    (s) => s.estado !== "cancelada" && s.estado !== "completada"
  );

  const historial = solicitudes.filter(
    (s) => s.estado === "cancelada" || s.estado === "completada"
  );

  return { solicitudes, activas, historial, cargando, solicitar, cancelar };
}
