"use client";
// Módulo de Recursos y Reglamento — issue #29
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen, HelpCircle, Phone, Clock, ChevronDown,
  ChevronUp, ArrowLeft, Search, MapPin, Shield,
} from "lucide-react";

// ── Datos estáticos ───────────────────────────────────────────────────────────

const REGLAMENTO = [
  {
    titulo: "Horarios y acceso",
    items: [
      "El acceso a la Casa está permitido las 24 horas para familias hospedadas.",
      "Las visitas externas pueden ingresar de 9:00 a 20:00 h y deben registrarse en recepción.",
      "El silencio nocturno se respeta de 22:00 a 7:00 h en pasillos y áreas comunes.",
    ],
  },
  {
    titulo: "Habitaciones",
    items: [
      "Cada familia es responsable del orden y limpieza de su habitación.",
      "No está permitido cocinar dentro de las habitaciones.",
      "Se entrega y recibe llave al llegar y al salir; reportar cualquier pérdida de inmediato.",
      "Respetar los horarios de limpieza publicados en el pasillo.",
    ],
  },
  {
    titulo: "Cocina y comedor",
    items: [
      "La cocina está disponible de 6:00 a 22:00 h.",
      "Etiquetar los alimentos con nombre y fecha; se retira lo no etiquetado.",
      "Limpiar la estufa y utensilios después de cada uso.",
      "El comedor es un espacio compartido; por favor dejarlo limpio.",
    ],
  },
  {
    titulo: "Convivencia",
    items: [
      "Tratar con respeto a todas las familias, voluntarios y personal.",
      "Prohibido fumar, beber alcohol o consumir sustancias en todo el inmueble.",
      "Mascotas no están permitidas en la Casa.",
      "Cualquier conflicto debe reportarse al coordinador de turno.",
    ],
  },
  {
    titulo: "Servicios disponibles",
    items: [
      "Lavandería: máquinas disponibles de 8:00 a 20:00 h (respetar turnos).",
      "Wi-Fi: red «CasaRonald-Huespedes», contraseña en recepción.",
      "Transporte: solicitar con al menos 2 horas de anticipación en la app.",
      "Psicología y trabajo social: preguntar en recepción por disponibilidad.",
    ],
  },
];

const FAQS = [
  { cat: "Llegada", q: "¿Qué necesito para registrarme?", a: "Identificación oficial del cuidador, carta o referencia del hospital que acredite el tratamiento del menor y carta de buena conducta (en algunos casos)." },
  { cat: "Llegada", q: "¿Hay costo por hospedarse?", a: "No. El servicio es completamente gratuito para familias de niños en tratamiento. Fundación Ronald McDonald cubre los costos." },
  { cat: "Llegada", q: "¿Puedo traer a más familiares?", a: "Las habitaciones tienen capacidad limitada. Habla con el coordinador; en algunos casos se puede autorizar a un familiar adicional." },
  { cat: "Servicios", q: "¿Cómo solicito transporte al hospital?", a: "Usa la opción 'Transporte' en esta app con al menos 2 horas de anticipación. El coordinador confirmará disponibilidad." },
  { cat: "Servicios", q: "¿Hay internet disponible?", a: "Sí, Wi-Fi gratuito en toda la Casa. La contraseña la encuentra en recepción o en la pantalla del pasillo principal." },
  { cat: "Servicios", q: "¿Puedo usar la cocina cualquier hora?", a: "La cocina está disponible de 6:00 a 22:00 h. Fuera de ese horario solo se puede acceder para obtener agua." },
  { cat: "Salud", q: "¿Hay médico o enfermera en la Casa?", a: "No hay personal médico en la Casa. En emergencias llama al 911. Para temas del hospital, contacta directamente al equipo médico." },
  { cat: "Salud", q: "¿Qué hago si mi hijo tiene una emergencia en la noche?", a: "Llama al 911 de inmediato o pide al coordinador de turno que te ayude a conseguir transporte de emergencia al hospital." },
  { cat: "Salida", q: "¿Cuándo tengo que desocupar la habitación?", a: "Al alta del menor o al concluir el tratamiento. El coordinador te avisará con anticipación. La salida es antes de las 12:00 h del día acordado." },
  { cat: "Salida", q: "¿Puedo volver si mi hijo necesita otro ciclo de tratamiento?", a: "Sí. Sólo necesitas volver a registrarte con la nueva carta del hospital. Tienen prioridad las familias que ya han estado." },
];

