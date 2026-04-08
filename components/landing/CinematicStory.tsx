'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import gsap from 'gsap'

/* ─── Paleta ─────────────────────────────────────────────────────── */
const SKIN    = '#d8bc96'
const AMBER   = '#F5C842'
const ORANGE  = '#E87A3A'
const OR_DARK = '#C85A2A'

/* ─── Mundo: 3000 × 1800 px ──────────────────────────────────────── */
// Faro:      translate(300, 1720) scale(2.28) → linterna en y≈1389
// Océano:    y ≈ 1465
// Suelo:     y = 1470 (donde pisan los personajes)

/* ─── Datos de los 12 beats ──────────────────────────────────────── */
interface Beat {
  cam: { x: number; y: number; z: number }
  ey?: string
  h:  string
  b?: string
  pos: 'left' | 'center' | 'right'
  cta?: true
}

const BEATS: Beat[] = [
  { cam:{x:1400,y:1320,z:0.52}, ey:'Una historia real',         h:'Los García',             b:'Una familia de cinco. Una tiendita de abarrotes. El día a día.',    pos:'center' },
  { cam:{x:800, y:1390,z:2.20},                                  h:'Sofía',                  b:'La noticia que nadie quiere escuchar.',                              pos:'center' },
  { cam:{x:455, y:1250,z:1.30}, ey:'El golpe no fue solo médico',h:'¿Dónde van a dormir?\n¿Qué van a comer?\n¿Cómo llegan?',                                       pos:'right'  },
  { cam:{x:640, y:1230,z:0.65},                                  h:'mcFaro',                 b:'Iluminando el camino desde el primer momento.',                     pos:'center' },
  { cam:{x:2180,y:1240,z:0.75},                                  h:'Casa Ronald McDonald',   b:'Un lugar seguro. Una cama. Un techo.',                              pos:'center' },
  { cam:{x:2310,y:1100,z:1.15},                                  h:'Descarga mcFaro.',       b:'Tu estancia, organizada desde el primer día.',                      pos:'left'   },
  { cam:{x:830, y:1160,z:1.40}, ey:'El miedo más sencillo',      h:'mcFaro respondió\nantes de que cayera la noche.',                                              pos:'right'  },
  { cam:{x:1750,y:1280,z:0.73},                                  h:'El transporte también\nestaba en mcFaro.',b:'Sin tres horas de camión. Sin perderse.',          pos:'center' },
  { cam:{x:2680,y:1330,z:1.05}, ey:'Mientras Sofía recibía tratamiento', h:'Nadie debería\ncargar esto solo.',                                                      pos:'left'   },
  { cam:{x:1450,y:1310,z:1.15}, ey:'Después del tratamiento',   h:'Sofía jugó.',                                                                                   pos:'center' },
  { cam:{x:1500,y:970, z:0.26},                                  h:'mcFaro no resuelve\nla enfermedad.',  b:'Ilumina el camino para que puedas\nenfocarte en lo que importa:', pos:'center' },
  { cam:{x:2255,y:1040,z:1.50},                                  h:'Todo en un lugar.',      b:'Para que solo pienses en tu familia.',                               pos:'center', cta:true },
]

/* ─── Siluetas SVG (coords del mundo) ───────────────────────────── */
/* Mismo estilo que las figuras del HeroSection:
   cabeza circular + cuerpo trapecio con tope curvo + piernas rectangulares */
