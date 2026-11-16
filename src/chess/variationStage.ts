// Etapa "Variações" (SPEC, seção 6): para cada variação, a pessoa vê o momento em que
// o adversário desvia, assiste à continuação e depois pratica com guia e sozinha.
// Lógica pura: aqui só ficam a ordem dos passos e os textos; a tela só chama estas funções.
import { formatMoveList } from './notation'
import type { OpeningColor, Variation } from './openingTree'

/** Os três passos de cada variação, na ordem. */
export type VariationPhase = 'watch' | 'guided' | 'solo'

export const VARIATION_PHASES: readonly VariationPhase[] = ['watch', 'guided', 'solo']

/** Onde a pessoa está dentro da etapa: qual variação (0 = a primeira) e qual passo dela. */
export interface VariationPosition {
  index: number
  phase: VariationPhase
}

/**
 * O próximo ponto depois de "Continuar". Devolve `null` quando a última variação
 * acabou, ou seja, quando é hora de ir para a etapa seguinte (Desafio).
 */
export function nextVariationPosition(position: VariationPosition, variationCount: number): VariationPosition | null {
  const phaseIndex = VARIATION_PHASES.indexOf(position.phase)
  if (phaseIndex < VARIATION_PHASES.length - 1) {
    return { index: position.index, phase: VARIATION_PHASES[phaseIndex + 1] }
  }
  if (position.index + 1 < variationCount) {
    return { index: position.index + 1, phase: 'watch' }
  }
  return null
}

/** Quantos lances vêm antes do desvio: é daqui que o "Assistir" da variação começa. */
export function getDeviationStep(variation: Variation): number {
  return variation.path.length - 1
}

/** O rótulo do passo, para o título do painel. */
export const VARIATION_PHASE_LABELS: Record<VariationPhase, string> = {
  watch: 'Assistir',
  guided: 'Praticar com guia',
  solo: 'Praticar sozinho',
}

/**
 * A pergunta que abre a variação, como "E se as pretas jogarem 4...d6?".
 * O adversário é a cor contrária à da pessoa.
 */
export function getVariationQuestion(variation: Variation, openingColor: OpeningColor): string {
  const opponent = openingColor === 'white' ? 'as pretas' : 'as brancas'
  // Número do lance: cada lance completo tem dois meios-lances (brancas e pretas).
  const plyIndex = getDeviationStep(variation)
  const moveNumber = Math.floor(plyIndex / 2) + 1
  const startsWith = plyIndex % 2 === 0 ? 'white' : 'black'
  const move = formatMoveList([variation.deviation.san], startsWith, moveNumber)
  return `E se ${opponent} jogarem ${move}?`
}
