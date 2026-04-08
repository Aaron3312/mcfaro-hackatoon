"use client";
// Credencial digital del cuidador — visible offline gracias a Firestore cache
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { CredencialDigital } from "@/components/credencial/CredencialDigital";
import { logger } from "@/lib/logger";
import { ArrowLeft, RefreshCw } from "lucide-react";

export default function CredencialPage() {
  const { familia, cargando } = useAuth();
  const router = useRouter();
  const [regenerando, setRegenerando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  async function regenerarQR() {
    if (!familia) return;
    setRegenerando(true);
    setMensaje(null);

    try {
      const res = await fetch("/api/credencial/generar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ familiaId: familia.id }),
      });

      if (!res.ok) throw new Error("Error del servidor");
      setMensaje("✅ QR actualizado correctamente");
    } catch (error) {
      logger.error("Error al regenerar QR:", error);
      setMensaje("❌ No se pudo actualizar el QR. Intenta de nuevo.");
    } finally {
      setRegenerando(false);
    }
  }

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

  if (!familia) return null;

  return (
    <>
      {/* ── Cabecera ─────────────────────────────────────────── */}
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
            <h1 className="text-xl font-bold text-white">Mi credencial</h1>
            <p className="text-white/70 text-xs mt-0.5">Válida durante tu estancia</p>
          </div>
        </div>
      </div>

      {/* ── Credencial ───────────────────────────────────────── */}
      <div className="max-w-lg mx-auto px-4 pt-6 pb-10 space-y-4">
        <CredencialDigital familia={familia} />

        {/* Mensaje de feedback */}
        {mensaje && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-sm text-center text-gray-700">{mensaje}</p>
          </div>
        )}

        {/* Botón regenerar QR */}
        <button
          onClick={regenerarQR}
          disabled={regenerando}
          className="w-full flex items-center justify-center gap-2 bg-white rounded-2xl shadow-sm py-4 text-sm font-semibold text-gray-600 active:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={16} className={regenerando ? "animate-spin" : ""} />
          {regenerando ? "Actualizando QR…" : "Regenerar QR"}
        </button>

        <p className="text-xs text-gray-400 text-center px-4 leading-relaxed">
          Si cambiaste de habitación o tu QR fue comprometido, puedes regenerarlo. El código anterior quedará inválido.
        </p>
      </div>
    </>
  );
}
