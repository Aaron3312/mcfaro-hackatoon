'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { AMBER, ORANGE } from './story/constants'

export function LoadingScreen({ isVisible }: { isVisible: boolean }) {
  const [progress, setProgress] = useState(0)
  const [hidden, setHidden] = useState(false)
  const progressRef = useRef(0)

  useEffect(() => {
    if (!isVisible) return

    progressRef.current = 0
    setProgress(0)
    setHidden(false)

    const interval = setInterval(() => {
      const increment = Math.random() * 12 + 3
      progressRef.current = Math.min(progressRef.current + increment, 95)
      setProgress(Math.floor(progressRef.current))
    }, 300)

    return () => clearInterval(interval)
  }, [isVisible])

  useEffect(() => {
    if (isVisible) return

    const obj = { p: progressRef.current }
    gsap.to(obj, {
      p: 100,
      duration: 0.3,
      onUpdate() { setProgress(Math.floor(obj.p)) },
      onComplete() {
        setTimeout(() => setHidden(true), 750)
      },
    })
  }, [isVisible])

  if (hidden) return null

  return (
    <div
      className="fixed inset-0 bg-gradient-to-b from-[#010206] to-[#040818] flex flex-col items-center justify-center"
      style={{
        opacity: isVisible ? 1 : 0,
        zIndex: 50,
        pointerEvents: isVisible ? 'auto' : 'none',
        transition: 'opacity 700ms ease-in-out',
      }}
    >
      {/* Logo / Icono animado */}
      <div className="mb-16">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center relative"
          style={{
            background: `linear-gradient(135deg, ${ORANGE} 0%, ${AMBER} 100%)`,
            boxShadow: `0 0 48px rgba(200,120,42,.4)`,
            animation: isVisible ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
          }}
        >
          <div
            className="w-20 h-20 rounded-full bg-[#010206] flex items-center justify-center text-3xl font-bold"
            style={{ color: AMBER }}
          >
            mc
          </div>
        </div>
      </div>

      {/* Texto de carga */}
      <div className="text-center mb-12">
        <h1
          className="text-3xl sm:text-4xl font-bold mb-2"
          style={{ color: AMBER }}
        >
          mcFaro
        </h1>
        <p
          className="text-sm sm:text-base tracking-widest uppercase"
          style={{ color: 'rgba(245, 200, 66, 0.5)' }}
        >
          Preparando tu hogar
        </p>
      </div>

      {/* Barra de progreso */}
      <div className="w-56 h-1 bg-gray-900 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${ORANGE} 0%, ${AMBER} 100%)`,
            boxShadow: `0 0 12px rgba(200,120,42,.6)`,
          }}
        />
      </div>

      {/* Porcentaje */}
      <p
        className="mt-6 text-xs tracking-wider uppercase"
        style={{ color: 'rgba(245, 200, 66, 0.4)' }}
      >
        {progress}%
      </p>

      {/* Dots animados */}
      <div className="mt-12 flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{
              background: AMBER,
              opacity: isVisible ? 0.6 : 0.2,
              animation: isVisible
                ? `bounce 1.2s ease-in-out ${i * 0.15}s infinite`
                : 'none',
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.8;
          }
        }
        @keyframes bounce {
          0%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-8px);
          }
        }
      `}</style>
    </div>
  )
}