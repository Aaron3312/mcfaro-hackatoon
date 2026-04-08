/**
 * Seed completo de mcFaro — datos variados para demo/hackathon
 * Uso: node scripts/seed.mjs
 *
 * Crea:
 *   - 12 familias (cuidadores) con Auth + Firestore
 *   - Citas médicas por familia
 *   - Actividades de la casa Ronald
 *   - Solicitudes de transporte (varios estados)
 *   - Menú de hoy y mañana
 *   - Habitaciones (piso 1 y 2)
 *   - Vehículos + rutas fijas
 *   - Registros de actividades
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { readFileSync } from "fs";

// ── Inicialización ────────────────────────────────────────────
const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim().replace(/^"|"$/g, "")];
    })
);

initializeApp({
  credential: cert({
    projectId: env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
});

const auth = getAuth();
const db = getFirestore();

const CASA = "casa-ronald-cdmx";
const HOSPITAL = "Hospital Infantil de México";

// ── Helpers ────────────────────────────────────────────────────
const ts = (date) => Timestamp.fromDate(date);
const diasAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d; };
const diasAdelante = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d; };
const hoyA = (h, m = 0) => { const d = new Date(); d.setHours(h, m, 0, 0); return d; };

// ── 1. FAMILIAS ────────────────────────────────────────────────
const familiasSeed = [
  {
    telefono: "+525511223300",
    nombreCuidador: "María Guadalupe Torres Ramírez",
    nombreNino: "Emilio Torres",
    edadNino: 6,
    diagnostico: "Leucemia linfoblástica aguda",
    parentesco: "Madre",
    email: "guadalupe.torres@gmail.com",
    hospital: HOSPITAL,
    casaRonald: CASA,
    habitacion: "101",
    fechaIngreso: ts(diasAgo(45)),
    fechaSalidaPlanificada: ts(diasAdelante(1)),
    rol: "cuidador",
    activa: true,
    cuidadores: [{ nombre: "Jorge Torres", telefono: "+525511223301", parentesco: "Padre" }],
  },
  {
    telefono: "+525522334411",
    nombreCuidador: "Roberto Sánchez Morales",
    nombreNino: "Valentina Sánchez",
    edadNino: 4,
    diagnostico: "Cardiopatía congénita",
    parentesco: "Padre",
    email: "roberto.sanchez@hotmail.com",
    hospital: HOSPITAL,
    casaRonald: CASA,
    habitacion: "102",
    fechaIngreso: ts(diasAgo(12)),
    fechaSalidaPlanificada: ts(diasAdelante(8)),
    rol: "cuidador",
    activa: true,
    cuidadores: [],
  },
  {
    telefono: "+525533445522",
    nombreCuidador: "Ana Patricia Flores Vega",
    nombreNino: "Santiago Flores",
    edadNino: 9,
    diagnostico: "Tumor cerebral",
    parentesco: "Madre",
    hospital: HOSPITAL,
    casaRonald: CASA,
    habitacion: "103",
    fechaIngreso: ts(diasAgo(30)),
    fechaSalidaPlanificada: ts(diasAdelante(14)),
    rol: "cuidador",
    activa: true,
    cuidadores: [
      { nombre: "Carlos Flores", telefono: "+525533445523", parentesco: "Padre" },
      { nombre: "Lucía Vega", telefono: "+525533445524", parentesco: "Abuela" },
    ],
  },
  {
    telefono: "+525544556633",
    nombreCuidador: "Carmen Jiménez Pérez",
    nombreNino: "Isabella Jiménez",
    edadNino: 3,
    diagnostico: "Neuroblastoma",
    parentesco: "Madre",
    email: "carmen.jimenez@yahoo.com",
    hospital: HOSPITAL,
    casaRonald: CASA,
    habitacion: "104",
    fechaIngreso: ts(diasAgo(60)),
    fechaSalidaPlanificada: ts(diasAdelante(3)),
    rol: "cuidador",
    activa: true,
    cuidadores: [],
  },
  {
    telefono: "+525555667744",
    nombreCuidador: "Luis Alberto Mendoza Cruz",
    nombreNino: "Mateo Mendoza",
    edadNino: 11,
    diagnostico: "Anemia aplásica",
    parentesco: "Padre",
    hospital: HOSPITAL,
    casaRonald: CASA,
    habitacion: "201",
    fechaIngreso: ts(diasAgo(7)),
    fechaSalidaPlanificada: ts(diasAdelante(21)),
    rol: "cuidador",
    activa: true,
    cuidadores: [{ nombre: "Sofía Cruz de Mendoza", telefono: "+525555667745", parentesco: "Madre" }],
  },
  {
    telefono: "+525566778855",
    nombreCuidador: "Rosa Elena Gutiérrez Luna",
    nombreNino: "Camila Gutiérrez",
    edadNino: 7,
    diagnostico: "Leucemia mieloide",
    parentesco: "Madre",
    email: "rosa.gutierrez@gmail.com",
    hospital: HOSPITAL,
    casaRonald: CASA,
    habitacion: "202",
    fechaIngreso: ts(diasAgo(20)),
    fechaSalidaPlanificada: ts(diasAdelante(5)),
    rol: "cuidador",
    activa: true,
    cuidadores: [],
  },
  {
    telefono: "+525577889966",
    nombreCuidador: "Francisco Hernández Ibáñez",
    nombreNino: "Diego Hernández",
    edadNino: 13,
    diagnostico: "Linfoma de Hodgkin",
    parentesco: "Padre",
    hospital: HOSPITAL,
    casaRonald: CASA,
    habitacion: "203",
    fechaIngreso: ts(diasAgo(35)),
    fechaSalidaPlanificada: ts(diasAdelante(0)),
    rol: "cuidador",
    activa: true,
    cuidadores: [
      { nombre: "Elena Ibáñez", telefono: "+525577889967", parentesco: "Madre" },
    ],
  },
  {
    telefono: "+525588990077",
    nombreCuidador: "Leticia Moreno Castillo",
    nombreNino: "Sofía Moreno",
    edadNino: 5,
    diagnostico: "Retinoblastoma",
    parentesco: "Madre",
    email: "leticia.moreno@outlook.com",
    hospital: HOSPITAL,
    casaRonald: CASA,
    habitacion: "204",
    fechaIngreso: ts(diasAgo(15)),
    fechaSalidaPlanificada: ts(diasAdelante(10)),
    rol: "cuidador",
    activa: true,
    cuidadores: [],
  },
  {
    telefono: "+525599001188",
    nombreCuidador: "Miguel Ángel Reyes Domínguez",
    nombreNino: "Andrés Reyes",
    edadNino: 8,
    diagnostico: "Fibrosis quística",
    parentesco: "Padre",
    hospital: HOSPITAL,
    casaRonald: CASA,
    habitacion: "105",
    fechaIngreso: ts(diasAgo(5)),
    fechaSalidaPlanificada: ts(diasAdelante(30)),
    rol: "cuidador",
    activa: true,
    cuidadores: [{ nombre: "Claudia Domínguez", telefono: "+525599001189", parentesco: "Madre" }],
  },
  {
    telefono: "+525510112299",
    nombreCuidador: "Verónica Castañeda Ríos",
    nombreNino: "Luciana Castañeda",
    edadNino: 2,
    diagnostico: "Cardiopatía compleja",
    parentesco: "Madre",
    email: "vero.castaneda@gmail.com",
    hospital: HOSPITAL,
    casaRonald: CASA,
    habitacion: "106",
    fechaIngreso: ts(diasAgo(90)),
    fechaSalidaPlanificada: ts(diasAdelante(7)),
    rol: "cuidador",
    activa: true,
    cuidadores: [
      { nombre: "Ramón Castañeda", telefono: "+525510112298", parentesco: "Padre" },
      { nombre: "Teresa Ríos", telefono: "+525510112297", parentesco: "Abuela materna" },
    ],
  },
  {
    telefono: "+525521223310",
    nombreCuidador: "Javier Ortega Núñez",
    nombreNino: "Renata Ortega",
    edadNino: 10,
    diagnostico: "Tumor de Wilms",
    parentesco: "Padre",
    hospital: HOSPITAL,
    casaRonald: CASA,
    habitacion: "205",
    fechaIngreso: ts(diasAgo(22)),
    fechaSalidaPlanificada: ts(diasAdelante(12)),
    rol: "cuidador",
    activa: true,
    cuidadores: [],
  },
  {
    telefono: "+525532334421",
    nombreCuidador: "Patricia Espinoza Vargas",
    nombreNino: "Tomás Espinoza",
    edadNino: 14,
    diagnostico: "Sarcoma de Ewing",
    parentesco: "Madre",
    email: "pati.espinoza@hotmail.com",
    hospital: HOSPITAL,
    casaRonald: CASA,
    habitacion: "206",
    fechaIngreso: ts(diasAgo(50)),
    fechaSalidaPlanificada: ts(diasAdelante(18)),
    rol: "cuidador",
    activa: true,
    cuidadores: [{ nombre: "Ernesto Espinoza", telefono: "+525532334422", parentesco: "Padre" }],
  },
];

// ── 2. ACTIVIDADES ─────────────────────────────────────────────
const actividadesSeed = [
  {
    titulo: "Taller de pintura — Paisajes",
    descripcion: "Aprende técnicas básicas de pintura en acuarela con temas de naturaleza. Materiales incluidos.",
    tipo: "arte",
    fechaHora: ts(hoyA(10, 0)),
    duracionMin: 60,
    capacidadMax: 15,
    instructor: "Valeria Ríos",
    ubicacion: "Sala de actividades — Planta baja",
    estado: "programada",
    casaRonald: CASA,
    registrados: 7,
    creadaPor: "coordinador",
    creadaEn: ts(diasAgo(5)),
    actualizadaEn: ts(diasAgo(1)),
  },
  {
    titulo: "Yoga y meditación para cuidadores",
    descripcion: "Sesión de relajación y respiración consciente. Especialmente diseñada para mamás y papás.",
    tipo: "bienestar",
    fechaHora: ts(hoyA(8, 30)),
    duracionMin: 45,
    capacidadMax: 20,
    instructor: "Dr. Marco Ávila",
    ubicacion: "Jardín principal",
    estado: "programada",
    casaRonald: CASA,
    registrados: 12,
    creadaPor: "coordinador",
    creadaEn: ts(diasAgo(3)),
    actualizadaEn: ts(diasAgo(1)),
  },
  {
    titulo: "Lectura en voz alta — Cuentos del mundo",
    descripcion: "Sesión de cuentacuentos para niños y sus familias. Esta semana: México y América Latina.",
    tipo: "educacion",
    fechaHora: ts(hoyA(16, 0)),
    duracionMin: 30,
    capacidadMax: 25,
    instructor: "Sofía Blanco",
    ubicacion: "Biblioteca comunitaria",
    estado: "programada",
    casaRonald: CASA,
    registrados: 9,
    creadaPor: "coordinador",
    creadaEn: ts(diasAgo(2)),
    actualizadaEn: ts(diasAgo(2)),
  },
  {
    titulo: "Futbolito y juegos de patio",
    descripcion: "Tarde deportiva para niños con energía y ganas de moverse. Supervisado por voluntarios.",
    tipo: "deporte",
    fechaHora: ts(diasAdelante(1)),
    duracionMin: 90,
    capacidadMax: 20,
    instructor: "Carlos Nava (voluntario)",
    ubicacion: "Patio trasero",
    estado: "programada",
    casaRonald: CASA,
    registrados: 5,
    creadaPor: "coordinador",
    creadaEn: ts(diasAgo(4)),
    actualizadaEn: ts(diasAgo(1)),
  },
  {
    titulo: "Manualidades — Figuras en papel",
    descripcion: "Origami y papiroflexia para todas las edades. Llévate tu creación a casa.",
    tipo: "arte",
    fechaHora: ts(diasAdelante(1)),
    duracionMin: 60,
    capacidadMax: 18,
    instructor: "Hana Watanabe (voluntaria)",
    ubicacion: "Comedor — Mesa grande",
    estado: "programada",
    casaRonald: CASA,
    registrados: 3,
    creadaPor: "coordinador",
    creadaEn: ts(diasAgo(6)),
    actualizadaEn: ts(diasAgo(2)),
  },
  {
    titulo: "Taller de cocina — Postres fáciles",
    descripcion: "Los niños aprenden a preparar gelatinas y paletas de fruta con sus cuidadores.",
    tipo: "recreacion",
    fechaHora: ts(diasAdelante(2)),
    duracionMin: 75,
    capacidadMax: 12,
    instructor: "Chef Gabriela Santos",
    ubicacion: "Cocina comunitaria",
    estado: "programada",
    casaRonald: CASA,
    registrados: 8,
    creadaPor: "coordinador",
    creadaEn: ts(diasAgo(3)),
    actualizadaEn: ts(diasAgo(1)),
  },
  {
    titulo: "Sesión de psicología grupal",
    descripcion: "Espacio de escucha y apoyo emocional para cuidadores. Confidencial y seguro.",
    tipo: "bienestar",
    fechaHora: ts(diasAdelante(2)),
    duracionMin: 90,
    capacidadMax: 10,
    instructor: "Psic. Andrea Morales",
    ubicacion: "Sala de consejería — Piso 1",
    estado: "programada",
    casaRonald: CASA,
    registrados: 4,
    creadaPor: "coordinador",
    creadaEn: ts(diasAgo(1)),
    actualizadaEn: ts(diasAgo(1)),
  },
  {
    titulo: "Clase de inglés básico",
    descripcion: "Vocabulario esencial para comunicarse con médicos en inglés. Nivel cero requerido.",
    tipo: "educacion",
    fechaHora: ts(diasAdelante(3)),
    duracionMin: 60,
    capacidadMax: 15,
    instructor: "Jennifer Walsh (voluntaria)",
    ubicacion: "Sala de cómputo",
    estado: "programada",
    casaRonald: CASA,
    registrados: 6,
    creadaPor: "coordinador",
    creadaEn: ts(diasAgo(5)),
    actualizadaEn: ts(diasAgo(2)),
  },
  {
    titulo: "Cine en familia — Películas animadas",
    descripcion: "Proyección especial para toda la familia. Palomitas incluidas cortesía de voluntarios.",
    tipo: "recreacion",
    fechaHora: ts(diasAdelante(4)),
    duracionMin: 120,
    capacidadMax: 40,
    instructor: "Equipo de voluntarios",
    ubicacion: "Sala de usos múltiples",
    estado: "programada",
    casaRonald: CASA,
    registrados: 22,
    creadaPor: "coordinador",
    creadaEn: ts(diasAgo(7)),
    actualizadaEn: ts(diasAgo(2)),
  },
  {
    titulo: "Meditación guiada nocturna",
    descripcion: "Para cuidadores que no pueden dormir. 20 minutos de calma antes de descansar.",
    tipo: "bienestar",
    fechaHora: ts(diasAgo(1)),
    duracionMin: 20,
    capacidadMax: 10,
    instructor: "Psic. Andrea Morales",
    ubicacion: "Sala tranquila — Piso 2",
    estado: "completada",
    casaRonald: CASA,
    registrados: 7,
    creadaPor: "coordinador",
    creadaEn: ts(diasAgo(8)),
    actualizadaEn: ts(new Date()),
  },
];

// ── 3. VEHÍCULOS ────────────────────────────────────────────────
const vehiculosSeed = [
  {
    placas: "ABC-123-MX",
    modelo: "Toyota Sienna 2022",
    tipo: "van",
    color: "Blanco",
    capacidad: 7,
    estado: "disponible",
    chofer: "Eduardo Salinas",
    telefonoChofer: "+525540001111",
    casaRonald: CASA,
  },
  {
    placas: "XYZ-456-MX",
    modelo: "Nissan NV350 2021",
    tipo: "minibus",
    color: "Gris",
    capacidad: 12,
    estado: "disponible",
    chofer: "Ricardo Fuentes",
    telefonoChofer: "+525540002222",
    casaRonald: CASA,
  },
  {
    placas: "DEF-789-MX",
    modelo: "Honda Odyssey 2023",
    tipo: "van",
    color: "Plateado",
    capacidad: 7,
    estado: "disponible",
    chofer: "Manuel Ortiz",
    telefonoChofer: "+525540003333",
    casaRonald: CASA,
  },
];

// ── 4. RUTAS ───────────────────────────────────────────────────
const rutasSeed = [
  {
    nombre: "Ruta matutina — Casa → Hospital",
    origen: "Casa Ronald McDonald CDMX",
    destino: "Hospital Infantil de México",
    paradas: ["Metro Mixcoac", "Av. Insurgentes Sur"],
    horarios: [
      { hora: "07:00", dias: ["lun", "mar", "mie", "jue", "vie", "sab"] },
      { hora: "08:30", dias: ["lun", "mar", "mie", "jue", "vie"] },
    ],
    casaRonald: CASA,
    activa: true,
    notas: "Llegada estimada 30 min después de salida.",
    creadaEn: ts(diasAgo(180)),
  },
  {
    nombre: "Ruta vespertina — Hospital → Casa",
    origen: "Hospital Infantil de México",
    destino: "Casa Ronald McDonald CDMX",
    horarios: [
      { hora: "14:00", dias: ["lun", "mar", "mie", "jue", "vie", "sab"] },
      { hora: "18:00", dias: ["lun", "mar", "mie", "jue", "vie"] },
    ],
    casaRonald: CASA,
    activa: true,
    notas: "Traer comprobante de cita si es urgente.",
    creadaEn: ts(diasAgo(180)),
  },
  {
    nombre: "Ruta dominical — Servicios externos",
    origen: "Casa Ronald McDonald CDMX",
    destino: "Centro Médico Nacional SXXI",
    paradas: ["Metro Zapata"],
    horarios: [
      { hora: "09:00", dias: ["dom"] },
    ],
    casaRonald: CASA,
    activa: true,
    creadaEn: ts(diasAgo(90)),
  },
];

// ── 5. HABITACIONES ────────────────────────────────────────────
const habitacionesSeed = [
  { numero: "101", piso: "1", capacidad: 2, estado: "ocupada" },
  { numero: "102", piso: "1", capacidad: 2, estado: "ocupada" },
  { numero: "103", piso: "1", capacidad: 2, estado: "ocupada" },
  { numero: "104", piso: "1", capacidad: 2, estado: "ocupada" },
  { numero: "105", piso: "1", capacidad: 2, estado: "ocupada" },
  { numero: "106", piso: "1", capacidad: 2, estado: "ocupada" },
  { numero: "107", piso: "1", capacidad: 2, estado: "disponible" },
  { numero: "108", piso: "1", capacidad: 1, estado: "mantenimiento" },
  { numero: "201", piso: "2", capacidad: 2, estado: "ocupada" },
  { numero: "202", piso: "2", capacidad: 2, estado: "ocupada" },
  { numero: "203", piso: "2", capacidad: 2, estado: "ocupada" },
  { numero: "204", piso: "2", capacidad: 2, estado: "ocupada" },
  { numero: "205", piso: "2", capacidad: 2, estado: "ocupada" },
  { numero: "206", piso: "2", capacidad: 2, estado: "ocupada" },
  { numero: "207", piso: "2", capacidad: 2, estado: "disponible" },
  { numero: "208", piso: "2", capacidad: 3, estado: "disponible" },
];

// ── 6. MENÚ DEL DÍA ────────────────────────────────────────────
const hoy = new Date();
const mañana = new Date(hoy); mañana.setDate(hoy.getDate() + 1);
const fmtFecha = (d) => d.toISOString().split("T")[0];

const menusSeed = [
  {
    fecha: fmtFecha(hoy),
    casaRonald: CASA,
    comidas: {
      desayuno: { hora: "08:00", descripcion: "Avena con fruta de temporada, jugo de naranja natural y pan tostado", disponible: true },
      comida:   { hora: "13:30", descripcion: "Sopa de verduras, arroz rojo, pollo en salsa verde con tortillas, agua de Jamaica", disponible: false },
      cena:     { hora: "19:30", descripcion: "Quesadillas de queso, frijoles negros, crema y ensalada de nopal", disponible: false },
    },
    publicadoPor: "coordinador",
    publicadoEn: ts(diasAgo(0)),
  },
  {
    fecha: fmtFecha(mañana),
    casaRonald: CASA,
    comidas: {
      desayuno: { hora: "08:00", descripcion: "Hotcakes con miel de agave, yogurt natural con granola y café de olla", disponible: false },
      comida:   { hora: "13:30", descripcion: "Crema de calabaza, milanesa de res con arroz blanco y ensalada cesar, agua de tamarindo", disponible: false },
      cena:     { hora: "19:30", descripcion: "Enfrijoladas con queso fresco, rebanadas de aguacate y atole de vainilla", disponible: false },
    },
    publicadoPor: "coordinador",
    publicadoEn: ts(diasAgo(0)),
  },
];

// ── MAIN ───────────────────────────────────────────────────────
async function crearFamilia(data) {
  const { telefono, ...firestoreData } = data;
  let uid;

  try {
    const existing = await auth.getUserByPhoneNumber(telefono);
    uid = existing.uid;
    console.log(`  ✓ Ya existe: ${telefono} (${uid})`);
  } catch {
    try {
      const nuevo = await auth.createUser({ phoneNumber: telefono });
      uid = nuevo.uid;
      console.log(`  + Creado: ${telefono} (${uid})`);
    } catch (e) {
      console.error(`  ✗ Error con ${telefono}: ${e.message}`);
      return null;
    }
  }

  await db.collection("familias").doc(uid).set(
    { ...firestoreData, telefono, id: uid },
    { merge: true }
  );
  return uid;
}

async function main() {
  console.log("\n🌱 Iniciando seed de mcFaro...\n");

  // Familias
  console.log("👨‍👩‍👧 Creando familias...");
  const familiaIds = [];
  for (const f of familiasSeed) {
    const uid = await crearFamilia(f);
    if (uid) familiaIds.push({ uid, habitacion: f.habitacion, nombreCuidador: f.nombreCuidador, nombreNino: f.nombreNino, fechaIngreso: f.fechaIngreso });
  }

  // Citas — 2-3 por familia con variedad de tipos y fechas
  console.log("\n📅 Creando citas...");
  const tiposCita = ["consulta", "estudio", "procedimiento", "otro"];
  const citasBase = [
    { titulo: "Consulta de oncología",     servicio: "consulta",     diasOffset: 0,  horaH: 9,  horaM: 30 },
    { titulo: "Análisis de sangre",        servicio: "estudio",      diasOffset: 1,  horaH: 7,  horaM: 0  },
    { titulo: "Quimioterapia — ciclo 4",   servicio: "procedimiento",diasOffset: 2,  horaH: 8,  horaM: 0  },
    { titulo: "Ecocardiograma",            servicio: "estudio",      diasOffset: 3,  horaH: 11, horaM: 0  },
    { titulo: "Revisión con neurólogo",    servicio: "consulta",     diasOffset: 0,  horaH: 14, horaM: 0  },
    { titulo: "Tomografía computada",      servicio: "estudio",      diasOffset: 4,  horaH: 10, horaM: 30 },
    { titulo: "Cirugía programada",        servicio: "procedimiento",diasOffset: 5,  horaH: 6,  horaM: 30 },
    { titulo: "Terapia física",            servicio: "otro",         diasOffset: 1,  horaH: 15, horaM: 0  },
    { titulo: "Valoración nutricional",    servicio: "consulta",     diasOffset: 2,  horaH: 12, horaM: 0  },
    { titulo: "Resonancia magnética",      servicio: "estudio",      diasOffset: 6,  horaH: 8,  horaM: 30 },
    { titulo: "Consulta psicológica",      servicio: "consulta",     diasOffset: 0,  horaH: 16, horaM: 0  },
    { titulo: "Biopsia",                   servicio: "procedimiento",diasOffset: 7,  horaH: 7,  horaM: 0  },
  ];

  for (let i = 0; i < familiaIds.length; i++) {
    const { uid } = familiaIds[i];
    const citas = [citasBase[i % citasBase.length], citasBase[(i + 3) % citasBase.length]];
    for (const cita of citas) {
      const fecha = diasAdelante(cita.diasOffset);
      fecha.setHours(cita.horaH, cita.horaM, 0, 0);
      const ref = db.collection("citas").doc();
      await ref.set({
        id: ref.id,
        familiaId: uid,
        titulo: cita.titulo,
        fecha: ts(fecha),
        servicio: cita.servicio,
        ubicacion: "Hospital Infantil de México — " + ["Piso 3", "Planta baja", "Torre de especialidades", "Urgencias"][i % 4],
        notas: i % 3 === 0 ? "Traer estudios previos y medicamentos actuales." : null,
        completada: false,
        recordatorio24h: true,
        recordatorio60: true,
        recordatorio15: true,
        notificacionEnviada: false,
        creadaEn: ts(diasAgo(3)),
      });
    }
  }
  console.log(`  ✓ ${familiaIds.length * 2} citas creadas`);

  // Transporte — estados variados
  console.log("\n🚌 Creando solicitudes de transporte...");
  const estadosTransporte = ["pendiente", "asignada", "en_camino", "completada", "completada"];
  const origenDestino = [
    { origen: "Casa Ronald McDonald CDMX", destino: "Hospital Infantil de México" },
    { origen: "Hospital Infantil de México", destino: "Casa Ronald McDonald CDMX" },
    { origen: "Casa Ronald McDonald CDMX", destino: "Centro Médico Nacional SXXI" },
  ];
  for (let i = 0; i < Math.min(familiaIds.length, 8); i++) {
    const { uid, nombreCuidador } = familiaIds[i];
    const ruta = origenDestino[i % origenDestino.length];
    const estado = estadosTransporte[i % estadosTransporte.length];
    const fechaHora = estado === "completada" ? diasAgo(i % 3) : diasAdelante(0);
    fechaHora.setHours(7 + i, 0, 0, 0);
    const ref = db.collection("solicitudesTransporte").doc();
    await ref.set({
      id: ref.id,
      familiaId: uid,
      nombreCuidador,
      ...ruta,
      fechaHora: ts(fechaHora),
      pasajeros: 1 + (i % 3),
      notas: i % 4 === 0 ? "El niño usa silla de ruedas, necesita espacio." : null,
      estado,
      placasUnidad: estado !== "pendiente" ? vehiculosSeed[i % vehiculosSeed.length].placas : null,
      nombreChofer: estado !== "pendiente" ? vehiculosSeed[i % vehiculosSeed.length].chofer : null,
      creadaEn: ts(diasAgo(1)),
      actualizadaEn: ts(new Date()),
    });
  }
  console.log(`  ✓ 8 solicitudes de transporte creadas`);

  // Actividades
  console.log("\n🎨 Creando actividades...");
  const actividadIds = [];
  for (const a of actividadesSeed) {
    const ref = db.collection("actividades").doc();
    await ref.set({ id: ref.id, ...a });
    actividadIds.push(ref.id);
  }
  console.log(`  ✓ ${actividadesSeed.length} actividades creadas`);

  // Registros de actividades — algunas familias inscritas
  console.log("\n📋 Creando registros de actividades...");
  let totalRegistros = 0;
  for (let i = 0; i < Math.min(familiaIds.length, 6); i++) {
    const { uid, nombreCuidador } = familiaIds[i];
    const actividadId = actividadIds[i % actividadIds.length];
    const ref = db.collection("registrosActividades").doc();
    await ref.set({
      id: ref.id,
      actividadId,
      familiaId: uid,
      nombreCuidador,
      fechaRegistro: ts(diasAgo(i)),
      asistio: i < 3,
    });
    totalRegistros++;
  }
  console.log(`  ✓ ${totalRegistros} registros de actividades`);

  // Menú
  console.log("\n🍽️  Creando menús...");
  for (const m of menusSeed) {
    const ref = db.collection("menus").doc(`${CASA}_${m.fecha}`);
    await ref.set({ id: ref.id, ...m });
  }
  console.log(`  ✓ ${menusSeed.length} menús (hoy y mañana)`);

  // Vehículos
  console.log("\n🚗 Creando vehículos...");
  for (const v of vehiculosSeed) {
    const ref = db.collection("vehiculos").doc();
    await ref.set({ id: ref.id, ...v });
  }
  console.log(`  ✓ ${vehiculosSeed.length} vehículos`);

  // Rutas
  console.log("\n🗺️  Creando rutas...");
  for (const r of rutasSeed) {
    const ref = db.collection("rutas").doc();
    await ref.set({ id: ref.id, ...r });
  }
  console.log(`  ✓ ${rutasSeed.length} rutas`);

  // Habitaciones con ocupantes
  console.log("\n🛏️  Creando habitaciones...");
  for (const h of habitacionesSeed) {
    const ocupantes = familiaIds
      .filter((f) => f.habitacion === h.numero)
      .map((f) => ({
        familiaId: f.uid,
        nombreFamilia: f.nombreNino,
        fechaIngreso: f.fechaIngreso,
      }));
    const ref = db.collection("habitaciones").doc(`${CASA}_${h.numero}`);
    await ref.set({
      id: ref.id,
      ...h,
      ocupantes,
      casaRonald: CASA,
    });
  }
  console.log(`  ✓ ${habitacionesSeed.length} habitaciones`);

  // Resumen
  console.log("\n✅ Seed completado exitosamente");
  console.log("─────────────────────────────────────────");
  console.log(`  Familias (cuidadores):    ${familiaIds.length}`);
  console.log(`  Citas médicas:            ${familiaIds.length * 2}`);
  console.log(`  Solicitudes transporte:   8`);
  console.log(`  Actividades:              ${actividadesSeed.length}`);
  console.log(`  Menús:                    ${menusSeed.length}`);
  console.log(`  Vehículos:                ${vehiculosSeed.length}`);
  console.log(`  Rutas:                    ${rutasSeed.length}`);
  console.log(`  Habitaciones:             ${habitacionesSeed.length}`);
  console.log("\n📱 Teléfonos de prueba (login con OTP):");
  familiasSeed.forEach((f) => {
    console.log(`  ${f.telefono}  →  ${f.nombreCuidador.split(" ")[0]} (${f.nombreNino})`);
  });
  console.log("\n👉 Coordinador: +52 55 1111 2222");
}

main().catch((e) => {
  console.error("\n❌ Error en seed:", e.message);
  process.exit(1);
});
