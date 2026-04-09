"use client";
// Módulo de actividades — OrbitImages en hero, Stack para lista cuidador
import { useState, useEffect, useMemo, useRef } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useActividadesInteres } from "@/hooks/useActividadesInteres";
import { TarjetaActividad } from "@/components/actividades/TarjetaActividad";
import { CalendarioActividades } from "@/components/actividades/CalendarioActividades";
import { FormActividad } from "@/components/coordinador/FormActividad";
import { OrbitImages } from "@/components/ui/OrbitImages";
import Stack, { type StackRef } from "@/components/ui/Stack";
import { Toast, useToast } from "@/components/ui/Toast";
import { Skeleton } from "@/components/ui/Skeleton";
import { Actividad, TipoActividad } from "@/lib/types";
import { format, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import {
  Activity, Calendar, List, Plus, Pencil, Trash2,
  Clock, MapPin, Users, Brush, Dumbbell, BookOpen,
  Heart, Gamepad2, Sparkles, X, UserCheck, UserMinus,
} from "lucide-react";

// InfiniteMenu comentado — reemplazado por Stack
// const InfiniteMenu = dynamic(() => import("@/components/ui/InfiniteMenu"), { ssr: false });

// ── Config tipos ───────────────────────────────────────────────────────────────
const TIPO_CONFIG: Record<TipoActividad, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  arte:       { label: "Arte",       bg: "#FEE2E2", text: "#991B1B", icon: <Brush size={18} /> },
  deporte:    { label: "Deporte",    bg: "#D1FAE5", text: "#065F46", icon: <Dumbbell size={18} /> },
  educacion:  { label: "Educación",  bg: "#DBEAFE", text: "#1E40AF", icon: <BookOpen size={18} /> },
  bienestar:  { label: "Bienestar",  bg: "#EDE9FE", text: "#5B21B6", icon: <Heart size={18} /> },
  recreacion: { label: "Recreación", bg: "#FEF3C7", text: "#92400E", icon: <Gamepad2 size={18} /> },
  otro:       { label: "Otro",       bg: "#F3F4F6", text: "#374151", icon: <Sparkles size={18} /> },
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

// ── Placeholder imagen para actividades sin imagen ─────────────────────────────
const TIPO_EMOJI: Record<TipoActividad, string> = {
  arte: "🎨", deporte: "⚽", educacion: "📚", bienestar: "💜", recreacion: "🎮", otro: "✨",
};

// Genera un PNG data URL via canvas (compatible con WebGL, sin crossOrigin issues)
function placeholderImg(tipo: TipoActividad): string {
  const { bg, text } = TIPO_CONFIG[tipo];
  const emoji = TIPO_EMOJI[tipo];
  if (typeof document === "undefined") return "";
  const canvas = document.createElement("canvas");
  canvas.width = 256; canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = text;
  ctx.font = "bold 120px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji, 128, 140);
  return canvas.toDataURL("image/png");
}

// ── Tarjeta visual dentro del Stack (cuidador) ────────────────────────────────
function TarjetaStackActividad({
  actividad,
  registrado,
  onClick,
}: {
  actividad: Actividad;
  registrado: boolean;
  onClick: () => void;
}) {
  const tipo = TIPO_CONFIG[actividad.tipo];
  const lleno = actividad.registrados >= actividad.capacidadMax;
  const porcentaje = actividad.capacidadMax > 0
    ? Math.round((actividad.registrados / actividad.capacidadMax) * 100) : 0;

  return (
    <div
      className="w-full h-full flex flex-col overflow-hidden rounded-2xl shadow-xl cursor-pointer select-none"
      style={{ background: tipo.bg }}
      onClick={onClick}
    >
      {/* Imagen o banner de color */}
      {actividad.imagenUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={actividad.imagenUrl} alt={actividad.titulo}
          className="w-full object-cover" style={{ height: 180 }} />
      ) : (
        <div className="flex items-center justify-center" style={{ height: 180, fontSize: 90 }}>
          {TIPO_EMOJI[actividad.tipo]}
        </div>
      )}

      {/* Contenido */}
      <div className="flex-1 p-5 flex flex-col justify-between" style={{ background: "#fff" }}>
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full mb-2"
            style={{ background: tipo.bg, color: tipo.text }}>
            {tipo.icon} {tipo.label}
          </span>
          <h3 className="font-black text-gray-800 text-lg leading-tight mb-1 line-clamp-2">{actividad.titulo}</h3>
          <div className="flex flex-wrap gap-2 text-xs text-gray-400 mt-2">
            <span className="flex items-center gap-1"><Clock size={11} />
              {format(actividad.fechaHora.toDate(), "d MMM · HH:mm", { locale: es })}
            </span>
            <span className="flex items-center gap-1"><MapPin size={11} />{actividad.ubicacion}</span>
          </div>
        </div>

        {/* Barra + badge */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">{actividad.registrados}/{actividad.capacidadMax} lugares</span>
            {registrado ? (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: "#D1FAE5", color: "#065F46" }}>✓ Inscrito</span>
            ) : lleno ? (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: "#FEE2E2", color: "#991B1B" }}>Lleno</span>
            ) : null}
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full"
              style={{ width: `${Math.min(porcentaje, 100)}%`, background: lleno ? "#EF4444" : "#C85A2A" }} />
          </div>
          <p className="text-[11px] text-gray-400 text-center mt-3">Toca para ver detalles</p>
        </div>
      </div>
    </div>
  );
}

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

