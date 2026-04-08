"use client";
// Panel de actividades para coordinadores — CRUD + lista de registrados
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Actividad, EstadoActividad, TipoActividad } from "@/lib/types";
import { FormActividad } from "@/components/coordinador/FormActividad";
import { TablaRegistrados } from "@/components/coordinador/TablaRegistrados";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Activity,
  Plus,
  Users,
  Clock,
  MapPin,
  Pencil,
  Trash2,
  ChevronDown,
} from "lucide-react";

// ── Config por tipo ───────────────────────────────────────────────────────────
const TIPO_CONFIG: Record<TipoActividad, { label: string; bg: string; text: string }> = {
  arte:       { label: "Arte",       bg: "#FEE2E2", text: "#991B1B" },
  deporte:    { label: "Deporte",    bg: "#D1FAE5", text: "#065F46" },
  educacion:  { label: "Educación",  bg: "#DBEAFE", text: "#1E40AF" },
  bienestar:  { label: "Bienestar",  bg: "#EDE9FE", text: "#5B21B6" },
  recreacion: { label: "Recreación", bg: "#FEF3C7", text: "#92400E" },
  otro:       { label: "Otro",       bg: "#F3F4F6", text: "#374151" },
};

const ESTADO_CONFIG: Record<EstadoActividad, { label: string; dot: string }> = {
  programada: { label: "Programada", dot: "#F59E0B" },
  en_curso:   { label: "En curso",   dot: "#10B981" },
  completada: { label: "Completada", dot: "#9CA3AF" },
  cancelada:  { label: "Cancelada",  dot: "#EF4444" },
};

