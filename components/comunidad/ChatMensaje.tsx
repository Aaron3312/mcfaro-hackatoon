"use client";
// Burbuja de mensaje individual en el chat de comunidad
import { MensajeChat } from "@/lib/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Flag } from "lucide-react";

interface Props {
  mensaje: MensajeChat;
  esPropio: boolean;
  onReportar: (mensajeId: string) => void;
}

export function ChatMensaje({ mensaje, esPropio, onReportar }: Props) {
  // Convertir Timestamp de Firestore a Date de forma segura
  const fecha =
    mensaje.timestamp && typeof mensaje.timestamp.toDate === "function"
      ? mensaje.timestamp.toDate()
      : new Date();

  return (
    <div className={`flex ${esPropio ? "justify-end" : "justify-start"} mb-3 group`}>
      <div className={`max-w-[78%] ${esPropio ? "items-end" : "items-start"} flex flex-col`}>
        {/* Nombre (solo en mensajes ajenos) */}
        {!esPropio && (
          <span className="text-xs font-semibold mb-1 ml-1" style={{ color: "#7A3D1A" }}>
            {mensaje.nombreUsuario}
          </span>
        )}

        <div className="flex items-end gap-1">
          {/* Burbuja */}
          <div
            className="px-3.5 py-2.5 rounded-2xl text-sm leading-snug break-words"
            style={
              esPropio
                ? { background: "#C85A2A", color: "#FFFFFF", borderBottomRightRadius: "4px" }
                : { background: "#FFFFFF", color: "#374151", borderBottomLeftRadius: "4px" }
            }
          >
            {mensaje.mensaje}
          </div>

          {/* Botón reportar (solo mensajes ajenos, visible al hover) */}
          {!esPropio && !mensaje.reportado && (
            <button
              onClick={() => onReportar(mensaje.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-gray-100"
              title="Reportar mensaje"
              aria-label="Reportar mensaje"
            >
              <Flag size={12} className="text-gray-400" />
            </button>
          )}
        </div>

        {/* Hora */}
        <span className="text-[10px] mt-1 mx-1" style={{ color: "#A89080" }}>
          {format(fecha, "HH:mm", { locale: es })}
          {mensaje.reportado && (
            <span className="ml-1 text-amber-500">· Reportado</span>
          )}
        </span>
      </div>
    </div>
  );
}
