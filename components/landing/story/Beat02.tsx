/* Beat 02 — El diagnóstico: Sofía iluminada, "leucemia" letra por letra */
import gsap from 'gsap'

export function Beat02() {
  // Sofia está en x=820, y=1502 (pies). Centro de figura ≈ y=1455
  // Con cámara z=2.20, fontSize=36 → ~79px en pantalla. 8 letras * 22 = 176 u → ~387px ancho
  const letras = 'leucemia'.split('')
  const letraX0 = 820 - 88  // centrado en Sofia (88 = 176/2)

  return (
    <>
      {/* Gradient definido en defs — fuera de defs no se aplica */}
      <defs>
        <radialGradient id="b2-spotGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#ffe8c0" stopOpacity="0.28"/>
          <stop offset="100%" stopColor="#ffe8c0" stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* Spotlight difuso detrás de Sofía */}
      <ellipse
        id="b2-spot"
        cx="824" cy="1462"
        rx="90" ry="110"
        fill="url(#b2-spotGrad)"
        opacity="0"
      />

      {/* "leucemia" — letra por letra, tamaño moderado */}
      {letras.map((char, i) => (
        <text
          key={i}
          id={`b2-l${i}`}
          x={letraX0 + i * 22}
          y={1370}
          fill="#c0392b"
          fontSize="36"
          fontFamily="Georgia, serif"
          fontStyle="italic"
          fontWeight="600"
          opacity="0"
        >
          {char}
        </text>
      ))}

      {/* Frase final */}
      <text
        id="b2-frase"
        x="820"
        y="1406"
        textAnchor="middle"
        fill="#888888"
        fontSize="18"
        fontFamily="sans-serif"
        fontWeight="300"
        letterSpacing="1"
        opacity="0"
      >
        La noticia que nadie quiere escuchar.
      </text>
    </>
  )
}

export function animateIn() {
  const letraIds = 'leucemia'.split('').map((_, i) => `#b2-l${i}`)

  // ── Reset ────────────────────────────────────────────────────
  gsap.set('#b2-spot',  { opacity: 0 })
  gsap.set('#b2-frase', { opacity: 0 })
  gsap.set(letraIds,    { opacity: 0, y: 10 })

  // Estado heredado del beat 1 — toda la familia visible
  gsap.set(['#gf-pa', '#gf-ma', '#gf-h1', '#gf-h2', '#gf-sof'], { opacity: 1 })
  gsap.set('#gf-shop', { opacity: 1 })

  const tl = gsap.timeline()

  // 1. Tienda + 4 familiares se oscurecen lentamente
  tl.to(['#gf-shop', '#gf-pa', '#gf-ma', '#gf-h1', '#gf-h2'], {
    opacity: 0.06,
    duration: 0.8,
    ease: 'power2.inOut',
  })

  // 2. Sofía queda sola iluminada + spotlight aparece
  tl.to('#gf-sof',  { opacity: 1,    duration: 0.5 }, '<')
  tl.to('#b2-spot', { opacity: 1,    duration: 0.9, ease: 'power1.out' }, '<')

  // 3. Pausa breve de tensión
  tl.addPause('+=0.4')

  // 4. "leucemia" aparece letra por letra
  letraIds.forEach((id, i) => {
    tl.to(id, { opacity: 1, y: 0, duration: 0.18, ease: 'power1.out' }, `<+${i === 0 ? 0 : 0.13}`)
  })

  // 5. Pausa silenciosa tras la palabra
  tl.addPause('+=0.7')

  // 6. Frase final aparece suavemente
  tl.to('#b2-frase', { opacity: 1, duration: 1.0, ease: 'power1.inOut' })
}