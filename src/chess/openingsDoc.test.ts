// @vitest-environment node
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { generateOpeningsDoc } from './openingsDoc'
import type { Opening, OpeningNode } from './openingTree'

// ---------------------------------------------------------------------------
// 1. O arquivo docs/ABERTURAS.md precisa estar em dia com o conteúdo
// ---------------------------------------------------------------------------
const contentModules = import.meta.glob<{ default: Opening }>('../content/openings/*.ts', {
  eager: true,
})
const realOpenings = Object.entries(contentModules)
  .filter(([path]) => !path.endsWith('/index.ts') && !path.endsWith('.test.ts'))
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, module]) => module.default)

describe('docs/ABERTURAS.md', () => {
  it('está atualizado em relação ao conteúdo (se falhar, rode: npm run docs:aberturas)', () => {
    const onDisk = readFileSync(new URL('../../docs/ABERTURAS.md', import.meta.url), 'utf8')
    // Ignora diferenças de fim de linha entre Windows (CRLF) e o resto (LF).
    expect(onDisk.replace(/\r\n/g, '\n')).toBe(generateOpeningsDoc(realOpenings))
  })

  it('contém a Italiana com cor, nível, tipo, linha principal e variações em português', () => {
    const doc = generateOpeningsDoc(realOpenings)
    expect(doc).toContain('## Italiana (Giuoco Piano)')
    expect(doc).toContain('**Cor:** Brancas')
    expect(doc).toContain('**Nível:** 1 · Primeiros passos')
    expect(doc).toContain('**Tipo:** Linha fixa')
    expect(doc).toContain('`1. e4 e5 2. Cf3 Cc6 3. Bc4 Bc5')
    expect(doc).toContain('#### Pretas jogam d6 cedo')
  })
})

// ---------------------------------------------------------------------------
// 2. Comportamento do gerador com aberturas de exemplo (só para os testes)
// ---------------------------------------------------------------------------
function opponent(san: string, children: OpeningNode[] = [], variationName?: string): OpeningNode {
  return { san, by: 'opponent', children, ...(variationName ? { variationName } : {}) }
}
function user(san: string, children: OpeningNode[] = [], explanation = `Porque ${san}.`): OpeningNode {
  return { san, by: 'user', explanation, hint: `Dica de ${san}.`, children }
}

const blackSystem: Opening = {
  id: 'exemplo',
  name: 'Exemplo de pretas',
  lichessName: 'Exemplo',
  color: 'black',
  level: 2,
  kind: 'system',
  assumedFirstMove: 'd4',
  idea: 'Ideia de exemplo.',
  keyIdeas: ['Uma ideia-chave.'],
  tree: [
    opponent('d4', [
      user('d5', [
        opponent('Nf3', [
          // Duas ordens aceitas para a pessoa: a principal (Nf6) e uma alternativa (e6).
          user('Nf6', [opponent('Bf4')]),
          user('e6', [opponent('Bf4')], 'Também chega à mesma estrutura, só em outra ordem.'),
        ]),
      ]),
    ]),
  ],
}

const whiteFixed: Opening = {
  ...blackSystem,
  id: 'exemplo-brancas',
  name: 'Exemplo de brancas',
  color: 'white',
  level: 1,
  kind: 'fixed',
  assumedFirstMove: null,
  tree: [user('Nf3', [opponent('d5')])],
}

describe('generateOpeningsDoc', () => {
  it('mostra a cor, o tipo, o lance assumido e a notação em português', () => {
    const doc = generateOpeningsDoc([blackSystem])
    expect(doc).toContain('**Cor:** Pretas')
    expect(doc).toContain('**Tipo:** Sistema')
    expect(doc).toContain('1. d4')
    expect(doc).toContain('`1. d4 d5 2. Cf3 Cf6 3. Bf4`')
    expect(doc).toContain('**2... Cf6**')
  })

  it('lista as alternativas aceitas, com a justificativa, só nos sistemas', () => {
    const doc = generateOpeningsDoc([blackSystem, whiteFixed])
    expect(doc).toContain('### Alternativas de ordem aceitas')
    expect(doc).toContain('também vale **2... e6**')
    expect(doc).toContain('Justificativa: Também chega à mesma estrutura, só em outra ordem.')
    // A linha fixa não tem essa seção: só a do sistema aparece, uma vez.
    expect(doc.match(/### Alternativas de ordem aceitas/g)).toHaveLength(1)
  })

  it('ordena pela trilha (nível 1 antes do nível 2) e termina com uma quebra de linha', () => {
    const doc = generateOpeningsDoc([blackSystem, whiteFixed])
    expect(doc.indexOf('## Exemplo de brancas')).toBeLessThan(doc.indexOf('## Exemplo de pretas'))
    expect(doc.endsWith('\n')).toBe(true)
    expect(doc.endsWith('\n\n')).toBe(false)
  })

  it('diz "Nenhuma." quando não há variações', () => {
    expect(generateOpeningsDoc([whiteFixed])).toMatch(/### Variações\n\nNenhuma\./)
  })
})
