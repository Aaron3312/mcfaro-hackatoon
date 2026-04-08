"use client";
// Tarjeta de comida individual en la vista del menú
import { Comida } from "@/lib/types";
import { Sunrise, Sun, Moon, Check } from "lucide-react";

const iconosPorTipo = {
  desayuno: Sunrise,
  comida: Sun,
  cena: Moon,
};

const etiquetasPorTipo = {
  desayuno: "Desayuno",
  comida: "Comida",
  cena: "Cena",
};

interface TarjetaComidaProps {
  tipo: "desayuno" | "comida" | "cena";
  comida: Comida;
  esCoordinador?: boolean;
  onMarcarDisponible?: () => void;
}

export function TarjetaComida({
  tipo,
  comida,
  esCoordinador = false,
  onMarcarDisponible,
}: TarjetaComidaProps) {
  const Icono = iconosPorTipo[tipo];
  const etiqueta = etiquetasPorTipo[tipo];

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-xl"
            style={{ background: "#FDF0E6" }}
          >
            <Icono size={22} style={{ color: "#C85A2A" }} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{etiqueta}</h3>
            <p className="text-2xl font-bold mt-0.5" style={{ color: "#7A3D1A" }}>
              {comida.hora}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 items-end">
          {/* Badge GRATUITO siempre visible */}
          <span
            className="px-3 py-1 rounded-full text-xs font-bold"
            style={{ background: "#FFF8E6", color: "#7A3D1A" }}
          >
            GRATUITO ❤️
          </span>

          {/* Badge DISPONIBLE cuando está listo */}
          {comida.disponible && (
            <span
              className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
              style={{ background: "#D1FAE5", color: "#065F46" }}
            >
              <Check size={12} />
              DISPONIBLE
            </span>
          )}
        </div>
      </div>

      {/* Descripción del menú */}
      <p className="text-gray-700 leading-relaxed mb-4">
        {comida.descripcion}
      </p>

      {/* Botón para coordinadores */}
      {esCoordinador && !comida.disponible && (
        <button
          onClick={onMarcarDisponible}
          className="w-full py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 active:scale-95 min-h-[48px]"
          style={{ background: "linear-gradient(135deg, #C85A2A, #E87A3A)" }}
        >
          Marcar como disponible
        </button>
      )}
    </div>
  );
}
