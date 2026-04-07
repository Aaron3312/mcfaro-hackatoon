"use client";
// Vista del calendario — responsive: 1 col mobile / 2 cols desktop
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCitas } from "@/hooks/useCitas";
import { TarjetaCita } from "@/components/calendario/TarjetaCita";
import { FormularioCita } from "@/components/calendario/FormularioCita";
import { Toast, useToast } from "@/components/ui/Toast";
import { SkeletonTarjetaCita } from "@/components/ui/Skeleton";
import { Cita } from "@/lib/types";
import { Plus, CalendarCheck, CalendarX, Clock } from "lucide-react";
import { format, isToday, isTomorrow, isThisWeek } from "date-fns";
import { es } from "date-fns/locale";
import { solicitarPermisoNotificaciones } from "@/lib/notificaciones";

export default function CalendarioPage() {
  const { familia } = useAuth();
  const { citas, cargando, agregarCita, editarCita, eliminarCita } = useCitas(familia?.id);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [citaEditar, setCitaEditar] = useState<Cita | undefined>();
  const { toast, mostrar, cerrar } = useToast();

  const abrirAgregar = () => {
    setCitaEditar(undefined);
    setMostrarFormulario(true);
    if (familia?.id) solicitarPermisoNotificaciones(familia.id);
  };

  const abrirEditar = (cita: Cita) => {
    setCitaEditar(cita);
    setMostrarFormulario(true);
  };

  const handleGuardar = async (datos: Parameters<typeof agregarCita>[0]) => {
    try {
      if (citaEditar) {
        await editarCita(citaEditar.id, datos);
        mostrar("Cita actualizada correctamente");
      } else {
        await agregarCita(datos);
        mostrar("Cita guardada correctamente");
      }
    } catch {
      mostrar("Error al guardar la cita", "error");
      throw new Error("Error al guardar");
    }
  };

  const handleEliminar = async (id: string) => {
    try {
      await eliminarCita(id);
      mostrar("Cita eliminada");
    } catch {
      mostrar("Error al eliminar la cita", "error");
    }
  };

  const etiquetaDia = (fecha: Date): string => {
    if (isToday(fecha)) return "Hoy";
    if (isTomorrow(fecha)) return "Mañana";
    if (isThisWeek(fecha)) return format(fecha, "EEEE", { locale: es });
    return format(fecha, "EEEE d 'de' MMMM", { locale: es });
  };

  const grupos = citas.reduce<Record<string, Cita[]>>((acc, cita) => {
    const etiqueta = etiquetaDia(cita.fecha.toDate());
    if (!acc[etiqueta]) acc[etiqueta] = [];
    acc[etiqueta].push(cita);
    return acc;
  }, {});

  const citasHoy = citas.filter((c) => isToday(c.fecha.toDate())).length;
  const citasProximas = citas.filter((c) => c.fecha.toDate() > new Date()).length;

  return (
    <>
      {/* ── Banner ───────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden w-full"
        style={{ background: "linear-gradient(135deg, #C85A2A 0%, #E87A3A 70%, #F5C842 100%)" }}
      >
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-15"
          style={{ background: "#7A3D1A" }} />
        <div className="max-w-6xl mx-auto px-5 py-8 md:px-10 md:py-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Mis citas</h1>
              <p className="text-white/70 text-sm mt-1">
                {citas.length} citas registradas
              </p>
            </div>
            <button
              onClick={abrirAgregar}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 active:bg-white/40 text-white rounded-2xl px-4 py-3 font-semibold text-sm transition-colors shadow-sm min-h-[48px]"
              aria-label="Agregar cita"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Nueva cita</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Contenido ────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-4 md:px-10 md:pt-8 md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:gap-8">

        {/* Columna principal — lista de citas */}
        <div>
          {cargando ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <SkeletonTarjetaCita key={i} />)}
            </div>
          ) : citas.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <CalendarX size={40} className="mx-auto mb-3 opacity-25" style={{ color: "#C85A2A" }} />
              <p className="font-semibold text-gray-600">No tienes citas registradas</p>
              <p className="text-gray-400 text-sm mt-1 mb-5">
                Agrega tu primera cita para recibir recordatorios
              </p>
              <button
                onClick={abrirAgregar}
                className="px-6 py-3 rounded-2xl text-sm font-bold text-white transition-opacity hover:opacity-90"
                style={{ background: "#C85A2A" }}
              >
                + Agregar cita
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(grupos).map(([etiqueta, citasGrupo]) => (
                <div key={etiqueta}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-2 capitalize"
                    style={{ color: "#9A6A2A" }}>
                    {etiqueta}
                  </p>
                  <div className="space-y-2">
                    {citasGrupo.map((cita) => (
                      <div key={cita.id} className="bg-white rounded-2xl shadow-sm overflow-hidden"
                        style={{ borderLeft: "4px solid #C85A2A" }}>
                        <TarjetaCita
                          cita={cita}
                          onEditar={abrirEditar}
                          onEliminar={handleEliminar}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Columna lateral — estadísticas + acciones (solo desktop) */}
        <div className="hidden md:block space-y-4">
          {/* Stats */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "#9A6A2A" }}>
              Resumen
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "#FDF0E6" }}>
                <CalendarCheck size={18} style={{ color: "#C85A2A" }} />
                <div>
                  <p className="text-xl font-bold" style={{ color: "#7A3D1A" }}>{citasHoy}</p>
                  <p className="text-xs text-gray-500">Citas hoy</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50">
                <Clock size={18} className="text-blue-600" />
                <div>
                  <p className="text-xl font-bold text-blue-700">{citasProximas}</p>
                  <p className="text-xs text-gray-500">Próximas</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <CalendarCheck size={18} className="text-gray-400" />
                <div>
                  <p className="text-xl font-bold text-gray-700">{citas.length}</p>
                  <p className="text-xs text-gray-500">Total registradas</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA agregar */}
          <button
            onClick={abrirAgregar}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold text-white shadow-md hover:opacity-90 active:scale-95 transition-all"
            style={{ background: "linear-gradient(135deg, #C85A2A, #E87A3A)" }}
          >
            <Plus size={18} />
            Nueva cita
          </button>

          {/* Tip */}
          <div className="rounded-2xl p-4" style={{ background: "#FFF8E6" }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "#9A6A2A" }}>
              Tip
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "#7A3D1A" }}>
              Activa los recordatorios en cada cita para recibir notificaciones 60 y 15 minutos antes.
            </p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      {mostrarFormulario && (
        <FormularioCita
          citaEditar={citaEditar}
          onGuardar={handleGuardar}
          onCerrar={() => setMostrarFormulario(false)}
        />
      )}

      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrar} />}
    </>
  );
}
