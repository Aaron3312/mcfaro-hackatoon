// POST /api/familias/registrar — crea el perfil de una familia tras el onboarding
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb, adminMessaging } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { randomUUID } from "crypto";

const BodySchema = z.object({
  uid: z.string().min(1),
  nombreCuidador: z.string().min(1),
  telefono: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  parentesco: z.string().min(1),
  nombreNino: z.string().min(1),
  edadNino: z.number().int().min(0).max(18),
  hospital: z.string().min(1),
  tipoTratamiento: z.enum(["oncologia", "cardiologia", "neurologia", "otro"]),
  casaRonald: z.string().min(1),
  habitacion: z.string().optional().or(z.literal("")),
  fcmToken: z.string().optional(),
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

  const datos = resultado.data;
  const qrCode = `mcfaro://familia/${datos.uid}/${randomUUID().slice(0, 8)}`;

  try {
    await adminDb.collection("familias").doc(datos.uid).set({
      nombreCuidador: datos.nombreCuidador,
      telefono: datos.telefono,
      email: datos.email ?? "",
      parentesco: datos.parentesco,
      nombreNino: datos.nombreNino,
      edadNino: datos.edadNino,
      hospital: datos.hospital,
      tipoTratamiento: datos.tipoTratamiento,
      casaRonald: datos.casaRonald,
      habitacion: datos.habitacion ?? "",
      rol: "cuidador",
      fechaIngreso: Timestamp.now(),
      fcmToken: datos.fcmToken ?? null,
      qrCode,
    });

    // Notificación de bienvenida si tiene token FCM
    if (datos.fcmToken) {
      await adminMessaging.send({
        token: datos.fcmToken,
        notification: {
          title: "¡Bienvenido a mcFaro!",
          body: `Hola ${datos.nombreCuidador}, tu registro está listo. Estamos aquí para acompañarte.`,
        },
        webpush: { notification: { icon: "/icons/icon-192.png" } },
      }).catch(() => {
        // No fallar si la notificación no se puede enviar
      });
    }

    return NextResponse.json({ ok: true, qrCode }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error al registrar familia" }, { status: 500 });
  }
}
