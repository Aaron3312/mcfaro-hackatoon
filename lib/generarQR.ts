// Utilidades para generación y validación de QR codes de credenciales
// Solo para uso en el servidor (API routes) — usa el módulo crypto de Node.js
import { createHmac } from "crypto";

function getSecreto(): string {
  return process.env.QR_SECRET ?? "mcfaro-qr-secret-2026";
}

/**
 * Genera un QR code firmado con HMAC-SHA256.
 * Formato: mcfaro:{familiaId}:{firma24chars}
 */
export function generarQRCode(familiaId: string): string {
  const firma = createHmac("sha256", getSecreto())
    .update(familiaId)
    .digest("hex")
    .slice(0, 24);
  return `mcfaro:${familiaId}:${firma}`;
}

/**
 * Extrae y valida el familiaId de un QR code firmado.
 * Devuelve el familiaId si la firma es válida, null si no.
 */
export function validarQRCode(qrCode: string): string | null {
  const partes = qrCode.split(":");
  if (partes.length !== 3 || partes[0] !== "mcfaro") return null;

  const [, familiaId, firma] = partes;
  const firmaEsperada = createHmac("sha256", getSecreto())
    .update(familiaId)
    .digest("hex")
    .slice(0, 24);

  return firma === firmaEsperada ? familiaId : null;
}
