"use client";
// Ficha completa de familia — info, edición, historial de estancias
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { doc, onSnapshot, collection, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Familia, HistorialHabitacion, Cita } from "@/lib/types";
import { Toast, useToast } from "@/components/ui/Toast";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowLeft, User, Baby, Hospital, BedDouble,
  Phone, Mail, Calendar, Clock, Edit3, Save, X,
  QrCode, Heart, History,
} from "lucide-react";

const TRATAMIENTO_OPTIONS = [
  { value: "oncologia",   label: "Oncología" },
  { value: "cardiologia", label: "Cardiología" },
  { value: "neurologia",  label: "Neurología" },
  { value: "otro",        label: "Otro" },
];

const TRATAMIENTO_COLOR: Record<string, string> = {
  oncologia: "#FEE2E2",
  cardiologia: "#FEF3C7",
  neurologia: "#EDE9FE",
  otro: "#F3F4F6",
};

const TRATAMIENTO_TEXT: Record<string, string> = {
  oncologia: "#991B1B",
  cardiologia: "#92400E",
  neurologia: "#5B21B6",
  otro: "#374151",
};

interface EditForm {
  nombreCuidador: string;
  telefono: string;
  email: string;
  parentesco: string;
  hospital: string;
  tipoTratamiento: string;
  diagnostico: string;
}

