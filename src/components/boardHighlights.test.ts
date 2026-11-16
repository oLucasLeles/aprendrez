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
