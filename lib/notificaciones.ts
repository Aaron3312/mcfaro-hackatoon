// Helper FCM — solicitar permisos, registrar token, escuchar mensajes entrantes
import { getToken, onMessage } from "firebase/messaging";
import { getFirebaseMessaging } from "./firebase";

const VAPID_KEY = process.env.NEXT_PUBLIC_FCM_VAPID_KEY;

/**
 * Solicita permiso de notificaciones al usuario y registra el token FCM.
 * Usa nuestra propia SW registration (/sw.js) para no necesitar firebase-messaging-sw.js.
 * Guarda el token en Firestore vía API para mantener el historial de tokens.
 */
export async function solicitarPermisoNotificaciones(familiaId: string): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }

  const permiso = await Notification.requestPermission();
  if (permiso !== "granted") {
    return false;
  }

  try {
    const messaging = await getFirebaseMessaging();
    if (!messaging) return false;

    // Usar nuestra SW registration para evitar necesitar firebase-messaging-sw.js
    const swRegistration = await navigator.serviceWorker.ready;

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swRegistration,
    });

    if (!token) return false;

    // Guardar token en Firestore vía API (registra historial y timestamp)
    await fetch("/api/notificaciones/suscribir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ familiaId, token }),
    });

    return true;
  } catch {
    return false;
  }
}

/**
 * Escucha mensajes push en primer plano y ejecuta el callback con los datos.
 * Retorna la función para desuscribirse.
 */
export async function suscribirMensajesEntrantes(
  onNotificacion: (titulo: string, cuerpo: string, url?: string) => void
): Promise<(() => void) | null> {
  try {
    const messaging = await getFirebaseMessaging();
    if (!messaging) return null;

    const unsub = onMessage(messaging, (payload) => {
      const titulo = payload.notification?.title ?? "McFaro";
      const cuerpo = payload.notification?.body ?? "";
      const url = (payload.data?.url as string | undefined);
      onNotificacion(titulo, cuerpo, url);
    });

    return unsub;
  } catch {
    return null;
  }
}

/**
 * Devuelve el estado actual del permiso de notificaciones.
 */
export function estadoPermiso(): NotificationPermission | "no-soportado" {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "no-soportado";
  }
  return Notification.permission;
}
