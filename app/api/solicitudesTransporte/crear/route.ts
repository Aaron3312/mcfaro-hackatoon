// POST /api/solicitudesTransporte/crear — coordinador crea una solicitud manualmente
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

const BodySchema = z.object({
  familiaId: z.string().min(1),
  nombreCuidador: z.string().min(1),
  origen: z.string().min(1),
  destino: z.string().min(1),
  fechaHora: z.string(), // ISO string
  pasajeros: z.number().int().min(1).max(20),
  notas: z.string().optional().default(""),
  estado: z.enum(["pendiente", "asignada", "en_camino", "completada", "cancelada"]).default("pendiente"),
  unidadId: z.string().optional().default(""),
  placasUnidad: z.string().optional().default(""),
  nombreChofer: z.string().optional().default(""),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 }); }

  const r = BodySchema.safeParse(body);
  if (!r.success) return NextResponse.json({ error: r.error.flatten() }, { status: 400 });

  const d = r.data;
  const ahora = Timestamp.now();

  try {
    const ref = await adminDb.collection("solicitudesTransporte").add({
      familiaId: d.familiaId,
      nombreCuidador: d.nombreCuidador,
      origen: d.origen,
      destino: d.destino,
      fechaHora: Timestamp.fromDate(new Date(d.fechaHora)),
      pasajeros: d.pasajeros,
      notas: d.notas,
      estado: d.estado,
      unidadId: d.unidadId,
      placasUnidad: d.placasUnidad,
      nombreChofer: d.nombreChofer,
      creadaEn: ahora,
      actualizadaEn: ahora,
    });
    return NextResponse.json({ ok: true, id: ref.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error al crear solicitud" }, { status: 500 });
  }
}
