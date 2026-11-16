import { describe, expect, it } from 'vitest'
import italiana from '../content/openings/italiana'
import { getMainLine } from './openingTree'
import { clampStep, getNarration, getWatchView } from './watchLine'

const line = getMainLine(italiana)

describe('getWatchView', () => {
  it('no passo 0 mostra a posição inicial, sem último lance', () => {
    const view = getWatchView(line, 0, 'white')
    expect(view.shownMoves).toEqual([])
    expect(view.lastMove).toBeNull()
    expect(view.fen.startsWith('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w')).toBe(true)
    expect(view.narration).toContain('Próximo')
  })

  it('no passo 3 mostra três lances e a explicação do terceiro (Nf3)', () => {
    const view = getWatchView(line, 3, 'white')
    expect(view.shownMoves).toEqual(['e4', 'e5', 'Nf3'])
    expect(view.lastMove).toEqual({ from: 'g1', to: 'f3' })
    // O terceiro lance da linha é Cf3: a narração é a explicação dele no conteúdo.
    expect(view.narration).toBe(line[2].explanation)
  })

  it('voltar um passo devolve a posição e a narração do lance anterior', () => {
    const view = getWatchView(line, 2, 'white')
    expect(view.shownMoves).toEqual(['e4', 'e5'])
    expect(view.lastMove).toEqual({ from: 'e7', to: 'e5' })
  })

  it('o último passo mostra a linha inteira', () => {
    const view = getWatchView(line, line.length, 'white')
    expect(view.shownMoves).toHaveLength(line.length)
  })

  it('passos fora do limite são ajustados', () => {
    expect(clampStep(-3, line)).toBe(0)
    expect(clampStep(999, line)).toBe(line.length)
    expect(getWatchView(line, 999, 'white').shownMoves).toHaveLength(line.length)
  })
})

describe('getNarration', () => {
  it('lance do adversário sem explicação diz qual foi a resposta, em português', () => {
    expect(getNarration(line[3], 'white')).toBe('As pretas respondem com Cc6.')
    expect(getNarration(line[3], 'black')).toBe('As brancas respondem com Cc6.')
  })
})
