"use client";
// Módulo de actividades — CRUD completo con detección de rol
import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useActividadesInteres } from "@/hooks/useActividadesInteres";
import { TarjetaActividad } from "@/components/actividades/TarjetaActividad";
import { CalendarioActividades } from "@/components/actividades/CalendarioActividades";
import { FormActividad } from "@/components/coordinador/FormActividad";
import { Toast, useToast } from "@/components/ui/Toast";
import { Skeleton } from "@/components/ui/Skeleton";
import { Actividad, TipoActividad } from "@/lib/types";
import { format, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import {
  Activity, Calendar, List, Plus, Pencil, Trash2,
  Users, Clock, MapPin, AlertCircle, X,
} from "lucide-react";

// ── Constantes visuales ────────────────────────────────────────────────────────
const TIPO_CONFIG: Record<TipoActividad, { label: string; bg: string; text: string }> = {
  arte:       { label: "Arte",       bg: "#FEE2E2", text: "#991B1B" },
  deporte:    { label: "Deporte",    bg: "#D1FAE5", text: "#065F46" },
  educacion:  { label: "Educación",  bg: "#DBEAFE", text: "#1E40AF" },
  bienestar:  { label: "Bienestar",  bg: "#EDE9FE", text: "#5B21B6" },
  recreacion: { label: "Recreación", bg: "#FEF3C7", text: "#92400E" },
  otro:       { label: "Otro",       bg: "#F3F4F6", text: "#374151" },
};

const TIPOS_FILTRO: { value: TipoActividad | "todas"; label: string }[] = [
  { value: "todas",       label: "Todas" },
  { value: "arte",        label: "Arte" },
  { value: "deporte",     label: "Deporte" },
  { value: "educacion",   label: "Educación" },
  { value: "bienestar",   label: "Bienestar" },
  { value: "recreacion",  label: "Recreación" },
  { value: "otro",        label: "Otro" },
];

// ── Skeleton ───────────────────────────────────────────────────────────────────
function SkeletonTarjeta() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  );
}

