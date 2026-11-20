import { lazy, Suspense, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { startLoop } from './progress'
import { useUI } from './store'
import Overlay from './components/Overlay'
import Chrome from './components/Chrome'
import Cursor from './components/Cursor'
import { ME, JOBS } from './data'

const Scene = lazy(() => import('./three/Scene'))

function Loader() {
  const ready = useUI((s) => s.ready)
  return (
    <AnimatePresence>
      {!ready && (
        <motion.div className="fixed inset-0 z-[100] flex items-end bg-ink p-6 md:p-10" exit={{ opacity: 0, transition: { duration: 0.8 } }}>
          <div className="label flex items-center gap-3"><span className="bullet animate-pulse" />Assembling portrait — 32,400 dots</div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function App() {
  useEffect(() => startLoop(), [])
  return (
    <div className="relative">
      <Loader />
      <div className="fixed inset-0 z-0"><Suspense fallback={null}><Scene /></Suspense></div>
      <Overlay />
      <Chrome />
      <Cursor />
      {/* the scroll track */}
      <div aria-hidden style={{ height: '800vh' }} />
      {/* plain-text copy for search engines & screen readers */}
      <div className="sr-only">
        <h1>{ME.name} — {ME.role}</h1>
        <p>{ME.summary}</p>
        {JOBS.map((j) => <p key={j.project}>{j.years}: {j.project} at {j.company} — {j.role}. {j.text} Technologies: {j.tech.join(', ')}.</p>)}
        <p>Contact: {ME.email}, {ME.phone}, {ME.linkedinLabel}</p>
      </div>
    </div>
  )
}
