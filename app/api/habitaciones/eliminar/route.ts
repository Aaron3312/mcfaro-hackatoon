// DELETE /api/habitaciones/eliminar — elimina una habitación (solo si está disponible o bloqueada)
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";

const BodySchema = z.object({ habitacionId: z.string().min(1) });

export async function DELETE(request: NextRequest) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 }); }

  const result = BodySchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
  }

  const { habitacionId } = result.data;

  try {
    const ref = adminDb.collection("habitaciones").doc(habitacionId);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Habitación no encontrada" }, { status: 404 });
    }

    const data = snap.data()!;
    if (data.estado === "ocupada") {
      return NextResponse.json(
        { error: "No se puede eliminar una habitación ocupada. Libérala primero." },
        { status: 409 }
      );
    }

    await ref.delete();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar habitación" }, { status: 500 });
  }
}
