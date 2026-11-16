import { describe, expect, it } from 'vitest'
import italiana from '../content/openings/italiana'
import {
  chooseOpponentNode,
  createLesson,
  getExpectedMoves,
  getGuide,
  getOpponentOptions,
  getStatus,
  getTurn,
  isFinished,
  playOpponentMove,
  playOpponentTurn,
  playUserMove,
  undoOffScriptMove,
  type LessonState,
  type OpponentMode,
  type RandomSource,
} from './lessonEngine'
import { getMainLine, getVariations, type Opening, type OpeningNode } from './openingTree'

/** Joga um lance da pessoa e exige que esteja correto. */
function userPlays(state: LessonState, san: string): LessonState {
  const result = playUserMove(state, san)
  expect(result.kind, `o lance ${san} deveria estar certo`).toBe('correct')
  return result.state
}

describe('motor da lição: linha principal da Italiana', () => {
  it('percorre a linha principal inteira só com lances corretos', () => {
    const mainLine = getMainLine(italiana)
    let state = createLesson(italiana)
    expect(getStatus(state)).toBe('user-turn')

    for (const node of mainLine) {
      if (node.by === 'user') {
        expect(getTurn(state)).toBe('user')
        expect(getExpectedMoves(state)).toEqual([node.san])
        const result = playUserMove(state, node.san)
        expect(result.kind).toBe('correct')
        if (result.kind === 'correct') {
          expect(result.node).toBe(node)
          expect(result.explanation).toBe(node.explanation)
        }
        state = result.state
      } else {
        expect(getTurn(state)).toBe('opponent')
        expect(getExpectedMoves(state)).toEqual([])
        state = playOpponentMove(state)
      }
    }

    expect(isFinished(state)).toBe(true)
    expect(getTurn(state)).toBeNull()
    expect(state.moves).toEqual(mainLine.map((node) => node.san))
    expect(state.moves).toHaveLength(16)
  })

  it('aceita o lance por casas (de/para) e não só em SAN', () => {
    const result = playUserMove(createLesson(italiana), { from: 'e2', to: 'e4' })
    expect(result.kind).toBe('correct')
    expect(result.state.moves).toEqual(['e4'])
    expect(result.state.lastMove).toEqual({ from: 'e2', to: 'e4' })
  })

  it('não altera o estado antigo ao jogar (estado imutável)', () => {
    const start = createLesson(italiana)
    userPlays(start, 'e4')
    expect(start.moves).toEqual([])
    expect(start.path).toEqual([])
  })

  it('o adversário só joga na vez dele', () => {
    const start = createLesson(italiana)
    // É a vez da pessoa: pedir a resposta do adversário não muda nada.
    expect(playOpponentMove(start)).toBe(start)
    expect(getOpponentOptions(start)).toEqual([])
  })

  it('rejeita lance ilegal, sem mudar nada', () => {
    const start = createLesson(italiana)
    const result = playUserMove(start, { from: 'e2', to: 'e5' })
    expect(result.kind).toBe('rejected')
    expect(result.state).toBe(start)
    expect(playUserMove(start, 'Nf6').kind).toBe('rejected')
  })

  it('rejeita lance da pessoa fora da vez dela', () => {
    const afterE4 = userPlays(createLesson(italiana), 'e4')
    expect(getStatus(afterE4)).toBe('opponent-turn')
    expect(playUserMove(afterE4, 'd3').kind).toBe('rejected')
  })
})

