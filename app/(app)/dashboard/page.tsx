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
import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardPage() {
  const router = useRouter();
  const { familia } = useAuth();
  const { proximaCita, proximaComida, proximaActividad, transporteActivo, cargando } =
    useDashboard(familia?.id, familia?.casaRonald);
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

  return (
    <>
      {/* ── HERO ───────────────────────────────────────────────── */}
      <div className="relative overflow-hidden w-full bg-ronald-gradient">
        {/* Decoración de fondo */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-ronald-brown/15" />
        <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-ronald-beige-light/10" />

        <div className="relative w-full px-5 pt-10 pb-8 md:px-10 md:pt-16 md:pb-12">
          {/* Topbar mobile: logo + habitación + salir */}
          <div className="flex items-center justify-between mb-8 md:hidden">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="w-11 h-11 rounded-2xl overflow-hidden shadow-lg shrink-0 bg-ronald-beige-light/95 flex items-center justify-center">
                <img src="/icons/icon-faro.svg" alt="mcFaro" className="w-full h-full object-contain p-1" />
              </div>
              <span className="text-white font-bold text-lg tracking-tight">mcFaro</span>
              {familia?.habitacion && (
                <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/25 text-white shadow-sm">
                  Hab. {familia.habitacion}
                </span>
              )}
            </div>
            <button
              onClick={cerrarSesion}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-sm font-semibold bg-white/15 hover:bg-white/25 active:bg-white/30 transition-colors shadow-sm"
            >
              <LogOut size={16} />
              <span>Salir</span>
            </button>
          </div>

          {/* Saludo + reloj */}
          <div className="md:flex md:items-end md:justify-between md:gap-10">
            <div className="flex-1">
              <p className="text-white/75 text-sm md:text-base capitalize font-medium mb-2">
                {fechaFormateada}
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-3">
                Hola, {nombreCorto} 👋
              </h1>
              {familia?.nombreNino && (
                <p className="text-white/85 text-base md:text-lg mt-3">
                  Acompañando a <span className="font-bold text-white">{familia.nombreNino}</span>
                </p>
              )}
              {familia?.tipoTratamiento && (
                <span className="inline-block mt-3 px-4 py-1.5 rounded-full text-xs font-bold bg-white/25 text-white capitalize shadow-sm">
                  {familia.tipoTratamiento}
                </span>
              )}
            </div>

            {/* Reloj - jerarquía visual clara */}
            <div className="mt-6 md:mt-0 md:text-right shrink-0">
              <div className="inline-flex items-center gap-2.5 px-5 py-3 md:px-7 md:py-4 rounded-2xl bg-ronald-brown/30 shadow-lg backdrop-blur-sm">
                <Clock size={16} className="text-white/70 md:hidden" />
                <span className="text-white font-bold text-2xl md:text-5xl tracking-wider">
                  {horaFormateada}
                  <span className="text-white/50 font-normal text-base md:text-2xl">:{segundos}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENIDO ──────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-28 md:px-8 md:pt-10 md:pb-16">

        {/* Tip de bienestar */}
        <WellnessTip horaActual={horaActual} />

        {/* Banner notificaciones push */}
        {familia?.id && (
          <div className="mt-5">
            <SolicitarNotificaciones familiaId={familia.id} />
          </div>
        )}

        {/* ── Tu día de hoy: grid de widgets ─────────────────── */}
        <section className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-4 text-ronald-brown-medium">
            Tu día de hoy
          </h2>

          {cargando ? (
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
                  <Skeleton className="h-5 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
              <WidgetProximaCita cita={proximaCita} />
              <WidgetProximaComida comida={proximaComida} />
              <WidgetProximaActividad actividad={proximaActividad} />
              <WidgetTransporte solicitud={transporteActivo} />
            </div>
          )}
        </section>

        {/* ── Accesos rápidos ─────────────────────────────────── */}
        <section className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-4 text-ronald-brown-medium">
            Accesos rápidos
          </h2>
          <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3">
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
            className="w-full mt-6 bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md active:bg-gray-50 transition-all"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-ronald-beige">
              <Users size={22} className="text-ronald-orange" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-base font-bold text-gray-800">Panel coordinador</p>
              <p className="text-sm text-gray-500">Gestión de familias y operaciones</p>
            </div>
            <ChevronRight size={18} className="text-gray-300 shrink-0" />
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
    <div className="rounded-2xl p-5 flex gap-4 items-start shadow-sm bg-ronald-gradient-warm border border-yellow-100">
      <span className="text-3xl shrink-0">{tip.emoji}</span>
      <div className="flex-1">
        <p className="text-xs font-bold uppercase tracking-wider mb-2 text-ronald-brown-medium">
          Momento para ti
        </p>
        <p className="text-sm md:text-base font-medium leading-relaxed text-ronald-brown">
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
      className="group relative overflow-hidden rounded-2xl p-5 text-left shadow-sm hover:shadow-lg active:scale-[0.98] transition-all duration-200"
      style={{ background: bg }}
    >
      <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center transition-transform group-hover:scale-110"
        style={{ background: iconoBg }}>
        <Icono size={22} className={iconoColor} style={iconoStyle} />
      </div>
      <p className="font-bold text-gray-800 text-base mb-1">{titulo}</p>
      <p className="text-gray-600 text-sm leading-snug">{descripcion}</p>
      <ChevronRight
        size={16}
        className={`absolute right-4 bottom-4 transition-transform group-hover:translate-x-0.5 ${chevronColor}`}
        style={chevronStyle}
      />
    </button>
  );
}
