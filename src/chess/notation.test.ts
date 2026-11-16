import { describe, expect, it } from 'vitest'
import { formatMoveList, toPortugueseSan } from './notation'

describe('toPortugueseSan', () => {
  it.each([
    ['Nf3', 'Cf3'],
    ['Qxd5', 'Dxd5'],
    ['Kxe2', 'Rxe2'],
    ['Rae1', 'Tae1'],
    ['Bc4', 'Bc4'],
    ['Nbd2', 'Cbd2'],
  ])('%s vira %s', (san, esperado) => {
    expect(toPortugueseSan(san)).toBe(esperado)
  })

  it('não muda lances de peão', () => {
    expect(toPortugueseSan('e4')).toBe('e4')
    expect(toPortugueseSan('exd5')).toBe('exd5')
    expect(toPortugueseSan('bxc3')).toBe('bxc3')
  })

  it('não muda o roque', () => {
    expect(toPortugueseSan('O-O')).toBe('O-O')
    expect(toPortugueseSan('O-O-O')).toBe('O-O-O')
    expect(toPortugueseSan('O-O+')).toBe('O-O+')
  })

  it('mantém xeque (+) e mate (#)', () => {
    expect(toPortugueseSan('Qh5+')).toBe('Dh5+')
    expect(toPortugueseSan('Qxf7#')).toBe('Dxf7#')
    expect(toPortugueseSan('Bb5+')).toBe('Bb5+')
  })

  it('converte a peça da promoção', () => {
    expect(toPortugueseSan('e8=Q')).toBe('e8=D')
    expect(toPortugueseSan('e8=N')).toBe('e8=C')
    expect(toPortugueseSan('a1=R')).toBe('a1=T')
    expect(toPortugueseSan('h8=B')).toBe('h8=B')
    expect(toPortugueseSan('exd8=Q+')).toBe('exd8=D+')
  })
})

describe('formatMoveList', () => {
  it('começa de um lance das brancas', () => {
    expect(formatMoveList(['e4', 'e5', 'Nf3', 'Nc6'])).toBe('1. e4 e5 2. Cf3 Cc6')
  })

  it('termina num lance das brancas sem inventar o das pretas', () => {
    expect(formatMoveList(['e4', 'e5', 'Nf3'])).toBe('1. e4 e5 2. Cf3')
  })

  it('começa de um lance das pretas', () => {
    expect(formatMoveList(['e5', 'Nf3', 'Nc6'], 'black')).toBe('1... e5 2. Cf3 Cc6')
  })

  it('aceita um número inicial diferente de 1', () => {
    expect(formatMoveList(['Bc4', 'Bc5'], 'white', 3)).toBe('3. Bc4 Bc5')
    expect(formatMoveList(['Bc5', 'c3'], 'black', 3)).toBe('3... Bc5 4. c3')
  })

  it('devolve texto vazio para lista vazia', () => {
    expect(formatMoveList([])).toBe('')
  })
})
