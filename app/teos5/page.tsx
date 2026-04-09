'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const STARS: Array<[number, number, number, number]> = [
  [6,5,0.9,0.9],[18,9,0.7,0.6],[31,4,1.1,0.8],[44,11,0.8,0.9],
  [57,6,1.3,0.7],[70,14,0.7,0.8],[83,8,1.0,0.6],[94,4,0.9,0.9],
  [12,20,0.8,0.7],[27,17,1.2,0.9],[42,23,0.7,0.6],[60,19,1.0,0.8],
  [75,25,0.8,0.7],[88,21,1.1,0.9],[5,33,0.9,0.6],[22,38,0.7,0.8],
  [38,30,1.2,0.9],[53,36,0.8,0.7],[67,32,1.0,0.6],[80,40,0.9,0.8],
  [95,35,0.7,0.9],[10,48,1.1,0.7],[26,44,0.8,0.6],[41,52,0.9,0.9],
  [56,47,1.3,0.8],[72,55,0.7,0.7],[87,50,1.0,0.6],[3,60,0.8,0.8],
  [19,58,1.1,0.9],[35,65,0.7,0.7],[50,62,0.9,0.6],[65,68,1.2,0.8],
  [79,63,0.8,0.9],[92,70,1.0,0.7],[8,75,0.9,0.6],[24,72,0.7,0.8],
  [48,14,0.8,0.7],[63,3,1.0,0.8],[77,18,0.9,0.6],[90,28,0.7,0.9],
  [15,85,0.8,0.5],[33,80,1.0,0.6],[51,88,0.7,0.4],[68,83,0.9,0.5],
  [84,78,1.1,0.6],[97,91,0.8,0.4],[7,93,0.9,0.5],[45,97,0.7,0.3],
  [2,12,0.6,0.5],[36,7,0.8,0.7],[58,22,0.7,0.5],[71,38,1.0,0.4],
]

