"use client";
// Componente Button unificado — usar para botones nuevos y reemplazos del color primario
import { ButtonHTMLAttributes } from "react";

type Variante = "primary" | "secondary" | "outline" | "ghost";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  /** Ocupa el ancho completo del contenedor */
  fullWidth?: boolean;
}

const estilosVariante: Record<Variante, string> = {
  primary:   "bg-[#C85A2A] text-white active:bg-[#7A3D1A] shadow-md",
  secondary: "bg-[#FDF0E6] text-[#7A3D1A] active:bg-[#F0E5D0]",
  outline:   "border-2 border-[#C85A2A] text-[#C85A2A] active:bg-[#FDF0E6]",
  ghost:     "text-[#C85A2A] active:bg-[#FDF0E6]",
};

export function Button({
  variante = "primary",
  fullWidth = false,
  className = "",
  children,
  ...props
}: Props) {
  return (
    <button
      className={`
        rounded-2xl px-8 py-4 text-base font-semibold min-h-[56px]
        transition-colors disabled:opacity-50 disabled:cursor-not-allowed
        ${estilosVariante[variante]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
