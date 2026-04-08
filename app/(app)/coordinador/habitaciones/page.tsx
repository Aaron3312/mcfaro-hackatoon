"use client";
// Gestión de habitaciones — mapa visual + creación + edición + asignación
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
  Wrench, Lock, Search, Plus, Pencil, Trash2, AlertCircle, UserMinus,
} from "lucide-react";
import { OcupanteHabitacion } from "@/lib/types";

// ── Config visual por estado ──────────────────────────────────────────────────
const ESTADO_CONFIG = {
  disponible:    { bg: "#D1FAE5", border: "#10B981", text: "#065F46", label: "Libre" },
  ocupada:       { bg: "#FEF3C7", border: "#F59E0B", text: "#92400E", label: "Ocupada" },
  mantenimiento: { bg: "#FEE2E2", border: "#EF4444", text: "#991B1B", label: "Mant." },
  bloqueada:     { bg: "#F3F4F6", border: "#9CA3AF", text: "#374151", label: "Bloqueada" },
};

// Personas totales de una familia: 1 paciente + 1 cuidador principal + adicionales
function personasDeFamilia(f: Familia | undefined): number {
  if (!f) return 2; // mínimo asumido si no se encuentra la familia
  return 1 + 1 + (f.cuidadores?.length ?? 0);
}

// Personas totales en una habitación sumando todas las familias ocupantes
function personasEnHab(hab: Habitacion, familias: Familia[]): number {
  const ocupantes = hab.ocupantes ?? (hab.familiaId ? [{ familiaId: hab.familiaId, nombreFamilia: hab.nombreFamilia ?? "" }] : []);
  return ocupantes.reduce((sum, oc) => {
    const f = familias.find((fam) => fam.id === oc.familiaId);
    return sum + personasDeFamilia(f);
  }, 0);
}

