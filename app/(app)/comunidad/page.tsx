"use client";
// Módulo de comunidad — vista principal con accesos a grupos, chat y psicólogos
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useGruposComunidad, usePsicologos, useSesionesPsicologo } from "@/hooks/useChatComunidad";
import { Skeleton } from "@/components/ui/Skeleton";
import { Users, HeartHandshake, CalendarDays, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

function SkeletonTarjeta() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-9 w-full rounded-xl" />
    </div>
  );
}

export default function ComunidadPage() {
  const router = useRouter();
  const { familia } = useAuth();
  const { grupos, cargando: cargandoGrupos } = useGruposComunidad(familia?.casaRonald, familia?.id);
  const { psicologos, cargando: cargandoPsi } = usePsicologos(familia?.casaRonald);
  const { sesiones } = useSesionesPsicologo(familia?.id);

  const misGrupos = grupos.filter((g) => familia?.id && g.miembros.includes(familia.id));
  const proximaSesion = sesiones.find((s) => s.estado === "confirmada" || s.estado === "pendiente");

  return (
    <div className="min-h-screen" style={{ background: "#F7EDD5" }}>
      {/* Encabezado */}
      <div className="px-5 pt-8 pb-4">
        <h1 className="text-2xl font-bold" style={{ color: "#7A3D1A" }}>
          Comunidad
        </h1>
        <p className="text-sm mt-1" style={{ color: "#A89080" }}>
          No estás sola/o en este camino
        </p>
      </div>

      <div className="px-4 space-y-5 pb-8">
        {/* ── Tarjeta: grupos de apoyo ─────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-base" style={{ color: "#7A3D1A" }}>
              Grupos de apoyo
            </h2>
            <button
              onClick={() => router.push("/comunidad/grupos")}
              className="text-xs font-medium flex items-center gap-0.5"
              style={{ color: "#C85A2A" }}
            >
              Ver todos <ChevronRight size={14} />
            </button>
          </div>

          {cargandoGrupos ? (
            <div className="space-y-3">
              <SkeletonTarjeta />
              <SkeletonTarjeta />
            </div>
          ) : grupos.length === 0 ? (
            <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
              <Users size={28} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-500">Aún no hay grupos disponibles en tu casa</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Mis grupos primero */}
              {misGrupos.slice(0, 2).map((grupo) => (
                <button
                  key={grupo.id}
                  onClick={() => router.push(`/comunidad/chat?grupoId=${grupo.id}&nombre=${encodeURIComponent(grupo.nombre)}`)}
                  className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between text-left ring-2 ring-orange-400"
                >
                  <div>
                    <p className="font-semibold text-sm text-gray-800">{grupo.nombre}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#A89080" }}>
                      {grupo.miembros.length} {grupo.miembros.length === 1 ? "familia" : "familias"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1" style={{ color: "#C85A2A" }}>
                    <span className="text-xs font-medium">Chat</span>
                    <ChevronRight size={15} />
                  </div>
                </button>
              ))}

              {/* Grupos disponibles para unirse */}
              {grupos.filter((g) => !familia?.id || !g.miembros.includes(familia.id)).slice(0, 2).map((grupo) => (
                <button
                  key={grupo.id}
                  onClick={() => router.push("/comunidad/grupos")}
                  className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between text-left"
                >
                  <div>
                    <p className="font-semibold text-sm text-gray-800">{grupo.nombre}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#A89080" }}>
                      {grupo.miembros.length} {grupo.miembros.length === 1 ? "familia" : "familias"}
                    </p>
                  </div>
                  <span
                    className="text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ background: "#FDF0E6", color: "#C85A2A" }}
                  >
                    Unirme
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ── Tarjeta: próxima sesión con psicólogo ─── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-base" style={{ color: "#7A3D1A" }}>
              Apoyo psicológico
            </h2>
          </div>

          {proximaSesion ? (
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "#FDF0E6" }}
                >
                  <HeartHandshake size={20} style={{ color: "#C85A2A" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-800 truncate">
                    {proximaSesion.nombrePsicologo}
                  </p>
                  <p className="text-xs" style={{ color: "#A89080" }}>
                    {proximaSesion.especialidad}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold" style={{ color: "#C85A2A" }}>
                    {format(proximaSesion.fecha.toDate(), "d MMM", { locale: es })}
                  </p>
                  <p className="text-xs" style={{ color: "#A89080" }}>
                    {format(proximaSesion.fecha.toDate(), "HH:mm", { locale: es })}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => router.push("/comunidad/grupos?tab=psicologos")}
              className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 text-left"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "#FDF0E6" }}
              >
                <HeartHandshake size={20} style={{ color: "#C85A2A" }} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-gray-800">Hablar con un psicólogo</p>
                {cargandoPsi ? (
                  <Skeleton className="h-3 w-32 mt-1" />
                ) : (
                  <p className="text-xs mt-0.5" style={{ color: "#A89080" }}>
                    {psicologos.length} disponible{psicologos.length !== 1 ? "s" : ""} ahora
                  </p>
                )}
              </div>
              <ChevronRight size={16} style={{ color: "#C85A2A" }} />
            </button>
          )}
        </section>

        {/* ── Banner de privacidad ─────────────────────── */}
        <div
          className="rounded-2xl px-4 py-3 text-xs leading-relaxed"
          style={{ background: "#FDF0E6", color: "#7A3D1A" }}
        >
          <span className="font-semibold">Espacio seguro.</span> Los chats son solo para familias de
          tu Casa Ronald. Usa solo tu nombre de pila. Nunca compartas información médica de tu hijo/a.
        </div>
      </div>
    </div>
  );
}
