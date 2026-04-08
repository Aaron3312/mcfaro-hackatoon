// POST /api/accesos/crear — coordinador crea un acceso
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

const BodySchema = z.object({
  familiaId:   z.string().optional().default(""),
  nombre:      z.string().min(1),
  telefono:    z.string().optional().default(""),
  tipo:        z.enum(["cuidador_principal", "visitante", "voluntario", "staff"]),
  estado:      z.enum(["activo", "vencido", "suspendido"]).default("activo"),
  casaRonald:  z.string().min(1),
  habitacion:  z.string().optional().default(""),
  fechaInicio: z.string(),
  fechaFin:    z.string().optional(),
  notas:       z.string().optional().default(""),
  creadoPor:   z.string().min(1),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 }); }

  const r = BodySchema.safeParse(body);
  if (!r.success) return NextResponse.json({ error: r.error.flatten() }, { status: 400 });

  const d = r.data;
  const ahora = Timestamp.now();

  try {
    const ref = await adminDb.collection("accesos").add({
      familiaId:    d.familiaId,
      nombre:       d.nombre,
      telefono:     d.telefono,
      tipo:         d.tipo,
      estado:       d.estado,
      casaRonald:   d.casaRonald,
      habitacion:   d.habitacion,
      fechaInicio:  Timestamp.fromDate(new Date(d.fechaInicio)),
      fechaFin:     d.fechaFin ? Timestamp.fromDate(new Date(d.fechaFin)) : null,
      notas:        d.notas,
      creadoPor:    d.creadoPor,
      creadoEn:     ahora,
      actualizadoEn: ahora,
    });
    return NextResponse.json({ ok: true, id: ref.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error al crear acceso" }, { status: 500 });
  }
}
