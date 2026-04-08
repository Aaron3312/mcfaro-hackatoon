"use client";
// Widget que muestra la próxima cita médica
import { Calendar, Clock, Stethoscope } from "lucide-react";
import Link from "next/link";
import { Cita } from "@/lib/types";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";

interface WidgetProximaCitaProps {
  cita: Cita | null;
}

export function WidgetProximaCita({ cita }: WidgetProximaCitaProps) {
  if (!cita) {
    return (
      <Link
        href="/calendario"
        className="block bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "#EFF6FF" }}
          >
            <Calendar size={22} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-700">Sin citas próximas</p>
            <p className="text-xs text-gray-400 mt-0.5">Toca para ver el calendario</p>
          </div>
        </div>
      </Link>
    );
  }

  const fechaCita = cita.fecha.toDate();
  const diasRestantes = differenceInDays(fechaCita, new Date());

  let etiquetaTiempo: string;
  if (diasRestantes === 0) {
    etiquetaTiempo = "Hoy";
  } else if (diasRestantes === 1) {
    etiquetaTiempo = "Mañana";
  } else {
    etiquetaTiempo = `En ${diasRestantes} días`;
  }

  return (
    <Link
      href="/calendario"
      className="block bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "#EFF6FF" }}
          >
            <Stethoscope size={22} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
              Próxima cita
            </p>
            <p className="font-bold text-gray-900 text-base truncate">{cita.titulo}</p>
          </div>
        </div>
        {diasRestantes <= 1 && (
          <span
            className="px-2 py-1 rounded-full text-[10px] font-bold"
            style={{ background: "#FEF3C7", color: "#F59E0B" }}
          >
            {etiquetaTiempo}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 mt-3">
        <Clock size={14} className="text-blue-600" />
        <span className="text-sm font-semibold text-gray-700">
          {format(fechaCita, "EEEE d 'de' MMMM, HH:mm", { locale: es })}
        </span>
      </div>

      {cita.notas && (
        <p className="mt-2 text-xs text-gray-500 line-clamp-1">{cita.notas}</p>
      )}

      {diasRestantes > 1 && (
        <div className="mt-2 text-xs text-gray-400">
          Faltan {diasRestantes} días
        </div>
      )}
    </Link>
  );
}
