"use client";
// Pantalla de rutina diaria — responsive: 1 col mobile / 2 cols desktop
import { useAuth } from "@/hooks/useAuth";
import { useRutina } from "@/hooks/useRutina";
import { BloqueHorario } from "@/components/rutina/BloqueHorario";
import { SkeletonBloqueRutina } from "@/components/ui/Skeleton";
import { RefreshCw, Sparkles, Info, Clock } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function RutinaPage() {
  const { familia } = useAuth();
  const { rutina, cargando, generando, error, generarRutina } = useRutina(familia?.id);

  const hoy = new Date();
  const fechaFormateada = format(hoy, "EEEE d 'de' MMMM", { locale: es });

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Tu rutina</h1>
              <p className="text-white/70 text-sm mt-1 capitalize">{fechaFormateada}</p>
            </div>
            {rutina && (
              <button
                onClick={generarRutina}
                disabled={generando}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 active:bg-white/40 text-white rounded-2xl px-4 py-3 text-sm font-semibold transition-colors min-h-[48px] disabled:opacity-60"
              >
                <RefreshCw size={16} className={generando ? "animate-spin" : ""} />
                <span className="hidden sm:inline">{generando ? "Generando…" : "Regenerar"}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Contenido ────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-4 md:px-10 md:pt-8 md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:gap-8">

        {/* Columna principal */}
        <div>
          {/* Cargando / generando */}
          {(cargando || generando) && (
            <div className="bg-white rounded-2xl shadow-sm p-5">
              {generando && (
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-50">
                  <Sparkles className="animate-pulse" size={18} style={{ color: "#E87A3A" }} />
                  <p className="text-sm text-gray-500">Gemini está pensando tu rutina…</p>
                </div>
              )}
              <div className="space-y-1">
                {[1, 2, 3, 4, 5].map((i) => <SkeletonBloqueRutina key={i} />)}
              </div>
            </div>
          )}

          {/* Error */}
          {error && !generando && (
            <div className="rounded-2xl p-6 text-center" style={{ background: "#FDF0E6" }}>
              <p className="font-medium mb-3" style={{ color: "#C85A2A" }}>{error}</p>
              <button
                onClick={generarRutina}
                className="px-6 py-3 rounded-xl text-sm font-bold text-white"
                style={{ background: "#C85A2A" }}
              >
                Intentar de nuevo
              </button>
            </div>
          )}

          {/* Sin rutina */}
          {!rutina && !cargando && !generando && !error && (
            <div className="text-center py-14 bg-white rounded-2xl shadow-sm">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: "#FDF0E6" }}>
                <Sparkles size={32} style={{ color: "#E87A3A" }} />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Sin rutina para hoy</h2>
              <p className="text-gray-400 text-sm mt-2 mb-7 px-6">
                Gemini generará una rutina personalizada basada en tus citas del día
              </p>
              <button
                onClick={generarRutina}
                className="px-8 py-4 rounded-2xl text-base font-bold text-white shadow-md hover:opacity-90 active:scale-95 transition-all"
                style={{ background: "linear-gradient(135deg, #C85A2A, #E87A3A)" }}
              >
                ✨ Generar mi rutina
              </button>
            </div>
          )}

          {/* Rutina cargada */}
          {rutina && !cargando && !generando && (
            <>
              <div className="bg-white rounded-2xl shadow-sm p-5">
                {rutina.bloques.map((bloque, i) => (
                  <BloqueHorario
                    key={i}
                    bloque={bloque}
                    esUltimo={i === rutina.bloques.length - 1}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-300 text-center mt-4">
                Generada por Gemini · Disponible sin internet
              </p>
            </>
          )}
        </div>

        {/* Sidebar — solo desktop */}
        <div className="hidden md:block space-y-4">
          {/* Qué es la rutina */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <Info size={15} style={{ color: "#C85A2A" }} />
              <h2 className="text-xs font-bold uppercase tracking-wide" style={{ color: "#9A6A2A" }}>
                ¿Qué es esto?
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-gray-600">
              Gemini genera una rutina diaria gentil adaptada a tus citas. Incluye recordatorios de alimentación,
              descanso y momentos con tu hijo/a.
            </p>
          </div>

          {/* Stats de la rutina */}
          {rutina && (
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="text-xs font-bold uppercase tracking-wide mb-4" style={{ color: "#9A6A2A" }}>
                Resumen del día
              </h2>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "#FDF0E6" }}>
                  <Clock size={16} style={{ color: "#C85A2A" }} />
                  <div>
                    <p className="text-lg font-bold" style={{ color: "#7A3D1A" }}>
                      {rutina.bloques.length}
                    </p>
                    <p className="text-xs text-gray-500">Bloques en tu rutina</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Regenerar en desktop */}
          {rutina && (
            <button
              onClick={generarRutina}
              disabled={generando}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold border-2 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-60 transition-colors"
              style={{ borderColor: "#C85A2A", color: "#C85A2A" }}
            >
              <RefreshCw size={16} className={generando ? "animate-spin" : ""} />
              {generando ? "Generando…" : "Regenerar rutina"}
            </button>
          )}

          {/* Tip bienestar */}
          <div className="rounded-2xl p-4" style={{ background: "#FFF8E6" }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "#9A6A2A" }}>
              Recuerda
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "#7A3D1A" }}>
              Una rutina flexible es mejor que ninguna. Ajústala según cómo te sientas hoy.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
