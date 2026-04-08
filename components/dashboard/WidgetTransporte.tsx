"use client";
// Widget que muestra el transporte activo o permite solicitar uno nuevo
import { Bus, Clock, Navigation } from "lucide-react";
import Link from "next/link";
import { SolicitudTransporte } from "@/lib/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface WidgetTransporteProps {
  solicitud: SolicitudTransporte | null;
}

const etiquetasEstado = {
  pendiente: { texto: "Pendiente", color: "#F59E0B", bg: "#FEF3C7" },
  asignada: { texto: "Asignado", color: "#3B82F6", bg: "#DBEAFE" },
  en_camino: { texto: "En camino", color: "#10B981", bg: "#D1FAE5" },
  completada: { texto: "Completado", color: "#6B7280", bg: "#F3F4F6" },
  cancelada: { texto: "Cancelado", color: "#EF4444", bg: "#FEE2E2" },
};

export function WidgetTransporte({ solicitud }: WidgetTransporteProps) {
  if (!solicitud) {
    return (
      <Link
        href="/transporte"
        className="block bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow min-h-[120px]"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-ronald-beige">
            <Bus size={22} className="text-ronald-orange" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-700">Solicitar transporte</p>
            <p className="text-xs text-gray-400 mt-0.5">Casa Ronald ↔ Hospital</p>
          </div>
        </div>
      </Link>
    );
  }

  const fechaSolicitud = solicitud.fechaHora.toDate();
  const estadoInfo = etiquetasEstado[solicitud.estado];

  return (
    <Link
      href="/transporte"
      className="block bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow min-h-[120px]"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-ronald-beige">
          <Bus size={22} className="text-ronald-orange" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-xs font-bold uppercase tracking-wide text-ronald-brown-medium">
              Transporte activo
            </p>
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0"
              style={{ background: estadoInfo.bg, color: estadoInfo.color }}
            >
              {estadoInfo.texto}
            </span>
          </div>
          <p className="font-bold text-gray-900 text-sm leading-snug">{solicitud.destino}</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Clock size={13} className="text-ronald-orange shrink-0" />
          <span className="text-xs text-gray-600 truncate">
            {format(fechaSolicitud, "HH:mm - EEE d MMM", { locale: es })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Navigation size={13} className="text-ronald-orange shrink-0" />
          <span className="text-xs text-gray-600 truncate">
            {solicitud.origen} → {solicitud.destino}
          </span>
        </div>
      </div>

      {solicitud.placasUnidad && (
        <div className="mt-3 px-3 py-2 rounded-lg bg-ronald-beige">
          <p className="text-xs font-medium text-ronald-brown truncate">
            <span className="font-bold">Unidad:</span> {solicitud.placasUnidad}
            {solicitud.nombreChofer && ` · ${solicitud.nombreChofer}`}
          </p>
        </div>
      )}
    </Link>
  );
}
