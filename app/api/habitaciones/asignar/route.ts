// POST /api/habitaciones/asignar — asigna una habitación a una familia
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

const BodySchema = z.object({
  habitacionId: z.string().min(1),
  familiaId: z.string().min(1),
  nombreFamilia: z.string().min(1),
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

  const { habitacionId, familiaId, nombreFamilia } = resultado.data;

  try {
    const habRef = adminDb.collection("habitaciones").doc(habitacionId);
    const habDoc = await habRef.get();

    if (!habDoc.exists) {
      return NextResponse.json({ error: "Habitación no encontrada" }, { status: 404 });
    }

    const hab = habDoc.data()!;
    if (hab.estado !== "disponible") {
      return NextResponse.json(
        { error: "La habitación no está disponible" },
        { status: 409 }
      );
    }

    const ahora = Timestamp.now();

    // Actualizar habitación
    await habRef.update({
      estado: "ocupada",
      familiaId,
      nombreFamilia,
      fechaOcupacion: ahora,
    });

    // Registrar en historial
    await adminDb.collection("historialHabitaciones").add({
      habitacionId,
      familiaId,
      nombreFamilia,
      fechaIngreso: ahora,
      fechaSalida: null,
    });

    // Actualizar habitacion en el documento de la familia
    await adminDb.collection("familias").doc(familiaId).update({
      habitacion: hab.numero,
    }).catch(() => {}); // no falla si el campo no existe

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Error al asignar habitación" }, { status: 500 });
  }
}
