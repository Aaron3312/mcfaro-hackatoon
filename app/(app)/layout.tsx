"use client";
// Layout del área autenticada — incluye la barra de navegación inferior
export const dynamic = "force-dynamic";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { BottomNav } from "@/components/ui/BottomNav";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

// Rutas exclusivas del cuidador (coordinador no debe acceder)
const RUTAS_CUIDADOR = ["/dashboard", "/calendario", "/rutina", "/respira", "/mapa", "/actividades", "/transporte", "/recursos"];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, familia, cargando } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const online = useOnlineStatus();

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
        <div className="w-10 h-10 border-4 border-[#C85A2A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F7EDD5] pb-20 md:pb-0 md:pt-14">
      {/* Banner de sin conexión — solo visible cuando el dispositivo pierde red */}
      {!online && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-yellow-400 text-yellow-900 text-sm font-medium text-center py-2 px-4">
          📡 Sin conexión — Mostrando datos guardados
        </div>
      )}
      {children}
      <BottomNav />
    </div>
  );
}
