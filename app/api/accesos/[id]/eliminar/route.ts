// DELETE /api/accesos/[id]/eliminar — elimina un acceso
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const ref = adminDb.collection("accesos").doc(id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: "Acceso no encontrado" }, { status: 404 });
    await ref.delete();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar acceso" }, { status: 500 });
  }
}
