"use client";
import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Cita } from "@/lib/types";
import { logger } from "@/lib/logger";

type NuevaCita = Omit<Cita, "id" | "familiaId" | "notificacionEnviada">;

export function useCitas() {
  const { usuario } = useAuth();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!usuario) return;

    const q = query(
      collection(db, "citas"),
      where("familiaId", "==", usuario.uid),
      orderBy("fecha", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setCitas(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Cita));
      setCargando(false);
    }, (err) => {
      logger.error("Error escuchando citas:", err);
      setCargando(false);
    });

    return unsub;
  }, [usuario]);

  const agregarCita = async (datos: NuevaCita) => {
    if (!usuario) throw new Error("No autenticado");
    await addDoc(collection(db, "citas"), {
      ...datos,
      familiaId: usuario.uid,
      fecha: Timestamp.fromDate(datos.fecha as unknown as Date),
      notificacionEnviada: false,
    });
  };

  const editarCita = async (id: string, datos: Partial<NuevaCita>) => {
    await updateDoc(doc(db, "citas", id), {
      ...datos,
      ...(datos.fecha ? { fecha: Timestamp.fromDate(datos.fecha as unknown as Date) } : {}),
    });
  };

  const eliminarCita = async (id: string) => {
    await deleteDoc(doc(db, "citas", id));
  };

  return { citas, cargando, agregarCita, editarCita, eliminarCita };
}
