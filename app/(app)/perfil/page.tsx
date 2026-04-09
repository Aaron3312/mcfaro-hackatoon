"use client";
// Perfil del cuidador — acceso a credencial y datos de la estancia
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { QrCode, BedDouble, Hospital, Calendar, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function PerfilPage() {
  const { familia, cargando } = useAuth();
  const router = useRouter();

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "#C85A2A", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  if (!familia) return null;

  const fechaIngreso = familia.fechaIngreso
    ? format(familia.fechaIngreso.toDate(), "d 'de' MMMM yyyy", { locale: es })
    : "—";

  const cerrarSesion = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  const iniciales = familia.nombreCuidador
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <>
      {/* ── Banner ───────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden w-full"
        style={{ background: "linear-gradient(135deg, #C85A2A 0%, #E87A3A 70%, #F5C842 100%)" }}
      >
        <div
          className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-15"
          style={{ background: "#7A3D1A" }}
        />
        <div className="max-w-lg mx-auto px-5 py-8 flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0"
            style={{ background: "rgba(255,255,255,0.25)" }}
          >
            {iniciales}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white leading-tight">{familia.nombreCuidador}</h1>
            <p className="text-white/70 text-sm mt-0.5">
              Cuidador de <span className="text-white font-medium">{familia.nombreNino}</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── Contenido ────────────────────────────────────────── */}
      <div className="max-w-lg mx-auto px-4 pt-6 pb-10 space-y-3">

        {/* Datos de estancia */}
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wide" style={{ color: "#9A6A2A" }}>
            Mi estancia
          </h2>

          {[
            {
              icono: <Hospital size={16} style={{ color: "#C85A2A" }} />,
              bg: "#FDF0E6",
              etiqueta: "Hospital",
              valor: familia.hospital,
            },
            {
              icono: <BedDouble size={16} className="text-blue-600" />,
              bg: "#DBEAFE",
              etiqueta: "Habitación",
              valor: familia.habitacion || "Sin asignar",
            },
            {
              icono: <Calendar size={16} className="text-emerald-600" />,
              bg: "#D1FAE5",
              etiqueta: "Fecha de ingreso",
              valor: fechaIngreso,
            },
          ].map(({ icono, bg, etiqueta, valor }) => (
            <div key={etiqueta} className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: bg }}
              >
                {icono}
              </div>
              <div>
                <p className="text-xs text-gray-400">{etiqueta}</p>
                <p className="text-sm font-semibold text-gray-800">{valor}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Botón principal — credencial */}
        <button
          onClick={() => router.push("/perfil/credencial")}
          className="w-full bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4 active:shadow-md transition-shadow text-left"
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #C85A2A, #E87A3A)" }}
          >
            <QrCode size={26} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-800">Mi credencial digital</p>
            <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">
              Muéstrala al personal de Casa Ronald para identificarte rápidamente
            </p>
          </div>
          <span className="text-gray-300 text-lg shrink-0">›</span>
        </button>

        {/* Info del tipo de tratamiento */}
        <div
          className="rounded-2xl p-4"
          style={{ background: "linear-gradient(135deg, #FFF8E6, #FEF3C7)" }}
        >
          <p className="text-sm font-medium leading-relaxed" style={{ color: "#7A3D1A" }}>
            🤍 El equipo de Casa Ronald está aquí para apoyarte. No dudes en acercarte a recepción si necesitas algo.
          </p>
        </div>

        {/* Cerrar sesión */}
        <button
          onClick={cerrarSesion}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold text-red-600 bg-red-50 border border-red-100 active:bg-red-100 transition-colors"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </>
  );
}
