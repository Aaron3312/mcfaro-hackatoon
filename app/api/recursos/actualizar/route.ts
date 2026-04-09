// PUT /api/recursos/actualizar — coordinador guarda reglamento, FAQ, contactos y horarios
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

const ReglamentoSchema = z.object({
  titulo: z.string().min(1),
  emoji: z.string().min(1),
  color: z.string().min(1),
  bg: z.string().min(1),
  items: z.array(z.string().min(1)),
});

const FAQSchema = z.object({
  cat: z.string().min(1),
  q: z.string().min(1),
  a: z.string().min(1),
});

const ContactoSchema = z.object({
  nombre: z.string().min(1),
  numero: z.string().min(1),
  icono: z.string().min(1),
  color: z.string().min(1),
  bg: z.string().min(1),
});

const HorarioSchema = z.object({
  area: z.string().min(1),
  horario: z.string().min(1),
  icono: z.string().min(1),
});

const BodySchema = z.object({
  casaRonald: z.string().min(1),
  reglamento: z.array(ReglamentoSchema),
  faqs: z.array(FAQSchema),
  contactos: z.array(ContactoSchema),
  horarios: z.array(HorarioSchema),
});

export async function PUT(request: NextRequest) {
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

  const { casaRonald, ...datos } = resultado.data;

  try {
    await adminDb.collection("recursos").doc(casaRonald).set({
      casaRonald,
      ...datos,
      actualizadoEn: Timestamp.now(),
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error al guardar recursos" }, { status: 500 });
  }
}
