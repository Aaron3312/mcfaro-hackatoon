"use client";
// Dashboard principal mejorado con widgets informativos
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/hooks/useDashboard";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Wind,
  Users,
  ChevronRight,
  Clock,
  Home as HomeIcon,
  LogOut,
  Calendar,
  UtensilsCrossed,
  Bus,
  Activity,
} from "lucide-react";
import { useState } from "react";
import { Toast, useToast } from "@/components/ui/Toast";
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
  const { proximaCita, proximaComida, proximaActividad, transporteActivo, cargando } = useDashboard(
    familia?.id,
    familia?.casaRonald
  );
  const { toast, mostrar, cerrar } = useToast();
  const ahora = new Date();

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
      {/* ════════════════════════════════════════════
          HEADER — con número de habitación
      ════════════════════════════════════════════ */}
      <div className="relative overflow-hidden w-full bg-ronald-gradient">
        {/* Círculos decorativos */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-15 bg-ronald-brown" />
        <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full opacity-10 bg-ronald-beige-light" />

        <div className="relative max-w-6xl mx-auto px-5 pt-10 pb-8 md:px-10 md:pt-8 md:pb-10">
          {/* Fila top: logo + habitación + salir */}
          <div className="flex items-center justify-between mb-6 md:mb-8 md:hidden">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-md flex-shrink-0 bg-ronald-beige-light">
                <img src="/icons/icon-full.svg" alt="mcFaro" className="w-full h-full object-cover" />
              </div>
              <span className="text-white font-bold text-base tracking-tight">mcFaro</span>
              {/* Número de habitación siempre visible */}
              {familia?.casaRonald && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/25 text-white">
                  Hab. {familia.casaRonald.split("-").pop() || "—"}
                </span>
              )}
            </div>
            <button
              onClick={cerrarSesion}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-sm font-medium active:bg-white/20 transition-colors bg-white/15"
              aria-label="Cerrar sesión"
            >
              <LogOut size={16} />
              <span>Salir</span>
            </button>
          </div>

          {/* Contenido hero */}
          <div className="md:flex md:items-end md:justify-between md:gap-8">
            {/* Saludo personalizado */}
            <div>
              <p className="text-white/70 text-sm capitalize font-medium mb-1">{fechaFormateada}</p>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                Hola, {nombreCorto} 👋
              </h1>
              {familia?.nombreNino && (
                <p className="text-white/80 text-sm md:text-base mt-2">
                  Acompañando a <span className="font-semibold text-white">{familia.nombreNino}</span>
                </p>
              )}
            </div>

            {/* Reloj */}
            <div className="mt-4 md:mt-0 md:text-right shrink-0">
              <div className="inline-flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-2xl bg-ronald-brown/30">
                <Clock size={14} className="text-white/70 md:hidden" />
                <span className="text-white font-bold text-xl md:text-3xl lg:text-4xl tracking-wider">
                  {horaFormateada}
                </span>
              </div>
              <p className="text-white/50 text-xs mt-1 hidden md:block">hora actual</p>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          CONTENIDO — Grid responsive
      ════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 pt-5 pb-24 md:pb-8 md:px-6 lg:px-8 md:pt-8">
        {/* Tip de bienestar */}
        <WellnessTip horaActual={horaActual} />

        {/* Grid de widgets informativos */}
        <section className="mt-5">
          <h2 className="text-sm font-bold uppercase tracking-wide mb-3 text-ronald-brown">
            Tu día de hoy
          </h2>

          {cargando ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 md:gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 md:gap-4">
              <WidgetProximaCita cita={proximaCita} />
              <WidgetProximaComida
                tipo={proximaComida?.tipo || null}
                hora={proximaComida?.hora || null}
                disponible={proximaComida?.disponible || false}
              />
              <WidgetProximaActividad actividad={proximaActividad} />
              <WidgetTransporte solicitud={transporteActivo} />
            </div>
          )}
        </section>

        {/* Accesos rápidos a módulos principales */}
        <section className="mt-6">
          <h2 className="text-sm font-bold uppercase tracking-wide mb-3 text-ronald-brown">
            Accesos rápidos
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <AccesoRapido
              href="/calendario"
              icono={Calendar}
              titulo="Calendario"
              descripcion="Ver citas"
              bgClass="bg-gradient-to-br from-blue-50 to-blue-100"
              iconoColorClass="text-blue-600"
              iconoBgClass="bg-blue-600/10"
            />
            <AccesoRapido
              href="/menu"
              icono={UtensilsCrossed}
              titulo="Menú"
              descripcion="Comidas hoy"
              bgClass="bg-ronald-gradient-soft"
              iconoColorClass="text-ronald-orange"
              iconoBgClass="bg-ronald-orange/10"
            />
            <AccesoRapido
              href="/transporte"
              icono={Bus}
              titulo="Transporte"
              descripcion="Solicitar"
              bgClass="bg-ronald-gradient-soft"
              iconoColorClass="text-ronald-orange"
              iconoBgClass="bg-ronald-orange/10"
            />
            <AccesoRapido
              href="/actividades"
              icono={Activity}
              titulo="Actividades"
              descripcion="Ver eventos"
              bgClass="bg-gradient-to-br from-green-50 to-green-100"
              iconoColorClass="text-green-600"
              iconoBgClass="bg-green-600/10"
            />
          </div>
        </section>

        {/* Panel del coordinador */}
        {familia?.rol === "coordinador" && (
          <section className="mt-6">
            <button
              onClick={() => router.push("/coordinador")}
              className="w-full bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md active:bg-gray-50 transition-all min-h-[72px]"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-ronald-beige">
                <Users size={20} className="text-ronald-orange" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold text-gray-800">Panel coordinador</p>
                <p className="text-xs text-gray-400">Ver familias y alertas</p>
              </div>
              <ChevronRight size={16} className="text-gray-300 shrink-0" />
            </button>
          </section>
        )}
      </div>

      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrar} />}
    </>
  );
}

