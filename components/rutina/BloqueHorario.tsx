// Componente de un bloque individual en la timeline de la rutina
import { BloqueRutina } from "@/lib/gemini";
import { Utensils, Car, Hospital, Coffee, Heart, User } from "lucide-react";

const configTipo: Record<BloqueRutina["tipo"], { icono: React.ElementType; color: string; bg: string }> = {
  alimentacion: { icono: Utensils, color: "text-orange-600", bg: "bg-orange-50" },
  traslado: { icono: Car, color: "text-blue-600", bg: "bg-blue-50" },
  hospital: { icono: Hospital, color: "text-[#C85A2A]", bg: "bg-[#FDF0E6]" },
  descanso: { icono: Coffee, color: "text-amber-600", bg: "bg-amber-50" },
  nino: { icono: Heart, color: "text-pink-600", bg: "bg-pink-50" },
  personal: { icono: User, color: "text-green-600", bg: "bg-green-50" },
};

interface BloqueHorarioProps {
  bloque: BloqueRutina;
  esUltimo?: boolean;
}

export function BloqueHorario({ bloque, esUltimo }: BloqueHorarioProps) {
  const { icono: Icono, color, bg } = configTipo[bloque.tipo] ?? configTipo.personal;

  return (
    <div className="flex gap-3">
      {/* Línea de tiempo */}
      <div className="flex flex-col items-center">
        <div className={`p-2 rounded-xl ${bg} shrink-0`}>
          <Icono size={16} className={color} />
        </div>
        {!esUltimo && <div className="w-px flex-1 bg-gray-100 my-1" />}
      </div>

      {/* Contenido */}
      <div className={`pb-4 ${esUltimo ? "" : ""}`}>
        <p className="text-xs font-semibold text-gray-400 mb-0.5">{bloque.hora}</p>
        <p className="text-sm text-gray-800 leading-relaxed">{bloque.descripcion}</p>
        {bloque.duracion_min > 0 && (
          <p className="text-xs text-gray-400 mt-0.5">{bloque.duracion_min} min</p>
        )}
      </div>
    </div>
  );
}
