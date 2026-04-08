"use client";
// Dashboard principal — widgets informativos + accesos rápidos (issue #38)
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/hooks/useDashboard";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Users, ChevronRight, Clock, LogOut,
  Calendar, UtensilsCrossed, Bus, Activity, BookOpen,
} from "lucide-react";
import { useEffect } from "react";
import { Toast, useToast } from "@/components/ui/Toast";
import { SolicitarNotificaciones } from "@/components/ui/SolicitarNotificaciones";
import { suscribirMensajesEntrantes } from "@/lib/notificaciones";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { WidgetProximaComida } from "@/components/dashboard/WidgetProximaComida";
import { WidgetProximaActividad } from "@/components/dashboard/WidgetProximaActividad";
import { WidgetTransporte } from "@/components/dashboard/WidgetTransporte";
import { WidgetProximaCita } from "@/components/dashboard/WidgetProximaCita";
import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardPage() {
  const router = useRouter();
  const { familia } = useAuth();
  const { proximaCita, proximaComida, proximaActividad, transporteActivo, cargando } =
    useDashboard(familia?.id, familia?.casaRonald);
  const { toast, mostrar, cerrar } = useToast();
  const ahora = new Date();

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
  const fechaFormateada = format(ahora, "EEEE d 'de' MMMM", { locale: es });
  const nombreCorto = familia?.nombreCuidador?.split(" ")[0] ?? "cuidador";
  const horaActual = parseInt(horaFormateada.split(":")[0]);

  return (
    <>
      {/* ── HERO ───────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden w-full"
        style={{ background: "linear-gradient(135deg, #C85A2A 0%, #E87A3A 65%, #F5C842 100%)" }}
      >
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-15" style={{ background: "#7A3D1A" }} />
        <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full opacity-10" style={{ background: "#F7EDD5" }} />

        <div className="relative max-w-6xl mx-auto px-5 pt-10 pb-8 md:px-10 md:pt-8 md:pb-10">
          {/* Topbar: logo + habitación + salir */}
          <div className="flex items-center justify-between mb-6 md:hidden">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-md shrink-0" style={{ background: "#F7EDD5" }}>
                <img src="/icons/icon-full.svg" alt="mcFaro" className="w-full h-full object-cover" />
              </div>
              <span className="text-white font-bold text-base tracking-tight">mcFaro</span>
              {/* Número de habitación siempre visible */}
              {familia?.habitacion && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/25 text-white">
                  Hab. {familia.habitacion}
                </span>
              )}
            </div>
            <button
              onClick={cerrarSesion}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-sm font-medium bg-white/15 active:bg-white/25"
            >
              <LogOut size={16} />
              <span>Salir</span>
            </button>
          </div>

          {/* Saludo + reloj */}
          <div className="md:flex md:items-end md:justify-between md:gap-8">
            <div>
              <p className="text-white/70 text-sm capitalize font-medium mb-1">{fechaFormateada}</p>
              <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                Hola, {nombreCorto} 👋
              </h1>
              {familia?.nombreNino && (
                <p className="text-white/80 text-sm mt-2">
                  Acompañando a <span className="font-semibold text-white">{familia.nombreNino}</span>
                </p>
              )}
              {familia?.tipoTratamiento && (
                <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white capitalize">
                  {familia.tipoTratamiento}
                </span>
              )}
            </div>

            <div className="mt-4 md:mt-0 md:text-right shrink-0">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-2xl"
                style={{ background: "rgba(122,61,26,0.28)" }}
              >
                <Clock size={14} className="text-white/70 md:hidden" />
                <span className="text-white font-bold text-xl md:text-4xl tracking-widest">
                  {horaFormateada}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENIDO ──────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 pt-5 pb-28 md:px-8 md:pt-8 md:pb-10">

        {/* Tip de bienestar */}
        <WellnessTip horaActual={horaActual} />

        {/* Banner notificaciones push */}
        {familia?.id && (
          <div className="mt-4">
            <SolicitarNotificaciones familiaId={familia.id} />
          </div>
        )}

        {/* ── Tu día de hoy: grid de widgets ─────────────────── */}
        <section className="mt-5">
          <h2 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "#9A6A2A" }}>
            Tu día de hoy
          </h2>

          {cargando ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
                  <Skeleton className="h-5 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
              <WidgetProximaCita cita={proximaCita} />
              <WidgetProximaComida comida={proximaComida} />
              <WidgetProximaActividad actividad={proximaActividad} />
              <WidgetTransporte solicitud={transporteActivo} />
            </div>
          )}
        </section>

        {/* ── Accesos rápidos ─────────────────────────────────── */}
        <section className="mt-6">
          <h2 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "#9A6A2A" }}>
            Accesos rápidos
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
            <AccesoRapido
              href="/actividades"
              icono={Activity}
              titulo="Actividades"
              descripcion="Talleres y eventos"
              bg="linear-gradient(135deg, #F5F3FF, #EDE9FE)"
              iconoBg="rgba(124,58,237,0.10)"
              iconoColor="text-purple-600"
              chevronColor="text-purple-300"
            />
            <AccesoRapido
              href="/transporte"
              icono={Bus}
              titulo="Transporte"
              descripcion="Pedir traslado"
              bg="linear-gradient(135deg, #FDF0E6, #FDDCBF)"
              iconoBg="rgba(200,90,42,0.12)"
              iconoColor=""
              chevronColor=""
              iconoStyle={{ color: "#C85A2A" }}
              chevronStyle={{ color: "#E8A080" }}
            />
            <AccesoRapido
              href="/recursos"
              icono={BookOpen}
              titulo="Recursos"
              descripcion="Reglamento y FAQ"
              bg="linear-gradient(135deg, #F0FDF4, #DCFCE7)"
              iconoBg="rgba(22,163,74,0.10)"
              iconoColor="text-green-600"
              chevronColor="text-green-300"
            />
          </div>
        </section>

        {/* ── Panel coordinador (solo si corresponde) ─────────── */}
        {familia?.rol === "coordinador" && (
          <button
            onClick={() => router.push("/coordinador")}
            className="w-full mt-4 bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md active:bg-gray-50 transition-all"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#FDF0E6" }}>
              <Users size={20} style={{ color: "#C85A2A" }} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-gray-800">Panel coordinador</p>
              <p className="text-xs text-gray-400">Gestión de familias y operaciones</p>
            </div>
            <ChevronRight size={16} className="text-gray-300 shrink-0" />
          </button>
        )}
      </div>

      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrar} />}
    </>
  );
}

