// POST /api/notificaciones — envía push via FCM a una familia
import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth, adminMessaging } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const decoded = await adminAuth.verifyIdToken(token);
    const familiaDoc = await adminDb.collection("familias").doc(decoded.uid).get();
    if (!familiaDoc.exists) return NextResponse.json({ error: "Familia no encontrada" }, { status: 404 });

    const { titulo, cuerpo, fcmToken } = await req.json() as {
      titulo: string; cuerpo: string; fcmToken: string;
    };

    await adminMessaging.send({
      token: fcmToken,
      notification: { title: titulo, body: cuerpo },
      android: { priority: "high" },
      apns: { payload: { aps: { sound: "default" } } },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error enviando notificación:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
