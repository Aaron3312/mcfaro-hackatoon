"use client";
// Hook para el módulo de mapa — lugares de Casa Ronald + ubicación actual del cuidador
import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { logger } from "@/lib/logger";
import { LugarMapa } from "@/lib/types";

// Datos mock que se usan si la colección `lugares` está vacía en Firestore.
// En producción el coordinador los carga desde el panel.
const LUGARES_MOCK: LugarMapa[] = [
  {
    id: "entrada",
    nombre: "Entrada principal",
    icono: "🚪",
    descripcion: "Acceso principal a Casa Ronald",
    detalles:
      "Puerta principal de Casa Ronald McDonald. Aquí recibirás tu orientación de bienvenida y podrás preguntar al personal por cualquier servicio.",
    casaRonald: "mock",
    x: 180,
    y: 248,
  },
  {
    id: "recepcion",
    nombre: "Recepción / Oficina",
    icono: "🏢",
    descripcion: "Atención al cuidador y trámites",
    detalles:
      "Oficina administrativa donde puedes realizar check-in, resolver dudas, solicitar apoyo y coordinar con el equipo de Casa Ronald.",
    casaRonald: "mock",
    x: 305,
    y: 222,
  },
  {
    id: "lavanderia",
    nombre: "Lavandería",
    icono: "👕",
    descripcion: "Lavadoras y secadoras disponibles",
    detalles:
      "Área de lavandería con lavadoras y secadoras de uso gratuito. Disponible de 7:00 a 22:00. Trae tu propio detergente o solicítalo en recepción.",
    casaRonald: "mock",
    x: 55,
    y: 222,
  },
  {
    id: "cocina",
    nombre: "Cocina compartida",
    icono: "🍳",
    descripcion: "Cocina equipada para todos",
    detalles:
      "Cocina completamente equipada con estufa, refrigerador, microondas y utensilios. Disponible las 24 horas. Hay espacios asignados en el refrigerador por familia.",
    casaRonald: "mock",
    x: 55,
    y: 155,
  },
  {
    id: "comedor",
    nombre: "Comedor",
    icono: "🍽️",
    descripcion: "Área de comidas y convivencia",
    detalles:
      "Comedor principal con capacidad para varias familias. Algunos días hay comidas comunitarias organizadas por voluntarios. Consulta el calendario en recepción.",
    casaRonald: "mock",
    x: 180,
    y: 155,
  },
  {
    id: "sala",
    nombre: "Sala común",
    icono: "🛋️",
    descripcion: "Espacio de descanso y recreo",
    detalles:
      "Sala de estar con televisión, juguetes para niños y área de lectura. Ideal para pasar tiempo con tu familia fuera de la habitación.",
    casaRonald: "mock",
    x: 305,
    y: 155,
  },
  {
    id: "habitaciones-a",
    nombre: "Habitaciones (ala A)",
    icono: "🛏️",
    descripcion: "Habitaciones 101–108",
    detalles:
      "Habitaciones del ala A, numeradas del 101 al 108. Cada habitación incluye cama doble, armario y baño privado. Llaves en recepción.",
    casaRonald: "mock",
    x: 90,
    y: 65,
  },
  {
    id: "habitaciones-b",
    nombre: "Habitaciones (ala B)",
    icono: "🛏️",
    descripcion: "Habitaciones 109–116",
    detalles:
      "Habitaciones del ala B, numeradas del 109 al 116. Mismas comodidades que el ala A. Acceso por el pasillo central.",
    casaRonald: "mock",
    x: 270,
    y: 65,
  },
];

interface UsaMapaResult {
  lugares: LugarMapa[];
  ubicacionActual: string | null;
  actualizarUbicacion: (lugarId: string | null) => Promise<void>;
  cargando: boolean;
}

export function useMapa(
  familiaId: string | undefined,
  casaRonald: string | undefined
): UsaMapaResult {
  const [lugares, setLugares] = useState<LugarMapa[]>([]);
  const [ubicacionActual, setUbicacionActual] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  // Escuchar lugares de esta Casa Ronald en tiempo real
  useEffect(() => {
    if (!casaRonald) {
      setLugares(LUGARES_MOCK);
      setCargando(false);
      return;
    }

    const q = query(
      collection(db, "lugares"),
      where("casaRonald", "==", casaRonald)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          // Fallback a mock mientras no haya datos cargados en Firestore
          setLugares(LUGARES_MOCK);
        } else {
          setLugares(
            snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as LugarMapa[]
          );
        }
        setCargando(false);
      },
      (error) => {
        logger.error("Error al cargar lugares del mapa:", error);
        setLugares(LUGARES_MOCK);
        setCargando(false);
      }
    );

    return unsubscribe;
  }, [casaRonald]);

  // Escuchar ubicación actual de la familia en tiempo real
  useEffect(() => {
    if (!familiaId) return;

    const unsubscribe = onSnapshot(
      doc(db, "familias", familiaId),
      (snapshot) => {
        if (snapshot.exists()) {
          setUbicacionActual(snapshot.data().ubicacionActual ?? null);
        }
      },
      (error) => {
        logger.error("Error al escuchar ubicación actual:", error);
      }
    );

    return unsubscribe;
  }, [familiaId]);

  async function actualizarUbicacion(lugarId: string | null): Promise<void> {
    if (!familiaId) return;
    try {
      await updateDoc(doc(db, "familias", familiaId), {
        ubicacionActual: lugarId,
      });
    } catch (error) {
      logger.error("Error al guardar ubicación actual:", error);
    }
  }

  return { lugares, ubicacionActual, actualizarUbicacion, cargando };
}
