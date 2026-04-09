'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/* ─── Estrellas pre-generadas (evita mismatch SSR/cliente) ─── */
const STARS: Array<[number, number, number, number]> = [
  [6, 5, 0.9, 0.9],   [18, 9, 0.7, 0.6],   [31, 4, 1.1, 0.8],  [44, 11, 0.8, 0.9],
  [57, 6, 1.3, 0.7],  [70, 14, 0.7, 0.8],  [83, 8, 1.0, 0.6],  [94, 4, 0.9, 0.9],
  [12, 20, 0.8, 0.7], [27, 17, 1.2, 0.9],  [42, 23, 0.7, 0.6], [60, 19, 1.0, 0.8],
  [75, 25, 0.8, 0.7], [88, 21, 1.1, 0.9],  [5, 33, 0.9, 0.6],  [22, 38, 0.7, 0.8],
  [38, 30, 1.2, 0.9], [53, 36, 0.8, 0.7],  [67, 32, 1.0, 0.6], [80, 40, 0.9, 0.8],
  [95, 35, 0.7, 0.9], [10, 48, 1.1, 0.7],  [26, 44, 0.8, 0.6], [41, 52, 0.9, 0.9],
  [56, 47, 1.3, 0.8], [72, 55, 0.7, 0.7],  [87, 50, 1.0, 0.6], [3, 60, 0.8, 0.8],
  [19, 58, 1.1, 0.9], [35, 65, 0.7, 0.7],  [50, 62, 0.9, 0.6], [65, 68, 1.2, 0.8],
  [79, 63, 0.8, 0.9], [92, 70, 1.0, 0.7],  [8, 75, 0.9, 0.6],  [24, 72, 0.7, 0.8],
  [48, 14, 0.8, 0.7], [63, 3, 1.0, 0.8],   [77, 18, 0.9, 0.6], [90, 28, 0.7, 0.9],
  [15, 85, 0.8, 0.5], [33, 80, 1.0, 0.6],  [51, 88, 0.7, 0.4], [68, 83, 0.9, 0.5],
  [84, 78, 1.1, 0.6], [97, 91, 0.8, 0.4],  [7, 93, 0.9, 0.5],  [45, 97, 0.7, 0.3],
]

