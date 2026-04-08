// GET /api/credencial/validar/[qrCode] — valida un QR escaneado y devuelve datos de la familia
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { validarQRCode } from "@/lib/generarQR";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ qrCode: string }> }
) {
  const { qrCode: rawQr } = await params;
  const qrCode = decodeURIComponent(rawQr);

  if (!qrCode) {
    return NextResponse.json({ error: "QR inválido" }, { status: 400 });
  }

  try {
    // Primero intentar validar con HMAC (formato nuevo)
    const familiaIdDesdeHMAC = validarQRCode(qrCode);

    let familiaDoc;

    if (familiaIdDesdeHMAC) {
      // Formato nuevo: buscar directamente por ID
      familiaDoc = await adminDb.collection("familias").doc(familiaIdDesdeHMAC).get();
    } else {
      // Formato legacy o QR externo: buscar por campo qrCode en Firestore
      const snapshot = await adminDb
        .collection("familias")
        .where("qrCode", "==", qrCode)
        .limit(1)
        .get();

      familiaDoc = snapshot.empty ? null : snapshot.docs[0];
    }

    if (!familiaDoc || !familiaDoc.exists) {
      return NextResponse.json({ valido: false, error: "Credencial no encontrada" }, { status: 404 });
    }

    const datos = familiaDoc.data()!;

    // Verificar que el qrCode almacenado coincide con el escaneado
    if (datos.qrCode !== qrCode) {
      return NextResponse.json({ valido: false, error: "Credencial expirada o revocada" }, { status: 401 });
    }

    // Devolver solo los datos necesarios — sin información clínica
    return NextResponse.json({
      valido: true,
      familia: {
        id: familiaDoc.id,
        nombreCuidador: datos.nombreCuidador,
        nombreNino: datos.nombreNino,
        habitacion: datos.habitacion ?? null,
        casaRonald: datos.casaRonald,
        fechaIngreso: datos.fechaIngreso?.toDate?.()?.toISOString() ?? null,
      },
    });
  } catch {
    return NextResponse.json({ error: "Error al validar credencial" }, { status: 500 });
  }
}
