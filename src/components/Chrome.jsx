import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useTransform } from 'framer-motion'
import { pm, scrollToP, stopPlay, togglePlay, maxScroll } from '../progress'
import { THEMES } from '../theme'
import { useUI } from '../store'
import { CH, ME } from '../data'
import { IcPlay, IcPause } from './Icons'

const TOTAL = 90
const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`
const NAV = [['Profile', 0.17, 0.0], ['Experience', 0.31, 0.25], ['Skills', 0.84, 0.78], ['Contact', 0.985, 0.93]]

function Themes() {
  const { theme, setTheme } = useUI()
  return (
    <div className="flex items-center gap-1.5" role="group" aria-label="Colour theme">
      {Object.entries(THEMES).map(([k, t]) => (
        <button key={k} onClick={() => setTheme(k)} title={t.label} aria-label={t.label} aria-pressed={theme === k}
          className={`h-4 w-4 border transition ${theme === k ? 'scale-110 border-cream' : 'border-cream/40 hover:border-cream'}`} style={{ background: t.swatch }} />
      ))}
    </div>
  )
}

function useKeys() {
  useEffect(() => {
    const go = (dir) => {
      const p = pm.get()
      const next = dir > 0 ? CH.find((c) => c.c > p + 0.012) : [...CH].reverse().find((c) => c.c < p - 0.012)
      stopPlay(); scrollToP(next ? next.c : dir > 0 ? 1 : 0)
    }
    const on = (e) => {
      if (e.target.closest?.('input,textarea') || e.metaKey || e.ctrlKey) return
      if (e.key === 'ArrowRight' || e.key === 'l') go(1)
      else if (e.key === 'ArrowLeft' || e.key === 'h') go(-1)
      else if (e.key === 'p') togglePlay()
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [])
}

function TopBar() {
  const [active, setActive] = useState(0)
  useMotionValueEvent(pm, 'change', (v) => { let k = 0; NAV.forEach(([, , from], i) => { if (v >= from) k = i }); setActive((a) => (a === k ? a : k)) })
  return (
    <header className="fixed inset-x-0 top-0 z-40 grid grid-cols-[1fr_auto_1fr] items-center px-4 py-4 md:px-8">
      <button onClick={() => scrollToP(0)} className="justify-self-start font-mono text-[11px] uppercase tracking-[0.07em]" aria-label="Back to start">{ME.name}</button>
      <nav className="hidden items-center gap-8 md:flex">
        {NAV.map(([l, c], i) => (
          <button key={l} onClick={() => { stopPlay(); scrollToP(c) }} className={`font-mono text-[11px] uppercase tracking-[0.07em] transition-opacity ${active === i ? 'opacity-100 underline underline-offset-[6px]' : 'opacity-70 hover:opacity-100'}`}>{l}</button>
        ))}
      </nav>
      <div className="col-start-3 flex items-center gap-4 justify-self-end">
        <Themes />
        <a href={ME.resume} download className="border border-cream px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.07em] transition-colors hover:bg-cream hover:text-ink">Resume</a>
      </div>
    </header>
  )
}

function Scrubber() {
  const playing = useUI((s) => s.playing)
  const track = useRef(), timeEl = useRef(), chEl = useRef(), drag = useRef(false)
  const fill = useTransform(pm, [0, 1], [0, 1])
  const left = useTransform(pm, (v) => `${v * 100}%`)
  useMotionValueEvent(pm, 'change', (v) => {
    if (timeEl.current) timeEl.current.textContent = `${fmt(v * TOTAL)} / ${fmt(TOTAL)}`
    if (chEl.current) { let cur = CH[0]; for (const c of CH) if (c.c <= v + 0.035) cur = c; chEl.current.textContent = cur.label }
  })
  const seek = (e) => {
    const r = track.current.getBoundingClientRect()
    window.scrollTo({ top: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * maxScroll(), behavior: 'instant' })
  }
  return (
    <div className="fixed inset-x-4 bottom-3 z-40 flex items-center gap-4 md:inset-x-8 md:bottom-4">
      <button onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'} className="flex shrink-0 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.07em] hover:text-ember">
        {playing ? <IcPause size={13} /> : <IcPlay size={11} />}{playing ? 'Pause' : 'Play'}
      </button>
      <div ref={track} className="relative h-6 flex-1 cursor-pointer touch-none select-none"
        onPointerDown={(e) => { stopPlay(); drag.current = true; e.currentTarget.setPointerCapture(e.pointerId); seek(e) }}
        onPointerMove={(e) => drag.current && seek(e)} onPointerUp={() => (drag.current = false)}>
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-cream/30" />
        <motion.div style={{ scaleX: fill }} className="absolute inset-x-0 top-1/2 h-px origin-left -translate-y-1/2 bg-cream" />
        {CH.map((c) => (
          <button key={c.id} onClick={(e) => { e.stopPropagation(); stopPlay(); scrollToP(c.c) }} onPointerDown={(e) => e.stopPropagation()} title={c.label} aria-label={c.label}
            className="group absolute top-1/2 -translate-x-1/2 -translate-y-1/2 p-1.5" style={{ left: `${c.c * 100}%` }}>
            <i className="block h-[7px] w-[7px] bg-cream/60 transition group-hover:scale-150 group-hover:bg-ember" />
            <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-ink px-1.5 py-0.5 font-mono text-[10px] uppercase opacity-0 transition group-hover:opacity-100">{c.label}</span>
          </button>
        ))}
        <motion.i style={{ left }} className="pointer-events-none absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 bg-ember" />
      </div>
      <div className="hidden shrink-0 items-center gap-4 font-mono text-[11px] uppercase tracking-[0.07em] sm:flex" title="← → jump chapters · P play / pause">
        <span ref={chEl} className="w-20 text-ember">Intro</span><span ref={timeEl} className="w-[100px] text-right text-cream/80">{`00:00 / ${fmt(TOTAL)}`}</span>
      </div>
    </div>
  )
}

function Toast() {
  const t = useUI((s) => s.toast)
  return (
    <AnimatePresence>
      {t && <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 8, opacity: 0 }} className="card fixed bottom-16 left-1/2 z-50 -translate-x-1/2 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.07em]">{t}</motion.div>}
    </AnimatePresence>
  )
}

export default function Chrome() {
  useKeys()
  return (<><TopBar /><Scrubber /><Toast /></>)
}
