// Wrapper para Gemini 2.0 Flash — solo se usa en server (API routes)
import { GoogleGenerativeAI } from "@google/generative-ai";
import { BloqueRutina } from "@/lib/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");
const modelo = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export interface InputRutina {
  nombreCuidador: string;
  nombreNino?: string;
  citas: { titulo: string; hora: string }[];
  tipoTratamiento: string;
}

export async function generarRutina(input: InputRutina): Promise<BloqueRutina[]> {
  const citasTexto = input.citas.length > 0
    ? input.citas.map((c) => `${c.hora} — ${c.titulo}`).join(", ")
    : "ninguna cita programada";

  const prompt = `
Eres un asistente empático para cuidadores de niños hospitalizados en Casa Ronald McDonald México.
Genera una rutina diaria estructurada y gentil para ${input.nombreCuidador}${input.nombreNino ? `, cuidador de ${input.nombreNino}` : ""} (tratamiento: ${input.tipoTratamiento}).
Citas de hoy: ${citasTexto}.

La rutina debe incluir momentos de: alimentación, pausas de descanso, tiempo en el hospital y al menos una actividad simple de bienestar para el cuidador.
Tono: cálido, breve, sin abrumar. Sé concreto con las horas.
Responde SOLO con un JSON válido, sin markdown, con este formato exacto:
[{"hora":"08:00","titulo":"...","descripcion":"...","tipo":"alimentacion|descanso|hospital|actividad"}]
Genera entre 6 y 8 bloques. Idioma: español.
`.trim();

  const resultado = await modelo.generateContent(prompt);
  const texto = resultado.response.text().trim();

  // Limpiar posible markdown residual
  const json = texto.replace(/^```json?\n?/, "").replace(/\n?```$/, "");
  return JSON.parse(json) as BloqueRutina[];
}
