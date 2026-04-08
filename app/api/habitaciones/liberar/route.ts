// POST /api/habitaciones/liberar — libera una habitación (check-out)
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

const BodySchema = z.object({
  habitacionId: z.string().min(1),
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

  const { habitacionId } = resultado.data;

  try {
    const habRef = adminDb.collection("habitaciones").doc(habitacionId);
    const habDoc = await habRef.get();

    if (!habDoc.exists) {
      return NextResponse.json({ error: "Habitación no encontrada" }, { status: 404 });
    }

    const hab = habDoc.data()!;
    const ahora = Timestamp.now();

    // Cerrar registro en historial
    if (hab.familiaId) {
      const histSnap = await adminDb
        .collection("historialHabitaciones")
        .where("habitacionId", "==", habitacionId)
        .where("familiaId", "==", hab.familiaId)
        .where("fechaSalida", "==", null)
        .limit(1)
        .get();

      if (!histSnap.empty) {
        await histSnap.docs[0].ref.update({ fechaSalida: ahora });
      }
    }

    // Liberar habitación
    await habRef.update({
      estado: "disponible",
      familiaId: null,
      nombreFamilia: null,
      fechaOcupacion: null,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error al liberar habitación" }, { status: 500 });
  }
}
