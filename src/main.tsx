import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Fonte Geist, servida pelo próprio app (os arquivos entram no build)
import '@fontsource-variable/geist'
import './index.css'
import App from './App.tsx'
import { applyTheme, loadThemePreference } from './theme/theme'

// Aplica o tema (claro/escuro) antes de desenhar a página, para não piscar o tema errado.
applyTheme(loadThemePreference())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
