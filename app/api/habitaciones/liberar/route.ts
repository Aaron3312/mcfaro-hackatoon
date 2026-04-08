// POST /api/habitaciones/liberar — check-out de una familia específica
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp, FieldValue } from "firebase-admin/firestore";

const BodySchema = z.object({
  habitacionId: z.string().min(1),
  familiaId: z.string().min(1),  // familia específica a retirar
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 }); }

  const resultado = BodySchema.safeParse(body);
  if (!resultado.success) {
    return NextResponse.json({ error: resultado.error.flatten() }, { status: 400 });
  }

  const { habitacionId, familiaId } = resultado.data;

  try {
    const habRef = adminDb.collection("habitaciones").doc(habitacionId);
    const habDoc = await habRef.get();

    if (!habDoc.exists) {
      return NextResponse.json({ error: "Habitación no encontrada" }, { status: 404 });
    }

    const hab = habDoc.data()!;
    const ahora = Timestamp.now();

    // Encontrar el ocupante a retirar
    const ocupantes: any[] = hab.ocupantes ?? [];
    const ocupante = ocupantes.find((o) => o.familiaId === familiaId);

    // Soportar también el campo legacy si no hay array
    const familiaLegacy = !ocupante && hab.familiaId === familiaId;

    if (!ocupante && !familiaLegacy) {
      return NextResponse.json(
        { error: "La familia no está asignada a esta habitación" },
        { status: 404 }
      );
    }

    // Cerrar historial de esta familia
    const histSnap = await adminDb
      .collection("historialHabitaciones")
      .where("habitacionId", "==", habitacionId)
      .where("familiaId", "==", familiaId)
      .where("fechaSalida", "==", null)
      .limit(1)
      .get();

    if (!histSnap.empty) {
      await histSnap.docs[0].ref.update({ fechaSalida: ahora });
    }

    // Quitar el ocupante del array
    const nuevosOcupantes = ocupante
      ? ocupantes.filter((o) => o.familiaId !== familiaId)
      : [];

    const quedanOcupantes = nuevosOcupantes.length > 0;

    // Actualizar habitación
    const actualizacion: Record<string, unknown> = {
      ocupantes: nuevosOcupantes,
      estado: quedanOcupantes ? "ocupada" : "disponible",
    };

    if (quedanOcupantes) {
      // El nuevo "primary" es el primer ocupante restante
      actualizacion.familiaId = nuevosOcupantes[0].familiaId;
      actualizacion.nombreFamilia = nuevosOcupantes[0].nombreFamilia;
      actualizacion.fechaOcupacion = nuevosOcupantes[0].fechaIngreso;
    } else {
      actualizacion.familiaId = null;
      actualizacion.nombreFamilia = null;
      actualizacion.fechaOcupacion = null;
    }

    await habRef.update(actualizacion);

    // Limpiar habitación en el documento de la familia
    await adminDb.collection("familias").doc(familiaId)
      .update({ habitacion: "" })
      .catch(() => {});

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error al liberar habitación" }, { status: 500 });
  }
}
