"use client";
// Navegación: bottom nav en mobile, top navbar en desktop
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Calendar, UtensilsCrossed, Wind, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const enlaces = [
  { href: "/dashboard", etiqueta: "Inicio",  icono: Home },
  { href: "/calendario", etiqueta: "Citas",   icono: Calendar },
  { href: "/menu",       etiqueta: "Menú",    icono: UtensilsCrossed },
  { href: "/respira",    etiqueta: "Respira", icono: Wind },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const cerrarSesion = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  return (
    <>
      {/* ── Bottom nav — sólo mobile ──────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe"
        style={{ background: "#FFFFFF", borderTop: "1px solid #F0E5D0" }}
      >
        <div className="flex justify-around items-center max-w-lg mx-auto">
          {enlaces.map(({ href, etiqueta, icono: Icono }) => {
            const activo = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center justify-center py-2 px-4 min-h-[56px] flex-1 transition-colors"
              >
                <div
                  className={`flex items-center justify-center rounded-2xl transition-all ${
                    activo ? "w-12 h-8" : "w-8 h-8"
                  }`}
                  style={{ background: activo ? "#FDF0E6" : "transparent" }}
                >
                  <Icono
                    size={20}
                    strokeWidth={activo ? 2.5 : 2}
                    style={{ color: activo ? "#C85A2A" : "#A89080" }}
                  />
                </div>
                <span
                  className="text-xs mt-0.5 font-medium transition-colors"
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
        <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-xl overflow-hidden" style={{ background: "#F7EDD5" }}>
            <img src="/icons/icon-full.svg" alt="mcFaro" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-base" style={{ color: "#7A3D1A" }}>
            mc<span style={{ color: "#C85A2A" }}>Faro</span>
          </span>
        </Link>

        {/* Nav items */}
        <div className="flex items-center gap-1">
          {enlaces.map(({ href, etiqueta, icono: Icono }) => {
            const activo = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activo
                    ? "shadow-sm"
                    : "hover:bg-[#FDF0E6]/60"
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

        {/* Cerrar sesión */}
        <button
          onClick={cerrarSesion}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-[#FDF0E6]"
          style={{ color: "#9A6A2A" }}
        >
          <LogOut size={15} />
          <span>Salir</span>
        </button>
      </nav>
    </>
  );
}
