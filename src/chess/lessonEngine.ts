// Motor da lição: a lógica (sem interface) que conduz UMA linha da árvore de lances.
//
// Ele sabe de quem é a vez, qual lance é esperado, avalia o lance da pessoa
// (correto ou fora do roteiro), aplica a resposta do adversário, desfaz o lance
// fora do roteiro ("Voltar") e entrega o guia do lance atual ("Ver lance").
//
// Todas as funções são "puras": recebem um estado e devolvem um estado NOVO, sem
// alterar o antigo. Assim a interface pode guardar o estado num `useState` e os
// testes ficam simples. Quem confere se um lance é legal é o `chess.js`.
import { Chess } from 'chess.js'
import type { Opening, OpeningNode } from './openingTree'

/** Um lance dado por casas (como o tabuleiro entrega) ou já em SAN ("Nf3"). */
export type MoveInput = string | { from: string; to: string; promotion?: string }

/** Lance fora do roteiro que ficou aplicado no tabuleiro, esperando o "Voltar". */
export interface OffScriptInfo {
  /** O lance jogado, em SAN. */
  san: string
  /** Mensagem para a pessoa: a explicação do erro comum ou a mensagem genérica com a dica. */
  message: string
  /** `true` se a mensagem é a explicação específica de um erro comum cadastrado. */
  isCommonMistake: boolean
}

export interface LessonState {
  readonly opening: Opening
  /** Todos os lances aplicados no tabuleiro, em SAN, inclusive o fora do roteiro (se houver). */
  readonly moves: readonly string[]
  /** Os nós da árvore já percorridos (só lances dentro do roteiro). */
  readonly path: readonly OpeningNode[]
  /** Posição atual em FEN (texto que descreve onde está cada peça). */
  readonly fen: string
  /** Preenchido quando o último lance foi legal, mas fora do roteiro. */
  readonly offScript: OffScriptInfo | null
  /** O último lance aplicado (para destacar no tabuleiro), ou `null` no começo. */
  readonly lastMove: { from: string; to: string } | null
}

/** De quem é a vez, do ponto de vista da lição. */
export type LessonStatus =
  | 'user-turn' // a pessoa deve jogar
  | 'opponent-turn' // o app deve jogar a resposta do adversário
  | 'off-script' // a pessoa jogou fora do roteiro; falta "Voltar"
  | 'finished' // a linha terminou

/** O guia de um lance ("Ver lance" e a prática com guia): a peça e a casa de destino. */
export interface MoveGuide {
  from: string
  to: string
  san: string
}

export type UserMoveResult =
  | {
      kind: 'correct'
      state: LessonState
      /** O nó da árvore que a pessoa acabou de jogar. */
      node: OpeningNode
      /** A frase que explica o porquê do lance (SPEC 7.4). */
      explanation: string
    }
  | {
      kind: 'off-script'
      state: LessonState
      message: string
      isCommonMistake: boolean
    }
  /** Lance ilegal, fora da vez ou com a lição já parada: nada muda. */
  | { kind: 'rejected'; state: LessonState }

/** Estado inicial da lição: posição inicial do xadrez, nenhum lance jogado. */
export function createLesson(opening: Opening): LessonState {
  return {
    opening,
    moves: [],
    path: [],
    fen: new Chess().fen(),
    offScript: null,
    lastMove: null,
  }
}

/** Os lances possíveis a seguir dentro do roteiro (filhos do último nó). */
function getOptions(state: LessonState): OpeningNode[] {
  const last = state.path[state.path.length - 1]
  return last ? last.children : state.opening.tree
}

export function getStatus(state: LessonState): LessonStatus {
  if (state.offScript) return 'off-script'
  const options = getOptions(state)
  if (options.length === 0) return 'finished'
  return options[0].by === 'user' ? 'user-turn' : 'opponent-turn'
}

