/* Beat 09 — No estaba solo: papá + otros padres + mano de apoyo */
import gsap from 'gsap'
import { SKIN, AMBER } from './constants'
import { WA } from './figures'

export function Beat09() {
  return (
    <>
      {([2478, 2618, 2758, 2898] as number[]).map((bx, i) => (
        <rect key={i} x={bx} y="1435" width="118" height="20" rx="4" fill="#1e1408"/>
      ))}
      <WA id="b9-pa"  x={2518} y={1455} s={1.5} f="#7a6a58" op={0}/>
      <WA cn="b9-o"   x={2658} y={1455} s={1.5} f="#6a5a8a" op={0}/>
      <WA cn="b9-o"   x={2798} y={1455} s={1.4} f="#5a7a6a" op={0}/>
      <WA cn="b9-o"   x={2938} y={1455} s={1.3} f="#7a6a5a" op={0}/>
      <line id="b9-hand" x1="2658" y1="1390" x2="2558" y2="1395"
        stroke={AMBER} strokeWidth="6" strokeLinecap="round" opacity="0"/>
    </>
  )
}

export function animateIn() {
  gsap.set(['#b9-pa', '.b9-o', '#b9-hand'], { opacity: 0 })
  gsap.timeline()
    .to('#b9-pa',  { opacity: 1, duration: .4 })
    .to('.b9-o',   { opacity: 1, stagger: .15, duration: .35 })
    .fromTo('#b9-hand', { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: .4, svgOrigin: '2660 1390' })
}
