"use client";
// Vista del menú del día — responsive: 1 col mobile / 2 cols desktop
import { useAuth } from "@/hooks/useAuth";
import { useMenu } from "@/hooks/useMenu";
import { TarjetaComida } from "@/components/menu/TarjetaComida";
import { Toast, useToast } from "@/components/ui/Toast";
import { SkeletonTarjetaComida } from "@/components/ui/Skeleton";
import { UtensilsCrossed, Clock, MapPin } from "lucide-react";

export default function MenuPage() {
  const { familia } = useAuth();
  const { menuHoy, cargando, marcarDisponible } = useMenu(familia?.casaRonald);
  const { toast, mostrar, cerrar } = useToast();

  const esCoordinador = familia?.rol === "coordinador";

  const handleMarcarDisponible = async (tipo: "desayuno" | "comida" | "cena") => {
    try {
      await marcarDisponible(tipo);
      mostrar("Familias notificadas correctamente");
    } catch {
      mostrar("Error al marcar disponible", "error");
    }
  };

  return (
    <>
      {/* ── Banner ───────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden w-full"
        style={{ background: "linear-gradient(135deg, #C85A2A 0%, #E87A3A 70%, #F5C842 100%)" }}
      >
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-15"
          style={{ background: "#7A3D1A" }} />
        <div className="max-w-6xl mx-auto px-5 py-8 md:px-10 md:py-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Menú del día</h1>
              <p className="text-white/70 text-sm mt-1">
                Desayuno, comida y cena incluidos
              </p>
            </div>
            {esCoordinador && (
              <button
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 active:bg-white/40 text-white rounded-2xl px-4 py-3 font-semibold text-sm transition-colors shadow-sm min-h-[48px]"
                aria-label="Publicar menú"
              >
                <UtensilsCrossed size={18} />
                <span className="hidden sm:inline">Publicar menú</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Contenido ────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-4 md:px-10 md:pt-8 md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:gap-8">

        {/* Columna principal — tarjetas de comidas */}
        <div className="space-y-4">
          {cargando ? (
            <>
              <SkeletonTarjetaComida />
              <SkeletonTarjetaComida />
              <SkeletonTarjetaComida />
            </>
          ) : !menuHoy ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <UtensilsCrossed size={40} className="mx-auto mb-3 opacity-25" style={{ color: "#C85A2A" }} />
              <p className="font-semibold text-gray-600">No hay menú publicado hoy</p>
              <p className="text-gray-400 text-sm mt-1">
                {esCoordinador
                  ? "Publica el menú del día para que las familias sepan qué hay de comer"
                  : "El coordinador publicará el menú pronto"}
              </p>
            </div>
          ) : (
            <>
              <TarjetaComida
                tipo="desayuno"
                comida={menuHoy.comidas.desayuno}
                esCoordinador={esCoordinador}
                onMarcarDisponible={() => handleMarcarDisponible("desayuno")}
              />
              <TarjetaComida
                tipo="comida"
                comida={menuHoy.comidas.comida}
                esCoordinador={esCoordinador}
                onMarcarDisponible={() => handleMarcarDisponible("comida")}
              />
              <TarjetaComida
                tipo="cena"
                comida={menuHoy.comidas.cena}
                esCoordinador={esCoordinador}
                onMarcarDisponible={() => handleMarcarDisponible("cena")}
              />
            </>
          )}
        </div>

        {/* Columna lateral (desktop): Info adicional */}
        <div className="hidden md:block space-y-4">
          {/* Badge GRATUITO destacado */}
          <div className="rounded-2xl p-5 text-center" style={{ background: "#FFF8E6" }}>
            <p className="text-2xl font-bold mb-2" style={{ color: "#7A3D1A" }}>
              GRATUITO ❤️
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "#9A6A2A" }}>
              Todas las comidas están incluidas en tu estancia. No necesitas pagar nada.
            </p>
          </div>

          {/* Horarios del comedor */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "#9A6A2A" }}>
              Horarios del comedor
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Clock size={16} style={{ color: "#C85A2A" }} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-700">Desayuno</p>
                  <p className="text-xs text-gray-500">7:30 - 9:00 AM</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={16} style={{ color: "#C85A2A" }} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-700">Comida</p>
                  <p className="text-xs text-gray-500">1:00 - 3:00 PM</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={16} style={{ color: "#C85A2A" }} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-700">Cena</p>
                  <p className="text-xs text-gray-500">7:00 - 9:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ubicación del comedor */}
          <div className="rounded-2xl p-4" style={{ background: "#FDF0E6" }}>
            <div className="flex items-start gap-2 mb-2">
              <MapPin size={14} style={{ color: "#C85A2A" }} className="mt-0.5" />
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "#9A6A2A" }}>
                Ubicación
              </p>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "#7A3D1A" }}>
              El comedor está en la planta baja de la Casa Ronald, junto a la sala común.
            </p>
          </div>
        </div>
      </div>

      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrar} />}
    </>
  );
}
