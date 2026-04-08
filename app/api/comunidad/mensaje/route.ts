// POST /api/comunidad/mensaje — guarda un mensaje de chat en Firestore
// Valida que no contenga datos clínicos obvios y aplica longitud máxima
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

// Palabras que no deben aparecer en mensajes del chat (protección básica de privacidad clínica)
const TERMINOS_CLINICOS = [
  /expediente\s*m[eé]dico/i,
  /n[uú]mero\s*de\s*paciente/i,
  /diagn[oó]stico\s*oficial/i,
];

const MensajeSchema = z.object({
  grupoId: z.string().min(1),
  familiaId: z.string().min(1),
  nombreUsuario: z.string().min(1).max(50),
  mensaje: z.string().min(1).max(500),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const resultado = MensajeSchema.safeParse(body);
  if (!resultado.success) {
    return NextResponse.json({ error: resultado.error.flatten() }, { status: 400 });
  }

  const { grupoId, familiaId, nombreUsuario, mensaje } = resultado.data;

  // Verificar que el grupo existe y que la familia es miembro
  const grupoDoc = await adminDb.collection("gruposApoyo").doc(grupoId).get();
  if (!grupoDoc.exists) {
    return NextResponse.json({ error: "Grupo no encontrado" }, { status: 404 });
  }

  const miembros = (grupoDoc.data()?.miembros ?? []) as string[];
  if (!miembros.includes(familiaId)) {
    return NextResponse.json({ error: "No eres miembro de este grupo" }, { status: 403 });
  }

  // Rechazar si el mensaje contiene términos clínicos sensibles
  const contieneClinico = TERMINOS_CLINICOS.some((re) => re.test(mensaje));
  if (contieneClinico) {
    return NextResponse.json(
      { error: "Por privacidad, evita compartir información médica en el chat" },
      { status: 422 }
    );
  }

  try {
    const ref = await adminDb.collection("mensajesChat").add({
      grupoId,
      familiaId,
      nombreUsuario,
      mensaje: mensaje.trim(),
      timestamp: Timestamp.now(),
      reportado: false,
    });

    return NextResponse.json({ id: ref.id }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Error al guardar el mensaje" }, { status: 500 });
  }
}

// POST /api/comunidad/mensaje/reportar — marca un mensaje como reportado
export async function PATCH(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const schema = z.object({ mensajeId: z.string().min(1) });
  const resultado = schema.safeParse(body);
  if (!resultado.success) {
    return NextResponse.json({ error: resultado.error.flatten() }, { status: 400 });
  }

  try {
    await adminDb.collection("mensajesChat").doc(resultado.data.mensajeId).update({
      reportado: true,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Error al reportar el mensaje" }, { status: 500 });
  }
}
