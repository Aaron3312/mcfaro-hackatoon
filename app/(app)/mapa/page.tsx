"use client";
// Guía visual del hospital y Casa Ronald — responsive: 1 col mobile / 2 cols desktop
import { Clock, MapPin, Phone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMapa } from "@/hooks/useMapa";
import { PlanoInteractivo } from "@/components/mapa/PlanoInteractivo";

const puntosInteres = [
  { nombre: "Recepción principal", descripcion: "Entrada principal del hospital", icono: "🏥", categoria: "hospital" },
  { nombre: "Oncología pediátrica", descripcion: "Piso 3, ala norte", icono: "🩺", categoria: "hospital" },
  { nombre: "Laboratorio", descripcion: "Piso 1, junto a urgencias", icono: "🔬", categoria: "hospital" },
  { nombre: "Cafetería", descripcion: "Planta baja, abierta 7:00–20:00", icono: "☕", categoria: "servicios" },
  { nombre: "Casa Ronald McDonald", descripcion: "A 5 minutos caminando por Av. Hospital", icono: "🏠", categoria: "ronald" },
  { nombre: "Farmacia", descripcion: "Salida lateral, calle Reforma", icono: "💊", categoria: "servicios" },
];

const categoriaColor: Record<string, string> = {
  hospital: "#EFF6FF",
  servicios: "#F0FDF4",
  ronald: "#FDF0E6",
};

const categoriaTexto: Record<string, string> = {
  hospital: "#1D4ED8",
  servicios: "#15803D",
  ronald: "#C85A2A",
};

export default function MapaPage() {
  const { familia } = useAuth();
  const { lugares, ubicacionActual, actualizarUbicacion, cargando } = useMapa(
    familia?.id,
    familia?.casaRonald
  );

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
          <h1 className="text-2xl md:text-3xl font-bold text-white">Guía del lugar</h1>
          <p className="text-white/70 text-sm mt-1">Hospital y Casa Ronald McDonald</p>
        </div>
      </div>

      {/* ── Contenido ────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-4 md:px-10 md:pt-8 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-8 md:items-start">

        {/* Columna izquierda — plano + traslado */}
        <div className="space-y-4">
          {/* Tarjeta de traslado */}
          <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "#ECFDF5" }}>
              <Clock className="text-emerald-600" size={22} />
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm">Tiempo de traslado</p>
              <p className="text-gray-500 text-xs mt-0.5">~20 minutos de Casa Ronald al hospital</p>
            </div>
          </div>

          {/* Plano interactivo conectado a Firestore */}
          <PlanoInteractivo
            lugares={lugares}
            ubicacionActual={ubicacionActual}
            onUbicacionChange={actualizarUbicacion}
            cargando={cargando}
          />

          {/* Orientación */}
          <div className="bg-white rounded-2xl shadow-sm p-4 flex items-start gap-3"
            style={{ borderLeft: "4px solid #C85A2A" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "#FDF0E6" }}>
              <MapPin size={18} style={{ color: "#C85A2A" }} />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: "#7A3D1A" }}>
                ¿Necesitas ayuda para orientarte?
              </p>
              <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#9A6A2A" }}>
                Acércate al personal de Casa Ronald o a recepción del hospital.
              </p>
            </div>
          </div>

          {/* Teléfonos de contacto — desktop */}
          <div className="bg-white rounded-2xl shadow-sm p-5 hidden md:block">
            <h3 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "#9A6A2A" }}>
              Contacto rápido
            </h3>
            <div className="space-y-2">
              {[
                { nombre: "Casa Ronald McDonald", tel: "Sin número registrado" },
                { nombre: "Recepción del hospital", tel: "Sin número registrado" },
              ].map((c, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <Phone size={14} className="text-gray-400 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-gray-700">{c.nombre}</p>
                    <p className="text-xs text-gray-400">{c.tel}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Columna derecha — puntos de interés */}
        <div className="mt-6 md:mt-0">
          <h2 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "#9A6A2A" }}>
            Puntos de interés
          </h2>
          <div className="space-y-2">
            {puntosInteres.map((punto, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-sm p-4 flex gap-3 items-start hover:shadow-md transition-shadow"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-xl"
                  style={{ background: categoriaColor[punto.categoria] }}
                >
                  {punto.icono}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">{punto.nombre}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{punto.descripcion}</p>
                </div>
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-lg shrink-0 self-start mt-0.5"
                  style={{
                    background: categoriaColor[punto.categoria],
                    color: categoriaTexto[punto.categoria],
                  }}
                >
                  {punto.categoria === "ronald" ? "Casa Ronald" : punto.categoria}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
