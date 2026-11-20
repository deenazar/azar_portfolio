import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import portrait from '../portrait.json'
import { S } from '../progress'
import { T } from '../theme'
import { PORTRAIT_H, STATION_Z, SPHERE_C, FINAL, T1, T2, T3 } from './layout'

const N = portrait.n
const TRAIL = 14
const lin = (p, [a, b]) => Math.min(1, Math.max(0, (p - a) / (b - a)))

function mulberry(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }

function build() {
  const rnd = mulberry(7)
  const d = portrait.data
  const pos = new Float32Array(N * 3), hel = new Float32Array(N * 3), sph = new Float32Array(N * 3)
  const rand = new Float32Array(N * 4), size = new Float32Array(N), acc = new Float32Array(N), shard = new Float32Array(N * 3)

  // ---- portrait (halftone dots, luminance gives a little relief)
  for (let i = 0; i < N; i++) {
    pos[i * 3] = d[i * 4] * PORTRAIT_H
    pos[i * 3 + 1] = d[i * 4 + 1] * PORTRAIT_H - 0.45
    pos[i * 3 + 2] = (d[i * 4 + 3] - 0.4) * 0.9
    size[i] = d[i * 4 + 2]
    acc[i] = rnd() < 0.035 ? 1 : 0
  }

  // ---- shards: ~70 voronoi cells that crack outward from the face and fly apart
  const K = 70, seeds = []
  for (let k = 0; k < K; k++) { const i = Math.floor(rnd() * N); seeds.push([pos[i * 3], pos[i * 3 + 1]]) }
  const info = seeds.map(([x, y]) => {
    const dx = x - 0.0, dy = y - 0.5, dist = Math.hypot(dx, dy)
    const dir = new THREE.Vector3(dx * 1.1 + (rnd() - 0.5) * 1.2, dy * 1.1 + (rnd() - 0.5) * 1.2, 0.5 + rnd() * 0.9).normalize().multiplyScalar(0.7 + rnd() * 0.6)
    return { dist, dir, rot: (rnd() - 0.5) * 3 }
  })
  const maxD = Math.max(...info.map((s) => s.dist)) || 1
  for (let i = 0; i < N; i++) {
    let best = 0, bd = 1e9
    for (let k = 0; k < K; k++) { const dx = pos[i * 3] - seeds[k][0], dy = pos[i * 3 + 1] - seeds[k][1], q = dx * dx + dy * dy; if (q < bd) { bd = q; best = k } }
    const s = info[best]
    rand[i * 4] = s.dir.x + (rnd() - 0.5) * 0.3; rand[i * 4 + 1] = s.dir.y + (rnd() - 0.5) * 0.3; rand[i * 4 + 2] = s.dir.z + (rnd() - 0.5) * 0.3
    rand[i * 4 + 3] = Math.min(1, Math.max(0, (s.dist / maxD) * 0.78 + (rnd() - 0.5) * 0.12))
    shard[i * 3] = seeds[best][0]; shard[i * 3 + 1] = seeds[best][1]; shard[i * 3 + 2] = s.rot
  }

  // ---- tunnel: three intertwined strands + a bright ring at every station
  const order = Array.from({ length: N }, (_, i) => i)
  for (let i = N - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [order[i], order[j]] = [order[j], order[i]] }
  for (let i = 0; i < N; i++) {
    const j = order[i], u = j / N
    let x, y, z
    if (j % 16 === 0) {
      const a = rnd() * Math.PI * 2, st = Math.floor(rnd() * 5), r = 4.9 + (rnd() - 0.5) * 0.2
      x = Math.cos(a) * r; y = Math.sin(a) * r; z = STATION_Z[st] + (rnd() - 0.5) * 0.35
    } else {
      const k = j % 3, a = (u * 24 + k / 3) * Math.PI * 2, r = 3.3 + rnd() * 0.55 + Math.sin(u * 60) * 0.25
      x = Math.cos(a) * r; y = Math.sin(a) * r; z = 8 - u * 128 + (rnd() - 0.5) * 0.5
    }
    hel.set([x, y, z], i * 3)
  }

  // ---- sphere
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = Math.PI * (3 - Math.sqrt(5)) * i, R = 4.3 + (rnd() - 0.5) * 0.35
    sph.set([Math.cos(th) * r * R, y * R, Math.sin(th) * r * R], i * 3)
  }

  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.setAttribute('aHelix', new THREE.BufferAttribute(hel, 3))
  g.setAttribute('aSphere', new THREE.BufferAttribute(sph, 3))
  g.setAttribute('aRand', new THREE.BufferAttribute(rand, 4))
  g.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
  g.setAttribute('aAcc', new THREE.BufferAttribute(acc, 1))
  g.setAttribute('aShard', new THREE.BufferAttribute(shard, 3))
  return g
}

