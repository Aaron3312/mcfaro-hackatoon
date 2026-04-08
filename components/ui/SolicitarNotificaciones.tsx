"use client";
// Componente para solicitar permiso de notificaciones push
import { useState, useEffect } from "react";
import { Bell, BellOff, BellRing, X } from "lucide-react";
import { solicitarPermisoNotificaciones, estadoPermiso } from "@/lib/notificaciones";

interface Props {
  familiaId: string;
  /** Si true, muestra solo el botón icono (compacto para nav/header) */
  compacto?: boolean;
}

export function SolicitarNotificaciones({ familiaId, compacto = false }: Props) {
  const [permiso, setPermiso] = useState<NotificationPermission | "no-soportado">("default");
  const [solicitando, setSolicitando] = useState(false);
  const [descartado, setDescartado] = useState(false);
  const [exito, setExito] = useState(false);

  useEffect(() => {
    setPermiso(estadoPermiso());

    // Revisar si el usuario ya descartó el banner en esta sesión
    const val = sessionStorage.getItem("mcfaro-notif-descartado");
    if (val === "1") setDescartado(true);
  }, []);

  const solicitar = async () => {
    setSolicitando(true);
    try {
      const ok = await solicitarPermisoNotificaciones(familiaId);
      setPermiso(estadoPermiso());
      if (ok) {
        setExito(true);
        setTimeout(() => setExito(false), 3000);
      }
    } finally {
      setSolicitando(false);
    }
  };

  const descartar = () => {
    setDescartado(true);
    sessionStorage.setItem("mcfaro-notif-descartado", "1");
  };

  // No mostrar si no es soportado
  if (permiso === "no-soportado") return null;

  // ── Modo compacto: solo icono ──────────────────────────────────────────────
  if (compacto) {
    if (permiso === "granted") {
      return (
        <div className="relative">
          <BellRing size={20} className="text-orange-400" />
          {exito && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full" />
          )}
        </div>
      );
    }
    if (permiso === "denied") {
      return <BellOff size={20} className="text-gray-300" />;
    }
    return (
      <button
        onClick={solicitar}
        disabled={solicitando}
        className="relative"
        aria-label="Activar notificaciones"
      >
        <Bell size={20} className={solicitando ? "text-orange-200 animate-pulse" : "text-orange-400"} />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse" />
      </button>
    );
  }

  // ── Modo banner (dashboard) ────────────────────────────────────────────────

  // Ya concedido
  if (permiso === "granted") {
    if (!exito) return null;
    return (
      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
        <BellRing size={18} className="text-green-600 flex-shrink-0" />
        <p className="text-sm text-green-800 font-medium flex-1">Notificaciones activadas</p>
      </div>
    );
  }

  // Denegado
  if (permiso === "denied") {
    return (
      <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
        <BellOff size={18} className="text-gray-400 flex-shrink-0" />
        <p className="text-sm text-gray-500 flex-1">
          Notificaciones bloqueadas. Actívalas en la configuración del navegador.
        </p>
      </div>
    );
  }

  // Descartado por el usuario en esta sesión
  if (descartado) return null;

  // Estado default — mostrar banner de invitación
  return (
    <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3">
      <Bell size={18} className="text-orange-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-orange-800">Activa las notificaciones</p>
        <p className="text-xs text-orange-500 mt-0.5">
          Recibe recordatorios de citas y avisos del menú y transporte.
        </p>
        <button
          onClick={solicitar}
          disabled={solicitando}
          className="mt-2 px-4 py-1.5 bg-orange-500 text-white text-xs font-bold rounded-xl disabled:opacity-60 active:scale-95 transition-transform"
        >
          {solicitando ? "Activando…" : "Activar ahora"}
        </button>
      </div>
      <button onClick={descartar} className="p-1 -mt-0.5 flex-shrink-0" aria-label="Cerrar">
        <X size={14} className="text-orange-300" />
      </button>
    </div>
  );
}
