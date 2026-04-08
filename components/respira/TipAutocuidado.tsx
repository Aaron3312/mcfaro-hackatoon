"use client";
// Tips de autocuidado con navegación — sin dependencias externas
import { useState } from "react";
import { tips, mensajesMotivacionales } from "@/lib/ejerciciosRespiracion";

interface Props {
  pausasHoy: number;
}

export function TipAutocuidado({ pausasHoy }: Props) {
  const [tipIndex, setTipIndex] = useState(0);
  const [mensajeIndex] = useState(() => Math.floor(Math.random() * mensajesMotivacionales.length));

  function siguienteTip() {
    setTipIndex((i) => (i + 1) % tips.length);
  }

  const tipActual = tips[tipIndex];

  return (
    <div className="flex flex-col gap-3">
      {/* Contador de pausas — gamificación leve */}
      {pausasHoy > 0 && (
        <div
          className="rounded-2xl p-4 flex items-center gap-3"
          style={{ background: "linear-gradient(135deg, #FFF8E6, #FEF3C7)" }}
        >
          <span className="text-2xl">🏅</span>
          <div>
            <p className="font-semibold text-sm" style={{ color: "#7A3D1A" }}>
              {pausasHoy === 1 ? "1 pausa tomada hoy" : `${pausasHoy} pausas tomadas hoy`}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#9A6A2A" }}>
              {pausasHoy >= 3 ? "¡Excelente! Te estás cuidando muy bien." : "Cada pausa cuenta. ¡Sigue así!"}
            </p>
          </div>
        </div>
      )}

      {/* Tip de autocuidado */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wide" style={{ color: "#9A6A2A" }}>
            Tip de autocuidado
          </h2>
          <button
            onClick={siguienteTip}
            className="text-xs text-gray-400 border border-gray-200 rounded-lg px-2 py-1 active:bg-gray-50"
          >
            Siguiente →
          </button>
        </div>
        <div className="flex gap-3 items-start">
          <span className="text-2xl shrink-0 mt-0.5">{tipActual.emoji}</span>
          <div>
            <p className="font-semibold text-gray-800 text-sm">{tipActual.titulo}</p>
            <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{tipActual.descripcion}</p>
          </div>
        </div>
        {/* Indicador de posición */}
        <div className="flex justify-center gap-1 mt-3">
          {tips.map((_, i) => (
            <button
              key={i}
              onClick={() => setTipIndex(i)}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i === tipIndex ? "bg-[#C85A2A]" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Mensaje motivacional */}
      <div
        className="rounded-2xl p-4"
        style={{ background: "linear-gradient(135deg, #FFF8E6, #FEF3C7)" }}
      >
        <p className="text-sm font-medium leading-relaxed" style={{ color: "#7A3D1A" }}>
          {mensajesMotivacionales[mensajeIndex]}
        </p>
      </div>
    </div>
  );
}
