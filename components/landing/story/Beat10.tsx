/* Beat 10 — Sofía jugó: niños jugando con pelota */
import gsap from 'gsap'
import { SKIN, ORANGE, OR_DARK } from './constants'
import { WC } from './figures'

export function Beat10() {
  return (
    <>
      <WC cn="b10-k" id="b10-c1" x={1275} y={1458} s={1.2}  f="#c8a878" op={0}/>
      <WC cn="b10-k" id="b10-c2" x={1365} y={1458} s={1.1}  f="#b89868" op={0}/>
      <WC cn="b10-k" id="b10-c3" x={1448} y={1458} s={1.14} f="#c8a878" op={0}/>
      <circle id="b10-ball" cx="1465" cy="1425" r="26" fill={OR_DARK} opacity="0"/>
      <circle id="b10-ballGlow" cx="1465" cy="1415" r="9" fill={ORANGE} opacity="0"/>
      <WC id="b10-sof" x={1548} y={1458} s={1.0} f={SKIN} op={0}/>
    </>
  )
}

export function animateIn() {
  gsap.set(['.b10-k', '#b10-ball', '#b10-ballGlow', '#b10-sof'], { opacity: 0, x: 0 })
  gsap.set('#b10-ball', { scale: .2, transformOrigin: '1470px 1420px' })
  gsap.timeline()
    .to('.b10-k',    { opacity: 1, stagger: .14, duration: .35 })
    .to('#b10-ball', { opacity: 1, scale: 1, transformOrigin: '1470px 1420px', duration: .25 }, '<+.1')
    .to('#b10-ballGlow', { opacity: .5, duration: .25 }, '<')
    .fromTo('#b10-sof', { x: 340, opacity: 0 }, { x: 0, opacity: 1, duration: .5 })
  gsap.to('.b10-k', {
    y: -18, duration: .5, repeat: -1, yoyo: true, ease: 'power2.inOut', stagger: .16, delay: .4,
  })
}
