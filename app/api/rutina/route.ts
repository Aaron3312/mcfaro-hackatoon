// Endpoint POST /api/rutina — genera y guarda rutina del día con Gemini
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { generarRutina, CitaParaRutina } from "@/lib/gemini";
import { format } from "date-fns";

const BodySchema = z.object({
  familiaId: z.string().min(1),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo de solicitud inválido" }, { status: 400 });
  }

  const resultado = BodySchema.safeParse(body);
  if (!resultado.success) {
    return NextResponse.json({ error: resultado.error.flatten() }, { status: 400 });
  }

  const { familiaId, fecha } = resultado.data;

  try {
    // Obtener el perfil de la familia para personalizar la rutina
    const familiaDoc = await adminDb.collection("familias").doc(familiaId).get();
    if (!familiaDoc.exists) {
      return NextResponse.json({ error: "Familia no encontrada" }, { status: 404 });
    }
    const familiaData = familiaDoc.data()!;
    const nombreCuidador = (familiaData.nombreCuidador as string) ?? "Cuidador";

    // Obtener citas del día
    const inicioDia = new Date(`${fecha}T00:00:00`);
    const finDia = new Date(`${fecha}T23:59:59`);

    const citasSnapshot = await adminDb
      .collection("citas")
      .where("familiaId", "==", familiaId)
      .where("fecha", ">=", Timestamp.fromDate(inicioDia))
      .where("fecha", "<=", Timestamp.fromDate(finDia))
      .orderBy("fecha", "asc")
      .get();

    const citas: CitaParaRutina[] = citasSnapshot.docs.map((d) => {
      const data = d.data();
      const fechaCita = (data.fecha as Timestamp).toDate();
      return {
        titulo: data.titulo as string,
        fecha: fechaCita.toISOString(),
        servicio: data.servicio as string,
        hora: format(fechaCita, "HH:mm"),
      };
    });

    // Generar rutina con Gemini
    const rutina = await generarRutina(citas, fecha, nombreCuidador);

    // Guardar en Firestore (sobreescribe si ya existe)
    const existente = await adminDb
      .collection("rutinas")
      .where("familiaId", "==", familiaId)
      .where("fecha", "==", fecha)
      .limit(1)
      .get();

    if (!existente.empty) {
      await existente.docs[0].ref.update({
        contenido: JSON.stringify(rutina),
        generadaEn: Timestamp.now(),
      });
    } else {
      await adminDb.collection("rutinas").add({
        familiaId,
        fecha,
        contenido: JSON.stringify(rutina),
        generadaEn: Timestamp.now(),
      });
    }

    return NextResponse.json(rutina);
  } catch (error) {
    console.error("Error al generar rutina:", error);
    return NextResponse.json({ error: "Error al generar la rutina" }, { status: 500 });
  }
}
