/* Beat 02 — El diagnóstico: Sofía iluminada, "leucemia" letra por letra */
import gsap from 'gsap'

// Cámara beat2: {x:800, y:1390, z:2.20}
// Fórmula: screen_px = (world - cam) * z + viewport/2
// Sofia pies y=1502 → screen_y ≈ vh/2 + 246
// Cruz    y=1318  → screen_y ≈ vh/2 − 159  (zona alta, debajo del texto overlay)
// Letras  y=1365  → screen_y ≈ vh/2 − 55   (encima de Sofia)

export function Beat02() {
  const letras  = 'leucemia'.split('')
  // Offsets acumulados por letra — extra gap entre m(5) e i(6)
  // l   e   u   c   e   m   i   a
  const dx = [0, 24, 48, 72, 96, 120, 152, 168]  // +8 extra antes de 'i', 'a' pegada
  const totalW = 176 + 14  // ancho aproximado del último carácter
  const letraX0 = 820 - (dx[7] + totalW / 2) / 2  // centra sobre x=820

  return (
    <>
      <defs>
        <radialGradient id="b2-spotGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#ffe8c0" stopOpacity="0.32"/>
          <stop offset="100%" stopColor="#ffe8c0" stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* Cruz médica — pequeña, debajo del texto overlay */}
      <g id="b2-cross" opacity="0" transform="translate(820,1318)">
        <rect x="-7"  y="-18" width="14" height="36" rx="4" fill="#7a1a1a" opacity=".9"/>
        <rect x="-18" y="-7"  width="36" height="14" rx="4" fill="#7a1a1a" opacity=".9"/>
        <rect x="-5"  y="-16" width="10" height="32" rx="3" fill="#e74c3c" opacity=".6"/>
        <rect x="-16" y="-5"  width="32" height="10" rx="3" fill="#e74c3c" opacity=".6"/>
      </g>

      {/* Spotlight difuso detrás de Sofía */}
      <ellipse
        id="b2-spot"
        cx="820" cy="1455"
        rx="85" ry="105"
        fill="url(#b2-spotGrad)"
        opacity="0"
      />

      {/* "leucemia" — cada letra por separado para stagger */}
      {letras.map((char, i) => (
        <text
          key={i}
          id={`b2-l${i}`}
          x={letraX0 + dx[i]}
          y={1365}
          fill="#c0392b"
          fontSize="26"
          fontFamily="Georgia, serif"
          fontStyle="italic"
          fontWeight="600"
          opacity="0"
        >
          {char}
        </text>
      ))}
    </>
  )
}

export function animateIn() {
  const letraIds = 'leucemia'.split('').map((_, i) => `#b2-l${i}`)

  // ── Reset ────────────────────────────────────────────────────
  gsap.set('#b2-cross', { opacity: 0, scale: 0.3, transformOrigin: '820px 1318px' })
  gsap.set('#b2-spot',  { opacity: 0 })
  gsap.set(letraIds,    { opacity: 0 })

  // Estado heredado del beat 1 — toda la familia visible
  gsap.set(['#gf-pa', '#gf-ma', '#gf-h1', '#gf-h2', '#gf-sof'], { opacity: 1 })
  gsap.set('#gf-shop', { opacity: 1 })

  const tl = gsap.timeline()

  // 1. 4 familiares + tienda se oscurecen; Sofía queda iluminada con spotlight
  tl.to(['#gf-shop', '#gf-pa', '#gf-ma', '#gf-h1', '#gf-h2'], {
    opacity: 0.06,
    duration: 0.9,
    ease: 'power2.inOut',
  })
  tl.to('#gf-sof',  { opacity: 1,   duration: 0.5 }, '<')
  tl.to('#b2-spot', { opacity: 1,   duration: 1.0, ease: 'power1.out' }, '<')

  // 2. Cruz médica aparece con pop
  tl.to('#b2-cross', { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(1.8)' }, '<+0.55')

  // 3. Hueco de tensión (sin addPause — bloquea la timeline)
  tl.to({}, { duration: 0.55 })

  // 4. "leucemia" letra por letra
  letraIds.forEach((id, i) => {
    tl.to(id, { opacity: 1, duration: 0.16, ease: 'power1.out' }, `<+${i === 0 ? 0 : 0.14}`)
  })
}