export default function FamiliaDetallePage({
  params,
}: {
  params: Promise<{ familiaId: string }>;
}) {
  const { familiaId } = use(params);
  const router = useRouter();
  const { familia: usuario, cargando: authCargando } = useAuth();
  const { toast, mostrar: showToast, cerrar: cerrarToast } = useToast();

  const [familia, setFamilia] = useState<Familia | null>(null);
  const [historial, setHistorial] = useState<HistorialHabitacion[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [tab, setTab] = useState<"info" | "historial" | "citas">("info");
  const [form, setForm] = useState<EditForm>({
    nombreCuidador: "",
    telefono: "",
    email: "",
    parentesco: "",
    hospital: "",
    tipoTratamiento: "otro",
    diagnostico: "",
  });

  // Proteger ruta
  useEffect(() => {
    if (!authCargando && (!usuario || usuario.rol !== "coordinador")) {
      router.replace("/dashboard");
    }
  }, [usuario, authCargando, router]);

  // Suscribir a datos de familia
  useEffect(() => {
    const ref = doc(db, "familias", familiaId);
    return onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() } as Familia;
        setFamilia(data);
        setForm({
          nombreCuidador: data.nombreCuidador || "",
          telefono: data.telefono || "",
          email: data.email || "",
          parentesco: data.parentesco || "",
          hospital: data.hospital || "",
          tipoTratamiento: data.tipoTratamiento || "otro",
          diagnostico: data.diagnostico || "",
        });
      }
      setCargando(false);
    });
  }, [familiaId]);

  // Historial de habitaciones
  useEffect(() => {
    const q = query(
      collection(db, "historialHabitaciones"),
      where("familiaId", "==", familiaId),
      orderBy("fechaIngreso", "desc")
    );
    return onSnapshot(q, (snap) =>
      setHistorial(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as HistorialHabitacion))
    );
  }, [familiaId]);

  // Próximas citas
  useEffect(() => {
    const q = query(
      collection(db, "citas"),
      where("familiaId", "==", familiaId),
      orderBy("fecha", "desc")
    );
    return onSnapshot(q, (snap) =>
      setCitas(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Cita))
    );
  }, [familiaId]);

  const formatFecha = (ts: any) => {
    if (!ts) return "—";
    try {
      const date = ts.toDate ? ts.toDate() : new Date(ts);
      return format(date, "d MMM yyyy", { locale: es });
    } catch {
      return "—";
    }
  };

  const formatFechaHora = (ts: any) => {
    if (!ts) return "—";
    try {
      const date = ts.toDate ? ts.toDate() : new Date(ts);
      return format(date, "d MMM yyyy, HH:mm", { locale: es });
    } catch {
      return "—";
    }
  };

  const diasEstancia = (familia: Familia) => {
    if (!familia.fechaIngreso) return null;
    const inicio = familia.fechaIngreso.toDate ? familia.fechaIngreso.toDate() : new Date(familia.fechaIngreso as any);
    const fin = familia.fechaSalida
      ? (familia.fechaSalida.toDate ? familia.fechaSalida.toDate() : new Date(familia.fechaSalida as any))
      : new Date();
    return differenceInDays(fin, inicio);
  };

  const guardarCambios = async () => {
    setGuardando(true);
    try {
      const res = await fetch("/api/familias/actualizar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ familiaId, ...form }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Error al guardar");
      }
      showToast("Cambios guardados", "exito");
      setEditando(false);
    } catch (e: any) {
      showToast(e.message || "Error al guardar", "error");
    } finally {
      setGuardando(false);
    }
  };

  if (authCargando || cargando) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-4 border-orange-400 border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-orange-700 text-sm">Cargando ficha…</p>
        </div>
      </div>
    );
  }

  if (!familia) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-orange-700 font-semibold">Familia no encontrada</p>
          <button onClick={() => router.back()} className="mt-4 text-orange-500 text-sm underline">
            Volver
          </button>
        </div>
      </div>
    );
  }

  const dias = diasEstancia(familia);

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
            <p className="text-sm text-orange-500">Ficha de familia</p>
          </div>
          {!editando ? (
            <button
              onClick={() => setEditando(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-orange-100 text-orange-700 rounded-xl text-sm font-semibold"
            >
              <Edit3 size={14} />
              Editar
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => { setEditando(false); }}
                className="p-2 rounded-xl bg-gray-100 text-gray-600"
              >
                <X size={16} />
              </button>
              <button
                onClick={guardarCambios}
                disabled={guardando}
                className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 text-white rounded-xl text-sm font-semibold disabled:opacity-60"
              >
                <Save size={14} />
                {guardando ? "…" : "Guardar"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Banner de estado */}
      <div
        className="mx-4 mt-4 rounded-2xl p-4 flex items-center justify-between"
        style={{ background: familia.fechaSalida ? "#F3F4F6" : "#D1FAE5" }}
      >
        <div>
          <p className="text-sm font-bold" style={{ color: familia.fechaSalida ? "#374151" : "#065F46" }}>
            {familia.fechaSalida ? "Estancia finalizada" : "Hospedada actualmente"}
          </p>
          <p className="text-xs mt-0.5" style={{ color: familia.fechaSalida ? "#6B7280" : "#10B981" }}>
            {dias !== null ? `${dias} días de estancia` : ""}
            {familia.habitacion ? ` · Hab. ${familia.habitacion}` : ""}
          </p>
        </div>
        {familia.tipoTratamiento && (
          <span
            className="px-3 py-1 rounded-full text-xs font-bold"
            style={{
              background: TRATAMIENTO_COLOR[familia.tipoTratamiento],
              color: TRATAMIENTO_TEXT[familia.tipoTratamiento],
            }}
          >
            {TRATAMIENTO_OPTIONS.find((o) => o.value === familia.tipoTratamiento)?.label}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mx-4 mt-4 bg-white rounded-2xl p-1 shadow-sm border border-orange-100">
        {(["info", "historial", "citas"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${
              tab === t ? "bg-orange-500 text-white" : "text-orange-400"
            }`}
          >
            {t === "info" ? "Información" : t === "historial" ? "Historial" : "Citas"}
          </button>
        ))}
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* ─── TAB: Información ─── */}
        {tab === "info" && (
          <>
            {/* Datos del cuidador */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100">
              <div className="flex items-center gap-2 mb-4">
                <User size={16} className="text-orange-500" />
                <p className="text-sm font-bold text-orange-800">Cuidador / Familiar</p>
              </div>

              {editando ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-orange-500 font-semibold">Nombre completo</label>
                    <input
                      className="w-full mt-1 px-3 py-2.5 rounded-xl border border-orange-200 text-sm text-orange-900 outline-none focus:border-orange-400"
                      value={form.nombreCuidador}
                      onChange={(e) => setForm({ ...form, nombreCuidador: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-orange-500 font-semibold">Teléfono</label>
                    <input
                      className="w-full mt-1 px-3 py-2.5 rounded-xl border border-orange-200 text-sm text-orange-900 outline-none focus:border-orange-400"
                      value={form.telefono}
                      onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                      type="tel"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-orange-500 font-semibold">Correo electrónico</label>
                    <input
                      className="w-full mt-1 px-3 py-2.5 rounded-xl border border-orange-200 text-sm text-orange-900 outline-none focus:border-orange-400"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      type="email"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-orange-500 font-semibold">Parentesco</label>
                    <input
                      className="w-full mt-1 px-3 py-2.5 rounded-xl border border-orange-200 text-sm text-orange-900 outline-none focus:border-orange-400"
                      value={form.parentesco}
                      onChange={(e) => setForm({ ...form, parentesco: e.target.value })}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <InfoRow icon={<User size={14} />} label="Nombre" value={familia.nombreCuidador} />
                  <InfoRow icon={<Phone size={14} />} label="Teléfono" value={familia.telefono} />
                  {familia.email && <InfoRow icon={<Mail size={14} />} label="Correo" value={familia.email} />}
                  {familia.parentesco && <InfoRow icon={<Heart size={14} />} label="Parentesco" value={familia.parentesco} />}
                </div>
              )}
            </div>

            {/* Datos del niño */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100">
              <div className="flex items-center gap-2 mb-4">
                <Baby size={16} className="text-orange-500" />
                <p className="text-sm font-bold text-orange-800">Paciente</p>
              </div>
              <div className="space-y-3">
                <InfoRow icon={<User size={14} />} label="Nombre" value={familia.nombreNino || "—"} />
                <InfoRow icon={<Baby size={14} />} label="Edad" value={familia.edadNino ? `${familia.edadNino} años` : "—"} />
                {editando ? (
                  <div>
                    <label className="text-xs text-orange-500 font-semibold">Diagnóstico / Tratamiento</label>
                    <input
                      className="w-full mt-1 px-3 py-2.5 rounded-xl border border-orange-200 text-sm text-orange-900 outline-none focus:border-orange-400"
                      value={form.diagnostico}
                      onChange={(e) => setForm({ ...form, diagnostico: e.target.value })}
                    />
                  </div>
                ) : (
                  familia.diagnostico && <InfoRow icon={<Heart size={14} />} label="Diagnóstico" value={familia.diagnostico} />
                )}
              </div>
            </div>

            {/* Hospital y tratamiento */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100">
              <div className="flex items-center gap-2 mb-4">
                <Hospital size={16} className="text-orange-500" />
                <p className="text-sm font-bold text-orange-800">Hospital y tratamiento</p>
              </div>
              {editando ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-orange-500 font-semibold">Hospital</label>
                    <input
                      className="w-full mt-1 px-3 py-2.5 rounded-xl border border-orange-200 text-sm text-orange-900 outline-none focus:border-orange-400"
                      value={form.hospital}
                      onChange={(e) => setForm({ ...form, hospital: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-orange-500 font-semibold">Tipo de tratamiento</label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {TRATAMIENTO_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setForm({ ...form, tipoTratamiento: opt.value })}
                          className={`py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                            form.tipoTratamiento === opt.value
                              ? "bg-orange-500 text-white border-orange-500"
                              : "bg-white text-orange-700 border-orange-200"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <InfoRow icon={<Hospital size={14} />} label="Hospital" value={familia.hospital} />
                  {familia.habitacion && (
                    <InfoRow icon={<BedDouble size={14} />} label="Habitación" value={`Hab. ${familia.habitacion}`} />
                  )}
                  <InfoRow icon={<Calendar size={14} />} label="Fecha ingreso" value={formatFecha(familia.fechaIngreso)} />
                  {familia.fechaSalida && (
                    <InfoRow icon={<Calendar size={14} />} label="Fecha salida" value={formatFecha(familia.fechaSalida)} />
                  )}
                </div>
              )}
            </div>

            {/* QR Code */}
            {familia.qrCode && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100">
                <div className="flex items-center gap-2 mb-3">
                  <QrCode size={16} className="text-orange-500" />
                  <p className="text-sm font-bold text-orange-800">Credencial digital</p>
                </div>
                <p className="text-xs text-orange-400 font-mono break-all">{familia.qrCode}</p>
              </div>
            )}
          </>
        )}

        {/* ─── TAB: Historial de habitaciones ─── */}
        {tab === "historial" && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100">
            <div className="flex items-center gap-2 mb-4">
              <History size={16} className="text-orange-500" />
              <p className="text-sm font-bold text-orange-800">Historial de estancias</p>
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
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded-full">Actual</span>
                          )}
                        </div>
                        <p className="text-xs text-orange-400">
                          {formatFecha(h.fechaIngreso)} → {fin ? formatFecha(h.fechaSalida) : "Presente"}
                        </p>
                      </div>
                      {dias !== null && (
                        <span className="text-sm font-bold text-orange-600 flex-shrink-0">{dias}d</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB: Citas ─── */}
        {tab === "citas" && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={16} className="text-orange-500" />
              <p className="text-sm font-bold text-orange-800">Historial de citas</p>
            </div>
            {citas.length === 0 ? (
              <p className="text-center text-orange-300 text-sm py-6">Sin citas registradas</p>
            ) : (
              <div className="space-y-3">
                {citas.map((c) => (
                  <div key={c.id} className="flex items-start justify-between gap-3 py-3 border-b border-orange-50 last:border-0">
                    <div>
                      <p className="text-sm font-semibold text-orange-800">{c.titulo}</p>
                      <p className="text-xs text-orange-400 mt-0.5">
                        {formatFechaHora(c.fecha)}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[10px] font-semibold rounded-full capitalize flex-shrink-0">
                      {c.servicio}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Componente auxiliar de fila de info ──────────────────────────────────────
function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-orange-300 mt-0.5 flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] text-orange-400 font-semibold uppercase tracking-wide">{label}</p>
        <p className="text-sm text-orange-800 font-medium">{value}</p>
      </div>
    </div>
  );
}
