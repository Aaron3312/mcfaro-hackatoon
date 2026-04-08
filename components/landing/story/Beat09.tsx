/* Beat 09 — Exterior hospital. Papá solo → haz mcFaro → otros papás → círculo */
import gsap from 'gsap'
import { SKIN, AMBER, OR_DARK } from './constants'
/* Silueta iluminada por el haz */
const SIL = '#2a1e12'
const SIL_LIT = '#c8966a'

export function Beat09() {
  return (
    <>
      {/* ── Fachada del hospital (vista exterior simple) ── */}
      <g id="b9-hosp" opacity="0">
        {/* Cuerpo */}
        <rect x="2820" y="1090" width="260" height="370" rx="3" fill="#0e1520"/>
        <rect x="2760" y="1190" width="68"  height="270" rx="3" fill="#0b1018"/>
        {/* Techo */}
        <rect x="2820" y="1084" width="260" height="10"  rx="2" fill="#162030"/>
        <rect x="2760" y="1184" width="68"  height="10"  rx="2" fill="#162030"/>
        {/* Ventanas */}
        {([0,1,2] as number[]).map(c => ([0,1,2,3] as number[]).map(r => (
          <rect key={`w${c}${r}`}
            x={2836 + c*80} y={1108 + r*74}
            width="54" height="46" rx="3"
            fill="#162a3e" opacity=".9"/>
        )))}
        {/* Ventanas ala */}
        {([0,1,2] as number[]).map(r => (
          <rect key={`wa${r}`} x="2772" y={1204 + r*76} width="44" height="44" rx="3"
            fill="#162a3e" opacity=".9"/>
        ))}
        {/* Cruz */}
        <rect x="2932" y="1050" width="14" height="44" rx="3" fill="#8B2020"/>
        <rect x="2920" y="1062" width="38" height="14" rx="3" fill="#8B2020"/>
        {/* Entrada hospital */}
        <rect x="2880" y="1414" width="80"  height="46" rx="2" fill="#0d1825"/>
        <rect x="2886" y="1420" width="30"  height="40" rx="2" fill="#12213a" opacity=".8"/>
        <rect x="2924" y="1420" width="30"  height="40" rx="2" fill="#12213a" opacity=".8"/>
        {/* Suelo / acera */}
        <rect x="2600" y="1455" width="600" height="18" rx="2" fill="#0c0e12"/>
        <rect x="2600" y="1470" width="600" height="6"  rx="1" fill="#090b0e" opacity=".6"/>
      </g>

      {/* ── Haz de luz mcFaro (barre de izq a der) ── */}
      <g id="b9-beam" opacity="0">
        {/* Cono de luz amplio */}
        <polygon id="b9-cone"
          points="2540,1300 2540,1300 2540,1300"
          fill={AMBER} opacity=".08"/>
        {/* Línea central del haz */}
        <line id="b9-ray"
          x1="2540" y1="1300" x2="2540" y2="1300"
          stroke={AMBER} strokeWidth="2" opacity=".25"/>
        {/* Logo mcFaro pequeño — origen del haz */}
        <circle cx="2538" cy="1300" r="10" fill={OR_DARK} opacity=".9"/>
        <text x="2538" y="1304" textAnchor="middle"
          fill="white" fontSize="7" fontFamily="sans-serif" fontWeight="bold">
          mc
        </text>
      </g>

      {/* ── Filtro glow para papá ── */}
      <defs>
        <filter id="b9-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="6" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* ── Papá — de espaldas, iluminado por el haz ── */}
      <g id="b9-pa" opacity="0" filter="url(#b9-glow)">
        {/* Halo de luz detrás */}
        <ellipse cx="2643" cy="1395" rx="32" ry="48" fill={AMBER} opacity=".08"/>
        {/* Silueta de espaldas: cuerpo */}
        <rect x="2625" y="1360" width="36" height="54" rx="8" fill={SIL_LIT}/>
        {/* Cabeza */}
        <ellipse cx="2643" cy="1350" rx="16" ry="16" fill={SIL_LIT}/>
        {/* Hombros */}
        <ellipse cx="2643" cy="1368" rx="22" ry="10" fill={SIL_LIT}/>
        {/* Piernas */}
        <rect x="2626" y="1410" width="14" height="46" rx="5" fill={SIL_LIT}/>
        <rect x="2646" y="1410" width="14" height="46" rx="5" fill={SIL_LIT}/>
      </g>

      {/* ── Otros papás — a la IZQUIERDA de papá (cx=2643) ── */}
      {/* o1 ≈ 100px izq  cx=2543 */}
      <g id="b9-o1" opacity="0">
        <rect x="2526" y="1360" width="34" height="52" rx="8" fill={SIL}/>
        <ellipse cx="2543" cy="1350" rx="15" ry="15" fill={SIL}/>
        <ellipse cx="2543" cy="1367" rx="21" ry="9"  fill={SIL}/>
        <rect x="2527" y="1408" width="13" height="44" rx="5" fill={SIL}/>
        <rect x="2546" y="1408" width="13" height="44" rx="5" fill={SIL}/>
      </g>

      {/* o2 ≈ 190px izq  cx=2453 */}
      <g id="b9-o2" opacity="0">
        <rect x="2436" y="1362" width="34" height="52" rx="8" fill={SIL}/>
        <ellipse cx="2453" cy="1352" rx="15" ry="15" fill={SIL}/>
        <ellipse cx="2453" cy="1369" rx="21" ry="9"  fill={SIL}/>
        <rect x="2437" y="1410" width="13" height="44" rx="5" fill={SIL}/>
        <rect x="2456" y="1410" width="13" height="44" rx="5" fill={SIL}/>
      </g>

      {/* o3 ≈ 275px izq  cx=2368 */}
      <g id="b9-o3" opacity="0">
        <rect x="2351" y="1360" width="34" height="52" rx="8" fill={SIL}/>
        <ellipse cx="2368" cy="1350" rx="15" ry="15" fill={SIL}/>
        <ellipse cx="2368" cy="1367" rx="21" ry="9"  fill={SIL}/>
        <rect x="2352" y="1408" width="13" height="44" rx="5" fill={SIL}/>
        <rect x="2371" y="1408" width="13" height="44" rx="5" fill={SIL}/>
      </g>

      {/* ── Mano extendida (de o1 → papá, izq a der) ── */}
      <line id="b9-hand"
        x1="2560" y1="1388" x2="2625" y2="1390"
        stroke={AMBER} strokeWidth="5" strokeLinecap="round" opacity="0"/>

      {/* ── Línea de conexión dibujada (o3 → papá, ~275px) ── */}
      <line id="b9-cxline"
        x1="2368" y1="1390" x2="2643" y2="1390"
        stroke={AMBER} strokeWidth="2.5" strokeLinecap="round"
        strokeDasharray="275" strokeDashoffset="275" opacity=".55"/>

      {/* ── Nodos de conexión ── */}
      <circle id="b9-n0" cx="2643" cy="1390" r="0" fill={AMBER} opacity="0"/>
      <circle id="b9-n1" cx="2543" cy="1390" r="0" fill={AMBER} opacity="0"/>
      <circle id="b9-n2" cx="2453" cy="1388" r="0" fill={AMBER} opacity="0"/>
      <circle id="b9-n3" cx="2368" cy="1390" r="0" fill={AMBER} opacity="0"/>
    </>
  )
}

