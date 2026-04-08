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
  //gsof es Sofía en el beat anterior, gpa es papá. Los ocultamos por si quedaron visibles por error al terminar el beat anterior
  gsap.killTweensOf(['#b5-wsof', '#b5-wpa', '#b5-door', '#b5-winL', '#b5-winR', '#b5-glowL', '#b5-glowR', '#b5-doorGlow'])
  // Reset personajes a posición inicial y ocultos

  // Posiciones iniciales (cerca de la puerta)
  gsap.set('#b5-wsof', { x: 2050, y: 1448 })
  //wsof es Sofía, wpa es papá. Los posicionamos cerca de la puerta para que la caminata se vea natural
  gsap.set('#b5-wpa',  { x: 2100, y: 1443 })
  gsap.set(['.b5-wsof-inner', '.b5-wpa-inner'], { opacity: 0 })

  // Reset casa y elementos
  gsap.set('#b5-casa', { opacity: 1 })
  gsap.set('#b5-door', { opacity: 1 })
  gsap.set('#b5-winL, #b5-winR', { fill: '#04060e' })
  gsap.set('#b5-glowL, #b5-glowR, #b5-doorGlow', { opacity: 0 })

  const tl = gsap.timeline()

  // 1. Aparecen personajes
  tl.to('.b5-wsof-inner', { opacity: 1, duration: 0.4 }, 0.2)
  tl.to('.b5-wpa-inner',  { opacity: 1, duration: 0.4 }, 0.3)

  // 2. Caminata corta hasta la puerta
  const walk = (target: string, dist: number, delay: number) => {
    const t = gsap.timeline()
    t.to(target, {
      x: `+=${dist}`,
      duration: 0.4, // a mayor numero más lento (pero no demasiado para que no se vea raro)
      ease: 'power1.inOut'
    }, 0)
    t.to(target, {
      y: '-=8',
      duration: 0.18, // a mayor numero más lento (pero no demasiado para que no se vea raro)
      repeat: 6,
      yoyo: true,
      ease: 'sine.inOut'
    }, 0)
    return t.delay(delay)
  }

  tl.add(walk('#b5-wsof', 150, 0.3))
  tl.add(walk('#b5-wpa', 100, 0.35)) // Las variables sirven para ajustar la distancia y el delay de cada personaje, para que no caminen exactamente al mismo ritmo y se vea más natural por ejemplo si papá es un poco más alto que Sofía, podría caminar un poco más lento y con un paso más largo, mientras que Sofía podría caminar un poco más rápido y con pasos más cortos. Estos ajustes ayudan a darles personalidad a cada uno y a que la escena se sienta más orgánica.

  // ejemplo 
  // tl.add(walk('#b5-wsof', 300, 0.3)) // Sofía camina 300px con un delay de 0.3s
  // tl.add(walk('#b5-wpa', 320, 0.35)) // Papá camina 320px con un delay de 0.35s, un poco más lento y con pasos más largos que Sofía

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
  tl.to('.b5-wsof-inner', { opacity: 0, duration: 3.6, ease: 'power3.in' }, '<')

  tl.to('#b5-wpa', {
    x: '+=80',
    duration: 0.6,
    ease: 'power3.in'
  }, 1.55)
  tl.to('.b5-wpa-inner', { opacity: 0, duration: 3.6, ease: 'power3.in' }, '<')
}