describe('motor da lição: lance fora do roteiro', () => {
  it('o lance fica aplicado, gera a mensagem com a dica, e "Voltar" restaura a posição', () => {
    const afterE4E5 = playOpponentMove(userPlays(createLesson(italiana), 'e4'))
    const hint = italiana.tree[0].children[0].children[0].hint as string
    expect(hint).toBeTruthy()

    const result = playUserMove(afterE4E5, 'h3') // legal, mas não é o da abertura
    expect(result.kind).toBe('off-script')
    if (result.kind !== 'off-script') return

    // O lance fica no tabuleiro.
    expect(result.state.moves).toEqual(['e4', 'e5', 'h3'])
    expect(result.state.fen).not.toBe(afterE4E5.fen)
    expect(result.state.lastMove).toEqual({ from: 'h2', to: 'h3' })
    // A linha da árvore não avançou.
    expect(result.state.path).toBe(afterE4E5.path)
    // Mensagem genérica com a dica daquele momento.
    expect(result.isCommonMistake).toBe(false)
    expect(result.message).toContain('possível')
    expect(result.message).toContain(hint)
    expect(getStatus(result.state)).toBe('off-script')
    expect(getTurn(result.state)).toBeNull()
    expect(result.state.offScript?.message).toBe(result.message)

    // Enquanto o lance não é desfeito, a pessoa não joga mais nada.
    expect(playUserMove(result.state, 'Nf3').kind).toBe('rejected')
    expect(getGuide(result.state)).toBeNull()

    // "Voltar" restaura a posição anterior.
    const undone = undoOffScriptMove(result.state)
    expect(undone.fen).toBe(afterE4E5.fen)
    expect(undone.moves).toEqual(['e4', 'e5'])
    expect(undone.lastMove).toEqual(afterE4E5.lastMove)
    expect(undone.offScript).toBeNull()
    expect(getStatus(undone)).toBe('user-turn')

    // E a pessoa pode tentar de novo e acertar.
    expect(playUserMove(undone, 'Nf3').kind).toBe('correct')
  })

  it('"Voltar" sem lance fora do roteiro não faz nada', () => {
    const state = createLesson(italiana)
    expect(undoOffScriptMove(state)).toBe(state)
  })

  it('não há limite de tentativas: dá para errar e voltar várias vezes', () => {
    let state = createLesson(italiana)
    for (let i = 0; i < 5; i++) {
      const wrong = playUserMove(state, 'h3')
      expect(wrong.kind).toBe('off-script')
      state = undoOffScriptMove(wrong.state)
      expect(state.moves).toEqual([])
    }
    expect(playUserMove(state, 'e4').kind).toBe('correct')
  })

  it('um erro comum cadastrado gera a explicação específica dele', () => {
    const start = createLesson(italiana)
    const mistake = italiana.tree[0].commonMistakes?.[0]
    expect(mistake?.san).toBe('a4')

    const result = playUserMove(start, 'a4')
    expect(result.kind).toBe('off-script')
    if (result.kind !== 'off-script') return
    expect(result.isCommonMistake).toBe(true)
    expect(result.message).toBe(mistake?.explanation)
    expect(result.state.offScript?.isCommonMistake).toBe(true)
  })

  it('todos os erros comuns da Italiana viram a explicação deles na posição certa', () => {
    // Anda pela linha principal e, em cada lance da pessoa, testa os erros comuns.
    let state = createLesson(italiana)
    let checked = 0
    for (const node of getMainLine(italiana)) {
      if (node.by === 'opponent') {
        state = playOpponentMove(state)
        continue
      }
      for (const mistake of node.commonMistakes ?? []) {
        const result = playUserMove(state, mistake.san)
        expect(result.kind).toBe('off-script')
        if (result.kind === 'off-script') expect(result.message).toBe(mistake.explanation)
        checked++
      }
      state = userPlays(state, node.san)
    }
    expect(checked).toBeGreaterThan(0)
  })
})

describe('motor da lição: "Ver lance" (guia)', () => {
  it('entrega a peça e a casa de destino do lance esperado', () => {
    let state = createLesson(italiana)
    expect(getGuide(state)).toEqual({ from: 'e2', to: 'e4', san: 'e4' })
    state = playOpponentMove(userPlays(state, 'e4'))
    expect(getGuide(state)).toEqual({ from: 'g1', to: 'f3', san: 'Nf3' })
  })

  it('não há guia na vez do adversário nem no fim da linha', () => {
    const afterE4 = userPlays(createLesson(italiana), 'e4')
    expect(getGuide(afterE4)).toBeNull()
  })

  it('o guia do roque aponta a casa do rei (O-O: e1 para g1)', () => {
    let state = createLesson(italiana)
    for (const node of getMainLine(italiana)) {
      if (node.san === 'O-O' && node.by === 'user') break
      state = node.by === 'user' ? userPlays(state, node.san) : playOpponentMove(state)
    }
    expect(getGuide(state)).toEqual({ from: 'e1', to: 'g1', san: 'O-O' })
  })
})

