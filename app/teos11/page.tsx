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

export default function Teos11Page() {
  const starGroupRef = useRef<SVGGElement>(null)
  const wave1Ref     = useRef<SVGPathElement>(null)

  const accentRef   = useRef<HTMLDivElement>(null)
  const eyebrowRef  = useRef<HTMLDivElement>(null)
  const dotRef      = useRef<HTMLDivElement>(null)
  const titleRef    = useRef<HTMLParagraphElement>(null)
  const dividerRef  = useRef<HTMLDivElement>(null)
  const cardsRef    = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {

      /* ── Fondo animado ── */
      gsap.to(wave1Ref.current, {
        y: -2, duration: 5.5, repeat: -1, yoyo: true, ease: 'sine.inOut',
      })
      Array.from(starGroupRef.current?.querySelectorAll('circle') ?? []).forEach(s => {
        const base = parseFloat(s.getAttribute('opacity') ?? '0.7')
        gsap.to(s, {
          opacity: base * 0.08,
          duration: 1.5 + Math.random() * 4,
          repeat: -1, yoyo: true,
          delay: Math.random() * 7,
          ease: 'sine.inOut',
        })
      })

      /* Acento — pulso frío */
      gsap.to(accentRef.current, {
        scale: 1.04, opacity: 0.6,
        duration: 8, repeat: -1, yoyo: true, ease: 'sine.inOut',
      })

      /* ─── Secuencia de entrada ─── */
      const tl = gsap.timeline({ delay: 0.5 })

      tl.fromTo(eyebrowRef.current,
        { opacity: 0, y: -6 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }
      )
      tl.fromTo(dotRef.current,
        { opacity: 0, scale: 0 },
        { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' },
        '-=0.1'
      )
      tl.fromTo(titleRef.current,
        { opacity: 0, y: 20, filter: 'blur(10px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.5, ease: 'power3.out' },
        '+=0.1'
      )
      tl.fromTo(dividerRef.current,
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 0.6, ease: 'power2.out' },
        '+=0.3'
      )
      tl.fromTo(
        cardsRef.current ? Array.from(cardsRef.current.children) : [],
        { opacity: 0, y: 28, filter: 'blur(6px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.0, stagger: 0.3, ease: 'power2.out' },
        '-=0.1'
      )
    })
    return () => ctx.revert()
  }, [])

  return (
    <main className="relative w-full h-screen overflow-hidden"
      style={{ background: '#03050E' }}>

      {/* ── Escena SVG ── */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full opacity-50"
      >
        <defs>
          <linearGradient id="sky11" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#02010A"/>
            <stop offset="55%"  stopColor="#060818"/>
            <stop offset="100%" stopColor="#0A1230"/>
          </linearGradient>
          <linearGradient id="sea11" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#081535"/>
            <stop offset="100%" stopColor="#02060E"/>
          </linearGradient>
          <radialGradient id="vig11" cx="50%" cy="40%" r="70%">
            <stop offset="0%"   stopColor="transparent"/>
            <stop offset="100%" stopColor="#000" stopOpacity="0.7"/>
          </radialGradient>
        </defs>

        <rect width="100" height="100" fill="url(#sky11)"/>

        <g ref={starGroupRef}>
          {STARS.map(([x, y, r, op], i) => (
            <circle key={i} cx={x} cy={y * 0.62} r={r * 0.38} fill="white" opacity={op}/>
          ))}
        </g>

        <line x1="0" y1="78" x2="100" y2="78" stroke="#1A2850" strokeWidth="0.12" opacity="0.4"/>
        <rect x="0" y="78" width="100" height="22" fill="url(#sea11)"/>
        <path ref={wave1Ref}
          d="M0 79.5 Q15 78.2 30 79.5 Q45 80.8 60 79.5 Q75 78.2 90 79.5 Q95 80 100 79.5 L100 78 L0 78 Z"
          fill="#1A3A7A" opacity="0.25"/>

        <rect width="100" height="100" fill="url(#vig11)"/>
      </svg>

      {/* ── Acento radial — azul frío ── */}
      <div ref={accentRef}
        className="absolute pointer-events-none"
        style={{
          top: '35%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: 'clamp(300px,60vw,680px)',
          height: 'clamp(300px,60vw,680px)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(100,140,255,0.07) 0%, transparent 70%)',
          opacity: 0.5,
        }}/>

      {/* ── Capa de texto ── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center gap-6">

        {/* Eyebrow */}
        <div ref={eyebrowRef} className="flex items-center gap-3" style={{ opacity: 0 }}>
          <span className="w-8 h-px" style={{ background: 'rgba(160,180,255,0.2)' }}/>
          <span className="text-[10px] sm:text-xs tracking-[0.35em] uppercase font-medium"
            style={{ color: 'rgba(160,180,255,0.45)' }}>
            El nuevo reto
          </span>
          <span className="w-8 h-px" style={{ background: 'rgba(160,180,255,0.2)' }}/>
        </div>

        {/* Punto */}
        <div ref={dotRef}
          className="w-1 h-1 rounded-full"
          style={{ background: 'rgba(160,180,255,0.35)', opacity: 0 }}/>

        {/* Titular */}
        <p ref={titleRef}
          className="font-semibold leading-tight"
          style={{
            opacity: 0,
            fontSize: 'clamp(1.5rem, 4.5vw, 2.8rem)',
            color: '#FFFFFF',
            maxWidth: '20ch',
            textShadow: '0 0 40px rgba(100,140,255,0.1)',
          } as React.CSSProperties}
        >
          Se enfrentan a{' '}
          <span style={{ color: '#A0B4FF' }}>nuevos retos.</span>
        </p>

        {/* Divider */}
        <div ref={dividerRef}
          className="flex items-center gap-3 origin-center"
          style={{ opacity: 0 }}>
          <span className="h-px w-10" style={{ background: 'rgba(160,180,255,0.18)' }}/>
          <span className="w-1 h-1 rounded-full" style={{ background: 'rgba(160,180,255,0.35)' }}/>
          <span className="h-px w-10" style={{ background: 'rgba(160,180,255,0.18)' }}/>
        </div>

        {/* Cuatro retos */}
        <div ref={cardsRef} className="flex flex-row items-start justify-center gap-6 mt-1">

          {/* Ciudad nueva */}
          <div className="flex flex-col items-center gap-3" style={{ width: '90px' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(100,140,255,0.07)', border: '1px solid rgba(100,140,255,0.15)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(160,180,255,0.75)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
                <line x1="12" y1="2" x2="12" y2="6"/>
                <circle cx="12" cy="10" r="1"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-center" style={{ color: 'rgba(220,225,255,0.85)' }}>
              Ciudad nueva
            </span>
          </div>

          {/* Hospital nuevo */}
          <div className="flex flex-col items-center gap-3" style={{ width: '90px' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(100,140,255,0.07)', border: '1px solid rgba(100,140,255,0.15)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(160,180,255,0.75)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M12 8v8M8 12h8"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-center" style={{ color: 'rgba(220,225,255,0.85)' }}>
              Hospital nuevo
            </span>
          </div>

          {/* Rutina nueva */}
          <div className="flex flex-col items-center gap-3" style={{ width: '90px' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(100,140,255,0.07)', border: '1px solid rgba(100,140,255,0.15)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(160,180,255,0.75)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9"/>
                <path d="M12 7v5l3 3"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-center" style={{ color: 'rgba(220,225,255,0.85)' }}>
              Rutina nueva
            </span>
          </div>

          {/* Salud de Sofía — destacado */}
          <div className="flex flex-col items-center gap-3" style={{ width: '90px' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(220,140,180,0.1)', border: '1px solid rgba(220,140,180,0.25)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="rgba(220,140,180,0.25)" stroke="rgba(230,160,190,0.85)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-center" style={{ color: 'rgba(230,160,190,0.9)' }}>
              Salud de Sofía
            </span>
          </div>

        </div>

        {/* Línea de cierre */}
        <p
          className="font-light mt-2"
          style={{
            fontSize: 'clamp(0.78rem, 1.8vw, 0.95rem)', //blanco
            color: 'rgba(220,225,255,0.75)',
            maxWidth: '38ch',
          } as React.CSSProperties}
        >
          Todo al mismo tiempo. Y lo más importante: la salud de Sofía.
        </p>

      </div>

      {/* ── Gradientes atmosféricos ── */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none"
        style={{ background: 'linear-gradient(to top, #000 0%, transparent 100%)' }}/>
      <div className="absolute inset-x-0 top-0 h-16 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, #000 0%, transparent 100%)' }}/>

      {/* ── Grano de película ── */}
      <div className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '180px 180px',
        }}/>
    </main>
  )
}