const vert = /* glsl */ `
attribute vec3 aHelix; attribute vec3 aSphere; attribute vec4 aRand; attribute float aSize; attribute float aAcc; attribute vec3 aShard;
uniform float uT1, uT2, uT3, uTime, uScale, uAspect, uInv;
uniform vec3 uTrail[${TRAIL}]; uniform vec3 uClick; uniform vec3 uFinal; uniform vec3 uSphC;
varying float vAlpha; varying float vAcc;
const float PI = 3.14159265;
float ease(float x) { return x * x * (3.0 - 2.0 * x); }
float per(float t, float d) { return ease(clamp((t - d * 0.5) / 0.5, 0.0, 1.0)); }
vec2 rot(vec2 v, float a) { float c = cos(a), s = sin(a); return vec2(c * v.x - s * v.y, s * v.x + c * v.y); }
void main() {
  vec3 A = position;
  float t1 = per(uT1, aRand.w), t2 = per(uT2, aRand.w), t3 = per(uT3, aRand.w);
  float b1 = sin(PI * t1), b2 = sin(PI * t2), b3 = sin(PI * t3);
  vec3 A1 = A; A1.xy = aShard.xy + rot(A.xy - aShard.xy, aShard.z * b1 * 2.0);
  vec3 F = vec3(aShard.xy + uFinal.xy + rot(A.xy - aShard.xy, aShard.z * b3 * 2.0), A.z + uFinal.z);
  float sp = uTime * 0.2;
  vec3 S0 = vec3(aSphere.x * cos(sp) + aSphere.z * sin(sp), aSphere.y, -aSphere.x * sin(sp) + aSphere.z * cos(sp)) + uSphC;
  vec3 p = mix(A1, aHelix, t1);
  p = mix(p, S0, t2);
  p = mix(p, F, t3);
  p += aRand.xyz * (b1 * 12.0 + b2 * 6.0 + b3 * 8.0);
  p.xy += vec2(sin(uTime * 0.7 + aRand.x * 40.0), cos(uTime * 0.6 + aRand.y * 40.0)) * 0.012;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vec4 clip = projectionMatrix * mv;
  vec2 ndc = clip.xy / clip.w;
  vec2 off = vec2(0.0);
  for (int i = 0; i < ${TRAIL}; i++) {
    vec3 m = uTrail[i];
    vec2 d = ndc - m.xy; d.x *= uAspect;
    float r = length(d);
    off += normalize(d + vec2(1e-4)) * exp(-r * r * 12.0) * m.z * 0.20;
  }
  float age = uTime - uClick.z;
  if (age > 0.0 && age < 2.2) {
    vec2 d = ndc - uClick.xy; d.x *= uAspect;
    float r = length(d);
    off += normalize(d + vec2(1e-4)) * exp(-pow((r - age) * 5.0, 2.0)) * (1.0 - age / 2.2) * 0.30;
  }
  off.x /= uAspect;
  clip.xy += off * clip.w;
  gl_Position = clip;

  float stage = mix(1.0, 1.5, t1); stage = mix(stage, 1.0, t2); stage = mix(stage, 1.0, t3);
  float s0 = mix(aSize, clamp(1.08 - aSize, 0.1, 1.0), uInv);
  float sz = mix(s0, max(s0, 0.5), clamp(t1 + t2 - 2.0 * t3, 0.0, 1.0));
  float dia = 0.0385 * stage * sqrt(max(sz, 0.1));
  gl_PointSize = clamp(dia * uScale / (-mv.z), 1.3, 8.0);
  vAlpha = clamp(1.3 - (-mv.z) / 80.0, 0.14, 1.0) * smoothstep(1.0, 5.0, -mv.z);
  vAlpha *= mix(1.0, 0.5, t2 * (1.0 - t3));
  vAcc = aAcc;
}`

