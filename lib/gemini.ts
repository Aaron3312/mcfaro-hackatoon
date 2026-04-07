// Wrapper de la API de Gemini para generación de rutinas
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Usamos gemini-2.0-flash para velocidad y costo óptimos
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export interface BloqueRutina {
  hora: string;
  tipo: "alimentacion" | "traslado" | "hospital" | "descanso" | "nino" | "personal";
  descripcion: string;
  duracion_min: number;
}

export interface RutinaGenerada {
  fecha: string;
  bloques: BloqueRutina[];
}

export interface CitaParaRutina {
  titulo: string;
  fecha: string; // ISO string
  servicio: string;
  hora: string; // HH:MM
}

export async function generarRutina(
  citas: CitaParaRutina[],
  fecha: string,
  nombreCuidador: string
): Promise<RutinaGenerada> {
  const citasTexto =
    citas.length > 0
      ? citas.map((c) => `- ${c.hora}: ${c.titulo} (${c.servicio})`).join("\n")
      : "Sin citas registradas para hoy";

  const prompt = `Eres un asistente empático para cuidadores de niños hospitalizados.
Genera una rutina diaria estructurada y gentil para ${nombreCuidador}, cuidador con las siguientes citas hoy:
${citasTexto}

La rutina debe incluir: momentos de alimentación, pausas de descanso, tiempo en el hospital y actividades simples.
Tono: cálido, breve, sin abrumar. Contempla tiempos de traslado (20 min al hospital).
Formato: responde ÚNICAMENTE con un JSON válido con esta estructura exacta:
{
  "fecha": "${fecha}",
  "bloques": [
    {
      "hora": "07:30",
      "tipo": "alimentacion",
      "descripcion": "descripción breve y empática",
      "duracion_min": 20
    }
  ]
}
Los tipos válidos son: alimentacion, traslado, hospital, descanso, nino, personal.
Genera entre 8 y 12 bloques que cubran de 6:00 a 22:00. Idioma: español.`;

  const resultado = await model.generateContent(prompt);
  const texto = resultado.response.text();

  // Extraer el JSON de la respuesta (Gemini puede incluir texto extra)
  const jsonMatch = texto.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Gemini no devolvió un JSON válido");
  }

  const rutina = JSON.parse(jsonMatch[0]) as RutinaGenerada;
  return rutina;
}
