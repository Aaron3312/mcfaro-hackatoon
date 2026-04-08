// DELETE /api/transporte/:id/cancelar — cancela una solicitud de transporte
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const ref = adminDb.collection("solicitudesTransporte").doc(id);
    const doc = await ref.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
    }

    const datos = doc.data();
    if (datos?.estado === "completada") {
      return NextResponse.json(
        { error: "No se puede cancelar un viaje completado" },
        { status: 409 }
      );
    }

    await ref.update({ estado: "cancelada", actualizadaEn: Timestamp.now() });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Error al cancelar solicitud" }, { status: 500 });
  }
}
