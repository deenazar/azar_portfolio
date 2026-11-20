import * as THREE from 'three'

// Pure black & white. "Black" = white dots on black, "White" = black dots on paper.
export const THEMES = {
  black: { label: 'Black', bg: [8, 8, 8], panel: [14, 14, 14], panel2: [26, 26, 26], fg: [240, 240, 238], swatch: '#080808' },
  white: { label: 'White', bg: [240, 240, 236], panel: [232, 232, 228], panel2: [218, 218, 212], fg: [10, 10, 10], swatch: '#F0F0EC' },
}
export const T = { bg: new THREE.Color(), fg: new THREE.Color() }

export function applyTheme(key) {
  const t = THEMES[key] || THEMES.black
  const r = document.documentElement.style
  ;['bg', 'panel', 'panel2', 'fg'].forEach((n) => r.setProperty('--' + n, t[n].join(' ')))
  r.setProperty('--accent', t.fg.join(' '))
  const set = (c, a) => c.setRGB(a[0] / 255, a[1] / 255, a[2] / 255, THREE.SRGBColorSpace)
  set(T.bg, t.bg); set(T.fg, t.fg)
  document.documentElement.style.colorScheme = key === 'white' ? 'light' : 'dark'
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', `rgb(${t.bg.join(',')})`)
}
export const loadTheme = () => { try { const v = localStorage.getItem('aj-theme3'); return THEMES[v] ? v : 'black' } catch { return 'black' } }
