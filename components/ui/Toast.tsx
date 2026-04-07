"use client";
// Toast de notificación temporal
import { useEffect, useState } from "react";

interface ToastProps {
  mensaje: string;
  tipo?: "exito" | "error" | "info";
  duracion?: number;
  onCerrar: () => void;
}

const colores = {
  exito: { bg: "#ECFDF5", texto: "#065F46", borde: "#6EE7B7" },
  error: { bg: "#FEF2F2", texto: "#991B1B", borde: "#FCA5A5" },
  info:  { bg: "#FDF0E6", texto: "#7A3D1A", borde: "#F5C842" },
};

export function Toast({ mensaje, tipo = "info", duracion = 3000, onCerrar }: ToastProps) {
  const [visible, setVisible] = useState(true);
  const { bg, texto, borde } = colores[tipo];

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onCerrar, 300);
    }, duracion);
    return () => clearTimeout(t);
  }, [duracion, onCerrar]);

  return (
    <div
      className={`fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl shadow-lg text-sm font-medium z-50 transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
      style={{ background: bg, color: texto, border: `1px solid ${borde}` }}
    >
      {mensaje}
    </div>
  );
}
