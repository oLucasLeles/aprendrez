// Etapa "Assistir" (SPEC, seção 6): a linha principal mostrada lance a lance.
// Lógica pura: dado o número de lances já mostrados, devolve a posição, o último
// lance e a narração. A interface só chama estas funções.
import { Chess } from 'chess.js'
import { toPortugueseSan } from './notation'
import type { OpeningColor, OpeningNode } from './openingTree'

export type WatchView = {
  /** Posição (FEN) depois dos lances mostrados. */
  fen: string
  /** O último lance mostrado (casas de origem e destino), ou `null` na posição inicial. */
  lastMove: { from: string; to: string } | null
  /** Os lances mostrados até agora, em SAN. */
  shownMoves: string[]
  /** A narração do lance atual (o porquê). */
  narration: string
}

/** Quantos lances cabem na linha, para limitar "Próximo lance". */
export function clampStep(step: number, line: OpeningNode[]): number {
  return Math.max(0, Math.min(step, line.length))
}

/**
 * A narração de um lance. Os lances da pessoa têm explicação no conteúdo; os do
 * adversário não, então dizemos só qual foi a resposta.
 */
export function getNarration(node: OpeningNode, openingColor: OpeningColor): string {
  if (node.explanation) return node.explanation
  const opponent = openingColor === 'white' ? 'As pretas' : 'As brancas'
  return `${opponent} respondem com ${toPortugueseSan(node.san)}.`
}

/** O que mostrar depois de `step` lances da linha (0 = posição inicial). */
export function getWatchView(line: OpeningNode[], step: number, openingColor: OpeningColor): WatchView {
  const count = clampStep(step, line)
  const game = new Chess()
  let lastMove: WatchView['lastMove'] = null
  for (const node of line.slice(0, count)) {
    const move = game.move(node.san)
    lastMove = { from: move.from, to: move.to }
  }

  const current = count > 0 ? line[count - 1] : null
  return {
    fen: game.fen(),
    lastMove,
    shownMoves: line.slice(0, count).map((node) => node.san),
    narration: current
      ? getNarration(current, openingColor)
      : 'Esta é a posição inicial. Aperte "Próximo lance" para ver o primeiro lance.',
  }
}
