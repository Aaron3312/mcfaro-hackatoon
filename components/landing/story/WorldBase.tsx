/* Mundo base: cielo, nebulosas, estrellas, haz del faro, océano, faro.
   Se renderiza dentro del <svg> del orquestador. */
import { RefObject } from 'react'
import { OR_DARK, ORANGE, AMBER } from './constants'

const STARS: [number, number][] = [
  [140,75],[310,42],[510,108],[695,52],[895,86],[1095,38],[1275,102],[1448,62],
  [1618,88],[1798,36],[1958,112],[2098,58],[2278,98],[2448,48],[2598,82],[2778,110],[2918,52],
  [88,198],[275,168],[475,208],[675,178],[875,198],[1052,158],[1220,212],[1390,182],
  [1558,202],[1728,168],[1898,218],[2058,178],[2228,202],[2398,162],[2568,212],[2738,172],[2878,198],
  [178,318],[398,288],[598,322],[798,298],[998,312],[1198,282],[1398,328],[1598,292],
  [1798,318],[1998,282],[2198,328],[2398,292],[2598,308],[2798,278],[2948,318],
  [248,418],[448,388],[648,422],[848,398],[1048,412],[1248,382],[1448,422],[1648,392],
  [1848,418],[2048,382],[2248,428],[2448,392],[2648,412],[2848,385],
]

interface Props {
  beamRef: RefObject<SVGGElement | null>
}

export function WorldBase({ beamRef }: Props) {
  return (
    <>
      <defs>
        <linearGradient id="cSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#010206"/>
          <stop offset="100%" stopColor="#040818"/>
        </linearGradient>
        <linearGradient id="cOcean" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#0c1945"/>
          <stop offset="100%" stopColor="#040810"/>
        </linearGradient>
        <linearGradient id="cBCore" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#F8D060" stopOpacity=".88"/>
          <stop offset="45%"  stopColor="#F5C030" stopOpacity=".28"/>
          <stop offset="100%" stopColor="#F5C030" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="cBSoft" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#F8D060" stopOpacity=".28"/>
          <stop offset="100%" stopColor="#F8D060" stopOpacity="0"/>
        </linearGradient>
        <radialGradient id="cGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#F5C842" stopOpacity=".22"/>
          <stop offset="100%" stopColor="#F5C842" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="cHdr" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={OR_DARK}/>
          <stop offset="65%"  stopColor={ORANGE}/>
          <stop offset="100%" stopColor={AMBER}/>
        </linearGradient>
        <filter id="cBlur"><feGaussianBlur stdDeviation="18"/></filter>
        <filter id="cGlowF" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="8" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Cielo */}
      <rect width="3000" height="1800" fill="url(#cSky)"/>
      <ellipse cx="600"  cy="380" rx="820" ry="300" fill="#050d30" opacity=".25"/>
      <ellipse cx="1500" cy="280" rx="900" ry="240" fill="#050c28" opacity=".2"/>
      <ellipse cx="2420" cy="420" rx="520" ry="180" fill="#050b24" opacity=".15"/>

      {/* Estrellas */}
      {STARS.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={.9+(i%3)*.35} fill="white" opacity={.38+(i%5)*.1}/>
      ))}

      {/* Haz — rota alrededor de la linterna en y≈1389 */}
      <g ref={beamRef} style={{ transformOrigin:'300px 1389px' }}>
        <polygon points="300,1389 3100,510 3100,1800"
          fill="url(#cBSoft)" filter="url(#cBlur)" opacity=".5"/>
        <polygon points="300,1389 3100,1010 3100,1770"
          fill="url(#cBCore)"/>
      </g>

      {/* Océano */}
      <path d="M0,1462 C250,1452 500,1472 750,1460 C1000,1448 1250,1470 1500,1458 C1750,1446 2000,1468 2250,1456 C2500,1444 2750,1466 3000,1454 L3000,1800 L0,1800 Z"
        fill="url(#cOcean)"/>
      <path d="M0,1468 C300,1458 600,1476 900,1464 C1200,1452 1500,1472 1800,1460 C2100,1448 2400,1470 2700,1458 C2850,1452 3000,1462 3000,1462"
        stroke="rgba(80,130,220,.17)" strokeWidth="3" fill="none"/>

      {/* Faro — translate(300,1720) scale(2.28) → linterna en y≈1389 */}
      <g transform="translate(300,1720) scale(2.28)">
        <ellipse cx="0" cy="-2" rx="28" ry="8" fill="#0a0e22"/>
        <path d="M-24,-10 C-24,-18 24,-18 24,-10 L28,-2 L-28,-2 Z" fill="#0d1128"/>
        <rect x="-30" y="-16" width="60" height="7"   rx="2" fill="#1e1e3a"/>
        <rect x="-11" y="-130" width="22" height="120" rx="2" fill="#cdb88e"/>
        <rect x="-9"  y="-130" width="18" height="120" rx="1" fill="#dcc9a2"/>
        <rect x="-11" y="-107" width="22" height="4"   rx="1" fill="#a07848" opacity=".8"/>
        <rect x="-11" y="-88"  width="22" height="4"   rx="1" fill="#a07848" opacity=".8"/>
        <rect x="-11" y="-70"  width="22" height="4"   rx="1" fill="#a07848" opacity=".8"/>
        <rect x="-14" y="-134" width="28" height="5"   rx="1" fill="#8b6914"/>
        <rect x="-13" y="-157" width="26" height="24"  rx="2" fill="#141c40"/>
        <rect x="-10" y="-154" width="10" height="18"  rx="1" fill="#2040a0" opacity=".7"/>
        <rect x="1"   y="-154" width="10" height="18"  rx="1" fill="#2040a0" opacity=".7"/>
        <rect x="-8"  y="-151" width="16" height="12"  rx=".5" fill="#FFFBC0"/>
        <circle cx="0" cy="-145" r="13" fill="#FFF8A0" opacity=".9" style={{filter:'blur(5px)'}}/>
        <path d="M-16,-157 L0,-176 L16,-157 Z" fill="#8b6914"/>
        <path d="M-13,-157 L0,-173 L13,-157 Z" fill="#c4a030"/>
        <line x1="0" y1="-176" x2="0" y2="-184" stroke="#888" strokeWidth="1.2"/>
      </g>
    </>
  )
}
