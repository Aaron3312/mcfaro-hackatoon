"use client";
// Tarjeta individual de una cita con acciones editar/eliminar
import { Cita } from "@/lib/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Clock, Pencil, Trash2, Stethoscope, FlaskConical, Activity, Tag } from "lucide-react";

const iconosServicio: Record<Cita["servicio"], React.ElementType> = {
  consulta:     Stethoscope,
  estudio:      FlaskConical,
  procedimiento: Activity,
  otro:         Tag,
};

const coloresServicio: Record<Cita["servicio"], { bg: string; texto: string }> = {
  consulta:     { bg: "#EFF6FF", texto: "#3B82F6" },
  estudio:      { bg: "#F0FDF4", texto: "#22C55E" },
  procedimiento: { bg: "#FDF4FF", texto: "#A855F7" },
  otro:         { bg: "#F3F4F6", texto: "#6B7280" },
};

interface TarjetaCitaProps {
  cita: Cita;
  onEditar: (cita: Cita) => void;
  onEliminar: (id: string) => void;
}

export function TarjetaCita({ cita, onEditar, onEliminar }: TarjetaCitaProps) {
  const fecha = cita.fecha.toDate();
  const Icono = iconosServicio[cita.servicio];
  const { bg, texto } = coloresServicio[cita.servicio];

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 flex gap-3 items-start"
      style={{ borderLeft: "4px solid #C85A2A" }}>
      {/* Icono servicio */}
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: bg }}>
        <Icono size={18} style={{ color: texto }} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-800 text-sm truncate">{cita.titulo}</p>
        <div className="flex items-center gap-1.5 mt-0.5 text-gray-400 text-xs">
          <Clock size={11} />
          <span>{format(fecha, "HH:mm")} · {format(fecha, "EEE d MMM", { locale: es })}</span>
        </div>
        {cita.notas && (
          <p className="text-xs text-gray-400 mt-1 line-clamp-1">{cita.notas}</p>
        )}
        {/* Recordatorios */}
        <div className="flex gap-1.5 mt-2 flex-wrap">
          {cita.recordatorio60 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium">
              ⏰ 60 min
            </span>
          )}
          {cita.recordatorio15 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium">
              ⏰ 15 min
            </span>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="flex flex-col gap-1 shrink-0">
        <button
          onClick={() => onEditar(cita)}
          className="w-8 h-8 rounded-xl flex items-center justify-center active:bg-gray-100"
          style={{ background: "#F3F4F6" }}>
          <Pencil size={13} className="text-gray-500" />
        </button>
        <button
          onClick={() => onEliminar(cita.id)}
          className="w-8 h-8 rounded-xl flex items-center justify-center active:bg-red-50">
          <Trash2 size={13} className="text-red-400" />
        </button>
      </div>
    </div>
  );
}
