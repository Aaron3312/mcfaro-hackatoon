"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar, Users, Clock, MapPin } from "lucide-react";
import { Actividad } from "@/lib/types";

interface CarruselActividadesProps {
  actividades: Actividad[];
  cargando?: boolean;
}

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
  const [isPaused, setIsPaused] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Filtrar solo actividades futuras y programadas
  const actividadesFuturas = actividades
    .filter(a => a.estado === "programada" && a.fechaHora.toDate() > new Date())
    .sort((a, b) => a.fechaHora.toMillis() - b.fechaHora.toMillis())
    .slice(0, 5); // Máximo 5 actividades

  // Auto-scroll cada 5 segundos
  useEffect(() => {
    if (isPaused || actividadesFuturas.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % actividadesFuturas.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, actividadesFuturas.length]);

  // Scroll suave al cambiar índice (solo cuando cambia por autoplay o botones)
  const isUserScrolling = useRef(false);
  useEffect(() => {
    if (!scrollContainerRef.current || isUserScrolling.current) return;
    const container = scrollContainerRef.current;
    const cardWidth = container.scrollWidth / actividadesFuturas.length;
    container.scrollTo({ left: currentIndex * cardWidth, behavior: "smooth" });
  }, [currentIndex, actividadesFuturas.length]);

  // Sincronizar índice cuando el usuario hace swipe manualmente
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const cardWidth = container.scrollWidth / actividadesFuturas.length;
    const idx = Math.round(container.scrollLeft / cardWidth);
    isUserScrolling.current = true;
    setCurrentIndex(Math.max(0, Math.min(idx, actividadesFuturas.length - 1)));
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => { isUserScrolling.current = false; }, 200);
  }, [actividadesFuturas.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? actividadesFuturas.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % actividadesFuturas.length);
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
    return null; // No mostrar si no hay actividades
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
        {actividadesFuturas.length > 1 && (
          <div className="flex items-center gap-1">
            {/* Indicadores de página */}
            {actividadesFuturas.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? "w-6 bg-ronald-orange"
                    : "w-1.5 bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Ir a actividad ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Carrusel */}
      <div className="relative group">
        {/* Contenedor de scroll */}
        <div
          ref={scrollContainerRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {actividadesFuturas.map((actividad, idx) => {
            const tipo = iconosPorTipo[actividad.tipo] || iconosPorTipo.otro;
            const fechaHora = actividad.fechaHora.toDate();
            const esHoy = new Date().toDateString() === fechaHora.toDateString();

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
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                    {actividad.descripcion}
                  </p>

                  {/* Info adicional */}
                  <div className="flex flex-col gap-2">
                    {/* Fecha y hora */}
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Clock size={14} className="text-ronald-orange shrink-0" />
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

                  {/* Badge "Ver todas" */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Instructor: <span className="font-semibold text-gray-700">{actividad.instructor}</span>
                      </span>
                      <div className="flex items-center gap-1 text-ronald-orange text-sm font-semibold group-hover/card:gap-2 transition-all">
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
