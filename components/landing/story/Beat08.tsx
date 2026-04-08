/* Beat 08 — Transporte: hospital + van mcFaro */
import gsap from 'gsap'
import { SKIN, OR_DARK } from './constants'
import { WA, WC } from './figures'

export function Beat08() {
  return (
    <>
      <g id="b8-hosp" opacity="0">
        <rect x="1558" y="1015" width="680" height="455" rx="5" fill="#121826"/>
        <rect x="1558" y="1009" width="680" height="14"  rx="3" fill="#1e2840"/>
        {([0,1,2,3,4] as number[]).map(c => ([0,1,2] as number[]).map(r => (
          <rect key={`${c}${r}`} x={1578+c*120} y={1035+r*110} width="88" height="68" rx="4" fill="#1a2a40" opacity=".85"/>
        )))}
        <rect x="1868" y="958"  width="78" height="20" rx="5" fill="#8B2020"/>
        <rect x="1895" y="943"  width="24" height="52" rx="5" fill="#8B2020"/>
        <text x="1907" y="998" textAnchor="middle" fill="white" fontSize="12" fontFamily="sans-serif" fontWeight="bold">HOSPITAL</text>
      </g>

      <g id="b8-van" opacity="0">
        <rect x="1215" y="1342" width="398" height="168" rx="12" fill={OR_DARK}/>
        <rect x="1555" y="1362" width="128" height="148" rx="10" fill="#9a4018"/>
        <rect x="1235" y="1358" width="290" height="88"  rx="6"  fill="#1a3060" opacity=".7"/>
        <rect x="1563" y="1368" width="110" height="70"  rx="5"  fill="#1a3060" opacity=".7"/>
        <circle cx="1335" cy="1510" r="40" fill="#0a0806"/>
        <circle cx="1335" cy="1510" r="26" fill="#1a1a1a"/>
        <circle cx="1555" cy="1510" r="40" fill="#0a0806"/>
        <circle cx="1555" cy="1510" r="26" fill="#1a1a1a"/>
        <text x="1415" y="1438" textAnchor="middle" fill="white" fontSize="22" fontFamily="sans-serif" fontWeight="bold">mcFaro</text>
      </g>

      <WA cn="b8-w" x={1510} y={1455} s={1.5} f={SKIN} op={0}/>
      <WC cn="b8-w" x={1558} y={1458} s={1.1} f={SKIN} op={0}/>
    </>
  )
}

export function animateIn() {
  gsap.set(['#b8-hosp', '#b8-van', '.b8-w'], { opacity: 0, x: 0 })
  gsap.timeline()
    .to('#b8-hosp',  { opacity: 1, duration: .4 })
    .fromTo('#b8-van', { x: -360, opacity: 0 }, { x: 0, opacity: 1, duration: .6 }, '<+.2')
    .to('.b8-w',     { opacity: 1, stagger: .1, duration: .3 }, '-=.2')
    .to('.b8-w',     { x: -100, opacity: 0, duration: .35 }, '<+.5')
    .to('#b8-van',   { x: 380, duration: .45 }, '<+.2')
}
