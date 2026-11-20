import { motionValue } from 'framer-motion'
import { useUI } from './store'

// Shared, frame-updated scroll state. The 3D scene reads S; the DOM reads the motion values.
export const pm = motionValue(0) // smoothed scroll progress 0..1
export const mx = motionValue(0) // pointer -1..1
export const my = motionValue(0)
export const S = { raw: 0, p: 0, v: 0, mouse: { x: 0, y: 0 } }

const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
export const maxScroll = () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
export const scrollToP = (p, smooth = true) => window.scrollTo({ top: p * maxScroll(), behavior: smooth ? 'smooth' : 'instant' })

export function startLoop() {
  let last = performance.now(), id
  const onMove = (e) => {
    S.mouse.x = (e.clientX / window.innerWidth) * 2 - 1
    S.mouse.y = (e.clientY / window.innerHeight) * 2 - 1
    mx.set(S.mouse.x); my.set(S.mouse.y)
  }
  window.addEventListener('pointermove', onMove, { passive: true })
  const tick = (now) => {
    const dt = Math.min(0.1, (now - last) / 1000)
    last = now
    S.raw = Math.min(1, Math.max(0, window.scrollY / maxScroll()))
    const prev = S.p
    if (reduce) S.p = S.raw
    else {
      S.p += (S.raw - S.p) * (1 - Math.exp(-dt * 6))
      if (Math.abs(S.raw - S.p) < 0.00005) S.p = S.raw
    }
    S.v = (S.p - prev) / Math.max(dt, 0.001)
    pm.set(S.p)
    id = requestAnimationFrame(tick)
  }
  id = requestAnimationFrame(tick)
  return () => { cancelAnimationFrame(id); window.removeEventListener('pointermove', onMove) }
}

// "Play the film": auto-scrolls the whole journey. Any user input stops it.
const PLAY_SECONDS = 85
let playRaf = 0
const cancelEvents = ['wheel', 'touchstart', 'keydown']
export function stopPlay() {
  cancelAnimationFrame(playRaf)
  cancelEvents.forEach((e) => window.removeEventListener(e, stopPlay))
  if (useUI.getState().playing) useUI.getState().setPlaying(false)
}
export function startPlay() {
  if (window.scrollY >= maxScroll() - 4) window.scrollTo({ top: 0, behavior: 'instant' })
  useUI.getState().setPlaying(true)
  cancelEvents.forEach((e) => window.addEventListener(e, stopPlay, { passive: true }))
  let pos = window.scrollY, last = performance.now()
  const tick = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    const m = maxScroll()
    pos += (m / PLAY_SECONDS) * dt
    window.scrollTo({ top: pos, behavior: 'instant' })
    if (pos >= m - 1) return stopPlay()
    playRaf = requestAnimationFrame(tick)
  }
  playRaf = requestAnimationFrame(tick)
}
export const togglePlay = () => (useUI.getState().playing ? stopPlay() : startPlay())
