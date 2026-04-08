"use client";
// Gestión de usuarios y roles — CRUD completo para coordinadores
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Familia } from "@/lib/types";
import { Toast, useToast } from "@/components/ui/Toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Users, Search, Shield, User, ToggleLeft, ToggleRight,
  ChevronDown, AlertCircle, Plus, X, Pencil, Trash2,
  Phone, Building2, BedDouble, Baby,
} from "lucide-react";

type FiltroRol = "todos" | "coordinador" | "cuidador";

// ── Formulario crear / editar usuario ─────────────────────────────────────────
function FormUsuario({
  inicial,
  casaRonald,
  onGuardar,
  onCerrar,
}: {
  inicial?: Familia;
  casaRonald: string;
  onGuardar: () => void;
  onCerrar: () => void;
}) {
  const hoy = format(new Date(), "yyyy-MM-dd");
  const [form, setForm] = useState({
    nombreCuidador: inicial?.nombreCuidador ?? "",
    telefono:       inicial?.telefono       ?? "",
    email:          inicial?.email          ?? "",
    parentesco:     inicial?.parentesco     ?? "",
    nombreNino:     inicial?.nombreNino     ?? "",
    edadNino:       String(inicial?.edadNino ?? ""),
    hospital:       inicial?.hospital       ?? "",
    habitacion:     inicial?.habitacion     ?? "",
    fechaIngreso:   inicial?.fechaIngreso
      ? format(inicial.fechaIngreso.toDate(), "yyyy-MM-dd")
      : hoy,
    fechaSalidaPlanificada: inicial?.fechaSalidaPlanificada
      ? format(inicial.fechaSalidaPlanificada.toDate(), "yyyy-MM-dd")
      : "",
    rol: inicial?.rol ?? "cuidador" as "cuidador" | "coordinador",
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const upd = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const valido = form.nombreCuidador.trim() && form.telefono.trim() && form.nombreNino.trim() && form.hospital.trim();

  const handleSubmit = async () => {
    if (!valido) return;
    setGuardando(true);
    setError("");
    try {
      if (inicial) {
        // Editar
        const body: Record<string, unknown> = {
          familiaId:      inicial.id,
          nombreCuidador: form.nombreCuidador,
          telefono:       form.telefono,
          email:          form.email,
          parentesco:     form.parentesco,
          nombreNino:     form.nombreNino,
          edadNino:       form.edadNino ? parseInt(form.edadNino) : null,
          hospital:       form.hospital,
          habitacion:     form.habitacion,
          fechaIngreso:   new Date(form.fechaInicio ?? form.fechaIngreso).toISOString(),
          fechaSalidaPlanificada: form.fechaSalidaPlanificada
            ? new Date(form.fechaSalidaPlanificada).toISOString()
            : null,
        };
        const res = await fetch("/api/familias/actualizar", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error ?? "Error");
        // Cambiar rol si cambió
        if (form.rol !== inicial.rol) {
          const resRol = await fetch("/api/usuarios/cambiar-rol", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ familiaId: inicial.id, nuevoRol: form.rol, solicitanteId: inicial.id }),
          });
          if (!resRol.ok) throw new Error("Error al cambiar rol");
        }
      } else {
        // Crear
        const body = {
          nombreCuidador: form.nombreCuidador,
          telefono:       form.telefono,
          email:          form.email,
          parentesco:     form.parentesco,
          nombreNino:     form.nombreNino,
          edadNino:       form.edadNino ? parseInt(form.edadNino) : undefined,
          hospital:       form.hospital,
          casaRonald,
          habitacion:     form.habitacion,
          fechaIngreso:   new Date(form.fechaIngreso).toISOString(),
          fechaSalidaPlanificada: form.fechaSalidaPlanificada
            ? new Date(form.fechaSalidaPlanificada).toISOString()
            : undefined,
        };
        const res = await fetch("/api/familias/registrar-coordinador", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error ?? "Error");
      }
      onGuardar();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setGuardando(false);
    }
  };

  const inp = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 min-h-11" />
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <h3 className="font-bold text-gray-800">{inicial ? "Editar usuario" : "Nuevo usuario"}</h3>
          <button onClick={onCerrar} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} className="text-gray-500" /></button>
        </div>
        <div className="overflow-y-auto flex-1 p-5 space-y-4">

          {/* Sección: Cuidador */}
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Cuidador</p>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Nombre completo *</label>
            {inp({ placeholder: "Nombre del cuidador", value: form.nombreCuidador, onChange: (e) => upd("nombreCuidador", e.target.value) })}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Teléfono *</label>
              {inp({ type: "tel", placeholder: "+52 55 …", value: form.telefono, onChange: (e) => upd("telefono", e.target.value) })}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Parentesco</label>
              {inp({ placeholder: "Mamá, Papá…", value: form.parentesco, onChange: (e) => upd("parentesco", e.target.value) })}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
            {inp({ type: "email", placeholder: "correo@ejemplo.com", value: form.email, onChange: (e) => upd("email", e.target.value) })}
          </div>

          {/* Sección: Niño */}
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 pt-2">Niño hospitalizado</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Nombre del niño *</label>
              {inp({ placeholder: "Nombre", value: form.nombreNino, onChange: (e) => upd("nombreNino", e.target.value) })}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Edad</label>
              {inp({ type: "number", min: 0, max: 18, placeholder: "0–18", value: form.edadNino, onChange: (e) => upd("edadNino", e.target.value) })}
            </div>
          </div>

          {/* Sección: Estancia */}
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 pt-2">Estancia</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Hospital *</label>
              {inp({ placeholder: "Hospital Infantil…", value: form.hospital, onChange: (e) => upd("hospital", e.target.value) })}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Habitación</label>
              {inp({ placeholder: "101-A", value: form.habitacion, onChange: (e) => upd("habitacion", e.target.value) })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Fecha ingreso</label>
              {inp({ type: "date", value: form.fechaIngreso, onChange: (e) => upd("fechaIngreso", e.target.value) })}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Fecha salida estimada</label>
              {inp({ type: "date", value: form.fechaSalidaPlanificada, onChange: (e) => upd("fechaSalidaPlanificada", e.target.value) })}
            </div>
          </div>

          {/* Rol */}
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 pt-2">Rol</p>
          <div className="flex gap-2">
            {(["cuidador", "coordinador"] as const).map((r) => (
              <button key={r} type="button"
                onClick={() => upd("rol", r)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border transition-colors"
                style={form.rol === r
                  ? { background: "#C85A2A", color: "#fff", borderColor: "#C85A2A" }
                  : { background: "#fff", color: "#374151", borderColor: "#E5E7EB" }}>
                {r === "coordinador" ? <Shield size={14} /> : <User size={14} />}
                {r === "coordinador" ? "Coordinador" : "Cuidador"}
              </button>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">
              <AlertCircle size={14} />{error}
            </div>
          )}

          <button onClick={handleSubmit} disabled={!valido || guardando}
            className="w-full py-3.5 rounded-2xl text-sm font-bold text-white disabled:opacity-50"
            style={{ background: "#C85A2A" }}>
            {guardando ? "Guardando…" : inicial ? "Guardar cambios" : "Crear usuario"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Tarjeta de usuario ────────────────────────────────────────────────────────
function TarjetaUsuario({
  usuario,
  esSolicitante,
  onEditar,
  onCambiarRol,
  onToggleActivo,
  onEliminar,
  accionCargando,
}: {
  usuario: Familia;
  esSolicitante: boolean;
  onEditar: () => void;
  onCambiarRol: (id: string, nuevoRol: "coordinador" | "cuidador") => void;
  onToggleActivo: (id: string, activa: boolean) => void;
  onEliminar: (id: string) => void;
  accionCargando: boolean;
}) {
  const [expandido, setExpandido] = useState(false);
  const [confirmEliminar, setConfirmEliminar] = useState(false);
  const esCoordinador = usuario.rol === "coordinador";
  const activa = usuario.activa !== false;

  return (
    <div className={`bg-white rounded-2xl shadow-sm overflow-hidden border ${!activa ? "border-red-100" : "border-gray-100"}`}>
      {/* Encabezado */}
      <div className="flex items-center gap-3 p-4">
        <button className="flex items-center gap-3 flex-1 min-w-0 text-left" onClick={() => setExpandido(!expandido)}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-sm"
            style={{ background: esCoordinador ? "#C85A2A" : "#6B7280" }}>
            {usuario.nombreCuidador.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-gray-800 truncate">{usuario.nombreCuidador}</p>
              {esSolicitante && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Tú</span>
              )}
              {!activa && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">Inactivo</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-lg"
                style={{ background: esCoordinador ? "#FDF0E6" : "#F3F4F6", color: esCoordinador ? "#C85A2A" : "#6B7280" }}>
                {esCoordinador ? "Coordinador" : "Cuidador"}
              </span>
              {usuario.telefono && <span className="text-xs text-gray-400">{usuario.telefono}</span>}
            </div>
          </div>
          <ChevronDown size={16} className="shrink-0 text-gray-400 transition-transform"
            style={{ transform: expandido ? "rotate(180deg)" : "rotate(0deg)" }} />
        </button>

        {/* Acciones rápidas */}
        <div className="flex items-center gap-1 shrink-0 ml-1">
          <button onClick={onEditar} className="p-2 rounded-lg hover:bg-blue-50 text-blue-400">
            <Pencil size={14} />
          </button>
          {!esSolicitante && (
            <button onClick={() => setConfirmEliminar(true)} className="p-2 rounded-lg hover:bg-red-50 text-red-400">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Detalle expandido */}
      {expandido && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {/* Info */}
          <div className="grid grid-cols-2 gap-2 mt-3 mb-4">
            {usuario.nombreNino && (
              <div className="flex items-center gap-1.5">
                <Baby size={12} className="text-orange-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400">Niño</p>
                  <p className="text-xs font-medium text-gray-700">{usuario.nombreNino}{usuario.edadNino != null ? `, ${usuario.edadNino} años` : ""}</p>
                </div>
              </div>
            )}
            {usuario.hospital && (
              <div className="flex items-center gap-1.5">
                <Building2 size={12} className="text-orange-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400">Hospital</p>
                  <p className="text-xs font-medium text-gray-700 truncate">{usuario.hospital}</p>
                </div>
              </div>
            )}
            {usuario.habitacion && (
              <div className="flex items-center gap-1.5">
                <BedDouble size={12} className="text-orange-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400">Habitación</p>
                  <p className="text-xs font-medium text-gray-700">{usuario.habitacion}</p>
                </div>
              </div>
            )}
            {usuario.telefono && (
              <div className="flex items-center gap-1.5">
                <Phone size={12} className="text-orange-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400">Teléfono</p>
                  <p className="text-xs font-medium text-gray-700">{usuario.telefono}</p>
                </div>
              </div>
            )}
            {usuario.fechaIngreso && (
              <div>
                <p className="text-[10px] text-gray-400">Ingreso</p>
                <p className="text-xs font-medium text-gray-700">
                  {format(usuario.fechaIngreso.toDate(), "d MMM yyyy", { locale: es })}
                </p>
              </div>
            )}
            {usuario.fechaSalidaPlanificada && (
              <div>
                <p className="text-[10px] text-gray-400">Salida estimada</p>
                <p className="text-xs font-medium text-gray-700">
                  {format(usuario.fechaSalidaPlanificada.toDate(), "d MMM yyyy", { locale: es })}
                </p>
              </div>
            )}
          </div>

          {/* Acciones */}
          {!esSolicitante && (
            <div className="flex flex-col gap-2">
              <button
                disabled={accionCargando}
                onClick={() => onCambiarRol(usuario.id, esCoordinador ? "cuidador" : "coordinador")}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-40"
                style={{ background: esCoordinador ? "#F3F4F6" : "#FDF0E6", color: esCoordinador ? "#374151" : "#C85A2A" }}>
                {esCoordinador ? <User size={14} /> : <Shield size={14} />}
                {esCoordinador ? "Quitar rol de coordinador" : "Promover a coordinador"}
              </button>
              <button
                disabled={accionCargando}
                onClick={() => onToggleActivo(usuario.id, !activa)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-40"
                style={{ background: activa ? "#FEF3C7" : "#D1FAE5", color: activa ? "#B45309" : "#065F46" }}>
                {activa ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
                {activa ? "Suspender acceso" : "Reactivar acceso"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Confirmación eliminar */}
      {confirmEliminar && (
        <div className="mx-4 mb-4 rounded-xl bg-red-50 border border-red-200 p-3">
          <p className="text-xs font-bold text-red-700 mb-1">¿Eliminar permanentemente a {usuario.nombreCuidador}?</p>
          <p className="text-[10px] text-red-500 mb-3">Esta acción no se puede deshacer. Se eliminarán todos sus datos.</p>
          <div className="flex gap-2">
            <button onClick={() => { onEliminar(usuario.id); setConfirmEliminar(false); }}
              className="flex-1 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold">
              Eliminar
            </button>
            <button onClick={() => setConfirmEliminar(false)}
              className="flex-1 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function UsuariosPage() {
  const router = useRouter();
  const { familia: solicitante, cargando: authCargando } = useAuth();
  const { toast, mostrar: showToast, cerrar: cerrarToast } = useToast();

  const [usuarios, setUsuarios]           = useState<Familia[]>([]);
  const [cargando, setCargando]           = useState(true);
  const [accionCargando, setAccionCargando] = useState(false);
  const [busqueda, setBusqueda]           = useState("");
  const [filtroRol, setFiltroRol]         = useState<FiltroRol>("todos");
  const [formUsuario, setFormUsuario]     = useState<{ abierto: boolean; editar?: Familia }>({ abierto: false });

  useEffect(() => {
    if (!authCargando && (!solicitante || solicitante.rol !== "coordinador")) {
      router.replace("/dashboard");
    }
  }, [solicitante, authCargando, router]);

  useEffect(() => {
    if (!solicitante || solicitante.rol !== "coordinador") return;
    const unsub = onSnapshot(
      collection(db, "familias"),
      (snap) => {
        setUsuarios(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Familia));
        setCargando(false);
      }
    );
    return unsub;
  }, [solicitante]);

  const accion = async (fn: () => Promise<void>, ok: string) => {
    setAccionCargando(true);
    try {
      await fn();
      showToast(ok, "exito");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Error", "error");
    } finally {
      setAccionCargando(false);
    }
  };

  const cambiarRol = (familiaId: string, nuevoRol: "coordinador" | "cuidador") =>
    accion(async () => {
      const res = await fetch("/api/usuarios/cambiar-rol", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ familiaId, nuevoRol, solicitanteId: solicitante?.id }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Error");
    }, nuevoRol === "coordinador" ? "Promovido a coordinador" : "Rol cambiado a cuidador");

  const toggleActivo = (familiaId: string, activa: boolean) =>
    accion(async () => {
      const res = await fetch("/api/usuarios/activar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ familiaId, activa, solicitanteId: solicitante?.id }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Error");
    }, activa ? "Cuenta activada" : "Cuenta suspendida");

  const eliminar = (familiaId: string) =>
    accion(async () => {
      const res = await fetch("/api/familias/eliminar", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ familiaId }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Error");
    }, "Usuario eliminado");

  const usuariosFiltrados = useMemo(() => {
    return usuarios
      .filter((u) => {
        const coincideBusqueda =
          !busqueda ||
          u.nombreCuidador.toLowerCase().includes(busqueda.toLowerCase()) ||
          (u.telefono ?? "").includes(busqueda) ||
          (u.nombreNino ?? "").toLowerCase().includes(busqueda.toLowerCase());
        const coincideRol = filtroRol === "todos" || u.rol === filtroRol;
        return coincideBusqueda && coincideRol;
      })
      .sort((a, b) => a.nombreCuidador.localeCompare(b.nombreCuidador));
  }, [usuarios, busqueda, filtroRol]);

  const totalCoordinadores = usuarios.filter((u) => u.rol === "coordinador").length;
  const totalCuidadores    = usuarios.filter((u) => u.rol === "cuidador").length;
  const totalInactivos     = usuarios.filter((u) => u.activa === false).length;

  if (authCargando || cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "#C85A2A", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <>
      {/* ── Banner ───────────────────────────────────────────── */}
      <div className="relative overflow-hidden w-full"
        style={{ background: "linear-gradient(135deg, #C85A2A 0%, #E87A3A 70%, #F5C842 100%)" }}>
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-15" style={{ background: "#7A3D1A" }} />
        <div className="max-w-4xl mx-auto px-5 py-8 md:px-10">
          <button onClick={() => router.back()}
            className="text-white/70 text-sm mb-3 flex items-center gap-1 hover:text-white transition-colors">
            ← Panel coordinador
          </button>
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
              <Users size={26} /> Usuarios y roles
            </h1>
            <button onClick={() => setFormUsuario({ abierto: true })}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white rounded-2xl px-4 py-3 font-semibold text-sm min-h-12 transition-colors shrink-0">
              <Plus size={18} /> Nuevo usuario
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-6 pb-10 md:px-10">

        {/* ── Métricas ─────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }} className="mb-6">
          {[
            { label: "Coordinadores", value: totalCoordinadores, color: "#C85A2A", bg: "#FDF0E6" },
            { label: "Cuidadores",    value: totalCuidadores,    color: "#374151", bg: "#F3F4F6" },
            { label: "Inactivos",     value: totalInactivos,     color: "#991B1B", bg: "#FEE2E2" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl shadow-sm p-4 text-center">
              <p className="text-2xl font-bold" style={{ color }}>{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Aviso ────────────────────────────────────────── */}
        <div className="flex items-start gap-3 rounded-2xl p-4 mb-5" style={{ background: "#FEF3C7" }}>
          <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed">
            Los cambios de rol son inmediatos. Suspender una cuenta impide el acceso pero conserva los datos.
            Eliminar un usuario es permanente e irreversible.
          </p>
        </div>

        {/* ── Búsqueda y filtros ────────────────────────────── */}
        <div className="flex gap-3 mb-5 flex-wrap">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Buscar por nombre, teléfono o niño…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border border-gray-200 bg-white focus:outline-none focus:border-orange-400"
            />
          </div>
          <div className="flex gap-1 bg-white rounded-xl p-1 border border-gray-200">
            {(["todos", "coordinador", "cuidador"] as FiltroRol[]).map((r) => (
              <button key={r} onClick={() => setFiltroRol(r)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                style={filtroRol === r
                  ? { background: "#FDF0E6", color: "#C85A2A" }
                  : { color: "#9CA3AF" }}>
                {r === "todos" ? "Todos" : r === "coordinador" ? "Coordinadores" : "Cuidadores"}
              </button>
            ))}
          </div>
        </div>

        {/* ── Lista ────────────────────────────────────────── */}
        {usuariosFiltrados.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
            <Users size={40} className="mx-auto mb-3 text-gray-200" />
            <p className="text-sm text-gray-400 mb-4">
              {usuarios.length === 0 ? "No hay usuarios registrados" : "Sin resultados"}
            </p>
            {usuarios.length === 0 && (
              <button onClick={() => setFormUsuario({ abierto: true })}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: "#C85A2A" }}>
                + Crear primer usuario
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-3">{usuariosFiltrados.length} usuario{usuariosFiltrados.length !== 1 ? "s" : ""}</p>
            <div className="space-y-3">
              {usuariosFiltrados.map((u) => (
                <TarjetaUsuario
                  key={u.id}
                  usuario={u}
                  esSolicitante={u.id === solicitante?.id}
                  onEditar={() => setFormUsuario({ abierto: true, editar: u })}
                  onCambiarRol={cambiarRol}
                  onToggleActivo={toggleActivo}
                  onEliminar={eliminar}
                  accionCargando={accionCargando}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Modal ────────────────────────────────────────────── */}
      {formUsuario.abierto && solicitante && (
        <FormUsuario
          inicial={formUsuario.editar}
          casaRonald={solicitante.casaRonald}
          onGuardar={() => {
            showToast(formUsuario.editar ? "Usuario actualizado" : "Usuario creado", "exito");
            setFormUsuario({ abierto: false });
          }}
          onCerrar={() => setFormUsuario({ abierto: false })}
        />
      )}

      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrarToast} />}
    </>
  );
}
