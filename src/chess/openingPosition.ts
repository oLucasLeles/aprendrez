// Posições de uma abertura em formato FEN (o texto que diz onde está cada peça)
// e os nomes em português usados na interface. Lógica pura, sem interface.
import { Chess } from 'chess.js'
import { getMainLineMoves, type Opening, type OpeningColor, type OpeningLevel } from './openingTree'

/** Nomes dos níveis da trilha (SPEC, seção 5). */
export const LEVEL_NAMES: Record<OpeningLevel, string> = {
  1: 'Primeiros passos',
  2: 'Construindo repertório',
  3: 'Desafio',
}

/** Nomes das cores, para mostrar na interface. */
export const COLOR_NAMES: Record<OpeningColor, string> = {
  white: 'Brancas',
  black: 'Pretas',
}

/**
 * A posição característica da abertura, mostrada na etapa "Conhecer":
 * o fim da linha principal (a SPEC 6 não define outra posição por enquanto).
 */
export function getCharacteristicFen(opening: Opening): string {
  const game = new Chess()
  for (const san of getMainLineMoves(opening)) {
    game.move(san)
  }
  return game.fen()
}
