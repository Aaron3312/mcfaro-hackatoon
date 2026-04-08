// GET /api/recordatorios — revisa citas próximas y envía push si corresponde
// Se puede llamar con un cron externo (Vercel Cron, Cloud Scheduler, etc.)
import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { adminDb, getAdminMessaging } from "@/lib/firebase-admin";

// Clave secreta para proteger el endpoint de llamadas no autorizadas
const CRON_SECRET = process.env.CRON_SECRET ?? "dev-secret";

// Claves permitidas: CRON_SECRET de env, el token demo para desarrollo y Vercel Cron
const DEMO_KEY = "mcfaro-demo-2026";

export async function GET(request: NextRequest) {
  // Verificar autorización — acepta CRON_SECRET o la clave demo de desarrollo
  const auth = request.headers.get("authorization");
  const esAutorizado =
    auth === `Bearer ${CRON_SECRET}` || auth === `Bearer ${DEMO_KEY}`;
  if (!esAutorizado) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const ahora = new Date();
  const en65min = new Date(ahora.getTime() + 65 * 60 * 1000);
  const en60min = new Date(ahora.getTime() + 60 * 60 * 1000);
  const en20min = new Date(ahora.getTime() + 20 * 60 * 1000);
  const en15min = new Date(ahora.getTime() + 15 * 60 * 1000);

  try {
    // Buscar citas en la ventana de 60 minutos
    const citasSnapshot = await adminDb
      .collection("citas")
      .where("notificacionEnviada", "==", false)
      .where("fecha", ">=", Timestamp.fromDate(en15min))
      .where("fecha", "<=", Timestamp.fromDate(en65min))
      .get();

    const enviadas: string[] = [];

    for (const citaDoc of citasSnapshot.docs) {
      const cita = citaDoc.data();
      const fechaCita = (cita.fecha as Timestamp).toDate();
      const minutosRestantes = Math.round((fechaCita.getTime() - ahora.getTime()) / 60000);

      // Determinar qué recordatorio aplica
      const es60 = minutosRestantes <= 65 && minutosRestantes >= 55 && cita.recordatorio60;
      const es15 = minutosRestantes <= 20 && minutosRestantes >= 10 && cita.recordatorio15;

      if (!es60 && !es15) continue;

      // Obtener el token FCM de la familia
      const familiaDoc = await adminDb.collection("familias").doc(cita.familiaId as string).get();
      if (!familiaDoc.exists) continue;

      const fcmToken = familiaDoc.data()?.fcmToken as string | undefined;
      if (!fcmToken) continue;

      const titulo = es60
        ? `⏰ Cita en ~1 hora`
        : `🚨 Cita en ~15 minutos`;
      const cuerpo = es60
        ? `${cita.titulo} — recuerda el tiempo de traslado`
        : `${cita.titulo} — ¡es hora de salir!`;

      try {
        await getAdminMessaging().send({
          token: fcmToken,
          notification: { title: titulo, body: cuerpo },
          webpush: {
            notification: {
              icon: "/icons/icon-192.png",
              badge: "/icons/icon-192.png",
            },
          },
        });

        // Marcar como enviada solo si es el recordatorio de 15 min (el último)
        if (es15) {
          await citaDoc.ref.update({ notificacionEnviada: true });
        }

        enviadas.push(`${cita.titulo} (${minutosRestantes}min)`);
      } catch (err) {
        console.error(`Error enviando push para cita ${citaDoc.id}:`, err);
      }
    }

    return NextResponse.json({
      ok: true,
      enviadas: enviadas.length,
      detalle: enviadas,
    });
  } catch (error) {
    console.error("Error en recordatorios:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
