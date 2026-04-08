"use client";
// Módulo de actividades — app móvil para cuidadores
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useActividades } from "@/hooks/useActividades";
import { TarjetaActividad } from "@/components/actividades/TarjetaActividad";
import { CalendarioActividades } from "@/components/actividades/CalendarioActividades";
import { Toast, useToast } from "@/components/ui/Toast";
import { Skeleton } from "@/components/ui/Skeleton";
import { TipoActividad } from "@/lib/types";
import { format, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { Activity, Calendar, List } from "lucide-react";

const TIPOS_FILTRO: { value: TipoActividad | "todas"; label: string }[] = [
  { value: "todas",       label: "Todas" },
  { value: "arte",        label: "Arte" },
  { value: "deporte",     label: "Deporte" },
  { value: "educacion",   label: "Educación" },
  { value: "bienestar",   label: "Bienestar" },
  { value: "recreacion",  label: "Recreación" },
  { value: "otro",        label: "Otro" },
];

function SkeletonTarjeta() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  );
}

export default function ActividadesPage() {
  const { familia } = useAuth();
  const {
    actividades,
    cargando,
    estaRegistrado,
    porFecha,
    diasConActividad,
    registrar,
    cancelarRegistro,
  } = useActividades(familia?.casaRonald, familia?.id);

  const { toast, mostrar, cerrar } = useToast();

  const [vistaCalendario, setVistaCalendario] = useState(false);
  const [diaSeleccionado, setDiaSeleccionado] = useState<Date>(new Date());
  const [filtroTipo, setFiltroTipo] = useState<TipoActividad | "todas">("todas");
  const [accionando, setAccionando] = useState<string | null>(null);

  const handleRegistrar = async (actividadId: string) => {
    if (!familia) return;
    setAccionando(actividadId);
    try {
      await registrar(actividadId, familia.nombreCuidador);
      mostrar("¡Inscripción confirmada! Te esperamos.");
    } catch (e: unknown) {
      mostrar(e instanceof Error ? e.message : "Error al inscribirse", "error");
    } finally {
      setAccionando(null);
    }
  };

  const handleCancelar = async (actividadId: string) => {
    if (!familia) return;
    setAccionando(actividadId);
    try {
      await cancelarRegistro(actividadId, familia.nombreCuidador);
      mostrar("Inscripción cancelada.");
    } catch (e: unknown) {
      mostrar(e instanceof Error ? e.message : "Error al cancelar", "error");
    } finally {
      setAccionando(null);
    }
  };

  // Filtrar por día seleccionado (vista calendario) o todas
  const actividadesFiltradas = (() => {
    let lista = actividades;

    if (vistaCalendario) {
      lista = lista.filter((a) => isSameDay(a.fechaHora.toDate(), diaSeleccionado));
    }

    if (filtroTipo !== "todas") {
      lista = lista.filter((a) => a.tipo === filtroTipo);
    }

    return lista;
  })();

  const misInscritas = actividades.filter((a) => estaRegistrado(a.id));

  return (
    <>
      {/* ── Banner ───────────────────────────────────────── */}
      <div
        className="relative overflow-hidden w-full"
        style={{ background: "linear-gradient(135deg, #C85A2A 0%, #E87A3A 70%, #F5C842 100%)" }}
      >
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-15"
          style={{ background: "#7A3D1A" }} />
        <div className="max-w-2xl mx-auto px-5 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Activity size={24} /> Actividades
              </h1>
              <p className="text-white/70 text-sm mt-1">
                Talleres, clases y eventos en la Casa
              </p>
            </div>
            {/* Toggle vista */}
            <div className="flex bg-white/20 rounded-xl p-1 gap-1">
              <button
                onClick={() => setVistaCalendario(false)}
                className={`p-2 rounded-lg transition-colors ${!vistaCalendario ? "bg-white" : "hover:bg-white/20"}`}
              >
                <List size={16} style={{ color: vistaCalendario ? "#fff" : "#C85A2A" }} />
              </button>
              <button
                onClick={() => setVistaCalendario(true)}
                className={`p-2 rounded-lg transition-colors ${vistaCalendario ? "bg-white" : "hover:bg-white/20"}`}
              >
                <Calendar size={16} style={{ color: !vistaCalendario ? "#fff" : "#C85A2A" }} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-5 pb-24">

        {/* Mis inscripciones (si las hay) */}
        {misInscritas.length > 0 && !vistaCalendario && (
          <section className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "#9A6A2A" }}>
              Mis inscripciones ({misInscritas.length})
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
              {misInscritas.map((a) => (
                <div key={a.id} className="min-w-[220px] shrink-0">
                  <TarjetaActividad
                    actividad={a}
                    registrado
                    onRegistrar={() => {}}
                    onCancelar={() => handleCancelar(a.id)}
                    cargando={accionando === a.id}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Calendario */}
        {vistaCalendario && (
          <div className="mb-5">
            <CalendarioActividades
              diasConActividad={diasConActividad}
              diaSeleccionado={diaSeleccionado}
              onSeleccionarDia={setDiaSeleccionado}
            />
            <p className="text-xs text-gray-400 text-center mt-2 capitalize">
              {format(diaSeleccionado, "EEEE d 'de' MMMM", { locale: es })}
              {" · "}{(porFecha[diaSeleccionado.toISOString().slice(0, 10)] ?? []).length} actividad(es)
            </p>
          </div>
        )}

        {/* Filtros por tipo */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 mb-4">
          {TIPOS_FILTRO.map((t) => (
            <button
              key={t.value}
              onClick={() => setFiltroTipo(t.value)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filtroTipo === t.value
                  ? "text-white"
                  : "bg-white text-gray-500 border border-gray-200"
              }`}
              style={filtroTipo === t.value ? { background: "#C85A2A" } : {}}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Lista de actividades */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "#9A6A2A" }}>
            {vistaCalendario
              ? `Actividades del día (${actividadesFiltradas.length})`
              : `Próximas actividades (${actividadesFiltradas.length})`}
          </h2>

          {cargando ? (
            <div className="space-y-4">
              <SkeletonTarjeta />
              <SkeletonTarjeta />
              <SkeletonTarjeta />
            </div>
          ) : actividadesFiltradas.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <Activity size={40} className="mx-auto mb-3 text-gray-200" />
              <p className="font-semibold text-gray-500 text-sm">
                {vistaCalendario
                  ? "No hay actividades este día"
                  : "Sin actividades disponibles"}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                {vistaCalendario
                  ? "Selecciona otro día en el calendario"
                  : "El coordinador publicará actividades pronto"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {actividadesFiltradas.map((actividad) => (
                <TarjetaActividad
                  key={actividad.id}
                  actividad={actividad}
                  registrado={estaRegistrado(actividad.id)}
                  onRegistrar={() => handleRegistrar(actividad.id)}
                  onCancelar={() => handleCancelar(actividad.id)}
                  cargando={accionando === actividad.id}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrar} />}
    </>
  );
}
