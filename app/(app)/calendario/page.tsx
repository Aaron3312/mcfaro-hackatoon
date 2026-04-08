"use client";
// Módulo de Calendario/Citas — issue #39
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useCitas, NuevaCita } from "@/hooks/useCitas";
import { Cita } from "@/lib/types";
import { Toast, useToast } from "@/components/ui/Toast";
import { format, addMonths, subMonths, startOfMonth, getDay, getDaysInMonth, isSameDay, isPast } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowLeft, ChevronLeft, ChevronRight, Plus, X,
  Calendar, Clock, MapPin, FileText, Bell, Check,
  Trash2, Edit3, Stethoscope, FlaskConical, Scissors, MoreHorizontal,
} from "lucide-react";

// ── Config por tipo de servicio ───────────────────────────────────────────────
const SERVICIO_CONFIG = {
  consulta:     { label: "Consulta",    icono: Stethoscope,    bg: "#DBEAFE", text: "#1D4ED8", dot: "#3B82F6" },
  estudio:      { label: "Estudio",     icono: FlaskConical,   bg: "#EDE9FE", text: "#5B21B6", dot: "#8B5CF6" },
  procedimiento:{ label: "Procedimiento",icono: Scissors,      bg: "#FEE2E2", text: "#991B1B", dot: "#EF4444" },
  otro:         { label: "Otro",        icono: MoreHorizontal, bg: "#F3F4F6", text: "#374151", dot: "#6B7280" },
};

const DIAS_SEMANA = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];

const GRID7: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(7, 1fr)" };

