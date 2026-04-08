/* Beat 05 — Sofía y papá entran a Casa Ronald McDonald */
import gsap from 'gsap'
import { SKIN, AMBER } from './constants'
import { WA, WC } from './figures'
import { beamLoopTween } from '../CinematicStory'

export function Beat05() {
  return (
    <>
      {/* Sofía */}
      <g id="b5-wsof">
        <WC cn="b5-wsof-inner" x={0} y={0} s={1.1} f={SKIN} op={0}/>
      </g>

      {/* Papá */}
      <g id="b5-wpa">
        <WA cn="b5-wpa-inner" x={0} y={0} s={1.5} f={SKIN} op={0}/>
      </g>
    </>
  )
}

export function animateIn() {
  beamLoopTween?.kill()
  gsap.set(['#b4-gsof', '#b4-gpa'], { opacity: 0 })
  gsap.killTweensOf(['#b5-wsof', '#b5-wpa', '#b5-door', '#b5-winL', '#b5-winR', '#b5-glowL', '#b5-glowR', '#b5-doorGlow', '#stage', '#scene-fade'])

  // Reset cámara
  gsap.set('#stage', { scale: 1, x: 0, y: 0 })

  // Posiciones iniciales (cerca de la puerta)
  gsap.set('#b5-wsof', { x: 2050, y: 1448 })
  gsap.set('#b5-wpa',  { x: 2100, y: 1443 })
  gsap.set(['.b5-wsof-inner', '.b5-wpa-inner'], { opacity: 0 })

  // Reset casa y elementos
  gsap.set('#b5-casa', { opacity: 1 })
  gsap.set('#b5-door', { opacity: 1 })
  gsap.set('#b5-winL, #b5-winR', { fill: '#04060e' })
  gsap.set('#b5-glowL, #b5-glowR, #b5-doorGlow', { opacity: 0 })
  gsap.set('#scene-fade', { opacity: 0 })

  const tl = gsap.timeline()

  // 1. Aparecen personajes
  tl.to('.b5-wsof-inner', { opacity: 1, duration: 0.4 }, 0.2)
  tl.to('.b5-wpa-inner',  { opacity: 1, duration: 0.4 }, 0.3)

  // 2. Caminata corta hasta la puerta
  const walk = (target: string, dist: number, delay: number) => {
    const t = gsap.timeline()
    t.to(target, {
      x: `+=${dist}`,
      duration: 0.4,
      ease: 'power1.inOut'
    }, 0)
    t.to(target, {
      y: '-=8',
      duration: 0.18,
      repeat: 6,
      yoyo: true,
      ease: 'sine.inOut'
    }, 0)
    return t.delay(delay)
  }

  tl.add(walk('#b5-wsof', 150, 0.3))
  tl.add(walk('#b5-wpa', 100, 0.35))

  // 3. Ventanas reaccionan (se encienden)
  tl.to('#b5-winL', { fill: AMBER, duration: 0.3 }, 0.9)
  tl.to('#b5-glowL', { opacity: 1, duration: 0.5 }, 0.9)

  tl.to('#b5-winR', { fill: AMBER, duration: 0.3 }, 1.1)
  tl.to('#b5-glowR', { opacity: 1, duration: 0.5 }, 1.1)

  // 4. Puerta se abre
  tl.to('#b5-door', { opacity: 0, duration: 0.4 }, 1.4)
  tl.to('#b5-doorGlow', { opacity: 1, duration: 0.5 }, 1.4)

  // 5. Entran a la casa (se desvanecen)
  tl.to('#b5-wsof', {
    x: '+=90',
    duration: 0.6,
    ease: 'power3.in'
  }, 1.5)
  tl.to('.b5-wsof-inner', { opacity: 0, duration: 0.6 }, '<')

  tl.to('#b5-wpa', {
    x: '+=80',
    duration: 0.6,
    ease: 'power3.in'
  }, 1.55)
  tl.to('.b5-wpa-inner', { opacity: 0, duration: 0.6 }, '<')

  // 6. ZOOM A LA PUERTA (entra a la casa)
  tl.to('#stage', {
    scale: 2.8,
    x: -3600,
    y: -2100,
    duration: 1.2,
    ease: 'power2.inOut'
  }, 1.8)

  // 7. Fade oscuro (entra a interior)
  tl.to('#scene-fade', {
    opacity: 1,
    duration: 0.6,
    ease: 'power2.out'
  }, 2.4)

  return tl
}
