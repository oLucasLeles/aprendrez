// @vitest-environment node
import { beforeAll, describe, expect, it } from 'vitest'
import { loadLichessOpenings, type LichessOpening } from './lichessOpenings'
import type { Opening, OpeningNode } from './openingTree'
import { validateOpening } from './validateOpening'

let lichess: LichessOpening[]
beforeAll(() => {
  lichess = loadLichessOpenings()
})

// ---------------------------------------------------------------------------
// 1. Todas as aberturas reais de src/content/openings/
// ---------------------------------------------------------------------------
// Cada arquivo da pasta exporta (export default) uma abertura. Quando alguém
// acrescentar um arquivo novo, ele entra aqui automaticamente.
const contentModules = import.meta.glob<{ default: Opening }>('../content/openings/*.ts', {
  eager: true,
})
const realOpenings = Object.entries(contentModules)
  .filter(([path]) => !path.endsWith('/index.ts') && !path.endsWith('.test.ts'))
  .map(([path, module]) => ({ path, opening: module.default }))

describe('conteúdo real das aberturas', () => {
  it('encontra os arquivos de conteúdo (cada um com export default)', () => {
    for (const { path, opening } of realOpenings) {
      expect(opening, `${path} precisa ter "export default" com a abertura`).toBeDefined()
    }
  })

  it.each(realOpenings.map(({ path, opening }) => [opening?.id ?? path, opening] as const))(
    'a abertura "%s" passa no validador',
    (_id, opening) => {
      expect(validateOpening(opening, lichess)).toEqual([])
    },
  )

  it('os ids das aberturas não se repetem', () => {
    const ids = realOpenings.map(({ opening }) => opening.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

// ---------------------------------------------------------------------------
// 2. O validador em si: uma abertura de exemplo válida e vários exemplos inválidos
// ---------------------------------------------------------------------------
// (Os exemplos inválidos existem só aqui, nos testes.)

/** Monta uma cadeia de nós a partir de uma lista de lances; brancas = pessoa. */
function chain(moves: string[], startPly = 0): OpeningNode {
  const [san, ...rest] = moves
  const isWhite = (startPly) % 2 === 0
  const node: OpeningNode = {
    san,
    by: isWhite ? 'user' : 'opponent',
    children: rest.length > 0 ? [chain(rest, startPly + 1)] : [],
  }
  if (node.by === 'user') {
    node.explanation = `Explicação do lance ${san}.`
    node.hint = `Dica para o lance ${san}.`
  }
  return node
}

/** Italiana de brancas, 6 lances de cada lado, com uma variação do adversário no lance 5. */
function validOpening(): Opening {
  const main = ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3', 'Nf6', 'd3', 'd6', 'O-O', 'O-O']
  const tree = chain(main)
  // Variação: depois de 5.d3 as pretas jogam 5...O-O em vez de 5...d6.
  const nodeD3 = findNode(tree, 'd3')
  nodeD3.children.push({
    san: 'O-O',
    by: 'opponent',
    variationName: 'Roque imediato',
    children: [],
  })
  return {
    id: 'italiana-teste',
    name: 'Italiana de teste',
    lichessName: 'Italian Game: Giuoco Piano',
    color: 'white',
    level: 1,
    kind: 'fixed',
    assumedFirstMove: null,
    idea: 'Exemplo.',
    keyIdeas: ['Um', 'Dois'],
    tree: [tree],
  }
}

function findNode(root: OpeningNode, san: string): OpeningNode {
  if (root.san === san) return root
  for (const child of root.children) {
    try {
      return findNode(child, san)
    } catch {
      // procura no próximo filho
    }
  }
  throw new Error(`nó ${san} não encontrado`)
}

describe('validateOpening', () => {
  it('aceita uma abertura válida', () => {
    expect(validateOpening(validOpening(), lichess)).toEqual([])
  })

  it('recusa um lance ilegal, dizendo qual e depois de quais lances', () => {
    const opening = validOpening()
    findNode(opening.tree[0], 'Nc6').san = 'Nc3' // cavalo preto não chega em c3
    const problems = validateOpening(opening, lichess)
    expect(problems.some((p) => p.includes('Lance ilegal: Nc3 não pode ser jogado depois de e4 e5 Nf3'))).toBe(true)
  })

  it('recusa uma linha que não bate com a base do Lichess', () => {
    const opening = validOpening()
    opening.lichessName = 'Ruy Lopez' // a linha é Italiana, não Espanhola
    const problems = validateOpening(opening, lichess)
    expect(problems.some((p) => p.includes('não começa com nenhuma entrada "Ruy Lopez"'))).toBe(true)
  })

  it('recusa um nome que não existe na base', () => {
    const opening = validOpening()
    opening.lichessName = 'Abertura Inventada'
    const problems = validateOpening(opening, lichess)
    expect(problems.some((p) => p.includes('não existe na base do Lichess'))).toBe(true)
  })

  it('recusa uma dica vazia', () => {
    const opening = validOpening()
    findNode(opening.tree[0], 'Bc4').hint = '   '
    const problems = validateOpening(opening, lichess)
    expect(problems.some((p) => p.includes('O lance Bc4') && p.includes('não tem dica'))).toBe(true)
  })

  it('recusa uma explicação ausente', () => {
    const opening = validOpening()
    delete findNode(opening.tree[0], 'c3').explanation
    const problems = validateOpening(opening, lichess)
    expect(problems.some((p) => p.includes('O lance c3') && p.includes('não tem explicação'))).toBe(true)
  })

  it('recusa uma alternativa da pessoa em linha fixa', () => {
    const opening = validOpening()
    findNode(opening.tree[0], 'Nc6').children.push({
      san: 'd3',
      by: 'user',
      explanation: 'Outra ordem.',
      hint: 'Prepare o centro.',
      children: [],
    })
    const problems = validateOpening(opening, lichess)
    expect(problems.some((p) => p.includes('Alternativa em linha fixa'))).toBe(true)
  })

  it('aceita a alternativa da pessoa em um sistema (se a linha bater com a base)', () => {
    const opening = validOpening()
    opening.kind = 'system'
    // 4.d3 em vez de 4.c3: ainda é Giuoco Piano? A linha precisa começar com 3...Bc5; 4.d3 Nf6 serve.
    const bc5 = findNode(opening.tree[0], 'Bc5')
    bc5.children.push(chain(['d3', 'Nf6'], 6))
    expect(validateOpening(opening, lichess)).toEqual([])
  })

  it('recusa um galho do adversário sem nome de variação', () => {
    const opening = validOpening()
    delete findNode(opening.tree[0], 'd3').children[1].variationName
    const problems = validateOpening(opening, lichess)
    expect(problems.some((p) => p.includes('não tem nome de variação'))).toBe(true)
  })

  it('recusa uma linha principal curta demais', () => {
    const opening = validOpening()
    findNode(opening.tree[0], 'd6').children = [] // corta a linha: 5 lances de cada lado
    const problems = validateOpening(opening, lichess)
    expect(problems.some((p) => p.includes('pelo menos 6 lances de cada lado'))).toBe(true)
  })

  it('recusa abertura sem variações e com variações demais', () => {
    const semVariacao = validOpening()
    findNode(semVariacao.tree[0], 'd3').children.pop()
    expect(validateOpening(semVariacao, lichess).some((p) => p.includes('de 1 a 2 variações, mas tem 0'))).toBe(true)

    const demais = validOpening()
    const d3 = findNode(demais.tree[0], 'd3')
    d3.children.push({ san: 'a6', by: 'opponent', variationName: 'Um', children: [] })
    d3.children.push({ san: 'h6', by: 'opponent', variationName: 'Dois', children: [] })
    expect(validateOpening(demais, lichess).some((p) => p.includes('de 1 a 2 variações, mas tem 3'))).toBe(true)
  })

  it('recusa lance escrito sem o xeque (forma canônica)', () => {
    const opening = validOpening()
    opening.tree = [chain(['e4', 'f5', 'Qh5'])] // Qh5 dá xeque, então o certo é "Qh5+"
    const problems = validateOpening(opening, lichess)
    expect(problems.some((p) => p.includes('deveria ser escrito como Qh5+'))).toBe(true)
  })

  it('recusa quando de quem é o lance não bate com a vez', () => {
    const opening = validOpening()
    findNode(opening.tree[0], 'e5').by = 'user'
    const problems = validateOpening(opening, lichess)
    expect(problems.some((p) => p.includes('está marcado como "user", mas deveria ser "opponent"'))).toBe(true)
  })

  it('confere os erros comuns: precisam ser legais, diferentes dos ensinados e explicados', () => {
    const opening = validOpening()
    const nf3 = findNode(opening.tree[0], 'Nf3')
    nf3.commonMistakes = [
      { san: 'h3', explanation: 'Gasta tempo sem ajudar o centro.' }, // legal e fora do roteiro: ok
    ]
    expect(validateOpening(opening, lichess)).toEqual([])

    nf3.commonMistakes = [
      { san: 'Nf6', explanation: 'Cavalo branco não vai para f6.' }, // ilegal
      { san: 'Nf3', explanation: 'É o próprio lance ensinado.' }, // é o lance ensinado
      { san: 'd3', explanation: '' }, // sem explicação
    ]
    const problems = validateOpening(opening, lichess)
    expect(problems.some((p) => p.includes('Erro comum ilegal: Nf6'))).toBe(true)
    expect(problems.some((p) => p.includes('O erro comum Nf3') && p.includes('é um dos lances ensinados'))).toBe(true)
    expect(problems.some((p) => p.includes('O erro comum d3') && p.includes('não tem explicação'))).toBe(true)
  })

  it('numa abertura de pretas, o lance assumido precisa ser o primeiro nó', () => {
    const opening = validOpening()
    opening.color = 'black'
    opening.assumedFirstMove = 'd4'
    const problems = validateOpening(opening, lichess)
    expect(problems.some((p) => p.includes('O lance assumido (d4)'))).toBe(true)
  })
})
