// PATCH /api/vehiculos/:id/estado — cambia el estado operativo de un vehículo
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";

const BodySchema = z.object({
  estado: z.enum(["disponible"]),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 }); }

  const r = BodySchema.safeParse(body);
  if (!r.success) return NextResponse.json({ error: r.error.flatten() }, { status: 400 });

  try {
    const ref = adminDb.collection("vehiculos").doc(params.id);
    if (!(await ref.get()).exists) {
      return NextResponse.json({ error: "Vehículo no encontrado" }, { status: 404 });
    }
    await ref.update({ estado: r.data.estado });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error al cambiar estado" }, { status: 500 });
  }
}
