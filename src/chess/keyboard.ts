// Lógica pura do tabuleiro pelo teclado (SPEC, seção 9: tudo navegável por teclado).
// Sem interface: diz para qual casa o foco vai e qual é o nome de cada casa.

const FILES = 'abcdefgh'

/** Teclas de seta que movem o foco entre as casas. */
export type ArrowKey = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight'

export function isArrowKey(key: string): key is ArrowKey {
  return key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight'
}

/**
 * Para onde o foco vai ao apertar uma seta. As setas valem para o que se vê na
 * tela: "para cima" é sempre em direção ao lado de cima do tabuleiro, então com
 * as pretas embaixo (tabuleiro invertido) tudo se inverte. Na borda, o foco fica onde está.
 */
export function moveFocus(square: string, key: ArrowKey, orientation: 'white' | 'black'): string {
  let file = FILES.indexOf(square[0])
  let rank = Number(square[1])
  const flip = orientation === 'white' ? 1 : -1
  if (key === 'ArrowUp') rank += flip
  if (key === 'ArrowDown') rank -= flip
  if (key === 'ArrowRight') file += flip
  if (key === 'ArrowLeft') file -= flip
  if (file < 0 || file > 7 || rank < 1 || rank > 8) return square
  return `${FILES[file]}${rank}`
}

/** Casa onde o foco começa quando a pessoa chega ao tabuleiro com o Tab. */
export function initialFocusSquare(orientation: 'white' | 'black'): string {
  return orientation === 'white' ? 'e2' : 'e7'
}

const PIECE_NAMES: Record<string, { name: string; white: string; black: string }> = {
  P: { name: 'peão', white: 'branco', black: 'preto' },
  N: { name: 'cavalo', white: 'branco', black: 'preto' },
  B: { name: 'bispo', white: 'branco', black: 'preto' },
  R: { name: 'torre', white: 'branca', black: 'preta' },
  Q: { name: 'dama', white: 'branca', black: 'preta' },
  K: { name: 'rei', white: 'branco', black: 'preto' },
}

/**
 * Nome acessível de uma casa, lido por quem usa leitor de tela. `pieceType` vem
 * da biblioteca do tabuleiro no formato "wP" (cor + peça); sem peça, a casa está vazia.
 * Exemplos: "e2, peão branco", "e4, vazia".
 */
export function squareLabel(square: string, pieceType?: string | null): string {
  if (!pieceType) return `${square}, vazia`
  const info = PIECE_NAMES[pieceType[1]]
  if (!info) return `${square}, vazia`
  return `${square}, ${info.name} ${pieceType[0] === 'w' ? info.white : info.black}`
}
