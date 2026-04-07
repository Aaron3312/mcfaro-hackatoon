// Inicialización del cliente Firebase
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

// En desarrollo, deshabilitar verificación de app para saltarse reCAPTCHA en localhost
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (auth as any).settings.appVerificationDisabledForTesting = true;
}

export const db = getFirestore(app);

// Persistencia offline — solo en el navegador
if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db).catch(() => {
    // Silenciar errores de múltiples pestañas o navegadores sin soporte
  });
}

// Messaging lazy — requiere service worker
export const getFirebaseMessaging = async () => {
  if (typeof window === "undefined") return null;
  const { getMessaging, isSupported } = await import("firebase/messaging");
  if (!(await isSupported())) return null;
  return getMessaging(app);
};

export default app;
