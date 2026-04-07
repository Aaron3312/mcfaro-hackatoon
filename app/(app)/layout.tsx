"use client";
// Layout del área autenticada — incluye la barra de navegación inferior
export const dynamic = "force-dynamic";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { BottomNav } from "@/components/ui/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, cargando } = useAuth();
  const router = useRouter();

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
      {children}
      <BottomNav />
    </div>
  );
}