export function animateIn() {
  /* Limpiar Beat08 */
  gsap.killTweensOf(['#b8-van', '#b8-wpa', '#b8-wsof', '.b8-w'])
    gsap.set(['#b6-scene', '#b6-staff', '#b6-phone',
            '#b6-cta', '#b6-cta-txt', '#b6-screen-glow',
            '#b6-p1', '#b6-p2', '#b6-p3', '#b6-p4'], { opacity: 0 })
  /* Reset */
  gsap.set(['#b9-hosp', '#b9-pa', '#b9-o1', '#b9-o2', '#b9-o3',
            '#b9-hand', '#b9-beam'], { opacity: 0, x: 0 })
  gsap.set('#b9-cxline', { attr: { strokeDashoffset: '275' }, opacity: 0.55 })
  gsap.set(['#b9-n0', '#b9-n1', '#b9-n2', '#b9-n3'], { attr: { r: '0' }, opacity: 0 })

  const tl = gsap.timeline()

  /* 1. Hospital aparece */
/*   tl.to('#b9-hosp', { opacity: 1, duration: 10 }, 0)
 */
  /* 2. Papá aparece solo, de espaldas — con pulso de brillo */
  tl.to('#b9-pa', { opacity: 1, duration: 0.45 }, 0.5)
  tl.to('#b9-pa', { opacity: 0.7, duration: 1.2, repeat: -1, yoyo: true, ease: 'sine.inOut' }, 1.1)
 
 
  /* 3. Haz mcFaro aparece desde la izquierda */
   tl.to('#b9-beam', { opacity: 1, duration: 0.3 }, 1.1)
 
  /* 4. Cono del haz se extiende hacia la derecha barriendo el grupo */
  tl.to('#b9-cone', {
    attr: { points: '2530,1295 2780,1215 2920,1470 2530,1470' },
    duration: 1.1, ease: 'power2.inOut',
  }, 1.1)
  tl.to('#b9-ray', {
    attr: { x2: 2900, y2: 1375 },
    duration: 1.1, ease: 'power2.inOut',
  }, 1.1)

  /* 5. Otros papás emergen de la oscuridad — de más cercano a más lejano (izq) */
  ;(['#b9-o1', '#b9-o2', '#b9-o3'] as string[]).forEach((id, i) => {
    const cx = [2543, 2453, 2368][i]
    const cy = 1390
    tl.fromTo(id,
      { opacity: 0, scale: 0.4, transformOrigin: `${cx}px ${cy}px` },
      { opacity: 0.75, scale: 1, duration: 0.38, ease: 'back.out(1.4)' },
      1.55 + i * 0.22
    )
  })

  /* 6. Haz se atenúa — ya cumplió su trabajo */
  tl.to('#b9-beam', { opacity: 0.3, duration: 0.5 }, 2.25)

  /* 7. o1 voltea — primer impulso de conexión, se ilumina */
  tl.to('#b9-o1', { opacity: 1, duration: 0.22, ease: 'power2.out' }, 2.5)

  /* 8. Mano extendida se dibuja de o1 (izq) hacia papá (der) */
  tl.fromTo('#b9-hand',
    { attr: { x1: '2560', y1: '1388', x2: '2560', y2: '1388' }, opacity: 0 },
    { attr: { x2: '2625', y2: '1390' }, opacity: 1, duration: 0.4, ease: 'power2.out' },
    2.65
  )

  /* 9. Papá camina hacia la izquierda (hacia el grupo) */
  tl.call(() => gsap.killTweensOf('#b9-pa'), [], 2.9)
  tl.to('#b9-pa', { x: -85, duration: 0.7, ease: 'power1.inOut' }, 2.95)
  tl.to('#b9-pa', { y: '-=7', duration: 0.12, repeat: 5, yoyo: true, ease: 'sine.inOut' }, 2.95)

  /* 10. Todos se iluminan al unísono cuando papá llega */
  tl.to(['#b9-pa', '#b9-o1', '#b9-o2', '#b9-o3'],
    { opacity: 1, stagger: 0.07, duration: 0.28, ease: 'power2.out' }, 3.62)

  /* 11a. Línea de conexión se dibuja de o3 → papá (strokeDashoffset 275 → 0) */
  tl.to('#b9-cxline',
    { attr: { strokeDashoffset: '0' }, duration: 0.7, ease: 'power2.inOut' }, 3.75)

  /* 11b. Nodos de cada persona pulsam en cascada */
  ;(['#b9-n0', '#b9-n1', '#b9-n2', '#b9-n3'] as string[]).forEach((id, i) => {
    // Aparecen con scale desde 0
    tl.fromTo(id,
      { attr: { r: '0' }, opacity: 0 },
      { attr: { r: '6' }, opacity: 1, duration: 0.22, ease: 'back.out(2)' },
      3.82 + i * 0.1
    )
    // Pulso continuo
    tl.to(id,
      { attr: { r: '9' }, opacity: 0.4, duration: 0.7, repeat: -1, yoyo: true, ease: 'sine.inOut' },
      4.1 + i * 0.12
    )
  })
}
