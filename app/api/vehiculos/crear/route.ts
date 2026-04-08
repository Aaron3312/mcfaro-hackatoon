// POST /api/vehiculos/crear — coordinador registra un vehículo de la flota
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";

const BodySchema = z.object({
  placas:          z.string().min(1).max(20),
  modelo:          z.string().min(1).max(80),
  tipo:            z.enum(["sedan", "van", "minibus"]),
  color:           z.string().optional(),
  capacidad:       z.number().int().min(1).max(50),
  chofer:          z.string().optional(),
  telefonoChofer:  z.string().optional(),
  casaRonald:      z.string().min(1),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 }); }

  const r = BodySchema.safeParse(body);
  if (!r.success) return NextResponse.json({ error: r.error.flatten() }, { status: 400 });

  try {
    const ref = await adminDb.collection("vehiculos").add({
      ...r.data,
      estado: "disponible",
    });
    return NextResponse.json({ ok: true, id: ref.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error al crear vehículo" }, { status: 500 });
  }
}
