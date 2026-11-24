import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import logoUrl from '../assets/logo.svg'
import { applyTheme, loadThemePreference, saveThemePreference, type ThemePreference } from '../theme/theme'

// Barra do topo, em todas as telas: o nome do app (leva ao início) e o seletor de tema.
// Referências do Mobbin: o seletor de três ícones da Vercel (sistema · claro · escuro) e o
// "Light / Dark / System" do Sketch.

const OPTIONS: { value: ThemePreference; label: string; icon: ReactNode }[] = [
  {
    value: 'system',
    label: 'Tema do sistema',
    icon: (
      <>
        <rect x="2" y="3" width="12" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 14h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </>
    ),
  },
  {
    value: 'light',
    label: 'Tema claro',
    icon: (
      <>
        <circle cx="8" cy="8" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M3.4 12.6l1-1M11.6 4.4l1-1"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </>
    ),
  },
  {
    value: 'dark',
    label: 'Tema escuro',
    icon: <path d="M13 9.5A5.5 5.5 0 0 1 6.5 3a5.5 5.5 0 1 0 6.5 6.5Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />,
  },
]

function ThemeSwitcher() {
  const [preference, setPreference] = useState<ThemePreference>(() => loadThemePreference())

  // Aplica o tema sempre que a escolha muda. Em "sistema", acompanha o sistema ao vivo.
  useEffect(() => {
    applyTheme(preference)
    if (preference !== 'system') return
    const media = window.matchMedia?.('(prefers-color-scheme: dark)')
    const onChange = () => applyTheme('system')
    media?.addEventListener('change', onChange)
    return () => media?.removeEventListener('change', onChange)
  }, [preference])

  function choose(value: ThemePreference) {
    setPreference(value)
    saveThemePreference(value)
  }

  return (
    <div className="theme-switcher" role="group" aria-label="Tema">
      {OPTIONS.map(({ value, label, icon }) => (
        <button
          key={value}
          type="button"
          className="theme-switcher-button"
          aria-label={label}
          title={label}
          aria-pressed={preference === value}
          onClick={() => choose(value)}
        >
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            {icon}
          </svg>
        </button>
      ))}
    </div>
  )
}

function Header() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link to="/" className="site-header-logo">
          {/* Logo desenhado pelo dono do projeto no Figma. É decorativo: o nome ao lado já diz tudo. */}
          <img src={logoUrl} alt="" width="24" height="24" className="site-header-logo-mark" />
          Aprendrez
        </Link>
        <ThemeSwitcher />
      </div>
    </header>
  )
}

export default Header
