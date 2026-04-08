"use client";
// Hook para manejar actividades de interés del cuidador en Firestore
import { useState, useEffect } from "react";
import {
  collection, query, where, onSnapshot,
  setDoc, deleteDoc, doc, Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface InteresDoc {
  familiaId: string;
  actividadId: string;
  creadaEn: Timestamp;
}

// ID de documento estable: familiaId_actividadId
const docId = (familiaId: string, actividadId: string) =>
  `${familiaId}_${actividadId}`;

export function useActividadesInteres(familiaId: string | undefined) {
  const [idsInteres, setIdsInteres] = useState<Set<string>>(new Set());
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!familiaId) { setCargando(false); return; }

    const q = query(
      collection(db, "actividadesInteres"),
      where("familiaId", "==", familiaId)
    );

    const unsub = onSnapshot(q, (snap) => {
      const ids = new Set(snap.docs.map((d) => (d.data() as InteresDoc).actividadId));
      setIdsInteres(ids);
      setCargando(false);
    }, () => setCargando(false));

    return unsub;
  }, [familiaId]);

  const tieneInteres = (actividadId: string) => idsInteres.has(actividadId);

  const marcarInteres = async (actividadId: string) => {
    if (!familiaId) return;
    await setDoc(doc(db, "actividadesInteres", docId(familiaId, actividadId)), {
      familiaId,
      actividadId,
      creadaEn: Timestamp.now(),
    });
  };

  const quitarInteres = async (actividadId: string) => {
    if (!familiaId) return;
    await deleteDoc(doc(db, "actividadesInteres", docId(familiaId, actividadId)));
  };

  const toggleInteres = async (actividadId: string) => {
    if (tieneInteres(actividadId)) {
      await quitarInteres(actividadId);
    } else {
      await marcarInteres(actividadId);
    }
  };

  return { idsInteres, cargando, tieneInteres, marcarInteres, quitarInteres, toggleInteres };
}
