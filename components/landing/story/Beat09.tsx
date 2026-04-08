/* Beat 09 — Exterior hospital. Papá solo → haz mcFaro → otros papás → círculo */
import gsap from 'gsap'
import { SKIN, AMBER, OR_DARK } from './constants'
/* Color oscuro para siluetas (sin detalle) */
const SIL = '#2a1e12'

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

      {/* ── Papá — de espaldas, solo ── */}
      <g id="b9-pa" opacity="0">
        {/* Silueta de espaldas: cuerpo */}
        <rect x="2625" y="1360" width="36" height="54" rx="8" fill={SIL}/>
        {/* Cabeza */}
        <ellipse cx="2643" cy="1350" rx="16" ry="16" fill={SIL}/>
        {/* Hombros */}
        <ellipse cx="2643" cy="1368" rx="22" ry="10" fill={SIL}/>
        {/* Piernas */}
        <rect x="2626" y="1410" width="14" height="46" rx="5" fill={SIL}/>
        <rect x="2646" y="1410" width="14" height="46" rx="5" fill={SIL}/>
      </g>

      {/* ── Otros papás — siluetas oscuras, iluminadas por el haz ── */}
      <g id="b9-o1" opacity="0">
        <rect x="2716" y="1360" width="34" height="52" rx="8" fill={SIL}/>
        <ellipse cx="2733" cy="1350" rx="15" ry="15" fill={SIL}/>
        <ellipse cx="2733" cy="1367" rx="21" ry="9"  fill={SIL}/>
        <rect x="2717" y="1408" width="13" height="44" rx="5" fill={SIL}/>
        <rect x="2736" y="1408" width="13" height="44" rx="5" fill={SIL}/>
      </g>

      <g id="b9-o2" opacity="0">
        <rect x="2792" y="1362" width="34" height="52" rx="8" fill={SIL}/>
        <ellipse cx="2809" cy="1352" rx="15" ry="15" fill={SIL}/>
        <ellipse cx="2809" cy="1369" rx="21" ry="9"  fill={SIL}/>
        <rect x="2793" y="1410" width="13" height="44" rx="5" fill={SIL}/>
        <rect x="2812" y="1410" width="13" height="44" rx="5" fill={SIL}/>
      </g>

      <g id="b9-o3" opacity="0">
        <rect x="2860" y="1360" width="34" height="52" rx="8" fill={SIL}/>
        <ellipse cx="2877" cy="1350" rx="15" ry="15" fill={SIL}/>
        <ellipse cx="2877" cy="1367" rx="21" ry="9"  fill={SIL}/>
        <rect x="2861" y="1408" width="13" height="44" rx="5" fill={SIL}/>
        <rect x="2880" y="1408" width="13" height="44" rx="5" fill={SIL}/>
      </g>

      {/* ── Mano extendida (de b9-o1 hacia b9-pa) ── */}
      <line id="b9-hand"
        x1="2716" y1="1388" x2="2664" y2="1390"
        stroke={AMBER} strokeWidth="5" strokeLinecap="round" opacity="0"/>

      {/* ── Círculo de conexión — líneas entre siluetas ── */}
      <g id="b9-circle" opacity="0">
        <polygon
          points="2643,1390 2733,1390 2809,1388 2877,1390"
          fill="none" stroke={AMBER} strokeWidth="2"
          strokeDasharray="6 4" opacity=".4"/>
        {/* Nodos en cada persona */}
        <circle cx="2643" cy="1390" r="5" fill={AMBER} opacity=".7"/>
        <circle cx="2733" cy="1390" r="5" fill={AMBER} opacity=".7"/>
        <circle cx="2809" cy="1388" r="5" fill={AMBER} opacity=".7"/>
        <circle cx="2877" cy="1390" r="5" fill={AMBER} opacity=".7"/>
      </g>
    </>
  )
}

export function animateIn() {
  /* Limpiar Beat08 */
  gsap.killTweensOf(['#b8-van', '#b8-wpa', '#b8-wsof', '.b8-w'])
  gsap.set(['#b8-hosp', '#b8-path', '#b8-van', '#b8-wpa', '#b8-wsof'], { opacity: 0 })

  /* Reset */
  gsap.set(['#b9-hosp', '#b9-pa', '#b9-o1', '#b9-o2', '#b9-o3',
            '#b9-hand', '#b9-circle', '#b9-beam'], { opacity: 0, x: 0 })

  const tl = gsap.timeline()

  /* 1. Hospital aparece */
  tl.to('#b9-hosp', { opacity: 1, duration: 0.5 }, 0)

  /* 2. Papá aparece solo, de espaldas */
  tl.to('#b9-pa', { opacity: 1, duration: 0.45 }, 0.5)

  /* 3. Haz mcFaro aparece desde la izquierda */
  tl.to('#b9-beam', { opacity: 1, duration: 0.3 }, 1.1)

  /* 4. Cono se extiende barriendo hacia la derecha */
  tl.to('#b9-cone', {
    attr: { points: '2530,1295 2760,1230 2900,1460 2530,1460' },
    duration: 1.0,
    ease: 'power2.inOut',
  }, 1.1)
  tl.to('#b9-ray', {
    attr: { x2: 2890, y2: 1380 },
    duration: 1.0,
    ease: 'power2.inOut',
  }, 1.1)

  /* 5. Siluetas se revelan con el barrido */
  tl.to('#b9-o1', { opacity: 0.7, duration: 0.3 }, 1.5)
  tl.to('#b9-o2', { opacity: 0.7, duration: 0.3 }, 1.75)
  tl.to('#b9-o3', { opacity: 0.7, duration: 0.3 }, 2.0)

  /* 6. El haz se atenúa un poco */
  tl.to('#b9-beam', { opacity: 0.5, duration: 0.4 }, 2.3)

  /* 7. b9-o1 "voltea" — se ilumina levemente */
  tl.to('#b9-o1', { opacity: 1.0, duration: 0.25 }, 2.5)

  /* 8. Mano extendida aparece */
  tl.fromTo('#b9-hand',
    { attr: { x2: 2716, y2: 1388 }, opacity: 0 },
    { attr: { x2: 2664, y2: 1390 }, opacity: 1, duration: 0.45, ease: 'power2.out' },
    2.7
  )

  /* 9. Papá camina hacia los otros */
  tl.to('#b9-pa', { x: 90, duration: 0.65, ease: 'power1.inOut' }, 3.0)

  /* 10. Todos se iluminan */
  tl.to(['#b9-o1', '#b9-o2', '#b9-o3'], { opacity: 1, stagger: 0.08, duration: 0.3 }, 3.4)

  /* 11. Círculo de conexión aparece */
  tl.to('#b9-circle', { opacity: 1, duration: 0.5 }, 3.6)
}
