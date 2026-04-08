"use client";
// Gestión de usuarios y roles — solo coordinadores
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
  ArrowLeft, ChevronDown, AlertCircle,
} from "lucide-react";

type FiltroRol = "todos" | "coordinador" | "cuidador";

// ── Tarjeta de usuario ────────────────────────────────────────────────────────
function TarjetaUsuario({
  usuario,
  esSolicitante,
  onCambiarRol,
  onToggleActivo,
  cargando,
}: {
  usuario: Familia;
  esSolicitante: boolean;
  onCambiarRol: (id: string, nuevoRol: "coordinador" | "cuidador") => void;
  onToggleActivo: (id: string, activa: boolean) => void;
  cargando: boolean;
}) {
  const [expandido, setExpandido] = useState(false);
  const esCoordinador = usuario.rol === "coordinador";
  const activa = usuario.activa !== false; // default true si no está definido

  return (
    <div
      className="bg-white rounded-2xl shadow-sm overflow-hidden transition-shadow hover:shadow-md"
    >
      {/* Encabezado */}
      <button
        className="w-full flex items-center gap-3 p-4 text-left"
        onClick={() => setExpandido(!expandido)}
      >
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-sm"
          style={{ background: esCoordinador ? "#C85A2A" : "#6B7280" }}
        >
          {usuario.nombreCuidador.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-gray-800 truncate">{usuario.nombreCuidador}</p>
            {esSolicitante && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                Tú
              </span>
            )}
            {!activa && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                Inactivo
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded-lg"
              style={{
                background: esCoordinador ? "#FDF0E6" : "#F3F4F6",
                color: esCoordinador ? "#C85A2A" : "#6B7280",
              }}
            >
              {esCoordinador ? "Coordinador" : "Cuidador"}
            </span>
            {usuario.telefono && (
              <span className="text-xs text-gray-400">{usuario.telefono}</span>
            )}
          </div>
        </div>

        <ChevronDown
          size={16}
          className="shrink-0 text-gray-400 transition-transform"
          style={{ transform: expandido ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {/* Detalle expandido */}
      {expandido && (
        <div className="px-4 pb-4 border-t" style={{ borderColor: "#F0E5D0" }}>
          {/* Info */}
          <div className="grid grid-cols-2 gap-2 mt-3 mb-4">
            {usuario.hospital && (
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Hospital</p>
                <p className="text-xs font-medium text-gray-700 truncate">{usuario.hospital}</p>
              </div>
            )}
            {usuario.tipoTratamiento && (
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Tratamiento</p>
                <p className="text-xs font-medium text-gray-700 capitalize">{usuario.tipoTratamiento}</p>
              </div>
            )}
            {usuario.casaRonald && (
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Casa Ronald</p>
                <p className="text-xs font-medium text-gray-700 truncate">{usuario.casaRonald}</p>
              </div>
            )}
            {usuario.fechaIngreso && (
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Ingreso</p>
                <p className="text-xs font-medium text-gray-700">
                  {format(usuario.fechaIngreso.toDate(), "d MMM yyyy", { locale: es })}
                </p>
              </div>
            )}
          </div>

          {/* Acciones — no disponibles para el propio usuario en ciertos casos */}
          <div className="flex flex-col gap-2">
            {/* Cambiar rol */}
            <button
              disabled={cargando || esSolicitante}
              onClick={() =>
                onCambiarRol(usuario.id, esCoordinador ? "cuidador" : "coordinador")
              }
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: esCoordinador ? "#F3F4F6" : "#FDF0E6",
                color: esCoordinador ? "#374151" : "#C85A2A",
              }}
            >
              {esCoordinador ? (
                <User size={14} />
              ) : (
                <Shield size={14} />
              )}
              {esCoordinador ? "Quitar rol de coordinador" : "Promover a coordinador"}
              {esSolicitante && (
                <span className="ml-auto text-[10px] text-gray-400">No disponible</span>
              )}
            </button>

            {/* Activar / Desactivar */}
            <button
              disabled={cargando || esSolicitante}
              onClick={() => onToggleActivo(usuario.id, !activa)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: activa ? "#FEE2E2" : "#D1FAE5",
                color: activa ? "#991B1B" : "#065F46",
              }}
            >
              {activa ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
              {activa ? "Desactivar cuenta" : "Activar cuenta"}
              {esSolicitante && (
                <span className="ml-auto text-[10px] text-gray-400">No disponible</span>
              )}
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

  const [usuarios, setUsuarios] = useState<Familia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [accionCargando, setAccionCargando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState<FiltroRol>("todos");

  // Proteger ruta
  useEffect(() => {
    if (!authCargando && (!solicitante || solicitante.rol !== "coordinador")) {
      router.replace("/dashboard");
    }
  }, [solicitante, authCargando, router]);

  // Escuchar todos los usuarios en tiempo real
  useEffect(() => {
    if (!solicitante || solicitante.rol !== "coordinador") return;

    const unsubscribe = onSnapshot(
      collection(db, "familias"),
      (snap) => {
        setUsuarios(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Familia));
        setCargando(false);
      },
      (error) => {
        console.error("Error al cargar usuarios:", error);
        setCargando(false);
      }
    );

    return unsubscribe;
  }, [solicitante]);

  const cambiarRol = async (familiaId: string, nuevoRol: "coordinador" | "cuidador") => {
    if (!solicitante) return;
    setAccionCargando(true);
    try {
      const res = await fetch("/api/usuarios/cambiar-rol", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ familiaId, nuevoRol, solicitanteId: solicitante.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error desconocido");
      showToast(
        nuevoRol === "coordinador"
          ? "Usuario promovido a coordinador"
          : "Rol cambiado a cuidador",
        "exito"
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error al cambiar rol", "error");
    } finally {
      setAccionCargando(false);
    }
  };

  const toggleActivo = async (familiaId: string, activa: boolean) => {
    if (!solicitante) return;
    setAccionCargando(true);
    try {
      const res = await fetch("/api/usuarios/activar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ familiaId, activa, solicitanteId: solicitante.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error desconocido");
      showToast(activa ? "Cuenta activada" : "Cuenta desactivada", "exito");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error al actualizar", "error");
    } finally {
      setAccionCargando(false);
    }
  };

  // Filtrado y búsqueda
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((u) => {
      const coincideBusqueda =
        !busqueda ||
        u.nombreCuidador.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.telefono?.includes(busqueda);
      const coincideRol = filtroRol === "todos" || u.rol === filtroRol;
      return coincideBusqueda && coincideRol;
    });
  }, [usuarios, busqueda, filtroRol]);

  // Métricas
  const totalCoordinadores = usuarios.filter((u) => u.rol === "coordinador").length;
  const totalCuidadores = usuarios.filter((u) => u.rol === "cuidador").length;
  const totalInactivos = usuarios.filter((u) => u.activa === false).length;

  if (authCargando || cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "#C85A2A", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  return (
    <>
      {toast && (
        <Toast
          mensaje={toast.mensaje}
          tipo={toast.tipo}
          onCerrar={cerrarToast}
        />
      )}

      {/* ── Banner ───────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden w-full"
        style={{ background: "linear-gradient(135deg, #C85A2A 0%, #E87A3A 70%, #F5C842 100%)" }}
      >
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-15"
          style={{ background: "#7A3D1A" }} />
        <div className="max-w-4xl mx-auto px-5 py-7 md:px-10">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-3 transition-colors"
          >
            <ArrowLeft size={14} /> Volver
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
              <Users size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">Usuarios y roles</h1>
              <p className="text-white/70 text-sm">{usuarios.length} usuarios registrados</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-5 pb-10 md:px-10">

        {/* ── Métricas ─────────────────────────────────────── */}
        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}
          className="mb-5"
        >
          <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: "#C85A2A" }}>{totalCoordinadores}</p>
            <p className="text-xs text-gray-500 mt-0.5">Coordinadores</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-gray-700">{totalCuidadores}</p>
            <p className="text-xs text-gray-500 mt-0.5">Cuidadores</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{totalInactivos}</p>
            <p className="text-xs text-gray-500 mt-0.5">Inactivos</p>
          </div>
        </div>

        {/* ── Aviso ────────────────────────────────────────── */}
        <div
          className="flex items-start gap-3 rounded-2xl p-4 mb-5"
          style={{ background: "#FEF3C7" }}
        >
          <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed">
            Los cambios de rol son inmediatos. Un coordinador tiene acceso completo al panel de
            administración. Desactivar una cuenta impide el acceso pero conserva los datos.
          </p>
        </div>

        {/* ── Búsqueda y filtros ────────────────────────────── */}
        <div className="flex gap-3 mb-4 flex-wrap">
          {/* Búsqueda */}
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o teléfono..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border bg-white"
              style={{ borderColor: "#F0E5D0" }}
            />
          </div>

          {/* Filtro por rol */}
          <div className="flex gap-1.5 bg-white rounded-xl p-1 border" style={{ borderColor: "#F0E5D0" }}>
            {(["todos", "coordinador", "cuidador"] as FiltroRol[]).map((r) => (
              <button
                key={r}
                onClick={() => setFiltroRol(r)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize"
                style={{
                  background: filtroRol === r ? "#FDF0E6" : "transparent",
                  color: filtroRol === r ? "#C85A2A" : "#9CA3AF",
                }}
              >
                {r === "todos" ? "Todos" : r === "coordinador" ? "Coordinadores" : "Cuidadores"}
              </button>
            ))}
          </div>
        </div>

        {/* ── Lista de usuarios ─────────────────────────────── */}
        {usuariosFiltrados.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <Users size={32} className="mx-auto mb-3 text-gray-200" />
            <p className="text-sm text-gray-400">No se encontraron usuarios</p>
          </div>
        ) : (
          <div className="space-y-3">
            {usuariosFiltrados.map((usuario) => (
              <TarjetaUsuario
                key={usuario.id}
                usuario={usuario}
                esSolicitante={usuario.id === solicitante?.id}
                onCambiarRol={cambiarRol}
                onToggleActivo={toggleActivo}
                cargando={accionCargando}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
