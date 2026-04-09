'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/* ─── Estrellas pre-generadas ─── */
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

/* ─── Puntos de brillo sobre el camino dorado (x relativo 0→1 dentro del camino) ─── */
const SPARKLES: Array<[number, number, number]> = [
  [0.08, 0.3, 0.9], [0.15, 0.6, 0.7], [0.25, 0.2, 0.8],
  [0.35, 0.7, 0.6], [0.45, 0.4, 0.9], [0.55, 0.5, 0.7],
  [0.65, 0.3, 0.5], [0.75, 0.6, 0.4], [0.85, 0.5, 0.3],
  [0.12, 0.5, 0.8], [0.32, 0.4, 0.7], [0.52, 0.6, 0.6],
  [0.72, 0.4, 0.5], [0.92, 0.5, 0.2],
]

export default function TeosPage() {
  const glowRef       = useRef<SVGCircleElement>(null)
  const haloSvgRef    = useRef<SVGCircleElement>(null)
  const starGroupRef  = useRef<SVGGElement>(null)
  const wave1Ref      = useRef<SVGPathElement>(null)
  const wave2Ref      = useRef<SVGPathElement>(null)
  const beamRef       = useRef<SVGGElement>(null)
  const sparklesRef   = useRef<SVGGElement>(null)
  const caminoGlowRef = useRef<SVGPathElement>(null)

  /* refs de contenido */
  const badgeRef     = useRef<HTMLDivElement>(null)
  const eyeRef       = useRef<HTMLDivElement>(null)
  const mcRef        = useRef<HTMLSpanElement>(null)
  const faroRef      = useRef<HTMLSpanElement>(null)
  const dividerRef   = useRef<HTMLDivElement>(null)
  const tagRef       = useRef<HTMLParagraphElement>(null)
  const footerRef    = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {

      /* ── Haz del faro — barrido suave ── */
      gsap.to(beamRef.current, {
        rotation: 32,
        svgOrigin: '52 136',
        duration: 6.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })

      /* ── Linterna: pulso ── */
      gsap.to(glowRef.current, {
        attr: { r: 14 }, opacity: 0.55,
        duration: 2.6, repeat: -1, yoyo: true, ease: 'sine.inOut',
      })
      gsap.to(haloSvgRef.current, {
        attr: { r: 30 }, opacity: 0.07,
        duration: 3.4, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.6,
      })

      /* ── Olas ── */
      gsap.to(wave1Ref.current, { y: -2, duration: 3.5, repeat: -1, yoyo: true, ease: 'sine.inOut' })
      gsap.to(wave2Ref.current, { y: -1.5, duration: 4.2, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.8 })

      /* ── Estrellas ── */
      Array.from(starGroupRef.current?.querySelectorAll('circle') ?? []).forEach(s => {
        const base = parseFloat(s.getAttribute('opacity') ?? '0.7')
        gsap.to(s, {
          opacity: base * 0.08,
          duration: 1.4 + Math.random() * 3,
          repeat: -1, yoyo: true,
          delay: Math.random() * 5,
          ease: 'sine.inOut',
        })
      })

      /* ── Camino dorado: glow pulsante ── */
      gsap.to(caminoGlowRef.current, {
        opacity: 0.5,
        duration: 2.5,
        repeat: -1, yoyo: true, ease: 'sine.inOut',
      })

      /* ── Sparkles en el camino ── */
      Array.from(sparklesRef.current?.querySelectorAll('circle') ?? []).forEach((dot, i) => {
        gsap.to(dot, {
          opacity: 0,
          duration: 0.8 + Math.random() * 1.5,
          repeat: -1, yoyo: true,
          delay: Math.random() * 4,
          ease: 'sine.inOut',
        })
      })

      /* ── Halo CSS: respira ── */
      gsap.to(eyeRef.current, {
        scale: 1.06, opacity: 0.22,
        duration: 4, repeat: -1, yoyo: true, ease: 'sine.inOut',
      })

      /* ─────────────────────────────────────────
         SECUENCIA DE ENTRADA CINEMATOGRÁFICA
         ───────────────────────────────────────── */
      const tl = gsap.timeline({ delay: 0.25 })

      tl.fromTo(badgeRef.current,
        { opacity: 0, y: -16 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      )

      tl.fromTo(mcRef.current,
        { opacity: 0, x: -60, filter: 'blur(12px)' },
        { opacity: 1, x: 0,  filter: 'blur(0px)', duration: 1.1, ease: 'power4.out' },
        '-=0.2'
      )

      tl.fromTo(faroRef.current,
        { opacity: 0, x: 60, filter: 'blur(12px)' },
        { opacity: 1, x: 0,  filter: 'blur(0px)', duration: 1.1, ease: 'power4.out' },
        '<+0.08'
      )

      tl.fromTo(dividerRef.current,
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 0.9, ease: 'expo.out' },
        '-=0.5'
      )

      tl.fromTo(tagRef.current,
        { opacity: 0, y: 18, filter: 'blur(4px)' },
        { opacity: 1, y: 0,  filter: 'blur(0px)', duration: 1.1, ease: 'power3.out' },
        '-=0.3'
      )

      tl.fromTo(footerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1.2, ease: 'power2.out' },
        '-=0.4'
      )
    })

    return () => ctx.revert()
  }, [])

  /* ── Geometría del camino dorado ──
     Va desde la base del faro (x≈65) hacia el horizonte (x≈380).
     Es más ancho cerca del faro y se estrecha hacia el horizonte (perspectiva).
     Vive sobre la superficie del agua (y ≈ 177–195). */
  const caminoOuter = "M 65,176 Q 140,178 220,180 Q 310,182 400,183 L 400,196 Q 310,194 220,192 Q 140,190 65,192 Z"
  const caminoMid   = "M 65,178 Q 140,180 220,182 Q 310,183 400,184 L 400,193 Q 310,192 220,190 Q 140,187 65,189 Z"
  const caminoCore  = "M 65,180 Q 140,181 220,183 Q 310,184 400,185 L 400,191 Q 310,190 220,188 Q 140,186 65,187 Z"
  const caminoLine  = "M 65,182 Q 140,183 220,184.5 Q 310,185.5 400,186 L 400,189 Q 310,188.5 220,187.5 Q 140,186 65,185 Z"

  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#03060f] flex flex-col items-center justify-center select-none">

      {/* ── ESCENA SVG ── */}
      <svg
        viewBox="0 0 400 240"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="tSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#010204"/>
            <stop offset="100%" stopColor="#04071a"/>
          </linearGradient>
          <linearGradient id="tOcean" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#091340"/>
            <stop offset="100%" stopColor="#02050e"/>
          </linearGradient>

          {/* Haz de luz */}
          <linearGradient id="tBeamC" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#F8D060" stopOpacity="0.65"/>
            <stop offset="30%"  stopColor="#F5C030" stopOpacity="0.22"/>
            <stop offset="100%" stopColor="#F5C030" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="tBeamS" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#F8D060" stopOpacity="0.18"/>
            <stop offset="100%" stopColor="#F8D060" stopOpacity="0"/>
          </linearGradient>

          {/* Camino dorado — gradiente horizontal (brillante cerca del faro, desvanece al horizonte) */}
          <linearGradient id="tCaminoOuter" x1="65" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#F8D060" stopOpacity="0.20"/>
            <stop offset="30%"  stopColor="#F5B830" stopOpacity="0.12"/>
            <stop offset="70%"  stopColor="#F09010" stopOpacity="0.06"/>
            <stop offset="100%" stopColor="#F09010" stopOpacity="0.01"/>
          </linearGradient>
          <linearGradient id="tCaminoMid" x1="65" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#FFE878" stopOpacity="0.35"/>
            <stop offset="25%"  stopColor="#F8C840" stopOpacity="0.22"/>
            <stop offset="60%"  stopColor="#F09010" stopOpacity="0.10"/>
            <stop offset="100%" stopColor="#F09010" stopOpacity="0.02"/>
          </linearGradient>
          <linearGradient id="tCaminoCore" x1="65" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#FFFDE0" stopOpacity="0.55"/>
            <stop offset="20%"  stopColor="#FFE060" stopOpacity="0.35"/>
            <stop offset="50%"  stopColor="#F8C030" stopOpacity="0.15"/>
            <stop offset="100%" stopColor="#F09010" stopOpacity="0.0"/>
          </linearGradient>
          <linearGradient id="tCaminoLine" x1="65" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.7"/>
            <stop offset="15%"  stopColor="#FFFDE0" stopOpacity="0.45"/>
            <stop offset="40%"  stopColor="#FFE060" stopOpacity="0.18"/>
            <stop offset="100%" stopColor="#F09010" stopOpacity="0.0"/>
          </linearGradient>

          <filter id="tBlur"><feGaussianBlur stdDeviation="4"/></filter>
          <filter id="tBlur2"><feGaussianBlur stdDeviation="2"/></filter>
          <filter id="tGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="tCaminoGlow" x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Cielo */}
        <rect x="0" y="0" width="400" height="240" fill="url(#tSky)"/>

        {/* Nebulosas */}
        <ellipse cx="240" cy="65" rx="210" ry="78" fill="#05103a" opacity="0.55"/>
        <ellipse cx="85"  cy="38" rx="130" ry="52" fill="#04092a" opacity="0.45"/>
        <ellipse cx="355" cy="48" rx="95"  ry="42" fill="#030820" opacity="0.4"/>

        {/* Estrellas */}
        <g ref={starGroupRef}>
          {STARS.map(([xp, yp, r, op], i) => (
            <circle key={i} cx={(xp/100)*400} cy={(yp/100)*170} r={r} fill="white" opacity={op}/>
          ))}
        </g>

        {/* Haz de luz */}
        <g ref={beamRef}>
          <polygon points="52,136 460,55 460,217"  fill="url(#tBeamS)" filter="url(#tBlur)"/>
          <polygon points="52,136 460,90 460,182"  fill="url(#tBeamC)"/>
        </g>

        {/* Halo de la linterna */}
        <circle ref={haloSvgRef} cx="52" cy="136" r="24" fill="#FFF8A0" opacity="0.04" filter="url(#tBlur)"/>

        {/* Océano (base oscura) */}
        <path d="M0,175 C55,170 110,180 170,174 C230,168 290,182 350,176 C375,173 400,175 400,175 L400,240 L0,240 Z" fill="url(#tOcean)"/>

        {/* ── CAMINO DORADO — reflejo estático sobre el mar ── */}
        {/* Aura exterior difusa */}
        <path d={caminoOuter} fill="url(#tCaminoOuter)" filter="url(#tBlur2)"/>
        {/* Cuerpo medio con glow */}
        <path d={caminoMid} fill="url(#tCaminoMid)" filter="url(#tCaminoGlow)"/>
        {/* Núcleo brillante (pulsa) */}
        <path ref={caminoGlowRef} d={caminoCore} fill="url(#tCaminoCore)" opacity="0.7" filter="url(#tCaminoGlow)"/>
        {/* Hilo central — línea de luz blanca/dorada */}
        <path d={caminoLine} fill="url(#tCaminoLine)" opacity="0.6"/>

        {/* Destellos / sparkles sobre el camino */}
        <g ref={sparklesRef}>
          {SPARKLES.map(([t, v, op], i) => {
            const x = 65 + t * 335
            const y = 181 + v * 6 + Math.sin(t * 8) * 1.5
            return (
              <circle key={i} cx={x} cy={y} r={0.5 + op * 0.5} fill="#FFFDE0" opacity={op * 0.7}/>
            )
          })}
        </g>

        {/* Olas encima de todo para profundidad */}
        <path ref={wave1Ref} d="M0,179 C65,175 130,184 195,178 C260,172 325,185 400,179" stroke="rgba(70,120,220,0.18)" strokeWidth="0.7" fill="none"/>
        <path ref={wave2Ref} d="M0,186 C80,182 160,192 240,186 C310,180 365,192 400,186" stroke="rgba(70,120,220,0.10)" strokeWidth="0.5" fill="none"/>

        {/* Faro */}
        <g>
          <ellipse cx="52" cy="232" rx="24" ry="7" fill="#080c1e"/>
          <path d="M32,215 C32,208 72,208 72,215 L76,232 L28,232 Z" fill="#0b0e26"/>
          <rect x="31" y="212" width="42" height="5"  rx="1.5" fill="#1a1a38"/>
          <rect x="44" y="153" width="16" height="62" rx="2"   fill="#c8b285"/>
          <rect x="46" y="153" width="12" height="62" rx="1"   fill="#d8c49e"/>
          <rect x="44" y="165" width="16" height="4"  rx="0.8" fill="#9a7040" opacity="0.8"/>
          <rect x="44" y="180" width="16" height="4"  rx="0.8" fill="#9a7040" opacity="0.8"/>
          <rect x="44" y="195" width="16" height="4"  rx="0.8" fill="#9a7040" opacity="0.8"/>
          <rect x="40" y="149" width="24" height="5"  rx="1"   fill="#856010"/>
          <rect x="41" y="148" width="22" height="2"  rx="0.5" fill="#be9828"/>
          <rect x="41" y="133" width="22" height="17" rx="2"   fill="#10183c"/>
          <rect x="43" y="135" width="8"  height="13" rx="0.8" fill="#1c3898" opacity="0.6"/>
          <rect x="53" y="135" width="8"  height="13" rx="0.8" fill="#1c3898" opacity="0.6"/>
          <rect x="45" y="137" width="14" height="9"  rx="0.5" fill="#FFFBC0"/>
          <circle ref={glowRef} cx="52" cy="136" r="9" fill="#FFF8A0" opacity="0.9" filter="url(#tGlow)"/>
          <path d="M38,133 L52,118 L66,133 Z" fill="#856010"/>
          <path d="M41,133 L52,120 L63,133 Z" fill="#be9828"/>
          <line x1="52" y1="118" x2="52" y2="110" stroke="#777" strokeWidth="0.7"/>
          <circle cx="52" cy="110" r="0.8" fill="#999"/>
        </g>
      </svg>

      {/* ── Capas de atmósfera ── */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 75% 60% at 50% 50%, transparent 15%, rgba(3,6,15,0.65) 100%)' }}
      />
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '55%', background: 'linear-gradient(to top, rgba(3,6,15,0.97) 0%, rgba(3,6,15,0.45) 50%, transparent 100%)' }}
      />
      <div className="absolute top-0 left-0 right-0 pointer-events-none h-40"
        style={{ background: 'linear-gradient(to bottom, rgba(3,6,15,0.85) 0%, transparent 100%)' }}
      />

      {/* Film grain */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
      />

      {/* ── CONTENIDO — el cartel ── */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 w-full max-w-5xl">

        {/* Badge */}
        <div ref={badgeRef} style={{ opacity: 0 }} className="mb-10 sm:mb-12">
          <span className="inline-flex items-center gap-2 text-amber-200/40 text-[9px] sm:text-[11px] tracking-[0.35em] uppercase font-medium">
            <span className="w-8 h-px bg-amber-300/20" />
            Fundación Ronald McDonald · México
            <span className="w-8 h-px bg-amber-300/20" />
          </span>
        </div>

        {/* Halo */}
        <div className="relative flex items-center justify-center">
          <div
            ref={eyeRef}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 'clamp(280px, 60vw, 700px)',
              height: 'clamp(280px, 60vw, 700px)',
              background: `radial-gradient(circle at 50% 50%,
                rgba(248,208,80,0.10) 0%,
                rgba(200,120,42,0.07) 30%,
                rgba(248,208,80,0.03) 55%,
                transparent 72%)`,
              opacity: 0.15,
            }}
          />

          {/* Nombre */}
          <h1 className="relative leading-none tracking-[-0.02em] font-black"
              style={{ fontSize: 'clamp(4.5rem,17vw,13rem)' }}>
            <span
              ref={mcRef}
              style={{
                opacity: 0,
                color: '#ffffff',
                textShadow: '0 0 80px rgba(255,255,255,0.08)',
              }}
            >
              Mc
            </span>
            <span
              ref={faroRef}
              style={{
                opacity: 0,
                color: '#F8D060',
                textShadow: '0 0 60px rgba(248,208,80,0.35), 0 0 120px rgba(248,208,80,0.15)',
              }}
            >
              Faro
            </span>
          </h1>
        </div>

        {/* Separador */}
        <div ref={dividerRef} style={{ opacity: 0 }}
          className="flex items-center gap-3 mt-6 sm:mt-8 mb-6 sm:mb-8 origin-center">
          <div className="h-px w-16 sm:w-24" style={{ background: 'linear-gradient(to right, transparent, rgba(248,208,80,0.4))' }}/>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(248,208,80,0.6)' }}/>
          <div className="h-px w-16 sm:w-24" style={{ background: 'linear-gradient(to left, transparent, rgba(248,208,80,0.4))' }}/>
        </div>

        {/* Tagline */}
        <p
          ref={tagRef}
          style={{ opacity: 0 }}
          className="font-light leading-relaxed max-w-xs sm:max-w-lg
                     text-[15px] sm:text-xl md:text-2xl"
        >
          <span className="text-blue-100/50">El faro que ilumina el camino</span>
          <br className="hidden sm:block"/>
          <span className="text-amber-200/75 font-normal"> en los momentos más oscuros.</span>
        </p>
      </div>

      {/* Footer */}
      <div ref={footerRef} style={{ opacity: 0 }}
        className="absolute bottom-7 left-0 right-0 z-10 flex items-center justify-center gap-4">
        <span className="w-8 h-px bg-white/10"/>
        <p className="text-white/15 text-[9px] sm:text-[11px] tracking-[0.25em] uppercase font-medium">
          Genius Arena Hackathon 2026 · Talent Land México
        </p>
        <span className="w-8 h-px bg-white/10"/>
      </div>
    </main>
  )
}
