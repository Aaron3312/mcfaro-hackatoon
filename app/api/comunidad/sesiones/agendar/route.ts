// POST /api/comunidad/sesiones/agendar — agenda una sesión de psicología
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

const BodySchema = z.object({
  familiaId: z.string().min(1),
  nombreCuidador: z.string().min(1),
  psicologoNombre: z.string().min(1),
  fecha: z.string().datetime(),   // ISO 8601
  duracionMin: z.number().int().min(15).max(120).default(60),
  modalidad: z.enum(["presencial", "videollamada"]),
  notas: z.string().max(500).optional(),
  casaRonald: z.string().min(1),
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

  const { familiaId, nombreCuidador, psicologoNombre, fecha, duracionMin, modalidad, notas, casaRonald } =
    resultado.data;

  const fechaTs = Timestamp.fromDate(new Date(fecha));

  // Verificar que no haya conflicto de horario para el mismo psicólogo
  try {
    const margenMs = duracionMin * 60 * 1000;
    const inicio = Timestamp.fromMillis(fechaTs.toMillis() - margenMs);
    const fin = Timestamp.fromMillis(fechaTs.toMillis() + margenMs);

    const conflicto = await adminDb
      .collection("sesionesPsicologia")
      .where("psicologoNombre", "==", psicologoNombre)
      .where("estado", "==", "agendada")
      .where("fecha", ">=", inicio)
      .where("fecha", "<=", fin)
      .limit(1)
      .get();

    if (!conflicto.empty) {
      return NextResponse.json(
        { error: "El psicólogo ya tiene una sesión en ese horario" },
        { status: 409 }
      );
    }

    const ref = await adminDb.collection("sesionesPsicologia").add({
      familiaId,
      nombreCuidador,
      psicologoNombre,
      fecha: fechaTs,
      duracionMin,
      modalidad,
      notas: notas ?? null,
      casaRonald,
      estado: "agendada",
      creadaEn: Timestamp.now(),
    });

    // Notificar a la familia (si tiene token FCM)
    const familiaDoc = await adminDb.collection("familias").doc(familiaId).get();
    const fcmToken = familiaDoc.data()?.fcmToken as string | undefined;
    if (fcmToken) {
      const { getAdminMessaging } = await import("@/lib/firebase-admin");
      await getAdminMessaging().send({
        token: fcmToken,
        notification: {
          title: "Sesión agendada",
          body: `Tu sesión con ${psicologoNombre} fue confirmada`,
        },
        webpush: { notification: { icon: "/icons/icon-192.png" } },
      }).catch(() => {});
    }

    return NextResponse.json({ ok: true, id: ref.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error al agendar sesión" }, { status: 500 });
  }
}
