// PATCH /api/usuarios/activar — activa o desactiva una cuenta de usuario
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";

const BodySchema = z.object({
  familiaId: z.string().min(1),
  activa: z.boolean(),
  solicitanteId: z.string().min(1),
});

export async function PATCH(request: NextRequest) {
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

  const { familiaId, activa, solicitanteId } = resultado.data;

  try {
    // Verificar que el solicitante es coordinador
    const solicitanteSnap = await adminDb.collection("familias").doc(solicitanteId).get();
    if (!solicitanteSnap.exists || solicitanteSnap.data()?.rol !== "coordinador") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // No permitir desactivarse a uno mismo
    if (familiaId === solicitanteId && !activa) {
      return NextResponse.json({ error: "No puedes desactivar tu propia cuenta" }, { status: 400 });
    }

    const familiaRef = adminDb.collection("familias").doc(familiaId);
    const familiaSnap = await familiaRef.get();
    if (!familiaSnap.exists) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    await familiaRef.update({ activa });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error al actualizar estado" }, { status: 500 });
  }
}
