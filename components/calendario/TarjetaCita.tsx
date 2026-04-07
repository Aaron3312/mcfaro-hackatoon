"use client";
// Tarjeta de cita individual en la vista del calendario
import { Cita } from "@/lib/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Clock, Stethoscope, FlaskConical, Scissors, HelpCircle, Trash2, Edit2 } from "lucide-react";

const iconosServicio = {
  consulta: Stethoscope,
  estudio: FlaskConical,
  procedimiento: Scissors,
  otro: HelpCircle,
};

const coloresServicio = {
  consulta: "bg-blue-50 text-blue-700 border-blue-200",
  estudio: "bg-purple-50 text-purple-700 border-purple-200",
  procedimiento: "bg-orange-50 text-orange-700 border-orange-200",
  otro: "bg-gray-50 text-gray-700 border-gray-200",
};

interface TarjetaCitaProps {
  cita: Cita;
  onEditar?: (cita: Cita) => void;
  onEliminar?: (id: string) => void;
}

export function TarjetaCita({ cita, onEditar, onEliminar }: TarjetaCitaProps) {
  const fechaCita = cita.fecha.toDate();
  const Icono = iconosServicio[cita.servicio];
  const color = coloresServicio[cita.servicio];
  const esPasada = fechaCita < new Date();

  return (
    <div
      className={`bg-white rounded-2xl p-4 border shadow-sm transition-opacity ${
        esPasada ? "opacity-60" : ""
      } border-gray-100`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-xl border ${color} shrink-0`}>
          <Icono size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-base truncate">{cita.titulo}</p>
          <div className="flex items-center gap-1 mt-1 text-gray-500 text-sm">
            <Clock size={13} />
            <span>{format(fechaCita, "EEEE d 'de' MMMM, HH:mm", { locale: es })}</span>
          </div>
          {cita.notas && <p className="mt-2 text-sm text-gray-500 line-clamp-2">{cita.notas}</p>}
        </div>
        <div className="flex gap-1 shrink-0">
          {onEditar && (
            <button
              onClick={() => onEditar(cita)}
              className="p-2 text-gray-400 active:text-blue-600 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Editar cita"
            >
              <Edit2 size={16} />
            </button>
          )}
          {onEliminar && (
            <button
              onClick={() => onEliminar(cita.id)}
              className="p-2 text-gray-400 active:text-[#C85A2A] rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Eliminar cita"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
