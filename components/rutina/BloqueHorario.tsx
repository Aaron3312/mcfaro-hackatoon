// Bloque visual de una hora en la rutina diaria
import { BloqueRutina } from "@/lib/types";

const estilosTipo: Record<BloqueRutina["tipo"], { bg: string; borde: string; emoji: string }> = {
  hospital:     { bg: "#EFF6FF", borde: "#BFDBFE", emoji: "🏥" },
  descanso:     { bg: "#F0FDF4", borde: "#BBF7D0", emoji: "😴" },
  alimentacion: { bg: "#FFF7ED", borde: "#FED7AA", emoji: "🍽️" },
  actividad:    { bg: "#FDF0E6", borde: "#F5C842", emoji: "🌟" },
};

export function BloqueHorario({ bloque }: { bloque: BloqueRutina }) {
  const { bg, borde, emoji } = estilosTipo[bloque.tipo];

  return (
    <div className="flex gap-3 items-start">
      {/* Línea de tiempo */}
      <div className="flex flex-col items-center shrink-0">
        <span className="text-xs font-bold text-gray-400 w-10 text-right">{bloque.hora}</span>
        <div className="w-px flex-1 bg-gray-100 mt-1" style={{ minHeight: 24 }} />
      </div>
      {/* Tarjeta */}
      <div className="flex-1 rounded-2xl p-3 mb-2 border"
        style={{ background: bg, borderColor: borde }}>
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-base">{emoji}</span>
          <p className="text-sm font-semibold text-gray-800">{bloque.titulo}</p>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">{bloque.descripcion}</p>
      </div>
    </div>
  );
}
