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

export interface Menu {
  id: string;
  fecha: string; // YYYY-MM-DD
  casaRonald: string;
  comidas: {
    desayuno: Comida;
    comida: Comida;
    cena: Comida;
  };
  publicadoPor: string;
  publicadoEn: Timestamp;
}

export interface Comida {
  hora: string; // "08:00"
  descripcion: string;
  disponible: boolean;
  notificadaEn?: Timestamp;
}

