import { describe, expect, it } from 'vitest'
import { parseTestRandom } from './testRandom'

describe('parseTestRandom', () => {
  it('devolve uma fonte de acaso fixa para números entre 0 e 1', () => {
    expect(parseTestRandom('0')?.()).toBe(0)
    expect(parseTestRandom('0.99')?.()).toBe(0.99)
    expect(parseTestRandom('1')?.()).toBe(1)
  })

  it('ignora o que não é um número entre 0 e 1', () => {
    expect(parseTestRandom(null)).toBeUndefined()
    expect(parseTestRandom('')).toBeUndefined()
    expect(parseTestRandom('abc')).toBeUndefined()
    expect(parseTestRandom('2')).toBeUndefined()
    expect(parseTestRandom('-0.5')).toBeUndefined()
  })
})
