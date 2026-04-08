"use client";
// Módulo Respira — pausas de bienestar para cuidadores
// Mock: sin Firebase ni audio real, funciona completamente offline
import { useState } from "react";
import { EjercicioRespiracion } from "@/components/respira/EjercicioRespiracion";
import { Meditacion } from "@/components/respira/Meditacion";
import { TipAutocuidado } from "@/components/respira/TipAutocuidado";

type Pestaña = "ejercicios" | "meditaciones";

export default function RespiraPage() {
  const [pestaña, setPestaña] = useState<Pestaña>("ejercicios");
  const [pausasHoy, setPausasHoy] = useState(0);

  function registrarPausa() {
    setPausasHoy((prev) => prev + 1);
  }

  return (
    <>
      {/* ── Banner ───────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden w-full"
        style={{ background: "linear-gradient(135deg, #C85A2A 0%, #E87A3A 70%, #F5C842 100%)" }}
      >
        <div
          className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-15"
          style={{ background: "#7A3D1A" }}
        />
        <div className="max-w-6xl mx-auto px-5 py-8 md:px-10 md:py-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Respira</h1>
              <p className="text-white/70 text-sm mt-1">Dos minutos para ti. Lo mereces.</p>
            </div>
            {/* Contador de pausas en el banner */}
            {pausasHoy > 0 && (
              <div className="bg-white/20 rounded-2xl px-4 py-2 text-center">
                <p className="text-white font-bold text-lg leading-none">{pausasHoy}</p>
                <p className="text-white/80 text-xs mt-0.5">
                  {pausasHoy === 1 ? "pausa" : "pausas"} hoy
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Pestañas ─────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 pt-4 md:px-10">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setPestaña("ejercicios")}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
              pestaña === "ejercicios"
                ? "bg-white shadow-sm text-gray-800"
                : "text-gray-500 active:text-gray-700"
            }`}
          >
            🌬️ Respiración
          </button>
          <button
            onClick={() => setPestaña("meditaciones")}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
              pestaña === "meditaciones"
                ? "bg-white shadow-sm text-gray-800"
                : "text-gray-500 active:text-gray-700"
            }`}
          >
            🧘 Meditación
          </button>
        </div>
      </div>

      {/* ── Contenido ────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 pt-4 pb-8 md:px-10 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-8 md:items-start">

        {/* Columna izquierda: ejercicio o meditación según pestaña */}
        <div>
          {pestaña === "ejercicios" ? (
            <EjercicioRespiracion onPausaCompletada={registrarPausa} />
          ) : (
            <Meditacion onPausaCompletada={registrarPausa} />
          )}
        </div>

        {/* Columna derecha: tips y motivación (siempre visible en desktop, debajo en mobile) */}
        <div className="mt-4 md:mt-0">
          <TipAutocuidado pausasHoy={pausasHoy} />
        </div>
      </div>
    </>
  );
}
