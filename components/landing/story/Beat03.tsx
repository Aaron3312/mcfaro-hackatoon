/* Beat 03 — Incertidumbre: papá solo con signos de interrogación */
import gsap from 'gsap'
import { WA } from './figures'

export function Beat03() {
  return (
    <>
      <WA id="b3-pa" x={420} y={1455} s={1.5} f="#6a5a4a" op={0}/> {/* Papá reaparece, pero sin rasgos faciales, solo con signos de interrogación flotando sobre él */}

      <g id="b3-q1" opacity="0" transform="translate(325,1238)">
        <circle cx="0" cy="0" r="58" fill="none" stroke="#3a4a7a" strokeWidth="3" opacity=".62"/>
        <text x="0" y="22" textAnchor="middle" fill="#5a6a9a" fontSize="58" fontFamily="Georgia,serif" fontWeight="bold">?</text>
      </g>
      <g id="b3-q2" opacity="0" transform="translate(472,1155)">
        <circle cx="0" cy="0" r="48" fill="none" stroke="#3a4a7a" strokeWidth="3" opacity=".62"/>
        <text x="0" y="18" textAnchor="middle" fill="#5a6a9a" fontSize="48" fontFamily="Georgia,serif" fontWeight="bold">?</text>
      </g>
      <g id="b3-q3" opacity="0" transform="translate(402,1068)">
        <circle cx="0" cy="0" r="40" fill="none" stroke="#3a4a7a" strokeWidth="3" opacity=".62"/>
        <text x="0" y="15" textAnchor="middle" fill="#5a6a9a" fontSize="40" fontFamily="Georgia,serif" fontWeight="bold">?</text>
      </g>
    </>
  )
}

export function animateIn() {
  gsap.set(['#gf-pa', '#gf-ma', '#gf-h1', '#gf-h2', '#gf-sof'], { opacity: 1 })
  gsap.set(['#b3-pa', '#b3-q1', '#b3-q2', '#b3-q3'], { opacity: 0, y: 0 })
  gsap.timeline()
    .to('#b3-pa', { opacity: 1, duration: .4 })
    .to('#b3-q1', { opacity: 1, duration: .35 }, '<+.3')
    .to('#b3-q2', { opacity: 1, duration: .35 }, '<+.25')
    .to('#b3-q3', { opacity: 1, duration: .35 }, '<+.25')
  gsap.to(['#b3-q1', '#b3-q2', '#b3-q3'], {
    y: -30, duration: 2.2, repeat: -1, yoyo: true, ease: 'sine.inOut', stagger: .5,
  })
}