// ── Tarjeta coordinador ────────────────────────────────────────────────────────
function TarjetaCoord({
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
  const tipo = TIPO_CONFIG[actividad.tipo];
  const porcentaje = actividad.capacidadMax > 0
    ? Math.round((actividad.registrados / actividad.capacidadMax) * 100) : 0;
  const activa = actividad.estado === "programada" || actividad.estado === "en_curso";
  const [confirmCanc, setConfirmCanc] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 group">
      {actividad.imagenUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={actividad.imagenUrl} alt={actividad.titulo}
          className="w-full object-cover" style={{ aspectRatio: "16/7" }} />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: tipo.bg, color: tipo.text }}>
              {tipo.icon} {tipo.label}
            </span>
            {actividad.estado !== "programada" && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{
                  background: actividad.estado === "en_curso" ? "#D1FAE5" : actividad.estado === "cancelada" ? "#FEE2E2" : "#F3F4F6",
                  color:      actividad.estado === "en_curso" ? "#065F46" : actividad.estado === "cancelada" ? "#991B1B" : "#6B7280",
                }}>
                {actividad.estado === "en_curso" ? "En curso" : actividad.estado === "cancelada" ? "Cancelada" : "Completada"}
              </span>
            )}
          </div>
          {activa && (
            <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={onEditar} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-400">
                <Pencil size={13} />
              </button>
              <button onClick={() => setConfirmCanc(true)} disabled={cancelando}
                className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 disabled:opacity-40">
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>

        <h3 className="font-bold text-gray-800 mb-1">{actividad.titulo}</h3>
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{actividad.descripcion}</p>

        <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-3">
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {format(actividad.fechaHora.toDate(), "d MMM · HH:mm", { locale: es })}
            {" · "}{actividad.duracionMin} min
          </span>
          <span className="flex items-center gap-1"><MapPin size={11} />{actividad.ubicacion}</span>
          {actividad.instructor && (
            <span className="flex items-center gap-1"><Users size={11} />{actividad.instructor}</span>
          )}
        </div>

        {/* Barra ocupación */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">{actividad.registrados} / {actividad.capacidadMax} lugares</span>
            <span className="text-xs font-semibold" style={{ color: porcentaje >= 90 ? "#EF4444" : "#C85A2A" }}>{porcentaje}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all"
              style={{ width: `${Math.min(porcentaje, 100)}%`, background: porcentaje >= 90 ? "#EF4444" : "#C85A2A" }} />
          </div>
        </div>

        {/* Confirmar cancelar */}
        {confirmCanc && (
          <div className="mt-3 rounded-xl bg-red-50 border border-red-200 p-3">
            <p className="text-xs font-bold text-red-700 mb-1">¿Cancelar "{actividad.titulo}"?</p>
            <p className="text-[10px] text-red-500 mb-2">Se notificará a los {actividad.registrados} registrados.</p>
            <div className="flex gap-2">
              <button onClick={() => { onCancelar(); setConfirmCanc(false); }} disabled={cancelando}
                className="flex-1 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold disabled:opacity-50">
                {cancelando ? "…" : "Sí, cancelar"}
              </button>
              <button onClick={() => setConfirmCanc(false)}
                className="flex-1 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs">No</button>
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

  const [actividades, setActividades]   = useState<Actividad[]>([]);
  const [misRegistros, setMisRegistros] = useState<Set<string>>(new Set());
  const [cargando, setCargando]         = useState(true);

  const [vistaCalendario, setVistaCalendario] = useState(false);
  const [diaSeleccionado, setDiaSeleccionado] = useState<Date>(new Date());
  const [filtroTipo, setFiltroTipo]           = useState<TipoActividad | "todas">("todas");
  const [accionando, setAccionando]           = useState<string | null>(null);
  const [formActividad, setFormActividad]     = useState<{ abierto: boolean; editar?: Actividad }>({ abierto: false });
  const [cancelando, setCancelando]           = useState<string | null>(null);
  const [detalleActivo, setDetalleActivo]     = useState<Actividad | null>(null);
  const stackRef = useRef<StackRef>(null);

  const esCoordinador = familia?.rol === "coordinador";

  // ── Firestore ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!familia?.casaRonald) { setCargando(false); return; }
    const q = query(collection(db, "actividades"), where("casaRonald", "==", familia.casaRonald));
    return onSnapshot(q, (snap) => {
      setActividades(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Actividad)
        .sort((a, b) => a.fechaHora.toMillis() - b.fechaHora.toMillis()));
      setCargando(false);
    }, () => setCargando(false));
  }, [familia?.casaRonald]);

  useEffect(() => {
    if (!familia?.id) { setMisRegistros(new Set()); return; }
    const q = query(collection(db, "registrosActividad"), where("familiaId", "==", familia.id));
    return onSnapshot(q, (snap) => {
      setMisRegistros(new Set(snap.docs.map((d) => d.data().actividadId as string)));
    });
  }, [familia?.id]);

  // ── Acciones cuidador ──────────────────────────────────────────────────────
  const toggleRegistro = async (actividadId: string, accion: "registrar" | "cancelar") => {
    if (!familia) return;
    setAccionando(actividadId);
    try {
      const res = await fetch("/api/actividades/registrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actividadId, familiaId: familia.id, nombreCuidador: familia.nombreCuidador, accion }),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error ?? "Error"); }
      mostrar(accion === "registrar" ? "¡Inscripción confirmada!" : "Inscripción cancelada.");
    } catch (e: unknown) {
      mostrar(e instanceof Error ? e.message : "Error", "error");
    } finally { setAccionando(null); }
  };

  // ── Acciones coordinador ───────────────────────────────────────────────────
  type DatosForm = { titulo: string; descripcion: string; tipo: TipoActividad; fechaHora: string; duracionMin: number; capacidadMax: number; instructor: string; ubicacion: string; imagenUrl?: string; };

  const guardarActividad = async (datos: DatosForm) => {
    if (!familia) return;
    const editando = formActividad.editar;
    if (editando) {
      const res = await fetch(`/api/actividades/${editando.id}/editar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...datos, fechaHora: new Date(datos.fechaHora).toISOString() }),
      });
      if (!res.ok) throw new Error("Error al editar");
      mostrar("Actividad actualizada");
    } else {
      const res = await fetch("/api/actividades/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...datos, fechaHora: new Date(datos.fechaHora).toISOString(), casaRonald: familia.casaRonald, creadaPor: familia.nombreCuidador }),
      });
      if (!res.ok) throw new Error("Error al crear");
      mostrar("Actividad creada");
    }
    setFormActividad({ abierto: false });
  };

  const cancelarActividad = async (id: string) => {
    setCancelando(id);
    try {
      const res = await fetch(`/api/actividades/${id}/cancelar`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error");
      mostrar("Actividad cancelada. Se notificó a los registrados.");
    } catch (e: unknown) {
      mostrar(e instanceof Error ? e.message : "Error", "error");
    } finally { setCancelando(null); }
  };

  // ── Filtrado ───────────────────────────────────────────────────────────────
  const actividadesVisibles = useMemo(() => actividades.filter((a) => {
    if (!esCoordinador && a.estado !== "programada" && a.estado !== "en_curso") return false;
    if (vistaCalendario && !isSameDay(a.fechaHora.toDate(), diaSeleccionado)) return false;
    if (filtroTipo !== "todas" && a.tipo !== filtroTipo) return false;
    return true;
  }), [actividades, esCoordinador, vistaCalendario, diaSeleccionado, filtroTipo]);

  const misInscritas = actividades.filter((a) => misRegistros.has(a.id) && (a.estado === "programada" || a.estado === "en_curso"));

  const porFecha = useMemo(() => actividades.reduce<Record<string, Actividad[]>>((acc, a) => {
    if (a.estado === "cancelada") return acc;
    const k = a.fechaHora.toDate().toISOString().slice(0, 10);
    if (!acc[k]) acc[k] = [];
    acc[k].push(a);
    return acc;
  }, {}), [actividades]);
  const diasConActividad = new Set(Object.keys(porFecha).map((d) => d.slice(8, 10)));

  // ── Orbit items — íconos de tipos de actividades disponibles ──────────────
  const orbitItems = useMemo(() => {
    const tiposPresentes = [...new Set(actividades.filter(a => a.estado === "programada" || a.estado === "en_curso").map(a => a.tipo))];
    const tipos = tiposPresentes.length >= 3 ? tiposPresentes : Object.keys(TIPO_CONFIG) as TipoActividad[];
    return tipos.slice(0, 8).map((tipo) => ({
      key: tipo,
      content: (
        <div className="w-full h-full rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/30"
          style={{ background: TIPO_CONFIG[tipo].bg }}>
          <span style={{ color: TIPO_CONFIG[tipo].text }}>{TIPO_CONFIG[tipo].icon}</span>
        </div>
      ),
    }));
  }, [actividades]);

  const activas  = actividades.filter(a => a.estado === "programada" || a.estado === "en_curso").length;
  const hoy = new Date();
  const hoyCount = actividades.filter(a => {
    const f = a.fechaHora.toDate();
    return f.getDate() === hoy.getDate() && f.getMonth() === hoy.getMonth() && f.getFullYear() === hoy.getFullYear() && a.estado !== "cancelada";
  }).length;

  return (
    <>
      {/* ── Hero con Orbit ────────────────────────────────────── */}
      <div className="relative overflow-hidden w-full"
        style={{ background: "linear-gradient(135deg, #7A3D1A 0%, #C85A2A 55%, #E87A3A 100%)" }}>
        {/* Blobs decorativos */}
        <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full opacity-10" style={{ background: "#F5C842" }} />
        <div className="absolute -bottom-8 -right-8 w-36 h-36 rounded-full opacity-10" style={{ background: "#fff" }} />

        <div className="max-w-2xl mx-auto px-5 py-6">
          {/* Layout: texto izquierda + orbit derecha */}
          <div className="flex items-center justify-between gap-4">
            {/* Texto */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-2">
                <Activity size={26} className="shrink-0" /> Actividades
              </h1>
              <p className="text-white/70 text-sm mb-4">Talleres, clases y eventos en la Casa</p>

              {/* Métricas rápidas */}
              <div className="flex gap-3 flex-wrap">
                <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-2.5 text-center min-w-[64px]">
                  <p className="text-xl font-bold text-white">{activas}</p>
                  <p className="text-[10px] text-white/70">Activas</p>
                </div>
                <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-2.5 text-center min-w-[64px]">
                  <p className="text-xl font-bold text-white">{hoyCount}</p>
                  <p className="text-[10px] text-white/70">Hoy</p>
                </div>
                {!esCoordinador && (
                  <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-2.5 text-center min-w-[64px]">
                    <p className="text-xl font-bold text-white">{misInscritas.length}</p>
                    <p className="text-[10px] text-white/70">Mis inscr.</p>
                  </div>
                )}
              </div>

              {/* Acciones */}
              <div className="flex gap-2 mt-4 flex-wrap">
                {esCoordinador && (
                  <button onClick={() => setFormActividad({ abierto: true })}
                    className="flex items-center gap-1.5 bg-white text-orange-700 rounded-2xl px-4 py-2.5 font-bold text-sm hover:bg-orange-50 transition-colors shadow-sm">
                    <Plus size={15} /> Nueva actividad
                  </button>
                )}
                {/* Toggle vista */}
                <div className="flex bg-white/20 rounded-2xl p-1 gap-1">
                  <button onClick={() => setVistaCalendario(false)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${!vistaCalendario ? "bg-white text-orange-700" : "text-white/80 hover:bg-white/10"}`}>
                    <List size={13} /> Lista
                  </button>
                  <button onClick={() => setVistaCalendario(true)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${vistaCalendario ? "bg-white text-orange-700" : "text-white/80 hover:bg-white/10"}`}>
                    <Calendar size={13} /> Calendario
                  </button>
                </div>
              </div>
            </div>

            {/* Orbit — solo si hay items, oculto en pantallas muy pequeñas */}
            {orbitItems.length > 0 && (
              <div className="hidden sm:flex shrink-0 items-center justify-center" style={{ width: 200, height: 200 }}>
                <OrbitImages
                  items={orbitItems}
                  radius={82}
                  duration={22}
                  itemSize={44}
                  showRing
                  ringColor="rgba(255,255,255,0.2)"
                  centerContent={
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                      <Activity size={22} className="text-white" />
                    </div>
                  }
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-5 pb-24">

        {/* ── Mis inscripciones (cuidador) ─────────────────────── */}
        {!esCoordinador && misInscritas.length > 0 && !vistaCalendario && (
          <section className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#9A6A2A" }}>
              Mis inscripciones ({misInscritas.length})
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory">
              {misInscritas.map((a) => (
                <div key={a.id} className="min-w-[230px] shrink-0 snap-start">
                  <TarjetaActividad actividad={a} registrado
                    onRegistrar={() => {}} onCancelar={() => toggleRegistro(a.id, "cancelar")}
                    cargando={accionando === a.id}
                    interesado={tieneInteres(a.id)} onToggleInteres={() => toggleInteres(a.id)}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Calendario ───────────────────────────────────────── */}
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

        {/* ── Filtros ───────────────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 mb-5 scrollbar-none">
          {TIPOS_FILTRO.map((t) => {
            const activo = filtroTipo === t.value;
            return (
              <button key={t.value} onClick={() => setFiltroTipo(t.value)}
                className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={activo
                  ? { background: "#C85A2A", color: "#fff", boxShadow: "0 2px 8px rgba(200,90,42,0.3)" }
                  : { background: "#fff", color: "#6B7280", border: "1px solid #E5E7EB" }}>
                {t.label}
              </button>
            );
          })}
        </div>

        {/* ── Lista ────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "#9A6A2A" }}>
              {vistaCalendario ? "Este día" : esCoordinador ? "Todas" : "Próximas"}
              {" "}({actividadesVisibles.length})
            </h2>
          </div>

          {cargando ? (
            <div className="space-y-4"><SkeletonTarjeta /><SkeletonTarjeta /><SkeletonTarjeta /></div>
          ) : actividadesVisibles.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-sm p-10 text-center">
              <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: "#FDF0E6" }}>
                <Activity size={28} style={{ color: "#C85A2A" }} />
              </div>
              <p className="font-semibold text-gray-600 text-sm mb-1">
                {vistaCalendario ? "No hay actividades este día" : "Sin actividades disponibles"}
              </p>
              <p className="text-gray-400 text-xs mb-4">
                {esCoordinador ? "Crea la primera actividad para los cuidadores" : "El coordinador publicará actividades pronto"}
              </p>
              {esCoordinador && (
                <button onClick={() => setFormActividad({ abierto: true })}
                  className="px-5 py-2.5 rounded-2xl text-sm font-bold text-white"
                  style={{ background: "#C85A2A" }}>
                  + Nueva actividad
                </button>
              )}
            </div>
          ) : esCoordinador ? (
            <div className="space-y-4">
              {actividadesVisibles.map((a) => (
                <TarjetaCoord key={a.id} actividad={a}
                  onEditar={() => setFormActividad({ abierto: true, editar: a })}
                  onCancelar={() => cancelarActividad(a.id)}
                  cancelando={cancelando === a.id}
                />
              ))}
            </div>
          ) : (
            /* ── Vista cuidador: Stack de cartas con flechas superpuestas ── */
            <div className="flex flex-col items-center gap-4">
              {/* Contenedor relativo — overflow-hidden para evitar que el abanico salga */}
              <div className="relative w-full overflow-hidden" style={{ height: 400 }}>
                <Stack
                  ref={stackRef}
                  cards={actividadesVisibles.map((a) => (
                    <TarjetaStackActividad
                      key={a.id}
                      actividad={a}
                      registrado={misRegistros.has(a.id)}
                      onClick={() => setDetalleActivo(a)}
                    />
                  ))}
                  autoplay
                  autoplayDelay={4000}
                  pauseOnHover
                  randomRotation
                  sensitivity={80}
                />

                {/* Flecha izquierda — flotante sobre la carta */}
                <button
                  onClick={() => stackRef.current?.prev()}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90"
                  style={{ background: "#FDF0E6", color: "#C85A2A", border: "1.5px solid #F0E5D0" }}
                  aria-label="Actividad anterior"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6"/>
                  </svg>
                </button>

                {/* Flecha derecha — flotante sobre la carta */}
                <button
                  onClick={() => stackRef.current?.next()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90"
                  style={{ background: "#C85A2A", color: "#fff", border: "1.5px solid #B04E24" }}
                  aria-label="Siguiente actividad"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </button>
              </div>

              <p className="text-xs text-gray-400 text-center">
                Arrastra, toca o usa las flechas · toca la carta para inscribirte
              </p>
            </div>
          )}
        </section>
      </div>

      {/* ── Modal FormActividad ───────────────────────────────── */}
      {formActividad.abierto && familia && (
        <FormActividad
          actividad={formActividad.editar}
          casaRonald={familia.casaRonald}
          creadaPor={familia.nombreCuidador}
          onGuardar={guardarActividad}
          onCerrar={() => setFormActividad({ abierto: false })}
        />
      )}

      {/* ── Detalle actividad (cuidador) ─────────────────────── */}
      {detalleActivo && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setDetalleActivo(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative bg-white w-full max-w-lg rounded-t-3xl p-6 pb-10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex-1 min-w-0">
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full mb-2"
                  style={{ background: TIPO_CONFIG[detalleActivo.tipo].bg, color: TIPO_CONFIG[detalleActivo.tipo].text }}
                >
                  {TIPO_CONFIG[detalleActivo.tipo].icon}
                  {TIPO_CONFIG[detalleActivo.tipo].label}
                </span>
                <h3 className="text-xl font-black text-gray-800 leading-tight">{detalleActivo.titulo}</h3>
              </div>
              <button onClick={() => setDetalleActivo(null)} className="p-2 rounded-full hover:bg-gray-100 shrink-0">
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            {/* Info */}
            <p className="text-sm text-gray-500 mb-4">{detalleActivo.descripcion}</p>
            <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-5">
              <span className="flex items-center gap-1.5">
                <Clock size={12} />
                {format(detalleActivo.fechaHora.toDate(), "EEEE d 'de' MMMM · HH:mm", { locale: es })}
                {" · "}{detalleActivo.duracionMin} min
              </span>
              <span className="flex items-center gap-1.5"><MapPin size={12} />{detalleActivo.ubicacion}</span>
              {detalleActivo.instructor && (
                <span className="flex items-center gap-1.5"><Users size={12} />{detalleActivo.instructor}</span>
              )}
            </div>

            {/* Ocupación */}
            <div className="mb-5">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{detalleActivo.registrados} / {detalleActivo.capacidadMax} lugares</span>
                <span className="font-semibold" style={{ color: "#C85A2A" }}>
                  {Math.round((detalleActivo.registrados / detalleActivo.capacidadMax) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${Math.min(Math.round((detalleActivo.registrados / detalleActivo.capacidadMax) * 100), 100)}%`, background: "#C85A2A" }} />
              </div>
            </div>

            {/* Acción */}
            {misRegistros.has(detalleActivo.id) ? (
              <button
                onClick={async () => { await toggleRegistro(detalleActivo.id, "cancelar"); setDetalleActivo(null); }}
                disabled={accionando === detalleActivo.id}
                className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                style={{ background: "#FEE2E2", color: "#991B1B" }}
              >
                <UserMinus size={16} />
                {accionando === detalleActivo.id ? "Cancelando…" : "Cancelar inscripción"}
              </button>
            ) : (
              <button
                onClick={async () => {
                  if (detalleActivo.registrados >= detalleActivo.capacidadMax) { mostrar("Actividad llena", "error"); return; }
                  await toggleRegistro(detalleActivo.id, "registrar");
                  setDetalleActivo(null);
                }}
                disabled={accionando === detalleActivo.id || detalleActivo.registrados >= detalleActivo.capacidadMax}
                className="w-full py-3.5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                style={{ background: detalleActivo.registrados >= detalleActivo.capacidadMax ? "#9CA3AF" : "#C85A2A" }}
              >
                <UserCheck size={16} />
                {accionando === detalleActivo.id ? "Inscribiendo…" : detalleActivo.registrados >= detalleActivo.capacidadMax ? "Sin lugares disponibles" : "Inscribirme"}
              </button>
            )}
          </div>
        </div>
      )}

      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrar} />}
    </>
  );
}
