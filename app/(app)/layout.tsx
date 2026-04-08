"use client";
// Layout del área autenticada — incluye la barra de navegación inferior
export const dynamic = "force-dynamic";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { BottomNav } from "@/components/ui/BottomNav";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, cargando } = useAuth();
  const router = useRouter();
  const online = useOnlineStatus();

  useEffect(() => {
    if (!cargando && !user) {
      router.replace("/login");
    }
  }, [user, cargando, router]);

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
