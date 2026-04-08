// POST /api/habitaciones/asignar — asigna una familia a una habitación (soporta co-ocupación)
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp, FieldValue } from "firebase-admin/firestore";

const BodySchema = z.object({
  habitacionId: z.string().min(1),
  familiaId: z.string().min(1),
  nombreFamilia: z.string().min(1),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 }); }

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
    const estadoActual: string = hab.estado;

    // Solo se puede asignar si está disponible u ocupada (con espacio)
    if (estadoActual === "mantenimiento" || estadoActual === "bloqueada") {
      return NextResponse.json(
        { error: "La habitación no está disponible para asignación" },
        { status: 409 }
      );
    }

    // Verificar capacidad: ocupantes actuales vs máximo
    const ocupantesActuales: unknown[] = hab.ocupantes ?? [];
    const capacidad: number = hab.capacidad ?? 1;

    if (ocupantesActuales.length >= capacidad) {
      return NextResponse.json(
        { error: `La habitación ya está llena (${capacidad} familia${capacidad !== 1 ? "s" : ""} máximo)` },
        { status: 409 }
      );
    }

    // Verificar que la familia no esté ya asignada
    const yaAsignada = ocupantesActuales.some(
      (o: any) => o.familiaId === familiaId
    );
    if (yaAsignada) {
      return NextResponse.json(
        { error: "Esta familia ya está asignada a esta habitación" },
        { status: 409 }
      );
    }

    const ahora = Timestamp.now();
    const nuevoOcupante = { familiaId, nombreFamilia, fechaIngreso: ahora };

    // Actualizar habitación
    await habRef.update({
      estado: "ocupada",
      ocupantes: FieldValue.arrayUnion(nuevoOcupante),
      // Mantener campos legacy para el primer ocupante
      familiaId: ocupantesActuales.length === 0 ? familiaId : hab.familiaId,
      nombreFamilia: ocupantesActuales.length === 0 ? nombreFamilia : hab.nombreFamilia,
      fechaOcupacion: ocupantesActuales.length === 0 ? ahora : hab.fechaOcupacion,
    });

    // Historial
    await adminDb.collection("historialHabitaciones").add({
      habitacionId,
      familiaId,
      nombreFamilia,
      fechaIngreso: ahora,
      fechaSalida: null,
    });

    // Actualizar habitación en la familia
    await adminDb.collection("familias").doc(familiaId)
      .update({ habitacion: hab.numero })
      .catch(() => {});

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Error al asignar habitación" }, { status: 500 });
  }
}
