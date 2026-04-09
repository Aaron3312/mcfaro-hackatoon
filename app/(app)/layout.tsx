"use client";
// Layout del área autenticada — incluye la barra de navegación inferior
export const dynamic = "force-dynamic";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { BottomNav } from "@/components/ui/BottomNav";
import { OfflineToast } from "@/components/ui/OfflineToast";
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
      {/* Toast de conexión (esquina superior derecha) */}
      <OfflineToast online={online} />

      <BottomNav />
      {/* Coordinador: padding top en mobile + padding izquierdo del sidebar en desktop | Cuidador: padding top del header en desktop */}
      <div className={`min-w-0 w-full transition-all duration-300 ${
        esCoordinador
          ? collapsed ? "pt-16 md:pt-0 md:pl-20" : "pt-16 md:pt-0 md:pl-64"
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
