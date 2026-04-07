"use client";
// Formulario para agregar o editar citas
import { useState } from "react";
import { z } from "zod";
import { Cita } from "@/lib/types";
import { X } from "lucide-react";
import { format } from "date-fns";

const EsquemaCita = z.object({
  titulo: z.string().min(1, "El título es requerido"),
  fecha: z.string().min(1, "La fecha es requerida"),
  hora: z.string().min(1, "La hora es requerida"),
  servicio: z.enum(["consulta", "estudio", "procedimiento", "otro"]),
  notas: z.string().optional(),
  recordatorio60: z.boolean(),
  recordatorio15: z.boolean(),
});

type DatosFormulario = z.infer<typeof EsquemaCita>;

interface FormularioCitaProps {
  citaEditar?: Cita;
  onGuardar: (datos: { titulo: string; fecha: Date; servicio: Cita["servicio"]; notas?: string; recordatorio60: boolean; recordatorio15: boolean }) => Promise<void>;
  onCerrar: () => void;
}

const etiquetasServicio: Record<Cita["servicio"], string> = {
  consulta: "Consulta médica",
  estudio: "Estudio / Laboratorio",
  procedimiento: "Procedimiento",
  otro: "Otro",
};

export function FormularioCita({ citaEditar, onGuardar, onCerrar }: FormularioCitaProps) {
  const ahora = new Date();
  const fechaInicial = citaEditar ? format(citaEditar.fecha.toDate(), "yyyy-MM-dd") : format(ahora, "yyyy-MM-dd");
  const horaInicial = citaEditar ? format(citaEditar.fecha.toDate(), "HH:mm") : format(ahora, "HH:mm");

  const [datos, setDatos] = useState<DatosFormulario>({
    titulo: citaEditar?.titulo ?? "",
    fecha: fechaInicial,
    hora: horaInicial,
    servicio: citaEditar?.servicio ?? "consulta",
    notas: citaEditar?.notas ?? "",
    recordatorio60: citaEditar?.recordatorio60 ?? true,
    recordatorio15: citaEditar?.recordatorio15 ?? true,
  });

  const [errores, setErrores] = useState<Partial<Record<keyof DatosFormulario, string>>>({});
  const [guardando, setGuardando] = useState(false);

  const actualizar = (campo: keyof DatosFormulario, valor: string | boolean) => {
    setDatos((prev) => ({ ...prev, [campo]: valor }));
    if (errores[campo]) setErrores((prev) => ({ ...prev, [campo]: undefined }));
  };

  const handleSubmit = async () => {
    const resultado = EsquemaCita.safeParse(datos);
    if (!resultado.success) {
      const nuevosErrores: typeof errores = {};
      resultado.error.issues.forEach((issue) => {
        const campo = issue.path[0] as keyof DatosFormulario;
        nuevosErrores[campo] = issue.message;
      });
      setErrores(nuevosErrores);
      return;
    }

    setGuardando(true);
    try {
      const fecha = new Date(`${datos.fecha}T${datos.hora}`);
      await onGuardar({
        titulo: datos.titulo,
        fecha,
        servicio: datos.servicio,
        notas: datos.notas,
        recordatorio60: datos.recordatorio60,
        recordatorio15: datos.recordatorio15,
      });
      onCerrar();
    } catch (error) {
      console.error("Error al guardar cita:", error);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-end md:items-center md:justify-center md:p-6">
      <div className="bg-white w-full rounded-t-3xl md:rounded-3xl md:max-w-lg max-h-[90vh] overflow-y-auto pb-safe md:pb-0">
        {/* Encabezado */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {citaEditar ? "Editar cita" : "Nueva cita"}
          </h2>
          <button onClick={onCerrar} className="p-2 rounded-full active:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">¿Qué cita es?</label>
            <input
              type="text"
              value={datos.titulo}
              onChange={(e) => actualizar("titulo", e.target.value)}
              placeholder="Ej. Consulta con oncología"
              className={`w-full border rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#F5C842] ${
                errores.titulo ? "border-[#E87A3A]" : "border-gray-200"
              }`}
            />
            {errores.titulo && <p className="text-[#E87A3A] text-sm mt-1">{errores.titulo}</p>}
          </div>

          {/* Fecha y hora */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input
                type="date"
                value={datos.fecha}
                onChange={(e) => actualizar("fecha", e.target.value)}
                className={`w-full border rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#F5C842] ${
                  errores.fecha ? "border-[#E87A3A]" : "border-gray-200"
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
              <input
                type="time"
                value={datos.hora}
                onChange={(e) => actualizar("hora", e.target.value)}
                className={`w-full border rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#F5C842] ${
                  errores.hora ? "border-[#E87A3A]" : "border-gray-200"
                }`}
              />
            </div>
          </div>

          {/* Tipo de servicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de cita</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(etiquetasServicio) as [Cita["servicio"], string][]).map(([valor, etiqueta]) => (
                <button
                  key={valor}
                  onClick={() => actualizar("servicio", valor)}
                  className={`py-3 px-3 rounded-xl text-sm font-medium text-center transition-colors ${
                    datos.servicio === valor
                      ? "bg-[#C85A2A] text-white"
                      : "bg-gray-100 text-gray-600 active:bg-gray-200"
                  }`}
                >
                  {etiqueta}
                </button>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas (opcional)</label>
            <textarea
              value={datos.notas}
              onChange={(e) => actualizar("notas", e.target.value)}
              placeholder="Piso, consultorio, qué llevar…"
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#F5C842] resize-none"
            />
          </div>

          {/* Recordatorios */}
          <div className="bg-amber-50 rounded-xl p-4 space-y-3">
            <p className="text-sm font-medium text-amber-800">Recordatorios</p>
            {[
              { campo: "recordatorio60" as const, etiqueta: "60 minutos antes" },
              { campo: "recordatorio15" as const, etiqueta: "15 minutos antes" },
            ].map(({ campo, etiqueta }) => (
              <label key={campo} className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => actualizar(campo, !datos[campo])}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    datos[campo] ? "bg-[#C85A2A]" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      datos[campo] ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </div>
                <span className="text-sm text-amber-700">{etiqueta}</span>
              </label>
            ))}
          </div>

          {/* Botón guardar */}
          <button
            onClick={handleSubmit}
            disabled={guardando}
            className="w-full bg-[#C85A2A] text-white rounded-2xl py-4 text-base font-semibold min-h-[56px] active:bg-[#7A3D1A] disabled:opacity-60 transition-colors"
          >
            {guardando ? "Guardando…" : citaEditar ? "Guardar cambios" : "Agregar cita"}
          </button>
        </div>
      </div>
    </div>
  );
}
