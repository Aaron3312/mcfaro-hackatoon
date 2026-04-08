// PATCH /api/familias/actualizar — edita datos no clínicos de una familia
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";

const BodySchema = z.object({
  familiaId: z.string().min(1),
  nombreCuidador: z.string().min(1).optional(),
  telefono: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  parentesco: z.string().optional(),
  hospital: z.string().optional(),
  tipoTratamiento: z.enum(["oncologia", "cardiologia", "neurologia", "otro"]).optional(),
  diagnostico: z.string().optional(),
});

export async function PATCH(request: NextRequest) {
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

  const { familiaId, ...campos } = resultado.data;

  // Eliminar campos vacíos para no sobreescribir con undefined
  const actualizacion: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(campos)) {
    if (v !== undefined && v !== "") actualizacion[k] = v;
  }

  if (Object.keys(actualizacion).length === 0) {
    return NextResponse.json({ error: "Sin cambios que aplicar" }, { status: 400 });
  }

  try {
    const ref = adminDb.collection("familias").doc(familiaId);
    const snap = await ref.get();

    if (!snap.exists) {
      return NextResponse.json({ error: "Familia no encontrada" }, { status: 404 });
    }

    await ref.update(actualizacion);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error al actualizar familia" }, { status: 500 });
  }
}
