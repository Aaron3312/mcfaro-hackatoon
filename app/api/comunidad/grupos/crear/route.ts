// POST /api/comunidad/grupos/crear — crea un grupo de comunidad
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

const BodySchema = z.object({
  nombre: z.string().min(2).max(80),
  descripcion: z.string().min(5).max(500),
  tipo: z.enum(["apoyo", "informacion", "psicologia", "general"]),
  casaRonald: z.string().min(1),
  creadoPor: z.string().min(1),
});

export async function POST(request: NextRequest) {
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

  const { nombre, descripcion, tipo, casaRonald, creadoPor } = resultado.data;

  try {
    const ref = await adminDb.collection("gruposComunidad").add({
      nombre,
      descripcion,
      tipo,
      casaRonald,
      creadoPor,
      creadoEn: Timestamp.now(),
      miembros: 0,
      activo: true,
    });

    return NextResponse.json({ ok: true, id: ref.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error al crear grupo" }, { status: 500 });
  }
}
