// PATCH /api/actividades/:id/editar — coordinador edita una actividad existente
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

const BodySchema = z.object({
  titulo: z.string().min(1).max(100).optional(),
  descripcion: z.string().min(1).optional(),
  tipo: z.enum(["arte", "deporte", "educacion", "bienestar", "recreacion", "otro"]).optional(),
  fechaHora: z.string().datetime().optional(),
  duracionMin: z.number().int().min(15).max(480).optional(),
  capacidadMax: z.number().int().min(1).max(200).optional(),
  instructor: z.string().min(1).optional(),
  ubicacion: z.string().min(1).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

  const { id } = params;
  const cambios = resultado.data;

  try {
    const ref = adminDb.collection("actividades").doc(id);
    const doc = await ref.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Actividad no encontrada" }, { status: 404 });
    }

    if (doc.data()?.estado === "cancelada") {
      return NextResponse.json({ error: "No se puede editar una actividad cancelada" }, { status: 409 });
    }

    const actualizacion: Record<string, unknown> = {
      ...cambios,
      actualizadaEn: Timestamp.now(),
    };

    if (cambios.fechaHora) {
      actualizacion.fechaHora = Timestamp.fromDate(new Date(cambios.fechaHora));
    }

    await ref.update(actualizacion);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error al editar actividad" }, { status: 500 });
  }
}
