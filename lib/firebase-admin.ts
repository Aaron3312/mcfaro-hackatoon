// Firebase Admin SDK — solo para uso en el servidor (API routes)
// Inicialización lazy para evitar errores en build time cuando las env vars están vacías
import { App, getApps, initializeApp, cert } from "firebase-admin/app";
import type { Firestore } from "firebase-admin/firestore";
import type { Messaging } from "firebase-admin/messaging";

let _app: App | null = null;

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0];

  if (!_app) {
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

    _app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
        privateKey: privateKey!,
      }),
    });
  }

  return _app;
}

// Getters lazy — se inicializan en la primera llamada, no en import time
export function getAdminDb(): Firestore {
  const { getFirestore } = require("firebase-admin/firestore") as typeof import("firebase-admin/firestore");
  return getFirestore(getAdminApp());
}

export function getAdminMessaging(): Messaging {
  const { getMessaging } = require("firebase-admin/messaging") as typeof import("firebase-admin/messaging");
  return getMessaging(getAdminApp());
}

// Exports directos para uso conveniente en API routes
export const adminDb = new Proxy({} as Firestore, {
  get(_, prop) {
    return (getAdminDb() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const adminMessaging = new Proxy({} as Messaging, {
  get(_, prop) {
    return (getAdminMessaging() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
