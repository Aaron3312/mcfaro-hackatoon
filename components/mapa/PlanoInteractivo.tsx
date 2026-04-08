"use client";
// Plano interactivo de Casa Ronald McDonald — SVG inline, funciona offline gracias a Firestore persistence
import { useState } from "react";
import { LugarMapa } from "@/lib/types";
import { MarcadorLugar } from "./MarcadorLugar";

interface Props {
  lugares: LugarMapa[];
  ubicacionActual: string | null;
  onUbicacionChange: (lugarId: string | null) => Promise<void>;
  cargando: boolean;
}

export function PlanoInteractivo({ lugares, ubicacionActual, onUbicacionChange, cargando }: Props) {
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [modoLista, setModoLista] = useState(false);

  const lugarActivo = lugares.find((l) => l.id === seleccionado) ?? null;

  function seleccionar(id: string) {
    setSeleccionado((prev) => (prev === id ? null : id));
  }

  async function toggleUbicacion(lugarId: string) {
    await onUbicacionChange(ubicacionActual === lugarId ? null : lugarId);
  }

  if (cargando) {
    return (
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 pt-5 pb-3 border-b border-gray-50">
          <div className="h-4 w-40 bg-gray-100 rounded animate-pulse" />
          <div className="h-3 w-56 bg-gray-100 rounded animate-pulse mt-2" />
        </div>
        <div className="h-64 bg-gray-50 animate-pulse m-4 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Cabecera con toggle de modo */}
      <div className="px-4 pt-5 pb-3 border-b border-gray-50 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: "#9A6A2A" }}>
            Plano Casa Ronald
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Toca un marcador para ver información</p>
        </div>
        <button
          onClick={() => setModoLista((v) => !v)}
          className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 active:bg-gray-50"
          aria-label={modoLista ? "Ver plano visual" : "Ver lista accesible"}
        >
          {modoLista ? "🗺️ Ver plano" : "☰ Vista lista"}
        </button>
      </div>

      {modoLista ? (
        // ── Modo accesibilidad: lista detallada ───────────────
        <div className="divide-y divide-gray-50">
          {lugares.map((lugar) => (
            <div
              key={lugar.id}
              className={`px-4 py-4 transition-colors ${
                ubicacionActual === lugar.id ? "bg-green-50" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0 mt-0.5">{lugar.icono}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-800 text-sm">{lugar.nombre}</p>
                    {ubicacionActual === lugar.id && (
                      <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                        Estás aquí
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-xs mt-1 leading-relaxed">{lugar.detalles}</p>
                </div>
                <button
                  onClick={() => toggleUbicacion(lugar.id)}
                  className={`shrink-0 text-xs rounded-lg px-2 py-1.5 border transition-colors ${
                    ubicacionActual === lugar.id
                      ? "bg-green-100 border-green-300 text-green-700"
                      : "border-gray-200 text-gray-500 active:bg-gray-50"
                  }`}
                >
                  {ubicacionActual === lugar.id ? "✓ Aquí" : "Estoy aquí"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // ── Modo plano SVG interactivo ────────────────────────
        <div>
          <div className="w-full overflow-x-auto">
            <svg
              viewBox="0 0 360 280"
              className="w-full"
              style={{ minWidth: 300, maxHeight: 320 }}
              aria-label="Plano de planta de Casa Ronald McDonald"
            >
              {/* Fondo del edificio */}
              <rect x={10} y={10} width={340} height={260} rx={8} fill="#F9FAFB" stroke="#E5E7EB" strokeWidth={2} />

              {/* Pasillos */}
              <rect x={10} y={120} width={340} height={20} fill="#F3F4F6" />
              <rect x={170} y={10} width={20} height={270} fill="#F3F4F6" />

              {/* Habitaciones ala A */}
              <rect x={12} y={12} width={156} height={106} rx={4} fill="#EFF6FF" stroke="#BFDBFE" strokeWidth={1.5} />
              <text x={90} y={90} textAnchor="middle" fontSize={9} fill="#93C5FD" fontWeight={600}>HABITACIONES A</text>
              <text x={90} y={102} textAnchor="middle" fontSize={8} fill="#BFDBFE">101–108</text>

              {/* Habitaciones ala B */}
              <rect x={192} y={12} width={156} height={106} rx={4} fill="#EFF6FF" stroke="#BFDBFE" strokeWidth={1.5} />
              <text x={270} y={90} textAnchor="middle" fontSize={9} fill="#93C5FD" fontWeight={600}>HABITACIONES B</text>
              <text x={270} y={102} textAnchor="middle" fontSize={8} fill="#BFDBFE">109–116</text>

              {/* Cocina */}
              <rect x={12} y={142} width={116} height={56} rx={4} fill="#FEF9C3" stroke="#FDE047" strokeWidth={1.5} />
              <text x={70} y={173} textAnchor="middle" fontSize={8.5} fill="#CA8A04" fontWeight={600}>COCINA</text>

              {/* Comedor */}
              <rect x={140} y={142} width={80} height={56} rx={4} fill="#DCFCE7" stroke="#86EFAC" strokeWidth={1.5} />
              <text x={180} y={173} textAnchor="middle" fontSize={8.5} fill="#16A34A" fontWeight={600}>COMEDOR</text>

              {/* Sala común */}
              <rect x={232} y={142} width={116} height={56} rx={4} fill="#F3E8FF" stroke="#D8B4FE" strokeWidth={1.5} />
              <text x={290} y={168} textAnchor="middle" fontSize={8.5} fill="#9333EA" fontWeight={600}>SALA</text>
              <text x={290} y={180} textAnchor="middle" fontSize={8.5} fill="#9333EA" fontWeight={600}>COMÚN</text>

              {/* Lavandería */}
              <rect x={12} y={210} width={116} height={56} rx={4} fill="#FEF3C7" stroke="#FCD34D" strokeWidth={1.5} />
              <text x={70} y={238} textAnchor="middle" fontSize={8.5} fill="#D97706" fontWeight={600}>LAVANDERÍA</text>

              {/* Recepción */}
              <rect x={232} y={210} width={116} height={56} rx={4} fill="#FDF0E6" stroke="#FDBA74" strokeWidth={1.5} />
              <text x={290} y={236} textAnchor="middle" fontSize={8.5} fill="#C85A2A" fontWeight={600}>RECEPCIÓN</text>
              <text x={290} y={248} textAnchor="middle" fontSize={8.5} fill="#C85A2A" fontWeight={600}>/ OFICINA</text>

              {/* Entrada */}
              <rect x={140} y={248} width={80} height={20} rx={4} fill="#E0F2FE" stroke="#7DD3FC" strokeWidth={1.5} />
              <text x={180} y={262} textAnchor="middle" fontSize={8} fill="#0284C7" fontWeight={600}>ENTRADA</text>

              {/* Marcadores — solo los que vienen de Firestore/mock */}
              {lugares.map((lugar) => (
                <MarcadorLugar
                  key={lugar.id}
                  x={lugar.x}
                  y={lugar.y}
                  icono={lugar.icono}
                  activo={seleccionado === lugar.id}
                  esAqui={ubicacionActual === lugar.id}
                  onClick={() => seleccionar(lugar.id)}
                  titulo={lugar.nombre}
                />
              ))}
            </svg>
          </div>

          {/* Panel de información del marcador seleccionado */}
          {lugarActivo ? (
            <div className="mx-4 mb-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{lugarActivo.icono}</span>
                  <p className="font-semibold text-gray-800 text-sm">{lugarActivo.nombre}</p>
                </div>
                <button
                  onClick={() => setSeleccionado(null)}
                  className="text-gray-400 text-lg leading-none active:text-gray-600"
                  aria-label="Cerrar"
                >
                  ×
                </button>
              </div>
              <p className="text-gray-500 text-xs mt-2 leading-relaxed">{lugarActivo.detalles}</p>
              <button
                onClick={() => toggleUbicacion(lugarActivo.id)}
                className={`mt-3 text-xs rounded-xl px-4 py-2 font-semibold border transition-colors ${
                  ubicacionActual === lugarActivo.id
                    ? "bg-green-100 border-green-300 text-green-700"
                    : "bg-white border-gray-200 text-gray-600 active:bg-gray-50"
                }`}
              >
                {ubicacionActual === lugarActivo.id ? "✓ Estás aquí" : "📍 Marcar como mi ubicación"}
              </button>
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center pb-4">
              Toca cualquier marcador para ver detalles
            </p>
          )}
        </div>
      )}
    </div>
  );
}
