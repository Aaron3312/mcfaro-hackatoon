"use client";
// Escáner de QR para coordinadores — usa html5-qrcode con carga dinámica (evita SSR)
import { useEffect, useRef, useState, useCallback } from "react";
import { logger } from "@/lib/logger";

interface ResultadoValidacion {
  valido: boolean;
  familia?: {
    id: string;
    nombreCuidador: string;
    nombreNino: string;
    habitacion: string | null;
    casaRonald: string;
    fechaIngreso: string | null;
  };
  error?: string;
}

interface Props {
  onResultado?: (resultado: ResultadoValidacion) => void;
}

export function EscanerQR({ onResultado }: Props) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<{ stop: () => Promise<void> } | null>(null);
  const [estado, setEstado] = useState<"inactivo" | "escaneando" | "validando" | "resultado">("inactivo");
  const [resultado, setResultado] = useState<ResultadoValidacion | null>(null);
  const [errorCamara, setErrorCamara] = useState<string | null>(null);

  const detenerScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {
        // Ignorar errores al detener
      }
      scannerRef.current = null;
    }
  }, []);

  const validarQR = useCallback(async (qrCode: string) => {
    await detenerScanner();
    setEstado("validando");

    try {
      const res = await fetch(`/api/credencial/validar/${encodeURIComponent(qrCode)}`);
      const datos: ResultadoValidacion = await res.json();
      setResultado(datos);
      setEstado("resultado");
      onResultado?.(datos);
    } catch (error) {
      logger.error("Error al validar QR:", error);
      const fallback: ResultadoValidacion = { valido: false, error: "Error de conexión al validar" };
      setResultado(fallback);
      setEstado("resultado");
      onResultado?.(fallback);
    }
  }, [detenerScanner, onResultado]);

  const iniciarScanner = useCallback(async () => {
    if (!contenedorRef.current) return;
    setErrorCamara(null);
    setResultado(null);
    setEstado("escaneando");

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("qr-scanner-box");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decoded: string) => { validarQR(decoded); },
        undefined
      );
    } catch (error) {
      logger.error("Error al iniciar cámara:", error);
      setErrorCamara("No se pudo acceder a la cámara. Verifica los permisos.");
      setEstado("inactivo");
    }
  }, [validarQR]);

  // Limpiar scanner al desmontar
  useEffect(() => {
    return () => { detenerScanner(); };
  }, [detenerScanner]);

  function reiniciar() {
    setResultado(null);
    setEstado("inactivo");
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-4 pt-5 pb-3 border-b border-gray-50">
        <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: "#9A6A2A" }}>
          Escáner de credenciales
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">Apunta la cámara al QR del cuidador</p>
      </div>

      <div className="p-4">
        {/* Estado: inactivo */}
        {estado === "inactivo" && (
          <div className="flex flex-col items-center gap-4 py-6">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{ background: "#FDF0E6" }}
            >
              <span className="text-4xl">📷</span>
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-800">Listo para escanear</p>
              <p className="text-xs text-gray-400 mt-1">Se solicitará permiso de cámara</p>
            </div>
            {errorCamara && (
              <p className="text-xs text-red-500 text-center bg-red-50 rounded-xl px-4 py-2">
                {errorCamara}
              </p>
            )}
            <button
              onClick={iniciarScanner}
              className="bg-[#C85A2A] text-white rounded-2xl px-10 py-4 text-base font-semibold min-h-[56px] active:bg-[#7A3D1A] shadow-md"
            >
              Abrir cámara
            </button>
          </div>
        )}

        {/* Estado: escaneando — contenedor del scanner */}
        {estado === "escaneando" && (
          <div className="flex flex-col items-center gap-4">
            <div
              ref={contenedorRef}
              id="qr-scanner-box"
              className="w-full rounded-xl overflow-hidden"
              style={{ maxWidth: 320 }}
            />
            <button
              onClick={async () => { await detenerScanner(); setEstado("inactivo"); }}
              className="border-2 border-gray-300 text-gray-600 rounded-2xl px-8 py-3 text-sm font-semibold active:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        )}

        {/* Estado: validando */}
        {estado === "validando" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div
              className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: "#C85A2A", borderTopColor: "transparent" }}
            />
            <p className="text-sm text-gray-500">Validando credencial…</p>
          </div>
        )}

        {/* Estado: resultado */}
        {estado === "resultado" && resultado && (
          <div className="flex flex-col gap-4">
            {resultado.valido && resultado.familia ? (
              <div className="rounded-2xl border-2 border-green-300 bg-green-50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">✅</span>
                  <p className="font-bold text-green-800">Credencial válida</p>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Cuidador", valor: resultado.familia.nombreCuidador },
                    { label: "Paciente", valor: resultado.familia.nombreNino },
                    {
                      label: "Habitación",
                      valor: resultado.familia.habitacion ?? "Sin asignar",
                    },
                    { label: "Casa Ronald", valor: resultado.familia.casaRonald },
                  ].map(({ label, valor }) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-green-700 font-medium">{label}</span>
                      <span className="text-green-900 font-semibold">{valor}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">❌</span>
                  <p className="font-bold text-red-800">Credencial inválida</p>
                </div>
                <p className="text-xs text-red-600">{resultado.error ?? "No se pudo verificar la identidad"}</p>
              </div>
            )}

            <button
              onClick={reiniciar}
              className="w-full bg-[#C85A2A] text-white rounded-2xl py-4 text-base font-semibold min-h-[56px] active:bg-[#7A3D1A] shadow-md"
            >
              Escanear otro
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
