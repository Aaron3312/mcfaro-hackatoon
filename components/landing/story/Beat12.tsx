/* Beat 12 — La app: teléfono con la pantalla completa de mcFaro */
import gsap from 'gsap'
import { AMBER, OR_DARK } from './constants'

export function Beat12() {
  return (
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
      <text x="30" y="136" fill="#aaa"    fontSize="9"  fontFamily="sans-serif">PRÓXIMA CITA</text>
      <text x="30" y="157" fill="white"   fontSize="13" fontFamily="sans-serif" fontWeight="bold">Mañana 9:00 · Oncología</text>
      <text x="30" y="176" fill={AMBER}   fontSize="9"  fontFamily="sans-serif">Recordatorio activo ✓</text>
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
      {(['📅','🍽','🚐','🤝'] as string[]).map((em, i) => (
        <text key={i} x={48+i*68} y="503" textAnchor="middle" fontSize="22">{em}</text>
      ))}
    </g>
  )
}

export function animateIn() {
  gsap.set(['#b12-phone', '.b12-c'], { opacity: 0 })
  gsap.set('#b12-phone', { y: 110 })
  gsap.timeline()
    .to('#b12-phone', { y: 0, opacity: 1, duration: .5 })
    .to('.b12-c',     { opacity: 1, stagger: .13, duration: .3 }, '<+.25')
}
