// Endpoint POST /api/notificaciones — envía push via FCM
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb, adminMessaging } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

const BodySchema = z.object({
  familiaId: z.string().min(1),
  titulo: z.string(),
  cuerpo: z.string(),
  citaId: z.string().optional(),
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

  const { familiaId, titulo, cuerpo, citaId } = resultado.data;

  try {
    // Obtener token FCM de la familia
    const familiaDoc = await adminDb.collection("familias").doc(familiaId).get();
    if (!familiaDoc.exists) {
      return NextResponse.json({ error: "Familia no encontrada" }, { status: 404 });
    }

    const fcmToken = familiaDoc.data()?.fcmToken as string | undefined;
    if (!fcmToken) {
      return NextResponse.json({ error: "Sin token FCM registrado" }, { status: 400 });
    }

    // Enviar notificación
    await adminMessaging.send({
      token: fcmToken,
      notification: { title: titulo, body: cuerpo },
      webpush: {
        notification: {
          icon: "/icons/icon-192.png",
          badge: "/icons/icon-192.png",
        },
      },
    });

    // Marcar notificación como enviada en la cita
    if (citaId) {
      await adminDb.collection("citas").doc(citaId).update({
        notificacionEnviada: true,
        notificacionEnviadaEn: Timestamp.now(),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error al enviar notificación:", error);
    return NextResponse.json({ error: "Error al enviar notificación" }, { status: 500 });
  }
}
