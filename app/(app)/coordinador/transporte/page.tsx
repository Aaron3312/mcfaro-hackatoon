"use client";
// Transporte coordinador — gestión de flota (vehículos) y rutas fijas
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Vehiculo, Ruta, TipoVehiculo, EstadoVehiculo, DiaSemana, HorarioRuta } from "@/lib/types";
import { Toast, useToast } from "@/components/ui/Toast";
import {
  Bus, Car, Plus, X, Pencil, Trash2, AlertCircle,
  ArrowRight, Clock, User, Phone,
  ChevronDown, ChevronUp,
} from "lucide-react";

// ── Config visual ─────────────────────────────────────────────────────────────
const TIPO_CONFIG: Record<TipoVehiculo, { label: string; icono: React.ReactNode }> = {
  sedan:   { label: "Sedán",    icono: <Car size={16} /> },
  van:     { label: "Van",      icono: <Bus size={16} /> },
  minibus: { label: "Minibús",  icono: <Bus size={18} /> },
};

const ESTADO_CONFIG: Record<EstadoVehiculo, { label: string; bg: string; text: string }> = {
  disponible: { label: "Disponible", bg: "#D1FAE5", text: "#065F46" },
};

const DIAS_LABEL: Record<DiaSemana, string> = {
  lun: "L", mar: "M", mie: "X", jue: "J", vie: "V", sab: "S", dom: "D",
};
const DIAS_ORDEN: DiaSemana[] = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"];

// ── Helper ────────────────────────────────────────────────────────────────────
function chips(dias: DiaSemana[]) {
  return DIAS_ORDEN.map((d) => (
    <span key={d}
      className="w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center"
      style={dias.includes(d)
        ? { background: "#C85A2A", color: "#fff" }
        : { background: "#F3F4F6", color: "#9CA3AF" }}>
      {DIAS_LABEL[d]}
    </span>
  ));
}

