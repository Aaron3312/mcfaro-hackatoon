"use client";
// Panel admin: Módulo de Comunidad — grupos, moderación de chat, sesiones
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  collection, query, where, onSnapshot, orderBy, limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { GrupoComunidad, MensajeComunidad, SesionPsicologia } from "@/lib/types";
import { Toast, useToast } from "@/components/ui/Toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowLeft, Users, MessageSquare, Brain,
  Plus, Trash2, Flag, AlertTriangle, Calendar,
  CheckCircle, XCircle, ChevronDown, ChevronUp,
} from "lucide-react";

const TIPO_GRUPO_LABEL: Record<string, string> = {
  apoyo: "Apoyo emocional",
  informacion: "Información",
  psicologia: "Psicología",
  general: "General",
};

const TIPO_GRUPO_COLOR: Record<string, { bg: string; text: string }> = {
  apoyo:       { bg: "#FEE2E2", text: "#991B1B" },
  informacion: { bg: "#DBEAFE", text: "#1D4ED8" },
  psicologia:  { bg: "#EDE9FE", text: "#5B21B6" },
  general:     { bg: "#D1FAE5", text: "#065F46" },
};

export default function ComunidadAdminPage() {
  const router = useRouter();
  const { familia, cargando: authCargando } = useAuth();
  const { toast, mostrar, cerrar } = useToast();

  const [tab, setTab] = useState<"grupos" | "chat" | "sesiones">("grupos");
  const [grupos, setGrupos] = useState<GrupoComunidad[]>([]);
  const [mensajesReportados, setMensajesReportados] = useState<MensajeComunidad[]>([]);
  const [sesiones, setSesiones] = useState<SesionPsicologia[]>([]);
  const [alertas, setAlertas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  // Formulario nuevo grupo
  const [mostrarFormGrupo, setMostrarFormGrupo] = useState(false);
  const [formGrupo, setFormGrupo] = useState({
    nombre: "", descripcion: "", tipo: "apoyo" as GrupoComunidad["tipo"],
  });
  const [guardandoGrupo, setGuardandoGrupo] = useState(false);

  // Formulario nueva sesión
  const [mostrarFormSesion, setMostrarFormSesion] = useState(false);
  const [formSesion, setFormSesion] = useState({
    familiaId: "", nombreCuidador: "", psicologoNombre: "",
    fecha: "", duracionMin: 60, modalidad: "presencial" as SesionPsicologia["modalidad"],
    notas: "",
  });
  const [guardandoSesion, setGuardandoSesion] = useState(false);

  // Proteger ruta
  useEffect(() => {
    if (!authCargando && (!familia || familia.rol !== "coordinador")) {
      router.replace("/dashboard");
    }
  }, [familia, authCargando, router]);

  // Grupos
  useEffect(() => {
    const q = query(collection(db, "gruposComunidad"), orderBy("creadoEn", "desc"));
    return onSnapshot(q, (snap) => {
      setGrupos(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as GrupoComunidad));
      setCargando(false);
    }, () => setCargando(false));
  }, []);

  // Mensajes reportados
  useEffect(() => {
    const q = query(
      collection(db, "mensajesComunidad"),
      where("reportado", "==", true),
      where("eliminado", "==", false),
      orderBy("creadoEn", "desc"),
      limit(30)
    );
    return onSnapshot(q, (snap) =>
      setMensajesReportados(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as MensajeComunidad))
    );
  }, []);

  // Sesiones próximas
  useEffect(() => {
    const q = query(
      collection(db, "sesionesPsicologia"),
      where("estado", "==", "agendada"),
      orderBy("fecha", "asc"),
      limit(20)
    );
    return onSnapshot(q, (snap) =>
      setSesiones(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SesionPsicologia))
    );
  }, []);

  // Alertas no revisadas
  useEffect(() => {
    const q = query(
      collection(db, "alertasComunidad"),
      where("revisado", "==", false),
      orderBy("creadoEn", "desc"),
      limit(10)
    );
    return onSnapshot(q, (snap) =>
      setAlertas(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, []);

  const crearGrupo = async () => {
    if (!formGrupo.nombre.trim() || !formGrupo.descripcion.trim()) return;
    setGuardandoGrupo(true);
    try {
      const res = await fetch("/api/comunidad/grupos/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formGrupo, casaRonald: familia?.casaRonald ?? "casa-1", creadoPor: familia?.id }),
      });
      if (!res.ok) throw new Error("Error al crear grupo");
      mostrar("Grupo creado correctamente");
      setMostrarFormGrupo(false);
      setFormGrupo({ nombre: "", descripcion: "", tipo: "apoyo" });
    } catch {
      mostrar("Error al crear el grupo", "error");
    } finally {
      setGuardandoGrupo(false);
    }
  };

  const eliminarMensaje = async (mensajeId: string) => {
    try {
      const res = await fetch("/api/comunidad/mensajes/moderar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensajeId, accion: "eliminar" }),
      });
      if (!res.ok) throw new Error();
      mostrar("Mensaje eliminado");
    } catch {
      mostrar("Error al eliminar mensaje", "error");
    }
  };

  const agendarSesion = async () => {
    if (!formSesion.familiaId || !formSesion.psicologoNombre || !formSesion.fecha) return;
    setGuardandoSesion(true);
    try {
      const res = await fetch("/api/comunidad/sesiones/agendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formSesion,
          casaRonald: familia?.casaRonald ?? "casa-1",
          fecha: new Date(formSesion.fecha).toISOString(),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Error");
      }
      mostrar("Sesión agendada correctamente");
      setMostrarFormSesion(false);
      setFormSesion({ familiaId: "", nombreCuidador: "", psicologoNombre: "", fecha: "", duracionMin: 60, modalidad: "presencial", notas: "" });
    } catch (e: any) {
      mostrar(e.message || "Error al agendar sesión", "error");
    } finally {
      setGuardandoSesion(false);
    }
  };

  const formatFecha = (ts: any) => {
    if (!ts) return "—";
    try {
      const d = ts.toDate ? ts.toDate() : new Date(ts);
      return format(d, "d MMM yyyy, HH:mm", { locale: es });
    } catch { return "—"; }
  };

  if (authCargando || cargando) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-orange-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 pb-24">
      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrar} />}

      {/* Encabezado */}
      <div className="bg-white border-b border-orange-100 px-4 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-orange-50">
            <ArrowLeft size={20} className="text-orange-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-orange-900">Comunidad</h1>
            <p className="text-sm text-orange-500">Grupos, chat y sesiones de apoyo</p>
          </div>
          {alertas.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 rounded-xl">
              <AlertTriangle size={14} className="text-red-600" />
              <span className="text-xs font-bold text-red-700">{alertas.length} alerta{alertas.length > 1 ? "s" : ""}</span>
            </div>
          )}
        </div>
      </div>

      {/* Métricas rápidas */}
      <div className="px-4 pt-4">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-orange-100">
            <p className="text-2xl font-bold text-orange-600">{grupos.filter(g => g.activo).length}</p>
            <p className="text-xs text-orange-400 mt-0.5">Grupos activos</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-red-100">
            <p className="text-2xl font-bold text-red-500">{mensajesReportados.length}</p>
            <p className="text-xs text-red-400 mt-0.5">Reportados</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-purple-100">
            <p className="text-2xl font-bold text-purple-600">{sesiones.length}</p>
            <p className="text-xs text-purple-400 mt-0.5">Sesiones</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mx-4 mt-4 bg-white rounded-2xl p-1 shadow-sm border border-orange-100">
        {(["grupos", "chat", "sesiones"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
              tab === t ? "bg-orange-500 text-white" : "text-orange-400"
            }`}
          >
            {t === "grupos" && <Users size={13} />}
            {t === "chat" && <MessageSquare size={13} />}
            {t === "sesiones" && <Brain size={13} />}
            {t === "grupos" ? "Grupos" : t === "chat" ? "Moderación" : "Sesiones"}
            {t === "chat" && mensajesReportados.length > 0 && (
              <span className={`px-1.5 rounded-full text-[10px] font-bold ${tab === "chat" ? "bg-white/30" : "bg-red-500 text-white"}`}>
                {mensajesReportados.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="px-4 mt-4 space-y-3">

        {/* ── TAB: GRUPOS ─────────────────────────────────────────── */}
        {tab === "grupos" && (
          <>
            <button
              onClick={() => setMostrarFormGrupo(!mostrarFormGrupo)}
              className="w-full flex items-center justify-between px-4 py-3 bg-orange-500 text-white rounded-2xl font-semibold text-sm"
            >
              <div className="flex items-center gap-2">
                <Plus size={16} />
                Crear nuevo grupo
              </div>
              {mostrarFormGrupo ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {mostrarFormGrupo && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-orange-500 uppercase tracking-wide">Nombre</label>
                  <input
                    className="w-full mt-1 px-3 py-2.5 rounded-xl border border-orange-200 text-sm text-orange-900 outline-none focus:border-orange-400"
                    placeholder="Ej: Apoyo oncología pediátrica"
                    value={formGrupo.nombre}
                    onChange={(e) => setFormGrupo({ ...formGrupo, nombre: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-orange-500 uppercase tracking-wide">Descripción</label>
                  <textarea
                    className="w-full mt-1 px-3 py-2.5 rounded-xl border border-orange-200 text-sm text-orange-900 outline-none focus:border-orange-400 resize-none"
                    rows={3}
                    placeholder="¿De qué trata este grupo?"
                    value={formGrupo.descripcion}
                    onChange={(e) => setFormGrupo({ ...formGrupo, descripcion: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-orange-500 uppercase tracking-wide">Tipo</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {(["apoyo", "informacion", "psicologia", "general"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFormGrupo({ ...formGrupo, tipo: t })}
                        className={`py-2 rounded-xl text-xs font-semibold border transition-colors ${
                          formGrupo.tipo === t
                            ? "bg-orange-500 text-white border-orange-500"
                            : "bg-white text-orange-700 border-orange-200"
                        }`}
                      >
                        {TIPO_GRUPO_LABEL[t]}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={crearGrupo}
                  disabled={guardandoGrupo || !formGrupo.nombre || !formGrupo.descripcion}
                  className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold text-sm disabled:opacity-60"
                >
                  {guardandoGrupo ? "Creando…" : "Crear grupo"}
                </button>
              </div>
            )}

            {grupos.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <Users size={32} className="text-orange-200 mx-auto mb-2" />
                <p className="text-orange-400 text-sm">No hay grupos creados aún</p>
              </div>
            ) : (
              grupos.map((grupo) => (
                <div key={grupo.id} className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-bold text-orange-900 truncate">{grupo.nombre}</p>
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0"
                          style={{ background: TIPO_GRUPO_COLOR[grupo.tipo].bg, color: TIPO_GRUPO_COLOR[grupo.tipo].text }}
                        >
                          {TIPO_GRUPO_LABEL[grupo.tipo]}
                        </span>
                        {!grupo.activo && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-[10px] font-bold">
                            Inactivo
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-orange-500 line-clamp-2">{grupo.descripcion}</p>
                      <p className="text-[11px] text-orange-300 mt-1">
                        {grupo.miembros} miembro{grupo.miembros !== 1 ? "s" : ""} · {formatFecha(grupo.creadoEn)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* ── TAB: MODERACIÓN ─────────────────────────────────────── */}
        {tab === "chat" && (
          <>
            {mensajesReportados.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <CheckCircle size={32} className="text-green-400 mx-auto mb-2" />
                <p className="text-green-600 text-sm font-medium">Sin mensajes reportados</p>
                <p className="text-gray-400 text-xs mt-1">La comunidad está en orden</p>
              </div>
            ) : (
              <>
                <p className="text-xs text-orange-500 font-semibold px-1">
                  {mensajesReportados.length} mensaje{mensajesReportados.length !== 1 ? "s" : ""} reportado{mensajesReportados.length !== 1 ? "s" : ""}
                </p>
                {mensajesReportados.map((msg) => (
                  <div key={msg.id} className="bg-white rounded-2xl p-4 shadow-sm border border-red-100">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Flag size={14} className="text-red-500 flex-shrink-0" />
                        <p className="text-sm font-semibold text-orange-900">{msg.nombreCuidador}</p>
                      </div>
                      <span className="text-[11px] text-orange-300 flex-shrink-0">{formatFecha(msg.creadoEn)}</span>
                    </div>
                    <p className="text-sm text-gray-700 bg-red-50 rounded-xl px-3 py-2 mb-3">
                      {msg.texto}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] text-red-400">
                        {msg.reportadoPor?.length ?? 0} reporte{(msg.reportadoPor?.length ?? 0) !== 1 ? "s" : ""}
                      </p>
                      <button
                        onClick={() => eliminarMensaje(msg.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white rounded-xl text-xs font-bold"
                      >
                        <Trash2 size={12} />
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}

        {/* ── TAB: SESIONES ───────────────────────────────────────── */}
        {tab === "sesiones" && (
          <>
            <button
              onClick={() => setMostrarFormSesion(!mostrarFormSesion)}
              className="w-full flex items-center justify-between px-4 py-3 bg-purple-600 text-white rounded-2xl font-semibold text-sm"
            >
              <div className="flex items-center gap-2">
                <Plus size={16} />
                Agendar sesión
              </div>
              {mostrarFormSesion ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {mostrarFormSesion && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-purple-100 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-purple-600 uppercase tracking-wide">ID de familia</label>
                  <input
                    className="w-full mt-1 px-3 py-2.5 rounded-xl border border-purple-200 text-sm outline-none focus:border-purple-400"
                    placeholder="familiaId del cuidador"
                    value={formSesion.familiaId}
                    onChange={(e) => setFormSesion({ ...formSesion, familiaId: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Nombre cuidador</label>
                  <input
                    className="w-full mt-1 px-3 py-2.5 rounded-xl border border-purple-200 text-sm outline-none focus:border-purple-400"
                    value={formSesion.nombreCuidador}
                    onChange={(e) => setFormSesion({ ...formSesion, nombreCuidador: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Psicólogo/a</label>
                  <input
                    className="w-full mt-1 px-3 py-2.5 rounded-xl border border-purple-200 text-sm outline-none focus:border-purple-400"
                    placeholder="Nombre del psicólogo"
                    value={formSesion.psicologoNombre}
                    onChange={(e) => setFormSesion({ ...formSesion, psicologoNombre: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Fecha y hora</label>
                  <input
                    type="datetime-local"
                    className="w-full mt-1 px-3 py-2.5 rounded-xl border border-purple-200 text-sm outline-none focus:border-purple-400"
                    value={formSesion.fecha}
                    onChange={(e) => setFormSesion({ ...formSesion, fecha: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Modalidad</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {(["presencial", "videollamada"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setFormSesion({ ...formSesion, modalidad: m })}
                        className={`py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                          formSesion.modalidad === m
                            ? "bg-purple-600 text-white border-purple-600"
                            : "bg-white text-purple-700 border-purple-200"
                        }`}
                      >
                        {m === "presencial" ? "Presencial" : "Videollamada"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Notas (opcional)</label>
                  <textarea
                    className="w-full mt-1 px-3 py-2.5 rounded-xl border border-purple-200 text-sm outline-none focus:border-purple-400 resize-none"
                    rows={2}
                    value={formSesion.notas}
                    onChange={(e) => setFormSesion({ ...formSesion, notas: e.target.value })}
                  />
                </div>
                <button
                  onClick={agendarSesion}
                  disabled={guardandoSesion || !formSesion.familiaId || !formSesion.psicologoNombre || !formSesion.fecha}
                  className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold text-sm disabled:opacity-60"
                >
                  {guardandoSesion ? "Agendando…" : "Confirmar sesión"}
                </button>
              </div>
            )}

            {sesiones.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <Brain size={32} className="text-purple-200 mx-auto mb-2" />
                <p className="text-purple-400 text-sm">No hay sesiones programadas</p>
              </div>
            ) : (
              sesiones.map((sesion) => (
                <div key={sesion.id} className="bg-white rounded-2xl p-4 shadow-sm border border-purple-100">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="font-bold text-orange-900 text-sm">{sesion.nombreCuidador}</p>
                      <p className="text-xs text-purple-600 font-medium">Con {sesion.psicologoNombre}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${
                      sesion.modalidad === "presencial"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}>
                      {sesion.modalidad === "presencial" ? "Presencial" : "Video"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-orange-400">
                    <Calendar size={12} />
                    {formatFecha(sesion.fecha)}
                    <span>·</span>
                    <span>{sesion.duracionMin} min</span>
                  </div>
                  {sesion.notas && (
                    <p className="text-xs text-gray-500 mt-2 bg-gray-50 rounded-lg px-2 py-1.5">{sesion.notas}</p>
                  )}
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
