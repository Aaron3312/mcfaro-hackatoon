"use client";
// Banner informativo sobre funcionalidad offline — para la página de recursos
import { Download, Wifi, WifiOff, CheckCircle2, XCircle } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export function OfflineInfo() {
  const online = useOnlineStatus();

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
          <Download size={20} className="text-blue-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-800 text-sm">Funcionalidad Offline</h3>
          <p className="text-xs text-gray-600">
            La app funciona sin conexión a Internet
          </p>
        </div>
      </div>

      {/* Estado actual */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl mb-4 ${
        online
          ? "bg-green-100 border border-green-200"
          : "bg-amber-100 border border-amber-200"
      }`}>
        {online ? (
          <>
            <Wifi size={16} className="text-green-600 shrink-0" />
            <span className="text-xs font-semibold text-green-700">
              Conectado — todos los datos actualizados
            </span>
          </>
        ) : (
          <>
            <WifiOff size={16} className="text-amber-600 shrink-0" />
            <span className="text-xs font-semibold text-amber-700">
              Sin conexión — usando datos guardados
            </span>
          </>
        )}
      </div>

      {/* Qué funciona offline */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-gray-700 mb-2">
          Disponible sin Internet:
        </p>
        {[
          { texto: "Ver menú del día y próximos 3 días", disponible: true },
          { texto: "Consultar actividades programadas", disponible: true },
          { texto: "Ver información de perfil y familia", disponible: true },
          { texto: "Acceder a recursos, FAQ y reglamento", disponible: true },
          { texto: "Revisar solicitudes de transporte enviadas", disponible: true },
        ].map(({ texto, disponible }) => (
          <div key={texto} className="flex items-start gap-2 text-xs">
            {disponible ? (
              <CheckCircle2 size={14} className="text-green-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle size={14} className="text-gray-400 shrink-0 mt-0.5" />
            )}
            <span className={disponible ? "text-gray-700" : "text-gray-400"}>
              {texto}
            </span>
          </div>
        ))}
      </div>

      {/* Qué NO funciona offline */}
      <div className="mt-4 pt-4 border-t border-blue-100 space-y-2">
        <p className="text-xs font-bold text-gray-700 mb-2">
          Requiere conexión:
        </p>
        {[
          "Crear nuevas solicitudes de transporte",
          "Registrarse en actividades",
          "Publicar menús (coordinadores)",
          "Enviar notificaciones push",
        ].map((texto) => (
          <div key={texto} className="flex items-start gap-2 text-xs">
            <XCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
            <span className="text-gray-600">{texto}</span>
          </div>
        ))}
      </div>

      {/* Tip */}
      <div className="mt-4 pt-4 border-t border-blue-100">
        <p className="text-xs text-gray-600 leading-relaxed">
          💡 <span className="font-semibold">Tip:</span> Al abrir la app con conexión,
          los datos se guardan automáticamente para uso posterior sin Internet.
        </p>
      </div>
    </div>
  );
}
