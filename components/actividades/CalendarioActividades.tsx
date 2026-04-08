"use client";
// Mini calendario mensual con marcadores de días con actividades
import { useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  format,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  diasConActividad: Set<string>; // días en formato "DD"
  diaSeleccionado: Date;
  onSeleccionarDia: (dia: Date) => void;
}

export function CalendarioActividades({ diasConActividad, diaSeleccionado, onSeleccionarDia }: Props) {
  const [mesActual, setMesActual] = useState(new Date());

  const inicio = startOfMonth(mesActual);
  const fin = endOfMonth(mesActual);
  const dias = eachDayOfInterval({ start: inicio, end: fin });

  // Offset para que el calendario empiece en lunes (0=lunes, 6=domingo)
  const offsetInicio = (getDay(inicio) + 6) % 7;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      {/* Navegación del mes */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setMesActual((m) => subMonths(m, 1))}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft size={16} className="text-gray-500" />
        </button>
        <span className="text-sm font-bold capitalize text-gray-700">
          {format(mesActual, "MMMM yyyy", { locale: es })}
        </span>
        <button
          onClick={() => setMesActual((m) => addMonths(m, 1))}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronRight size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Cabecera días semana */}
      <div className="grid grid-cols-7 mb-1">
        {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Cuadrícula de días */}
      <div className="grid grid-cols-7 gap-y-1">
        {/* Celdas vacías para el offset */}
        {Array.from({ length: offsetInicio }).map((_, i) => (
          <div key={`vacio-${i}`} />
        ))}

        {dias.map((dia) => {
          const dd = format(dia, "dd");
          const tieneActividad = diasConActividad.has(dd) &&
            dia.getMonth() === mesActual.getMonth();
          const seleccionado = isSameDay(dia, diaSeleccionado);
          const hoy = isToday(dia);

          return (
            <button
              key={dia.toISOString()}
              onClick={() => onSeleccionarDia(dia)}
              className="relative flex flex-col items-center justify-center aspect-square rounded-xl text-sm font-medium transition-colors"
              style={{
                background: seleccionado ? "#C85A2A" : hoy ? "#FDF0E6" : "transparent",
                color: seleccionado ? "#fff" : hoy ? "#C85A2A" : "#374151",
              }}
            >
              {dd.replace(/^0/, "")}
              {tieneActividad && (
                <span
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ background: seleccionado ? "#fff" : "#C85A2A" }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
