/* Beat 05 — Casa Ronald McDonald */
import gsap from 'gsap'
import { SKIN, AMBER, OR_DARK } from './constants'
import { WA, WC } from './figures'

export function Beat05() {
  return (
    <>
      <g id="b5-casa" opacity="0">
        <rect x="1938" y="1145" width="700" height="325" rx="5" fill="#1c1206"/>
        <path d="M1918,1150 L2288,935 L2658,1150 Z" fill="#2a1a0a"/>
        <path d="M1933,1150 L2288,950 L2643,1150 Z" fill="#3a2414"/>
        <rect id="b5-door" x="2148" y="1228" width="122" height="242" rx="4" fill="#5a3520"/>
        <circle cx="2252" cy="1348" r="8" fill={AMBER} opacity=".8"/>
        <rect id="b5-winL" x="1968" y="1185" width="198" height="158" rx="5" fill="#0a0806"/>
        <rect id="b5-winR" x="2408" y="1185" width="198" height="158" rx="5" fill="#0a0806"/>
        <rect x="2270" y="1145" width="42" height="12" rx="3" fill={OR_DARK} opacity=".9"/>
        <rect x="2283" y="1137" width="16" height="28" rx="3" fill={OR_DARK} opacity=".9"/>
      </g>
      <WA id="b5-wpa"  x={2545} y={1455} s={1.5} f={SKIN} op={0}/>
      <WC id="b5-wsof" x={2594} y={1460} s={1.1} f={SKIN} op={0}/>
    </>
  )
}

export function animateIn() {
  // Apagar el haz del faro — ya cumplió su papel en beat 4
  gsap.killTweensOf('#world-beam')
  gsap.set('#world-beam', { opacity: 0 })
  // Limpiar glows de beat 4
  gsap.set(['#b4-gsof', '#b4-gpa'], { opacity: 0 })

  gsap.set(['#b5-casa', '#b5-winL', '#b5-winR', '#b5-wpa', '#b5-wsof'], { opacity: 0, x: 0 })
  gsap.set('#b5-door', { rotation: 0 })
  gsap.timeline()
    .to('#b5-casa',  { opacity: 1, duration: .45 })
    .to('#b5-winL',  { opacity: 1, fill: '#F5C842', duration: .3 }, '<+.3')
    .to('#b5-winR',  { opacity: 1, fill: '#F5C842', duration: .3 }, '<+.1')
    .fromTo(['#b5-wpa', '#b5-wsof'], { x: 440, opacity: 0 }, { x: 0, opacity: 1, stagger: .1, duration: .55 }, '-=.1')
    .to('#b5-door',  { rotation: -46, svgOrigin: '2155 1290', duration: .3 }, '-=.15')
}
