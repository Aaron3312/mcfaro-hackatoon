// Tipos compartidos del dominio de mcFaro
import { Timestamp } from "firebase/firestore";

export interface Familia {
  id: string;
  nombreCuidador: string;
  nombreNino: string;
  telefono: string;
  hospital: string;
  fechaIngreso: Timestamp;
  fechaSalida: Timestamp;
  tipoTratamiento: "oncologia" | "cardiologia" | "neurologia" | "otro";
  casaRonald: string;
  rol: "cuidador" | "coordinador";
  fcmToken?: string;
}

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

export interface Rutina {
  id: string;
  familiaId: string;
  fecha: string; // YYYY-MM-DD
  contenido: string; // JSON stringificado
  generadaEn: Timestamp;
}
