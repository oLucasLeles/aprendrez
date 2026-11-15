// @vitest-environment node
// Testes das regras de design: tokens existem, nenhuma cor fica escrita
// direto fora de tokens.css e o contraste das cores atende a WCAG AA.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  contrastRatio,
  findHardcodedColors,
  parseRootVariables,
  resolveVariable,
} from './designChecks'

const SRC_DIR = join(import.meta.dirname, '..')
const TOKENS_PATH = join(import.meta.dirname, 'tokens.css')
const tokensCss = readFileSync(TOKENS_PATH, 'utf8')
const variables = parseRootVariables(tokensCss)

/** Lista todos os arquivos de código e estilo dentro de src/. */
function listSourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return listSourceFiles(path)
    return /\.(css|ts|tsx|js|jsx|json)$/.test(name) ? [path] : []
  })
}

describe('tokens.css', () => {
  it('define cores, tipografia, espaçamentos e grid', () => {
    const required = [
      '--color-surface',
      '--color-surface-subtle',
      '--color-text',
      '--color-text-secondary',
      '--color-border',
      '--color-accent',
      '--color-on-accent',
      '--color-focus',
      '--color-board-light',
      '--color-board-dark',
      '--font-family-base',
      '--font-size-md',
      '--font-size-3xl',
      '--line-height-base',
      '--space-1',
      '--space-2',
      '--grid-columns',
      '--grid-gutter',
      '--grid-margin',
    ]
    for (const name of required) expect(variables.has(name), `falta ${name}`).toBe(true)
  })

  it('usa Inter como fonte principal', () => {
    expect(resolveVariable(variables, '--font-family-base')).toMatch(/^'Inter Variable'/)
  })

  it('tem espaçamentos em múltiplos de 8 px', () => {
    const spaces = [...variables.entries()].filter(([name]) => name.startsWith('--space-'))
    expect(spaces.length).toBeGreaterThan(0)
    for (const [name, value] of spaces) {
      const rem = value.match(/^([\d.]+)rem$/)
      expect(rem, `${name} deveria estar em rem`).not.toBeNull()
      expect((Number(rem![1]) * 16) % 8, `${name} = ${value} não é múltiplo de 8 px`).toBe(0)
    }
  })

  it('tem grid de 4 colunas no celular e 12 no desktop', () => {
    expect(variables.get('--grid-columns')).toBe('4')
    expect(tokensCss).toMatch(/@media \(min-width: 768px\)\s*\{\s*:root\s*\{\s*--grid-columns: 12;/)
  })
})

describe('cores escritas direto no código', () => {
  it('o detector encontra hex, rgb e hsl e ignora o que não é cor', () => {
    // Montados por partes para que este arquivo não contenha cores de verdade.
    const hash = '#'
    expect(findHardcodedColors(`color: ${hash}fff;`)).toHaveLength(1)
    expect(findHardcodedColors(`color: ${hash}c8102e;`)).toHaveLength(1)
    expect(findHardcodedColors(`fill="${hash}C8102E80"`)).toHaveLength(1)
    expect(findHardcodedColors(`color: ${'rgb'}(0, 0, 0);`)).toHaveLength(1)
    expect(findHardcodedColors(`color: ${'hsla'}(0, 0%, 0%, 0.5);`)).toHaveLength(1)
    expect(findHardcodedColors(`const id = '${hash}root'`)).toHaveLength(0)
    expect(findHardcodedColors(`'Qxf7${hash}'`)).toHaveLength(0)
    expect(findHardcodedColors(`color: var(--color-text);`)).toHaveLength(0)
  })

  it('nenhum arquivo de src/ além de tokens.css tem cor escrita direto', () => {
    const problems = listSourceFiles(SRC_DIR)
      .filter((path) => path !== TOKENS_PATH)
      .flatMap((path) =>
        findHardcodedColors(readFileSync(path, 'utf8')).map(
          ({ line, match }) => `${relative(SRC_DIR, path).split(sep).join('/')}:${line} → ${match}`,
        ),
      )
    expect(problems, 'Use as variáveis de src/styles/tokens.css').toEqual([])
  })
})

describe('contraste (WCAG AA, pelo menos 4,5:1)', () => {
  const color = (name: string) => resolveVariable(variables, name)

  // [texto, fundo]: os pares de cores que aparecem juntos na interface
  const pairs: [string, string][] = [
    ['--color-text', '--color-surface'],
    ['--color-text', '--color-surface-subtle'],
    ['--color-text', '--color-surface-muted'],
    ['--color-text-secondary', '--color-surface'],
    ['--color-text-secondary', '--color-surface-subtle'],
    ['--color-on-accent', '--color-accent'],
    ['--color-on-accent', '--color-accent-hover'],
    ['--color-accent', '--color-surface'],
    ['--color-text', '--color-accent-soft'],
  ]

  it.each(pairs)('%s sobre %s', (text, background) => {
    const ratio = contrastRatio(color(text), color(background))
    expect(ratio, `contraste de ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5)
  })

  it('a fórmula de contraste dá 21:1 entre preto e branco', () => {
    const hash = '#'
    expect(contrastRatio(`${hash}000000`, `${hash}ffffff`)).toBeCloseTo(21, 5)
    expect(contrastRatio(`${hash}777`, `${hash}777`)).toBeCloseTo(1, 5)
  })
})
