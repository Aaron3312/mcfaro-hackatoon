"use client";
// Tarjeta de grupo de apoyo con botón de unirse/salir
import { GrupoApoyo, TipoGrupo } from "@/lib/types";
import { Users, MessageCircle } from "lucide-react";

const TIPO_CONFIG: Record<TipoGrupo, { label: string; bg: string; text: string }> = {
  oncologia:   { label: "Oncología",    bg: "#FEE2E2", text: "#991B1B" },
  cardiologia: { label: "Cardiología",  bg: "#DBEAFE", text: "#1E40AF" },
  neurologia:  { label: "Neurología",   bg: "#EDE9FE", text: "#5B21B6" },
  general:     { label: "General",      bg: "#D1FAE5", text: "#065F46" },
  otro:        { label: "Otro",         bg: "#F3F4F6", text: "#374151" },
};

interface Props {
  grupo: GrupoApoyo;
  esMiembro: boolean;
  onUnirse: () => Promise<void>;
  onSalir: () => Promise<void>;
  onAbrir: () => void;
  cargando: boolean;
}

export function TarjetaGrupo({ grupo, esMiembro, onUnirse, onSalir, onAbrir, cargando }: Props) {
  const tipo = TIPO_CONFIG[grupo.tipo];

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm p-4 ${esMiembro ? "ring-2 ring-orange-400" : ""}`}
    >
      {/* Encabezado */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
          style={{ background: tipo.bg, color: tipo.text }}
        >
          {tipo.label}
        </span>
        {esMiembro && (
          <span className="text-xs font-semibold shrink-0" style={{ color: "#C85A2A" }}>
            Miembro
          </span>
        )}
      </div>

      <h3 className="font-bold text-gray-800 mb-1">{grupo.nombre}</h3>
      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{grupo.descripcion}</p>

      {/* Miembros */}
      <div className="flex items-center gap-1 text-xs text-gray-400 mb-4">
        <Users size={13} />
        <span>{grupo.miembros.length} {grupo.miembros.length === 1 ? "familia" : "familias"}</span>
      </div>

      {/* Acciones */}
      <div className="flex gap-2">
        {esMiembro && (
          <button
            onClick={onAbrir}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            style={{ background: "#FDF0E6", color: "#C85A2A" }}
          >
            <MessageCircle size={15} />
            Ver chat
          </button>
        )}

        <button
          onClick={esMiembro ? onSalir : onUnirse}
          disabled={cargando}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-60"
          style={
            esMiembro
              ? { background: "#F3F4F6", color: "#6B7280" }
              : { background: "#C85A2A", color: "#FFFFFF" }
          }
        >
          {cargando ? "..." : esMiembro ? "Salir" : "Unirme"}
        </button>
      </div>
    </div>
  );
}
