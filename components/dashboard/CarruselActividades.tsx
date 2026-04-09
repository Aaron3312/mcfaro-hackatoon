"use client";
import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar, Users, Clock, MapPin } from "lucide-react";
import { Actividad } from "@/lib/types";

interface CarruselActividadesProps {
  actividades: Actividad[];
  cargando?: boolean;
}

// Configuración de colores e iconos por tipo de actividad
const iconosPorTipo: Record<string, { emoji: string; color: string; bg: string }> = {
  arte: { emoji: "🎨", color: "#7C3AED", bg: "#F5F3FF" },
  deporte: { emoji: "⚽", color: "#2563EB", bg: "#EFF6FF" },
  educacion: { emoji: "📚", color: "#059669", bg: "#F0FDF4" },
  bienestar: { emoji: "🧘", color: "#C026D3", bg: "#FAE8FF" },
  recreacion: { emoji: "🎭", color: "#EA580C", bg: "#FFF7ED" },
  otro: { emoji: "✨", color: "#6B7280", bg: "#F9FAFB" },
};

export function CarruselActividades({ actividades, cargando }: CarruselActividadesProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Filtrar solo actividades futuras y programadas
  const actividadesFuturas = actividades
    .filter(a => a.estado === "programada" && a.fechaHora.toDate() > new Date())
    .sort((a, b) => a.fechaHora.toMillis() - b.fechaHora.toMillis())
    .slice(0, 5);

  // Bandera para ignorar eventos de scroll durante animaciones programáticas
  const isProgrammaticScroll = useRef(false);

  // Scroll programático al cambiar índice por botones o indicadores
  const scrollToIndex = useCallback((index: number) => {
    setCurrentIndex(index);
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const cardWidth = container.scrollWidth / actividadesFuturas.length;
    isProgrammaticScroll.current = true;
    container.scrollTo({ left: index * cardWidth, behavior: "smooth" });
    // Desbloquear después de que termine la animación de scroll
    setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 500);
  }, [actividadesFuturas.length]);

  // Sincronizar índice cuando el usuario hace swipe manualmente
  const handleScroll = useCallback(() => {
    // Ignorar eventos de scroll generados por scrollTo programático
    if (isProgrammaticScroll.current) return;
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const cardWidth = container.scrollWidth / actividadesFuturas.length;
    const idx = Math.round(container.scrollLeft / cardWidth);
    const clampedIdx = Math.max(0, Math.min(idx, actividadesFuturas.length - 1));
    setCurrentIndex(clampedIdx);
  }, [actividadesFuturas.length]);

  const handlePrevious = () => {
    const newIndex = currentIndex === 0 ? actividadesFuturas.length - 1 : currentIndex - 1;
    scrollToIndex(newIndex);
  };

  const handleNext = () => {
    const newIndex = (currentIndex + 1) % actividadesFuturas.length;
    scrollToIndex(newIndex);
  };

  // Obtener el color del tipo de la actividad actual para los indicadores
  const getColorForIndex = (idx: number): string => {
    const actividad = actividadesFuturas[idx];
    if (!actividad) return "#D1D5DB";
    const tipo = iconosPorTipo[actividad.tipo] || iconosPorTipo.otro;
    return tipo.color;
  };

  if (cargando) {
    return (
      <div className="relative">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
          <div className="h-6 w-48 bg-gray-200 rounded mb-4" />
          <div className="h-32 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (actividadesFuturas.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-ronald-orange" />
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
            Próximas Actividades
          </h3>
        </div>

        {/* Indicadores de progreso sincronizados con el color del tipo */}
        {actividadesFuturas.length > 1 && (
          <div className="flex items-center gap-1">
            {actividadesFuturas.map((actividad, idx) => {
              const tipoColor = (iconosPorTipo[actividad.tipo] || iconosPorTipo.otro).color;
              const isActive = idx === currentIndex;

              return (
                <button
                  key={actividad.id}
                  onClick={() => scrollToIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    isActive ? "w-6" : "w-1.5 hover:opacity-80"
                  }`}
                  style={{
                    backgroundColor: isActive ? tipoColor : `${tipoColor}40`,
                  }}
                  aria-label={`Ir a actividad ${idx + 1}: ${actividad.titulo}`}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Carrusel */}
      <div className="relative group">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {actividadesFuturas.map((actividad) => {
            const tipo = iconosPorTipo[actividad.tipo] || iconosPorTipo.otro;
            const fechaHora = actividad.fechaHora.toDate();
            const esHoy = new Date().toDateString() === fechaHora.toDateString();
            const porcentajeOcupacion = Math.round((actividad.registrados / actividad.capacidadMax) * 100);

            return (
              <div
                key={actividad.id}
                className="flex-none w-full snap-center px-0"
              >
                <button
                  onClick={() => router.push("/actividades")}
                  className="w-full bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 active:scale-[0.98] text-left group/card"
                  style={{ background: `linear-gradient(135deg, ${tipo.bg} 0%, white 100%)` }}
                >
                  {/* Tipo y badge disponibilidad */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-2xl w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: tipo.bg }}
                      >
                        {tipo.emoji}
                      </span>
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-bold capitalize"
                        style={{ background: tipo.bg, color: tipo.color }}
                      >
                        {actividad.tipo}
                      </span>
                    </div>

                    {/* Badge de cupos */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 border border-gray-200">
                      <Users size={12} className="text-gray-500" />
                      <span className="text-xs font-bold text-gray-700">
                        {actividad.registrados}/{actividad.capacidadMax}
                      </span>
                    </div>
                  </div>

                  {/* Título */}
                  <h4 className="text-lg font-bold text-gray-900 mb-2 leading-tight group-hover/card:text-ronald-orange transition-colors">
                    {actividad.titulo}
                  </h4>

                  {/* Descripción */}
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                    {actividad.descripcion}
                  </p>

                  {/* Barra de progreso de ocupación con color del tipo */}
                  <div className="mb-4">
                    <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${porcentajeOcupacion}%`,
                          backgroundColor: tipo.color,
                        }}
                      />
                    </div>
                    <p className="text-[10px] mt-1 font-medium" style={{ color: tipo.color }}>
                      {porcentajeOcupacion}% ocupado
                    </p>
                  </div>

                  {/* Info adicional */}
                  <div className="flex flex-col gap-2">
                    {/* Fecha y hora */}
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Clock size={14} style={{ color: tipo.color }} className="shrink-0" />
                      <span className="font-semibold">
                        {esHoy ? "Hoy" : format(fechaHora, "EEE d MMM", { locale: es })}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span>{format(fechaHora, "HH:mm")} hrs</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500">{actividad.duracionMin} min</span>
                    </div>

                    {/* Ubicación */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={14} className="text-gray-400 shrink-0" />
                      <span className="truncate">{actividad.ubicacion}</span>
                    </div>
                  </div>

                  {/* Footer con instructor */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Instructor: <span className="font-semibold text-gray-700">{actividad.instructor}</span>
                      </span>
                      <div
                        className="flex items-center gap-1 text-sm font-semibold group-hover/card:gap-2 transition-all"
                        style={{ color: tipo.color }}
                      >
                        Ver todas
                        <ChevronRight size={14} className="transition-transform group-hover/card:translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* Botones de navegación (solo desktop y si hay más de 1) */}
        {actividadesFuturas.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200 text-gray-700 hover:bg-white hover:text-ronald-orange transition-all opacity-0 group-hover:opacity-100"
              aria-label="Anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={handleNext}
              className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200 text-gray-700 hover:bg-white hover:text-ronald-orange transition-all opacity-0 group-hover:opacity-100"
              aria-label="Siguiente"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {/* Footer con contador */}
      {actividadesFuturas.length > 1 && (
        <p className="text-center text-xs text-gray-400 mt-3">
          {currentIndex + 1} de {actividadesFuturas.length} actividades próximas
        </p>
      )}
    </div>
  );
}
