"use client";
// Calendario unificado: transportes + actividades de interés
import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTransporte } from "@/hooks/useTransporte";
import { useActividades } from "@/hooks/useActividades";
import { useActividadesInteres } from "@/hooks/useActividadesInteres";
import { Toast, useToast } from "@/components/ui/Toast";
import { SolicitudTransporte, Actividad } from "@/lib/types";
import {
  format, addMonths, subMonths, startOfMonth,
  getDay, getDaysInMonth, isSameDay,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  ChevronLeft, ChevronRight, Bus, Activity,
  MapPin, Clock, Users, Bookmark, BookmarkCheck,
  CalendarDays,
} from "lucide-react";

const DIAS_SEMANA = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];
const GRID7: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(7, 1fr)" };

// ── Estado de transporte ──────────────────────────────────────────────────────
const ESTADO_TRANSPORTE: Record<string, { label: string; color: string; bg: string }> = {
  pendiente:  { label: "Pendiente",   color: "#92400E", bg: "#FEF3C7" },
  asignada:   { label: "Asignada",    color: "#1E40AF", bg: "#DBEAFE" },
  en_camino:  { label: "En camino",   color: "#065F46", bg: "#D1FAE5" },
  completada: { label: "Completada",  color: "#374151", bg: "#F3F4F6" },
  cancelada:  { label: "Cancelada",   color: "#991B1B", bg: "#FEE2E2" },
};

