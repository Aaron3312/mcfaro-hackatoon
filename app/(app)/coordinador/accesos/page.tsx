"use client";
// Accesos coordinador — gestión de permisos de entrada a la Casa Ronald McDonald
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { AccesoPersonal, EstadoAcceso, TipoAcceso } from "@/lib/types";
import { Toast, useToast } from "@/components/ui/Toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  KeyRound, Plus, X, Pencil, Trash2, AlertCircle,
  User, Phone, BedDouble, Search, ShieldCheck, ShieldOff,
  Clock, UserCheck, Users, Handshake, Briefcase,
} from "lucide-react";

// ── Config visual ──────────────────────────────────────────────────────────────
const TIPO_CONFIG: Record<TipoAcceso, { label: string; icono: React.ReactNode; bg: string; text: string }> = {
  cuidador_principal: { label: "Cuidador",   icono: <UserCheck size={14} />, bg: "#FDF0E6", text: "#7A3D1A" },
  visitante:          { label: "Visitante",  icono: <Users size={14} />,     bg: "#DBEAFE", text: "#1D4ED8" },
  voluntario:         { label: "Voluntario", icono: <Handshake size={14} />, bg: "#D1FAE5", text: "#065F46" },
  staff:              { label: "Staff",      icono: <Briefcase size={14} />, bg: "#EDE9FE", text: "#5B21B6" },
};

const ESTADO_CONFIG: Record<EstadoAcceso, { label: string; bg: string; text: string }> = {
  activo:     { label: "Activo",     bg: "#D1FAE5", text: "#065F46" },
  vencido:    { label: "Vencido",    bg: "#FEF3C7", text: "#B45309" },
  suspendido: { label: "Suspendido", bg: "#FEE2E2", text: "#991B1B" },
};

