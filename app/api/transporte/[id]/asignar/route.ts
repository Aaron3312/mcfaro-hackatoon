// PATCH /api/transporte/:id/asignar — coordinador asigna unidad y chofer a una solicitud
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

const BodySchema = z.object({
  unidadId: z.string().min(1),
  placasUnidad: z.string().min(1),
  nombreChofer: z.string().min(1),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { unidadId, placasUnidad, nombreChofer } = resultado.data;
  const { id } = await params;

  try {
    const ref = adminDb.collection("solicitudesTransporte").doc(id);
    const doc = await ref.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
    }

    const datos = doc.data();
    if (datos?.estado === "cancelada" || datos?.estado === "completada") {
      return NextResponse.json(
        { error: "No se puede asignar una solicitud cancelada o completada" },
        { status: 409 }
      );
    }

    await ref.update({
      estado: "asignada",
      unidadId,
      placasUnidad,
      nombreChofer,
      actualizadaEn: Timestamp.now(),
    });

    // Notificar a la familia via FCM si tiene token
    const familiaId = datos?.familiaId as string | undefined;
    if (familiaId) {
      const familiaDoc = await adminDb.collection("familias").doc(familiaId).get();
      const fcmToken = familiaDoc.data()?.fcmToken as string | undefined;
      if (fcmToken) {
        const { adminMessaging } = await import("@/lib/firebase-admin");
        await adminMessaging.send({
          token: fcmToken,
          notification: {
            title: "Transporte asignado",
            body: `Tu transporte ha sido confirmado. Unidad: ${placasUnidad} — Chofer: ${nombreChofer}`,
          },
          webpush: { notification: { icon: "/icons/icon-192.png" } },
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Error al asignar unidad" }, { status: 500 });
  }
}
