"use client";
// Credencial digital del cuidador — diseño tipo tarjeta de identificación
import QRCode from "react-qr-code";
import { Familia } from "@/lib/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
  familia: Familia;
}

function Iniciales({ nombre }: { nombre: string }) {
  const partes = nombre.trim().split(" ");
  const iniciales = partes.length >= 2
    ? `${partes[0][0]}${partes[1][0]}`
    : partes[0].slice(0, 2);
  return (
    <div
      className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0"
      style={{ background: "linear-gradient(135deg, #C85A2A, #E87A3A)" }}
    >
      {iniciales.toUpperCase()}
    </div>
  );
}

export function CredencialDigital({ familia }: Props) {
  const fechaIngreso = familia.fechaIngreso
    ? format(familia.fechaIngreso.toDate(), "d MMM yyyy", { locale: es })
    : "—";

  return (
    <div
      className="w-full max-w-sm mx-auto rounded-3xl overflow-hidden shadow-xl"
      style={{ background: "linear-gradient(160deg, #3D1A0A 0%, #7A3D1A 50%, #C85A2A 100%)" }}
    >
      {/* Cabecera */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between">
        <div>
          <p className="text-white font-bold text-lg leading-tight">mcFaro</p>
          <p className="text-white/60 text-xs">Casa Ronald McDonald</p>
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.15)" }}
        >
          <span className="text-xl">🏠</span>
        </div>
      </div>

      {/* Datos del cuidador */}
      <div className="px-6 pb-5 flex items-center gap-4">
        <Iniciales nombre={familia.nombreCuidador} />
        <div className="min-w-0">
          <p className="text-white font-bold text-base leading-tight truncate">
            {familia.nombreCuidador}
          </p>
          <p className="text-white/70 text-xs mt-0.5 truncate">
            Cuidador de <span className="text-white font-medium">{familia.nombreNino}</span>
          </p>
          <p className="text-white/50 text-xs mt-0.5">{familia.hospital}</p>
        </div>
      </div>

      {/* Habitación destacada */}
      {familia.habitacion && (
        <div className="mx-6 mb-5 rounded-2xl flex items-center gap-3 px-4 py-3"
          style={{ background: "rgba(255,255,255,0.12)" }}>
          <span className="text-2xl">🛏️</span>
          <div>
            <p className="text-white/60 text-xs">Habitación</p>
            <p className="text-white font-bold text-xl leading-tight">{familia.habitacion}</p>
          </div>
        </div>
      )}

      {/* QR Code */}
      <div className="mx-6 mb-5 bg-white rounded-2xl p-4 flex flex-col items-center gap-3">
        {familia.qrCode ? (
          <>
            <QRCode
              value={familia.qrCode}
              size={180}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              viewBox="0 0 256 256"
            />
            <p className="text-xs text-gray-400 text-center leading-relaxed">
              Muestra este código al personal de<br />Casa Ronald para identificarte
            </p>
          </>
        ) : (
          <div className="h-44 flex flex-col items-center justify-center gap-2">
            <p className="text-sm text-gray-400">QR no disponible</p>
            <p className="text-xs text-gray-300 text-center">
              Contacta a recepción para generarlo
            </p>
          </div>
        )}
      </div>

      {/* Fecha de ingreso */}
      <div className="px-6 pb-6 flex items-center justify-between">
        <div>
          <p className="text-white/50 text-xs">Ingreso</p>
          <p className="text-white font-medium text-sm">{fechaIngreso}</p>
        </div>
        <div className="text-right">
          <p className="text-white/50 text-xs">Tratamiento</p>
          <p className="text-white font-medium text-sm capitalize">{familia.tipoTratamiento}</p>
        </div>
      </div>
    </div>
  );
}
