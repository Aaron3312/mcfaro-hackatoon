"use client";
// Panel admin: Lista y gestión de familias hospedadas
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Familia } from "@/lib/types";
import { Toast, useToast } from "@/components/ui/Toast";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import {
  Users, Search, ChevronRight, ArrowLeft,
  Plus, X, AlertTriangle, Bell, UserPlus,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────
function esActiva(f: Familia): boolean {
  if (!f.fechaSalidaPlanificada) return true;
  return f.fechaSalidaPlanificada.toDate() >= new Date();
}

function diasParaSalida(f: Familia): number | null {
  if (!f.fechaSalidaPlanificada) return null;
  return differenceInDays(f.fechaSalidaPlanificada.toDate(), new Date());
}

// Personas totales en una familia: 1 paciente + 1 cuidador principal + adicionales
function personasDeFamilia(f: Familia): number {
  return 1 + 1 + (f.cuidadores?.length ?? 0);
}

// ── Formulario nueva familia ──────────────────────────────────────────────────
function FormNuevaFamilia({
  casaRonald,
  onGuardar,
  onCerrar,
}: {
  casaRonald: string;
  onGuardar: () => void;
  onCerrar: () => void;
}) {
  const [form, setForm] = useState({
    nombreCuidador: "",
    telefono: "",
    parentesco: "",
    nombreNino: "",
    edadNino: "",
    hospital: "",
    habitacion: "",
    fechaIngreso: format(new Date(), "yyyy-MM-dd"),
    fechaSalidaPlanificada: "",
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const valido = form.nombreCuidador.trim() && form.telefono.trim() &&
    form.nombreNino.trim() && form.hospital.trim();

  const handleSubmit = async () => {
    if (!valido) return;
    setGuardando(true);
    setError("");
    try {
      const res = await fetch("/api/familias/registrar-coordinador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          edadNino: form.edadNino ? parseInt(form.edadNino) : undefined,
          casaRonald,
          fechaSalidaPlanificada: form.fechaSalidaPlanificada || undefined,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Error al registrar");
      onGuardar();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setGuardando(false);
    }
  };

  const campo = (label: string, node: React.ReactNode) => (
    <div>
      <label className="text-xs font-bold text-orange-500 uppercase tracking-wide">{label}</label>
      <div className="mt-1">{node}</div>
    </div>
  );

  const input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      {...props}
      className="w-full px-3 py-2.5 rounded-xl border border-orange-200 text-sm text-orange-900 outline-none focus:border-orange-400"
    />
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-orange-100 shrink-0">
          <h3 className="font-bold text-orange-900 text-lg">Nueva familia</h3>
          <button onClick={onCerrar} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          <p className="text-[11px] font-bold text-orange-400 uppercase tracking-wide">Cuidador principal</p>
          {campo("Nombre completo *", input({
            placeholder: "Nombre y apellidos",
            value: form.nombreCuidador,
            onChange: (e) => setForm({ ...form, nombreCuidador: e.target.value }),
          }))}
          {campo("Teléfono *", input({
            placeholder: "+52 55 0000 0000",
            type: "tel",
            value: form.telefono,
            onChange: (e) => setForm({ ...form, telefono: e.target.value }),
          }))}
          {campo("Parentesco con el niño", input({
            placeholder: "Mamá, Papá, Abuela…",
            value: form.parentesco,
            onChange: (e) => setForm({ ...form, parentesco: e.target.value }),
          }))}

          <p className="text-[11px] font-bold text-orange-400 uppercase tracking-wide pt-2">Paciente</p>
          {campo("Nombre del niño/a *", input({
            placeholder: "Nombre del paciente",
            value: form.nombreNino,
            onChange: (e) => setForm({ ...form, nombreNino: e.target.value }),
          }))}
          {campo("Edad", input({
            placeholder: "Años",
            type: "number",
            min: 0,
            max: 18,
            value: form.edadNino,
            onChange: (e) => setForm({ ...form, edadNino: e.target.value }),
          }))}

          <p className="text-[11px] font-bold text-orange-400 uppercase tracking-wide pt-2">Estancia</p>
          {campo("Hospital *", input({
            placeholder: "Nombre del hospital",
            value: form.hospital,
            onChange: (e) => setForm({ ...form, hospital: e.target.value }),
          }))}
          {campo("Habitación (opcional)", input({
            placeholder: "Ej: 102",
            value: form.habitacion,
            onChange: (e) => setForm({ ...form, habitacion: e.target.value }),
          }))}

          <div className="grid grid-cols-2 gap-3">
            {campo("Fecha de ingreso", input({
              type: "date",
              value: form.fechaIngreso,
              onChange: (e) => setForm({ ...form, fechaIngreso: e.target.value }),
            }))}
            {campo("Salida planificada", input({
              type: "date",
              value: form.fechaSalidaPlanificada,
              min: form.fechaIngreso,
              onChange: (e) => setForm({ ...form, fechaSalidaPlanificada: e.target.value }),
            }))}
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={!valido || guardando}
            className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl text-sm disabled:opacity-50 transition-opacity"
          >
            {guardando ? "Registrando…" : "Registrar familia"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function FamiliasPage() {
  const router = useRouter();
  const { familia: usuario, cargando: authCargando } = useAuth();
  const { toast, mostrar: showToast, cerrar: cerrarToast } = useToast();

  const [familias, setFamilias] = useState<Familia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroActiva, setFiltroActiva] = useState<"activas" | "todas" | "historial">("activas");
  const [mostrarForm, setMostrarForm] = useState(false);

  useEffect(() => {
    if (!authCargando && (!usuario || usuario.rol !== "coordinador")) {
      router.replace("/dashboard");
    }
  }, [usuario, authCargando, router]);

  // Sin orderBy para evitar error de índice compuesto — ordenar en cliente
  useEffect(() => {
    const q = query(collection(db, "familias"), where("rol", "==", "cuidador"));
    return onSnapshot(q, (snap) => {
      const docs = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as Familia)
        .sort((a, b) => {
          const ta = a.fechaIngreso?.toMillis?.() ?? 0;
          const tb = b.fechaIngreso?.toMillis?.() ?? 0;
          return tb - ta;
        });
      setFamilias(docs);
      setCargando(false);
    }, () => setCargando(false));
  }, []);

  // Familias próximas a salir (≤ 2 días)
  const alertas = useMemo(
    () => familias.filter((f) => {
      const dias = diasParaSalida(f);
      return dias !== null && dias >= 0 && dias <= 2;
    }),
    [familias]
  );

  const activas   = useMemo(() => familias.filter(esActiva),       [familias]);
  const historial = useMemo(() => familias.filter((f) => !esActiva(f)), [familias]);

  const familiasFiltradas = useMemo(() => {
    let lista = familias;
    if (filtroActiva === "activas")   lista = activas;
    if (filtroActiva === "historial") lista = historial;
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      lista = lista.filter(
        (f) =>
          f.nombreCuidador?.toLowerCase().includes(q) ||
          f.nombreNino?.toLowerCase().includes(q) ||
          f.hospital?.toLowerCase().includes(q) ||
          f.habitacion?.toLowerCase().includes(q)
      );
    }
    return lista;
  }, [familias, activas, historial, filtroActiva, busqueda]);

  const formatFecha = (ts: any) => {
    if (!ts) return "—";
    try { return format(ts.toDate ? ts.toDate() : new Date(ts), "d MMM yyyy", { locale: es }); }
    catch { return "—"; }
  };

  // Total de personas hospedadas (pacientes + cuidadores)
  const totalPersonas = useMemo(
    () => activas.reduce((sum, f) => sum + personasDeFamilia(f), 0),
    [activas]
  );

  if (authCargando || cargando) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-orange-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 pb-24">
      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrarToast} />}

      {/* Encabezado */}
      <div className="bg-white border-b border-orange-100 px-4 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-orange-50">
            <ArrowLeft size={20} className="text-orange-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-orange-900">Familias</h1>
            <p className="text-sm text-orange-500">
              {activas.length} activas · {historial.length} en historial
            </p>
          </div>
          <button
            onClick={() => setMostrarForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 text-white rounded-xl text-sm font-bold"
          >
            <Plus size={16} /> Nueva
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">

        {/* ── Alerta familias por salir ──────────────────── */}
        {alertas.length > 0 && (
          <div className="rounded-2xl p-4 border-2 border-amber-300" style={{ background: "#FFFBEB" }}>
            <div className="flex items-center gap-2 mb-3">
              <Bell size={16} className="text-amber-600" />
              <p className="text-sm font-bold text-amber-800">
                {alertas.length} familia{alertas.length !== 1 ? "s" : ""} con salida en ≤ 2 días
              </p>
            </div>
            <div className="space-y-2">
              {alertas.map((f) => {
                const dias = diasParaSalida(f)!;
                return (
                  <button
                    key={f.id}
                    onClick={() => router.push(`/coordinador/familias/${f.id}`)}
                    className="w-full flex items-center justify-between gap-3 bg-white rounded-xl px-3 py-2.5 border border-amber-200 hover:border-amber-400 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                      <span className="text-sm font-semibold text-amber-900 truncate">
                        {f.nombreCuidador}
                      </span>
                    </div>
                    <span className="text-xs font-bold shrink-0" style={{ color: dias === 0 ? "#991B1B" : "#92400E" }}>
                      {dias === 0 ? "Hoy" : dias === 1 ? "Mañana" : `${dias} días`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Métricas ───────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-orange-100">
            <p className="text-2xl font-bold text-orange-600">{familias.length}</p>
            <p className="text-xs text-orange-400 mt-0.5">Familias</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-green-100">
            <p className="text-2xl font-bold text-green-600">{activas.length}</p>
            <p className="text-xs text-green-400 mt-0.5">Activas</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-blue-100">
            <p className="text-2xl font-bold text-blue-600">{totalPersonas}</p>
            <p className="text-xs text-blue-400 mt-0.5">Personas</p>
          </div>
        </div>

        {/* ── Buscador ───────────────────────────────────── */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-300" />
          <input
            type="text"
            placeholder="Buscar por nombre, hospital o habitación…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-3 bg-white rounded-2xl border border-orange-100 text-sm text-orange-900 placeholder-orange-300 outline-none focus:border-orange-400"
          />
        </div>

        {/* ── Filtros ─────────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(["activas", "todas", "historial"] as const).map((f) => (
            <button key={f} onClick={() => setFiltroActiva(f)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                filtroActiva === f ? "bg-orange-500 text-white" : "bg-white text-orange-500 border border-orange-200"
              }`}>
              {f === "activas" ? "Activas" : f === "todas" ? "Todas" : "Historial"}
            </button>
          ))}
        </div>

        {/* ── Lista ───────────────────────────────────────── */}
        <div className="space-y-3">
          {familiasFiltradas.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <Users size={32} className="text-orange-200 mx-auto mb-2" />
              <p className="text-orange-400 text-sm">No se encontraron familias</p>
              <button onClick={() => setMostrarForm(true)}
                className="mt-4 flex items-center gap-2 mx-auto px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-bold">
                <Plus size={14} /> Registrar familia
              </button>
            </div>
          ) : (
            familiasFiltradas.map((f) => {
              const activa = esActiva(f);
              const dias = diasParaSalida(f);
              const alerta = dias !== null && dias >= 0 && dias <= 2;
              const totalCuidadores = 1 + (f.cuidadores?.length ?? 0);
              const personas = personasDeFamilia(f);

              return (
                <button
                  key={f.id}
                  onClick={() => router.push(`/coordinador/familias/${f.id}`)}
                  className="w-full bg-white rounded-2xl p-4 shadow-sm border text-left hover:border-orange-300 transition-colors"
                  style={{ borderColor: alerta ? "#FCD34D" : "#FED7AA" }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <p className="font-bold text-orange-900 truncate">{f.nombreCuidador}</p>
                        {activa ? (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded-full shrink-0">
                            Activa
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-semibold rounded-full shrink-0">
                            Historial
                          </span>
                        )}
                        {alerta && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full flex items-center gap-1 shrink-0">
                            <AlertTriangle size={9} />
                            {dias === 0 ? "Sale hoy" : dias === 1 ? "Sale mañana" : `${dias} días`}
                          </span>
                        )}
                      </div>

                      {f.nombreNino && (
                        <p className="text-sm text-orange-600 mb-2">
                          {f.nombreNino}{f.edadNino ? `, ${f.edadNino} años` : ""}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-1.5">
                        {/* Personas en la familia */}
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded-full flex items-center gap-1">
                          <UserPlus size={9} />
                          {personas} persona{personas !== 1 ? "s" : ""}
                          {totalCuidadores > 1 && ` · ${totalCuidadores} cuidadores`}
                        </span>
                        {f.hospital && (
                          <span className="px-2 py-0.5 bg-orange-50 text-orange-700 text-[10px] font-semibold rounded-full truncate max-w-[140px]">
                            {f.hospital}
                          </span>
                        )}
                        {f.habitacion && (
                          <span className="px-2 py-0.5 bg-orange-50 text-orange-700 text-[10px] font-semibold rounded-full">
                            Hab. {f.habitacion}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-orange-300 mt-2">
                        Ingreso: {formatFecha(f.fechaIngreso)}
                        {f.fechaSalidaPlanificada
                          ? ` · Salida: ${formatFecha(f.fechaSalidaPlanificada)}`
                          : ""}
                      </p>
                    </div>
                    <ChevronRight size={18} className="text-orange-300 shrink-0 mt-1" />
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {mostrarForm && (
        <FormNuevaFamilia
          casaRonald={usuario?.casaRonald ?? ""}
          onGuardar={() => { setMostrarForm(false); showToast("Familia registrada"); }}
          onCerrar={() => setMostrarForm(false)}
        />
      )}
    </div>
  );
}
