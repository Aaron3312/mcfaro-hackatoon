'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/* ─── Paleta de marca ─────────────────────────────────────────────── */
const SKIN    = '#d8bc96'
const AMBER   = '#F5C842'
const ORANGE  = '#E87A3A'
const OR_DARK = '#C85A2A'
const BG      = '#05091a'

/* ─────────────────────────────────────────────────────────────────────
   SUB-COMPONENTES SVG reutilizables
   Todos con origen en los pies del personaje para facilitar posicionado
   ───────────────────────────────────────────────────────────────────── */

/* Adulto parado — ~82 px alto en scale(1) */
function Adult({
  id, cls, x, y, s = 1, fill = SKIN, op,
}: { id?: string; cls?: string; x: number; y: number; s?: number; fill?: string; op?: number }) {
  return (
    <g id={id} className={cls} transform={`translate(${x},${y}) scale(${s})`} fill={fill} opacity={op}>
      <circle cx="0" cy="-60" r="10" />
      <path d="M-13,-48 C-14,-22 14,-22 13,-48 L12,0 L-12,0 Z" />
      <rect x="-12" y="-2" width="9"   height="24" rx="4.5" />
      <rect x="3"   y="-2" width="9"   height="24" rx="4.5" />
    </g>
  )
}

/* Niño parado — ~60 px alto en scale(1) */
function Child({
  id, cls, x, y, s = 1, fill = SKIN, op,
}: { id?: string; cls?: string; x: number; y: number; s?: number; fill?: string; op?: number }) {
  return (
    <g id={id} className={cls} transform={`translate(${x},${y}) scale(${s})`} fill={fill} opacity={op}>
      <circle cx="0" cy="-43" r="7.5" />
      <path d="M-10,-34 C-10,-14 10,-14 10,-34 L8,0 L-8,0 Z" />
      <rect x="-8"  y="-2" width="6.5" height="17" rx="3.2" />
      <rect x="1.5" y="-2" width="6.5" height="17" rx="3.2" />
    </g>
  )
}

/* Faro completo — origen en la base */
function Lighthouse({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      {/* Base */}
      <ellipse cx="0" cy="-2" rx="28" ry="8" fill="#0a0e22" />
      <path d="M-24,-10 C-24,-18 24,-18 24,-10 L28,-2 L-28,-2 Z" fill="#0d1128" />
      <rect x="-30" y="-16" width="60" height="7" rx="2" fill="#1e1e3a" />
      {/* Torre */}
      <rect x="-11" y="-130" width="22" height="120" rx="2" fill="#cdb88e" />
      <rect x="-9"  y="-130" width="18" height="120" rx="1" fill="#dcc9a2" />
      <rect x="-11" y="-107" width="22" height="4"   rx="1" fill="#a07848" opacity="0.8" />
      <rect x="-11" y="-88"  width="22" height="4"   rx="1" fill="#a07848" opacity="0.8" />
      <rect x="-11" y="-70"  width="22" height="4"   rx="1" fill="#a07848" opacity="0.8" />
      {/* Galería */}
      <rect x="-14" y="-134" width="28" height="5"  rx="1" fill="#8b6914" />
      <rect x="-13" y="-136" width="26" height="2"  rx="0.5" fill="#c4a030" />
      {/* Linterna */}
      <rect x="-13" y="-157" width="26" height="24" rx="2" fill="#141c40" />
      <rect x="-10" y="-154" width="10" height="18" rx="1" fill="#2040a0" opacity="0.7" />
      <rect x="1"   y="-154" width="10" height="18" rx="1" fill="#2040a0" opacity="0.7" />
      <rect x="-8"  y="-151" width="16" height="12" rx="0.5" fill="#FFFBC0" />
      <circle cx="0" cy="-145" r="12" fill="#FFF8A0" opacity="0.9"
        style={{ filter: 'blur(5px)' }} />
      {/* Cúpula */}
      <path d="M-16,-157 L0,-176 L16,-157 Z" fill="#8b6914" />
      <path d="M-13,-157 L0,-173 L13,-157 Z" fill="#c4a030" />
      <line x1="0" y1="-176" x2="0" y2="-184" stroke="#888" strokeWidth="1" />
      <circle cx="0" cy="-184" r="1.2" fill="#aaa" />
    </g>
  )
}

