import { describe, expect, it } from 'vitest'
import { getInnerAction, getNeighbourStages, isStageDone, STAGES } from './stageNavigation'

describe('getInnerAction (botão principal, dentro da etapa)', () => {
  it('Conhecer não tem ação interna', () => {
    expect(getInnerAction({ kind: 'intro' })).toBeNull()
  })

  it('no Assistir, o principal é "Próximo lance" até o fim da linha', () => {
    expect(getInnerAction({ kind: 'watch', atEnd: false })?.label).toBe('Próximo lance')
    expect(getInnerAction({ kind: 'watch', atEnd: true })).toBeNull()
  })

  it('no fim do Assistir de uma variação, o principal continua dentro da etapa Variações', () => {
    expect(getInnerAction({ kind: 'watch', atEnd: true, variationPhase: 'watch' })?.label).toBe('Praticar esta variação com guia')
  })

  it('na prática: nada durante a partida, "Voltar" depois de um lance fora do roteiro', () => {
    expect(getInnerAction({ kind: 'practice', finished: false, offScript: false })).toBeNull()
    expect(getInnerAction({ kind: 'practice', finished: false, offScript: true })?.label).toBe('Voltar')
  })

  it('nas variações, o fim de cada passo leva ao próximo passo; no Desafio, ao resumo', () => {
    expect(getInnerAction({ kind: 'practice', finished: true, offScript: false, variationPhase: 'guided' })?.label).toBe('Praticar esta variação sozinho')
    expect(getInnerAction({ kind: 'practice', finished: true, offScript: false, variationPhase: 'solo', lastVariation: false })?.label).toBe('Próxima variação')
    expect(getInnerAction({ kind: 'practice', finished: true, offScript: false, variationPhase: 'solo', lastVariation: true })).toBeNull()
    expect(getInnerAction({ kind: 'practice', finished: true, offScript: false, challenge: true })?.label).toBe('Ver resumo')
  })
})

describe('isStageDone (quando "Próxima etapa" ganha destaque)', () => {
  it('Conhecer sempre; Assistir só no fim; prática só no fim e sem lance fora do roteiro', () => {
    expect(isStageDone({ kind: 'intro' })).toBe(true)
    expect(isStageDone({ kind: 'watch', atEnd: false })).toBe(false)
    expect(isStageDone({ kind: 'watch', atEnd: true })).toBe(true)
    expect(isStageDone({ kind: 'practice', finished: false, offScript: false })).toBe(false)
    expect(isStageDone({ kind: 'practice', finished: true, offScript: false })).toBe(true)
  })

  it('nas variações, só depois da última; no Desafio, nunca (o fim leva ao resumo)', () => {
    expect(isStageDone({ kind: 'watch', atEnd: true, variationPhase: 'watch' })).toBe(false)
    expect(isStageDone({ kind: 'practice', finished: true, offScript: false, variationPhase: 'solo', lastVariation: false })).toBe(false)
    expect(isStageDone({ kind: 'practice', finished: true, offScript: false, variationPhase: 'solo', lastVariation: true })).toBe(true)
    expect(isStageDone({ kind: 'practice', finished: true, offScript: false, challenge: true })).toBe(false)
  })
})

describe('getNeighbourStages', () => {
  it('não há anterior na primeira etapa nem próxima na última', () => {
    expect(getNeighbourStages(0)).toEqual({ previous: null, next: 1 })
    expect(getNeighbourStages(STAGES.length - 1)).toEqual({ previous: STAGES.length - 2, next: null })
  })
})
