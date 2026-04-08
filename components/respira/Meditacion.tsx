"use client";
// Meditaciones mock — temporizador visual sin audio real
import { useState, useEffect } from "react";
import { meditaciones, type Meditacion as TMeditacion } from "@/lib/ejerciciosRespiracion";

interface Props {
  onPausaCompletada?: () => void;
}

interface EstadoReproduccion {
  meditacionId: string;
  segundosRestantes: number;
  activo: boolean;
  completado: boolean;
}

export function Meditacion({ onPausaCompletada }: Props) {
  const [estado, setEstado] = useState<EstadoReproduccion | null>(null);

  useEffect(() => {
    if (!estado?.activo || estado.completado) return;

    const intervalo = setInterval(() => {
      setEstado((prev) => {
        if (!prev) return null;
        if (prev.segundosRestantes <= 1) {
          return { ...prev, segundosRestantes: 0, activo: false, completado: true };
        }
        return { ...prev, segundosRestantes: prev.segundosRestantes - 1 };
      });
    }, 1000);

    return () => clearInterval(intervalo);
  }, [estado?.activo, estado?.completado]);

  // Notificar al padre cuando se complete — fuera del updater de estado
  useEffect(() => {
    if (estado?.completado) onPausaCompletada?.();
  }, [estado?.completado, onPausaCompletada]);

  function iniciar(med: TMeditacion) {
    setEstado({
      meditacionId: med.id,
      segundosRestantes: med.duracionMin * 60,
      activo: true,
      completado: false,
    });
  }

  function detener() {
    setEstado(null);
  }

  // Si hay una meditación activa, mostrar el reproductor
  if (estado) {
    const med = meditaciones.find((m) => m.id === estado.meditacionId)!;
    const totalSegundos = med.duracionMin * 60;
    const progreso = (totalSegundos - estado.segundosRestantes) / totalSegundos;
    const minutos = Math.floor(estado.segundosRestantes / 60);
    const segundos = estado.segundosRestantes % 60;

    return (
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 pt-5 pb-3 border-b border-gray-50">
          <button
            onClick={detener}
            className="text-xs text-gray-400 flex items-center gap-1 mb-3 active:text-gray-600"
          >
            ← Volver a meditaciones
          </button>
          <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: "#9A6A2A" }}>
            {med.emoji} {med.titulo}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">{med.duracionMin} minutos · cierra los ojos y respira</p>
        </div>

        <div className="flex flex-col items-center gap-6 py-8 px-4">
          {/* Progreso circular visual */}
          <div className="relative w-40 h-40">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke="#f3f4f6" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="#C85A2A"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 44}`}
                strokeDashoffset={`${2 * Math.PI * 44 * (1 - progreso)}`}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {estado.completado ? (
                <span className="text-4xl">🌿</span>
              ) : (
                <>
                  <p className="text-3xl font-light text-gray-700 tabular-nums">
                    {minutos}:{segundos.toString().padStart(2, "0")}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">restantes</p>
                </>
              )}
            </div>
          </div>

          {estado.completado ? (
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-800">¡Bien hecho!</p>
              <p className="text-gray-500 text-sm mt-1">Tomaste un momento para ti.</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center px-4 leading-relaxed">
              Cierra los ojos, respira profundo y deja que tu mente descanse.
            </p>
          )}

          {estado.activo && !estado.completado && (
            <button
              onClick={() =>
                setEstado((prev) => prev && { ...prev, activo: false })
              }
              className="border-2 border-gray-300 text-gray-600 rounded-2xl px-8 py-4 text-base font-semibold min-h-[56px] active:bg-gray-50"
            >
              Pausar
            </button>
          )}

          {!estado.activo && !estado.completado && (
            <button
              onClick={() =>
                setEstado((prev) => prev && { ...prev, activo: true })
              }
              className="bg-[#C85A2A] text-white rounded-2xl px-8 py-4 text-base font-semibold min-h-[56px] active:bg-[#7A3D1A] shadow-md"
            >
              Continuar
            </button>
          )}

          {estado.completado && (
            <button
              onClick={detener}
              className="bg-green-600 text-white rounded-2xl px-8 py-4 text-base font-semibold min-h-[56px] active:bg-green-700"
            >
              Volver
            </button>
          )}
        </div>
      </div>
    );
  }

  // Lista de meditaciones disponibles
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-4 pt-5 pb-3 border-b border-gray-50">
        <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: "#9A6A2A" }}>
          Meditaciones cortas
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">3-5 minutos · cierra los ojos</p>
      </div>

      <div className="p-4 flex flex-col gap-3">
        {meditaciones.map((med) => (
          <div
            key={med.id}
            className={`rounded-xl border p-4 flex items-center gap-3 ${med.colorClase}`}
          >
            <span className="text-3xl shrink-0">{med.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 text-sm">{med.titulo}</p>
              <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{med.descripcion}</p>
              <p className="text-gray-400 text-xs mt-1">{med.duracionMin} min</p>
            </div>
            <button
              onClick={() => iniciar(med)}
              className="shrink-0 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 active:bg-gray-50 shadow-sm"
            >
              Iniciar
            </button>
          </div>
        ))}

        <p className="text-xs text-gray-400 text-center pt-1">
          🎵 Pon música relajante de tu preferencia mientras meditas
        </p>
      </div>
    </div>
  );
}
