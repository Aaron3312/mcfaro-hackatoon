"use client";
// Dashboard principal — sidebar en desktop, hero compacto en mobile
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/hooks/useDashboard";
import { useActividades } from "@/hooks/useActividades";
import { format, differenceInDays, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { Users, ChevronRight, LogOut, Bus, UtensilsCrossed } from "lucide-react";
import { useEffect, useState } from "react";
import { Toast, useToast } from "@/components/ui/Toast";
import { SolicitarNotificaciones } from "@/components/ui/SolicitarNotificaciones";
import { suscribirMensajesEntrantes } from "@/lib/notificaciones";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { WidgetProximaActividad } from "@/components/dashboard/WidgetProximaActividad";
import { WidgetTransporte } from "@/components/dashboard/WidgetTransporte";
import { CarruselActividades } from "@/components/dashboard/CarruselActividades";
import { Skeleton } from "@/components/ui/Skeleton";
import { SolicitudTransporte, Menu } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const { familia } = useAuth();
  const { proximaActividad, transporteActivo, menuDia, cargando } =
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
          <AlertasActivas transporte={transporteActivo} />

          {/* Widgets */}
          <section>
            <SectionLabel label="Tu día de hoy" />
            {cargando ? (
              <div className="grid grid-cols-2 gap-3">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
                    <Skeleton className="h-5 w-2/3 mb-3" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <WidgetProximaActividad actividad={proximaActividad} />
                <WidgetTransporte solicitud={transporteActivo} />
              </div>
            )}
          </section>

          {/* Menú del día */}
          <MenuDia menu={menuDia} />

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
      <div className="md:hidden min-h-screen pb-28" style={{ background: "#F5F0E8" }}>

        {/* ── Hero ── */}
        <div className="relative overflow-hidden bg-ronald-gradient px-5 pt-14 pb-8">
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute top-20 -left-8 w-32 h-32 rounded-full bg-black/8 pointer-events-none" />

          {/* Top bar */}
          <div className="relative flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/20 flex items-center justify-center">
                <img src="/icons/icon-faro.svg" alt="mcFaro" className="w-full h-full object-contain p-0.5" />
              </div>
              <span className="text-white font-black text-base tracking-tight">mcFaro</span>
              {familia?.habitacion && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white/90">
                  Hab. {familia.habitacion}
                </span>
              )}
            </div>
            <button onClick={cerrarSesion} className="p-2 rounded-xl bg-white/15 text-white/80 active:bg-white/30">
              <LogOut size={15} />
            </button>
          </div>

          {/* Saludo + reloj en la misma fila */}
          <div className="relative flex items-start justify-between gap-3 mb-5">
            <div className="flex-1">
              <p className="text-white/55 text-[11px] font-semibold tracking-widest mb-1" style={{ textTransform: "capitalize" }}>
                {fechaFormateada}
              </p>
              <h1 className="text-white font-black leading-tight mb-1" style={{ fontSize: 28 }}>
                Hola, {nombreCorto} 👋
              </h1>
              {familia?.nombreNino && (
                <p className="text-white/75 text-sm">
                  Con <span className="font-bold text-white">{familia.nombreNino}</span>
                </p>
              )}
              {diasRestantes !== null && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 border border-white/20">
                  <span className="text-sm leading-none">
                    {diasRestantes <= 0 ? "🏠" : diasRestantes <= 3 ? "📅" : "🗓️"}
                  </span>
                  <p className="text-white/90 text-xs font-semibold">
                    {diasRestantes <= 0 ? "Último día" : diasRestantes === 1 ? "Mañana termina" : `${diasRestantes} días`}
                  </p>
                </div>
              )}
            </div>
            {/* Reloj compacto */}
            <div className="shrink-0 bg-white/15 backdrop-blur-sm rounded-2xl px-3 py-2.5 text-center border border-white/20">
              <div className="text-white font-black tabular-nums leading-none text-3xl">
                {horaFormateada}
              </div>
              <div className="text-white/45 text-xs tabular-nums mt-0.5">:{segundos}</div>
            </div>
          </div>

          {/* Tip de bienestar — dentro del hero, franja inferior */}
          {wellnessTip && (
            <div className="relative flex items-center gap-3 bg-white/10 rounded-2xl px-4 py-3 border border-white/15">
              <span className="text-xl shrink-0">{wellnessTip.emoji}</span>
              <p className="text-white/85 text-xs leading-snug">{wellnessTip.mensaje}</p>
            </div>
          )}
        </div>

        <div className="px-4 pt-4 flex flex-col gap-5">
          {familia?.id && <SolicitarNotificaciones familiaId={familia.id} />}

          {/* ── Alerta transporte activo (solo en_camino / asignada) ── */}
          {transporteActivo && ["asignada", "en_camino"].includes(transporteActivo.estado) && (
            <a href="/transporte"
              className="flex items-center gap-3 rounded-2xl px-4 py-3.5 border active:opacity-80"
              style={{
                background: transporteActivo.estado === "en_camino" ? "#D1FAE5" : "#DBEAFE",
                borderColor: transporteActivo.estado === "en_camino" ? "#6EE7B7" : "#93C5FD",
              }}>
              <div className="relative w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: transporteActivo.estado === "en_camino" ? "#A7F3D0" : "#BFDBFE" }}>
                <Bus size={18} style={{ color: transporteActivo.estado === "en_camino" ? "#065F46" : "#1D4ED8" }} />
                {transporteActivo.estado === "en_camino" && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 animate-pulse border-2 border-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-black uppercase tracking-wider"
                  style={{ color: transporteActivo.estado === "en_camino" ? "#065F46" : "#1D4ED8" }}>
                  {transporteActivo.estado === "en_camino" ? "En camino" : "Transporte asignado"}
                </p>
                <p className="text-sm font-semibold text-gray-700 truncate mt-0.5">{transporteActivo.destino}</p>
              </div>
              <ChevronRight size={15} className="text-gray-400 shrink-0" />
            </a>
          )}


          {/* Menú del día */}
          <MenuDia menu={menuDia} />

          {/* ── Próximas actividades ── */}
          <section>
            <CarruselActividades actividades={actividades} cargando={cargandoActividades} />
          </section>

          {/* ── Tu día — widgets en scroll horizontal ── */}
          <section>
            <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-3">Tu día</p>
            {cargando ? (
              <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="min-w-[150px] h-28 shrink-0 bg-white rounded-2xl shadow-sm animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 snap-x snap-mandatory scrollbar-none">
                {proximaActividad && (
                  <div className="min-w-[150px] shrink-0 snap-start"><WidgetProximaActividad actividad={proximaActividad} /></div>
                )}
                {transporteActivo && (
                  <div className="min-w-[150px] shrink-0 snap-start"><WidgetTransporte solicitud={transporteActivo} /></div>
                )}
                {!proximaActividad && !transporteActivo && (
                  <div className="w-full bg-white rounded-2xl p-4 shadow-sm text-center py-8">
                    <p className="text-sm text-gray-400">Todo tranquilo por ahora 🌿</p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ── Accesos rápidos ── */}
          <section>
            <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-3">Accesos rápidos</p>
            <div className="grid grid-cols-2 gap-3">
              <QuickLink href="/actividades" emoji="🎨" titulo="Actividades" descripcion="Talleres y clases" color="#7C3AED" bgColor="#F5F3FF" />
              <QuickLink href="/transporte" emoji="🚌" titulo="Transporte" descripcion="Pedir traslado" color="#C85A2A" bgColor="#FDF0E6" />
              <QuickLink href="/recursos" emoji="📖" titulo="Recursos" descripcion="Reglamento y FAQ" color="#059669" bgColor="#F0FDF4" />
            </div>
          </section>

          {/* Panel coordinador */}
          {familia?.rol === "coordinador" && (
            <button
              onClick={() => router.push("/coordinador")}
              className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-gray-100 active:bg-gray-50"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-ronald-beige">
                <Users size={20} className="text-ronald-orange" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold text-gray-800">Panel coordinador</p>
                <p className="text-xs text-gray-500 mt-0.5">Gestión de familias y operaciones</p>
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

function AlertasActivas({ transporte }: { transporte: SolicitudTransporte | null }) {
  if (!transporte || !["pendiente", "asignada", "en_camino"].includes(transporte.estado)) {
    return null;
  }

  const info = etiquetasTransporte[transporte.estado];

  return (
    <section>
      <a
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
  href, emoji, titulo, descripcion, color, bgColor, horizontal = false,
}: {
  href: string;
  emoji: string;
  titulo: string;
  descripcion: string;
  color: string;
  bgColor: string;
  horizontal?: boolean;
}) {
  const router = useRouter();

  if (horizontal) {
    return (
      <button
        onClick={() => router.push(href)}
        className="w-full rounded-2xl p-4 text-left shadow-sm active:scale-[0.98] transition-all duration-150 flex items-center gap-4"
        style={{ background: bgColor }}
      >
        <span className="text-xl w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${color}18` }}>
          {emoji}
        </span>
        <div>
          <p className="font-bold text-gray-800 text-sm">{titulo}</p>
          <p className="text-gray-500 text-xs mt-0.5 leading-snug">{descripcion}</p>
        </div>
        <ChevronRight size={16} className="ml-auto shrink-0 text-gray-300" />
      </button>
    );
  }

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

/* ── MenuDia ──────────────────────────────────────────────── */
const COMIDAS_CONFIG = [
  { key: "desayuno" as const, label: "Desayuno", emoji: "🌅" },
  { key: "comida"   as const, label: "Comida",   emoji: "☀️" },
  { key: "cena"     as const, label: "Cena",      emoji: "🌙" },
];

function MenuDia({ menu }: { menu: Menu | null }) {
  const ahora = new Date();
  const minActual = ahora.getHours() * 60 + ahora.getMinutes();

  // Una comida se considera pasada 2 horas después de su hora de inicio
  const pasado = (hora: string) => {
    const [h, m] = hora.split(":").map(Number);
    return h * 60 + m + 120 < minActual;
  };

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <UtensilsCrossed size={14} className="text-gray-400" />
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Menú del día</p>
      </div>

      {!menu ? (
        <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
          <p className="text-sm text-gray-400">El coordinador aún no publicó el menú de hoy</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {COMIDAS_CONFIG.map(({ key, label, emoji }) => {
            const comida = menu.comidas[key];
            const ya = pasado(comida.hora);
            return (
              <div
                key={key}
                className={`bg-white rounded-2xl p-3 shadow-sm flex flex-col gap-1.5 ${ya ? "opacity-50" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base">{emoji}</span>
                  <span className="text-[10px] font-bold tabular-nums text-gray-400">{comida.hora}</span>
                </div>
                <p className="text-xs font-bold text-gray-700">{label}</p>
                <p className="text-xs text-gray-500 leading-snug line-clamp-3">{comida.descripcion}</p>
                {ya && (
                  <span className="text-[10px] font-semibold text-gray-400">Ya pasó</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
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
