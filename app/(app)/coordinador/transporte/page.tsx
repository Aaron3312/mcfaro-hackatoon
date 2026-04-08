"use client";
// Panel de transporte para coordinadores — gestión de solicitudes y unidades
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { SolicitudTransporte, Unidad, EstadoSolicitud } from "@/lib/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Car, Clock, Users, Plus, X, CheckCircle, Truck } from "lucide-react";

// ── Colores por estado ────────────────────────────────────────────────────────
const COLORES_ESTADO: Record<EstadoSolicitud, { bg: string; text: string; label: string }> = {
  pendiente:  { bg: "#FEF3C7", text: "#92400E", label: "Pendiente" },
  asignada:   { bg: "#DBEAFE", text: "#1E40AF", label: "Asignada" },
  en_camino:  { bg: "#D1FAE5", text: "#065F46", label: "En camino" },
  completada: { bg: "#F3F4F6", text: "#374151", label: "Completada" },
  cancelada:  { bg: "#FEE2E2", text: "#991B1B", label: "Cancelada" },
};

// ── Modal asignar unidad ──────────────────────────────────────────────────────
function ModalAsignar({
  solicitud,
  unidades,
  onClose,
  onAsignar,
}: {
  solicitud: SolicitudTransporte;
  unidades: Unidad[];
  onClose: () => void;
  onAsignar: (unidadId: string, placas: string, chofer: string) => Promise<void>;
}) {
  const [unidadSeleccionada, setUnidadSeleccionada] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const unidadesDisponibles = unidades.filter((u) => u.estado === "disponible");
  const unidad = unidades.find((u) => u.id === unidadSeleccionada);

  const handleAsignar = async () => {
    if (!unidad) { setError("Selecciona una unidad"); return; }
    if (!unidad.nombreChofer) { setError("La unidad no tiene chofer asignado"); return; }
    setGuardando(true);
    try {
      await onAsignar(unidad.id, unidad.placas, unidad.nombreChofer);
      onClose();
    } catch {
      setError("Error al asignar. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">Asignar unidad</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="mb-4 p-3 rounded-xl bg-gray-50 text-sm">
          <p className="font-medium text-gray-700">{solicitud.nombreCuidador}</p>
          <p className="text-gray-500 text-xs mt-0.5">
            {solicitud.origen} → {solicitud.destino}
          </p>
          <p className="text-gray-500 text-xs">
            {format(solicitud.fechaHora.toDate(), "d MMM yyyy HH:mm", { locale: es })} ·{" "}
            {solicitud.pasajeros} pasajero{solicitud.pasajeros > 1 ? "s" : ""}
          </p>
        </div>

        {unidadesDisponibles.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No hay unidades disponibles</p>
        ) : (
          <div className="space-y-2 mb-4">
            {unidadesDisponibles.map((u) => (
              <button
                key={u.id}
                onClick={() => setUnidadSeleccionada(u.id)}
                className={`w-full text-left p-3 rounded-xl border-2 transition-colors ${
                  unidadSeleccionada === u.id
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm text-gray-800">{u.placas} — {u.modelo}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Chofer: {u.nombreChofer ?? "Sin asignar"} · Capacidad: {u.capacidad}
                    </p>
                  </div>
                  {u.capacidad >= solicitud.pasajeros
                    ? <CheckCircle size={16} className="text-green-500 shrink-0" />
                    : <span className="text-xs text-red-500">Capacidad insuficiente</span>
                  }
                </div>
              </button>
            ))}
          </div>
        )}

        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

        <button
          onClick={handleAsignar}
          disabled={guardando || !unidadSeleccionada}
          className="w-full py-3 rounded-xl font-semibold text-white text-sm disabled:opacity-50"
          style={{ background: "#C85A2A" }}
        >
          {guardando ? "Asignando…" : "Confirmar asignación"}
        </button>
      </div>
    </div>
  );
}

// ── Modal nueva unidad ────────────────────────────────────────────────────────
function ModalNuevaUnidad({
  onClose,
  onGuardar,
}: {
  onClose: () => void;
  onGuardar: (datos: Omit<Unidad, "id">) => Promise<void>;
}) {
  const [placas, setPlacas] = useState("");
  const [modelo, setModelo] = useState("");
  const [capacidad, setCapacidad] = useState(4);
  const [chofer, setChofer] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const handleGuardar = async () => {
    if (!placas.trim() || !modelo.trim()) { setError("Completa placas y modelo"); return; }
    setGuardando(true);
    try {
      await onGuardar({ placas: placas.trim(), modelo: modelo.trim(), capacidad, estado: "disponible", nombreChofer: chofer.trim() || undefined });
      onClose();
    } catch {
      setError("Error al guardar. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">Nueva unidad</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Placas</label>
            <input
              value={placas}
              onChange={(e) => setPlacas(e.target.value)}
              placeholder="ABC-123"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Modelo</label>
            <input
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
              placeholder="Toyota Hiace 2022"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Capacidad (pasajeros)</label>
            <input
              type="number"
              min={1}
              max={20}
              value={capacidad}
              onChange={(e) => setCapacidad(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Chofer (opcional)</label>
            <input
              value={chofer}
              onChange={(e) => setChofer(e.target.value)}
              placeholder="Nombre del chofer"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>
        </div>

        {error && <p className="text-xs text-red-500 mt-3">{error}</p>}

        <button
          onClick={handleGuardar}
          disabled={guardando}
          className="w-full mt-4 py-3 rounded-xl font-semibold text-white text-sm disabled:opacity-50"
          style={{ background: "#C85A2A" }}
        >
          {guardando ? "Guardando…" : "Agregar unidad"}
        </button>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function TransportePage() {
  const router = useRouter();
  const { familia, cargando } = useAuth();

  const [solicitudes, setSolicitudes] = useState<SolicitudTransporte[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<EstadoSolicitud | "todas">("todas");
  const [cargandoDatos, setCargandoDatos] = useState(true);

  const [solicitudAsignar, setSolicitudAsignar] = useState<SolicitudTransporte | null>(null);
  const [mostrarNuevaUnidad, setMostrarNuevaUnidad] = useState(false);
  const [actualizando, setActualizando] = useState<string | null>(null);

  // Redirigir si no es coordinador
  useEffect(() => {
    if (!cargando && familia && familia.rol !== "coordinador") {
      router.replace("/dashboard");
    }
  }, [familia, cargando, router]);

  // Suscripción en tiempo real a solicitudes
  useEffect(() => {
    if (!familia || familia.rol !== "coordinador") return;

    const qSolicitudes = query(
      collection(db, "solicitudesTransporte"),
      orderBy("fechaHora", "asc")
    );
    const unsubSolicitudes = onSnapshot(qSolicitudes, (snap) => {
      setSolicitudes(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SolicitudTransporte));
      setCargandoDatos(false);
    });

    const unsubUnidades = onSnapshot(collection(db, "unidades"), (snap) => {
      setUnidades(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Unidad));
    });

    return () => { unsubSolicitudes(); unsubUnidades(); };
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
  const solicitudesFiltradas = filtroEstado === "todas"
    ? solicitudes
    : solicitudes.filter((s) => s.estado === filtroEstado);

  // Contadores para el dashboard
  const pendientes = solicitudes.filter((s) => s.estado === "pendiente").length;
  const enCamino  = solicitudes.filter((s) => s.estado === "en_camino").length;
  const disponibles = unidades.filter((u) => u.estado === "disponible").length;

  // Cambiar estado de solicitud
  const cambiarEstado = async (id: string, estado: EstadoSolicitud) => {
    setActualizando(id);
    try {
      await fetch(`/api/transporte/${id}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
      });
    } finally {
      setActualizando(null);
    }
  };

  // Asignar unidad via API
  const asignarUnidad = async (solicitudId: string, unidadId: string, placas: string, chofer: string) => {
    const res = await fetch(`/api/transporte/${solicitudId}/asignar`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unidadId, placasUnidad: placas, nombreChofer: chofer }),
    });
    if (!res.ok) throw new Error("Error al asignar");
    // Marcar unidad como en servicio
    const unidadRef = doc(db, "unidades", unidadId);
    await updateDoc(unidadRef, { estado: "en_servicio" });
  };

  // Agregar nueva unidad a Firestore
  const agregarUnidad = async (datos: Omit<Unidad, "id">) => {
    await addDoc(collection(db, "unidades"), datos);
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
        <div className="max-w-5xl mx-auto px-5 py-8 md:px-10 md:py-10">
          <button
            onClick={() => router.back()}
            className="text-white/70 text-sm mb-3 flex items-center gap-1 hover:text-white transition-colors"
          >
            ← Panel coordinador
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <Car size={26} /> Gestión de transporte
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-6 pb-10 md:px-10">

        {/* ── Stats rápidos ──────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: "#92400E" }}>{pendientes}</p>
            <p className="text-xs text-gray-500 mt-0.5">Pendientes</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-green-700">{enCamino}</p>
            <p className="text-xs text-gray-500 mt-0.5">En camino</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-blue-700">{disponibles}</p>
            <p className="text-xs text-gray-500 mt-0.5">Unidades libres</p>
          </div>
        </div>

        {/* ── Filtros ────────────────────────────────────── */}
        <div className="flex gap-2 flex-wrap mb-5">
          {(["todas", "pendiente", "asignada", "en_camino", "completada", "cancelada"] as const).map((e) => (
            <button
              key={e}
              onClick={() => setFiltroEstado(e)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filtroEstado === e
                  ? "text-white"
                  : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300"
              }`}
              style={filtroEstado === e ? { background: "#C85A2A" } : {}}
            >
              {e === "todas" ? "Todas" : COLORES_ESTADO[e].label}
            </button>
          ))}
        </div>

        {/* ── Tabla de solicitudes ───────────────────────── */}
        <section className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "#9A6A2A" }}>
            Solicitudes ({solicitudesFiltradas.length})
          </h2>

          {solicitudesFiltradas.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <Car size={32} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-400">No hay solicitudes con este filtro</p>
            </div>
          ) : (
            <div className="space-y-3">
              {solicitudesFiltradas.map((s) => {
                const colores = COLORES_ESTADO[s.estado];
                return (
                  <div key={s.id} className="bg-white rounded-2xl shadow-sm p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: "#FDF0E6" }}>
                        <Car size={18} style={{ color: "#C85A2A" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-800 text-sm">{s.nombreCuidador}</p>
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{ background: colores.bg, color: colores.text }}
                          >
                            {colores.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {s.origen} → {s.destino}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock size={11} />
                            {format(s.fechaHora.toDate(), "d MMM HH:mm", { locale: es })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={11} /> {s.pasajeros}
                          </span>
                          {s.placasUnidad && (
                            <span className="flex items-center gap-1">
                              <Truck size={11} /> {s.placasUnidad} — {s.nombreChofer}
                            </span>
                          )}
                        </div>
                        {s.notas && (
                          <p className="text-xs text-gray-400 mt-1 italic">"{s.notas}"</p>
                        )}
                      </div>
                    </div>

                    {/* Acciones */}
                    {s.estado !== "cancelada" && s.estado !== "completada" && (
                      <div className="mt-3 flex gap-2 flex-wrap">
                        {s.estado === "pendiente" && (
                          <button
                            onClick={() => setSolicitudAsignar(s)}
                            className="text-xs font-medium px-3 py-1.5 rounded-lg text-white"
                            style={{ background: "#C85A2A" }}
                          >
                            Asignar unidad
                          </button>
                        )}
                        {s.estado === "asignada" && (
                          <button
                            onClick={() => cambiarEstado(s.id, "en_camino")}
                            disabled={actualizando === s.id}
                            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-600 text-white disabled:opacity-50"
                          >
                            {actualizando === s.id ? "…" : "Marcar en camino"}
                          </button>
                        )}
                        {s.estado === "en_camino" && (
                          <button
                            onClick={() => cambiarEstado(s.id, "completada")}
                            disabled={actualizando === s.id}
                            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-green-600 text-white disabled:opacity-50"
                          >
                            {actualizando === s.id ? "…" : "Marcar completado"}
                          </button>
                        )}
                        <button
                          onClick={() => cambiarEstado(s.id, "cancelada")}
                          disabled={actualizando === s.id}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Gestión de unidades ────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wide" style={{ color: "#9A6A2A" }}>
              Flota de unidades ({unidades.length})
            </h2>
            <button
              onClick={() => setMostrarNuevaUnidad(true)}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl text-white"
              style={{ background: "#C85A2A" }}
            >
              <Plus size={14} /> Nueva unidad
            </button>
          </div>

          {unidades.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <Truck size={32} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-400">No hay unidades registradas</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {unidades.map((u) => {
                const estadoColores = {
                  disponible:   { bg: "#D1FAE5", text: "#065F46" },
                  en_servicio:  { bg: "#DBEAFE", text: "#1E40AF" },
                  mantenimiento: { bg: "#FEF3C7", text: "#92400E" },
                };
                const colores = estadoColores[u.estado];
                return (
                  <div key={u.id} className="bg-white rounded-2xl shadow-sm p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-gray-800">{u.placas}</p>
                        <p className="text-sm text-gray-500">{u.modelo}</p>
                        {u.nombreChofer && (
                          <p className="text-xs text-gray-400 mt-0.5">Chofer: {u.nombreChofer}</p>
                        )}
                        <p className="text-xs text-gray-400">Capacidad: {u.capacidad} pasajeros</p>
                      </div>
                      <span
                        className="text-xs font-medium px-2.5 py-1 rounded-full shrink-0"
                        style={{ background: colores.bg, color: colores.text }}
                      >
                        {u.estado === "en_servicio" ? "En servicio" : u.estado === "mantenimiento" ? "Mantenimiento" : "Disponible"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* ── Modales ─────────────────────────────────────── */}
      {solicitudAsignar && (
        <ModalAsignar
          solicitud={solicitudAsignar}
          unidades={unidades}
          onClose={() => setSolicitudAsignar(null)}
          onAsignar={(unidadId, placas, chofer) =>
            asignarUnidad(solicitudAsignar.id, unidadId, placas, chofer)
          }
        />
      )}
      {mostrarNuevaUnidad && (
        <ModalNuevaUnidad
          onClose={() => setMostrarNuevaUnidad(false)}
          onGuardar={agregarUnidad}
        />
      )}
    </>
  );
}
