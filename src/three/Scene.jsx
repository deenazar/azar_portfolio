import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { S } from '../progress'
import { useUI } from '../store'
import { T } from '../theme'
import { JOBS, SKILLS } from '../data'
import { textTex } from './labels'
import { camZ, STATION_Z, SPHERE_C } from './layout'
import ParticleField from './ParticleField'
import Ghosts from './Ghost'

const damp = THREE.MathUtils.damp
const mobile = () => window.innerWidth < 768
function Atmosphere() {
  const { scene } = useThree()
  useFrame(() => scene.background.copy(T.bg))
  return null
}

/* camera: still for the portrait, then flies down the tunnel */
function Rig() {
  const { camera } = useThree()
  const sm = useRef({ x: 0, y: 0, fov: 50 })
  useFrame((_, dt) => {
    dt = Math.min(dt, 0.05)
    const s = sm.current
    // on phones the portrait sits smaller: lower in the hero (under the headline), higher at the end (above the contact card)
    let z = camZ(S.p), yo = 0, xo = 0
    if (mobile()) {
      const sst = THREE.MathUtils.smoothstep
      const wH = 1 - sst(S.p, 0.085, 0.26), wE = sst(S.p, 0.89, 0.95), wK = sst(S.p, 0.75, 0.8) * (1 - sst(S.p, 0.885, 0.89))
      z += 3.4 * wH + 11 * wE + 5 * wK; yo = 1.3 * wH - 5.6 * wE - 3.4 * wK; xo = 2.9 * wE + 3.0 * wK
    }
    s.x = damp(s.x, S.mouse.x, 3, dt); s.y = damp(s.y, S.mouse.y, 3, dt)
    camera.position.set(s.x * 0.5 + xo, -s.y * 0.35 + yo, z)
    camera.lookAt(s.x * 0.2 + xo, -s.y * 0.12 + yo, z - 10)
    s.fov = damp(s.fov, (mobile() ? 58 : 50) + Math.min(14, Math.abs(S.v) * 30), 3, dt)
    camera.fov = s.fov
    camera.updateProjectionMatrix()
  })
  return null
}

/* the year, floating in each station ring */
function StationLabel({ job, z }) {
  const sp = useRef()
  const tex = useMemo(() => textTex((g, w, h) => {
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff'
    g.font = '400 230px "Instrument Serif", Georgia, serif'; g.fillText(job.year, w / 2, h * 0.44)
    g.font = '500 38px "Geist Mono", monospace'; g.fillStyle = 'rgba(255,255,255,.75)'
    g.fillText(`${job.project} · ${job.company}`.toUpperCase(), w / 2, h * 0.86)
  }, 1024, 300, ['400 100px "Instrument Serif"', '500 30px "Geist Mono"']), [job])
  useFrame(() => {
    const near = Math.exp(-((S.p - job.c) ** 2) / (2 * 0.05 ** 2))
    sp.current.material.opacity = near * near
    sp.current.material.color.copy(T.fg)
    sp.current.material.color.copy(T.fg)
  })
  return (
    <sprite ref={sp} position={[0, 0.2, z]} scale={[4.6, 1.35, 1]}>
      <spriteMaterial map={tex} transparent depthWrite={false} depthTest={false} toneMapped={false} />
    </sprite>
  )
}

/* skills: labelled nodes riding inside the particle sphere */
const fib = (i, n, r) => {
  const y = 1 - (i / (n - 1)) * 2, rad = Math.sqrt(1 - y * y), th = Math.PI * (3 - Math.sqrt(5)) * i
  return new THREE.Vector3(Math.cos(th) * rad * r, y * r, Math.sin(th) * rad * r)
}
const MIX = { frontend: 0, backend: 0.32, eng: 0.54, learning: 0.68 }

