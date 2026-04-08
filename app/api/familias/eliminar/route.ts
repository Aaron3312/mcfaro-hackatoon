// DELETE /api/familias/eliminar — elimina permanentemente una familia (solo coordinador)
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";

const BodySchema = z.object({
  familiaId: z.string().min(1),
});

export async function DELETE(request: NextRequest) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 }); }

  const resultado = BodySchema.safeParse(body);
  if (!resultado.success) {
    return NextResponse.json({ error: "familiaId requerido" }, { status: 400 });
  }

  const { familiaId } = resultado.data;

  try {
    const ref = adminDb.collection("familias").doc(familiaId);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Familia no encontrada" }, { status: 404 });
    }
    await ref.delete();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar familia" }, { status: 500 });
  }
}
