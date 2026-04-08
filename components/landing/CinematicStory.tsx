'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import gsap from 'gsap'

import { BEATS, AMBER, OR_DARK, ORANGE } from './story/constants'
import { WorldBase }  from './story/WorldBase'
import { Beat01, animateIn as a01 } from './story/Beat01'
import { Beat02, animateIn as a02 } from './story/Beat02'
import { Beat04, animateIn as a04 } from './story/Beat04'
import { Beat05, animateIn as a05 } from './story/Beat05'
import { Beat06, animateIn as a06 } from './story/Beat06'
import { Beat07, animateIn as a07 } from './story/Beat07'
import { Beat08, animateIn as a08 } from './story/Beat08'
import { Beat09, animateIn as a09 } from './story/Beat09'
import { Beat10, animateIn as a10 } from './story/Beat10'
import { Beat11, animateIn as a11 } from './story/Beat11'
import { Beat12, animateIn as a12 } from './story/Beat12'

/* Mapa de funciones de animación por índice de beat */
const ANIMATE_FNS = [a01, a02, a04, a05, a06, a07, a08, a09, a10, a11, a12]

export function CinematicStory() {
  const worldRef = useRef<HTMLDivElement>(null)
  const textRef  = useRef<HTMLDivElement>(null)
  const beamRef  = useRef<SVGGElement>(null)
  const curRef   = useRef(0)
  const lockRef  = useRef(false)
  const [current, setCurrent] = useState(0)

  /* ── Animación de entrada del beat activo ───────────────────────── */
  const enterBeat = useCallback((idx: number) => {
    ANIMATE_FNS[idx]?.()
  }, [])

  /* ── Mover cámara ────────────────────────────────────────────────── */
  const moveTo = useCallback((idx: number) => {
    if (lockRef.current || !worldRef.current) return
    lockRef.current = true
    curRef.current  = idx
    setCurrent(idx)

    const { x, y, z } = BEATS[idx].cam
    const vw = window.innerWidth
    const vh = window.innerHeight

    gsap.to(textRef.current, { opacity: 0, y: 8, duration: .25, ease: 'power2.in' })
    gsap.to(worldRef.current, {
      x: vw/2 - x*z,
      y: vh/2 - y*z,
      scale: z,
      duration: 1.65,
      ease: 'power2.inOut',
      onComplete() {
        enterBeat(idx)
        gsap.fromTo(textRef.current,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: .5, ease: 'power3.out' }
        )
        lockRef.current = false
      },
    })
  }, [enterBeat])

  /* ── Inicialización ─────────────────────────────────────────────── */
  useEffect(() => {
    // Haz del faro — loop continuo
    gsap.to(beamRef.current, {
      rotation: 48, svgOrigin: '300 1389',
      duration: 5.5, repeat: -1, yoyo: true, ease: 'sine.inOut',
    })

    // Posición inicial de la cámara (sin animación)
    const b0 = BEATS[0].cam
    const vw = window.innerWidth
    const vh = window.innerHeight
    gsap.set(worldRef.current, {
      x: vw/2 - b0.x*b0.z,
      y: vh/2 - b0.y*b0.z,
      scale: b0.z,
      transformOrigin: '0 0',
    })

    // Primer beat
    setTimeout(() => {
      enterBeat(0)
      gsap.fromTo(textRef.current, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .6 })
    }, 200)

    // Navegación por teclado
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ')
        moveTo(Math.min(curRef.current + 1, 10))
      if (e.key === 'ArrowLeft')
        moveTo(Math.max(curRef.current - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enterBeat, moveTo])

  /* ── Layout del texto ───────────────────────────────────────────── */
  const beat = BEATS[current]
  const tPos = {
    top:   'left-1/2 -translate-x-1/2 top-16 sm:top-20 max-w-sm sm:max-w-lg text-center',
    left:  'left-5 sm:left-12 top-1/2 -translate-y-1/2 max-w-xs sm:max-w-sm text-left',
    center:'left-1/2 -translate-x-1/2 bottom-20 sm:bottom-24 max-w-sm sm:max-w-lg text-center',
    right: 'right-5 sm:right-12 top-1/2 -translate-y-1/2 max-w-xs sm:max-w-sm text-right',
  }[beat.pos]

  return (
    <div
      id="historia"
      className="relative w-full h-screen overflow-hidden"
      style={{ background: 'linear-gradient(to bottom, #010206 0%, #040818 100%)' }}
    >
      {/* Viñeta suave en bordes */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none z-10"
        style={{ background: 'radial-gradient(ellipse 85% 70% at 50% 50%, transparent 40%, #010206 100%)' }}/>

      {/* ── Mundo SVG — la cámara transforma este div ── */}
      <div
        ref={worldRef}
        style={{ position: 'absolute', top: 0, left: 0, transformOrigin: '0 0', willChange: 'transform' }}
      >
        <svg width="3000" height="1800" style={{ display: 'block' }} aria-hidden="true">
          <WorldBase beamRef={beamRef}/>
          <Beat01/>
          <Beat02/>
          <Beat04/>
          <Beat05/>
          <Beat06/>
          <Beat07/>
          <Beat08/>
          <Beat09/>
          <Beat10/>
          <Beat11/>
          <Beat12/>
        </svg>
      </div>

      {/* ── Texto (espacio del viewport, no del mundo) ── */}
      <div
        ref={textRef}
        className={`absolute z-20 pointer-events-none ${tPos}`}
        style={{ opacity: 0 }}
      >
        {beat.ey && (
          <p className="text-amber-300/58 text-[10px] sm:text-xs tracking-[0.28em] uppercase font-medium mb-3">
            {beat.ey}
          </p>
        )}
        <h2
          className={`text-white font-bold leading-tight ${
            current === 9  ? 'text-5xl sm:text-7xl md:text-8xl' :
            current === 10 ? 'text-xl sm:text-3xl md:text-4xl' :
                             'text-2xl sm:text-4xl md:text-5xl'
          }`}
          style={{ whiteSpace: 'pre-line' }}
        >
          {current === 3
            ? <>mc<span className="text-amber-300">Faro</span></>
            : beat.h}
        </h2>
        {beat.b && current !== 10 && (
          <p className="mt-3 text-blue-100/65 font-light leading-relaxed text-sm sm:text-lg" style={{ whiteSpace: 'pre-line' }}>
            {beat.b}
          </p>
        )}
        {current === 10 && beat.b && (
          <p className="mt-3 text-amber-300 font-bold text-2xl sm:text-4xl md:text-5xl leading-tight" style={{ whiteSpace: 'pre-line' }}>
            {beat.b}
          </p>
        )}
        {beat.cta && (
          <div className="mt-7 pointer-events-auto">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-white font-bold rounded-full text-sm sm:text-base px-8 py-4 min-h-12 transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: `linear-gradient(135deg,${OR_DARK} 0%,${ORANGE} 65%,${AMBER} 100%)`,
                boxShadow: `0 0 36px rgba(200,90,42,.55)`,
              }}
            >
              Comenzar <span aria-hidden>→</span>
            </Link>
          </div>
        )}
      </div>

      {/* ── Dots indicadores ── */}
      <div className="absolute top-5 inset-x-0 flex justify-center z-30">
        <div className="flex items-center gap-1.5">
          {BEATS.map((_, i) => (
            <button
              key={i}
              onClick={() => moveTo(i)}
              aria-label={`Capítulo ${i+1}`}
              className="rounded-full transition-all duration-300"
              style={{
                width:  i === current ? 22 : 6,
                height: 6,
                background: i === current ? AMBER : 'rgba(245,200,66,.28)',
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Botones prev / next ── */}
      {current > 0 && (
        <button
          onClick={() => moveTo(current - 1)}
          className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={{ background: 'rgba(245,200,66,.1)', border: '1px solid rgba(245,200,66,.22)', backdropFilter: 'blur(4px)' }}
          aria-label="Anterior"
        >
          <span className="text-amber-300">←</span>
        </button>
      )}
      {current < 10 && (
        <button
          onClick={() => moveTo(current + 1)}
          className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={{ background: 'rgba(245,200,66,.15)', border: '1px solid rgba(245,200,66,.3)', backdropFilter: 'blur(4px)' }}
          aria-label="Siguiente"
        >
          <span className="text-amber-300">→</span>
        </button>
      )}

      {/* ── Hint primer beat ── */}
      {current === 0 && (
        <p className="absolute bottom-7 inset-x-0 text-center z-30 text-amber-300/35 text-[11px] tracking-[0.25em] uppercase animate-pulse pointer-events-none">
          Click para continuar · ← →
        </p>
      )}
    </div>
  )
}
