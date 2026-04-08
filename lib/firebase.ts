// Inicialización del cliente Firebase
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

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

// Inicializar Firestore con persistencia offline usando la API moderna.
// persistentLocalCache reemplaza el deprecado enableIndexedDbPersistence.
// initializeFirestore solo puede llamarse una vez por app; si ya existe, usar getFirestore.
function crearDb() {
  // En servidor, solo retornar getFirestore básico
  if (typeof window === "undefined") {
    return getFirestore(app);
  }

  // Verificar si ya existe una instancia
  try {
    const existingDb = getFirestore(app);
    return existingDb;
  } catch {
    // No existe, crear nueva instancia con persistencia
    try {
      return initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      });
    } catch (error) {
      // Si falla la persistencia, usar configuración básica
      console.warn("Firestore persistence failed, using default cache:", error);
      return getFirestore(app);
    }
  }
}

export const db = crearDb();

// Messaging lazy — requiere service worker
export const getFirebaseMessaging = async () => {
  if (typeof window === "undefined") return null;
  const { getMessaging, isSupported } = await import("firebase/messaging");
  if (!(await isSupported())) return null;
  return getMessaging(app);
};

export const storage = getStorage(app);

export default app;
