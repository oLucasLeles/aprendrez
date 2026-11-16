// Notação dos lances em português.
//
// O chess.js (e a base do Lichess) escrevem os lances em SAN, a notação em inglês
// (Nf3 = cavalo vai para f3). Na interface mostramos a notação em português:
// R (rei), D (dama), T (torre), B (bispo), C (cavalo). Peão não tem letra.

const PIECE_LETTERS: Record<string, string> = {
  K: 'R', // King → Rei
  Q: 'D', // Queen → Dama
  R: 'T', // Rook → Torre
  B: 'B', // Bishop → Bispo (a letra é a mesma)
  N: 'C', // Knight → Cavalo
}

/** Converte um lance em SAN (inglês) para a notação em português. */
export function toPortugueseSan(san: string): string {
  // Roque (O-O e O-O-O) não tem letra de peça, então não muda.
  // Só letras MAIÚSCULAS são peças; as colunas (a–h) são minúsculas.
  const first = san.charAt(0)
  const withPiece = first in PIECE_LETTERS ? PIECE_LETTERS[first] + san.slice(1) : san
  // Promoção: e8=Q vira e8=D (a peça vem depois do "=").
  return withPiece.replace(/=([KQRBN])/, (_, piece: string) => `=${PIECE_LETTERS[piece]}`)
}

/**
 * Formata uma sequência de lances (em SAN) como lista numerada em português.
 *
 * - Começando pelas brancas: `1. e4 e5 2. Cf3 Cc6`
 * - Começando pelas pretas: `1... e5 2. Cf3 Cc6`
 *
 * `firstMoveNumber` é o número do primeiro lance da lista (1 por padrão); serve
 * para mostrar um trecho no meio da partida.
 */
export function formatMoveList(
  moves: readonly string[],
  startsWith: 'white' | 'black' = 'white',
  firstMoveNumber = 1,
): string {
  const parts: string[] = []
  let moveNumber = firstMoveNumber
  let whiteToMove = startsWith === 'white'

  moves.forEach((san, index) => {
    if (whiteToMove) {
      parts.push(`${moveNumber}.`)
    } else if (index === 0) {
      // Lista que começa num lance das pretas: o número vem com reticências.
      parts.push(`${moveNumber}...`)
    }
    parts.push(toPortugueseSan(san))
    if (!whiteToMove) moveNumber += 1
    whiteToMove = !whiteToMove
  })

  return parts.join(' ')
}
