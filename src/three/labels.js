import * as THREE from 'three'
// canvas-drawn text for 3D sprites; redraws once the web fonts are loaded
export function textTex(draw, w, h, fonts = []) {
  const c = document.createElement('canvas'); c.width = w; c.height = h
  const g = c.getContext('2d')
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4
  const run = () => { g.clearRect(0, 0, w, h); draw(g, w, h); tex.needsUpdate = true }
  run()
  Promise.all(fonts.map((f) => document.fonts.load(f))).then(run).catch(() => {})
  return tex
}