// ── Tarjeta coordinador (con editar/cancelar) ──────────────────────────────────
function TarjetaCoordinador({
  actividad,
  onEditar,
  onCancelar,
  cancelando,
}: {
  actividad: Actividad;
  onEditar: () => void;
  onCancelar: () => void;
  cancelando: boolean;
}) {
  const tipo    = TIPO_CONFIG[actividad.tipo];
  const porcentaje = actividad.capacidadMax > 0
    ? Math.round((actividad.registrados / actividad.capacidadMax) * 100)
    : 0;
  const activa = actividad.estado === "programada" || actividad.estado === "en_curso";
  const [confirmCanc, setConfirmCanc] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
      {/* Imagen */}
      {actividad.imagenUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={actividad.imagenUrl} alt={actividad.titulo}
          className="w-full object-cover" style={{ aspectRatio: "16/7" }} />
      )}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: tipo.bg, color: tipo.text }}>{tipo.label}</span>
          {activa && (
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={onEditar} className="p-1.5 rounded-lg hover:bg-gray-100">
                <Pencil size={14} className="text-gray-400" />
              </button>
              <button onClick={() => setConfirmCanc(true)} disabled={cancelando}
                className="p-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50">
                <Trash2 size={14} className="text-red-400" />
              </button>
            </div>
          )}
        </div>

        <h3 className="font-bold text-gray-800 mb-1">{actividad.titulo}</h3>
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{actividad.descripcion}</p>

        <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-3">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {format(actividad.fechaHora.toDate(), "d MMM, HH:mm", { locale: es })}
            {" · "}{actividad.duracionMin} min
          </span>
          <span className="flex items-center gap-1"><MapPin size={12} />{actividad.ubicacion}</span>
          {actividad.instructor && (
            <span className="flex items-center gap-1"><Users size={12} />{actividad.instructor}</span>
          )}
        </div>

        {/* Barra ocupación */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">{actividad.registrados} / {actividad.capacidadMax} lugares</span>
            <span className="text-xs font-medium" style={{ color: porcentaje >= 90 ? "#EF4444" : "#C85A2A" }}>{porcentaje}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full"
              style={{ width: `${Math.min(porcentaje, 100)}%`, background: porcentaje >= 90 ? "#EF4444" : "#C85A2A" }} />
          </div>
        </div>

        {/* Estado badge */}
        {actividad.estado !== "programada" && (
          <span className="text-xs font-medium px-2.5 py-1 rounded-full"
            style={{
              background: actividad.estado === "en_curso" ? "#D1FAE5" : actividad.estado === "cancelada" ? "#FEE2E2" : "#F3F4F6",
              color:      actividad.estado === "en_curso" ? "#065F46" : actividad.estado === "cancelada" ? "#991B1B" : "#6B7280",
            }}>
            {actividad.estado === "en_curso" ? "En curso" : actividad.estado === "cancelada" ? "Cancelada" : "Completada"}
          </span>
        )}

        {/* Confirmar cancelar */}
        {confirmCanc && (
          <div className="mt-3 rounded-xl bg-red-50 border border-red-200 p-3">
            <p className="text-xs font-bold text-red-700 mb-1">¿Cancelar "{actividad.titulo}"?</p>
            <p className="text-[10px] text-red-500 mb-3">Se notificará a los {actividad.registrados} registrados.</p>
            <div className="flex gap-2">
              <button onClick={() => { onCancelar(); setConfirmCanc(false); }} disabled={cancelando}
                className="flex-1 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold disabled:opacity-50">
                {cancelando ? "…" : "Cancelar actividad"}
              </button>
              <button onClick={() => setConfirmCanc(false)}
                className="flex-1 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs">
                No
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Página principal ───────────────────────────────────────────────────────────
export default function ActividadesPage() {
  const { familia } = useAuth();
  const { tieneInteres, toggleInteres } = useActividadesInteres(familia?.id);
  const { toast, mostrar, cerrar } = useToast();

  const [actividades, setActividades]     = useState<Actividad[]>([]);
  const [misRegistros, setMisRegistros]   = useState<Set<string>>(new Set());
  const [cargando, setCargando]           = useState(true);

  const [vistaCalendario, setVistaCalendario]   = useState(false);
  const [diaSeleccionado, setDiaSeleccionado]   = useState<Date>(new Date());
  const [filtroTipo, setFiltroTipo]             = useState<TipoActividad | "todas">("todas");
  const [accionando, setAccionando]             = useState<string | null>(null);

  // Estado CRUD (solo coordinadores)
  const [formActividad, setFormActividad]         = useState<{ abierto: boolean; editar?: Actividad }>({ abierto: false });
  const [cancelando, setCancelando]               = useState<string | null>(null);

  const esCoordinador = familia?.rol === "coordinador";

  // ── Suscripción actividades ──────────────────────────────────────────────────
  useEffect(() => {
    if (!familia?.casaRonald) { setCargando(false); return; }

    const q = query(
      collection(db, "actividades"),
      where("casaRonald", "==", familia.casaRonald)
    );

    const unsub = onSnapshot(q, (snap) => {
      const todas = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Actividad)
        .sort((a, b) => a.fechaHora.toMillis() - b.fechaHora.toMillis());
      setActividades(todas);
      setCargando(false);
    }, () => setCargando(false));

    return unsub;
  }, [familia?.casaRonald]);

  // ── Suscripción mis registros ────────────────────────────────────────────────
  useEffect(() => {
    if (!familia?.id) { setMisRegistros(new Set()); return; }

    const q = query(
      collection(db, "registrosActividad"),
      where("familiaId", "==", familia.id)
    );

    return onSnapshot(q, (snap) => {
      setMisRegistros(new Set(snap.docs.map((d) => d.data().actividadId as string)));
    });
  }, [familia?.id]);

  // ── Acciones cuidador ────────────────────────────────────────────────────────
  const handleRegistrar = async (actividadId: string) => {
    if (!familia) return;
    setAccionando(actividadId);
    try {
      const res = await fetch("/api/actividades/registrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actividadId, familiaId: familia.id, nombreCuidador: familia.nombreCuidador, accion: "registrar" }),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error ?? "Error"); }
      mostrar("¡Inscripción confirmada!");
    } catch (e: unknown) {
      mostrar(e instanceof Error ? e.message : "Error al inscribirse", "error");
    } finally { setAccionando(null); }
  };

  const handleCancelarRegistro = async (actividadId: string) => {
    if (!familia) return;
    setAccionando(actividadId);
    try {
      const res = await fetch("/api/actividades/registrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actividadId, familiaId: familia.id, nombreCuidador: familia.nombreCuidador, accion: "cancelar" }),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error ?? "Error"); }
      mostrar("Inscripción cancelada.");
    } catch (e: unknown) {
      mostrar(e instanceof Error ? e.message : "Error", "error");
    } finally { setAccionando(null); }
  };

  // ── Acciones coordinador ─────────────────────────────────────────────────────
  type DatosForm = {
    titulo: string; descripcion: string; tipo: TipoActividad;
    fechaHora: string; duracionMin: number; capacidadMax: number;
    instructor: string; ubicacion: string; imagenUrl?: string;
  };

  const crearActividad = async (datos: DatosForm) => {
    if (!familia) return;
    const res = await fetch("/api/actividades/crear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...datos,
        fechaHora: new Date(datos.fechaHora).toISOString(),
        casaRonald: familia.casaRonald,
        creadaPor: familia.nombreCuidador,
      }),
    });
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error ?? "Error"); }
  };

  const editarActividad = async (id: string, datos: DatosForm) => {
    const res = await fetch(`/api/actividades/${id}/editar`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...datos, fechaHora: new Date(datos.fechaHora).toISOString() }),
    });
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error ?? "Error"); }
  };

  const cancelarActividad = async (id: string) => {
    setCancelando(id);
    try {
      const res = await fetch(`/api/actividades/${id}/cancelar`, { method: "DELETE" });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error ?? "Error"); }
      mostrar("Actividad cancelada. Se notificó a los registrados.");
    } catch (e: unknown) {
      mostrar(e instanceof Error ? e.message : "Error", "error");
    } finally { setCancelando(null); }
  };

  // ── Filtrado ─────────────────────────────────────────────────────────────────
  const actividadesVisibles = actividades.filter((a) => {
    // Cuidadores solo ven programadas/en_curso; coordinadores ven todas
    if (!esCoordinador && a.estado !== "programada" && a.estado !== "en_curso") return false;
    if (vistaCalendario && !isSameDay(a.fechaHora.toDate(), diaSeleccionado)) return false;
    if (filtroTipo !== "todas" && a.tipo !== filtroTipo) return false;
    return true;
  });

  const misInscritas = actividades.filter((a) => misRegistros.has(a.id));

  // Para el calendario
  const porFecha = actividades.reduce<Record<string, Actividad[]>>((acc, a) => {
    if (a.estado === "cancelada") return acc;
    const clave = a.fechaHora.toDate().toISOString().slice(0, 10);
    if (!acc[clave]) acc[clave] = [];
    acc[clave].push(a);
    return acc;
  }, {});
  const diasConActividad = new Set(Object.keys(porFecha).map((d) => d.slice(8, 10)));

  // Métricas coordinador
  const activas  = actividades.filter((a) => a.estado === "programada" || a.estado === "en_curso").length;
  const hoy = new Date();
  const hoyCount = actividades.filter((a) => {
    const f = a.fechaHora.toDate();
    return f.getDate() === hoy.getDate() && f.getMonth() === hoy.getMonth() && f.getFullYear() === hoy.getFullYear() && a.estado !== "cancelada";
  }).length;

  return (
    <>
      {/* ── Banner ───────────────────────────────────────────── */}
      <div className="relative overflow-hidden w-full"
        style={{ background: "linear-gradient(135deg, #C85A2A 0%, #E87A3A 70%, #F5C842 100%)" }}>
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-15" style={{ background: "#7A3D1A" }} />
        <div className="max-w-2xl mx-auto px-5 py-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Activity size={24} /> Actividades
              </h1>
              <p className="text-white/70 text-sm mt-1">
                {esCoordinador ? `${actividades.length} en total · ${hoyCount} hoy` : "Talleres, clases y eventos en la Casa"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Botón nuevo (solo coordinador) */}
              {esCoordinador && (
                <button onClick={() => setFormActividad({ abierto: true })}
                  className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white rounded-2xl px-4 py-2.5 font-semibold text-sm transition-colors shrink-0">
                  <Plus size={16} /> Nueva
                </button>
              )}
              {/* Toggle vista */}
              <div className="flex bg-white/20 rounded-xl p-1 gap-1">
                <button onClick={() => setVistaCalendario(false)}
                  className={`p-2 rounded-lg transition-colors ${!vistaCalendario ? "bg-white" : "hover:bg-white/20"}`}>
                  <List size={16} style={{ color: vistaCalendario ? "#fff" : "#C85A2A" }} />
                </button>
                <button onClick={() => setVistaCalendario(true)}
                  className={`p-2 rounded-lg transition-colors ${vistaCalendario ? "bg-white" : "hover:bg-white/20"}`}>
                  <Calendar size={16} style={{ color: !vistaCalendario ? "#fff" : "#C85A2A" }} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-5 pb-24">

        {/* ── Métricas coordinador ────────────────────────────── */}
        {esCoordinador && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }} className="mb-5">
            {[
              { label: "Activas",   value: activas,                          color: "#065F46", bg: "#D1FAE5" },
              { label: "Hoy",       value: hoyCount,                         color: "#C85A2A", bg: "#FDF0E6" },
              { label: "Total",     value: actividades.length,               color: "#374151", bg: "#F3F4F6" },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className="bg-white rounded-2xl shadow-sm p-3 text-center">
                <p className="text-xl font-bold" style={{ color }}>{value}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Mis inscripciones (solo cuidadores) ─────────────── */}
        {!esCoordinador && misInscritas.length > 0 && !vistaCalendario && (
          <section className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "#9A6A2A" }}>
              Mis inscripciones ({misInscritas.length})
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
              {misInscritas.map((a) => (
                <div key={a.id} className="min-w-[220px] shrink-0">
                  <TarjetaActividad actividad={a} registrado
                    onRegistrar={() => {}} onCancelar={() => handleCancelarRegistro(a.id)}
                    cargando={accionando === a.id}
                    interesado={tieneInteres(a.id)} onToggleInteres={() => toggleInteres(a.id)}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Calendario ──────────────────────────────────────── */}
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

        {/* ── Filtros por tipo ─────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 mb-5">
          {TIPOS_FILTRO.map((t) => (
            <button key={t.value} onClick={() => setFiltroTipo(t.value)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filtroTipo === t.value ? "text-white" : "bg-white text-gray-500 border border-gray-200"
              }`}
              style={filtroTipo === t.value ? { background: "#C85A2A" } : {}}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Lista ────────────────────────────────────────────── */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "#9A6A2A" }}>
            {vistaCalendario
              ? `Actividades del día (${actividadesVisibles.length})`
              : esCoordinador
              ? `Todas las actividades (${actividadesVisibles.length})`
              : `Próximas actividades (${actividadesVisibles.length})`}
          </h2>

          {cargando ? (
            <div className="space-y-4"><SkeletonTarjeta /><SkeletonTarjeta /><SkeletonTarjeta /></div>
          ) : actividadesVisibles.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
              <Activity size={40} className="mx-auto mb-3 text-gray-200" />
              <p className="font-semibold text-gray-500 text-sm">
                {vistaCalendario ? "No hay actividades este día" : "Sin actividades disponibles"}
              </p>
              <p className="text-gray-400 text-xs mt-1 mb-4">
                {vistaCalendario
                  ? "Selecciona otro día en el calendario"
                  : esCoordinador ? "Crea la primera actividad para los cuidadores" : "El coordinador publicará actividades pronto"}
              </p>
              {esCoordinador && (
                <button onClick={() => setFormActividad({ abierto: true })}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{ background: "#C85A2A" }}>
                  + Nueva actividad
                </button>
              )}
            </div>
          ) : esCoordinador ? (
            // Vista coordinador
            <div className="space-y-4">
              {actividadesVisibles.map((a) => (
                <TarjetaCoordinador key={a.id} actividad={a}
                  onEditar={() => setFormActividad({ abierto: true, editar: a })}
                  onCancelar={() => cancelarActividad(a.id)}
                  cancelando={cancelando === a.id}
                />
              ))}
            </div>
          ) : (
            // Vista cuidador
            <div className="space-y-4">
              {actividadesVisibles.map((a) => (
                <TarjetaActividad key={a.id} actividad={a}
                  registrado={misRegistros.has(a.id)}
                  onRegistrar={() => handleRegistrar(a.id)}
                  onCancelar={() => handleCancelarRegistro(a.id)}
                  cargando={accionando === a.id}
                  interesado={tieneInteres(a.id)}
                  onToggleInteres={() => toggleInteres(a.id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ── Modal FormActividad (coordinador) ─────────────────── */}
      {formActividad.abierto && familia && (
        <FormActividad
          actividad={formActividad.editar}
          casaRonald={familia.casaRonald}
          creadaPor={familia.nombreCuidador}
          onGuardar={async (datos) => {
            if (formActividad.editar) {
              await editarActividad(formActividad.editar.id, datos);
              mostrar("Actividad actualizada");
            } else {
              await crearActividad(datos);
              mostrar("Actividad creada");
            }
            setFormActividad({ abierto: false });
          }}
          onCerrar={() => setFormActividad({ abierto: false })}
        />
      )}

      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrar} />}
    </>
  );
}
