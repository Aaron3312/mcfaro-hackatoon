"use client";
// Tarjeta de actividad para la app móvil
import { Actividad, TipoActividad } from "@/lib/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Clock, MapPin, Users, User, CheckCircle } from "lucide-react";

const TIPO_CONFIG: Record<TipoActividad, { label: string; bg: string; text: string }> = {
  arte:       { label: "Arte",       bg: "#FEE2E2", text: "#991B1B" },
  deporte:    { label: "Deporte",    bg: "#D1FAE5", text: "#065F46" },
  educacion:  { label: "Educación",  bg: "#DBEAFE", text: "#1E40AF" },
  bienestar:  { label: "Bienestar",  bg: "#EDE9FE", text: "#5B21B6" },
  recreacion: { label: "Recreación", bg: "#FEF3C7", text: "#92400E" },
  otro:       { label: "Otro",       bg: "#F3F4F6", text: "#374151" },
};

interface Props {
  actividad: Actividad;
  registrado: boolean;
  onRegistrar: () => void;
  onCancelar: () => void;
  cargando: boolean;
}

export function TarjetaActividad({ actividad, registrado, onRegistrar, onCancelar, cargando }: Props) {
  const tipo = TIPO_CONFIG[actividad.tipo];
  const llena = actividad.registrados >= actividad.capacidadMax;
  const lugares = actividad.capacidadMax - actividad.registrados;
  const porcentaje = Math.min(Math.round((actividad.registrados / actividad.capacidadMax) * 100), 100);

  return (
    <div className={`bg-white rounded-2xl shadow-sm p-4 ${registrado ? "ring-2 ring-orange-400" : ""}`}>
      {/* Encabezado */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
          style={{ background: tipo.bg, color: tipo.text }}
        >
          {tipo.label}
        </span>
        {registrado && (
          <span className="flex items-center gap-1 text-xs font-semibold shrink-0" style={{ color: "#C85A2A" }}>
            <CheckCircle size={13} /> Inscrito
          </span>
        )}
        {!registrado && llena && (
          <span className="text-xs font-semibold text-red-500 shrink-0">Llena</span>
        )}
        {!registrado && !llena && lugares <= 5 && (
          <span className="text-xs font-semibold text-amber-600 shrink-0">
            {lugares} lugar{lugares !== 1 ? "es" : ""} disponible{lugares !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <h3 className="font-bold text-gray-800 mb-1">{actividad.titulo}</h3>
      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{actividad.descripcion}</p>

      {/* Detalles */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Clock size={12} style={{ color: "#C85A2A" }} />
          <span>
            {format(actividad.fechaHora.toDate(), "HH:mm", { locale: es })}
            {" · "}{actividad.duracionMin} min
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <MapPin size={12} style={{ color: "#C85A2A" }} />
          <span>{actividad.ubicacion}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <User size={12} style={{ color: "#C85A2A" }} />
          <span>{actividad.instructor}</span>
        </div>
      </div>

      {/* Barra de ocupación */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Users size={11} /> {actividad.registrados}/{actividad.capacidadMax}
          </span>
          <span className="text-xs" style={{ color: porcentaje >= 90 ? "#EF4444" : "#9CA3AF" }}>
            {porcentaje}%
          </span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${porcentaje}%`,
              background: porcentaje >= 90 ? "#EF4444" : "#C85A2A",
            }}
          />
        </div>
      </div>

      {/* Acción */}
      {registrado ? (
        <button
          onClick={onCancelar}
          disabled={cargando}
          className="w-full py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors disabled:opacity-50 min-h-[44px]"
          style={{ borderColor: "#C85A2A", color: "#C85A2A" }}
        >
          {cargando ? "…" : "Cancelar inscripción"}
        </button>
      ) : (
        <button
          onClick={onRegistrar}
          disabled={cargando || llena}
          className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-opacity disabled:opacity-50 min-h-[44px]"
          style={{ background: llena ? "#D1D5DB" : "#C85A2A" }}
        >
          {cargando ? "…" : llena ? "Sin lugares disponibles" : "Inscribirme"}
        </button>
      )}
    </div>
  );
}
