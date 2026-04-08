// PATCH /api/transporte/:id/estado — actualiza el estado de un viaje
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

const BodySchema = z.object({
  estado: z.enum(["pendiente", "asignada", "en_camino", "completada", "cancelada"]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
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

  const { id } = params;
  const { estado } = resultado.data;

  try {
    const ref = adminDb.collection("solicitudesTransporte").doc(id);
    const doc = await ref.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
    }

    await ref.update({ estado, actualizadaEn: Timestamp.now() });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar estado" }, { status: 500 });
  }
}
