// PATCH /api/vehiculos/:id/editar — actualiza datos de un vehículo
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";

const BodySchema = z.object({
  placas:         z.string().min(1).max(20).optional(),
  modelo:         z.string().min(1).max(80).optional(),
  tipo:           z.enum(["sedan", "van", "minibus"]).optional(),
  color:          z.string().optional(),
  capacidad:      z.number().int().min(1).max(50).optional(),
  chofer:         z.string().optional(),
  telefonoChofer: z.string().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 }); }

  const r = BodySchema.safeParse(body);
  if (!r.success) return NextResponse.json({ error: r.error.flatten() }, { status: 400 });

  try {
    const ref = adminDb.collection("vehiculos").doc(id);
    if (!(await ref.get()).exists) {
      return NextResponse.json({ error: "Vehículo no encontrado" }, { status: 404 });
    }
    // Filtrar undefined para no sobreescribir campos no enviados
    const cambios = Object.fromEntries(
      Object.entries(r.data).filter(([, v]) => v !== undefined)
    );
    await ref.update(cambios);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error al editar vehículo" }, { status: 500 });
  }
}