/* ── WellnessTip ──────────────────────────────────────────── */
function WellnessTip({ horaActual }: { horaActual: number }) {
  const tips = [
    { rango: [6, 9],   emoji: "☀️", mensaje: "Buenos días. ¿Ya desayunaste antes de salir?" },
    { rango: [9, 13],  emoji: "💧", mensaje: "Recuerda tomar agua. Ya llevas un rato en el hospital." },
    { rango: [13, 15], emoji: "🍎", mensaje: "Es hora de comer algo, aunque sea poco." },
    { rango: [15, 19], emoji: "🪑", mensaje: "¿Has podido sentarte a descansar hoy?" },
    { rango: [19, 22], emoji: "🌙", mensaje: "El día casi termina. Cuídate para cuidar bien mañana." },
    { rango: [22, 24], emoji: "😴", mensaje: "Intenta descansar esta noche. Mañana sigue la fuerza." },
    { rango: [0, 6],   emoji: "🌟", mensaje: "Estás velando con mucho amor. Recuerda respirar." },
  ];
  const tip = tips.find(({ rango }) => horaActual >= rango[0] && horaActual < rango[1]);
  if (!tip) return null;

  return (
    <div className="rounded-2xl p-4 flex gap-3 items-start shadow-sm"
      style={{ background: "linear-gradient(135deg, #FFF8E6, #FEF3C7)" }}>
      <span className="text-2xl shrink-0 mt-0.5">{tip.emoji}</span>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "#9A6A2A" }}>
          Momento para ti
        </p>
        <p className="text-sm font-medium leading-relaxed" style={{ color: "#7A3D1A" }}>
          {tip.mensaje}
        </p>
      </div>
    </div>
  );
}

/* ── AccesoRapido ─────────────────────────────────────────── */
function AccesoRapido({
  href, icono: Icono, titulo, descripcion,
  bg, iconoBg, iconoColor, chevronColor,
  iconoStyle, chevronStyle,
}: {
  href: string;
  icono: React.ElementType;
  titulo: string;
  descripcion: string;
  bg: string;
  iconoBg: string;
  iconoColor: string;
  chevronColor: string;
  iconoStyle?: React.CSSProperties;
  chevronStyle?: React.CSSProperties;
}) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(href)}
      className="relative overflow-hidden rounded-2xl p-4 text-left shadow-sm hover:shadow-md active:scale-95 transition-all"
      style={{ background: bg }}
    >
      <div className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center"
        style={{ background: iconoBg }}>
        <Icono size={20} className={iconoColor} style={iconoStyle} />
      </div>
      <p className="font-bold text-gray-800 text-sm">{titulo}</p>
      <p className="text-gray-500 text-xs mt-0.5">{descripcion}</p>
      <ChevronRight size={13} className={`absolute right-3 bottom-4 ${chevronColor}`} style={chevronStyle} />
    </button>
  );
}