describe('motor da lição: aberturas de pretas', () => {
  // Abertura de exemplo só para os testes: o adversário (brancas) abre e a pessoa responde.
  const reply: OpeningNode = {
    san: 'e5',
    by: 'user',
    explanation: 'Ocupa o centro.',
    hint: 'Responda ocupando o centro com o peão do rei.',
    children: [],
  }
  const blackOpening: Opening = {
    id: 'pretas-teste',
    name: 'Pretas de teste',
    lichessName: 'King\'s Pawn Game',
    color: 'black',
    level: 1,
    kind: 'fixed',
    assumedFirstMove: 'e4',
    idea: 'Ideia.',
    keyIdeas: ['a', 'b'],
    tree: [{ san: 'e4', by: 'opponent', children: [reply] }],
  }

  it('começa na vez do adversário (o app joga 1.e4) e depois é a vez da pessoa', () => {
    let state = createLesson(blackOpening)
    expect(getStatus(state)).toBe('opponent-turn')
    state = playOpponentMove(state)
    expect(state.moves).toEqual(['e4'])
    expect(getStatus(state)).toBe('user-turn')
    expect(getGuide(state)).toEqual({ from: 'e7', to: 'e5', san: 'e5' })
    state = userPlays(state, 'e5')
    expect(isFinished(state)).toBe(true)
  })
})

