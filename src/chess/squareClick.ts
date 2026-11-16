// Lógica pura dos lances por clique (SPEC, seção 7.1). Sem interface: recebe a
// posição e o clique e diz o que deve acontecer. Todas as regras do xadrez vêm
// do chess.js; aqui só decidimos "seleciona", "desfaz" ou "faz o lance".
import { Chess, type Square } from 'chess.js'

export type PlayerColor = 'white' | 'black'

export type ClickMove = { from: string; to: string; promotion?: string }

export type ClickResult = {
  /** Casa da peça selecionada depois do clique (null = nada selecionado). */
  selected: string | null
  /** Lance feito pelo clique, se houve um. */
  move: ClickMove | null
}

/** A peça que está nessa casa pertence a quem joga agora (e a pessoa pode mexê-la)? */
function isSelectable(chess: Chess, square: string, playerColor?: PlayerColor): boolean {
  const piece = chess.get(square as Square)
  if (!piece) return false
  const turn = chess.turn() === 'w' ? 'white' : 'black'
  const pieceColor = piece.color === 'w' ? 'white' : 'black'
  if (pieceColor !== turn) return false // peça fora da vez
  if (playerColor && pieceColor !== playerColor) return false // peça do adversário
  return true
}

/** Casa de destino legal; `capture` = o lance captura uma peça (inclusive en passant). */
export type Target = { square: string; capture: boolean }

/** Destinos legais da peça em `square` (lista vazia se ela não puder ser selecionada). */
export function getTargets(fen: string, square: string, playerColor?: PlayerColor): Target[] {
  const chess = new Chess(fen)
  if (!isSelectable(chess, square, playerColor)) return []
  const targets = new Map<string, Target>() // promoção repete a mesma casa 4 vezes
  for (const m of chess.moves({ square: square as Square, verbose: true })) {
    targets.set(m.to, { square: m.to, capture: m.isCapture() || m.isEnPassant() })
  }
  return [...targets.values()]
}

/** Só os nomes das casas de destino legais. */
export function getLegalTargets(fen: string, square: string, playerColor?: PlayerColor): string[] {
  return getTargets(fen, square, playerColor).map((t) => t.square)
}

/**
 * O que acontece quando a pessoa clica numa casa.
 * - clicar numa peça própria (na vez) seleciona e marca os destinos;
 * - clicar numa casa marcada faz o lance;
 * - clicar em qualquer outro lugar (ou na mesma peça) desfaz a seleção.
 * Pelo clique, só saem lances legais.
 */
export function handleSquareClick(
  fen: string,
  selected: string | null,
  square: string,
  playerColor?: PlayerColor,
): ClickResult {
  const chess = new Chess(fen)

  // Havia uma peça selecionada e a pessoa clicou numa casa de destino: faz o lance.
  if (selected && getLegalTargets(fen, selected, playerColor).includes(square)) {
    const move = chess.moves({ square: selected as Square, verbose: true }).find((m) => m.to === square)!
    // Promoção: por simplicidade o peão vira sempre dama (decisão registrada no diário).
    return {
      selected: null,
      move: { from: selected, to: square, ...(move.promotion ? { promotion: 'q' } : {}) },
    }
  }

  // Clicar na mesma peça desfaz a seleção.
  if (selected === square) return { selected: null, move: null }

  // Clicar numa peça própria (na vez) seleciona; qualquer outra coisa desfaz.
  if (isSelectable(chess, square, playerColor)) return { selected: square, move: null }
  return { selected: null, move: null }
}

/** A peça nessa casa pode ser arrastada? (mesma regra da seleção por clique) */
export function canMovePiece(fen: string, square: string, playerColor?: PlayerColor): boolean {
  return isSelectable(new Chess(fen), square, playerColor)
}

/**
 * O que acontece quando a pessoa solta uma peça arrastada (SPEC, seção 7.2).
 * Soltar numa casa legal devolve o lance; soltar numa casa ilegal ou fora do
 * tabuleiro (`to` = null) devolve null, e a peça volta para a casa de origem.
 */
export function handleDrop(
  fen: string,
  from: string,
  to: string | null,
  playerColor?: PlayerColor,
): ClickMove | null {
  if (!to) return null
  if (!getLegalTargets(fen, from, playerColor).includes(to)) return null
  const chess = new Chess(fen)
  const move = chess.moves({ square: from as Square, verbose: true }).find((m) => m.to === to)!
  return { from, to, ...(move.promotion ? { promotion: 'q' } : {}) }
}
