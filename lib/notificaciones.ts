// Helper para solicitar permisos de notificación y registrar token FCM
import { getToken } from "firebase/messaging";
import { doc, updateDoc } from "firebase/firestore";
import { db, getFirebaseMessaging } from "./firebase";

const VAPID_KEY = process.env.NEXT_PUBLIC_FCM_VAPID_KEY;

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

    const token = await getToken(messaging, { vapidKey: VAPID_KEY });

    if (token) {
      // Guardar el token en el perfil de la familia
      await updateDoc(doc(db, "familias", familiaId), {
        fcmToken: token,
        tokenActualizadoEn: new Date(),
      });
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error al obtener token FCM:", error);
    return false;
  }
}
