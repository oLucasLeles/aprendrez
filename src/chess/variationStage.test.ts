import { describe, expect, it } from 'vitest'
import italiana from '../content/openings/italiana'
import { getVariations } from './openingTree'
import { getDeviationStep, getVariationQuestion, nextVariationPosition } from './variationStage'

describe('nextVariationPosition', () => {
  it('passa por assistir, praticar com guia e praticar sozinho em cada variação', () => {
    expect(nextVariationPosition({ index: 0, phase: 'watch' }, 2)).toEqual({ index: 0, phase: 'guided' })
    expect(nextVariationPosition({ index: 0, phase: 'guided' }, 2)).toEqual({ index: 0, phase: 'solo' })
    expect(nextVariationPosition({ index: 0, phase: 'solo' }, 2)).toEqual({ index: 1, phase: 'watch' })
  })

  it('devolve null depois da última variação', () => {
    expect(nextVariationPosition({ index: 1, phase: 'solo' }, 2)).toBeNull()
    expect(nextVariationPosition({ index: 0, phase: 'solo' }, 1)).toBeNull()
  })
})

describe('variações da Italiana', () => {
  const variations = getVariations(italiana)

  it('o assistir começa logo antes do desvio', () => {
    // 1.e4 e5 2.Cf3 Cc6 3.Bc4 Bc5 4.c3 Cf6 5.d3 = 9 lances antes de 5...a6
    expect(getDeviationStep(variations[0])).toBe(9)
    expect(getDeviationStep(variations[1])).toBe(7)
  })

  it('a pergunta cita o lance do desvio em português', () => {
    expect(getVariationQuestion(variations[0], 'white')).toBe('E se as pretas jogarem 5... a6?')
    expect(getVariationQuestion(variations[1], 'white')).toBe('E se as pretas jogarem 4... d6?')
  })
})
