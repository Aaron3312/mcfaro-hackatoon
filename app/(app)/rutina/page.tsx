"use client";
// Rutina diaria generada con Gemini AI
import { useRutina } from "@/hooks/useRutina";
import { BloqueHorario } from "@/components/rutina/BloqueHorario";
import { Toast } from "@/components/ui/Toast";
import { Sparkles, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";

export default function RutinaPage() {
  const { bloques, cargando, generando, generarRutina } = useRutina();
  const [toast, setToast] = useState<string | null>(null);
  const hoy = new Date();

  const handleGenerar = async () => {
    try {
      await generarRutina();
      setToast("Rutina generada con IA ✨");
    } catch {
      setToast("Error al generar. Intenta de nuevo.");
    }
  };

  return (
    <>
      {/* ── Banner ───────────────────────────────────────────── */}
      <div className="relative overflow-hidden w-full"
        style={{ background: "linear-gradient(135deg, #C85A2A 0%, #E87A3A 70%, #F5C842 100%)" }}>
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-15"
          style={{ background: "#7A3D1A" }} />
        <div className="max-w-6xl mx-auto px-5 py-8 md:px-10 md:py-10">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Mi rutina</h1>
          <p className="text-white/70 text-sm mt-1 capitalize">
            {format(hoy, "EEEE d 'de' MMMM", { locale: es })}
          </p>
        </div>
      </div>

      {/* ── Contenido ────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 pt-5 pb-4 md:px-10 md:pt-8
                      md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-8 md:items-start">

        {/* Columna izquierda — timeline */}
        <div>
          {cargando ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : bloques.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <Sparkles size={36} className="mx-auto mb-3 text-gray-200" />
              <p className="text-gray-500 font-medium text-sm">Sin rutina para hoy</p>
              <p className="text-gray-400 text-xs mt-1">Genera una personalizada con IA</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm p-4">
              {bloques.map((bloque, i) => (
                <BloqueHorario key={i} bloque={bloque} />
              ))}
            </div>
          )}
        </div>

        {/* Columna derecha — acciones */}
        <div className="mt-5 md:mt-0 space-y-3">
          <button
            onClick={handleGenerar}
            disabled={generando}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-semibold text-base min-h-[56px] disabled:opacity-60 transition-colors"
            style={{ background: "#C85A2A" }}>
            {generando
              ? <><RefreshCw size={18} className="animate-spin" /> Generando con IA…</>
              : <><Sparkles size={18} /> {bloques.length > 0 ? "Regenerar rutina" : "Generar con IA"}</>
            }
          </button>

          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#9A6A2A" }}>
              ¿Cómo funciona?
            </p>
            <p className="text-sm text-gray-500 leading-relaxed">
              La IA analiza tus citas de hoy y crea una rutina personalizada con momentos de hospital, descanso, alimentación y bienestar.
            </p>
          </div>

          <div className="rounded-2xl p-4"
            style={{ background: "linear-gradient(135deg, #FFF8E6, #FEF3C7)" }}>
            <p className="text-sm font-medium leading-relaxed" style={{ color: "#7A3D1A" }}>
              🌟 Cuidarte no es egoísmo — es la fuente de energía que necesita tu familia.
            </p>
          </div>
        </div>
      </div>

      {toast && <Toast mensaje={toast} tipo="exito" onCerrar={() => setToast(null)} />}
    </>
  );
}
