"use client";
// Panel del coordinador — dashboard con ocupación en tiempo real
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Familia, Habitacion } from "@/lib/types";
import { format, differenceInDays, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { Users, Activity, Car, Home, BedDouble, Wrench, TrendingUp, UsersRound, QrCode, MessageSquare, ShieldCheck } from "lucide-react";

// ── Gráfica de ocupación CSS (últimos 7 días) ─────────────────────────────────
function GraficaOcupacion({ familias }: { familias: Familia[] }) {
  const hoy = new Date();

  // Calcular familias activas por día de los últimos 7 días
  const dias = Array.from({ length: 7 }, (_, i) => {
    const dia = subDays(hoy, 6 - i);
    const label = format(dia, "EEE", { locale: es });
    // Familias que ya habían ingresado en ese día (simplificado)
    const activas = familias.filter((f) => {
      if (!f.fechaIngreso) return false;
      const ingreso = f.fechaIngreso.toDate();
      return ingreso <= dia;
    }).length;
    return { label, activas, dia };
  });

  const maximo = Math.max(...dias.map((d) => d.activas), 1);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={16} style={{ color: "#C85A2A" }} />
        <h3 className="text-xs font-bold uppercase tracking-wide" style={{ color: "#9A6A2A" }}>
          Familias activas — últimos 7 días
        </h3>
      </div>
      <div className="flex items-end gap-2" style={{ height: "80px" }}>
        {dias.map(({ label, activas }, i) => {
          const esHoy = i === 6;
          const altura = maximo > 0 ? Math.max((activas / maximo) * 100, 4) : 4;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] font-bold" style={{ color: esHoy ? "#C85A2A" : "#9CA3AF" }}>
                {activas > 0 ? activas : ""}
              </span>
              <div
                className="w-full rounded-t-lg transition-all"
                style={{
                  height: `${altura}%`,
                  background: esHoy
                    ? "linear-gradient(180deg, #C85A2A, #E87A3A)"
                    : "#F0E5D0",
                  minHeight: "4px",
                }}
              />
              <span className="text-[9px] text-gray-400 capitalize">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Mapa de habitaciones ──────────────────────────────────────────────────────
function MapaHabitaciones({
  habitaciones,
  familias,
}: {
  habitaciones: Habitacion[];
  familias: Familia[];
}) {
  if (habitaciones.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
        <BedDouble size={28} className="mx-auto mb-2 text-gray-200" />
        <p className="text-sm text-gray-400">No hay habitaciones registradas</p>
        <p className="text-xs text-gray-300 mt-1">Agrégalas desde Firestore</p>
      </div>
    );
  }

  const ESTADO_CONFIG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    disponible:   { bg: "#D1FAE5", text: "#065F46", dot: "#10B981", label: "Libre" },
    ocupada:      { bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B", label: "Ocupada" },
    mantenimiento:{ bg: "#FEE2E2", text: "#991B1B", dot: "#EF4444", label: "Mant." },
    bloqueada:    { bg: "#F3F4F6", text: "#374151", dot: "#9CA3AF", label: "Bloqueada" },
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <h3 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "#9A6A2A" }}>
        Estado de habitaciones
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))", gap: "8px" }}>
        {habitaciones.map((h) => {
          const config = ESTADO_CONFIG[h.estado];
          const familia = h.familiaId ? familias.find((f) => f.id === h.familiaId) : null;
          return (
            <div
              key={h.id}
              className="rounded-xl p-2 text-center"
              style={{ background: config.bg }}
              title={familia ? `${familia.nombreCuidador}` : config.label}
            >
              <div
                className="w-2 h-2 rounded-full mx-auto mb-1"
                style={{ background: config.dot }}
              />
              <p className="text-xs font-bold" style={{ color: config.text }}>
                {h.numero}
              </p>
              <p className="text-[9px]" style={{ color: config.text, opacity: 0.7 }}>
                {familia ? familia.nombreCuidador.split(" ")[0] : config.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function CoordinadorPage() {
  const router = useRouter();
  const { familia, cargando } = useAuth();
  const [familias, setFamilias] = useState<Familia[]>([]);
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  useEffect(() => {
    if (!cargando && familia && familia.rol !== "coordinador") {
      router.replace("/dashboard");
    }
  }, [familia, cargando, router]);

  useEffect(() => {
    if (!familia || familia.rol !== "coordinador") return;

    // Familias activas
    const qFamilias = query(collection(db, "familias"), where("rol", "==", "cuidador"));
    const unsubFamilias = onSnapshot(qFamilias, (snap) => {
      setFamilias(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Familia));
      setCargandoDatos(false);
    });

    // Habitaciones en tiempo real
    const unsubHabitaciones = onSnapshot(
      collection(db, "habitaciones"),
      (snap) => setHabitaciones(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Habitacion))
    );

    return () => { unsubFamilias(); unsubHabitaciones(); };
  }, [familia]);

  if (cargando || cargandoDatos) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "#C85A2A", borderTopColor: "transparent" }} />
      </div>
    );
  }

  const hoy = new Date();

  // Métricas de habitaciones
  const habDisponibles   = habitaciones.filter((h) => h.estado === "disponible").length;
  const habOcupadas      = habitaciones.filter((h) => h.estado === "ocupada").length;
  const habMantenimiento = habitaciones.filter((h) => h.estado === "mantenimiento").length;
  const totalHab         = habitaciones.length;
  const pctOcupacion     = totalHab > 0 ? Math.round((habOcupadas / totalHab) * 100) : 0;

  // Métricas de familias
  const promedioDias = familias.length > 0
    ? Math.round(
        familias.reduce((acc, f) =>
          acc + (f.fechaIngreso ? differenceInDays(hoy, f.fechaIngreso.toDate()) : 0), 0
        ) / familias.length
      )
    : 0;

  return (
    <>
      {/* ── Banner ───────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden w-full"
        style={{ background: "linear-gradient(135deg, #C85A2A 0%, #E87A3A 70%, #F5C842 100%)" }}
      >
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-15"
          style={{ background: "#7A3D1A" }} />
        <div className="max-w-6xl mx-auto px-5 py-8 md:px-10 md:py-10">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Panel coordinador</h1>
          <p className="text-white/70 text-sm mt-1 capitalize">
            {format(hoy, "EEEE d 'de' MMMM", { locale: es })}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-6 pb-10 md:px-10 md:pt-8">

        {/* ── Métricas principales — 2 cols mobile / 4 desktop ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}
          className="mb-5 md:grid-cols-4">
          <div className="bg-white rounded-2xl shadow-sm p-4 md:col-span-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ background: "#FDF0E6" }}>
              <Users size={18} style={{ color: "#C85A2A" }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: "#7A3D1A" }}>{familias.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Familias activas</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-emerald-50">
              <Home size={18} className="text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-emerald-700">{pctOcupacion}%</p>
            <p className="text-xs text-gray-500 mt-0.5">Ocupación</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-blue-50">
              <BedDouble size={18} className="text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-700">{habDisponibles}</p>
            <p className="text-xs text-gray-500 mt-0.5">Habitaciones libres</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-purple-50">
              <Activity size={18} className="text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-700">{promedioDias}d</p>
            <p className="text-xs text-gray-500 mt-0.5">Estancia promedio</p>
          </div>
        </div>

        {/* ── Indicadores de habitaciones ───────────────────── */}
        {totalHab > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "#9A6A2A" }}>
              Ocupación en tiempo real — {totalHab} habitaciones
            </h2>
            {/* Barra de ocupación compuesta */}
            <div className="flex rounded-full overflow-hidden h-4 mb-3">
              {habOcupadas > 0 && (
                <div
                  className="flex items-center justify-center text-[9px] font-bold text-white transition-all"
                  style={{ width: `${(habOcupadas / totalHab) * 100}%`, background: "#F59E0B" }}
                >
                  {habOcupadas}
                </div>
              )}
              {habMantenimiento > 0 && (
                <div
                  className="flex items-center justify-center text-[9px] font-bold text-white transition-all"
                  style={{ width: `${(habMantenimiento / totalHab) * 100}%`, background: "#EF4444" }}
                >
                  {habMantenimiento}
                </div>
              )}
              {habDisponibles > 0 && (
                <div
                  className="flex items-center justify-center text-[9px] font-bold text-white transition-all"
                  style={{ width: `${(habDisponibles / totalHab) * 100}%`, background: "#10B981" }}
                >
                  {habDisponibles}
                </div>
              )}
            </div>
            {/* Leyenda */}
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                <span className="text-gray-600">Ocupadas ({habOcupadas})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400 shrink-0" />
                <span className="text-gray-600">Mantenimiento ({habMantenimiento})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                <span className="text-gray-600">Disponibles ({habDisponibles})</span>
              </span>
            </div>
          </div>
        )}

        {/* ── Layout desktop: 2 columnas ────────────────────── */}
        <div className="md:grid md:grid-cols-2 md:gap-6 space-y-5 md:space-y-0 mb-5">
          <GraficaOcupacion familias={familias} />
          <MapaHabitaciones habitaciones={habitaciones} familias={familias} />
        </div>

        {/* ── Accesos rápidos a módulos ─────────────────────── */}
        <div className="grid grid-cols-1 gap-3 mb-6 md:grid-cols-3">
          {[
            {
              href: "/coordinador/transporte",
              icon: <Car size={20} style={{ color: "#C85A2A" }} />,
              bg: "#FDF0E6",
              titulo: "Transporte",
              sub: "Solicitudes y unidades",
            },
            {
              href: "/coordinador/actividades",
              icon: <Activity size={20} className="text-purple-600" />,
              bg: "#EDE9FE",
              titulo: "Actividades",
              sub: "Crear, editar, registrados",
            },
            {
              href: "/coordinador/habitaciones",
              icon: <BedDouble size={20} className="text-blue-600" />,
              bg: "#DBEAFE",
              titulo: "Habitaciones",
              sub: "Asignación y estado",
            },
            {
              href: "/coordinador/familias",
              icon: <UsersRound size={20} className="text-green-600" />,
              bg: "#D1FAE5",
              titulo: "Familias",
              sub: "Fichas y gestión",
            },
            {
              href: "/coordinador/escanear",
              icon: <QrCode size={20} style={{ color: "#C85A2A" }} />,
              bg: "#FDF0E6",
              titulo: "Escanear QR",
              sub: "Check-in de cuidadores",
            },
            {
              href: "/coordinador/comunidad",
              icon: <MessageSquare size={20} className="text-purple-600" />,
              bg: "#EDE9FE",
              titulo: "Comunidad",
              sub: "Grupos y moderación",
            },
            {
              href: "/coordinador/usuarios",
              icon: <ShieldCheck size={20} className="text-teal-600" />,
              bg: "#CCFBF1",
              titulo: "Usuarios y roles",
              sub: "Permisos y acceso",
            },
          ].map(({ href, icon, bg, titulo, sub }) => (
            <button
              key={href}
              onClick={() => router.push(href)}
              className="flex items-center gap-3 bg-white rounded-2xl shadow-sm p-4 text-left hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: bg }}>
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm">{titulo}</p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{sub}</p>
              </div>
              <span className="text-gray-300 shrink-0">›</span>
            </button>
          ))}
        </div>

        {/* ── Familias hospedadas ───────────────────────────── */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "#9A6A2A" }}>
            Familias hospedadas ({familias.length})
          </h2>
          {familias.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
              <Users size={28} className="mx-auto mb-2 opacity-25 text-gray-400" />
              <p className="text-sm text-gray-400">No hay familias activas</p>
            </div>
          ) : (
            <div className="space-y-2 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
              {familias.map((f) => {
                const diasEstancia = f.fechaIngreso
                  ? differenceInDays(hoy, f.fechaIngreso.toDate())
                  : 0;
                const hab = habitaciones.find((h) => h.familiaId === f.id);
                return (
                  <div key={f.id} className="bg-white rounded-2xl shadow-sm p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 truncate">{f.nombreCuidador}</p>
                        {f.nombreNino && (
                          <p className="text-gray-500 text-sm mt-0.5 truncate">
                            Acompañando a <span className="font-medium">{f.nombreNino}</span>
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{f.hospital}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-lg font-bold" style={{ color: "#7A3D1A" }}>
                          {diasEstancia}d
                        </span>
                        <p className="text-xs text-gray-400">estancia</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600">
                        {f.tipoTratamiento}
                      </span>
                      {hab && (
                        <span className="text-xs font-medium px-2.5 py-1 rounded-lg flex items-center gap-1"
                          style={{ background: "#DBEAFE", color: "#1E40AF" }}>
                          <BedDouble size={10} /> Hab. {hab.numero}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
