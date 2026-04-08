// PATCH /api/accesos/[id]/editar — edita un acceso existente
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

const BodySchema = z.object({
  nombre:     z.string().min(1).optional(),
  telefono:   z.string().optional(),
  tipo:       z.enum(["cuidador_principal", "visitante", "voluntario", "staff"]).optional(),
  estado:     z.enum(["activo", "vencido", "suspendido"]).optional(),
  habitacion: z.string().optional(),
  fechaInicio:z.string().optional(),
  fechaFin:   z.string().nullable().optional(),
  notas:      z.string().optional(),
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

  const { fechaInicio, fechaFin, ...resto } = r.data;
  const update: Record<string, unknown> = { ...resto, actualizadoEn: Timestamp.now() };
  if (fechaInicio) update.fechaInicio = Timestamp.fromDate(new Date(fechaInicio));
  if (fechaFin !== undefined) update.fechaFin = fechaFin ? Timestamp.fromDate(new Date(fechaFin)) : null;

  try {
    const ref = adminDb.collection("accesos").doc(id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: "Acceso no encontrado" }, { status: 404 });
    await ref.update(update);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error al editar acceso" }, { status: 500 });
  }
}
