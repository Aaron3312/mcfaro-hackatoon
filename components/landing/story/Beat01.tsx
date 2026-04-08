/* Beat 01 — Los García: tiendita de abarrotes + familia */
import gsap from 'gsap'
import { SKIN, AMBER, OR_DARK } from './constants'
import { WA, WC } from './figures'

export function Beat01() {
  return (
    <>
      {/* Tiendita */}
      {/* Tiendita — scale(1.8) para que ocupe bien el frame del beat 1 */}
      <g id="gf-shop" opacity="0" transform="translate(480,1108) scale(1.8)">
        <rect x="0"   y="0"   width="350" height="215" rx="5" fill="#1a0e06"/>
        <path d="M-12,-26 L362,-26 L350,12 L0,12 Z" fill={OR_DARK} opacity=".9"/>
        {/* Ventana principal */}
        <rect x="22"  y="22"  width="135" height="130" rx="3" fill="#1a3060" opacity=".75"/>
        {/* Puerta */}
        <rect x="205" y="28"  width="106" height="187" rx="3" fill="#3a2010"/>
        {/* Letrero */}
        <rect x="32"  y="30"  width="115" height="22"  rx="2" fill="none" stroke={AMBER} strokeWidth="1.5"/>
        <text x="90"  y="47"  textAnchor="middle" fill={AMBER} fontSize="12" fontFamily="sans-serif" letterSpacing="1">ABARROTES</text>
        {/* Luz interior */}
        <rect x="42"  y="58"  width="95"  height="80"  rx="2" fill="#0f2248" opacity=".5"/>
        <circle cx="75" cy="98" r="16" fill={AMBER} opacity=".14"/>
        {/* Estante visible */}
        <line x1="42" y1="88"  x2="137" y2="88"  stroke="#2a3a60" strokeWidth="2"/>
        <line x1="42" y1="108" x2="137" y2="108" stroke="#2a3a60" strokeWidth="2"/>
        {/* Muestras de productos */}
        <rect x="50"  y="91"  width="10" height="15" rx="1" fill="#c85a2a" opacity=".7"/>
        <rect x="65"  y="93"  width="10" height="13" rx="1" fill="#f5c842" opacity=".7"/>
        <rect x="80"  y="91"  width="10" height="15" rx="1" fill="#4a7a2a" opacity=".7"/>
        <rect x="95"  y="93"  width="10" height="13" rx="1" fill="#c85a2a" opacity=".7"/>
      </g>

      {/* Familia García — en frente de la tienda */}
      <g id="gf-family" opacity="0">
        <WA id="gf-pa"  x={650} y={1494} s={2.1}  f={SKIN}/>
        <WA id="gf-ma"  x={758} y={1494} s={2.0}  f={SKIN}/>
        <WC id="gf-h1"  x={862} y={1498} s={1.6}  f={SKIN}/>
        <WC id="gf-h2"  x={928} y={1500} s={1.45} f={SKIN}/>
        <WC id="gf-sof" x={705} y={1500} s={1.35} f={SKIN}/>
        {/* Brazos */}
        <line x1="672" y1="1431" x2="716" y2="1444" stroke={SKIN} strokeWidth="10" strokeLinecap="round" opacity=".5"/>
        <line x1="780" y1="1431" x2="838" y2="1444" stroke={SKIN} strokeWidth="10" strokeLinecap="round" opacity=".5"/>
      </g>
    </>
  )
}

export function animateIn() {
  gsap.set(['#gf-shop', '#gf-family'], { opacity: 0 })
  gsap.timeline()
    .to('#gf-shop',   { opacity: 1, duration: .5 })
    .to('#gf-family', { opacity: 1, duration: .5 }, '<+.15')
}