/** Quem joga agora: `null` se a linha acabou ou se há um lance fora do roteiro para desfazer. */
export function getTurn(state: LessonState): 'user' | 'opponent' | null {
  const status = getStatus(state)
  if (status === 'user-turn') return 'user'
  if (status === 'opponent-turn') return 'opponent'
  return null
}

/**
 * Os lances aceitos agora, em SAN. Em linha fixa é um só; nos sistemas podem ser
 * mais (as alternativas escritas no conteúdo). Vazio quando não é a vez da pessoa.
 */
export function getExpectedMoves(state: LessonState): string[] {
  if (getStatus(state) !== 'user-turn') return []
  return getOptions(state).map((node) => node.san)
}

/** Os galhos que o adversário pode jogar agora (o primeiro é o da linha principal). */
export function getOpponentOptions(state: LessonState): OpeningNode[] {
  return getStatus(state) === 'opponent-turn' ? getOptions(state) : []
}

/** Aplica um lance na posição do estado; devolve `null` se for ilegal. */
function applyMove(
  fen: string,
  input: MoveInput,
): { san: string; from: string; to: string; fen: string } | null {
  const chess = new Chess(fen)
  try {
    // Promoção sempre vira dama, igual ao clique e ao arrastar (F11/F12).
    const move =
      typeof input === 'string'
        ? chess.move(input)
        : chess.move({ from: input.from, to: input.to, promotion: input.promotion ?? 'q' })
    return { san: move.san, from: move.from, to: move.to, fen: chess.fen() }
  } catch {
    // O chess.js lança erro para lances ilegais.
    return null
  }
}

/** A dica do momento: a do primeiro lance esperado da pessoa. */
function getCurrentHint(state: LessonState): string {
  return getOptions(state).find((node) => node.by === 'user')?.hint ?? ''
}

function buildGenericMessage(hint: string): string {
  const base = 'Esse lance é possível, mas não é o da abertura.'
  return hint ? `${base} Dica: ${hint}` : base
}

/**
 * A pessoa joga um lance. Resultados:
 * - `correct`: está no roteiro; o lance é aplicado e vem junto a explicação dele.
 * - `off-script`: é legal, mas não é da abertura; fica no tabuleiro (SPEC 7.3) até o "Voltar".
 * - `rejected`: ilegal, fora da vez ou a lição está parada; nada muda.
 */
export function playUserMove(state: LessonState, input: MoveInput): UserMoveResult {
  if (getStatus(state) !== 'user-turn') return { kind: 'rejected', state }

  const applied = applyMove(state.fen, input)
  if (!applied) return { kind: 'rejected', state }

  const node = getOptions(state).find((candidate) => candidate.san === applied.san)
  const base = {
    opening: state.opening,
    moves: [...state.moves, applied.san],
    fen: applied.fen,
    lastMove: { from: applied.from, to: applied.to },
  }

  if (node) {
    return {
      kind: 'correct',
      node,
      explanation: node.explanation ?? '',
      state: { ...base, path: [...state.path, node], offScript: null },
    }
  }

  // Fora do roteiro: se o conteúdo tem uma explicação para esse erro comum, ela
  // aparece no lugar da mensagem genérica.
  const expected = getOptions(state).find((candidate) => candidate.by === 'user')
  const mistake = expected?.commonMistakes?.find((item) => item.san === applied.san)
  const message = mistake ? mistake.explanation : buildGenericMessage(getCurrentHint(state))
  const isCommonMistake = Boolean(mistake)
  return {
    kind: 'off-script',
    message,
    isCommonMistake,
    state: {
      ...base,
      path: state.path,
      offScript: { san: applied.san, message, isCommonMistake },
    },
  }
}

/**
 * O adversário responde. Por padrão joga o primeiro galho (linha principal);
 * a escolha de outro galho (variações, Desafio) pode ser passada em `chosen`.
 * Se não for a vez do adversário, ou `chosen` não for um galho possível, nada muda.
 */
