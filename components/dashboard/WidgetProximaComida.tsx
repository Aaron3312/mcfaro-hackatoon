"use client";
// Widget que muestra la próxima comida del día
import { UtensilsCrossed, Clock, Check } from "lucide-react";
import Link from "next/link";

interface WidgetProximaComidaProps {
  tipo: string | null;
  hora: string | null;
  disponible: boolean;
}

export function WidgetProximaComida({ tipo, hora, disponible }: WidgetProximaComidaProps) {
  if (!tipo || !hora) {
    return (
      <Link
        href="/menu"
        className="block bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow min-h-[120px]"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-ronald-beige">
            <UtensilsCrossed size={22} className="text-ronald-orange" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-700">No hay menú publicado</p>
            <p className="text-xs text-gray-400 mt-0.5">Toca para ver el menú</p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href="/menu"
      className="block bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow min-h-[120px]"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-ronald-beige">
            <UtensilsCrossed size={22} className="text-ronald-orange" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-ronald-brown-medium">
              Próxima comida
            </p>
            <p className="font-bold text-gray-900 text-base">{tipo}</p>
          </div>
        </div>
        {disponible && (
          <span
            className="px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1"
            style={{ background: "#D1FAE5", color: "#065F46" }}
          >
            <Check size={10} />
            LISTO
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 mt-3">
        <Clock size={14} className="text-ronald-orange" />
        <span className="text-sm font-semibold text-ronald-brown">
          {hora}
        </span>
        {!disponible && (
          <span className="text-xs text-gray-400 ml-auto hidden sm:inline">Te avisaremos</span>
        )}
      </div>
      {disponible && (
        <div className="mt-2 px-3 py-1 rounded-lg text-xs font-medium bg-ronald-cream text-ronald-brown">
          ¡La comida está lista! 🍽️ GRATUITO ❤️
        </div>
      )}
    </Link>
  );
}
