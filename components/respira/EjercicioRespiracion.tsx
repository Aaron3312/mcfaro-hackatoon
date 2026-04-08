"use client";
// Selector de técnica de respiración + temporizador — sin conexión requerida
import { useState } from "react";
import { ejercicios, type EjercicioRespiracion as TEjercicio } from "@/lib/ejerciciosRespiracion";
import { TemporizadorRespiracion } from "./TemporizadorRespiracion";

interface Props {
  onPausaCompletada?: () => void;
}

export function EjercicioRespiracion({ onPausaCompletada }: Props) {
  const [seleccionado, setSeleccionado] = useState<TEjercicio>(ejercicios[0]);
  const [mostrarTemporizador, setMostrarTemporizador] = useState(false);

  function elegirEjercicio(ejercicio: TEjercicio) {
    setSeleccionado(ejercicio);
    setMostrarTemporizador(false);
  }

  function handleCompletado() {
    setMostrarTemporizador(false);
    onPausaCompletada?.();
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-4 pt-5 pb-3 border-b border-gray-50">
        <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: "#9A6A2A" }}>
          Ejercicios de respiración
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">Elige una técnica para comenzar</p>
      </div>

      {/* Selector de técnica */}
      <div className="p-4 flex flex-col gap-2">
        {ejercicios.map((ej) => (
          <button
            key={ej.id}
            onClick={() => elegirEjercicio(ej)}
            className={`flex items-center gap-3 rounded-xl p-3 text-left transition-all border-2 ${
              seleccionado.id === ej.id
                ? "border-[#C85A2A] bg-orange-50"
                : "border-transparent bg-gray-50 active:bg-gray-100"
            }`}
          >
            <span className="text-2xl shrink-0">{ej.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 text-sm">{ej.nombre}</p>
              <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{ej.descripcion}</p>
            </div>
            <span className="text-xs text-gray-400 shrink-0">{ej.duracionAprox}</span>
          </button>
        ))}
      </div>

      {/* Botón para abrir el temporizador o el temporizador mismo */}
      {mostrarTemporizador ? (
        <>
          <div className="border-t border-gray-50 px-4 pt-3 pb-1">
            <button
              onClick={() => setMostrarTemporizador(false)}
              className="text-xs text-gray-400 flex items-center gap-1 active:text-gray-600"
            >
              ← Cambiar ejercicio
            </button>
          </div>
          <TemporizadorRespiracion
            ejercicio={seleccionado}
            onCompletado={handleCompletado}
          />
        </>
      ) : (
        <div className="px-4 pb-5">
          <button
            onClick={() => setMostrarTemporizador(true)}
            className="w-full bg-[#C85A2A] text-white rounded-2xl py-4 text-base font-semibold min-h-[56px] active:bg-[#7A3D1A] shadow-md"
          >
            Comenzar {seleccionado.emoji} {seleccionado.nombre}
          </button>
        </div>
      )}
    </div>
  );
}
