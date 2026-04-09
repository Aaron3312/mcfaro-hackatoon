// POST /api/menu/publicar — coordinador publica el menú del día
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

const ComidaSchema = z.object({
  hora:        z.string().regex(/^\d{2}:\d{2}$/),
  descripcion: z.string().min(1).max(500),
});

const BodySchema = z.object({
  casaRonald: z.string().min(1),
  fecha:      z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  desayuno:   ComidaSchema,
  comida:     ComidaSchema,
  cena:       ComidaSchema,
  publicadoPor: z.string().min(1),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 }); }

  const r = BodySchema.safeParse(body);
  if (!r.success) return NextResponse.json({ error: r.error.flatten() }, { status: 400 });

  const { casaRonald, publicadoPor, desayuno, comida, cena } = r.data;
  // Fecha local (no UTC) para que coincida con la consulta del dashboard
  const ahora = new Date();
  const fechaLocal = [
    ahora.getFullYear(),
    String(ahora.getMonth() + 1).padStart(2, "0"),
    String(ahora.getDate()).padStart(2, "0"),
  ].join("-");
  const fecha = r.data.fecha ?? fechaLocal;
  const menuId = `${fecha}-${casaRonald}`;

  try {
    await adminDb.collection("menus").doc(menuId).set({
      fecha,
      casaRonald,
      publicadoPor,
      publicadoEn: FieldValue.serverTimestamp(),
      comidas: {
        desayuno: { ...desayuno, disponible: false },
        comida:   { ...comida,   disponible: false },
        cena:     { ...cena,     disponible: false },
      },
    });
    return NextResponse.json({ ok: true, menuId }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error al publicar menú" }, { status: 500 });
  }
}
