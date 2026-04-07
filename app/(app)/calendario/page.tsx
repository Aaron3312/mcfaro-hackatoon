"use client";
// Módulo de citas — agrupadas por día
import { useState } from "react";
import { useCitas } from "@/hooks/useCitas";
import { TarjetaCita } from "@/components/calendario/TarjetaCita";
import { FormularioCita } from "@/components/calendario/FormularioCita";
import { Toast } from "@/components/ui/Toast";
import { Cita } from "@/lib/types";
import { format, isToday, isTomorrow } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, Plus } from "lucide-react";

function encabezadoDia(fecha: Date): string {
  if (isToday(fecha)) return "Hoy";
  if (isTomorrow(fecha)) return "Mañana";
  return format(fecha, "EEEE d 'de' MMMM", { locale: es });
}

export default function CalendarioPage() {
  const { citas, cargando, agregarCita, editarCita, eliminarCita } = useCitas();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [citaEditar, setCitaEditar] = useState<Cita | undefined>();
  const [toast, setToast] = useState<{ mensaje: string; tipo: "exito" | "error" } | null>(null);

  // Agrupar citas por día
  const citasOrdenadas = [...citas].sort((a, b) =>
    a.fecha.toDate().getTime() - b.fecha.toDate().getTime()
  );

  const grupos = citasOrdenadas.reduce<Record<string, Cita[]>>((acc, cita) => {
    const key = format(cita.fecha.toDate(), "yyyy-MM-dd");
    if (!acc[key]) acc[key] = [];
    acc[key].push(cita);
    return acc;
  }, {});

  const handleGuardar = async (datos: Parameters<typeof agregarCita>[0]) => {
    try {
      if (citaEditar) {
        await editarCita(citaEditar.id, datos);
        setToast({ mensaje: "Cita actualizada", tipo: "exito" });
      } else {
        await agregarCita(datos);
        setToast({ mensaje: "Cita agregada", tipo: "exito" });
      }
    } catch {
      setToast({ mensaje: "Error al guardar la cita", tipo: "error" });
    }
    setCitaEditar(undefined);
  };

  const handleEliminar = async (id: string) => {
    try {
      await eliminarCita(id);
      setToast({ mensaje: "Cita eliminada", tipo: "info" as "exito" });
    } catch {
      setToast({ mensaje: "Error al eliminar", tipo: "error" });
    }
  };

  return (
    <>
      {/* ── Banner ───────────────────────────────────────────── */}
      <div className="relative overflow-hidden w-full"
        style={{ background: "linear-gradient(135deg, #C85A2A 0%, #E87A3A 70%, #F5C842 100%)" }}>
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-15"
          style={{ background: "#7A3D1A" }} />
        <div className="max-w-6xl mx-auto px-5 py-8 md:px-10 md:py-10">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Mis citas</h1>
          <p className="text-white/70 text-sm mt-1">{citas.length} cita{citas.length !== 1 ? "s" : ""} registrada{citas.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* ── Contenido ────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 pt-5 pb-24 md:px-10 md:pt-8">
        {cargando ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : Object.keys(grupos).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Calendar size={44} className="text-gray-200 mb-3" />
            <p className="text-gray-400 font-medium">Sin citas registradas</p>
            <p className="text-gray-300 text-sm mt-1">Toca + para agregar tu primera cita</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grupos).map(([dia, citasDia]) => (
              <section key={dia}>
                <h2 className="text-xs font-bold uppercase tracking-wide mb-2 capitalize"
                  style={{ color: "#9A6A2A" }}>
                  {encabezadoDia(new Date(dia + "T12:00:00"))}
                </h2>
                <div className="space-y-2">
                  {citasDia.map((cita) => (
                    <TarjetaCita key={cita.id} cita={cita}
                      onEditar={(c) => { setCitaEditar(c); setMostrarFormulario(true); }}
                      onEliminar={handleEliminar}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => { setCitaEditar(undefined); setMostrarFormulario(true); }}
        className="fixed bottom-24 md:bottom-8 right-5 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-20 active:scale-95 transition-transform"
        style={{ background: "#C85A2A" }}>
        <Plus size={24} className="text-white" />
      </button>

      {/* Formulario */}
      {mostrarFormulario && (
        <FormularioCita
          citaEditar={citaEditar}
          onGuardar={handleGuardar}
          onCerrar={() => { setMostrarFormulario(false); setCitaEditar(undefined); }}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={() => setToast(null)} />
      )}
    </>
  );
}
