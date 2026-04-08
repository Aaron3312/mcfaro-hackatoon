"use client";
// Navegación: bottom nav en mobile, top navbar en desktop
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Bus, Activity, Calendar, BookOpen, LogOut, UserCircle, BedDouble, Users, BarChart2, QrCode } from "lucide-react";
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
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe"
        style={{ background: "#FFFFFF", borderTop: "1px solid #F0E5D0" }}
      >
        <div className="flex justify-around items-center max-w-lg mx-auto">
          {enlaces.map(({ href, etiqueta, icono: Icono, exacto }) => {
            const activo = exacto ? pathname === href : pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center justify-center py-2 px-2 min-h-[56px] flex-1 transition-colors"
              >
                <div
                  className={`flex items-center justify-center rounded-2xl transition-all ${
                    activo ? "w-12 h-8" : "w-8 h-8"
                  }`}
                  style={{ background: activo ? "#FDF0E6" : "transparent" }}
                >
                  <Icono
                    size={18}
                    strokeWidth={activo ? 2.5 : 2}
                    style={{ color: activo ? "#C85A2A" : "#A89080" }}
                  />
                </div>
                <span
                  className="text-[10px] mt-0.5 font-medium transition-colors"
                  style={{ color: activo ? "#C85A2A" : "#A89080" }}
                >
                  {etiqueta}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── Top navbar — sólo desktop ─────────────────────────── */}
      <nav
        className="hidden md:flex fixed top-0 left-0 right-0 z-50 items-center justify-between px-8 h-14 shadow-sm"
        style={{ background: "#FFFFFF", borderBottom: "1px solid #F0E5D0" }}
      >
        {/* Logo */}
        <Link href={esCoordinador ? "/coordinador" : "/dashboard"} className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-xl overflow-hidden" style={{ background: "#F7EDD5" }}>
            <img src="/icons/icon-full.svg" alt="mcFaro" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-base" style={{ color: "#7A3D1A" }}>
            mc<span style={{ color: "#C85A2A" }}>Faro</span>
          </span>
        </Link>

        {/* Nav items */}
        <div className="flex items-center gap-1">
          {enlaces.map(({ href, etiqueta, icono: Icono, exacto }) => {
            const activo = exacto ? pathname === href : pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activo ? "shadow-sm" : "hover:bg-[#FDF0E6]/60"
                }`}
                style={{
                  background: activo ? "#FDF0E6" : "transparent",
                  color: activo ? "#C85A2A" : "#A89080",
                }}
              >
                <Icono size={16} strokeWidth={activo ? 2.5 : 2} />
                {etiqueta}
              </Link>
            );
          })}
        </div>

        {/* Botón de perfil con menú desplegable */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-[#FDF0E6]"
            style={{ color: "#9A6A2A" }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: "#FDF0E6" }}
            >
              <UserCircle size={18} style={{ color: "#C85A2A" }} />
            </div>
            <span>{nombreCorto}</span>
          </button>

          {/* Menú desplegable */}
          {menuAbierto && (
            <div
              className="absolute right-0 top-full mt-2 w-44 rounded-2xl shadow-lg overflow-hidden border"
              style={{ background: "#FFFFFF", borderColor: "#F0E5D0" }}
            >
              <Link
                href="/perfil"
                onClick={() => setMenuAbierto(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-[#FDF0E6] transition-colors"
                style={{ color: "#7A3D1A" }}
              >
                <UserCircle size={16} style={{ color: "#C85A2A" }} />
                Mi perfil
              </Link>
              <div style={{ height: "1px", background: "#F0E5D0" }} />
              <button
                onClick={cerrarSesion}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-red-50 transition-colors"
                style={{ color: "#991B1B" }}
              >
                <LogOut size={16} />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
