/* ─── Paleta compartida ───────────────────────────────────────────── */
export const SKIN    = '#d8bc96'
export const AMBER   = '#F5C842'
export const ORANGE  = '#E87A3A'
export const OR_DARK = '#C85A2A'

/* ─── Tipos ───────────────────────────────────────────────────────── */
export interface Beat {
  cam: { x: number; y: number; z: number }
  ey?: string
  h:   string
  b?:  string
  pos: 'left' | 'center' | 'right' | 'top'
  cta?: true
}

/* ─── Datos de los 12 beats ──────────────────────────────────────── */
export const BEATS: Beat[] = [
  { cam:{x:900, y:1305,z:1.40}, ey:'Una historia real',                h:'Los García',                       b:'Una tiendita de abarrotes. Cinco personas. El día a día.',           pos:'top'    },
  { cam:{x:800, y:1390,z:2.20},                                         h:'Sofía',                            b:'La noticia que nadie quiere escuchar.',                              pos:'top'    },
  { cam:{x:640, y:1230,z:0.65},                                         h:'mcFaro',                           b:'Iluminando el camino desde el primer momento.',                     pos:'center' },
  { cam:{x:2180,y:1240,z:0.75},                                         h:'Casa Ronald McDonald',             b:'Un lugar seguro. Una cama. Un techo.',                              pos:'center' },
  { cam:{x:2310,y:1100,z:1.15},                                         h:'Descarga mcFaro.',                 b:'Tu estancia, organizada desde el primer día.',                      pos:'left'   },
  { cam:{x:830, y:1160,z:1.40}, ey:'El miedo más sencillo',             h:'mcFaro respondió\nantes de que cayera la noche.',                                                       pos:'right'  },
  { cam:{x:1750,y:1280,z:0.73},                                         h:'El transporte también\nestaba en mcFaro.', b:'Sin tres horas de camión. Sin perderse.',                  pos:'center' },
  { cam:{x:2680,y:1330,z:1.05}, ey:'Mientras Sofía recibía tratamiento',h:'Nadie debería\ncargar esto solo.',                                                                       pos:'left'   },
  { cam:{x:1450,y:1310,z:1.15}, ey:'Después del tratamiento',           h:'Sofía jugó.',                                                                                            pos:'center' },
  { cam:{x:1500,y:970, z:0.26},                                         h:'mcFaro no resuelve\nla enfermedad.', b:'Ilumina el camino para que puedas\nenfocarte en lo que importa:', pos:'center' },
  { cam:{x:2255,y:1040,z:1.50},                                         h:'Todo en un lugar.',                b:'Para que solo pienses en tu familia.',                               pos:'center', cta:true },
]
