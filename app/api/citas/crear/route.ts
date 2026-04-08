// POST /api/citas/crear — crea una nueva cita médica
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

const BodySchema = z.object({
  familiaId: z.string().min(1),
  titulo: z.string().min(1).max(120),
  descripcion: z.string().max(500).optional(),
  fecha: z.string().datetime(),
  servicio: z.enum(["consulta", "estudio", "procedimiento", "otro"]),
  ubicacion: z.string().max(200).optional(),
  notas: z.string().max(500).optional(),
  recordatorio24h: z.boolean().default(true),
  recordatorio60: z.boolean().default(true),
  recordatorio15: z.boolean().default(true),
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

  const { familiaId, titulo, descripcion, fecha, servicio, ubicacion, notas,
    recordatorio24h, recordatorio60, recordatorio15 } = resultado.data;

  try {
    const ref = await adminDb.collection("citas").add({
      familiaId,
      titulo,
      descripcion: descripcion ?? "",
      fecha: Timestamp.fromDate(new Date(fecha)),
      servicio,
      ubicacion: ubicacion ?? "",
      notas: notas ?? "",
      completada: false,
      recordatorio24h,
      recordatorio60,
      recordatorio15,
      notificacionEnviada: false,
      creadaEn: Timestamp.now(),
    });

    return NextResponse.json({ ok: true, id: ref.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error al crear cita" }, { status: 500 });
  }
}
