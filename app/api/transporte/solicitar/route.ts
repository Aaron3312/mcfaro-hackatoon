// POST /api/transporte/solicitar — crea solicitud de transporte para una familia
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

const BodySchema = z.object({
  familiaId: z.string().min(1),
  nombreCuidador: z.string().min(1),
  origen: z.string().min(1),
  destino: z.string().min(1),
  fechaHora: z.string().datetime(), // ISO 8601
  pasajeros: z.number().int().min(1).max(10),
  notas: z.string().optional(),
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

  const { familiaId, nombreCuidador, origen, destino, fechaHora, pasajeros, notas } = resultado.data;

  try {
    // Verificar que la familia existe
    const familiaDoc = await adminDb.collection("familias").doc(familiaId).get();
    if (!familiaDoc.exists) {
      return NextResponse.json({ error: "Familia no encontrada" }, { status: 404 });
    }

    const ahora = Timestamp.now();
    const ref = await adminDb.collection("solicitudesTransporte").add({
      familiaId,
      nombreCuidador,
      origen,
      destino,
      fechaHora: Timestamp.fromDate(new Date(fechaHora)),
      pasajeros,
      notas: notas ?? "",
      estado: "pendiente",
      unidadId: null,
      placasUnidad: null,
      nombreChofer: null,
      creadaEn: ahora,
      actualizadaEn: ahora,
    });

    return NextResponse.json({ ok: true, id: ref.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error al crear solicitud" }, { status: 500 });
  }
}
