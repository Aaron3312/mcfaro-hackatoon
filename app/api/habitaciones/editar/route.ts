// PATCH /api/habitaciones/editar — edita número, piso o capacidad de una habitación
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";

const BodySchema = z.object({
  habitacionId: z.string().min(1),
  numero: z.string().min(1).optional(),
  piso: z.string().min(1).optional(),
  capacidad: z.number().int().min(1).max(20).optional(),
});

export async function PATCH(request: NextRequest) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 }); }

  const result = BodySchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
  }

  const { habitacionId, ...campos } = result.data;
  const cambios: Record<string, unknown> = {};
  if (campos.numero   !== undefined) cambios.numero   = campos.numero;
  if (campos.piso     !== undefined) cambios.piso     = campos.piso;
  if (campos.capacidad !== undefined) cambios.capacidad = campos.capacidad;

  if (Object.keys(cambios).length === 0) {
    return NextResponse.json({ error: "Sin cambios" }, { status: 400 });
  }

  try {
    const ref = adminDb.collection("habitaciones").doc(habitacionId);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Habitación no encontrada" }, { status: 404 });
    }

    await ref.update(cambios);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error al editar habitación" }, { status: 500 });
  }
}
