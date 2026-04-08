/* Beat 06 — Primera persona: el staff extiende el teléfono a papá */
import gsap from 'gsap'
import { SKIN, AMBER, OR_DARK, ORANGE } from './constants'

export function Beat06() {
  return (
    <>
      {/* ── FONDO: Pared interior cálida ── */}
      <g id="b6-scene" opacity="0">

        {/* Fondo sólido que tapa todo el mundo exterior */}
        <rect x="-5000" y="-2000" width="15000" height="8000" fill="#0a0704"/>

        {/* Pared trasera */}
        <rect x="380" y="870" width="900" height="380" fill="#140d06"/>

        {/* Moldura superior */}
        <rect x="380" y="870" width="900" height="14" fill="#1e1208"/>
        {/* Moldura lateral izq */}
        <rect x="380" y="870" width="10" height="380" fill="#1e1208"/>
        {/* Moldura lateral der */}
        <rect x="1270" y="870" width="10" height="380" fill="#1e1208"/>

        {/* Luz cálida de techo — como un downlight */}
        <ellipse cx="830" cy="878" rx="120" ry="28" fill={AMBER} opacity=".08"/>
        <ellipse cx="830" cy="878" rx="60"  ry="14" fill={AMBER} opacity=".12"/>

        {/* Cuadro en pared — logo Casa Ronald McDonald */}
        <rect x="440" y="910" width="88" height="64" rx="4" fill="#0d0805"/>
        <rect x="444" y="914" width="80" height="56" rx="3" fill="#1a1206"/>
        {/* Arcos dorados del logo */}
        <rect x="472" y="932" width="32" height="6"  rx="3" fill={OR_DARK}/>
        <rect x="482" y="924" width="12" height="22" rx="3" fill={OR_DARK}/>

        {/* Planta decorativa esquina */}
        <rect x="1200" y="1040" width="8" height="60" rx="4" fill="#3a2a14"/>
        <ellipse cx="1204" cy="1038" rx="22" ry="16" fill="#1a3a0a" opacity=".8"/>
        <ellipse cx="1192" cy="1048" rx="16" ry="12" fill="#224410" opacity=".7"/>
        <ellipse cx="1218" cy="1046" rx="14" ry="10" fill="#1a3a0a" opacity=".6"/>

        {/* MOSTRADOR — perspectiva de primera persona
            Frente ancho (cerca del viewer) + superficie que se estrecha hacia atrás */}

        {/* Superficie del mostrador (trapezoide) */}
        <polygon
          points="380,1250 1280,1250 1100,1150 560,1150"
          fill="#2a1a0a"
        />
        {/* Línea de borde frontal del mostrador */}
        <line x1="380" y1="1250" x2="1280" y2="1250" stroke="#3e2414" strokeWidth="3"/>
        {/* Frente del mostrador (cara visible) */}
        <rect x="380" y="1250" width="900" height="220" fill="#1a1006"/>
        {/* Detalle frente mostrador — paneles */}
        <rect x="420" y="1270" width="180" height="180" rx="4" fill="#140e06"/>
        <rect x="660" y="1270" width="180" height="180" rx="4" fill="#140e06"/>
        <rect x="900" y="1270" width="180" height="180" rx="4" fill="#140e06"/>
        {/* Reflejo sutil en la superficie del mostrador */}
        <polygon
          points="380,1250 1280,1250 1100,1150 560,1150"
          fill={AMBER} opacity=".025"
        />

        {/* Suelo */}
        <rect x="380" y="1470" width="900" height="100" fill="#0d0805"/>
      </g>

      {/* ── STAFF — visible de pecho para arriba detrás del mostrador ── */}
      <g id="b6-staff" opacity="0">
        {/* Cuerpo / camisa */}
        <rect x="784" y="1080" width="92" height="72" rx="8" fill="#1a2a50"/>
        {/* Logo en camisa — arcos Ronald */}
        <rect x="818" y="1104" width="22" height="5" rx="2.5" fill={OR_DARK} opacity=".95"/>
        <rect x="826" y="1097" width="6"  height="14" rx="2"  fill={OR_DARK} opacity=".95"/>
        {/* Cuello */}
        <rect x="820" y="1074" width="20" height="10" rx="4" fill={SKIN}/>
        {/* Cabeza */}
        <ellipse cx="830" cy="1056" rx="24" ry="22" fill={SKIN}/>
        {/* Cabello */}
        <ellipse cx="830" cy="1038" rx="22" ry="10" fill="#3a2010"/>
        {/* Ojos */}
        <ellipse cx="822" cy="1054" rx="3" ry="3.5" fill="#1a0e06"/>
        <ellipse cx="838" cy="1054" rx="3" ry="3.5" fill="#1a0e06"/>
        {/* Sonrisa */}
        <path d="M822,1064 Q830,1070 838,1064" stroke="#3a2010" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        {/* Brazo extendiendo el teléfono */}
        <rect x="786" y="1145" width="18" height="55" rx="8" fill={SKIN} transform="rotate(-18, 795, 1170)"/>
        <rect x="806" y="1140" width="18" height="50" rx="8" fill={SKIN} transform="rotate(-14, 815, 1165)"/>
      </g>

      {/* ── TELÉFONO extendido hacia el viewer ── */}
      <g id="b6-phone" opacity="0">
        {/* Sombra del teléfono sobre el mostrador */}
        <ellipse cx="830" cy="1248" rx="70" ry="12" fill="#000" opacity=".35"/>

        {/* Cuerpo del teléfono */}
        <rect x="768" y="1150" width="124" height="230" rx="18" fill="#0f0f14"/>
        {/* Borde interior */}
        <rect x="772" y="1154" width="116" height="222" rx="15" fill="#060810"/>
        {/* Pantalla */}
        <rect x="776" y="1158" width="108" height="210" rx="12" fill="#06091e"/>

        {/* ── App mcFaro en pantalla ── */}
        {/* Fondo pantalla con gradiente oscuro-azul */}
        <rect x="776" y="1158" width="108" height="210" rx="12" fill="#040818"/>

        {/* Hora en la pantalla */}
        <text x="830" y="1182" textAnchor="middle"
          fill="rgba(255,255,255,.4)" fontSize="11" fontFamily="sans-serif">
          9:41
        </text>

        {/* Ícono del faro — logo mcFaro centrado en pantalla */}
        <g id="b6-faro-icon">
          {/* Círculo de fondo del ícono */}
          <rect x="800" y="1200" width="60" height="60" rx="14" fill={OR_DARK}/>
          <rect x="802" y="1202" width="56" height="56" rx="12" fill="#c85a2a"/>

          {/* Torre del faro */}
          <rect x="827" y="1225" width="6" height="22" rx="1.5" fill="#fff" opacity=".9"/>
          {/* Base */}
          <rect x="822" y="1245" width="16" height="4"  rx="1" fill="#fff" opacity=".7"/>
          {/* Linterna */}
          <rect x="824" y="1218" width="12" height="8"  rx="2" fill="#fff" opacity=".9"/>
          {/* Luz */}
          <rect x="826" y="1220" width="8"  height="4"  rx="1" fill={AMBER}/>
          {/* Techo */}
          <polygon points="824,1218 830,1210 836,1218" fill="#fff" opacity=".9"/>
          {/* Haz del faro (pequeño) */}
          <polygon points="830,1214 870,1195 870,1210"
            fill={AMBER} opacity=".4"/>
        </g>

        {/* Nombre de la app */}
        <text x="830" y="1278" textAnchor="middle"
          fill={AMBER} fontSize="11" fontFamily="sans-serif" fontWeight="bold">
          mcFaro
        </text>

        {/* Botón "Descargar" */}
        <rect id="b6-btn" x="790" y="1290" width="80" height="28" rx="14" fill={OR_DARK} opacity="0"/>
        <text id="b6-btn-txt" x="830" y="1309" textAnchor="middle"
          fill="white" fontSize="10" fontFamily="sans-serif" fontWeight="bold" opacity="0">
          Descargar
        </text>

        {/* Glow de pantalla — ilumina levemente el entorno */}
        <ellipse id="b6-screen-glow"
          cx="830" cy="1190" rx="90" ry="60"
          fill={AMBER} opacity="0"/>
      </g>

      {/* ── Partículas de luz flotando ── */}
      <circle id="b6-p1" cx="760" cy="1190" r="2.5" fill={AMBER}  opacity="0"/>
      <circle id="b6-p2" cx="900" cy="1175" r="1.8" fill={ORANGE} opacity="0"/>
      <circle id="b6-p3" cx="875" cy="1200" r="2"   fill={AMBER}  opacity="0"/>
    </>
  )
}

