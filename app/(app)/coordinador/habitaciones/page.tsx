"use client";
// Gestión de habitaciones — mapa visual + asignación + historial
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useHabitaciones, useHistorialHabitacion } from "@/hooks/useHabitaciones";
import { Habitacion, Familia } from "@/lib/types";
import { Toast, useToast } from "@/components/ui/Toast";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import {
  BedDouble, X, User, Calendar, CheckCircle,
  Wrench, Lock, ChevronDown, Search,
} from "lucide-react";

// ── Config visual por estado ──────────────────────────────────────────────────
const ESTADO_CONFIG = {
  disponible:    { bg: "#D1FAE5", border: "#10B981", text: "#065F46", label: "Libre" },
  ocupada:       { bg: "#FEF3C7", border: "#F59E0B", text: "#92400E", label: "Ocupada" },
  mantenimiento: { bg: "#FEE2E2", border: "#EF4444", text: "#991B1B", label: "Mant." },
  bloqueada:     { bg: "#F3F4F6", border: "#9CA3AF", text: "#374151", label: "Bloqueada" },
};

// ── Tarjeta de habitación en el mapa ─────────────────────────────────────────
function CardHabitacion({
  hab,
  onClick,
}: {
  hab: Habitacion;
  onClick: () => void;
}) {
  const config = ESTADO_CONFIG[hab.estado];
  return (
    <button
      onClick={onClick}
      className="rounded-2xl p-3 text-center transition-all hover:scale-105 active:scale-95"
      style={{
        background: config.bg,
        border: `2px solid ${config.border}`,
        minWidth: "72px",
      }}
    >
      <BedDouble size={18} style={{ color: config.text, margin: "0 auto 4px" }} />
      <p className="text-sm font-bold" style={{ color: config.text }}>{hab.numero}</p>
      <p className="text-[9px] font-medium mt-0.5" style={{ color: config.text, opacity: 0.8 }}>
        {hab.nombreFamilia
          ? hab.nombreFamilia.split(" ")[0]
          : config.label}
      </p>
    </button>
  );
}

