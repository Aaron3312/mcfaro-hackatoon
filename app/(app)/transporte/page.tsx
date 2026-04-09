"use client";
// Módulo de transporte — rutas fijas con registro de pasajeros
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTransporte } from "@/hooks/useTransporte";
import { Toast, useToast } from "@/components/ui/Toast";
import { Skeleton } from "@/components/ui/Skeleton";
import { AlertDialog } from "@/components/ui/AlertDialog";
import { Ruta, DiaSemana, HorarioRuta } from "@/lib/types";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { addDays, startOfDay, setHours, setMinutes } from "date-fns";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Bus, MapPin, Clock, CalendarClock, Plus, X, UserRound, Baby, UserPlus, CheckCircle2, Loader2 } from "lucide-react";
import { SolicitudTransporte } from "@/lib/types";

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
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs text-white min-h-9 transition-opacity active:opacity-80"
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
          <div className="flex flex-col gap-1 pl-4.75 border-l-2 border-dashed ml-1.5" style={{ borderColor: "#E8D8C8" }}>
            {ruta.paradas.map((parada, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0 -ml-3.25" />
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

// ── Calcula las próximas N salidas de una ruta ────────────────────────────────
function proximasOcurrencias(horarios: HorarioRuta[], limite = 14): Date[] {
  const ahora = new Date();
  const minimo = new Date(ahora.getTime() + 30 * 60_000); // +30 min
  const resultado: Date[] = [];

  for (let d = 0; d < 30 && resultado.length < limite; d++) {
    const dia = addDays(startOfDay(ahora), d);
    for (const h of horarios) {
      const [hh, mm] = h.hora.split(":").map(Number);
      if (h.dias.some((dia_) => DIA_NUM[dia_] === dia.getDay())) {
        const fechaHora = setMinutes(setHours(dia, hh), mm);
        if (fechaHora > minimo) resultado.push(fechaHora);
      }
    }
  }
  return resultado.sort((a, b) => a.getTime() - b.getTime());
}

// ── Modal de registro ─────────────────────────────────────────────────────────
function ModalRegistro({
  ruta,
  nombreCuidador,
  nombreNino,
  horasOcupadas,
  onGuardar,
  onCerrar,
}: {
  ruta: Ruta;
  nombreCuidador: string;
  nombreNino?: string;
  horasOcupadas: number[]; // timestamps en ms de las salidas ya registradas
  onGuardar: (datos: {
    origen: string;
    destino: string;
    fechaHora: Date;
    pasajeros: number;
    notas?: string;
    nombreCuidador: string;
    nombrePaciente: string;
  }) => Promise<void>;
  onCerrar: () => void;
}) {
  const ocurrencias = proximasOcurrencias(ruta.horarios);
  // Seleccionar automáticamente la primera salida disponible (no ocupada)
  const primeraLibre = ocurrencias.find((f) => !horasOcupadas.includes(f.getTime())) ?? null;
  const [seleccionada, setSeleccionada] = useState<Date | null>(primeraLibre);
  const [paciente, setPaciente] = useState(nombreNino ?? "");
  const [conAcompanante, setConAcompanante] = useState(false);
  const [acompanante, setAcompanante] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const hoy = startOfDay(new Date());
  const manana = addDays(hoy, 1);

  const etiquetaFecha = (fecha: Date) => {
    const d = startOfDay(fecha);
    if (d.getTime() === hoy.getTime()) return "Hoy";
    if (d.getTime() === manana.getTime()) return "Mañana";
    return format(fecha, "EEE d MMM", { locale: es });
  };

  // Filtrar opciones disponibles según búsqueda
  const opcionesDisponibles = ocurrencias.filter((fecha) => {
    if (horasOcupadas.includes(fecha.getTime())) return false;
    if (!busqueda.trim()) return true;
    const texto = `${etiquetaFecha(fecha)} ${format(fecha, "HH:mm")}`.toLowerCase();
    return texto.includes(busqueda.toLowerCase());
  });

  const validarYMostrarConfirmacion = () => {
    if (!seleccionada) { setError("Selecciona una fecha y hora"); return; }
    if (horasOcupadas.includes(seleccionada.getTime())) { setError("Ya estás registrado en ese horario"); return; }
    if (!paciente.trim()) { setError("El nombre del paciente es obligatorio"); return; }
    if (conAcompanante && !acompanante.trim()) { setError("Escribe el nombre del acompañante"); return; }
    setError("");
    setMostrarConfirmacion(true);
  };

  const confirmarGuardado = async () => {
    if (!seleccionada) return;
    setMostrarConfirmacion(false);
    setGuardando(true);
    try {
      const notas = conAcompanante && acompanante.trim()
        ? `Acompañante: ${acompanante.trim()}`
        : undefined;
      await onGuardar({
        origen: ruta.origen,
        destino: ruta.destino,
        fechaHora: seleccionada,
        pasajeros: 1 + 1 + (conAcompanante ? 1 : 0),
        notas,
        nombreCuidador,
        nombrePaciente: paciente.trim(),
      });
      onCerrar();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al enviar solicitud");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-4 sm:px-0">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto">

        {/* Encabezado */}
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <h3 className="font-bold text-gray-800 text-base sm:text-lg">Registrarme en la ruta</h3>
          <button
            onClick={onCerrar}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors min-w-10 min-h-10 flex items-center justify-center"
            aria-label="Cerrar"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Info de la ruta */}
        <div className="rounded-2xl p-4 mb-5 flex items-center gap-3 shadow-sm" style={{ background: "linear-gradient(135deg, #FDF0E6, #FDEBD0)" }}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm" style={{ background: "#fff" }}>
            <Bus size={20} style={{ color: "#C85A2A" }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-sm sm:text-base" style={{ color: "#7A3D1A" }}>{ruta.nombre}</p>
            <p className="text-xs sm:text-sm text-gray-600 truncate">{ruta.origen} → {ruta.destino}</p>
          </div>
        </div>

        <div className="space-y-5">

          {/* Selector de salida con buscador */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-700">
                Elige tu salida
              </label>
              {opcionesDisponibles.length > 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#FDF0E6", color: "#C85A2A" }}>
                  {opcionesDisponibles.length} disponible{opcionesDisponibles.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {ocurrencias.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-xl border-2 border-dashed border-gray-200">
                <CalendarClock size={32} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-semibold text-gray-500 mb-1">Sin salidas disponibles</p>
                <p className="text-xs text-gray-400">No hay rutas en los próximos 30 días</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Botón selector principal */}
                <button
                  type="button"
                  onClick={() => setDropdownAbierto(!dropdownAbierto)}
                  className="w-full flex items-center justify-between px-4 py-4 rounded-xl border-2 transition-all min-h-14 group"
                  style={{
                    background: seleccionada
                      ? "linear-gradient(135deg, #C85A2A, #E87A3A)"
                      : "#F9FAFB",
                    borderColor: seleccionada ? "#C85A2A" : dropdownAbierto ? "#C85A2A" : "#E5E7EB",
                    boxShadow: dropdownAbierto ? "0 0 0 3px rgba(200, 90, 42, 0.1)" : "none"
                  }}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: seleccionada ? "rgba(255,255,255,0.2)" : "#FDF0E6" }}>
                      <CalendarClock size={18} style={{ color: seleccionada ? "#fff" : "#C85A2A" }} />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      {seleccionada ? (
                        <>
                          <p className="text-xs font-medium opacity-90" style={{ color: "#fff" }}>
                            Salida seleccionada
                          </p>
                          <p className="text-sm font-bold capitalize truncate" style={{ color: "#fff" }}>
                            {format(seleccionada, "EEEE d MMM · HH:mm", { locale: es })}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-xs font-medium text-gray-500">
                            Toca para elegir
                          </p>
                          <p className="text-sm font-bold text-gray-700">
                            Selecciona un horario
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  <svg
                    className={`transition-transform duration-200 shrink-0 ${dropdownAbierto ? "rotate-180" : ""}`}
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={seleccionada ? "#fff" : "#9CA3AF"}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>

                {/* Dropdown con buscador */}
                {dropdownAbierto && (
                  <div className="bg-white rounded-xl border-2 shadow-lg overflow-hidden animate-slideDown"
                    style={{ borderColor: "#C85A2A" }}>
                    {/* Buscador */}
                    <div className="p-3 border-b" style={{ background: "#FDF0E6", borderColor: "#F0E5D0" }}>
                      <div className="relative">
                        <svg
                          className="absolute left-3 top-1/2 -translate-y-1/2"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#C85A2A"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="11" cy="11" r="8"/>
                          <path d="M21 21l-4.35-4.35"/>
                        </svg>
                        <input
                          type="text"
                          value={busqueda}
                          onChange={(e) => setBusqueda(e.target.value)}
                          placeholder="Buscar día u hora..."
                          className="w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-10"
                          style={{
                            borderColor: "#E5E7EB",
                            backgroundColor: "#fff"
                          }}
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Lista de opciones */}
                    <div className="max-h-70 overflow-y-auto">
                      {opcionesDisponibles.length === 0 ? (
                        <div className="text-center py-8 px-4">
                          <p className="text-sm font-semibold text-gray-500 mb-1">Sin resultados</p>
                          <p className="text-xs text-gray-400">Intenta con otro término</p>
                        </div>
                      ) : (
                        opcionesDisponibles.map((fecha, i) => {
                          const esSeleccionada = seleccionada?.getTime() === fecha.getTime();
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                setSeleccionada(fecha);
                                setDropdownAbierto(false);
                                setBusqueda("");
                              }}
                              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 min-h-14"
                              style={esSeleccionada ? { background: "#FDF0E6" } : {}}
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                                  style={{ background: esSeleccionada ? "#FDEBD0" : "#F9FAFB" }}>
                                  <Clock size={18} style={{ color: esSeleccionada ? "#C85A2A" : "#6B7280" }} />
                                </div>
                                <div className="text-left flex-1 min-w-0">
                                  <p className={`text-sm font-bold capitalize ${esSeleccionada ? "text-orange-700" : "text-gray-700"}`}>
                                    {etiquetaFecha(fecha)}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {format(fecha, "EEEE d 'de' MMMM", { locale: es })}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className={`text-lg font-bold tabular-nums ${esSeleccionada ? "text-orange-600" : "text-gray-800"}`}>
                                  {format(fecha, "HH:mm")}
                                </span>
                                {esSeleccionada && (
                                  <CheckCircle2 size={20} style={{ color: "#C85A2A" }} />
                                )}
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* Info de horarios ocupados */}
                {horasOcupadas.length > 0 && !dropdownAbierto && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <CheckCircle2 size={12} className="text-green-600" />
                    <span>
                      {horasOcupadas.length} horario{horasOcupadas.length !== 1 ? "s" : ""} ya registrado{horasOcupadas.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cuidador (solo lectura) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Tú (cuidador)
            </label>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl min-h-13 border-2 border-gray-200" style={{ background: "#F9FAFB" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#FDF0E6" }}>
                <UserRound size={16} style={{ color: "#C85A2A" }} />
              </div>
              <span className="text-sm font-medium text-gray-700">{nombreCuidador}</span>
            </div>
          </div>

          {/* Paciente (obligatorio) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Nombre del paciente <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#FDF0E6" }}>
                <Baby size={16} style={{ color: "#C85A2A" }} />
              </div>
              <input
                value={paciente}
                onChange={(e) => setPaciente(e.target.value)}
                placeholder="Nombre completo del niño"
                className="w-full border-2 border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm font-medium focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 min-h-13 transition-all"
              />
            </div>
          </div>

          {/* Acompañante adicional */}
          <div>
            <button
              type="button"
              onClick={() => { setConAcompanante(!conAcompanante); setAcompanante(""); }}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed text-sm font-bold transition-all min-h-13 ${
                conAcompanante
                  ? "border-orange-400 bg-orange-50"
                  : "border-gray-300 text-gray-600 hover:border-orange-300 hover:bg-orange-50/30"
              }`}
              style={conAcompanante ? { color: "#C85A2A" } : {}}
            >
              <UserPlus size={18} className="shrink-0" />
              {conAcompanante ? "Quitar acompañante adicional" : "Añadir otra persona"}
            </button>
            {conAcompanante && (
              <div className="relative mt-3 animate-slideDown">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#FDF0E6" }}>
                  <UserRound size={16} style={{ color: "#C85A2A" }} />
                </div>
                <input
                  value={acompanante}
                  onChange={(e) => setAcompanante(e.target.value)}
                  placeholder="Nombre del acompañante"
                  className="w-full border-2 border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm font-medium focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 min-h-13 transition-all"
                  autoFocus
                />
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl border-2 border-red-200 bg-red-50 flex items-start gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p className="text-xs font-medium text-red-700 leading-relaxed">{error}</p>
          </div>
        )}

        <button
          onClick={validarYMostrarConfirmacion}
          disabled={guardando || !seleccionada}
          className="w-full mt-5 sm:mt-6 py-4 rounded-xl font-bold text-white text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 min-h-14 shadow-lg"
          style={{
            background: guardando || !seleccionada
              ? "#9CA3AF"
              : "linear-gradient(135deg, #C85A2A, #E87A3A)",
            boxShadow: guardando || !seleccionada
              ? "none"
              : "0 4px 12px rgba(200, 90, 42, 0.3)"
          }}
        >
          {guardando ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={18} className="animate-spin" />
              Enviando solicitud...
            </span>
          ) : !seleccionada ? (
            "Elige un horario para continuar"
          ) : (
            "Confirmar registro"
          )}
        </button>
      </div>

      {/* AlertDialog de confirmación */}
      {mostrarConfirmacion && seleccionada && (
        <AlertDialog
          titulo="Confirmar registro"
          mensaje={`¿Estás seguro de registrarte en la ruta ${ruta.origen} → ${ruta.destino} el ${format(
            seleccionada,
            "EEEE d MMM · HH:mm",
            { locale: es }
          )}?`}
          tipo="confirmacion"
          textoAceptar="Sí, registrarme"
          textoCancelar="Cancelar"
          onAceptar={confirmarGuardado}
          onCancelar={() => setMostrarConfirmacion(false)}
          cargando={guardando}
        />
      )}
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function TransportePage() {
  const { familia } = useAuth();
  const { activas, solicitar, cancelar } = useTransporte(familia?.id);
  const { toast, mostrar, cerrar } = useToast();
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [rutaSeleccionada, setRutaSeleccionada] = useState<Ruta | null>(null);
  const [cancelando, setCancelando] = useState<string | null>(null); // id de solicitud
  const [confirmandoEliminar, setConfirmandoEliminar] = useState<SolicitudTransporte | null>(null);
  const [detalleRegistro, setDetalleRegistro] = useState<SolicitudTransporte | null>(null);

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
    setRutaSeleccionada(null);
  };

  const mostrarConfirmacionEliminar = (solicitud: SolicitudTransporte) => {
    setConfirmandoEliminar(solicitud);
  };

  const confirmarEliminacion = async () => {
    if (!confirmandoEliminar) return;
    const id = confirmandoEliminar.id;
    setConfirmandoEliminar(null);
    setCancelando(id);
    try {
      await cancelar(id);
      mostrar("Registro cancelado");
    } catch {
      mostrar("Error al cancelar el registro", "error");
    } finally {
      setCancelando(null);
    }
  };

  // Timestamps (ms) de las salidas ya registradas para una ruta dada
  const horasOcupadasDeRuta = (ruta: Ruta): number[] =>
    activas
      .filter((s) => s.origen === ruta.origen && s.destino === ruta.destino)
      .map((s) => s.fechaHora.toDate().getTime());

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
      <div className="max-w-2xl mx-auto px-4 pt-5 pb-24 space-y-5">

        {/* ── Mis registros activos ─────────────────────── */}
        {activas.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <CheckCircle2 size={15} style={{ color: "#065F46" }} />
              Mis rutas registradas
            </h2>
            <div className="space-y-3">
              {activas.map((s) => (
                <div
                  key={s.id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 transition-shadow duration-200 hover:shadow-lg"
                >
                  {/* Encabezado clickeable */}
                  <div
                    onClick={() => setDetalleRegistro(s)}
                    className="p-4 cursor-pointer transition-all duration-150"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: "#FDF0E6" }}>
                            <Bus size={14} style={{ color: "#C85A2A" }} />
                          </div>
                          <span className="font-bold text-sm text-gray-800 truncate">
                            {s.origen} → {s.destino}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 ml-8">
                          <CalendarClock size={12} />
                          <span className="font-medium">
                            {format(s.fechaHora.toDate(), "EEEE d MMM · HH:mm", { locale: es })}
                          </span>
                        </div>
                      </div>
                      {/* Badge de estado */}
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-lg shrink-0"
                        style={
                          s.estado === "pendiente"
                            ? { background: "#FEF3C7", color: "#92400E" }
                            : s.estado === "asignada" || s.estado === "en_camino"
                            ? { background: "#D1FAE5", color: "#065F46" }
                            : { background: "#F3F4F6", color: "#6B7280" }
                        }
                      >
                        {s.estado === "pendiente" && "Pendiente"}
                        {s.estado === "asignada" && "Confirmada"}
                        {s.estado === "en_camino" && "En camino"}
                        {s.estado === "completada" && "Completada"}
                        {s.estado === "cancelada" && "Cancelada"}
                      </span>
                    </div>

                    {/* Pasajeros */}
                    <div className="flex flex-wrap gap-2 ml-8">
                      <span className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg" style={{ background: "#F9FAFB", color: "#6B7280" }}>
                        <UserRound size={12} />
                        {s.nombreCuidador}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg" style={{ background: "#EFF6FF", color: "#1E40AF" }}>
                        <Baby size={12} />
                        {s.nombrePaciente}
                      </span>
                      {s.notas && (
                        <span className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg" style={{ background: "#F5F3FF", color: "#7C3AED" }}>
                          <UserPlus size={12} />
                          +1
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer con acciones */}
                  <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
                    <button
                      onClick={() => setDetalleRegistro(s)}
                      className="flex items-center gap-1.5 text-xs font-bold transition-all duration-150 py-2 px-3 rounded-lg hover:bg-orange-50"
                      style={{ color: "#C85A2A" }}
                    >
                      <span>Ver detalles</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        mostrarConfirmacionEliminar(s);
                      }}
                      disabled={cancelando === s.id}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-red-600 transition-all duration-150 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cancelando === s.id ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>Cancelando...</span>
                        </>
                      ) : (
                        <>
                          <X size={13} />
                          <span>Cancelar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Rutas disponibles ─────────────────────────── */}
        <section>
          {activas.length > 0 && (
            <h2 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Bus size={15} className="text-gray-400" />
              Todas las rutas
            </h2>
          )}
          <div className="space-y-3">
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
                <TarjetaRuta
                  key={r.id}
                  ruta={r}
                  onRegistrarse={setRutaSeleccionada}
                />
              ))
            )}
          </div>
        </section>
      </div>

      {/* ── Modal ────────────────────────────────────────── */}
      {rutaSeleccionada && familia && (
        <ModalRegistro
          ruta={rutaSeleccionada}
          nombreCuidador={familia.nombreCuidador}
          nombreNino={familia.nombreNino}
          horasOcupadas={horasOcupadasDeRuta(rutaSeleccionada)}
          onGuardar={handleGuardar}
          onCerrar={() => setRutaSeleccionada(null)}
        />
      )}

      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrar} />}

      {/* AlertDialog de confirmación de eliminación */}
      {confirmandoEliminar && (
        <AlertDialog
          titulo="Cancelar registro"
          mensaje={`¿Estás seguro de cancelar tu registro en la ruta ${confirmandoEliminar.origen} → ${confirmandoEliminar.destino} del ${format(
            confirmandoEliminar.fechaHora.toDate(),
            "EEEE d MMM · HH:mm",
            { locale: es }
          )}?`}
          tipo="advertencia"
          textoAceptar="Sí, cancelar"
          textoCancelar="No, mantener"
          onAceptar={confirmarEliminacion}
          onCancelar={() => setConfirmandoEliminar(null)}
          cargando={cancelando === confirmandoEliminar.id}
        />
      )}

      {/* Modal de detalles de registro */}
      {detalleRegistro && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-4 sm:px-0 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto animate-slideUp">
            {/* Encabezado */}
            <div className="sticky top-0 z-10 bg-white px-5 py-4 flex items-center justify-between border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-lg">Detalles del viaje</h3>
              <button
                onClick={() => setDetalleRegistro(null)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors min-w-10 min-h-10 flex items-center justify-center"
                aria-label="Cerrar"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-5 space-y-5">
              {/* Estado y Salida en una fila */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Estado */}
                <div className="flex-1 flex items-center gap-3 p-3 rounded-xl border-2"
                  style={
                    detalleRegistro.estado === "pendiente"
                      ? { background: "#FFFBEB", borderColor: "#FDE68A" }
                      : detalleRegistro.estado === "asignada" || detalleRegistro.estado === "en_camino"
                      ? { background: "#ECFDF5", borderColor: "#A7F3D0" }
                      : { background: "#F9FAFB", borderColor: "#E5E7EB" }
                  }>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={
                      detalleRegistro.estado === "pendiente"
                        ? { background: "#FEF3C7" }
                        : detalleRegistro.estado === "asignada" || detalleRegistro.estado === "en_camino"
                        ? { background: "#D1FAE5" }
                        : { background: "#F3F4F6" }
                    }>
                    {detalleRegistro.estado === "pendiente" && <Clock size={20} style={{ color: "#92400E" }} />}
                    {(detalleRegistro.estado === "asignada" || detalleRegistro.estado === "en_camino") && <CheckCircle2 size={20} style={{ color: "#065F46" }} />}
                    {detalleRegistro.estado === "completada" && <CheckCircle2 size={20} className="text-gray-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-0.5">Estado</p>
                    <p className="text-sm font-bold truncate"
                      style={
                        detalleRegistro.estado === "pendiente"
                          ? { color: "#92400E" }
                          : detalleRegistro.estado === "asignada" || detalleRegistro.estado === "en_camino"
                          ? { color: "#065F46" }
                          : { color: "#6B7280" }
                      }>
                      {detalleRegistro.estado === "pendiente" && "Pendiente"}
                      {detalleRegistro.estado === "asignada" && "Confirmado"}
                      {detalleRegistro.estado === "en_camino" && "En camino"}
                      {detalleRegistro.estado === "completada" && "Completado"}
                      {detalleRegistro.estado === "cancelada" && "Cancelado"}
                    </p>
                  </div>
                </div>

                {/* Salida */}
                <div className="flex-1 flex items-center gap-3 p-3 rounded-xl border-2 border-gray-200">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#FDF0E6" }}>
                    <CalendarClock size={18} style={{ color: "#C85A2A" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-0.5">Salida</p>
                    <p className="text-sm font-bold capitalize text-gray-800 truncate">
                      {format(detalleRegistro.fechaHora.toDate(), "EEE d MMM", { locale: es })} ·
                      <span style={{ color: "#C85A2A" }}> {format(detalleRegistro.fechaHora.toDate(), "HH:mm")}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Ruta visual tipo mapa - horizontal con curvas */}
              <div className="relative">
                <p className="text-xs font-bold text-gray-700 mb-4 flex items-center gap-1.5">
                  <Bus size={13} style={{ color: "#C85A2A" }} />
                  Recorrido
                </p>

                {/* Contenedor de origen-ruta-destino */}
                <div className="relative flex items-center justify-between gap-3">
                  {/* Origen */}
                  <div className="flex flex-col items-center gap-2 z-10" style={{ flex: "0 0 auto" }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md" style={{ background: "#C85A2A" }}>
                      <MapPin size={22} style={{ color: "#fff" }} />
                    </div>
                    <div className="text-center max-w-20">
                      <p className="text-[10px] font-medium text-gray-500 mb-0.5">Origen</p>
                      <p className="text-xs font-bold text-gray-800 leading-tight">{detalleRegistro.origen}</p>
                    </div>
                  </div>

                  {/* Camino curvo con SVG */}
                  <div className="flex-1 relative" style={{ height: "60px", minWidth: "120px" }}>
                    <svg
                      viewBox="0 0 200 60"
                      className="w-full h-full"
                      style={{ overflow: "visible" }}
                    >
                      {/* Camino curvo principal */}
                      <path
                        d="M 10 30 Q 50 10, 100 30 T 190 30"
                        stroke="#E5E7EB"
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                      />
                      {/* Línea curva de progreso (naranja) */}
                      <path
                        d="M 10 30 Q 50 10, 100 30 T 190 30"
                        stroke="#C85A2A"
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray="8 4"
                        opacity="0.5"
                      />
                      {/* Puntos en el camino */}
                      <circle cx="50" cy="18" r="3" fill="#C85A2A" opacity="0.6" />
                      <circle cx="100" cy="30" r="3" fill="#C85A2A" opacity="0.4" />
                      <circle cx="150" cy="18" r="3" fill="#C85A2A" opacity="0.3" />
                    </svg>
                    {/* Bus en camino */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shadow-md" style={{ background: "#FDF0E6" }}>
                        <Bus size={14} style={{ color: "#C85A2A" }} />
                      </div>
                    </div>
                  </div>

                  {/* Destino */}
                  <div className="flex flex-col items-center gap-2 z-10" style={{ flex: "0 0 auto" }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md" style={{ background: "#fff", border: "2px solid #C85A2A" }}>
                      <MapPin size={22} style={{ color: "#C85A2A" }} />
                    </div>
                    <div className="text-center max-w-20">
                      <p className="text-[10px] font-medium text-gray-500 mb-0.5">Destino</p>
                      <p className="text-xs font-bold text-gray-800 leading-tight">{detalleRegistro.destino}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pasajeros */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-600">Pasajeros ({detalleRegistro.pasajeros})</p>

                {/* Cuidador */}
                <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#FDF0E6" }}>
                    <UserRound size={14} style={{ color: "#C85A2A" }} />
                  </div>
                  <p className="text-sm text-gray-700">{detalleRegistro.nombreCuidador}</p>
                </div>

                {/* Paciente */}
                <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-100">
                    <Baby size={14} className="text-blue-700" />
                  </div>
                  <p className="text-sm text-blue-900">{detalleRegistro.nombrePaciente}</p>
                </div>

                {/* Acompañante (si existe) */}
                {detalleRegistro.notas && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-50">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-100">
                      <UserPlus size={14} className="text-purple-700" />
                    </div>
                    <p className="text-sm text-purple-900">{detalleRegistro.notas.replace("Acompañante: ", "")}</p>
                  </div>
                )}
              </div>

              {/* Acción de cancelar */}
              {detalleRegistro.estado !== "completada" && detalleRegistro.estado !== "cancelada" && (
                <button
                  onClick={() => {
                    setDetalleRegistro(null);
                    mostrarConfirmacionEliminar(detalleRegistro);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all hover:shadow-lg active:scale-95 min-h-12"
                  style={{ background: "linear-gradient(135deg, #EF4444, #DC2626)" }}
                >
                  <X size={16} />
                  Cancelar este viaje
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
