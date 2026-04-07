import { Timestamp } from "firebase/firestore";

// Familia hospedada en Casa Ronald McDonald
export interface Familia {
  id: string;
  nombreCuidador: string;
  telefono: string;
  hospital: string;
  fechaIngreso: Timestamp;
  fechaSalida?: Timestamp;
  tipoTratamiento: "oncologia" | "cardiologia" | "neurologia" | "otro";
  casaRonald: string;
  rol: "cuidador" | "coordinador";
  nombreNino?: string;
  fcmToken?: string;
}

// Cita médica del paciente
export interface Cita {
  id: string;
  familiaId: string;
  titulo: string;
  fecha: Timestamp;
  servicio: "consulta" | "estudio" | "procedimiento" | "otro";
  notas?: string;
  recordatorio60: boolean;
  recordatorio15: boolean;
  notificacionEnviada: boolean;
}

// Bloque de hora en la rutina diaria
export interface BloqueRutina {
  hora: string;       // "08:00"
  titulo: string;
  descripcion: string;
  tipo: "hospital" | "descanso" | "alimentacion" | "actividad";
}