// ── Página principal ──────────────────────────────────────────────────────────
export default function CalendarioPage() {
  const router = useRouter();
  const { familia } = useAuth();
  const { citas, cargando, diasConCitas, citasDelDia, agregarCita, editarCita, eliminarCita } =
    useCitas(familia?.id);
  const { toast, mostrar, cerrar } = useToast();

  const [mesActual, setMesActual] = useState(new Date());
  const [diaSeleccionado, setDiaSeleccionado] = useState<Date | null>(null);
  const [filtro, setFiltro] = useState<Cita["servicio"] | "todas">("todas");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [citaEditando, setCitaEditando] = useState<Cita | null>(null);

  const anio = mesActual.getFullYear();
  const mes = mesActual.getMonth();
  const diasMarcados = diasConCitas(anio, mes);

  // Celdas del calendario: celdas vacías al inicio + días del mes
  const primerDia = getDay(startOfMonth(mesActual));
  const totalDias = getDaysInMonth(mesActual);
  const celdas = [
    ...Array(primerDia).fill(null),
    ...Array.from({ length: totalDias }, (_, i) => i + 1),
  ];

  // Citas del día seleccionado, filtradas por tipo
  const citasDiaFiltradas = diaSeleccionado
    ? citasDelDia(diaSeleccionado).filter(
        (c) => filtro === "todas" || c.servicio === filtro
      )
    : [];

  // Próximas citas (sin filtro de día)
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const proximas = citas
    .filter((c) => !c.completada && c.fecha.toDate() >= hoy && (filtro === "todas" || c.servicio === filtro))
    .slice(0, 10);

  const abrirNueva = () => { setCitaEditando(null); setMostrarForm(true); };
  const abrirEditar = (cita: Cita) => { setCitaEditando(cita); setMostrarForm(true); };
  const cerrarForm = () => { setMostrarForm(false); setCitaEditando(null); };

  const onGuardar = async (datos: NuevaCita) => {
    try {
      if (citaEditando) {
        await editarCita(citaEditando.id, datos);
        mostrar("Cita actualizada");
      } else {
        await agregarCita(datos);
        mostrar("Cita creada");
      }
      cerrarForm();
    } catch {
      mostrar("Error al guardar la cita", "error");
    }
  };

  const onEliminar = async (id: string) => {
    try {
      await eliminarCita(id);
      mostrar("Cita eliminada");
    } catch {
      mostrar("Error al eliminar", "error");
    }
  };

  const onCompletar = async (cita: Cita) => {
    try {
      await editarCita(cita.id, { completada: !cita.completada } as any);
    } catch {
      mostrar("Error al actualizar", "error");
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 pb-28">
      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrar} />}

      {/* Encabezado */}
      <div className="bg-white border-b border-orange-100 px-4 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-orange-50">
            <ArrowLeft size={20} className="text-orange-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-orange-900">Calendario de citas</h1>
            <p className="text-sm text-orange-500">{citas.length} cita{citas.length !== 1 ? "s" : ""} registrada{citas.length !== 1 ? "s" : ""}</p>
          </div>
          <button
            onClick={abrirNueva}
            className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 text-white rounded-xl text-sm font-bold"
          >
            <Plus size={16} />
            Nueva
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* ── Calendario mensual ─────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
          {/* Navegación de mes */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-orange-50">
            <button onClick={() => setMesActual(subMonths(mesActual, 1))} className="p-2 rounded-xl hover:bg-orange-50">
              <ChevronLeft size={18} className="text-orange-500" />
            </button>
            <p className="font-bold text-orange-900 capitalize">
              {format(mesActual, "MMMM yyyy", { locale: es })}
            </p>
            <button onClick={() => setMesActual(addMonths(mesActual, 1))} className="p-2 rounded-xl hover:bg-orange-50">
              <ChevronRight size={18} className="text-orange-500" />
            </button>
          </div>

          {/* Días de la semana */}
          <div style={GRID7} className="px-2 pt-2">
            {DIAS_SEMANA.map((d) => (
              <div key={d} className="text-center text-[11px] font-bold text-orange-300 py-1">{d}</div>
            ))}
          </div>

          {/* Celdas del mes */}
          <div style={GRID7} className="px-2 pb-3">
            {celdas.map((dia, i) => {
              if (!dia) return <div key={`v-${i}`} />;
              const fecha = new Date(anio, mes, dia);
              const esHoy = isSameDay(fecha, new Date());
              const esSeleccionado = diaSeleccionado && isSameDay(fecha, diaSeleccionado);
              const tieneCitas = diasMarcados.has(dia);

              return (
                <button
                  key={dia}
                  onClick={() => setDiaSeleccionado(esSeleccionado ? null : fecha)}
                  className="flex flex-col items-center justify-center py-1.5 rounded-xl transition-all"
                  style={{
                    background: esSeleccionado ? "#C85A2A" : esHoy ? "#FDF0E6" : "transparent",
                  }}
                >
                  <span
                    className="text-sm font-semibold leading-none"
                    style={{
                      color: esSeleccionado ? "#fff" : esHoy ? "#C85A2A" : "#374151",
                    }}
                  >
                    {dia}
                  </span>
                  {tieneCitas && (
                    <span
                      className="w-1.5 h-1.5 rounded-full mt-0.5"
                      style={{ background: esSeleccionado ? "#fff" : "#C85A2A" }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Filtros ────────────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(["todas", "consulta", "estudio", "procedimiento", "otro"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-colors ${
                filtro === f
                  ? "bg-orange-500 text-white"
                  : "bg-white text-orange-500 border border-orange-200"
              }`}
            >
              {f === "todas" ? "Todas" : SERVICIO_CONFIG[f].label}
            </button>
          ))}
        </div>

        {/* ── Citas del día seleccionado ─────────────────────── */}
        {diaSeleccionado && (
          <div>
            <p className="text-xs font-bold text-orange-500 uppercase tracking-wide mb-2 px-1">
              {format(diaSeleccionado, "EEEE d 'de' MMMM", { locale: es })}
            </p>
            {citasDiaFiltradas.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-orange-100">
                <Calendar size={24} className="text-orange-200 mx-auto mb-2" />
                <p className="text-sm text-orange-300">Sin citas este día</p>
                <button
                  onClick={abrirNueva}
                  className="mt-3 text-xs text-orange-500 font-semibold underline"
                >
                  Agregar una cita
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {citasDiaFiltradas.map((cita) => (
                  <TarjetaCita
                    key={cita.id}
                    cita={cita}
                    onEditar={() => abrirEditar(cita)}
                    onEliminar={() => onEliminar(cita.id)}
                    onCompletar={() => onCompletar(cita)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Próximas citas ─────────────────────────────────── */}
        {!diaSeleccionado && (
          <div>
            <p className="text-xs font-bold text-orange-500 uppercase tracking-wide mb-2 px-1">
              Próximas citas
            </p>
            {cargando ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl h-20 animate-pulse shadow-sm" />
                ))}
              </div>
            ) : proximas.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-orange-100">
                <Calendar size={32} className="text-orange-200 mx-auto mb-2" />
                <p className="text-orange-400 text-sm">No hay citas próximas</p>
                <button
                  onClick={abrirNueva}
                  className="mt-3 px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-bold"
                >
                  Agregar cita
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {proximas.map((cita) => (
                  <TarjetaCita
                    key={cita.id}
                    cita={cita}
                    onEditar={() => abrirEditar(cita)}
                    onEliminar={() => onEliminar(cita.id)}
                    onCompletar={() => onCompletar(cita)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Modal formulario ───────────────────────────────────── */}
      {mostrarForm && (
        <FormCita
          inicial={citaEditando}
          diaInicial={diaSeleccionado}
          onGuardar={onGuardar}
          onCerrar={cerrarForm}
        />
      )}
    </div>
  );
}

// ── Tarjeta de cita ───────────────────────────────────────────────────────────
function TarjetaCita({
  cita, onEditar, onEliminar, onCompletar,
}: {
  cita: Cita;
  onEditar: () => void;
  onEliminar: () => void;
  onCompletar: () => void;
}) {
  const config = SERVICIO_CONFIG[cita.servicio];
  const Icono = config.icono;
  const fecha = cita.fecha.toDate();
  const pasada = isPast(fecha) && !cita.completada;

  return (
    <div
      className={`bg-white rounded-2xl p-4 shadow-sm border transition-opacity ${
        cita.completada ? "opacity-60" : ""
      }`}
      style={{ borderColor: cita.completada ? "#E5E7EB" : config.dot + "40" }}
    >
      <div className="flex items-start gap-3">
        {/* Icono de tipo */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: config.bg }}>
          <Icono size={18} style={{ color: config.text }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`font-bold text-sm leading-tight ${cita.completada ? "line-through text-gray-400" : "text-orange-900"}`}>
              {cita.titulo}
            </p>
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0"
              style={{ background: config.bg, color: config.text }}
            >
              {config.label}
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-1.5">
            <Clock size={12} className="text-orange-400" />
            <span className="text-xs text-orange-500">
              {format(fecha, "EEEE d MMM, HH:mm", { locale: es })}
            </span>
            {pasada && (
              <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full">Pasada</span>
            )}
          </div>

          {cita.ubicacion && (
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin size={11} className="text-orange-300" />
              <span className="text-xs text-gray-500 truncate">{cita.ubicacion}</span>
            </div>
          )}

          {cita.notas && (
            <p className="text-xs text-gray-400 mt-1 line-clamp-1">{cita.notas}</p>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-orange-50">
        <button
          onClick={onCompletar}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            cita.completada
              ? "bg-gray-100 text-gray-500"
              : "bg-green-50 text-green-700"
          }`}
        >
          <Check size={12} />
          {cita.completada ? "Completada" : "Marcar lista"}
        </button>
        <div className="flex gap-2">
          <button
            onClick={onEditar}
            className="p-2 rounded-xl bg-orange-50 text-orange-500"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={onEliminar}
            className="p-2 rounded-xl bg-red-50 text-red-500"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Formulario crear/editar ───────────────────────────────────────────────────
function FormCita({
  inicial, diaInicial, onGuardar, onCerrar,
}: {
  inicial: Cita | null;
  diaInicial: Date | null;
  onGuardar: (datos: NuevaCita) => Promise<void>;
  onCerrar: () => void;
}) {
  const fechaDefault = diaInicial
    ? format(diaInicial, "yyyy-MM-dd") + "T09:00"
    : format(new Date(), "yyyy-MM-dd") + "T09:00";

  const [form, setForm] = useState({
    titulo: inicial?.titulo ?? "",
    descripcion: inicial?.descripcion ?? "",
    fecha: inicial
      ? format(inicial.fecha.toDate(), "yyyy-MM-dd'T'HH:mm")
      : fechaDefault,
    servicio: (inicial?.servicio ?? "consulta") as Cita["servicio"],
    ubicacion: inicial?.ubicacion ?? "",
    notas: inicial?.notas ?? "",
    recordatorio24h: inicial?.recordatorio24h ?? true,
    recordatorio60: inicial?.recordatorio60 ?? true,
    recordatorio15: inicial?.recordatorio15 ?? true,
  });
  const [guardando, setGuardando] = useState(false);

  const valido = form.titulo.trim().length > 0 && form.fecha;

  const handleSubmit = async () => {
    if (!valido) return;
    setGuardando(true);
    await onGuardar({
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim() || undefined,
      fecha: new Date(form.fecha),
      servicio: form.servicio,
      ubicacion: form.ubicacion.trim() || undefined,
      notas: form.notas.trim() || undefined,
      recordatorio24h: form.recordatorio24h,
      recordatorio60: form.recordatorio60,
      recordatorio15: form.recordatorio15,
    });
    setGuardando(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Fondo oscuro */}
      <div className="absolute inset-0 bg-black/40" onClick={onCerrar} />

      {/* Panel */}
      <div className="relative bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-4 pb-3 border-b border-orange-50">
          <h2 className="text-lg font-bold text-orange-900">
            {inicial ? "Editar cita" : "Nueva cita"}
          </h2>
          <button onClick={onCerrar} className="p-2 rounded-xl hover:bg-orange-50">
            <X size={18} className="text-orange-400" />
          </button>
        </div>

        <div className="px-4 py-4 space-y-4">
          {/* Título */}
          <div>
            <label className="text-xs font-bold text-orange-500 uppercase tracking-wide">Título *</label>
            <input
              className="w-full mt-1 px-3 py-3 rounded-xl border border-orange-200 text-sm text-orange-900 outline-none focus:border-orange-400"
              placeholder="Ej: Consulta con oncología"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            />
          </div>

          {/* Tipo de servicio */}
          <div>
            <label className="text-xs font-bold text-orange-500 uppercase tracking-wide">Tipo</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {(["consulta", "estudio", "procedimiento", "otro"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm({ ...form, servicio: s })}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                    form.servicio === s
                      ? "bg-orange-500 text-white border-orange-500"
                      : "bg-white text-orange-700 border-orange-200"
                  }`}
                >
                  {SERVICIO_CONFIG[s].label}
                </button>
              ))}
            </div>
          </div>

          {/* Fecha y hora */}
          <div>
            <label className="text-xs font-bold text-orange-500 uppercase tracking-wide">Fecha y hora *</label>
            <input
              type="datetime-local"
              className="w-full mt-1 px-3 py-3 rounded-xl border border-orange-200 text-sm text-orange-900 outline-none focus:border-orange-400"
              value={form.fecha}
              onChange={(e) => setForm({ ...form, fecha: e.target.value })}
            />
          </div>

          {/* Ubicación */}
          <div>
            <label className="text-xs font-bold text-orange-500 uppercase tracking-wide">Ubicación</label>
            <input
              className="w-full mt-1 px-3 py-3 rounded-xl border border-orange-200 text-sm text-orange-900 outline-none focus:border-orange-400"
              placeholder="Ej: Piso 3, Consultorios A"
              value={form.ubicacion}
              onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
            />
          </div>

          {/* Notas */}
          <div>
            <label className="text-xs font-bold text-orange-500 uppercase tracking-wide">Notas</label>
            <textarea
              className="w-full mt-1 px-3 py-3 rounded-xl border border-orange-200 text-sm text-orange-900 outline-none focus:border-orange-400 resize-none"
              rows={2}
              placeholder="Instrucciones, documentos a llevar…"
              value={form.notas}
              onChange={(e) => setForm({ ...form, notas: e.target.value })}
            />
          </div>

          {/* Recordatorios */}
          <div>
            <label className="text-xs font-bold text-orange-500 uppercase tracking-wide flex items-center gap-1.5">
              <Bell size={12} /> Recordatorios push
            </label>
            <div className="mt-2 space-y-2">
              {([
                { key: "recordatorio24h", label: "24 horas antes" },
                { key: "recordatorio60",  label: "1 hora antes" },
                { key: "recordatorio15",  label: "15 minutos antes" },
              ] as const).map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 py-2 cursor-pointer">
                  <div
                    onClick={() => setForm({ ...form, [key]: !form[key] })}
                    className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${
                      form[key] ? "bg-orange-500" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        form[key] ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </div>
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Botón guardar */}
          <button
            onClick={handleSubmit}
            disabled={!valido || guardando}
            className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl text-sm disabled:opacity-60 transition-opacity mb-4"
          >
            {guardando ? "Guardando…" : inicial ? "Guardar cambios" : "Crear cita"}
          </button>
        </div>
      </div>
    </div>
  );
}
