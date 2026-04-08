/**
 * Script para crear usuario coordinador en Firebase Auth + Firestore
 * Uso: node scripts/crear-coordinador.mjs
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim().replace(/^"|"$/g, "")];
    })
);

const privateKey = env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n");

initializeApp({
  credential: cert({
    projectId: env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey,
  }),
});

const auth = getAuth();
const db = getFirestore();

const TELEFONO_NUEVO = "+525511112222";
const TELEFONO_VIEJO = "+525512345678";

async function main() {
  // 1. Buscar usuario existente por teléfono viejo y actualizar
  let uid;
  try {
    const existing = await auth.getUserByPhoneNumber(TELEFONO_VIEJO);
    uid = existing.uid;
    await auth.updateUser(uid, { phoneNumber: TELEFONO_NUEVO });
    console.log(`Número actualizado para UID: ${uid}`);
  } catch {
    // No existe con el viejo, buscar con el nuevo o crear
    try {
      const existing = await auth.getUserByPhoneNumber(TELEFONO_NUEVO);
      uid = existing.uid;
      console.log(`Usuario ya existe con número nuevo: ${uid}`);
    } catch {
      const nuevo = await auth.createUser({ phoneNumber: TELEFONO_NUEVO });
      uid = nuevo.uid;
      console.log(`Usuario creado: ${uid}`);
    }
  }

  // 2. Actualizar documento en Firestore
  await db.collection("familias").doc(uid).set(
    {
      nombreCuidador: "Coordinador Demo",
      telefono: TELEFONO_NUEVO,
      hospital: "Hospital Infantil de México",
      casaRonald: "casa-ronald-cdmx",
      rol: "coordinador",
      fechaIngreso: new Date(),
      tipoTratamiento: "otro",
    },
    { merge: true }
  );

  console.log(`\n✅ Coordinador listo`);
  console.log(`   UID:      ${uid}`);
  console.log(`   Teléfono: ${TELEFONO_NUEVO}`);
  console.log(`   Rol:      coordinador`);
  console.log(`\n👉 Úsalo en el login: +52 55 1111 2222`);
}

main().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});