// ── Formulario de vehículo ────────────────────────────────────────────────────
function FormVehiculo({
  inicial,
  casaRonald,
  onGuardar,
  onCerrar,
}: {
  inicial?: Vehiculo;
  casaRonald: string;
  onGuardar: (datos: Omit<Vehiculo, "id" | "estado">) => Promise<void>;
  onCerrar: () => void;
}) {
  const [form, setForm] = useState({
    placas:         inicial?.placas        ?? "",
    modelo:         inicial?.modelo        ?? "",
    tipo:           inicial?.tipo          ?? "van" as TipoVehiculo,
    color:          inicial?.color         ?? "",
    capacidad:      inicial?.capacidad     ?? 8,
    chofer:         inicial?.chofer        ?? "",
    telefonoChofer: inicial?.telefonoChofer ?? "",
    casaRonald,
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const valido = form.placas.trim() && form.modelo.trim() && form.capacidad >= 1;

  const handleSubmit = async () => {
    if (!valido) return;
    setGuardando(true);
    setError("");
    try {
      await onGuardar({ ...form, placas: form.placas.toUpperCase().trim() });
      onCerrar();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setGuardando(false);
    }
  };

  const inp = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props}
      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 min-h-[44px]" />
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <h3 className="font-bold text-gray-800">{inicial ? "Editar vehículo" : "Nuevo vehículo"}</h3>
          <button onClick={onCerrar} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} className="text-gray-500" /></button>
        </div>
        <div className="overflow-y-auto flex-1 p-5 space-y-4">

          {/* Tipo */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tipo</label>
            <div className="grid grid-cols-3 gap-2">
              {(["sedan", "van", "minibus"] as TipoVehiculo[]).map((t) => (
                <button key={t} type="button"
                  onClick={() => setForm({ ...form, tipo: t })}
                  className="py-2.5 rounded-xl text-xs font-bold border transition-colors"
                  style={form.tipo === t
                    ? { background: "#C85A2A", color: "#fff", borderColor: "#C85A2A" }
                    : { background: "#fff", color: "#374151", borderColor: "#E5E7EB" }}>
                  {TIPO_CONFIG[t].label}
                </button>
              ))}
            </div>
          </div>

          {/* Placas + Modelo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Placas *</label>
              {inp({ placeholder: "ABC-1234", value: form.placas, onChange: (e) => setForm({ ...form, placas: e.target.value }) })}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Color</label>
              {inp({ placeholder: "Blanco", value: form.color, onChange: (e) => setForm({ ...form, color: e.target.value }) })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Modelo *</label>
            {inp({ placeholder: "Toyota Hiace 2022", value: form.modelo, onChange: (e) => setForm({ ...form, modelo: e.target.value }) })}
          </div>

          {/* Capacidad */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">Capacidad (pasajeros) *</label>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setForm({ ...form, capacidad: Math.max(1, form.capacidad - 1) })}
                className="w-10 h-10 rounded-xl border border-gray-200 text-lg font-bold text-gray-600 flex items-center justify-center hover:bg-gray-50">−</button>
              <span className="text-xl font-bold text-gray-800 w-8 text-center">{form.capacidad}</span>
              <button type="button" onClick={() => setForm({ ...form, capacidad: Math.min(50, form.capacidad + 1) })}
                className="w-10 h-10 rounded-xl border border-gray-200 text-lg font-bold text-gray-600 flex items-center justify-center hover:bg-gray-50">+</button>
            </div>
          </div>

          {/* Chofer */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Chofer</label>
            {inp({ placeholder: "Nombre del chofer", value: form.chofer, onChange: (e) => setForm({ ...form, chofer: e.target.value }) })}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Teléfono del chofer</label>
            {inp({ type: "tel", placeholder: "+52 55 0000 0000", value: form.telefonoChofer, onChange: (e) => setForm({ ...form, telefonoChofer: e.target.value }) })}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">
              <AlertCircle size={14} />{error}
            </div>
          )}

          <button onClick={handleSubmit} disabled={!valido || guardando}
            className="w-full py-3.5 rounded-2xl font-bold text-sm text-white disabled:opacity-50"
            style={{ background: "#C85A2A" }}>
            {guardando ? "Guardando…" : inicial ? "Guardar cambios" : "Agregar vehículo"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Formulario de ruta ────────────────────────────────────────────────────────
function FormRuta({
  inicial,
  casaRonald,
  vehiculos,
  onGuardar,
  onCerrar,
}: {
  inicial?: Ruta;
  casaRonald: string;
  vehiculos: Vehiculo[];
  onGuardar: (datos: Omit<Ruta, "id" | "activa" | "creadaEn">) => Promise<void>;
  onCerrar: () => void;
}) {
  const [form, setForm] = useState({
    nombre:     inicial?.nombre     ?? "",
    origen:     inicial?.origen     ?? "",
    destino:    inicial?.destino    ?? "",
    paradas:    inicial?.paradas    ?? [] as string[],
    horarios:   inicial?.horarios   ?? [{ hora: "08:00", dias: ["lun", "mar", "mie", "jue", "vie"] as DiaSemana[] }] as HorarioRuta[],
    vehiculoId: inicial?.vehiculoId ?? "",
    notas:      inicial?.notas      ?? "",
    casaRonald,
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError]   = useState("");
  const [parada, setParada] = useState("");

  const valido = form.nombre.trim() && form.origen.trim() && form.destino.trim() && form.horarios.length > 0;

  // Agrega una parada intermedia
  const agregarParada = () => {
    if (!parada.trim()) return;
    setForm({ ...form, paradas: [...form.paradas, parada.trim()] });
    setParada("");
  };
  const quitarParada = (i: number) =>
    setForm({ ...form, paradas: form.paradas.filter((_, idx) => idx !== i) });

  // Horarios
  const agregarHorario = () =>
    setForm({ ...form, horarios: [...form.horarios, { hora: "09:00", dias: ["lun"] }] });
  const quitarHorario = (i: number) =>
    setForm({ ...form, horarios: form.horarios.filter((_, idx) => idx !== i) });
  const setHoraHorario = (i: number, hora: string) => {
    const h = [...form.horarios];
    h[i] = { ...h[i], hora };
    setForm({ ...form, horarios: h });
  };
  const toggleDia = (i: number, dia: DiaSemana) => {
    const h = [...form.horarios];
    const dias = h[i].dias.includes(dia)
      ? h[i].dias.filter((d) => d !== dia)
      : [...h[i].dias, dia];
    h[i] = { ...h[i], dias };
    setForm({ ...form, horarios: h });
  };

  const handleSubmit = async () => {
    if (!valido) return;
    setGuardando(true);
    setError("");
    try {
      const payload = {
        ...form,
        vehiculoId: form.vehiculoId || undefined,
        notas: form.notas || undefined,
      };
      await onGuardar(payload);
      onCerrar();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <h3 className="font-bold text-gray-800">{inicial ? "Editar ruta" : "Nueva ruta"}</h3>
          <button onClick={onCerrar} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} className="text-gray-500" /></button>
        </div>
        <div className="overflow-y-auto flex-1 p-5 space-y-4">

          {/* Nombre */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Nombre de la ruta *</label>
            <input placeholder="Ej: Hospital Infantil → Casa Ronald"
              value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400" />
          </div>

          {/* Origen / Destino */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Origen *</label>
              <input placeholder="Casa Ronald" value={form.origen}
                onChange={(e) => setForm({ ...form, origen: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Destino *</label>
              <input placeholder="Hospital" value={form.destino}
                onChange={(e) => setForm({ ...form, destino: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400" />
            </div>
          </div>

          {/* Paradas intermedias */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">Paradas intermedias</label>
            <div className="flex gap-2 mb-2">
              <input placeholder="Nombre de parada" value={parada}
                onChange={(e) => setParada(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && agregarParada()}
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400" />
              <button type="button" onClick={agregarParada}
                className="px-3 py-2 rounded-xl text-sm font-bold text-white"
                style={{ background: "#C85A2A" }}>+</button>
            </div>
            {form.paradas.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.paradas.map((p, i) => (
                  <span key={i} className="flex items-center gap-1 px-2.5 py-1 bg-orange-50 text-orange-700 text-xs rounded-full">
                    {p}
                    <button onClick={() => quitarParada(i)} className="hover:text-red-500">
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Horarios */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Horarios *</label>
              <button type="button" onClick={agregarHorario}
                className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1">
                <Plus size={12} /> Agregar
              </button>
            </div>
            <div className="space-y-3">
              {form.horarios.map((h, i) => (
                <div key={i} className="rounded-xl border border-gray-200 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={13} className="text-orange-400" />
                    <input type="time" value={h.hora}
                      onChange={(e) => setHoraHorario(i, e.target.value)}
                      className="text-sm font-semibold text-gray-800 border-0 outline-none bg-transparent" />
                    <button onClick={() => quitarHorario(i)} className="ml-auto text-gray-400 hover:text-red-500">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="flex gap-1">
                    {DIAS_ORDEN.map((d) => (
                      <button key={d} type="button" onClick={() => toggleDia(i, d)}
                        className="w-7 h-7 rounded-full text-[10px] font-bold flex items-center justify-center transition-colors"
                        style={h.dias.includes(d)
                          ? { background: "#C85A2A", color: "#fff" }
                          : { background: "#F3F4F6", color: "#9CA3AF" }}>
                        {DIAS_LABEL[d]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vehículo asignado */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Vehículo asignado</label>
            <div className="relative">
              <select value={form.vehiculoId}
                onChange={(e) => setForm({ ...form, vehiculoId: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 appearance-none bg-white min-h-[44px]">
                <option value="">Sin asignar</option>
                {vehiculos.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.placas} — {v.modelo} ({v.capacidad} pas.)
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Notas</label>
            <textarea placeholder="Instrucciones adicionales, punto de encuentro…"
              value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })}
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 resize-none" />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">
              <AlertCircle size={14} />{error}
            </div>
          )}

          <button onClick={handleSubmit} disabled={!valido || guardando}
            className="w-full py-3.5 rounded-2xl font-bold text-sm text-white disabled:opacity-50"
            style={{ background: "#C85A2A" }}>
            {guardando ? "Guardando…" : inicial ? "Guardar cambios" : "Crear ruta"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Tarjeta de vehículo ───────────────────────────────────────────────────────
function CardVehiculo({
  v,
  onEditar,
  onEliminar,
}: {
  v: Vehiculo;
  onEditar: () => void;
  onEliminar: () => Promise<void>;
}) {
  const cfg = ESTADO_CONFIG[v.estado];
  const [accionando, setAccionando] = useState(false);
  const [confirmEliminar, setConfirmEliminar] = useState(false);
  const [error, setError] = useState("");

  const accion = async (fn: () => Promise<void>) => {
    setAccionando(true);
    setError("");
    try { await fn(); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : "Error"); }
    finally { setAccionando(false); }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#FDF0E6", color: "#C85A2A" }}>
            {TIPO_CONFIG[v.tipo].icono}
          </div>
          <div>
            <p className="font-bold text-gray-800">{v.placas}</p>
            <p className="text-xs text-gray-500">{v.modelo}{v.color ? ` · ${v.color}` : ""}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: cfg.bg, color: cfg.text }}>
            {cfg.label}
          </span>
          <button onClick={onEditar} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-400"><Pencil size={14} /></button>
          <button onClick={() => setConfirmEliminar(true)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Detalles */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1"><Bus size={11} /> {v.capacidad} pas. · {TIPO_CONFIG[v.tipo].label}</span>
        {v.chofer && <span className="flex items-center gap-1"><User size={11} /> {v.chofer}</span>}
        {v.telefonoChofer && <span className="flex items-center gap-1"><Phone size={11} /> {v.telefonoChofer}</span>}
      </div>

      {/* Confirmación eliminar */}
      {confirmEliminar && (
        <div className="mt-3 rounded-xl bg-red-50 border border-red-200 p-3">
          <p className="text-xs font-bold text-red-700 mb-2">¿Eliminar {v.placas}?</p>
          <div className="flex gap-2">
            <button onClick={() => accion(onEliminar)} disabled={accionando}
              className="flex-1 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold disabled:opacity-50">
              {accionando ? "…" : "Eliminar"}
            </button>
            <button onClick={() => setConfirmEliminar(false)}
              className="flex-1 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs">Cancelar</button>
          </div>
        </div>
      )}
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </div>
  );
}

// ── Tarjeta de ruta ───────────────────────────────────────────────────────────
function CardRuta({
  ruta,
  vehiculo,
  onEditar,
  onToggleActiva,
  onEliminar,
}: {
  ruta: Ruta;
  vehiculo?: Vehiculo;
  onEditar: () => void;
  onToggleActiva: () => Promise<void>;
  onEliminar: () => Promise<void>;
}) {
  const [expandida, setExpandida] = useState(false);
  const [accionando, setAccionando] = useState(false);
  const [confirmEliminar, setConfirmEliminar] = useState(false);
  const [error, setError] = useState("");

  const accion = async (fn: () => Promise<void>) => {
    setAccionando(true);
    setError("");
    try { await fn(); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : "Error"); }
    finally { setAccionando(false); }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Cabecera */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full shrink-0 mt-1" style={{ background: ruta.activa ? "#10B981" : "#9CA3AF" }} />
            <p className="font-bold text-gray-800 truncate">{ruta.nombre}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={onEditar} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-400"><Pencil size={14} /></button>
            <button onClick={() => setConfirmEliminar(true)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><Trash2 size={14} /></button>
          </div>
        </div>

        {/* Ruta */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <span className="truncate font-medium">{ruta.origen}</span>
          <ArrowRight size={14} className="text-orange-400 shrink-0" />
          <span className="truncate font-medium">{ruta.destino}</span>
        </div>

        {/* Horarios */}
        <div className="space-y-1.5 mb-3">
          {ruta.horarios.map((h, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs font-bold text-orange-600 w-12 shrink-0">{h.hora}</span>
              <div className="flex gap-0.5">{chips(h.dias)}</div>
            </div>
          ))}
        </div>

        {/* Vehículo */}
        {vehiculo ? (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
            <Bus size={12} className="text-orange-400" />
            <span>{vehiculo.placas} — {vehiculo.modelo} · {vehiculo.capacidad} pas.</span>
            {vehiculo.chofer && <span className="text-gray-400">({vehiculo.chofer})</span>}
          </div>
        ) : (
          <p className="text-xs text-amber-600 mb-3 flex items-center gap-1">
            <AlertCircle size={11} /> Sin vehículo asignado
          </p>
        )}

        {/* Acciones */}
        <div className="flex gap-2">
          <button onClick={() => accion(onToggleActiva)} disabled={accionando}
            className="flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors disabled:opacity-50"
            style={ruta.activa
              ? { borderColor: "#D1D5DB", color: "#6B7280" }
              : { borderColor: "#10B981", color: "#065F46" }}>
            {ruta.activa ? "Desactivar" : "Activar"}
          </button>
          {ruta.paradas && ruta.paradas.length > 0 && (
            <button onClick={() => setExpandida(!expandida)}
              className="px-3 py-2 rounded-xl text-xs font-medium border border-gray-200 text-gray-500 flex items-center gap-1">
              Paradas {expandida ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          )}
        </div>

        {/* Paradas expandidas */}
        {expandida && ruta.paradas && ruta.paradas.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-2">Paradas</p>
            <div className="flex flex-wrap gap-1.5">
              {ruta.paradas.map((p, i) => (
                <span key={i} className="px-2.5 py-1 bg-orange-50 text-orange-700 text-xs rounded-full">{p}</span>
              ))}
            </div>
          </div>
        )}

        {ruta.notas && (
          <p className="mt-2 text-xs text-gray-400 italic">"{ruta.notas}"</p>
        )}

        {/* Confirmación eliminar */}
        {confirmEliminar && (
          <div className="mt-3 rounded-xl bg-red-50 border border-red-200 p-3">
            <p className="text-xs font-bold text-red-700 mb-2">¿Eliminar esta ruta?</p>
            <div className="flex gap-2">
              <button onClick={() => accion(onEliminar)} disabled={accionando}
                className="flex-1 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold disabled:opacity-50">
                {accionando ? "…" : "Eliminar"}
              </button>
              <button onClick={() => setConfirmEliminar(false)}
                className="flex-1 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs">Cancelar</button>
            </div>
          </div>
        )}
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function TransportePage() {
  const router = useRouter();
  const { familia, cargando } = useAuth();
  const { toast, mostrar, cerrar } = useToast();

  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [rutas, setRutas]         = useState<Ruta[]>([]);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [tab, setTab]             = useState<"vehiculos" | "rutas">("vehiculos");

  // Modales
  const [formVehiculo, setFormVehiculo] = useState<{ abierto: boolean; editar?: Vehiculo }>({ abierto: false });
  const [formRuta, setFormRuta]         = useState<{ abierto: boolean; editar?: Ruta }>({ abierto: false });

  useEffect(() => {
    if (!cargando && familia?.rol !== "coordinador") router.replace("/dashboard");
  }, [familia, cargando, router]);

  useEffect(() => {
    if (!familia || familia.rol !== "coordinador") return;

    // Suscripción vehículos de la casa
    const unsubV = onSnapshot(
      query(collection(db, "vehiculos"), where("casaRonald", "==", familia.casaRonald)),
      (snap) => {
        setVehiculos(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Vehiculo)
          .sort((a, b) => a.placas.localeCompare(b.placas)));
        setCargandoDatos(false);
      }
    );

    // Suscripción rutas de la casa
    const unsubR = onSnapshot(
      query(collection(db, "rutas"), where("casaRonald", "==", familia.casaRonald)),
      (snap) => {
        setRutas(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Ruta)
          .sort((a, b) => a.nombre.localeCompare(b.nombre)));
      }
    );

    return () => { unsubV(); unsubR(); };
  }, [familia]);

  // Métricas
  const rutasActivas = rutas.filter((r) => r.activa).length;

  // API helpers
  const apiVehiculo = async (url: string, method: string, body?: object) => {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error ?? "Error");
  };

  const apiRuta = async (url: string, method: string, body?: object) => {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error ?? "Error");
  };

  const crearVehiculo = async (datos: Omit<Vehiculo, "id" | "estado">) => {
    await apiVehiculo("/api/vehiculos/crear", "POST", datos);
    mostrar("Vehículo agregado");
  };

  const editarVehiculo = async (id: string, datos: Omit<Vehiculo, "id" | "estado">) => {
    await apiVehiculo(`/api/vehiculos/${id}/editar`, "PATCH", datos);
    mostrar("Vehículo actualizado");
  };

  const eliminarVehiculo = async (id: string) => {
    await apiVehiculo(`/api/vehiculos/${id}/eliminar`, "DELETE");
    mostrar("Vehículo eliminado");
  };

  const crearRuta = async (datos: Omit<Ruta, "id" | "activa" | "creadaEn">) => {
    await apiRuta("/api/rutas/crear", "POST", datos);
    mostrar("Ruta creada");
  };

  const editarRuta = async (id: string, datos: Omit<Ruta, "id" | "activa" | "creadaEn">) => {
    await apiRuta(`/api/rutas/${id}/editar`, "PATCH", datos);
    mostrar("Ruta actualizada");
  };

  const toggleRuta = async (ruta: Ruta) => {
    await apiRuta(`/api/rutas/${ruta.id}/estado`, "PATCH", { activa: !ruta.activa });
    mostrar(ruta.activa ? "Ruta desactivada" : "Ruta activada");
  };

  const eliminarRuta = async (id: string) => {
    await apiRuta(`/api/rutas/${id}/eliminar`, "DELETE");
    mostrar("Ruta eliminada");
  };

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
              <Bus size={26} /> Transporte
            </h1>
            <button
              onClick={() => tab === "vehiculos"
                ? setFormVehiculo({ abierto: true })
                : setFormRuta({ abierto: true })}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white rounded-2xl px-4 py-3 font-semibold text-sm min-h-[48px] transition-colors shrink-0">
              <Plus size={18} /> {tab === "vehiculos" ? "Vehículo" : "Ruta"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-6 pb-10 md:px-10">

        {/* ── Métricas ───────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }} className="mb-6">
          {[
            { label: "Vehículos",    value: vehiculos.length, color: "#7A3D1A", bg: "#FDF0E6" },
            { label: "Rutas",        value: rutas.length,     color: "#1E40AF", bg: "#DBEAFE" },
            { label: "Rutas activas",value: rutasActivas,     color: "#5B21B6", bg: "#EDE9FE" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl shadow-sm p-3 text-center">
              <p className="text-2xl font-bold" style={{ color }}>{value}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Tabs ───────────────────────────────────────────── */}
        <div className="flex gap-1 bg-white rounded-2xl p-1 shadow-sm border border-gray-100 mb-6">
          {(["vehiculos", "rutas"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                tab === t ? "text-white shadow-sm" : "text-gray-500"
              }`}
              style={tab === t ? { background: "#C85A2A" } : {}}>
              {t === "vehiculos" ? `Flota (${vehiculos.length})` : `Rutas (${rutas.length})`}
            </button>
          ))}
        </div>

        {/* ── TAB: Vehículos ─────────────────────────────────── */}
        {tab === "vehiculos" && (
          <>
            {vehiculos.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
                <Bus size={40} className="mx-auto mb-3 text-gray-200" />
                <p className="text-sm text-gray-400 mb-4">No hay vehículos registrados</p>
                <button onClick={() => setFormVehiculo({ abierto: true })}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{ background: "#C85A2A" }}>
                  + Agregar primer vehículo
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {vehiculos.map((v) => (
                  <CardVehiculo key={v.id} v={v}
                    onEditar={() => setFormVehiculo({ abierto: true, editar: v })}
                    onEliminar={() => eliminarVehiculo(v.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── TAB: Rutas ─────────────────────────────────────── */}
        {tab === "rutas" && (
          <>
            {rutas.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
                <ArrowRight size={40} className="mx-auto mb-3 text-gray-200" />
                <p className="text-sm text-gray-400 mb-4">No hay rutas creadas</p>
                <button onClick={() => setFormRuta({ abierto: true })}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{ background: "#C85A2A" }}>
                  + Crear primera ruta
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Activas primero */}
                {rutas.filter((r) => r.activa).length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "#9A6A2A" }}>
                      Activas ({rutas.filter((r) => r.activa).length})
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {rutas.filter((r) => r.activa).map((r) => (
                        <CardRuta key={r.id} ruta={r}
                          vehiculo={vehiculos.find((v) => v.id === r.vehiculoId)}
                          onEditar={() => setFormRuta({ abierto: true, editar: r })}
                          onToggleActiva={() => toggleRuta(r)}
                          onEliminar={() => eliminarRuta(r.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {rutas.filter((r) => !r.activa).length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide mb-3 text-gray-400">
                      Inactivas ({rutas.filter((r) => !r.activa).length})
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4 opacity-60">
                      {rutas.filter((r) => !r.activa).map((r) => (
                        <CardRuta key={r.id} ruta={r}
                          vehiculo={vehiculos.find((v) => v.id === r.vehiculoId)}
                          onEditar={() => setFormRuta({ abierto: true, editar: r })}
                          onToggleActiva={() => toggleRuta(r)}
                          onEliminar={() => eliminarRuta(r.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Modales ─────────────────────────────────────────── */}
      {formVehiculo.abierto && familia && (
        <FormVehiculo
          inicial={formVehiculo.editar}
          casaRonald={familia.casaRonald}
          onGuardar={(datos) =>
            formVehiculo.editar
              ? editarVehiculo(formVehiculo.editar.id, datos)
              : crearVehiculo(datos)
          }
          onCerrar={() => setFormVehiculo({ abierto: false })}
        />
      )}
      {formRuta.abierto && familia && (
        <FormRuta
          inicial={formRuta.editar}
          casaRonald={familia.casaRonald}
          vehiculos={vehiculos}
          onGuardar={(datos) =>
            formRuta.editar
              ? editarRuta(formRuta.editar.id, datos)
              : crearRuta(datos)
          }
          onCerrar={() => setFormRuta({ abierto: false })}
        />
      )}

      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrar} />}
    </>
  );
}