/* ══════════════════════════════════════════════════════════
   COMPONENTES AUXILIARES
══════════════════════════════════════════════════════════ */

function WellnessTip({ horaActual }: { horaActual: number }) {
  const tips = [
    { rango: [6, 9], emoji: "☀️", mensaje: "Buenos días. ¿Ya desayunaste antes de salir?" },
    { rango: [9, 13], emoji: "💧", mensaje: "Recuerda tomar agua. Ya llevas un rato en el hospital." },
    { rango: [13, 15], emoji: "🍎", mensaje: "Es hora de comer algo, aunque sea poco." },
    { rango: [15, 19], emoji: "🪑", mensaje: "¿Has podido sentarte a descansar hoy?" },
    { rango: [19, 22], emoji: "🌙", mensaje: "El día casi termina. Cuídate para cuidar bien mañana." },
    { rango: [22, 24], emoji: "😴", mensaje: "Intenta descansar esta noche. Mañana sigue la fuerza." },
    { rango: [0, 6], emoji: "🌟", mensaje: "Estás velando con mucho amor. Recuerda respirar." },
  ];

  const tip = tips.find(({ rango }) => horaActual >= rango[0] && horaActual < rango[1]);
  if (!tip) return null;

  return (
    <div className="rounded-2xl p-4 flex gap-3 items-start shadow-sm bg-ronald-gradient-warm">
      <span className="text-2xl shrink-0 mt-0.5">{tip.emoji}</span>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide mb-1 text-ronald-brown-medium">
          Momento para ti
        </p>
        <p className="text-sm font-medium leading-relaxed text-ronald-brown">
          {tip.mensaje}
        </p>
      </div>
    </div>
  );
}

interface AccesoRapidoProps {
  href: string;
  icono: React.ElementType;
  titulo: string;
  descripcion: string;
  bgClass: string;
  iconoColorClass: string;
  iconoBgClass: string;
}

function AccesoRapido({
  href,
  icono: Icono,
  titulo,
  descripcion,
  bgClass,
  iconoColorClass,
  iconoBgClass
}: AccesoRapidoProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(href)}
      className={`relative overflow-hidden rounded-2xl p-4 text-left shadow-sm hover:shadow-md active:scale-95 transition-all min-h-[110px] ${bgClass}`}
    >
      <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center ${iconoBgClass}`}>
        <Icono size={20} className={iconoColorClass} />
      </div>
      <p className="font-bold text-gray-800 text-sm leading-tight">{titulo}</p>
      <p className="text-gray-500 text-xs mt-0.5">{descripcion}</p>
      <ChevronRight size={13} className={`absolute right-3 bottom-4 opacity-30 ${iconoColorClass}`} />
    </button>
  );
}
