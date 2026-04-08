"use client";
// Panel admin: Lista y gestión de familias hospedadas
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Familia } from "@/lib/types";
import { Toast, useToast } from "@/components/ui/Toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Users, Search, Filter, ChevronRight, ArrowLeft,
  BedDouble, Hospital, Heart, UserCheck, UserX,
  Plus,
} from "lucide-react";

const TRATAMIENTO_LABEL: Record<string, string> = {
  oncologia: "Oncología",
  cardiologia: "Cardiología",
  neurologia: "Neurología",
  otro: "Otro",
};

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

export default function FamiliasPage() {
  const router = useRouter();
  const { familia: usuario, cargando: authCargando } = useAuth();
  const { toast, mostrar: showToast, cerrar: cerrarToast } = useToast();

  const [familias, setFamilias] = useState<Familia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroActiva, setFiltroActiva] = useState<"todas" | "activas" | "historial">("activas");
  const [filtroTratamiento, setFiltroTratamiento] = useState<string>("todos");

  // Proteger ruta
  useEffect(() => {
    if (!authCargando && (!usuario || usuario.rol !== "coordinador")) {
      router.replace("/dashboard");
    }
  }, [usuario, authCargando, router]);

  // Suscripción en tiempo real
  useEffect(() => {
    const q = query(
      collection(db, "familias"),
      where("rol", "==", "cuidador"),
      orderBy("fechaIngreso", "desc")
    );

    return onSnapshot(
      q,
      (snap) => {
        setFamilias(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Familia));
        setCargando(false);
      },
      () => setCargando(false)
    );
  }, []);

  // Métricas
  const activas = familias.filter((f) => !f.fechaSalida);
  const historico = familias.filter((f) => !!f.fechaSalida);

  const porTratamiento = familias.reduce<Record<string, number>>((acc, f) => {
    const t = f.tipoTratamiento || "otro";
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  // Filtrado
  const familiasFiltradas = useMemo(() => {
    let lista = familias;

    // Filtro activa/historial
    if (filtroActiva === "activas") lista = lista.filter((f) => !f.fechaSalida);
    else if (filtroActiva === "historial") lista = lista.filter((f) => !!f.fechaSalida);

    // Filtro tratamiento
    if (filtroTratamiento !== "todos") {
      lista = lista.filter((f) => f.tipoTratamiento === filtroTratamiento);
    }

    // Búsqueda
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
  }, [familias, filtroActiva, filtroTratamiento, busqueda]);

  const formatFecha = (ts: any) => {
    if (!ts) return "—";
    try {
      const date = ts.toDate ? ts.toDate() : new Date(ts);
      return format(date, "d MMM yyyy", { locale: es });
    } catch {
      return "—";
    }
  };

  if (authCargando || cargando) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-4 border-orange-400 border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-orange-700 text-sm">Cargando familias…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 pb-24">
      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrarToast} />}

      {/* Encabezado */}
      <div className="bg-white border-b border-orange-100 px-4 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-orange-50">
            <ArrowLeft size={20} className="text-orange-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-orange-900">Familias</h1>
            <p className="text-sm text-orange-500">Gestión de familias hospedadas</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Métricas */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-orange-100">
            <p className="text-2xl font-bold text-orange-600">{familias.length}</p>
            <p className="text-xs text-orange-400 mt-0.5">Total</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-green-100">
            <p className="text-2xl font-bold text-green-600">{activas.length}</p>
            <p className="text-xs text-green-400 mt-0.5">Activas</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
            <p className="text-2xl font-bold text-gray-500">{historico.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">Historial</p>
          </div>
        </div>

        {/* Desglose por tratamiento */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100">
          <p className="text-xs font-semibold text-orange-700 mb-3 uppercase tracking-wide">Por tratamiento</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
            {(["oncologia", "cardiologia", "neurologia", "otro"] as const).map((t) => (
              <div key={t} className="text-center rounded-xl p-2" style={{ background: TRATAMIENTO_COLOR[t] }}>
                <p className="text-lg font-bold" style={{ color: TRATAMIENTO_TEXT[t] }}>
                  {porTratamiento[t] || 0}
                </p>
                <p className="text-[9px] font-medium" style={{ color: TRATAMIENTO_TEXT[t], opacity: 0.8 }}>
                  {TRATAMIENTO_LABEL[t]}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Buscador */}
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

        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(["activas", "todas", "historial"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltroActiva(f)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                filtroActiva === f
                  ? "bg-orange-500 text-white"
                  : "bg-white text-orange-500 border border-orange-200"
              }`}
            >
              {f === "activas" ? "Activas" : f === "todas" ? "Todas" : "Historial"}
            </button>
          ))}
          <div className="w-px h-6 bg-orange-100 self-center" />
          {(["todos", "oncologia", "cardiologia", "neurologia", "otro"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFiltroTratamiento(t)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                filtroTratamiento === t
                  ? "bg-orange-900 text-white"
                  : "bg-white text-orange-700 border border-orange-200"
              }`}
            >
              {t === "todos" ? "Todos" : TRATAMIENTO_LABEL[t]}
            </button>
          ))}
        </div>

        {/* Lista */}
        <div className="space-y-3">
          {familiasFiltradas.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <Users size={32} className="text-orange-200 mx-auto mb-2" />
              <p className="text-orange-400 text-sm">No se encontraron familias</p>
            </div>
          ) : (
            familiasFiltradas.map((familia) => (
              <button
                key={familia.id}
                onClick={() => router.push(`/coordinador/familias/${familia.id}`)}
                className="w-full bg-white rounded-2xl p-4 shadow-sm border border-orange-100 text-left hover:border-orange-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {/* Nombre cuidador */}
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold text-orange-900 truncate">{familia.nombreCuidador}</p>
                      {!familia.fechaSalida ? (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded-full flex-shrink-0">Activa</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-semibold rounded-full flex-shrink-0">Historial</span>
                      )}
                    </div>

                    {/* Niño */}
                    {familia.nombreNino && (
                      <p className="text-sm text-orange-600 mb-2">
                        Niño/a: <span className="font-medium">{familia.nombreNino}</span>
                        {familia.edadNino ? `, ${familia.edadNino} años` : ""}
                      </p>
                    )}

                    {/* Chips de info */}
                    <div className="flex flex-wrap gap-1.5">
                      {familia.tipoTratamiento && (
                        <span
                          className="px-2 py-0.5 text-[10px] font-semibold rounded-full"
                          style={{
                            background: TRATAMIENTO_COLOR[familia.tipoTratamiento],
                            color: TRATAMIENTO_TEXT[familia.tipoTratamiento],
                          }}
                        >
                          {TRATAMIENTO_LABEL[familia.tipoTratamiento]}
                        </span>
                      )}
                      {familia.hospital && (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded-full truncate max-w-[140px]">
                          {familia.hospital}
                        </span>
                      )}
                      {familia.habitacion && (
                        <span className="px-2 py-0.5 bg-orange-50 text-orange-700 text-[10px] font-semibold rounded-full">
                          Hab. {familia.habitacion}
                        </span>
                      )}
                    </div>

                    {/* Fechas */}
                    <p className="text-[11px] text-orange-300 mt-2">
                      Ingreso: {formatFecha(familia.fechaIngreso)}
                      {familia.fechaSalida ? ` · Salida: ${formatFecha(familia.fechaSalida)}` : ""}
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-orange-300 flex-shrink-0 mt-1" />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
