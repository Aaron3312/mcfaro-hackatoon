"use client";
// Estado de autenticación global
import { useState, useEffect, useRef } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Familia } from "@/lib/types";
import { logger } from "@/lib/logger";

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

  // Guardar el unsubscribe del snapshot activo para limpiarlo al cambiar de usuario
  const snapshotUnsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      // Cancelar snapshot anterior si existía
      if (snapshotUnsubRef.current) {
        snapshotUnsubRef.current();
        snapshotUnsubRef.current = null;
      }

      if (!user) {
        setState({ user: null, familia: null, cargando: false });
        return;
      }

      // Suscripción en tiempo real — se actualiza automáticamente cuando Firestore cambia
      snapshotUnsubRef.current = onSnapshot(
        doc(db, "familias", user.uid),
        (familiaDoc) => {
          const familia = familiaDoc.exists()
            ? ({ id: familiaDoc.id, ...familiaDoc.data() } as Familia)
            : null;
          setState({ user, familia, cargando: false });
        },
        (error) => {
          logger.error("Error al escuchar perfil familiar:", error);
          setState({ user, familia: null, cargando: false });
        }
      );
    });

    return () => {
      unsubscribeAuth();
      if (snapshotUnsubRef.current) snapshotUnsubRef.current();
    };
  }, []);

  return state;
}
