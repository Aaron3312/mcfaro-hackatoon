// Datos de ejercicios de respiración guiada — sin dependencias externas (funciona offline)

export type NombreFase = "inhalar" | "sostener" | "exhalar";

export interface Fase {
  nombre: NombreFase;
  duracion: number; // segundos
  instruccion: string;
  colorClase: string; // clases Tailwind para el círculo animado
}

export interface EjercicioRespiracion {
  id: string;
  nombre: string;
  descripcion: string;
  emoji: string;
  ciclosTotales: number;
  duracionAprox: string;
  fases: Fase[];
}

export const ejercicios: EjercicioRespiracion[] = [
  {
    id: "4-7-8",
    nombre: "Respiración 4-7-8",
    descripcion: "Calma el sistema nervioso rápidamente",
    emoji: "🌬️",
    ciclosTotales: 3,
    duracionAprox: "~2 min",
    fases: [
      {
        nombre: "inhalar",
        duracion: 4,
        instruccion: "Inhala suavemente",
        colorClase: "bg-blue-100 border-blue-300",
      },
      {
        nombre: "sostener",
        duracion: 7,
        instruccion: "Sostén el aire",
        colorClase: "bg-amber-100 border-amber-300",
      },
      {
        nombre: "exhalar",
        duracion: 8,
        instruccion: "Exhala despacio",
        colorClase: "bg-green-100 border-green-300",
      },
    ],
  },
  {
    id: "caja",
    nombre: "Respiración en caja",
    descripcion: "Equilibra mente y cuerpo en momentos de estrés",
    emoji: "⬛",
    ciclosTotales: 4,
    duracionAprox: "~3 min",
    fases: [
      {
        nombre: "inhalar",
        duracion: 4,
        instruccion: "Inhala",
        colorClase: "bg-blue-100 border-blue-300",
      },
      {
        nombre: "sostener",
        duracion: 4,
        instruccion: "Sostén",
        colorClase: "bg-amber-100 border-amber-300",
      },
      {
        nombre: "exhalar",
        duracion: 4,
        instruccion: "Exhala",
        colorClase: "bg-green-100 border-green-300",
      },
      {
        nombre: "sostener",
        duracion: 4,
        instruccion: "Sostén vacío",
        colorClase: "bg-purple-100 border-purple-300",
      },
    ],
  },
  {
    id: "profunda",
    nombre: "Respiración profunda",
    descripcion: "Un reinicio simple para cualquier momento",
    emoji: "🌊",
    ciclosTotales: 5,
    duracionAprox: "~2 min",
    fases: [
      {
        nombre: "inhalar",
        duracion: 5,
        instruccion: "Inhala profundo",
        colorClase: "bg-blue-100 border-blue-300",
      },
      {
        nombre: "exhalar",
        duracion: 5,
        instruccion: "Exhala todo",
        colorClase: "bg-green-100 border-green-300",
      },
    ],
  },
];

// Meditaciones mock — sin audio real, solo temporizador visual
export interface Meditacion {
  id: string;
  titulo: string;
  duracionMin: number; // minutos
  descripcion: string;
  emoji: string;
  colorClase: string; // clases Tailwind para la tarjeta
}

export const meditaciones: Meditacion[] = [
  {
    id: "ansiedad",
    titulo: "Calma la ansiedad",
    duracionMin: 3,
    descripcion: "Una pausa breve para soltar la tensión acumulada.",
    emoji: "🌿",
    colorClase: "bg-green-50 border-green-200",
  },
  {
    id: "gratitud",
    titulo: "Momento de gratitud",
    duracionMin: 5,
    descripcion: "Conecta con lo que sí está bien en este momento.",
    emoji: "🌸",
    colorClase: "bg-pink-50 border-pink-200",
  },
  {
    id: "sueno",
    titulo: "Prepárate para dormir",
    duracionMin: 5,
    descripcion: "Relaja cuerpo y mente antes de descansar.",
    emoji: "🌙",
    colorClase: "bg-indigo-50 border-indigo-200",
  },
];

// Tips de autocuidado
export interface TipAutocuidado {
  emoji: string;
  titulo: string;
  descripcion: string;
}

export const tips: TipAutocuidado[] = [
  {
    emoji: "💧",
    titulo: "Toma agua",
    descripcion: "Intenta tomar al menos 8 vasos al día, aunque estés ocupado.",
  },
  {
    emoji: "🚶",
    titulo: "Camina un poco",
    descripcion: "5 minutos caminando por el pasillo ayudan a despejar la mente.",
  },
  {
    emoji: "🍎",
    titulo: "Come algo nutritivo",
    descripcion: "Tu energía es la energía de tu familia. Aliméntate bien.",
  },
  {
    emoji: "🤝",
    titulo: "Pide ayuda",
    descripcion: "No tienes que estar solo. El equipo de Casa Ronald está aquí.",
  },
  {
    emoji: "😴",
    titulo: "Descansa cuando puedas",
    descripcion: "Incluso 20 minutos de descanso marcan una gran diferencia.",
  },
  {
    emoji: "📞",
    titulo: "Habla con alguien",
    descripcion: "Compartir cómo te sientes con alguien de confianza alivia la carga.",
  },
];

export const mensajesMotivacionales = [
  "🌟 Cuidarte no es egoísmo — es la fuente de energía que necesita tu familia.",
  "💛 Eres más fuerte de lo que crees. Cada día que estás aquí importa.",
  "🌱 Pequeñas pausas generan grandes fortalezas. Respira.",
  "🤍 No tienes que tenerlo todo bajo control. Está bien pedir ayuda.",
  "✨ El mejor regalo que le puedes dar a tu hijo es un cuidador descansado.",
];
