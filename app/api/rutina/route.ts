// POST /api/rutina — genera rutina diaria con Gemini y la guarda en Firestore
import { NextRequest, NextResponse } from "next/server";
import { generarRutina } from "@/lib/gemini";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { format } from "date-fns";

export async function POST(req: NextRequest) {
  try {
    // Verificar token del usuario
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const decoded = await adminAuth.verifyIdToken(token);
    const familiaDoc = await adminDb.collection("familias").doc(decoded.uid).get();
    if (!familiaDoc.exists) return NextResponse.json({ error: "Familia no encontrada" }, { status: 404 });

    const familia = familiaDoc.data()!;
    const hoy = format(new Date(), "yyyy-MM-dd");

    // Buscar citas de hoy
    const inicioDia = new Date(`${hoy}T00:00:00`);
    const finDia = new Date(`${hoy}T23:59:59`);
    const citasSnap = await adminDb.collection("citas")
      .where("familiaId", "==", decoded.uid)
      .where("fecha", ">=", Timestamp.fromDate(inicioDia))
      .where("fecha", "<=", Timestamp.fromDate(finDia))
      .get();

    const citas = citasSnap.docs.map((d) => {
      const data = d.data();
      return {
        titulo: data.titulo as string,
        hora: format((data.fecha as Timestamp).toDate(), "HH:mm"),
      };
    });

    // Generar rutina con Gemini
    const bloques = await generarRutina({
      nombreCuidador: familia.nombreCuidador,
      nombreNino: familia.nombreNino,
      citas,
      tipoTratamiento: familia.tipoTratamiento,
    });

    // Guardar en Firestore
    await adminDb.collection("rutinas").add({
      familiaId: decoded.uid,
      fecha: hoy,
      contenido: JSON.stringify(bloques),
      generadaEn: Timestamp.now(),
    });

    return NextResponse.json({ bloques });
  } catch (err) {
    console.error("Error generando rutina:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
