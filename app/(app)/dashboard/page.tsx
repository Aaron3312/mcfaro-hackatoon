"use client";
// Dashboard principal — responsive: mobile (1 col + bottom nav) / desktop (2 cols + top nav)
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Wind,
  Bell,
  Users,
  BellRing,
  LogOut,
  ChevronRight,
  Clock,
  Bus,
  Activity,
} from "lucide-react";
import { useState } from "react";
import { Toast, useToast } from "@/components/ui/Toast";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function DashboardPage() {
  const router = useRouter();
  const { familia } = useAuth();
  const { toast, mostrar, cerrar } = useToast();
  const [disparandoPush, setDisparandoPush] = useState(false);
  const ahora = new Date();

  const cerrarSesion = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  const dispararRecordatorios = async () => {
    setDisparandoPush(true);
    try {
      const res = await fetch("/api/recordatorios", {
        headers: { authorization: "Bearer mcfaro-demo-2026" },
      });
      const datos = await res.json();
      mostrar(
        datos.enviadas > 0
          ? `✓ ${datos.enviadas} notificación(es) enviada(s)`
          : "Sin recordatorios pendientes"
      );
    } catch {
      mostrar("Error al disparar recordatorios", "error");
    } finally {
      setDisparandoPush(false);
    }
  };

  const horaFormateada = format(ahora, "HH:mm");
  const fechaFormateada = format(ahora, "EEEE d 'de' MMMM", { locale: es });
  const nombreCorto = familia?.nombreCuidador?.split(" ")[0] ?? "cuidador";
  const horaActual = parseInt(horaFormateada.split(":")[0]);

  return (
    <>
      {/* ════════════════════════════════════════════
          HERO — ancho completo de pantalla
      ════════════════════════════════════════════ */}
      <div
        className="relative overflow-hidden w-full"
        style={{ background: "linear-gradient(135deg, #C85A2A 0%, #E87A3A 65%, #F5C842 100%)" }}
      >
        {/* Círculos decorativos */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-15"
          style={{ background: "#7A3D1A" }} />
        <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full opacity-10"
          style={{ background: "#F7EDD5" }} />
        <div className="absolute top-1/2 right-1/4 w-20 h-20 rounded-full opacity-10 hidden md:block"
          style={{ background: "#F5C842" }} />

        <div className="relative max-w-6xl mx-auto px-5 pt-10 pb-8 md:px-10 md:pt-8 md:pb-10">
          {/* Fila top: logo + salir — oculto en desktop porque ya está en el top nav */}
          <div className="flex items-center justify-between mb-6 md:mb-8 md:hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-md flex-shrink-0"
                style={{ background: "#F7EDD5" }}>
                <img src="/icons/icon-full.svg" alt="mcFaro" className="w-full h-full object-cover" />
              </div>
              <span className="text-white font-bold text-base tracking-tight">mcFaro</span>
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

          {/* Contenido hero — split en desktop */}
          <div className="md:flex md:items-end md:justify-between md:gap-8">
            {/* Saludo */}
            <div>
              <p className="text-white/70 text-sm capitalize font-medium mb-1">
                {fechaFormateada}
              </p>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                Hola, {nombreCorto} 👋
              </h1>
              {familia?.nombreNino && (
                <p className="text-white/80 text-sm md:text-base mt-2">
                  Acompañando a{" "}
                  <span className="font-semibold text-white">{familia.nombreNino}</span>
                </p>
              )}
            </div>

            {/* Reloj */}
            <div className="mt-4 md:mt-0 md:text-right shrink-0">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-2xl"
                style={{ background: "rgba(122,61,26,0.28)" }}
              >
                <Clock size={14} className="text-white/70 md:hidden" />
                <span className="text-white font-bold text-xl md:text-4xl lg:text-5xl tracking-widest">
                  {horaFormateada}
                </span>
              </div>
              <p className="text-white/50 text-xs mt-1 hidden md:block">hora actual</p>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          CONTENIDO — 1 col mobile / 2 cols desktop
      ════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-4 pt-5 pb-4 md:px-8 md:pt-8 md:pb-8 md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:gap-6 lg:gap-8">

        {/* ── COLUMNA PRINCIPAL ─────────────────────────────── */}
        <div className="space-y-4 md:space-y-5">
          <WellnessTip horaActual={horaActual} />

          {/* Acceso a actividades */}
          <button
            onClick={() => router.push("/actividades")}
            className="w-full bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md active:bg-gray-50 transition-all"
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: "#EDE9FE" }}>
              <Activity size={22} className="text-purple-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-gray-800">Actividades</p>
              <p className="text-xs text-gray-400 mt-0.5">Talleres y eventos en la Casa</p>
            </div>
            <ChevronRight size={16} className="text-gray-300 shrink-0" />
          </button>

          {/* Acceso a transporte */}
          <button
            onClick={() => router.push("/transporte")}
            className="w-full bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md active:bg-gray-50 transition-all"
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: "#FDF0E6" }}>
              <Bus size={22} style={{ color: "#C85A2A" }} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-gray-800">Solicitar transporte</p>
              <p className="text-xs text-gray-400 mt-0.5">Traslados Casa Ronald ↔ Hospital</p>
            </div>
            <ChevronRight size={16} className="text-gray-300 shrink-0" />
          </button>
        </div>

        {/* ── COLUMNA LATERAL (sidebar en desktop) ─────────────── */}
        <div className="space-y-4 md:space-y-5 mt-4 md:mt-0">

          {/* Accesos rápidos */}
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: "#7A3D1A" }}>
              Accesos rápidos
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => router.push("/respira")}
                className="relative overflow-hidden rounded-2xl p-4 text-left shadow-sm hover:shadow-md active:scale-95 transition-all"
                style={{ background: "linear-gradient(135deg, #EFF6FF, #DBEAFE)" }}
              >
                <div className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center"
                  style={{ background: "rgba(37,99,235,0.12)" }}>
                  <Wind size={20} className="text-blue-600" />
                </div>
                <p className="font-bold text-gray-800 text-sm">Respira</p>
                <p className="text-gray-500 text-xs mt-0.5">2 min para ti</p>
                <ChevronRight size={13} className="absolute right-3 bottom-4 text-blue-300" />
              </button>

              <button
                onClick={() => router.push("/actividades")}
                className="relative overflow-hidden rounded-2xl p-4 text-left shadow-sm hover:shadow-md active:scale-95 transition-all"
                style={{ background: "linear-gradient(135deg, #F5F3FF, #EDE9FE)" }}
              >
                <div className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center"
                  style={{ background: "rgba(124,58,237,0.10)" }}>
                  <Activity size={20} className="text-purple-600" />
                </div>
                <p className="font-bold text-gray-800 text-sm">Actividades</p>
                <p className="text-gray-500 text-xs mt-0.5">Talleres y eventos</p>
                <ChevronRight size={13} className="absolute right-3 bottom-4 text-purple-300" />
              </button>

              <button
                onClick={() => router.push("/transporte")}
                className="relative overflow-hidden rounded-2xl p-4 text-left shadow-sm hover:shadow-md active:scale-95 transition-all"
                style={{ background: "linear-gradient(135deg, #FDF0E6, #FDDCBF)" }}
              >
                <div className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center"
                  style={{ background: "rgba(200,90,42,0.12)" }}>
                  <Bus size={20} style={{ color: "#C85A2A" }} />
                </div>
                <p className="font-bold text-gray-800 text-sm">Transporte</p>
                <p className="text-gray-500 text-xs mt-0.5">Pedir traslado</p>
                <ChevronRight size={13} className="absolute right-3 bottom-4" style={{ color: "#E8A080" }} />
              </button>
            </div>
          </section>

          {/* Panel del coordinador */}
          {familia?.rol === "coordinador" && (
            <button
              onClick={() => router.push("/coordinador")}
              className="w-full bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md active:bg-gray-50 transition-all"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "#FDF0E6" }}>
                <Users size={20} style={{ color: "#C85A2A" }} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold text-gray-800">Panel coordinador</p>
                <p className="text-xs text-gray-400">Ver familias y alertas</p>
              </div>
              <ChevronRight size={16} className="text-gray-300 shrink-0" />
            </button>
          )}

          {/* Botón demo push */}
          <button
            onClick={dispararRecordatorios}
            disabled={disparandoPush}
            className="w-full border border-dashed rounded-2xl p-3 flex items-center gap-3 hover:bg-white/50 active:bg-white/70 disabled:opacity-60 transition-colors"
            style={{ borderColor: "#E87A3A" }}
          >
            <BellRing size={17} style={{ color: "#E87A3A" }} />
            <span className="text-sm font-medium" style={{ color: "#9A6A2A" }}>
              {disparandoPush ? "Revisando…" : "Probar notificaciones push"}
            </span>
          </button>
        </div>
      </div>

      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrar} />}
    </>
  );
}

/* ── Tip de bienestar ─────────────────────────────────────── */
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
    <div
      className="rounded-2xl p-4 flex gap-3 items-start shadow-sm"
      style={{ background: "linear-gradient(135deg, #FFF8E6, #FEF3C7)" }}
    >
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
