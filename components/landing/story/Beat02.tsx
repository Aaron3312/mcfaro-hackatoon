/* Beat 02 — El diagnóstico: Sofía y la cruz médica */
import gsap from 'gsap'

export function Beat02() {
  return (
    <g id="b2-cross" opacity="0" transform="translate(800,1078)">
      <rect x="-22" y="-70" width="44"  height="140" rx="8" fill="#8B2020" opacity=".85"/>
      <rect x="-70" y="-22" width="140" height="44"  rx="8" fill="#8B2020" opacity=".85"/>
      <rect x="-18" y="-66" width="36"  height="132" rx="6" fill="#e74c3c" opacity=".5"/>
      <rect x="-66" y="-18" width="132" height="36"  rx="6" fill="#e74c3c" opacity=".5"/>
    </g>
  )
}

export function animateIn() {
  gsap.set('#b2-cross', { opacity: 0, scale: .5, transformOrigin: '800px 1080px' })
  gsap.set(['#gf-pa', '#gf-ma', '#gf-h1', '#gf-h2'], { opacity: 1 })
  gsap.timeline()
    .to(['#gf-pa', '#gf-ma', '#gf-h1', '#gf-h2'], { opacity: .08, duration: .45 })
    .to('#gf-sof',   { opacity: 1, duration: .4 }, '<')
    .to('#b2-cross', { opacity: 1, scale: 1, duration: .5 }, '<+.2')
}
