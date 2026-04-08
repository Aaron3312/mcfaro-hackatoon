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
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Cita, Menu, Actividad, SolicitudTransporte } from "@/lib/types";

interface DashboardData {
  proximaCita: Cita | null;
  proximaComida: { tipo: string; hora: string; disponible: boolean } | null;
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
  const [proximaActividad, setProximaActividad] = useState<Actividad | null>(null);
  const [transporteActivo, setTransporteActivo] = useState<SolicitudTransporte | null>(null);
  const [cargando, setCargando] = useState(true);

  // Escuchar próxima cita médica
  useEffect(() => {
    if (!familiaId) {
      setProximaCita(null);
      return;
    }

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
      },
      (error) => {
        console.error("Error al escuchar próxima cita:", error);
      }
    );

    return unsubscribe;
  }, [familiaId]);

  // Escuchar menú del día para obtener próxima comida
  useEffect(() => {
    if (!casaRonald) {
      setProximaComida(null);
      return;
    }

    const hoy = new Date().toISOString().split("T")[0];
    const menuId = `${hoy}-${casaRonald}`;

    const unsubscribe = onSnapshot(
      doc(db, "menus", menuId),
      (snapshot) => {
        if (snapshot.exists()) {
          const menu = snapshot.data() as Menu;
          const ahora = new Date();
          const horaActual = ahora.getHours() * 60 + ahora.getMinutes();

          // Determinar próxima comida
          const comidas = [
            { tipo: "Desayuno", hora: menu.comidas.desayuno.hora, disponible: menu.comidas.desayuno.disponible },
            { tipo: "Comida", hora: menu.comidas.comida.hora, disponible: menu.comidas.comida.disponible },
            { tipo: "Cena", hora: menu.comidas.cena.hora, disponible: menu.comidas.cena.disponible },
          ];

          const proximaComidaData = comidas.find((comida) => {
            const [horas, minutos] = comida.hora.split(":").map(Number);
            const minutoComida = horas * 60 + minutos;
            return minutoComida > horaActual;
          });

          setProximaComida(proximaComidaData || null);
        } else {
          setProximaComida(null);
        }
      },
      (error) => {
        console.error("Error al escuchar menú:", error);
      }
    );

    return unsubscribe;
  }, [casaRonald]);

  // Escuchar próxima actividad registrada
  useEffect(() => {
    if (!familiaId) {
      setProximaActividad(null);
      return;
    }

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
          },
          (error) => {
            console.error("Error al escuchar actividades:", error);
          }
        );
      },
      (error) => {
        console.error("Error al escuchar registros:", error);
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
      setCargando(false);
      return;
    }

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
        setCargando(false);
      },
      (error) => {
        console.error("Error al escuchar transporte:", error);
        setCargando(false);
      }
    );

    return unsubscribe;
  }, [familiaId]);

  // Estado de carga: se gestiona en cada useEffect individual
  // El flag se desactiva cuando al menos una subscripción responde

  return {
    proximaCita,
    proximaComida,
    proximaActividad,
    transporteActivo,
    cargando,
  };
}
