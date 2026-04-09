"use client";
// Módulo de actividades — OrbitImages en hero, CircularGallery para lista cuidador
import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useActividadesInteres } from "@/hooks/useActividadesInteres";
import { TarjetaActividad } from "@/components/actividades/TarjetaActividad";
import { FormActividad } from "@/components/coordinador/FormActividad";
import { OrbitImages } from "@/components/ui/OrbitImages";
import { Toast, useToast } from "@/components/ui/Toast";
import { Skeleton } from "@/components/ui/Skeleton";
import { Actividad, TipoActividad } from "@/lib/types";
import type { GalleryItem } from "@/components/ui/CircularGallery";
import { format } from "date-fns";

// Carga dinámica — CircularGallery usa WebGL (ogl) y necesita window
const CircularGallery = dynamic(() => import("@/components/ui/CircularGallery"), { ssr: false });
import { es } from "date-fns/locale";
import {
  Activity, Plus, Pencil, Trash2,
  Clock, MapPin, Users, Brush, Dumbbell, BookOpen,
  Heart, Gamepad2, Sparkles, X, UserCheck, UserMinus, CheckCircle,
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

// ── Emojis por tipo ──────────────────────────────────────────────────────────
const TIPO_EMOJI: Record<TipoActividad, string> = {
  arte: "🎨", deporte: "⚽", educacion: "📚", bienestar: "💜", recreacion: "🎮", otro: "✨",
};

// ── Genera una imagen tipo "tarjeta" en canvas con info completa de actividad ─
// Compatible con WebGL (data URL, sin crossOrigin issues)
function activityCardImg(actividad: Actividad): string {
  if (typeof document === "undefined") return "";
  const { bg, text: textColor } = TIPO_CONFIG[actividad.tipo];
  const emoji = TIPO_EMOJI[actividad.tipo];
  const W = 700;
  const H = 900;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Fondo con gradiente
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, bg);
  grad.addColorStop(1, "#FFFFFF");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Borde lateral de color del tipo
  ctx.fillStyle = textColor;
  ctx.fillRect(0, 0, 8, H);

  // Emoji grande centrado arriba
  ctx.font = "160px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji, W / 2, 160);

  // Badge de tipo
  const label = TIPO_CONFIG[actividad.tipo].label.toUpperCase();
  ctx.font = "bold 28px sans-serif";
  const badgeW = ctx.measureText(label).width + 40;
  const badgeX = (W - badgeW) / 2;
  const badgeY = 260;
  ctx.fillStyle = textColor;
  roundRect(ctx, badgeX, badgeY, badgeW, 44, 22);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, W / 2, badgeY + 22);

  // Titulo (multi-linea)
  ctx.fillStyle = "#1F2937";
  ctx.font = "bold 42px sans-serif";
  ctx.textAlign = "center";
  const tituloLines = wrapText(ctx, actividad.titulo, W - 80, 42);
  let y = 340;
  for (const line of tituloLines) {
    ctx.fillText(line, W / 2, y);
    y += 50;
  }

  // Linea divisoria
  y += 10;
  ctx.strokeStyle = "#E5E7EB";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, y);
  ctx.lineTo(W - 60, y);
  ctx.stroke();
  y += 30;

  // Fecha y hora
  const fecha = actividad.fechaHora.toDate();
  const fechaStr = format(fecha, "d MMM · HH:mm", { locale: es }) + " hrs";
  ctx.fillStyle = "#6B7280";
  ctx.font = "32px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("🕐  " + fechaStr, 60, y);
  y += 50;

  // Duracion
  ctx.fillText("⏱  " + actividad.duracionMin + " min", 60, y);
  y += 50;

  // Ubicacion
  ctx.fillText("📍  " + actividad.ubicacion, 60, y);
  y += 50;

  // Instructor
  if (actividad.instructor) {
    ctx.fillText("👤  " + actividad.instructor, 60, y);
    y += 50;
  }

  // Barra de capacidad
  y += 15;
  const porcentaje = actividad.capacidadMax > 0
    ? Math.min(Math.round((actividad.registrados / actividad.capacidadMax) * 100), 100) : 0;
  const barX = 60;
  const barW = W - 120;
  const barH = 20;

  // Fondo de barra
  ctx.fillStyle = "#E5E7EB";
  roundRect(ctx, barX, y, barW, barH, 10);
  ctx.fill();

  // Relleno de barra
  if (porcentaje > 0) {
    ctx.fillStyle = textColor;
    roundRect(ctx, barX, y, barW * (porcentaje / 100), barH, 10);
    ctx.fill();
  }

  // Texto de capacidad
  y += barH + 30;
  ctx.fillStyle = textColor;
  ctx.font = "bold 28px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${actividad.registrados} / ${actividad.capacidadMax} lugares  ·  ${porcentaje}%`, W / 2, y);

  return canvas.toDataURL("image/png");
}

