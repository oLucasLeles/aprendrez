import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Fonte Inter, servida pelo próprio app (os arquivos entram no build)
import '@fontsource-variable/inter'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
