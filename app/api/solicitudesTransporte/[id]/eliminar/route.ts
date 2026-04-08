// DELETE /api/solicitudesTransporte/[id]/eliminar — elimina una solicitud
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const ref = adminDb.collection("solicitudesTransporte").doc(id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
    await ref.delete();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar solicitud" }, { status: 500 });
  }
}