export default function TeosPage() {
  const glowRef     = useRef<SVGCircleElement>(null)
  const haloRef     = useRef<SVGCircleElement>(null)
  const starGroupRef = useRef<SVGGElement>(null)
  const wave1Ref    = useRef<SVGPathElement>(null)
  const wave2Ref    = useRef<SVGPathElement>(null)
  const beamRef     = useRef<SVGGElement>(null)
  const haloRingRef = useRef<HTMLDivElement>(null)
  const logoRef     = useRef<HTMLHeadingElement>(null)
  const taglineRef  = useRef<HTMLParagraphElement>(null)
  const lineRef     = useRef<HTMLDivElement>(null)
  const badgeRef    = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* ── Haz del faro — barrido continuo ── */
      gsap.to(beamRef.current, {
        rotation: 38,
        svgOrigin: '52 136',
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })

      /* ── Pulso de la linterna ── */
      gsap.to(glowRef.current, {
        r: 14, opacity: 0.5,
        duration: 2.8, repeat: -1, yoyo: true, ease: 'sine.inOut',
      })
      gsap.to(haloRef.current, {
        r: 28, opacity: 0.08,
        duration: 3.2, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.4,
      })

      /* ── Olas ── */
      gsap.to(wave1Ref.current, { y: -3, duration: 3.5, repeat: -1, yoyo: true, ease: 'sine.inOut' })
      gsap.to(wave2Ref.current, { y: -2, duration: 4.2, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.8 })

      /* ── Estrellas — parpadeo asíncrono ── */
      if (starGroupRef.current) {
        Array.from(starGroupRef.current.querySelectorAll('circle')).forEach(star => {
          const base = parseFloat(star.getAttribute('opacity') ?? '0.7')
          gsap.to(star, {
            opacity: base * 0.1,
            duration: 1.2 + Math.random() * 2.5,
            repeat: -1, yoyo: true,
            delay: Math.random() * 5,
            ease: 'sine.inOut',
          })
        })
      }

      /* ── Halo anillo CSS ── */
      gsap.to(haloRingRef.current, {
        scale: 1.12, opacity: 0.18,
        duration: 3.5, repeat: -1, yoyo: true, ease: 'sine.inOut',
      })

      /* ── Entrada cinematográfica ── */
      const tl = gsap.timeline({ delay: 0.3 })

      // badge superior
      tl.fromTo(badgeRef.current,
        { opacity: 0, y: -12 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 0
      )

      // línea divisoria
      tl.fromTo(lineRef.current,
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 1.0, ease: 'power3.out' }, 0.4
      )

      // logo — aparece grande con ligero scale desde abajo
      tl.fromTo(logoRef.current,
        { opacity: 0, y: 40, scale: 0.88 },
        { opacity: 1, y: 0, scale: 1, duration: 1.4, ease: 'power4.out' }, 0.6
      )

      // tagline — fade suave después del logo
      tl.fromTo(taglineRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }, 1.4
      )
    })

    return () => ctx.revert()
  }, [])

  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#05091a] flex flex-col items-center justify-center">

      {/* ── Escena SVG de fondo ── */}
      <svg
        viewBox="0 0 400 240"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="tSkyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#010206"/>
            <stop offset="100%" stopColor="#06091c"/>
          </linearGradient>
          <linearGradient id="tOceanGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#0c1945"/>
            <stop offset="100%" stopColor="#040810"/>
          </linearGradient>
          <linearGradient id="tBeamCore" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#F8D060" stopOpacity="0.7"/>
            <stop offset="40%"  stopColor="#F5C030" stopOpacity="0.25"/>
            <stop offset="100%" stopColor="#F5C030" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="tBeamSoft" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#F8D060" stopOpacity="0.2"/>
            <stop offset="100%" stopColor="#F8D060" stopOpacity="0"/>
          </linearGradient>
          <filter id="tSoftBlur"><feGaussianBlur stdDeviation="4"/></filter>
          <filter id="tGlowFilter" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="5" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Cielo */}
        <rect x="0" y="0" width="400" height="240" fill="url(#tSkyGrad)"/>

        {/* Nebulosas */}
        <ellipse cx="240" cy="70" rx="200" ry="75" fill="#07103a" opacity="0.5"/>
        <ellipse cx="90"  cy="40" rx="120" ry="50" fill="#060e2e" opacity="0.4"/>
        <ellipse cx="350" cy="50" rx="90"  ry="40" fill="#060c28" opacity="0.35"/>

        {/* Estrellas */}
        <g ref={starGroupRef}>
          {STARS.map(([xPct, yPct, r, opacity], i) => (
            <circle
              key={i}
              cx={(xPct / 100) * 400}
              cy={(yPct / 100) * 170}
              r={r}
              fill="white"
              opacity={opacity}
            />
          ))}
        </g>

        {/* Haz de luz */}
        <g ref={beamRef}>
          <polygon points="52,136 490,45  490,227" fill="url(#tBeamSoft)" filter="url(#tSoftBlur)"/>
          <polygon points="52,136 490,88  490,184" fill="url(#tBeamCore)"/>
        </g>

        {/* Halo extra de la linterna en SVG */}
        <circle ref={haloRef} cx="52" cy="136" r="22" fill="#FFF8A0" opacity="0.05" filter="url(#tSoftBlur)"/>

        {/* Océano */}
        <path
          d="M0,175 C55,170 110,180 170,174 C230,168 290,182 350,176 C375,173 400,175 400,175 L400,240 L0,240 Z"
          fill="url(#tOceanGrad)"
        />

        {/* Olas */}
        <path ref={wave1Ref}
          d="M0,179 C65,175 130,184 195,178 C260,172 325,185 400,179"
          stroke="rgba(80,130,220,0.22)" strokeWidth="0.7" fill="none"
        />
        <path ref={wave2Ref}
          d="M0,186 C80,182 160,192 240,186 C310,180 365,192 400,186"
          stroke="rgba(80,130,220,0.13)" strokeWidth="0.5" fill="none"
        />

        {/* Faro */}
        <g>
          <ellipse cx="52" cy="232" rx="24" ry="7" fill="#0a0e22"/>
          <path d="M32,215 C32,208 72,208 72,215 L76,232 L28,232 Z" fill="#0d1128"/>
          <rect x="31" y="212" width="42" height="5"  rx="1.5" fill="#1e1e3a"/>
          <rect x="44" y="153" width="16" height="62" rx="2"   fill="#cdb88e"/>
          <rect x="46" y="153" width="12" height="62" rx="1"   fill="#dcc9a2"/>
          <rect x="44" y="165" width="16" height="4"  rx="0.8" fill="#a07848" opacity="0.8"/>
          <rect x="44" y="180" width="16" height="4"  rx="0.8" fill="#a07848" opacity="0.8"/>
          <rect x="44" y="195" width="16" height="4"  rx="0.8" fill="#a07848" opacity="0.8"/>
          <rect x="40" y="149" width="24" height="5"  rx="1"   fill="#8b6914"/>
          <rect x="41" y="148" width="22" height="2"  rx="0.5" fill="#c4a030"/>
          <rect x="41" y="133" width="22" height="17" rx="2"   fill="#141c40"/>
          <rect x="43" y="135" width="8"  height="13" rx="0.8" fill="#2040a0" opacity="0.65"/>
          <rect x="53" y="135" width="8"  height="13" rx="0.8" fill="#2040a0" opacity="0.65"/>
          <rect x="45" y="137" width="14" height="9"  rx="0.5" fill="#FFFBC0"/>
          <circle ref={glowRef} cx="52" cy="136" r="9" fill="#FFF8A0" opacity="0.85" filter="url(#tGlowFilter)"/>
          <path d="M38,133 L52,118 L66,133 Z" fill="#8b6914"/>
          <path d="M41,133 L52,120 L63,133 Z" fill="#c4a030"/>
          <line x1="52" y1="118" x2="52" y2="110" stroke="#888" strokeWidth="0.7"/>
          <circle cx="52" cy="110" r="0.8" fill="#aaa"/>
        </g>
      </svg>

      {/* Viñeta */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 55% at 50% 50%, transparent 20%, rgba(5,9,26,0.7) 100%)' }}
      />
      {/* Gradiente inferior */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none h-48"
        style={{ background: 'linear-gradient(to top, rgba(5,9,26,0.95) 0%, rgba(5,9,26,0.3) 70%, transparent 100%)' }}
      />
      {/* Gradiente superior */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none h-32"
        style={{ background: 'linear-gradient(to bottom, rgba(5,9,26,0.8) 0%, transparent 100%)' }}
      />

      {/* ── Contenido central — el cartel ── */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 select-none">

        {/* Badge superior */}
        <div ref={badgeRef} style={{ opacity: 0 }} className="mb-8 sm:mb-10">
          <span className="text-amber-300/50 text-[10px] sm:text-xs tracking-[0.3em] uppercase font-medium px-4 py-1.5 rounded-full border border-amber-300/15 backdrop-blur-sm">
            Fundación Ronald McDonald · México
          </span>
        </div>

        {/* Halo de luz detrás del nombre */}
        <div className="relative flex items-center justify-center mb-6 sm:mb-8">
          <div
            ref={haloRingRef}
            className="absolute w-72 sm:w-96 h-72 sm:h-96 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(248,208,80,0.12) 0%, rgba(200,120,42,0.06) 40%, transparent 70%)',
              opacity: 0.15,
            }}
          />

          {/* Nombre principal */}
          <h1
            ref={logoRef}
            style={{ opacity: 0 }}
            className="relative font-black leading-none tracking-tight
                       text-[clamp(5rem,18vw,14rem)]"
          >
            <span className="text-white">Mc</span>
            <span style={{ color: '#F8D060' }}>Faro</span>
          </h1>
        </div>

        {/* Línea decorativa */}
        <div
          ref={lineRef}
          className="w-24 sm:w-32 h-px mb-6 sm:mb-8 origin-center"
          style={{
            opacity: 0,
            background: 'linear-gradient(to right, transparent, rgba(248,208,80,0.5), transparent)',
          }}
        />

        {/* Tagline */}
        <p
          ref={taglineRef}
          style={{ opacity: 0 }}
          className="text-blue-100/60 font-light leading-relaxed max-w-xs sm:max-w-md
                     text-base sm:text-xl md:text-2xl"
        >
          El faro que ilumina el camino{' '}
          <span className="text-amber-200/80 font-medium">en los momentos más oscuros.</span>
        </p>
      </div>

      {/* Marca de agua inferior */}
      <div className="absolute bottom-6 left-0 right-0 z-10 flex justify-center">
        <p className="text-blue-200/20 text-[10px] sm:text-xs tracking-[0.2em] uppercase">
          Genius Arena Hackathon 2026 · Talent Land México
        </p>
      </div>
    </main>
  )
}
