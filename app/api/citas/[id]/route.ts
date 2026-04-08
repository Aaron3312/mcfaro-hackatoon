// PATCH /api/citas/[id] — edita una cita existente
// DELETE /api/citas/[id] — elimina una cita
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

const EditSchema = z.object({
  titulo: z.string().min(1).max(120).optional(),
  descripcion: z.string().max(500).optional(),
  fecha: z.string().datetime().optional(),
  servicio: z.enum(["consulta", "estudio", "procedimiento", "otro"]).optional(),
  ubicacion: z.string().max(200).optional(),
  notas: z.string().max(500).optional(),
  completada: z.boolean().optional(),
  recordatorio24h: z.boolean().optional(),
  recordatorio60: z.boolean().optional(),
  recordatorio15: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const resultado = EditSchema.safeParse(body);
  if (!resultado.success) {
    return NextResponse.json({ error: resultado.error.flatten() }, { status: 400 });
  }

  const cambios = resultado.data;
  const actualizacion: Record<string, unknown> = { ...cambios };

  if (cambios.fecha) {
    actualizacion.fecha = Timestamp.fromDate(new Date(cambios.fecha));
    // Si se edita la fecha, resetear la notificación para que vuelva a enviarse
    actualizacion.notificacionEnviada = false;
  }

  try {
    const ref = adminDb.collection("citas").doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });
    }
    await ref.update(actualizacion);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error al editar cita" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;

  try {
    const ref = adminDb.collection("citas").doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });
    }
    await ref.delete();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar cita" }, { status: 500 });
  }
}
