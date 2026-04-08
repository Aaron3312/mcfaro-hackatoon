// PATCH /api/habitaciones/estado — cambia estado (mantenimiento / bloqueada / disponible)
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";

const BodySchema = z.object({
  habitacionId: z.string().min(1),
  estado: z.enum(["disponible", "mantenimiento", "bloqueada"]),
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

  const { habitacionId, estado } = resultado.data;

  try {
    const habRef = adminDb.collection("habitaciones").doc(habitacionId);
    const habDoc = await habRef.get();

    if (!habDoc.exists) {
      return NextResponse.json({ error: "Habitación no encontrada" }, { status: 404 });
    }

    if (habDoc.data()?.estado === "ocupada") {
      return NextResponse.json(
        { error: "No se puede cambiar el estado de una habitación ocupada" },
        { status: 409 }
      );
    }

    await habRef.update({ estado });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error al cambiar estado" }, { status: 500 });
  }
}
