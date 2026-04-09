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
  [2,12,0.6,0.5],[36,7,0.8,0.7],[58,22,0.7,0.5],[71,38,1.0,0.4],
]

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F8D060" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="1" y1="1" x2="23" y2="23"/>
        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>
        <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
        <path d="M10.71 5.05A16 16 0 0 1 22.56 9"/>
        <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/>
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
        <circle cx="12" cy="20" r="1" fill="#F8D060" stroke="none"/>
      </svg>
    ),
    label: 'Offline first',
    desc: 'Citas, menú y rutina disponibles sin señal.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F8D060" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2"/>
        <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2.5"/>
      </svg>
    ),
    label: 'Sin descarga',
    desc: 'Se instala directo desde el navegador. Sin App Store.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F8D060" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10"/>
        <path d="M12 20V4"/>
        <path d="M6 20v-6"/>
      </svg>
    ),
    label: 'Rápida como app nativa',
    desc: 'Carga instantánea con Service Worker y caché inteligente.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F8D060" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
    label: 'Push notifications',
    desc: 'Recordatorio de citas 60 y 15 min antes, incluso con la app cerrada.',
  },
]

export default function Teos4Page() {
  const starGroupRef = useRef<SVGGElement>(null)
  const beamRef      = useRef<SVGGElement>(null)
  const glowRef      = useRef<SVGCircleElement>(null)
  const wave1Ref     = useRef<SVGPathElement>(null)
  const accentRef    = useRef<HTMLDivElement>(null)

  const eyebrowRef   = useRef<HTMLDivElement>(null)
  const titleRef     = useRef<HTMLDivElement>(null)
  const subtitleRef  = useRef<HTMLParagraphElement>(null)
  const dividerRef   = useRef<HTMLDivElement>(null)
  const cardsRef     = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {

      /* ── Escena fondo ── */
      gsap.to(beamRef.current, {
        rotation: 28, svgOrigin: '52 136',
        duration: 10, repeat: -1, yoyo: true, ease: 'sine.inOut',
      })
      gsap.to(glowRef.current, {
        attr: { r: 12 }, opacity: 0.5,
        duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut',
      })
      gsap.to(wave1Ref.current, {
        y: -2, duration: 4, repeat: -1, yoyo: true, ease: 'sine.inOut',
      })
      Array.from(starGroupRef.current?.querySelectorAll('circle') ?? []).forEach(s => {
        const base = parseFloat(s.getAttribute('opacity') ?? '0.7')
        gsap.to(s, {
          opacity: base * 0.08,
          duration: 1.4 + Math.random() * 3.5,
          repeat: -1, yoyo: true,
          delay: Math.random() * 6,
          ease: 'sine.inOut',
        })
      })
      gsap.to(accentRef.current, {
        scale: 1.05, opacity: 0.9,
        duration: 6, repeat: -1, yoyo: true, ease: 'sine.inOut',
      })

      /* ── Secuencia de entrada ── */
      const tl = gsap.timeline({ delay: 0.4 })

      tl.fromTo(eyebrowRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }
      )
      tl.fromTo(titleRef.current,
        { opacity: 0, y: 16, filter: 'blur(8px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.0, ease: 'power4.out' },
        '-=0.2'
      )
      tl.fromTo(subtitleRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' },
        '-=0.4'
      )
      tl.fromTo(dividerRef.current,
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 0.8, ease: 'expo.out' },
        '-=0.3'
      )

      /* Tarjetas en stagger */
      const cards = cardsRef.current?.querySelectorAll('.pwa-card')
      if (cards) {
        tl.fromTo(Array.from(cards),
          { opacity: 0, y: 28, filter: 'blur(6px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, stagger: 0.14, ease: 'power3.out' },
          '-=0.1'
        )
      }
    })

    return () => ctx.revert()
  }, [])

  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#03060f] flex items-center justify-center select-none">

      {/* ── ESCENA SVG ── */}
      <svg viewBox="0 0 400 240" className="absolute inset-0 w-full h-full opacity-50"
        preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="t4Sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#010204"/>
            <stop offset="100%" stopColor="#04071a"/>
          </linearGradient>
          <linearGradient id="t4Ocean" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#091340"/>
            <stop offset="100%" stopColor="#020510"/>
          </linearGradient>
          <linearGradient id="t4BeamC" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#F8D060" stopOpacity="0.30"/>
            <stop offset="35%"  stopColor="#F5C030" stopOpacity="0.08"/>
            <stop offset="100%" stopColor="#F5C030" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="t4BeamS" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#F8D060" stopOpacity="0.07"/>
            <stop offset="100%" stopColor="#F8D060" stopOpacity="0"/>
          </linearGradient>
          <filter id="t4Blur"><feGaussianBlur stdDeviation="4"/></filter>
          <filter id="t4Glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <rect x="0" y="0" width="400" height="240" fill="url(#t4Sky)"/>
        <ellipse cx="240" cy="65" rx="210" ry="78" fill="#05103a" opacity="0.55"/>
        <ellipse cx="85"  cy="38" rx="130" ry="52" fill="#04092a" opacity="0.45"/>
        <g ref={starGroupRef}>
          {STARS.map(([xp, yp, r, op], i) => (
            <circle key={i} cx={(xp/100)*400} cy={(yp/100)*170} r={r} fill="white" opacity={op}/>
          ))}
        </g>
        <g ref={beamRef}>
          <polygon points="52,136 460,55 460,217" fill="url(#t4BeamS)" filter="url(#t4Blur)"/>
          <polygon points="52,136 460,90 460,182" fill="url(#t4BeamC)"/>
        </g>
        <path d="M0,175 C55,170 110,180 170,174 C230,168 290,182 350,176 C375,173 400,175 400,175 L400,240 L0,240 Z" fill="url(#t4Ocean)"/>
        <path ref={wave1Ref} d="M0,179 C65,175 130,184 195,178 C260,172 325,185 400,179" stroke="rgba(70,120,220,0.12)" strokeWidth="0.7" fill="none"/>
        <g opacity="0.55">
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
          <circle ref={glowRef} cx="52" cy="136" r="8" fill="#FFF8A0" opacity="0.85" filter="url(#t4Glow)"/>
          <path d="M38,133 L52,118 L66,133 Z" fill="#856010"/>
          <path d="M41,133 L52,120 L63,133 Z" fill="#be9828"/>
        </g>
      </svg>

      {/* ── Atmósfera ── */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 50%, transparent 10%, rgba(3,6,15,0.72) 100%)' }}/>
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '60%', background: 'linear-gradient(to top, rgba(3,6,15,0.99) 0%, rgba(3,6,15,0.5) 55%, transparent 100%)' }}/>
      <div className="absolute top-0 left-0 right-0 pointer-events-none h-48"
        style={{ background: 'linear-gradient(to bottom, rgba(3,6,15,0.9) 0%, transparent 100%)' }}/>
      <div ref={accentRef} className="absolute pointer-events-none rounded-full"
        style={{ width: 'clamp(500px,80vw,1000px)', height: 'clamp(500px,80vw,1000px)',
          background: 'radial-gradient(circle, rgba(200,90,42,0.06) 0%, rgba(248,180,60,0.03) 40%, transparent 68%)',
          opacity: 0.8 }}/>
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat:'repeat', backgroundSize:'128px 128px' }}/>

      {/* ── CONTENIDO ── */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 sm:px-12 max-w-4xl w-full">

        {/* Eyebrow */}
        <div ref={eyebrowRef} style={{ opacity: 0 }} className="mb-5">
          <span className="inline-flex items-center gap-2 text-amber-200/30 text-[9px] sm:text-[11px] tracking-[0.35em] uppercase font-medium">
            <span className="w-6 h-px bg-amber-300/20"/>
            Tecnología para el contexto real
            <span className="w-6 h-px bg-amber-300/20"/>
          </span>
        </div>

        {/* Título PWA grande */}
        <div ref={titleRef} style={{ opacity: 0 }} className="mb-4">
          <h2 className="font-black tracking-tight leading-none text-white/90"
            style={{ fontSize: 'clamp(2.2rem, 7vw, 5rem)' }}>
            Progressive{' '}
            <span style={{ color: '#F8D060', textShadow: '0 0 40px rgba(248,208,80,0.25)' }}>
              Web App
            </span>
          </h2>
        </div>

        {/* Subtítulo */}
        <p ref={subtitleRef} style={{ opacity: 0 }}
          className="text-white/40 font-light leading-relaxed mb-6 max-w-lg"
          style={{ fontSize: 'clamp(0.85rem, 2vw, 1.05rem)', opacity: 0 } as React.CSSProperties}>
          Técnicamente, McFaro es una PWA.{' '}
          <span className="text-amber-200/50">
            Funciona aunque el internet falle, haciéndolo más fiable en el contexto de estas casas.
          </span>
        </p>

        {/* Separador */}
        <div ref={dividerRef} style={{ opacity: 0 }}
          className="flex items-center gap-3 mb-8 sm:mb-10 origin-center">
          <div className="h-px w-10 sm:w-20" style={{ background: 'linear-gradient(to right, transparent, rgba(248,208,80,0.3))' }}/>
          <div className="w-1 h-1 rounded-full" style={{ background: 'rgba(248,208,80,0.5)' }}/>
          <div className="h-px w-10 sm:w-20" style={{ background: 'linear-gradient(to left, transparent, rgba(248,208,80,0.3))' }}/>
        </div>

        {/* Grid 2×2 de características PWA */}
        <div ref={cardsRef} className="grid grid-cols-2 gap-3 sm:gap-4 w-full">
          {FEATURES.map(({ icon, label, desc }) => (
            <div key={label} className="pwa-card flex items-start gap-3 sm:gap-4 text-left rounded-xl p-4 sm:p-5"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(248,208,80,0.09)',
                backdropFilter: 'blur(6px)',
                opacity: 0,
              }}>
              {/* Ícono */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: 'rgba(248,208,80,0.07)', border: '1px solid rgba(248,208,80,0.13)' }}>
                {icon}
              </div>
              {/* Texto */}
              <div className="min-w-0">
                <p className="text-white/85 font-semibold leading-tight mb-1"
                  style={{ fontSize: 'clamp(0.78rem, 1.8vw, 1rem)' }}>
                  {label}
                </p>
                <p className="text-white/30 font-light leading-relaxed"
                  style={{ fontSize: 'clamp(0.7rem, 1.4vw, 0.85rem)' }}>
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  )
}
