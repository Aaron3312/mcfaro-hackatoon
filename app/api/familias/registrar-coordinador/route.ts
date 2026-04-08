// POST /api/familias/registrar-coordinador — coordinador crea una ficha de familia directamente
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

const BodySchema = z.object({
  nombreCuidador: z.string().min(1),
  telefono: z.string().min(1),
  parentesco: z.string().optional().default(""),
  email: z.string().email().optional().or(z.literal("")).default(""),
  nombreNino: z.string().min(1),
  edadNino: z.number().int().min(0).max(18).optional(),
  hospital: z.string().min(1),
  tipoTratamiento: z.enum(["oncologia", "neurologia", "otro"]),
  casaRonald: z.string().min(1),
  habitacion: z.string().optional().default(""),
  fechaIngreso: z.string().optional(), // ISO date string, default hoy
  fechaSalidaPlanificada: z.string().optional(), // ISO date string
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 }); }

  const resultado = BodySchema.safeParse(body);
  if (!resultado.success) {
    return NextResponse.json({ error: resultado.error.flatten() }, { status: 400 });
  }

  const datos = resultado.data;

  const fechaIngreso = datos.fechaIngreso
    ? Timestamp.fromDate(new Date(datos.fechaIngreso))
    : Timestamp.now();

  const fechaSalidaPlanificada = datos.fechaSalidaPlanificada
    ? Timestamp.fromDate(new Date(datos.fechaSalidaPlanificada))
    : null;

  try {
    const ref = await adminDb.collection("familias").add({
      nombreCuidador: datos.nombreCuidador,
      telefono: datos.telefono,
      parentesco: datos.parentesco,
      email: datos.email,
      nombreNino: datos.nombreNino,
      edadNino: datos.edadNino ?? null,
      hospital: datos.hospital,
      tipoTratamiento: datos.tipoTratamiento,
      casaRonald: datos.casaRonald,
      habitacion: datos.habitacion,
      rol: "cuidador",
      activa: true,
      fechaIngreso,
      ...(fechaSalidaPlanificada ? { fechaSalidaPlanificada } : {}),
    });

    return NextResponse.json({ ok: true, id: ref.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error al registrar familia" }, { status: 500 });
  }
}
