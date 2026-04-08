"use client";
// Escáner QR para coordinadores — check-in rápido de cuidadores
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { EscanerQR } from "@/components/coordinador/EscanerQR";
import { ArrowLeft } from "lucide-react";

export default function EscanearPage() {
  const { familia, cargando } = useAuth();
  const router = useRouter();

  // Solo coordinadores pueden acceder
  useEffect(() => {
    if (!cargando && familia && familia.rol !== "coordinador") {
      router.replace("/dashboard");
    }
  }, [familia, cargando, router]);

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "#C85A2A", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  return (
    <>
      {/* ── Banner ───────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden w-full"
        style={{ background: "linear-gradient(135deg, #C85A2A 0%, #E87A3A 70%, #F5C842 100%)" }}
      >
        <div
          className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-15"
          style={{ background: "#7A3D1A" }}
        />
        <div className="max-w-lg mx-auto px-5 py-6 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(255,255,255,0.2)" }}
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Escanear credencial</h1>
            <p className="text-white/70 text-xs mt-0.5">Verificación de identidad — check-in</p>
          </div>
        </div>
      </div>

      {/* ── Contenido ────────────────────────────────────────── */}
      <div className="max-w-lg mx-auto px-4 pt-6 pb-10">
        <EscanerQR />
      </div>
    </>
  );
}
