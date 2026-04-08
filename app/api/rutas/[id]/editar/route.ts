// PATCH /api/rutas/:id/editar — actualiza una ruta existente
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";

const HorarioSchema = z.object({
  hora: z.string().regex(/^\d{2}:\d{2}$/),
  dias: z.array(z.enum(["lun", "mar", "mie", "jue", "vie", "sab", "dom"])).min(1),
});

const BodySchema = z.object({
  nombre:     z.string().min(1).max(100).optional(),
  origen:     z.string().min(1).optional(),
  destino:    z.string().min(1).optional(),
  paradas:    z.array(z.string()).optional(),
  horarios:   z.array(HorarioSchema).min(1).optional(),
  vehiculoId: z.string().nullable().optional(),
  notas:      z.string().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 }); }

  const r = BodySchema.safeParse(body);
  if (!r.success) return NextResponse.json({ error: r.error.flatten() }, { status: 400 });

  try {
    const ref = adminDb.collection("rutas").doc(params.id);
    if (!(await ref.get()).exists) {
      return NextResponse.json({ error: "Ruta no encontrada" }, { status: 404 });
    }
    const cambios = Object.fromEntries(
      Object.entries(r.data).filter(([, v]) => v !== undefined)
    );
    await ref.update(cambios);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error al editar ruta" }, { status: 500 });
  }
}