export function animateIn() {
  const tl = gsap.timeline()

  // ── Reset ─────────────────────────────────────────────────────────
  gsap.set(['#b6-scene', '#b6-staff', '#b6-phone',
            '#b6-faro-icon', '#b6-btn', '#b6-btn-txt',
            '#b6-screen-glow', '#b6-p1', '#b6-p2', '#b6-p3'], { opacity: 0 })

  // La puerta está en SVG (2290, 1240)
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

  

  // ── 4. Snap cámara al interior (oculto tras el negro) ─────────
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

  // Ocultar todo el mundo exterior (casa, faro, océano, beats anteriores)
  tl.set(['#b5-casa', '#world-beam', '#b5-wsof', '#b5-wpa',
          '#b4-gsof', '#b4-gpa', '#b2-sof', '#b2-pa',
          '#b1-familia'], { opacity: 0 }, 1.5)

  // ── 6. Sala aparece ───────────────────────────────────────────
  tl.to('#b6-scene', {
    opacity: 1,
    duration: 0.5,
  }, 1.8)

  // ── 7. Staff aparece detrás del mostrador ────────────────────
  tl.fromTo('#b6-staff',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
    2.1
  )

  // ── 8. Teléfono se extiende hacia el viewer ───────────────────
  tl.fromTo('#b6-phone',
    { opacity: 0, y: 40, scale: 0.85, transformOrigin: '830px 1250px' },
    { opacity: 1, y: 0, scale: 1, duration: 0.65, ease: 'power2.out' },
    2.6
  )

  

  // ── 9. Glow de pantalla ───────────────────────────────────────
  tl.to('#b6-screen-glow', {
    opacity: 0.07,
    duration: 0.4,
  }, 3.1)

  // ── 10. Botón "Descargar" aparece ─────────────────────────────
  tl.to(['#b6-btn', '#b6-btn-txt'], {
    opacity: 1,
    stagger: 0.05,
    duration: 0.35,
  }, 3.3)

  // ── 11. Partículas de luz ─────────────────────────────────────
  tl.to(['#b6-p1', '#b6-p2', '#b6-p3'], {
    opacity: 0.5,
    stagger: 0.12,
    duration: 0.3,
  }, 3.3)

  // Loop suave de las partículas
  gsap.to(['#b6-p1', '#b6-p3'], {
    y: '-=7', duration: 2.0, repeat: -1, yoyo: true,
    ease: 'sine.inOut', delay: 2.8,
  })
  gsap.to('#b6-p2', {
    y: '-=5', duration: 2.4, repeat: -1, yoyo: true,
    ease: 'sine.inOut', delay: 3.1,
  })

  return tl
}