const CONTACTOS = [
  { nombre: "Emergencias", numero: "911", icono: "🚨", color: "#EF4444", bg: "#FEE2E2" },
  { nombre: "Bomberos", numero: "068", icono: "🚒", color: "#F97316", bg: "#FFEDD5" },
  { nombre: "Cruz Roja", numero: "065", icono: "🏥", color: "#EF4444", bg: "#FEE2E2" },
  { nombre: "Coordinador Casa", numero: "Ext. 100", icono: "👤", color: "#C85A2A", bg: "#FDF0E6" },
  { nombre: "Recepción", numero: "Ext. 101", icono: "📞", color: "#C85A2A", bg: "#FDF0E6" },
  { nombre: "Transporte Casa", numero: "Ext. 102", icono: "🚐", color: "#7A3D1A", bg: "#FDF0E6" },
];

const HORARIOS = [
  { area: "Recepción", horario: "24 horas" },
  { area: "Cocina y comedor", horario: "6:00 – 22:00" },
  { area: "Lavandería", horario: "8:00 – 20:00" },
  { area: "Sala de estar", horario: "6:00 – 23:00" },
  { area: "Visitas externas", horario: "9:00 – 20:00" },
  { area: "Transporte (solicitudes)", horario: "6:00 – 20:00" },
  { area: "Psicología / Trabajo social", horario: "Lun–Vie 9:00 – 17:00" },
];

const CATEGORIAS_FAQ = ["Todas", "Llegada", "Servicios", "Salud", "Salida"];

// ── Componente principal ──────────────────────────────────────────────────────

