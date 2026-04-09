"use client";
// Tarjeta de actividad para la app móvil
import { useState } from "react";
import { Actividad, TipoActividad } from "@/lib/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Clock, MapPin, Users, User, CheckCircle, Bookmark, BookmarkCheck } from "lucide-react";

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
  interesado?: boolean;
  onToggleInteres?: () => void;
}

export function TarjetaActividad({ actividad, registrado, onRegistrar, onCancelar, cargando, interesado = false, onToggleInteres }: Props) {
  const tipo = TIPO_CONFIG[actividad.tipo];
  const llena = actividad.registrados >= actividad.capacidadMax;
  const lugares = actividad.capacidadMax - actividad.registrados;
  const porcentaje = Math.min(Math.round((actividad.registrados / actividad.capacidadMax) * 100), 100);
  const [isHovered, setIsHovered] = useState(false);

  const getShadow = () => {
    if (!isHovered) {
      return registrado
        ? `0 0 0 2px ${tipo.text}, 0 10px 15px -3px rgb(0 0 0 / 0.1)`
        : undefined;
    }

    return registrado
      ? `0 0 0 2px ${tipo.text}, 0 0 20px ${tipo.text}60, 0 0 40px ${tipo.text}30, 0 10px 15px -3px rgb(0 0 0 / 0.1)`
      : `0 0 0 2px ${tipo.text}40, 0 0 15px ${tipo.text}30, 0 4px 6px -1px rgb(0 0 0 / 0.1)`;
  };

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-300 cursor-pointer group ${registrado ? "ring-2" : ""}`}
      style={{
        boxShadow: getShadow(),
        ...(registrado ? { "--tw-ring-color": tipo.text } as React.CSSProperties : {})
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Imagen de portada */}
      {actividad.imagenUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={actividad.imagenUrl}
          alt={actividad.titulo}
          className="w-full object-cover"
          style={{ aspectRatio: "16/7" }}
        />
      )}

      <div className="p-4 space-y-3">
      {/* Encabezado */}
      <div className="flex items-start justify-between gap-3 mb-1">
        <span
          className="text-xs font-bold px-3 py-1.5 rounded-full shrink-0"
          style={{ background: tipo.bg, color: tipo.text }}
        >
          {tipo.label}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          {/* Botón de interés en calendario */}
          {onToggleInteres && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleInteres(); }}
              title={interesado ? "Quitar del calendario" : "Añadir a mi calendario"}
              className="p-1.5 rounded-lg transition-colors"
              style={{
                color: interesado ? tipo.text : "#D1D5DB",
                backgroundColor: interesado ? `${tipo.bg}80` : "transparent"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = interesado ? tipo.bg : "#F9FAFB"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = interesado ? `${tipo.bg}80` : "transparent"}
            >
              {interesado ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            </button>
          )}
          {registrado && (
            <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: tipo.bg, color: tipo.text }}>
              <CheckCircle size={12} /> Inscrito
            </span>
          )}
            {!registrado && llena && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-600">Llena</span>
          )}
          {!registrado && !llena && lugares <= 5 && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
              {lugares} lugar{lugares !== 1 ? "es" : ""}
            </span>
          )}
        </div>
      </div>

      <div>
        <h3 className="font-bold text-gray-800 text-base leading-tight mb-1.5">{actividad.titulo}</h3>
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{actividad.descripcion}</p>
      </div>

      {/* Detalles */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: tipo.bg }}>
            <Clock size={13} style={{ color: tipo.text }} />
          </div>
          <span className="font-medium">
            {format(actividad.fechaHora.toDate(), "HH:mm", { locale: es })}
            <span className="text-gray-400"> · {actividad.duracionMin} min</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: tipo.bg }}>
            <MapPin size={13} style={{ color: tipo.text }} />
          </div>
          <span className="font-medium">{actividad.ubicacion}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: tipo.bg }}>
            <User size={13} style={{ color: tipo.text }} />
          </div>
          <span className="font-medium">{actividad.instructor}</span>
        </div>
      </div>

      {/* Barra de ocupación */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
            <Users size={12} /> {actividad.registrados}/{actividad.capacidadMax} inscritos
          </span>
          <span className="text-xs font-bold tabular-nums" style={{ color: porcentaje >= 90 ? "#EF4444" : tipo.text }}>
            {porcentaje}%
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${porcentaje}%`,
              background: porcentaje >= 90
                ? "linear-gradient(90deg, #EF4444, #DC2626)"
                : `linear-gradient(90deg, ${tipo.text}, ${tipo.text}dd)`,
            }}
          />
        </div>
      </div>

      {/* Acción */}
      {registrado ? (
        <button
          onClick={onCancelar}
          disabled={cargando}
          className="w-full py-3 rounded-xl text-sm font-bold border-2 transition-all disabled:opacity-50 min-h-[48px]"
          style={{
            borderColor: tipo.text,
            color: tipo.text,
            backgroundColor: `${tipo.bg}80`
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = tipo.bg}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = `${tipo.bg}80`}
        >
          {cargando ? "Cancelando..." : "Cancelar inscripción"}
        </button>
      ) : (
        <button
          onClick={onRegistrar}
          disabled={cargando || llena}
          className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
          style={{
            background: llena ? "#9CA3AF" : tipo.text,
            boxShadow: llena ? "none" : `0 2px 8px ${tipo.text}50`
          }}
        >
          {cargando ? "Inscribiendo..." : llena ? "Sin lugares disponibles" : "Inscribirme"}
        </button>
      )}
      </div>{/* /p-4 space-y-3 */}
    </div>
  );
}
