// @vitest-environment node
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// Confere o CREDITOS.md (F42): cada pacote de `dependencies` do package.json precisa
// aparecer lá com a licença que o pacote instalado declara.

function readJson(url: URL) {
  return JSON.parse(readFileSync(url, 'utf8')) as { dependencies?: Record<string, string>; license?: string }
}

const root = new URL('../', import.meta.url)
const creditsText = readFileSync(new URL('CREDITOS.md', root), 'utf8')

// Lê as linhas de tabela do tipo: | `pacote` | para que serve | LICENÇA |
function readPackageRows(text: string): Map<string, string> {
  const rows = new Map<string, string>()
  for (const line of text.split(/\r?\n/)) {
    const cells = line.split('|').map((cell) => cell.trim())
    // Uma linha de tabela começa e termina com "|", então a primeira e a última célula são vazias.
    if (cells.length < 5 || cells[0] !== '' || cells[cells.length - 1] !== '') continue
    const name = cells[1].match(/^`([^`]+)`$/)?.[1]
    if (name) rows.set(name, cells[cells.length - 2])
  }
  return rows
}

describe('CREDITOS.md', () => {
  const rows = readPackageRows(creditsText)
  const dependencies = Object.keys(readJson(new URL('package.json', root)).dependencies ?? {})

  it('lista cada pacote de dependencies do package.json', () => {
    const missing = dependencies.filter((name) => !rows.has(name))
    expect(missing, `Faltam no CREDITOS.md: ${missing.join(', ')}`).toEqual([])
  })

  it.each(dependencies)('a licença de %s confere com a do pacote instalado', (name) => {
    const installed = readJson(new URL(`node_modules/${name}/package.json`, root))
    expect(installed.license, `o pacote ${name} não declara licença`).toBeTruthy()
    expect(rows.get(name)).toBe(installed.license)
  })

  it('não lista pacotes que não estão mais em dependencies', () => {
    const extra = [...rows.keys()].filter((name) => !dependencies.includes(name))
    expect(extra, `Sobraram no CREDITOS.md: ${extra.join(', ')}`).toEqual([])
  })

  it('credita as peças, a fonte e a base de aberturas', () => {
    expect(creditsText).toContain('Colin M.L. Burnett')
    expect(creditsText).toContain('The Inter Project Authors')
    expect(creditsText).toContain('lichess-org/chess-openings')
  })
})
