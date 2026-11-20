import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { S } from '../progress'
import { T } from '../theme'
import { camZ, SPHERE_C } from './layout'
import { JOBS } from '../data'
import engrave from '../assets/style-engrave.webp'
import ascii from '../assets/style-ascii.webp'
import mosaic from '../assets/style-mosaic.webp'
import hatch from '../assets/style-hatch.webp'
import dither from '../assets/style-dither.webp'
import contour from '../assets/style-contour.webp'
import maskUrl from '../assets/mask.webp'

export const STYLES = [
  { id: 'engrave', name: 'Engraving', url: engrave },
  { id: 'ascii', name: 'ASCII', url: ascii },
  { id: 'mosaic', name: 'Square halftone', url: mosaic },
  { id: 'hatch', name: 'Cross-hatch', url: hatch },
  { id: 'dither', name: '1-bit dither', url: dither },
  { id: 'contour', name: 'Contour', url: contour },
]
const mobile = () => window.innerWidth < 768

const vert = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`
const frag = `
uniform sampler2D uMap; uniform sampler2D uMask; uniform float uInv; uniform vec3 uColor; uniform float uReveal; uniform float uAlpha; uniform float uTime; varying vec2 vUv;
void main(){
  vec4 t = texture2D(uMap, vUv);
  float m = texture2D(uMask, vUv).r;
  t.a = mix(t.a, clamp(m - t.a, 0.0, 1.0), uInv);
  // scan-in from top to bottom with a bright leading edge
  float edge = 1.0 - vUv.y;
  float vis = smoothstep(edge - 0.02, edge, uReveal * 1.12);
  float lead = smoothstep(0.045, 0.0, abs(edge - uReveal * 1.12)) * step(0.001, uReveal) * step(uReveal, 0.98);
  float scan = 0.94 + 0.06 * sin(vUv.y * 420.0 + uTime * 6.0);
  float ex = smoothstep(0.0, 0.14, vUv.x) * smoothstep(1.0, 0.86, vUv.x);
  float a = (t.a * vis * scan + lead * 0.5 * t.a) * uAlpha * ex;
  if (a < 0.01) discard;
  gl_FragColor = vec4(uColor, a);
  #include <colorspace_fragment>
}`

let maskTex
function Ghost({ url, c, side, kind = 'job', invert = true }) {
  const mesh = useRef()
  const tex = useMemo(() => {
    const t = new THREE.TextureLoader().load(url)
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t
  }, [url])
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: vert, fragmentShader: frag, transparent: true, depthWrite: false, depthTest: false, toneMapped: false,
    uniforms: { uMap: { value: tex }, uMask: { value: (maskTex ||= new THREE.TextureLoader().load(maskUrl)) }, uInv: { value: 0 }, uColor: { value: new THREE.Color() }, uReveal: { value: 0 }, uAlpha: { value: 1 }, uTime: { value: 0 } },
  }), [tex])
  const m = mobile()
  const base = useMemo(() => {
    if (kind === 'skill') return { x: SPHERE_C[0], y: 0, z: SPHERE_C[2] - 4, s: m ? 9 : 10.5 }
    const z = camZ(c) - 6.5
    return m ? { x: 0, y: 1.9, z, s: 2.9 } : { x: side * 2.95, y: 0.2, z, s: 3.8 }
  }, [c, side, kind, m])
  useFrame(({ clock }) => {
    const u = mat.uniforms
    const near = kind === 'skill'
      ? THREE.MathUtils.smoothstep(S.p, 0.795, 0.825) * (1 - THREE.MathUtils.smoothstep(S.p, 0.875, 0.895))
      : Math.min(1, Math.max(0, Math.exp(-((S.p - c) ** 2) / (2 * 0.034 ** 2)) * 1.5 - 0.12) / 0.88)
    u.uReveal.value = near
    u.uAlpha.value = kind === 'skill' ? 0.32 : Math.min(1, near * 1.6)
    u.uTime.value = clock.elapsedTime
    u.uColor.value.copy(T.fg)
    u.uInv.value = invert && T.bg.r > 0.5 ? 1 : 0
    const f = Math.sin(clock.elapsedTime * 0.5 + c * 9) * 0.12
    mesh.current.visible = near > 0.002
    mesh.current.position.set(base.x + S.mouse.x * -0.25, base.y + f - S.mouse.y * 0.15, base.z)
    mesh.current.rotation.y = side * -0.28 + S.mouse.x * 0.1
  })
  return (
    <mesh ref={mesh} material={mat} scale={[base.s, base.s, 1]} renderOrder={5}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  )
}

export default function Ghosts() {
  return (
    <>
      {JOBS.map((j, i) => <Ghost key={j.c} url={STYLES[i].url} c={j.c} side={i % 2 === 0 ? -1 : 1} invert={STYLES[i].id !== 'ascii'} />)}
      <Ghost url={STYLES[5].url} c={0.85} side={0} kind="skill" invert={false} />
    </>
  )
}
