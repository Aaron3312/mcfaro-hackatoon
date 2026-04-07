"use client";
// Layout del área autenticada — guard + navegación
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { BottomNav } from "@/components/ui/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { usuario, cargando } = useAuth();

  useEffect(() => {
    if (!cargando && !usuario) router.replace("/login");
  }, [usuario, cargando, router]);

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: "#C85A2A", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!usuario) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <BottomNav />
      {/* Espacio para nav: bottom en mobile, top en desktop */}
      <main className="pb-20 md:pb-0 md:pt-14">
        {children}
      </main>
    </div>
  );
}
