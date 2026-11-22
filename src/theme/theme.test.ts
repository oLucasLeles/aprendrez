import { describe, expect, it } from 'vitest'
import { loadThemePreference, resolveTheme, saveThemePreference, THEME_STORAGE_KEY } from './theme'

describe('resolveTheme', () => {
  it('"sistema" segue o sistema; claro e escuro valem como escolhidos', () => {
    expect(resolveTheme('system', true)).toBe('dark')
    expect(resolveTheme('system', false)).toBe('light')
    expect(resolveTheme('light', true)).toBe('light')
    expect(resolveTheme('dark', false)).toBe('dark')
  })
})

describe('preferência salva', () => {
  it('sem nada salvo, ou com valor estranho, vale "sistema"', () => {
    expect(loadThemePreference({ getItem: () => null })).toBe('system')
    expect(loadThemePreference({ getItem: () => 'roxo' })).toBe('system')
  })

  it('lê e grava a escolha', () => {
    const store = new Map<string, string>()
    const storage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) }
    saveThemePreference('dark', storage)
    expect(store.get(THEME_STORAGE_KEY)).toBe('dark')
    expect(loadThemePreference(storage)).toBe('dark')
  })

  it('se o navegador bloquear o armazenamento, nada quebra', () => {
    const broken = {
      getItem: () => {
        throw new Error('bloqueado')
      },
      setItem: () => {
        throw new Error('bloqueado')
      },
    }
    expect(loadThemePreference(broken)).toBe('system')
    expect(() => saveThemePreference('light', broken)).not.toThrow()
  })
})
