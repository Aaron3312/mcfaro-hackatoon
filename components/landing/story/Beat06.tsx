/* Beat 06 — Primera persona: el staff extiende el teléfono */
import gsap from 'gsap'
import { SKIN, AMBER, OR_DARK, ORANGE } from './constants'

export function Beat06() {
  return (
    <>
      <g id="b6-scene" opacity="0">

        {/* ── Fondo total ── */}
        <rect x="-5000" y="-2000" width="15000" height="8000" fill="#080604"/>

        {/* ── Pared trasera con textura de paneles ── */}
        <rect x="330" y="860" width="1000" height="420" fill="#12100e"/>
        {/* Paneles de madera en pared */}
        {[0,1,2,3,4].map(i => (
          <rect key={i} x={330 + i*200} y="860" width="198" height="420"
            fill={i%2===0 ? '#14110e' : '#111009'} opacity=".9"/>
        ))}
        {/* Zócalo superior */}
        <rect x="330" y="860" width="1000" height="18" fill="#1e1810"/>
        {/* Zócalo inferior pared */}
        <rect x="330" y="1262" width="1000" height="14" fill="#1e1810"/>

        {/* ── Luz de techo — efecto spot cálido ── */}
        <ellipse cx="830" cy="862" rx="200" ry="40"  fill={AMBER} opacity=".06"/>
        <ellipse cx="830" cy="862" rx="100" ry="20"  fill={AMBER} opacity=".1"/>
        <ellipse cx="830" cy="862" rx="40"  ry="10"  fill={AMBER} opacity=".18"/>
        {/* Cono de luz hacia abajo */}
        <polygon points="790,862 870,862 980,1276 680,1276"
          fill={AMBER} opacity=".025"/>

        {/* ── Logo de Casa Ronald en pared ── */}
        <g id="b6-logo-pared">
          <rect x="700" y="886" width="260" height="130" rx="8" fill="#0d0b08"/>
          <rect x="704" y="890" width="252" height="122" rx="6" fill="#181410"/>
          {/* Logo imagen */}
          <image
            href="/images/ronalmacdonallogo1.png"
            x="738" y="893" width="90" height="90"
            preserveAspectRatio="xMidYMid meet"
          />
          {/* Texto al lado */}
          <text x="844" y="926" fill={OR_DARK} fontSize="11"
            fontFamily="sans-serif" fontWeight="bold" letterSpacing="1.2">
            CASA RONALD
          </text>
          <text x="844" y="942" fill={OR_DARK} fontSize="11"
            fontFamily="sans-serif" fontWeight="bold" letterSpacing="1.2">
            McDONALD
          </text>
          <text x="844" y="958" fill="rgba(200,90,42,.5)" fontSize="8"
            fontFamily="sans-serif" letterSpacing="1.5">
            MÉXICO
          </text>
        </g>

        {/* ── Mostrador con perspectiva isométrica ── */}
        {/* Superficie superior — trapezoide ancho */}
        <polygon points="230,1276 1430,1276 1230,1160 430,1160" fill="#2e1e0c"/>
        {/* Veta de madera en superficie */}
        <polygon points="230,1276 1430,1276 1230,1160 430,1160" fill="url(#b6-woodGrain)" opacity=".4"/>
        {/* Borde frontal brillante */}
        <line x1="230" y1="1276" x2="1430" y2="1276" stroke={AMBER} strokeWidth="1.5" opacity=".2"/>
        {/* Cara frontal del mostrador */}
        <rect x="230" y="1276" width="1200" height="240" fill="#1e1208"/>
        {/* Paneles del frente */}
        {[0,1,2,3,4,5].map(i => (
          <rect key={i} x={248 + i*194} y="1292" width="186" height="208" rx="6"
            fill={i%2===0 ? '#1a1006' : '#160e05'} opacity=".95"/>
        ))}
        {/* Línea de sombra debajo de la superficie */}
        <rect x="230" y="1276" width="1200" height="6" fill="#0a0603"/>

        {/* Lateral izquierdo del mostrador */}
        <polygon points="230,1276 430,1160 430,1130 230,1246" fill="#241608" opacity=".8"/>
        {/* Lateral derecho del mostrador */}
        <polygon points="1430,1276 1230,1160 1230,1130 1430,1246" fill="#241608" opacity=".8"/>
      </g>

      {/* ── Defs para efectos ── */}
      <defs>
        <linearGradient id="b6-woodGrain" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#3a2510" stopOpacity=".6"/>
          <stop offset="30%"  stopColor="#2a1808" stopOpacity=".2"/>
          <stop offset="55%"  stopColor="#3a2510" stopOpacity=".5"/>
          <stop offset="80%"  stopColor="#2a1808" stopOpacity=".1"/>
          <stop offset="100%" stopColor="#3a2510" stopOpacity=".4"/>
        </linearGradient>
        <linearGradient id="b6-phoneScreen" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#0c1235"/>
          <stop offset="100%" stopColor="#060818"/>
        </linearGradient>
        <radialGradient id="b6-glowGrad" cx="50%" cy="40%" r="50%">
          <stop offset="0%"   stopColor={AMBER} stopOpacity=".25"/>
          <stop offset="100%" stopColor={AMBER} stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* ── STAFF — pecho hacia arriba, detrás del mostrador ── */}
      <g id="b6-staff" opacity="0">
        {/* Hombros y torso — uniforme azul marino */}
        <rect x="762" y="1090" width="136" height="80" rx="10" fill="#1c2d52"/>
        {/* Cuello de la camisa */}
        <polygon points="808,1090 852,1090 845,1100 815,1100" fill="#162240"/>
        {/* Corbata/insignia */}
        <rect x="824" y="1095" width="12" height="28" rx="3" fill={OR_DARK} opacity=".9"/>

        {/* ── Logo Casa Ronald en uniforme (camisa) ── */}
        <image
          href="/images/ronalmacdonallogo1.png"
          x="774" y="1100" width="34" height="34"
          preserveAspectRatio="xMidYMid meet"
        />

        {/* Cuello */}
        <rect x="816" y="1078" width="28" height="16" rx="6" fill={SKIN}/>

        {/* Cabeza */}
        <ellipse cx="830" cy="1054" rx="30" ry="28" fill={SKIN}/>
        {/* Cabello oscuro */}
        <ellipse cx="830" cy="1032" rx="28" ry="12" fill="#2a1a0a"/>
        <ellipse cx="816" cy="1038" rx="14" ry="10" fill="#2a1a0a"/>
        <ellipse cx="844" cy="1038" rx="14" ry="10" fill="#2a1a0a"/>

        {/* Ojos amables */}
        <ellipse cx="820" cy="1053" rx="3.5" ry="4"   fill="#1a0e06"/>
        <ellipse cx="840" cy="1053" rx="3.5" ry="4"   fill="#1a0e06"/>
        {/* Brillo en ojos */}
        <circle cx="822" cy="1051" r="1.2" fill="white" opacity=".6"/>
        <circle cx="842" cy="1051" r="1.2" fill="white" opacity=".6"/>
        {/* Cejas */}
        <path d="M814,1045 Q820,1041 826,1045" stroke="#2a1a0a" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M834,1045 Q840,1041 846,1045" stroke="#2a1a0a" strokeWidth="2" fill="none" strokeLinecap="round"/>
        {/* Sonrisa cálida */}
        <path d="M818,1064 Q830,1074 842,1064" stroke="#3a2010" strokeWidth="2.5" fill="none" strokeLinecap="round"/>

        {/* Brazo derecho extendiendo el teléfono */}
        <rect x="844" y="1130" width="22" height="80" rx="10" fill={SKIN}
          transform="rotate(-30 855 1155)"/>
        {/* Mano */}
        <ellipse cx="836" cy="1190" rx="16" ry="12" fill={SKIN}/>
      </g>

      {/* ── TELÉFONO — lado izquierdo del mostrador ── */}
      <g id="b6-phone" opacity="0">

        {/* Sombra suave en el mostrador */}
        <ellipse cx="660" cy="1254" rx="88" ry="16" fill="#000" opacity=".5"/>

        {/* Cuerpo del teléfono */}
        <rect x="586" y="1120" width="148" height="278" rx="22" fill="#0e0e12"/>
        <rect x="588" y="1122" width="144" height="274" rx="20" fill="#1a1a20"/>
        <rect x="592" y="1126" width="136" height="266" rx="17" fill="url(#b6-phoneScreen)"/>

        {/* Notch */}
        <rect x="640" y="1130" width="40" height="10" rx="5" fill="#0c0c10"/>
        <circle cx="670" cy="1135" r="3" fill="#141418"/>

        {/* Header naranja */}
        <rect x="592" y="1140" width="136" height="60" rx="4" fill={OR_DARK} opacity=".9"/>
        {/* Logo mcFaro (icono completo con texto) */}
        <image
          href="/icons/icon-full.svg"
          x="600" y="1143" width="120" height="54"
          preserveAspectRatio="xMidYMid meet"
        />

        {/* Tarjeta: Próxima cita */}
        <rect x="600" y="1196" width="120" height="52" rx="8" fill="#0e1428"/>
        <rect x="600" y="1196" width="4"   height="52" rx="2" fill={AMBER}/>
        <text x="612" y="1212" fill="rgba(255,255,255,.5)" fontSize="7" fontFamily="sans-serif">PRÓXIMA CITA</text>
        <text x="612" y="1226" fill="white" fontSize="10" fontFamily="sans-serif" fontWeight="bold">Mañana 9:00 am</text>
        <text x="612" y="1240" fill={AMBER} fontSize="8" fontFamily="sans-serif">Oncología · Piso 3</text>

        {/* Tarjeta: Rutina */}
        <rect x="600" y="1254" width="120" height="52" rx="8" fill="#0e1428"/>
        <rect x="600" y="1254" width="4"   height="52" rx="2" fill={ORANGE}/>
        <text x="612" y="1270" fill="rgba(255,255,255,.5)" fontSize="7" fontFamily="sans-serif">TU RUTINA HOY</text>
        <text x="612" y="1284" fill="white" fontSize="10" fontFamily="sans-serif" fontWeight="bold">8 actividades</text>
        <text x="612" y="1298" fill={ORANGE} fontSize="8" fontFamily="sans-serif">incluye descansos ✓</text>

        {/* Botón CTA */}
        <rect id="b6-cta" x="600" y="1312" width="120" height="34" rx="17" fill={OR_DARK} opacity="0"/>
        <text id="b6-cta-txt" x="664" y="1334" textAnchor="middle"
          fill="white" fontSize="11" fontFamily="sans-serif" fontWeight="bold" opacity="0">
          Descargar
        </text>

        {/* Glow de pantalla */}
        <ellipse id="b6-screen-glow"
          cx="660" cy="1200" rx="130" ry="90"
          fill="url(#b6-glowGrad)" opacity="0"/>
      </g>

      {/* Partículas de luz */}
      <circle id="b6-p1" cx="570" cy="1185" r="3"   fill={AMBER}  opacity="0"/>
      <circle id="b6-p2" cx="752" cy="1172" r="2"   fill={ORANGE} opacity="0"/>
      <circle id="b6-p3" cx="715" cy="1210" r="2.5" fill={AMBER}  opacity="0"/>
      <circle id="b6-p4" cx="588" cy="1220" r="1.8" fill="white"  opacity="0"/>
    </>
  )
}

