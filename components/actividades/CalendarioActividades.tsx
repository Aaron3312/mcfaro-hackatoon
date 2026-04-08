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

const GRID_7: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
};

export function CalendarioActividades({ diasConActividad, diaSeleccionado, onSeleccionarDia }: Props) {
  const [mesActual, setMesActual] = useState(new Date());

  const inicio = startOfMonth(mesActual);
  const fin = endOfMonth(mesActual);
  const dias = eachDayOfInterval({ start: inicio, end: fin });

  // Offset para que el calendario empiece en lunes (0=lunes … 6=domingo)
  const offsetInicio = (getDay(inicio) + 6) % 7;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 w-full">
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
      <div style={GRID_7} className="mb-1">
        {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
          <div
            key={d}
            style={{ textAlign: "center" }}
            className="text-xs font-semibold text-gray-400 py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Cuadrícula de días */}
      <div style={{ ...GRID_7, gap: "2px" }}>
        {/* Celdas vacías para el offset */}
        {Array.from({ length: offsetInicio }).map((_, i) => (
          <div key={`vacio-${i}`} />
        ))}

        {dias.map((dia) => {
          const dd = format(dia, "dd");
          const tieneActividad =
            diasConActividad.has(dd) && dia.getMonth() === mesActual.getMonth();
          const seleccionado = isSameDay(dia, diaSeleccionado);
          const hoy = isToday(dia);

          return (
            <button
              key={dia.toISOString()}
              onClick={() => onSeleccionarDia(dia)}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                aspectRatio: "1",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 500,
                background: seleccionado ? "#C85A2A" : hoy ? "#FDF0E6" : "transparent",
                color: seleccionado ? "#fff" : hoy ? "#C85A2A" : "#374151",
                border: "none",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
            >
              {dd.replace(/^0/, "")}
              {tieneActividad && (
                <span
                  style={{
                    position: "absolute",
                    bottom: "3px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    background: seleccionado ? "#fff" : "#C85A2A",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
