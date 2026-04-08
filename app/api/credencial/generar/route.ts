// POST /api/credencial/generar — genera o regenera el QR de una familia
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { generarQRCode } from "@/lib/generarQR";

const BodySchema = z.object({
  familiaId: z.string().min(1),
});

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

  const { familiaId } = resultado.data;

  try {
    const familiaRef = adminDb.collection("familias").doc(familiaId);
    const familiaDoc = await familiaRef.get();

    if (!familiaDoc.exists) {
      return NextResponse.json({ error: "Familia no encontrada" }, { status: 404 });
    }

    const qrCode = generarQRCode(familiaId);
    await familiaRef.update({ qrCode });

    return NextResponse.json({ ok: true, qrCode }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Error al generar credencial" }, { status: 500 });
  }
}
