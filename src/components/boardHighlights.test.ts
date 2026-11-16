import { describe, expect, it } from 'vitest'
import { getSquareStyles } from './boardHighlights'

describe('getSquareStyles', () => {
  it('sem último lance, nenhuma casa é destacada', () => {
    expect(getSquareStyles()).toEqual({})
    expect(getSquareStyles(null)).toEqual({})
  })

  it('destaca a casa de origem e a de destino do último lance', () => {
    const styles = getSquareStyles({ from: 'e2', to: 'e4' })
    expect(Object.keys(styles).sort()).toEqual(['e2', 'e4'])
    expect(styles.e4.boxShadow).toContain('var(--color-board-last-move)')
  })
})

describe('getSquareStyles com seleção', () => {
  const selection = {
    square: 'e2',
    targets: [
      { square: 'e3', capture: false },
      { square: 'd3', capture: true },
    ],
  }

  it('marca a peça selecionada e as casas de destino', () => {
    const styles = getSquareStyles(null, selection)
    expect(Object.keys(styles).sort()).toEqual(['d3', 'e2', 'e3'])
    expect(styles.e2.boxShadow).toContain('var(--color-accent)')
    expect(styles.e3.backgroundImage).toContain('radial-gradient')
    expect(styles.d3.boxShadow).toContain('var(--color-accent)')
  })

  it('a seleção convive com o destaque do último lance', () => {
    const styles = getSquareStyles({ from: 'g1', to: 'f3' }, selection)
    expect(styles.g1.boxShadow).toContain('var(--color-board-last-move)')
    expect(styles.e2.boxShadow).toContain('var(--color-accent)')
  })
})
