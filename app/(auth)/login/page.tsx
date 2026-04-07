"use client";
// Pantalla de login con número de teléfono y OTP
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ConfirmationResult } from "firebase/auth";
import { logger } from "@/lib/logger";

export default function LoginPage() {
  const router = useRouter();
  const { usuario, cargando, iniciarRecaptcha, enviarCodigo } = useAuth();

  const [paso, setPaso] = useState<"telefono" | "codigo">("telefono");
  const [telefono, setTelefono] = useState("+52");
  const [codigo, setCodigo] = useState("");
  const [confirmacion, setConfirmacion] = useState<ConfirmationResult | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!cargando && usuario) router.replace("/dashboard");
  }, [usuario, cargando, router]);

  useEffect(() => {
    iniciarRecaptcha("recaptcha-container");
  }, [iniciarRecaptcha]);

  const handleEnviar = async () => {
    setError("");
    setEnviando(true);
    try {
      const result = await enviarCodigo(telefono);
      setConfirmacion(result);
      setPaso("codigo");
    } catch (err) {
      logger.error("Error enviando código:", err);
      setError("No se pudo enviar el código. Verifica el número.");
    } finally {
      setEnviando(false);
    }
  };

  const handleVerificar = async () => {
    if (!confirmacion) return;
    setError("");
    setEnviando(true);
    try {
      await confirmacion.confirm(codigo);
      // onAuthStateChanged en useAuth redirige automáticamente
    } catch (err) {
      logger.error("Código incorrecto:", err);
      setError("Código incorrecto. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: "linear-gradient(160deg, #FDF0E6 0%, #fff 60%)" }}>

      {/* Logo / título */}
      <div className="mb-10 text-center">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ background: "#C85A2A" }}>
          <span className="text-3xl">🏠</span>
        </div>
        <h1 className="text-2xl font-bold" style={{ color: "#7A3D1A" }}>mcFaro</h1>
        <p className="text-sm text-gray-500 mt-1">Casa Ronald McDonald México</p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm p-6 space-y-5">
        {paso === "telefono" ? (
          <>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Ingresa tu número</h2>
              <p className="text-sm text-gray-400 mt-0.5">Te enviaremos un código de verificación</p>
            </div>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="+52 55 1234 5678"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base outline-none focus:ring-2"
              style={{ focusRingColor: "#F5C842" } as React.CSSProperties}
            />
            {error && <p className="text-sm" style={{ color: "#E87A3A" }}>{error}</p>}
            <button
              onClick={handleEnviar}
              disabled={enviando || telefono.length < 10}
              className="w-full py-4 rounded-2xl text-white font-semibold text-base min-h-[56px] disabled:opacity-60 transition-colors"
              style={{ background: "#C85A2A" }}
            >
              {enviando ? "Enviando…" : "Continuar"}
            </button>
          </>
        ) : (
          <>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Código de verificación</h2>
              <p className="text-sm text-gray-400 mt-0.5">Enviado a {telefono}</p>
            </div>
            <input
              type="number"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="123456"
              maxLength={6}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-2xl tracking-widest text-center outline-none focus:ring-2"
            />
            {error && <p className="text-sm" style={{ color: "#E87A3A" }}>{error}</p>}
            <button
              onClick={handleVerificar}
              disabled={enviando || codigo.length < 6}
              className="w-full py-4 rounded-2xl text-white font-semibold text-base min-h-[56px] disabled:opacity-60 transition-colors"
              style={{ background: "#C85A2A" }}
            >
              {enviando ? "Verificando…" : "Entrar"}
            </button>
            <button onClick={() => setPaso("telefono")}
              className="w-full text-sm text-center py-2"
              style={{ color: "#9A6A2A" }}>
              Cambiar número
            </button>
          </>
        )}
      </div>

      <div id="recaptcha-container" />
    </div>
  );
}
