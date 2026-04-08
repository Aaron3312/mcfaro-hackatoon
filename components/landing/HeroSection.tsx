'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { LoadingScreen } from './LoadingScreen'

/* ------------------------------------------------------------------
   Estrellas pre-generadas — evita mismatch de hidratación SSR/cliente
   [x%, y%, r, opacity]
   ------------------------------------------------------------------ */
const STARS: Array<[number, number, number, number]> = [
  [6, 5, 0.9, 0.9],  [18, 9, 0.7, 0.6],  [31, 4, 1.1, 0.8],  [44, 11, 0.8, 0.9],
  [57, 6, 1.3, 0.7],  [70, 14, 0.7, 0.8], [83, 8, 1.0, 0.6],  [94, 4, 0.9, 0.9],
  [12, 20, 0.8, 0.7], [27, 17, 1.2, 0.9], [42, 23, 0.7, 0.6], [60, 19, 1.0, 0.8],
  [75, 25, 0.8, 0.7], [88, 21, 1.1, 0.9], [5, 33, 0.9, 0.6],  [22, 38, 0.7, 0.8],
  [38, 30, 1.2, 0.9], [53, 36, 0.8, 0.7], [67, 32, 1.0, 0.6], [80, 40, 0.9, 0.8],
  [95, 35, 0.7, 0.9], [10, 48, 1.1, 0.7], [26, 44, 0.8, 0.6], [41, 52, 0.9, 0.9],
  [56, 47, 1.3, 0.8], [72, 55, 0.7, 0.7], [87, 50, 1.0, 0.6], [3, 60, 0.8, 0.8],
  [19, 58, 1.1, 0.9], [35, 65, 0.7, 0.7], [50, 62, 0.9, 0.6], [65, 68, 1.2, 0.8],
  [79, 63, 0.8, 0.9], [92, 70, 1.0, 0.7], [8, 75, 0.9, 0.6],  [24, 72, 0.7, 0.8],
  [48, 14, 0.8, 0.7], [63, 3, 1.0, 0.8],  [77, 18, 0.9, 0.6], [90, 28, 0.7, 0.9],
]

