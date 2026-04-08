// PATCH /api/comunidad/mensajes/moderar — elimina o reporta un mensaje (moderación)
// DELETE elimina (coordinador), PATCH reporta (cuidador)
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

const EliminarSchema = z.object({
  mensajeId: z.string().min(1),
  accion: z.literal("eliminar"),
});

const ReportarSchema = z.object({
  mensajeId: z.string().min(1),
  accion: z.literal("reportar"),
  familiaId: z.string().min(1),
});

const BodySchema = z.discriminatedUnion("accion", [EliminarSchema, ReportarSchema]);

export async function PATCH(request: NextRequest) {
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

  try {
    const ref = adminDb.collection("mensajesComunidad").doc(datos.mensajeId);
    const snap = await ref.get();

    if (!snap.exists) {
      return NextResponse.json({ error: "Mensaje no encontrado" }, { status: 404 });
    }

    if (datos.accion === "eliminar") {
      // Soft-delete para mantener historial de moderación
      await ref.update({ eliminado: true, eliminadoEn: new Date() });
      return NextResponse.json({ ok: true, accion: "eliminado" });
    }

    if (datos.accion === "reportar") {
      const reportadoPor: string[] = snap.data()?.reportadoPor ?? [];
      if (reportadoPor.includes(datos.familiaId)) {
        return NextResponse.json({ error: "Ya reportaste este mensaje" }, { status: 409 });
      }

      await ref.update({
        reportado: true,
        reportadoPor: FieldValue.arrayUnion(datos.familiaId),
      });

      // Si tiene 3+ reportes, notificar al coordinador vía Firestore
      if (reportadoPor.length + 1 >= 3) {
        await adminDb.collection("alertasComunidad").add({
          tipo: "mensaje_reportado",
          mensajeId: datos.mensajeId,
          grupoId: snap.data()?.grupoId,
          totalReportes: reportadoPor.length + 1,
          creadoEn: new Date(),
          revisado: false,
        });
      }

      return NextResponse.json({ ok: true, accion: "reportado" });
    }
  } catch {
    return NextResponse.json({ error: "Error al moderar mensaje" }, { status: 500 });
  }
}
