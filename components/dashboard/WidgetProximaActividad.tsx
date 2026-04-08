"use client";
// Widget que muestra la próxima actividad registrada
import { Activity, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { Actividad } from "@/lib/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface WidgetProximaActividadProps {
  actividad: Actividad | null;
}

const iconosPorTipo = {
  arte: "🎨",
  deporte: "⚽",
  educacion: "📚",
  bienestar: "🧘",
  recreacion: "🎮",
  otro: "✨",
};

export function WidgetProximaActividad({ actividad }: WidgetProximaActividadProps) {
  if (!actividad) {
    return (
      <Link
        href="/actividades"
        className="block bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "#F0F9FF" }}
          >
            <Activity size={22} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-700">Sin actividades registradas</p>
            <p className="text-xs text-gray-400 mt-0.5">Toca para ver eventos disponibles</p>
          </div>
        </div>
      </Link>
    );
  }

  const fechaActividad = actividad.fechaHora.toDate();
  const emoji = iconosPorTipo[actividad.tipo] || "✨";

  return (
    <Link
      href="/actividades"
      className="block bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-2xl"
          style={{ background: "#F0F9FF" }}
        >
          {emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-blue-600 mb-0.5">
            Próxima actividad
          </p>
          <p className="font-bold text-gray-900 text-sm truncate">{actividad.titulo}</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Clock size={13} className="text-blue-600 shrink-0" />
          <span className="text-xs text-gray-600">
            {format(fechaActividad, "EEEE d 'de' MMMM, HH:mm", { locale: es })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={13} className="text-blue-600 shrink-0" />
          <span className="text-xs text-gray-600 truncate">{actividad.ubicacion}</span>
        </div>
      </div>

      {actividad.instructor && (
        <div className="mt-2 text-xs text-gray-500">
          Con <span className="font-medium">{actividad.instructor}</span>
        </div>
      )}
    </Link>
  );
}
