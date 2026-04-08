"use client";
// Módulo de transporte — app móvil para cuidadores
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTransporte } from "@/hooks/useTransporte";
import { Toast, useToast } from "@/components/ui/Toast";
import { Skeleton } from "@/components/ui/Skeleton";
import { SolicitudTransporte, EstadoSolicitud } from "@/lib/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Bus, MapPin, Clock, Users, Plus, X, ChevronDown } from "lucide-react";

// ── Colores por estado ────────────────────────────────────────────────────────
const ESTADO_CONFIG: Record<EstadoSolicitud, { bg: string; text: string; label: string; dot: string }> = {
  pendiente:  { bg: "#FEF3C7", text: "#92400E", label: "Pendiente",   dot: "#F59E0B" },
  asignada:   { bg: "#DBEAFE", text: "#1E40AF", label: "Confirmado",  dot: "#3B82F6" },
  en_camino:  { bg: "#D1FAE5", text: "#065F46", label: "En camino",   dot: "#10B981" },
  completada: { bg: "#F3F4F6", text: "#6B7280", label: "Completado",  dot: "#9CA3AF" },
  cancelada:  { bg: "#FEE2E2", text: "#991B1B", label: "Cancelado",   dot: "#EF4444" },
};

// ── Skeleton de tarjeta ───────────────────────────────────────────────────────
function SkeletonTarjeta() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

// ── Tarjeta de solicitud ──────────────────────────────────────────────────────
function TarjetaSolicitud({
  solicitud,
  onCancelar,
}: {
  solicitud: SolicitudTransporte;
  onCancelar: () => void;
}) {
  const config = ESTADO_CONFIG[solicitud.estado];
  const fecha = solicitud.fechaHora.toDate();
  const puedeCancel = solicitud.estado === "pendiente";

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      {/* Encabezado con estado */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full shrink-0 mt-0.5"
            style={{ background: config.dot }}
          />
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: config.bg, color: config.text }}
          >
            {config.label}
          </span>
        </div>
        {puedeCancel && (
          <button
            onClick={onCancelar}
            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Cancelar solicitud"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Ruta */}
      <div className="flex items-start gap-2 mb-2">
        <MapPin size={15} style={{ color: "#C85A2A" }} className="mt-0.5 shrink-0" />
        <div className="text-sm text-gray-700 min-w-0">
          <span className="font-medium">{solicitud.origen}</span>
          <span className="text-gray-400 mx-1">→</span>
          <span className="font-medium">{solicitud.destino}</span>
        </div>
      </div>

      {/* Fecha y hora */}
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {format(fecha, "EEEE d 'de' MMM, HH:mm", { locale: es })}
        </span>
        <span className="flex items-center gap-1">
          <Users size={12} /> {solicitud.pasajeros} pasajero{solicitud.pasajeros > 1 ? "s" : ""}
        </span>
      </div>

      {/* Info del vehículo cuando está asignado */}
      {(solicitud.estado === "asignada" || solicitud.estado === "en_camino") && solicitud.placasUnidad && (
        <div
          className="mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-xs"
          style={{ background: "#FDF0E6" }}
        >
          <Bus size={14} style={{ color: "#C85A2A" }} />
          <span style={{ color: "#7A3D1A" }}>
            <span className="font-semibold">{solicitud.placasUnidad}</span>
            {solicitud.nombreChofer && ` — Chofer: ${solicitud.nombreChofer}`}
          </span>
        </div>
      )}

      {/* Notas */}
      {solicitud.notas && (
        <p className="mt-2 text-xs text-gray-400 italic">"{solicitud.notas}"</p>
      )}
    </div>
  );
}