// ── Tarjeta de actividad ──────────────────────────────────────────────────────
function TarjetaActividad({
  actividad,
  onEditar,
  onCancelar,
  onVerRegistrados,
  cancelando,
}: {
  actividad: Actividad;
  onEditar: () => void;
  onCancelar: () => void;
  onVerRegistrados: () => void;
  cancelando: boolean;
}) {
  const tipo = TIPO_CONFIG[actividad.tipo];
  const estado = ESTADO_CONFIG[actividad.estado];
  const porcentaje = actividad.capacidadMax > 0
    ? Math.round((actividad.registrados / actividad.capacidadMax) * 100)
    : 0;
  const activa = actividad.estado === "programada" || actividad.estado === "en_curso";

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: tipo.bg, color: tipo.text }}
          >
            {tipo.label}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: estado.dot }} />
            {estado.label}
          </span>
        </div>
        {activa && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onEditar}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Editar"
            >
              <Pencil size={15} className="text-gray-400" />
            </button>
            <button
              onClick={onCancelar}
              disabled={cancelando}
              className="p-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
              aria-label="Cancelar actividad"
            >
              <Trash2 size={15} className="text-red-400" />
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
        <span className="flex items-center gap-1">
          <MapPin size={12} /> {actividad.ubicacion}
        </span>
      </div>

      {/* Barra de ocupación */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-400">
            {actividad.registrados} / {actividad.capacidadMax} lugares
          </span>
          <span className="text-xs font-medium" style={{ color: porcentaje >= 90 ? "#EF4444" : "#C85A2A" }}>
            {porcentaje}%
          </span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(porcentaje, 100)}%`,
              background: porcentaje >= 90 ? "#EF4444" : "#C85A2A",
            }}
          />
        </div>
      </div>

      <button
        onClick={onVerRegistrados}
        className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl w-full justify-center border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        <Users size={13} /> Ver registrados ({actividad.registrados})
      </button>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function ActividadesPage() {
  const router = useRouter();
  const { familia, cargando } = useAuth();

  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<TipoActividad | "todas">("todas");
  const [filtroEstado, setFiltroEstado] = useState<EstadoActividad | "activas">("activas");

  const [mostrarForm, setMostrarForm] = useState(false);
  const [actividadEditar, setActividadEditar] = useState<Actividad | null>(null);
  const [actividadRegistros, setActividadRegistros] = useState<Actividad | null>(null);
  const [cancelando, setCancelando] = useState<string | null>(null);

  useEffect(() => {
    if (!cargando && familia?.rol !== "coordinador") {
      router.replace("/dashboard");
    }
  }, [familia, cargando, router]);

  useEffect(() => {
    if (!familia || familia.rol !== "coordinador") return;

    // Sin orderBy para evitar índice compuesto — ordenar en cliente
    const q = query(
      collection(db, "actividades"),
      where("casaRonald", "==", familia.casaRonald)
    );

    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as Actividad)
        .sort((a, b) => a.fechaHora.toMillis() - b.fechaHora.toMillis());
      setActividades(docs);
      setCargandoDatos(false);
    });

    return unsub;
  }, [familia]);

  if (cargando || cargandoDatos) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "#C85A2A", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  // Filtrado
  const actividadesFiltradas = actividades.filter((a) => {
    const pasaTipo = filtroTipo === "todas" || a.tipo === filtroTipo;
    const pasaEstado =
      filtroEstado === "activas"
        ? a.estado === "programada" || a.estado === "en_curso"
        : a.estado === filtroEstado;
    return pasaTipo && pasaEstado;
  });

  // Métricas
  const hoy = new Date();
  const actividadesHoy = actividades.filter((a) => {
    const f = a.fechaHora.toDate();
    return (
      f.getDate() === hoy.getDate() &&
      f.getMonth() === hoy.getMonth() &&
      f.getFullYear() === hoy.getFullYear() &&
      a.estado !== "cancelada"
    );
  });
  const totalRegistros = actividades.reduce((s, a) => s + a.registrados, 0);
  const promedioOcupacion =
    actividades.filter((a) => a.capacidadMax > 0).length > 0
      ? Math.round(
          actividades
            .filter((a) => a.capacidadMax > 0 && a.estado !== "cancelada")
            .reduce((s, a) => s + (a.registrados / a.capacidadMax) * 100, 0) /
          Math.max(actividades.filter((a) => a.estado !== "cancelada").length, 1)
        )
      : 0;

  const crearActividad = async (datos: Parameters<typeof FormActividad>[0]["onGuardar"] extends (d: infer D) => unknown ? D : never) => {
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
    if (!res.ok) throw new Error("Error al crear actividad");
  };

  const editarActividad = async (datos: Parameters<typeof FormActividad>[0]["onGuardar"] extends (d: infer D) => unknown ? D : never) => {
    if (!actividadEditar) return;
    const res = await fetch(`/api/actividades/${actividadEditar.id}/editar`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...datos, fechaHora: new Date(datos.fechaHora).toISOString() }),
    });
    if (!res.ok) throw new Error("Error al editar actividad");
  };

  const cancelarActividad = async (id: string) => {
    setCancelando(id);
    try {
      await fetch(`/api/actividades/${id}/cancelar`, { method: "DELETE" });
    } finally {
      setCancelando(null);
    }
  };

  return (
    <>
      {/* ── Banner ─────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden w-full"
        style={{ background: "linear-gradient(135deg, #C85A2A 0%, #E87A3A 70%, #F5C842 100%)" }}
      >
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-15"
          style={{ background: "#7A3D1A" }} />
        <div className="max-w-5xl mx-auto px-5 py-8 md:px-10">
          <button
            onClick={() => router.back()}
            className="text-white/70 text-sm mb-3 flex items-center gap-1 hover:text-white transition-colors"
          >
            ← Panel coordinador
          </button>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
              <Activity size={26} /> Actividades
            </h1>
            <button
              onClick={() => { setActividadEditar(null); setMostrarForm(true); }}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white rounded-2xl px-4 py-3 font-semibold text-sm min-h-[48px] transition-colors"
            >
              <Plus size={18} /> Nueva
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-6 pb-10 md:px-10">

        {/* ── Métricas ───────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: "#C85A2A" }}>{actividadesHoy.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Hoy</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-blue-700">{totalRegistros}</p>
            <p className="text-xs text-gray-500 mt-0.5">Registros totales</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-emerald-700">{promedioOcupacion}%</p>
            <p className="text-xs text-gray-500 mt-0.5">Ocupación media</p>
          </div>
        </div>

        {/* ── Filtros ────────────────────────────────────────── */}
        <div className="flex gap-2 flex-wrap mb-2">
          {(["activas", "programada", "en_curso", "completada", "cancelada"] as const).map((e) => (
            <button
              key={e}
              onClick={() => setFiltroEstado(e)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filtroEstado === e ? "text-white" : "bg-white text-gray-500 border border-gray-200"
              }`}
              style={filtroEstado === e ? { background: "#C85A2A" } : {}}
            >
              {e === "activas" ? "Activas" : ESTADO_CONFIG[e].label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap mb-5">
          {(["todas", ...Object.keys(TIPO_CONFIG)] as Array<TipoActividad | "todas">).map((t) => (
            <button
              key={t}
              onClick={() => setFiltroTipo(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filtroTipo === t ? "text-white" : "bg-white text-gray-500 border border-gray-200"
              }`}
              style={filtroTipo === t ? { background: "#7A3D1A" } : {}}
            >
              {t === "todas" ? "Todos los tipos" : TIPO_CONFIG[t as TipoActividad].label}
            </button>
          ))}
        </div>

        {/* ── Lista ──────────────────────────────────────────── */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "#9A6A2A" }}>
            Actividades ({actividadesFiltradas.length})
          </h2>

          {actividadesFiltradas.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <Activity size={32} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-400">No hay actividades con este filtro</p>
              <button
                onClick={() => setMostrarForm(true)}
                className="mt-4 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: "#C85A2A" }}
              >
                + Crear actividad
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {actividadesFiltradas.map((a) => (
                <TarjetaActividad
                  key={a.id}
                  actividad={a}
                  cancelando={cancelando === a.id}
                  onEditar={() => { setActividadEditar(a); setMostrarForm(true); }}
                  onCancelar={() => cancelarActividad(a.id)}
                  onVerRegistrados={() => setActividadRegistros(a)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ── Modales ─────────────────────────────────────────── */}
      {mostrarForm && familia && (
        <FormActividad
          actividad={actividadEditar ?? undefined}
          casaRonald={familia.casaRonald}
          creadaPor={familia.nombreCuidador}
          onGuardar={actividadEditar ? editarActividad : crearActividad}
          onCerrar={() => { setMostrarForm(false); setActividadEditar(null); }}
        />
      )}

      {actividadRegistros && (
        <TablaRegistrados
          actividadId={actividadRegistros.id}
          tituloActividad={actividadRegistros.titulo}
          onCerrar={() => setActividadRegistros(null)}
        />
      )}
    </>
  );
}
