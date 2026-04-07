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

interface NuevaCita {
  titulo: string;
  fecha: Date;
  servicio: Cita["servicio"];
  notas?: string;
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
        console.error("Error al escuchar citas:", error);
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
      fecha: Timestamp.fromDate(nueva.fecha),
      servicio: nueva.servicio,
      notas: nueva.notas ?? "",
      recordatorio60: nueva.recordatorio60 ?? true,
      recordatorio15: nueva.recordatorio15 ?? true,
      notificacionEnviada: false,
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
  const proximaCita = citas.find((cita) => cita.fecha.toDate() > new Date()) ?? null;

  return { citas, citasHoy, proximaCita, cargando, agregarCita, editarCita, eliminarCita };
}
