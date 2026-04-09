'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/* Estrellas pre-generadas para evitar mismatch SSR/cliente */
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
  [14,42,0.7,0.6],[29,56,0.9,0.5],[43,70,0.8,0.7],[59,82,0.6,0.4],
  [73,91,0.7,0.5],[86,15,0.9,0.6],[98,44,0.8,0.7],[1,67,0.7,0.5],
  [17,78,1.0,0.6],[32,95,0.8,0.4],[46,29,0.9,0.7],[61,43,0.7,0.6],
]

export default function Teos9Page() {
  const starGroupRef = useRef<SVGGElement>(null)
  const wave1Ref     = useRef<SVGPathElement>(null)
  const wave2Ref     = useRef<SVGPathElement>(null)
  const wave3Ref     = useRef<SVGPathElement>(null)
  const reflRef      = useRef<SVGEllipseElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {

      /* Parpadeo de estrellas */
      Array.from(starGroupRef.current?.querySelectorAll('circle') ?? []).forEach(s => {
        const base = parseFloat(s.getAttribute('opacity') ?? '0.7')
        gsap.to(s, {
          opacity: base * 0.08,
          duration: 1.4 + Math.random() * 4.5,
          repeat: -1, yoyo: true,
          delay: Math.random() * 8,
          ease: 'sine.inOut',
        })
      })

      /* Olas — movimiento suave y desfasado */
      gsap.to(wave1Ref.current, {
        y: -3, duration: 5.5, repeat: -1, yoyo: true, ease: 'sine.inOut',
      })
      gsap.to(wave2Ref.current, {
        y: -2, x: 4, duration: 7, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1.2,
      })
      gsap.to(wave3Ref.current, {
        y: -1.5, x: -3, duration: 9, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 2.5,
      })

      /* Reflejo lunar en el agua */
      gsap.to(reflRef.current, {
        opacity: 0.08, scaleX: 1.2,
        duration: 6, repeat: -1, yoyo: true, ease: 'sine.inOut',
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black">

      {/* ── Filtro de grano cinematográfico ── */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="grain9">
            <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch"/>
            <feColorMatrix type="saturate" values="0"/>
            <feBlend in="SourceGraphic" mode="overlay" result="blend"/>
            <feComposite in="blend" in2="SourceGraphic" operator="in"/>
          </filter>
        </defs>
      </svg>

      {/* ── Escena SVG — cielo y mar ── */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          {/* Gradiente de cielo nocturno */}
          <linearGradient id="sky9" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#03010A"/>
            <stop offset="40%"  stopColor="#050818"/>
            <stop offset="65%"  stopColor="#070C26"/>
            <stop offset="100%" stopColor="#0A1030"/>
          </linearGradient>

          {/* Gradiente del mar */}
          <linearGradient id="sea9" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#0A2A6E"/>
            <stop offset="40%"  stopColor="#071A4A"/>
            <stop offset="100%" stopColor="#020810"/>
          </linearGradient>

          {/* Reflejo lunar */}
          <radialGradient id="lunar9" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#C8D8FF" stopOpacity="0.18"/>
            <stop offset="100%" stopColor="#C8D8FF" stopOpacity="0"/>
          </radialGradient>

          {/* Luna tenue — halo */}
          <radialGradient id="moonHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#E8EEFF" stopOpacity="0.6"/>
            <stop offset="40%"  stopColor="#C0CCFF" stopOpacity="0.15"/>
            <stop offset="100%" stopColor="#C0CCFF" stopOpacity="0"/>
          </radialGradient>

          {/* Vignette */}
          <radialGradient id="vig9" cx="50%" cy="40%" r="70%">
            <stop offset="0%"   stopColor="transparent"/>
            <stop offset="100%" stopColor="#000" stopOpacity="0.7"/>
          </radialGradient>
        </defs>

        {/* Cielo */}
        <rect width="100" height="100" fill="url(#sky9)"/>

        {/* Estrellas */}
        <g ref={starGroupRef}>
          {STARS.map(([x, y, r, op], i) => (
            <circle
              key={i}
              cx={x} cy={y * 0.62}
              r={r * 0.38}
              fill="white"
              opacity={op}
            />
          ))}
        </g>

        {/* Luna — disco muy tenue + halo */}
        <circle cx="72" cy="12" r="5.5" fill="url(#moonHalo)"/>
        <circle cx="72" cy="12" r="2.6" fill="#F0F4FF" opacity="0.85"/>
        {/* Sombra de luna para darle volumen */}
        <circle cx="73.2" cy="11.2" r="2.2" fill="#06091A" opacity="0.55"/>

        {/* Horizonte — línea muy suave */}
        <line x1="0" y1="63" x2="100" y2="63"
          stroke="#1A2050" strokeWidth="0.15" opacity="0.6"/>

        {/* Mar */}
        <rect x="0" y="63" width="100" height="37" fill="url(#sea9)"/>

        {/* Olas */}
        <path ref={wave1Ref}
          d="M0 65 Q12 63.5 25 65 Q38 66.5 50 65 Q62 63.5 75 65 Q88 66.5 100 65 L100 63 L0 63 Z"
          fill="#1A4A9A" opacity="0.45"/>
        <path ref={wave2Ref}
          d="M0 68 Q15 66.5 28 68 Q42 69.5 55 68 Q68 66.5 80 68 Q92 69.5 100 68 L100 65.5 L0 65.5 Z"
          fill="#0E2E6A" opacity="0.5"/>
        <path ref={wave3Ref}
          d="M0 72 Q20 70.8 38 72 Q55 73.2 70 72 Q85 70.8 100 72 L100 69 L0 69 Z"
          fill="#071840" opacity="0.4"/>

        {/* Reflejo lunar en el agua */}
        <ellipse ref={reflRef}
          cx="72" cy="75" rx="4" ry="12"
          fill="url(#lunar9)" opacity="0.12"/>

        {/* Vignette sobre todo */}
        <rect width="100" height="100" fill="url(#vig9)"/>
      </svg>

      {/* ── Gradientes atmosféricos CSS ── */}
      {/* Parte inferior más oscura */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none"
        style={{ background: 'linear-gradient(to top, #000 0%, transparent 100%)' }}/>
      {/* Borde superior */}
      <div className="absolute inset-x-0 top-0 h-16 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, #000 0%, transparent 100%)' }}/>

      {/* ── Grano de película ── */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '180px 180px',
        }}/>

    </main>
  )
}
