"use client";
// Navegación inferior (mobile) / superior (desktop)
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Home, Wind, Map } from "lucide-react";

const tabs = [
  { href: "/dashboard", icono: Home,     label: "Inicio" },
  { href: "/calendario", icono: Calendar, label: "Citas" },
  { href: "/respira",    icono: Wind,     label: "Respira" },
  { href: "/mapa",       icono: Map,      label: "Mapa" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <>
      {/* ── Mobile: barra inferior ───────────────────────────── */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 flex md:hidden z-30"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        {tabs.map(({ href, icono: Icono, label }) => {
          const activo = pathname.startsWith(href);
          return (
            <Link key={href} href={href}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors"
              style={{ color: activo ? "#C85A2A" : "#9CA3AF" }}>
              <div className="w-10 h-7 flex items-center justify-center rounded-full transition-colors"
                style={{ background: activo ? "#FDF0E6" : "transparent" }}>
                <Icono size={18} />
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── Desktop: barra superior ──────────────────────────── */}
      <nav className="hidden md:flex fixed top-0 inset-x-0 bg-white border-b border-gray-100 z-30 h-14 items-center px-8 gap-1">
        <span className="font-bold mr-6" style={{ color: "#C85A2A" }}>mcFaro</span>
        {tabs.map(({ href, icono: Icono, label }) => {
          const activo = pathname.startsWith(href);
          return (
            <Link key={href} href={href}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
              style={{
                background: activo ? "#FDF0E6" : "transparent",
                color: activo ? "#C85A2A" : "#6B7280",
              }}>
              <Icono size={15} />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
