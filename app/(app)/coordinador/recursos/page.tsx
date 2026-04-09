"use client";
// Panel CRUD de recursos — coordinador edita reglamento, FAQ, contactos y horarios
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useRecursos } from "@/hooks/useRecursos";
import {
  ReglamentoSeccion, RecursoFAQ, RecursoContacto, RecursoHorario,
} from "@/lib/types";
import {
  BookOpen, HelpCircle, Phone, Clock,
  Plus, Pencil, Trash2, Check, X, ArrowLeft,
} from "lucide-react";
import { Toast, useToast } from "@/components/ui/Toast";

// ── Datos por defecto (semilla inicial) ──────────────────────────────────────

const REGLAMENTO_DEFAULT: ReglamentoSeccion[] = [
  { titulo: "Horarios y acceso", emoji: "🕐", color: "#7C3AED", bg: "#F5F3FF",
    items: ["El acceso a la Casa está permitido las 24 horas para familias hospedadas.", "Las visitas externas pueden ingresar de 9:00 a 20:00 h y deben registrarse en recepción.", "El silencio nocturno se respeta de 22:00 a 7:00 h en pasillos y áreas comunes."] },
  { titulo: "Habitaciones", emoji: "🛏️", color: "#2563EB", bg: "#EFF6FF",
    items: ["Cada familia es responsable del orden y limpieza de su habitación.", "No está permitido cocinar dentro de las habitaciones.", "Se entrega y recibe llave al llegar y al salir.", "Respetar los horarios de limpieza publicados en el pasillo."] },
  { titulo: "Cocina y comedor", emoji: "🍽️", color: "#C85A2A", bg: "#FDF0E6",
    items: ["La cocina está disponible de 6:00 a 22:00 h.", "Etiquetar los alimentos con nombre y fecha; se retira lo no etiquetado.", "Limpiar la estufa y utensilios después de cada uso."] },
  { titulo: "Convivencia", emoji: "🤝", color: "#059669", bg: "#F0FDF4",
    items: ["Tratar con respeto a todas las familias, voluntarios y personal.", "Prohibido fumar, beber alcohol o consumir sustancias en todo el inmueble.", "Mascotas no están permitidas en la Casa."] },
  { titulo: "Servicios disponibles", emoji: "⭐", color: "#EA580C", bg: "#FFF7ED",
    items: ["Lavandería: máquinas disponibles de 8:00 a 20:00 h.", "Wi-Fi: red «CasaRonald-Huespedes», contraseña en recepción.", "Transporte: solicitar con al menos 2 horas de anticipación en la app."] },
];

const FAQS_DEFAULT: RecursoFAQ[] = [
  { cat: "Llegada", q: "¿Qué necesito para registrarme?", a: "Identificación oficial del cuidador, carta o referencia del hospital que acredite el tratamiento del menor." },
  { cat: "Llegada", q: "¿Hay costo por hospedarse?", a: "No. El servicio es completamente gratuito para familias de niños en tratamiento." },
  { cat: "Servicios", q: "¿Cómo solicito transporte al hospital?", a: "Usa la opción 'Transporte' en esta app con al menos 2 horas de anticipación." },
  { cat: "Servicios", q: "¿Hay internet disponible?", a: "Sí, Wi-Fi gratuito en toda la Casa. La contraseña la encuentra en recepción." },
  { cat: "Salud", q: "¿Hay médico o enfermera en la Casa?", a: "No hay personal médico en la Casa. En emergencias llama al 911." },
  { cat: "Salida", q: "¿Cuándo tengo que desocupar la habitación?", a: "Al alta del menor o al concluir el tratamiento. La salida es antes de las 12:00 h del día acordado." },
];

