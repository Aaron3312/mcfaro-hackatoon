"use client";
// Hook para centralizar la lógica del dashboard
import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Cita, Menu, Actividad, SolicitudTransporte } from "@/lib/types";
import { calcularProximaComida } from "@/lib/helpers/menu";
import { logger } from "@/lib/logger";

interface DashboardData {
  proximaCita: Cita | null;
  proximaComida: { tipo: string; hora: string; disponible: boolean } | null;
  menuDia: Menu | null;
  proximaActividad: Actividad | null;
  transporteActivo: SolicitudTransporte | null;
  cargando: boolean;
}

export function useDashboard(
  familiaId: string | undefined,
  casaRonald: string | undefined
): DashboardData {
  const [proximaCita, setProximaCita] = useState<Cita | null>(null);
  const [proximaComida, setProximaComida] = useState<{ tipo: string; hora: string; disponible: boolean } | null>(null);
  const [menuDia, setMenuDia] = useState<Menu | null>(null);
  const [proximaActividad, setProximaActividad] = useState<Actividad | null>(null);
  const [transporteActivo, setTransporteActivo] = useState<SolicitudTransporte | null>(null);

  // Estados de carga independientes por subscripción
  const [cargandoCita, setCargandoCita] = useState(true);
  const [cargandoMenu, setCargandoMenu] = useState(true);
  const [cargandoActividad, setCargandoActividad] = useState(true);
  const [cargandoTransporte, setCargandoTransporte] = useState(true);

  // Estado de carga general: true si CUALQUIER subscripción está cargando
  const cargando = cargandoCita || cargandoMenu || cargandoActividad || cargandoTransporte;

  // Escuchar próxima cita médica
  useEffect(() => {
    if (!familiaId) {
      setProximaCita(null);
      setCargandoCita(false);
      return;
    }

    setCargandoCita(true);
    const ahora = Timestamp.now();
    const q = query(
      collection(db, "citas"),
      where("familiaId", "==", familiaId),
      where("fecha", ">", ahora),
      orderBy("fecha", "asc"),
      limit(1)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const citaData = snapshot.docs[0];
          setProximaCita({ id: citaData.id, ...citaData.data() } as Cita);
        } else {
          setProximaCita(null);
        }
        setCargandoCita(false);
      },
      (error) => {
        logger.error("Error al escuchar próxima cita:", error);
        setCargandoCita(false);
      }
    );

    return unsubscribe;
  }, [familiaId]);

  // Escuchar menú del día para obtener próxima comida
  useEffect(() => {
    if (!casaRonald) {
      setMenuDia(null);
      setProximaComida(null);
      setCargandoMenu(false);
      return;
    }

    setCargandoMenu(true);

    // Fecha local (no UTC) para que coincida con lo que publica el coordinador
    const ahora = new Date();
    const hoy = [
      ahora.getFullYear(),
      String(ahora.getMonth() + 1).padStart(2, "0"),
      String(ahora.getDate()).padStart(2, "0"),
    ].join("-");

    // Buscar por campos en vez de construir el doc ID, más robusto
    const q = query(
      collection(db, "menus"),
      where("casaRonald", "==", casaRonald),
      where("fecha", "==", hoy),
      limit(1)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const menu = snapshot.docs[0].data() as Menu;
          setMenuDia(menu);
          setProximaComida(calcularProximaComida(menu));
        } else {
          setMenuDia(null);
          setProximaComida(null);
        }
        setCargandoMenu(false);
      },
      (error) => {
        logger.error("Error al escuchar menú:", error);
        setCargandoMenu(false);
      }
    );

    return unsubscribe;
  }, [casaRonald]);

  // Escuchar próxima actividad registrada
  useEffect(() => {
    if (!familiaId) {
      setProximaActividad(null);
      setCargandoActividad(false);
      return;
    }

    setCargandoActividad(true);
    // Variable para almacenar cleanup de la subscripción anidada
    let unsubscribeActividades: (() => void) | null = null;

    // Primero obtener IDs de actividades registradas
    const registrosQuery = query(
      collection(db, "registrosActividad"),
      where("familiaId", "==", familiaId)
    );

    const unsubscribeRegistros = onSnapshot(
      registrosQuery,
      (registrosSnapshot) => {
        // CRÍTICO: Limpiar subscripción anterior antes de crear una nueva
        if (unsubscribeActividades) {
          unsubscribeActividades();
          unsubscribeActividades = null;
        }

        if (registrosSnapshot.empty) {
          setProximaActividad(null);
          setCargandoActividad(false);
          return;
        }

        const actividadIds = registrosSnapshot.docs.map((doc) => doc.data().actividadId);

        // Obtener la próxima actividad registrada
        const ahora = Timestamp.now();
        const actividadesQuery = query(
          collection(db, "actividades"),
          where("fechaHora", ">", ahora),
          where("estado", "in", ["programada", "en_curso"]),
          orderBy("fechaHora", "asc"),
          limit(10)
        );

        unsubscribeActividades = onSnapshot(
          actividadesQuery,
          (actividadesSnapshot) => {
            const proximaActivRegistrada = actividadesSnapshot.docs.find((doc) =>
              actividadIds.includes(doc.id)
            );

            if (proximaActivRegistrada) {
              setProximaActividad({
                id: proximaActivRegistrada.id,
                ...proximaActivRegistrada.data(),
              } as Actividad);
            } else {
              setProximaActividad(null);
            }
            setCargandoActividad(false);
          },
          (error) => {
            logger.error("Error al escuchar actividades:", error);
            setCargandoActividad(false);
          }
        );
      },
      (error) => {
        logger.error("Error al escuchar registros:", error);
        setCargandoActividad(false);
      }
    );

    // CRÍTICO: Limpiar AMBAS subscripciones al desmontar
    return () => {
      unsubscribeRegistros();
      if (unsubscribeActividades) {
        unsubscribeActividades();
      }
    };
  }, [familiaId]);

  // Escuchar transporte activo
  useEffect(() => {
    if (!familiaId) {
      setTransporteActivo(null);
      setCargandoTransporte(false);
      return;
    }

    setCargandoTransporte(true);
    const q = query(
      collection(db, "solicitudesTransporte"),
      where("familiaId", "==", familiaId),
      where("estado", "in", ["pendiente", "asignada", "en_camino"]),
      orderBy("fechaHora", "desc"),
      limit(1)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const solicitudData = snapshot.docs[0];
          setTransporteActivo({
            id: solicitudData.id,
            ...solicitudData.data(),
          } as SolicitudTransporte);
        } else {
          setTransporteActivo(null);
        }
        setCargandoTransporte(false);
      },
      (error) => {
        logger.error("Error al escuchar transporte:", error);
        setCargandoTransporte(false);
      }
    );

    return unsubscribe;
  }, [familiaId]);

  return {
    proximaCita,
    proximaComida,
    menuDia,
    proximaActividad,
    transporteActivo,
    cargando,
  };
}
