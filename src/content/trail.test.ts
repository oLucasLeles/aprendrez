// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { openings } from './openings'
import { getNextOpening, TRAIL_ORDER, trailOpenings } from './trail'

describe('trilha', () => {
  it('toda abertura do catálogo está na ordem da trilha (senão a "próxima abertura" a pularia)', () => {
    for (const opening of openings) {
      expect(TRAIL_ORDER, `${opening.id} não está em TRAIL_ORDER`).toContain(opening.id)
    }
  })

  it('a trilha não repete ids', () => {
    expect(new Set(TRAIL_ORDER).size).toBe(TRAIL_ORDER.length)
  })

  it('a ordem da trilha nunca volta para um nível anterior', () => {
    const levels = trailOpenings.map((opening) => opening.level)
    expect(levels).toEqual([...levels].sort((a, b) => a - b))
  })

  it('a próxima depois da Italiana é a próxima da trilha que tem conteúdo', () => {
    expect(getNextOpening('italiana')?.id).toBe(trailOpenings[1]?.id)
    expect(getNextOpening('italiana')?.id).not.toBe('italiana')
  })

  it('a última da trilha não tem próxima, e um id desconhecido também não', () => {
    expect(getNextOpening(trailOpenings[trailOpenings.length - 1].id)).toBeUndefined()
    expect(getNextOpening('xyz')).toBeUndefined()
  })
})
