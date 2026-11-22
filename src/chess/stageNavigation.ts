// Navegação da lição: as 6 etapas e a separação entre os dois tipos de "seguir em frente".
//
// Decisão do dono do projeto (2026-11-22), com referências do Mobbin (Brilliant, Turo, Zillow):
// - o botão PRINCIPAL anda DENTRO da etapa atual ("Próximo lance", "Praticar esta variação…");
// - ir para OUTRA etapa é um controle separado, no rodapé do painel ("Próxima etapa: …"),
//   que ganha destaque só quando a etapa atual chegou ao fim;
// - a exploração é livre: qualquer etapa pode ser aberta a qualquer momento.
// Lógica pura, sem interface: a tela só chama estas funções.
import type { VariationPhase } from './variationStage'

export interface Stage {
  /** Nome completo, usado no título do painel e pelos leitores de tela. */
  name: string
  /** Nome curto, embaixo do segmento do indicador (no desktop). */
  short: string
}

export const STAGES: readonly Stage[] = [
  { name: 'Conhecer', short: 'Conhecer' },
  { name: 'Assistir', short: 'Assistir' },
  { name: 'Praticar com guia', short: 'Com guia' },
  { name: 'Praticar sozinho', short: 'Sozinho' },
  { name: 'Variações', short: 'Variações' },
  { name: 'Desafio', short: 'Desafio' },
]

export const WATCH_STAGE = 1
export const VARIATIONS_STAGE = 4
export const CHALLENGE_STAGE = 5

/** O que a etapa atual está mostrando agora, do ponto de vista da navegação. */
export type StageMoment =
  | { kind: 'intro' } // Conhecer: só leitura
  | { kind: 'watch'; atEnd: boolean; variationPhase?: VariationPhase; lastVariation?: boolean }
  | { kind: 'practice'; finished: boolean; offScript: boolean; variationPhase?: VariationPhase; lastVariation?: boolean; challenge?: boolean }

/** A ação principal, dentro da etapa. `null` quando não há nada a fazer além de jogar no tabuleiro. */
export type InnerAction =
  | { kind: 'next-move'; label: 'Próximo lance' }
  | { kind: 'undo'; label: 'Voltar' }
  | { kind: 'variation-guided'; label: 'Praticar esta variação com guia' }
  | { kind: 'variation-solo'; label: 'Praticar esta variação sozinho' }
  | { kind: 'next-variation'; label: 'Próxima variação' }
  | { kind: 'summary'; label: 'Ver resumo' }

export function getInnerAction(moment: StageMoment): InnerAction | null {
  if (moment.kind === 'intro') return null
  if (moment.kind === 'watch') {
    if (!moment.atEnd) return { kind: 'next-move', label: 'Próximo lance' }
    // No fim do "Assistir" de uma variação, o próximo passo ainda é dentro da etapa Variações.
    if (moment.variationPhase === 'watch') return { kind: 'variation-guided', label: 'Praticar esta variação com guia' }
    return null
  }
  if (moment.offScript) return { kind: 'undo', label: 'Voltar' }
  if (!moment.finished) return null
  if (moment.challenge) return { kind: 'summary', label: 'Ver resumo' }
  if (moment.variationPhase === 'guided') return { kind: 'variation-solo', label: 'Praticar esta variação sozinho' }
  if (moment.variationPhase === 'solo' && !moment.lastVariation) return { kind: 'next-variation', label: 'Próxima variação' }
  return null
}

/**
 * A etapa atual chegou ao fim? Aí o botão "Próxima etapa" ganha o destaque do botão principal,
 * porque não sobra nada para fazer dentro dela.
 */
export function isStageDone(moment: StageMoment): boolean {
  if (moment.kind === 'intro') return true
  if (moment.kind === 'watch') return moment.atEnd && moment.variationPhase === undefined
  if (moment.challenge) return false // o fim do Desafio leva ao resumo, não a outra etapa
  if (!moment.finished || moment.offScript) return false
  return moment.variationPhase === undefined || (moment.variationPhase === 'solo' && moment.lastVariation === true)
}

/** Etapa anterior e próxima, para o rodapé do painel (`null` nas pontas). */
export function getNeighbourStages(stageIndex: number): { previous: number | null; next: number | null } {
  return {
    previous: stageIndex > 0 ? stageIndex - 1 : null,
    next: stageIndex < STAGES.length - 1 ? stageIndex + 1 : null,
  }
}
