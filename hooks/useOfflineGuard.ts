"use client";
// Hook para bloquear acciones cuando no hay conexión a internet
// Muestra un toast de advertencia y previene la ejecución
import { useOnlineStatus } from "./useOnlineStatus";
import { useToast } from "@/components/ui/Toast";

interface UseOfflineGuardReturn {
  /** Indica si hay conexión a internet */
  online: boolean;

  /**
   * Ejecuta una función solo si hay conexión.
   * Si no hay conexión, muestra un toast de advertencia.
   * @param fn - Función a ejecutar
   * @param mensaje - Mensaje personalizado de error (opcional)
   * @returns El resultado de la función o null si no hay conexión
   */
  ejecutarConConexion: <T>(
    fn: () => T | Promise<T>,
    mensaje?: string
  ) => Promise<T | null>;

  /**
   * Verifica si hay conexión y muestra advertencia si no la hay.
   * Útil para deshabilitar botones.
   * @param mensaje - Mensaje personalizado (opcional)
   * @returns true si hay conexión, false si no
   */
  verificarConexion: (mensaje?: string) => boolean;
}

export function useOfflineGuard(): UseOfflineGuardReturn {
  const online = useOnlineStatus();
  const { mostrar } = useToast();

  const verificarConexion = (mensaje?: string): boolean => {
    if (!online) {
      mostrar(
        mensaje || "⚠️ Esta acción requiere conexión a Internet",
        "error"
      );
      return false;
    }
    return true;
  };

  const ejecutarConConexion = async <T,>(
    fn: () => T | Promise<T>,
    mensaje?: string
  ): Promise<T | null> => {
    if (!verificarConexion(mensaje)) {
      return null;
    }

    try {
      return await fn();
    } catch (error) {
      // Re-throw para que el componente maneje el error
      throw error;
    }
  };

  return {
    online,
    ejecutarConConexion,
    verificarConexion,
  };
}
