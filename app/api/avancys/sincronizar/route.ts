// POST /api/avancys/sincronizar — sincroniza el registro de una familia con Avancys.
// Guarda el resultado en Firestore para auditoría y reintento en caso de fallo.
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { sincronizarFamilia } from "@/lib/avancysClient";

const BodySchema = z.object({
  familiaId:       z.string().min(1),
  nombreCuidador:  z.string().min(1),
  nombreNino:      z.string().min(1),
  hospital:        z.string().min(1),
  tipoTratamiento: z.string().min(1),
  casaRonald:      z.string().min(1),
  fechaIngreso:    z.string().min(1),
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
  const registroRef = adminDb.collection("sincronizacionAvancys").doc();

  try {
    const respuesta = await sincronizarFamilia(datos);

    // Guardar resultado en Firestore para auditoría
    await registroRef.set({
      familiaId:  datos.familiaId,
      tipo:       "registro",
      estado:     respuesta.ok ? "exitoso" : "fallido",
      avancysId:  respuesta.avancysId ?? null,
      error:      respuesta.error ?? null,
      timestamp:  Timestamp.now(),
    });

    if (!respuesta.ok) {
      return NextResponse.json(
        { error: "Avancys rechazó la sincronización", detalle: respuesta.error },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, avancysId: respuesta.avancysId }, { status: 200 });
  } catch (err) {
    // Guardar el fallo para reintento posterior
    await registroRef.set({
      familiaId: datos.familiaId,
      tipo:      "registro",
      estado:    "fallido",
      error:     err instanceof Error ? err.message : "Error desconocido",
      timestamp: Timestamp.now(),
    }).catch(() => {
      // No bloquear si Firestore también falla
    });

    return NextResponse.json({ error: "Error al sincronizar con Avancys" }, { status: 500 });
  }
}
