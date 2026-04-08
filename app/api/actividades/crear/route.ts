// POST /api/actividades/crear — coordinador crea una nueva actividad
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

const BodySchema = z.object({
  titulo: z.string().min(1).max(100),
  descripcion: z.string().min(1),
  tipo: z.enum(["arte", "deporte", "educacion", "bienestar", "recreacion", "otro"]),
  fechaHora: z.string().datetime(),
  duracionMin: z.number().int().min(15).max(480),
  capacidadMax: z.number().int().min(1).max(200),
  instructor: z.string().min(1),
  ubicacion: z.string().min(1),
  casaRonald: z.string().min(1),
  creadaPor: z.string().min(1),
  imagenUrl: z.string().optional(),
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

  const datos = resultado.data;
  const ahora = Timestamp.now();

  try {
    const ref = await adminDb.collection("actividades").add({
      ...datos,
      fechaHora: Timestamp.fromDate(new Date(datos.fechaHora)),
      estado: "programada",
      registrados: 0,
      creadaEn: ahora,
      actualizadaEn: ahora,
    });

    return NextResponse.json({ ok: true, id: ref.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error al crear actividad" }, { status: 500 });
  }
}