export function HeroSection() {
  const beamRef      = useRef<SVGGElement>(null)
  const glowRef      = useRef<SVGCircleElement>(null)
  const starGroupRef = useRef<SVGGElement>(null)
  const wave1Ref     = useRef<SVGPathElement>(null)
  const wave2Ref     = useRef<SVGPathElement>(null)
  const f1Ref        = useRef<SVGGElement>(null)
  const f2Ref        = useRef<SVGGElement>(null)
  const f3Ref        = useRef<SVGGElement>(null)
  const f4Ref        = useRef<SVGGElement>(null)
  const titleRef     = useRef<HTMLDivElement>(null)
  const taglineRef   = useRef<HTMLParagraphElement>(null)
  const ctaRef       = useRef<HTMLDivElement>(null)
  const badgeRef     = useRef<HTMLDivElement>(null)
  const mainRef      = useRef<HTMLElement>(null)
  /* Referencia al timeline maestro para poder matarlo al hacer click */
  const beamTweenRef = useRef<{ kill(): void } | null>(null)

  /* Pantalla de carga — se muestra hasta que GSAP y el SVG están listos */
  const [isLoading, setIsLoading] = useState(true)

  /* ViewBox responsivo — portrait móvil encuadra el faro + F1/F2 */
  const [svgProps, setSvgProps] = useState({
    viewBox: '0 0 400 240',
    preserveAspectRatio: 'xMidYMid slice',
  })

  useEffect(() => {
    function updateViewBox() {
      if (window.innerWidth < 640) {
        // Encuadre portrait: x=0-200, y=100-370 → faro (52,136) + F1 + F2 visibles
        // viewBox más amplio: zoom out para que el faro sea pequeño y quede en la mitad inferior
        // Scale resultante ~1.77x (vs 3.5x antes), faro aparece al 40%-65% de la pantalla
        // Familias ya desplazadas con transform en SVG; viewBox da respiro al faro (~60px desde borde)
        setSvgProps({ viewBox: '18 -80 310 480', preserveAspectRatio: 'xMinYMid slice' })
      } else {
        setSvgProps({ viewBox: '0 0 400 240', preserveAspectRatio: 'xMidYMid slice' })
      }
    }
    updateViewBox()
    window.addEventListener('resize', updateViewBox)
    return () => window.removeEventListener('resize', updateViewBox)
  }, [])

  /* Apunta el rayo a F4 (la familia más lejana), hace zoom hacia ella y luego
     transiciona a la sección de historia */
  function irAHistoria() {
    const FARO_X = 52
    const FARO_Y = 136

    // Mata el loop de barrido
    beamTweenRef.current?.kill()

    // F4 está en SVG coords ≈ (320, 170).
    // En viewBox 400×240 → posición relativa: x=80%, y=71%
    // Usamos esos % como transformOrigin para el zoom
    const originX = '80%'
    const originY = '71%'

    const tl = gsap.timeline({
      onComplete: () => {
        document.getElementById('historia')?.scrollIntoView({ behavior: 'smooth' })
      },
    })

    // 1. Apunta el rayo a F4 (~7°)
    tl.to(beamRef.current, {
      rotation: 7,
      svgOrigin: `${FARO_X} ${FARO_Y}`,
      duration: 0.7,
      ease: 'power2.out',
    }, 0)

    // 2. Oscurece F1, F2, F3 e ilumina F4
    tl.call(() => {
      ;[f1Ref, f2Ref, f3Ref].forEach(r => {
        if (!r.current) return
        gsap.killTweensOf(r.current)
        gsap.to(r.current, { opacity: 0.02, duration: 0.5, ease: 'power2.out' })
      })
      if (!f4Ref.current) return
      gsap.killTweensOf(f4Ref.current)
      gsap.to(f4Ref.current, { opacity: 1, duration: 0.5, ease: 'power2.out' })
    }, [], 0)

    // 3. Pequeña pausa para que se vea la familia iluminada
    tl.to({}, { duration: 0.4 })

    // 4. Zoom in hacia F4 — la escena se acerca y el texto desaparece
    tl.to(mainRef.current, {
      scale: 2.8,
      transformOrigin: `${originX} ${originY}`,
      duration: 1.1,
      ease: 'power3.in',
    }, '>')
    tl.to(
      [badgeRef.current, titleRef.current, taglineRef.current, ctaRef.current],
      { opacity: 0, duration: 0.35, ease: 'power2.in' },
      '<'
    )

    // 5. Fade a negro antes del scroll
    tl.to(mainRef.current, {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
    }, '-=0.15')
  }

  useEffect(() => {
    /* Punta de la linterna del faro en coords SVG
       ViewBox: 0 0 400 240 — faro en x≈52, linterna en y≈136 */
    const FARO_X = 52
    const FARO_Y = 136

    /* Crea (o recrea) el timeline maestro haz + familias.
       Se llama al montar y también al restaurar desde el IntersectionObserver. */
    function buildMasterTL() {
      beamTweenRef.current?.kill()

      /* Ángulos exactos por arctan(Δy/Δx) desde el faro (52,136):
           F4 (314,166): 6.5° → ida 1.32s  | vuelta 9.68s
           F3 (245,168): 9.4° → ida 1.61s  | vuelta 9.39s
           F2 (175,167):14.1° → ida 2.01s  | vuelta 8.99s
           F1 (108,165):27.4° → ida 3.00s  | vuelta 8.00s
         t = arccos(1 - 2·θ/48) / π × 5.5  */
      const SV   = `${FARO_X} ${FARO_Y}`
      const FL   = 0.25
      const FD   = 0.45
      const BASE = 0.05
      const LIT  = 0.95

      const tl = gsap.timeline({ repeat: -1 })

      // ── Ida: 0° → 48° en 5.5s ──────────────────────────────────────
      tl.to(beamRef.current, { rotation: 48, svgOrigin: SV, duration: 5.5, ease: 'sine.inOut' }, 0)
      tl.to(f4Ref.current,   { opacity: LIT,  duration: FL, ease: 'power3.out' }, 1.32)
        .to(f4Ref.current,   { opacity: BASE, duration: FD, ease: 'power2.in'  }, `<+${FL}`)
      tl.to(f3Ref.current,   { opacity: LIT,  duration: FL, ease: 'power3.out' }, 1.61)
        .to(f3Ref.current,   { opacity: BASE, duration: FD, ease: 'power2.in'  }, `<+${FL}`)
      tl.to(f2Ref.current,   { opacity: LIT,  duration: FL, ease: 'power3.out' }, 2.01)
        .to(f2Ref.current,   { opacity: BASE, duration: FD, ease: 'power2.in'  }, `<+${FL}`)
      tl.to(f1Ref.current,   { opacity: LIT,  duration: FL, ease: 'power3.out' }, 3.00)
        .to(f1Ref.current,   { opacity: BASE, duration: FD, ease: 'power2.in'  }, `<+${FL}`)

      // ── Vuelta: 48° → 0° en 5.5s ───────────────────────────────────
      tl.to(beamRef.current, { rotation: 0,  svgOrigin: SV, duration: 5.5, ease: 'sine.inOut' }, 5.5)
      tl.to(f1Ref.current,   { opacity: LIT,  duration: FL, ease: 'power3.out' }, 8.00)
        .to(f1Ref.current,   { opacity: BASE, duration: FD, ease: 'power2.in'  }, `<+${FL}`)
      tl.to(f2Ref.current,   { opacity: LIT,  duration: FL, ease: 'power3.out' }, 8.99)
        .to(f2Ref.current,   { opacity: BASE, duration: FD, ease: 'power2.in'  }, `<+${FL}`)
      tl.to(f3Ref.current,   { opacity: LIT,  duration: FL, ease: 'power3.out' }, 9.39)
        .to(f3Ref.current,   { opacity: BASE, duration: FD, ease: 'power2.in'  }, `<+${FL}`)
      tl.to(f4Ref.current,   { opacity: LIT,  duration: FL, ease: 'power3.out' }, 9.68)
        .to(f4Ref.current,   { opacity: BASE, duration: FD, ease: 'power2.in'  }, `<+${FL}`)

      beamTweenRef.current = tl
    }

    const ctx = gsap.context(() => {

      // 1. TIMELINE MAESTRO
      buildMasterTL()

      // 2. PULSO DE LA LINTERNA
      gsap.to(glowRef.current, {
        r: 13,
        opacity: 0.45,
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })

      // 3. ESTRELLAS — parpadeo asíncrono
      if (starGroupRef.current) {
        Array.from(starGroupRef.current.querySelectorAll('circle')).forEach(star => {
          const base = parseFloat(star.getAttribute('opacity') ?? '0.7')
          gsap.to(star, {
            opacity: base * 0.12,
            duration: 1.2 + Math.random() * 2.5,
            repeat: -1,
            yoyo: true,
            delay: Math.random() * 4,
            ease: 'sine.inOut',
          })
        })
      }

      // 4. OLAS — movimiento vertical sutil
      gsap.to(wave1Ref.current, {
        y: -3, duration: 3.5, repeat: -1, yoyo: true, ease: 'sine.inOut',
      })
      gsap.to(wave2Ref.current, {
        y: -2, duration: 4.2, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.8,
      })

      // 6. TEXTO HERO — aparece con stagger (después de que la pantalla de carga salga)
      gsap.fromTo(
        [badgeRef.current, titleRef.current, taglineRef.current, ctaRef.current],
        { y: 28, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.1, stagger: 0.2, delay: 0.6, ease: 'power3.out' }
      )

      // Ocultar pantalla de carga una vez que el SVG y GSAP están listos
      setTimeout(() => setIsLoading(false), 400)
    })

    /* IntersectionObserver — restaura el hero al volver con scroll */
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry.isIntersecting) return

        const el = mainRef.current
        if (!el) return
        // Solo restaura si el hero fue alterado por irAHistoria
        if (parseFloat(el.style.opacity ?? '1') === 1 && !el.style.transform) return

        gsap.to(el, {
          opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out',
          onComplete: buildMasterTL,
        })
        // Restaura texto
        gsap.to(
          [badgeRef.current, titleRef.current, taglineRef.current, ctaRef.current],
          { opacity: 1, duration: 0.35, ease: 'power2.out' }
        )
        // Regresa familias a estado base para que el nuevo timeline arranque limpio
        ;[f1Ref, f2Ref, f3Ref, f4Ref].forEach(r => {
          if (r.current) gsap.set(r.current, { opacity: 0.05 })
        })
      },
      { threshold: 0.1 }
    )
    if (mainRef.current) observer.observe(mainRef.current)

    return () => {
      ctx.revert()
      observer.disconnect()
    }
  }, [])

  return (
    <main ref={mainRef} className="relative w-full h-screen overflow-hidden bg-[#05091a]">

      {/* Pantalla de carga — solo móvil, tapa el SVG mientras GSAP inicializa */}
      <div className="sm:hidden">
        <LoadingScreen isVisible={isLoading} />
      </div>

      {/* ── Escena SVG — faro, familias, océano, haz ── */}
      <svg
        viewBox={svgProps.viewBox}
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio={svgProps.preserveAspectRatio}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#010206"/>
            <stop offset="100%" stopColor="#06091c"/>
          </linearGradient>
          <linearGradient id="oceanGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#0c1945"/>
            <stop offset="100%" stopColor="#040810"/>
          </linearGradient>
          <linearGradient id="beamCore" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#F8D060" stopOpacity="0.9"/>
            <stop offset="40%"  stopColor="#F5C030" stopOpacity="0.35"/>
            <stop offset="100%" stopColor="#F5C030" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="beamSoft" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#F8D060" stopOpacity="0.28"/>
            <stop offset="100%" stopColor="#F8D060" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="reflejo" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#F8D060" stopOpacity="0.25"/>
            <stop offset="100%" stopColor="#F8D060" stopOpacity="0"/>
          </linearGradient>
          <filter id="softBlur">
            <feGaussianBlur stdDeviation="4"/>
          </filter>
          <filter id="glowFilter" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="5" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="familyGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.5"/>
          </filter>
        </defs>

        {/* Cielo — extendido para cubrir el área negativa del viewBox en móvil */}
        <rect x="-200" y="-200" width="800" height="640" fill="url(#skyGrad)"/>

        {/* Nebulosas sutiles */}
        <ellipse cx="240" cy="70"  rx="200" ry="75" fill="#07103a" opacity="0.5"/>
        <ellipse cx="90"  cy="40"  rx="120" ry="50" fill="#060e2e" opacity="0.4"/>
        <ellipse cx="350" cy="50"  rx="90"  ry="40" fill="#060c28" opacity="0.35"/>

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
          <polygon points="52,136 490,45  490,227" fill="url(#beamSoft)" filter="url(#softBlur)"/>
          <polygon points="52,136 490,88  490,184" fill="url(#beamCore)"/>
        </g>

        {/* Reflejo del haz en el océano */}
        <polygon points="52,180 490,172 490,190" fill="url(#reflejo)" opacity="0.4"/>

        {/* Océano */}
        <path
          d="M0,175 C55,170 110,180 170,174 C230,168 290,182 350,176 C375,173 400,175 400,175 L400,240 L0,240 Z"
          fill="url(#oceanGrad)"
        />
        {/* Extensión del océano hacia abajo — cubre hasta y=600 para mobile portrait */}
        <rect x="-200" y="175" width="800" height="425" fill="url(#oceanGrad)"/>

        {/* Ola 1 */}
        <path
          ref={wave1Ref}
          d="M0,179 C65,175 130,184 195,178 C260,172 325,185 400,179"
          stroke="rgba(80,130,220,0.22)" strokeWidth="0.7" fill="none"
        />
        {/* Ola 2 */}
        <path
          ref={wave2Ref}
          d="M0,186 C80,182 160,192 240,186 C310,180 365,192 400,186"
          stroke="rgba(80,130,220,0.13)" strokeWidth="0.5" fill="none"
        />

        {/* F1 — más cerca del faro */}
        <g ref={f1Ref} opacity="0.05" fill="#d8bc96">
          <ellipse cx="114" cy="182" rx="16" ry="4" fill="#F8D060" opacity="0.35" filter="url(#familyGlow)"/>
          <circle cx="108" cy="157" r="4.5"/>
          <path d="M101,166 C101,159 116,159 116,166 L115,178 L102,178 Z"/>
          <rect x="103" y="177" width="3"   height="9" rx="1.5"/>
          <rect x="111" y="177" width="3"   height="9" rx="1.5"/>
          <line x1="116" y1="165" x2="122" y2="164" stroke="#d8bc96" strokeWidth="2.5" strokeLinecap="round"/>
          <circle cx="125" cy="160" r="3.3"/>
          <path d="M120,168 C120,163 130,163 130,168 L129,177 L121,177 Z"/>
          <rect x="121.5" y="176" width="2.5" height="8" rx="1.2"/>
          <rect x="126.5" y="176" width="2.5" height="8" rx="1.2"/>
        </g>

        {/* F2 — media distancia */}
        <g ref={f2Ref} opacity="0.05" fill="#d8bc96" transform="translate(-28, 0)">
          <ellipse cx="181" cy="181" rx="14" ry="3.5" fill="#F8D060" opacity="0.35" filter="url(#familyGlow)"/>
          <circle cx="175" cy="159" r="3.8"/>
          <path d="M169,167 C169,161 181,161 181,167 L180,177 L170,177 Z"/>
          <rect x="171" y="176" width="2.5" height="8" rx="1.2"/>
          <rect x="177" y="176" width="2.5" height="8" rx="1.2"/>
          <line x1="181" y1="165" x2="186" y2="164" stroke="#d8bc96" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="189" cy="162" r="2.8"/>
          <path d="M185,169 C185,165 193,165 193,169 L192,177 L186,177 Z"/>
          <rect x="186.5" y="176" width="2" height="7" rx="1"/>
          <rect x="190.5" y="176" width="2" height="7" rx="1"/>
        </g>

        {/* F3 — más lejos */}
        <g ref={f3Ref} opacity="0.05" fill="#d8bc96" transform="translate(-58, 0)">
          <ellipse cx="250" cy="181" rx="12" ry="3" fill="#F8D060" opacity="0.35" filter="url(#familyGlow)"/>
          <circle cx="245" cy="162" r="3.3"/>
          <path d="M240,169 C240,164 251,164 251,169 L250,178 L241,178 Z"/>
          <rect x="241.5" y="177" width="2.2" height="7" rx="1.1"/>
          <rect x="247"   y="177" width="2.2" height="7" rx="1.1"/>
          <line x1="251" y1="167" x2="255" y2="166" stroke="#d8bc96" strokeWidth="1.8" strokeLinecap="round"/>
          <circle cx="258" cy="164" r="2.5"/>
          <path d="M254,170 C254,166 262,166 262,170 L261,177 L255,177 Z"/>
          <rect x="255.5" y="176" width="1.8" height="6" rx="0.9"/>
          <rect x="259.5" y="176" width="1.8" height="6" rx="0.9"/>
        </g>

        {/* F4 — más lejana */}
        <g ref={f4Ref} opacity="0.05" fill="#d8bc96" transform="translate(-90, 0)">
          <ellipse cx="319" cy="181" rx="10" ry="2.5" fill="#F8D060" opacity="0.35" filter="url(#familyGlow)"/>
          <circle cx="314" cy="164" r="2.8"/>
          <path d="M310,170 C310,166 319,166 319,170 L318,177 L311,177 Z"/>
          <rect x="311.5" y="176" width="1.8" height="6" rx="0.9"/>
          <rect x="316"   y="176" width="1.8" height="6" rx="0.9"/>
          <line x1="319" y1="169" x2="323" y2="168" stroke="#d8bc96" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="325" cy="166" r="2.2"/>
          <path d="M322,171 C322,168 328,168 328,171 L327,177 L323,177 Z"/>
          <rect x="323.5" y="176" width="1.5" height="5" rx="0.75"/>
          <rect x="326.5" y="176" width="1.5" height="5" rx="0.75"/>
        </g>

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
          <circle ref={glowRef} cx="52" cy="136" r="9" fill="#FFF8A0" opacity="0.85" filter="url(#glowFilter)"/>
          <path d="M38,133 L52,118 L66,133 Z" fill="#8b6914"/>
          <path d="M41,133 L52,120 L63,133 Z" fill="#c4a030"/>
          <line x1="52" y1="118" x2="52" y2="110" stroke="#888" strokeWidth="0.7"/>
          <circle cx="52" cy="110" r="0.8" fill="#aaa"/>
        </g>
      </svg>

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 30%, rgba(5,9,26,0.55) 100%)' }}
      />
      {/* Gradiente inferior — más pronunciado en móvil para que el CTA flote sobre la escena */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none h-56 sm:h-48"
        style={{ background: 'linear-gradient(to top, rgba(5,9,26,0.92) 0%, rgba(5,9,26,0.4) 60%, transparent 100%)' }}
      />

      {/* ── Contenido HTML ── */}
      <div className="relative z-10 h-full flex flex-col">

        {/* Badge */}
        <div className="flex justify-center pt-10 sm:pt-10 md:pt-12">
          <div
            ref={badgeRef}
            style={{ opacity: 0 }}
            className="text-amber-300/60 text-[10px] sm:text-xs tracking-[0.28em] uppercase font-medium px-4 py-1.5 rounded-full border border-amber-300/20 backdrop-blur-sm"
          >
            Casa Ronald McDonald · México
          </div>
        </div>

        {/* ── Móvil: título encima del faro, tagline abajo ── */}
        {/* ── Desktop: título + tagline centrados verticalmente ── */}

        {/* Título */}
        <div className="flex-1 flex flex-col items-center px-6 text-center
                        justify-start pt-6
                        sm:justify-center sm:pt-0
                        gap-3 sm:gap-5">
          <div ref={titleRef} style={{ opacity: 0 }}>
            <h1 className="text-white font-bold tracking-tight leading-none
                           text-5xl
                           sm:text-7xl md:text-8xl lg:text-9xl">
              mc<span className="text-amber-300">Faro</span>
            </h1>
          </div>
          <p
            ref={taglineRef}
            style={{ opacity: 0 }}
            className="text-blue-100/65 font-light leading-relaxed
                       text-sm sm:text-xl md:text-2xl
                       max-w-65 sm:max-w-sm md:max-w-lg"
          >
            En los momentos más oscuros,{' '}
            <span className="text-amber-200 font-medium">iluminamos el camino</span>{' '}
            de tu familia.
          </p>
        </div>

        {/* CTA */}
        <div
          ref={ctaRef}
          style={{ opacity: 0 }}
          className="flex flex-col items-center gap-3 pb-12 sm:pb-14 md:pb-16 px-6"
        >
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-[#3A1F0D] font-bold rounded-full transition-all duration-200 hover:scale-105 active:scale-95
                       text-base sm:text-lg px-10 py-4 min-h-14 w-full sm:w-auto justify-center"
            style={{ boxShadow: '0 0 40px rgba(248,208,80,0.4), 0 4px 24px rgba(0,0,0,0.4)' }}
          >
            Comenzar <span aria-hidden="true">→</span>
          </Link>

          {/* Botón secundario — solo en desktop (la historia no se muestra en móvil) */}
          <button
            onClick={irAHistoria}
            className="hidden sm:inline-flex items-center gap-2 text-amber-200/70 hover:text-amber-200 text-sm sm:text-base font-medium transition-all duration-200 group"
          >
            <span className="w-6 h-px bg-amber-200/40 group-hover:bg-amber-200/80 transition-all duration-300 group-hover:w-8" />
            Ver la historia
            <span className="text-xs opacity-60 group-hover:opacity-100 transition-all duration-200 group-hover:translate-y-0.5">↓</span>
          </button>

          <p className="text-blue-200/30 text-[11px] sm:text-xs text-center">
            Organiza tus citas · Tu bienestar importa
          </p>
        </div>
      </div>
    </main>
  )
}
