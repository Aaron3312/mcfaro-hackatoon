// POST /api/actividades/registrar — familia se inscribe o cancela inscripción en una actividad
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp, FieldValue } from "firebase-admin/firestore";

const BodySchema = z.object({
  actividadId: z.string().min(1),
  familiaId: z.string().min(1),
  nombreCuidador: z.string().min(1),
  accion: z.enum(["registrar", "cancelar"]),
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

  const { actividadId, familiaId, nombreCuidador, accion } = resultado.data;

  try {
    const actividadRef = adminDb.collection("actividades").doc(actividadId);
    const actividadDoc = await actividadRef.get();

    if (!actividadDoc.exists) {
      return NextResponse.json({ error: "Actividad no encontrada" }, { status: 404 });
    }

    const actividad = actividadDoc.data()!;

    if (actividad.estado === "cancelada" || actividad.estado === "completada") {
      return NextResponse.json({ error: "No se puede registrar en esta actividad" }, { status: 409 });
    }

    // Buscar registro existente
    const registroSnap = await adminDb
      .collection("registrosActividad")
      .where("actividadId", "==", actividadId)
      .where("familiaId", "==", familiaId)
      .limit(1)
      .get();

    if (accion === "registrar") {
      if (!registroSnap.empty) {
        return NextResponse.json({ error: "Ya estás registrado en esta actividad" }, { status: 409 });
      }

      // Validar capacidad
      if (actividad.registrados >= actividad.capacidadMax) {
        return NextResponse.json({ error: "La actividad está llena" }, { status: 409 });
      }

      // Crear registro e incrementar contador atómicamente
      await Promise.all([
        adminDb.collection("registrosActividad").add({
          actividadId,
          familiaId,
          nombreCuidador,
          fechaRegistro: Timestamp.now(),
          asistio: false,
        }),
        actividadRef.update({ registrados: FieldValue.increment(1) }),
      ]);

      return NextResponse.json({ ok: true, accion: "registrado" }, { status: 201 });
    } else {
      // cancelar
      if (registroSnap.empty) {
        return NextResponse.json({ error: "No tienes registro en esta actividad" }, { status: 404 });
      }

      await Promise.all([
        registroSnap.docs[0].ref.delete(),
        actividadRef.update({ registrados: FieldValue.increment(-1) }),
      ]);

      return NextResponse.json({ ok: true, accion: "cancelado" });
    }
  } catch {
    return NextResponse.json({ error: "Error al procesar registro" }, { status: 500 });
  }
}
