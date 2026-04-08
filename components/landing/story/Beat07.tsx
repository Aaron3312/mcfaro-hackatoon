/* Beat 07 — ¿Qué comen?: papá + burbuja de diálogo + plato + notificación */
import gsap from 'gsap'
import { AMBER, ORANGE, OR_DARK } from './constants'
import { WA } from './figures'

export function Beat07() {
  return (
    <>
      <WA id="b7-pa" x={785} y={1280} s={1.5} f="#7a6a58" op={0}/>

      <g id="b7-bubble" opacity="0">
        <rect x="838" y="1055" width="298" height="98" rx="15" fill="#1e1612" stroke="#3a2a1a" strokeWidth="2"/>
        <path d="M868,1153 L848,1195 L898,1153 Z" fill="#1e1612"/>
        <text x="988" y="1094" textAnchor="middle" fill="#c8a888" fontSize="14" fontFamily="sans-serif" fontStyle="italic">&ldquo;Sofía... no sé</text>
        <text x="988" y="1115" textAnchor="middle" fill="#c8a888" fontSize="14" fontFamily="sans-serif" fontStyle="italic">si podamos comer.&rdquo;</text>
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
    </>
  )
}

export function animateIn() {
  // Limpiar Beat06 — ocultar escena interior y matar loops
  gsap.killTweensOf(['#b6-p1', '#b6-p2', '#b6-p3', '#b6-p4', '#b6-scene'])
  gsap.set(['#b6-scene', '#b6-staff', '#b6-phone', '#b6-screen-glow',
            '#b6-p1', '#b6-p2', '#b6-p3', '#b6-p4'], { opacity: 0 })

  gsap.set(['#b7-pa', '#b7-bubble', '#b7-plate', '#b7-notif'], { opacity: 0, x: 0 })
  gsap.set('#b7-bubble', { scale: .7, transformOrigin: '900px 1100px' })
  gsap.set('#b7-plate',  { scale: .4, transformOrigin: '800px 1210px' })
  gsap.timeline()
    .to('#b7-pa',     { opacity: 1, duration: .4 })
    .to('#b7-bubble', { opacity: 1, scale: 1, duration: .45 }, '<+.2')
    .to('#b7-plate',  { opacity: 1, scale: 1, duration: .4  }, '<+.2')
    .fromTo('#b7-notif', { x: 80, opacity: 0 }, { x: 0, opacity: 1, duration: .5 }, '<+.15')
  gsap.to('#b7-plate', {
    scale: 1.07, transformOrigin: '800px 1210px',
    duration: 1.4, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: .8,
  })
}
