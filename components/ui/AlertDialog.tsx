"use client";
// AlertDialog sutil para confirmaciones críticas
import { AlertCircle, CheckCircle } from "lucide-react";

interface AlertDialogProps {
  titulo: string;
  mensaje: string;
  tipo?: "advertencia" | "confirmacion";
  textoAceptar?: string;
  textoCancelar?: string;
  onAceptar: () => void;
  onCancelar: () => void;
  cargando?: boolean;
}

export function AlertDialog({
  titulo,
  mensaje,
  tipo = "advertencia",
  textoAceptar = "Aceptar",
  textoCancelar = "Cancelar",
  onAceptar,
  onCancelar,
  cargando = false,
}: AlertDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 animate-fadeIn">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl animate-slideUp">
        {/* Encabezado con icono */}
        <div
          className={`flex items-center gap-3 px-5 py-4 rounded-t-2xl ${
            tipo === "advertencia"
              ? "bg-gradient-to-r from-orange-50 to-red-50"
              : "bg-gradient-to-r from-blue-50 to-indigo-50"
          }`}
        >
          {tipo === "advertencia" ? (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "#FEE2E2" }}
            >
              <AlertCircle size={20} style={{ color: "#DC2626" }} />
            </div>
          ) : (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "#DBEAFE" }}
            >
              <CheckCircle size={20} style={{ color: "#2563EB" }} />
            </div>
          )}
          <h3 className="font-bold text-gray-800 text-base">{titulo}</h3>
        </div>

        {/* Contenido */}
        <div className="px-5 py-5">
          <p className="text-sm text-gray-600 leading-relaxed">{mensaje}</p>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2 px-5 pb-5">
          <button
            onClick={onCancelar}
            disabled={cargando}
            className="flex-1 py-3 rounded-xl font-bold text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 min-h-[48px]"
          >
            {textoCancelar}
          </button>
          <button
            onClick={onAceptar}
            disabled={cargando}
            className={`flex-1 py-3 rounded-xl font-bold text-sm text-white transition-opacity disabled:opacity-50 min-h-[48px] ${
              tipo === "advertencia"
                ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            }`}
            style={
              tipo === "confirmacion"
                ? { background: "linear-gradient(135deg, #C85A2A, #E87A3A)" }
                : undefined
            }
          >
            {cargando ? "Procesando..." : textoAceptar}
          </button>
        </div>
      </div>
    </div>
  );
}
