/* Beat 08 — Transporte exterior: van entra, papá y Sofía suben, van va al hospital */
import gsap from 'gsap'
import { SKIN, AMBER, OR_DARK, ORANGE } from './constants'
import { WA, WC } from './figures'

export function Beat08() {
  return (
    <>
      {/* ── Hospital geométrico (derecha) ── */}
      <g id="b8-hosp" opacity="0">
        {/* Cuerpo principal */}
        <rect x="2780" y="1050" width="340" height="410" rx="4" fill="#111a28"/>
        {/* Ala izquierda más baja */}
        <rect x="2700" y="1160" width="90"  height="300" rx="3" fill="#0e1520"/>
        {/* Torre central */}
        <rect x="2870" y="990"  width="110" height="470" rx="3" fill="#141e30"/>
        {/* Techo plano */}
        <rect x="2780" y="1044" width="340" height="12"  rx="2" fill="#1e2a3e"/>
        <rect x="2866" y="984"  width="116" height="10"  rx="2" fill="#1e2a3e"/>
        {/* Ventanas — grid */}
        {([0,1,2] as number[]).map(c => ([0,1,2,3] as number[]).map(r => (
          <rect key={`hw${c}${r}`}
            x={2800 + c*100} y={1070 + r*90}
            width="70" height="55" rx="3"
            fill="#1a2e4a" opacity=".9"/>
        )))}
        {/* Ventanas torre */}
        {([0] as number[]).map(c => ([0,1,2,3,4] as number[]).map(r => (
          <rect key={`ht${c}${r}`}
            x={2885} y={1010 + r*82}
            width="76" height="52" rx="3"
            fill="#1a2e4a" opacity=".9"/>
        )))}
        {/* Cruz roja */}
        <rect x="2910" y="1000" width="16" height="48" rx="4" fill="#8B2020"/>
        <rect x="2897" y="1013" width="42" height="16" rx="4" fill="#8B2020"/>
        {/* Letrero HOSPITAL */}
        <rect x="2820" y="1414" width="260" height="36" rx="3" fill="#0a1018"/>
        <text x="2950" y="1438" textAnchor="middle"
          fill={AMBER} fontSize="14" fontFamily="sans-serif" fontWeight="bold" letterSpacing="2">
          HOSPITAL
        </text>
        {/* Entrada */}
        <rect x="2900" y="1418" width="100" height="42" rx="3" fill="#0d1520"/>
        <rect x="2906" y="1424" width="40"  height="36" rx="2" fill="#152030" opacity=".8"/>
        <rect x="2954" y="1424" width="40"  height="36" rx="2" fill="#152030" opacity=".8"/>
      </g>

      {/* ── Camino punteado casa → hospital ── */}
      <g id="b8-path" opacity="0">
        {/* Línea de asfalto */}
        <rect x="2290" y="1455" width="500" height="14" rx="3" fill="#0d1018" opacity=".7"/>
        {/* Puntos iluminados */}
        {Array.from({ length: 12 }).map((_, i) => (
          <circle key={i}
            id={`b8-dot${i}`}
            cx={2320 + i * 40} cy={1462} r="4"
            fill={AMBER} opacity="0"/>
        ))}
      </g>

      {/* ── Van McDonald's ── */}
      <g id="b8-van" opacity="0">
        {/* Sombra */}
        <ellipse cx="1760" cy="1510" rx="220" ry="12" fill="#000" opacity=".4"/>
        {/* Carrocería principal */}
        <rect x="1560" y="1360" width="420" height="140" rx="14" fill="#c8102e"/>
        {/* Cabina delantera */}
        <rect x="1900" y="1375" width="90"  height="125" rx="10" fill="#a80e28"/>
        {/* Parabrisas */}
        <rect x="1908" y="1382" width="72"  height="68"  rx="6"  fill="#1a3060" opacity=".85"/>
        {/* Ventana lateral */}
        <rect x="1578" y="1375" width="290" height="72"  rx="5"  fill="#1a3060" opacity=".75"/>
        {/* Separador ventana */}
        <rect x="1718" y="1375" width="6"   height="72"  fill="#a80e28"/>
        {/* Ruedas */}
        <circle cx="1655" cy="1500" r="42" fill="#0a0806"/>
        <circle cx="1655" cy="1500" r="28" fill="#1a1a1a"/>
        <circle cx="1655" cy="1500" r="10" fill="#2a2a2a"/>
        <circle cx="1870" cy="1500" r="42" fill="#0a0806"/>
        <circle cx="1870" cy="1500" r="28" fill="#1a1a1a"/>
        <circle cx="1870" cy="1500" r="10" fill="#2a2a2a"/>
        {/* Logo McDonald's en costado */}
        <image
          href="/images/LogoMcdonalds.png"
          x="1680" y="1378" width="120" height="80"
          preserveAspectRatio="xMidYMid meet"
        />
        {/* Texto mcFaro debajo del logo */}
        <text x="1740" y="1460" textAnchor="middle"
          fill="white" fontSize="16" fontFamily="sans-serif" fontWeight="bold" opacity=".9">
          mcFaro
        </text>
        {/* Faros delanteros */}
        <ellipse cx="1990" cy="1415" rx="12" ry="8" fill={AMBER} opacity=".7"/>
        <ellipse cx="1990" cy="1415" rx="20" ry="14" fill={AMBER} opacity=".15"/>
      </g>

      {/* ── Papá ── */}
      <g id="b8-wpa">
        <WA cn="b8-w" x={0} y={0} s={1.5} f={SKIN} op={0}/>
      </g>

      {/* ── Sofía ── */}
      <g id="b8-wsof">
        <WC cn="b8-w" x={0} y={0} s={1.1} f={SKIN} op={0}/>
      </g>
    </>
  )
}

