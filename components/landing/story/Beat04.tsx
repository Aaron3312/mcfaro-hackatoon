/* Beat 04 — El haz los encuentra: faro barre y se detiene sobre papá y Sofía */
import gsap from 'gsap'
import { AMBER } from './constants'

// Cámara beat4: {x:575, y:1380, z:0.65}
// Faro  (300,1389) → screen ≈ (vw/2−179, vh/2+6)   — izquierda, centro vertical
// Sofia (820,1502) → screen ≈ (vw/2+159, vh/2+79)  — derecha, ligeramente abajo
// Papa  (878,1492) → screen ≈ (vw/2+196, vh/2+73)

export function Beat04() {
  return (
    <>
      <defs>
        <radialGradient id="b4-glowSofGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor={AMBER} stopOpacity="0.50"/>
          <stop offset="100%" stopColor={AMBER} stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="b4-glowPaGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor={AMBER} stopOpacity="0.45"/>
          <stop offset="100%" stopColor={AMBER} stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* Glow amber alrededor de Sofía (x=820) */}
      <ellipse id="b4-gsof" cx="822" cy="1460" rx="58" ry="72"
        fill="url(#b4-glowSofGrad)" opacity="0"/>

      {/* Glow amber alrededor de Papá (x=878, ahora junto a Sofia) */}
      <ellipse id="b4-gpa" cx="895" cy="1448" rx="68" ry="84"
        fill="url(#b4-glowPaGrad)" opacity="0"/>
    </>
  )
}

export function animateIn() {
  // ── Limpiar artefactos del beat anterior ───────────────────
  const b2LetraIds = 'leucemia'.split('').map((_, i) => `#b2-l${i}`)
  gsap.set(['#b2-cross', '#b2-spot', ...b2LetraIds], { opacity: 0 })

  // ── Reset beat 4 ────────────────────────────────────────────
  gsap.set('#b4-gsof', { opacity: 0 })
  gsap.set('#b4-gpa',  { opacity: 0 })

  // Toda la familia y tienda arranca oscura
  gsap.set(['#gf-pa', '#gf-ma', '#gf-h1', '#gf-h2', '#gf-sof', '#gf-shop'], { opacity: 0.05 })

  // El haz arranca apuntando hacia arriba, luego barre hacia la familia
  gsap.killTweensOf('#world-beam')
  gsap.set('#world-beam', { opacity: 0, rotation: -22, svgOrigin: '300 1389' })

  const tl = gsap.timeline()

  // 1. El haz aparece y barre lentamente — efecto de búsqueda
  tl.to('#world-beam', { opacity: 1, duration: 0.5, ease: 'power2.out' })
  tl.to('#world-beam', { rotation: 8, duration: 2.0, ease: 'power2.inOut' }, '<')

  // 2. El haz se detiene — papá y Sofía emergen
  tl.to(['#gf-pa', '#gf-sof'], { opacity: 1, duration: 0.7, ease: 'power2.out' }, '<+1.6')

  // 3. Glow cálido amber rodea a cada uno
  tl.to('#b4-gsof', { opacity: 1, duration: 0.9, ease: 'power1.out' }, '<+0.1')
  tl.to('#b4-gpa',  { opacity: 1, duration: 0.9, ease: 'power1.out' }, '<+0.15')
}
