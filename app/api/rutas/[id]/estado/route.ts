// PATCH /api/rutas/:id/estado — activa o desactiva una ruta
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";

const BodySchema = z.object({ activa: z.boolean() });

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 }); }

  const r = BodySchema.safeParse(body);
  if (!r.success) return NextResponse.json({ error: r.error.flatten() }, { status: 400 });

  try {
    const ref = adminDb.collection("rutas").doc(params.id);
    if (!(await ref.get()).exists) {
      return NextResponse.json({ error: "Ruta no encontrada" }, { status: 404 });
    }
    await ref.update({ activa: r.data.activa });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error al cambiar estado de ruta" }, { status: 500 });
  }
}
