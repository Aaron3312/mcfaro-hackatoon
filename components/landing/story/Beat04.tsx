/* Beat 04 — El haz los encuentra: faro barre y se detiene sobre papá y Sofía */
import gsap from 'gsap'
import { AMBER } from './constants'

export function Beat04() {
  return (
    <>
      <defs>
        <radialGradient id="b4-glowSofGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor={AMBER} stopOpacity="0.45"/>
          <stop offset="100%" stopColor={AMBER} stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="b4-glowPaGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor={AMBER} stopOpacity="0.40"/>
          <stop offset="100%" stopColor={AMBER} stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* Glow amber alrededor de Sofía */}
      <ellipse id="b4-gsof" cx="820" cy="1460" rx="60" ry="75"
        fill="url(#b4-glowSofGrad)" opacity="0"/>

      {/* Glow amber alrededor de Papá */}
      <ellipse id="b4-gpa" cx="908" cy="1448" rx="72" ry="88"
        fill="url(#b4-glowPaGrad)" opacity="0"/>
    </>
  )
}

export function animateIn() {
  gsap.set('#b4-gsof', { opacity: 0 })
  gsap.set('#b4-gpa',  { opacity: 0 })

  // Toda la familia y tienda arranca oscura
  gsap.set(['#gf-pa', '#gf-ma', '#gf-h1', '#gf-h2', '#gf-sof', '#gf-shop'], { opacity: 0.05 })

  // El haz arranca rotado hacia arriba, luego barre hacia la familia
  gsap.killTweensOf('#world-beam')
  gsap.set('#world-beam', { opacity: 0, rotation: -20, svgOrigin: '300 1389' })

  const tl = gsap.timeline()

  // 1. El haz aparece y barre lentamente hacia la derecha (familia)
  tl.to('#world-beam', { opacity: 1, duration: 0.5, ease: 'power2.out' })
  tl.to('#world-beam', { rotation: 0, duration: 1.6, ease: 'power2.inOut' }, '<')

  // 2. El haz se detiene — papá y Sofía emergen de la oscuridad
  tl.to(['#gf-pa', '#gf-sof'], { opacity: 1, duration: 0.6, ease: 'power2.out' }, '<+1.3')

  // 3. Glow cálido amber rodea a cada uno
  tl.to('#b4-gsof', { opacity: 1, duration: 0.8, ease: 'power1.out' }, '<+0.1')
  tl.to('#b4-gpa',  { opacity: 1, duration: 0.8, ease: 'power1.out' }, '<+0.15')
}