// ── Formulario ─────────────────────────────────────────────────────────────────
function FormAcceso({
  inicial,
  casaRonald,
  creadoPor,
  onGuardar,
  onCerrar,
}: {
  inicial?: AccesoPersonal;
  casaRonald: string;
  creadoPor: string;
  onGuardar: () => void;
  onCerrar: () => void;
}) {
  const hoy = format(new Date(), "yyyy-MM-dd");
  const [form, setForm] = useState({
    nombre:      inicial?.nombre      ?? "",
    telefono:    inicial?.telefono    ?? "",
    tipo:        inicial?.tipo        ?? "visitante" as TipoAcceso,
    estado:      inicial?.estado      ?? "activo" as EstadoAcceso,
    habitacion:  inicial?.habitacion  ?? "",
    fechaInicio: inicial?.fechaInicio
      ? format(inicial.fechaInicio.toDate(), "yyyy-MM-dd")
      : hoy,
    fechaFin:    inicial?.fechaFin
      ? format(inicial.fechaFin.toDate(), "yyyy-MM-dd")
      : "",
    notas:       inicial?.notas       ?? "",
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const upd = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const valido = form.nombre.trim() && form.fechaInicio;

  const handleSubmit = async () => {
    if (!valido) return;
    setGuardando(true);
    setError("");
    try {
      const body = {
        nombre:      form.nombre,
        telefono:    form.telefono,
        tipo:        form.tipo,
        estado:      form.estado,
        casaRonald,
        habitacion:  form.habitacion,
        fechaInicio: new Date(form.fechaInicio).toISOString(),
        fechaFin:    form.fechaFin ? new Date(form.fechaFin).toISOString() : null,
        notas:       form.notas,
        creadoPor,
      };
      const url = inicial
        ? `/api/accesos/${inicial.id}/editar`
        : "/api/accesos/crear";
      const method = inicial ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Error");
      onGuardar();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setGuardando(false);
    }
  };

  const inp = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 min-h-11" />
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <h3 className="font-bold text-gray-800">{inicial ? "Editar acceso" : "Nuevo acceso"}</h3>
          <button onClick={onCerrar} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} className="text-gray-500" /></button>
        </div>
        <div className="overflow-y-auto flex-1 p-5 space-y-4">

          {/* Tipo */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tipo *</label>
            <div className="grid grid-cols-2 gap-2">
              {(["cuidador_principal", "visitante", "voluntario", "staff"] as TipoAcceso[]).map((t) => (
                <button key={t} type="button"
                  onClick={() => upd("tipo", t)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold border transition-colors"
                  style={form.tipo === t
                    ? { background: "#C85A2A", color: "#fff", borderColor: "#C85A2A" }
                    : { background: "#fff", color: "#374151", borderColor: "#E5E7EB" }}>
                  {TIPO_CONFIG[t].icono} {TIPO_CONFIG[t].label}
                </button>
              ))}
            </div>
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Nombre completo *</label>
            {inp({ placeholder: "Nombre del visitante o cuidador", value: form.nombre, onChange: (e) => upd("nombre", e.target.value) })}
          </div>

          {/* Teléfono + Habitación */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Teléfono</label>
              {inp({ type: "tel", placeholder: "+52 55 …", value: form.telefono, onChange: (e) => upd("telefono", e.target.value) })}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Habitación</label>
              {inp({ placeholder: "101-A", value: form.habitacion, onChange: (e) => upd("habitacion", e.target.value) })}
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Fecha inicio *</label>
              {inp({ type: "date", value: form.fechaInicio, onChange: (e) => upd("fechaInicio", e.target.value) })}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Fecha fin</label>
              {inp({ type: "date", value: form.fechaFin, onChange: (e) => upd("fechaFin", e.target.value) })}
              <p className="text-[10px] text-gray-400 mt-0.5">Dejar vacío = sin expiración</p>
            </div>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Estado</label>
            <div className="flex gap-2">
              {(["activo", "vencido", "suspendido"] as EstadoAcceso[]).map((s) => (
                <button key={s} type="button"
                  onClick={() => upd("estado", s)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold border transition-colors"
                  style={form.estado === s
                    ? { background: ESTADO_CONFIG[s].bg, color: ESTADO_CONFIG[s].text, borderColor: ESTADO_CONFIG[s].bg }
                    : { background: "#fff", color: "#6B7280", borderColor: "#E5E7EB" }}>
                  {ESTADO_CONFIG[s].label}
                </button>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Notas</label>
            <textarea
              value={form.notas}
              onChange={(e) => upd("notas", e.target.value)}
              placeholder="Motivo de visita, restricciones, observaciones…"
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 resize-none"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">
              <AlertCircle size={14} />{error}
            </div>
          )}

          <button onClick={handleSubmit} disabled={!valido || guardando}
            className="w-full py-3.5 rounded-2xl text-sm font-bold text-white disabled:opacity-50 transition-opacity"
            style={{ background: "#C85A2A" }}>
            {guardando ? "Guardando…" : inicial ? "Guardar cambios" : "Crear acceso"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Tarjeta de acceso ──────────────────────────────────────────────────────────
function CardAcceso({
  acceso,
  onEditar,
  onEliminado,
}: {
  acceso: AccesoPersonal;
  onEditar: () => void;
  onEliminado: () => void;
}) {
  const tipoCfg   = TIPO_CONFIG[acceso.tipo];
  const estadoCfg = ESTADO_CONFIG[acceso.estado];
  const [confirmEliminar, setConfirmEliminar] = useState(false);
  const [accionando, setAccionando]           = useState(false);
  const [error, setError]                     = useState("");

  const eliminar = async () => {
    setAccionando(true);
    setError("");
    try {
      const res = await fetch(`/api/accesos/${acceso.id}/eliminar`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Error");
      onEliminado();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setAccionando(false);
    }
  };

  // Calcula si el acceso ya venció automáticamente
  const yaVencio = acceso.fechaFin && acceso.fechaFin.toDate() < new Date();

  return (
    <div className={`bg-white rounded-2xl shadow-sm p-4 border ${acceso.estado === "suspendido" ? "border-red-200" : "border-gray-100"}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: tipoCfg.bg, color: tipoCfg.text }}>
            {tipoCfg.icono} {tipoCfg.label}
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: estadoCfg.bg, color: estadoCfg.text }}>
            {yaVencio && acceso.estado === "activo" ? "Vencido" : estadoCfg.label}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onEditar} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-400">
            <Pencil size={13} />
          </button>
          <button onClick={() => setConfirmEliminar(true)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <p className="font-bold text-gray-800 truncate">{acceso.nombre}</p>

      <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-500">
        {acceso.telefono && (
          <span className="flex items-center gap-1"><Phone size={11} /> {acceso.telefono}</span>
        )}
        {acceso.habitacion && (
          <span className="flex items-center gap-1"><BedDouble size={11} /> Hab. {acceso.habitacion}</span>
        )}
        <span className="flex items-center gap-1">
          <Clock size={11} />
          {format(acceso.fechaInicio.toDate(), "d MMM yyyy", { locale: es })}
          {acceso.fechaFin && ` → ${format(acceso.fechaFin.toDate(), "d MMM yyyy", { locale: es })}`}
        </span>
      </div>

      {acceso.notas && (
        <p className="text-xs text-gray-400 italic mt-2">"{acceso.notas}"</p>
      )}

      {/* Confirmación eliminar */}
      {confirmEliminar && (
        <div className="mt-3 rounded-xl bg-red-50 border border-red-200 p-3">
          <p className="text-xs font-bold text-red-700 mb-2">¿Eliminar acceso de {acceso.nombre}?</p>
          <div className="flex gap-2">
            <button onClick={eliminar} disabled={accionando}
              className="flex-1 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold disabled:opacity-50">
              {accionando ? "…" : "Eliminar"}
            </button>
            <button onClick={() => setConfirmEliminar(false)}
              className="flex-1 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs">
              Cancelar
            </button>
          </div>
        </div>
      )}
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </div>
  );
}

// ── Página principal ───────────────────────────────────────────────────────────
export default function AccesosPage() {
  const router = useRouter();
  const { familia, cargando } = useAuth();
  const { toast, mostrar, cerrar } = useToast();

  const [accesos, setAccesos]         = useState<AccesoPersonal[]>([]);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [busqueda, setBusqueda]       = useState("");
  const [filtroTipo, setFiltroTipo]   = useState<TipoAcceso | "todos">("todos");
  const [filtroEstado, setFiltroEstado] = useState<EstadoAcceso | "todos">("todos");
  const [formAcceso, setFormAcceso]   = useState<{ abierto: boolean; editar?: AccesoPersonal }>({ abierto: false });

  useEffect(() => {
    if (!cargando && familia?.rol !== "coordinador") router.replace("/dashboard");
  }, [familia, cargando, router]);

  useEffect(() => {
    if (!familia || familia.rol !== "coordinador") return;

    const unsub = onSnapshot(
      query(
        collection(db, "accesos"),
        where("casaRonald", "==", familia.casaRonald),
        orderBy("creadoEn", "desc")
      ),
      (snap) => {
        setAccesos(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as AccesoPersonal));
        setCargandoDatos(false);
      }
    );
    return () => unsub();
  }, [familia]);

  // Filtrado
  const accesosFiltrados = accesos.filter((a) => {
    const coincideBusqueda =
      !busqueda ||
      a.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (a.telefono ?? "").includes(busqueda) ||
      (a.habitacion ?? "").toLowerCase().includes(busqueda.toLowerCase());
    const coincideTipo   = filtroTipo   === "todos" || a.tipo   === filtroTipo;
    const coincideEstado = filtroEstado === "todos" || a.estado === filtroEstado;
    return coincideBusqueda && coincideTipo && coincideEstado;
  });

  const activos     = accesos.filter((a) => a.estado === "activo").length;
  const suspendidos = accesos.filter((a) => a.estado === "suspendido").length;
  const visitantes  = accesos.filter((a) => a.tipo === "visitante").length;

  if (cargando || cargandoDatos) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "#C85A2A", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <>
      {/* ── Banner ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden w-full"
        style={{ background: "linear-gradient(135deg, #C85A2A 0%, #E87A3A 70%, #F5C842 100%)" }}>
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-15" style={{ background: "#7A3D1A" }} />
        <div className="max-w-5xl mx-auto px-5 py-8 md:px-10">
          <button onClick={() => router.back()}
            className="text-white/70 text-sm mb-3 flex items-center gap-1 hover:text-white transition-colors">
            ← Panel coordinador
          </button>
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
              <KeyRound size={26} /> Accesos
            </h1>
            <button
              onClick={() => setFormAcceso({ abierto: true })}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white rounded-2xl px-4 py-3 font-semibold text-sm min-h-12 transition-colors shrink-0">
              <Plus size={18} /> Nuevo acceso
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-6 pb-10 md:px-10">

        {/* ── Métricas ───────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }} className="mb-6">
          {[
            { label: "Accesos activos",  value: activos,     color: "#065F46", bg: "#D1FAE5", icon: <ShieldCheck size={16} /> },
            { label: "Suspendidos",      value: suspendidos, color: "#991B1B", bg: "#FEE2E2", icon: <ShieldOff size={16} /> },
            { label: "Visitantes hoy",   value: visitantes,  color: "#1D4ED8", bg: "#DBEAFE", icon: <Users size={16} /> },
          ].map(({ label, value, color, bg, icon }) => (
            <div key={label} className="bg-white rounded-2xl shadow-sm p-3 text-center flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: bg, color }}>{icon}</div>
              <p className="text-2xl font-bold" style={{ color }}>{value}</p>
              <p className="text-[10px] text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Filtros ────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-5 space-y-3">
          {/* Buscador */}
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, teléfono o habitación…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>

          {/* Chips de tipo */}
          <div className="flex gap-1.5 flex-wrap">
            {(["todos", "cuidador_principal", "visitante", "voluntario", "staff"] as const).map((t) => (
              <button key={t} onClick={() => setFiltroTipo(t)}
                className="px-3 py-1.5 rounded-full text-xs font-bold transition-colors"
                style={filtroTipo === t
                  ? { background: "#C85A2A", color: "#fff" }
                  : { background: "#F3F4F6", color: "#6B7280" }}>
                {t === "todos" ? "Todos" : TIPO_CONFIG[t].label}
              </button>
            ))}
          </div>

          {/* Chips de estado */}
          <div className="flex gap-1.5 flex-wrap">
            {(["todos", "activo", "vencido", "suspendido"] as const).map((s) => (
              <button key={s} onClick={() => setFiltroEstado(s)}
                className="px-3 py-1.5 rounded-full text-xs font-bold transition-colors"
                style={filtroEstado === s
                  ? { background: "#374151", color: "#fff" }
                  : { background: "#F3F4F6", color: "#6B7280" }}>
                {s === "todos" ? "Todos los estados" : ESTADO_CONFIG[s].label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Lista ──────────────────────────────────────────── */}
        {accesosFiltrados.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
            <KeyRound size={40} className="mx-auto mb-3 text-gray-200" />
            <p className="text-sm text-gray-400 mb-4">
              {accesos.length === 0 ? "No hay accesos registrados" : "Sin resultados para esta búsqueda"}
            </p>
            {accesos.length === 0 && (
              <button onClick={() => setFormAcceso({ abierto: true })}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: "#C85A2A" }}>
                + Crear primer acceso
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-3">{accesosFiltrados.length} resultado{accesosFiltrados.length !== 1 ? "s" : ""}</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {accesosFiltrados.map((a) => (
                <CardAcceso key={a.id} acceso={a}
                  onEditar={() => setFormAcceso({ abierto: true, editar: a })}
                  onEliminado={() => mostrar("Acceso eliminado")}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Modal ──────────────────────────────────────────── */}
      {formAcceso.abierto && familia && (
        <FormAcceso
          inicial={formAcceso.editar}
          casaRonald={familia.casaRonald}
          creadoPor={familia.id}
          onGuardar={() => {
            mostrar(formAcceso.editar ? "Acceso actualizado" : "Acceso creado");
            setFormAcceso({ abierto: false });
          }}
          onCerrar={() => setFormAcceso({ abierto: false })}
        />
      )}

      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrar} />}
    </>
  );
}
