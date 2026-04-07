"use client";
// Temporizador de respiración guiada 4-7-8 — funciona completamente offline
import { useState, useEffect, useCallback } from "react";

type FaseRespiracion = "inhalar" | "sostener" | "exhalar" | "listo";

const fases: { nombre: FaseRespiracion; duracion: number; instruccion: string; color: string }[] = [
  { nombre: "inhalar", duracion: 4, instruccion: "Inhala suavemente", color: "bg-blue-100 border-blue-300" },
  { nombre: "sostener", duracion: 7, instruccion: "Sostén el aire", color: "bg-amber-100 border-amber-300" },
  { nombre: "exhalar", duracion: 8, instruccion: "Exhala despacio", color: "bg-green-100 border-green-300" },
];

const CICLOS_TOTALES = 3;

export function TemporizadorRespiracion() {
  const [activo, setActivo] = useState(false);
  const [faseIndex, setFaseIndex] = useState(0);
  const [segundosRestantes, setSegundosRestantes] = useState(fases[0].duracion);
  const [ciclo, setCiclo] = useState(0);
  const [completado, setCompletado] = useState(false);

  const reiniciar = useCallback(() => {
    setActivo(false);
    setFaseIndex(0);
    setSegundosRestantes(fases[0].duracion);
    setCiclo(0);
    setCompletado(false);
  }, []);

  useEffect(() => {
    if (!activo || completado) return;

    const intervalo = setInterval(() => {
      setSegundosRestantes((prev) => {
        if (prev <= 1) {
          // Avanzar a la siguiente fase
          setFaseIndex((fi) => {
            const siguiente = fi + 1;
            if (siguiente >= fases.length) {
              // Completar ciclo
              setCiclo((c) => {
                const nuevoCiclo = c + 1;
                if (nuevoCiclo >= CICLOS_TOTALES) {
                  setCompletado(true);
                  setActivo(false);
                  return nuevoCiclo;
                }
                return nuevoCiclo;
              });
              return 0; // Reiniciar a inhalar
            }
            return siguiente;
          });
          return fases[(faseIndex + 1) % fases.length].duracion;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalo);
  }, [activo, completado, faseIndex]);

  const faseActual = fases[faseIndex];
  const progreso = (faseActual.duracion - segundosRestantes) / faseActual.duracion;
  // Escala del círculo: inhalar = grande, exhalar = pequeño
  const escala = faseActual.nombre === "inhalar"
    ? 0.7 + progreso * 0.3
    : faseActual.nombre === "exhalar"
    ? 1.0 - progreso * 0.3
    : 1.0;

  if (completado) {
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <div className="w-40 h-40 rounded-full bg-green-100 border-4 border-green-300 flex items-center justify-center">
          <span className="text-5xl">🌿</span>
        </div>
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-800">¡Muy bien hecho!</p>
          <p className="text-gray-500 mt-1">Completaste 3 ciclos de respiración</p>
        </div>
        <button
          onClick={reiniciar}
          className="bg-green-600 text-white rounded-2xl px-8 py-4 text-base font-semibold min-h-[56px] active:bg-green-700"
        >
          Hacer de nuevo
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8 py-6">
      {/* Círculo animado */}
      <div className="relative flex items-center justify-center w-56 h-56">
        <div
          className={`absolute inset-0 rounded-full border-4 transition-all duration-1000 ease-in-out ${faseActual.color}`}
          style={{ transform: `scale(${escala})` }}
        />
        <div className="relative text-center z-10">
          <p className="text-5xl font-light text-gray-700 tabular-nums">{segundosRestantes}</p>
          <p className="text-sm font-medium text-gray-500 mt-1">{faseActual.instruccion}</p>
        </div>
      </div>

      {/* Indicador de ciclos */}
      <div className="flex gap-2">
        {Array.from({ length: CICLOS_TOTALES }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i < ciclo ? "bg-green-500" : i === ciclo ? "bg-gray-400" : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      {/* Controles */}
      {!activo ? (
        <button
          onClick={() => setActivo(true)}
          className="bg-[#C85A2A] text-white rounded-2xl px-10 py-4 text-base font-semibold min-h-[56px] active:bg-[#7A3D1A] shadow-md"
        >
          Comenzar
        </button>
      ) : (
        <button
          onClick={() => setActivo(false)}
          className="border-2 border-gray-300 text-gray-600 rounded-2xl px-10 py-4 text-base font-semibold min-h-[56px] active:bg-gray-50"
        >
          Pausar
        </button>
      )}

      <p className="text-xs text-gray-400 text-center px-4">
        Técnica 4-7-8 · 3 ciclos · ~2 minutos
      </p>
    </div>
  );
}
