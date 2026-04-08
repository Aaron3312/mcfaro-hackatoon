// Tipos compartidos del dominio de mcFaro
import { Timestamp } from "firebase/firestore";

export interface Familia {
  id: string;
  nombreCuidador: string;
  nombreNino: string;
  edadNino?: number;
  diagnostico?: string;
  telefono: string;
  email?: string;
  parentesco?: string;
  hospital: string;
  fechaIngreso: Timestamp;
  fechaSalida?: Timestamp;
  tipoTratamiento: "oncologia" | "cardiologia" | "neurologia" | "otro";
  casaRonald: string;
  habitacion?: string;
  qrCode?: string;
  rol: "cuidador" | "coordinador";
  activa?: boolean;
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

export type EstadoSolicitud = "pendiente" | "asignada" | "en_camino" | "completada" | "cancelada";

export interface SolicitudTransporte {
  id: string;
  familiaId: string;
  nombreCuidador: string;
  origen: string;
  destino: string;
  fechaHora: Timestamp;
  pasajeros: number;
  notas?: string;
  estado: EstadoSolicitud;
  unidadId?: string;
  placasUnidad?: string;
  nombreChofer?: string;
  creadaEn: Timestamp;
  actualizadaEn: Timestamp;
}

export interface Unidad {
  id: string;
  placas: string;
  modelo: string;
  capacidad: number;
  estado: "disponible" | "en_servicio" | "mantenimiento";
  nombreChofer?: string;
}

export type TipoActividad = "arte" | "deporte" | "educacion" | "bienestar" | "recreacion" | "otro";
export type EstadoActividad = "programada" | "en_curso" | "completada" | "cancelada";

export interface Actividad {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: TipoActividad;
  fechaHora: Timestamp;
  duracionMin: number;
  capacidadMax: number;
  instructor: string;
  ubicacion: string;
  estado: EstadoActividad;
  casaRonald: string;
  registrados: number;
  creadaPor: string;
  creadaEn: Timestamp;
  actualizadaEn: Timestamp;
}

export interface RegistroActividad {
  id: string;
  actividadId: string;
  familiaId: string;
  nombreCuidador: string;
  fechaRegistro: Timestamp;
  asistio: boolean;
}

export interface Habitacion {
  id: string;
  numero: string;
  piso: string;
  capacidad: number;
  estado: "disponible" | "ocupada" | "mantenimiento" | "bloqueada";
  familiaId?: string;
  nombreFamilia?: string;
  fechaOcupacion?: Timestamp;
}

export interface HistorialHabitacion {
  id: string;
  habitacionId: string;
  familiaId: string;
  nombreFamilia: string;
  fechaIngreso: Timestamp;
  fechaSalida?: Timestamp;
}

export interface LugarMapa {
  id: string;
  nombre: string;
  icono: string;
  descripcion: string;
  detalles: string;
  casaRonald: string;
  x: number; // coordenada SVG
  y: number;
}
