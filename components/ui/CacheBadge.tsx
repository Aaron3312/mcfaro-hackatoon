"use client";
// Badge que indica cuando los datos mostrados provienen del caché offline
import { Database } from "lucide-react";

interface CacheBadgeProps {
  /** Mensaje personalizado (opcional) */
  mensaje?: string;
  /** Tamaño del badge */
  size?: "sm" | "md";
  /** Variante visual */
  variant?: "subtle" | "prominent";
}

export function CacheBadge({
  mensaje = "Datos guardados",
  size = "sm",
  variant = "subtle",
}: CacheBadgeProps) {
  const sizeClasses = {
    sm: "text-[10px] px-2 py-1",
    md: "text-xs px-2.5 py-1.5",
  };

  const variantClasses = {
    subtle: "bg-blue-50 border border-blue-200 text-blue-700",
    prominent: "bg-blue-500 border border-blue-600 text-white",
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-lg font-semibold ${sizeClasses[size]} ${variantClasses[variant]}`}
    >
      <Database size={size === "sm" ? 10 : 12} className="shrink-0" />
      <span>{mensaje}</span>
    </div>
  );
}
