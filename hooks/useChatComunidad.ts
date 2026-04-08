"use client";
// Hook para el módulo de comunidad — grupos de apoyo, chat en tiempo real y psicólogos
import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { GrupoApoyo, MensajeChat, Psicologo, SesionPsicologo } from "@/lib/types";
import { logger } from "@/lib/logger";

export function useGruposComunidad(casaRonald: string | undefined, familiaId: string | undefined) {
  const [grupos, setGrupos] = useState<GrupoApoyo[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!casaRonald) {
      setCargando(false);
      return;
    }

    const q = query(
      collection(db, "gruposApoyo"),
      where("casaRonald", "==", casaRonald),
      orderBy("creadoEn", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setGrupos(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as GrupoApoyo));
        setCargando(false);
      },
      (err) => {
        logger.error("Error al cargar grupos", err);
        setCargando(false);
      }
    );

    return unsub;
  }, [casaRonald]);

  // Unirse a un grupo
  const unirse = useCallback(
    async (grupoId: string) => {
      if (!familiaId) return;
      await updateDoc(doc(db, "gruposApoyo", grupoId), {
        miembros: arrayUnion(familiaId),
      });
    },
    [familiaId]
  );

  // Salir de un grupo
  const salir = useCallback(
    async (grupoId: string) => {
      if (!familiaId) return;
      await updateDoc(doc(db, "gruposApoyo", grupoId), {
        miembros: arrayRemove(familiaId),
      });
    },
    [familiaId]
  );

  const esMiembro = (grupoId: string) => {
    if (!familiaId) return false;
    const grupo = grupos.find((g) => g.id === grupoId);
    return grupo?.miembros.includes(familiaId) ?? false;
  };

  return { grupos, cargando, unirse, salir, esMiembro };
}

export function useMensajesChat(grupoId: string | null) {
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!grupoId) {
      setCargando(false);
      return;
    }

    // Últimos 100 mensajes, en tiempo real
    const q = query(
      collection(db, "mensajesChat"),
      where("grupoId", "==", grupoId),
      orderBy("timestamp", "asc"),
      limit(100)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setMensajes(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as MensajeChat));
        setCargando(false);
      },
      (err) => {
        logger.error("Error al cargar mensajes", err);
        setCargando(false);
      }
    );

    return unsub;
  }, [grupoId]);

  return { mensajes, cargando };
}

export function usePsicologos(casaRonald: string | undefined) {
  const [psicologos, setPsicologos] = useState<Psicologo[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!casaRonald) {
      setCargando(false);
      return;
    }

    const q = query(
      collection(db, "psicologos"),
      where("casaRonald", "==", casaRonald),
      where("disponible", "==", true)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setPsicologos(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Psicologo));
        setCargando(false);
      },
      (err) => {
        logger.error("Error al cargar psicólogos", err);
        setCargando(false);
      }
    );

    return unsub;
  }, [casaRonald]);

  return { psicologos, cargando };
}

export function useSesionesPsicologo(familiaId: string | undefined) {
  const [sesiones, setSesiones] = useState<SesionPsicologo[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!familiaId) {
      setCargando(false);
      return;
    }

    const q = query(
      collection(db, "sesionesPsicologos"),
      where("familiaId", "==", familiaId),
      orderBy("fecha", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setSesiones(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SesionPsicologo));
        setCargando(false);
      },
      (err) => {
        logger.error("Error al cargar sesiones", err);
        setCargando(false);
      }
    );

    return unsub;
  }, [familiaId]);

  return { sesiones, cargando };
}
