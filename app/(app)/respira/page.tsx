"use client";
// Módulo de bienestar — responsive: 1 col mobile / 2 cols desktop
import { TemporizadorRespiracion } from "@/components/respira/TemporizadorRespiracion";

const recordatorios = [
  {
    emoji: "💧",
    titulo: "Toma agua",
    descripcion: "Intenta tomar al menos 8 vasos al día, aunque estés ocupado.",
  },
  {
    emoji: "🚶",
    titulo: "Camina un poco",
    descripcion: "5 minutos caminando por el pasillo ayudan a despejar la mente.",
  },
  {
    emoji: "🍎",
    titulo: "Come algo nutritivo",
    descripcion: "Tu energía es la energía de tu familia. Aliméntate bien.",
  },
  {
    emoji: "🤝",
    titulo: "Pide ayuda",
    descripcion: "No tienes que estar solo. El equipo de Casa Ronald está aquí.",
  },
];

export default function RespiraPage() {
  return (
    <>
      {/* ── Banner ───────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden w-full"
        style={{ background: "linear-gradient(135deg, #C85A2A 0%, #E87A3A 70%, #F5C842 100%)" }}
      >
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-15"
          style={{ background: "#7A3D1A" }} />
        <div className="max-w-6xl mx-auto px-5 py-8 md:px-10 md:py-10">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Respira</h1>
          <p className="text-white/70 text-sm mt-1">Dos minutos para ti. Lo mereces.</p>
        </div>
      </div>

      {/* ── Contenido ────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-4 md:px-10 md:pt-8 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-8 md:items-start">

        {/* Temporizador */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 pt-5 pb-1 border-b border-gray-50">
            <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: "#9A6A2A" }}>
              Respiración guiada 4-7-8
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">3 ciclos · ~2 minutos</p>
          </div>
          <TemporizadorRespiracion />
        </div>

        {/* Recordatorios de bienestar */}
        <div className="mt-6 md:mt-0 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wide" style={{ color: "#9A6A2A" }}>
            Recordatorios de bienestar
          </h2>
          {recordatorios.map((r, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm p-4 flex gap-3 items-start hover:shadow-md transition-shadow"
            >
              <span className="text-2xl shrink-0 mt-0.5">{r.emoji}</span>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{r.titulo}</p>
                <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{r.descripcion}</p>
              </div>
            </div>
          ))}

          {/* Mensaje de apoyo */}
          <div className="rounded-2xl p-4 mt-2" style={{ background: "linear-gradient(135deg, #FFF8E6, #FEF3C7)" }}>
            <p className="text-sm font-medium leading-relaxed" style={{ color: "#7A3D1A" }}>
              🌟 Cuidarte no es egoísmo — es la fuente de energía que necesita tu familia.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
