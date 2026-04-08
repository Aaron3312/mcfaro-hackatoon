/* Beat 11 — Panorámica: todo el mundo iluminado */
import gsap from 'gsap'
import { SKIN } from './constants'
import { WA, WC } from './figures'

export function Beat11() {
  return (
    <>
      <circle className="b11-g" cx="748"  cy="1375" r="175" fill="url(#cGlow)" opacity="0"/>
      <circle className="b11-g" cx="1468" cy="1375" r="175" fill="url(#cGlow)" opacity="0"/>
      <circle className="b11-g" cx="2100" cy="1270" r="175" fill="url(#cGlow)" opacity="0"/>
      <circle className="b11-g" cx="2698" cy="1340" r="175" fill="url(#cGlow)" opacity="0"/>

      {/* Familia en área de juegos */}
      <g className="b11-f" opacity="0">
        <WA x={1375} y={1458} s={1.38} f={SKIN}/>
        <WC x={1430} y={1460} s={1.04} f={SKIN}/>
        <WC x={1468} y={1460} s={.94}  f={SKIN}/>
      </g>
      {/* Familia en Casa Ronald */}
      <g className="b11-f" opacity="0">
        <WA x={2058} y={1458} s={1.38} f={SKIN}/>
        <WA x={2118} y={1458} s={1.32} f={SKIN}/>
        <WC x={2172} y={1460} s={1.04} f={SKIN}/>
      </g>
      {/* Familia en sala de espera */}
      <g className="b11-f" opacity="0">
        <WA x={2648} y={1458} s={1.38} f={SKIN}/>
        <WC x={2704} y={1460} s={1.04} f={SKIN}/>
      </g>
    </>
  )
}

export function animateIn() {
  gsap.set(['.b11-f', '.b11-g'], { opacity: 0 })
  gsap.timeline()
    .to('.b11-f', { opacity: 1, stagger: .12, duration: .5 })
    .to('.b11-g', { opacity: 1, stagger: .1,  duration: .5 }, '<+.2')
  gsap.to('.b11-g', {
    scale: 1.14, duration: 2.2, repeat: -1, yoyo: true, ease: 'sine.inOut', stagger: .35,
    transformOrigin: 'center',
  })
}