/* Haz de luz (polígono que rota alrededor del punto del faro) */
function Beam({ id, ox, oy }: { id: string; ox: number; oy: number }) {
  return (
    <g id={id} style={{ transformOrigin: `${ox}px ${oy}px` }}>
      {/* Halo suave */}
      <polygon
        points={`${ox},${oy} ${ox + 1400},${oy - 320} ${ox + 1400},${oy + 320}`}
        fill="url(#stBeamSoft)"
        style={{ filter: 'blur(18px)' }}
        opacity="0.55"
      />
      {/* Núcleo */}
      <polygon
        points={`${ox},${oy} ${ox + 1400},${oy - 180} ${ox + 1400},${oy + 180}`}
        fill="url(#stBeamCore)"
      />
    </g>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
   ═══════════════════════════════════════════════════════════════════ */
export function StorySection() {
  const sectionRef     = useRef<HTMLElement>(null)
  const progressFill   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Pequeño delay para que Next.js termine de pintar
    const initTimer = setTimeout(() => {
      const ctx = gsap.context(() => {

        /* ─── Indicador de progreso lateral ─── */
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: self => {
            if (progressFill.current) {
              gsap.set(progressFill.current, {
                scaleY: self.progress,
                transformOrigin: 'top center',
              })
            }
          },
        })

        /* ══════════════════════════════════════════════════════════
           BEAT 1 — La familia García
           ══════════════════════════════════════════════════════════ */
        gsap.timeline({
          scrollTrigger: {
            trigger: '#beat-1',
            start: 'top top',
            end: '+=100%',
            pin: true,
            scrub: 1,
          },
        })
          .to('#b1-beam',
            { rotation: 22, svgOrigin: '220 718', duration: 0.5 })
          .fromTo('#b1-spot',
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.4, transformOrigin: '720px 690px' }, '<+0.15')
          .fromTo(['#b1-pa', '#b1-ma'],
            { opacity: 0 }, { opacity: 1, stagger: 0.15, duration: 0.3 }, '-=0.15')
          .fromTo(['#b1-h1', '#b1-h2', '#b1-sof'],
            { opacity: 0 }, { opacity: 1, stagger: 0.1, duration: 0.2 }, '-=0.1')
          .fromTo('#b1-shop',
            { opacity: 0, scale: 0.9 },
            { opacity: 1, scale: 1, duration: 0.2, transformOrigin: '620px 760px' }, '-=0.1')
          .fromTo('.b1t',
            { opacity: 0, y: 14 }, { opacity: 1, y: 0, stagger: 0.18, duration: 0.3 })

        /* ══════════════════════════════════════════════════════════
           BEAT 2 — El diagnóstico
           ══════════════════════════════════════════════════════════ */
        gsap.timeline({
          scrollTrigger: {
            trigger: '#beat-2',
            start: 'top top',
            end: '+=120%',
            pin: true,
            scrub: 1,
          },
        })
          .fromTo('.b2-fam',
            { opacity: 0 }, { opacity: 1, stagger: 0.08, duration: 0.3 })
          .to(['#b2-pa', '#b2-ma', '#b2-h1', '#b2-h2'],
            { opacity: 0.12, duration: 0.4 }, '-=0.1')
          .fromTo('#b2-cross',
            { opacity: 0, scale: 0.5 },
            { opacity: 1, scale: 1, duration: 0.35, transformOrigin: '720px 300px' })
          .fromTo('#b2-sname',
            { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.25 })
          .fromTo('.b2-ltr',
            { opacity: 0 }, { opacity: 1, stagger: 0.04, duration: 0.45 })
          .fromTo('#b2-sub',
            { opacity: 0 }, { opacity: 1, duration: 0.3 })

        /* ══════════════════════════════════════════════════════════
           BEAT 3 — La incertidumbre
           ══════════════════════════════════════════════════════════ */
        gsap.timeline({
          scrollTrigger: {
            trigger: '#beat-3',
            start: 'top top',
            end: '+=120%',
            pin: true,
            scrub: 1,
          },
        })
          .fromTo('#b3-pa',  { opacity: 0 }, { opacity: 1, duration: 0.3 })
          .fromTo('#b3-q1',  { opacity: 0 }, { opacity: 1, duration: 0.2 })
          .fromTo('.b3t-1',  { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.25 })
          .fromTo('#b3-q2',  { opacity: 0 }, { opacity: 1, duration: 0.2 })
          .fromTo('.b3t-2',  { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.25 })
          .fromTo('#b3-q3',  { opacity: 0 }, { opacity: 1, duration: 0.2 })
          .fromTo('.b3t-3',  { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.25 })

        ScrollTrigger.create({
          trigger: '#beat-3',
          start: 'top 65%',
          onEnter: () =>
            gsap.to(['#b3-q1', '#b3-q2', '#b3-q3'], {
              y: '-=22', duration: 2.2, repeat: -1, yoyo: true,
              ease: 'sine.inOut', stagger: 0.5,
            }),
        })

        /* ══════════════════════════════════════════════════════════
           BEAT 4 — El faro los ilumina
           ══════════════════════════════════════════════════════════ */
        gsap.timeline({
          scrollTrigger: {
            trigger: '#beat-4',
            start: 'top top',
            end: '+=130%',
            pin: true,
            scrub: 1,
          },
        })
          .fromTo('#b4-beam',
            { rotation: -12, svgOrigin: '220 718' },
            { rotation: 18, svgOrigin: '220 718', duration: 0.55 })
          .fromTo('#b4-glow',
            { opacity: 0, scale: 0.3 },
            { opacity: 1, scale: 1, duration: 0.4, transformOrigin: '720px 680px' }, '<+0.2')
          .fromTo(['#b4-pa', '#b4-sof'],
            { opacity: 0.04 }, { opacity: 1, stagger: 0.12, duration: 0.35 }, '-=0.2')
          .fromTo('.b4t',
            { opacity: 0, y: 18 }, { opacity: 1, y: 0, stagger: 0.2, duration: 0.35 })

        /* ══════════════════════════════════════════════════════════
           BEAT 5 — Llegaron a Casa
           ══════════════════════════════════════════════════════════ */
        gsap.timeline({
          scrollTrigger: {
            trigger: '#beat-5',
            start: 'top top',
            end: '+=120%',
            pin: true,
            scrub: 1,
          },
        })
          .fromTo('#b5-house',
            { opacity: 0, scale: 0.88 },
            { opacity: 1, scale: 1, duration: 0.4, transformOrigin: '720px 700px' })
          .to('#b5-winL', { fill: AMBER, duration: 0.25 }, '-=0.1')
          .to('#b5-winR', { fill: AMBER, duration: 0.25 }, '<+0.08')
          .fromTo(['#b5-pa', '#b5-sof'],
            { x: 420, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.1, duration: 0.5 }, '-=0.1')
          .to('#b5-door',
            { rotation: -50, transformOrigin: '580px 700px', duration: 0.3 }, '-=0.15')
          .fromTo('.b5t',
            { opacity: 0, y: 12 }, { opacity: 1, y: 0, stagger: 0.2, duration: 0.3 })

        /* ══════════════════════════════════════════════════════════
           BEAT 6 — El registro con mcFaro
           ══════════════════════════════════════════════════════════ */
        gsap.timeline({
          scrollTrigger: {
            trigger: '#beat-6',
            start: 'top top',
            end: '+=110%',
            pin: true,
            scrub: 1,
          },
        })
          .fromTo('#b6-desk', { opacity: 0 }, { opacity: 1, duration: 0.3 })
          .fromTo('#b6-phone',
            { y: 90, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45 }, '-=0.1')
          .fromTo('#b6-icon',
            { opacity: 0, scale: 0.4 },
            { opacity: 1, scale: 1, duration: 0.3, transformOrigin: '920px 360px' }, '-=0.1')
          .fromTo('.b6-card',
            { opacity: 0, y: 12 }, { opacity: 1, y: 0, stagger: 0.12, duration: 0.25 })
          .fromTo('.b6t',
            { opacity: 0, y: 12 }, { opacity: 1, y: 0, stagger: 0.2, duration: 0.3 })

        /* ══════════════════════════════════════════════════════════
           BEAT 7 — ¿Qué comen hoy?
           ══════════════════════════════════════════════════════════ */
        gsap.timeline({
          scrollTrigger: {
            trigger: '#beat-7',
            start: 'top top',
            end: '+=130%',
            pin: true,
            scrub: 1,
          },
        })
          .fromTo('#b7-pa', { opacity: 0 }, { opacity: 1, duration: 0.3 })
          .fromTo('#b7-bubble',
            { opacity: 0, scale: 0.7 },
            { opacity: 1, scale: 1, duration: 0.4, transformOrigin: '560px 580px' })
          .fromTo('#b7-plate',
            { opacity: 0, scale: 0.4 },
            { opacity: 1, scale: 1, duration: 0.3, transformOrigin: '480px 660px' })
          .fromTo('#b7-notif',
            { x: 70, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45 }, '<+0.1')
          .fromTo('.b7t',
            { opacity: 0, y: 10 }, { opacity: 1, y: 0, stagger: 0.18, duration: 0.3 })

        ScrollTrigger.create({
          trigger: '#beat-7',
          start: 'top 60%',
          onEnter: () =>
            gsap.to('#b7-plate', {
              scale: 1.06, transformOrigin: '480px 660px',
              duration: 1.4, repeat: -1, yoyo: true, ease: 'sine.inOut',
            }),
        })

        /* ══════════════════════════════════════════════════════════
           BEAT 8 — El tratamiento / transporte
           ══════════════════════════════════════════════════════════ */
        gsap.timeline({
          scrollTrigger: {
            trigger: '#beat-8',
            start: 'top top',
            end: '+=110%',
            pin: true,
            scrub: 1,
          },
        })
          .fromTo('#b8-hosp', { opacity: 0 }, { opacity: 1, duration: 0.3 })
          .fromTo('#b8-van',
            { x: -340, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5 })
          .fromTo(['#b8-pa', '#b8-sof'],
            { opacity: 0 }, { opacity: 1, stagger: 0.1, duration: 0.3 }, '-=0.2')
          .to(['#b8-pa', '#b8-sof'],
            { x: -80, opacity: 0, duration: 0.3 })
          .to('#b8-van', { x: 360, duration: 0.45 })
          .fromTo('.b8t',
            { opacity: 0, y: 10 }, { opacity: 1, y: 0, stagger: 0.2, duration: 0.3 }, '<')

        /* ══════════════════════════════════════════════════════════
           BEAT 9 — Papá no estaba solo
           ══════════════════════════════════════════════════════════ */
        gsap.timeline({
          scrollTrigger: {
            trigger: '#beat-9',
            start: 'top top',
            end: '+=130%',
            pin: true,
            scrub: 1,
          },
        })
          .fromTo('#b9-pa',  { opacity: 0 }, { opacity: 1, duration: 0.3 })
          .fromTo('#b9-beam',
            { rotation: -8, svgOrigin: '220 718' },
            { rotation: 28, svgOrigin: '220 718', duration: 0.45 }, '-=0.1')
          .fromTo(['#b9-o1', '#b9-o2', '#b9-o3'],
            { opacity: 0 }, { opacity: 1, stagger: 0.15, duration: 0.3 })
          .fromTo('#b9-hand',
            { opacity: 0, scaleX: 0 },
            { opacity: 1, scaleX: 1, duration: 0.3, transformOrigin: '740px 660px' })
          .fromTo('.b9t',
            { opacity: 0, y: 10 }, { opacity: 1, y: 0, stagger: 0.2, duration: 0.35 })

        /* ══════════════════════════════════════════════════════════
           BEAT 10 — Sofía jugó hoy
           ══════════════════════════════════════════════════════════ */
        gsap.timeline({
          scrollTrigger: {
            trigger: '#beat-10',
            start: 'top top',
            end: '+=120%',
            pin: true,
            scrub: 1,
          },
        })
          .fromTo(['#b10-c1', '#b10-c2', '#b10-c3'],
            { opacity: 0 }, { opacity: 1, stagger: 0.15, duration: 0.3 })
          .fromTo('#b10-ball',
            { opacity: 0, scale: 0 },
            { opacity: 1, scale: 1, duration: 0.25, transformOrigin: '720px 720px' })
          .fromTo('#b10-sof',
            { x: 340, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45 })
          .fromTo('.b10t',
            { opacity: 0, y: 18 }, { opacity: 1, y: 0, stagger: 0.28, duration: 0.45 })

        ScrollTrigger.create({
          trigger: '#beat-10',
          start: 'top 65%',
          onEnter: () =>
            gsap.to(['#b10-c1', '#b10-c2', '#b10-c3'], {
              y: -12, duration: 0.52, repeat: -1, yoyo: true,
              ease: 'power2.inOut', stagger: 0.16,
            }),
        })

        /* ══════════════════════════════════════════════════════════
           BEAT 11 — El camino iluminado
           ══════════════════════════════════════════════════════════ */
        gsap.timeline({
          scrollTrigger: {
            trigger: '#beat-11',
            start: 'top top',
            end: '+=150%',
            pin: true,
            scrub: 1,
          },
        })
          .fromTo('.b11-fam',
            { opacity: 0.04 }, { opacity: 1, stagger: 0.14, duration: 0.45 })
          .fromTo('#b11t-1',
            { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35 })
          .fromTo('#b11t-2',
            { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35 })
          .fromTo('#b11t-3',
            { opacity: 0, y: 14, scale: 0.94 },
            { opacity: 1, y: 0, scale: 1, duration: 0.4 })

        ScrollTrigger.create({
          trigger: '#beat-11',
          start: 'top 65%',
          onEnter: () =>
            gsap.to('.b11-glow', {
              opacity: 0.55, scale: 1.12,
              duration: 2.2, repeat: -1, yoyo: true,
              ease: 'sine.inOut', stagger: 0.35,
              transformOrigin: 'center',
            }),
        })

        /* ══════════════════════════════════════════════════════════
           BEAT 12 — La app (product reveal)
           ══════════════════════════════════════════════════════════ */
        gsap.timeline({
          scrollTrigger: {
            trigger: '#beat-12',
            start: 'top top',
            end: '+=130%',
            pin: true,
            scrub: 1,
          },
        })
          .fromTo('#b12-phone',
            { y: 110, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45 })
          .fromTo('.b12-card',
            { opacity: 0, y: 14 }, { opacity: 1, y: 0, stagger: 0.14, duration: 0.28 })
          .fromTo('.b12t',
            { opacity: 0, y: 10 }, { opacity: 1, y: 0, stagger: 0.2, duration: 0.3 })
          .fromTo('#b12-cta',
            { opacity: 0, scale: 0.88 },
            { opacity: 1, scale: 1, duration: 0.3, transformOrigin: 'center' })

        ScrollTrigger.create({
          trigger: '#beat-12',
          start: 'top 60%',
          onEnter: () =>
            gsap.to('#b12-cta', {
              y: -4, duration: 1.6, repeat: -1, yoyo: true, ease: 'sine.inOut',
            }),
        })

      }, sectionRef)

      return () => ctx.revert()
    }, 80)

    return () => clearTimeout(initTimer)
  }, [])

  /* ════════════════════════════════════════════════════════════════════
     JSX — 12 panels
     ════════════════════════════════════════════════════════════════════ */
  return (
    <section ref={sectionRef} className="relative">

      {/* Indicador de progreso — fixed, lateral derecho */}
      <div
        className="fixed right-3 sm:right-5 top-1/2 -translate-y-1/2 z-50 h-36 w-[3px] rounded-full overflow-hidden"
        style={{ background: 'rgba(245,200,66,0.12)' }}
      >
        <div
          ref={progressFill}
          className="w-full rounded-full"
          style={{ background: AMBER, height: '100%', transform: 'scaleY(0)', transformOrigin: 'top' }}
        />
      </div>

      {/* ─── SVG defs compartidos (invisible) ─── */}
      <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden="true">
        <defs>
          <linearGradient id="stBeamCore" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#F8D060" stopOpacity="0.88" />
            <stop offset="45%"  stopColor="#F5C030" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#F5C030" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="stBeamSoft" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#F8D060" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#F8D060" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="stOcean" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#1c1008" />
            <stop offset="100%" stopColor="#0a0603" />
          </linearGradient>
          <radialGradient id="stSpot" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#F5C842" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#F5C842" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="stGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#F5C842" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#F5C842" stopOpacity="0" />
          </radialGradient>
          <filter id="stSoftBlur">
            <feGaussianBlur stdDeviation="16" />
          </filter>
          <filter id="stGlowF" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
      </svg>

      {/* ══════════════════════════════════════════════════════════════
          BEAT 1 — LA FAMILIA GARCÍA
          ══════════════════════════════════════════════════════════════ */}
      <div
        id="beat-1"
        className="relative min-h-screen w-full overflow-hidden flex flex-col items-center"
        style={{ background: BG }}
      >
        <svg viewBox="0 0 1440 900" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          {/* Estrellas fijas */}
          {[[80,60],[200,30],[400,90],[600,40],[800,70],[1000,30],[1100,80],[1300,50],[1380,100],[160,130],[480,120],[750,100],[950,140],[1200,110]].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="1.2" fill="white" opacity="0.55" />
          ))}
          {/* Faro */}
          <Lighthouse x={220} y={880} s={0.9} />
          {/* Haz */}
          <Beam id="b1-beam" ox={220} oy={718} />
          {/* Spotlight circle */}
          <circle id="b1-spot" cx="720" cy="700" r="220" fill="url(#stSpot)" />
          {/* Horizonte / océano */}
          <path d="M0,790 C200,782 400,800 600,792 C800,784 1100,802 1440,790 L1440,900 L0,900 Z" fill="url(#stOcean)" />
          {/* Familia */}
          <Adult id="b1-pa"  x={640} y={760} s={1.05} op={0} />
          <Adult id="b1-ma"  x={700} y={760} s={1.0}  op={0} />
          <Child id="b1-h1"  x={748} y={770} s={0.9}  op={0} />
          <Child id="b1-h2"  x={784} y={773} s={0.82} op={0} />
          <Child id="b1-sof" x={680} y={773} s={0.78} op={0} />
          {/* Tiendita */}
          <g id="b1-shop" opacity="0" transform="translate(550,670)">
            <rect x="0" y="0" width="260" height="110" rx="4" fill="#1a0e06" />
            <path d="M-8,-18 L268,-18 L260,8 L0,8 Z" fill={OR_DARK} opacity="0.9" />
            <rect x="18" y="16" width="90" height="55" rx="2" fill="#1a3060" opacity="0.75" />
            <rect x="150" y="22" width="68" height="88" rx="2" fill="#3a2010" />
            <rect x="26" y="22" width="74" height="12" rx="2" fill="none" stroke={AMBER} strokeWidth="1.2" />
            <text x="63" y="32" textAnchor="middle" fill={AMBER} fontSize="8.5" fontFamily="sans-serif" letterSpacing="1">ABARROTES</text>
          </g>
        </svg>

        {/* Texto — parte inferior */}
        <div className="relative z-10 mt-auto pb-14 sm:pb-20 text-center px-6 max-w-lg mx-auto">
          <p className="b1t text-amber-300/55 text-[11px] sm:text-xs tracking-[0.3em] uppercase mb-3" style={{ opacity: 0 }}>
            Una historia real
          </p>
          <h2 className="b1t text-white font-bold text-4xl sm:text-5xl md:text-6xl mb-4 leading-tight" style={{ opacity: 0 }}>
            Los García
          </h2>
          <p className="b1t text-[#F7EDD5]/60 text-base sm:text-xl leading-relaxed" style={{ opacity: 0 }}>
            Una familia de cinco. Una tiendita de abarrotes.<br className="hidden sm:block" /> El día a día.
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          BEAT 2 — EL DIAGNÓSTICO
          ══════════════════════════════════════════════════════════════ */}
      <div
        id="beat-2"
        className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center"
        style={{ background: BG }}
      >
        <svg viewBox="0 0 1440 900" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          {/* Cruz hospital */}
          <g id="b2-cross" opacity="0" style={{ transformOrigin: '720px 300px' }}>
            <rect x="705" y="255" width="30" height="90" rx="6" fill="#8B2020" opacity="0.85" />
            <rect x="675" y="285" width="90" height="30" rx="6" fill="#8B2020" opacity="0.85" />
          </g>
          {/* Halo suave bajo Sofía */}
          <circle cx="700" cy="745" r="140" fill="url(#stGlow)" opacity="0.7" />
          {/* Familia — la mayoría oscurecida */}
          <Adult cls="b2-fam" id="b2-pa"  x={610} y={760} s={1.05} fill="#3a2a1a" op={0} />
          <Adult cls="b2-fam" id="b2-ma"  x={668} y={760} s={1.0}  fill="#3a2a1a" op={0} />
          <Child cls="b2-fam" id="b2-h1"  x={750} y={770} s={0.9}  fill="#3a2a1a" op={0} />
          <Child cls="b2-fam" id="b2-h2"  x={786} y={773} s={0.82} fill="#3a2a1a" op={0} />
          {/* Sofía — iluminada */}
          <Child cls="b2-fam" id="b2-sof" x={700} y={772} s={0.8}  fill={SKIN}    op={0} />
          {/* Horizonte */}
          <path d="M0,800 C240,792 480,808 720,800 C960,792 1200,808 1440,800 L1440,900 L0,900 Z" fill="#0c0806" />
        </svg>

        <div className="relative z-10 text-center px-6 flex flex-col items-center gap-4 sm:gap-6">
          <h2 id="b2-sname" className="text-white font-bold text-6xl sm:text-8xl md:text-9xl" style={{ opacity: 0 }}>
            Sofía
          </h2>
          {/* "leucemia" letra a letra */}
          <div className="flex gap-0.5 sm:gap-1" aria-label="leucemia">
            {'leucemia'.split('').map((l, i) => (
              <span
                key={i}
                className="b2-ltr font-light text-2xl sm:text-4xl md:text-5xl"
                style={{ color: '#7a1a1a', opacity: 0 }}
              >
                {l}
              </span>
            ))}
          </div>
          <p id="b2-sub" className="text-[#F7EDD5]/45 text-sm sm:text-lg max-w-xs sm:max-w-sm leading-relaxed mt-1" style={{ opacity: 0 }}>
            La noticia que nadie quiere escuchar.
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          BEAT 3 — LA INCERTIDUMBRE
          ══════════════════════════════════════════════════════════════ */}
      <div
        id="beat-3"
        className="relative min-h-screen w-full overflow-hidden flex items-center"
        style={{ background: BG }}
      >
        <svg viewBox="0 0 1440 900" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          {/* Papá solo, cabizbajo */}
          <Adult id="b3-pa" x={400} y={760} s={1.1} fill="#6a5a4a" op={0} />
          {/* Signos de pregunta flotantes */}
          <g id="b3-q1" opacity="0" transform="translate(340,530)">
            <circle cx="0" cy="0" r="44" fill="none" stroke="#3a4a7a" strokeWidth="2" opacity="0.6" />
            <text x="0" y="16" textAnchor="middle" fill="#5a6a9a" fontSize="44" fontFamily="Georgia,serif" fontWeight="bold">?</text>
          </g>
          <g id="b3-q2" opacity="0" transform="translate(480,450)">
            <circle cx="0" cy="0" r="36" fill="none" stroke="#3a4a7a" strokeWidth="2" opacity="0.6" />
            <text x="0" y="13" textAnchor="middle" fill="#5a6a9a" fontSize="36" fontFamily="Georgia,serif" fontWeight="bold">?</text>
          </g>
          <g id="b3-q3" opacity="0" transform="translate(410,370)">
            <circle cx="0" cy="0" r="30" fill="none" stroke="#3a4a7a" strokeWidth="2" opacity="0.6" />
            <text x="0" y="11" textAnchor="middle" fill="#5a6a9a" fontSize="30" fontFamily="Georgia,serif" fontWeight="bold">?</text>
          </g>
          <path d="M0,800 C300,792 600,808 900,800 C1100,793 1300,806 1440,800 L1440,900 L0,900 Z" fill="#0c0806" />
        </svg>

        {/* Texto — derecha */}
        <div className="relative z-10 ml-auto w-full sm:w-1/2 px-8 sm:px-12 md:px-16 py-16 flex flex-col justify-center gap-6">
          <p className="text-[#F7EDD5]/50 text-xs sm:text-sm uppercase tracking-widest mb-2">
            El golpe no fue solo médico.
          </p>
          <p className="b3t-1 text-white/80 text-xl sm:text-2xl md:text-3xl font-light leading-snug" style={{ opacity: 0 }}>
            ¿Dónde vamos<br /><span className="text-white font-semibold">a dormir?</span>
          </p>
          <p className="b3t-2 text-white/80 text-xl sm:text-2xl md:text-3xl font-light leading-snug" style={{ opacity: 0 }}>
            ¿Qué vamos<br /><span className="text-white font-semibold">a comer?</span>
          </p>
          <p className="b3t-3 text-white/80 text-xl sm:text-2xl md:text-3xl font-light leading-snug" style={{ opacity: 0 }}>
            ¿Cómo llegamos<br /><span className="text-white font-semibold">al hospital?</span>
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          BEAT 4 — EL FARO LOS ILUMINA (pico emocional)
          ══════════════════════════════════════════════════════════════ */}
      <div
        id="beat-4"
        className="relative min-h-screen w-full overflow-hidden flex flex-col items-center"
        style={{ background: BG }}
      >
        <svg viewBox="0 0 1440 900" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          {[[80,55],[250,28],[430,80],[620,38],[830,65],[1020,25],[1110,78],[1290,45],[1370,98],[170,125],[460,115],[740,98],[940,138],[1190,108]].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="1.2" fill="white" opacity="0.5" />
          ))}
          <Lighthouse x={220} y={880} s={0.9} />
          <Beam id="b4-beam" ox={220} oy={718} />
          {/* Glow cálido sobre los dos */}
          <circle id="b4-glow" cx="720" cy="700" r="200" fill="url(#stGlow)" opacity="0" style={{ transformOrigin: '720px 700px' }} />
          {/* Papá + Sofía */}
          <Adult id="b4-pa"  x={700} y={760} s={1.05} fill={SKIN} op={0.04} />
          <Child id="b4-sof" x={744} y={770} s={0.82} fill={SKIN} op={0.04} />
          {/* Línea de la mano */}
          <line x1="710" y1="718" x2="736" y2="724" stroke={SKIN} strokeWidth="5" strokeLinecap="round" opacity="0.4" />
          <path d="M0,800 C200,792 480,806 720,800 C960,793 1200,808 1440,800 L1440,900 L0,900 Z" fill="url(#stOcean)" />
        </svg>

        <div className="relative z-10 mt-auto pb-16 sm:pb-24 text-center px-6">
          <h2 className="b4t text-white font-bold text-5xl sm:text-7xl md:text-8xl mb-3 leading-none" style={{ opacity: 0 }}>
            mc<span style={{ color: ORANGE }}>Faro</span>
          </h2>
          <p className="b4t text-amber-200/75 text-base sm:text-xl md:text-2xl max-w-sm mx-auto leading-relaxed" style={{ opacity: 0 }}>
            Iluminando el camino<br />desde el primer momento.
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          BEAT 5 — LLEGARON A CASA
          ══════════════════════════════════════════════════════════════ */}
      <div
        id="beat-5"
        className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center"
        style={{ background: BG }}
      >
        <svg viewBox="0 0 1440 900" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          {/* Casa Ronald McDonald */}
          <g id="b5-house" opacity="0" style={{ transformOrigin: '720px 700px' }}>
            {/* Estructura */}
            <rect x="490" y="570" width="460" height="230" rx="4" fill="#1c1206" />
            {/* Techo */}
            <path d="M470,574 L720,400 L970,574 Z" fill="#2a1a0a" />
            <path d="M478,574 L720,412 L962,574 Z" fill="#3a2414" />
            {/* Puerta */}
            <rect id="b5-door" x="680" y="640" width="80" height="160" rx="3" fill="#5a3520" />
            <circle cx="748" cy="720" r="5" fill={AMBER} opacity="0.8" />
            {/* Ventanas — comienzan oscuras */}
            <rect id="b5-winL" x="510" y="600" width="120" height="100" rx="4" fill="#0a0806" />
            <rect id="b5-winR" x="810" y="600" width="120" height="100" rx="4" fill="#0a0806" />
            {/* Cruz de Casa Ronald — pequeña */}
            <rect x="706" y="575" width="28" height="8" rx="2" fill={OR_DARK} opacity="0.9" />
            <rect x="716" y="570" width="8" height="18" rx="2" fill={OR_DARK} opacity="0.9" />
            {/* Suelo */}
            <rect x="460" y="798" width="520" height="6" rx="3" fill="#1a1008" />
          </g>
          {/* Papá + Sofía caminando */}
          <Adult id="b5-pa"  x={900} y={760} s={1.0}  fill={SKIN} op={0} />
          <Child id="b5-sof" x={936} y={770} s={0.8}  fill={SKIN} op={0} />
          <path d="M0,808 C360,800 720,815 1080,808 C1260,804 1380,812 1440,808 L1440,900 L0,900 Z" fill="#0c0806" />
        </svg>

        <div className="relative z-10 mt-auto pb-14 sm:pb-20 text-center px-6">
          <h2 className="b5t text-white font-bold text-3xl sm:text-5xl md:text-6xl mb-3" style={{ opacity: 0 }}>
            Casa Ronald McDonald
          </h2>
          <p className="b5t text-[#F7EDD5]/60 text-base sm:text-xl max-w-sm mx-auto leading-relaxed" style={{ opacity: 0 }}>
            Un lugar seguro. Una cama. Un techo.
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          BEAT 6 — EL REGISTRO CON mcFARO
          ══════════════════════════════════════════════════════════════ */}
      <div
        id="beat-6"
        className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center"
        style={{ background: BG }}
      >
        <svg viewBox="0 0 1440 900" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          {/* Escritorio — coordinadora */}
          <g id="b6-desk" opacity="0">
            <rect x="80" y="580" width="500" height="160" rx="6" fill="#1a1206" />
            <rect x="80" y="576" width="500" height="10"  rx="3" fill="#2a1a0a" />
            {/* Monitor */}
            <rect x="140" y="390" width="280" height="190" rx="6" fill="#141c30" />
            <rect x="150" y="400" width="260" height="170" rx="4" fill="#1a2a50" opacity="0.8" />
            <rect x="260" y="578" width="40"  height="12"  rx="2" fill="#1a1206" />
            {/* Persona coordinadora */}
            <Adult x={330} y={580} s={0.95} fill="#b8a090" />
            {/* Logo en camiseta */}
            <text x="330" y="542" textAnchor="middle" fill={OR_DARK} fontSize="11" fontFamily="sans-serif" fontWeight="bold">mcF</text>
          </g>

          {/* Teléfono con mcFaro */}
          <g id="b6-phone" opacity="0" transform="translate(840,200)">
            {/* Cuerpo del teléfono */}
            <rect x="0" y="0" width="200" height="420" rx="24" fill="#1a1206" />
            <rect x="4" y="4" width="192" height="412" rx="21" fill="#0d1020" />
            {/* Pantalla */}
            <rect x="10" y="10" width="180" height="400" rx="18" fill="#06091a" />
            {/* Header de la app */}
            <rect x="10" y="10"  width="180" height="60" rx="18" fill={OR_DARK} />
            <rect x="10" y="50"  width="180" height="20" fill={OR_DARK} />
            <text x="100" y="48" textAnchor="middle" fill="white" fontSize="16" fontFamily="sans-serif" fontWeight="bold">mcFaro</text>
            {/* Logo faro en el header */}
            <g id="b6-icon" transform="translate(28,28)" opacity="0" style={{ transformOrigin: '920px 360px' }}>
              <rect x="-4" y="-12" width="8" height="16" rx="1" fill="white" opacity="0.9" />
              <circle cx="0" cy="-14" r="5" fill={AMBER} />
              <path d="M-6,-14 L0,-22 L6,-14 Z" fill="white" opacity="0.8" />
            </g>
            {/* Tarjetas de info */}
            <rect className="b6-card" x="18" y="82" width="164" height="50" rx="8" fill="#1a2030" opacity="0" />
            <text x="30" y="102" fill="#aaa" fontSize="8" fontFamily="sans-serif">HABITACIÓN</text>
            <text x="30" y="120" fill="white" fontSize="13" fontFamily="sans-serif" fontWeight="bold">204 — Piso 2</text>

            <rect className="b6-card" x="18" y="140" width="164" height="50" rx="8" fill="#1a2030" opacity="0" />
            <text x="30" y="160" fill="#aaa" fontSize="8" fontFamily="sans-serif">FAMILIA</text>
            <text x="30" y="178" fill="white" fontSize="13" fontFamily="sans-serif" fontWeight="bold">García Ramírez</text>

            <rect className="b6-card" x="18" y="198" width="164" height="50" rx="8" fill="#1a2030" opacity="0" />
            <text x="30" y="218" fill="#aaa" fontSize="8" fontFamily="sans-serif">PRÓXIMA CITA</text>
            <text x="30" y="236" fill={AMBER} fontSize="13" fontFamily="sans-serif" fontWeight="bold">Mañana 9:00 am</text>

            <rect className="b6-card" x="18" y="256" width="70" height="70" rx="8" fill="#1a2030" opacity="0" />
            <text x="53" y="298" textAnchor="middle" fill="#5a8aaa" fontSize="8" fontFamily="monospace">QR CODE</text>
            {/* QR mock */}
            {[0,1,2,3,4].map(r => [0,1,2,3,4].map(c => (
              <rect key={`${r}${c}`} x={26 + c * 10} y={262 + r * 10} width="8" height="8" rx="1"
                fill={Math.random() > 0.5 ? '#5a8aaa' : '#1a2a3a'} opacity="0.6" />
            )))}
          </g>
        </svg>

        <div className="relative z-10 mt-auto pb-14 sm:pb-20 text-center px-6">
          <h2 className="b6t text-white font-bold text-3xl sm:text-5xl md:text-6xl mb-3" style={{ opacity: 0 }}>
            Descarga mc<span style={{ color: ORANGE }}>Faro</span>.
          </h2>
          <p className="b6t text-[#F7EDD5]/60 text-base sm:text-lg max-w-sm mx-auto leading-relaxed" style={{ opacity: 0 }}>
            Tu estancia, organizada desde el primer día.
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          BEAT 7 — ¿QUÉ COMEN HOY?
          ══════════════════════════════════════════════════════════════ */}
      <div
        id="beat-7"
        className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center"
        style={{ background: BG }}
      >
        <svg viewBox="0 0 1440 900" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          {/* Papá preocupado */}
          <Adult id="b7-pa" x={440} y={760} s={1.1} fill="#7a6a58" op={0} />

          {/* Burbuja de diálogo */}
          <g id="b7-bubble" opacity="0" style={{ transformOrigin: '560px 580px' }}>
            <rect x="470" y="500" width="260" height="90" rx="14" fill="#1e1612" stroke="#3a2a1a" strokeWidth="1.5" />
            {/* Cola de la burbuja */}
            <path d="M500,590 L480,620 L520,590 Z" fill="#1e1612" />
            <text x="600" y="536" textAnchor="middle" fill="#c8a888" fontSize="13" fontFamily="sans-serif" fontStyle="italic">"Sofía... no sé</text>
            <text x="600" y="556" textAnchor="middle" fill="#c8a888" fontSize="13" fontFamily="sans-serif" fontStyle="italic">si podamos comer."</text>
          </g>

          {/* Plato / ícono comida */}
          <g id="b7-plate" opacity="0" transform="translate(480,660)">
            <circle cx="0" cy="0" r="38" fill="none" stroke={AMBER} strokeWidth="3" />
            <circle cx="0" cy="0" r="28" fill="#1a1008" />
            {/* Comida */}
            <ellipse cx="0" cy="-4" rx="18" ry="12" fill={OR_DARK} opacity="0.7" />
            <ellipse cx="0" cy="-6" rx="14" ry="8"  fill={ORANGE} opacity="0.6" />
          </g>

          {/* Notificación mcFaro */}
          <g id="b7-notif" opacity="0" transform="translate(760,480)">
            <rect x="0" y="0" width="310" height="100" rx="14" fill="#1a2010" stroke="#4a6a20" strokeWidth="1.5" />
            {/* Ícono faro */}
            <rect x="18" y="30" width="8" height="18" rx="1.5" fill={AMBER} opacity="0.9" />
            <circle cx="22" cy="30" r="6" fill={AMBER} opacity="0.9" />
            <path d="M16,30 L22,20 L28,30 Z" fill={AMBER} opacity="0.8" />
            {/* Texto */}
            <text x="46" y="40" fill={AMBER} fontSize="11" fontFamily="sans-serif" fontWeight="bold">mcFaro</text>
            <text x="46" y="60" fill="white" fontSize="13" fontFamily="sans-serif" fontWeight="bold">🍽 Comida disponible hoy</text>
            <text x="46" y="80" fill="#a8c888" fontSize="11" fontFamily="sans-serif">Sin costo para tu familia.</text>
          </g>
          <path d="M0,808 C300,800 700,814 1000,808 C1200,804 1360,811 1440,808 L1440,900 L0,900 Z" fill="#0c0806" />
        </svg>

        <div className="relative z-10 mt-auto pb-14 sm:pb-20 text-center px-6 max-w-lg mx-auto">
          <p className="b7t text-[#F7EDD5]/55 text-sm sm:text-base uppercase tracking-widest mb-3" style={{ opacity: 0 }}>
            El miedo más sencillo
          </p>
          <h2 className="b7t text-white font-light text-2xl sm:text-4xl md:text-5xl leading-relaxed" style={{ opacity: 0 }}>
            mcFaro les respondió<br />
            <span style={{ color: AMBER }} className="font-bold">antes de que cayera la noche.</span>
          </h2>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          BEAT 8 — EL TRATAMIENTO / TRANSPORTE
          ══════════════════════════════════════════════════════════════ */}
      <div
        id="beat-8"
        className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center"
        style={{ background: BG }}
      >
        <svg viewBox="0 0 1440 900" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          {/* Hospital — fachada simple */}
          <g id="b8-hosp" opacity="0">
            <rect x="700" y="440" width="580" height="360" rx="4" fill="#121826" />
            <rect x="700" y="435" width="580" height="12"  rx="2" fill="#1e2840" />
            {/* Ventanas */}
            {[0,1,2,3,4].map(col => [0,1,2].map(row => (
              <rect key={`w${col}${row}`}
                x={720 + col * 100} y={460 + row * 90}
                width="70" height="55" rx="3"
                fill={row === 0 && col === 2 ? '#2a4a80' : '#1a2a40'}
                opacity="0.85"
              />
            )))}
            {/* Cruz del hospital */}
            <rect x="960" y="395" width="60" height="18" rx="4" fill="#8B2020" />
            <rect x="978" y="380" width="24" height="48" rx="4" fill="#8B2020" />
            <text x="990" y="432" textAnchor="middle" fill="white" fontSize="10" fontFamily="sans-serif" fontWeight="bold">HOSPITAL</text>
          </g>

          {/* Van/camioneta de mcFaro */}
          <g id="b8-van" opacity="0">
            {/* Cuerpo */}
            <rect x="120" y="680" width="320" height="140" rx="10" fill={OR_DARK} />
            {/* Cabina */}
            <rect x="360" y="700" width="110" height="120" rx="8" fill="#9a4018" />
            {/* Ventanas */}
            <rect x="140" y="698" width="200" height="70"  rx="5" fill="#1a3060" opacity="0.7" />
            <rect x="370" y="706" width="88" height="56"   rx="4" fill="#1a3060" opacity="0.7" />
            {/* Ruedas */}
            <circle cx="200" cy="820" r="34" fill="#0a0806" />
            <circle cx="200" cy="820" r="22" fill="#1a1a1a" />
            <circle cx="200" cy="820" r="8"  fill="#2a2a2a" />
            <circle cx="400" cy="820" r="34" fill="#0a0806" />
            <circle cx="400" cy="820" r="22" fill="#1a1a1a" />
            <circle cx="400" cy="820" r="8"  fill="#2a2a2a" />
            {/* Logo mcFaro */}
            <text x="240" y="756" textAnchor="middle" fill="white" fontSize="20" fontFamily="sans-serif" fontWeight="bold">mcFaro</text>
          </g>

          {/* Papá + Sofía */}
          <Adult id="b8-pa"  x={600} y={760} s={1.0} fill={SKIN} op={0} />
          <Child id="b8-sof" x={636} y={770} s={0.8} fill={SKIN} op={0} />
          <path d="M0,860 C300,852 700,866 1100,860 C1280,856 1400,862 1440,860 L1440,900 L0,900 Z" fill="#0c0806" />
        </svg>

        <div className="relative z-10 mt-auto pb-14 sm:pb-20 text-center px-6 max-w-lg mx-auto">
          <h2 className="b8t text-white font-bold text-3xl sm:text-5xl md:text-6xl mb-4 leading-tight" style={{ opacity: 0 }}>
            El transporte también<br />estaba en mc<span style={{ color: ORANGE }}>Faro</span>.
          </h2>
          <p className="b8t text-[#F7EDD5]/55 text-base sm:text-lg leading-relaxed" style={{ opacity: 0 }}>
            Sin tres horas de camión. Sin perderse.<br className="hidden sm:block" />
            Solo llegar y estar con Sofía.
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          BEAT 9 — PAPÁ NO ESTABA SOLO
          ══════════════════════════════════════════════════════════════ */}
      <div
        id="beat-9"
        className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center"
        style={{ background: BG }}
      >
        <svg viewBox="0 0 1440 900" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          {/* Faro */}
          <Lighthouse x={220} y={880} s={0.7} />
          {/* Haz */}
          <Beam id="b9-beam" ox={220} oy={756} />
          {/* Bancos / área de espera */}
          <rect x="400" y="775" width="800" height="12" rx="3" fill="#1a1008" />
          {[460, 620, 780, 920].map((bx, i) => (
            <rect key={i} x={bx} y="758" width="100" height="18" rx="3" fill="#1e1408" />
          ))}
          {/* Papá */}
          <Adult id="b9-pa"  x={520} y={760} s={1.0} fill="#7a6a58" op={0} />
          {/* Otros papás */}
          <Adult id="b9-o1"  x={660} y={760} s={1.0} fill="#6a5a8a" op={0} />
          <Adult id="b9-o2"  x={800} y={760} s={0.95} fill="#5a7a6a" op={0} />
          <Adult id="b9-o3"  x={940} y={760} s={0.9}  fill="#7a6a5a" op={0} />
          {/* Línea de conexión — mano extendida */}
          <line id="b9-hand" x1="660" y1="700" x2="560" y2="704"
            stroke={AMBER} strokeWidth="4" strokeLinecap="round" opacity="0.7" />
          <path d="M0,810 C300,802 700,816 1100,810 C1280,806 1400,812 1440,810 L1440,900 L0,900 Z" fill="url(#stOcean)" />
        </svg>

        <div className="relative z-10 mt-auto pb-12 sm:pb-20 text-center px-6 max-w-lg mx-auto">
          <p className="b9t text-[#F7EDD5]/50 text-sm sm:text-base uppercase tracking-widest mb-4" style={{ opacity: 0 }}>
            Mientras Sofía recibía su tratamiento
          </p>
          <h2 className="b9t text-white font-bold text-3xl sm:text-4xl md:text-5xl mb-4 leading-tight" style={{ opacity: 0 }}>
            mcFaro conectó a papá<br />con otros papás.
          </h2>
          <p className="b9t text-[#F7EDD5]/55 text-base sm:text-lg leading-relaxed" style={{ opacity: 0 }}>
            Nadie debería cargar esto solo.
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          BEAT 10 — SOFÍA JUGÓ HOY
          ══════════════════════════════════════════════════════════════ */}
      <div
        id="beat-10"
        className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center"
        style={{ background: BG }}
      >
        <svg viewBox="0 0 1440 900" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          {/* Luz cálida ambiental — tarde soleada */}
          <ellipse cx="720" cy="300" rx="500" ry="200" fill="#2a1a08" opacity="0.5" />
          {/* Suelo */}
          <rect x="0" y="800" width="1440" height="100" fill="#0e0a06" />
          {/* Niños jugando */}
          <Child id="b10-c1" x={580} y={770} s={1.1}  fill="#c8a878" op={0} />
          <Child id="b10-c2" x={660} y={770} s={1.0}  fill="#b89868" op={0} />
          <Child id="b10-c3" x={740} y={770} s={1.05} fill="#c8a878" op={0} />
          {/* Pelota */}
          <circle id="b10-ball" cx="720" cy="750" r="22" fill={OR_DARK} opacity="0" style={{ transformOrigin: '720px 750px' }} />
          <circle cx="720" cy="742" r="7" fill={ORANGE} opacity="0.5" />
          {/* Sofía se une */}
          <Child id="b10-sof" x={820} y={770} s={0.9} fill={SKIN} op={0} />
          {/* Línea del suelo */}
          <line x1="400" y1="800" x2="1040" y2="800" stroke="#1a1008" strokeWidth="3" />
        </svg>

        <div className="relative z-10 mt-auto pb-14 sm:pb-24 text-center px-6">
          <p className="b10t text-[#F7EDD5]/45 text-sm sm:text-base uppercase tracking-widest mb-4" style={{ opacity: 0 }}>
            Después del tratamiento
          </p>
          <h2 className="b10t text-white font-bold text-5xl sm:text-7xl md:text-8xl leading-none" style={{ opacity: 0 }}>
            Sofía jugó.
          </h2>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          BEAT 11 — EL CAMINO ILUMINADO (cierre emocional)
          ══════════════════════════════════════════════════════════════ */}
      <div
        id="beat-11"
        className="relative min-h-screen w-full overflow-hidden flex flex-col items-center"
        style={{ background: BG }}
      >
        <svg viewBox="0 0 1440 900" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          {/* Cielo estrellado */}
          {[[90,45],[240,22],[410,75],[580,35],[760,65],[920,20],[1040,72],[1200,42],[1340,88],[180,118],[460,108],[710,92],[920,132],[1170,102]].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="1.3" fill="white" opacity="0.55" />
          ))}
          <Lighthouse x={220} y={880} s={0.9} />
          {/* Haz estático — no rota */}
          <polygon points="220,718 1600,580 1600,860" fill="url(#stBeamCore)" opacity="0.9" />
          <polygon points="220,718 1600,450 1600,990" fill="url(#stBeamSoft)" style={{ filter: 'blur(18px)' }} opacity="0.5" />

          {/* Glows de familia (pulso ambiental) */}
          <circle className="b11-glow" cx="500"  cy="720" r="100" fill="url(#stGlow)" opacity="0.25" />
          <circle className="b11-glow" cx="700"  cy="720" r="100" fill="url(#stGlow)" opacity="0.25" />
          <circle className="b11-glow" cx="900"  cy="720" r="100" fill="url(#stGlow)" opacity="0.25" />
          <circle className="b11-glow" cx="1100" cy="720" r="100" fill="url(#stGlow)" opacity="0.25" />

          {/* 4 grupos de familia iluminadas */}
          {/* Familia 1 */}
          <g className="b11-fam" opacity="0.04">
            <Adult x={480} y={760} s={1.0}  fill={SKIN} />
            <Adult x={516} y={760} s={0.95} fill={SKIN} />
            <Child x={546} y={770} s={0.8}  fill={SKIN} />
          </g>
          {/* Familia 2 */}
          <g className="b11-fam" opacity="0.04">
            <Adult x={680} y={760} s={1.0}  fill={SKIN} />
            <Child x={714} y={770} s={0.8}  fill={SKIN} />
            <Child x={742} y={773} s={0.72} fill={SKIN} />
          </g>
          {/* Familia 3 */}
          <g className="b11-fam" opacity="0.04">
            <Adult x={880} y={760} s={1.0}  fill={SKIN} />
            <Adult x={916} y={760} s={0.95} fill={SKIN} />
            <Child x={946} y={770} s={0.82} fill={SKIN} />
          </g>
          {/* Familia 4 */}
          <g className="b11-fam" opacity="0.04">
            <Adult x={1080} y={760} s={1.0}  fill={SKIN} />
            <Child x={1114} y={770} s={0.78} fill={SKIN} />
          </g>

          <path d="M0,800 C240,792 480,808 720,800 C960,792 1200,808 1440,800 L1440,900 L0,900 Z" fill="url(#stOcean)" />
        </svg>

        <div className="relative z-10 mt-auto pb-14 sm:pb-24 text-center px-6 max-w-2xl mx-auto">
          <p id="b11t-1" className="text-[#F7EDD5]/55 text-base sm:text-xl md:text-2xl font-light leading-relaxed" style={{ opacity: 0 }}>
            mcFaro no resuelve la enfermedad.
          </p>
          <p id="b11t-2" className="text-[#F7EDD5]/70 text-base sm:text-xl md:text-2xl font-light leading-relaxed mt-3" style={{ opacity: 0 }}>
            Pero ilumina el camino para que puedas<br className="hidden sm:block" />
            enfocarte en lo que importa:
          </p>
          <p id="b11t-3" className="font-bold text-3xl sm:text-5xl md:text-6xl mt-4 leading-tight" style={{ color: AMBER, opacity: 0 }}>
            tu familia.
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          BEAT 12 — LA APP (product reveal)
          ══════════════════════════════════════════════════════════════ */}
      <div
        id="beat-12"
        className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center"
        style={{ background: '#030609' }}
      >
        {/* Fondo sutil más claro */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 45%, #0f1628 0%, #030609 100%)' }} />

        <svg viewBox="0 0 1440 900" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          {/* Teléfono mockup centrado */}
          <g id="b12-phone" opacity="0">
            {/* Sombra */}
            <ellipse cx="720" cy="870" rx="140" ry="20" fill="black" opacity="0.5" />
            {/* Cuerpo */}
            <rect x="570" y="140" width="300" height="640" rx="32" fill="#0e1020" />
            <rect x="574" y="144" width="292" height="632" rx="29" fill="#06091a" />
            {/* Notch */}
            <rect x="680" y="152" width="80" height="14" rx="7" fill="#0e1020" />
            {/* Header gradiente de la app */}
            <defs>
              <linearGradient id="b12hdr" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={OR_DARK} />
                <stop offset="65%" stopColor={ORANGE} />
                <stop offset="100%" stopColor={AMBER} />
              </linearGradient>
            </defs>
            <rect x="574" y="164" width="292" height="85" fill="url(#b12hdr)" />
            <rect x="574" y="225" width="292" height="24" fill={OR_DARK} />
            <text x="720" y="208" textAnchor="middle" fill="white" fontSize="18" fontFamily="sans-serif" fontWeight="bold">mcFaro</text>
            <text x="720" y="226" textAnchor="middle" fill="white" fontSize="10" fontFamily="sans-serif" opacity="0.8">Hola, García · Martes</text>

            {/* Tarjeta Citas */}
            <rect className="b12-card" x="586" y="252" width="268" height="75" rx="10" fill="#121830" opacity="0" />
            <rect x="596" y="262" width="36" height="36" rx="8" fill={OR_DARK} opacity="0.15" />
            <text x="618" y="285" textAnchor="middle" fill={OR_DARK} fontSize="18">📅</text>
            <text x="642" y="276" fill="white" fontSize="11" fontFamily="sans-serif" fontWeight="bold">Citas</text>
            <text x="642" y="292" fill="#8090b0" fontSize="9" fontFamily="sans-serif">Mañana 9:00 · Oncología</text>
            <text x="642" y="308" fill={AMBER} fontSize="9" fontFamily="sans-serif">Recordatorio activo ✓</text>

            {/* Tarjeta Comida */}
            <rect className="b12-card" x="586" y="336" width="268" height="75" rx="10" fill="#121830" opacity="0" />
            <rect x="596" y="346" width="36" height="36" rx="8" fill="#1a3010" opacity="0.5" />
            <text x="618" y="369" textAnchor="middle" fill="#4a8a20" fontSize="18">🍽</text>
            <text x="642" y="360" fill="white" fontSize="11" fontFamily="sans-serif" fontWeight="bold">Comida</text>
            <text x="642" y="376" fill="#8090b0" fontSize="9" fontFamily="sans-serif">Hoy: Desayuno y comida</text>
            <text x="642" y="392" fill="#6aaa30" fontSize="9" fontFamily="sans-serif">Disponible sin costo ✓</text>

            {/* Tarjeta Transporte */}
            <rect className="b12-card" x="586" y="420" width="268" height="75" rx="10" fill="#121830" opacity="0" />
            <rect x="596" y="430" width="36" height="36" rx="8" fill="#101a30" opacity="0.5" />
            <text x="618" y="453" textAnchor="middle" fill="#3a6aaa" fontSize="18">🚐</text>
            <text x="642" y="444" fill="white" fontSize="11" fontFamily="sans-serif" fontWeight="bold">Transporte</text>
            <text x="642" y="460" fill="#8090b0" fontSize="9" fontFamily="sans-serif">Van sale 8:30 · Puerta Norte</text>
            <text x="642" y="476" fill="#5a8aee" fontSize="9" fontFamily="sans-serif">Lugar reservado ✓</text>

            {/* Tarjeta Comunidad */}
            <rect className="b12-card" x="586" y="504" width="268" height="75" rx="10" fill="#121830" opacity="0" />
            <rect x="596" y="514" width="36" height="36" rx="8" fill="#1a1030" opacity="0.5" />
            <text x="618" y="537" textAnchor="middle" fill="#8a5aee" fontSize="18">🤝</text>
            <text x="642" y="528" fill="white" fontSize="11" fontFamily="sans-serif" fontWeight="bold">Comunidad</text>
            <text x="642" y="544" fill="#8090b0" fontSize="9" fontFamily="sans-serif">3 papás en la sala de espera</text>
            <text x="642" y="560" fill="#9a7aff" fontSize="9" fontFamily="sans-serif">Grupo activo hoy ✓</text>

            {/* Barra nav */}
            <rect x="574" y="730" width="292" height="46" rx="0" fill="#0e1020" />
            <rect x="574" y="766" width="292" height="10" rx="0" fill="#0e1020" />
            <line x1="574" y1="730" x2="866" y2="730" stroke="#1a2040" strokeWidth="1" />
            {['📅','🍽','🚐','🤝'].map((em, i) => (
              <text key={i} x={620 + i * 70} y="754" textAnchor="middle" fontSize="18">{em}</text>
            ))}
          </g>
        </svg>

        {/* Texto y CTA */}
        <div className="relative z-10 mt-auto pb-12 sm:pb-16 text-center px-6">
          <h2 className="b12t text-white font-bold text-3xl sm:text-5xl md:text-6xl mb-3" style={{ opacity: 0 }}>
            Todo en un lugar.
          </h2>
          <p className="b12t text-[#F7EDD5]/55 text-base sm:text-lg mb-8 max-w-xs mx-auto" style={{ opacity: 0 }}>
            Para que solo pienses en tu familia.
          </p>
          <div id="b12-cta" style={{ opacity: 0 }}>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-white font-bold rounded-full text-base sm:text-lg px-10 py-4 min-h-14 transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${OR_DARK} 0%, ${ORANGE} 65%, ${AMBER} 100%)`,
                boxShadow: `0 0 40px rgba(200,90,42,0.5), 0 4px 24px rgba(0,0,0,0.5)`,
              }}
            >
              Conoce mcFaro <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>

    </section>
  )
}