const CONTACTOS_DEFAULT: RecursoContacto[] = [
  { nombre: "Emergencias", numero: "911", icono: "🚨", color: "#DC2626", bg: "#FEE2E2" },
  { nombre: "Bomberos", numero: "068", icono: "🚒", color: "#EA580C", bg: "#FFEDD5" },
  { nombre: "Cruz Roja", numero: "065", icono: "🏥", color: "#DC2626", bg: "#FEE2E2" },
  { nombre: "Coordinador Casa", numero: "Ext. 100", icono: "👤", color: "#C85A2A", bg: "#FDF0E6" },
  { nombre: "Recepción", numero: "Ext. 101", icono: "📞", color: "#7A3D1A", bg: "#FDF0E6" },
  { nombre: "Transporte Casa", numero: "Ext. 102", icono: "🚐", color: "#9A6A2A", bg: "#FDF0E6" },
];

const HORARIOS_DEFAULT: RecursoHorario[] = [
  { area: "Recepción", horario: "24 horas", icono: "🏠" },
  { area: "Cocina y comedor", horario: "6:00 – 22:00", icono: "🍽️" },
  { area: "Lavandería", horario: "8:00 – 20:00", icono: "🧺" },
  { area: "Sala de estar", horario: "6:00 – 23:00", icono: "🛋️" },
  { area: "Visitas externas", horario: "9:00 – 20:00", icono: "👥" },
  { area: "Transporte (solicitudes)", horario: "6:00 – 20:00", icono: "🚌" },
  { area: "Psicología / Trabajo social", horario: "Lun–Vie 9:00 – 17:00", icono: "💬" },
];

// ── Página principal ──────────────────────────────────────────────────────────

