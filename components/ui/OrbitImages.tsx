"use client";
// OrbitImages — animación orbital, inspirada en reactbits.dev/animations/orbit-images
// CSS puro, sin framer-motion
import { useRef, useEffect, useState } from "react";

interface OrbitItem {
  content: React.ReactNode;
  key: string;
}

interface OrbitImagesProps {
  items: OrbitItem[];
  /** Radio en px. Default 110 */
  radius?: number;
  /** Duración de una vuelta en segundos. Default 28 */
  duration?: number;
  /** 'normal' | 'reverse' */
  direction?: "normal" | "reverse";
  /** Tamaño px de cada elemento. Default 52 */
  itemSize?: number;
  /** Contenido en el centro */
  centerContent?: React.ReactNode;
  /** Mostrar anillo guía */
  showRing?: boolean;
  ringColor?: string;
  className?: string;
  /** Escala al ancho del contenedor padre */
  responsive?: boolean;
}

export function OrbitImages({
  items,
  radius = 110,
  duration = 28,
  direction = "normal",
  itemSize = 52,
  centerContent,
  showRing = true,
  ringColor = "rgba(255,255,255,0.18)",
  className = "",
  responsive = false,
}: OrbitImagesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [effectiveRadius, setEffectiveRadius] = useState(radius);

  useEffect(() => {
    if (!responsive || !containerRef.current) return;
    const update = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const maxR = w / 2 - itemSize / 2 - 6;
      setEffectiveRadius(Math.min(radius, Math.max(40, maxR)));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [responsive, radius, itemSize]);

  const boxSize = (effectiveRadius + itemSize / 2 + 8) * 2;
  const center = boxSize / 2;
  const dir = direction === "reverse" ? "reverse" : "normal";

  return (
    <div
      ref={containerRef}
      className={`relative flex-shrink-0 ${className}`}
      style={{ width: responsive ? "100%" : boxSize, height: boxSize }}
      aria-hidden="true"
    >
      {/* Anillo guía */}
      {showRing && (
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: effectiveRadius * 2,
            height: effectiveRadius * 2,
            top: center - effectiveRadius,
            left: center - effectiveRadius,
            border: `1px dashed ${ringColor}`,
          }}
        />
      )}

      {/* Items — cada uno se posiciona sobre el anillo con delay negativo */}
      {items.map((item, i) => {
        const delay = -((i / items.length) * duration);
        return (
          <div
            key={item.key}
            className="absolute"
            style={{
              width: itemSize,
              height: itemSize,
              top: center - itemSize / 2,
              left: center - itemSize / 2,
              // El wrapper gira alrededor del centro
              animation: `orb-rotate ${duration}s linear ${delay}s infinite ${dir}`,
            }}
          >
            {/* El hijo se traslada al borde y contra-rota para mantenerse vertical.
                La animación incluye el translateY — no usar transform inline aquí. */}
            <div
              style={{
                width: "100%",
                height: "100%",
                animation: `orb-counter-${Math.round(effectiveRadius)} ${duration}s linear ${delay}s infinite ${dir === "normal" ? "reverse" : "normal"}`,
              }}
            >
              {item.content}
            </div>
          </div>
        );
      })}

      {/* Centro */}
      {centerContent && (
        <div
          className="absolute flex items-center justify-center"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 10,
          }}
        >
          {centerContent}
        </div>
      )}

      <style>{`
        @keyframes orb-rotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes orb-counter-${Math.round(effectiveRadius)} {
          from { transform: translateY(-${effectiveRadius}px) rotate(0deg); }
          to   { transform: translateY(-${effectiveRadius}px) rotate(-360deg); }
        }
      `}</style>
    </div>
  );
}
