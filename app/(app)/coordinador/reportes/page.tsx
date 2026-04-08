"use client";
// Reportes y métricas — panel del coordinador
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  collection, query, where, onSnapshot, orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import {
  Familia, Habitacion, SolicitudTransporte, Actividad, Cita,
} from "@/lib/types";
import { format, subDays, startOfMonth, endOfMonth, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowLeft, BarChart2, Users, BedDouble, Car, Activity,
  Calendar, Download, TrendingUp, Clock,
} from "lucide-react";

// ── Rango de fechas ───────────────────────────────────────────────────────────
type Rango = "mes" | "trimestre" | "total";

function inicioRango(rango: Rango): Date {
  const hoy = new Date();
  if (rango === "mes")      return startOfMonth(hoy);
  if (rango === "trimestre") return subDays(hoy, 90);
  return new Date(0); // total
}

// ── Barra horizontal ──────────────────────────────────────────────────────────
function BarraHorizontal({
  label, valor, total, color,
}: { label: string; valor: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((valor / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-24 shrink-0 truncate">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
        <div
          className="h-3 rounded-full transition-all"
          style={{ width: `${pct}%`, background: color, minWidth: valor > 0 ? "6px" : "0" }}
        />
      </div>
      <span className="text-xs font-bold w-8 text-right" style={{ color }}>{valor}</span>
    </div>
  );
}

// ── Métrica card ─────────────────────────────────────────────────────────────
function MetricaCard({
  icono, titulo, valor, subtitulo, color, bg,
}: {
  icono: React.ReactNode; titulo: string; valor: string | number;
  subtitulo?: string; color: string; bg: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}>
        {icono}
      </div>
      <p className="text-2xl font-bold" style={{ color }}>{valor}</p>
      <p className="text-xs font-medium text-gray-700 mt-0.5">{titulo}</p>
      {subtitulo && <p className="text-[11px] text-gray-400 mt-0.5">{subtitulo}</p>}
    </div>
  );
}

// ── Sección ───────────────────────────────────────────────────────────────────
function Seccion({ titulo, icono, children }: {
  titulo: string; icono: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
      <div className="flex items-center gap-2">
        {icono}
        <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: "#9A6A2A" }}>
          {titulo}
        </h2>
      </div>
      {children}
    </section>
  );
}

