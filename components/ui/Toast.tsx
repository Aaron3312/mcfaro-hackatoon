"use client";
// Toast simple para feedback de acciones críticas
import { useEffect, useState } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

interface ToastProps {
  mensaje: string;
  tipo?: "exito" | "error";
  onCerrar: () => void;
}

export function Toast({ mensaje, tipo = "exito", onCerrar }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onCerrar, 3500);
    return () => clearTimeout(timer);
  }, [onCerrar]);

  return (
    <div
      className={`fixed top-4 left-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg max-w-sm mx-auto ${
        tipo === "exito" ? "bg-green-50 border border-green-200" : "bg-[#FDF0E6] border border-[#F0C9A0]"
      }`}
    >
      {tipo === "exito" ? (
        <CheckCircle className="text-green-600 shrink-0" size={20} />
      ) : (
        <XCircle className="text-[#C85A2A] shrink-0" size={20} />
      )}
      <span className={`text-sm flex-1 ${tipo === "exito" ? "text-green-800" : "text-[#7A3D1A]"}`}>
        {mensaje}
      </span>
      <button onClick={onCerrar} className="shrink-0 p-1">
        <X size={16} className="text-gray-400" />
      </button>
    </div>
  );
}

// Hook para gestionar toasts
export function useToast() {
  const [toast, setToast] = useState<{ mensaje: string; tipo: "exito" | "error" } | null>(null);

  const mostrar = (mensaje: string, tipo: "exito" | "error" = "exito") => {
    setToast({ mensaje, tipo });
  };

  const cerrar = () => setToast(null);

  return { toast, mostrar, cerrar };
}