// ── Modal de detalle / acciones ───────────────────────────────────────────────
function ModalHabitacion({
  hab,
  familiasSinHab,
  onAsignar,
  onLiberar,
  onCambiarEstado,
  onCerrar,
}: {
  hab: Habitacion;
  familiasSinHab: Familia[];
  onAsignar: (familiaId: string, nombre: string) => Promise<void>;
  onLiberar: () => Promise<void>;
  onCambiarEstado: (estado: "disponible" | "mantenimiento" | "bloqueada") => Promise<void>;
  onCerrar: () => void;
}) {
  const historial = useHistorialHabitacion(hab.id);
  const [busqueda, setBusqueda] = useState("");
  const [accionando, setAccionando] = useState(false);
  const [error, setError] = useState("");

  const config = ESTADO_CONFIG[hab.estado];
  const diasOcupada = hab.fechaOcupacion
    ? differenceInDays(new Date(), hab.fechaOcupacion.toDate())
    : 0;

  const familiasFiltradas = familiasSinHab.filter((f) =>
    f.nombreCuidador.toLowerCase().includes(busqueda.toLowerCase()) ||
    (f.nombreNino ?? "").toLowerCase().includes(busqueda.toLowerCase())
  );

  const accion = async (fn: () => Promise<void>) => {
    setAccionando(true);
    setError("");
    try {
      await fn();
      onCerrar();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setAccionando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: config.bg }}>
              <BedDouble size={20} style={{ color: config.text }} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Habitación {hab.numero}</h3>
              <p className="text-xs text-gray-400">Piso {hab.piso} · Cap. {hab.capacidad}</p>
            </div>
          </div>
          <button onClick={onCerrar} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {/* Estado actual */}
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ background: config.bg, color: config.text }}
            >
              {config.label}
            </span>
            {hab.estado === "ocupada" && (
              <span className="text-xs text-gray-400">{diasOcupada} días ocupada</span>
            )}
          </div>

          {/* Info familia actual */}
          {hab.estado === "ocupada" && hab.nombreFamilia && (
            <div className="rounded-2xl p-4" style={{ background: "#FEF3C7" }}>
              <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#92400E" }}>
                Familia actual
              </p>
              <div className="flex items-center gap-2">
                <User size={14} style={{ color: "#92400E" }} />
                <p className="text-sm font-semibold" style={{ color: "#7A3D1A" }}>{hab.nombreFamilia}</p>
              </div>
              {hab.fechaOcupacion && (
                <div className="flex items-center gap-2 mt-1">
                  <Calendar size={14} style={{ color: "#92400E" }} />
                  <p className="text-xs" style={{ color: "#92400E" }}>
                    Desde {format(hab.fechaOcupacion.toDate(), "d 'de' MMM yyyy", { locale: es })}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Acciones */}
          {hab.estado === "ocupada" ? (
            <button
              onClick={() => accion(onLiberar)}
              disabled={accionando}
              className="w-full py-3 rounded-2xl font-bold text-sm text-white disabled:opacity-50"
              style={{ background: "#EF4444" }}
            >
              {accionando ? "Liberando…" : "Check-out — Liberar habitación"}
            </button>
          ) : hab.estado === "disponible" ? (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-600">Asignar a familia</p>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por nombre..."
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
                />
              </div>
              {familiasFiltradas.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-3">
                  {familiasSinHab.length === 0
                    ? "Todas las familias tienen habitación asignada"
                    : "Sin resultados"}
                </p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {familiasFiltradas.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => accion(() => onAsignar(f.id, f.nombreCuidador))}
                      disabled={accionando}
                      className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-orange-400 hover:bg-orange-50 transition-colors disabled:opacity-50"
                    >
                      <p className="text-sm font-semibold text-gray-800">{f.nombreCuidador}</p>
                      {f.nombreNino && (
                        <p className="text-xs text-gray-400">Acompañando a {f.nombreNino}</p>
                      )}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => accion(() => onCambiarEstado("mantenimiento"))}
                  disabled={accionando}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-50"
                >
                  <Wrench size={13} /> Mantenimiento
                </button>
                <button
                  onClick={() => accion(() => onCambiarEstado("bloqueada"))}
                  disabled={accionando}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium border border-gray-200 hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  <Lock size={13} /> Bloquear
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => accion(() => onCambiarEstado("disponible"))}
              disabled={accionando}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm text-white disabled:opacity-50"
              style={{ background: "#10B981" }}
            >
              <CheckCircle size={16} />
              {accionando ? "Actualizando…" : "Marcar como disponible"}
            </button>
          )}

          {error && <p className="text-xs text-red-500 text-center">{error}</p>}

          {/* Historial */}
          {historial.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#9A6A2A" }}>
                Últimas familias
              </p>
              <div className="space-y-2">
                {historial.map((h) => (
                  <div key={h.id} className="flex items-center justify-between text-xs bg-gray-50 rounded-xl px-3 py-2">
                    <span className="font-medium text-gray-700 truncate">{h.nombreFamilia}</span>
                    <span className="text-gray-400 shrink-0 ml-2">
                      {format(h.fechaIngreso.toDate(), "d MMM", { locale: es })}
                      {h.fechaSalida && ` → ${format(h.fechaSalida.toDate(), "d MMM", { locale: es })}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function HabitacionesPage() {
  const router = useRouter();
  const { familia, cargando } = useAuth();
  const { habitaciones, familiasSinHab, porPiso, cargando: cargandoHab, asignar, liberar, cambiarEstado } = useHabitaciones();
  const { toast, mostrar, cerrar } = useToast();

  const [habSeleccionada, setHabSeleccionada] = useState<Habitacion | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<Habitacion["estado"] | "todas">("todas");
  const [filtroPiso, setFiltroPiso] = useState<string>("todos");

  useEffect(() => {
    if (!cargando && familia?.rol !== "coordinador") router.replace("/dashboard");
  }, [familia, cargando, router]);

  if (cargando || cargandoHab) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "#C85A2A", borderTopColor: "transparent" }} />
      </div>
    );
  }

  const pisos = Object.keys(porPiso).sort();

  const habFiltradas = habitaciones.filter((h) => {
    const pasaEstado = filtroEstado === "todas" || h.estado === filtroEstado;
    const pasaPiso = filtroPiso === "todos" || h.piso === filtroPiso;
    return pasaEstado && pasaPiso;
  });

  // Métricas
  const total        = habitaciones.length;
  const disponibles  = habitaciones.filter((h) => h.estado === "disponible").length;
  const ocupadas     = habitaciones.filter((h) => h.estado === "ocupada").length;
  const mantenimiento = habitaciones.filter((h) => h.estado === "mantenimiento").length;
  const pctOcupacion = total > 0 ? Math.round((ocupadas / total) * 100) : 0;

  const handleAsignar = async (familiaId: string, nombre: string) => {
    if (!habSeleccionada) return;
    await asignar(habSeleccionada.id, familiaId, nombre);
    mostrar(`Habitación ${habSeleccionada.numero} asignada a ${nombre}`);
  };

  const handleLiberar = async () => {
    if (!habSeleccionada) return;
    await liberar(habSeleccionada.id);
    mostrar(`Habitación ${habSeleccionada.numero} liberada`);
  };

  const handleCambiarEstado = async (estado: "disponible" | "mantenimiento" | "bloqueada") => {
    if (!habSeleccionada) return;
    await cambiarEstado(habSeleccionada.id, estado);
    mostrar("Estado actualizado");
  };

  return (
    <>
      {/* Banner */}
      <div
        className="relative overflow-hidden w-full"
        style={{ background: "linear-gradient(135deg, #C85A2A 0%, #E87A3A 70%, #F5C842 100%)" }}
      >
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-15"
          style={{ background: "#7A3D1A" }} />
        <div className="max-w-5xl mx-auto px-5 py-8 md:px-10">
          <button onClick={() => router.back()}
            className="text-white/70 text-sm mb-3 flex items-center gap-1 hover:text-white transition-colors">
            ← Panel coordinador
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <BedDouble size={26} /> Habitaciones
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-6 pb-10 md:px-10">

        {/* Métricas */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}
          className="mb-5">
          {[
            { label: "Total", value: total, color: "#7A3D1A", bg: "#FDF0E6" },
            { label: "Libres", value: disponibles, color: "#065F46", bg: "#D1FAE5" },
            { label: "Ocupadas", value: ocupadas, color: "#92400E", bg: "#FEF3C7" },
            { label: "Ocupación", value: `${pctOcupacion}%`, color: "#1E40AF", bg: "#DBEAFE" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className="rounded-2xl shadow-sm p-3 text-center" style={{ background: "white" }}>
              <p className="text-xl font-bold" style={{ color }}>{value}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="flex gap-2 flex-wrap mb-4">
          {(["todas", "disponible", "ocupada", "mantenimiento", "bloqueada"] as const).map((e) => (
            <button
              key={e}
              onClick={() => setFiltroEstado(e)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
              style={filtroEstado === e
                ? { background: "#C85A2A", color: "#fff" }
                : { background: "#fff", color: "#6B7280", border: "1px solid #E5E7EB" }}
            >
              {e === "todas" ? "Todas" : ESTADO_CONFIG[e].label}
            </button>
          ))}
          {pisos.length > 1 && (
            <select
              value={filtroPiso}
              onChange={(e) => setFiltroPiso(e.target.value)}
              className="px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 bg-white text-gray-600 focus:outline-none"
            >
              <option value="todos">Todos los pisos</option>
              {pisos.map((p) => <option key={p} value={p}>Piso {p}</option>)}
            </select>
          )}
        </div>

        {/* Mapa visual por piso */}
        {total === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
            <BedDouble size={40} className="mx-auto mb-3 text-gray-200" />
            <p className="text-sm text-gray-400 font-medium">No hay habitaciones registradas</p>
            <p className="text-xs text-gray-300 mt-1">Agrégalas en la colección `habitaciones` de Firestore</p>
          </div>
        ) : pisos.map((piso) => {
          const habsPiso = (porPiso[piso] ?? []).filter((h) => {
            const pasaEstado = filtroEstado === "todas" || h.estado === filtroEstado;
            return pasaEstado;
          });
          if (habsPiso.length === 0) return null;
          return (
            <section key={piso} className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "#9A6A2A" }}>
                Piso {piso} — {habsPiso.length} habitación{habsPiso.length !== 1 ? "es" : ""}
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: "8px" }}>
                {habsPiso.map((h) => (
                  <CardHabitacion
                    key={h.id}
                    hab={h}
                    onClick={() => setHabSeleccionada(h)}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {/* Leyenda */}
        {total > 0 && (
          <div className="flex gap-4 flex-wrap mt-4">
            {Object.entries(ESTADO_CONFIG).map(([estado, cfg]) => (
              <span key={estado} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-3 h-3 rounded" style={{ background: cfg.border }} />
                {cfg.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {habSeleccionada && (
        <ModalHabitacion
          hab={habSeleccionada}
          familiasSinHab={familiasSinHab}
          onAsignar={handleAsignar}
          onLiberar={handleLiberar}
          onCambiarEstado={handleCambiarEstado}
          onCerrar={() => setHabSeleccionada(null)}
        />
      )}

      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrar} />}
    </>
  );
}
