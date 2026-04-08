// POST /api/notificaciones/broadcast — envía push a múltiples familias (uso coordinador)
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb, getAdminMessaging } from "@/lib/firebase-admin";

const BodySchema = z.object({
  titulo: z.string().min(1),
  cuerpo: z.string().min(1),
  url: z.string().optional(),
  // Si se omite familiaIds, se envía a todas las familias activas con token
  familiaIds: z.array(z.string()).optional(),
  modulo: z.enum(["menu", "transporte", "actividades", "general"]).default("general"),
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

  const { titulo, cuerpo, url, familiaIds, modulo } = resultado.data;

  try {
    let tokens: string[] = [];

    if (familiaIds && familiaIds.length > 0) {
      // Enviar solo a las familias especificadas
      const docs = await Promise.all(
        familiaIds.map((id) => adminDb.collection("familias").doc(id).get())
      );
      tokens = docs
        .filter((d) => d.exists && d.data()?.fcmToken)
        .map((d) => d.data()!.fcmToken as string);
    } else {
      // Enviar a todas las familias activas (sin fechaSalida) que tienen token
      const snap = await adminDb
        .collection("familias")
        .where("rol", "==", "cuidador")
        .where("fcmToken", "!=", null)
        .get();
      tokens = snap.docs
        .filter((d) => !d.data().fechaSalida)
        .map((d) => d.data().fcmToken as string)
        .filter(Boolean);
    }

    if (tokens.length === 0) {
      return NextResponse.json({ ok: true, enviadas: 0, sin_token: true });
    }

    const messaging = getAdminMessaging();
    const icono = "/icons/icon-192.png";

    // Enviar en lotes de 500 (límite de FCM multicast)
    const resultados = { exito: 0, error: 0, tokens_invalidos: [] as string[] };
    const LOTE = 500;

    for (let i = 0; i < tokens.length; i += LOTE) {
      const lote = tokens.slice(i, i + LOTE);
      try {
        const res = await messaging.sendEachForMulticast({
          tokens: lote,
          notification: { title: titulo, body: cuerpo },
          webpush: {
            notification: { icon: icono, badge: icono },
            fcmOptions: url ? { link: url } : undefined,
          },
          data: { modulo, url: url ?? "/" },
        });

        resultados.exito += res.successCount;
        resultados.error += res.failureCount;

        // Recolectar tokens inválidos para limpiar
        res.responses.forEach((r, idx) => {
          if (!r.success && r.error?.code === "messaging/registration-token-not-registered") {
            resultados.tokens_invalidos.push(lote[idx]);
          }
        });
      } catch {
        resultados.error += lote.length;
      }
    }

    // Limpiar tokens inválidos de Firestore
    if (resultados.tokens_invalidos.length > 0) {
      const snap = await adminDb
        .collection("familias")
        .where("fcmToken", "in", resultados.tokens_invalidos)
        .get();
      await Promise.all(
        snap.docs.map((d) => d.ref.update({ fcmToken: null, tokenActualizadoEn: null }))
      );
    }

    return NextResponse.json({
      ok: true,
      enviadas: resultados.exito,
      errores: resultados.error,
      tokens_limpiados: resultados.tokens_invalidos.length,
    });
  } catch {
    return NextResponse.json({ error: "Error al enviar broadcast" }, { status: 500 });
  }
}
