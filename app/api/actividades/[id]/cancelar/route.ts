// DELETE /api/actividades/:id/cancelar — cancela una actividad y notifica a registrados
import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminMessaging } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const ref = adminDb.collection("actividades").doc(id);
    const doc = await ref.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Actividad no encontrada" }, { status: 404 });
    }

    const datos = doc.data();
    if (datos?.estado === "cancelada" || datos?.estado === "completada") {
      return NextResponse.json(
        { error: "No se puede cancelar una actividad ya completada o cancelada" },
        { status: 409 }
      );
    }

    // Cancelar la actividad
    await ref.update({ estado: "cancelada", actualizadaEn: Timestamp.now() });

    // Notificar a todas las familias registradas
    const registradosSnap = await adminDb
      .collection("registrosActividad")
      .where("actividadId", "==", id)
      .get();

    const notificaciones = registradosSnap.docs.map(async (regDoc) => {
      const { familiaId } = regDoc.data();
      const familiaDoc = await adminDb.collection("familias").doc(familiaId).get();
      const fcmToken = familiaDoc.data()?.fcmToken as string | undefined;
      if (!fcmToken) return;

      return adminMessaging.send({
        token: fcmToken,
        notification: {
          title: "Actividad cancelada",
          body: `La actividad "${datos?.titulo}" ha sido cancelada.`,
        },
        webpush: { notification: { icon: "/icons/icon-192.png" } },
      });
    });

    await Promise.allSettled(notificaciones);

    return NextResponse.json({ ok: true, notificados: registradosSnap.size });
  } catch {
    return NextResponse.json({ error: "Error al cancelar actividad" }, { status: 500 });
  }
}
