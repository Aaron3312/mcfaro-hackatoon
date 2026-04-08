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
  { cam:{x:600, y:1460,z:0.82},                                         h:'mcFaro',                           b:'Iluminando el camino desde el primer momento.',                     pos:'top'    },
  { cam:{x:2180,y:1240,z:0.75},                                         h:'Casa Ronald McDonald',             b:'Un lugar seguro. Una cama. Un techo.',                              pos:'center' },
  { cam:{x:2290,y:1150,z:1.10},                                         h:'Descarga mcFaro.',                 b:'Tu estancia, organizada desde el primer día.',                      pos:'right'  },
  { cam:{x:1750,y:1280,z:0.73},                                         h:'Llegar al hospital\nno debería ser otro problema.', b:'mcFaro coordina el transporte. Tú solo cuida a Sofía.',   pos:'top'    },
  { cam:{x:2680,y:1330,z:1.05}, ey:'Mientras Sofía recibía su tratamiento', h:'Nadie debería\ncargar esto solo.', b:'mcFaro conectó a papá con otros papás.', pos:'top' },
  { cam:{x:1450,y:1310,z:1.15}, ey:'Después del tratamiento',           h:'Sofía jugó.',                                                                                            pos:'center' },
  { cam:{x:1500,y:970, z:0.26},                                         h:'mcFaro no resuelve\nla enfermedad.', b:'Ilumina el camino para que puedas\nenfocarte en lo que importa:', pos:'center' },
  { cam:{x:2255,y:1040,z:1.50},                                         h:'Todo en un lugar.',                b:'Para que solo pienses en tu familia.',                               pos:'center', cta:true },
]
