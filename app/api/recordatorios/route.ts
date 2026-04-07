// POST /api/recordatorios — programa recordatorios para una cita
import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth, adminMessaging } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const decoded = await adminAuth.verifyIdToken(token);
    const { citaId } = await req.json() as { citaId: string };

    const citaDoc = await adminDb.collection("citas").doc(citaId).get();
    if (!citaDoc.exists) return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });

    const cita = citaDoc.data()!;
    if (cita.familiaId !== decoded.uid) return NextResponse.json({ error: "Sin permiso" }, { status: 403 });

    const familiaDoc = await adminDb.collection("familias").doc(decoded.uid).get();
    const fcmToken = familiaDoc.data()?.fcmToken as string | undefined;
    if (!fcmToken) return NextResponse.json({ error: "Sin token FCM" }, { status: 400 });

    const fechaCita = (cita.fecha as Timestamp).toDate();
    const ahora = new Date();
    const enviados: string[] = [];

    const enviar = async (minutos: number, campo: string) => {
      const tiempoRecordatorio = new Date(fechaCita.getTime() - minutos * 60 * 1000);
      if (tiempoRecordatorio > ahora) {
        await adminMessaging.send({
          token: fcmToken,
          notification: {
            title: `⏰ Cita en ${minutos} minutos`,
            body: cita.titulo as string,
          },
        });
        await adminDb.collection("citas").doc(citaId).update({
          [campo]: true,
          notificacionEnviada: true,
        });
        enviados.push(`${minutos}min`);
      }
    };

    if (cita.recordatorio60) await enviar(60, "recordatorio60Enviado");
    if (cita.recordatorio15) await enviar(15, "recordatorio15Enviado");

    return NextResponse.json({ ok: true, enviados });
  } catch (err) {
    console.error("Error programando recordatorio:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
