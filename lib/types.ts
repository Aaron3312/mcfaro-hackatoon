// Tipos compartidos del dominio de mcFaro
import { Timestamp } from "firebase/firestore";

// Cuidador adicional de una familia (además del cuidador principal)
export interface Cuidador {
  nombre: string;
  telefono: string;
  parentesco?: string;
  email?: string;
}

export interface Familia {
  id: string;
  nombreCuidador: string;
  nombreNino: string;
  edadNino?: number;

  telefono: string;
  email?: string;
  parentesco?: string;
  hospital: string;
  fechaIngreso: Timestamp;
  fechaSalida?: Timestamp;
  tipoTratamiento?: "oncologia" | "neurologia" | "otro" | "cardiologia"; // legacy, ya no se usa
  fechaSalidaPlanificada?: Timestamp; // fecha estimada de salida definida por coordinador
  casaRonald: string;
  habitacion?: string;
  qrCode?: string;
  rol: "cuidador" | "coordinador";
  activa?: boolean;
  fcmToken?: string;
  cuidadores?: Cuidador[]; // cuidadores adicionales además del principal
}

export interface Cita {
  id: string;
  familiaId: string;
  titulo: string;
  descripcion?: string;
  fecha: Timestamp;
  servicio: "consulta" | "estudio" | "procedimiento" | "otro";
  ubicacion?: string;
  notas?: string;
  completada: boolean;
  recordatorio24h: boolean;
  recordatorio60: boolean;
  recordatorio15: boolean;
  notificacionEnviada: boolean;
  creadaEn?: Timestamp;
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

// Legacy — se mantiene para compatibilidad con solicitudesTransporte existentes
export interface Unidad {
  id: string;
  placas: string;
  modelo: string;
  capacidad: number;
  estado: "disponible" | "en_servicio" | "mantenimiento";
  nombreChofer?: string;
}

// ── Nuevo modelo de flota y rutas ─────────────────────────────────────────────

export type TipoVehiculo = "sedan" | "van" | "minibus";
export type EstadoVehiculo = "disponible";

export interface Vehiculo {
  id: string;
  placas: string;
  modelo: string;
  tipo: TipoVehiculo;
  color?: string;
  capacidad: number;
  estado: EstadoVehiculo;
  chofer?: string;
  telefonoChofer?: string;
  casaRonald: string;
}

export type DiaSemana = "lun" | "mar" | "mie" | "jue" | "vie" | "sab" | "dom";

export interface HorarioRuta {
  hora: string;       // "08:00"
  dias: DiaSemana[];
}

export interface Ruta {
  id: string;
  nombre: string;
  origen: string;
  destino: string;
  paradas?: string[];
  horarios: HorarioRuta[];
  vehiculoId?: string;
  casaRonald: string;
  activa: boolean;
  notas?: string;
  creadaEn: Timestamp;
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
  imagenUrl?: string;
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

export interface OcupanteHabitacion {
  familiaId: string;
  nombreFamilia: string;
  fechaIngreso: Timestamp;
}

export interface Habitacion {
  id: string;
  numero: string;
  piso: string;
  capacidad: number;          // máx de familias que pueden compartir la habitación
  estado: "disponible" | "ocupada" | "mantenimiento" | "bloqueada";
  ocupantes: OcupanteHabitacion[];   // lista real de familias asignadas
  // Campos legacy (pueden estar vacíos en docs nuevos)
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

// ── Accesos ──────────────────────────────────────────────────────────────────

export type TipoAcceso = "cuidador_principal" | "visitante" | "voluntario" | "staff";
export type EstadoAcceso = "activo" | "vencido" | "suspendido";

export interface AccesoPersonal {
  id: string;
  familiaId?: string;            // si está vinculado a una familia
  nombre: string;
  telefono?: string;
  tipo: TipoAcceso;
  estado: EstadoAcceso;
  casaRonald: string;
  habitacion?: string;           // habitación autorizada (si aplica)
  fechaInicio: Timestamp;
  fechaFin?: Timestamp;          // null = sin expiración
  notas?: string;
  creadoPor: string;             // familiaId del coordinador
  creadoEn: Timestamp;
  actualizadoEn: Timestamp;
}

// ── Comunidad ────────────────────────────────────────────────────────────────

export interface GrupoComunidad {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: "apoyo" | "informacion" | "psicologia" | "general";
  casaRonald: string;
  creadoPor: string;       // familiaId del coordinador
  creadoEn: Timestamp;
  miembros: number;
  activo: boolean;
}

export interface MensajeComunidad {
  id: string;
  grupoId: string;
  familiaId: string;
  nombreCuidador: string;
  texto: string;
  creadoEn: Timestamp;
  editado: boolean;
  eliminado: boolean;      // soft-delete para moderación
  reportado: boolean;
  reportadoPor?: string[];
}

export interface SesionPsicologia {
  id: string;
  familiaId: string;
  nombreCuidador: string;
  psicologoNombre: string;
  fecha: Timestamp;
  duracionMin: number;
  modalidad: "presencial" | "videollamada";
  notas?: string;
  estado: "agendada" | "completada" | "cancelada";
  casaRonald: string;
  creadaEn: Timestamp;
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

export type TipoGrupo = "oncologia" | "cardiologia" | "neurologia" | "otro" | "general";

export interface GrupoApoyo {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: TipoGrupo;
  casaRonald: string;
  miembros: string[]; // familiaIds
  creadoEn: Timestamp;
}

export interface MensajeChat {
  id: string;
  grupoId: string;
  familiaId: string;
  nombreUsuario: string; // solo nombre de pila, sin apellido
  mensaje: string;
  timestamp: Timestamp;
  reportado: boolean;
}

export type EstadoSesion = "pendiente" | "confirmada" | "completada" | "cancelada";

export interface SesionPsicologo {
  id: string;
  familiaId: string;
  psicologoId: string;
  nombrePsicologo: string;
  especialidad: string;
  fecha: Timestamp;
  notas?: string;
  estado: EstadoSesion;
  creadaEn: Timestamp;
}

export interface Psicologo {
  id: string;
  nombre: string;
  especialidad: string;
  descripcion: string;
  casaRonald: string;
  disponible: boolean;
  foto?: string;
}
