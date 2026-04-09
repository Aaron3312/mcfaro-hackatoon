"use client";
// Dashboard principal — sidebar en desktop, hero compacto en mobile
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/hooks/useDashboard";
import { useActividades } from "@/hooks/useActividades";
import { format, differenceInDays, startOfDay, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { Users, ChevronRight, LogOut, Bus, Stethoscope, UtensilsCrossed } from "lucide-react";
import { useEffect, useState } from "react";
import { Toast, useToast } from "@/components/ui/Toast";
import { SolicitarNotificaciones } from "@/components/ui/SolicitarNotificaciones";
import { suscribirMensajesEntrantes } from "@/lib/notificaciones";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { WidgetProximaComida } from "@/components/dashboard/WidgetProximaComida";
import { WidgetProximaActividad } from "@/components/dashboard/WidgetProximaActividad";
import { WidgetTransporte } from "@/components/dashboard/WidgetTransporte";
import { WidgetProximaCita } from "@/components/dashboard/WidgetProximaCita";
import { CarruselActividades } from "@/components/dashboard/CarruselActividades";
import { Skeleton } from "@/components/ui/Skeleton";
import { Cita, SolicitudTransporte } from "@/lib/types";
import { ProximaComida } from "@/lib/helpers/menu";

export default function DashboardPage() {
  const router = useRouter();
  const { familia } = useAuth();
  const { proximaCita, proximaComida, proximaActividad, transporteActivo, cargando } =
    useDashboard(familia?.id, familia?.casaRonald);
  const { actividades, cargando: cargandoActividades } = useActividades(familia?.casaRonald, familia?.id);
  const { toast, mostrar, cerrar } = useToast();
  const [ahora, setAhora] = useState(() => new Date());

  // Actualiza el reloj cada segundo
  useEffect(() => {
    const id = setInterval(() => setAhora(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Mensajes push en primer plano → toast
  useEffect(() => {
    if (!familia?.id) return;
    let unsub: (() => void) | null = null;
    suscribirMensajesEntrantes((titulo, cuerpo) => {
      mostrar(`${titulo}: ${cuerpo}`);
    }).then((fn) => { unsub = fn; });
    return () => { unsub?.(); };
  }, [familia?.id]);

  const cerrarSesion = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  const horaFormateada = format(ahora, "HH:mm");
  const segundos = String(ahora.getSeconds()).padStart(2, "0");
  const fechaFormateada = format(ahora, "EEEE d 'de' MMMM", { locale: es });
  const nombreCorto = familia?.nombreCuidador?.split(" ")[0] ?? "cuidador";
  const horaActual = parseInt(horaFormateada.split(":")[0]);
  const wellnessTip = getWellnessTip(horaActual);

  // Días restantes de estancia
  const diasRestantes = (() => {
    const salida = familia?.fechaSalidaPlanificada ?? familia?.fechaSalida;
    if (!salida) return null;
    const diff = differenceInDays(startOfDay(salida.toDate()), startOfDay(new Date()));
    return diff;
  })();

  return (
    <>
      {/* ── LAYOUT DESKTOP: sidebar + main ───────────────────────── */}
      <div className="hidden md:flex h-[calc(100vh-4rem)] overflow-hidden bg-[#FAF7F2]">

        {/* SIDEBAR */}
        <aside className="w-72 lg:w-80 bg-ronald-gradient flex flex-col shrink-0 overflow-hidden relative">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -bottom-16 -left-10 w-52 h-52 rounded-full bg-black/10 pointer-events-none" />

          <div className="relative flex flex-col h-full p-7 gap-5">
            {/* Reloj */}
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-4">
              <p className="text-white/65 text-[11px] font-semibold uppercase tracking-widest mb-1">
                {fechaFormateada}
              </p>
              <div className="text-white font-bold text-5xl tracking-tight leading-none tabular-nums">
                {horaFormateada}
                <span className="text-white/45 font-normal text-2xl">:{segundos}</span>
              </div>
            </div>

            {/* Saludo */}
            <div>
              <p className="text-white/70 text-sm mb-1">Bienvenido de vuelta</p>
              <h1 className="text-white font-bold text-3xl leading-tight">
                Hola, {nombreCorto} 👋
              </h1>
              {familia?.nombreNino && (
                <p className="text-white/80 text-sm mt-2">
                  Acompañando a <span className="font-bold text-white">{familia.nombreNino}</span>
                </p>
              )}
            </div>

            {/* Días de estancia restantes */}
            {diasRestantes !== null && (
              <div className={`rounded-2xl px-4 py-3 flex items-center gap-3 ${
                diasRestantes <= 2
                  ? "bg-white/25"
                  : "bg-white/15"
              }`}>
                <span className="text-2xl shrink-0">
                  {diasRestantes <= 0 ? "🏠" : diasRestantes <= 3 ? "📅" : "🗓️"}
                </span>
                <div>
                  <p className="text-white/65 text-[10px] font-bold uppercase tracking-wider">
                    Estancia
                  </p>
                  <p className="text-white font-bold text-sm leading-tight">
                    {diasRestantes <= 0
                      ? "Hoy es el último día"
                      : diasRestantes === 1
                      ? "Mañana termina la estancia"
                      : `${diasRestantes} días restantes`}
                  </p>
                </div>
              </div>
            )}

            {/* Tip de bienestar — empuja hacia abajo con mt-auto */}
            {wellnessTip && (
              <div className="mt-auto bg-white/15 rounded-2xl p-4 flex gap-3 items-start">
                <span className="text-2xl shrink-0">{wellnessTip.emoji}</span>
                <div>
                  <p className="text-white/65 text-[10px] font-bold uppercase tracking-wider mb-1">
                    Momento para ti
                  </p>
                  <p className="text-white/90 text-xs leading-relaxed">
                    {wellnessTip.mensaje}
                  </p>
                </div>
              </div>
            )}

            {/* Cerrar sesión */}
            <button
              onClick={cerrarSesion}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 transition-colors text-white text-sm font-semibold w-fit"
            >
              <LogOut size={15} />
              Cerrar sesión
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto px-8 py-7 flex flex-col gap-5">
          {familia?.id && <SolicitarNotificaciones familiaId={familia.id} />}

          {/* Alertas activas */}
          <AlertasActivas
            transporte={transporteActivo}
            proximaCita={proximaCita}
            proximaComida={proximaComida}
            ahora={ahora}
          />

          {/* Widgets */}
          <section>
            <SectionLabel label="Tu día de hoy" />
            {cargando ? (
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
                    <Skeleton className="h-5 w-2/3 mb-3" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3">
                <WidgetProximaCita cita={proximaCita} />
                <WidgetProximaComida comida={proximaComida} />
                <WidgetProximaActividad actividad={proximaActividad} />
                <WidgetTransporte solicitud={transporteActivo} />
              </div>
            )}
          </section>

          {/* Carrusel de Actividades */}
          <section>
            <CarruselActividades
              actividades={actividades}
              cargando={cargandoActividades}
            />
          </section>

          {/* Accesos rápidos */}
          <section>
            <SectionLabel label="Accesos rápidos" />
            <div className="grid grid-cols-3 gap-3">
              <QuickLink href="/actividades" emoji="🎨" titulo="Actividades" descripcion="Talleres y eventos" color="#7C3AED" bgColor="#F5F3FF" />
              <QuickLink href="/transporte" emoji="🚌" titulo="Transporte" descripcion="Pedir traslado" color="#C85A2A" bgColor="#FDF0E6" />
              <QuickLink href="/recursos" emoji="📖" titulo="Recursos" descripcion="Reglamento y FAQ" color="#059669" bgColor="#F0FDF4" />
            </div>
          </section>

          {/* Panel coordinador */}
          {familia?.rol === "coordinador" && (
            <button
              onClick={() => router.push("/coordinador")}
              className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all border border-gray-100"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-ronald-beige">
                <Users size={20} className="text-ronald-orange" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold text-gray-800">Panel coordinador</p>
                <p className="text-xs text-gray-500">Gestión de familias y operaciones</p>
              </div>
              <ChevronRight size={16} className="text-gray-300 shrink-0" />
            </button>
          )}
        </main>
      </div>

      {/* ── LAYOUT MOBILE ──────────────────────────────────────────── */}
      <div className="md:hidden bg-[#FAF7F2] min-h-screen pb-24">

        {/* Hero compacto */}
        <div className="relative bg-ronald-gradient overflow-hidden px-5 pt-6 pb-7">
          <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/10 pointer-events-none" />
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl overflow-hidden bg-white/20 flex items-center justify-center">
                <img src="/icons/icon-faro.svg" alt="mcFaro" className="w-full h-full object-contain p-1" />
              </div>
              <span className="text-white font-bold text-lg">mcFaro</span>
              {familia?.habitacion && (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/25 text-white">
                  Hab. {familia.habitacion}
                </span>
              )}
            </div>
            <button
              onClick={cerrarSesion}
              className="p-2 rounded-xl bg-white/20 text-white"
            >
              <LogOut size={16} />
            </button>
          </div>

          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-white/65 text-xs capitalize mb-1">{fechaFormateada}</p>
              <h1 className="text-white font-bold text-2xl leading-tight">
                Hola, {nombreCorto} 👋
              </h1>
              {familia?.nombreNino && (
                <p className="text-white/80 text-sm mt-1">
                  Acompañando a <span className="font-bold text-white">{familia.nombreNino}</span>
                </p>
              )}
              {diasRestantes !== null && (
                <p className="text-white/70 text-xs mt-1.5">
                  {diasRestantes <= 0
                    ? "🏠 Hoy termina la estancia"
                    : diasRestantes === 1
                    ? "📅 Mañana termina la estancia"
                    : `🗓️ ${diasRestantes} días de estancia restantes`}
                </p>
              )}
            </div>
            <div className="shrink-0 bg-white/15 rounded-xl px-3 py-2 text-right">
              <div className="text-white font-bold text-2xl tracking-tight tabular-nums leading-none">
                {horaFormateada}
                <span className="text-white/45 text-base font-normal">:{segundos}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tip de bienestar */}
        {wellnessTip && (
          <div className="mx-4 mt-4 rounded-2xl p-4 flex gap-3 items-start bg-linear-to-r from-amber-50 to-yellow-50 border border-yellow-100">
            <span className="text-xl shrink-0">{wellnessTip.emoji}</span>
            <div>
              <p className="text-amber-700 text-[10px] font-bold uppercase tracking-wider mb-0.5">Momento para ti</p>
              <p className="text-amber-900 text-sm leading-relaxed">{wellnessTip.mensaje}</p>
            </div>
          </div>
        )}

        <div className="px-4 pt-5 flex flex-col gap-5">
          {familia?.id && <SolicitarNotificaciones familiaId={familia.id} />}

          {/* Alertas activas */}
          <AlertasActivas
            transporte={transporteActivo}
            proximaCita={proximaCita}
            proximaComida={proximaComida}
            ahora={ahora}
          />

          {/* Widgets */}
          <section>
            <SectionLabel label="Tu día de hoy" />
            {cargando ? (
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
                    <Skeleton className="h-5 w-2/3 mb-3" />
                    <Skeleton className="h-4 w-full mb-2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <WidgetProximaCita cita={proximaCita} />
                <WidgetProximaComida comida={proximaComida} />
                <WidgetProximaActividad actividad={proximaActividad} />
                <WidgetTransporte solicitud={transporteActivo} />
              </div>
            )}
          </section>

          {/* Carrusel de Actividades */}
          <section>
            <CarruselActividades
              actividades={actividades}
              cargando={cargandoActividades}
            />
          </section>

          {/* Accesos rápidos */}
          <section>
            <SectionLabel label="Accesos rápidos" />
            <div className="grid grid-cols-3 gap-3">
              <QuickLink href="/actividades" emoji="🎨" titulo="Actividades" descripcion="Talleres" color="#7C3AED" bgColor="#F5F3FF" />
              <QuickLink href="/transporte" emoji="🚌" titulo="Transporte" descripcion="Traslado" color="#C85A2A" bgColor="#FDF0E6" />
              <QuickLink href="/recursos" emoji="📖" titulo="Recursos" descripcion="FAQ" color="#059669" bgColor="#F0FDF4" />
            </div>
          </section>

          {familia?.rol === "coordinador" && (
            <button
              onClick={() => router.push("/coordinador")}
              className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-gray-100"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-ronald-beige">
                <Users size={20} className="text-ronald-orange" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold text-gray-800">Panel coordinador</p>
                <p className="text-xs text-gray-500">Gestión de familias</p>
              </div>
              <ChevronRight size={16} className="text-gray-300 shrink-0" />
            </button>
          )}
        </div>
      </div>

      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrar} />}
    </>
  );
}

/* ── AlertasActivas ───────────────────────────────────────── */
const etiquetasTransporte: Record<string, { texto: string; color: string; bg: string; pulso: boolean }> = {
  pendiente:  { texto: "Pendiente de asignación", color: "#B45309", bg: "#FEF3C7", pulso: false },
  asignada:   { texto: "Chofer asignado",          color: "#1D4ED8", bg: "#DBEAFE", pulso: false },
  en_camino:  { texto: "En camino",                color: "#065F46", bg: "#D1FAE5", pulso: true  },
  completada: { texto: "Completado",               color: "#6B7280", bg: "#F3F4F6", pulso: false },
  cancelada:  { texto: "Cancelado",                color: "#991B1B", bg: "#FEE2E2", pulso: false },
};

function AlertasActivas({
  transporte, proximaCita, proximaComida, ahora,
}: {
  transporte: SolicitudTransporte | null;
  proximaCita: Cita | null;
  proximaComida: ProximaComida | null;
  ahora: Date;
}) {
  const alertas: React.ReactNode[] = [];

  // Transporte activo (estados que siguen en curso)
  if (transporte && ["pendiente", "asignada", "en_camino"].includes(transporte.estado)) {
    const info = etiquetasTransporte[transporte.estado];
    alertas.push(
      <a
        key="transporte"
        href="/transporte"
        className="flex items-center gap-3 rounded-2xl px-4 py-3 shadow-sm border transition-shadow hover:shadow-md"
        style={{ background: info.bg, borderColor: `${info.color}30` }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 relative"
          style={{ background: `${info.color}18` }}
        >
          <Bus size={18} style={{ color: info.color }} />
          {info.pulso && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse border-2 border-white" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: info.color }}>
            Transporte activo
          </p>
          <p className="text-sm font-semibold text-gray-800 truncate">
            {info.texto} · {transporte.destino}
          </p>
        </div>
        <ChevronRight size={15} className="text-gray-400 shrink-0" />
      </a>
    );
  }

  // Cita médica hoy
  if (proximaCita && isSameDay(proximaCita.fecha.toDate(), ahora)) {
    const horaCita = format(proximaCita.fecha.toDate(), "HH:mm");
    alertas.push(
      <a
        key="cita"
        href="/actividades"
        className="flex items-center gap-3 rounded-2xl px-4 py-3 shadow-sm border border-blue-100 bg-blue-50 transition-shadow hover:shadow-md"
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-blue-100">
          <Stethoscope size={18} className="text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
            Cita médica hoy
          </p>
          <p className="text-sm font-semibold text-gray-800 truncate">
            {proximaCita.titulo} · {horaCita}
          </p>
        </div>
        <ChevronRight size={15} className="text-gray-400 shrink-0" />
      </a>
    );
  }

  // Comida disponible ahora
  if (proximaComida?.disponible) {
    alertas.push(
      <a
        key="comida"
        href="/menu"
        className="flex items-center gap-3 rounded-2xl px-4 py-3 shadow-sm border border-orange-100 bg-orange-50 transition-shadow hover:shadow-md"
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-ronald-beige">
          <UtensilsCrossed size={18} className="text-ronald-orange" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-ronald-brown-medium">
            ¡Comida lista!
          </p>
          <p className="text-sm font-semibold text-gray-800">
            {proximaComida.tipo} disponible ahora · Gratuito ❤️
          </p>
        </div>
        <ChevronRight size={15} className="text-gray-400 shrink-0" />
      </a>
    );
  }

  if (alertas.length === 0) return null;

  return (
    <section className="flex flex-col gap-2">
      {alertas}
    </section>
  );
}

/* ── SectionLabel ─────────────────────────────────────────── */
function SectionLabel({ label }: { label: string }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">
      {label}
    </p>
  );
}

/* ── QuickLink ────────────────────────────────────────────── */
function QuickLink({
  href, emoji, titulo, descripcion, color, bgColor,
}: {
  href: string;
  emoji: string;
  titulo: string;
  descripcion: string;
  color: string;
  bgColor: string;
}) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(href)}
      className="group rounded-2xl p-4 text-left shadow-sm hover:shadow-md active:scale-[0.97] transition-all duration-150 flex flex-col gap-3"
      style={{ background: bgColor }}
    >
      <span
        className="text-xl w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: `${color}18` }}
      >
        {emoji}
      </span>
      <div>
        <p className="font-bold text-gray-800 text-sm">{titulo}</p>
        <p className="text-gray-500 text-xs mt-0.5 leading-snug">{descripcion}</p>
      </div>
    </button>
  );
}

/* ── WellnessTip helper ───────────────────────────────────── */
function getWellnessTip(hora: number) {
  const tips = [
    { rango: [6, 9],   emoji: "☀️", mensaje: "Buenos días. ¿Ya desayunaste antes de salir?" },
    { rango: [9, 13],  emoji: "💧", mensaje: "Recuerda tomar agua. Ya llevas un rato en el hospital." },
    { rango: [13, 15], emoji: "🍎", mensaje: "Es hora de comer algo, aunque sea poco." },
    { rango: [15, 19], emoji: "🪑", mensaje: "¿Has podido sentarte a descansar hoy?" },
    { rango: [19, 22], emoji: "🌙", mensaje: "El día casi termina. Cuídate para cuidar bien mañana." },
    { rango: [22, 24], emoji: "😴", mensaje: "Intenta descansar esta noche. Mañana sigue la fuerza." },
    { rango: [0, 6],   emoji: "🌟", mensaje: "Estás velando con mucho amor. Recuerda respirar." },
  ];
  return tips.find(({ rango }) => hora >= rango[0] && hora < rango[1]) ?? null;
}
