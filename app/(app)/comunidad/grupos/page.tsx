"use client";
// Lista de grupos de apoyo y directorio de psicólogos
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useGruposComunidad, usePsicologos } from "@/hooks/useChatComunidad";
import { TarjetaGrupo } from "@/components/comunidad/TarjetaGrupo";
import { Toast, useToast } from "@/components/ui/Toast";
import { Skeleton } from "@/components/ui/Skeleton";
import { ArrowLeft, HeartHandshake, CalendarDays, Users } from "lucide-react";
import { TipoGrupo } from "@/lib/types";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const FILTROS: { value: TipoGrupo | "todos"; label: string }[] = [
  { value: "todos",       label: "Todos" },
  { value: "general",     label: "General" },
  { value: "oncologia",   label: "Oncología" },
  { value: "cardiologia", label: "Cardiología" },
  { value: "neurologia",  label: "Neurología" },
  { value: "otro",        label: "Otro" },
];

function SkeletonTarjeta() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 flex-1 rounded-xl" />
      </div>
    </div>
  );
}

export default function GruposPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabInicial = searchParams.get("tab") === "psicologos" ? "psicologos" : "grupos";

  const { familia } = useAuth();
  const { grupos, cargando: cargandoGrupos, unirse, salir, esMiembro } = useGruposComunidad(
    familia?.casaRonald,
    familia?.id
  );
  const { psicologos, cargando: cargandoPsi } = usePsicologos(familia?.casaRonald);
  const { toast, mostrar, cerrar } = useToast();

  const [tab, setTab] = useState<"grupos" | "psicologos">(tabInicial);
  const [filtro, setFiltro] = useState<TipoGrupo | "todos">("todos");
  const [accionando, setAccionando] = useState<string | null>(null);
  const [solicitando, setSolicitando] = useState<string | null>(null);

  const gruposFiltrados =
    filtro === "todos" ? grupos : grupos.filter((g) => g.tipo === filtro);

  const handleUnirse = async (grupoId: string) => {
    setAccionando(grupoId);
    try {
      await unirse(grupoId);
      mostrar("Te has unido al grupo", "exito");
    } catch {
      mostrar("No se pudo unir al grupo", "error");
    } finally {
      setAccionando(null);
    }
  };

  const handleSalir = async (grupoId: string) => {
    setAccionando(grupoId);
    try {
      await salir(grupoId);
      mostrar("Saliste del grupo", "exito");
    } catch {
      mostrar("No se pudo salir del grupo", "error");
    } finally {
      setAccionando(null);
    }
  };

  const handleSolicitarSesion = async (psicologoId: string, nombrePsicologo: string, especialidad: string) => {
    if (!familia) return;
    setSolicitando(psicologoId);
    try {
      // Fecha tentativa: mañana a las 10:00
      const fecha = new Date();
      fecha.setDate(fecha.getDate() + 1);
      fecha.setHours(10, 0, 0, 0);

      await addDoc(collection(db, "sesionesPsicologos"), {
        familiaId: familia.id,
        psicologoId,
        nombrePsicologo,
        especialidad,
        fecha: Timestamp.fromDate(fecha),
        estado: "pendiente",
        creadaEn: Timestamp.now(),
      });
      mostrar("Solicitud enviada, te confirmarán la cita pronto", "exito");
    } catch {
      mostrar("No se pudo enviar la solicitud", "error");
    } finally {
      setSolicitando(null);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#F7EDD5" }}>
      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrar} />}

      {/* Encabezado */}
      <div className="flex items-center gap-3 px-5 pt-8 pb-4">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-xl"
          style={{ background: "#FDF0E6" }}
        >
          <ArrowLeft size={18} style={{ color: "#C85A2A" }} />
        </button>
        <h1 className="text-xl font-bold" style={{ color: "#7A3D1A" }}>
          Comunidad
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-4 mb-4">
        {(["grupos", "psicologos"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={
              tab === t
                ? { background: "#C85A2A", color: "#FFFFFF" }
                : { background: "#FFFFFF", color: "#A89080" }
            }
          >
            {t === "grupos" ? "Grupos" : "Psicólogos"}
          </button>
        ))}
      </div>

      {/* ── TAB GRUPOS ───────────────────────────────── */}
      {tab === "grupos" && (
        <div className="px-4 pb-8">
          {/* Filtros por tipo */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
            {FILTROS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFiltro(value)}
                className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={
                  filtro === value
                    ? { background: "#7A3D1A", color: "#FFFFFF" }
                    : { background: "#FFFFFF", color: "#A89080" }
                }
              >
                {label}
              </button>
            ))}
          </div>

          {cargandoGrupos ? (
            <div className="space-y-4">
              <SkeletonTarjeta />
              <SkeletonTarjeta />
              <SkeletonTarjeta />
            </div>
          ) : gruposFiltrados.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <Users size={32} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-500">No hay grupos con este filtro</p>
            </div>
          ) : (
            <div className="space-y-4">
              {gruposFiltrados.map((grupo) => (
                <TarjetaGrupo
                  key={grupo.id}
                  grupo={grupo}
                  esMiembro={esMiembro(grupo.id)}
                  onUnirse={() => handleUnirse(grupo.id)}
                  onSalir={() => handleSalir(grupo.id)}
                  onAbrir={() =>
                    router.push(
                      `/comunidad/chat?grupoId=${grupo.id}&nombre=${encodeURIComponent(grupo.nombre)}`
                    )
                  }
                  cargando={accionando === grupo.id}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB PSICÓLOGOS ───────────────────────────── */}
      {tab === "psicologos" && (
        <div className="px-4 pb-8 space-y-4">
          {cargandoPsi ? (
            <>
              <SkeletonTarjeta />
              <SkeletonTarjeta />
            </>
          ) : psicologos.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <HeartHandshake size={32} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-500">Sin psicólogos disponibles en este momento</p>
            </div>
          ) : (
            psicologos.map((psi) => (
              <div key={psi.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-start gap-3 mb-3">
                  {/* Avatar o ícono */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-xl font-bold"
                    style={{ background: "#FDF0E6", color: "#C85A2A" }}
                  >
                    {psi.nombre.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 truncate">{psi.nombre}</h3>
                    <p className="text-xs font-medium" style={{ color: "#C85A2A" }}>
                      {psi.especialidad}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{psi.descripcion}</p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    handleSolicitarSesion(psi.id, psi.nombre, psi.especialidad)
                  }
                  disabled={solicitando === psi.id}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
                  style={{ background: "#C85A2A", color: "#FFFFFF" }}
                >
                  <CalendarDays size={15} />
                  {solicitando === psi.id ? "Enviando..." : "Solicitar sesión"}
                </button>
              </div>
            ))
          )}

          <p className="text-center text-xs px-4" style={{ color: "#A89080" }}>
            El coordinador de tu casa confirmará la cita y te notificará.
          </p>
        </div>
      )}
    </div>
  );
}