export function animateIn() {
  const tl = gsap.timeline()

  gsap.set(['#b6-scene', '#b6-staff', '#b6-phone',
            '#b6-cta', '#b6-cta-txt', '#b6-screen-glow',
            '#b6-p1', '#b6-p2', '#b6-p3', '#b6-p4'], { opacity: 0 })
  const vw = window.innerWidth
  const vh = window.innerHeight

  // ── 1. Snap cámara a la vista de la casa ─────────────────────
  gsap.set('#world-camera', {
    x: vw / 2 - 2290 * 1.15,
    y: vh / 2 - 1240 * 1.15,
    scale: 1.15,
  })

  // ── 2. Zoom INTO la puerta ────────────────────────────────────
  tl.to('#world-camera', {
    x: vw / 2 - 2290 * 3.0,
    y: vh / 2 - 1240 * 3.0,
    scale: 3.0,
    duration: 1.3,
    ease: 'power2.inOut',
  }, 0)

  // ── 3. Fade a negro ───────────────────────────────────────────
  tl.to('#scene-fade', {
    opacity: 1,
    duration: 0.5,
    ease: 'power2.in',
  }, 0.9)

  // ── 4. Snap cámara al interior ────────────────────────────────
  tl.set('#world-camera', {
    x: vw / 2 - 830 * 1.40,
    y: vh / 2 - 1160 * 1.40,
    scale: 1.40,
  }, 1.4)

  // ── 5. Fade OUT del negro — revela el interior ─────────────────
  tl.to('#scene-fade', {
    opacity: 0,
    duration: 0.7,
    ease: 'power2.out',
  }, 1.5)

  // Ocultar mundo exterior (oculto por el fondo sólido de b6-scene)
  tl.set(['#b5-casa', '#world-beam', '#b5-wsof', '#b5-wpa',
          '#b4-gsof', '#b4-gpa'], { opacity: 0 }, 1.5)

  // ── 6. Sala aparece con fade suave ───────────────────────────
  tl.to('#b6-scene', {
    opacity: 1,
    duration: 0.6,
    ease: 'power2.out',
  }, 1.8)

  // ── 7. Staff aparece — sube levemente desde abajo ────────────
  tl.fromTo('#b6-staff',
    { opacity: 0, y: 24 },
    { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' },
    2.2
  )

  // ── 8. Teléfono emerge hacia el viewer ───────────────────────
  tl.fromTo('#b6-phone',
    { opacity: 0, y: 50, scale: 0.80, transformOrigin: '660px 1260px' },
    { opacity: 1, y: 0,  scale: 1,    duration: 0.7, ease: 'power3.out' },
    2.7
  )

  // ── 9. Glow de pantalla ───────────────────────────────────────
  tl.to('#b6-screen-glow', {
    opacity: 1,
    duration: 0.5,
  }, 3.1)

  // ── 10. Botón CTA aparece ─────────────────────────────────────
  tl.to(['#b6-cta', '#b6-cta-txt'], {
    opacity: 1,
    stagger: 0.06,
    duration: 0.4,
  }, 3.4)

  // ── 11. Partículas ────────────────────────────────────────────
  tl.to(['#b6-p1', '#b6-p2', '#b6-p3', '#b6-p4'], {
    opacity: 0.55,
    stagger: 0.1,
    duration: 0.3,
  }, 3.4)

  gsap.to(['#b6-p1', '#b6-p3'], {
    y: '-=8', duration: 2.2, repeat: -1, yoyo: true,
    ease: 'sine.inOut', delay: 3.0,
  })
  gsap.to(['#b6-p2', '#b6-p4'], {
    y: '-=5', duration: 1.8, repeat: -1, yoyo: true,
    ease: 'sine.inOut', delay: 3.3,
  })

  return tl
}