// ── Mini gráfica de barras verticales (7 días) ────────────────────────────────
function GraficaSemanal({ datos }: { datos: { label: string; valor: number }[] }) {
  const maximo = Math.max(...datos.map((d) => d.valor), 1);
  return (
    <div className="flex items-end gap-1.5" style={{ height: "64px" }}>
      {datos.map(({ label, valor }, i) => {
        const esHoy = i === datos.length - 1;
        const altura = Math.max((valor / maximo) * 100, valor > 0 ? 8 : 2);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-t-md transition-all"
              style={{
                height: `${altura}%`,
                background: esHoy
                  ? "linear-gradient(180deg,#C85A2A,#E87A3A)"
                  : "#F0E5D0",
                minHeight: "3px",
              }}
            />
            <span className="text-[9px] text-gray-400 capitalize">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Exportar CSV ──────────────────────────────────────────────────────────────
function exportarCSV(familias: Familia[]) {
  const encabezado = [
    "Nombre cuidador", "Niño", "Hospital", "Tratamiento",
    "Casa Ronald", "Habitación", "Fecha ingreso", "Días estancia",
  ].join(",");

  const filas = familias.map((f) => {
    const ingreso = f.fechaIngreso ? format(f.fechaIngreso.toDate(), "yyyy-MM-dd") : "";
    const dias = f.fechaIngreso ? differenceInDays(new Date(), f.fechaIngreso.toDate()) : 0;
    return [
      `"${f.nombreCuidador}"`,
      `"${f.nombreNino}"`,
      `"${f.hospital}"`,
      f.tipoTratamiento,
      `"${f.casaRonald}"`,
      f.habitacion ?? "",
      ingreso,
      dias,
    ].join(",");
  });

  const csv = [encabezado, ...filas].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mcfaro-reporte-${format(new Date(), "yyyy-MM-dd")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function ReportesPage() {
  const router = useRouter();
  const { familia: coord, cargando: authCargando } = useAuth();

  const [rango, setRango] = useState<Rango>("mes");

  const [familias,     setFamilias]     = useState<Familia[]>([]);
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [transportes,  setTransportes]  = useState<SolicitudTransporte[]>([]);
  const [actividades,  setActividades]  = useState<Actividad[]>([]);
  const [citas,        setCitas]        = useState<Cita[]>([]);
  const [cargando,     setCargando]     = useState(true);

  // Proteger ruta
  useEffect(() => {
    if (!authCargando && (!coord || coord.rol !== "coordinador")) {
      router.replace("/dashboard");
    }
  }, [coord, authCargando, router]);

  // Suscripciones
  useEffect(() => {
    if (!coord || coord.rol !== "coordinador") return;

    let pendientes = 5;
    const listo = () => { pendientes--; if (pendientes <= 0) setCargando(false); };

    const u1 = onSnapshot(
      query(collection(db, "familias"), where("rol", "==", "cuidador")),
      (s) => { setFamilias(s.docs.map((d) => ({ id: d.id, ...d.data() }) as Familia)); listo(); }
    );
    const u2 = onSnapshot(
      collection(db, "habitaciones"),
      (s) => { setHabitaciones(s.docs.map((d) => ({ id: d.id, ...d.data() }) as Habitacion)); listo(); }
    );
    const u3 = onSnapshot(
      query(collection(db, "solicitudesTransporte"), orderBy("creadaEn", "desc")),
      (s) => { setTransportes(s.docs.map((d) => ({ id: d.id, ...d.data() }) as SolicitudTransporte)); listo(); }
    );
    const u4 = onSnapshot(
      query(collection(db, "actividades"), orderBy("fechaHora", "desc")),
      (s) => { setActividades(s.docs.map((d) => ({ id: d.id, ...d.data() }) as Actividad)); listo(); }
    );
    const u5 = onSnapshot(
      query(collection(db, "citas"), orderBy("fecha", "desc")),
      (s) => { setCitas(s.docs.map((d) => ({ id: d.id, ...d.data() }) as Cita)); listo(); }
    );

    return () => { u1(); u2(); u3(); u4(); u5(); };
  }, [coord]);

  // ── Métricas calculadas ───────────────────────────────────────────────────
  const inicio = inicioRango(rango);

  const stats = useMemo(() => {
    const hoy = new Date();

    // Familias
    const famActivas  = familias.filter((f) => !f.fechaSalida);
    const famEnRango  = familias.filter((f) => f.fechaIngreso && f.fechaIngreso.toDate() >= inicio);
    const promDias    = famActivas.length > 0
      ? Math.round(famActivas.reduce((a, f) =>
          a + (f.fechaIngreso ? differenceInDays(hoy, f.fechaIngreso.toDate()) : 0), 0
        ) / famActivas.length)
      : 0;

    const porTratamiento = ["oncologia","cardiologia","neurologia","otro"].map((t) => ({
      label: t === "oncologia" ? "Oncología"
           : t === "cardiologia" ? "Cardiología"
           : t === "neurologia"  ? "Neurología" : "Otro",
      valor: famActivas.filter((f) => f.tipoTratamiento === t).length,
    }));

    // Habitaciones
    const habTotal       = habitaciones.length;
    const habOcupadas    = habitaciones.filter((h) => h.estado === "ocupada").length;
    const habDisponibles = habitaciones.filter((h) => h.estado === "disponible").length;
    const habMant        = habitaciones.filter((h) => h.estado === "mantenimiento").length;
    const pctOcupacion   = habTotal > 0 ? Math.round((habOcupadas / habTotal) * 100) : 0;

    // Transporte
    const transpEnRango = transportes.filter(
      (t) => t.creadaEn && t.creadaEn.toDate() >= inicio
    );
    const transpPorEstado = {
      pendiente:  transpEnRango.filter((t) => t.estado === "pendiente").length,
      asignada:   transpEnRango.filter((t) => t.estado === "asignada").length,
      en_camino:  transpEnRango.filter((t) => t.estado === "en_camino").length,
      completada: transpEnRango.filter((t) => t.estado === "completada").length,
      cancelada:  transpEnRango.filter((t) => t.estado === "cancelada").length,
    };

    // Actividades
    const actEnRango = actividades.filter(
      (a) => a.fechaHora && a.fechaHora.toDate() >= inicio
    );
    const participacionTotal = actEnRango.reduce((a, x) => a + (x.registrados ?? 0), 0);
    const promedioPartic = actEnRango.length > 0
      ? Math.round(participacionTotal / actEnRango.length)
      : 0;
    const actTop = [...actEnRango]
      .sort((a, b) => (b.registrados ?? 0) - (a.registrados ?? 0))
      .slice(0, 5);

    // Citas
    const citasEnRango = citas.filter(
      (c) => c.fecha && c.fecha.toDate() >= inicio
    );
    const citasCompletadas = citasEnRango.filter((c) => c.completada).length;
    const pctCompletadas = citasEnRango.length > 0
      ? Math.round((citasCompletadas / citasEnRango.length) * 100)
      : 0;
    const citasPorServicio = ["consulta","estudio","procedimiento","otro"].map((s) => ({
      label: s === "consulta" ? "Consulta"
           : s === "estudio" ? "Estudio"
           : s === "procedimiento" ? "Procedimiento" : "Otro",
      valor: citasEnRango.filter((c) => c.servicio === s).length,
    }));

    // Actividad últimos 7 días (ingresos de familias)
    const semana = Array.from({ length: 7 }, (_, i) => {
      const dia = subDays(hoy, 6 - i);
      const label = format(dia, "EEE", { locale: es });
      const valor = familias.filter((f) => {
        if (!f.fechaIngreso) return false;
        const fi = f.fechaIngreso.toDate();
        return (
          fi.getDate()     === dia.getDate() &&
          fi.getMonth()    === dia.getMonth() &&
          fi.getFullYear() === dia.getFullYear()
        );
      }).length;
      return { label, valor };
    });

    return {
      famActivas: famActivas.length,
      famEnRango: famEnRango.length,
      promDias,
      porTratamiento,
      habTotal, habOcupadas, habDisponibles, habMant, pctOcupacion,
      transpEnRango: transpEnRango.length,
      transpPorEstado,
      actEnRango: actEnRango.length,
      promedioPartic,
      actTop,
      citasEnRango: citasEnRango.length,
      citasCompletadas,
      pctCompletadas,
      citasPorServicio,
      semana,
    };
  }, [familias, habitaciones, transportes, actividades, citas, inicio]);

  const COLORES_TRATAMIENTO = ["#EF4444","#F59E0B","#8B5CF6","#6B7280"];

  if (authCargando || cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "#C85A2A", borderTopColor: "transparent" }} />
      </div>
    );
  }

  const RANGOS: { id: Rango; label: string }[] = [
    { id: "mes",       label: "Este mes" },
    { id: "trimestre", label: "3 meses" },
    { id: "total",     label: "Total" },
  ];

  return (
    <>
      {/* ── Banner ───────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden w-full"
        style={{ background: "linear-gradient(135deg,#C85A2A 0%,#E87A3A 70%,#F5C842 100%)" }}
      >
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-15"
          style={{ background: "#7A3D1A" }} />
        <div className="max-w-5xl mx-auto px-5 py-7 md:px-10">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-3 transition-colors"
          >
            <ArrowLeft size={14} /> Volver
          </button>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
                <BarChart2 size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white">Reportes y métricas</h1>
                <p className="text-white/70 text-sm">
                  {format(new Date(), "d 'de' MMMM yyyy", { locale: es })}
                </p>
              </div>
            </div>
            <button
              onClick={() => exportarCSV(familias)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white/20 text-white hover:bg-white/30 transition-colors"
            >
              <Download size={14} /> Exportar CSV
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-5 pb-12 md:px-10 space-y-5">

        {/* ── Selector de rango ─────────────────────────────── */}
        <div className="flex gap-1.5 bg-white rounded-xl p-1 border w-fit" style={{ borderColor: "#F0E5D0" }}>
          {RANGOS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setRango(id)}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                background: rango === id ? "#FDF0E6" : "transparent",
                color:      rango === id ? "#C85A2A" : "#9CA3AF",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── KPIs principales ──────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}
          className="md:grid-cols-4">
          <MetricaCard
            icono={<Users size={18} style={{ color: "#C85A2A" }} />}
            titulo="Familias activas"
            valor={stats.famActivas}
            subtitulo={`+${stats.famEnRango} en el periodo`}
            color="#C85A2A" bg="#FDF0E6"
          />
          <MetricaCard
            icono={<Clock size={18} className="text-blue-600" />}
            titulo="Estancia promedio"
            valor={`${stats.promDias}d`}
            subtitulo="familias activas"
            color="#1D4ED8" bg="#DBEAFE"
          />
          <MetricaCard
            icono={<BedDouble size={18} className="text-emerald-600" />}
            titulo="Ocupación"
            valor={`${stats.pctOcupacion}%`}
            subtitulo={`${stats.habOcupadas} / ${stats.habTotal} hab.`}
            color="#059669" bg="#D1FAE5"
          />
          <MetricaCard
            icono={<Calendar size={18} className="text-purple-600" />}
            titulo="Citas en periodo"
            valor={stats.citasEnRango}
            subtitulo={`${stats.pctCompletadas}% completadas`}
            color="#7C3AED" bg="#EDE9FE"
          />
        </div>

        {/* ── Layout 2 cols desktop ─────────────────────────── */}
        <div className="md:grid md:grid-cols-2 md:gap-5 space-y-5 md:space-y-0">

          {/* Ingresos últimos 7 días */}
          <Seccion
            titulo="Ingresos últimos 7 días"
            icono={<TrendingUp size={14} style={{ color: "#C85A2A" }} />}
          >
            <GraficaSemanal datos={stats.semana} />
          </Seccion>

          {/* Por tipo de tratamiento */}
          <Seccion
            titulo="Familias por tratamiento"
            icono={<Users size={14} style={{ color: "#C85A2A" }} />}
          >
            <div className="space-y-3">
              {stats.porTratamiento.map(({ label, valor }, i) => (
                <BarraHorizontal
                  key={label}
                  label={label}
                  valor={valor}
                  total={stats.famActivas || 1}
                  color={COLORES_TRATAMIENTO[i]}
                />
              ))}
            </div>
          </Seccion>
        </div>

        {/* ── Habitaciones ──────────────────────────────────── */}
        <Seccion
          titulo="Estado de habitaciones"
          icono={<BedDouble size={14} style={{ color: "#C85A2A" }} />}
        >
          {stats.habTotal === 0 ? (
            <p className="text-sm text-gray-400 text-center py-2">Sin habitaciones registradas</p>
          ) : (
            <div className="space-y-3">
              <BarraHorizontal label="Ocupadas"     valor={stats.habOcupadas}    total={stats.habTotal} color="#F59E0B" />
              <BarraHorizontal label="Disponibles"  valor={stats.habDisponibles} total={stats.habTotal} color="#10B981" />
              <BarraHorizontal label="Mantenimiento" valor={stats.habMant}       total={stats.habTotal} color="#EF4444" />
              {/* Barra compuesta */}
              <div className="mt-2 flex rounded-full overflow-hidden h-3">
                {stats.habOcupadas > 0 && (
                  <div style={{ width: `${(stats.habOcupadas / stats.habTotal) * 100}%`, background: "#F59E0B" }} />
                )}
                {stats.habMant > 0 && (
                  <div style={{ width: `${(stats.habMant / stats.habTotal) * 100}%`, background: "#EF4444" }} />
                )}
                {stats.habDisponibles > 0 && (
                  <div style={{ width: `${(stats.habDisponibles / stats.habTotal) * 100}%`, background: "#10B981" }} />
                )}
              </div>
            </div>
          )}
        </Seccion>

        {/* ── 2 cols: Transporte + Citas ────────────────────── */}
        <div className="md:grid md:grid-cols-2 md:gap-5 space-y-5 md:space-y-0">

          {/* Transporte */}
          <Seccion
            titulo={`Transporte (${stats.transpEnRango} solicitudes)`}
            icono={<Car size={14} style={{ color: "#C85A2A" }} />}
          >
            {stats.transpEnRango === 0 ? (
              <p className="text-sm text-gray-400 text-center py-2">Sin solicitudes en el periodo</p>
            ) : (
              <div className="space-y-3">
                {([
                  { key: "completada", label: "Completadas", color: "#10B981" },
                  { key: "en_camino",  label: "En camino",   color: "#3B82F6" },
                  { key: "asignada",   label: "Asignadas",   color: "#8B5CF6" },
                  { key: "pendiente",  label: "Pendientes",  color: "#F59E0B" },
                  { key: "cancelada",  label: "Canceladas",  color: "#EF4444" },
                ] as { key: keyof typeof stats.transpPorEstado; label: string; color: string }[]).map(
                  ({ key, label, color }) => (
                    <BarraHorizontal
                      key={key}
                      label={label}
                      valor={stats.transpPorEstado[key]}
                      total={stats.transpEnRango}
                      color={color}
                    />
                  )
                )}
              </div>
            )}
          </Seccion>

          {/* Citas por servicio */}
          <Seccion
            titulo={`Citas por servicio (${stats.citasEnRango})`}
            icono={<Calendar size={14} style={{ color: "#C85A2A" }} />}
          >
            {stats.citasEnRango === 0 ? (
              <p className="text-sm text-gray-400 text-center py-2">Sin citas en el periodo</p>
            ) : (
              <div className="space-y-3">
                {stats.citasPorServicio.map(({ label, valor }, i) => (
                  <BarraHorizontal
                    key={label}
                    label={label}
                    valor={valor}
                    total={stats.citasEnRango}
                    color={["#8B5CF6","#3B82F6","#F59E0B","#6B7280"][i]}
                  />
                ))}
                {/* % completadas */}
                <div className="pt-2 border-t" style={{ borderColor: "#F0E5D0" }}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Completadas</span>
                    <span className="font-bold" style={{ color: "#10B981" }}>
                      {stats.citasCompletadas} / {stats.citasEnRango} ({stats.pctCompletadas}%)
                    </span>
                  </div>
                  <div className="mt-1.5 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${stats.pctCompletadas}%`, background: "#10B981" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </Seccion>
        </div>

        {/* ── Actividades ───────────────────────────────────── */}
        <Seccion
          titulo={`Actividades (${stats.actEnRango} en periodo)`}
          icono={<Activity size={14} style={{ color: "#C85A2A" }} />}
        >
          {stats.actEnRango === 0 ? (
            <p className="text-sm text-gray-400 text-center py-2">Sin actividades en el periodo</p>
          ) : (
            <>
              <div className="flex gap-6 mb-4">
                <div>
                  <p className="text-xl font-bold" style={{ color: "#C85A2A" }}>
                    {stats.promedioPartic}
                  </p>
                  <p className="text-xs text-gray-500">Participantes promedio</p>
                </div>
              </div>

              {stats.actTop.length > 0 && (
                <>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-2">
                    Top 5 por asistencia
                  </p>
                  <div className="space-y-2.5">
                    {stats.actTop.map((act, i) => (
                      <div key={act.id} className="flex items-center gap-3">
                        <span className="text-xs font-bold w-4 text-gray-400">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700 truncate">{act.titulo}</p>
                          <p className="text-[11px] text-gray-400 capitalize">{act.tipo}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold" style={{ color: "#C85A2A" }}>
                            {act.registrados ?? 0}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            / {act.capacidadMax}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </Seccion>

      </div>
    </>
  );
}