export default function Teos5Page() {
  const starGroupRef = useRef<SVGGElement>(null)
  const wave1Ref     = useRef<SVGPathElement>(null)

  const heartRef    = useRef<HTMLDivElement>(null)
  const ageRef      = useRef<HTMLParagraphElement>(null)
  const nameRef     = useRef<HTMLHeadingElement>(null)
  const diagRef     = useRef<HTMLParagraphElement>(null)
  const contextRef  = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {

      /* ── Fondo ── */
      gsap.to(wave1Ref.current, {
        y: -2, duration: 5, repeat: -1, yoyo: true, ease: 'sine.inOut',
      })
      Array.from(starGroupRef.current?.querySelectorAll('circle') ?? []).forEach(s => {
        const base = parseFloat(s.getAttribute('opacity') ?? '0.7')
        gsap.to(s, {
          opacity: base * 0.07,
          duration: 1.6 + Math.random() * 4,
          repeat: -1, yoyo: true,
          delay: Math.random() * 7,
          ease: 'sine.inOut',
        })
      })

      /* Corazón — pulso lento */
      gsap.to(heartRef.current, {
        scale: 1.15,
        duration: 1.2, repeat: -1, yoyo: true, ease: 'sine.inOut',
      })

      /* ─── Secuencia de entrada ─── */
      const tl = gsap.timeline({ delay: 0.6 })

      /* Edad — primer dato, pequeño y suave */
      tl.fromTo(ageRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
      )

      /* Nombre — grande, con peso emocional */
      tl.fromTo(nameRef.current,
        { opacity: 0, y: 30, filter: 'blur(14px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 2.0, ease: 'power4.out' },
        '+=0.2'
      )

      /* Pausa — el jurado lo sostiene */
      tl.to({}, { duration: 1.1 })

      /* Diagnóstico — aparece lento, pesado */
      tl.fromTo(diagRef.current,
        { opacity: 0, y: 10, filter: 'blur(6px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.8, ease: 'power3.out' }
      )

      /* Pausa larga */
      tl.to({}, { duration: 1.6 })

      /* Contexto */
      tl.fromTo(contextRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 1.4, ease: 'power2.out' }
      )
    })
    return () => ctx.revert()
  }, [])

  return (
    <main className="relative w-full h-screen overflow-hidden select-none"
      style={{ background: '#02040C' }}>

      {/* ── Escena SVG ── */}
      <svg viewBox="0 0 400 240" className="absolute inset-0 w-full h-full opacity-40"
        preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="t5Sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#010106"/>
            <stop offset="100%" stopColor="#040818"/>
          </linearGradient>
          <linearGradient id="t5Ocean" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#060E30"/>
            <stop offset="100%" stopColor="#010308"/>
          </linearGradient>
          <radialGradient id="t5Nebula" cx="30%" cy="25%" r="50%">
            <stop offset="0%"   stopColor="#1a0830" stopOpacity="0.6"/>
            <stop offset="100%" stopColor="transparent"/>
          </radialGradient>
          <radialGradient id="t5Nebula2" cx="75%" cy="40%" r="40%">
            <stop offset="0%"   stopColor="#050A28" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="transparent"/>
          </radialGradient>
        </defs>

        <rect width="400" height="240" fill="url(#t5Sky)"/>
        {/* Nebulosa sutil */}
        <rect width="400" height="240" fill="url(#t5Nebula)"/>
        <rect width="400" height="240" fill="url(#t5Nebula2)"/>

        <g ref={starGroupRef}>
          {STARS.map(([xp, yp, r, op], i) => (
            <circle key={i} cx={(xp/100)*400} cy={(yp/100)*170} r={r} fill="white" opacity={op}/>
          ))}
        </g>

        {/* Horizonte + mar */}
        <path d="M0,188 C80,183 160,193 240,186 C320,179 370,191 400,188 L400,240 L0,240 Z"
          fill="url(#t5Ocean)"/>
        <path ref={wave1Ref}
          d="M0,192 C65,188 130,197 195,191 C260,185 325,196 400,191"
          stroke="rgba(60,80,160,0.12)" strokeWidth="0.7" fill="none"/>
      </svg>

      {/* ── Capas atmosféricas ── */}
      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 90% 80% at 50% 45%, transparent 20%, rgba(2,4,12,0.8) 100%)' }}/>
      {/* Gradiente inferior — oscurece el mar */}
      <div className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{ height: '55%', background: 'linear-gradient(to top, rgba(2,4,12,1) 0%, rgba(2,4,12,0.5) 60%, transparent 100%)' }}/>
      {/* Gradiente superior */}
      <div className="absolute inset-x-0 top-0 pointer-events-none h-32"
        style={{ background: 'linear-gradient(to bottom, rgba(2,4,12,0.85) 0%, transparent 100%)' }}/>

      {/* Glow suave centrado — lavanda frío */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div style={{
          width: 'clamp(400px,70vw,800px)',
          height: 'clamp(400px,70vw,800px)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(100,70,160,0.07) 0%, transparent 65%)',
        }}/>
      </div>

      {/* Film grain */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.022]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat', backgroundSize: '128px 128px',
        }}/>

      {/* ── CONTENIDO ── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 gap-0">

        {/* Edad + corazón — arriba, pequeño */}
        <p ref={ageRef}
          className="flex items-center gap-2 mb-6"
          style={{ opacity: 0 }}>
          <div ref={heartRef}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(200,150,220,0.5)" stroke="none">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <span style={{
            fontSize: 'clamp(0.7rem, 1.6vw, 0.85rem)',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'rgba(180,150,210,0.45)',
            fontWeight: 500,
          }}>
            6 años
          </span>
        </p>

        {/* Nombre — protagonista */}
        <h1 ref={nameRef}
          className="leading-none font-black tracking-tight"
          style={{
            opacity: 0,
            fontSize: 'clamp(5rem, 18vw, 12rem)',
            color: '#EDD8F8',
            textShadow: '0 0 80px rgba(160,100,220,0.2), 0 0 160px rgba(120,80,200,0.08)',
          } as React.CSSProperties}>
          Sofía
        </h1>

        {/* Diagnóstico */}
        <p ref={diagRef}
          className="font-light mt-4"
          style={{
            opacity: 0,
            fontSize: 'clamp(1rem, 3vw, 1.75rem)',
            color: 'rgba(180,185,210,0.5)',
            letterSpacing: '0.02em',
          } as React.CSSProperties}>
          tiene leucemia.
        </p>


      </div>
    </main>
  )
}