describe('motor da lição: sistemas (alternativas aceitas)', () => {
  // Sistema de exemplo (só para os testes), jogado de brancas:
  //   1.d4 d5 e então a pessoa pode jogar 2.Bf4 (principal) ou 2.Nf3 (alternativa de ordem).
  //   Depois de 2.Bf4 Nf6 vem 3.e3; depois de 2.Nf3 Nf6 vem 3.Bf4.
  const system: Opening = {
    id: 'sistema-teste',
    name: 'Sistema de teste',
    lichessName: 'Queen\'s Pawn Game',
    color: 'white',
    level: 1,
    kind: 'system',
    assumedFirstMove: null,
    idea: 'Ideia.',
    keyIdeas: ['a', 'b'],
    tree: [
      {
        san: 'd4',
        by: 'user',
        explanation: 'Ocupa o centro.',
        hint: 'Avance o peão da dama.',
        children: [
          {
            san: 'd5',
            by: 'opponent',
            children: [
              {
                san: 'Bf4',
                by: 'user',
                explanation: 'O bispo sai antes de fechar o caminho.',
                hint: 'Desenvolva o bispo do lado da dama, fora da corrente de peões.',
                children: [
                  {
                    san: 'Nf6',
                    by: 'opponent',
                    children: [
                      {
                        san: 'e3',
                        by: 'user',
                        explanation: 'Abre o caminho do bispo do rei.',
                        hint: 'Avance o peão do rei uma casa.',
                        children: [],
                      },
                    ],
                  },
                ],
              },
              {
                san: 'Nf3',
                by: 'user',
                explanation: 'Ordem alternativa: o cavalo sai primeiro e o bispo vem depois.',
                hint: 'Desenvolva o cavalo do lado do rei.',
                children: [
                  {
                    san: 'Nf6',
                    by: 'opponent',
                    children: [
                      {
                        san: 'Bf4',
                        by: 'user',
                        explanation: 'Chega à mesma estrutura pela outra ordem.',
                        hint: 'Desenvolva o bispo do lado da dama.',
                        children: [],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  }

  it('aceita as duas ordens e segue pelo galho escolhido', () => {
    const afterD4D5 = playOpponentMove(userPlays(createLesson(system), 'd4'))
    expect(getExpectedMoves(afterD4D5)).toEqual(['Bf4', 'Nf3'])
    // O guia usa o primeiro (o da linha principal).
    expect(getGuide(afterD4D5)).toEqual({ from: 'c1', to: 'f4', san: 'Bf4' })

    // Pela alternativa: 2.Nf3 Nf6 3.Bf4.
    let state = playOpponentMove(userPlays(afterD4D5, 'Nf3'))
    expect(getExpectedMoves(state)).toEqual(['Bf4'])
    state = userPlays(state, 'Bf4')
    expect(isFinished(state)).toBe(true)
    expect(state.moves).toEqual(['d4', 'd5', 'Nf3', 'Nf6', 'Bf4'])

    // Pela principal: 2.Bf4 Nf6 3.e3. Aqui o "e3" é o esperado, não o "Nf3".
    state = playOpponentMove(userPlays(afterD4D5, 'Bf4'))
    expect(getExpectedMoves(state)).toEqual(['e3'])
    expect(playUserMove(state, 'Nf3').kind).toBe('off-script')
  })

  it('um lance que não está entre as alternativas continua fora do roteiro', () => {
    const afterD4D5 = playOpponentMove(userPlays(createLesson(system), 'd4'))
    const result = playUserMove(afterD4D5, 'e3')
    expect(result.kind).toBe('off-script')
    if (result.kind === 'off-script') {
      // A dica mostrada é a do lance principal daquele momento.
      expect(result.message).toContain('Desenvolva o bispo do lado da dama')
    }
  })
})

// ---------------------------------------------------------------------------
// F16 · Escolha de galhos do adversário
// ---------------------------------------------------------------------------

/** Joga a lição inteira: a pessoa segue o roteiro e o adversário responde pelo `mode`. */
function playWholeLine(opening: Opening, mode: OpponentMode): LessonState {
  let state = createLesson(opening)
  for (let guard = 0; guard < 200 && !isFinished(state); guard++) {
    if (getStatus(state) === 'user-turn') {
      const [san] = getExpectedMoves(state)
      state = userPlays(state, san)
    } else {
      state = playOpponentTurn(state, mode)
    }
  }
  return state
}

/** Anda pela linha principal até a primeira vez em que o adversário tem mais de um galho. */
function stateAtFirstFork(): LessonState {
  const variation = getVariations(italiana)[0]
  let state = createLesson(italiana)
  while (state.path.length < variation.path.length - 1) {
    state =
      getStatus(state) === 'user-turn'
        ? userPlays(state, getExpectedMoves(state)[0])
        : playOpponentMove(state)
  }
  return state
}

/** Fonte de acaso previsível: devolve os valores da lista, um por vez (e repete o último). */
function fakeRandom(values: number[]): RandomSource {
  let i = 0
  return () => values[Math.min(i++, values.length - 1)]
}

const mainLineSans = getMainLine(italiana).map((node) => node.san)

describe('motor da lição: modo caminho (linha principal ou variação)', () => {
  const variations = getVariations(italiana)

  it('a Italiana tem variações para testar', () => {
    expect(variations.length).toBeGreaterThanOrEqual(2)
  })

  it('seguindo a linha principal, o adversário joga sempre o primeiro galho', () => {
    const final = playWholeLine(italiana, { kind: 'path', line: getMainLine(italiana) })
    expect(final.moves).toEqual(mainLineSans)
  })

  it.each(variations.map((variation) => [variation.name, variation] as const))(
    'seguindo a variação "%s", o adversário joga exatamente os lances dela',
    (_name, variation) => {
      const final = playWholeLine(italiana, { kind: 'path', line: variation.line })
      expect(final.moves).toEqual(variation.line.map((node) => node.san))
      // Garante que NÃO caiu na linha principal.
      expect(final.moves).not.toEqual(mainLineSans)
      expect(isFinished(final)).toBe(true)
    },
  )

  it('no ponto de desvio o adversário escolhe o galho da variação, e não o da linha principal', () => {
    const variation = getVariations(italiana)[0]
    const mode: OpponentMode = { kind: 'path', line: variation.line }
    const fork = stateAtFirstFork()
    expect(getStatus(fork)).toBe('opponent-turn')
    expect(getOpponentOptions(fork).length).toBeGreaterThan(1)
    expect(chooseOpponentNode(fork, mode)).toBe(variation.deviation)
    expect(chooseOpponentNode(fork, mode)).not.toBe(getOpponentOptions(fork)[0])
  })

  it('fora da vez do adversário, não escolhe nada e não muda o estado', () => {
    const start = createLesson(italiana) // vez da pessoa
    const mode: OpponentMode = { kind: 'path', line: getMainLine(italiana) }
    expect(chooseOpponentNode(start, mode)).toBeNull()
    expect(playOpponentTurn(start, mode)).toBe(start)
  })

  it('se a linha pedida não combina com a posição, cai para a linha principal em vez de travar', () => {
    // Uma linha vazia nunca tem "o nó certo": o adversário joga o primeiro galho.
    const afterE4 = userPlays(createLesson(italiana), 'e4')
    const next = playOpponentTurn(afterE4, { kind: 'path', line: [] })
    expect(next.moves).toEqual(['e4', 'e5'])
  })
})

describe('motor da lição: modo Desafio (acaso controlado)', () => {
  it('cada galho pode ser escolhido, conforme o número sorteado', () => {
    const fork = stateAtFirstFork()
    const options = getOpponentOptions(fork)
    expect(options.length).toBeGreaterThan(1)

    options.forEach((expected, index) => {
      // O meio da "fatia" de cada galho: (index + 0,5) sobre o total.
      const random = fakeRandom([(index + 0.5) / options.length])
      expect(chooseOpponentNode(fork, { kind: 'challenge', random })).toBe(expected)
    })
  })

  it('os extremos do sorteio escolhem o primeiro e o último galho; 1 exato não estoura', () => {
    const fork = stateAtFirstFork()
    const options = getOpponentOptions(fork)
    const pick = (value: number) =>
      chooseOpponentNode(fork, { kind: 'challenge', random: () => value })
    expect(pick(0)).toBe(options[0])
    expect(pick(0.999999)).toBe(options[options.length - 1])
    expect(pick(1)).toBe(options[options.length - 1])
  })

  it('com acaso sempre 0 o Desafio vira a linha principal; com acaso quase 1, outra linha', () => {
    const main = playWholeLine(italiana, { kind: 'challenge', random: () => 0 })
    expect(main.moves).toEqual(mainLineSans)

    const other = playWholeLine(italiana, { kind: 'challenge', random: () => 0.999999 })
    expect(isFinished(other)).toBe(true)
    expect(other.moves).not.toEqual(mainLineSans)
  })

  it('a linha principal e toda variação podem ser sorteadas, e a partida sempre chega a uma folha', () => {
    const seen = new Set<string>()
    // Várias partidas, cada uma com um acaso "de mentira" que sempre dá a mesma sequência
    // (gerador simples com semente fixa). Assim o teste é previsível, mas passa por
    // combinações diferentes de galhos. Cada partida tem de terminar numa folha.
    for (let seed = 1; seed <= 60; seed++) {
      let x = seed
      const random: RandomSource = () => {
        x = (x * 1664525 + 1013904223) % 4294967296
        return x / 4294967296
      }
      const final = playWholeLine(italiana, { kind: 'challenge', random })
      expect(isFinished(final)).toBe(true)
      expect(final.path[final.path.length - 1].children).toEqual([])
      seen.add(final.moves.join(' '))
    }
    const expected = [getMainLine(italiana), ...getVariations(italiana).map((v) => v.line)].map(
      (line) => line.map((node) => node.san).join(' '),
    )
    for (const line of expected) expect(seen).toContain(line)
  })

  it('um acaso que alterna valores também sempre termina numa folha', () => {
    const final = playWholeLine(italiana, {
      kind: 'challenge',
      random: fakeRandom([0.9, 0.1, 0.5, 0.99, 0.01]),
    })
    expect(isFinished(final)).toBe(true)
  })

  it('sem fonte de acaso informada, usa Math.random e ainda termina numa folha', () => {
    const final = playWholeLine(italiana, { kind: 'challenge' })
    expect(isFinished(final)).toBe(true)
  })

  it('fora da vez do adversário, o Desafio não escolhe nada', () => {
    const start = createLesson(italiana)
    expect(chooseOpponentNode(start, { kind: 'challenge', random: () => 0 })).toBeNull()
  })
})
