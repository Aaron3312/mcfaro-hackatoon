"use client";
// Ficha completa de familia — info, estancia, historial
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { doc, onSnapshot, collection, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Familia, Cuidador, HistorialHabitacion } from "@/lib/types";
import { Toast, useToast } from "@/components/ui/Toast";
import { format, differenceInDays, addDays } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowLeft, User, Baby, Hospital, BedDouble,
  Phone, Mail, Calendar, Edit3, Save, X,
  QrCode, History, Clock, CalendarCheck, CalendarPlus, AlertTriangle,
  UserPlus, Trash2, Plus,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtFecha = (ts: any) => {
  if (!ts) return "—";
  try { return format(ts.toDate ? ts.toDate() : new Date(ts), "d MMM yyyy", { locale: es }); }
  catch { return "—"; }
};

const esActiva = (f: Familia) =>
  !f.fechaSalidaPlanificada || f.fechaSalidaPlanificada.toDate() >= new Date();

// ── Componente de fila ────────────────────────────────────────────────────────
function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-orange-300 mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] text-orange-400 font-semibold uppercase tracking-wide">{label}</p>
        <p className="text-sm text-orange-800 font-medium">{value}</p>
      </div>
    </div>
  );
}

// ── Página ────────────────────────────────────────────────────────────────────
export default function FamiliaDetallePage({ params }: { params: Promise<{ familiaId: string }> }) {
  const { familiaId } = use(params);
  const router = useRouter();
  const { familia: usuario, cargando: authCargando } = useAuth();
  const { toast, mostrar: showToast, cerrar: cerrarToast } = useToast();

  const [familia, setFamilia] = useState<Familia | null>(null);
  const [historial, setHistorial] = useState<HistorialHabitacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [tab, setTab] = useState<"info" | "estancia" | "historial">("info");

  // Campos del cuidador principal
  const [form, setForm] = useState({
    nombreCuidador: "", telefono: "", email: "", parentesco: "", hospital: "",
  });

  // Cuidadores adicionales
  const [cuidadores, setCuidadores] = useState<Cuidador[]>([]);
  const [agregandoCuidador, setAgregandoCuidador] = useState(false);
  const [formCuidador, setFormCuidador] = useState({ nombre: "", telefono: "", parentesco: "", email: "" });

  const [fechaSalidaEdit, setFechaSalidaEdit] = useState("");
  const [extensionDias, setExtensionDias] = useState(7);

  useEffect(() => {
    if (!authCargando && (!usuario || usuario.rol !== "coordinador")) {
      router.replace("/dashboard");
    }
  }, [usuario, authCargando, router]);

  useEffect(() => {
    return onSnapshot(doc(db, "familias", familiaId), (snap) => {
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() } as Familia;
        setFamilia(data);
        setForm({
          nombreCuidador: data.nombreCuidador || "",
          telefono: data.telefono || "",
          email: data.email || "",
          parentesco: data.parentesco || "",
          hospital: data.hospital || "",
        });
        setCuidadores(data.cuidadores ?? []);
        if (data.fechaSalidaPlanificada) {
          setFechaSalidaEdit(format(data.fechaSalidaPlanificada.toDate(), "yyyy-MM-dd"));
        }
      }
      setCargando(false);
    });
  }, [familiaId]);

  // Historial sin orderBy (evita índice compuesto)
  useEffect(() => {
    const q = query(collection(db, "historialHabitaciones"), where("familiaId", "==", familiaId));
    return onSnapshot(q, (snap) => {
      const docs = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as HistorialHabitacion)
        .sort((a, b) => b.fechaIngreso.toMillis() - a.fechaIngreso.toMillis());
      setHistorial(docs);
    });
  }, [familiaId]);

  const guardarInfo = async () => {
    setGuardando(true);
    try {
      const res = await fetch("/api/familias/actualizar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ familiaId, ...form, cuidadores }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Error");
      showToast("Cambios guardados");
      setEditando(false);
      setAgregandoCuidador(false);
    } catch (e: any) {
      showToast(e.message || "Error al guardar", "error");
    } finally {
      setGuardando(false);
    }
  };

  const agregarCuidador = () => {
    if (!formCuidador.nombre.trim() || !formCuidador.telefono.trim()) return;
    setCuidadores([...cuidadores, { ...formCuidador }]);
    setFormCuidador({ nombre: "", telefono: "", parentesco: "", email: "" });
    setAgregandoCuidador(false);
  };

  const quitarCuidador = (idx: number) => {
    setCuidadores(cuidadores.filter((_, i) => i !== idx));
  };

  const guardarFechaSalida = async (fecha: string | null) => {
    setGuardando(true);
    try {
      const res = await fetch("/api/familias/actualizar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ familiaId, fechaSalidaPlanificada: fecha }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Error");
      showToast(fecha ? "Fecha de salida actualizada" : "Fecha de salida eliminada");
    } catch (e: any) {
      showToast(e.message || "Error", "error");
    } finally {
      setGuardando(false);
    }
  };

  const extenderEstancia = async () => {
    if (!familia) return;
    const base = familia.fechaSalidaPlanificada
      ? familia.fechaSalidaPlanificada.toDate()
      : new Date();
    const nueva = addDays(base, extensionDias);
    await guardarFechaSalida(format(nueva, "yyyy-MM-dd"));
    setFechaSalidaEdit(format(nueva, "yyyy-MM-dd"));
  };

  if (authCargando || cargando) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-orange-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!familia) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-orange-700 font-semibold">Familia no encontrada</p>
          <button onClick={() => router.back()} className="mt-4 text-orange-500 text-sm underline">Volver</button>
        </div>
      </div>
    );
  }

  const activa = esActiva(familia);
  const diasSalida = familia.fechaSalidaPlanificada
    ? differenceInDays(familia.fechaSalidaPlanificada.toDate(), new Date())
    : null;
  const alerta = diasSalida !== null && diasSalida >= 0 && diasSalida <= 1;

  const diasEstancia = familia.fechaIngreso
    ? differenceInDays(
        familia.fechaSalidaPlanificada ? familia.fechaSalidaPlanificada.toDate() : new Date(),
        familia.fechaIngreso.toDate()
      )
    : null;

  const totalPersonas = 1 + 1 + (familia.cuidadores?.length ?? 0); // paciente + principal + adicionales

  return (
    <div className="min-h-screen bg-orange-50 pb-24">
      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrarToast} />}

      {/* Encabezado */}
      <div className="bg-white border-b border-orange-100 px-4 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-orange-50">
            <ArrowLeft size={20} className="text-orange-600" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-orange-900 truncate">{familia.nombreCuidador}</h1>
            <p className="text-sm text-orange-500">
              {totalPersonas} persona{totalPersonas !== 1 ? "s" : ""} · {1 + (familia.cuidadores?.length ?? 0)} cuidador{(1 + (familia.cuidadores?.length ?? 0)) !== 1 ? "es" : ""}
            </p>
          </div>
          {tab === "info" && (
            !editando ? (
              <button onClick={() => setEditando(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-orange-100 text-orange-700 rounded-xl text-sm font-semibold">
                <Edit3 size={14} /> Editar
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => { setEditando(false); setAgregandoCuidador(false); }} className="p-2 rounded-xl bg-gray-100 text-gray-600">
                  <X size={16} />
                </button>
                <button onClick={guardarInfo} disabled={guardando}
                  className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 text-white rounded-xl text-sm font-semibold disabled:opacity-60">
                  <Save size={14} /> {guardando ? "…" : "Guardar"}
                </button>
              </div>
            )
          )}
        </div>
      </div>

      {/* Banner estado */}
      <div className="mx-4 mt-4 rounded-2xl p-4 flex items-center justify-between gap-3"
        style={{ background: alerta ? "#FFFBEB" : activa ? "#D1FAE5" : "#F3F4F6", border: alerta ? "2px solid #FCD34D" : "none" }}>
        <div className="flex items-center gap-2 min-w-0">
          {alerta && <AlertTriangle size={16} className="text-amber-500 shrink-0" />}
          <div>
            <p className="text-sm font-bold" style={{ color: alerta ? "#92400E" : activa ? "#065F46" : "#374151" }}>
              {alerta
                ? diasSalida === 0 ? "Sale hoy" : diasSalida === 1 ? "Sale mañana" : `Sale en ${diasSalida} días`
                : activa ? "Hospedada actualmente" : "Estancia finalizada"}
            </p>
            <p className="text-xs" style={{ color: activa ? "#10B981" : "#6B7280" }}>
              {diasEstancia !== null ? `${diasEstancia} días de estancia` : ""}
              {familia.habitacion ? ` · Hab. ${familia.habitacion}` : ""}
            </p>
          </div>
        </div>
        {/* Contador de personas */}
        <div className="shrink-0 text-right">
          <p className="text-lg font-bold text-orange-700">{totalPersonas}</p>
          <p className="text-[10px] text-orange-400">personas</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mx-4 mt-4 bg-white rounded-2xl p-1 shadow-sm border border-orange-100">
        {(["info", "estancia", "historial"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${
              tab === t ? "bg-orange-500 text-white" : "text-orange-400"
            }`}>
            {t === "info" ? "Información" : t === "estancia" ? "Estancia" : "Historial"}
          </button>
        ))}
      </div>

      <div className="px-4 mt-4 space-y-4">

        {/* ── TAB: Información ────────────────────────────── */}
        {tab === "info" && (
          <>
            {/* Cuidadores */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100">
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <UserPlus size={16} className="text-orange-500" />
                  <p className="text-sm font-bold text-orange-800">
                    Cuidadores ({1 + (editando ? cuidadores : familia.cuidadores ?? []).length})
                  </p>
                </div>
              </div>

              {/* Cuidador principal */}
              <div className="mb-4">
                <p className="text-[10px] text-orange-400 font-semibold uppercase tracking-wide mb-2">Principal</p>
                {editando ? (
                  <div className="space-y-3">
                    {[
                      { key: "nombreCuidador", label: "Nombre completo", type: "text" },
                      { key: "telefono",       label: "Teléfono",        type: "tel" },
                      { key: "email",          label: "Correo",          type: "email" },
                      { key: "parentesco",     label: "Parentesco",      type: "text" },
                    ].map(({ key, label, type }) => (
                      <div key={key}>
                        <label className="text-xs text-orange-500 font-semibold">{label}</label>
                        <input
                          type={type}
                          className="w-full mt-1 px-3 py-2.5 rounded-xl border border-orange-200 text-sm outline-none focus:border-orange-400"
                          value={(form as any)[key]}
                          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <InfoRow icon={<User size={14} />}  label="Nombre"    value={familia.nombreCuidador} />
                    <InfoRow icon={<Phone size={14} />}  label="Teléfono"  value={familia.telefono} />
                    {familia.email      && <InfoRow icon={<Mail size={14} />}  label="Correo"     value={familia.email} />}
                    {familia.parentesco && <InfoRow icon={<User size={14} />}  label="Parentesco" value={familia.parentesco} />}
                  </div>
                )}
              </div>

              {/* Cuidadores adicionales */}
              {(editando ? cuidadores : familia.cuidadores ?? []).length > 0 && (
                <div className="border-t border-orange-50 pt-3 mt-3 space-y-3">
                  <p className="text-[10px] text-orange-400 font-semibold uppercase tracking-wide">Adicionales</p>
                  {(editando ? cuidadores : familia.cuidadores ?? []).map((c, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-xl bg-orange-50 p-3">
                      <div className="flex-1 space-y-1 min-w-0">
                        <p className="text-sm font-semibold text-orange-800">{c.nombre}</p>
                        <p className="text-xs text-orange-500">{c.telefono}</p>
                        {c.parentesco && <p className="text-xs text-orange-400">{c.parentesco}</p>}
                      </div>
                      {editando && (
                        <button onClick={() => quitarCuidador(i)}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 shrink-0">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Formulario agregar cuidador (solo en modo edición) */}
              {editando && (
                <div className="border-t border-orange-50 pt-3 mt-3">
                  {!agregandoCuidador ? (
                    <button
                      onClick={() => setAgregandoCuidador(true)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-orange-300 text-orange-500 text-sm font-semibold hover:bg-orange-50 transition-colors"
                    >
                      <Plus size={14} /> Agregar cuidador
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-orange-500 font-semibold">Nuevo cuidador</p>
                      {[
                        { key: "nombre",     label: "Nombre *",    type: "text" },
                        { key: "telefono",   label: "Teléfono *",  type: "tel" },
                        { key: "parentesco", label: "Parentesco",  type: "text" },
                        { key: "email",      label: "Correo",      type: "email" },
                      ].map(({ key, label, type }) => (
                        <input
                          key={key}
                          type={type}
                          placeholder={label}
                          value={(formCuidador as any)[key]}
                          onChange={(e) => setFormCuidador({ ...formCuidador, [key]: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-orange-200 text-sm outline-none focus:border-orange-400"
                        />
                      ))}
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={agregarCuidador}
                          disabled={!formCuidador.nombre.trim() || !formCuidador.telefono.trim()}
                          className="flex-1 py-2 rounded-xl bg-orange-500 text-white text-sm font-bold disabled:opacity-50"
                        >
                          Agregar
                        </button>
                        <button
                          onClick={() => { setAgregandoCuidador(false); setFormCuidador({ nombre: "", telefono: "", parentesco: "", email: "" }); }}
                          className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Paciente */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100">
              <div className="flex items-center gap-2 mb-4">
                <Baby size={16} className="text-orange-500" />
                <p className="text-sm font-bold text-orange-800">Paciente</p>
              </div>
              <div className="space-y-3">
                <InfoRow icon={<User size={14} />} label="Nombre" value={familia.nombreNino || "—"} />
                <InfoRow icon={<Baby size={14} />} label="Edad"   value={familia.edadNino ? `${familia.edadNino} años` : "—"} />
              </div>
            </div>

            {/* Hospital */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100">
              <div className="flex items-center gap-2 mb-4">
                <Hospital size={16} className="text-orange-500" />
                <p className="text-sm font-bold text-orange-800">Hospital</p>
              </div>
              {editando ? (
                <div>
                  <label className="text-xs text-orange-500 font-semibold">Hospital</label>
                  <input
                    className="w-full mt-1 px-3 py-2.5 rounded-xl border border-orange-200 text-sm outline-none focus:border-orange-400"
                    value={form.hospital}
                    onChange={(e) => setForm({ ...form, hospital: e.target.value })}
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <InfoRow icon={<Hospital size={14} />} label="Hospital"  value={familia.hospital} />
                  {familia.habitacion && (
                    <InfoRow icon={<BedDouble size={14} />} label="Habitación" value={`Hab. ${familia.habitacion}`} />
                  )}
                </div>
              )}
            </div>

            {familia.qrCode && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100">
                <div className="flex items-center gap-2 mb-2">
                  <QrCode size={16} className="text-orange-500" />
                  <p className="text-sm font-bold text-orange-800">Credencial digital</p>
                </div>
                <p className="text-xs text-orange-400 font-mono break-all">{familia.qrCode}</p>
              </div>
            )}
          </>
        )}

        {/* ── TAB: Estancia ────────────────────────────────── */}
        {tab === "estancia" && (
          <>
            {/* Resumen de fechas */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={16} className="text-orange-500" />
                <p className="text-sm font-bold text-orange-800">Fechas de estancia</p>
              </div>
              <InfoRow icon={<Calendar size={14} />} label="Fecha de ingreso"
                value={fmtFecha(familia.fechaIngreso)} />
              <InfoRow icon={<CalendarCheck size={14} />} label="Salida planificada"
                value={familia.fechaSalidaPlanificada ? fmtFecha(familia.fechaSalidaPlanificada) : "Sin fecha definida"} />
              {diasEstancia !== null && (
                <InfoRow icon={<Clock size={14} />} label="Duración total"
                  value={`${diasEstancia} días`} />
              )}
            </div>

            {/* Editar fecha de salida */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100">
              <div className="flex items-center gap-2 mb-3">
                <CalendarCheck size={16} className="text-orange-500" />
                <p className="text-sm font-bold text-orange-800">Modificar fecha de salida</p>
              </div>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={fechaSalidaEdit}
                  min={format(new Date(), "yyyy-MM-dd")}
                  onChange={(e) => setFechaSalidaEdit(e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-xl border border-orange-200 text-sm outline-none focus:border-orange-400"
                />
                <button
                  onClick={() => guardarFechaSalida(fechaSalidaEdit || null)}
                  disabled={guardando}
                  className="px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold disabled:opacity-50"
                >
                  {guardando ? "…" : "Guardar"}
                </button>
              </div>
              {familia.fechaSalidaPlanificada && (
                <button
                  onClick={() => { guardarFechaSalida(null); setFechaSalidaEdit(""); }}
                  disabled={guardando}
                  className="mt-2 text-xs text-orange-400 underline"
                >
                  Quitar fecha de salida
                </button>
              )}
            </div>

            {/* Extender estancia */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100">
              <div className="flex items-center gap-2 mb-3">
                <CalendarPlus size={16} className="text-orange-500" />
                <p className="text-sm font-bold text-orange-800">Extender estancia</p>
              </div>
              <p className="text-xs text-orange-400 mb-3">
                Agrega días a la fecha de salida {familia.fechaSalidaPlanificada ? "planificada" : "(desde hoy)"}
              </p>
              <div className="flex items-center gap-3 mb-3">
                <button
                  onClick={() => setExtensionDias(Math.max(1, extensionDias - 1))}
                  className="w-10 h-10 rounded-xl border border-orange-200 text-lg font-bold text-orange-600 flex items-center justify-center hover:bg-orange-50"
                >−</button>
                <span className="text-xl font-bold text-orange-800 w-12 text-center">
                  {extensionDias}d
                </span>
                <button
                  onClick={() => setExtensionDias(Math.min(90, extensionDias + 1))}
                  className="w-10 h-10 rounded-xl border border-orange-200 text-lg font-bold text-orange-600 flex items-center justify-center hover:bg-orange-50"
                >+</button>
              </div>
              {familia.fechaSalidaPlanificada && (
                <p className="text-xs text-orange-400 mb-3">
                  Nueva salida: <strong>
                    {format(addDays(familia.fechaSalidaPlanificada.toDate(), extensionDias), "d 'de' MMMM yyyy", { locale: es })}
                  </strong>
                </p>
              )}
              <button
                onClick={extenderEstancia}
                disabled={guardando}
                className="w-full py-3 bg-orange-500 text-white font-bold rounded-2xl text-sm disabled:opacity-50"
              >
                {guardando ? "Actualizando…" : `Extender ${extensionDias} día${extensionDias !== 1 ? "s" : ""}`}
              </button>
            </div>
          </>
        )}

        {/* ── TAB: Historial ───────────────────────────────── */}
        {tab === "historial" && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100">
            <div className="flex items-center gap-2 mb-4">
              <History size={16} className="text-orange-500" />
              <p className="text-sm font-bold text-orange-800">Historial de habitaciones</p>
            </div>
            {historial.length === 0 ? (
              <p className="text-center text-orange-300 text-sm py-6">Sin registros de estancia</p>
            ) : (
              <div className="space-y-3">
                {historial.map((h) => {
                  const inicio = h.fechaIngreso?.toDate ? h.fechaIngreso.toDate() : new Date();
                  const fin = h.fechaSalida
                    ? (h.fechaSalida.toDate ? h.fechaSalida.toDate() : new Date(h.fechaSalida as any))
                    : null;
                  const dias = fin ? differenceInDays(fin, inicio) : null;
                  return (
                    <div key={h.id} className="flex items-start justify-between gap-3 py-3 border-b border-orange-50 last:border-0">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <BedDouble size={13} className="text-orange-400" />
                          <p className="text-sm font-semibold text-orange-800">Hab. {h.habitacionId}</p>
                          {!fin && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded-full">
                              Actual
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-orange-400">
                          {fmtFecha(h.fechaIngreso)} → {fin ? fmtFecha(h.fechaSalida) : "Presente"}
                        </p>
                      </div>
                      {dias !== null && (
                        <span className="text-sm font-bold text-orange-600 shrink-0">{dias}d</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
