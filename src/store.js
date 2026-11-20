import { create } from 'zustand'
import { applyTheme, loadTheme } from './theme'

export const useUI = create((set) => ({
  ready: false, setReady: () => set({ ready: true }),
  playing: false, setPlaying: (playing) => set({ playing }),
  cat: 'all', setCat: (cat) => set({ cat }),
  hover: null, setHover: (hover) => set({ hover }),
  toast: null, setToast: (toast) => set({ toast }),
  theme: loadTheme(),
  setTheme: (theme) => { applyTheme(theme); try { localStorage.setItem('aj-theme3', theme) } catch {} ; set({ theme }) },
}))
