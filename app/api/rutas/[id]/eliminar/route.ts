// DELETE /api/rutas/:id/eliminar — elimina una ruta
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const ref = adminDb.collection("rutas").doc(id);
    if (!(await ref.get()).exists) {
      return NextResponse.json({ error: "Ruta no encontrada" }, { status: 404 });
    }
    await ref.delete();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar ruta" }, { status: 500 });
  }
}