export default function RecursosPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"reglamento" | "faq" | "contactos" | "horarios">("reglamento");

  return (
    <div className="min-h-screen bg-orange-50 pb-28">
      {/* Encabezado */}
      <div className="bg-white border-b border-orange-100 px-4 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-orange-50">
            <ArrowLeft size={20} className="text-orange-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-orange-900">Recursos</h1>
            <p className="text-sm text-orange-500">Reglamento, FAQ y contactos</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-4">
        <div className="flex gap-1 bg-white rounded-2xl p-1 shadow-sm border border-orange-100 overflow-x-auto">
          {([
            { key: "reglamento", label: "Reglamento", icono: BookOpen },
            { key: "faq",        label: "FAQ",         icono: HelpCircle },
            { key: "contactos",  label: "Contactos",   icono: Phone },
            { key: "horarios",   label: "Horarios",    icono: Clock },
          ] as const).map(({ key, label, icono: Icono }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                tab === key ? "bg-orange-500 text-white" : "text-orange-400"
              }`}
            >
              <Icono size={13} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-4">
        {tab === "reglamento" && <TabReglamento />}
        {tab === "faq"        && <TabFAQ />}
        {tab === "contactos"  && <TabContactos />}
        {tab === "horarios"   && <TabHorarios />}
      </div>
    </div>
  );
}

// ── Tab Reglamento ─────────────────────────────────────────────────────────────
function TabReglamento() {
  const [abierto, setAbierto] = useState<number | null>(0);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3 px-1">
        <Shield size={14} className="text-orange-400" />
        <p className="text-xs text-orange-400">Toca cada sección para expandirla</p>
      </div>
      {REGLAMENTO.map((seccion, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
          <button
            onClick={() => setAbierto(abierto === i ? null : i)}
            className="w-full flex items-center justify-between px-4 py-4 text-left"
          >
            <p className="font-bold text-orange-900 text-sm">{seccion.titulo}</p>
            {abierto === i
              ? <ChevronUp size={16} className="text-orange-400 flex-shrink-0" />
              : <ChevronDown size={16} className="text-orange-400 flex-shrink-0" />}
          </button>
          {abierto === i && (
            <ul className="px-4 pb-4 space-y-2.5">
              {seccion.items.map((item, j) => (
                <li key={j} className="flex items-start gap-2.5">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                  <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Tab FAQ ────────────────────────────────────────────────────────────────────
function TabFAQ() {
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todas");
  const [abierto, setAbierto] = useState<number | null>(null);

  const filtradas = FAQS.filter((faq) => {
    const coincideCat = categoria === "Todas" || faq.cat === categoria;
    const coincideBusq =
      busqueda.trim() === "" ||
      faq.q.toLowerCase().includes(busqueda.toLowerCase()) ||
      faq.a.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCat && coincideBusq;
  });

  return (
    <div className="space-y-3">
      {/* Buscador */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-300" />
        <input
          type="text"
          placeholder="Buscar pregunta…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full pl-9 pr-4 py-3 bg-white rounded-2xl border border-orange-100 text-sm text-orange-900 placeholder-orange-300 outline-none focus:border-orange-400"
        />
      </div>

      {/* Filtros de categoría */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIAS_FAQ.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoria(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-colors ${
              categoria === cat
                ? "bg-orange-500 text-white"
                : "bg-white text-orange-500 border border-orange-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Acordeón de FAQs */}
      {filtradas.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
          <HelpCircle size={28} className="text-orange-200 mx-auto mb-2" />
          <p className="text-orange-400 text-sm">No hay resultados para tu búsqueda</p>
        </div>
      ) : (
        filtradas.map((faq, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
            <button
              onClick={() => setAbierto(abierto === i ? null : i)}
              className="w-full flex items-start justify-between gap-3 px-4 py-3.5 text-left"
            >
              <div className="flex-1">
                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wide">{faq.cat}</span>
                <p className="text-sm font-semibold text-orange-900 mt-0.5">{faq.q}</p>
              </div>
              {abierto === i
                ? <ChevronUp size={16} className="text-orange-400 flex-shrink-0 mt-1" />
                : <ChevronDown size={16} className="text-orange-400 flex-shrink-0 mt-1" />}
            </button>
            {abierto === i && (
              <div className="px-4 pb-4">
                <p className="text-sm text-gray-600 leading-relaxed bg-orange-50 rounded-xl px-3 py-3">
                  {faq.a}
                </p>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

// ── Tab Contactos ──────────────────────────────────────────────────────────────
function TabContactos() {
  return (
    <div className="space-y-3">
      <p className="text-xs text-orange-400 px-1">Toca el número para llamar</p>
      {CONTACTOS.map((c, i) => (
        <a
          key={i}
          href={`tel:${c.numero}`}
          className="flex items-center gap-4 bg-white rounded-2xl px-4 py-4 shadow-sm border border-orange-100 active:scale-98 transition-transform"
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: c.bg }}
          >
            {c.icono}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-orange-900 text-sm">{c.nombre}</p>
            <p className="text-lg font-bold mt-0.5" style={{ color: c.color }}>{c.numero}</p>
          </div>
          <Phone size={18} style={{ color: c.color }} className="flex-shrink-0" />
        </a>
      ))}

      <div className="bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3 mt-2">
        <p className="text-xs text-orange-600 font-medium leading-relaxed">
          <span className="font-bold">Recuerda:</span> En caso de emergencia médica llama al 911 primero.
          Después notifica al coordinador de turno en recepción.
        </p>
      </div>
    </div>
  );
}

// ── Tab Horarios ───────────────────────────────────────────────────────────────
function TabHorarios() {
  return (
    <div className="space-y-2">
      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-orange-50">
          <p className="text-xs font-bold text-orange-500 uppercase tracking-wide">Horarios de operación</p>
        </div>
        {HORARIOS.map((h, i) => (
          <div
            key={i}
            className={`flex items-center justify-between px-4 py-3.5 ${
              i < HORARIOS.length - 1 ? "border-b border-orange-50" : ""
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-orange-400 flex-shrink-0" />
              <p className="text-sm text-gray-700">{h.area}</p>
            </div>
            <p className="text-sm font-bold text-orange-700 flex-shrink-0 ml-2">{h.horario}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-4">
        <p className="text-xs font-bold text-orange-500 uppercase tracking-wide mb-3">Uso de espacios comunes</p>
        <ul className="space-y-2.5">
          {[
            "Reserva la lavadora a través de la lista en el pasillo.",
            "La sala de estar es un espacio de descanso compartido; cuida el volumen.",
            "El jardín está disponible durante el día; mantén la limpieza.",
            "El cuarto de juegos para niños es supervisado; avisa al coordinador si hay inconvenientes.",
          ].map((regla, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
              <p className="text-sm text-gray-600 leading-relaxed">{regla}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
