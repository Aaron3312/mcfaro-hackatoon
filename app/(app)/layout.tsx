"use client";
// Layout del área autenticada — incluye la barra de navegación inferior
export const dynamic = "force-dynamic";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { BottomNav } from "@/components/ui/BottomNav";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
// Rutas exclusivas del cuidador (coordinador no debe acceder)
const RUTAS_CUIDADOR = ["/dashboard", "/rutina", "/respira", "/mapa", "/actividades", "/transporte", "/recursos"];

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, familia, cargando } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const online = useOnlineStatus();
  const { collapsed } = useSidebar();

  useEffect(() => {
    if (cargando) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    // Coordinador que intenta entrar a ruta de cuidador → redirigir a su panel
    if (familia?.rol === "coordinador" && RUTAS_CUIDADOR.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
      router.replace("/coordinador");
    }
  }, [user, familia, cargando, router, pathname]);

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-ronald-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const esCoordinador = familia?.rol === "coordinador";

  return (
    <div className="min-h-screen bg-ronald-beige-light pb-20 md:pb-0">
      {/* Banner de sin conexión */}
      {!online && (
        <div className={`fixed top-0 left-0 right-0 z-60 bg-amber-500 border-b-2 border-amber-600 shadow-lg transition-all duration-300 ${
          esCoordinador
            ? collapsed ? "md:left-20" : "md:left-64"
            : ""
        }`}>
          <div className="max-w-7xl mx-auto px-4 py-2.5">
            <div className="flex items-center justify-center gap-2 text-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-900 rounded-full animate-pulse" />
                <span className="text-sm font-bold text-amber-900">
                  ⚠️ Sin conexión a Internet
                </span>
              </div>
              <span className="hidden sm:inline text-amber-900 font-medium">•</span>
              <span className="text-xs sm:text-sm font-medium text-amber-800">
                La información mostrada puede cambiar al reconectar
              </span>
            </div>
          </div>
        </div>
      )}
      <BottomNav />
      {/* Coordinador: padding izquierdo del sidebar | Cuidador: padding top del header */}
      <div className={`min-w-0 w-full transition-all duration-300 ${
        esCoordinador
          ? collapsed ? "md:pl-20" : "md:pl-64"
          : "md:pt-16"
      }`}>
        {children}
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </SidebarProvider>
  );
}