// Helpers para canvas
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, fontSize: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? current + " " + word : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  // Limitar a 3 lineas
  if (lines.length > 3) {
    lines.length = 3;
    lines[2] = lines[2].slice(0, -3) + "...";
  }
  return lines;
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
    <div className={`bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 group cursor-pointer transition-all duration-300 actividad-hover-${actividad.tipo}`}>
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

  const [filtroTipo, setFiltroTipo]           = useState<TipoActividad | "todas">("todas");
  const [accionando, setAccionando]           = useState<string | null>(null);
  const [formActividad, setFormActividad]     = useState<{ abierto: boolean; editar?: Actividad }>({ abierto: false });
  const [cancelando, setCancelando]           = useState<string | null>(null);
  const [detalleActivo, setDetalleActivo]     = useState<Actividad | null>(null);

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
    if (filtroTipo !== "todas" && a.tipo !== filtroTipo) return false;
    // Excluir actividades en las que el usuario ya está registrado (solo para cuidadores)
    if (!esCoordinador && misRegistros.has(a.id)) return false;
    return true;
  }), [actividades, esCoordinador, filtroTipo, misRegistros]);

  const misInscritas = actividades.filter((a) => misRegistros.has(a.id) && (a.estado === "programada" || a.estado === "en_curso"));

  // ── Items para CircularGallery (cuidador) ─────────────────────────────────
  // Genera tarjetas visuales completas en canvas para cada actividad
  const galleryItems: GalleryItem[] = useMemo(() =>
    actividadesVisibles.map((a) => ({
      image: activityCardImg(a),
      text: "",
    })),
  [actividadesVisibles]);

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
        {!esCoordinador && misInscritas.length > 0 && (
          <section className="mb-6">
            {/* Encabezado mejorado */}
            <div className="relative mb-4 overflow-hidden rounded-2xl p-4"
              style={{ background: "linear-gradient(135deg, #FDF0E6 0%, #FDEBD0 100%)" }}>
              <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10"
                style={{ background: "#C85A2A" }} />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                    style={{ background: "#fff" }}>
                    <CheckCircle size={20} style={{ color: "#C85A2A" }} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold" style={{ color: "#7A3D1A" }}>
                      Mis inscripciones
                    </h2>
                    <p className="text-xs font-medium" style={{ color: "#9A6A2A" }}>
                      {misInscritas.length} actividad{misInscritas.length !== 1 ? "es" : ""} confirmada{misInscritas.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                {/* Badge con número */}
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md"
                  style={{ background: "linear-gradient(135deg, #C85A2A, #E87A3A)" }}>
                  {misInscritas.length}
                </div>
              </div>
            </div>

            {/* Layout responsive mejorado */}
            {/* Móvil: Scroll horizontal con snap */}
            <div className="block sm:hidden">
              <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
                {misInscritas.map((a) => (
                  <div key={a.id} className="min-w-[280px] max-w-[280px] shrink-0 snap-center">
                    <TarjetaActividad
                      actividad={a}
                      registrado
                      onRegistrar={() => {}}
                      onCancelar={() => toggleRegistro(a.id, "cancelar")}
                      cargando={accionando === a.id}
                      interesado={tieneInteres(a.id)}
                      onToggleInteres={() => toggleInteres(a.id)}
                    />
                  </div>
                ))}
              </div>
              {/* Indicador de scroll */}
              <div className="flex justify-center gap-1.5 mt-3">
                {misInscritas.map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full"
                    style={{ background: i === 0 ? "#C85A2A" : "#E5E7EB" }} />
                ))}
              </div>
            </div>

            {/* Tablet y Desktop: Grid */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {misInscritas.map((a) => (
                <TarjetaActividad
                  key={a.id}
                  actividad={a}
                  registrado
                  onRegistrar={() => {}}
                  onCancelar={() => toggleRegistro(a.id, "cancelar")}
                  cargando={accionando === a.id}
                  interesado={tieneInteres(a.id)}
                  onToggleInteres={() => toggleInteres(a.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Filtros ───────────────────────────────────────────── */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-gray-500 mb-2.5">Filtrar por categoría</p>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            {TIPOS_FILTRO.map((t) => {
              const activo = filtroTipo === t.value;
              // Obtener color de la categoría o usar naranja mcFaro para "todas"
              const config = t.value === "todas"
                ? { bg: "#FDF0E6", text: "#C85A2A" }
                : TIPO_CONFIG[t.value];

              return (
                <button
                  key={t.value}
                  onClick={() => setFiltroTipo(t.value)}
                  className="shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 min-h-[36px]"
                  style={activo
                    ? {
                        background: config.text,
                        color: "#fff",
                        boxShadow: `0 2px 12px ${config.text}40`,
                        transform: "scale(1.05)"
                      }
                    : {
                        background: config.bg,
                        color: config.text,
                        border: `1.5px solid ${config.text}30`
                      }
                  }
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Lista ────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <Activity size={18} style={{ color: "#C85A2A" }} />
                {esCoordinador ? "Todas las actividades" : "Actividades disponibles"}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5 ml-7">
                {actividadesVisibles.length} actividad{actividadesVisibles.length !== 1 ? "es" : ""}
              </p>
            </div>
          </div>

          {cargando ? (
            <div className="space-y-4"><SkeletonTarjeta /><SkeletonTarjeta /><SkeletonTarjeta /></div>
          ) : actividadesVisibles.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-sm p-10 text-center border-2 border-dashed border-gray-200">
              <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #FDF0E6, #FDEBD0)" }}>
                <Activity size={32} style={{ color: "#C85A2A" }} />
              </div>
              <p className="font-bold text-gray-700 text-base mb-2">
                Sin actividades disponibles
              </p>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto mb-5">
                {esCoordinador
                  ? "Crea la primera actividad para que los cuidadores puedan inscribirse"
                  : "El coordinador publicará actividades pronto. ¡Vuelve más tarde!"}
              </p>
              {esCoordinador && (
                <button
                  onClick={() => setFormActividad({ abierto: true })}
                  className="px-6 py-3 rounded-2xl text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl active:scale-95 min-h-[48px]"
                  style={{ background: "linear-gradient(135deg, #C85A2A, #E87A3A)" }}
                >
                  <Plus size={16} className="inline mr-1.5" />
                  Nueva actividad
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
            /* ── Vista cuidador: CircularGallery WebGL ── */
            <div className="flex flex-col items-center gap-4">
              {/* Galería circular — altura fija para el canvas WebGL */}
              <div className="w-full rounded-2xl overflow-hidden" style={{ height: 500 }}>
                <CircularGallery
                  items={galleryItems}
                  bend={3}
                  textColor="#ffffff"
                  borderRadius={0.05}
                  font="bold 24px DM Sans"
                />
              </div>

              {/* Tarjetas debajo para seleccionar y ver detalle */}
              <div className="w-full space-y-3 mt-2">
                {actividadesVisibles.map((a) => {
                  const tipo = TIPO_CONFIG[a.tipo];
                  const lleno = a.registrados >= a.capacidadMax;
                  return (
                    <button
                      key={a.id}
                      onClick={() => setDetalleActivo(a)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all active:scale-[0.98] text-left"
                    >
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: tipo.bg }}>
                        {tipo.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-gray-800 truncate">{a.titulo}</h4>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {format(a.fechaHora.toDate(), "d MMM · HH:mm", { locale: es })} · {a.ubicacion}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="text-xs font-bold px-2 py-1 rounded-full"
                          style={{
                            background: lleno ? "#FEE2E2" : tipo.bg,
                            color: lleno ? "#991B1B" : tipo.text,
                          }}>
                          {lleno ? "Lleno" : `${a.registrados}/${a.capacidadMax}`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-gray-400 text-center">
                Arrastra la galería · toca una actividad para inscribirte
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
