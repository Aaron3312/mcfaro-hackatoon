"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { signInWithPhoneNumber, RecaptchaVerifier, ConfirmationResult } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Shield } from "lucide-react";
import { PhoneInput } from "@/components/ui/PhoneInput";

declare global {
  interface Window { recaptchaVerifier?: RecaptchaVerifier; }
}

type Paso = "telefono" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const [paso, setPaso] = useState<Paso>("telefono");
  const [telefono, setTelefono] = useState("");
  const [otp, setOtp] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [confirmacion, setConfirmacion] = useState<ConfirmationResult | null>(null);
  const inicializado = useRef(false);

  useEffect(() => {
    if (inicializado.current) return;
    inicializado.current = true;

    window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
    });

    return () => {
      try { window.recaptchaVerifier?.clear(); } catch (_) {}
      window.recaptchaVerifier = undefined;
    };
  }, []);

  const enviarOTP = async () => {
    setError("");
    setCargando(true);
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", { size: "invisible" });
      }
      const resultado = await signInWithPhoneNumber(auth, telefono, window.recaptchaVerifier);
      setConfirmacion(resultado);
      setPaso("otp");
    } catch (err) {
      const codigo = (err as { code?: string }).code ?? "";
      const mensajes: Record<string, string> = {
        "auth/invalid-phone-number": "Número inválido. Revisa el formato.",
        "auth/too-many-requests": "Demasiados intentos. Espera unos minutos.",
        "auth/invalid-app-credential": "Error de verificación. Recarga la página e intenta de nuevo.",
        "auth/billing-not-enabled": "Error de facturación en Firebase.",
      };
      setError(mensajes[codigo] ?? `Error: ${codigo || "desconocido"}`);
      try { window.recaptchaVerifier?.clear(); } catch (_) {}
      window.recaptchaVerifier = undefined;
    } finally {
      setCargando(false);
    }
  };

  const verificarOTP = async () => {
    if (!confirmacion || otp.length < 6) return;
    setError("");
    setCargando(true);
    try {
      const credencial = await confirmacion.confirm(otp);
      const familiaDoc = await getDoc(doc(db, "familias", credencial.user.uid));
      router.replace(familiaDoc.exists() ? "/dashboard" : "/onboarding");
    } catch (err) {
      const codigo = (err as { code?: string }).code ?? "";
      setError(codigo === "auth/invalid-verification-code"
        ? "Código incorrecto."
        : `Error: ${codigo || "desconocido"}`);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-[#F7EDD5] to-white flex flex-col">
      <div className="flex flex-col items-center pt-16 pb-8 px-6">
        <img src="/logoConFondo.png" alt="mcFaro" className="w-72 max-w-xs rounded-3xl shadow-lg mb-4" />
        <p className="text-gray-500 mt-1 text-center text-sm">Tu guía en Casa Ronald McDonald</p>
      </div>

      <div className="flex-1 px-6 max-w-md mx-auto w-full">
        {paso === "telefono" ? (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Número de teléfono</label>
              <PhoneInput value={telefono} onChange={setTelefono} disabled={cargando} />
              <p className="text-xs text-gray-400 mt-2">Incluye el código de país (+52 para México)</p>
              <p className="text-xs text-orange-400 mt-0.5">Número de prueba: +52 55 5555 0001</p>
            </div>

            {error && <p className="text-[#C85A2A] text-sm bg-[#FDF0E6] rounded-xl px-4 py-3">{error}</p>}

            <button
              onClick={enviarOTP}
              disabled={cargando || telefono.length < 10}
              className="w-full bg-[#C85A2A] text-white rounded-2xl py-4 text-base font-semibold min-h-14 active:bg-[#7A3D1A] disabled:opacity-60 transition-colors shadow-md"
            >
              {cargando ? "Enviando código…" : "Continuar"}
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="bg-green-50 rounded-2xl p-4 flex gap-3">
              <Shield className="text-green-600 shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-green-700">
                Enviamos un código a <span className="font-semibold">{telefono}</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Código de verificación</label>
              <input
                type="number"
                value={otp}
                onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                placeholder="123456"
                className="w-full border border-gray-200 rounded-2xl px-4 py-4 text-xl tracking-[0.5em] text-center outline-none focus:ring-2 focus:ring-[#F5C842]"
                autoComplete="one-time-code"
                inputMode="numeric"
              />
            </div>

            {error && <p className="text-[#C85A2A] text-sm bg-[#FDF0E6] rounded-xl px-4 py-3">{error}</p>}

            <button
              onClick={verificarOTP}
              disabled={cargando || otp.length < 6}
              className="w-full bg-[#C85A2A] text-white rounded-2xl py-4 text-base font-semibold min-h-14 active:bg-[#7A3D1A] disabled:opacity-60 transition-colors shadow-md"
            >
              {cargando ? "Verificando…" : "Entrar"}
            </button>

            <button
              onClick={() => { setPaso("telefono"); setError(""); setOtp(""); }}
              className="w-full text-gray-500 py-3 text-sm"
            >
              Cambiar número
            </button>
          </div>
        )}
      </div>

      <div id="recaptcha-container" />
    </div>
  );
}
