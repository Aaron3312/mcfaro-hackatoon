// Utilidad de logging — reemplaza console.log en producción
const isDev = process.env.NODE_ENV === "development";

export const logger = {
  info: (...args: unknown[]) => {
    if (isDev) console.info("[mcFaro]", ...args);
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn("[mcFaro]", ...args);
  },
  error: (...args: unknown[]) => {
    // Los errores siempre se registran (en producción se enviarían a un servicio de monitoreo)
    console.error("[mcFaro]", ...args);
  },
};