export function playOpponentMove(state: LessonState, chosen?: OpeningNode): LessonState {
  const options = getOpponentOptions(state)
  if (options.length === 0) return state
  const node = chosen ?? options[0]
  if (!options.includes(node)) return state

  const applied = applyMove(state.fen, node.san)
  // Se isto acontecer, o conteúdo tem um lance ilegal (o validador de conteúdo pega isso).
  if (!applied) return state

  return {
    opening: state.opening,
    moves: [...state.moves, applied.san],
    path: [...state.path, node],
    fen: applied.fen,
    offScript: null,
    lastMove: { from: applied.from, to: applied.to },
  }
}

/** "Voltar": desfaz o lance fora do roteiro e restaura a posição anterior. */
export function undoOffScriptMove(state: LessonState): LessonState {
  if (!state.offScript) return state

  const moves = state.moves.slice(0, -1)
  // Refaz a partida sem o último lance, para recuperar a posição e o lance destacado.
  const chess = new Chess()
  let lastMove: LessonState['lastMove'] = null
  for (const san of moves) {
    const move = chess.move(san)
    lastMove = { from: move.from, to: move.to }
  }
  return {
    opening: state.opening,
    moves,
    path: state.path,
    fen: chess.fen(),
    offScript: null,
    lastMove,
  }
}

/**
 * "Ver lance": a peça e a casa de destino do lance esperado agora (o da linha
 * principal, se houver mais de um). `null` quando não é a vez da pessoa.
 */
export function getGuide(state: LessonState): MoveGuide | null {
  const [san] = getExpectedMoves(state)
  if (!san) return null
  const applied = applyMove(state.fen, san)
  return applied ? { from: applied.from, to: applied.to, san: applied.san } : null
}

export function isFinished(state: LessonState): boolean {
  return getStatus(state) === 'finished'
}

// ---------------------------------------------------------------------------
// Escolha do galho do adversário (F16)
//
// O adversário pode responder de dois jeitos:
// - `path`: segue um caminho já escolhido (a linha principal ou uma variação);
// - `challenge`: modo Desafio, escolhe AO ACASO entre os galhos existentes.
// A fonte de acaso é passada de fora (`random`), para os testes serem previsíveis.
// ---------------------------------------------------------------------------

/** Uma função que devolve um número de 0 (inclusive) a 1 (exclusive), como `Math.random`. */
export type RandomSource = () => number

export type OpponentMode =
  | {
      kind: 'path'
      /** A linha a seguir: `getMainLine(abertura)` ou `variação.line` (de `getVariations`). */
      line: readonly OpeningNode[]
    }
  | {
      kind: 'challenge'
      /** De onde vem o acaso. Se faltar, usa `Math.random`. */
      random?: RandomSource
    }

/**
 * Escolhe o galho que o adversário vai jogar agora, ou `null` se não for a vez dele.
 *
 * - Modo `path`: pega o nó da linha que está na posição atual. Se a pessoa saiu da
 *   linha (por exemplo, usou uma ordem alternativa de um sistema) e esse nó não é
 *   mais possível, cai para a linha principal em vez de travar.
 * - Modo `challenge`: sorteia entre todos os galhos possíveis.
 */
export function chooseOpponentNode(state: LessonState, mode: OpponentMode): OpeningNode | null {
  const options = getOpponentOptions(state)
  if (options.length === 0) return null

  if (mode.kind === 'path') {
    const wanted = mode.line[state.path.length]
    // Compara pela identidade (é o mesmo objeto da árvore), igual ao resto do motor.
    return options.find((node) => node === wanted) ?? options[0]
  }

  const random = mode.random ?? Math.random
  // `min` protege contra uma fonte de acaso que devolva exatamente 1.
  const index = Math.min(options.length - 1, Math.floor(random() * options.length))
  return options[index]
}

/** O adversário responde segundo o modo escolhido. Fora da vez dele, nada muda. */
export function playOpponentTurn(state: LessonState, mode: OpponentMode): LessonState {
  const node = chooseOpponentNode(state, mode)
  return node ? playOpponentMove(state, node) : state
}
