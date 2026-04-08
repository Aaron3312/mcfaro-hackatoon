/* Beat 04 — mcFaro ilumina el camino */
import gsap from 'gsap'

export function Beat04() {
  return (
    <circle id="b4-glow" cx="720" cy="1350" r="290"
      fill="url(#cGlow)" opacity="0" style={{ transformOrigin: '720px 1350px' }}/>
  )
}

export function animateIn() {
  gsap.set('#b4-glow', { opacity: 0, scale: .3, transformOrigin: '720px 1350px' })
  gsap.set(['#gf-pa', '#gf-ma', '#gf-h1', '#gf-h2', '#gf-sof'], { opacity: .05 })
  gsap.timeline()
    .to('#b4-glow',            { opacity: 1, scale: 1, duration: .6 })
    .to(['#gf-pa', '#gf-sof'], { opacity: 1, duration: .45 }, '<+.25')
}
