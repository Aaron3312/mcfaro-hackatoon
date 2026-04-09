"use client";
// Módulo de transporte — rutas fijas con registro de pasajeros
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTransporte } from "@/hooks/useTransporte";
import { Toast, useToast } from "@/components/ui/Toast";
import { Skeleton } from "@/components/ui/Skeleton";
import { Ruta, DiaSemana, HorarioRuta } from "@/lib/types";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { addDays, startOfDay, setHours, setMinutes } from "date-fns";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Bus, MapPin, Clock, ArrowRight, CalendarClock, Plus, X, UserRound, Baby, UserPlus } from "lucide-react";

// ── Días de semana ────────────────────────────────────────────────────────────
const DIA_LABEL: Record<DiaSemana, string> = {
  lun: "Lun", mar: "Mar", mie: "Mié", jue: "Jue", vie: "Vie", sab: "Sáb", dom: "Dom",
};
const DIA_NUM: Record<DiaSemana, number> = {
  dom: 0, lun: 1, mar: 2, mie: 3, jue: 4, vie: 5, sab: 6,
};

function proximaSalida(horarios: HorarioRuta[]): Date | null {
  const ahora = new Date();
  let minFecha: Date | null = null;
  for (const h of horarios) {
    const [hh, mm] = h.hora.split(":").map(Number);
    for (const dia of h.dias) {
      const target = DIA_NUM[dia];
      const diasHasta = (target - ahora.getDay() + 7) % 7;
      let fecha = setMinutes(setHours(startOfDay(addDays(ahora, diasHasta)), hh), mm);
      if (fecha <= ahora) fecha = addDays(fecha, 7);
      if (!minFecha || fecha < minFecha) minFecha = fecha;
    }
  }
  return minFecha;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonTarjeta() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-xl" />
        <Skeleton className="h-5 w-1/3" />
      </div>
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

// ── Tarjeta de ruta ───────────────────────────────────────────────────────────
function TarjetaRuta({
  ruta,
  onRegistrarse,
}: {
  ruta: Ruta;
  onRegistrarse: (ruta: Ruta) => void;
}) {
  const proxima = proximaSalida(ruta.horarios);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      {/* Nombre + botón */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#FDF0E6" }}>
            <Bus size={16} style={{ color: "#C85A2A" }} />
          </div>
          <h3 className="font-bold text-gray-800 text-sm">{ruta.nombre}</h3>
        </div>
        <button
          onClick={() => onRegistrarse(ruta)}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs text-white min-h-[36px] transition-opacity active:opacity-80"
          style={{ background: "linear-gradient(135deg, #C85A2A, #E87A3A)" }}
        >
          <Plus size={13} />
          Registrarme
        </button>
      </div>

      {/* Origen → paradas → Destino */}
      <div className="flex flex-col gap-1 mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin size={13} className="text-gray-400 shrink-0" />
          <span className="font-medium">{ruta.origen}</span>
        </div>
        {ruta.paradas && ruta.paradas.length > 0 && (
          <div className="flex flex-col gap-1 pl-[19px] border-l-2 border-dashed ml-[6px]" style={{ borderColor: "#E8D8C8" }}>
            {ruta.paradas.map((parada, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0 -ml-[13px]" />
                <span>{parada}</span>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin size={13} className="shrink-0" style={{ color: "#C85A2A" }} />
          <span className="font-medium">{ruta.destino}</span>
        </div>
      </div>

      {/* Horarios */}
      <div className="flex flex-wrap gap-2 mb-3">
        {ruta.horarios.map((h, i) => (
          <div
            key={i}
            className="flex items-center gap-1 text-xs rounded-lg px-2 py-1"
            style={{ background: "#F5F0EA", color: "#7A3D1A" }}
          >
            <Clock size={11} />
            <span className="font-semibold">{h.hora}</span>
            <span className="text-gray-400 mx-0.5">·</span>
            <span>{h.dias.map((d) => DIA_LABEL[d]).join(", ")}</span>
          </div>
        ))}
      </div>

      {/* Próxima salida */}
      {proxima && (
        <div className="flex items-center gap-1.5 text-xs" style={{ color: "#9A6A2A" }}>
          <CalendarClock size={12} />
          <span>
            Próxima salida:{" "}
            <span className="font-semibold">
              {format(proxima, "EEEE d MMM · HH:mm", { locale: es })}
            </span>
          </span>
        </div>
      )}

      {ruta.notas && (
        <p className="mt-2 text-xs text-gray-400 italic">"{ruta.notas}"</p>
      )}
    </div>
  );
}

// ── Modal de registro ─────────────────────────────────────────────────────────
function ModalRegistro({
  ruta,
  nombreCuidador,
  nombreNino,
  onGuardar,
  onCerrar,
}: {
  ruta: Ruta;
  nombreCuidador: string;
  nombreNino?: string;
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
  const proxima = proximaSalida(ruta.horarios);
  const minDatetime = (() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 30);
    return d.toISOString().slice(0, 16);
  })();

  const [fechaHora, setFechaHora] = useState(
    proxima ? proxima.toISOString().slice(0, 16) : minDatetime
  );
  const [paciente, setPaciente] = useState(nombreNino ?? "");
  const [conAcompanante, setConAcompanante] = useState(false);
  const [acompanante, setAcompanante] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const handleGuardar = async () => {
    if (!fechaHora) { setError("Selecciona la fecha y hora"); return; }
    if (!paciente.trim()) { setError("El nombre del paciente es obligatorio"); return; }
    if (conAcompanante && !acompanante.trim()) { setError("Escribe el nombre del acompañante"); return; }
    setGuardando(true);
    setError("");
    try {
      // Armar notas con los pasajeros
      const partes = [`Paciente: ${paciente.trim()}`];
      if (conAcompanante && acompanante.trim()) {
        partes.push(`Acompañante: ${acompanante.trim()}`);
      }
      const pasajeros = 1 + 1 + (conAcompanante ? 1 : 0); // cuidador + paciente + extra
      await onGuardar({
        origen: ruta.origen,
        destino: ruta.destino,
        fechaHora: new Date(fechaHora),
        pasajeros,
        notas: partes.join(" · "),
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

        {/* Encabezado */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 text-base">Registrarme en la ruta</h3>
          <button onClick={onCerrar} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Info de la ruta */}
        <div className="rounded-2xl p-3 mb-5 flex items-center gap-3" style={{ background: "#FDF0E6" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#FDEBD0" }}>
            <Bus size={18} style={{ color: "#C85A2A" }} />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm" style={{ color: "#7A3D1A" }}>{ruta.nombre}</p>
            <p className="text-xs text-gray-500 truncate">{ruta.origen} → {ruta.destino}</p>
          </div>
        </div>

        <div className="space-y-4">

          {/* Fecha y hora */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Fecha y hora de salida
            </label>
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

          {/* Cuidador (solo lectura) */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Tú (cuidador)
            </label>
            <div className="flex items-center gap-3 px-3 py-3 rounded-xl min-h-[48px]" style={{ background: "#F5F5F5" }}>
              <UserRound size={16} className="text-gray-400 shrink-0" />
              <span className="text-sm text-gray-500">{nombreCuidador}</span>
            </div>
          </div>

          {/* Paciente (obligatorio) */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Nombre del paciente <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Baby size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={paciente}
                onChange={(e) => setPaciente(e.target.value)}
                placeholder="Nombre completo del niño"
                className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-3 text-sm focus:outline-none focus:border-orange-400 min-h-[48px]"
              />
            </div>
          </div>

          {/* Acompañante adicional */}
          <div>
            <button
              type="button"
              onClick={() => { setConAcompanante(!conAcompanante); setAcompanante(""); }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border-2 border-dashed text-sm font-semibold transition-colors min-h-[48px] ${
                conAcompanante
                  ? "border-orange-300 text-orange-500 bg-orange-50"
                  : "border-gray-200 text-gray-400 hover:border-gray-300"
              }`}
            >
              <UserPlus size={16} className="shrink-0" />
              {conAcompanante ? "Quitar acompañante adicional" : "Añadir otra persona"}
            </button>

            {conAcompanante && (
              <div className="relative mt-2">
                <UserRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={acompanante}
                  onChange={(e) => setAcompanante(e.target.value)}
                  placeholder="Nombre del acompañante"
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-3 text-sm focus:outline-none focus:border-orange-400 min-h-[48px]"
                  autoFocus
                />
              </div>
            )}
          </div>
        </div>

        {error && <p className="text-xs text-red-500 mt-3">{error}</p>}

        <button
          onClick={handleGuardar}
          disabled={guardando}
          className="w-full mt-5 py-3.5 rounded-2xl font-bold text-white text-sm disabled:opacity-50 transition-opacity min-h-[48px]"
          style={{ background: "linear-gradient(135deg, #C85A2A, #E87A3A)" }}
        >
          {guardando ? "Enviando…" : "Confirmar registro"}
        </button>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function TransportePage() {
  const { familia } = useAuth();
  const { solicitar } = useTransporte(familia?.id);
  const { toast, mostrar, cerrar } = useToast();
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [rutaSeleccionada, setRutaSeleccionada] = useState<Ruta | null>(null);

  useEffect(() => {
    if (!familia?.casaRonald) {
      setCargando(false);
      return;
    }
    const q = query(
      collection(db, "rutas"),
      where("casaRonald", "==", familia.casaRonald),
      where("activa", "==", true)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setRutas(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Ruta));
        setCargando(false);
      },
      () => setCargando(false)
    );
    return unsub;
  }, [familia?.casaRonald]);

  const handleGuardar = async (datos: Parameters<typeof solicitar>[0]) => {
    await solicitar(datos);
    mostrar("Registro enviado. El coordinador lo confirmará pronto.");
  };

  return (
    <>
      {/* ── Banner ───────────────────────────────────────── */}
      <div
        className="relative overflow-hidden w-full"
        style={{ background: "linear-gradient(135deg, #C85A2A 0%, #E87A3A 70%, #F5C842 100%)" }}
      >
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-15" style={{ background: "#7A3D1A" }} />
        <div className="max-w-2xl mx-auto px-5 py-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bus size={24} /> Transporte
          </h1>
          <p className="text-white/70 text-sm mt-1">
            Rutas disponibles desde tu Casa Ronald McDonald
          </p>
        </div>
      </div>

      {/* ── Contenido ────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 pt-5 pb-24 space-y-3">
        {cargando ? (
          <>
            <SkeletonTarjeta />
            <SkeletonTarjeta />
            <SkeletonTarjeta />
          </>
        ) : rutas.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <Bus size={40} className="mx-auto mb-3 text-gray-200" />
            <p className="font-semibold text-gray-500 text-sm">Sin rutas disponibles</p>
            <p className="text-gray-400 text-xs mt-2">
              El coordinador aún no ha registrado rutas para tu casa
            </p>
          </div>
        ) : (
          rutas.map((r) => (
            <TarjetaRuta key={r.id} ruta={r} onRegistrarse={setRutaSeleccionada} />
          ))
        )}
      </div>

      {/* ── Modal ────────────────────────────────────────── */}
      {rutaSeleccionada && familia && (
        <ModalRegistro
          ruta={rutaSeleccionada}
          nombreCuidador={familia.nombreCuidador}
          nombreNino={familia.nombreNino}
          onGuardar={handleGuardar}
          onCerrar={() => setRutaSeleccionada(null)}
        />
      )}

      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrar} />}
    </>
  );
}
