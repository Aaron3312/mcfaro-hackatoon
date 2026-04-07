"use client";
// Temporizador de respiración guiada 4-7-8 — funciona offline
import { useState, useEffect, useRef } from "react";

type Fase = "inhala" | "sostén" | "exhala" | "pausa";

interface ConfigFase {
  duracion: number;
  label: string;
  color: string;
}

const fases: Record<Fase, ConfigFase> = {
  inhala: { duracion: 4, label: "Inhala",  color: "#3B82F6" },
  sostén: { duracion: 7, label: "Sostén",  color: "#8B5CF6" },
  exhala: { duracion: 8, label: "Exhala",  color: "#22C55E" },
  pausa:  { duracion: 1, label: "Pausa",   color: "#9CA3AF" },
};

const secuencia: Fase[] = ["inhala", "sostén", "exhala", "pausa"];
const CICLOS_TOTAL = 3;

export function TemporizadorRespiracion() {
  const [activo, setActivo] = useState(false);
  const [faseIdx, setFaseIdx] = useState(0);
  const [segundos, setSegundos] = useState(fases.inhala.duracion);
  const [ciclo, setCiclo] = useState(0);
  const [completado, setCompletado] = useState(false);
  const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const faseActual = secuencia[faseIdx];
  const config = fases[faseActual];

  useEffect(() => {
    if (!activo) return;

    intervaloRef.current = setInterval(() => {
      setSegundos((prev) => {
        if (prev <= 1) {
          // Avanzar fase
          setFaseIdx((fi) => {
            const siguiente = (fi + 1) % secuencia.length;
            // Si volvemos al inicio, es un nuevo ciclo
            if (siguiente === 0) {
              setCiclo((c) => {
                const nuevo = c + 1;
                if (nuevo >= CICLOS_TOTAL) {
                  setActivo(false);
                  setCompletado(true);
                }
                return nuevo;
              });
            }
            setSegundos(fases[secuencia[siguiente]].duracion);
            return siguiente;
          });
          return fases[secuencia[(faseIdx + 1) % secuencia.length]].duracion;
        }
        return prev - 1;
      });
    }, 1000);

    return () => { if (intervaloRef.current) clearInterval(intervaloRef.current); };
  }, [activo, faseIdx]);

  const iniciar = () => {
    setFaseIdx(0);
    setSegundos(fases.inhala.duracion);
    setCiclo(0);
    setCompletado(false);
    setActivo(true);
  };

  const detener = () => {
    setActivo(false);
    if (intervaloRef.current) clearInterval(intervaloRef.current);
  };

  // Progreso del círculo
  const total = config.duracion;
  const progreso = activo ? (total - segundos) / total : 0;
  const radio = 72;
  const circunferencia = 2 * Math.PI * radio;
  const offset = circunferencia * (1 - progreso);

  return (
    <div className="flex flex-col items-center py-8 px-4 gap-6">
      {/* Círculo animado */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" width="192" height="192">
          <circle cx="96" cy="96" r={radio} fill="none" stroke="#F3F4F6" strokeWidth="8" />
          <circle cx="96" cy="96" r={radio} fill="none"
            stroke={activo ? config.color : "#E5E7EB"}
            strokeWidth="8"
            strokeDasharray={circunferencia}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
          />
        </svg>
        <div className="text-center">
          {completado ? (
            <span className="text-4xl">✅</span>
          ) : (
            <>
              <p className="text-4xl font-bold text-gray-800">{activo ? segundos : "—"}</p>
              <p className="text-sm font-medium mt-1" style={{ color: activo ? config.color : "#9CA3AF" }}>
                {activo ? config.label : "Listo"}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Ciclos */}
      <div className="flex gap-2">
        {Array.from({ length: CICLOS_TOTAL }).map((_, i) => (
          <div key={i} className="w-2.5 h-2.5 rounded-full transition-colors"
            style={{ background: i < ciclo ? "#C85A2A" : "#E5E7EB" }} />
        ))}
      </div>

      {/* Mensaje completado */}
      {completado && (
        <p className="text-sm font-medium text-center" style={{ color: "#7A3D1A" }}>
          ¡Bien hecho! 🌟 Tómate un momento.
        </p>
      )}

      {/* Botón */}
      <button
        onClick={activo ? detener : iniciar}
        className="px-8 py-3 rounded-2xl font-semibold text-sm transition-colors min-h-[48px]"
        style={{
          background: activo ? "#F3F4F6" : "#C85A2A",
          color: activo ? "#374151" : "#fff",
        }}>
        {completado ? "Repetir" : activo ? "Pausar" : "Comenzar"}
      </button>
    </div>
  );
}
