/* Beat 01 — Los García: tiendita de abarrotes + familia */
import gsap from 'gsap'
import { SKIN, AMBER, OR_DARK } from './constants'
import { WA, WC } from './figures'

export function Beat01() {
  return (
    <>
      {/* Tiendita */}
      <g id="gf-shop" opacity="0" transform="translate(500,1155) scale(1.4)">
        <rect x="0"   y="0"   width="350" height="215" rx="5" fill="#1a0e06"/>
        <path d="M-12,-26 L362,-26 L350,12 L0,12 Z" fill={OR_DARK} opacity=".9"/>
        <rect x="22"  y="22"  width="135" height="112" rx="3" fill="#1a3060" opacity=".75"/>
        <rect x="205" y="28"  width="106" height="187" rx="3" fill="#3a2010"/>
        <rect x="32"  y="30"  width="115" height="20"  rx="2" fill="none" stroke={AMBER} strokeWidth="1.5"/>
        <text x="90" y="46" textAnchor="middle" fill={AMBER} fontSize="12" fontFamily="sans-serif" letterSpacing="1">ABARROTES</text>
        <rect x="42"  y="56"  width="95"  height="68"  rx="2" fill="#0f2248" opacity=".5"/>
        <circle cx="75" cy="90" r="12" fill={AMBER} opacity=".12"/>
      </g>

      {/* Familia García */}
      <g id="gf-family" opacity="0">
        <WA id="gf-pa"  x={660} y={1450} s={1.8}  f={SKIN}/>
        <WA id="gf-ma"  x={750} y={1450} s={1.7}  f={SKIN}/>
        <WC id="gf-h1"  x={840} y={1454} s={1.35} f={SKIN}/>
        <WC id="gf-h2"  x={895} y={1456} s={1.25} f={SKIN}/>
        <WC id="gf-sof" x={700} y={1456} s={1.15} f={SKIN}/>
        <line x1="678" y1="1398" x2="712" y2="1408" stroke={SKIN} strokeWidth="8" strokeLinecap="round" opacity=".55"/>
        <line x1="768" y1="1398" x2="808" y2="1408" stroke={SKIN} strokeWidth="8" strokeLinecap="round" opacity=".55"/>
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