const frag = /* glsl */ `
uniform vec3 uColor; uniform vec3 uAccent;
varying float vAlpha; varying float vAcc;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = 1.0 - smoothstep(0.36, 0.5, d);
  if (a < 0.01) discard;
  gl_FragColor = vec4(mix(uColor, uAccent, vAcc), a * vAlpha);
  #include <colorspace_fragment>
}`

export default function ParticleField() {
  const { gl, camera, size } = useThree()
  const geo = useMemo(build, [])
  const trail = useRef(Array.from({ length: TRAIL }, () => new THREE.Vector3(0, 0, 0)))
  const last = useRef({ x: 0, y: 0, moved: 0 })
  const click = useRef(new THREE.Vector3(0, 0, -10))
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: vert, fragmentShader: frag, transparent: true, depthWrite: false, depthTest: false, toneMapped: false,
    uniforms: {
      uInv: { value: 0 }, uT1: { value: 0 }, uT2: { value: 0 }, uT3: { value: 0 }, uTime: { value: 0 }, uScale: { value: 800 }, uAspect: { value: 1.6 },
      uTrail: { value: trail.current }, uClick: { value: click.current },
      uFinal: { value: new THREE.Vector3(...FINAL) }, uSphC: { value: new THREE.Vector3(...SPHERE_C) },
      uColor: { value: new THREE.Color() }, uAccent: { value: new THREE.Color() },
    },
  }), [])

  // click → shock wave (stored now, stamped with shader time on the next frame)
  const pending = useRef(null)
  useEffect(() => {
    const on = (e) => { if (!e.target.closest?.('button,a,input')) pending.current = [(e.clientX / innerWidth) * 2 - 1, -((e.clientY / innerHeight) * 2 - 1)] }
    window.addEventListener('pointerdown', on)
    return () => window.removeEventListener('pointerdown', on)
  }, [])

  useFrame(({ clock }) => {
    const u = mat.uniforms, p = S.p, tr = trail.current
    u.uT1.value = lin(p, T1); u.uT2.value = lin(p, T2); u.uT3.value = lin(p, T3)
    u.uTime.value = clock.elapsedTime
    const buf = gl.getDrawingBufferSize(new THREE.Vector2())
    u.uScale.value = buf.y / (2 * Math.tan((camera.fov * Math.PI) / 360))
    u.uAspect.value = size.width / size.height
    u.uInv.value = T.bg.r > 0.5 ? 1 : 0
    u.uColor.value.copy(T.fg); u.uAccent.value.copy(T.fg).lerp(T.bg, 0.5)
    if (pending.current) { click.current.set(pending.current[0], pending.current[1], clock.elapsedTime); pending.current = null }

    // pointer: slot 0 = the cursor itself (holds the dots away while hovering), 1.. = a fading wake
    const mx = S.mouse.x, my = -S.mouse.y, l = last.current
    const speed = Math.hypot(mx - l.x, my - l.y)
    if (speed > 0.002) {
      l.moved = clock.elapsedTime
      for (let i = TRAIL - 1; i > 1; i--) tr[i].copy(tr[i - 1])
      tr[1].set(l.x, l.y, Math.min(1, 0.35 + speed * 25))
    }
    l.x = mx; l.y = my
    for (let i = 1; i < TRAIL; i++) tr[i].z *= 0.93
    const hovering = clock.elapsedTime - l.moved < 4 && (S.mouse.x !== 0 || S.mouse.y !== 0)
    tr[0].set(mx, my, hovering ? 0.65 : 0)
  })
  return <points geometry={geo} material={mat} frustumCulled={false} />
}
