// POST /api/habitaciones/crear — registra una nueva habitación
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";

const BodySchema = z.object({
  numero: z.string().min(1),
  piso: z.string().min(1),
  capacidad: z.number().int().min(1).max(20),
  casaRonald: z.string().min(1),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 }); }

  const result = BodySchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
  }

  const { numero, piso, capacidad, casaRonald } = result.data;

  try {
    // Verificar que no exista el número en el mismo piso y casa
    const snap = await adminDb.collection("habitaciones")
      .where("numero", "==", numero)
      .where("piso", "==", piso)
      .where("casaRonald", "==", casaRonald)
      .limit(1)
      .get();

    if (!snap.empty) {
      return NextResponse.json(
        { error: `Ya existe la habitación ${numero} en el piso ${piso}` },
        { status: 409 }
      );
    }

    const ref = await adminDb.collection("habitaciones").add({
      numero,
      piso,
      capacidad,
      casaRonald,
      estado: "disponible",
    });

    return NextResponse.json({ ok: true, id: ref.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error al crear habitación" }, { status: 500 });
  }
}