export function animateIn() {
  /* Limpiar Beat01 */
  gsap.set(['#gf-shop', '#gf-family'], { opacity: 0 })

  /* Limpiar Beat06 */
  gsap.killTweensOf(['#b6-p1', '#b6-p2', '#b6-p3', '#b6-p4'])
  gsap.set(['#b6-scene', '#b6-staff', '#b6-phone', '#b6-screen-glow',
            '#b6-p1', '#b6-p2', '#b6-p3', '#b6-p4'], { opacity: 0 })

  /* Reset */
  gsap.set(['#b8-hosp', '#b8-path', '#b8-van'], { opacity: 0, x: 0 })
  gsap.set(['#b8-wpa', '#b8-wsof'], { x: 0, y: 0 })
  gsap.set(['.b8-w'], { opacity: 0 })
  Array.from({ length: 12 }).forEach((_, i) =>
    gsap.set(`#b8-dot${i}`, { opacity: 0 })
  )

  /*
   * Coordenadas clave (SVG):
   *   Van body x=1560-1980 cuando GSAP x=0
   *   Casa puerta x≈2290
   *   Para que la van quede junto a la casa necesitamos GSAP x=+500
   *     → van body en 2060-2480, puerta lateral ≈ x=2070
   *   Personajes salen de x=2280, caminan ~200px a la izquierda para abordar
   */

  /* Van empieza fuera del viewport por la izquierda, x=-900 = fuera de pantalla */
  gsap.set('#b8-van', { x: -900, opacity: 0 })

  /* Personajes junto a la puerta de la casa */
  gsap.set('#b8-wpa',  { x: 2280, y: 1448 })
  gsap.set('#b8-wsof', { x: 2330, y: 1448 })

  const tl = gsap.timeline()

  /* 1. Hospital aparece */
  tl.to('#b8-hosp', { opacity: 1, duration: 0.5 }, 0)

  /* 2. Camino punteado — puntos se encienden uno a uno */
  tl.to('#b8-path', { opacity: 1, duration: 0.1 }, 0.3)
  Array.from({ length: 12 }).forEach((_, i) => {
    tl.to(`#b8-dot${i}`, { opacity: 0.9, duration: 0.12 }, 0.35 + i * 0.06)
  })

  /* 3. Van entra desde la izquierda y se detiene junto a la casa (x=+500) */
  tl.to('#b8-van', {
    x: 500, opacity: 1,
    duration: 1.1,
    ease: 'power2.out',
  }, 0.5)

  /* 4. Papá y Sofía aparecen junto a la casa */
  tl.to(['#b8-wpa', '#b8-wsof', '.b8-w'], { opacity: 1, stagger: 0.12, duration: 0.3 }, 1.4)


  
  /* 5. Caminan hacia la puerta lateral de la van (~200px a la izquierda) */
  tl.to('#b8-wpa',  { x: '-=200', duration: 0.65, ease: 'power1.inOut' }, 1.7)
  tl.to('#b8-wsof', { x: '-=185', duration: 0.65, ease: 'power1.inOut' }, 1.78)

  /* Bounce al caminar */
  tl.to(['.b8-w'], {
    y: '-=8', duration: 0.17, repeat: 7, yoyo: true, ease: 'sine.inOut',
  }, 1.7)

  /* 6. Suben — se desvanecen al llegar a la puerta */
  tl.to(['#b8-wpa', '.b8-w'],  { opacity: 0, duration: 0.28 }, 2.32)
  tl.to(['#b8-wsof', '.b8-w'], { opacity: 0, duration: 0.28 }, 2.4)

  /* 7. Van arranca hacia el hospital (viaja +820px a la derecha) */
  tl.to('#b8-van', {
    x: '+=820',
    duration: 1.05,
    ease: 'power2.inOut',
  }, 2.6)

  /* 8. Puntos del camino se apagan al paso de la van */
  Array.from({ length: 12 }).forEach((_, i) => {
    tl.to(`#b8-dot${i}`, { opacity: 0.15, duration: 0.1 }, 2.65 + i * 0.04)
  })

  /* 9. Frenazo al llegar al hospital */
  tl.to('#b8-van', {
    x: '+=45',
    duration: 0.2,
    ease: 'power3.out',
  }, 3.6)
}
