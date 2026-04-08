// POST /api/notificaciones/suscribir — guarda o actualiza el token FCM de una familia
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

const BodySchema = z.object({
  familiaId: z.string().min(1),
  token: z.string().min(1),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const resultado = BodySchema.safeParse(body);
  if (!resultado.success) {
    return NextResponse.json({ error: resultado.error.flatten() }, { status: 400 });
  }

  const { familiaId, token } = resultado.data;

  try {
    const familiaRef = adminDb.collection("familias").doc(familiaId);
    const snap = await familiaRef.get();

    if (!snap.exists) {
      return NextResponse.json({ error: "Familia no encontrada" }, { status: 404 });
    }

    // Actualizar token y registrar en historial de tokens
    const ahora = Timestamp.now();
    await familiaRef.update({
      fcmToken: token,
      tokenActualizadoEn: ahora,
    });

    // Registrar en subcolección para auditoría (por si el token cambia)
    await adminDb
      .collection("familias")
      .doc(familiaId)
      .collection("tokens")
      .doc(token.slice(-8)) // usar últimos 8 chars como ID único del token
      .set({ token, registradoEn: ahora }, { merge: true });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error al guardar token" }, { status: 500 });
  }
}
