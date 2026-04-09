"use client";
// Módulo de Recursos y Reglamento — rediseñado con Hierarchy, Harmony & Consistency
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen, HelpCircle, Phone, Clock, ChevronDown,
  ChevronUp, ArrowLeft, Search, Shield, AlertCircle, Info,
} from "lucide-react";

// ── Datos estáticos ───────────────────────────────────────────────────────────

const REGLAMENTO = [
  {
    titulo: "Horarios y acceso",
    emoji: "🕐",
    color: "#7C3AED",
    bg: "#F5F3FF",
    items: [
      "El acceso a la Casa está permitido las 24 horas para familias hospedadas.",
      "Las visitas externas pueden ingresar de 9:00 a 20:00 h y deben registrarse en recepción.",
      "El silencio nocturno se respeta de 22:00 a 7:00 h en pasillos y áreas comunes.",
    ],
  },
  {
    titulo: "Habitaciones",
    emoji: "🛏️",
    color: "#2563EB",
    bg: "#EFF6FF",
    items: [
      "Cada familia es responsable del orden y limpieza de su habitación.",
      "No está permitido cocinar dentro de las habitaciones.",
      "Se entrega y recibe llave al llegar y al salir; reportar cualquier pérdida de inmediato.",
      "Respetar los horarios de limpieza publicados en el pasillo.",
    ],
  },
  {
    titulo: "Cocina y comedor",
    emoji: "🍽️",
    color: "#C85A2A",
    bg: "#FDF0E6",
    items: [
      "La cocina está disponible de 6:00 a 22:00 h.",
      "Etiquetar los alimentos con nombre y fecha; se retira lo no etiquetado.",
      "Limpiar la estufa y utensilios después de cada uso.",
      "El comedor es un espacio compartido; por favor dejarlo limpio.",
    ],
  },
  {
    titulo: "Convivencia",
    emoji: "🤝",
    color: "#059669",
    bg: "#F0FDF4",
    items: [
      "Tratar con respeto a todas las familias, voluntarios y personal.",
      "Prohibido fumar, beber alcohol o consumir sustancias en todo el inmueble.",
      "Mascotas no están permitidas en la Casa.",
      "Cualquier conflicto debe reportarse al coordinador de turno.",
    ],
  },
  {
    titulo: "Servicios disponibles",
    emoji: "⭐",
    color: "#EA580C",
    bg: "#FFF7ED",
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
  { nombre: "Emergencias", numero: "911", icono: "🚨", color: "#DC2626", bg: "#FEE2E2" },
  { nombre: "Bomberos", numero: "068", icono: "🚒", color: "#EA580C", bg: "#FFEDD5" },
  { nombre: "Cruz Roja", numero: "065", icono: "🏥", color: "#DC2626", bg: "#FEE2E2" },
  { nombre: "Coordinador Casa", numero: "Ext. 100", icono: "👤", color: "#C85A2A", bg: "#FDF0E6" },
  { nombre: "Recepción", numero: "Ext. 101", icono: "📞", color: "#7A3D1A", bg: "#FDF0E6" },
  { nombre: "Transporte Casa", numero: "Ext. 102", icono: "🚐", color: "#9A6A2A", bg: "#FDF0E6" },
];

const HORARIOS = [
  { area: "Recepción", horario: "24 horas", icono: "🏠" },
  { area: "Cocina y comedor", horario: "6:00 – 22:00", icono: "🍽️" },
  { area: "Lavandería", horario: "8:00 – 20:00", icono: "🧺" },
  { area: "Sala de estar", horario: "6:00 – 23:00", icono: "🛋️" },
  { area: "Visitas externas", horario: "9:00 – 20:00", icono: "👥" },
  { area: "Transporte (solicitudes)", horario: "6:00 – 20:00", icono: "🚌" },
  { area: "Psicología / Trabajo social", horario: "Lun–Vie 9:00 – 17:00", icono: "💬" },
];

const CATEGORIAS_FAQ = ["Todas", "Llegada", "Servicios", "Salud", "Salida"];

// ── Componente principal ──────────────────────────────────────────────────────

export default function RecursosPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"reglamento" | "faq" | "contactos" | "horarios">("reglamento");

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-28">
      {/* Hero Header con gradiente */}
      <div className="relative bg-ronald-gradient overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-16 -left-10 w-52 h-52 rounded-full bg-black/10 pointer-events-none" />

        <div className="relative px-5 pt-12 pb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 p-2.5 rounded-xl bg-white/20 hover:bg-white/30 active:bg-white/40 transition-colors backdrop-blur-sm"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 shadow-lg">
              <BookOpen size={26} className="text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white leading-tight mb-2">
                Recursos
              </h1>
              <p className="text-white/80 text-sm leading-relaxed">
                Todo lo que necesitas saber sobre la Casa Ronald
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs de navegación */}
      <div className="px-5 -mt-4 relative z-10">
        <div className="bg-white rounded-2xl p-1.5 shadow-lg border border-gray-100">
          <div className="grid grid-cols-4 gap-1">
            {([
              { key: "reglamento", label: "Reglamento", icono: BookOpen },
              { key: "faq", label: "FAQ", icono: HelpCircle },
              { key: "contactos", label: "Contactos", icono: Phone },
              { key: "horarios", label: "Horarios", icono: Clock },
            ] as const).map(({ key, label, icono: Icono }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  tab === key
                    ? "bg-ronald-gradient text-white shadow-md scale-[1.02]"
                    : "text-gray-500 hover:bg-gray-50 active:bg-gray-100"
                }`}
              >
                <Icono size={18} strokeWidth={tab === key ? 2.5 : 2} />
                <span className="text-[11px]">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido de tabs */}
      <div className="px-5 mt-6">
        {tab === "reglamento" && <TabReglamento />}
        {tab === "faq" && <TabFAQ />}
        {tab === "contactos" && <TabContactos />}
        {tab === "horarios" && <TabHorarios />}
      </div>
    </div>
  );
}

// ── Tab Reglamento ─────────────────────────────────────────────────────────────
function TabReglamento() {
  const [abierto, setAbierto] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {/* Info banner */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3">
        <Shield size={16} className="text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 leading-relaxed">
          <span className="font-bold">Importante:</span> Todas las familias deben seguir estas normas para mantener un ambiente seguro y acogedor.
        </p>
      </div>

      {/* Acordeón de secciones */}
      {REGLAMENTO.map((seccion, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-shadow hover:shadow-md"
        >
          <button
            onClick={() => setAbierto(abierto === i ? null : i)}
            className="w-full flex items-center gap-3 px-5 py-4 text-left group"
          >
            {/* Emoji e icono */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-transform group-hover:scale-110"
              style={{ background: seccion.bg }}
            >
              {seccion.emoji}
            </div>

            {/* Título */}
            <p
              className="flex-1 font-bold text-base transition-colors"
              style={{ color: abierto === i ? seccion.color : "#374151" }}
            >
              {seccion.titulo}
            </p>

            {/* Chevron */}
            {abierto === i ? (
              <ChevronUp size={20} className="shrink-0 transition-transform" style={{ color: seccion.color }} />
            ) : (
              <ChevronDown size={20} className="text-gray-400 shrink-0 group-hover:text-gray-600 transition-colors" />
            )}
          </button>

          {/* Contenido expandible */}
          {abierto === i && (
            <div className="px-5 pb-5">
              <div className="rounded-xl p-4" style={{ background: `${seccion.bg}` }}>
                <ul className="space-y-3">
                  {seccion.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <div
                        className="mt-1.5 w-2 h-2 rounded-full shrink-0"
                        style={{ background: seccion.color }}
                      />
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {item}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
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
    <div className="space-y-4">
      {/* Buscador mejorado */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ronald-brown-medium" />
        <input
          type="text"
          placeholder="¿Qué necesitas saber?"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl border-2 border-gray-100 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-ronald-orange focus:ring-2 focus:ring-ronald-orange/20 transition-all shadow-sm"
        />
      </div>

      {/* Filtros de categoría mejorados */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIAS_FAQ.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoria(cat)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap shrink-0 transition-all duration-200 ${
              categoria === cat
                ? "bg-ronald-gradient text-white shadow-md scale-105"
                : "bg-white text-gray-600 border-2 border-gray-200 hover:border-ronald-orange/50 hover:text-ronald-orange"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Contador de resultados */}
      {busqueda && (
        <div className="flex items-center gap-2 px-1">
          <Info size={14} className="text-ronald-orange" />
          <p className="text-xs text-gray-600">
            {filtradas.length === 0
              ? "No se encontraron resultados"
              : `${filtradas.length} ${filtradas.length === 1 ? "resultado" : "resultados"}`}
          </p>
        </div>
      )}

      {/* Acordeón de FAQs */}
      {filtradas.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <HelpCircle size={32} className="text-gray-400" />
          </div>
          <p className="text-gray-900 font-semibold mb-1">No hay resultados</p>
          <p className="text-sm text-gray-500">Intenta con otras palabras clave</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtradas.map((faq, i) => {
            const colors: Record<string, { color: string; bg: string }> = {
              Llegada: { color: "#7C3AED", bg: "#F5F3FF" },
              Servicios: { color: "#059669", bg: "#F0FDF4" },
              Salud: { color: "#DC2626", bg: "#FEE2E2" },
              Salida: { color: "#2563EB", bg: "#EFF6FF" },
            };
            const catColor = colors[faq.cat] || { color: "#6B7280", bg: "#F9FAFB" };

            return (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => setAbierto(abierto === i ? null : i)}
                  className="w-full flex items-start gap-3 px-5 py-4 text-left group"
                >
                  <div className="flex-1">
                    <span
                      className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2"
                      style={{ background: catColor.bg, color: catColor.color }}
                    >
                      {faq.cat}
                    </span>
                    <p className="text-sm font-bold text-gray-900 leading-snug group-hover:text-ronald-orange transition-colors">
                      {faq.q}
                    </p>
                  </div>
                  {abierto === i ? (
                    <ChevronUp size={18} className="text-ronald-orange shrink-0 mt-1" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-400 shrink-0 mt-1 group-hover:text-ronald-orange transition-colors" />
                  )}
                </button>
                {abierto === i && (
                  <div className="px-5 pb-5">
                    <div
                      className="rounded-xl px-4 py-3.5 border-l-4"
                      style={{ background: catColor.bg, borderColor: catColor.color }}
                    >
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Tab Contactos ──────────────────────────────────────────────────────────────
function TabContactos() {
  return (
    <div className="space-y-3">
      {/* Banner de información */}
      <div className="flex items-start gap-3 bg-ronald-beige border border-ronald-orange/20 rounded-2xl px-4 py-3">
        <Phone size={16} className="text-ronald-orange shrink-0 mt-0.5" />
        <p className="text-xs text-ronald-brown leading-relaxed">
          <span className="font-bold">Toca cualquier número</span> para llamar directamente desde tu teléfono.
        </p>
      </div>

      {/* Lista de contactos */}
      {CONTACTOS.map((c, i) => (
        <a
          key={i}
          href={`tel:${c.numero}`}
          className="flex items-center gap-4 bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100 hover:shadow-md active:scale-[0.98] transition-all group"
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 transition-transform group-hover:scale-110"
            style={{ background: c.bg }}
          >
            {c.icono}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm mb-0.5">{c.nombre}</p>
            <p className="text-xl font-bold tabular-nums" style={{ color: c.color }}>
              {c.numero}
            </p>
          </div>
          <Phone
            size={20}
            style={{ color: c.color }}
            className="shrink-0 transition-transform group-hover:translate-x-0.5"
          />
        </a>
      ))}

      {/* Banner de emergencia */}
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl px-4 py-4 mt-4">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-900 mb-1">En caso de emergencia médica</p>
            <p className="text-sm text-red-700 leading-relaxed">
              Llama al <span className="font-bold">911</span> primero. Después notifica al coordinador de turno en recepción.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab Horarios ───────────────────────────────────────────────────────────────
function TabHorarios() {
  return (
    <div className="space-y-3">
      {/* Tarjeta de horarios */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 bg-gradient-to-r from-ronald-beige to-white border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-ronald-orange" />
            <p className="text-sm font-bold text-ronald-brown uppercase tracking-wider">
              Horarios de operación
            </p>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {HORARIOS.map((h, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl shrink-0 transition-transform group-hover:scale-110">
                  {h.icono}
                </span>
                <p className="text-sm font-medium text-gray-700">{h.area}</p>
              </div>
              <p className="text-sm font-bold text-ronald-brown shrink-0 ml-2 tabular-nums">
                {h.horario}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Reglas de espacios comunes */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={18} className="text-ronald-orange" />
          <p className="text-sm font-bold text-ronald-brown uppercase tracking-wider">
            Uso de espacios comunes
          </p>
        </div>

        <ul className="space-y-3">
          {[
            { text: "Reserva la lavadora a través de la lista en el pasillo.", emoji: "🧺" },
            { text: "La sala de estar es un espacio de descanso compartido; cuida el volumen.", emoji: "🛋️" },
            { text: "El jardín está disponible durante el día; mantén la limpieza.", emoji: "🌳" },
            { text: "El cuarto de juegos para niños es supervisado; avisa al coordinador si hay inconvenientes.", emoji: "🎮" },
          ].map((regla, i) => (
            <li key={i} className="flex items-start gap-3 group">
              <span className="text-xl shrink-0 transition-transform group-hover:scale-125">
                {regla.emoji}
              </span>
              <p className="text-sm text-gray-700 leading-relaxed pt-1">
                {regla.text}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
