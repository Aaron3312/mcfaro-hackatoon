"use client";
import { useState, useEffect } from "react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Familia } from "@/lib/types";
import { logger } from "@/lib/logger";

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

export function useAuth() {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [familia, setFamilia] = useState<Familia | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user: User | null) => {
      setUsuario(user);
      if (user) {
        try {
          const snap = await getDoc(doc(db, "familias", user.uid));
          if (snap.exists()) {
            setFamilia({ id: snap.id, ...snap.data() } as Familia);
          }
        } catch (err) {
          logger.error("Error cargando familia:", err);
        }
      } else {
        setFamilia(null);
      }
      setCargando(false);
    });
    return unsub;
  }, []);

  const iniciarRecaptcha = (contenedorId: string) => {
    if (window.recaptchaVerifier) return;
    window.recaptchaVerifier = new RecaptchaVerifier(auth, contenedorId, {
      size: "invisible",
    });
  };

  const enviarCodigo = async (telefono: string): Promise<ConfirmationResult> => {
    if (!window.recaptchaVerifier) throw new Error("Recaptcha no inicializado");
    return signInWithPhoneNumber(auth, telefono, window.recaptchaVerifier);
  };

  const cerrarSesion = () => auth.signOut();

  return { usuario, familia, cargando, iniciarRecaptcha, enviarCodigo, cerrarSesion };
}
