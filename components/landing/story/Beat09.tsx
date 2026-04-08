/* Beat 09 — Cuatro papás en la oscuridad, iluminados juntos */
import gsap from 'gsap'
import { AMBER, OR_DARK } from './constants'

/* Colores de silueta iluminada — distintos tonos para cada papá */
const COLS = ['#c8966a', '#a07855', '#b88860', '#d4a07a']

/* Datos de cada figura: cx, color */
const PADRES = [
  { id: 'b9-pa',  cx: 2643, cy: 1390, col: COLS[0] },
  { id: 'b9-o1',  cx: 2543, cy: 1390, col: COLS[1] },
  { id: 'b9-o2',  cx: 2453, cy: 1390, col: COLS[2] },
  { id: 'b9-o3',  cx: 2368, cy: 1390, col: COLS[3] },
]

function Padre({ id, cx, cy, col }: { id: string; cx: number; cy: number; col: string }) {
  return (
    <g id={id} opacity="0">
      {/* Halo cálido */}
      <ellipse cx={cx} cy={cy + 5} rx="28" ry="42" fill={col} opacity=".12"/>
      {/* Cuerpo */}
      <rect x={cx - 18} y={cy - 30} width="36" height="54" rx="8" fill={col}/>
      {/* Cabeza */}
      <ellipse cx={cx} cy={cy - 40} rx="16" ry="16" fill={col}/>
      {/* Hombros */}
      <ellipse cx={cx} cy={cy - 22} rx="22" ry="10" fill={col}/>
      {/* Piernas */}
      <rect x={cx - 17} y={cy + 24} width="14" height="46" rx="5" fill={col}/>
      <rect x={cx + 3}  y={cy + 24} width="14" height="46" rx="5" fill={col}/>
    </g>
  )
}

export function Beat09() {
  return (
    <>
      <defs>
        {/* Filtro glow compartido */}
        <filter id="b9-glow" x="-70%" y="-70%" width="240%" height="240%">
          <feGaussianBlur stdDeviation="8" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>

        {/* Gradiente radial para el suelo iluminado bajo los papás */}
        <radialGradient id="b9-floor" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={AMBER} stopOpacity=".18"/>
          <stop offset="100%" stopColor={AMBER} stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* ── Suelo cálido bajo el grupo ── */}
      <ellipse id="b9-floor-glow"
        cx="2505" cy="1460" rx="200" ry="28"
        fill="url(#b9-floor)" opacity="0"/>

      {/* ── Las cuatro figuras con glow ── */}
      <g filter="url(#b9-glow)">
        {PADRES.map(p => <Padre key={p.id} {...p}/>)}
      </g>

      {/* ── Línea de conexión (o3 → papá, ~275px) ── */}
      <line id="b9-cxline"
        x1="2368" y1="1390" x2="2643" y2="1390"
        stroke={AMBER} strokeWidth="2.5" strokeLinecap="round"
        strokeDasharray="275" strokeDashoffset="275" opacity=".6"/>

      {/* ── Nodo por cada papá ── */}
      {PADRES.map((p, i) => (
        <circle key={i} id={`b9-n${i}`}
          cx={p.cx} cy={p.cy} r="0"
          fill={AMBER} opacity="0"/>
      ))}

      {/* ── Partículas flotantes — ambiente de calor humano ── */}
      {[
        [2390,1340],[2430,1300],[2480,1320],[2530,1280],
        [2580,1310],[2620,1290],[2660,1330],[2700,1305],
      ].map(([x, y], i) => (
        <circle key={i} id={`b9-spark${i}`}
          cx={x} cy={y} r="2.5"
          fill={OR_DARK} opacity="0"/>
      ))}
    </>
  )
}

export function animateIn() {
  /* Limpiar Beat08 */
  gsap.killTweensOf(['#b8-van', '#b8-wpa', '#b8-wsof', '.b8-w'])
  gsap.set([ '#b8-wpa', '#b8-wsof', '.b8-w',
            '#b6-scene', '#b6-staff', '#b6-phone',
            '#b6-cta', '#b6-cta-txt', '#b6-screen-glow',
            '#b6-p1', '#b6-p2', '#b6-p3', '#b6-p4'], { opacity: 0 })

  /* Reset */
  const IDS = PADRES.map(p => `#${p.id}`)
  gsap.set([...IDS, '#b9-floor-glow'], { opacity: 0, x: 0, y: 0 })
  gsap.set('#b9-cxline', { attr: { strokeDashoffset: '275' } })
  for (let i = 0; i < 4; i++) gsap.set(`#b9-n${i}`, { attr: { r: '0' }, opacity: 0 })
  for (let i = 0; i < 8; i++) gsap.set(`#b9-spark${i}`, { opacity: 0, y: 0 })

  const tl = gsap.timeline()

  /* 1. Suelo cálido aparece primero — establece el espacio */
  tl.to('#b9-floor-glow', { opacity: 1, duration: 0.8, ease: 'power2.out' }, 0)

  /* 2. Los cuatro papás aparecen en cascada desde la oscuridad */
  IDS.forEach((id, i) => {
    tl.fromTo(id,
      { opacity: 0, scale: 0.5, y: 18,
        transformOrigin: `${PADRES[i].cx}px ${PADRES[i].cy}px` },
      { opacity: 1, scale: 1, y: 0,
        duration: 0.5, ease: 'back.out(1.6)' },
      0.3 + i * 0.18
    )
  })

  /* 3. Pulso suave en todos — respiran */
  IDS.forEach((id, i) => {
    tl.to(id,
      { opacity: 0.75, duration: 1.4 + i * 0.1,
        repeat: -1, yoyo: true, ease: 'sine.inOut' },
      1.2 + i * 0.15
    )
  })

  /* 4. Línea de conexión se dibuja de izq a der */
  tl.to('#b9-cxline',
    { attr: { strokeDashoffset: '0' }, duration: 0.8, ease: 'power2.inOut' }, 1.5)

  /* 5. Nodos aparecen en cascada sobre cada papá */
  for (let i = 0; i < 4; i++) {
    tl.fromTo(`#b9-n${i}`,
      { attr: { r: '0' }, opacity: 0 },
      { attr: { r: '7' }, opacity: 1, duration: 0.25, ease: 'back.out(2)' },
      1.65 + i * 0.12
    )
    tl.to(`#b9-n${i}`,
      { attr: { r: '11' }, opacity: 0.35,
        duration: 0.9, repeat: -1, yoyo: true, ease: 'sine.inOut' },
      2.0 + i * 0.12
    )
  }

  /* 6. Partículas flotan hacia arriba — calidez / esperanza */
  for (let i = 0; i < 8; i++) {
    tl.fromTo(`#b9-spark${i}`,
      { opacity: 0, y: 0 },
      { opacity: 0.5, y: -(30 + (i % 3) * 15),
        duration: 1.8 + (i % 4) * 0.3,
        repeat: -1, yoyo: true,
        ease: 'sine.inOut',
        delay: i * 0.2 },
      2.0
    )
  }
}