function WA({ id, cn, x, y, s=1.5, f=SKIN, op=1 }:{
  id?:string; cn?:string; x:number; y:number; s?:number; f?:string; op?:number
}) {
  return (
    <g id={id} className={cn} transform={`translate(${x},${y}) scale(${s})`} fill={f} opacity={op}>
      {/* Cabeza */}
      <circle cx="0" cy="-60" r="8"/>
      {/* Cuerpo — trapecio con tope curvo (igual al landing) */}
      <path d="M-10,-46 C-10,-50 10,-50 10,-46 L8,-24 L-8,-24 Z"/>
      {/* Piernas */}
      <rect x="-9" y="-25" width="6" height="25" rx="3"/>
      <rect x="3"  y="-25" width="6" height="25" rx="3"/>
    </g>
  )
}
function WC({ id, cn, x, y, s=1.1, f=SKIN, op=1 }:{
  id?:string; cn?:string; x:number; y:number; s?:number; f?:string; op?:number
}) {
  return (
    <g id={id} className={cn} transform={`translate(${x},${y}) scale(${s})`} fill={f} opacity={op}>
      {/* Cabeza */}
      <circle cx="0" cy="-43" r="6"/>
      {/* Cuerpo */}
      <path d="M-7,-33 C-7,-37 7,-37 7,-33 L5.5,-17 L-5.5,-17 Z"/>
      {/* Piernas */}
      <rect x="-6.5" y="-18" width="5" height="18" rx="2.5"/>
      <rect x="1.5"  y="-18" width="5" height="18" rx="2.5"/>
    </g>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
   ═══════════════════════════════════════════════════════════════════ */
export function CinematicStory() {
  const worldRef = useRef<HTMLDivElement>(null)
  const textRef  = useRef<HTMLDivElement>(null)
  const beamRef  = useRef<SVGGElement>(null)
  const curRef   = useRef(0)          // evita closures viejas
  const lockRef  = useRef(false)
  const [current, setCurrent] = useState(0)

  /* ── Animaciones de entrada por beat ───────────────────────────── */
  const enterBeat = useCallback((idx: number) => {
    switch (idx) {

      case 0: { // La familia García
        gsap.set(['#gf-shop','#gf-family'], { opacity: 0 })
        gsap.timeline()
          .to('#gf-shop',   { opacity:1, duration:.5 })
          .to('#gf-family', { opacity:1, duration:.5 }, '<+.15')
        break
      }

      case 1: { // El diagnóstico
        gsap.set('#b2-cross', { opacity:0, scale:.5, transformOrigin:'800px 1080px' })
        gsap.set(['#gf-pa','#gf-ma','#gf-h1','#gf-h2'], { opacity:1 })
        gsap.timeline()
          .to(['#gf-pa','#gf-ma','#gf-h1','#gf-h2'], { opacity:.08, duration:.45 })
          .to('#gf-sof',  { opacity:1, duration:.4 }, '<')
          .to('#b2-cross', { opacity:1, scale:1, duration:.5 }, '<+.2')
        break
      }

      case 2: { // La incertidumbre
        gsap.set(['#gf-pa','#gf-ma','#gf-h1','#gf-h2','#gf-sof'], { opacity:1 })
        gsap.set(['#b3-pa','#b3-q1','#b3-q2','#b3-q3'], { opacity:0, y:0 })
        gsap.timeline()
          .to('#b3-pa', { opacity:1, duration:.4 })
          .to('#b3-q1', { opacity:1, duration:.35 }, '<+.3')
          .to('#b3-q2', { opacity:1, duration:.35 }, '<+.25')
          .to('#b3-q3', { opacity:1, duration:.35 }, '<+.25')
        gsap.to(['#b3-q1','#b3-q2','#b3-q3'], {
          y:-30, duration:2.2, repeat:-1, yoyo:true, ease:'sine.inOut', stagger:.5,
        })
        break
      }

      case 3: { // El faro los ilumina
        gsap.set('#b4-glow', { opacity:0, scale:.3, transformOrigin:'720px 1350px' })
        gsap.set(['#gf-pa','#gf-ma','#gf-h1','#gf-h2','#gf-sof'], { opacity:.05 })
        gsap.timeline()
          .to('#b4-glow',  { opacity:1, scale:1, duration:.6 })
          .to(['#gf-pa','#gf-sof'], { opacity:1, duration:.45 }, '<+.25')
        break
      }

      case 4: { // Llegaron a Casa
        gsap.set(['#b5-casa','#b5-winL','#b5-winR','#b5-wpa','#b5-wsof'], { opacity:0, x:0 })
        gsap.set('#b5-door', { rotation:0 })
        gsap.timeline()
          .to('#b5-casa', { opacity:1, duration:.45 })
          .to('#b5-winL', { opacity:1, fill:AMBER, duration:.3 }, '<+.3')
          .to('#b5-winR', { opacity:1, fill:AMBER, duration:.3 }, '<+.1')
          .fromTo(['#b5-wpa','#b5-wsof'], { x:440, opacity:0 }, { x:0, opacity:1, stagger:.1, duration:.55 }, '-=.1')
          .to('#b5-door', { rotation:-46, svgOrigin:'2155 1290', duration:.3 }, '-=.15')
        break
      }

      case 5: { // El registro
        gsap.set(['#b6-desk','#b6-phone','.b6-card'], { opacity:0 })
        gsap.set('#b6-phone', { y:90 })
        gsap.timeline()
          .to('#b6-desk',   { opacity:1, duration:.4 })
          .to('#b6-phone',  { opacity:1, y:0, duration:.5 }, '<+.2')
          .to('.b6-card',   { opacity:1, stagger:.12, duration:.3 }, '<+.25')
        break
      }

      case 6: { // ¿Qué comen?
        gsap.set(['#b7-pa','#b7-bubble','#b7-plate','#b7-notif'], { opacity:0, x:0 })
        gsap.set('#b7-bubble', { scale:.7, transformOrigin:'900px 1100px' })
        gsap.set('#b7-plate',  { scale:.4, transformOrigin:'800px 1210px' })
        gsap.timeline()
          .to('#b7-pa',     { opacity:1, duration:.4 })
          .to('#b7-bubble', { opacity:1, scale:1, duration:.45 }, '<+.2')
          .to('#b7-plate',  { opacity:1, scale:1, duration:.4 }, '<+.2')
          .fromTo('#b7-notif', { x:80, opacity:0 }, { x:0, opacity:1, duration:.5 }, '<+.15')
        gsap.to('#b7-plate', {
          scale:1.07, transformOrigin:'800px 1210px',
          duration:1.4, repeat:-1, yoyo:true, ease:'sine.inOut', delay:.8,
        })
        break
      }

      case 7: { // Transporte
        gsap.set(['#b8-hosp','#b8-van','.b8-w'], { opacity:0, x:0 })
        gsap.timeline()
          .to('#b8-hosp', { opacity:1, duration:.4 })
          .fromTo('#b8-van', { x:-360, opacity:0 }, { x:0, opacity:1, duration:.6 }, '<+.2')
          .to('.b8-w',    { opacity:1, stagger:.1, duration:.3 }, '-=.2')
          .to('.b8-w',    { x:-100, opacity:0, duration:.35 }, '<+.5')
          .to('#b8-van',  { x:380, duration:.45 }, '<+.2')
        break
      }

      case 8: { // No estaba solo
        gsap.set(['#b9-pa','.b9-o','#b9-hand'], { opacity:0 })
        gsap.timeline()
          .to('#b9-pa',   { opacity:1, duration:.4 })
          .to('.b9-o',    { opacity:1, stagger:.15, duration:.35 })
          .fromTo('#b9-hand', { scaleX:0, opacity:0 }, { scaleX:1, opacity:1, duration:.4, svgOrigin:'2660 1390' })
        break
      }

      case 9: { // Sofía jugó
        gsap.set(['.b10-k','#b10-ball','#b10-sof'], { opacity:0, x:0 })
        gsap.set('#b10-ball', { scale:.2, transformOrigin:'1470px 1420px' })
        gsap.timeline()
          .to('.b10-k',   { opacity:1, stagger:.14, duration:.35 })
          .to('#b10-ball',{ opacity:1, scale:1, transformOrigin:'1470px 1420px', duration:.25 }, '<+.1')
          .fromTo('#b10-sof', { x:340, opacity:0 }, { x:0, opacity:1, duration:.5 })
        gsap.to('.b10-k', {
          y:-18, duration:.5, repeat:-1, yoyo:true, ease:'power2.inOut', stagger:.16, delay:.4,
        })
        break
      }

      case 10: { // El camino iluminado
        gsap.set(['.b11-f','.b11-g'], { opacity:0 })
        gsap.timeline()
          .to('.b11-f', { opacity:1, stagger:.12, duration:.5 })
          .to('.b11-g', { opacity:1, stagger:.1, duration:.5 }, '<+.2')
        gsap.to('.b11-g', {
          scale:1.14, duration:2.2, repeat:-1, yoyo:true, ease:'sine.inOut', stagger:.35,
          transformOrigin:'center',
        })
        break
      }

      case 11: { // La app
        gsap.set(['#b12-phone','.b12-c'], { opacity:0 })
        gsap.set('#b12-phone', { y:110 })
        gsap.timeline()
          .to('#b12-phone', { y:0, opacity:1, duration:.5 })
          .to('.b12-c',     { opacity:1, stagger:.13, duration:.3 }, '<+.25')
        break
      }
    }
  }, [])

  /* ── Mover cámara ─────────────────────────────────────────────── */
  const moveTo = useCallback((idx: number) => {
    if (lockRef.current || !worldRef.current) return
    lockRef.current = true
    curRef.current  = idx
    setCurrent(idx)

    const { x, y, z } = BEATS[idx].cam
    const vw = window.innerWidth
    const vh = window.innerHeight

    gsap.to(textRef.current, { opacity:0, y:8, duration:.25, ease:'power2.in' })
    gsap.to(worldRef.current, {
      x: vw/2 - x*z,
      y: vh/2 - y*z,
      scale: z,
      duration: 1.65,
      ease: 'power2.inOut',
      onComplete() {
        enterBeat(idx)
        gsap.fromTo(textRef.current,
          { opacity:0, y:18 },
          { opacity:1, y:0, duration:.5, ease:'power3.out' }
        )
        lockRef.current = false
      },
    })
  }, [enterBeat])

  /* ── Inicialización ───────────────────────────────────────────── */
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
      gsap.fromTo(textRef.current, { opacity:0, y:18 }, { opacity:1, y:0, duration:.6 })
    }, 200)

    // Teclado
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ')
        moveTo(Math.min(curRef.current + 1, 11))
      if (e.key === 'ArrowLeft')
        moveTo(Math.max(curRef.current - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enterBeat, moveTo])

  /* ── Text layout ─────────────────────────────────────────────── */
  const beat = BEATS[current]
  const tPos = {
    left:  'left-5 sm:left-12 top-1/2 -translate-y-1/2 max-w-xs sm:max-w-sm text-left',
    center:'left-1/2 -translate-x-1/2 bottom-20 sm:bottom-24 max-w-sm sm:max-w-lg text-center',
    right: 'right-5 sm:right-12 top-1/2 -translate-y-1/2 max-w-xs sm:max-w-sm text-right',
  }[beat.pos]

  /* ══════════════════════════════════════════════════════════════════
     JSX
     ══════════════════════════════════════════════════════════════════ */
  return (
    <div
      id="historia"
      className="relative w-full h-screen overflow-hidden"
      style={{ background: 'linear-gradient(to bottom, #010206 0%, #040818 100%)' }}
    >

      {/* ── Vignettes suaves — suavizan bordes sin cubrir contenido ── */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none z-10"
        style={{ background: 'radial-gradient(ellipse 85% 70% at 50% 50%, transparent 40%, #010206 100%)' }}/>

      {/* ── MUNDO — la cámara transforma este div ── */}
      <div
        ref={worldRef}
        style={{ position:'absolute', top:0, left:0, transformOrigin:'0 0', willChange:'transform' }}
      >
        <svg width="3000" height="1800" style={{ display:'block' }} aria-hidden="true">
          <defs>
            <linearGradient id="cSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#010206"/>
              <stop offset="100%" stopColor="#040818"/>
            </linearGradient>
            <linearGradient id="cOcean" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#0c1945"/>
              <stop offset="100%" stopColor="#040810"/>
            </linearGradient>
            <linearGradient id="cBCore" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#F8D060" stopOpacity=".88"/>
              <stop offset="45%"  stopColor="#F5C030" stopOpacity=".28"/>
              <stop offset="100%" stopColor="#F5C030" stopOpacity="0"/>
            </linearGradient>
            <linearGradient id="cBSoft" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#F8D060" stopOpacity=".28"/>
              <stop offset="100%" stopColor="#F8D060" stopOpacity="0"/>
            </linearGradient>
            <radialGradient id="cGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#F5C842" stopOpacity=".22"/>
              <stop offset="100%" stopColor="#F5C842" stopOpacity="0"/>
            </radialGradient>
            <linearGradient id="cHdr" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor={OR_DARK}/>
              <stop offset="65%"  stopColor={ORANGE}/>
              <stop offset="100%" stopColor={AMBER}/>
            </linearGradient>
            <filter id="cBlur"><feGaussianBlur stdDeviation="18"/></filter>
            <filter id="cGlowF" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="8" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* ── Fondo / cielo ── */}
          <rect width="3000" height="1800" fill="url(#cSky)"/>
          <ellipse cx="600"  cy="380" rx="820" ry="300" fill="#050d30" opacity=".25"/>
          <ellipse cx="1500" cy="280" rx="900" ry="240" fill="#050c28" opacity=".2"/>
          <ellipse cx="2420" cy="420" rx="520" ry="180" fill="#050b24" opacity=".15"/>

          {/* ── Estrellas ── */}
          {([
            [140,75],[310,42],[510,108],[695,52],[895,86],[1095,38],[1275,102],[1448,62],
            [1618,88],[1798,36],[1958,112],[2098,58],[2278,98],[2448,48],[2598,82],[2778,110],[2918,52],
            [88,198],[275,168],[475,208],[675,178],[875,198],[1052,158],[1220,212],[1390,182],
            [1558,202],[1728,168],[1898,218],[2058,178],[2228,202],[2398,162],[2568,212],[2738,172],[2878,198],
            [178,318],[398,288],[598,322],[798,298],[998,312],[1198,282],[1398,328],[1598,292],
            [1798,318],[1998,282],[2198,328],[2398,292],[2598,308],[2798,278],[2948,318],
            [248,418],[448,388],[648,422],[848,398],[1048,412],[1248,382],[1448,422],[1648,392],
            [1848,418],[2048,382],[2248,428],[2448,392],[2648,412],[2848,385],
          ] as [number,number][]).map(([cx,cy],i) => (
            <circle key={i} cx={cx} cy={cy} r={.9+(i%3)*.35} fill="white" opacity={.38+(i%5)*.1}/>
          ))}

          {/* ── Haz (rota alrededor de la linterna real a y≈1389) ── */}
          <g ref={beamRef} style={{ transformOrigin:'300px 1389px' }}>
            <polygon points="300,1389 3100,510 3100,1800"
              fill="url(#cBSoft)" filter="url(#cBlur)" opacity=".5"/>
            <polygon points="300,1389 3100,1010 3100,1770"
              fill="url(#cBCore)"/>
          </g>

          {/* ── Océano ── */}
          <path d="M0,1462 C250,1452 500,1472 750,1460 C1000,1448 1250,1470 1500,1458 C1750,1446 2000,1468 2250,1456 C2500,1444 2750,1466 3000,1454 L3000,1800 L0,1800 Z"
            fill="url(#cOcean)"/>
          <path d="M0,1468 C300,1458 600,1476 900,1464 C1200,1452 1500,1472 1800,1460 C2100,1448 2400,1470 2700,1458 C2850,1452 3000,1462 3000,1462"
            stroke="rgba(80,130,220,.17)" strokeWidth="3" fill="none"/>

          {/* ── Faro ── */}
          <g transform="translate(300,1720) scale(2.28)">
            <ellipse cx="0" cy="-2" rx="28" ry="8" fill="#0a0e22"/>
            <path d="M-24,-10 C-24,-18 24,-18 24,-10 L28,-2 L-28,-2 Z" fill="#0d1128"/>
            <rect x="-30" y="-16" width="60" height="7"   rx="2" fill="#1e1e3a"/>
            <rect x="-11" y="-130" width="22" height="120" rx="2" fill="#cdb88e"/>
            <rect x="-9"  y="-130" width="18" height="120" rx="1" fill="#dcc9a2"/>
            <rect x="-11" y="-107" width="22" height="4"   rx="1" fill="#a07848" opacity=".8"/>
            <rect x="-11" y="-88"  width="22" height="4"   rx="1" fill="#a07848" opacity=".8"/>
            <rect x="-11" y="-70"  width="22" height="4"   rx="1" fill="#a07848" opacity=".8"/>
            <rect x="-14" y="-134" width="28" height="5"   rx="1" fill="#8b6914"/>
            <rect x="-13" y="-157" width="26" height="24"  rx="2" fill="#141c40"/>
            <rect x="-10" y="-154" width="10" height="18"  rx="1" fill="#2040a0" opacity=".7"/>
            <rect x="1"   y="-154" width="10" height="18"  rx="1" fill="#2040a0" opacity=".7"/>
            <rect x="-8"  y="-151" width="16" height="12"  rx=".5" fill="#FFFBC0"/>
            <circle cx="0" cy="-145" r="13" fill="#FFF8A0" opacity=".9" style={{filter:'blur(5px)'}}/>
            <path d="M-16,-157 L0,-176 L16,-157 Z" fill="#8b6914"/>
            <path d="M-13,-157 L0,-173 L13,-157 Z" fill="#c4a030"/>
            <line x1="0" y1="-176" x2="0" y2="-184" stroke="#888" strokeWidth="1.2"/>
          </g>

          {/* ══════ BEAT 1 — García family + tiendita ══════
              Cámara: (800, 1320, 0.52)                        */}
          <g id="gf-shop" opacity="0" transform="translate(500,1155) scale(1.4)">
            <rect x="0"   y="0"   width="350" height="215" rx="5" fill="#1a0e06"/>
            <path d="M-12,-26 L362,-26 L350,12 L0,12 Z" fill={OR_DARK} opacity=".9"/>
            <rect x="22"  y="22"  width="135" height="112" rx="3" fill="#1a3060" opacity=".75"/>
            <rect x="205" y="28"  width="106" height="187" rx="3" fill="#3a2010"/>
            <rect x="32"  y="30"  width="115" height="20"  rx="2" fill="none" stroke={AMBER} strokeWidth="1.5"/>
            <text x="90" y="46" textAnchor="middle" fill={AMBER} fontSize="12" fontFamily="sans-serif" letterSpacing="1">ABARROTES</text>
            {/* Ventana interior con brillo */}
            <rect x="42"  y="56"  width="95"  height="68"  rx="2" fill="#0f2248" opacity=".5"/>
            <circle cx="75" cy="90" r="12" fill={AMBER} opacity=".12"/>
          </g>
          <g id="gf-family" opacity="0">
            <WA id="gf-pa"  x={660} y={1450} s={1.8}  f={SKIN}/>
            <WA id="gf-ma"  x={750} y={1450} s={1.7}  f={SKIN}/>
            <WC id="gf-h1"  x={840} y={1454} s={1.35} f={SKIN}/>
            <WC id="gf-h2"  x={895} y={1456} s={1.25} f={SKIN}/>
            <WC id="gf-sof" x={700} y={1456} s={1.15} f={SKIN}/>
            {/* Brazos conectando padres-hijos */}
            <line x1="678" y1="1398" x2="712" y2="1408" stroke={SKIN} strokeWidth="8" strokeLinecap="round" opacity=".55"/>
            <line x1="768" y1="1398" x2="808" y2="1408" stroke={SKIN} strokeWidth="8" strokeLinecap="round" opacity=".55"/>
          </g>

          {/* ══════ BEAT 2 — Diagnóstico ══════
              Cámara: (800, 1390, 2.20)           */}
          <g id="b2-cross" opacity="0" transform="translate(800,1078)">
            <rect x="-22" y="-70" width="44"  height="140" rx="8" fill="#8B2020" opacity=".85"/>
            <rect x="-70" y="-22" width="140" height="44"  rx="8" fill="#8B2020" opacity=".85"/>
            <rect x="-18" y="-66" width="36"  height="132" rx="6" fill="#e74c3c" opacity=".5"/>
            <rect x="-66" y="-18" width="132" height="36"  rx="6" fill="#e74c3c" opacity=".5"/>
          </g>

          {/* ══════ BEAT 3 — Incertidumbre ══════
              Cámara: (455, 1250, 1.30)            */}
          <WA id="b3-pa" x={420} y={1455} s={1.5} f="#6a5a4a" op={0}/>
          <g id="b3-q1" opacity="0" transform="translate(325,1238)">
            <circle cx="0" cy="0" r="58" fill="none" stroke="#3a4a7a" strokeWidth="3" opacity=".62"/>
            <text x="0" y="22" textAnchor="middle" fill="#5a6a9a" fontSize="58" fontFamily="Georgia,serif" fontWeight="bold">?</text>
          </g>
          <g id="b3-q2" opacity="0" transform="translate(472,1155)">
            <circle cx="0" cy="0" r="48" fill="none" stroke="#3a4a7a" strokeWidth="3" opacity=".62"/>
            <text x="0" y="18" textAnchor="middle" fill="#5a6a9a" fontSize="48" fontFamily="Georgia,serif" fontWeight="bold">?</text>
          </g>
          <g id="b3-q3" opacity="0" transform="translate(402,1068)">
            <circle cx="0" cy="0" r="40" fill="none" stroke="#3a4a7a" strokeWidth="3" opacity=".62"/>
            <text x="0" y="15" textAnchor="middle" fill="#5a6a9a" fontSize="40" fontFamily="Georgia,serif" fontWeight="bold">?</text>
          </g>

          {/* ══════ BEAT 4 — El faro ilumina ══════
              Cámara: (640, 1230, 0.65)             */}
          <circle id="b4-glow" cx="720" cy="1350" r="290"
            fill="url(#cGlow)" opacity="0" style={{transformOrigin:'720px 1350px'}}/>

          {/* ══════ BEAT 5 — Casa Ronald ══════
              Cámara: (2180, 1240, 0.75)     */}
          <g id="b5-casa" opacity="0">
            <rect x="1938" y="1145" width="700" height="325" rx="5" fill="#1c1206"/>
            <path d="M1918,1150 L2288,935 L2658,1150 Z" fill="#2a1a0a"/>
            <path d="M1933,1150 L2288,950 L2643,1150 Z" fill="#3a2414"/>
            <rect id="b5-door" x="2148" y="1228" width="122" height="242" rx="4" fill="#5a3520"/>
            <circle cx="2252" cy="1348" r="8" fill={AMBER} opacity=".8"/>
            <rect id="b5-winL" x="1968" y="1185" width="198" height="158" rx="5" fill="#0a0806"/>
            <rect id="b5-winR" x="2408" y="1185" width="198" height="158" rx="5" fill="#0a0806"/>
            <rect x="2270" y="1145" width="42" height="12" rx="3" fill={OR_DARK} opacity=".9"/>
            <rect x="2283" y="1137" width="16" height="28" rx="3" fill={OR_DARK} opacity=".9"/>
          </g>
          <WA id="b5-wpa"  x={2545} y={1455} s={1.5} f={SKIN} op={0}/>
          <WC id="b5-wsof" x={2594} y={1460} s={1.1} f={SKIN} op={0}/>

          {/* ══════ BEAT 6 — Registro / Phone ══════
              Cámara: (2310, 1100, 1.15)             */}
          <g id="b6-desk" opacity="0">
            <rect x="1958" y="1265" width="425" height="185" rx="7" fill="#1a1206"/>
            <rect x="1958" y="1259" width="425" height="12"  rx="4" fill="#2a1a0a"/>
            <rect x="1998" y="1075" width="282" height="195" rx="7" fill="#141c30"/>
            <rect x="2008" y="1085" width="262" height="175" rx="5" fill="#1a2a50" opacity=".8"/>
            <rect x="2118" y="1265" width="44"  height="18"  rx="3" fill="#1a1206"/>
            <WA x={2108} y={1267} s={1.38} f="#b8a090"/>
            <text x="2108" y="1222" textAnchor="middle" fill={OR_DARK} fontSize="14" fontFamily="sans-serif" fontWeight="bold">mcF</text>
          </g>
          <g id="b6-phone" opacity="0" transform="translate(2348,1008)">
            <rect x="0"  y="0"   width="216" height="455" rx="26" fill="#1a1206"/>
            <rect x="4"  y="4"   width="208" height="447" rx="23" fill="#0d1020"/>
            <rect x="9"  y="9"   width="198" height="437" rx="20" fill="#06091a"/>
            <rect x="9"  y="9"   width="198" height="65"  rx="20" fill="url(#cHdr)"/>
            <rect x="9"  y="56"  width="198" height="18"  fill={OR_DARK}/>
            <text x="108" y="48" textAnchor="middle" fill="white" fontSize="17" fontFamily="sans-serif" fontWeight="bold">mcFaro</text>
            <text x="108" y="69" textAnchor="middle" fill="white" fontSize="9"  fontFamily="sans-serif" opacity=".8">García · Piso 2 · Hab 204</text>
            <rect className="b6-card" x="16" y="84"  width="184" height="70" rx="10" fill="#121830" opacity="0"/>
            <text x="30" y="107" fill="#aaa" fontSize="9"  fontFamily="sans-serif">PRÓXIMA CITA</text>
            <text x="30" y="126" fill="white" fontSize="12" fontFamily="sans-serif" fontWeight="bold">Mañana 9:00 · Oncología</text>
            <text x="30" y="143" fill={AMBER} fontSize="9" fontFamily="sans-serif">Recordatorio activo ✓</text>
            <rect className="b6-card" x="16" y="162" width="184" height="70" rx="10" fill="#121830" opacity="0"/>
            <text x="30" y="185" fill="#aaa" fontSize="9" fontFamily="sans-serif">COMIDA HOY</text>
            <text x="30" y="204" fill="white" fontSize="12" fontFamily="sans-serif" fontWeight="bold">Sin costo · 3 tiempos</text>
            <text x="30" y="221" fill="#6aaa30" fontSize="9" fontFamily="sans-serif">Disponible ✓</text>
            <rect className="b6-card" x="16" y="240" width="184" height="70" rx="10" fill="#121830" opacity="0"/>
            <text x="30" y="263" fill="#aaa" fontSize="9" fontFamily="sans-serif">TRANSPORTE</text>
            <text x="30" y="282" fill="white" fontSize="12" fontFamily="sans-serif" fontWeight="bold">Van 8:30 · Puerta Norte</text>
            <text x="30" y="299" fill="#5a8aee" fontSize="9" fontFamily="sans-serif">Lugar reservado ✓</text>
            <rect className="b6-card" x="16" y="318" width="184" height="70" rx="10" fill="#121830" opacity="0"/>
            <text x="30" y="341" fill="#aaa" fontSize="9" fontFamily="sans-serif">COMUNIDAD</text>
            <text x="30" y="360" fill="white" fontSize="12" fontFamily="sans-serif" fontWeight="bold">3 papás esperando</text>
            <text x="30" y="377" fill="#9a7aff" fontSize="9" fontFamily="sans-serif">Grupo activo ✓</text>
          </g>

          {/* ══════ BEAT 7 — ¿Qué comen? ══════
              Cámara: (830, 1160, 1.40)       */}
          <WA id="b7-pa" x={785} y={1280} s={1.5} f="#7a6a58" op={0}/>
          <g id="b7-bubble" opacity="0">
            <rect x="838" y="1055" width="298" height="98" rx="15" fill="#1e1612" stroke="#3a2a1a" strokeWidth="2"/>
            <path d="M868,1153 L848,1195 L898,1153 Z" fill="#1e1612"/>
            <text x="988" y="1094" textAnchor="middle" fill="#c8a888" fontSize="14" fontFamily="sans-serif" fontStyle="italic">"Sofía... no sé</text>
            <text x="988" y="1115" textAnchor="middle" fill="#c8a888" fontSize="14" fontFamily="sans-serif" fontStyle="italic">si podamos comer."</text>
          </g>
          <g id="b7-plate" opacity="0">
            <circle cx="800" cy="1210" r="48"  fill="none" stroke={AMBER} strokeWidth="4"/>
            <circle cx="800" cy="1210" r="34"  fill="#1a1008"/>
            <ellipse cx="800" cy="1206" rx="22" ry="14" fill={OR_DARK} opacity=".7"/>
            <ellipse cx="800" cy="1203" rx="16" ry="9"  fill={ORANGE} opacity=".6"/>
          </g>
          <g id="b7-notif" opacity="0" transform="translate(1020,1055)">
            <rect x="0"  y="0"   width="375" height="118" rx="15" fill="#1a2010" stroke="#4a6a20" strokeWidth="1.8"/>
            <rect x="17" y="24"  width="13"  height="28"  rx="3"  fill={AMBER} opacity=".9"/>
            <circle cx="23" cy="24" r="8" fill={AMBER} opacity=".9"/>
            <path d="M17,24 L23,11 L29,24 Z" fill={AMBER} opacity=".85"/>
            <text x="50" y="46"  fill={AMBER} fontSize="12" fontFamily="sans-serif" fontWeight="bold">mcFaro</text>
            <text x="50" y="68"  fill="white" fontSize="14" fontFamily="sans-serif" fontWeight="bold">🍽 Comida disponible hoy</text>
            <text x="50" y="92"  fill="#a8c888" fontSize="12" fontFamily="sans-serif">Sin costo para tu familia.</text>
          </g>

          {/* ══════ BEAT 8 — Transporte ══════
              Cámara: (1750, 1280, 0.73)      */}
          <g id="b8-hosp" opacity="0">
            <rect x="1558" y="1015" width="680" height="455" rx="5" fill="#121826"/>
            <rect x="1558" y="1009" width="680" height="14"  rx="3" fill="#1e2840"/>
            {([0,1,2,3,4] as number[]).map(c => ([0,1,2] as number[]).map(r => (
              <rect key={`${c}${r}`} x={1578+c*120} y={1035+r*110} width="88" height="68" rx="4" fill="#1a2a40" opacity=".85"/>
            )))}
            <rect x="1868" y="958"  width="78" height="20" rx="5" fill="#8B2020"/>
            <rect x="1895" y="943"  width="24" height="52" rx="5" fill="#8B2020"/>
            <text x="1907" y="998" textAnchor="middle" fill="white" fontSize="12" fontFamily="sans-serif" fontWeight="bold">HOSPITAL</text>
          </g>
          <g id="b8-van" opacity="0">
            <rect x="1215" y="1342" width="398" height="168" rx="12" fill={OR_DARK}/>
            <rect x="1555" y="1362" width="128" height="148" rx="10" fill="#9a4018"/>
            <rect x="1235" y="1358" width="290" height="88"  rx="6"  fill="#1a3060" opacity=".7"/>
            <rect x="1563" y="1368" width="110" height="70"  rx="5"  fill="#1a3060" opacity=".7"/>
            <circle cx="1335" cy="1510" r="40" fill="#0a0806"/>
            <circle cx="1335" cy="1510" r="26" fill="#1a1a1a"/>
            <circle cx="1555" cy="1510" r="40" fill="#0a0806"/>
            <circle cx="1555" cy="1510" r="26" fill="#1a1a1a"/>
            <text x="1415" y="1438" textAnchor="middle" fill="white" fontSize="22" fontFamily="sans-serif" fontWeight="bold">mcFaro</text>
          </g>
          <WA cn="b8-w" x={1510} y={1455} s={1.5} f={SKIN} op={0}/>
          <WC cn="b8-w" x={1558} y={1458} s={1.1} f={SKIN} op={0}/>

          {/* ══════ BEAT 9 — No estaba solo ══════
              Cámara: (2680, 1330, 1.05)           */}
          {([2478,2618,2758,2898] as number[]).map((bx,i) => (
            <rect key={i} x={bx} y="1435" width="118" height="20" rx="4" fill="#1e1408"/>
          ))}
          <WA id="b9-pa"  x={2518} y={1455} s={1.5} f="#7a6a58" op={0}/>
          <WA cn="b9-o"   x={2658} y={1455} s={1.5} f="#6a5a8a" op={0}/>
          <WA cn="b9-o"   x={2798} y={1455} s={1.4} f="#5a7a6a" op={0}/>
          <WA cn="b9-o"   x={2938} y={1455} s={1.3} f="#7a6a5a" op={0}/>
          <line id="b9-hand" x1="2658" y1="1390" x2="2558" y2="1395"
            stroke={AMBER} strokeWidth="6" strokeLinecap="round" opacity="0"/>

          {/* ══════ BEAT 10 — Sofía jugó ══════
              Cámara: (1450, 1310, 1.15)       */}
          <ellipse cx="1465" cy="1095" rx="490" ry="215" fill="#2a1a08" opacity=".38"/>
          <WC cn="b10-k" id="b10-c1" x={1275} y={1458} s={1.2}  f="#c8a878" op={0}/>
          <WC cn="b10-k" id="b10-c2" x={1365} y={1458} s={1.1}  f="#b89868" op={0}/>
          <WC cn="b10-k" id="b10-c3" x={1448} y={1458} s={1.14} f="#c8a878" op={0}/>
          <circle id="b10-ball" cx="1465" cy="1425" r="26" fill={OR_DARK} opacity="0"/>
          <circle cx="1465" cy="1415" r="9" fill={ORANGE} opacity=".5"/>
          <WC id="b10-sof" x={1548} y={1458} s={1.0} f={SKIN} op={0}/>

          {/* ══════ BEAT 11 — Camino iluminado (wide) ══════
              Cámara: (1500, 970, 0.26)                      */}
          <circle className="b11-g" cx="748"  cy="1375" r="175" fill="url(#cGlow)" opacity="0"/>
          <circle className="b11-g" cx="1468" cy="1375" r="175" fill="url(#cGlow)" opacity="0"/>
          <circle className="b11-g" cx="2100" cy="1270" r="175" fill="url(#cGlow)" opacity="0"/>
          <circle className="b11-g" cx="2698" cy="1340" r="175" fill="url(#cGlow)" opacity="0"/>
          {/* Familia extra play area */}
          <g className="b11-f" opacity="0">
            <WA x={1375} y={1458} s={1.38} f={SKIN}/>
            <WC x={1430} y={1460} s={1.04} f={SKIN}/>
            <WC x={1468} y={1460} s={.94}  f={SKIN}/>
          </g>
          {/* Familia extra Casa Ronald */}
          <g className="b11-f" opacity="0">
            <WA x={2058} y={1458} s={1.38} f={SKIN}/>
            <WA x={2118} y={1458} s={1.32} f={SKIN}/>
            <WC x={2172} y={1460} s={1.04} f={SKIN}/>
          </g>
          {/* Familia extra waiting */}
          <g className="b11-f" opacity="0">
            <WA x={2648} y={1458} s={1.38} f={SKIN}/>
            <WC x={2704} y={1460} s={1.04} f={SKIN}/>
          </g>

          {/* ══════ BEAT 12 — La app ══════
              Cámara: (2255, 1040, 1.50) */}
          <g id="b12-phone" opacity="0" transform="translate(2105,718)">
            <ellipse cx="150" cy="582" rx="140" ry="17" fill="black" opacity=".4"/>
            <rect x="0"  y="0"   width="300" height="552" rx="32" fill="#0e1020"/>
            <rect x="4"  y="4"   width="292" height="544" rx="29" fill="#06091a"/>
            <rect x="104" y="10" width="92"  height="14"  rx="7"  fill="#0e1020"/>
            <rect x="4"  y="20"  width="292" height="82"  fill="url(#cHdr)"/>
            <rect x="4"  y="82"  width="292" height="22"  fill={OR_DARK}/>
            <text x="150" y="66"  textAnchor="middle" fill="white" fontSize="21" fontFamily="sans-serif" fontWeight="bold">mcFaro</text>
            <text x="150" y="95"  textAnchor="middle" fill="white" fontSize="10" fontFamily="sans-serif" opacity=".8">Hola, García · Martes 8 Abr</text>
            <rect className="b12-c" x="14" y="112" width="272" height="78" rx="11" fill="#121830" opacity="0"/>
            <text x="30" y="136" fill="#aaa"  fontSize="9"  fontFamily="sans-serif">PRÓXIMA CITA</text>
            <text x="30" y="157" fill="white" fontSize="13" fontFamily="sans-serif" fontWeight="bold">Mañana 9:00 · Oncología</text>
            <text x="30" y="176" fill={AMBER} fontSize="9"  fontFamily="sans-serif">Recordatorio activo ✓</text>
            <rect className="b12-c" x="14" y="200" width="272" height="78" rx="11" fill="#121830" opacity="0"/>
            <text x="30" y="224" fill="#aaa"    fontSize="9"  fontFamily="sans-serif">COMIDA HOY</text>
            <text x="30" y="245" fill="white"   fontSize="13" fontFamily="sans-serif" fontWeight="bold">Sin costo · 3 tiempos</text>
            <text x="30" y="264" fill="#6aaa30" fontSize="9"  fontFamily="sans-serif">Disponible ✓</text>
            <rect className="b12-c" x="14" y="288" width="272" height="78" rx="11" fill="#121830" opacity="0"/>
            <text x="30" y="312" fill="#aaa"    fontSize="9"  fontFamily="sans-serif">TRANSPORTE</text>
            <text x="30" y="333" fill="white"   fontSize="13" fontFamily="sans-serif" fontWeight="bold">Van 8:30 · Puerta Norte</text>
            <text x="30" y="352" fill="#5a8aee" fontSize="9"  fontFamily="sans-serif">Lugar reservado ✓</text>
            <rect className="b12-c" x="14" y="376" width="272" height="78" rx="11" fill="#121830" opacity="0"/>
            <text x="30" y="400" fill="#aaa"    fontSize="9"  fontFamily="sans-serif">COMUNIDAD</text>
            <text x="30" y="421" fill="white"   fontSize="13" fontFamily="sans-serif" fontWeight="bold">3 papás en sala de espera</text>
            <text x="30" y="440" fill="#9a7aff" fontSize="9"  fontFamily="sans-serif">Grupo activo hoy ✓</text>
            <rect x="4"   y="464" width="292" height="84" rx="0" fill="#0e1020"/>
            <line x1="4"  y1="464" x2="296" y2="464" stroke="#1a2040" strokeWidth="1"/>
            {(['📅','🍽','🚐','🤝'] as string[]).map((em,i) => (
              <text key={i} x={48+i*68} y="503" textAnchor="middle" fontSize="22">{em}</text>
            ))}
          </g>

        </svg>
      </div>

      {/* ── TEXTO (espacio del viewport, no del mundo) ── */}
      <div
        ref={textRef}
        className={`absolute z-20 pointer-events-none ${tPos}`}
        style={{ opacity:0 }}
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
          style={{ whiteSpace:'pre-line' }}
        >
          {current === 3
            ? <>mc<span className="text-amber-300">Faro</span></>
            : beat.h}
        </h2>
        {beat.b && current !== 10 && (
          <p className="mt-3 text-blue-100/65 font-light leading-relaxed text-sm sm:text-lg" style={{ whiteSpace:'pre-line' }}>
            {beat.b}
          </p>
        )}
        {current === 10 && beat.b && (
          <p className="mt-3 text-amber-300 font-bold text-2xl sm:text-4xl md:text-5xl leading-tight" style={{ whiteSpace:'pre-line' }}>
            {beat.b}
          </p>
        )}
        {beat.cta && (
          <div className="mt-7 pointer-events-auto">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-white font-bold rounded-full text-sm sm:text-base px-8 py-4 min-h-12 transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background:`linear-gradient(135deg,${OR_DARK} 0%,${ORANGE} 65%,${AMBER} 100%)`,
                boxShadow:`0 0 36px rgba(200,90,42,.55)`,
              }}
            >
              Comenzar <span aria-hidden>→</span>
            </Link>
          </div>
        )}
      </div>

      {/* ── Puntos indicadores ── */}
      <div className="absolute top-5 inset-x-0 flex justify-center z-30">
        <div className="flex items-center gap-1.5">
          {BEATS.map((_,i) => (
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
          style={{ background:'rgba(245,200,66,.1)', border:'1px solid rgba(245,200,66,.22)', backdropFilter:'blur(4px)' }}
          aria-label="Anterior"
        >
          <span className="text-amber-300">←</span>
        </button>
      )}
      {current < 11 && (
        <button
          onClick={() => moveTo(current + 1)}
          className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={{ background:'rgba(245,200,66,.15)', border:'1px solid rgba(245,200,66,.3)', backdropFilter:'blur(4px)' }}
          aria-label="Siguiente"
        >
          <span className="text-amber-300">→</span>
        </button>
      )}

      {/* ── Hint (solo primer beat) ── */}
      {current === 0 && (
        <p className="absolute bottom-7 inset-x-0 text-center z-30 text-amber-300/35 text-[11px] tracking-[0.25em] uppercase animate-pulse pointer-events-none">
          Click para continuar · ← →
        </p>
      )}

    </div>
  )
}
