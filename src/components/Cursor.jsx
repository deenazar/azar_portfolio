import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useUI } from '../store'

// Ring that follows the pointer, grows over anything clickable. Inverts against the background (works in black and white).
export default function Cursor() {
  const x = useMotionValue(-100), y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: 520, damping: 38 }), sy = useSpring(y, { stiffness: 520, damping: 38 })
  const [hot, setHot] = useState(false), [fine, setFine] = useState(false)
  const hover = useUI((s) => s.hover)
  useEffect(() => {
    setFine(window.matchMedia('(pointer: fine)').matches)
    const mv = (e) => { x.set(e.clientX); y.set(e.clientY); setHot(!!e.target.closest?.('a,button,input,[role=button]')) }
    window.addEventListener('pointermove', mv, { passive: true })
    return () => window.removeEventListener('pointermove', mv)
  }, [])
  if (!fine) return null
  return (
    <motion.div className="pointer-events-none fixed left-0 top-0 z-[120] mix-blend-difference" style={{ x: sx, y: sy }}>
      <motion.div animate={{ scale: hot || hover ? 2 : 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="-ml-[13px] -mt-[13px] h-[26px] w-[26px] rounded-full border border-white">
        <i className="absolute inset-[10px] rounded-full bg-white" />
      </motion.div>
    </motion.div>
  )
}
