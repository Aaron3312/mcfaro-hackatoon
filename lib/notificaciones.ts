"use client";
// Helper FCM — solicitar permiso y registrar token
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { logger } from "@/lib/logger";

export async function solicitarPermiso(usuarioId: string): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;

  const permiso = await Notification.requestPermission();
  if (permiso !== "granted") return false;

  try {
    const messaging = getMessaging();
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FCM_VAPID_KEY,
    });
    if (token) {
      await updateDoc(doc(db, "familias", usuarioId), { fcmToken: token });
      logger.info("FCM token registrado");
    }
    return true;
  } catch (err) {
    logger.error("Error registrando FCM token:", err);
    return false;
  }
}

export function escucharMensajes(onRecibir: (titulo: string, cuerpo: string) => void) {
  if (typeof window === "undefined") return () => {};
  const messaging = getMessaging();
  return onMessage(messaging, (payload) => {
    const titulo = payload.notification?.title ?? "mcFaro";
    const cuerpo = payload.notification?.body ?? "";
    onRecibir(titulo, cuerpo);
  });
}