export default function RecursosCoordinadorPage() {
  const router = useRouter();
  const { familia, cargando: authCargando } = useAuth();
  const { recursos, cargando, guardar } = useRecursos(familia?.casaRonald);
  const { toast, mostrar, cerrar } = useToast();

  const [tab, setTab] = useState<"reglamento" | "faq" | "contactos" | "horarios">("reglamento");

  // Estado local editable — se inicializa con Firestore o con los defaults
  const [reglamento, setReglamento] = useState<ReglamentoSeccion[]>(REGLAMENTO_DEFAULT);
  const [faqs, setFaqs] = useState<RecursoFAQ[]>(FAQS_DEFAULT);
  const [contactos, setContactos] = useState<RecursoContacto[]>(CONTACTOS_DEFAULT);
  const [horarios, setHorarios] = useState<RecursoHorario[]>(HORARIOS_DEFAULT);

  useEffect(() => {
    if (!authCargando && familia?.rol !== "coordinador") router.replace("/dashboard");
  }, [familia, authCargando, router]);

  // Cuando llegan los datos de Firestore, sincronizar estado local
  useEffect(() => {
    if (!recursos) return;
    if (recursos.reglamento?.length) setReglamento(recursos.reglamento);
    if (recursos.faqs?.length) setFaqs(recursos.faqs);
    if (recursos.contactos?.length) setContactos(recursos.contactos);
    if (recursos.horarios?.length) setHorarios(recursos.horarios);
  }, [recursos]);

  // Guarda una sección actualizada junto con el resto del estado actual
  const salvarReglamento = async (v: ReglamentoSeccion[]) => {
    setReglamento(v);
    try { await guardar({ reglamento: v, faqs, contactos, horarios }); mostrar("Guardado"); }
    catch { mostrar("Error al guardar"); }
  };
  const salvarFaqs = async (v: RecursoFAQ[]) => {
    setFaqs(v);
    try { await guardar({ reglamento, faqs: v, contactos, horarios }); mostrar("Guardado"); }
    catch { mostrar("Error al guardar"); }
  };
  const salvarContactos = async (v: RecursoContacto[]) => {
    setContactos(v);
    try { await guardar({ reglamento, faqs, contactos: v, horarios }); mostrar("Guardado"); }
    catch { mostrar("Error al guardar"); }
  };
  const salvarHorarios = async (v: RecursoHorario[]) => {
    setHorarios(v);
    try { await guardar({ reglamento, faqs, contactos, horarios: v }); mostrar("Guardado"); }
    catch { mostrar("Error al guardar"); }
  };

  if (cargando || authCargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#C85A2A", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <>
      {/* Banner */}
      <div className="relative overflow-hidden w-full" style={{ background: "linear-gradient(135deg, #C85A2A 0%, #E87A3A 70%, #F5C842 100%)" }}>
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-15" style={{ background: "#7A3D1A" }} />
        <div className="max-w-3xl mx-auto px-5 py-8 md:px-10">
          <button onClick={() => router.back()} className="text-white/70 text-sm mb-3 flex items-center gap-1 hover:text-white transition-colors">
            <ArrowLeft size={14} /> Panel coordinador
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <BookOpen size={26} /> Recursos
          </h1>
          <p className="text-white/70 text-sm mt-2">Los cambios se guardan automáticamente al confirmar cada edición.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-6 pb-10 md:px-10">
        {/* Tabs */}
        <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 mb-6">
          <div className="grid grid-cols-4 gap-1">
            {([
              { key: "reglamento", label: "Reglamento", icono: BookOpen },
              { key: "faq",        label: "Preguntas",   icono: HelpCircle },
              { key: "contactos",  label: "Contactos",   icono: Phone },
              { key: "horarios",   label: "Horarios",    icono: Clock },
            ] as const).map(({ key, label, icono: Icono }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  tab === key ? "text-white shadow-md" : "text-gray-500 hover:bg-gray-50"
                }`}
                style={tab === key ? { background: "#C85A2A" } : {}}
              >
                <Icono size={16} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Contenido por tab */}
        {tab === "reglamento" && (
          <EditorReglamento datos={reglamento} onChange={salvarReglamento} />
        )}
        {tab === "faq" && (
          <EditorFAQ datos={faqs} onChange={salvarFaqs} />
        )}
        {tab === "contactos" && (
          <EditorContactos datos={contactos} onChange={salvarContactos} />
        )}
        {tab === "horarios" && (
          <EditorHorarios datos={horarios} onChange={salvarHorarios} />
        )}
      </div>

      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrar} />}
    </>
  );
}

// ── Editor Reglamento ─────────────────────────────────────────────────────────

function EditorReglamento({ datos, onChange }: { datos: ReglamentoSeccion[]; onChange: (v: ReglamentoSeccion[]) => void }) {
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [form, setForm] = useState<ReglamentoSeccion | null>(null);
  const [nuevoItem, setNuevoItem] = useState("");

  const abrirEditar = (i: number) => { setEditIdx(i); setForm({ ...datos[i], items: [...datos[i].items] }); };
  const cerrar = () => { setEditIdx(null); setForm(null); setNuevoItem(""); };

  const guardarSeccion = () => {
    if (!form || editIdx === null) return;
    const itemsFinal = nuevoItem.trim()
      ? [...form.items, nuevoItem.trim()]
      : form.items;
    const nuevo = [...datos];
    nuevo[editIdx] = { ...form, items: itemsFinal };
    onChange(nuevo);
    cerrar();
  };

  const eliminarSeccion = (i: number) => onChange(datos.filter((_, idx) => idx !== i));

  const agregarSeccion = () => {
    onChange([...datos, { titulo: "Nueva sección", emoji: "📌", color: "#C85A2A", bg: "#FDF0E6", items: ["Nuevo ítem"] }]);
    setEditIdx(datos.length);
    setForm({ titulo: "Nueva sección", emoji: "📌", color: "#C85A2A", bg: "#FDF0E6", items: ["Nuevo ítem"] });
  };

  return (
    <div className="space-y-3">
      {datos.map((s, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {editIdx === i && form ? (
            <div className="p-4 space-y-3">
              <div className="flex gap-2">
                <input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                  className="w-14 border border-gray-200 rounded-xl px-2 py-2 text-center text-lg" placeholder="📌" />
                <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400" placeholder="Título de la sección" />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500">Ítems</p>
                {form.items.map((item, j) => (
                  <div key={j} className="flex gap-2">
                    <input value={item} onChange={(e) => {
                        const items = [...form.items]; items[j] = e.target.value;
                        setForm({ ...form, items });
                      }}
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                    />
                    <button onClick={() => setForm({ ...form, items: form.items.filter((_, k) => k !== j) })}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input value={nuevoItem} onChange={(e) => setNuevoItem(e.target.value)}
                    placeholder="Agregar ítem..."
                    onKeyDown={(e) => { if (e.key === "Enter" && nuevoItem.trim()) { setForm({ ...form, items: [...form.items, nuevoItem.trim()] }); setNuevoItem(""); } }}
                    className="flex-1 border border-dashed border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
                  <button onClick={() => { if (nuevoItem.trim()) { setForm({ ...form, items: [...form.items, nuevoItem.trim()] }); setNuevoItem(""); } }}
                    className="p-2 rounded-lg bg-orange-50 text-orange-500 hover:bg-orange-100 transition-colors">
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={cerrar} className="flex-1 py-2 rounded-xl text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors">Cancelar</button>
                <button onClick={guardarSeccion} className="flex-1 py-2 rounded-xl text-sm font-bold text-white transition-colors flex items-center justify-center gap-1" style={{ background: "#C85A2A" }}>
                  <Check size={14} /> Guardar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="text-2xl">{s.emoji}</span>
              <p className="flex-1 font-semibold text-gray-800 text-sm">{s.titulo}</p>
              <span className="text-xs text-gray-400">{s.items.length} ítems</span>
              <button onClick={() => abrirEditar(i)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><Pencil size={14} className="text-gray-400" /></button>
              <button onClick={() => eliminarSeccion(i)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={14} className="text-red-400" /></button>
            </div>
          )}
        </div>
      ))}
      <button onClick={agregarSeccion} className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-200 text-sm font-semibold text-gray-400 hover:border-orange-300 hover:text-orange-400 transition-colors flex items-center justify-center gap-2">
        <Plus size={16} /> Agregar sección
      </button>
    </div>
  );
}

// ── Editor FAQ ────────────────────────────────────────────────────────────────

function EditorFAQ({ datos, onChange }: { datos: RecursoFAQ[]; onChange: (v: RecursoFAQ[]) => void }) {
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [form, setForm] = useState<RecursoFAQ>({ cat: "", q: "", a: "" });

  const CATS = ["Llegada", "Servicios", "Salud", "Salida", "Otro"];

  const abrirEditar = (i: number) => { setEditIdx(i); setForm({ ...datos[i] }); };
  const cerrar = () => { setEditIdx(null); setForm({ cat: "", q: "", a: "" }); };

  const guardar = () => {
    if (!form.q.trim() || !form.a.trim()) return;
    const nuevo = [...datos];
    if (editIdx === null) { nuevo.push(form); } else { nuevo[editIdx] = form; }
    onChange(nuevo);
    cerrar();
  };

  const eliminar = (i: number) => onChange(datos.filter((_, idx) => idx !== i));

  const agregar = () => { setEditIdx(null); setForm({ cat: "Llegada", q: "", a: "" }); };

  const showForm = editIdx !== null || (editIdx === null && form.q === "" && datos.length === 0) || (form.q !== "" && editIdx === null);

  return (
    <div className="space-y-3">
      {datos.map((f, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {editIdx === i ? (
            <div className="p-4 space-y-3">
              <select value={form.cat} onChange={(e) => setForm({ ...form, cat: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400 bg-white">
                {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input value={form.q} onChange={(e) => setForm({ ...form, q: e.target.value })}
                placeholder="Pregunta" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
              <textarea value={form.a} onChange={(e) => setForm({ ...form, a: e.target.value })}
                placeholder="Respuesta" rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400 resize-none" />
              <div className="flex gap-2">
                <button onClick={cerrar} className="flex-1 py-2 rounded-xl text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors">Cancelar</button>
                <button onClick={guardar} className="flex-1 py-2 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-1 transition-colors" style={{ background: "#C85A2A" }}>
                  <Check size={14} /> Guardar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 mb-1">{f.cat}</span>
                <p className="text-sm font-semibold text-gray-800 line-clamp-1">{f.q}</p>
                <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{f.a}</p>
              </div>
              <button onClick={() => abrirEditar(i)} className="p-1.5 rounded-lg hover:bg-gray-100 shrink-0"><Pencil size={14} className="text-gray-400" /></button>
              <button onClick={() => eliminar(i)} className="p-1.5 rounded-lg hover:bg-red-50 shrink-0"><Trash2 size={14} className="text-red-400" /></button>
            </div>
          )}
        </div>
      ))}

      {/* Formulario nueva pregunta */}
      {showForm && editIdx === null && (
        <div className="bg-white rounded-2xl shadow-sm border border-orange-200 p-4 space-y-3">
          <select value={form.cat} onChange={(e) => setForm({ ...form, cat: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400 bg-white">
            {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input value={form.q} onChange={(e) => setForm({ ...form, q: e.target.value })}
            placeholder="Pregunta" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
          <textarea value={form.a} onChange={(e) => setForm({ ...form, a: e.target.value })}
            placeholder="Respuesta" rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400 resize-none" />
          <div className="flex gap-2">
            <button onClick={cerrar} className="flex-1 py-2 rounded-xl text-sm text-gray-500 bg-gray-100"><X size={14} className="inline mr-1" />Cancelar</button>
            <button onClick={guardar} className="flex-1 py-2 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-1" style={{ background: "#C85A2A" }}>
              <Check size={14} /> Agregar
            </button>
          </div>
        </div>
      )}

      <button onClick={agregar} className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-200 text-sm font-semibold text-gray-400 hover:border-orange-300 hover:text-orange-400 transition-colors flex items-center justify-center gap-2">
        <Plus size={16} /> Agregar pregunta
      </button>
    </div>
  );
}

// ── Editor Contactos ──────────────────────────────────────────────────────────

function EditorContactos({ datos, onChange }: { datos: RecursoContacto[]; onChange: (v: RecursoContacto[]) => void }) {
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [form, setForm] = useState<RecursoContacto>({ nombre: "", numero: "", icono: "📞", color: "#C85A2A", bg: "#FDF0E6" });

  const abrirEditar = (i: number) => { setEditIdx(i); setForm({ ...datos[i] }); };
  const cerrar = () => { setEditIdx(null); setForm({ nombre: "", numero: "", icono: "📞", color: "#C85A2A", bg: "#FDF0E6" }); };

  const guardar = () => {
    if (!form.nombre.trim() || !form.numero.trim()) return;
    const nuevo = [...datos];
    if (editIdx === null) { nuevo.push(form); } else { nuevo[editIdx] = form; }
    onChange(nuevo);
    cerrar();
  };

  const eliminar = (i: number) => onChange(datos.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      {datos.map((c, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {editIdx === i ? (
            <div className="p-4 space-y-3">
              <div className="flex gap-2">
                <input value={form.icono} onChange={(e) => setForm({ ...form, icono: e.target.value })}
                  className="w-14 border border-gray-200 rounded-xl px-2 py-2 text-center text-lg" />
                <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Nombre" className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
              </div>
              <input value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })}
                placeholder="Número o extensión" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
              <div className="flex gap-2">
                <button onClick={cerrar} className="flex-1 py-2 rounded-xl text-sm text-gray-500 bg-gray-100">Cancelar</button>
                <button onClick={guardar} className="flex-1 py-2 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-1" style={{ background: "#C85A2A" }}>
                  <Check size={14} /> Guardar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="text-2xl w-8 text-center shrink-0">{c.icono}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">{c.nombre}</p>
                <p className="text-sm font-bold tabular-nums" style={{ color: c.color }}>{c.numero}</p>
              </div>
              <button onClick={() => abrirEditar(i)} className="p-1.5 rounded-lg hover:bg-gray-100"><Pencil size={14} className="text-gray-400" /></button>
              <button onClick={() => eliminar(i)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={14} className="text-red-400" /></button>
            </div>
          )}
        </div>
      ))}

      {/* Formulario nuevo contacto */}
      {editIdx === null && (
        <div className="bg-white rounded-2xl shadow-sm border border-dashed border-gray-200 p-4 space-y-3">
          <div className="flex gap-2">
            <input value={form.icono} onChange={(e) => setForm({ ...form, icono: e.target.value })}
              className="w-14 border border-gray-200 rounded-xl px-2 py-2 text-center text-lg" />
            <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Nombre del contacto" className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
          </div>
          <input value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })}
            placeholder="Número o extensión" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
          <button onClick={guardar} disabled={!form.nombre.trim() || !form.numero.trim()}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-40 flex items-center justify-center gap-2 transition-opacity" style={{ background: "#C85A2A" }}>
            <Plus size={16} /> Agregar contacto
          </button>
        </div>
      )}
    </div>
  );
}

// ── Editor Horarios ───────────────────────────────────────────────────────────

function EditorHorarios({ datos, onChange }: { datos: RecursoHorario[]; onChange: (v: RecursoHorario[]) => void }) {
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [form, setForm] = useState<RecursoHorario>({ area: "", horario: "", icono: "🕐" });

  const abrirEditar = (i: number) => { setEditIdx(i); setForm({ ...datos[i] }); };
  const cerrar = () => { setEditIdx(null); setForm({ area: "", horario: "", icono: "🕐" }); };

  const guardar = () => {
    if (!form.area.trim() || !form.horario.trim()) return;
    const nuevo = [...datos];
    if (editIdx === null) { nuevo.push(form); } else { nuevo[editIdx] = form; }
    onChange(nuevo);
    cerrar();
  };

  const eliminar = (i: number) => onChange(datos.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
        {datos.map((h, i) => (
          <div key={i}>
            {editIdx === i ? (
              <div className="p-4 space-y-3">
                <div className="flex gap-2">
                  <input value={form.icono} onChange={(e) => setForm({ ...form, icono: e.target.value })}
                    className="w-14 border border-gray-200 rounded-xl px-2 py-2 text-center text-lg" />
                  <input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })}
                    placeholder="Área" className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
                </div>
                <input value={form.horario} onChange={(e) => setForm({ ...form, horario: e.target.value })}
                  placeholder="Ej. 8:00 – 20:00" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
                <div className="flex gap-2">
                  <button onClick={cerrar} className="flex-1 py-2 rounded-xl text-sm text-gray-500 bg-gray-100">Cancelar</button>
                  <button onClick={guardar} className="flex-1 py-2 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-1" style={{ background: "#C85A2A" }}>
                    <Check size={14} /> Guardar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                <span className="text-xl shrink-0">{h.icono}</span>
                <p className="flex-1 text-sm font-medium text-gray-700">{h.area}</p>
                <p className="text-sm font-bold text-ronald-brown tabular-nums shrink-0">{h.horario}</p>
                <button onClick={() => abrirEditar(i)} className="p-1.5 rounded-lg hover:bg-gray-100 ml-1"><Pencil size={14} className="text-gray-400" /></button>
                <button onClick={() => eliminar(i)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={14} className="text-red-400" /></button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Formulario nuevo horario */}
      {editIdx === null && (
        <div className="bg-white rounded-2xl shadow-sm border border-dashed border-gray-200 p-4 space-y-3">
          <div className="flex gap-2">
            <input value={form.icono} onChange={(e) => setForm({ ...form, icono: e.target.value })}
              className="w-14 border border-gray-200 rounded-xl px-2 py-2 text-center text-lg" />
            <input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })}
              placeholder="Área o servicio" className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
          </div>
          <input value={form.horario} onChange={(e) => setForm({ ...form, horario: e.target.value })}
            placeholder="Horario (ej. 8:00 – 20:00 o 24 horas)" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
          <button onClick={guardar} disabled={!form.area.trim() || !form.horario.trim()}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-40 flex items-center justify-center gap-2 transition-opacity" style={{ background: "#C85A2A" }}>
            <Plus size={16} /> Agregar horario
          </button>
        </div>
      )}
    </div>
  );
}
