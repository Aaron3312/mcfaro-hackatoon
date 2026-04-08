// PATCH /api/usuarios/cambiar-rol — cambia el rol de un usuario (solo coordinadores)
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";

const BodySchema = z.object({
  familiaId: z.string().min(1),
  nuevoRol: z.enum(["cuidador", "coordinador"]),
  solicitanteId: z.string().min(1), // UID del coordinador que hace el cambio
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

  const { familiaId, nuevoRol, solicitanteId } = resultado.data;

  try {
    // Verificar que el solicitante es coordinador
    const solicitanteSnap = await adminDb.collection("familias").doc(solicitanteId).get();
    if (!solicitanteSnap.exists || solicitanteSnap.data()?.rol !== "coordinador") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Verificar que el usuario objetivo existe
    const familiaRef = adminDb.collection("familias").doc(familiaId);
    const familiaSnap = await familiaRef.get();
    if (!familiaSnap.exists) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // No permitir quitarse el rol a uno mismo
    if (familiaId === solicitanteId && nuevoRol !== "coordinador") {
      return NextResponse.json({ error: "No puedes cambiar tu propio rol" }, { status: 400 });
    }

    await familiaRef.update({ rol: nuevoRol });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error al cambiar rol" }, { status: 500 });
  }
}
