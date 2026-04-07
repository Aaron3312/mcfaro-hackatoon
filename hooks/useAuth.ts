"use client";
// Estado de autenticación global
import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Familia } from "@/lib/types";

interface AuthState {
  user: User | null;
  familia: Familia | null;
  cargando: boolean;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    familia: null,
    cargando: true,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setState({ user: null, familia: null, cargando: false });
        return;
      }

      try {
        const familiaDoc = await getDoc(doc(db, "familias", user.uid));
        const familia = familiaDoc.exists()
          ? ({ id: familiaDoc.id, ...familiaDoc.data() } as Familia)
          : null;

        setState({ user, familia, cargando: false });
      } catch (error) {
        console.error("Error al cargar perfil familiar:", error);
        setState({ user, familia: null, cargando: false });
      }
    });

    return unsubscribe;
  }, []);

  return state;
}
