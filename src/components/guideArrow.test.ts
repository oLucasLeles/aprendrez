import { describe, expect, it } from 'vitest'
import { getArrowShape, squareCenter } from './guideArrow'

const close = (a: number, b: number) => expect(a).toBeCloseTo(b, 5)

describe('squareCenter', () => {
  it('com as brancas embaixo, a1 fica no canto de baixo à esquerda', () => {
    expect(squareCenter('a1', 'white')).toEqual({ x: 0.5, y: 7.5 })
    expect(squareCenter('h8', 'white')).toEqual({ x: 7.5, y: 0.5 })
  })

  it('com as pretas embaixo, o tabuleiro gira', () => {
    expect(squareCenter('a1', 'black')).toEqual({ x: 7.5, y: 0.5 })
    expect(squareCenter('h8', 'black')).toEqual({ x: 0.5, y: 7.5 })
  })
})

describe('getArrowShape', () => {
  it('lance reto: a seta começa na borda da casa de origem, não em cima da peça', () => {
    const { shaft, head } = getArrowShape('e2', 'e4', 'white')
    const e2 = squareCenter('e2', 'white')
    // começa na borda de cima de e2 (meia casa acima do centro)
    close(shaft[0].x, e2.x)
    close(shaft[0].y, e2.y - 0.5)
    // a ponta termina perto do centro de e4
    const e4 = squareCenter('e4', 'white')
    close(head[0].x, e4.x)
    expect(Math.abs(head[0].y - e4.y)).toBeLessThan(0.2)
  })

  it('lance na diagonal: a seta começa no canto da casa de origem', () => {
    const { shaft } = getArrowShape('f1', 'c4', 'white')
    const f1 = squareCenter('f1', 'white')
    close(Math.abs(shaft[0].x - f1.x), 0.5)
    close(Math.abs(shaft[0].y - f1.y), 0.5)
  })

  it('lance de cavalo: a seta faz um "L", com o trecho de 2 casas primeiro', () => {
    const { shaft, head } = getArrowShape('g1', 'f3', 'white')
    expect(shaft).toHaveLength(3)
    const g1 = squareCenter('g1', 'white')
    const f3 = squareCenter('f3', 'white')
    // sobe por g (2 casas) e depois vira para f
    close(shaft[0].x, g1.x)
    close(shaft[0].y, g1.y - 0.5)
    close(shaft[1].x, g1.x)
    close(shaft[1].y, f3.y)
    expect(head[0].x).toBeLessThan(f3.x)
  })

  it('com as pretas embaixo, a seta acompanha o tabuleiro girado', () => {
    const { shaft } = getArrowShape('e7', 'e5', 'black')
    const e7 = squareCenter('e7', 'black')
    close(shaft[0].y, e7.y - 0.5)
  })
})
