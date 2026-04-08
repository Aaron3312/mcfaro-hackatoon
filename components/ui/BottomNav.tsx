"use client";
// Navegación: bottom nav en mobile, sidebar vertical en desktop
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Bus, Activity, Calendar, BookOpen, LogOut, UserCircle, BedDouble, Users, BarChart2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useSidebar } from "@/contexts/SidebarContext";

const enlacesCuidador = [
  { href: "/dashboard",   etiqueta: "Inicio",      icono: Home,     exacto: true },
  { href: "/actividades", etiqueta: "Actividades", icono: Activity, exacto: false },
  { href: "/calendario",  etiqueta: "Calendario",  icono: Calendar, exacto: false },
  { href: "/transporte",  etiqueta: "Transporte",  icono: Bus,      exacto: false },
  { href: "/recursos",    etiqueta: "Recursos",    icono: BookOpen, exacto: false },
];

const enlacesCoordinador = [
  { href: "/coordinador",              etiqueta: "Panel",       icono: Home,     exacto: true },
  { href: "/coordinador/familias",     etiqueta: "Familias",    icono: Users,    exacto: false },
  { href: "/coordinador/habitaciones", etiqueta: "Habitaciones",icono: BedDouble,exacto: false },
  { href: "/coordinador/actividades",  etiqueta: "Actividades", icono: Activity, exacto: false },
  { href: "/coordinador/transporte",   etiqueta: "Transporte",  icono: Bus,      exacto: false },
  { href: "/coordinador/reportes",     etiqueta: "Reportes",    icono: BarChart2,exacto: false },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { familia } = useAuth();
  const { collapsed: sidebarCollapsed, toggleCollapsed } = useSidebar();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  // Ref separado para el dropdown del header desktop — evita conflicto con el ref móvil
  const headerMenuRef = useRef<HTMLDivElement>(null);

  const esCoordinador = familia?.rol === "coordinador";
  const enlaces = esCoordinador ? enlacesCoordinador : enlacesCuidador;

  const cerrarSesion = async () => {
    setMenuAbierto(false);
    await signOut(auth);
    router.replace("/login");
  };

  // Cerrar menú al hacer clic fuera (cubre ambos: mobile y header desktop)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const dentroMobile = menuRef.current?.contains(e.target as Node);
      const dentroHeader = headerMenuRef.current?.contains(e.target as Node);
      if (!dentroMobile && !dentroHeader) {
        setMenuAbierto(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const nombreCorto = familia?.nombreCuidador?.split(" ")[0] ?? "Perfil";
  const nombreCompleto = familia?.nombreCuidador ?? "Usuario";

  return (
    <>
      {/* ── Header horizontal — cuidador en desktop ───────────── */}
      {!esCoordinador && (
        <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 h-16 items-center justify-between px-8 bg-white/95 border-b border-[#F0E5D0] backdrop-blur-lg shadow-sm">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center bg-ronald-beige-light shadow-sm transition-all duration-200 group-hover:scale-105">
              <img src="/icons/icon-faro.svg" alt="mcFaro" className="w-full h-full object-contain p-1" />
            </div>
            <span className="font-bold text-lg">
              <span className="text-ronald-brown">mc</span>
              <span className="text-ronald-orange">Faro</span>
            </span>
          </Link>

          {/* Links centrales */}
          <nav className="flex items-center gap-1">
            {enlacesCuidador.map(({ href, etiqueta, icono: Icono, exacto }) => {
              const activo = exacto ? pathname === href : pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activo
                      ? "bg-ronald-beige text-ronald-orange shadow-sm"
                      : "text-gray-500 hover:bg-ronald-beige/40 hover:text-ronald-brown"
                  }`}
                >
                  <Icono size={17} strokeWidth={activo ? 2.5 : 2} />
                  {etiqueta}
                </Link>
              );
            })}
          </nav>

          {/* Usuario — botón con dropdown que contiene perfil + salir */}
          <div className="relative" ref={headerMenuRef}>
            <button
              onClick={() => setMenuAbierto(!menuAbierto)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                menuAbierto ? "bg-ronald-beige text-ronald-orange" : "text-ronald-brown hover:bg-ronald-beige/50"
              }`}
            >
              <UserCircle size={20} className="text-ronald-orange" />
              {nombreCorto}
            </button>

            {menuAbierto && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl border border-[#F0E5D0] shadow-xl py-1 z-50">
                <Link
                  href="/perfil"
                  onClick={() => setMenuAbierto(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-ronald-brown hover:bg-ronald-beige/50 transition-all duration-200"
                >
                  <UserCircle size={17} className="text-ronald-orange shrink-0" />
                  Mi perfil
                </Link>
                <div className="mx-3 my-1 border-t border-[#F0E5D0]" />
                <button
                  onClick={cerrarSesion}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-all duration-200"
                >
                  <LogOut size={17} className="shrink-0" />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </header>
      )}

      {/* ── Bottom nav — sólo mobile ──────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe bg-white/95 border-t border-[#F0E5D0] backdrop-blur-lg">

        {/* Menú desplegable de perfil */}
        {menuAbierto && (
          <div ref={menuRef} className="absolute bottom-full left-0 right-0 bg-white border-t border-[#F0E5D0] shadow-xl rounded-t-2xl">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[#F0E5D0]">
              <div className="w-10 h-10 rounded-full bg-ronald-beige flex items-center justify-center shrink-0">
                <UserCircle size={24} className="text-ronald-orange" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-ronald-brown truncate">{nombreCompleto}</p>
                {familia?.habitacion && (
                  <p className="text-xs text-ronald-brown-medium">Hab. {familia.habitacion}</p>
                )}
              </div>
            </div>
            <div className="px-3 py-2 space-y-1">
              <Link
                href="/perfil"
                onClick={() => setMenuAbierto(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-ronald-brown active:bg-ronald-beige/70"
              >
                <UserCircle size={18} className="text-ronald-orange shrink-0" />
                Mi perfil
              </Link>
              <button
                onClick={cerrarSesion}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 active:bg-red-100"
              >
                <LogOut size={18} className="shrink-0" />
                Cerrar sesión
              </button>
            </div>
            <div className="h-2" />
          </div>
        )}

        <div className="flex justify-around items-center max-w-lg mx-auto px-1">
          {/* 4 links principales */}
          {enlaces.slice(0, 4).map(({ href, etiqueta, icono: Icono, exacto }) => {
            const activo = exacto ? pathname === href : pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className="group flex flex-col items-center justify-center py-3 px-1 min-h-16 flex-1"
              >
                <div className={`flex items-center justify-center rounded-2xl transition-all duration-200 ${
                  activo ? "w-12 h-9 bg-ronald-beige shadow-sm" : "w-9 h-9 bg-transparent group-active:bg-ronald-beige/30"
                }`}>
                  <Icono size={activo ? 20 : 19} strokeWidth={activo ? 2.5 : 2}
                    className={activo ? "text-ronald-orange" : "text-gray-400 group-active:text-ronald-orange"}
                  />
                </div>
                <span className={`text-[10px] mt-1 font-semibold ${activo ? "text-ronald-orange" : "text-gray-400"}`}>
                  {etiqueta}
                </span>
              </Link>
            );
          })}

          {/* Botón perfil */}
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="group flex flex-col items-center justify-center py-3 px-1 min-h-16 flex-1"
          >
            <div className={`flex items-center justify-center rounded-2xl transition-all duration-200 ${
              menuAbierto ? "w-12 h-9 bg-ronald-beige shadow-sm" : "w-9 h-9 bg-transparent group-active:bg-ronald-beige/30"
            }`}>
              <UserCircle size={menuAbierto ? 20 : 19} strokeWidth={menuAbierto ? 2.5 : 2}
                className={menuAbierto ? "text-ronald-orange" : "text-gray-400 group-active:text-ronald-orange"}
              />
            </div>
            <span className={`text-[10px] mt-1 font-semibold ${menuAbierto ? "text-ronald-orange" : "text-gray-400"}`}>
              {nombreCorto}
            </span>
          </button>
        </div>
      </nav>

      {/* ── Sidebar vertical — coordinador en desktop ───────────── */}
      {esCoordinador && <aside
        className={`hidden md:flex fixed left-0 top-0 bottom-0 z-50 flex-col bg-white border-r border-[#F0E5D0] shadow-lg transition-all duration-300 ${
          sidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Logo + Toggle */}
        <div className="flex items-center justify-between p-4 border-b border-[#F0E5D0]">
          <Link
            href={esCoordinador ? "/coordinador" : "/dashboard"}
            className={`group flex items-center gap-3 transition-all duration-200 ${
              sidebarCollapsed ? "justify-center w-full" : ""
            }`}
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-ronald-beige-light shadow-sm transition-all duration-200 group-hover:shadow-md group-hover:scale-105">
              <img src="/icons/icon-faro.svg" alt="mcFaro" className="w-full h-full object-contain p-1" />
            </div>
            {!sidebarCollapsed && (
              <span className="font-bold text-lg whitespace-nowrap">
                <span className="text-ronald-brown">mc</span>
                <span className="text-ronald-orange">Faro</span>
              </span>
            )}
          </Link>
          {!sidebarCollapsed && (
            <button
              onClick={toggleCollapsed}
              className="p-2 rounded-lg text-gray-400 hover:text-ronald-orange hover:bg-ronald-beige/30 transition-all duration-200"
              aria-label="Colapsar sidebar"
            >
              <ChevronLeft size={20} />
            </button>
          )}
        </div>

        {/* Botón de expandir (cuando está colapsado) */}
        {sidebarCollapsed && (
          <button
            onClick={toggleCollapsed}
            className="mx-auto my-2 p-2 rounded-lg text-gray-400 hover:text-ronald-orange hover:bg-ronald-beige/30 transition-all duration-200"
            aria-label="Expandir sidebar"
          >
            <ChevronRight size={20} />
          </button>
        )}

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {enlaces.map(({ href, etiqueta, icono: Icono, exacto }) => {
            const activo = exacto ? pathname === href : pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  sidebarCollapsed ? "justify-center" : ""
                } ${
                  activo
                    ? "bg-ronald-beige text-ronald-orange shadow-sm"
                    : "text-gray-600 hover:bg-ronald-beige/40 hover:text-ronald-brown active:bg-ronald-beige/60"
                }`}
                title={sidebarCollapsed ? etiqueta : undefined}
              >
                <Icono
                  size={22}
                  strokeWidth={activo ? 2.5 : 2}
                  className="shrink-0 transition-transform duration-200 group-hover:scale-110"
                />
                {!sidebarCollapsed && <span className="text-sm">{etiqueta}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Usuario + Logout */}
        <div className="border-t border-[#F0E5D0] p-3">
          {/* Info del usuario */}
          <div
            className={`mb-2 p-3 rounded-xl bg-ronald-beige/30 ${
              sidebarCollapsed ? "flex justify-center" : ""
            }`}
          >
            {sidebarCollapsed ? (
              <div className="w-10 h-10 rounded-full bg-ronald-beige shadow-sm flex items-center justify-center">
                <UserCircle size={24} className="text-ronald-orange" />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-ronald-beige shadow-sm flex items-center justify-center shrink-0">
                  <UserCircle size={24} className="text-ronald-orange" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-ronald-brown truncate">{nombreCompleto}</p>
                  {familia?.habitacion && (
                    <p className="text-xs text-ronald-brown-medium">
                      Hab. {familia.habitacion}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="space-y-1">
            <Link
              href="/perfil"
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-ronald-brown hover:bg-ronald-beige/50 transition-all duration-200 ${
                sidebarCollapsed ? "justify-center" : ""
              }`}
              title={sidebarCollapsed ? "Mi perfil" : undefined}
            >
              <UserCircle size={18} className="text-ronald-orange shrink-0" />
              {!sidebarCollapsed && <span>Mi perfil</span>}
            </Link>

            <button
              onClick={cerrarSesion}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-700 hover:bg-red-50 transition-all duration-200 ${
                sidebarCollapsed ? "justify-center" : ""
              }`}
              title={sidebarCollapsed ? "Cerrar sesión" : undefined}
            >
              <LogOut size={18} className="shrink-0" />
              {!sidebarCollapsed && <span>Cerrar sesión</span>}
            </button>
          </div>
        </div>
      </aside>}
    </>
  );
}
