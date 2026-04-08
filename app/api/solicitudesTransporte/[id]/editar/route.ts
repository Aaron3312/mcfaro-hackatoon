// PATCH /api/solicitudesTransporte/[id]/editar — edita una solicitud existente
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

const BodySchema = z.object({
  origen: z.string().min(1).optional(),
  destino: z.string().min(1).optional(),
  fechaHora: z.string().optional(),
  pasajeros: z.number().int().min(1).max(20).optional(),
  notas: z.string().optional(),
  estado: z.enum(["pendiente", "asignada", "en_camino", "completada", "cancelada"]).optional(),
  unidadId: z.string().optional(),
  placasUnidad: z.string().optional(),
  nombreChofer: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 }); }

  const r = BodySchema.safeParse(body);
  if (!r.success) return NextResponse.json({ error: r.error.flatten() }, { status: 400 });

  const { fechaHora, ...resto } = r.data;
  const update: Record<string, unknown> = { ...resto, actualizadaEn: Timestamp.now() };
  if (fechaHora) update.fechaHora = Timestamp.fromDate(new Date(fechaHora));

  try {
    const ref = adminDb.collection("solicitudesTransporte").doc(id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
    await ref.update(update);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error al editar solicitud" }, { status: 500 });
  }
}
