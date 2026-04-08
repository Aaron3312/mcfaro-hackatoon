/* Siluetas reutilizables — mismo estilo que HeroSection:
   cabeza circular + cuerpo trapecio con tope curvo + piernas rectangulares */
import { SKIN } from './constants'

interface FigureProps {
  id?:  string
  cn?:  string
  x:    number
  y:    number
  s?:   number
  f?:   string
  op?:  number
}

/* Adulto */
export function WA({ id, cn, x, y, s=1.5, f=SKIN, op=1 }: FigureProps) {
  return (
    <g id={id} className={cn} transform={`translate(${x},${y}) scale(${s})`} fill={f} opacity={op}>
      <circle cx="0" cy="-60" r="8"/>
      <path d="M-10,-46 C-10,-50 10,-50 10,-46 L8,-24 L-8,-24 Z"/>
      <rect x="-9" y="-25" width="6" height="25" rx="3"/>
      <rect x="3"  y="-25" width="6" height="25" rx="3"/>
    </g>
  )
}

/* Niño */
export function WC({ id, cn, x, y, s=1.1, f=SKIN, op=1 }: FigureProps) {
  return (
    <g id={id} className={cn} transform={`translate(${x},${y}) scale(${s})`} fill={f} opacity={op}>
      <circle cx="0" cy="-43" r="6"/>
      <path d="M-7,-33 C-7,-37 7,-37 7,-33 L5.5,-17 L-5.5,-17 Z"/>
      <rect x="-6.5" y="-18" width="5" height="18" rx="2.5"/>
      <rect x="1.5"  y="-18" width="5" height="18" rx="2.5"/>
    </g>
  )
}
