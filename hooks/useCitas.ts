"use client";
// Hook para gestionar citas en tiempo real con Firestore
import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Cita } from "@/lib/types";
import { logger } from "@/lib/logger";

export interface NuevaCita {
  titulo: string;
  descripcion?: string;
  fecha: Date;
  servicio: Cita["servicio"];
  ubicacion?: string;
  notas?: string;
  completada?: boolean;
  recordatorio24h?: boolean;
  recordatorio60?: boolean;
  recordatorio15?: boolean;
}

export function useCitas(familiaId: string | undefined) {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!familiaId) {
      setCitas([]);
      setCargando(false);
      return;
    }

    const q = query(
      collection(db, "citas"),
      where("familiaId", "==", familiaId),
      orderBy("fecha", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const citasData = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Cita[];
        setCitas(citasData);
        setCargando(false);
      },
      (error) => {
        logger.error("Error al escuchar citas:", error);
        setCargando(false);
      }
    );

    return unsubscribe;
  }, [familiaId]);

  const agregarCita = async (nueva: NuevaCita): Promise<void> => {
    if (!familiaId) throw new Error("No hay familia autenticada");

    await addDoc(collection(db, "citas"), {
      familiaId,
      titulo: nueva.titulo,
      descripcion: nueva.descripcion ?? "",
      fecha: Timestamp.fromDate(nueva.fecha),
      servicio: nueva.servicio,
      ubicacion: nueva.ubicacion ?? "",
      notas: nueva.notas ?? "",
      completada: false,
      recordatorio24h: nueva.recordatorio24h ?? true,
      recordatorio60: nueva.recordatorio60 ?? true,
      recordatorio15: nueva.recordatorio15 ?? true,
      notificacionEnviada: false,
      creadaEn: Timestamp.fromDate(new Date()),
    });
  };

  const editarCita = async (id: string, cambios: Partial<NuevaCita>): Promise<void> => {
    const datos: Record<string, unknown> = { ...cambios };
    if (cambios.fecha) {
      datos.fecha = Timestamp.fromDate(cambios.fecha);
    }
    await updateDoc(doc(db, "citas", id), datos);
  };

  const eliminarCita = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, "citas", id));
  };

  // Citas del día actual
  const citasHoy = citas.filter((cita) => {
    const fechaCita = cita.fecha.toDate();
    const hoy = new Date();
    return (
      fechaCita.getDate() === hoy.getDate() &&
      fechaCita.getMonth() === hoy.getMonth() &&
      fechaCita.getFullYear() === hoy.getFullYear()
    );
  });

  // Próxima cita futura
  const proximaCita = citas.find((cita) => !cita.completada && cita.fecha.toDate() > new Date()) ?? null;

  // Días del mes/año que tienen citas (para marcar el calendario)
  const diasConCitas = (anio: number, mes: number): Set<number> => {
    const set = new Set<number>();
    citas.forEach((c) => {
      const f = c.fecha.toDate();
      if (f.getFullYear() === anio && f.getMonth() === mes) set.add(f.getDate());
    });
    return set;
  };

  // Citas de un día específico
  const citasDelDia = (fecha: Date): Cita[] => {
    return citas.filter((c) => {
      const f = c.fecha.toDate();
      return (
        f.getDate() === fecha.getDate() &&
        f.getMonth() === fecha.getMonth() &&
        f.getFullYear() === fecha.getFullYear()
      );
    });
  };

  return {
    citas, citasHoy, proximaCita, cargando,
    diasConCitas, citasDelDia,
    agregarCita, editarCita, eliminarCita,
  };
}
