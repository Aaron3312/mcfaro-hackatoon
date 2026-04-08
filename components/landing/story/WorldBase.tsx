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
      {/* Casa Ronald McDonald */}
      <defs>
        <radialGradient id="b5-winGlowL" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor={AMBER}  stopOpacity="0.55"/>
          <stop offset="100%" stopColor={AMBER}  stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="b5-winGlowR" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor={ORANGE} stopOpacity="0.55"/>
          <stop offset="100%" stopColor={ORANGE} stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="b5-doorGlowGrad" cx="50%" cy="30%" r="70%">
          <stop offset="0%"   stopColor={AMBER} stopOpacity="0.50"/>
          <stop offset="100%" stopColor={AMBER} stopOpacity="0"/>
        </radialGradient>
      </defs>

      <g id="b5-casa" opacity="0">
        {/* Sombra base */}
        <ellipse cx="2290" cy="1456" rx="380" ry="16" fill="#000" opacity=".4"/>

        {/* Cuerpo principal */}
        <rect x="1930" y="1152" width="720" height="296" rx="4" fill="#1a0f07"/>

        {/* Techo */}
        <polygon points="1908,1156 2290,928 2672,1156" fill="#28180a"/>
        <polygon points="1922,1156 2290,942 2658,1156" fill="#3e2414"/>

        {/* Chimenea */}
        <rect x="2340" y="970" width="56" height="86" rx="3" fill="#28180a"/>
        <rect x="2334" y="964" width="68" height="14" rx="2" fill="#3e2414"/>

        {/* Letrero "Casa Ronald McDonald" */}
        <rect x="2100" y="1156" width="380" height="32" rx="3" fill="#0d0805" opacity=".75"/>
        <text x="2290" y="1178" textAnchor="middle"
          fill={AMBER} fontSize="22" fontFamily="sans-serif" fontWeight="700" letterSpacing="0.8">
          Casa Ronald McDonald
        </text>

        {/* Ventana izquierda */}
        <rect id="b5-winL" x="1968" y="1196" width="206" height="158" rx="4" fill="#04060e"/>
        <line x1="2071" y1="1196" x2="2071" y2="1354" stroke="#0d0905" strokeWidth="5"/>
        <line x1="1968" y1="1275" x2="2174" y2="1275" stroke="#0d0905" strokeWidth="5"/>
        <ellipse id="b5-glowL" cx="2071" cy="1275" rx="140" ry="95"
          fill="url(#b5-winGlowL)" opacity="0"/>

        {/* Ventana derecha */}
        <rect id="b5-winR" x="2406" y="1196" width="206" height="158" rx="4" fill="#04060e"/>
        <line x1="2509" y1="1196" x2="2509" y2="1354" stroke="#0d0905" strokeWidth="5"/>
        <line x1="2406" y1="1275" x2="2612" y2="1275" stroke="#0d0905" strokeWidth="5"/>
        <ellipse id="b5-glowR" cx="2509" cy="1275" rx="140" ry="95"
          fill="url(#b5-winGlowR)" opacity="0"/>

        {/* Umbral oscuro */}
        <rect x="2223" y="1242" width="134" height="206" rx="4" fill="#080302"/>

        {/* Glow interior que sale por la puerta */}
        <ellipse id="b5-doorGlow"
          cx="2290" cy="1448" rx="80" ry="30"
          fill="url(#b5-doorGlowGrad)" opacity="0"/>

        {/* Puerta */}
        <g id="b5-door">
          <rect x="2223" y="1242" width="134" height="206" rx="4" fill="#3c2010"/>
          <rect x="2231" y="1252" width="52"  height="72"  rx="3" fill="#2e1808"/>
          <rect x="2295" y="1252" width="52"  height="72"  rx="3" fill="#2e1808"/>
          <rect x="2231" y="1334" width="116" height="108" rx="3" fill="#2e1808"/>
          <circle cx="2337" cy="1368" r="7" fill={AMBER} opacity=".9"/>
        </g>

        {/* Arcos Ronald sobre la puerta */}
        <rect x="2260" y="1232" width="62" height="11" rx="3" fill={OR_DARK} opacity=".9"/>
        <rect x="2284" y="1221" width="14" height="23" rx="3" fill={OR_DARK} opacity=".9"/>
      </g>

      {/* Cielo — extendido a x negativo para cubrir viewport con zoom alejado */}
      <rect x="-10000" width="9000" height="1800" fill="url(#cSky)"/>
      <ellipse cx="600"  cy="380" rx="820" ry="300" fill="#050d30" opacity=".25"/>
      <ellipse cx="1500" cy="280" rx="900" ry="240" fill="#050c28" opacity=".2"/>
      <ellipse cx="2420" cy="420" rx="520" ry="180" fill="#050b24" opacity=".15"/>

      {/* Estrellas */}
      {STARS.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={.9+(i%3)*.35} fill="white" opacity={.38+(i%5)*.1}/>
      ))}

      {/* Haz — invisible hasta beat 4, rota alrededor de la linterna en y≈1389 */}
      <g id="world-beam" ref={beamRef} style={{ transformOrigin:'300px 1389px' }} opacity="0">
        <polygon points="300,1389 3100,510 3100,1800"
          fill="url(#cBSoft)" filter="url(#cBlur)" opacity=".5"/>
        <polygon points="300,1389 3100,1010 3100,1770"
          fill="url(#cBCore)"/>
      </g>

      {/* Océano — extendido a x negativo para cubrir viewport con zoom alejado */}
      <path d="M-3000,1462 L0,1462 C250,1452 500,1472 750,1460 C1000,1448 1250,1470 1500,1458 C1750,1446 2000,1468 2250,1456 C2500,1444 2750,1466 3000,1454 L6000,1454 L6000,1800 L-3000,1800 Z"
        fill="url(#cOcean)"/>
      <path d="M-3000,1468 L0,1468 C300,1458 600,1476 900,1464 C1200,1452 1500,1472 1800,1460 C2100,1448 2400,1470 2700,1458 C2850,1452 3000,1462 L6000,1462"
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
