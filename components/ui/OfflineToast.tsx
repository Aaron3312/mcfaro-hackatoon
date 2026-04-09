"use client";
// Toast de estado de conexión — esquina superior derecha, no bloquea navegación
import { useEffect, useState } from "react";
import { WifiOff, Wifi, X } from "lucide-react";

interface OfflineToastProps {
  online: boolean;
}

export function OfflineToast({ online }: OfflineToastProps) {
  const [visible, setVisible] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);
  const [previousOnline, setPreviousOnline] = useState<boolean | null>(null);

  useEffect(() => {
    // Primera vez: establecer estado inicial sin mostrar nada
    if (previousOnline === null) {
      setPreviousOnline(online);
      if (!online) {
        setVisible(true);
      }
      return;
    }

    // Detectar cambio de estado de conexión
    if (previousOnline !== online) {
      if (!online) {
        // Cambió a offline: mostrar toast amarillo
        setVisible(true);
        setShowReconnected(false);
      } else {
        // Cambió a online: mostrar toast verde y ocultar amarillo
        setVisible(false);
        setShowReconnected(true);

        // Ocultar mensaje de reconexión después de 3 segundos
        const timer = setTimeout(() => {
          setShowReconnected(false);
        }, 3000);

        return () => clearTimeout(timer);
      }

      setPreviousOnline(online);
    }
  }, [online, previousOnline]);

  // Toast de "Sin conexión" (permanente hasta reconectar)
  if (visible && !online) {
    return (
      <div className="fixed bottom-20 left-0 right-0 md:top-4 md:bottom-auto md:left-auto md:right-4 md:max-w-sm z-[200] px-3 md:px-0 animate-in slide-in-from-bottom-2 md:slide-in-from-top-2 duration-300">
        <div className="bg-amber-400 md:bg-white rounded-2xl shadow-2xl border-2 border-amber-500 md:border-amber-400 p-3 md:p-4">
          <div className="flex items-start gap-2.5 md:gap-3">
            {/* Icono con animación de pulso */}
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-amber-500 md:bg-amber-100 flex items-center justify-center shrink-0">
              <WifiOff size={18} className="md:w-5 md:h-5 text-white md:text-amber-600 animate-pulse" />
            </div>

            {/* Contenido */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-bold text-sm md:text-sm text-amber-900 md:text-gray-800 leading-tight">
                  Sin conexión a Internet
                </h3>
                <button
                  onClick={() => setVisible(false)}
                  className="p-1 rounded-lg hover:bg-amber-500/20 md:hover:bg-gray-100 active:bg-amber-500/30 md:active:bg-gray-200 transition-colors shrink-0 min-w-[28px] min-h-[28px] flex items-center justify-center"
                  aria-label="Cerrar"
                >
                  <X size={14} className="text-amber-900 md:text-gray-400" />
                </button>
              </div>

              <p className="text-xs md:text-xs text-amber-900 md:text-gray-600 leading-relaxed font-medium md:font-normal">
                Los datos mostrados pueden cambiar al reconectar
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Toast de "Conectado" (temporal, desaparece en 3s)
  if (showReconnected) {
    return (
      <div className="fixed bottom-20 left-0 right-0 md:top-4 md:bottom-auto md:left-auto md:right-4 md:max-w-sm z-[200] px-3 md:px-0 animate-in slide-in-from-bottom-2 md:slide-in-from-top-2 duration-300">
        <div className="bg-green-400 md:bg-white rounded-2xl shadow-2xl border-2 border-green-500 md:border-green-400 p-3 md:p-4">
          <div className="flex items-start gap-2.5 md:gap-3">
            {/* Icono de conexión restaurada */}
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-green-500 md:bg-green-100 flex items-center justify-center shrink-0">
              <Wifi size={18} className="md:w-5 md:h-5 text-white md:text-green-600" />
            </div>

            {/* Contenido */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm md:text-sm text-green-900 md:text-gray-800 leading-tight">
                ¡Conexión restaurada!
              </h3>
              <p className="text-xs md:text-xs text-green-900 md:text-gray-600 leading-relaxed font-medium md:font-normal mt-0.5">
                Ya puedes usar todas las funciones
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
