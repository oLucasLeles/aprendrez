import { describe, expect, it } from 'vitest'
import { splitSquareRefs } from './squareRefs'

const refs = (text: string) => splitSquareRefs(text).filter((p) => p.square).map((p) => [p.text, p.square])

describe('splitSquareRefs', () => {
  it('acha casas soltas e lances de peça, ligando cada um à casa de destino', () => {
    expect(refs('As pretas respondem com Cf6.')).toEqual([['Cf6', 'f6']])
    expect(refs('O bispo em c4 aponta para f7, a casa mais frágil.')).toEqual([
      ['c4', 'c4'],
      ['f7', 'f7'],
    ])
  })

  it('entende capturas, capturas de peão, promoção e xeque', () => {
    expect(refs('Bxc4 e exd5')).toEqual([
      ['Bxc4', 'c4'],
      ['exd5', 'd5'],
    ])
    expect(refs('d8=D+ vence')).toEqual([['d8=D+', 'd8']])
  })

  it('funciona na lista de lances numerada', () => {
    expect(refs('1. e4 e5 2. Cf3 Cc6')).toEqual([
      ['e4', 'e4'],
      ['e5', 'e5'],
      ['Cf3', 'f3'],
      ['Cc6', 'c6'],
    ])
  })

  it('não pega pedaços de palavras nem números soltos', () => {
    expect(refs('de4 a10 b9 coisa e casa h')).toEqual([])
  })

  it('juntando os pedaços, o texto volta igual', () => {
    const text = 'Depois de 3.Bc4, o peão de e5 fica protegido.'
    expect(splitSquareRefs(text).map((p) => p.text).join('')).toBe(text)
  })
})
