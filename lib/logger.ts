// Utilidad de logging — reemplaza console.log en producción
const isDev = process.env.NODE_ENV === "development";

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return `${error.message}${error.stack ? `\n${error.stack}` : ""}`;
  }
  return String(error);
}

export const logger = {
  info: (mensaje: string, contexto?: unknown) => {
    if (isDev) console.info("[mcFaro]", mensaje, contexto);
  },
  warn: (mensaje: string, contexto?: unknown) => {
    if (isDev) console.warn("[mcFaro]", mensaje, contexto);
  },
  error: (mensaje: string, error?: unknown) => {
    // Los errores siempre se registran (en producción se enviarían a un servicio de monitoreo)
    if (error) {
      console.error("[mcFaro]", mensaje, formatError(error));
    } else {
      console.error("[mcFaro]", mensaje);
    }
  },
  debug: (mensaje: string, contexto?: unknown) => {
    if (isDev) console.debug("[mcFaro]", mensaje, contexto);
  },
};
