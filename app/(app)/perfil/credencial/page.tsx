"use client";
// Credencial digital del cuidador — visible offline gracias a Firestore cache
import { useState, useEffect, useRef } from "react";
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
  // qrCode local: se actualiza directo desde la respuesta de la API,
  // sin esperar a que onSnapshot propague el cambio de Firestore
  const [qrCodeLocal, setQrCodeLocal] = useState<string | null>(null);
  const autoGeneradoRef = useRef(false);

  // Sincronizar qrCodeLocal cuando Firestore finalmente propague el cambio
  useEffect(() => {
    if (familia?.qrCode && !qrCodeLocal) {
      setQrCodeLocal(familia.qrCode);
    }
  }, [familia?.qrCode, qrCodeLocal]);

  // Auto-generar QR si la cuenta no tiene uno todavía
  useEffect(() => {
    if (!familia || autoGeneradoRef.current) return;
    if (familia.qrCode || qrCodeLocal) return;

    autoGeneradoRef.current = true;
    generarQR();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [familia]);

  async function generarQR() {
    if (!familia) return;
    setRegenerando(true);
    setMensaje(null);

    try {
      const res = await fetch("/api/credencial/generar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ familiaId: familia.id }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const detalle = data?.error ? JSON.stringify(data.error) : `HTTP ${res.status}`;
        throw new Error(detalle);
      }

      if (data.qrCode) setQrCodeLocal(data.qrCode);
      setMensaje("✅ QR generado correctamente");
    } catch (error) {
      logger.error("Error al generar QR:", error);
      const msg = error instanceof Error ? error.message : "Error desconocido";
      setMensaje(`❌ No se pudo generar el QR: ${msg}`);
    } finally {
      setRegenerando(false);
    }
  }

  // Familia con qrCode actualizado — el local tiene prioridad
  const familiaConQR = familia
    ? { ...familia, qrCode: qrCodeLocal ?? familia.qrCode }
    : null;

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

  if (!familiaConQR) return null;

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
        <CredencialDigital familia={familiaConQR} />

        {/* Mensaje de feedback */}
        {mensaje && (
          <div
            className="rounded-2xl shadow-sm p-4 border"
            style={{
              background: mensaje.startsWith("✅") ? "#f0fdf4" : "#fef2f2",
              borderColor: mensaje.startsWith("✅") ? "#bbf7d0" : "#fecaca",
            }}
          >
            <p className="text-sm text-center font-medium text-gray-800">{mensaje}</p>
          </div>
        )}

        {/* Estado: generando automáticamente */}
        {regenerando && !mensaje && (
          <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-center gap-2">
            <div
              className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: "#C85A2A", borderTopColor: "transparent" }}
            />
            <p className="text-sm text-gray-500">Generando QR…</p>
          </div>
        )}

        {/* Botón regenerar QR */}
        <button
          onClick={generarQR}
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