// ── Tarjeta de habitación ─────────────────────────────────────────────────────
function CardHabitacion({ hab, familias, onClick }: { hab: Habitacion; familias: Familia[]; onClick: () => void }) {
  const config = ESTADO_CONFIG[hab.estado];
  const personas  = personasEnHab(hab, familias);
  const capacidad = hab.capacidad ?? 1;
  const llena = personas >= capacidad;
  const pct = capacidad > 0 ? Math.min(personas / capacidad, 1) : 0;

  return (
    <button
      onClick={onClick}
      className="rounded-2xl p-3 text-center transition-all hover:scale-105 active:scale-95"
      style={{ background: config.bg, border: `2px solid ${llena && hab.estado === "ocupada" ? "#F59E0B" : config.border}`, minWidth: "72px" }}
    >
      <BedDouble size={18} style={{ color: config.text, margin: "0 auto 4px" }} />
      <p className="text-sm font-bold" style={{ color: config.text }}>{hab.numero}</p>
      {hab.estado === "ocupada" ? (
        <>
          {/* Barra de ocupación por personas */}
          <div className="w-full h-1 rounded-full mt-1.5 overflow-hidden" style={{ background: "rgba(0,0,0,0.1)" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct * 100}%`, background: llena ? "#F59E0B" : config.text }}
            />
          </div>
          <p className="text-[9px] font-bold mt-0.5" style={{ color: config.text }}>
            {personas}/{capacidad} pers.
          </p>
        </>
      ) : (
        <p className="text-[9px] font-medium mt-0.5" style={{ color: config.text, opacity: 0.8 }}>
          {config.label}
        </p>
      )}
    </button>
  );
}

// ── Formulario crear / editar habitación ──────────────────────────────────────
function FormHabitacion({
  inicial,
  casaRonald,
  onGuardar,
  onCerrar,
}: {
  inicial: Habitacion | null;
  casaRonald: string;
  onGuardar: (datos: { numero: string; piso: string; capacidad: number }) => Promise<void>;
  onCerrar: () => void;
}) {
  const [form, setForm] = useState({
    numero:    inicial?.numero    ?? "",
    piso:      inicial?.piso      ?? "1",
    capacidad: inicial?.capacidad ?? 2,
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const valido = form.numero.trim() && form.piso.trim() && form.capacidad >= 1;

  const handleSubmit = async () => {
    if (!valido) return;
    setGuardando(true);
    setError("");
    try {
      await onGuardar({
        numero: form.numero.trim(),
        piso: form.piso.trim(),
        capacidad: form.capacidad,
      });
      onCerrar();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4">
      <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">
            {inicial ? "Editar habitación" : "Nueva habitación"}
          </h3>
          <button onClick={onCerrar} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Número */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Número de habitación *
            </label>
            <input
              className="w-full mt-1 px-3 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400"
              placeholder="Ej: 101, A3, Suite-1"
              value={form.numero}
              onChange={(e) => setForm({ ...form, numero: e.target.value })}
            />
          </div>

          {/* Piso */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Piso *
            </label>
            <input
              className="w-full mt-1 px-3 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400"
              placeholder="Ej: 1, 2, PB"
              value={form.piso}
              onChange={(e) => setForm({ ...form, piso: e.target.value })}
            />
          </div>

          {/* Capacidad */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Capacidad (personas) *
            </label>
            <div className="flex items-center gap-3 mt-1">
              <button
                type="button"
                onClick={() => setForm({ ...form, capacidad: Math.max(1, form.capacidad - 1) })}
                className="w-10 h-10 rounded-xl border border-gray-200 text-lg font-bold text-gray-600 flex items-center justify-center hover:bg-gray-50"
              >
                −
              </button>
              <span className="text-xl font-bold text-gray-800 w-8 text-center">
                {form.capacidad}
              </span>
              <button
                type="button"
                onClick={() => setForm({ ...form, capacidad: Math.min(20, form.capacidad + 1) })}
                className="w-10 h-10 rounded-xl border border-gray-200 text-lg font-bold text-gray-600 flex items-center justify-center hover:bg-gray-50"
              >
                +
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!valido || guardando}
            className="w-full py-3.5 rounded-2xl font-bold text-sm text-white disabled:opacity-50 transition-opacity"
            style={{ background: "#C85A2A" }}
          >
            {guardando ? "Guardando…" : inicial ? "Guardar cambios" : "Crear habitación"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal de detalle / acciones ───────────────────────────────────────────────
function ModalHabitacion({
  hab,
  familiasSinHab,
  todasFamilias,
  onAsignar,
  onLiberar,
  onCambiarEstado,
  onEditar,
  onEliminar,
  onCerrar,
}: {
  hab: Habitacion;
  familiasSinHab: Familia[];
  todasFamilias: Familia[];
  onAsignar: (familiaId: string, nombre: string) => Promise<void>;
  onLiberar: (familiaId: string) => Promise<void>;
  onCambiarEstado: (estado: "disponible" | "mantenimiento" | "bloqueada") => Promise<void>;
  onEditar: () => void;
  onEliminar: () => Promise<void>;
  onCerrar: () => void;
}) {
  const historial = useHistorialHabitacion(hab.id);
  const [busqueda, setBusqueda] = useState("");
  const [accionando, setAccionando] = useState(false);
  const [error, setError] = useState("");
  const [confirmEliminar, setConfirmEliminar] = useState(false);

  const config = ESTADO_CONFIG[hab.estado];

  // Normalizar ocupantes (soporta array nuevo + campo legacy)
  const ocupantes: OcupanteHabitacion[] = (hab.ocupantes ?? []).length > 0
    ? hab.ocupantes
    : hab.familiaId
      ? [{ familiaId: hab.familiaId, nombreFamilia: hab.nombreFamilia ?? "", fechaIngreso: hab.fechaOcupacion! }]
      : [];

  const capacidad = hab.capacidad ?? 1;

  // Personas totales: paciente + cuidadores de cada familia
  const totalPersonas = ocupantes.reduce((sum, oc) => {
    const f = todasFamilias.find((fam) => fam.id === oc.familiaId);
    return sum + personasDeFamilia(f);
  }, 0);

  // Llena cuando las personas ocupan toda la capacidad
  const llena = totalPersonas >= capacidad;
  // Puede asignar si quedan al menos 2 plazas libres (mínimo por familia: 1 paciente + 1 cuidador)
  const minimoFamilia = 2;
  const puedeAsignar = hab.estado === "disponible" ||
    (hab.estado === "ocupada" && totalPersonas + minimoFamilia <= capacidad);

  const familiasFiltradas = familiasSinHab.filter(
    (f) =>
      f.nombreCuidador.toLowerCase().includes(busqueda.toLowerCase()) ||
      (f.nombreNino ?? "").toLowerCase().includes(busqueda.toLowerCase())
  );

  const accion = async (fn: () => Promise<void>, cerrar = true) => {
    setAccionando(true);
    setError("");
    try {
      await fn();
      if (cerrar) onCerrar();
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
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: config.bg }}>
              <BedDouble size={20} style={{ color: config.text }} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Habitación {hab.numero}</h3>
              <p className="text-xs text-gray-400">
                Piso {hab.piso} · {totalPersonas}/{capacidad} personas · {ocupantes.length} familia{ocupantes.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={onEditar} className="p-2 rounded-lg hover:bg-blue-50 text-blue-500" title="Editar">
              <Pencil size={16} />
            </button>
            {hab.estado !== "ocupada" && (
              <button onClick={() => setConfirmEliminar(true)} className="p-2 rounded-lg hover:bg-red-50 text-red-400" title="Eliminar">
                <Trash2 size={16} />
              </button>
            )}
            <button onClick={onCerrar} className="p-1.5 rounded-lg hover:bg-gray-100 ml-1">
              <X size={18} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Confirmación eliminar */}
        {confirmEliminar && (
          <div className="mx-5 mt-4 rounded-2xl p-4 bg-red-50 border border-red-200 shrink-0">
            <p className="text-sm font-bold text-red-700 mb-1">¿Eliminar habitación {hab.numero}?</p>
            <p className="text-xs text-red-600 mb-3">Esta acción no se puede deshacer.</p>
            <div className="flex gap-2">
              <button onClick={() => accion(onEliminar)} disabled={accionando}
                className="flex-1 py-2 rounded-xl bg-red-500 text-white text-xs font-bold disabled:opacity-50">
                {accionando ? "Eliminando…" : "Sí, eliminar"}
              </button>
              <button onClick={() => setConfirmEliminar(false)}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-medium">
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="overflow-y-auto flex-1 p-5 space-y-5">

          {/* ── Barra de ocupación ──────────────────────────── */}
          {hab.estado === "ocupada" && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "#9A6A2A" }}>
                  Ocupación
                </span>
                <span className="text-xs font-bold" style={{ color: llena ? "#F59E0B" : "#10B981" }}>
                  {totalPersonas}/{capacidad} personas · {ocupantes.length} familia{ocupantes.length !== 1 ? "s" : ""} {llena ? "— Llena" : "— Con espacio"}
                </span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min((totalPersonas / capacidad) * 100, 100)}%`,
                    background: llena ? "#F59E0B" : "#10B981",
                  }}
                />
              </div>
            </div>
          )}

          {/* ── Familias ocupando ───────────────────────────── */}
          {ocupantes.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#9A6A2A" }}>
                Familias en esta habitación
              </p>
              <div className="space-y-2">
                {ocupantes.map((oc) => {
                  const famData = todasFamilias.find((fam) => fam.id === oc.familiaId);
                  const pFamilia = personasDeFamilia(famData);
                  const numCuidadores = 1 + (famData?.cuidadores?.length ?? 0);
                  return (
                  <div key={oc.familiaId}
                    className="flex items-center gap-3 rounded-2xl p-3"
                    style={{ background: "#FEF3C7" }}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: "#FDE68A" }}>
                      <User size={14} style={{ color: "#92400E" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "#7A3D1A" }}>
                        {oc.nombreFamilia}
                      </p>
                      <p className="text-[11px]" style={{ color: "#92400E" }}>
                        {pFamilia} personas · {numCuidadores} cuidador{numCuidadores !== 1 ? "es" : ""} + 1 paciente
                      </p>
                      {oc.fechaIngreso && (
                        <p className="text-[11px]" style={{ color: "#92400E", opacity: 0.7 }}>
                          Desde {format(oc.fechaIngreso.toDate(), "d MMM yyyy", { locale: es })}
                          {" · "}{differenceInDays(new Date(), oc.fechaIngreso.toDate())} días
                        </p>
                      )}
                    </div>
                    {/* Check-out individual */}
                    <button
                      onClick={() => accion(() => onLiberar(oc.familiaId), false)}
                      disabled={accionando}
                      className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                      style={{ background: "#FEE2E2", color: "#991B1B" }}
                      title="Check-out de esta familia"
                    >
                      <UserMinus size={12} /> Salida
                    </button>
                  </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Asignar familia ─────────────────────────────── */}
          {puedeAsignar && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#9A6A2A" }}>
                {ocupantes.length === 0 ? "Asignar familia" : "Agregar otra familia"}
              </p>
              <div className="relative mb-2">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar familia sin habitación..."
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
                />
              </div>
              {familiasFiltradas.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-3">
                  {familiasSinHab.length === 0
                    ? "Todas las familias tienen habitación asignada"
                    : "Sin resultados para esa búsqueda"}
                </p>
              ) : (
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {familiasFiltradas.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => accion(() => onAsignar(f.id, f.nombreCuidador), false)}
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
            </div>
          )}

          {/* ── Cambiar estado (disponible o semi-ocupada) ─── */}
          {(hab.estado === "disponible" || hab.estado === "ocupada") && (
            <div className="flex gap-2">
              <button
                onClick={() => accion(() => onCambiarEstado("mantenimiento"))}
                disabled={accionando || hab.estado === "ocupada"}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title={hab.estado === "ocupada" ? "Libera todas las familias primero" : ""}
              >
                <Wrench size={13} /> Mantenimiento
              </button>
              <button
                onClick={() => accion(() => onCambiarEstado("bloqueada"))}
                disabled={accionando || hab.estado === "ocupada"}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium border border-gray-200 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title={hab.estado === "ocupada" ? "Libera todas las familias primero" : ""}
              >
                <Lock size={13} /> Bloquear
              </button>
            </div>
          )}

          {(hab.estado === "mantenimiento" || hab.estado === "bloqueada") && (
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

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">
              <AlertCircle size={14} className="shrink-0" /> {error}
            </div>
          )}

          {/* ── Historial ───────────────────────────────────── */}
          {historial.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#9A6A2A" }}>
                Historial reciente
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
  const {
    habitaciones, familias, familiasSinHab, porPiso, cargando: cargandoHab,
    asignar, liberar, cambiarEstado,
    crearHabitacion, editarHabitacion, eliminarHabitacion,
  } = useHabitaciones();
  const { toast, mostrar, cerrar } = useToast();

  const [habSeleccionada, setHabSeleccionada] = useState<Habitacion | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [habEditando, setHabEditando] = useState<Habitacion | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<Habitacion["estado"] | "todas" | "con_espacio">("todas");
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
  const total         = habitaciones.length;
  const disponibles   = habitaciones.filter((h) => h.estado === "disponible").length;
  const ocupadas      = habitaciones.filter((h) => h.estado === "ocupada").length;
  const mantenimiento = habitaciones.filter((h) => h.estado === "mantenimiento").length;
  const pctOcupacion  = total > 0 ? Math.round((ocupadas / total) * 100) : 0;

  const handleAsignar = async (familiaId: string, nombre: string) => {
    if (!habSeleccionada) return;
    await asignar(habSeleccionada.id, familiaId, nombre);
    mostrar(`Habitación ${habSeleccionada.numero} asignada a ${nombre}`);
  };

  const handleLiberar = async (familiaId: string) => {
    if (!habSeleccionada) return;
    await liberar(habSeleccionada.id, familiaId);
    const nombreFamilia = (habSeleccionada.ocupantes ?? []).find((o) => o.familiaId === familiaId)?.nombreFamilia ?? familiaId;
    mostrar(`Check-out de ${nombreFamilia} completado`);
    // No cerrar modal — puede haber más familias
  };

  const handleCambiarEstado = async (estado: "disponible" | "mantenimiento" | "bloqueada") => {
    if (!habSeleccionada) return;
    await cambiarEstado(habSeleccionada.id, estado);
    mostrar("Estado actualizado");
  };

  const handleEliminar = async () => {
    if (!habSeleccionada) return;
    await eliminarHabitacion(habSeleccionada.id);
    mostrar(`Habitación ${habSeleccionada.numero} eliminada`);
    setHabSeleccionada(null);
  };

  const handleGuardarForm = async (datos: { numero: string; piso: string; capacidad: number }) => {
    if (habEditando) {
      await editarHabitacion(habEditando.id, datos);
      mostrar(`Habitación ${datos.numero} actualizada`);
    } else {
      await crearHabitacion({ ...datos, casaRonald: familia?.casaRonald ?? "" });
      mostrar(`Habitación ${datos.numero} creada`);
    }
  };

  const abrirEditar = (hab: Habitacion) => {
    setHabSeleccionada(null);
    setHabEditando(hab);
    setMostrarForm(true);
  };

  const abrirNueva = () => {
    setHabEditando(null);
    setMostrarForm(true);
  };

  return (
    <>
      {/* ── Banner ───────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden w-full"
        style={{ background: "linear-gradient(135deg, #C85A2A 0%, #E87A3A 70%, #F5C842 100%)" }}
      >
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-15"
          style={{ background: "#7A3D1A" }} />
        <div className="max-w-5xl mx-auto px-5 py-7 md:px-10">
          <button onClick={() => router.back()}
            className="text-white/70 text-sm mb-3 flex items-center gap-1 hover:text-white transition-colors">
            ← Panel coordinador
          </button>
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
              <BedDouble size={26} /> Habitaciones
            </h1>
            <button
              onClick={abrirNueva}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-white/20 text-white hover:bg-white/30 transition-colors shrink-0"
            >
              <Plus size={16} /> Nueva
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-6 pb-10 md:px-10">

        {/* ── Métricas ──────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }} className="mb-5">
          {[
            { label: "Total",     value: total,           color: "#7A3D1A", bg: "#FDF0E6" },
            { label: "Libres",    value: disponibles,     color: "#065F46", bg: "#D1FAE5" },
            { label: "Ocupadas",  value: ocupadas,        color: "#92400E", bg: "#FEF3C7" },
            { label: "Ocupación", value: `${pctOcupacion}%`, color: "#1E40AF", bg: "#DBEAFE" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl shadow-sm p-3 text-center">
              <p className="text-xl font-bold" style={{ color }}>{value}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Filtros ───────────────────────────────────────────── */}
        <div className="flex gap-2 flex-wrap mb-4">
          {([
            { id: "todas",       label: "Todas" },
            { id: "disponible",  label: "Libres" },
            { id: "con_espacio", label: "Con espacio" },
            { id: "ocupada",     label: "Llenas" },
            { id: "mantenimiento", label: "Mant." },
            { id: "bloqueada",   label: "Bloqueadas" },
          ] as const).map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFiltroEstado(id)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
              style={filtroEstado === id
                ? { background: "#C85A2A", color: "#fff" }
                : { background: "#fff", color: "#6B7280", border: "1px solid #E5E7EB" }}
            >
              {label}
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

        {/* ── Mapa visual por piso ──────────────────────────────── */}
        {total === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
            <BedDouble size={40} className="mx-auto mb-3 text-gray-200" />
            <p className="text-sm text-gray-400 font-medium">No hay habitaciones registradas</p>
            <button
              onClick={abrirNueva}
              className="mt-4 flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl font-bold text-sm text-white"
              style={{ background: "#C85A2A" }}
            >
              <Plus size={15} /> Agregar primera habitación
            </button>
          </div>
        ) : (
          pisos.map((piso) => {
            const habsPiso = (porPiso[piso] ?? []).filter((h) => {
              const personas = personasEnHab(h, familias);
              const cap = h.capacidad ?? 1;
              const pasaEstado =
                filtroEstado === "todas"       ? true :
                filtroEstado === "con_espacio" ? h.estado === "ocupada" && personas + 2 <= cap :
                filtroEstado === "ocupada"     ? h.estado === "ocupada" && personas >= cap :
                h.estado === filtroEstado;
              return pasaEstado && (filtroPiso === "todos" || h.piso === filtroPiso);
            });
            if (habsPiso.length === 0) return null;
            return (
              <section key={piso} className="mb-6">
                <h2 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "#9A6A2A" }}>
                  Piso {piso} — {habsPiso.length} habitación{habsPiso.length !== 1 ? "es" : ""}
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: "8px" }}>
                  {habsPiso.map((h) => (
                    <CardHabitacion key={h.id} hab={h} familias={familias} onClick={() => setHabSeleccionada(h)} />
                  ))}
                </div>
              </section>
            );
          })
        )}

        {/* ── Leyenda ───────────────────────────────────────────── */}
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

      {/* ── Modal de habitación ───────────────────────────────────── */}
      {habSeleccionada && (
        <ModalHabitacion
          hab={habSeleccionada}
          familiasSinHab={familiasSinHab}
          todasFamilias={familias}
          onAsignar={handleAsignar}
          onLiberar={handleLiberar}
          onCambiarEstado={handleCambiarEstado}
          onEditar={() => abrirEditar(habSeleccionada)}
          onEliminar={handleEliminar}
          onCerrar={() => setHabSeleccionada(null)}
        />
      )}

      {/* ── Formulario nueva / editar ─────────────────────────────── */}
      {mostrarForm && (
        <FormHabitacion
          inicial={habEditando}
          casaRonald={familia?.casaRonald ?? ""}
          onGuardar={handleGuardarForm}
          onCerrar={() => { setMostrarForm(false); setHabEditando(null); }}
        />
      )}

      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrar} />}
    </>
  );
}
