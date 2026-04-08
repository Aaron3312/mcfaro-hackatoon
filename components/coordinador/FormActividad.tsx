"use client";
// Formulario para crear/editar actividades — usado en el panel del coordinador
import { useState } from "react";
import { X, ChevronDown } from "lucide-react";
import { Actividad, TipoActividad } from "@/lib/types";

const TIPOS: { value: TipoActividad; label: string }[] = [
  { value: "arte",       label: "Arte y manualidades" },
  { value: "deporte",    label: "Deporte y movimiento" },
  { value: "educacion",  label: "Educación" },
  { value: "bienestar",  label: "Bienestar emocional" },
  { value: "recreacion", label: "Recreación" },
  { value: "otro",       label: "Otro" },
];

interface DatosForm {
  titulo: string;
  descripcion: string;
  tipo: TipoActividad;
  fechaHora: string;
  duracionMin: number;
  capacidadMax: number;
  instructor: string;
  ubicacion: string;
}

interface Props {
  actividad?: Actividad;        // si viene, es edición; si no, es creación
  casaRonald: string;
  creadaPor: string;
  onGuardar: (datos: DatosForm) => Promise<void>;
  onCerrar: () => void;
}

export function FormActividad({ actividad, casaRonald, creadaPor, onGuardar, onCerrar }: Props) {
  const ahora = new Date();
  ahora.setMinutes(ahora.getMinutes() + 60);
  const minDatetime = ahora.toISOString().slice(0, 16);

  const [form, setForm] = useState<DatosForm>({
    titulo:       actividad?.titulo       ?? "",
    descripcion:  actividad?.descripcion  ?? "",
    tipo:         actividad?.tipo         ?? "recreacion",
    fechaHora:    actividad?.fechaHora
      ? actividad.fechaHora.toDate().toISOString().slice(0, 16)
      : minDatetime,
    duracionMin:  actividad?.duracionMin  ?? 60,
    capacidadMax: actividad?.capacidadMax ?? 20,
    instructor:   actividad?.instructor   ?? "",
    ubicacion:    actividad?.ubicacion    ?? "Sala común",
  });

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof DatosForm>(k: K, v: DatosForm[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleGuardar = async () => {
    if (!form.titulo.trim() || !form.instructor.trim() || !form.fechaHora) {
      setError("Completa título, instructor y fecha/hora");
      return;
    }
    setGuardando(true);
    setError("");
    try {
      await onGuardar(form);
      onCerrar();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-5 shadow-xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-800">
            {actividad ? "Editar actividad" : "Nueva actividad"}
          </h3>
          <button onClick={onCerrar} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Título */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Título</label>
            <input
              value={form.titulo}
              onChange={(e) => set("titulo", e.target.value)}
              placeholder="Ej. Taller de pintura"
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-orange-400 min-h-[48px]"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Descripción</label>
            <textarea
              value={form.descripcion}
              onChange={(e) => set("descripcion", e.target.value)}
              placeholder="Descripción breve de la actividad"
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 resize-none"
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tipo</label>
            <div className="relative">
              <select
                value={form.tipo}
                onChange={(e) => set("tipo", e.target.value as TipoActividad)}
                className="w-full border border-gray-200 rounded-xl px-3 pr-8 py-3 text-sm focus:outline-none focus:border-orange-400 appearance-none bg-white min-h-[48px]"
              >
                {TIPOS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Fecha y hora */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Fecha y hora</label>
            <input
              type="datetime-local"
              value={form.fechaHora}
              min={minDatetime}
              onChange={(e) => set("fechaHora", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-orange-400 min-h-[48px]"
            />
          </div>

          {/* Duración y capacidad */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Duración (min)</label>
              <input
                type="number"
                min={15}
                max={480}
                step={15}
                value={form.duracionMin}
                onChange={(e) => set("duracionMin", Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-orange-400 min-h-[48px]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Capacidad máx.</label>
              <input
                type="number"
                min={1}
                max={200}
                value={form.capacidadMax}
                onChange={(e) => set("capacidadMax", Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-orange-400 min-h-[48px]"
              />
            </div>
          </div>

          {/* Instructor */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Instructor / Responsable</label>
            <input
              value={form.instructor}
              onChange={(e) => set("instructor", e.target.value)}
              placeholder="Nombre del instructor"
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-orange-400 min-h-[48px]"
            />
          </div>

          {/* Ubicación */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Ubicación</label>
            <input
              value={form.ubicacion}
              onChange={(e) => set("ubicacion", e.target.value)}
              placeholder="Ej. Sala de juegos, Jardín"
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-orange-400 min-h-[48px]"
            />
          </div>
        </div>

        {error && <p className="text-xs text-red-500 mt-3">{error}</p>}

        <div className="flex gap-2 mt-5">
          <button
            onClick={onCerrar}
            className="flex-1 py-3 rounded-2xl text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="flex-1 py-3 rounded-2xl text-sm font-bold text-white disabled:opacity-50 transition-opacity"
            style={{ background: "#C85A2A" }}
          >
            {guardando ? "Guardando…" : actividad ? "Guardar cambios" : "Crear actividad"}
          </button>
        </div>
      </div>
    </div>
  );
}
