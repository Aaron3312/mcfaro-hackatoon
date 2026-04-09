'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
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

export default function Teos10Page() {
  const starGroupRef = useRef<SVGGElement>(null)
  const wave1Ref     = useRef<SVGPathElement>(null)

  const accentRef    = useRef<HTMLDivElement>(null)
  const eyebrowRef   = useRef<HTMLDivElement>(null)
  const dotRef       = useRef<HTMLDivElement>(null)
  const headlineRef  = useRef<HTMLParagraphElement>(null)
  const dividerRef   = useRef<HTMLDivElement>(null)
  const pillarsRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {

      /* ── Escena fondo ── */
      gsap.to(wave1Ref.current, {
        y: -2, duration: 5, repeat: -1, yoyo: true, ease: 'sine.inOut',
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

      /* Acento radial */
      gsap.to(accentRef.current, {
        scale: 1.05, opacity: 0.7,
        duration: 7, repeat: -1, yoyo: true, ease: 'sine.inOut',
      })

      /* ─── Secuencia de entrada ─── */
      const tl = gsap.timeline({ delay: 0.6 })

      /* Eyebrow */
      tl.fromTo(eyebrowRef.current,
        { opacity: 0, y: -8 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }
      )

      /* Punto */
      tl.fromTo(dotRef.current,
        { opacity: 0, scale: 0 },
        { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2)' },
        '-=0.2'
      )

      /* Titular */
      tl.fromTo(headlineRef.current,
        { opacity: 0, y: 18, filter: 'blur(8px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.4, ease: 'power3.out' },
        '+=0.1'
      )

      /* Divider */
      tl.fromTo(dividerRef.current,
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 0.6, ease: 'power2.out' },
        '+=0.3'
      )

      /* Tres pilares con stagger */
      tl.fromTo(
        pillarsRef.current ? Array.from(pillarsRef.current.children) : [],
        { opacity: 0, y: 24, filter: 'blur(6px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, stagger: 0.28, ease: 'power2.out' },
        '-=0.1'
      )

    })
    return () => ctx.revert()
  }, [])

  return (
    <main className="relative w-full h-screen overflow-hidden"
      style={{ background: '#04060F' }}>

      {/* ── Escena SVG ── */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full opacity-55"
      >
        <defs>
          <linearGradient id="sky10" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#02010A"/>
            <stop offset="55%"  stopColor="#060820"/>
            <stop offset="100%" stopColor="#0C1535"/>
          </linearGradient>
          <linearGradient id="sea10" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#091640"/>
            <stop offset="100%" stopColor="#020810"/>
          </linearGradient>
<radialGradient id="vig10" cx="50%" cy="40%" r="70%">
            <stop offset="0%"   stopColor="transparent"/>
            <stop offset="100%" stopColor="#000" stopOpacity="0.65"/>
          </radialGradient>
        </defs>

        <rect width="100" height="100" fill="url(#sky10)"/>

        {/* Estrellas */}
        <g ref={starGroupRef}>
          {STARS.map(([x, y, r, op], i) => (
            <circle key={i} cx={x} cy={y * 0.62} r={r * 0.38} fill="white" opacity={op}/>
          ))}
        </g>

        {/* Horizonte + Mar */}
        <line x1="0" y1="86" x2="100" y2="86" stroke="#1A2850" strokeWidth="0.12" opacity="0.5"/>
        <rect x="0" y="86" width="100" height="14" fill="url(#sea10)"/>
        <path ref={wave1Ref}
          d="M0 87.5 Q15 86.2 30 87.5 Q45 88.8 60 87.5 Q75 86.2 90 87.5 Q95 88 100 87.5 L100 86 L0 86 Z"
          fill="#1A3A7A" opacity="0.35"/>

        <rect width="100" height="100" fill="url(#vig10)"/>
      </svg>

      {/* ── Acento radial dorado ── */}
      <div ref={accentRef}
        className="absolute pointer-events-none"
        style={{
          top: '30%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: 'clamp(280px,55vw,620px)',
          height: 'clamp(280px,55vw,620px)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,208,80,0.06) 0%, transparent 70%)',
          opacity: 0.6,
        }}/>

      {/* ── Capa de texto ── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center gap-5">

        {/* Logo Ronald McDonald */}
        <div ref={eyebrowRef} className="flex flex-col items-center gap-1" style={{ opacity: 0 }}>
          <Image
            src="/images/ronalmacdonallogo1.png"
            alt="Fundación Ronald McDonald"
            width={120}
            height={60}
            className="object-contain"
            style={{ filter: 'brightness(1.1) drop-shadow(0 0 8px rgba(255,208,80,0.2))' }}
          />
        </div>

        {/* Punto decorativo */}
        <div ref={dotRef}
          className="w-1 h-1 rounded-full"
          style={{ background: 'rgba(255,208,80,0.4)', opacity: 0 }}/>

        {/* Titular */}
        <p ref={headlineRef}
          className="font-semibold leading-tight"
          style={{
            opacity: 0,
            fontSize: 'clamp(1.6rem, 5vw, 3rem)',
            color: '#FFFFFF',
            maxWidth: '18ch',
            textShadow: '0 0 40px rgba(255,208,80,0.12)',
          } as React.CSSProperties}
        >
          La familia fue{' '}
          <span style={{ color: '#F8D060' }}>seleccionada.</span>
        </p>

        {/* Divider */}
        <div ref={dividerRef}
          className="flex items-center gap-3 origin-center"
          style={{ opacity: 0 }}>
          <span className="h-px w-12" style={{ background: 'rgba(255,208,80,0.2)' }}/>
          <span className="w-1 h-1 rounded-full" style={{ background: 'rgba(255,208,80,0.4)' }}/>
          <span className="h-px w-12" style={{ background: 'rgba(255,208,80,0.2)' }}/>
        </div>

        {/* Tres pilares */}
        <div ref={pillarsRef} className="flex flex-row items-center justify-center gap-10 mt-1">

          {/* Techo */}
          <div className="flex flex-col items-center gap-3" style={{ width: '80px' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,208,80,0.08)', border: '1px solid rgba(255,208,80,0.15)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(248,208,96,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
                <path d="M9 21V12h6v9"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-center" style={{ color: 'rgba(255,255,255,0.85)' }}>
              Techo
            </span>
          </div>

          {/* Comida */}
          <div className="flex flex-col items-center gap-3" style={{ width: '80px' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,208,80,0.08)', border: '1px solid rgba(255,208,80,0.15)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(248,208,96,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
                <line x1="6" y1="1" x2="6" y2="4"/>
                <line x1="10" y1="1" x2="10" y2="4"/>
                <line x1="14" y1="1" x2="14" y2="4"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-center" style={{ color: 'rgba(255,255,255,0.85)' }}>
              Comida
            </span>
          </div>

          {/* Transporte */}
          <div className="flex flex-col items-center gap-3" style={{ width: '80px' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,208,80,0.08)', border: '1px solid rgba(255,208,80,0.15)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(248,208,96,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" rx="2"/>
                <path d="M16 8h4l3 3v5h-7V8z"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-center" style={{ color: 'rgba(255,255,255,0.85)' }}>
              Transporte
            </span>
          </div>

        </div>


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