// ── Formulario nueva solicitud ────────────────────────────────────────────────
function FormularioSolicitud({
  nombreCuidador,
  onGuardar,
  onCerrar,
}: {
  nombreCuidador: string;
  onGuardar: (datos: {
    origen: string;
    destino: string;
    fechaHora: Date;
    pasajeros: number;
    notas?: string;
    nombreCuidador: string;
  }) => Promise<void>;
  onCerrar: () => void;
}) {
  const hoyMin = new Date();
  hoyMin.setMinutes(hoyMin.getMinutes() + 30); // mínimo 30 min de anticipación
  const minDatetime = hoyMin.toISOString().slice(0, 16);

  const [origen, setOrigen] = useState("Casa Ronald McDonald");
  const [destino, setDestino] = useState("");
  const [fechaHora, setFechaHora] = useState(minDatetime);
  const [pasajeros, setPasajeros] = useState(1);
  const [notas, setNotas] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const handleGuardar = async () => {
    if (!origen.trim() || !destino.trim() || !fechaHora) {
      setError("Completa origen, destino y fecha/hora");
      return;
    }
    setGuardando(true);
    setError("");
    try {
      await onGuardar({
        origen: origen.trim(),
        destino: destino.trim(),
        fechaHora: new Date(fechaHora),
        pasajeros,
        notas: notas.trim() || undefined,
        nombreCuidador,
      });
      onCerrar();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al enviar solicitud");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-800 text-base">Nueva solicitud de transporte</h3>
          <button onClick={onCerrar} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Origen */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Origen</label>
            <div className="relative">
              <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={origen}
                onChange={(e) => setOrigen(e.target.value)}
                placeholder="Punto de partida"
                className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-3 text-sm focus:outline-none focus:border-orange-400 min-h-[48px]"
              />
            </div>
          </div>

          {/* Destino */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Destino</label>
            <div className="relative">
              <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#C85A2A" }} />
              <input
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                placeholder="Ej. Hospital Infantil"
                className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-3 text-sm focus:outline-none focus:border-orange-400 min-h-[48px]"
              />
            </div>
          </div>

          {/* Fecha y hora */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Fecha y hora</label>
            <div className="relative">
              <Clock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="datetime-local"
                value={fechaHora}
                min={minDatetime}
                onChange={(e) => setFechaHora(e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-3 text-sm focus:outline-none focus:border-orange-400 min-h-[48px]"
              />
            </div>
          </div>

          {/* Pasajeros */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Número de pasajeros
            </label>
            <div className="relative">
              <Users size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={pasajeros}
                onChange={(e) => setPasajeros(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl pl-9 pr-8 py-3 text-sm focus:outline-none focus:border-orange-400 appearance-none bg-white min-h-[48px]"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "pasajero" : "pasajeros"}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Notas adicionales <span className="font-normal text-gray-400">(opcional)</span>
            </label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ej. Necesitamos ayuda con silla de ruedas"
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 resize-none"
            />
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-500 mt-3">{error}</p>
        )}

        <button
          onClick={handleGuardar}
          disabled={guardando}
          className="w-full mt-5 py-3.5 rounded-2xl font-bold text-white text-sm disabled:opacity-50 transition-opacity min-h-[48px]"
          style={{ background: "linear-gradient(135deg, #C85A2A, #E87A3A)" }}
        >
          {guardando ? "Enviando solicitud…" : "Solicitar transporte"}
        </button>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function TransportePage() {
  const { familia } = useAuth();
  const { activas, historial, cargando, solicitar, cancelar } = useTransporte(familia?.id);
  const { toast, mostrar, cerrar } = useToast();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cancelando, setCancelando] = useState<string | null>(null);
  const [verHistorial, setVerHistorial] = useState(false);

  const handleSolicitar = async (datos: Parameters<typeof solicitar>[0]) => {
    await solicitar(datos);
    mostrar("Solicitud enviada. El coordinador la confirmará pronto.");
  };

  const handleCancelar = async (id: string) => {
    setCancelando(id);
    try {
      await cancelar(id);
      mostrar("Solicitud cancelada");
    } catch {
      mostrar("Error al cancelar", "error");
    } finally {
      setCancelando(null);
    }
  };

  return (
    <>
      {/* ── Banner ───────────────────────────────────────── */}
      <div
        className="relative overflow-hidden w-full"
        style={{ background: "linear-gradient(135deg, #C85A2A 0%, #E87A3A 70%, #F5C842 100%)" }}
      >
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-15"
          style={{ background: "#7A3D1A" }} />
        <div className="max-w-2xl mx-auto px-5 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Bus size={24} /> Transporte
              </h1>
              <p className="text-white/70 text-sm mt-1">
                Solicita traslados entre la Casa y el hospital
              </p>
            </div>
            <button
              onClick={() => setMostrarFormulario(true)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 active:bg-white/40 text-white rounded-2xl px-4 py-3 font-semibold text-sm transition-colors shadow-sm min-h-[48px]"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Solicitar</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Contenido ────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-24">

        {/* Solicitudes activas */}
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "#9A6A2A" }}>
            Mis solicitudes activas
          </h2>

          {cargando ? (
            <div className="space-y-3">
              <SkeletonTarjeta />
              <SkeletonTarjeta />
            </div>
          ) : activas.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <Bus size={40} className="mx-auto mb-3 text-gray-200" />
              <p className="font-semibold text-gray-500 text-sm">Sin solicitudes activas</p>
              <p className="text-gray-400 text-xs mt-1 mb-4">
                Solicita un traslado cuando necesites ir al hospital
              </p>
              <button
                onClick={() => setMostrarFormulario(true)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-white text-sm min-h-[48px]"
                style={{ background: "#C85A2A" }}
              >
                <Plus size={16} /> Nueva solicitud
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {activas.map((s) => (
                <TarjetaSolicitud
                  key={s.id}
                  solicitud={s}
                  onCancelar={() => !cancelando && handleCancelar(s.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Información de uso */}
        {!cargando && (
          <div className="rounded-2xl p-4 mb-6" style={{ background: "#FDF0E6" }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#9A6A2A" }}>
              ¿Cómo funciona?
            </p>
            <ul className="space-y-1.5 text-xs" style={{ color: "#7A3D1A" }}>
              <li className="flex items-start gap-2">
                <span className="shrink-0 mt-0.5">1.</span>
                Solicita tu traslado con al menos 30 minutos de anticipación
              </li>
              <li className="flex items-start gap-2">
                <span className="shrink-0 mt-0.5">2.</span>
                El coordinador asignará una unidad y recibirás notificación
              </li>
              <li className="flex items-start gap-2">
                <span className="shrink-0 mt-0.5">3.</span>
                Verás las placas del vehículo y el nombre del chofer
              </li>
            </ul>
          </div>
        )}

        {/* Historial (colapsable) */}
        {historial.length > 0 && (
          <section>
            <button
              onClick={() => setVerHistorial(!verHistorial)}
              className="flex items-center justify-between w-full text-xs font-bold uppercase tracking-wide mb-3"
              style={{ color: "#9A6A2A" }}
            >
              <span>Historial ({historial.length})</span>
              <ChevronDown
                size={16}
                className={`transition-transform ${verHistorial ? "rotate-180" : ""}`}
              />
            </button>
            {verHistorial && (
              <div className="space-y-3">
                {historial.map((s) => (
                  <TarjetaSolicitud
                    key={s.id}
                    solicitud={s}
                    onCancelar={() => {}}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* ── Modal formulario ─────────────────────────────── */}
      {mostrarFormulario && familia && (
        <FormularioSolicitud
          nombreCuidador={familia.nombreCuidador}
          onGuardar={handleSolicitar}
          onCerrar={() => setMostrarFormulario(false)}
        />
      )}

      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrar} />}
    </>
  );
}
