"use client";
// Dashboard principal del cuidador
import { useAuth } from "@/hooks/useAuth";
import { useCitas } from "@/hooks/useCitas";
import { Calendar, Wind, Map, ChevronRight, Clock } from "lucide-react";
import { format, isToday, isTomorrow } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";

const acciones = [
  { href: "/calendario", icono: Calendar, label: "Mis citas",   color: "#EFF6FF", iconColor: "#3B82F6" },
  { href: "/rutina",     icono: Clock,    label: "Mi rutina",   color: "#F0FDF4", iconColor: "#22C55E" },
  { href: "/respira",    icono: Wind,     label: "Respira",     color: "#FDF0E6", iconColor: "#C85A2A" },
  { href: "/mapa",       icono: Map,      label: "Mapa",        color: "#FAF5FF", iconColor: "#A855F7" },
];

function etiquetaFecha(fecha: Date): string {
  if (isToday(fecha)) return `Hoy ${format(fecha, "HH:mm")}`;
  if (isTomorrow(fecha)) return `Mañana ${format(fecha, "HH:mm")}`;
  return format(fecha, "EEE d MMM HH:mm", { locale: es });
}

export default function DashboardPage() {
  const { familia } = useAuth();
  const { citas } = useCitas();
  const hoy = new Date();

  // Próximas citas (máx 2)
  const proximas = citas
    .filter((c) => c.fecha.toDate() >= hoy)
    .sort((a, b) => a.fecha.toDate().getTime() - b.fecha.toDate().getTime())
    .slice(0, 2);

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
          <p className="text-white/70 text-sm capitalize">
            {format(hoy, "EEEE d 'de' MMMM", { locale: es })}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-white mt-1">
            Hola, {familia?.nombreCuidador?.split(" ")[0] ?? "cuidador"} 👋
          </h1>
          {familia?.nombreNino && (
            <p className="text-white/80 text-sm mt-1">
              Acompañando a <span className="font-semibold">{familia.nombreNino}</span>
            </p>
          )}
        </div>
      </div>

      {/* ── Contenido ────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 pt-5 pb-4 md:px-10 md:pt-8 space-y-5
                      md:grid md:grid-cols-2 md:gap-8 md:space-y-0 md:items-start">

        {/* Columna izquierda */}
        <div className="space-y-5">
          {/* Próxima cita */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold uppercase tracking-wide" style={{ color: "#9A6A2A" }}>
                Próximas citas
              </h2>
              <Link href="/calendario" className="text-xs font-medium flex items-center gap-0.5"
                style={{ color: "#C85A2A" }}>
                Ver todas <ChevronRight size={12} />
              </Link>
            </div>
            {proximas.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
                <Calendar size={28} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm text-gray-400">Sin citas próximas</p>
                <Link href="/calendario"
                  className="inline-block mt-3 text-sm font-medium px-4 py-2 rounded-xl"
                  style={{ background: "#FDF0E6", color: "#C85A2A" }}>
                  Agregar cita
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {proximas.map((cita) => (
                  <div key={cita.id} className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3"
                    style={{ borderLeft: "4px solid #C85A2A" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "#FDF0E6" }}>
                      <Clock size={18} style={{ color: "#C85A2A" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{cita.titulo}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{etiquetaFecha(cita.fecha.toDate())}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-lg shrink-0"
                      style={{ background: "#FDF0E6", color: "#C85A2A" }}>
                      {cita.servicio}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Consejo de bienestar */}
          <div className="rounded-2xl p-4"
            style={{ background: "linear-gradient(135deg, #FFF8E6, #FEF3C7)" }}>
            <p className="text-sm font-medium leading-relaxed" style={{ color: "#7A3D1A" }}>
              🌟 Recuerda: cuidarte no es egoísmo. Tu bienestar es la energía de tu familia.
            </p>
          </div>
        </div>

        {/* Columna derecha — accesos rápidos */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "#9A6A2A" }}>
            Accesos rápidos
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {acciones.map(({ href, icono: Icono, label, color, iconColor }) => (
              <Link key={href} href={href}
                className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-3 active:scale-95 transition-transform hover:shadow-md">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: color }}>
                  <Icono size={20} style={{ color: iconColor }} />
                </div>
                <p className="text-sm font-semibold text-gray-700">{label}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