// ── Tarjeta de transporte ─────────────────────────────────────────────────────
function TarjetaTransporte({ sol }: { sol: SolicitudTransporte }) {
  const estado = ESTADO_TRANSPORTE[sol.estado] ?? ESTADO_TRANSPORTE.pendiente;
  const fecha = sol.fechaHora.toDate();

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 border-l-4" style={{ borderColor: "#3B82F6" }}>
      <div className="flex items-start justify-between gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-blue-50">
          <Bus size={16} className="text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-gray-800 text-sm">Transporte</p>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: estado.bg, color: estado.color }}
            >
              {estado.label}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <Clock size={11} className="text-gray-400" />
            <span className="text-xs text-gray-500">
              {format(fecha, "HH:mm", { locale: es })}
            </span>
          </div>
          <div className="flex items-start gap-1.5 mt-1">
            <MapPin size={11} className="text-gray-400 mt-0.5 shrink-0" />
            <span className="text-xs text-gray-600 leading-tight">
              {sol.origen} → {sol.destino}
            </span>
          </div>
          {sol.nombreChofer && (
            <p className="text-xs text-gray-400 mt-1">Chofer: {sol.nombreChofer}</p>
          )}
          {sol.placasUnidad && (
            <p className="text-xs text-gray-400">Unidad: {sol.placasUnidad}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Tarjeta de actividad ──────────────────────────────────────────────────────
function TarjetaActividadCalendario({
  actividad, interesado, onToggleInteres,
}: {
  actividad: Actividad;
  interesado: boolean;
  onToggleInteres: () => void;
}) {
  const fecha = actividad.fechaHora.toDate();

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 border-l-4" style={{ borderColor: "#C85A2A" }}>
      <div className="flex items-start justify-between gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#FDF0E6" }}>
          <Activity size={16} style={{ color: "#C85A2A" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-800 text-sm truncate">{actividad.titulo}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <Clock size={11} className="text-gray-400" />
            <span className="text-xs text-gray-500">
              {format(fecha, "HH:mm", { locale: es })} · {actividad.duracionMin} min
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <MapPin size={11} className="text-gray-400" />
            <span className="text-xs text-gray-500 truncate">{actividad.ubicacion}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <Users size={11} className="text-gray-400" />
            <span className="text-xs text-gray-500">
              {actividad.registrados}/{actividad.capacidadMax} inscritos
            </span>
          </div>
        </div>
        <button
          onClick={onToggleInteres}
          title={interesado ? "Quitar del calendario" : "Mantener en calendario"}
          className="p-1.5 rounded-lg shrink-0 transition-colors"
          style={{ color: interesado ? "#C85A2A" : "#D1D5DB" }}
        >
          {interesado ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
        </button>
      </div>
    </div>
  );
}

// ── Tipo de evento unificado para el calendario ───────────────────────────────
type EventoDia = {
  tipo: "transporte" | "actividad";
  fecha: Date;
  data: SolicitudTransporte | Actividad;
};

// ── Página principal ──────────────────────────────────────────────────────────
export default function CalendarioPage() {
  const { familia } = useAuth();
  const { solicitudes, cargando: cargandoTransp } = useTransporte(familia?.id);
  const { actividades, cargando: cargandoAct } = useActividades(familia?.casaRonald, familia?.id);
  const { idsInteres, tieneInteres, toggleInteres } = useActividadesInteres(familia?.id);
  const { toast, mostrar, cerrar } = useToast();

  const [mesActual, setMesActual] = useState(new Date());
  const [diaSeleccionado, setDiaSeleccionado] = useState<Date | null>(null);
  const [filtro, setFiltro] = useState<"todos" | "transporte" | "actividad">("todos");

  const cargando = cargandoTransp || cargandoAct;
  const anio = mesActual.getFullYear();
  const mes  = mesActual.getMonth();

  // Actividades de interés únicamente
  const actividadesInteres = useMemo(
    () => actividades.filter((a) => idsInteres.has(a.id)),
    [actividades, idsInteres]
  );

  // Transportes activos (excluir cancelados)
  const transportesActivos = useMemo(
    () => solicitudes.filter((s) => s.estado !== "cancelada"),
    [solicitudes]
  );

  // Todos los eventos unificados
  const todosEventos: EventoDia[] = useMemo(() => {
    const evTransp: EventoDia[] = transportesActivos.map((s) => ({
      tipo: "transporte",
      fecha: s.fechaHora.toDate(),
      data: s,
    }));
    const evAct: EventoDia[] = actividadesInteres.map((a) => ({
      tipo: "actividad",
      fecha: a.fechaHora.toDate(),
      data: a,
    }));
    return [...evTransp, ...evAct].sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
  }, [transportesActivos, actividadesInteres]);

  // Días del mes que tienen eventos
  const diasConEventos = useMemo(() => {
    const mapa = new Map<number, Set<"transporte" | "actividad">>();
    todosEventos.forEach(({ fecha, tipo }) => {
      if (fecha.getFullYear() === anio && fecha.getMonth() === mes) {
        const d = fecha.getDate();
        if (!mapa.has(d)) mapa.set(d, new Set());
        mapa.get(d)!.add(tipo);
      }
    });
    return mapa;
  }, [todosEventos, anio, mes]);

  // Eventos del día seleccionado con filtro
  const eventosDia = useMemo(() => {
    if (!diaSeleccionado) return [];
    return todosEventos.filter(
      (e) =>
        isSameDay(e.fecha, diaSeleccionado) &&
        (filtro === "todos" || e.tipo === filtro)
    );
  }, [todosEventos, diaSeleccionado, filtro]);

  // Próximos eventos (sin día seleccionado)
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const proximosEventos = useMemo(() =>
    todosEventos
      .filter((e) => e.fecha >= hoy && (filtro === "todos" || e.tipo === filtro))
      .slice(0, 15),
    [todosEventos, filtro, hoy]
  );

  // Celdas del mes
  const primerDia = getDay(startOfMonth(mesActual));
  const totalDias = getDaysInMonth(mesActual);
  const celdas = [
    ...Array(primerDia).fill(null),
    ...Array.from({ length: totalDias }, (_, i) => i + 1),
  ];

  const onToggleInteres = async (actividadId: string) => {
    try {
      await toggleInteres(actividadId);
      const ahora = tieneInteres(actividadId);
      mostrar(ahora ? "Eliminada del calendario" : "Añadida a tu calendario");
    } catch {
      mostrar("Error al actualizar", "error");
    }
  };

  return (
    <div className="min-h-screen pb-28" style={{ background: "#FDF7F0" }}>
      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrar} />}

      {/* ── Banner ───────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden w-full"
        style={{ background: "linear-gradient(135deg,#C85A2A 0%,#E87A3A 70%,#F5C842 100%)" }}
      >
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-15"
          style={{ background: "#7A3D1A" }} />
        <div className="max-w-lg mx-auto px-5 py-7">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
              <CalendarDays size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Mi calendario</h1>
              <p className="text-white/70 text-sm">
                {todosEventos.length} evento{todosEventos.length !== 1 ? "s" : ""} programado{todosEventos.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">

        {/* ── Calendario mensual ────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Navegación */}
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "#F0E5D0" }}>
            <button
              onClick={() => setMesActual(subMonths(mesActual, 1))}
              className="p-2 rounded-xl hover:bg-orange-50"
            >
              <ChevronLeft size={18} style={{ color: "#C85A2A" }} />
            </button>
            <p className="font-bold capitalize text-sm" style={{ color: "#7A3D1A" }}>
              {format(mesActual, "MMMM yyyy", { locale: es })}
            </p>
            <button
              onClick={() => setMesActual(addMonths(mesActual, 1))}
              className="p-2 rounded-xl hover:bg-orange-50"
            >
              <ChevronRight size={18} style={{ color: "#C85A2A" }} />
            </button>
          </div>

          {/* Días de la semana */}
          <div style={GRID7} className="px-2 pt-2">
            {DIAS_SEMANA.map((d) => (
              <div key={d} className="text-center text-[11px] font-bold py-1" style={{ color: "#D4A574" }}>
                {d}
              </div>
            ))}
          </div>

          {/* Celdas */}
          <div style={GRID7} className="px-2 pb-3">
            {celdas.map((dia, i) => {
              if (!dia) return <div key={`v-${i}`} />;
              const fecha = new Date(anio, mes, dia);
              const esHoy = isSameDay(fecha, new Date());
              const esSelec = diaSeleccionado && isSameDay(fecha, diaSeleccionado);
              const tipos = diasConEventos.get(dia);

              return (
                <button
                  key={dia}
                  onClick={() => setDiaSeleccionado(esSelec ? null : fecha)}
                  className="flex flex-col items-center justify-center py-1.5 rounded-xl transition-all"
                  style={{ background: esSelec ? "#C85A2A" : esHoy ? "#FDF0E6" : "transparent" }}
                >
                  <span
                    className="text-sm font-semibold leading-none"
                    style={{ color: esSelec ? "#fff" : esHoy ? "#C85A2A" : "#374151" }}
                  >
                    {dia}
                  </span>
                  {/* Puntos por tipo de evento */}
                  {tipos && tipos.size > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {tipos.has("transporte") && (
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: esSelec ? "#fff" : "#3B82F6" }}
                        />
                      )}
                      {tipos.has("actividad") && (
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: esSelec ? "#fff" : "#C85A2A" }}
                        />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Leyenda ───────────────────────────────────────── */}
        <div className="flex gap-4 text-xs px-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-gray-500">Transporte</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#C85A2A" }} />
            <span className="text-gray-500">Actividades guardadas</span>
          </span>
        </div>

        {/* ── Filtros ───────────────────────────────────────── */}
        <div className="flex gap-1.5 bg-white rounded-xl p-1 border w-fit" style={{ borderColor: "#F0E5D0" }}>
          {([
            { id: "todos",      label: "Todos" },
            { id: "transporte", label: "Transporte" },
            { id: "actividad",  label: "Actividades" },
          ] as const).map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFiltro(id)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{
                background: filtro === id ? "#FDF0E6" : "transparent",
                color:      filtro === id ? "#C85A2A" : "#9CA3AF",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Eventos del día seleccionado ──────────────────── */}
        {diaSeleccionado && (
          <section>
            <p className="text-xs font-bold uppercase tracking-wide mb-2 px-1" style={{ color: "#9A6A2A" }}>
              {format(diaSeleccionado, "EEEE d 'de' MMMM", { locale: es })}
            </p>
            {cargando ? (
              <div className="space-y-3">
                {[1, 2].map((k) => <div key={k} className="bg-white rounded-2xl h-24 animate-pulse shadow-sm" />)}
              </div>
            ) : eventosDia.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
                <CalendarDays size={28} className="mx-auto mb-2 text-gray-200" />
                <p className="text-sm text-gray-400">Sin eventos este día</p>
                <p className="text-xs text-gray-300 mt-1">
                  Guarda actividades desde la pestaña Actividades
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {eventosDia.map((evento, i) =>
                  evento.tipo === "transporte" ? (
                    <TarjetaTransporte
                      key={`t-${i}`}
                      sol={evento.data as SolicitudTransporte}
                    />
                  ) : (
                    <TarjetaActividadCalendario
                      key={`a-${i}`}
                      actividad={evento.data as Actividad}
                      interesado={tieneInteres((evento.data as Actividad).id)}
                      onToggleInteres={() => onToggleInteres((evento.data as Actividad).id)}
                    />
                  )
                )}
              </div>
            )}
          </section>
        )}

        {/* ── Próximos eventos ──────────────────────────────── */}
        {!diaSeleccionado && (
          <section>
            <p className="text-xs font-bold uppercase tracking-wide mb-2 px-1" style={{ color: "#9A6A2A" }}>
              Próximos eventos
            </p>
            {cargando ? (
              <div className="space-y-3">
                {[1, 2, 3].map((k) => <div key={k} className="bg-white rounded-2xl h-24 animate-pulse shadow-sm" />)}
              </div>
            ) : proximosEventos.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                <CalendarDays size={32} className="mx-auto mb-3 text-gray-200" />
                <p className="text-gray-500 text-sm font-semibold">
                  {filtro === "transporte"
                    ? "Sin transportes próximos"
                    : filtro === "actividad"
                    ? "Sin actividades guardadas"
                    : "Sin eventos próximos"}
                </p>
                {filtro !== "transporte" && (
                  <p className="text-gray-400 text-xs mt-1">
                    Marca el ícono <Bookmark size={11} className="inline" /> en Actividades para añadirlas aquí
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {proximosEventos.map((evento, i) => (
                  <div key={i}>
                    {/* Separador de fecha cuando cambia el día */}
                    {(i === 0 || !isSameDay(evento.fecha, proximosEventos[i - 1].fecha)) && (
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2 mt-2 px-1 capitalize">
                        {isSameDay(evento.fecha, new Date())
                          ? "Hoy"
                          : format(evento.fecha, "EEEE d 'de' MMMM", { locale: es })}
                      </p>
                    )}
                    {evento.tipo === "transporte" ? (
                      <TarjetaTransporte sol={evento.data as SolicitudTransporte} />
                    ) : (
                      <TarjetaActividadCalendario
                        actividad={evento.data as Actividad}
                        interesado={tieneInteres((evento.data as Actividad).id)}
                        onToggleInteres={() => onToggleInteres((evento.data as Actividad).id)}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
