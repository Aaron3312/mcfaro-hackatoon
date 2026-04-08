// POST /api/rutas/crear — coordinador crea una ruta de transporte fija
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

const HorarioSchema = z.object({
  hora: z.string().regex(/^\d{2}:\d{2}$/),
  dias: z.array(z.enum(["lun", "mar", "mie", "jue", "vie", "sab", "dom"])).min(1),
});

const BodySchema = z.object({
  nombre:     z.string().min(1).max(100),
  origen:     z.string().min(1),
  destino:    z.string().min(1),
  paradas:    z.array(z.string()).optional().default([]),
  horarios:   z.array(HorarioSchema).min(1),
  vehiculoId: z.string().optional(),
  casaRonald: z.string().min(1),
  notas:      z.string().optional(),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 }); }

  const r = BodySchema.safeParse(body);
  if (!r.success) return NextResponse.json({ error: r.error.flatten() }, { status: 400 });

  try {
    const ref = await adminDb.collection("rutas").add({
      ...r.data,
      activa: true,
      creadaEn: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ ok: true, id: ref.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error al crear ruta" }, { status: 500 });
  }
}
