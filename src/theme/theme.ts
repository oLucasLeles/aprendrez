// Tema claro/escuro (pedido do dono do projeto, 2026-11-22). Lógica pura + leitura e gravação
// da preferência no navegador. Não é "progresso": guarda só a escolha de aparência.
//
// Como funciona: o <html> ganha o atributo data-theme="light" ou "dark", e o tokens.css troca
// as cores dos papéis (superfície, texto, destaque…) conforme esse atributo.

export type ThemePreference = 'system' | 'light' | 'dark'
export type Theme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'aprendrez:tema'

/** O tema que vale de fato: a escolha da pessoa, ou o do sistema quando ela escolheu "sistema". */
export function resolveTheme(preference: ThemePreference, systemPrefersDark: boolean): Theme {
  if (preference === 'system') return systemPrefersDark ? 'dark' : 'light'
  return preference
}

function isPreference(value: unknown): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark'
}

/** Lê a preferência salva. Se não houver (ou o navegador bloquear), segue o sistema. */
export function loadThemePreference(storage: Pick<Storage, 'getItem'> | undefined = globalThis.localStorage): ThemePreference {
  try {
    const saved = storage?.getItem(THEME_STORAGE_KEY)
    return isPreference(saved) ? saved : 'system'
  } catch {
    return 'system'
  }
}

/** Grava a preferência. Se o navegador não deixar, o tema só não fica lembrado. */
export function saveThemePreference(
  preference: ThemePreference,
  storage: Pick<Storage, 'setItem'> | undefined = globalThis.localStorage,
): void {
  try {
    storage?.setItem(THEME_STORAGE_KEY, preference)
  } catch {
    // sem armazenamento: tudo bem, o tema vale só até fechar a página
  }
}

/** O sistema pede tema escuro? */
export function systemPrefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches === true
}

/** Aplica o tema no <html>. */
export function applyTheme(preference: ThemePreference): Theme {
  const theme = resolveTheme(preference, systemPrefersDark())
  document.documentElement.dataset.theme = theme
  return theme
}
