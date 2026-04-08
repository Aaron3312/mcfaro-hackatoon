/* Beat 06 — Registro: escritorio + teléfono con la app */
import gsap from 'gsap'
import { SKIN, AMBER, OR_DARK, ORANGE } from './constants'
import { WA } from './figures'

export function Beat06() {
  return (
    <>
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
        <text x="30" y="107" fill="#aaa"    fontSize="9"  fontFamily="sans-serif">PRÓXIMA CITA</text>
        <text x="30" y="126" fill="white"   fontSize="12" fontFamily="sans-serif" fontWeight="bold">Mañana 9:00 · Oncología</text>
        <text x="30" y="143" fill={AMBER}   fontSize="9"  fontFamily="sans-serif">Recordatorio activo ✓</text>
        <rect className="b6-card" x="16" y="162" width="184" height="70" rx="10" fill="#121830" opacity="0"/>
        <text x="30" y="185" fill="#aaa"    fontSize="9"  fontFamily="sans-serif">COMIDA HOY</text>
        <text x="30" y="204" fill="white"   fontSize="12" fontFamily="sans-serif" fontWeight="bold">Sin costo · 3 tiempos</text>
        <text x="30" y="221" fill="#6aaa30" fontSize="9"  fontFamily="sans-serif">Disponible ✓</text>
        <rect className="b6-card" x="16" y="240" width="184" height="70" rx="10" fill="#121830" opacity="0"/>
        <text x="30" y="263" fill="#aaa"    fontSize="9"  fontFamily="sans-serif">TRANSPORTE</text>
        <text x="30" y="282" fill="white"   fontSize="12" fontFamily="sans-serif" fontWeight="bold">Van 8:30 · Puerta Norte</text>
        <text x="30" y="299" fill="#5a8aee" fontSize="9"  fontFamily="sans-serif">Lugar reservado ✓</text>
        <rect className="b6-card" x="16" y="318" width="184" height="70" rx="10" fill="#121830" opacity="0"/>
        <text x="30" y="341" fill="#aaa"    fontSize="9"  fontFamily="sans-serif">COMUNIDAD</text>
        <text x="30" y="360" fill="white"   fontSize="12" fontFamily="sans-serif" fontWeight="bold">3 papás esperando</text>
        <text x="30" y="377" fill="#9a7aff" fontSize="9"  fontFamily="sans-serif">Grupo activo ✓</text>
      </g>
    </>
  )
}

export function animateIn() {
  const tl = gsap.timeline()

  gsap.set(['#b6-desk', '#b6-phone', '.b6-card'], { opacity: 0 })
  gsap.set('#b6-phone', { y: 90 })

  // Reset cámara (importante)
  gsap.set('#stage', { scale: 1, x: 0, y: 0 })

  // Fade OUT negro (revela interior)
  tl.to('#scene-fade', {
    opacity: 0,
    duration: 0.6
  })

  // Aparece escena
  tl.to('#b6-desk', {
    opacity: 1,
    duration: 0.5
  }, '-=0.2')

  tl.to('#b6-phone', {
    opacity: 1,
    y: 0,
    duration: 0.6,
    ease: 'power2.out'
  }, '<+0.2')

  tl.to('.b6-card', {
    opacity: 1,
    stagger: 0.12,
    duration: 0.3
  }, '<+0.2')

  return tl
}
