import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource/instrument-serif/400'
import '@fontsource/instrument-serif/400-italic'
import '@fontsource/inter-tight/400'
import '@fontsource/inter-tight/500'
import '@fontsource/geist-mono/400'
import '@fontsource/geist-mono/500'
import './index.css'
import App from './App'
import { applyTheme } from './theme'
import { useUI } from './store'

applyTheme(useUI.getState().theme)

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>)