function SkillNode({ skill, pos }) {
  const m = useRef(), sp = useRef(), ol = useRef()
  const mk = (stroke) => textTex((g, w, h) => {
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '500 44px "Geist Mono", monospace'; g.fillStyle = g.strokeStyle = '#fff'
    if (stroke) { g.lineJoin = 'round'; g.lineWidth = 14; g.strokeText(skill.name, w / 2, h / 2) } else g.fillText(skill.name, w / 2, h / 2)
  }, 512, 96, ['500 40px "Geist Mono"'])
  const fill = useMemo(() => mk(false), [skill]), outline = useMemo(() => mk(true), [skill])
  const setHover = useUI((s) => s.setHover), setCat = useUI((s) => s.setCat)
  useFrame((_, dt) => {
    const { cat, hover } = useUI.getState()
    const on = cat === 'all' || cat === skill.cat, hov = hover === skill.name
    m.current.scale.setScalar(damp(m.current.scale.x, hov ? 1.7 : on ? 1 : 0.5, 8, dt))
    const o = damp(sp.current.material.opacity, on || hov ? 1 : 0.15, 8, dt)
    sp.current.material.opacity = o; ol.current.material.opacity = o * 0.92
    sp.current.material.color.copy(T.fg); ol.current.material.color.copy(T.bg)
    m.current.material.color.copy(T.fg).lerp(T.bg, MIX[skill.cat] * (on || hov ? 1 : 1.2))
  })
  return (
    <group position={pos}>
      <mesh ref={m}
        onPointerOver={(e) => { e.stopPropagation(); setHover(skill.name); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setHover(null); document.body.style.cursor = '' }}
        onClick={(e) => { e.stopPropagation(); setCat(skill.cat) }}>
        <sphereGeometry args={[0.2, 20, 20]} />
        <meshBasicMaterial toneMapped={false} />
      </mesh>
      <sprite ref={ol} position={[0, 0.62, 0]} scale={[3.5, 0.66, 1]} renderOrder={8}>
        <spriteMaterial map={outline} transparent depthWrite={false} depthTest={false} toneMapped={false} />
      </sprite>
      <sprite ref={sp} position={[0, 0.62, 0]} scale={[3.5, 0.66, 1]} renderOrder={9}>
        <spriteMaterial map={fill} transparent depthWrite={false} depthTest={false} toneMapped={false} />
      </sprite>
    </group>
  )
}

function SkillCloud() {
  const grp = useRef(), tilt = useRef({ vy: 0, drag: false })
  const spots = useMemo(() => SKILLS.map((_, i) => fib(i, SKILLS.length, 3.3)), [])
  useFrame((_, dt) => {
    const vis = S.p > 0.8 && S.p < 0.9
    grp.current.visible = vis
    if (!vis) return
    const t = tilt.current
    grp.current.rotation.y += dt * 0.2 + t.vy
    t.vy = damp(t.vy, 0, 3, dt)
  })
  return (
    <group ref={grp} position={SPHERE_C}>
      <mesh
        onPointerDown={(e) => { tilt.current.drag = true; e.target.setPointerCapture?.(e.pointerId) }}
        onPointerUp={() => { tilt.current.drag = false }}
        onPointerMove={(e) => { if (tilt.current.drag) { tilt.current.vy = e.movementX * 0.004; grp.current.rotation.x = THREE.MathUtils.clamp(grp.current.rotation.x + e.movementY * 0.004, -0.8, 0.8) } }}
      >
        <sphereGeometry args={[4.4, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {SKILLS.map((s, i) => <SkillNode key={s.name} skill={s} pos={spots[i]} />)}
    </group>
  )
}

function Ready() {
  const done = useRef(false)
  useFrame(() => {
    if (done.current) return
    done.current = true
    Promise.all([document.fonts.ready, new Promise((r) => setTimeout(r, 700))]).then(() => useUI.getState().setReady())
  })
  return null
}

export default function Scene() {
  return (
    <Canvas
      dpr={[1, mobile() ? 1.5 : 2]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 10], fov: 50, near: 0.1, far: 500 }}
      style={{ touchAction: 'pan-y' }}
      onCreated={({ scene }) => { scene.background = new THREE.Color().copy(T.bg) }}
    >
      <Atmosphere />
      <Suspense fallback={null}>
        <Rig />
        <Ghosts />
        <ParticleField />
        {JOBS.map((j, i) => <StationLabel key={j.c} job={j} z={STATION_Z[i]} />)}
        <SkillCloud />
        <Ready />
      </Suspense>
    </Canvas>
  )
}
