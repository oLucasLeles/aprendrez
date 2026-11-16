import { describe, expect, it } from 'vitest'
import {
  findNodePath,
  getMainLine,
  getMainLineMoves,
  getPathToNode,
  getVariations,
  type Opening,
  type OpeningNode,
} from './openingTree'

// Uma abertura de exemplo (só para os testes), jogada de pretas:
//   1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5   <- linha principal
//   1. e4 e5 2. Nf3 Nc6 3. Bb5       <- variação "Espanhola" (o adversário desvia)
//   1. e4 e5 2. Bc4                  <- variação "Abertura do Bispo"
//   1. e4 e5 2. Nf3 Nf6              <- alternativa da PESSOA (como num sistema): NÃO é variação
const alternativaDaPessoa: OpeningNode = {
  san: 'Nf6',
  by: 'user',
  explanation: 'Outra ordem aceita: ataca o peão de e4.',
  hint: 'Desenvolva um cavalo atacando o peão central das brancas.',
  children: [],
}

const espanhola: OpeningNode = {
  san: 'Bb5',
  by: 'opponent',
  variationName: 'Espanhola',
  children: [],
}

const aberturaDoBispo: OpeningNode = {
  san: 'Bc4',
  by: 'opponent',
  variationName: 'Abertura do Bispo',
  children: [],
}

const exampleOpening: Opening = {
  id: 'exemplo',
  name: 'Abertura de exemplo',
  lichessName: 'Italian Game: Giuoco Piano',
  color: 'black',
  level: 1,
  kind: 'fixed',
  assumedFirstMove: 'e4',
  idea: 'Só um exemplo para os testes.',
  keyIdeas: ['Ideia 1', 'Ideia 2'],
  tree: [
    {
      san: 'e4',
      by: 'opponent',
      children: [
        {
          san: 'e5',
          by: 'user',
          explanation: 'Ocupa o centro.',
          hint: 'Responda com o mesmo tipo de lance.',
          commonMistakes: [{ san: 'a6', explanation: 'Não ajuda no centro.' }],
          children: [
            {
              san: 'Nf3',
              by: 'opponent',
              children: [
                {
                  san: 'Nc6',
                  by: 'user',
                  explanation: 'Defende o peão de e5.',
                  hint: 'Defenda o peão ameaçado desenvolvendo uma peça.',
                  children: [
                    {
                      san: 'Bc4',
                      by: 'opponent',
                      children: [
                        {
                          san: 'Bc5',
                          by: 'user',
                          explanation: 'Espelha o desenvolvimento.',
                          hint: 'Desenvolva o bispo para uma diagonal ativa.',
                          children: [],
                        },
                      ],
                    },
                    espanhola,
                  ],
                },
                alternativaDaPessoa,
              ],
            },
            aberturaDoBispo,
          ],
        },
      ],
    },
  ],
}

describe('getMainLine', () => {
  it('segue sempre o primeiro filho até a folha', () => {
    expect(getMainLineMoves(exampleOpening)).toEqual(['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5'])
  })

  it('devolve os nós, não só os lances', () => {
    const line = getMainLine(exampleOpening)
    expect(line).toHaveLength(6)
    expect(line[1].by).toBe('user')
    expect(line[0]).toBe(exampleOpening.tree[0])
  })

  it('devolve uma lista vazia se a árvore estiver vazia', () => {
    expect(getMainLine({ ...exampleOpening, tree: [] })).toEqual([])
  })
})

describe('getVariations', () => {
  it('lista as variações na ordem em que aparecem na árvore', () => {
    const variations = getVariations(exampleOpening)
    expect(variations.map((variation) => variation.name)).toEqual([
      'Espanhola',
      'Abertura do Bispo',
    ])
  })

  it('só conta galhos do adversário que não são o primeiro filho', () => {
    // O "Nf6" é um segundo filho, mas é lance da pessoa: não entra.
    const variations = getVariations(exampleOpening)
    expect(variations.every((variation) => variation.deviation.by === 'opponent')).toBe(true)
    expect(variations.some((variation) => variation.deviation === alternativaDaPessoa)).toBe(false)
  })

  it('mostra o caminho até o desvio e a linha completa da variação', () => {
    const spanish = getVariations(exampleOpening).find(
      (variation) => variation.name === 'Espanhola',
    )
    expect(spanish?.deviation).toBe(espanhola)
    expect(spanish?.path.map((node) => node.san)).toEqual(['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'])
    expect(spanish?.line.map((node) => node.san)).toEqual(['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'])
  })

  it('devolve lista vazia quando não há variações', () => {
    const semVariacoes: Opening = {
      ...exampleOpening,
      tree: [{ san: 'e4', by: 'opponent', children: [] }],
    }
    expect(getVariations(semVariacoes)).toEqual([])
  })

  it('a linha da variação continua pela linha principal depois do desvio', () => {
    const comContinuacao: Opening = {
      ...exampleOpening,
      tree: [
        {
          san: 'e4',
          by: 'opponent',
          children: [
            { san: 'e5', by: 'user', children: [] },
            {
              san: 'c5',
              by: 'user',
              children: [],
            },
          ],
        },
        {
          san: 'd4',
          by: 'opponent',
          variationName: 'Peão da Dama',
          children: [
            { san: 'd5', by: 'user', children: [{ san: 'c4', by: 'opponent', children: [] }] },
          ],
        },
      ],
    }
    const [variation] = getVariations(comContinuacao)
    expect(variation.name).toBe('Peão da Dama')
    expect(variation.path.map((node) => node.san)).toEqual(['d4'])
    expect(variation.line.map((node) => node.san)).toEqual(['d4', 'd5', 'c4'])
  })
})

describe('getPathToNode', () => {
  it('devolve o caminho do primeiro lance até o nó', () => {
    const bc5 = getMainLine(exampleOpening)[5]
    const path = getPathToNode(exampleOpening, bc5)
    expect(path?.map((node) => node.san)).toEqual(['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5'])
  })

  it('acha nós que estão em galhos fora da linha principal', () => {
    const path = getPathToNode(exampleOpening, aberturaDoBispo)
    expect(path?.map((node) => node.san)).toEqual(['e4', 'e5', 'Bc4'])
  })

  it('devolve null para um nó que não pertence à árvore', () => {
    const forasteiro: OpeningNode = { san: 'd4', by: 'opponent', children: [] }
    expect(getPathToNode(exampleOpening, forasteiro)).toBeNull()
  })
})

describe('findNodePath', () => {
  it('segue uma lista de lances e devolve os nós percorridos', () => {
    const path = findNodePath(exampleOpening, ['e4', 'e5', 'Nf3', 'Nf6'])
    expect(path?.[3]).toBe(alternativaDaPessoa)
  })

  it('devolve null se algum lance não existir na árvore', () => {
    expect(findNodePath(exampleOpening, ['e4', 'c5'])).toBeNull()
  })

  it('devolve lista vazia para uma sequência vazia', () => {
    expect(findNodePath(exampleOpening, [])).toEqual([])
  })
})
