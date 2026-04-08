// POST /api/comunidad/mensajes/enviar — envía un mensaje con validación anti-spam
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

const BodySchema = z.object({
  grupoId: z.string().min(1),
  familiaId: z.string().min(1),
  nombreCuidador: z.string().min(1),
  texto: z.string().min(1).max(1000),
});

// Anti-spam: máximo 5 mensajes por minuto por familia
const LIMITE_MENSAJES = 5;
const VENTANA_MS = 60_000;

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

  const { grupoId, familiaId, nombreCuidador, texto } = resultado.data;

  try {
    // Verificar que el grupo existe y está activo
    const grupoDoc = await adminDb.collection("gruposComunidad").doc(grupoId).get();
    if (!grupoDoc.exists || !grupoDoc.data()?.activo) {
      return NextResponse.json({ error: "Grupo no encontrado o inactivo" }, { status: 404 });
    }

    // Anti-spam: contar mensajes recientes de esta familia en este grupo
    const ahora = Timestamp.now();
    const hace1min = Timestamp.fromMillis(ahora.toMillis() - VENTANA_MS);

    const recientes = await adminDb
      .collection("mensajesComunidad")
      .where("grupoId", "==", grupoId)
      .where("familiaId", "==", familiaId)
      .where("creadoEn", ">=", hace1min)
      .count()
      .get();

    if (recientes.data().count >= LIMITE_MENSAJES) {
      return NextResponse.json(
        { error: "Demasiados mensajes. Espera un momento antes de continuar." },
        { status: 429 }
      );
    }

    // Guardar mensaje
    const ref = await adminDb.collection("mensajesComunidad").add({
      grupoId,
      familiaId,
      nombreCuidador,
      texto: texto.trim(),
      creadoEn: ahora,
      editado: false,
      eliminado: false,
      reportado: false,
      reportadoPor: [],
    });

    return NextResponse.json({ ok: true, id: ref.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error al enviar mensaje" }, { status: 500 });
  }
}
