// DELETE /api/vehiculos/:id/eliminar — elimina un vehículo si no está en servicio
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ref = adminDb.collection("vehiculos").doc(params.id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: "Vehículo no encontrado" }, { status: 404 });
    await ref.delete();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar vehículo" }, { status: 500 });
  }
}
