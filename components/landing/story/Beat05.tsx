/* Beat 05 — Llegaron a Casa */
import gsap from 'gsap'
import { SKIN, AMBER, OR_DARK, ORANGE } from './constants'
import { WA, WC } from './figures'
import { beamLoopTween } from '../CinematicStory'

export function Beat05() {
  return (
    <>
      <defs>
        <radialGradient id="b5-winGlowL" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={AMBER} stopOpacity="0.55"/>
          <stop offset="100%" stopColor={AMBER} stopOpacity="0"/>
        </radialGradient>

        <radialGradient id="b5-winGlowR" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={ORANGE} stopOpacity="0.55"/>
          <stop offset="100%" stopColor={ORANGE} stopOpacity="0"/>
        </radialGradient>

        <radialGradient id="b5-doorGlowGrad" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor={AMBER} stopOpacity="0.50"/>
          <stop offset="100%" stopColor={AMBER} stopOpacity="0"/>
        </radialGradient>
      </defs>

      <g id="b5-casa" opacity="0">
        <ellipse cx="2290" cy="1456" rx="380" ry="16" fill="#000" opacity=".4"/>

        <rect x="1930" y="1152" width="720" height="296" rx="4" fill="#1a0f07"/>

        <polygon points="1908,1156 2290,928 2672,1156" fill="#28180a"/>
        <polygon points="1922,1156 2290,942 2658,1156" fill="#3e2414"/>

        <rect x="2340" y="970" width="56" height="86" rx="3" fill="#28180a"/>
        <rect x="2334" y="964" width="68" height="14" rx="2" fill="#3e2414"/>

        <rect x="2100" y="1156" width="380" height="32" rx="3" fill="#0d0805" opacity=".75"/>
        <text x="2290" y="1178" textAnchor="middle"
          fill={AMBER} fontSize="22" fontWeight="700">
          Casa Ronald McDonald
        </text>

        {/* Ventana izquierda */}
        <rect id="b5-winL" x="1968" y="1196" width="206" height="158" rx="4" fill="#04060e"/>
        <line x1="2071" y1="1196" x2="2071" y2="1354" stroke="#0d0905" strokeWidth="5"/>
        <line x1="1968" y1="1275" x2="2174" y2="1275" stroke="#0d0905" strokeWidth="5"/>
        <ellipse id="b5-glowL" cx="2071" cy="1275" rx="140" ry="95"
          fill="url(#b5-winGlowL)" opacity="0"/>

        {/* Ventana derecha */}
        <rect id="b5-winR" x="2406" y="1196" width="206" height="158" rx="4" fill="#04060e"/>
        <line x1="2509" y1="1196" x2="2509" y2="1354" stroke="#0d0905" strokeWidth="5"/>
        <line x1="2406" y1="1275" x2="2612" y2="1275" stroke="#0d0905" strokeWidth="5"/>
        <ellipse id="b5-glowR" cx="2509" cy="1275" rx="140" ry="95"
          fill="url(#b5-winGlowR)" opacity="0"/>

        {/* Umbral */}
        <rect x="2223" y="1242" width="134" height="206" rx="4" fill="#080302"/>

        {/* Glow puerta */}
        <ellipse id="b5-doorGlow"
          cx="2290" cy="1448" rx="80" ry="30"
          fill="url(#b5-doorGlowGrad)" opacity="0"/>

        {/* Puerta COMPLETA */}
        <g id="b5-door">
          <rect x="2223" y="1242" width="134" height="206" rx="4" fill="#3c2010"/>
          <rect x="2231" y="1252" width="52" height="72" rx="3" fill="#2e1808"/>
          <rect x="2295" y="1252" width="52" height="72" rx="3" fill="#2e1808"/>
          <rect x="2231" y="1334" width="116" height="108" rx="3" fill="#2e1808"/>
          <circle cx="2337" cy="1368" r="7" fill={AMBER}/>
        </g>

        {/* Arcos */}
        <rect x="2260" y="1232" width="62" height="11" rx="3" fill={OR_DARK}/>
        <rect x="2284" y="1221" width="14" height="23" rx="3" fill={OR_DARK}/>
      </g>

      <g id="b5-wsof">
        <WC cn="b5-wsof-inner" x={0} y={0} s={1.1} f={SKIN} op={0}/>
      </g>

      <g id="b5-wpa">
        <WA cn="b5-wpa-inner" x={0} y={0} s={1.5} f={SKIN} op={0}/>
      </g>
    </>
  )
}
export function animateIn() {
  beamLoopTween?.kill()

  gsap.set(['#b4-gsof', '#b4-gpa'], { opacity: 0 })
  gsap.killTweensOf('*')

  // Posiciones iniciales
  gsap.set('#b5-wsof', { x: 1690, y: 1448 })
  gsap.set('#b5-wpa',  { x: 1738, y: 1443 })

  gsap.set(['.b5-wsof-inner', '.b5-wpa-inner'], { opacity: 0 })

  gsap.set('#b5-casa', { opacity: 0 })
  gsap.set('#b5-door', { opacity: 1 })
  gsap.set('#b5-glowL, #b5-glowR, #b5-doorGlow', { opacity: 0 })

  const tl = gsap.timeline()

  // Casa fade
  tl.to('#b5-casa', {
    opacity: 1,
    duration: 0.8,
    ease: 'power2.out'
  })

  // Personajes
  tl.to('.b5-wsof-inner', { opacity: 1, duration: 0.4 }, 0.6)
  tl.to('.b5-wpa-inner',  { opacity: 1, duration: 0.4 }, 0.7)

  // Caminata mejorada
  const walk = (target, dist, delay = 0) => {
    const t = gsap.timeline()

    t.to(target, {
      x: `+=${dist}`,
      duration: 2.4,
      ease: 'power1.inOut'
    }, 0)

    t.to(target, {
      y: '-=10',
      duration: 0.22,
      repeat: 9,
      yoyo: true,
      ease: 'sine.inOut'
    }, 0)

    return t.delay(delay)
  }

  tl.add(walk('#b5-wsof', 520, 0.9))
  tl.add(walk('#b5-wpa', 480, 1.0))

  // 🔥 Ventanas (ahora bien integradas)
  tl.to('#b5-winL', { fill: AMBER, duration: 0.4 }, 2.1)
  tl.to('#b5-glowL', { opacity: 1, duration: 0.6 }, 2.1)

  tl.to('#b5-winR', { fill: AMBER, duration: 0.4 }, 2.5)
  tl.to('#b5-glowR', { opacity: 1, duration: 0.6 }, 2.5)

  // Puerta
  tl.to('#b5-door', {
    opacity: 0,
    duration: 0.5,
    ease: 'power2.out'
  }, 2.9)

  tl.to('#b5-doorGlow', {
    opacity: 1,
    duration: 0.6
  }, 3.0)

  // Entrada
  tl.to('#b5-wsof', {
    x: '+=120',
    opacity: 0,
    duration: 0.8,
    ease: 'power3.in'
  }, 3.1)

  tl.to('#b5-wpa', {
    x: '+=100',
    opacity: 0,
    duration: 0.8,
    ease: 'power3.in'
  }, 3.2)
}