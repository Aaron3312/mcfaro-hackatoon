"use client";
// Navegación: bottom nav en mobile, top navbar en desktop
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Bus, Activity, Calendar, BookOpen, LogOut, UserCircle, BedDouble, Users, BarChart2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";

const enlacesCuidador = [
  { href: "/dashboard",   etiqueta: "Inicio",      icono: Home,     exacto: true },
  { href: "/actividades", etiqueta: "Actividades", icono: Activity, exacto: false },
  { href: "/calendario",  etiqueta: "Calendario",  icono: Calendar, exacto: false },
  { href: "/transporte",  etiqueta: "Transporte",  icono: Bus,      exacto: false },
  { href: "/recursos",    etiqueta: "Recursos",    icono: BookOpen, exacto: false },
];

const enlacesCoordinador = [
  { href: "/coordinador",             etiqueta: "Panel",       icono: Home,     exacto: true },
  { href: "/coordinador/familias",    etiqueta: "Familias",    icono: Users,    exacto: false },
  { href: "/coordinador/habitaciones",etiqueta: "Habitaciones",icono: BedDouble,exacto: false },
  { href: "/coordinador/transporte",  etiqueta: "Transporte",  icono: Bus,      exacto: false },
  { href: "/coordinador/reportes",    etiqueta: "Reportes",    icono: BarChart2,exacto: false },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { familia } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const esCoordinador = familia?.rol === "coordinador";
  const enlaces = esCoordinador ? enlacesCoordinador : enlacesCuidador;

  const cerrarSesion = async () => {
    setMenuAbierto(false);
    await signOut(auth);
    router.replace("/login");
  };

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuAbierto(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const nombreCorto = familia?.nombreCuidador?.split(" ")[0] ?? "Perfil";

  return (
    <>
      {/* ── Bottom nav — sólo mobile ──────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe bg-white border-t border-[#F0E5D0] backdrop-blur-lg bg-white/95">
        <div className="flex justify-around items-center max-w-lg mx-auto px-2">
          {enlaces.map(({ href, etiqueta, icono: Icono, exacto }) => {
            const activo = exacto ? pathname === href : pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className="group flex flex-col items-center justify-center py-3 px-2 min-h-[64px] flex-1 transition-all duration-200"
              >
                <div
                  className={`flex items-center justify-center rounded-2xl transition-all duration-200 ${
                    activo
                      ? "w-14 h-9 bg-ronald-beige shadow-sm"
                      : "w-9 h-9 bg-transparent group-active:bg-ronald-beige/30"
                  }`}
                >
                  <Icono
                    size={activo ? 20 : 19}
                    strokeWidth={activo ? 2.5 : 2}
                    className={`transition-all duration-200 ${
                      activo ? "text-ronald-orange" : "text-gray-400 group-active:text-ronald-orange"
                    }`}
                  />
                </div>
                <span
                  className={`text-[10px] mt-1 font-semibold transition-all duration-200 ${
                    activo ? "text-ronald-orange" : "text-gray-400 group-active:text-ronald-orange"
                  }`}
                >
                  {etiqueta}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── Top navbar — sólo desktop ─────────────────────────── */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 items-center justify-between px-8 h-16 bg-white border-b border-[#F0E5D0] shadow-sm backdrop-blur-lg bg-white/95">
        {/* Logo con hover effect */}
        <Link
          href={esCoordinador ? "/coordinador" : "/dashboard"}
          className="group flex items-center gap-3 shrink-0 transition-transform duration-200 hover:scale-105"
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-ronald-beige-light shadow-sm transition-shadow duration-200 group-hover:shadow-md">
            <img src="/icons/icon-faro.svg" alt="mcFaro" className="w-full h-full object-contain p-1" />
          </div>
          <span className="font-bold text-lg">
            <span className="text-ronald-brown">mc</span>
            <span className="text-ronald-orange">Faro</span>
          </span>
        </Link>

        {/* Nav items con mejor jerarquía */}
        <div className="flex items-center gap-2">
          {enlaces.map(({ href, etiqueta, icono: Icono, exacto }) => {
            const activo = exacto ? pathname === href : pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`group flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                  activo
                    ? "bg-ronald-beige text-ronald-orange shadow-sm"
                    : "text-gray-500 hover:bg-ronald-beige/40 hover:text-ronald-brown active:bg-ronald-beige/60"
                }`}
              >
                <Icono
                  size={18}
                  strokeWidth={activo ? 2.5 : 2}
                  className="transition-transform duration-200 group-hover:scale-110"
                />
                <span className="text-sm">{etiqueta}</span>
              </Link>
            );
          })}
        </div>

        {/* Botón de perfil mejorado */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              menuAbierto
                ? "bg-ronald-beige text-ronald-orange shadow-sm"
                : "text-ronald-brown-medium hover:bg-ronald-beige/40 active:bg-ronald-beige/60"
            }`}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-ronald-beige shadow-sm transition-transform duration-200 hover:scale-105">
              <UserCircle size={20} className="text-ronald-orange" />
            </div>
            <span>{nombreCorto}</span>
          </button>

          {/* Menú desplegable mejorado */}
          {menuAbierto && (
            <div className="absolute right-0 top-full mt-3 w-48 rounded-2xl shadow-xl overflow-hidden border border-[#F0E5D0] bg-white animate-in fade-in slide-in-from-top-2 duration-200">
              <Link
                href="/perfil"
                onClick={() => setMenuAbierto(false)}
                className="flex items-center gap-3 px-4 py-3.5 text-sm font-semibold text-ronald-brown hover:bg-ronald-beige/50 transition-colors duration-150 border-b border-[#F0E5D0]"
              >
                <UserCircle size={18} className="text-ronald-orange" />
                Mi perfil
              </Link>

              {esCoordinador && familia?.habitacion && (
                <div className="px-4 py-2 bg-ronald-beige/30 border-b border-[#F0E5D0]">
                  <p className="text-xs font-bold uppercase tracking-wide text-ronald-brown-medium mb-1">
                    Información
                  </p>
                  <p className="text-sm font-semibold text-ronald-brown">
                    Habitación {familia.habitacion}
                  </p>
                </div>
              )}

              <button
                onClick={cerrarSesion}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold text-red-700 hover:bg-red-50 transition-colors duration-150"
              >
                <LogOut size={18} />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
